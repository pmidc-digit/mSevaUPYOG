package org.egov.infra.filestore.service.impl;

import static java.io.File.separator;
import static org.egov.infra.config.core.ApplicationThreadLocals.getCityCode;
import static org.egov.infra.utils.StringUtils.normalizeString;
import static org.slf4j.LoggerFactory.getLogger;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.apache.commons.lang3.StringUtils;
import org.egov.infra.config.core.ApplicationThreadLocals;
import org.egov.infra.filestore.entity.FileStoreMapper;
import org.egov.infra.filestore.service.FileStoreService;
import org.egov.infra.microservice.contract.StorageResponse;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RequestCallback;
import org.springframework.web.client.ResponseExtractor;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component("egovMicroServiceStore")
public class EgovMicroServiceStore implements FileStoreService {

	private static final String FILESTORE_V1_FILES = "filestore/v1/files";

	private static final Logger LOG = getLogger(EgovMicroServiceStore.class);

	/*
	 * ---------------------------------------------------------------------
	 * FILESTORE HTTP CONFIGURATION
	 * ---------------------------------------------------------------------
	 */

	/**
	 * Maximum time allowed to establish connection with FileStore.
	 */
	private static final int CONNECT_TIMEOUT_MS = 30 * 1000; // 30 seconds

	/**
	 * Maximum time application will wait for FileStore response.
	 *
	 * 5 minutes = 300 seconds = 300000 milliseconds.
	 */
	private static final int READ_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

	/**
	 * Maximum number of upload attempts.
	 */
	private static final int MAX_RETRIES = 3;

	/**
	 * Initial retry backoff.
	 *
	 * Attempt 1 failed -> wait 1 second Attempt 2 failed -> wait 2 seconds
	 */
	private static final long BACKOFF_MS = 1000L;

	private String url;

	private RestTemplate restTemplate;

	/**
	 * Create RestTemplate with explicit timeout configuration.
	 *
	 * IMPORTANT: setBufferRequestBody(false) prevents the complete multipart
	 * request from being buffered in memory before being sent.
	 *
	 * This is useful for larger DXF/PDF/etc. files.
	 */
	@Autowired
	public EgovMicroServiceStore(@Value("${ms.url}") String url) {

	    SimpleClientHttpRequestFactory requestFactory =
	            new SimpleClientHttpRequestFactory();

	    // Connection + SSL/TLS handshake allowance
	    requestFactory.setConnectTimeout(CONNECT_TIMEOUT_MS); // 60 sec

	    // FileStore response waiting time
	    requestFactory.setReadTimeout(READ_TIMEOUT_MS); // 10 min

	    // Large file upload ke liye
	    requestFactory.setBufferRequestBody(false);

	    this.restTemplate = new RestTemplate(requestFactory);

	    this.url = url + FILESTORE_V1_FILES;

	    LOG.info(
	            "FileStore RestTemplate configured. " +
	            "Connect/Handshake Timeout={} sec, " +
	            "Read/Response Timeout={} sec, " +
	            "BufferRequestBody=false",
	            CONNECT_TIMEOUT_MS / 1000,
	            READ_TIMEOUT_MS / 1000
	    );
	}

	// ---------------------------------------------------------------------
	// FILE STORE METHODS
	// ---------------------------------------------------------------------

	@Override
	public FileStoreMapper store(File sourceFile, String fileName, String mimeType, String moduleName) {

		return store(sourceFile, fileName, mimeType, moduleName, true);
	}

	@Override
	public FileStoreMapper store(File sourceFile, String fileName, String mimeType, String moduleName,
			String tenantId) {

		return store(sourceFile, fileName, mimeType, moduleName, true, tenantId);
	}

	@Override
	public FileStoreMapper store(InputStream sourceFileStream, String fileName, String mimeType, String moduleName) {

		return store(sourceFileStream, fileName, mimeType, moduleName, true);
	}

	@Override
	public FileStoreMapper store(InputStream fileStream, String fileName, String mimeType, String moduleName,
			String tenantId) {

		return store(fileStream, fileName, mimeType, moduleName, tenantId, true);
	}

