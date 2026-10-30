package org.egov.filestore.repository.impl.minio;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.file.Paths;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;

import org.apache.commons.io.FilenameUtils;
import org.egov.filestore.config.FileStoreConfig;
import org.egov.filestore.domain.model.FileLocation;
import org.egov.filestore.persistence.entity.Artifact;
import org.egov.filestore.repository.CloudFilesManager;
import org.egov.filestore.repository.impl.CloudFileMgrUtils;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.util.IOUtils;

import io.minio.MinioClient;
import io.minio.PutObjectOptions;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.InsufficientDataException;
import io.minio.errors.InternalException;
import io.minio.errors.InvalidBucketNameException;
import io.minio.errors.InvalidExpiresRangeException;
import io.minio.errors.InvalidResponseException;
import io.minio.errors.MinioException;
import io.minio.errors.XmlParserException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@ConditionalOnProperty(value = "isS3Enabled", havingValue = "true")
public class MinioRepository implements CloudFilesManager {

	private static final String ERROR_IN_CONFIGURATION = "Error in Configuration";

	@Autowired
	private MinioClient minioClient;
	
	@Autowired
	private MinioConfig minioConfig;

	@Autowired
	private CloudFileMgrUtils util;
	
	@Autowired
	private FileStoreConfig fileStoreConfig;

	@Override
	public void saveFiles(List<org.egov.filestore.domain.model.Artifact> artifacts) {

		List<org.egov.filestore.persistence.entity.Artifact> persistList = new ArrayList<>();
		artifacts.forEach(artifact -> {
			FileLocation fileLocation = artifact.getFileLocation();
			String completeName = fileLocation.getFileName();
			int index = completeName.indexOf('/');
			String fileNameWithPath = completeName.substring(index + 1, completeName.length());
			push(artifact.getMultipartFile(), fileNameWithPath, artifact.getExpiryDate(), fileLocation.getModule(), fileLocation.getTag());

			if (artifact.getThumbnailImages() != null && !artifact.getThumbnailImages().isEmpty())
				pushThumbnailImages(artifact);

			fileLocation.setFileSource(minioConfig.getSource());
			persistList.add(mapToEntity(artifact));

		});
	}

	

	private void push(MultipartFile multipartFile, String fileNameWithPath, Long expiryDate, String module, String tag) {
		try {
			InputStream is = multipartFile.getInputStream();
			long contentLength = multipartFile.getSize();
			PutObjectOptions putObjectOptions = new PutObjectOptions(contentLength, PutObjectOptions.MAX_PART_SIZE);
			putObjectOptions.setContentType(multipartFile.getContentType());

			// Only attach custom expiry/bill metadata if the auto-delete switch is enabled AND the document is a bill (single or batch)
			if (Boolean.TRUE.equals(fileStoreConfig.getIsBillAutoDeleteEnabled())) {
				boolean isBatchBill = module != null && 
						(module.equalsIgnoreCase("bulk-bill") || module.equalsIgnoreCase("batch-bill") || 
						(module.toLowerCase().contains("bill") && (module.toLowerCase().contains("bulk") || module.toLowerCase().contains("batch"))));

				boolean isSingleBill = module != null && !isBatchBill && 
						(module.toLowerCase().contains("bill") || module.equalsIgnoreCase("billing-service"));

				if (isBatchBill || isSingleBill) {
					Map<String, String> headers = new HashMap<>();
					if (tag != null && !tag.isEmpty() && !tag.equals("00040-2017-QR")) {
						headers.put("X-Amz-Meta-Consumercode", tag);
					}
					if (isBatchBill) {
						headers.put("X-Amz-Meta-Doctype", "batch-bill");
					} else {
						headers.put("X-Amz-Meta-Doctype", "bill");
					}
					putObjectOptions.setHeaders(headers);
				}
			}

			minioClient.putObject(minioConfig.getBucketName(), fileNameWithPath, is, putObjectOptions);
			log.debug("Upload Successful");

		} catch (MinioException | InvalidKeyException | IllegalArgumentException | NoSuchAlgorithmException
				| IOException e) {
			log.error("Error occurred: ", e);
			throw new RuntimeException(ERROR_IN_CONFIGURATION);
		}

	}

