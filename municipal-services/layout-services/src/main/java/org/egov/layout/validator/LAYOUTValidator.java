package org.egov.layout.validator;

import java.util.*;

import org.egov.layout.config.LAYOUTConfiguration;
import org.egov.layout.util.LAYOUTConstants;
import org.egov.layout.web.model.Document;
import org.egov.layout.web.model.Layout;
import org.egov.layout.web.model.LayoutRequest;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;

import com.jayway.jsonpath.JsonPath;

@Component
public class LAYOUTValidator {

	@Autowired
	private MDMSValidator mdmsValidator;

	@Autowired
	private LAYOUTConfiguration nocConfiguration;

	/**
	 * validates the nocRequest for documents
	 * 
	 * @param nocRequest
	 * @param mdmsData
	 */
	public void validateCreate(LayoutRequest nocRequest, Object mdmsData) {
		mdmsValidator.validateMdmsData(nocRequest, mdmsData);
		if (!ObjectUtils.isEmpty(nocRequest.getLayout().getDocuments())) {
			validateAttachedDocumentTypes(nocRequest.getLayout(), mdmsData);
			validateDuplicateDocuments(nocRequest.getLayout());
		}
	}

	/**
	 * validates the nocReuqest for update on mdms and documents
	 * 
	 * @param nocRequest
	 * @param searchResult
	 * @param mode
	 * @param mdmsData
	 */
	public void validateUpdate(LayoutRequest nocRequest, Layout searchResult, String mode, Object mdmsData) {
		Layout noc = nocRequest.getLayout();
		mdmsValidator.validateMdmsData(nocRequest, mdmsData);
		validateData(searchResult, noc, mode, mdmsData);
		validateDuplicateDocuments(nocRequest.getLayout());
	}

	/**
	 * validatest the data of the layout for nextstep on the current status
	 * 
	 * @param searchResult
	 * @param noc
	 * @param mode
	 * @param mdmsData
	 */
	private void validateData(Layout searchResult, Layout noc, String mode, Object mdmsData) {
		Map<String, String> errorMap = new HashMap<>();

		if (noc.getId() == null) {
			errorMap.put("UPDATE ERROR", "Application Not found in the System" + noc);
		}

		if (!ObjectUtils.isEmpty(noc.getWorkflow()) && !StringUtils.isEmpty(noc.getWorkflow().getAction())) {

			if ((noc.getWorkflow().getAction().equalsIgnoreCase(LAYOUTConstants.ACTION_APPROVE) && mode.equals(LAYOUTConstants.ONLINE_MODE)) || (mode.equals(LAYOUTConstants.OFFLINE_MODE)
					&& noc.getWorkflow().getAction().equalsIgnoreCase(LAYOUTConstants.ACTION_AUTO_APPROVE) && nocConfiguration.getNocOfflineDocRequired())) {
				validateRequiredDocuments(noc, mdmsData);
			} else if (!noc.getWorkflow().getAction().equalsIgnoreCase(LAYOUTConstants.ACTION_REJECT) && !noc.getWorkflow().getAction().equalsIgnoreCase(LAYOUTConstants.ACTION_VOID)
					&& !ObjectUtils.isEmpty(noc.getDocuments())) {
				validateAttachedDocumentTypes(noc, mdmsData);
			}

			if (noc.getWorkflow().getAction().equalsIgnoreCase(LAYOUTConstants.ACTION_REJECT) && StringUtils.isEmpty(noc.getWorkflow().getComment()))
				errorMap.put("NOC_UPDATE_ERROR_COMMENT_REQUIRED", "Comment is mandaotory, please provide the comments ");
		} else if (!ObjectUtils.isEmpty(noc.getDocuments())) {
			validateAttachedDocumentTypes(noc, mdmsData);
		}

		if (!CollectionUtils.isEmpty(errorMap))
			throw new CustomException(errorMap);
	}

