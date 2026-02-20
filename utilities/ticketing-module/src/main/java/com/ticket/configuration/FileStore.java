package com.ticket.configuration;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
@Configuration
public class FileStore {

	@Value("${filestore.host}")
    private String fileStoreHost;
	
	@Value("${filestore.path}")
    private String fileStorePath;
	
	public List<String> uploadToFileStore(List<MultipartFile> files, String tenantId, String module)
			throws IOException {

		
		String fileStoreUrl = new StringBuilder(fileStoreHost.concat(fileStorePath)).toString();
		HttpHeaders headers = new HttpHeaders();

		MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

		for (MultipartFile file : files) {
			body.add("file", new ByteArrayResource(file.getBytes()) {
				@Override
				public String getFilename() {
					return file.getOriginalFilename();
				}
			});
		}

		body.add("tenantId", tenantId);
		body.add("module", module);


	    HttpEntity<MultiValueMap<String, Object>> request =
	            new HttpEntity<>(body, headers);

	    RestTemplate restTemplate = new RestTemplate();

	    ResponseEntity<Map<String, Object>> response =
	            restTemplate.postForEntity(fileStoreUrl, request,
	                    (Class<Map<String, Object>>) (Class<?>) Map.class);

	    if (response.getStatusCode() != HttpStatus.CREATED || response.getBody() == null) {
	        throw new RuntimeException("Filestore upload failed: " + response);
	    }

	    Map<String, Object> responseBody = response.getBody();

	    Object filesObj = responseBody.get("files");
	    if (!(filesObj instanceof List)) {
	        throw new RuntimeException("Invalid response from Filestore: 'files' not found");
	    }

	    @SuppressWarnings("unchecked")
	    List<Map<String, Object>> responseFiles =
	            (List<Map<String, Object>>) filesObj;

	    if (responseFiles.isEmpty()) {
	        throw new RuntimeException("No fileStoreIds returned from Filestore");
	    }

	    List<String> fileStoreIds = new ArrayList<>();
	    for (Map<String, Object> fileMap : responseFiles) {
	        Object id = fileMap.get("fileStoreId");
	        if (id != null) {
	            fileStoreIds.add(id.toString());
	        }
	    }

	    return fileStoreIds;
	}
   
}


