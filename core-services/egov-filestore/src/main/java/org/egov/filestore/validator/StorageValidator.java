package org.egov.filestore.validator;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.tika.Tika;
import org.egov.filestore.config.FileStoreConfig;
import org.egov.filestore.domain.model.Artifact;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class StorageValidator {

	private FileStoreConfig fileStoreConfig;
	private ObjectMapper objectMapper;

	public StorageValidator(FileStoreConfig fileStoreConfig) {
		this(fileStoreConfig, new ObjectMapper());
	}

	@Autowired
	public StorageValidator(FileStoreConfig fileStoreConfig, ObjectMapper objectMapper) {
		super();
		this.fileStoreConfig = fileStoreConfig;
		this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
	}


	public void validate(Artifact artifact, String extension) {
			
		validateFileExtention(extension);
		validateContentType(artifact.getFileContentInString(), extension);
		validateInputContentType(artifact, extension);
	}
	
	private void validateFileExtention(String extension) {
		if(!fileStoreConfig.getAllowedFormatsMap().containsKey(extension)) {
			throw new CustomException("EG_FILESTORE_INVALID_INPUT","Inalvid input provided for file : " + extension + ", please upload any of the allowed formats : " + fileStoreConfig.getAllowedKeySet());
		}
	}
	
	private void validateContentType(String inputStreamAsString, String extension) {
		
		String inputFormat = null;
		Tika tika = new Tika();
		try {
			
			InputStream ipStreamForValidation = IOUtils.toInputStream(inputStreamAsString, fileStoreConfig.getImageCharsetType());
			inputFormat = tika.detect(ipStreamForValidation);
			ipStreamForValidation.close();
		} catch (IOException e) {
			throw new CustomException("EG_FILESTORE_PARSING_ERROR","not able to parse the input please upload a proper file of allowed type : " + e.getMessage());
		}
		
		if (!fileStoreConfig.getAllowedFormatsMap().get(extension).contains(inputFormat)) {
			throw new CustomException("EG_FILESTORE_INVALID_INPUT", "Inalvid input provided for file, the extension does not match the file format. Please upload any of the allowed formats : "
							+ fileStoreConfig.getAllowedKeySet());
		}
	}

	private void validateInputContentType(Artifact artifact, String extension){

		MultipartFile file =  artifact.getMultipartFile();
		String contentType = file.getContentType();

		if (!fileStoreConfig.getAllowedFormatsMap().get(extension).contains(contentType)) {
			throw new CustomException("EG_FILESTORE_INVALID_INPUT", "Invalid Content Type");
		}
	}

	
	/*private void validateFilesToUpload(List<MultipartFile> filesToStore, String module, String tag, String tenantId) {
		if (CollectionUtils.isEmpty(filesToStore)) {
			throw new EmptyFileUploadRequestException(module, tag, tenantId);
		}
	}*/
	public void validateDeleteRequest(Map<String, Object> requestBody, String requestInfoStr) {
		JsonNode userInfoNode = null;

		if (requestBody != null) {
			JsonNode bodyNode = objectMapper.valueToTree(requestBody);
			if (bodyNode.hasNonNull("RequestInfo")) {
				userInfoNode = bodyNode.path("RequestInfo").path("userInfo");
			} else if (bodyNode.hasNonNull("requestInfo")) {
				userInfoNode = bodyNode.path("requestInfo").path("userInfo");
			} else if (bodyNode.hasNonNull("userInfo")) {
				userInfoNode = bodyNode.path("userInfo");
			}
		}

		if ((userInfoNode == null || userInfoNode.isMissingNode() || userInfoNode.isNull())
				&& requestInfoStr != null && !requestInfoStr.trim().isEmpty()) {
			try {
				JsonNode root = objectMapper.readTree(requestInfoStr);
				if (root.hasNonNull("RequestInfo")) {
					userInfoNode = root.path("RequestInfo").path("userInfo");
				} else if (root.hasNonNull("requestInfo")) {
					userInfoNode = root.path("requestInfo").path("userInfo");
				} else if (root.hasNonNull("userInfo")) {
					userInfoNode = root.path("userInfo");
				} else {
					userInfoNode = root;
				}
			} catch (Exception e) {
				try {
					String decoded = new String(java.util.Base64.getDecoder().decode(requestInfoStr),
							java.nio.charset.StandardCharsets.UTF_8);
					JsonNode root = objectMapper.readTree(decoded);
					if (root.hasNonNull("RequestInfo")) {
						userInfoNode = root.path("RequestInfo").path("userInfo");
					} else if (root.hasNonNull("requestInfo")) {
						userInfoNode = root.path("requestInfo").path("userInfo");
					} else if (root.hasNonNull("userInfo")) {
						userInfoNode = root.path("userInfo");
					} else {
						userInfoNode = root;
					}
				} catch (Exception ignored) {}
			}
		}

		if (userInfoNode == null || userInfoNode.isMissingNode() || userInfoNode.isNull()) {
			log.warn("Delete request rejected: User information missing from request.");
			throw new CustomException("UNAUTHORIZED_USER",
					"User information is missing in request. Only authorized system user can delete files.");
		}

		String uuid = userInfoNode.path("uuid").asText(null);
		String id = userInfoNode.hasNonNull("id") ? userInfoNode.get("id").asText().trim() : null;

		List<String> roleCodes = new ArrayList<>();
		JsonNode rolesNode = userInfoNode.path("roles");
		if (rolesNode.isArray()) {
			for (JsonNode role : rolesNode) {
				if (role.isTextual()) {
					roleCodes.add(role.asText().trim());
				} else if (role.isObject()) {
					if (role.hasNonNull("code")) {
						roleCodes.add(role.get("code").asText().trim());
					}
					if (role.hasNonNull("name")) {
						roleCodes.add(role.get("name").asText().trim());
					}
				}
			}
		}

		String expectedUuid = fileStoreConfig.getDeleteAuthorizedUserUuid();
		String expectedId = fileStoreConfig.getDeleteAuthorizedUserId();
		String expectedRole = fileStoreConfig.getDeleteAuthorizedRoleCode();

		boolean isUuidValid = uuid != null && expectedUuid != null && uuid.trim().equalsIgnoreCase(expectedUuid.trim());
		boolean isIdValid = id != null && expectedId != null && id.equals(expectedId.trim());
		boolean isRoleValid = expectedRole != null && roleCodes.stream()
				.anyMatch(r -> r.equalsIgnoreCase(expectedRole.trim()));

		if (!isUuidValid || !isIdValid || !isRoleValid) {
			log.warn("Unauthorized delete attempt! Provided uuid: {}, id: {}, roles: {}. Expected uuid: {}, id: {}, role: {}",
					uuid, id, roleCodes, expectedUuid, expectedId, expectedRole);
			throw new CustomException("UNAUTHORIZED_USER",
					"User is not authorized to delete files. Required: uuid=" + expectedUuid
							+ ", id=" + expectedId
							+ ", role=" + expectedRole);
		}

		log.info("Delete request successfully authorized for user uuid: {}, id: {}", uuid, id);
	}

}
