package org.egov.filestore.repository.impl.minio;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

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
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
	@Autowired
	private RedisTemplate<String, String> redisTemplate;

	
	@Override
	public void saveFiles(List<org.egov.filestore.domain.model.Artifact> artifacts) {

		List<org.egov.filestore.persistence.entity.Artifact> persistList = new ArrayList<>();
		artifacts.forEach(artifact -> {
			FileLocation fileLocation = artifact.getFileLocation();
			String completeName = fileLocation.getFileName();
			int index = completeName.indexOf('/');
			String fileNameWithPath = completeName.substring(index + 1, completeName.length());
			push(artifact.getMultipartFile(), fileNameWithPath);

			if (artifact.getThumbnailImages() != null && !artifact.getThumbnailImages().isEmpty())
				pushThumbnailImages(artifact);

			fileLocation.setFileSource(minioConfig.getSource());
			persistList.add(mapToEntity(artifact));

		});
	}

	

	private void push(MultipartFile multipartFile, String fileNameWithPath) {
		try {
			InputStream is = multipartFile.getInputStream();
			long contentLength = multipartFile.getSize();
			PutObjectOptions putObjectOptions = new PutObjectOptions(contentLength, PutObjectOptions.MAX_PART_SIZE);
			putObjectOptions.setContentType(multipartFile.getContentType());
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

	            // ✅ MinIO v7: Get file as InputStream
	            InputStream inputStream = minioClient.getObject(minioConfig.getBucketName(), fileName);

	            // ✅ Java 8-compatible way to read all bytes
	            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
	            int nRead;
	            byte[] data = new byte[8192];
	            while ((nRead = inputStream.read(data, 0, data.length)) != -1) {
	                buffer.write(data, 0, nRead);
	            }
	            inputStream.close();
	            byte[] fileBytes = buffer.toByteArray();

	            // ✅ Use FileStoreConfig to get MIME type
	            String fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

	            if (!fileStoreConfig.getAllowedKeySet().contains(fileExtension)) {
	                log.warn("Unsupported file format: {}", fileExtension);
	                continue;
	            }

	            String mimeType = fileStoreConfig.getAllowedFormatsMap()
	                    .get(fileExtension)
	                    .get(0);

	            // ✅ Encode and store in Redis with TTL
	            String base64 = Base64.getEncoder().encodeToString(fileBytes);
	            String shortCode = UUID.randomUUID().toString().substring(0, 8);
	            String json = String.format("{\"content\":\"%s\",\"type\":\"%s\"}", base64, mimeType);
	            redisTemplate.opsForValue().set("file:view:" + shortCode, json, 5, TimeUnit.MINUTES);

	            // ✅ Return your app’s short URL
	            String shortUrl =fileStoreConfig.getShowHostUrl()+fileStoreConfig.getShowContentUrl()+shortCode;
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
	    try {
	        String signedUrl = minioClient.getPresignedObjectUrl(
	            io.minio.http.Method.GET,
	            minioConfig.getBucketName(),
	            fileName,
	            fileStoreConfig.getPreSignedUrlTimeOut(),  // in seconds
	            new HashMap<>() // no custom query params
	        );

	        // 🔁 Replace internal MinIO IP with local domain (only for local dev)
	        return signedUrl.replace("http://10.44.237.28:9000", "https://sdc-uat.lgpunjab.gov.in");

	    } catch (InvalidKeyException | ErrorResponseException | IllegalArgumentException |
	             InsufficientDataException | InternalException | InvalidBucketNameException |
	             InvalidExpiresRangeException | InvalidResponseException | NoSuchAlgorithmException |
	             XmlParserException | IOException e) {

	        log.error("Error generating signed URL for file: {}", fileName, e);
	        throw new RuntimeException("Failed to generate signed URL", e);
	    }
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

}
