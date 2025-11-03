package org.egov.echallan.repository.rowmapper;


import org.egov.echallan.model.*;
import org.egov.echallan.model.Challan.StatusEnum;
import org.egov.tracer.model.CustomException;
import org.postgresql.util.PGobject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;



@Component
@Slf4j
public class ChallanRowMapper  implements ResultSetExtractor<List<Challan>> {
	@Autowired
    private ObjectMapper mapper;

    public List<Challan> extractData(ResultSet rs) throws SQLException, DataAccessException {
        Map<String, Challan> challanMap = new LinkedHashMap<>();
        while (rs.next()) {
            String id = rs.getString("challan_id_alias");
            Challan currentChallan = challanMap.get(id);

            if(currentChallan == null){
                Long lastModifiedTime = rs.getLong("challan_lastModifiedTime");
                if(rs.wasNull()){lastModifiedTime = null;}

                Long taxPeriodFrom = (Long) rs.getObject("taxperiodfrom");
                Long taxPeriodto = (Long) rs.getObject("taxperiodto");
                PGobject pgObj = (PGobject) rs.getObject("additionaldetail");
                AuditDetails auditdetails = AuditDetails.builder()
                        .createdBy(rs.getString("challan_createdBy"))
                        .createdTime(rs.getLong("challan_createdTime"))
                        .lastModifiedBy(rs.getString("challan_lastModifiedBy"))
                        .lastModifiedTime(lastModifiedTime)
                        .build();
                try {
                // Get BigDecimal values with null handling
                BigDecimal challanAmount = rs.getBigDecimal("challan_amount");
                if(rs.wasNull()) { challanAmount = null; }
                
                currentChallan = Challan.builder().auditDetails(auditdetails)
                		.accountId(rs.getString("uuid"))
                		.challanNo(rs.getString("challanno"))
                		.businessService(rs.getString("businessservice"))
                		.tenantId(rs.getString("tenantid"))
                		.referenceId(rs.getString("referenceid"))
                		.taxPeriodFrom(taxPeriodFrom)
                		.taxPeriodTo(taxPeriodto)
                		.description(rs.getString("description"))
                		.applicationStatus(StatusEnum.valueOf(rs.getString("applicationstatus")))
                        .challanStatus(rs.getString("challanStatus"))
//                        .applicationStatus(rs.getString("applicationstatus"))
                        .receiptNumber(rs.getString("receiptnumber"))
                		.filestoreid(rs.getString("filestoreid"))
                        .challanAmount(challanAmount)
                        .offenceTypeName(rs.getString("offence_type_name"))
                        .offenceCategoryName(rs.getString("offence_category_name"))
                        .offenceSubCategoryName(rs.getString("offence_subcategory_name"))
                        .id(id)
                        .build();
                if(pgObj!=null){
                    JsonNode additionalDetail = mapper.readTree(pgObj.getValue());
                    currentChallan.setAdditionalDetail(additionalDetail);
                    
                    // Extract amount array from additionalDetail JSONB if it exists
                    if(additionalDetail != null && additionalDetail.has("amount")) {
                        JsonNode amountNode = additionalDetail.get("amount");
                        if(amountNode != null && amountNode.isArray()) {
                            try {
                                List<Amount> amountList = mapper.convertValue(amountNode, 
                                    mapper.getTypeFactory().constructCollectionType(List.class, Amount.class));
                                currentChallan.setAmount(amountList);
                            } catch (Exception e) {
                                log.warn("Failed to parse amount array from additionalDetail for challan {}: {}", id, e.getMessage());
                            }
                        }
                    }
                }
                }
                catch (IOException e){
                    throw new CustomException("PARSING ERROR","Error while parsing additionalDetail json");
                }
                challanMap.put(id,currentChallan);
            }
            addAddressToChallan(rs, currentChallan);
            addDocumentToChallan(rs,currentChallan);

        }
       
        return new ArrayList<>(challanMap.values());

    }



    private void addAddressToChallan(ResultSet rs, Challan challan) throws SQLException {

        String tenantId = challan.getTenantId();

        //if(echallan.getTradeLicenseDetail()==null){

            Boundary locality = Boundary.builder().code(rs.getString("locality"))
                    .build();

            Double latitude = (Double) rs.getObject("latitude");
            Double longitude = (Double) rs.getObject("longitude");

            Address address = Address.builder()
                    .buildingName(rs.getString("buildingName"))
                    .city(rs.getString("city"))
                    .detail(rs.getString("detail"))
                    .id(rs.getString("chaladdr_id"))
                    .landmark(rs.getString("landmark"))
                    .latitude(latitude)
                    .locality(locality)
                    .longitude(longitude)
                    .pincode(rs.getString("pincode"))
                    .doorNo(rs.getString("doorno"))
                    .street(rs.getString("street"))
                    .tenantId(tenantId)
                    .build();

            challan.setAddress(address);
      
    }


    private void addDocumentToChallan(ResultSet rs, Challan challan) throws SQLException {
        String documentDetailId = rs.getString("document_detail_id");
        if(documentDetailId != null && !documentDetailId.isEmpty()) {
            /**
             * Using explicitly aliased columns to avoid ambiguity with challan and address audit columns
             * document_detail_id, challan_id, document_type, filestore_id, 
             * doc_createdby, doc_lastmodifiedby, doc_createdtime, doc_lastmodifiedtime
             */
            Long docCreatedTime = rs.getLong("doc_createdtime");
            if(rs.wasNull()) { docCreatedTime = null; }
            Long docLastModifiedTime = rs.getLong("doc_lastmodifiedtime");
            if(rs.wasNull()) { docLastModifiedTime = null; }
            
            AuditDetails auditdetails = AuditDetails.builder()
                    .createdBy(rs.getString("doc_createdby"))
                    .createdTime(docCreatedTime)
                    .lastModifiedBy(rs.getString("doc_lastmodifiedby"))
                    .lastModifiedTime(docLastModifiedTime)
                    .build();
            
            // Check if document already exists to avoid duplicates
            List<DocumentDetail> existingDocs = challan.getUploadedDocumentDetails();
            if(existingDocs == null) {
                existingDocs = new ArrayList<>();
            }
            
            boolean exists = existingDocs.stream()
                .anyMatch(doc -> documentDetailId.equals(doc.getDocumentDetailId()));
            
            if(!exists) {
                DocumentDetail details = DocumentDetail.builder()
                        .documentDetailId(documentDetailId)
                        .challanId(rs.getString("challan_id"))
                        .documentType(rs.getString("document_type"))
                        .fileStoreId(rs.getString("filestore_id"))
                        .auditDetails(auditdetails)
                        .build();
                existingDocs.add(details);
                challan.setUploadedDocumentDetails(existingDocs);
            }
        }
    }



}