	/**
	 * Store file using explicitly supplied tenantId.
	 */
	public FileStoreMapper store(File file, String fileName, String mimeType, String moduleName, boolean deleteFile,
			String tenantId) {

		String effectiveTenantId = StringUtils.isEmpty(tenantId) ? ApplicationThreadLocals.getFullTenantID() : tenantId;

		return uploadFileWithRetry(file, fileName, mimeType, moduleName, deleteFile, effectiveTenantId);
	}

	/**
	 * Store file using current ApplicationThreadLocal tenantId.
	 */
	@Override
	public FileStoreMapper store(File file, String fileName, String mimeType, String moduleName, boolean deleteFile) {

		return uploadFileWithRetry(file, fileName, mimeType, moduleName, deleteFile,
				ApplicationThreadLocals.getFullTenantID());
	}

	/**
	 * Common FileStore upload implementation.
	 *
	 * Handles: - Multipart upload - Retry - Exponential backoff - HTTP error
	 * logging - Upload duration logging - Temporary file deletion
	 */
	private FileStoreMapper uploadFileWithRetry(File file, String fileName, String mimeType, String moduleName,
			boolean deleteFile, String tenantId) {

		fileName = normalizeString(fileName);
		mimeType = normalizeString(mimeType);
		moduleName = normalizeString(moduleName);

		/*
		 * Basic validation.
		 */
		if (file == null) {
			LOG.error("FileStore upload failed: File is NULL");
			return null;
		}

		if (!file.exists()) {
			LOG.error("FileStore upload failed: File does not exist. Path='{}'", file.getAbsolutePath());
			return null;
		}

		if (!file.isFile()) {
			LOG.error("FileStore upload failed: Path is not a file. Path='{}'", file.getAbsolutePath());
			return null;
		}

		final long fileSizeBytes = file.length();
		final double fileSizeMb = fileSizeBytes / (1024.0 * 1024.0);

		LOG.info("======================================================");
		LOG.info("FILESTORE UPLOAD REQUEST");
		LOG.info("======================================================");
		LOG.info("File Path       : {}", file.getAbsolutePath());
		LOG.info("File Name       : {}", fileName);
		LOG.info("File Size       : {} bytes", fileSizeBytes);
		LOG.info("File Size MB    : {}", String.format("%.2f", fileSizeMb));
		LOG.info("Mime Type       : {}", mimeType);
		LOG.info("Module          : {}", moduleName);
		LOG.info("TenantId        : {}", tenantId);
		LOG.info("FileStore URL   : {}", url);
		LOG.info("Connect Timeout : {} sec", CONNECT_TIMEOUT_MS / 1000);
		LOG.info("Read Timeout    : {} sec", READ_TIMEOUT_MS / 1000);
		LOG.info("Maximum Retries : {}", MAX_RETRIES);
		LOG.info("======================================================");

		/*
		 * Start retry loop.
		 */
		for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {

			long attemptStartTime = System.currentTimeMillis();

			try {

				LOG.info("FileStore upload attempt {}/{} started. " + "File='{}', Size={} MB", attempt, MAX_RETRIES,
						fileName, String.format("%.2f", fileSizeMb));

				/*
				 * Multipart request headers.
				 */
				HttpHeaders headers = new HttpHeaders();
				headers.setContentType(MediaType.MULTIPART_FORM_DATA);

				/*
				 * Multipart request body.
				 */
				MultiValueMap<String, Object> map = new LinkedMultiValueMap<String, Object>();

				/*
				 * FileSystemResource streams the actual file.
				 */
				map.add("file", new FileSystemResource(file));

				map.add("tenantId", tenantId);

				map.add("module", moduleName);

				HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<MultiValueMap<String, Object>>(map,
						headers);

				LOG.info("Sending file to FileStore. Attempt={}/{}, File='{}', Size={} MB", attempt, MAX_RETRIES,
						fileName, String.format("%.2f", fileSizeMb));

				/*
				 * --------------------------------------------------------- ACTUAL FILESTORE
				 * HTTP CALL ---------------------------------------------------------
				 *
				 * READ_TIMEOUT_MS controls how long this request can wait for the server
				 * response.
				 */
				ResponseEntity<StorageResponse> result = restTemplate.postForEntity(url, request,
						StorageResponse.class);

				long elapsedTime = System.currentTimeMillis() - attemptStartTime;

				LOG.info("FileStore HTTP response received. " + "Attempt={}/{}, Time={} ms ({} sec), HTTP Status={}",
						attempt, MAX_RETRIES, elapsedTime, String.format("%.2f", elapsedTime / 1000.0),
						result.getStatusCode());

				/*
				 * Validate FileStore response.
				 */
				if (result.getBody() == null) {

					throw new IllegalStateException("FileStore returned empty response body for file: " + fileName);
				}

				if (result.getBody().getFiles() == null) {

					throw new IllegalStateException("FileStore returned files=NULL for file: " + fileName);
				}

				if (result.getBody().getFiles().isEmpty()) {

					throw new IllegalStateException("FileStore returned empty file list for file: " + fileName);
				}

				if (result.getBody().getFiles().get(0).getFileStoreId() == null) {

					throw new IllegalStateException("FileStoreId is NULL for file: " + fileName);
				}

				String fileStoreId = result.getBody().getFiles().get(0).getFileStoreId();

				/*
				 * Create FileStoreMapper.
				 */
				FileStoreMapper fileMapper = new FileStoreMapper(fileStoreId, fileName);

				/*
				 * Use same tenantId which was sent to FileStore.
				 */
				fileMapper.setTenantId(tenantId);

				fileMapper.setContentType(mimeType);

				LOG.info("======================================================");
				LOG.info("FILESTORE UPLOAD SUCCESS");
				LOG.info("======================================================");
				LOG.info("File Name     : {}", fileName);
				LOG.info("File Size     : {} MB", String.format("%.2f", fileSizeMb));
				LOG.info("FileStoreId   : {}", fileStoreId);
				LOG.info("TenantId      : {}", tenantId);
				LOG.info("Upload Time    : {} ms ({} sec)", elapsedTime, String.format("%.2f", elapsedTime / 1000.0));
				LOG.info("Attempt       : {}/{}", attempt, MAX_RETRIES);
				LOG.info("======================================================");

				/*
				 * Delete temporary local file only after successful upload.
				 */
				if (deleteFile && file.exists()) {

					try {

						boolean deleted = file.delete();

						if (deleted) {

							LOG.info("Temporary local file deleted after " + "successful FileStore upload. File='{}'",
									file.getAbsolutePath());

						} else {

							LOG.warn("Temporary local file could not be deleted. " + "File='{}'",
									file.getAbsolutePath());
						}

					} catch (Exception deleteException) {

						LOG.warn("Exception while deleting temporary local file '{}'. Error={}", file.getAbsolutePath(),
								deleteException.getMessage(), deleteException);
					}
				}

				/*
				 * Upload successful.
				 */
				return fileMapper;

			} catch (HttpStatusCodeException httpException) {

				long elapsedTime = System.currentTimeMillis() - attemptStartTime;

				LOG.error("======================================================");
				LOG.error("FILESTORE HTTP ERROR");
				LOG.error("======================================================");
				LOG.error("Attempt       : {}/{}", attempt, MAX_RETRIES);
				LOG.error("File Name     : {}", fileName);
				LOG.error("File Size     : {} MB", String.format("%.2f", fileSizeMb));
				LOG.error("FileStore URL : {}", url);
				LOG.error("TenantId      : {}", tenantId);

				LOG.error("Failed After   : {} ms ({} sec)", elapsedTime, String.format("%.2f", elapsedTime / 1000.0));

				LOG.error("HTTP Status    : {}", httpException.getStatusCode());

				LOG.error("Status Text    : {}", httpException.getStatusText());

				LOG.error("Response Body  : {}", httpException.getResponseBodyAsString());

				LOG.error("Exception Type : {}", httpException.getClass().getName());

				LOG.error("Error Message  : {}", httpException.getMessage());

				LOG.error("Complete StackTrace:", httpException);

				LOG.error("======================================================");

			} catch (RestClientException restException) {

				long elapsedTime = System.currentTimeMillis() - attemptStartTime;

				LOG.error("======================================================");
				LOG.error("FILESTORE NETWORK/CLIENT ERROR");
				LOG.error("======================================================");
				LOG.error("Attempt       : {}/{}", attempt, MAX_RETRIES);
				LOG.error("File Name     : {}", fileName);
				LOG.error("File Size     : {} MB", String.format("%.2f", fileSizeMb));
				LOG.error("FileStore URL : {}", url);
				LOG.error("TenantId      : {}", tenantId);

				LOG.error("Failed After   : {} ms ({} sec)", elapsedTime, String.format("%.2f", elapsedTime / 1000.0));

				LOG.error("Exception Type : {}", restException.getClass().getName());

				LOG.error("Error Message  : {}", restException.getMessage());

				LOG.error("Complete StackTrace:", restException);

				LOG.error("======================================================");

			} catch (Exception exception) {

				long elapsedTime = System.currentTimeMillis() - attemptStartTime;

				LOG.error("======================================================");
				LOG.error("FILESTORE UNEXPECTED ERROR");
				LOG.error("======================================================");
				LOG.error("Attempt       : {}/{}", attempt, MAX_RETRIES);
				LOG.error("File Name     : {}", fileName);
				LOG.error("File Size     : {} MB", String.format("%.2f", fileSizeMb));

				LOG.error("Failed After   : {} ms ({} sec)", elapsedTime, String.format("%.2f", elapsedTime / 1000.0));

				LOG.error("Exception Type : {}", exception.getClass().getName());

				LOG.error("Error Message  : {}", exception.getMessage());

				LOG.error("Complete StackTrace:", exception);

				LOG.error("======================================================");
			}

			/*
			 * ------------------------------------------------------------- RETRY BACKOFF
			 * -------------------------------------------------------------
			 *
			 * Do not sleep after final attempt.
			 */
			if (attempt < MAX_RETRIES) {

				long sleepTime = BACKOFF_MS * (1L << (attempt - 1));

				LOG.warn("FileStore upload failed. " + "Waiting {} ms before retry {}/{} for file '{}'.", sleepTime,
						attempt + 1, MAX_RETRIES, fileName);

				try {

					Thread.sleep(sleepTime);

				} catch (InterruptedException interruptedException) {

					Thread.currentThread().interrupt();

					LOG.error("FileStore retry interrupted for file '{}'", fileName, interruptedException);

					break;
				}
			}
		}

		LOG.error("======================================================");
		LOG.error("FILESTORE UPLOAD PERMANENTLY FAILED");
		LOG.error("======================================================");
		LOG.error("File Name     : {}", fileName);
		LOG.error("File Path     : {}", file.getAbsolutePath());
		LOG.error("File Size     : {} MB", String.format("%.2f", fileSizeMb));
		LOG.error("TenantId      : {}", tenantId);
		LOG.error("Attempts      : {}", MAX_RETRIES);
		LOG.error("FileStore URL : {}", url);
		LOG.error("======================================================");

		return null;
	}

