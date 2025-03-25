package org.egov.ndc.validator;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.util.NDCConstants;
import org.egov.ndc.web.model.Document;
import org.egov.ndc.web.model.Ndc;
import org.egov.ndc.web.model.NdcRequest;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;

import com.jayway.jsonpath.JsonPath;

@Component
public class NDCValidator {

	@Autowired
	private MDMSValidator mdmsValidator;

	@Autowired
	private NDCConfiguration ndcConfiguration;

	/**
	 * validates the ndcRequest for documents
	 * 
	 * @param ndcRequest
	 * @param mdmsData
	 */
	public void validateCreate(NdcRequest ndcRequest, Object mdmsData) {
		mdmsValidator.validateMdmsData(ndcRequest, mdmsData);
		if (!ObjectUtils.isEmpty(ndcRequest.getNdc().getDocuments())) {
			validateAttachedDocumentTypes(ndcRequest.getNdc(), mdmsData);
			validateDuplicateDocuments(ndcRequest.getNdc());
		}
	}

	/**
	 * validates the ndcReuqest for update on mdms and documents
	 * 
	 * @param ndcRequest
	 * @param searchResult
	 * @param mode
	 * @param mdmsData
	 */
	public void validateUpdate(NdcRequest ndcRequest, Ndc searchResult, String mode, Object mdmsData) {
		Ndc ndc = ndcRequest.getNdc();
		mdmsValidator.validateMdmsData(ndcRequest, mdmsData);
		validateData(searchResult, ndc, mode, mdmsData);
		validateDuplicateDocuments(ndcRequest.getNdc());
	}

	/**
	 * validatest the data of the ndc for nextstep on the current status
	 * 
	 * @param searchResult
	 * @param ndc
	 * @param mode
	 * @param mdmsData
	 */
	private void validateData(Ndc searchResult, Ndc ndc, String mode, Object mdmsData) {
		Map<String, String> errorMap = new HashMap<>();

		if (ndc.getId() == null) {
			errorMap.put("UPDATE ERROR", "Application Not found in the System" + ndc);
		}

		if (!ObjectUtils.isEmpty(ndc.getWorkflow()) && !StringUtils.isEmpty(ndc.getWorkflow().getAction())) {

			if ((ndc.getWorkflow().getAction().equalsIgnoreCase(NDCConstants.ACTION_APPROVE) && mode.equals(NDCConstants.ONLINE_MODE)) || (mode.equals(NDCConstants.OFFLINE_MODE)
					&& ndc.getWorkflow().getAction().equalsIgnoreCase(NDCConstants.ACTION_AUTO_APPROVE) && ndcConfiguration.getNdcOfflineDocRequired())) {
				validateRequiredDocuments(ndc, mdmsData);
			} else if (!ndc.getWorkflow().getAction().equalsIgnoreCase(NDCConstants.ACTION_REJECT) && !ndc.getWorkflow().getAction().equalsIgnoreCase(NDCConstants.ACTION_VOID)
					&& !ObjectUtils.isEmpty(ndc.getDocuments())) {
				validateAttachedDocumentTypes(ndc, mdmsData);
			}

			if (ndc.getWorkflow().getAction().equalsIgnoreCase(NDCConstants.ACTION_REJECT) && StringUtils.isEmpty(ndc.getWorkflow().getComment()))
				errorMap.put("NDC_UPDATE_ERROR_COMMENT_REQUIRED", "Comment is mandaotory, please provide the comments ");
		} else if (!ObjectUtils.isEmpty(ndc.getDocuments())) {
			validateAttachedDocumentTypes(ndc, mdmsData);
		}

		if (!CollectionUtils.isEmpty(errorMap))
			throw new CustomException(errorMap);
	}

