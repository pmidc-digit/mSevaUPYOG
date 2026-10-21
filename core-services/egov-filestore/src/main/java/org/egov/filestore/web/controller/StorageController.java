package org.egov.filestore.web.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON_UTF8_VALUE;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.egov.common.contract.request.RequestInfo;
import org.egov.filestore.config.FileStoreConfig;
import org.egov.filestore.domain.model.FileInfo;
import org.egov.filestore.domain.service.StorageService;
import org.egov.filestore.repository.impl.minio.MinioConfig;
import org.egov.filestore.repository.impl.minio.MinioRepository;
import org.egov.filestore.utils.StorageUtil;
import org.egov.filestore.validator.StorageValidator;
import org.egov.filestore.web.contract.File;
import org.egov.filestore.web.contract.FileStoreResponse;
import org.egov.filestore.web.contract.GetFilesByTagResponse;
import org.egov.filestore.web.contract.ResponseFactory;
import org.egov.filestore.web.contract.StorageResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MultipartFile;

import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@Controller
@RequestMapping("/v1/files")
public class StorageController {


	
	
	private StorageService storageService;
	private ResponseFactory responseFactory;
	private StorageUtil storageUtil;
	private StorageValidator storageValidator;
	public static final Logger logger = LoggerFactory.getLogger(StorageController.class);
	
	@Autowired
	public StorageController(StorageService storageService, ResponseFactory responseFactory,
			StorageUtil storageUtil, StorageValidator storageValidator) {
		this.storageService = storageService;
		this.responseFactory = responseFactory;
		this.storageUtil = storageUtil;
		this.storageValidator = storageValidator;
	}

	public StorageController(StorageService storageService, ResponseFactory responseFactory,
			StorageUtil storageUtil) {
		this(storageService, responseFactory, storageUtil, null);
	}