	// ---------------------------------------------------------------------
	// INPUT STREAM STORE
	// ---------------------------------------------------------------------

	@Override
	public FileStoreMapper store(InputStream fileStream, String fileName, String mimeType, String moduleName,
			boolean closeStream) {

		File tempFile = null;

		try {

			fileName = normalizeString(fileName);
			mimeType = normalizeString(mimeType);
			moduleName = normalizeString(moduleName);

			/*
			 * Convert InputStream to temporary file.
			 */
			tempFile = new File(fileName);

			FileUtils.copyToFile(fileStream, tempFile);

			/*
			 * Close original InputStream if requested.
			 */
			if (closeStream && fileStream != null) {

				try {

					fileStream.close();

				} catch (IOException closeException) {

					LOG.warn("Error while closing InputStream for file '{}'", fileName, closeException);
				}
			}

			LOG.info("InputStream converted to file. " + "File='{}', Size={} bytes ({} MB)", tempFile.getAbsolutePath(),
					tempFile.length(), String.format("%.2f", tempFile.length() / (1024.0 * 1024.0)));

			/*
			 * Use common upload implementation.
			 *
			 * deleteFile=true because this file was created temporarily for FileStore
			 * upload.
			 */
			return uploadFileWithRetry(tempFile, fileName, mimeType, moduleName, true,
					ApplicationThreadLocals.getFullTenantID());

		} catch (Exception exception) {

			LOG.error("=========== FILESTORE INPUTSTREAM ERROR START ===========");
			LOG.error("URL              : {}", url);
			LOG.error("TenantId         : {}", ApplicationThreadLocals.getFullTenantID());
			LOG.error("Module           : {}", moduleName);
			LOG.error("File Name        : {}", fileName);
			LOG.error("Mime Type        : {}", mimeType);
			LOG.error("closeStream      : {}", closeStream);
			LOG.error("Exception Type   : {}", exception.getClass().getName());
			LOG.error("Error Message    : {}", exception.getMessage());
			LOG.error("Complete StackTrace:", exception);
			LOG.error("=========== FILESTORE INPUTSTREAM ERROR END =============");

			return null;
		}
	}

