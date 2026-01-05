package org.egov.custom.mapper.billing.impl;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

import org.egov.custom.mapper.billing.impl.Bill.StatusEnum;
import org.egov.search.model.PropertyBasedBill;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class IntegratedBillRowMapper implements ResultSetExtractor<List<PropertyBasedBill>> {

    @Autowired
    private RestTemplate rest;

    @Value("${egov.user.contextpath}")
    private String userContext;

    @Value("${egov.user.searchpath}")
    private String userSearchPath;

    @Override
    @SuppressWarnings("unchecked")
    public List<PropertyBasedBill> extractData(ResultSet rs) throws SQLException {

        Map<String, PropertyBasedBill> propertyBillMap = new LinkedHashMap<>();
        Set<String> userIds = new HashSet<>();

        while (rs.next()) {
            String propertyId = rs.getString("propertyId");

            // Get or create PropertyBasedBill for the propertyId
            PropertyBasedBill propertyBill = propertyBillMap.get(propertyId);
            if (propertyBill == null) {
                propertyBill = PropertyBasedBill.builder()
                    .propertyId(propertyId)
                    .tenantId(rs.getString("b_tenantid"))
                    .bills(new ArrayList<>())
                    .build();

                propertyBillMap.put(propertyId, propertyBill);
            }

            // Create and add a Bill object to the current PropertyBasedBill
            Bill bill = createBill(rs, userIds,propertyBillMap);
            if (bill.getId() != null) {
            	propertyBill.getBills().add(bill);
            }
        }

        // Populate user information
        List<PropertyBasedBill> propertyBills = new ArrayList<>(propertyBillMap.values());
        if (!CollectionUtils.isEmpty(userIds)) {
            assignUsersToBills(propertyBills, userIds);
        }

        return propertyBills;
    }

    @SuppressWarnings("null")
	private Bill createBill(ResultSet rs, Set<String> userIds,
			Map<String, PropertyBasedBill> propertyBillMap) throws SQLException {
    	
    	AuditDetails auditDetails = new AuditDetails();
        auditDetails.setCreatedBy(rs.getString("b_createdby"));
        auditDetails.setCreatedTime((Long) rs.getObject("b_createddate"));
        auditDetails.setLastModifiedBy(rs.getString("b_lastmodifiedby"));
        auditDetails.setLastModifiedTime((Long) rs.getObject("b_lastmodifieddate"));

        Address address = new Address();
        address.setDoorNo(rs.getString("ptadd_doorno"));
        address.setCity(rs.getString("ptadd_city"));
        address.setLandmark(rs.getString("ptadd_landmark"));
        address.setPincode(rs.getString("ptadd_pincode"));
        address.setLocality(rs.getString("ptadd_locality"));

        User user = User.builder().id(rs.getString("ptown_userid")).build();
        Connection connection = new Connection();
        
        /*
         * Sharan Gakhar
         * 		For Integrated Billing 
         * 		excludes duplicate bills (using billDetailsId and billId ) before creating bill 
         * */
        
        String billId = rs.getString("b_id");
        
        String billDetailId = rs.getString("bd_id");
        String billIdExists = propertyBillMap.values().stream()
                .filter(pbb -> pbb.getBills() != null)
                .flatMap(pbb -> pbb.getBills().stream())
                .filter(bill -> billId.equals(bill.getId()))
                .map(Bill::getId).findFirst().orElse(null);
        String billDetailIdExists = propertyBillMap.values().stream()
                .filter(pbb -> pbb.getBills() != null)
                .flatMap(pbb -> pbb.getBills().stream())
                .filter(bill -> bill.getBillDetails() != null)
                .flatMap(bill -> bill.getBillDetails().stream())
                .filter(detail -> billDetailId.equals(detail.getId()))
                .map(BillDetail::getId).findFirst().orElse(null);
        
        try {
            connection.setPropertyId(rs.getString("propertyId"));
            connection.setOldConnectionNo(rs.getString("oldPropertyId"));
            connection.setStatus(rs.getString("conn_status"));
            connection.setAdditionalDetails(rs.getObject("conn_add"));
        } catch (Exception ex) {
            log.info("Exception in BillRowMapper: ", ex);
            log.error(ex.getMessage());
        }
        
        Bill bill = null;
        
        if(billDetailIdExists == null || billDetailIdExists.trim().isEmpty()) {
        	if (billIdExists != null && !billIdExists.trim().isEmpty()) {

        	    propertyBillMap.values().stream()
        	        .filter(pbb -> pbb.getBills() != null)
        	        .flatMap(pbb -> pbb.getBills().stream())
        	        .filter(b -> billIdExists.equals(b.getId()))
        	        .findFirst()
        	        .ifPresent(b -> {
        	        	try {
							addBillDetailsAndAccountDetails(rs, b);
						} catch (SQLException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
        	            // appended as next entry (comma in JSON)
        	        });
        	}
        	else {
				bill = Bill.builder()
						.id(billId)
			            .propertyId(rs.getString("propertyId"))
			            .totalAmount(BigDecimal.ZERO)
			            .tenantId(rs.getString("b_tenantid"))
			            .payerName(rs.getString("b_payername"))
			            .payerAddress(rs.getString("b_payeraddress"))
			            .payerEmail(rs.getString("b_payeremail"))
			            .mobileNumber(rs.getString("mobilenumber"))
			            .status(StatusEnum.fromValue(rs.getString("b_status")))
			            .businessService(rs.getString("bd_businessService"))
			            .billNumber(rs.getString("bd_billno"))
			            .billDate(rs.getLong("bd_billDate"))
			            .consumerCode(rs.getString("bd_consumerCode"))
			            .partPaymentAllowed(rs.getBoolean("bd_partpaymentallowed"))
			            .isAdvanceAllowed(rs.getBoolean("bd_isadvanceallowed"))
			            .additionalDetails(rs.getObject("b_additionalDetails"))
			            .auditDetails(auditDetails)
			            .fileStoreId(rs.getString("b_filestoreid"))
			            .address(address)
			            .user(user)
			            .connection(connection)
			            .build();
	        	userIds.add(user.getId());
		        // Add BillDetails and BillAccountDetails to Bill
		    	addBillDetailsAndAccountDetails(rs, bill);
		    	
    		 }
        }
        return bill;
    }

    private void addBillDetailsAndAccountDetails(ResultSet rs, Bill bill) throws SQLException {
        String detailId = rs.getString("bd_id");
        BillDetail billDetail = BillDetail.builder()
            .id(detailId)
            .tenantId(rs.getString("bd_tenantid"))
            .billId(rs.getString("bd_billid"))
            .demandId(rs.getString("demandid"))
            .fromPeriod(rs.getLong("fromperiod"))
            .toPeriod(rs.getLong("toperiod"))
            .amount(rs.getBigDecimal("bd_totalamount"))
            .expiryDate(rs.getLong("bd_expirydate"))
            .build();

        bill.addBillDetailsItem(billDetail);
        bill.setTotalAmount(bill.getTotalAmount().add(billDetail.getAmount()));

        BillAccountDetail billAccDetail = BillAccountDetail.builder()
            .id(rs.getString("ad_id"))
            .tenantId(rs.getString("ad_tenantid"))
            .billDetailId(rs.getString("ad_billdetail"))
            .order(rs.getInt("ad_orderno"))
            .amount(rs.getBigDecimal("ad_amount"))
            .adjustedAmount(rs.getBigDecimal("ad_adjustedamount"))
            .taxHeadCode(rs.getString("ad_taxheadcode"))
            .demandDetailId(rs.getString("demanddetailid"))
            .build();

        billDetail.addBillAccountDetailsItem(billAccDetail);
    }

    private void assignUsersToBills(List<PropertyBasedBill> propertyBills, Set<String> userIds) {
        UserSearchCriteria userCriteria = UserSearchCriteria.builder().uuid(userIds).build();
        UserResponse res = rest.postForObject(userContext.concat(userSearchPath), userCriteria, UserResponse.class);
        Map<String, String> users = res.getUsers().stream().collect(Collectors.toMap(User::getUuid, User::getName));

        propertyBills.forEach(propertyBill -> propertyBill.getBills().forEach(
            bill -> bill.getUser().setName(users.get(bill.getUser().getId()))));
    }
}
