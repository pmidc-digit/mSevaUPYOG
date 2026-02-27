package org.egov.pt.web.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

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
		if (ulb.equalsIgnoreCase("MCB")) {
			response = curlWrapperService.fetchBathindaData(ulb, uidNo);
		} else {
			response = curlWrapperService.fetchData(ulb, uidNo);
		}

		return ResponseEntity.ok(response);
	}

	@PostMapping("/fetchByBlock")
	public ResponseEntity<String> fetchByBlock(@RequestBody Map<String, Object> requestParam) {
		String response = curlWrapperService.fetchDataByBlock(requestParam);
		return ResponseEntity.ok(response);
	}

}