	private void push(InputStream is, long contentLength, String contentType, String fileNameWithPath) {
		try {
			PutObjectOptions putObjectOptions = new PutObjectOptions(contentLength, PutObjectOptions.MAX_PART_SIZE);
			putObjectOptions.setContentType(contentType);
			minioClient.putObject(minioConfig.getBucketName(), fileNameWithPath, is, putObjectOptions);

		} catch (MinioException | InvalidKeyException | IllegalArgumentException | NoSuchAlgorithmException
				| IOException e) {
			log.error("Error occurred: " + e);
			throw new RuntimeException(ERROR_IN_CONFIGURATION);
		}

	}

	private void pushThumbnailImages(org.egov.filestore.domain.model.Artifact artifact) {

		try {

			for (Map.Entry<String, BufferedImage> entry : artifact.getThumbnailImages().entrySet()) {
				ByteArrayOutputStream os = new ByteArrayOutputStream();
				ImageIO.write(entry.getValue(),
						FilenameUtils.getExtension(artifact.getMultipartFile().getOriginalFilename()), os);
				byte[] byteArray = os.toByteArray();
				ByteArrayInputStream is = new ByteArrayInputStream(byteArray);
				push(is, byteArray.length, artifact.getMultipartFile().getContentType(), entry.getKey());
				os.flush();
			}

		} catch (Exception ioe) {

			Map<String, String> map = new HashMap<>();
			log.error("Exception while uploading the image: ", ioe);
			map.put("ERROR_MINIO_UPLOAD", "An error has occured while trying to upload image to filestore system .");
			throw new CustomException(map);
		}
	}

	@Override
	public Map<String, String> getFiles(List<Artifact> artifacts) {

	    Map<String, String> mapOfIdAndShortUrls = new HashMap<>();

	    for (Artifact artifact : artifacts) {
	        try {
	            String fileLocation = artifact.getFileLocation().getFileName();
	            String fileName = fileLocation.substring(fileLocation.indexOf('/') + 1);


	            InputStream inputStream = minioClient.getObject(minioConfig.getBucketName(), fileName);
	            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
	            IOUtils.copy(inputStream, buffer); 
	            inputStream.close();



	            String fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

	            if (!fileStoreConfig.getAllowedKeySet().contains(fileExtension) && !"zip".equalsIgnoreCase(fileExtension)) {
	                log.warn("Unsupported file format: {}", fileExtension);
	                continue;
	            }

	           
	            String encodedPath = URLEncoder.encode(fileName, "UTF-8");
	            String shortUrl = fileStoreConfig.getViewImagehost()
	                    + fileStoreConfig.getViewImagesubhost()
	                    + "?name=" + encodedPath;
	            mapOfIdAndShortUrls.put(artifact.getFileStoreId(), shortUrl);

	        } catch (Exception e) {
	            log.error("Failed to fetch/cache file: {}", artifact.getFileStoreId(), e);
	        }
	    }

	    return mapOfIdAndShortUrls;
	}

		
	private String setThumnailSignedURL(String fileName, StringBuilder url) throws InvalidKeyException, ErrorResponseException, IllegalArgumentException, InsufficientDataException, InternalException, InvalidBucketNameException, InvalidExpiresRangeException, InvalidResponseException, NoSuchAlgorithmException, XmlParserException, IOException {
		String[] imageFormats = { fileStoreConfig.get_large(), fileStoreConfig.get_medium(), fileStoreConfig.get_small() };
		for (String  format : Arrays.asList(imageFormats)) {
			url.append(",");
			String replaceString = fileName.substring(fileName.lastIndexOf('.'), fileName.length());
			String path = fileName.replaceAll(replaceString, format + replaceString);
			url.append(getSignedUrl(path));
		}
		return url.toString();
	}
	
