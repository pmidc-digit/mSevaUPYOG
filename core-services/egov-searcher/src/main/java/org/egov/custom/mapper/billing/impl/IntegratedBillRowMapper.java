package org.egov.custom.mapper.billing.impl;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import org.egov.search.model.PropertyBasedBill;
import org.egov.search.model.Connection;
import org.egov.search.model.IntegratedBillDetail; // Using the new class
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

@Component
public class IntegratedBillRowMapper implements ResultSetExtractor<List<PropertyBasedBill>> {

    @Override
    public List<PropertyBasedBill> extractData(ResultSet rs) throws SQLException {
        Map<String, PropertyBasedBill> propertyMap = new LinkedHashMap<>();
        Map<String, Bill> billMap = new HashMap<>();
        
        // Map to hold temp lists of IntegratedBillDetail before consolidation
        Map<String, List<IntegratedBillDetail>> detailTempMap = new HashMap<>();

        while (rs.next()) {
            String propId = rs.getString("propertyId");
            String billId = rs.getString("b_id");
            String detailId = rs.getString("bd_id");

            PropertyBasedBill pBill = propertyMap.computeIfAbsent(propId, id -> {
                try { return mapProperty(rs, id); } 
                catch (SQLException e) { throw new RuntimeException(e); }
            });

            Bill bill = billMap.get(billId);
            if (bill == null && billId != null) {
                bill = mapBill(rs);
                billMap.put(billId, bill);
                
                String service = bill.getBusinessService();
                if ("WS".equalsIgnoreCase(service)) pBill.getConnection().getWaterDetails().add(bill);
                else if ("SW".equalsIgnoreCase(service)) pBill.getConnection().getSewerageDetails().add(bill);
                
                detailTempMap.put(billId, new ArrayList<>());
            }

            if (bill != null && detailId != null) {
                List<IntegratedBillDetail> tempDetails = detailTempMap.get(billId);
                
                // Find or create the detail for this specific period
                long from = rs.getLong("fromperiod");
                IntegratedBillDetail currentDetail = tempDetails.stream()
                        .filter(d -> d.getFromPeriod().equals(from))
                        .findFirst()
                        .orElse(null);

                if (currentDetail == null) {
                    currentDetail = IntegratedBillDetail.builder()
                            .fromPeriod(from)
                            .toPeriod(rs.getLong("toperiod"))
                            .build();
                    tempDetails.add(currentDetail);
                }
                
                accumulateTax(rs, currentDetail);
            }
        }

        // Consolidation: Sort and separate Charge from Arrears
        propertyMap.values().forEach(p -> {
            consolidateBills(p.getConnection().getWaterDetails(), detailTempMap);
            consolidateBills(p.getConnection().getSewerageDetails(), detailTempMap);
            
            // Re-calculate connection totals
            Connection c = p.getConnection();
            c.setTotalWaterAmount(sum(c.getWaterDetails()));
            c.setTotalSewerageAmount(sum(c.getSewerageDetails()));
            c.setPropertyTotalAmount(c.getTotalWaterAmount().add(c.getTotalSewerageAmount()));
        });

        return new ArrayList<>(propertyMap.values());
    }

    private void consolidateBills(List<Bill> bills, Map<String, List<IntegratedBillDetail>> tempMap) {
        for (Bill bill : bills) {
            List<IntegratedBillDetail> details = tempMap.get(bill.getId());
            if (details == null || details.isEmpty()) continue;

            // Sort: Newest Period First
            details.sort(Comparator.comparing(IntegratedBillDetail::getFromPeriod).reversed());

            BigDecimal arrearsSum = BigDecimal.ZERO;
            BigDecimal chargeLatest = BigDecimal.ZERO;
            BigDecimal penaltySum = BigDecimal.ZERO;
            BigDecimal interestSum = BigDecimal.ZERO;
            BigDecimal advanceSum = BigDecimal.ZERO;

            for (int i = 0; i < details.size(); i++) {
                IntegratedBillDetail d = details.get(i);
                if (i == 0) chargeLatest = d.getCharge();
                else arrearsSum = arrearsSum.add(d.getCharge());

                penaltySum = penaltySum.add(d.getPenalty());
                interestSum = interestSum.add(d.getInterest());
                advanceSum = advanceSum.add(d.getAdvance());
            }

            // Create the final flat summary detail
            IntegratedBillDetail summary = IntegratedBillDetail.builder()
                    .fromPeriod(details.get(0).getFromPeriod())
                    .toPeriod(details.get(0).getToPeriod())
                    .charge(chargeLatest)
                    .arrears(arrearsSum)
                    .penalty(penaltySum)
                    .interest(interestSum)
                    .advance(advanceSum)
                    .totalAmount(chargeLatest.add(arrearsSum).add(penaltySum).add(interestSum).subtract(advanceSum))
                    .build();

            // Set the new detail (Assuming you update your Bill class to accept List<IntegratedBillDetail>)
            bill.setIntegratedBillDetails(Collections.singletonList(summary));
            bill.setTotalAmount(summary.getTotalAmount());
        }
    }

    private void accumulateTax(ResultSet rs, IntegratedBillDetail detail) throws SQLException {
        String taxHead = rs.getString("ad_taxheadcode");
        BigDecimal amt = rs.getBigDecimal("ad_amount");
        if (amt == null) amt = BigDecimal.ZERO;

        if (taxHead.contains("_CHARGE")) detail.setCharge(detail.getCharge().add(amt));
        else if (taxHead.contains("_PENALTY")) detail.setPenalty(detail.getPenalty().add(amt));
        else if (taxHead.contains("_INTEREST")) detail.setInterest(detail.getInterest().add(amt));
        else if (taxHead.contains("_ADVANCE")) detail.setAdvance(detail.getAdvance().add(amt));
    }

    private PropertyBasedBill mapProperty(ResultSet rs, String id) throws SQLException {
        return PropertyBasedBill.builder()
                .propertyId(id)
                .tenantId(rs.getString("b_tenantid"))
                .ledgerNo(rs.getString("ledger_no")) 
                .plotSize(rs.getString("pt_plotsize"))
                .usageType(rs.getString("pt_usage"))
                .mobileNo(rs.getString("mobilenumber"))
                .locality(rs.getString("ptadd_locality"))
                .address(rs.getString("ptadd_doorNo") + ", " + rs.getString("ptadd_city"))
                .connection(Connection.builder()
                        .waterDetails(new ArrayList<>()).sewerageDetails(new ArrayList<>())
                        .totalWaterAmount(BigDecimal.ZERO).totalSewerageAmount(BigDecimal.ZERO)
                        .propertyTotalAmount(BigDecimal.ZERO).build())
                .build();
    }

    private Bill mapBill(ResultSet rs) throws SQLException {
        return Bill.builder()
                .id(rs.getString("b_id"))
                .businessService(rs.getString("bd_businessservice"))
                .consumerCode(rs.getString("bd_consumercode"))
                .billNumber(rs.getString("bd_billno"))
                .billDate(rs.getLong("bd_billdate"))
                .payerName(rs.getString("b_payername"))
                .build();
    }

    private BigDecimal sum(List<Bill> bills) {
        return bills.stream().map(Bill::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}