	@Override
	public FileStoreMapper store(InputStream fileStream, String fileName, String mimeType, String moduleName,
			String tenantId, boolean closeStream) {

		File tempFile = null;

		try {

			fileName = normalizeString(fileName);
			mimeType = normalizeString(mimeType);
			moduleName = normalizeString(moduleName);

			String effectiveTenantId = StringUtils.isEmpty(tenantId) ? ApplicationThreadLocals.getFullTenantID()
					: tenantId;

			/*
			 * Convert InputStream to temporary file.
			 */
			tempFile = new File(fileName);

			FileUtils.copyToFile(fileStream, tempFile);

			/*
			 * Close original stream when requested.
			 */
			if (closeStream && fileStream != null) {

				try {

					fileStream.close();

				} catch (IOException closeException) {

					LOG.warn("Error while closing InputStream for file '{}'", fileName, closeException);
				}
			}

			LOG.info(
					"InputStream converted to file for FileStore upload. "
							+ "File='{}', Size={} bytes ({} MB), TenantId='{}'",
					tempFile.getAbsolutePath(), tempFile.length(),
					String.format("%.2f", tempFile.length() / (1024.0 * 1024.0)), effectiveTenantId);

			return uploadFileWithRetry(tempFile, fileName, mimeType, moduleName, true, effectiveTenantId);

		} catch (Exception exception) {

			LOG.error("=========== FILESTORE INPUTSTREAM ERROR START ===========");
			LOG.error("URL              : {}", url);
			LOG.error("TenantId         : {}", tenantId);
			LOG.error("Module           : {}", moduleName);
			LOG.error("File Name        : {}", fileName);
			LOG.error("Mime Type        : {}", mimeType);
			LOG.error("closeStream      : {}", closeStream);
			LOG.error("Exception Type   : {}", exception.getClass().getName());
			LOG.error("Error Message    : {}", exception.getMessage());
			LOG.error("Complete StackTrace:", exception);
			LOG.error("=========== FILESTORE INPUTSTREAM ERROR END =============");

			return null;
		}
	}