	private String getSignedUrl(String fileName) {

		String signedUrl = null;
		try {
			signedUrl = minioClient.getPresignedObjectUrl(io.minio.http.Method.GET, minioConfig.getBucketName(), fileName,
					fileStoreConfig.getPreSignedUrlTimeOut(), new HashMap<String, String>());
		} catch (InvalidKeyException | ErrorResponseException | IllegalArgumentException | InsufficientDataException
				| InternalException | InvalidBucketNameException | InvalidExpiresRangeException
				| InvalidResponseException | NoSuchAlgorithmException | XmlParserException | IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return signedUrl;
	}

	public Resource read(FileLocation fileLocation) {

		Resource resource = null;
		File f = new File(fileLocation.getFileStoreId());

		if (fileLocation.getFileSource() == null || fileLocation.getFileSource().equals(minioConfig.getSource())) {
			String fileName = fileLocation.getFileName().substring(fileLocation.getFileName().indexOf('/') + 1,
					fileLocation.getFileName().length());

			try {
				minioClient.getObject(minioConfig.getBucketName(), fileName, f.getName());
			} catch (InvalidKeyException | ErrorResponseException | IllegalArgumentException | InsufficientDataException
					| InternalException | InvalidBucketNameException | InvalidResponseException
					| NoSuchAlgorithmException | XmlParserException | IOException e) {
				log.error("Error while downloading the file ", e);
				Map<String, String> map = new HashMap<>();
				map.put("ERROR_MINIO_DOWNLOAD",
						"An error has occured while trying to download image from filestore system .");
				throw new CustomException(map);

			}

			resource = new FileSystemResource(Paths.get(f.getPath()).toFile());

		}
		return resource;
	}

	private Artifact mapToEntity(org.egov.filestore.domain.model.Artifact artifact) {

		FileLocation fileLocation = artifact.getFileLocation();
		return Artifact.builder().fileStoreId(fileLocation.getFileStoreId()).fileName(fileLocation.getFileName())
				.contentType(artifact.getMultipartFile().getContentType()).module(fileLocation.getModule())
				.tag(fileLocation.getTag()).tenantId(fileLocation.getTenantId())
				.fileSource(fileLocation.getFileSource()).build();
	}

	@Override
	public void deleteFiles(List<org.egov.filestore.persistence.entity.Artifact> artifacts) {
		if (!Boolean.TRUE.equals(fileStoreConfig.getIsBillAutoDeleteEnabled())) {
			log.info("Bill auto-deletion switch is disabled (bill.auto.delete.enabled=false). Skipping deletion from MinIO for {} artifacts.",
					artifacts.size());
			return;
		}

		if (CollectionUtils.isEmpty(artifacts)) {
			log.warn("No artifacts provided for deletion from MinIO.");
			return;
		}

		for (org.egov.filestore.persistence.entity.Artifact artifact : artifacts) {
			if (!isBillModule(artifact.getModule())) {
				log.warn("Artifact {} belongs to non-bill module {}. Skipping MinIO deletion.", artifact.getFileStoreId(), artifact.getModule());
				continue;
			}
			try {
				String completeName = artifact.getFileName();
				if (completeName != null && completeName.contains("/")) {
					int index = completeName.indexOf('/');
					String bucketName = completeName.substring(0, index);
					if (bucketName == null || bucketName.trim().isEmpty()) {
						bucketName = minioConfig.getBucketName();
					}
					String fileNameWithPath = completeName.substring(index + 1);

					minioClient.removeObject(bucketName, fileNameWithPath);
					log.info("Successfully deleted object from MinIO: bucket={}, object={}", bucketName, fileNameWithPath);

					String ext = FilenameUtils.getExtension(fileNameWithPath);
					if (fileStoreConfig.getImageFormats() != null && fileStoreConfig.getImageFormats().contains(ext)) {
						deleteThumbnails(bucketName, fileNameWithPath);
					}
				}
			} catch (Exception e) {
				log.error("Failed to delete object from MinIO for fileStoreId: {}", artifact.getFileStoreId(), e);
			}
		}
	}

	private boolean isBillModule(String module) {
		if (module == null) {
			return false;
		}
		String lower = module.toLowerCase();
		return lower.contains("bill") || lower.equalsIgnoreCase("billing-service");
	}

	private void deleteThumbnails(String bucketName, String fileNameWithPath) {
		String[] imageFormats = { fileStoreConfig.get_large(), fileStoreConfig.get_medium(), fileStoreConfig.get_small() };
		for (String format : imageFormats) {
			try {
				int extIndex = fileNameWithPath.lastIndexOf('.');
				if (extIndex > -1) {
					String ext = fileNameWithPath.substring(extIndex);
					String thumbnailPath = fileNameWithPath.substring(0, extIndex) + format + ext;
					minioClient.removeObject(bucketName, thumbnailPath);
					log.debug("Deleted thumbnail from MinIO: {}", thumbnailPath);
				}
			} catch (Exception e) {
				log.debug("Thumbnail not found or could not be deleted: {}", e.getMessage());
			}
		}
	}

}