	@GetMapping("/id")
	@ResponseBody
	public ResponseEntity<Resource> getFile(@RequestParam(value = "tenantId") String tenantId,
			@RequestParam("fileStoreId") String fileStoreId) {
		org.egov.filestore.domain.model.Resource resource =null;
		try {
			resource = storageService.retrieve(fileStoreId, tenantId);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			logger.error("Error while retrieving file: " + e.getMessage());
		}
		String fileName=resource.getFileName().substring(resource.getFileName().lastIndexOf('/')+1,resource.getFileName().length());
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" +fileName  + "\"")
				.header(HttpHeaders.CONTENT_TYPE, resource.getContentType()).body(resource.getResource());
	}

	@GetMapping("/metadata")
	@ResponseBody
	public ResponseEntity<org.egov.filestore.domain.model.Resource> getMetaData(
			@RequestParam(value = "tenantId") String tenantId, @RequestParam("fileStoreId") String fileStoreId) {
		org.egov.filestore.domain.model.Resource resource =null;
		try {
		    resource = storageService.retrieve(fileStoreId, tenantId);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			logger.error("Error while fetching metadata: " + e.getMessage());
		}
		resource.setResource(null);
		return new ResponseEntity<>(resource, HttpStatus.OK);
	}

	@GetMapping("/viewfile")
	public ResponseEntity<byte[]> serveDirect(@RequestParam String name) {
		 return storageService.streamFile(name);
	}

	
	@GetMapping(value = "/tag", produces = APPLICATION_JSON_UTF8_VALUE)
	@ResponseBody
	public GetFilesByTagResponse getUrlListByTag(@RequestParam(value = "tenantId") String tenantId,
			@RequestParam("tag") String tag) {
		final List<FileInfo> fileInfoList = storageService.retrieveByTag(tag, tenantId);
		return responseFactory.getFilesByTagResponse(fileInfoList);
	}

	@PostMapping(produces = APPLICATION_JSON_UTF8_VALUE)
	@ResponseStatus(HttpStatus.CREATED)
	@ResponseBody
	public StorageResponse storeFiles(@RequestParam("file") List<MultipartFile> files,
			@RequestParam(value = "tenantId") String tenantId,
			@RequestParam(value = "module", required = true) String module,
			@RequestParam(value = "tag", required = false) String tag,
			@RequestParam(value = "requestInfo", required = false) String requestInfo,
			@RequestParam(value = "expiryDate", required = false) Long expiryDate
			) {
		RequestInfo reqInfo = storageUtil.getRequestInfo(requestInfo);
		final List<String> fileStoreIds = storageService.save(files, module, tag, tenantId, reqInfo, expiryDate);
		return getStorageResponse(fileStoreIds, tenantId);
	}

	private StorageResponse getStorageResponse(List<String> fileStorageIds, String tenantId) {
		List<File> files = new ArrayList<>();
		for (String fileStorageId : fileStorageIds) {
			File f = new File(fileStorageId, tenantId);
			files.add(f);
		}
		return new StorageResponse(files);
	}
	
	@GetMapping("/url")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getUrls(@RequestParam(value = "tenantId") String tenantId,
			@RequestParam("fileStoreIds") List<String> fileStoreIds) {
		
		Map<String, Object> responseMap = new HashMap<>();
		if (fileStoreIds.isEmpty())
			return new ResponseEntity<>(new HashMap<>(), HttpStatus.OK);
			Map<String, String> maps= storageService.getUrls(tenantId, fileStoreIds);
			
		List<FileStoreResponse> responses = new ArrayList<>();
		for (Entry<String, String> entry : maps.entrySet()) {

			responses.add(FileStoreResponse.builder().id(entry.getKey()).url(entry.getValue()).build());
		}
		responseMap.putAll(maps);
		responseMap.put("fileStoreIds", responses);
		
		return new ResponseEntity<>(responseMap, HttpStatus.OK);
	}

	@PostMapping(value = "/_delete", produces = APPLICATION_JSON_UTF8_VALUE)
	@ResponseBody
	public ResponseEntity<Map<String, Object>> deleteFilesPost(
			@RequestParam(value = "tenantId", required = false) String tenantId,
			@RequestParam(value = "fileStoreIds", required = false) List<String> fileStoreIds,
			@RequestParam(value = "requestInfo", required = false) String requestInfo,
			@RequestBody(required = false) Map<String, Object> requestBody) {
		if (storageValidator != null) {
			storageValidator.validateDeleteRequest(requestBody, requestInfo);
		}

		String finalTenantId = tenantId;
		List<String> finalFileStoreIds = fileStoreIds != null ? new ArrayList<>(fileStoreIds) : new ArrayList<>();

		if (requestBody != null) {
			if (org.springframework.util.StringUtils.isEmpty(finalTenantId) && requestBody.containsKey("tenantId")) {
				finalTenantId = String.valueOf(requestBody.get("tenantId"));
			}
			if (finalFileStoreIds.isEmpty() && requestBody.containsKey("fileStoreIds")) {
				Object idsObj = requestBody.get("fileStoreIds");
				if (idsObj instanceof List) {
					for (Object item : (List<?>) idsObj) {
						if (item != null && !item.toString().trim().isEmpty()) {
							finalFileStoreIds.add(item.toString().trim());
						}
					}
				} else if (idsObj instanceof String) {
					for (String id : ((String) idsObj).split(",")) {
						if (!id.trim().isEmpty()) {
							finalFileStoreIds.add(id.trim());
						}
					}
				}
			}
		}

		Map<String, Object> response = storageService.delete(finalFileStoreIds, finalTenantId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@DeleteMapping(produces = APPLICATION_JSON_UTF8_VALUE)
	@ResponseBody
	public ResponseEntity<Map<String, Object>> deleteFiles(
			@RequestParam(value = "tenantId", required = false) String tenantId,
			@RequestParam(value = "fileStoreIds", required = false) List<String> fileStoreIds,
			@RequestParam(value = "requestInfo", required = false) String requestInfo,
			@RequestBody(required = false) Map<String, Object> requestBody) {
		return deleteFilesPost(tenantId, fileStoreIds, requestInfo, requestBody);
	}
	
}