	// ---------------------------------------------------------------------
	// FETCH
	// ---------------------------------------------------------------------

	@Override
	public File fetch(FileStoreMapper fileMapper, String moduleName) {

		return this.fetch(fileMapper.getFileStoreId(), moduleName);
	}

	@Override
	public Set<File> fetchAll(Set<FileStoreMapper> fileMappers, String moduleName) {

		return fileMappers.stream().map(fileMapper -> this.fetch(fileMapper.getFileStoreId(), moduleName))
				.collect(Collectors.toSet());
	}

	@Override
	public File fetch(String fileStoreId, String moduleName) {

		fileStoreId = normalizeString(fileStoreId);
		moduleName = normalizeString(moduleName);

		String urls = url + "/id?tenantId=" + ApplicationThreadLocals.getFullTenantID() + "&fileStoreId=" + fileStoreId;

		if (LOG.isDebugEnabled()) {

			LOG.debug("Fetching file from URL '{}'", urls);
		}

		LOG.info("Fetching file from FileStore. URL='{}'", urls);

		Path path = Paths.get("/tmp/" + RandomUtils.nextLong());

		long startTime = System.currentTimeMillis();

		try {

			RequestCallback requestCallback = request -> request.getHeaders()
					.setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM, MediaType.ALL));

			ResponseExtractor<Void> responseExtractor = response -> {

				Files.copy(response.getBody(), path);

				return null;
			};

