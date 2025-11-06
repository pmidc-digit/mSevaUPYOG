package org.egov.garbagecollection.service;

import org.egov.common.contract.request.RequestInfo;
import org.egov.garbagecollection.repository.DocumentRepository;
import org.egov.garbagecollection.web.models.DocumentRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DocumentService {

	@Autowired
	private DocumentRepository documentRepository;

	public void saveDocuments(DocumentRequest documentRequest, RequestInfo requestInfo) {
		documentRepository.saveDocuments(documentRequest.getDocuments());
	}
}