	/**
	 * fetch the businessservice code for ndcType
	 * 
	 * @param ndc
	 * @param mdmsData
	 * @return
	 */
	public Map<String, String> getOrValidateBussinessService(Ndc ndc, Object mdmsData) {
		List<Map<String, Object>> result = JsonPath.read(mdmsData, NDCConstants.NDCTYPE_JSONPATH_CODE);
		if (result.isEmpty()) {
			throw new CustomException("MDMS DATA ERROR", "Unable to fetch NdcType from MDMS");
		}

		String filterExp = "$.[?(@.code == '" + ndc.getNdcType() + "' )]";
		List<Map<String, Object>> jsonOutput = JsonPath.read(result, filterExp);
		if (jsonOutput.isEmpty()) {
			throw new CustomException("MDMS DATA ERROR", "Unable to fetch " + ndc.getNdcType() + " workflow mode from MDMS");
		}

		Map<String, String> businessValues = new HashMap<>();
		businessValues.put(NDCConstants.MODE, (String) jsonOutput.get(0).get(NDCConstants.MODE));
		if (jsonOutput.get(0).get(NDCConstants.MODE).equals(NDCConstants.ONLINE_MODE))
			businessValues.put(NDCConstants.WORKFLOWCODE, (String) jsonOutput.get(0).get(NDCConstants.ONLINE_WF));
		else
			businessValues.put(NDCConstants.WORKFLOWCODE, (String) jsonOutput.get(0).get(NDCConstants.OFFLINE_WF));

		if (!ObjectUtils.isEmpty(ndc.getWorkflow()) && !StringUtils.isEmpty(ndc.getWorkflow().getAction()) && ndc.getWorkflow().getAction().equals(NDCConstants.ACTION_INITIATE)) {
			businessValues.put(NDCConstants.INITIATED_TIME, Long.toString(System.currentTimeMillis()));
		}

		ndc.setAdditionalDetails(businessValues);
		return businessValues;
	}

	/**
	 * validates the documents of the ndc with the documentType mappings
	 * 
	 * @param ndc
	 * @param mdmsData
	 */
	private void validateAttachedDocumentTypes(Ndc ndc, Object mdmsData) {
		Map<String, List<String>> masterData = mdmsValidator.getAttributeValues(mdmsData);
		List<Document> documents = ndc.getDocuments();

		String filterExp = "$.[?(@.applicationType=='" + ndc.getApplicationType() + "' && @.ndcType=='" + ndc.getNdcType() + "')].docTypes";

		List<Object> docTypes = JsonPath.read(masterData.get(NDCConstants.NDC_DOC_TYPE_MAPPING), filterExp);

		if (CollectionUtils.isEmpty(docTypes)) {
			throw new CustomException("MDMS_DATA_ERROR", "Unable to fetch ndc document mapping");
		}

		List<String> docTypeMappings = JsonPath.read(docTypes, "$..documentType");

		filterExp = "$.[?(@.active==true)].code";
		List<String> validDocumentTypes = JsonPath.read(masterData.get(NDCConstants.DOCUMENT_TYPE), filterExp);

		if (!CollectionUtils.isEmpty(documents)) {
			List<String> addedDocTypes = new ArrayList<String>();
			documents.forEach(document -> {
				if (StringUtils.isEmpty(document.getFileStoreId())) {
					throw new CustomException("NDC_FILE_EMPTY", "Filestore id is empty");
				}
				if (!validDocumentTypes.contains(document.getDocumentType())) {
					throw new CustomException("NDC_UNKNOWN_DOCUMENTTYPE", document.getDocumentType() + " is Unkown");
				}
				String docType = document.getDocumentType();
				int lastIndex = docType.lastIndexOf(".");
				String documentNs = "";
				if (lastIndex > 1) {
					documentNs = docType.substring(0, lastIndex);
				} else if (lastIndex == 1) {
					throw new CustomException("NDC_INVALID_DOCUMENTTYPE", document.getDocumentType() + " is Invalid");
				} else {
					documentNs = docType;
				}
				addedDocTypes.add(documentNs);
			});
			addedDocTypes.forEach(documentType -> {
				if (!docTypeMappings.contains(documentType)) {
					throw new CustomException("NDC_INVALID_DOCUMENTTYPE", "Document Type " + documentType + " is invalid for " + ndc.getNdcType() + " application");
				}
			});
		}
	}