			restTemplate.execute(URI.create(urls), HttpMethod.GET, requestCallback, responseExtractor);

			long elapsed = System.currentTimeMillis() - startTime;

			LOG.info("FileStore fetch completed. " + "FileStoreId='{}', Time={} ms ({} sec), Path='{}'", fileStoreId,
					elapsed, String.format("%.2f", elapsed / 1000.0), path);

		} catch (RestClientException exception) {

			long elapsed = System.currentTimeMillis() - startTime;

			LOG.error("Error while fetching FileStore file. " + "FileStoreId='{}', FailedAfter={} ms, Error={}",
					fileStoreId, elapsed, exception.getMessage(), exception);
		}

		return path.toFile();
	}

	@Override
	public Path fetchAsPath(String fileStoreId, String moduleName) {

		return Paths.get(fetch(fileStoreId, moduleName).getPath());
	}

	// ---------------------------------------------------------------------
	// DELETE
	// ---------------------------------------------------------------------

	@Override
	public void delete(String fileStoreId, String moduleName) {

		Path fileDirPath = this.getFileDirectoryPath(moduleName);

		if (!fileDirPath.toFile().exists()) {

			Path filePath = this.getFilePath(fileDirPath, fileStoreId);

			try {

				Files.deleteIfExists(filePath);

			} catch (IOException exception) {

				LOG.error("Could not remove document '{}'", filePath.getFileName(), exception);
			}
		}
	}

	// ---------------------------------------------------------------------
	// FILE PATH HELPERS
	// ---------------------------------------------------------------------

	private Path getFileDirectoryPath(String moduleName) {

		return Paths.get(new StringBuilder().append(this.url).append(separator).append(getCityCode()).append(separator)
				.append(moduleName).toString());
	}

	private Path getFilePath(Path fileDirPath, String fileStoreId) {

		return Paths.get(fileDirPath + separator + fileStoreId);
	}

	// ---------------------------------------------------------------------
	// FETCH WITH EXPLICIT TENANT
	// ---------------------------------------------------------------------

	@Override
	public File fetch(String fileStoreId, String moduleName, String tenantId) {

		fileStoreId = normalizeString(fileStoreId);
		moduleName = normalizeString(moduleName);

		String tenant = StringUtils.isEmpty(tenantId) ? ApplicationThreadLocals.getFullTenantID() : tenantId;

		String urls = url + "/id?tenantId=" + tenant + "&fileStoreId=" + fileStoreId;

		LOG.info("Fetching file from FileStore. " + "FileStoreId='{}', TenantId='{}', URL='{}'", fileStoreId, tenant,
				urls);

		Path path = Paths.get("/tmp/" + RandomUtils.nextLong());

		long startTime = System.currentTimeMillis();

		try {

			RequestCallback requestCallback = request -> request.getHeaders()
					.setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM, MediaType.ALL));

			ResponseExtractor<Void> responseExtractor = response -> {

				Files.copy(response.getBody(), path);

				return null;
			};

			restTemplate.execute(URI.create(urls), HttpMethod.GET, requestCallback, responseExtractor);

			long elapsed = System.currentTimeMillis() - startTime;

			LOG.info(
					"FileStore fetch completed. " + "FileStoreId='{}', TenantId='{}', "
							+ "Time={} ms ({} sec), Path='{}'",
					fileStoreId, tenant, elapsed, String.format("%.2f", elapsed / 1000.0), path);

		} catch (RestClientException exception) {

			long elapsed = System.currentTimeMillis() - startTime;

			LOG.error(
					"Error while fetching FileStore file. " + "FileStoreId='{}', TenantId='{}', "
							+ "FailedAfter={} ms, Error={}",
					fileStoreId, tenant, elapsed, exception.getMessage(), exception);
		}

		return path.toFile();
	}
}