	/**
	 * fetch the businessservice code for nocType
	 * 
	 * @param noc
	 * @param mdmsData
	 * @return
	 */
	public Map<String, String> getOrValidateBussinessService(Layout noc, Object mdmsData) {
		List<Map<String, Object>> result = JsonPath.read(mdmsData, LAYOUTConstants.LAYOUTTYPE_JSONPATH_CODE);
		if (result.isEmpty()) {
			throw new CustomException("MDMS DATA ERROR", "Unable to fetch NocType from MDMS");
		}

		String filterExp = "$.[?(@.code == '" + noc.getLayoutType() + "' )]";
		List<Map<String, Object>> jsonOutput = JsonPath.read(result, filterExp);
		if (jsonOutput.isEmpty()) {
			throw new CustomException("MDMS DATA ERROR", "Unable to fetch " + noc.getLayoutType() + " workflow mode from MDMS");
		}
		Object additionalDetailsObj = noc.getNocDetails().getAdditionalDetails();
		Map<String, String> businessValues = new HashMap<>();
//		businessValues.put(LAYOUTConstants.MODE, (String) jsonOutput.get(0).get(LAYOUTConstants.MODE));
		String uniquePropertyId = UUID.randomUUID().toString();
		businessValues.put(LAYOUTConstants.SOURCE_RefId, uniquePropertyId);
//		if (jsonOutput.get(0).get(LAYOUTConstants.MODE).equals(LAYOUTConstants.ONLINE_MODE))
//			businessValues.put(LAYOUTConstants.WORKFLOWCODE, (String) jsonOutput.get(0).get(LAYOUTConstants.ONLINE_WF));
//		else
//			businessValues.put(LAYOUTConstants.WORKFLOWCODE, (String) jsonOutput.get(0).get(LAYOUTConstants.OFFLINE_WF));

		if (!ObjectUtils.isEmpty(noc.getWorkflow()) && !StringUtils.isEmpty(noc.getWorkflow().getAction()) && noc.getWorkflow().getAction().equals(LAYOUTConstants.ACTION_INITIATE)) {
			businessValues.put(LAYOUTConstants.INITIATED_TIME, Long.toString(System.currentTimeMillis()));
		}

//		layout.setAdditionalDetails(businessValues);
//		Object additionalDetailsObj = layout.getNocDetails().getAdditionalDetails();


		if (additionalDetailsObj instanceof Map) {
			Map<String, String> additionalDetails = (Map<String, String>) additionalDetailsObj;

			// Add all entries from additionalDetails to businessValues
			businessValues.putAll(additionalDetails);
		}
		noc.getNocDetails().setAdditionalDetails(businessValues);



		return businessValues;
	}

	/**
	 * validates the documents of the layout with the documentType mappings
	 * 
	 * @param noc
	 * @param mdmsData
	 */
	private void validateAttachedDocumentTypes(Layout noc, Object mdmsData) {
		Map<String, List<String>> masterData = mdmsValidator.getAttributeValues(mdmsData);
		List<Document> documents = noc.getDocuments();

		String filterExp = "$.[?(@.applicationType=='" + noc.getApplicationType() + "' && @.nocType=='" + noc.getLayoutType() + "')].docTypes";

		List<Object> docTypes = JsonPath.read(masterData.get(LAYOUTConstants.NOC_DOC_TYPE_MAPPING), filterExp);

		if (CollectionUtils.isEmpty(docTypes)) {
			throw new CustomException("MDMS_DATA_ERROR", "Unable to fetch layout document mapping");
		}

		List<String> docTypeMappings = JsonPath.read(docTypes, "$..documentType");

		filterExp = "$.[?(@.active==true)].code";
		List<String> validDocumentTypes = JsonPath.read(masterData.get(LAYOUTConstants.DOCUMENT_TYPE), filterExp);

		if (!CollectionUtils.isEmpty(documents)) {
			List<String> addedDocTypes = new ArrayList<String>();
			documents.forEach(document -> {
				if (StringUtils.isEmpty(document.getDocumentAttachment())) {
					throw new CustomException("NOC_FILE_EMPTY", "Filestore id is empty");
				}
				if (!validDocumentTypes.contains(document.getDocumentType())) {
					throw new CustomException("NOC_UNKNOWN_DOCUMENTTYPE", document.getDocumentType() + " is Unkown");
				}
				String docType = document.getDocumentType();
				int lastIndex = docType.lastIndexOf(".");
				String documentNs = "";
				if (lastIndex > 1) {
					documentNs = docType.substring(0, lastIndex);
				} else if (lastIndex == 1) {
					throw new CustomException("NOC_INVALID_DOCUMENTTYPE", document.getDocumentType() + " is Invalid");
				} else {
					documentNs = docType;
				}
				addedDocTypes.add(documentNs);
			});
//			addedDocTypes.forEach(documentType -> {
////				if (!docTypeMappings.contains(documentType)) {
////					throw new CustomException("NOC_INVALID_DOCUMENTTYPE", "Document Type " + documentType + " is invalid for " + layout.getNocType() + " application");
////				}
////			});
		}
	}

