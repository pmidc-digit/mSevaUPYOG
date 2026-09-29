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
        Map<String, Bill> billMap = new LinkedHashMap<>();
        Map<String, BillDetail> billDetailMap = new LinkedHashMap<>();
        Set<String> accountDetailIds = new HashSet<>();
        Set<String> userIds = new HashSet<>();

        while (rs.next()) {
            String propertyId = getPropertyId(rs);
            if (propertyId == null || propertyId.trim().isEmpty()) {
                continue;
            }

            // 1. Get or create PropertyBasedBill for the propertyId
            PropertyBasedBill propertyBill = propertyBillMap.get(propertyId);
            if (propertyBill == null) {
                propertyBill = PropertyBasedBill.builder()
                    .propertyId(propertyId)
                    .tenantId(getStringSafely(rs, "b_tenantid"))
                    .bills(new ArrayList<>())
                    .build();
                propertyBillMap.put(propertyId, propertyBill);
            }

            // 2. Get or create Bill
            String billId = getStringSafely(rs, "b_id");
            if (billId == null || billId.trim().isEmpty()) {
                continue;
            }

            Bill bill = billMap.get(billId);
            if (bill == null) {
                bill = createBill(rs, propertyId, userIds);
                billMap.put(billId, bill);

                String service = bill.getBusinessService();
                String billTypeKey = "waterBill";
                if ("SW".equalsIgnoreCase(service) || (service != null && service.toUpperCase().contains("SW"))) {
                    billTypeKey = "sewerageBill";
                } else if ("WS".equalsIgnoreCase(service) || (service != null && service.toUpperCase().contains("WS"))) {
                    billTypeKey = "waterBill";
                } else if (service != null && !service.trim().isEmpty()) {
                    billTypeKey = service.toLowerCase() + "Bill";
                }

                Map<String, Bill> billWrapper = new LinkedHashMap<>();
                billWrapper.put(billTypeKey, bill);
                propertyBill.getBills().add(billWrapper);
            }

            // 3. Get or create BillDetail
            String detailId = getStringSafely(rs, "bd_id");
            if (detailId != null && !detailId.trim().isEmpty()) {
                BillDetail billDetail = billDetailMap.get(detailId);
                if (billDetail == null) {
                    billDetail = createBillDetail(rs, detailId);
                    billDetailMap.put(detailId, billDetail);
                    bill.addBillDetailsItem(billDetail);
                    if (billDetail.getAmount() != null) {
                        bill.setTotalAmount(bill.getTotalAmount().add(billDetail.getAmount()));
                    }
                }

                // 4. Create and add BillAccountDetail
                String adId = getStringSafely(rs, "ad_id");
                if (adId != null && !adId.trim().isEmpty() && !"NA".equalsIgnoreCase(adId.trim())) {
                    if (accountDetailIds.add(adId)) {
                        BillAccountDetail billAccDetail = createBillAccountDetail(rs, adId);
                        billDetail.addBillAccountDetailsItem(billAccDetail);
                    }
                }
            }
        }

        // Sort billDetails by fromPeriod desc and billAccountDetails by order asc
        for (Bill bill : billMap.values()) {
            if (bill.getBillDetails() != null && bill.getBillDetails().size() > 1) {
                bill.getBillDetails().sort((b1, b2) -> {
                    if (b1.getFromPeriod() == null && b2.getFromPeriod() == null) return 0;
                    if (b1.getFromPeriod() == null) return 1;
                    if (b2.getFromPeriod() == null) return -1;
                    return b2.getFromPeriod().compareTo(b1.getFromPeriod());
                });
            }
            if (bill.getBillDetails() != null) {
                for (BillDetail bd : bill.getBillDetails()) {
                    if (bd.getBillAccountDetails() != null && bd.getBillAccountDetails().size() > 1) {
                        bd.getBillAccountDetails().sort((a1, a2) -> {
                            if (a1.getOrder() == null && a2.getOrder() == null) return 0;
                            if (a1.getOrder() == null) return 1;
                            if (a2.getOrder() == null) return -1;
                            return a1.getOrder().compareTo(a2.getOrder());
                        });
                    }
                }
            }
        }

        // Ensure waterBill is always before sewerageBill in bills list
        for (PropertyBasedBill propertyBill : propertyBillMap.values()) {
            if (propertyBill.getBills() != null && propertyBill.getBills().size() > 1) {
                propertyBill.getBills().sort((m1, m2) -> {
                    boolean m1IsWater = m1.containsKey("waterBill");
                    boolean m2IsWater = m2.containsKey("waterBill");
                    if (m1IsWater && !m2IsWater) return -1;
                    if (!m1IsWater && m2IsWater) return 1;
                    return 0;
                });
            }
        }

        // Populate user information
        List<PropertyBasedBill> propertyBills = new ArrayList<>(propertyBillMap.values());
        if (!CollectionUtils.isEmpty(userIds)) {
            assignUsersToBills(propertyBills, userIds);
        }

        return propertyBills;
    }

    private Bill createBill(ResultSet rs, String propertyId, Set<String> userIds) throws SQLException {
        AuditDetails auditDetails = new AuditDetails();
        auditDetails.setCreatedBy(getStringSafely(rs, "b_createdby"));
        auditDetails.setCreatedTime(getLongSafely(rs, "b_createddate"));
        auditDetails.setLastModifiedBy(getStringSafely(rs, "b_lastmodifiedby"));
        auditDetails.setLastModifiedTime(getLongSafely(rs, "b_lastmodifieddate"));

        Address address = Address.builder()
            .doorNo(getStringSafely(rs, "ptadd_doorno"))
            .landmark(getStringSafely(rs, "ptadd_landmark"))
            .city(getStringSafely(rs, "ptadd_city"))
            .pincode(getStringSafely(rs, "ptadd_pincode"))
            .locality(getStringSafely(rs, "ptadd_locality"))
            .street(getStringSafely(rs, "ptadd_street"))
            .region(getStringSafely(rs, "ptadd_region"))
            .plotno(getStringSafely(rs, "ptadd_plotno"))
            .buildingname(getStringSafely(rs, "ptadd_buildingname"))
            .district(getStringSafely(rs, "ptadd_district"))
            .state(getStringSafely(rs, "ptadd_state"))
            .latitude(getStringSafely(rs, "ptadd_latitude"))
            .longitude(getStringSafely(rs, "ptadd_longitude"))
            .build();

        String userId = getStringSafely(rs, "ptown_userid");
        User user = User.builder().id(userId).build();
        if (userId != null && !userId.trim().isEmpty()) {
            userIds.add(userId.trim());
        }

        String oldPropertyId = getOldPropertyId(rs);

        Connection connection = new Connection();
        try {
            connection.setPropertyId(propertyId);
            connection.setOldConnectionNo(oldPropertyId);
            connection.setStatus(getStringSafely(rs, "conn_status"));
            connection.setAdditionalDetails(getObjectSafely(rs, "conn_add"));
        } catch (Exception ex) {
            log.info("Exception in connection mapping: ", ex);
        }

        MeterReading meterReading = null;
        String mrConnectionNo = getStringSafely(rs, "mr_connectionno");
        if (mrConnectionNo != null && !mrConnectionNo.trim().isEmpty()) {
            meterReading = MeterReading.builder()
                .connectionno(mrConnectionNo)
                .lastReading(getBigDecimalSafely(rs, "mr_lastreading"))
                .lastReadingDate(getLongSafely(rs, "mr_lastreadingdate"))
                .currentReading(getBigDecimalSafely(rs, "mr_currentreading"))
                .currentReadingDate(getLongSafely(rs, "mr_currentreadingdate"))
                .consumption(getBigDecimalSafely(rs, "mr_consumption"))
                .meterStatus(getStringSafely(rs, "mr_meterstatus"))
                .billingPeriod(getStringSafely(rs, "mr_billingperiod"))
                .build();
        } else {
            meterReading = new MeterReading();
        }

        String statusStr = getStringSafely(rs, "b_status");
        StatusEnum status = null;
        if (statusStr != null) {
            status = StatusEnum.fromValue(statusStr.trim().toUpperCase());
        }

        return Bill.builder()
            .id(getStringSafely(rs, "b_id"))
            .propertyId(propertyId)
            .pid(propertyId)
            .oldPropertyId(oldPropertyId)
            .oldpid(oldPropertyId)
            .totalAmount(BigDecimal.ZERO)
            .tenantId(getStringSafely(rs, "b_tenantid"))
            .payerName(getStringSafely(rs, "b_payername"))
            .payerAddress(getStringSafely(rs, "b_payeraddress"))
            .payerEmail(getStringSafely(rs, "b_payeremail"))
            .mobileNumber(getStringSafely(rs, "mobilenumber"))
            .status(status)
            .businessService(getStringSafely(rs, "bd_businessservice"))
            .billNumber(getStringSafely(rs, "bd_billno"))
            .billDate(getLongSafely(rs, "bd_billdate"))
            .consumerCode(getStringSafely(rs, "bd_consumercode"))
            .partPaymentAllowed(getBooleanSafely(rs, "bd_partpaymentallowed"))
            .isAdvanceAllowed(getBooleanSafely(rs, "bd_isadvanceallowed"))
            .additionalDetails(getObjectSafely(rs, "b_additionaldetails"))
            .auditDetails(auditDetails)
            .fileStoreId(getStringSafely(rs, "b_filestoreid"))
            .address(address)
            .user(user)
            .connection(connection)
            .meterReading(meterReading)
            .billDetails(new ArrayList<>())
            .build();
    }

    private BillDetail createBillDetail(ResultSet rs, String detailId) throws SQLException {
        return BillDetail.builder()
            .id(detailId)
            .tenantId(getStringSafely(rs, "bd_tenantid"))
            .billId(getStringSafely(rs, "bd_billid"))
            .demandId(getStringSafely(rs, "demandid"))
            .fromPeriod(getLongSafely(rs, "fromperiod"))
            .toPeriod(getLongSafely(rs, "toperiod"))
            .amount(getBigDecimalSafely(rs, "bd_totalamount"))
            .expiryDate(getLongSafely(rs, "bd_expirydate"))
            .additionalDetails(getObjectSafely(rs, "bd_additionaldetails"))
            .billAccountDetails(new ArrayList<>())
            .build();
    }

    private BillAccountDetail createBillAccountDetail(ResultSet rs, String adId) throws SQLException {
        return BillAccountDetail.builder()
            .id(adId)
            .tenantId(getStringSafely(rs, "ad_tenantid"))
            .billDetailId(getStringSafely(rs, "ad_billdetail"))
            .order(getIntSafely(rs, "ad_orderno"))
            .amount(getBigDecimalSafely(rs, "ad_amount"))
            .adjustedAmount(getBigDecimalSafely(rs, "ad_adjustedamount"))
            .taxHeadCode(getStringSafely(rs, "ad_taxheadcode"))
            .demandDetailId(getStringSafely(rs, "demanddetailid"))
            .additionalDetails(getObjectSafely(rs, "ad_additionaldetails"))
            .build();
    }

    private void assignUsersToBills(List<PropertyBasedBill> propertyBills, Set<String> userIds) {
        if (CollectionUtils.isEmpty(userIds)) {
            return;
        }
        try {
            UserSearchCriteria userCriteria = UserSearchCriteria.builder().uuid(userIds).build();
            UserResponse res = rest.postForObject(userContext.concat(userSearchPath), userCriteria, UserResponse.class);
            if (res != null && !CollectionUtils.isEmpty(res.getUsers())) {
                Map<String, String> users = res.getUsers().stream()
                    .filter(u -> u.getUuid() != null && u.getName() != null)
                    .collect(Collectors.toMap(User::getUuid, User::getName, (u1, u2) -> u1));

                propertyBills.forEach(propertyBill -> {
                    if (propertyBill.getBills() != null) {
                        propertyBill.getBills().forEach(billMapItem -> {
                            if (billMapItem != null) {
                                billMapItem.values().forEach(bill -> {
                                    if (bill != null && bill.getUser() != null && bill.getUser().getId() != null) {
                                        String name = users.get(bill.getUser().getId());
                                        if (name != null) {
                                            bill.getUser().setName(name);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        } catch (Exception e) {
            log.error("Error fetching user details from user service: ", e);
        }
    }

    private String getPropertyId(ResultSet rs) {
        String propertyId = getStringSafely(rs, "propertyId");
        if (propertyId == null || propertyId.trim().isEmpty()) {
            propertyId = getStringSafely(rs, "pid");
        }
        return propertyId != null ? propertyId.trim() : null;
    }

    private String getOldPropertyId(ResultSet rs) {
        String oldPid = getStringSafely(rs, "oldPropertyId");
        if (oldPid == null || oldPid.trim().isEmpty()) {
            oldPid = getStringSafely(rs, "oldpid");
        }
        return oldPid != null ? oldPid.trim() : null;
    }

    private String getStringSafely(ResultSet rs, String column) {
        try {
            return rs.getString(column);
        } catch (SQLException e1) {
            try {
                return rs.getString(column.toLowerCase());
            } catch (SQLException e2) {
                try {
                    return rs.getString(column.toUpperCase());
                } catch (SQLException e3) {
                    return null;
                }
            }
        }
    }

    private Long getLongSafely(ResultSet rs, String column) {
        try {
            Object val = rs.getObject(column);
            if (val instanceof Number) return ((Number) val).longValue();
            return null;
        } catch (SQLException e1) {
            try {
                Object val = rs.getObject(column.toLowerCase());
                if (val instanceof Number) return ((Number) val).longValue();
                return null;
            } catch (SQLException e2) {
                return null;
            }
        }
    }

    private BigDecimal getBigDecimalSafely(ResultSet rs, String column) {
        try {
            return rs.getBigDecimal(column);
        } catch (SQLException e1) {
            try {
                return rs.getBigDecimal(column.toLowerCase());
            } catch (SQLException e2) {
                return null;
            }
        }
    }

    private Boolean getBooleanSafely(ResultSet rs, String column) {
        try {
            return rs.getBoolean(column);
        } catch (SQLException e1) {
            try {
                return rs.getBoolean(column.toLowerCase());
            } catch (SQLException e2) {
                return null;
            }
        }
    }

    private Integer getIntSafely(ResultSet rs, String column) {
        try {
            Object val = rs.getObject(column);
            if (val instanceof Number) return ((Number) val).intValue();
            return null;
        } catch (SQLException e1) {
            try {
                Object val = rs.getObject(column.toLowerCase());
                if (val instanceof Number) return ((Number) val).intValue();
                return null;
            } catch (SQLException e2) {
                return null;
            }
        }
    }

    private Object getObjectSafely(ResultSet rs, String column) {
        try {
            return rs.getObject(column);
        } catch (SQLException e1) {
            try {
                return rs.getObject(column.toLowerCase());
            } catch (SQLException e2) {
                return null;
            }
        }
    }
}