	/**
	 * validates for the duplicate documents
	 * 
	 * @param ndc
	 */
	private void validateDuplicateDocuments(Ndc ndc) {
		if (!ObjectUtils.isEmpty(ndc.getDocuments())) {
			List<String> documentFileStoreIds = new LinkedList<String>();
			ndc.getDocuments().forEach(document -> {
				if (documentFileStoreIds.contains(document.getFileStoreId()))
					throw new CustomException("NDC_DUPLICATE_DOCUMENT", "Same document cannot be used multiple times");
				else
					documentFileStoreIds.add(document.getFileStoreId());
			});
		}
	}

	/**
	 * validates for the required documents of NDC
	 * 
	 * @param ndc
	 * @param mdmsData
	 */
	private void validateRequiredDocuments(Ndc ndc, Object mdmsData) {
		Map<String, List<String>> masterData = mdmsValidator.getAttributeValues(mdmsData);

		if (!ndc.getWorkflow().getAction().equalsIgnoreCase(NDCConstants.ACTION_REJECT) && !ndc.getWorkflow().getAction().equalsIgnoreCase(NDCConstants.ACTION_VOID)) {
			List<Document> documents = ndc.getDocuments();
			String filterExp = "$.[?(@.applicationType=='" + ndc.getApplicationType() + "' && @.ndcType=='" + ndc.getNdcType() + "')].docTypes";
			List<Object> docTypeMappings = JsonPath.read(masterData.get(NDCConstants.NDC_DOC_TYPE_MAPPING), filterExp);
			if (CollectionUtils.isEmpty(docTypeMappings)) {
				throw new CustomException("MDMS_DATA_ERROR", "Unable to fetch ndc document mapping");
			}
			// fetch all document types for ndc type
			List<String> docTypes = JsonPath.read(docTypeMappings, "$..documentType");

			// filter mandatory document list
			filterExp = "$..[?(@.required==true)].documentType";
			List<String> requiredDocTypes = JsonPath.read(docTypeMappings, filterExp);

			filterExp = "$.[?(@.active==true)].code";
			List<String> validDocumentTypes = JsonPath.read(masterData.get(NDCConstants.DOCUMENT_TYPE), filterExp);

			if (!CollectionUtils.isEmpty(documents)) {
				documents.forEach(document -> {
					if (StringUtils.isEmpty(document.getFileStoreId())) {
						throw new CustomException("NDC_FILE_EMPTY", "Filestore id is empty");
					}
					if (!validDocumentTypes.contains(document.getDocumentType())) {
						throw new CustomException("NDC_UNKNOWN_DOCUMENTTYPE", document.getDocumentType() + " is Unkown");
					}
					if (requiredDocTypes.size() > 0 && documents.size() < requiredDocTypes.size()) {
						throw new CustomException("NDC_MANDATORY_DOCUMENTYPE_MISSING", requiredDocTypes.size() + " Documents are requied ");
					} else if (requiredDocTypes.size() > 0) {
						List<String> addedDocTypes = new ArrayList<String>();

						documents.forEach(doc -> {
							String docType = doc.getDocumentType();
							int lastIndex = docType.lastIndexOf(".");
							String documentNs = "";
							if (lastIndex > 1) {
								documentNs = docType.substring(0, lastIndex);
							} else if (lastIndex == 1) {
								throw new CustomException("NDC_INVALID_DOCUMENTTYPE", document.getDocumentType() + " is invalid");
							} else {
								documentNs = docType;
							}
							addedDocTypes.add(documentNs);
						});
						requiredDocTypes.forEach(docType -> {
							if (!addedDocTypes.contains(docType)) {
								throw new CustomException("NDC_MANDATORY_DOCUMENTYPE_MISSING", "Document Type " + docType + " is missing");
							}
						});
						addedDocTypes.forEach(documentType -> {
							if (!docTypes.contains(documentType)) {
								throw new CustomException("NDC_INVALID_DOCUMENTTYPE", "Document Type " + documentType + " is invalid for " + ndc.getNdcType() + " application");
							}
						});
					}
				});
			} else if (requiredDocTypes.size() > 0) {
				throw new CustomException("NDC_MANDATORY_DOCUMENTYPE_MISSING", "Atleast " + requiredDocTypes.size() + " Documents are required ");
			}
		}
	}

}