	/**
	 * validates for the duplicate documents
	 * 
	 * @param noc
	 */
	private void validateDuplicateDocuments(Layout noc) {
		if (!ObjectUtils.isEmpty(noc.getDocuments())) {
			List<String> documentFileStoreIds = new LinkedList<String>();
			noc.getDocuments().forEach(document -> {
				if (documentFileStoreIds.contains(document.getDocumentAttachment()))
					throw new CustomException("NOC_DUPLICATE_DOCUMENT", "Same document cannot be used multiple times");
				else
					documentFileStoreIds.add(document.getDocumentAttachment());
			});
		}
	}

	/**
	 * validates for the required documents of NOC
	 * 
	 * @param noc
	 * @param mdmsData
	 */
	private void validateRequiredDocuments(Layout noc, Object mdmsData) {
		Map<String, List<String>> masterData = mdmsValidator.getAttributeValues(mdmsData);

		if (!noc.getWorkflow().getAction().equalsIgnoreCase(LAYOUTConstants.ACTION_REJECT) && !noc.getWorkflow().getAction().equalsIgnoreCase(LAYOUTConstants.ACTION_VOID)) {
			List<Document> documents = noc.getDocuments();
			String filterExp = "$.[?(@.applicationType=='" + noc.getApplicationType() + "' && @.nocType=='" + noc.getLayoutType() + "')].docTypes";
			List<Object> docTypeMappings = JsonPath.read(masterData.get(LAYOUTConstants.NOC_DOC_TYPE_MAPPING), filterExp);
			if (CollectionUtils.isEmpty(docTypeMappings)) {
				throw new CustomException("MDMS_DATA_ERROR", "Unable to fetch layout document mapping");
			}
			// fetch all document types for layout type
			List<String> docTypes = JsonPath.read(docTypeMappings, "$..documentType");

			// filter mandatory document list
			filterExp = "$..[?(@.required==true)].documentType";
			List<String> requiredDocTypes = JsonPath.read(docTypeMappings, filterExp);

			filterExp = "$.[?(@.active==true)].code";
			List<String> validDocumentTypes = JsonPath.read(masterData.get(LAYOUTConstants.DOCUMENT_TYPE), filterExp);

			if (!CollectionUtils.isEmpty(documents)) {
				documents.forEach(document -> {
					if (StringUtils.isEmpty(document.getDocumentAttachment())) {
						throw new CustomException("NOC_FILE_EMPTY", "Filestore id is empty");
					}
					if (!validDocumentTypes.contains(document.getDocumentType())) {
						throw new CustomException("NOC_UNKNOWN_DOCUMENTTYPE", document.getDocumentType() + " is Unkown");
					}
					if (requiredDocTypes.size() > 0 && documents.size() < requiredDocTypes.size()) {
						throw new CustomException("NOC_MANDATORY_DOCUMENTYPE_MISSING", requiredDocTypes.size() + " Documents are requied ");
					} else if (requiredDocTypes.size() > 0) {
						List<String> addedDocTypes = new ArrayList<String>();

						documents.forEach(doc -> {
							String docType = doc.getDocumentType();
							int lastIndex = docType.lastIndexOf(".");
							String documentNs = "";
							if (lastIndex > 1) {
								documentNs = docType.substring(0, lastIndex);
							} else if (lastIndex == 1) {
								throw new CustomException("NOC_INVALID_DOCUMENTTYPE", document.getDocumentType() + " is invalid");
							} else {
								documentNs = docType;
							}
							addedDocTypes.add(documentNs);
						});
						requiredDocTypes.forEach(docType -> {
							if (!addedDocTypes.contains(docType)) {
								throw new CustomException("NOC_MANDATORY_DOCUMENTYPE_MISSING", "Document Type " + docType + " is missing");
							}
						});
						addedDocTypes.forEach(documentType -> {
							if (!docTypes.contains(documentType)) {
								throw new CustomException("NOC_INVALID_DOCUMENTTYPE", "Document Type " + documentType + " is invalid for " + noc.getLayoutType() + " application");
							}
						});
					}
				});
			} else if (requiredDocTypes.size() > 0) {
				throw new CustomException("NOC_MANDATORY_DOCUMENTYPE_MISSING", "Atleast " + requiredDocTypes.size() + " Documents are required ");
			}
		}
	}

}
