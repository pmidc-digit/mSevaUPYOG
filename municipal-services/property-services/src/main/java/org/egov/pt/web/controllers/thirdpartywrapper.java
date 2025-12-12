package org.egov.pt.web.controllers;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import javax.validation.constraints.NotBlank;

import org.egov.pt.repository.rowmapper.CurlWrapperService;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api")
public class thirdpartywrapper {
	@Autowired
	private CurlWrapperService curlWrapperService;

	@GetMapping("/fetch")
	public ResponseEntity<String> fetchData(
			@RequestParam @NotBlank String ulb,
			@RequestParam @NotBlank String uidNo) {
		String response = "";
		if(ulb.equalsIgnoreCase("ludhiana")){
			response = curlWrapperService.fetchData(ulb, uidNo);
		}else if(ulb.equalsIgnoreCase("bathinda")){
			response = curlWrapperService.fetchBathindaData(ulb, uidNo);
		}

		return ResponseEntity.ok(response);
	}



}
