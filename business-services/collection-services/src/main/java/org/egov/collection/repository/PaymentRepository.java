package org.egov.collection.repository;
                                       
import static java.util.Collections.reverseOrder;
import static org.egov.collection.config.CollectionServiceConstants.KEY_FILESTOREID;
import static org.egov.collection.config.CollectionServiceConstants.KEY_ID;
import static org.egov.collection.repository.querybuilder.PaymentQueryBuilder.*;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpMethod;


import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.common.config.Config;
import org.egov.collection.model.Payment;
import org.egov.collection.model.PaymentDetail;
import org.egov.collection.model.PaymentSearchCriteria;
import org.egov.collection.repository.querybuilder.PaymentQueryBuilder;
import org.egov.collection.repository.rowmapper.BillRowMapper;
import org.egov.collection.repository.rowmapper.PaymentRowMapper;
import org.egov.collection.web.contract.Bill;
import org.egov.collection.web.contract.BillResponse;
import org.egov.collection.web.contract.PropertyDetail;
import org.egov.collection.web.contract.RoadCuttingInfo;
import org.egov.collection.web.contract.UsageCategoryInfo;
import org.egov.common.contract.request.RequestInfo;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.SingleColumnRowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.egov.collection.config.ApplicationProperties;


import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
public class PaymentRepository {


    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    private PaymentQueryBuilder paymentQueryBuilder;

    private PaymentRowMapper paymentRowMapper;
    
    private BillRowMapper billRowMapper;
    private  RestTemplate restTemplate;
    @Autowired
    private ApplicationProperties config;

    @Autowired
    public PaymentRepository(NamedParameterJdbcTemplate namedParameterJdbcTemplate, PaymentQueryBuilder paymentQueryBuilder, 
    		PaymentRowMapper paymentRowMapper, BillRowMapper billRowMapper) {
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
        this.paymentQueryBuilder = paymentQueryBuilder;
        this.paymentRowMapper = paymentRowMapper;
        this.billRowMapper = billRowMapper;
    }




    @Transactional
    public void savePayment(Payment payment){
        try {

            List<MapSqlParameterSource> paymentDetailSource = new ArrayList<>();
            List<MapSqlParameterSource> billSource = new ArrayList<>();
            List<MapSqlParameterSource> billDetailSource = new ArrayList<>();
            List<MapSqlParameterSource> billAccountDetailSource = new ArrayList<>();

            for (PaymentDetail paymentDetail : payment.getPaymentDetails()) {
                paymentDetailSource.add(getParametersForPaymentDetailCreate(payment.getId(), paymentDetail));
                billSource.add(getParamtersForBillCreate(paymentDetail.getBill()));
                paymentDetail.getBill().getBillDetails().forEach(billDetail -> {
                    billDetailSource.add(getParamtersForBillDetailCreate(billDetail));
                    billDetail.getBillAccountDetails().forEach(billAccountDetail -> {
                        billAccountDetailSource.add(getParametersForBillAccountDetailCreate(billAccountDetail));
                    });
                });

            }
            namedParameterJdbcTemplate.update(INSERT_PAYMENT_SQL, getParametersForPaymentCreate(payment));
            namedParameterJdbcTemplate.batchUpdate(INSERT_PAYMENTDETAIL_SQL, paymentDetailSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(INSERT_BILL_SQL, billSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(INSERT_BILLDETAIL_SQL, billDetailSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(INSERT_BILLACCOUNTDETAIL_SQL,  billAccountDetailSource.toArray(new MapSqlParameterSource[0]));

        }catch (Exception e){
            log.error("Failed to persist payment to database", e);
            throw new CustomException("PAYMENT_CREATION_FAILED", e.getMessage());
        }
    }


    public List<Payment> fetchPayments(PaymentSearchCriteria paymentSearchCriteria) {
        Map<String, Object> preparedStatementValues = new HashMap<>();

        
        if (paymentSearchCriteria.getBusinessService()!=null && (paymentSearchCriteria.getBusinessService().equalsIgnoreCase("WS.ONE_TIME_FEE")
        		|| paymentSearchCriteria.getBusinessService().equalsIgnoreCase("SW.ONE_TIME_FEE")
        		))
        {
        	paymentSearchCriteria.setConsumerCodes(paymentSearchCriteria.getApplicationNo());
        }
        
        List<String> ids = fetchPaymentIdsByCriteria(paymentSearchCriteria);

        if(CollectionUtils.isEmpty(ids))
            return new LinkedList<>();

        String query = paymentQueryBuilder.getPaymentSearchQuery(ids, preparedStatementValues);
        log.info("Query: " + query);
        log.info("preparedStatementValues: " + preparedStatementValues);
        List<Payment> payments = namedParameterJdbcTemplate.query(query, preparedStatementValues, paymentRowMapper);
        if (!CollectionUtils.isEmpty(payments)) {
            Set<String> billIds = new HashSet<>();
            for (Payment payment : payments) {
                billIds.addAll(payment.getPaymentDetails().stream().map(detail -> detail.getBillId()).collect(Collectors.toSet()));
            }
            Map<String, Bill> billMap = getBills(billIds);
            for (Payment payment : payments) {
                payment.getPaymentDetails().forEach(detail -> {
                    detail.setBill(billMap.get(detail.getBillId()));
                });
            }
            payments.sort(reverseOrder(Comparator.comparingLong(Payment::getTransactionDate)));
        }

        return payments;
    }
    
    public Long getPaymentsCount (String tenantId, String businessService) {
    	
    	Map<String, Object> preparedStatementValues = new HashMap<>();
    	String query = paymentQueryBuilder.getPaymentCountQuery(tenantId, businessService, preparedStatementValues);
    	return namedParameterJdbcTemplate.queryForObject(query, preparedStatementValues, Long.class);
    }

    public List<Payment> fetchPaymentsForPlainSearch(PaymentSearchCriteria paymentSearchCriteria) {
        Map<String, Object> preparedStatementValues = new HashMap<>();
        String query = paymentQueryBuilder.getPaymentSearchQueryForPlainSearch(paymentSearchCriteria, preparedStatementValues);
        log.info("Query: " + query);
        log.info("preparedStatementValues: " + preparedStatementValues);
        List<Payment> payments = namedParameterJdbcTemplate.query(query, preparedStatementValues, paymentRowMapper);
        if (!CollectionUtils.isEmpty(payments)) {
            Set<String> billIds = new HashSet<>();
            for (Payment payment : payments) {
                billIds.addAll(payment.getPaymentDetails().stream().map(detail -> detail.getBillId()).collect(Collectors.toSet()));
            }
            Map<String, Bill> billMap = getBills(billIds);
            for (Payment payment : payments) {
                payment.getPaymentDetails().forEach(detail -> {
                    detail.setBill(billMap.get(detail.getBillId()));
                });
            }
            payments.sort(reverseOrder(Comparator.comparingLong(Payment::getTransactionDate)));
        }

        return payments;
    }


    
    private Map<String, Bill> getBills(Set<String> ids){
    	Map<String, Bill> mapOfIdAndBills = new HashMap<>();
        Map<String, Object> preparedStatementValues = new HashMap<>();
        preparedStatementValues.put("id", ids);
        String query = paymentQueryBuilder.getBillQuery();
        List<Bill> bills = namedParameterJdbcTemplate.query(query, preparedStatementValues, billRowMapper);
        bills.forEach(bill -> {
        	mapOfIdAndBills.put(bill.getId(), bill);
        });
        
        return mapOfIdAndBills;

    }



    public void updateStatus(List<Payment> payments){
        List<MapSqlParameterSource> paymentSource = new ArrayList<>();
        List<MapSqlParameterSource> paymentDetailSource = new ArrayList<>();
        List<MapSqlParameterSource> billSource = new ArrayList<>();
        try {

            for(Payment payment : payments){
                paymentSource.add(getParametersForPaymentStatusUpdate(payment));
                for (PaymentDetail paymentDetail : payment.getPaymentDetails()) {
                    paymentDetailSource.add(getParametersForPaymentDetailStatusUpdate(paymentDetail));
                    billSource.add(getParamtersForBillStatusUpdate(paymentDetail.getBill()));
                }
            }

            namedParameterJdbcTemplate.batchUpdate(COPY_PAYMENT_SQL, paymentSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(COPY_PAYMENTDETAIL_SQL, paymentDetailSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(COPY_BILL_SQL, billSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(STATUS_UPDATE_PAYMENT_SQL, paymentSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(STATUS_UPDATE_PAYMENTDETAIL_SQL, paymentDetailSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(STATUS_UPDATE_BILL_SQL, billSource.toArray(new MapSqlParameterSource[0]));
        }
        catch(Exception e){
            log.error("Failed to persist cancel Receipt to database", e);
            throw new CustomException("CANCEL_RECEIPT_FAILED", "Unable to cancel Receipt");
        }
    }


    public void updatePayment(List<Payment> payments){
        List<MapSqlParameterSource> paymentSource = new ArrayList<>();
        List<MapSqlParameterSource> paymentDetailSource = new ArrayList<>();
        List<MapSqlParameterSource> billSource = new ArrayList<>();
        List<MapSqlParameterSource> billDetailSource = new ArrayList<>();

        try {

            for (Payment payment : payments) {
                paymentSource.add(getParametersForPaymentUpdate(payment));
                payment.getPaymentDetails().forEach(paymentDetail -> {
                    paymentDetailSource.add(getParametersForPaymentDetailUpdate(paymentDetail));
                    billSource.add(getParamtersForBillUpdate(paymentDetail.getBill()));

                    paymentDetail.getBill().getBillDetails().forEach(billDetail -> {
                        billDetailSource.add(getParamtersForBillDetailUpdate(billDetail));
                    });

                });
            }
            namedParameterJdbcTemplate.batchUpdate(UPDATE_PAYMENT_SQL, paymentSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(UPDATE_PAYMENTDETAIL_SQL, paymentDetailSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(UPDATE_BILL_SQL, billSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(UPDATE_BILLDETAIL_SQL, billDetailSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(COPY_PAYMENT_SQL, paymentSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(COPY_PAYMENTDETAIL_SQL, paymentDetailSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(COPY_BILL_SQL, billSource.toArray(new MapSqlParameterSource[0]));
            namedParameterJdbcTemplate.batchUpdate(COPY_BILLDETAIL_SQL, billDetailSource.toArray(new MapSqlParameterSource[0]));
        }catch (Exception e){
            log.error("Failed to update receipt to database", e);
            throw new CustomException("RECEIPT_UPDATION_FAILED", "Unable to update receipt");
        }
    }


    public void updateFileStoreId(List<Map<String,String>> idToFileStoreIdMaps){

        List<MapSqlParameterSource> fileStoreIdSource = new ArrayList<>();

        idToFileStoreIdMaps.forEach(map -> {
            MapSqlParameterSource sqlParameterSource = new MapSqlParameterSource();
            sqlParameterSource.addValue("id",map.get(KEY_ID));
            sqlParameterSource.addValue("filestoreid",map.get(KEY_FILESTOREID));
            fileStoreIdSource.add(sqlParameterSource);
        });

        namedParameterJdbcTemplate.batchUpdate(FILESTOREID_UPDATE_PAYMENT_SQL,fileStoreIdSource.toArray(new MapSqlParameterSource[0]));

    }

    public void updateFileStoreIdToNull(Payment payment){

     
      List<MapSqlParameterSource> fileStoreIdSource = new ArrayList<>();
	  
      MapSqlParameterSource sqlParameterSource = new MapSqlParameterSource();
      sqlParameterSource.addValue("id",payment.getId());
      fileStoreIdSource.add(sqlParameterSource);

      namedParameterJdbcTemplate.batchUpdate(FILESTOREID_UPDATE_NULL_PAYMENT_SQL,fileStoreIdSource.toArray(new MapSqlParameterSource[0]));

    }

    public List<String> fetchPaymentIds(PaymentSearchCriteria paymentSearchCriteria) {

    	StringBuilder query = new StringBuilder("SELECT id from egcl_payment ");
    	boolean whereCluaseApplied= false ;
    	boolean isTenantPresent= true ;
        Map<String, Object> preparedStatementValues = new HashMap<>();
        preparedStatementValues.put("offset", paymentSearchCriteria.getOffset());
        preparedStatementValues.put("limit", paymentSearchCriteria.getLimit());
        if(paymentSearchCriteria.getTenantId() != null && !paymentSearchCriteria.getTenantId().equals("pb")) {
            query.append(" WHERE tenantid=:tenantid ");
            preparedStatementValues.put("tenantid", paymentSearchCriteria.getTenantId());
            whereCluaseApplied=true;
        }else {
        	isTenantPresent = false;
		whereCluaseApplied=false;
        	query.append(" WHERE id in (select paymentid from egcl_paymentdetail WHERE createdtime between :fromDate and :toDate) ");
        	preparedStatementValues.put("fromDate", paymentSearchCriteria.getFromDate());
                preparedStatementValues.put("toDate", paymentSearchCriteria.getToDate());
        } 
        
        if(paymentSearchCriteria.getBusinessServices() != null && isTenantPresent && whereCluaseApplied) {
        	if(whereCluaseApplied) {
            	query.append(" AND id in (select paymentid from egcl_paymentdetail where tenantid=:tenantid AND businessservice=:businessservice) ");
                preparedStatementValues.put("tenantid", paymentSearchCriteria.getTenantId());
                preparedStatementValues.put("businessservice", paymentSearchCriteria.getBusinessServices());

        	}
        }
        
        if(paymentSearchCriteria.getBusinessService() != null && isTenantPresent && whereCluaseApplied) {
            log.info("In side the repo before query: " + paymentSearchCriteria.getBusinessService() );
           query.append(" AND id in (select paymentid from egcl_paymentdetail where tenantid=:tenantid AND businessservice=:businessservice) ");
            preparedStatementValues.put("tenantid", paymentSearchCriteria.getTenantId());
            preparedStatementValues.put("businessservice", paymentSearchCriteria.getBusinessService());
        }
        
        if(paymentSearchCriteria.getFromDate() != null && isTenantPresent && whereCluaseApplied) {
          log.info("In side the repo before query: " + paymentSearchCriteria.getBusinessService() );
           query.append("  AND  createdtime between :fromDate and :toDate");
           preparedStatementValues.put("fromDate", paymentSearchCriteria.getFromDate());
           preparedStatementValues.put("toDate", paymentSearchCriteria.getToDate());

       }
     
        
        query.append(" ORDER BY createdtime offset " + ":offset " + "limit :limit"); 
        
        log.info("fetchPaymentIds query: " + query.toString() );
        return namedParameterJdbcTemplate.query(query.toString(), preparedStatementValues, new SingleColumnRowMapper<>(String.class));

    }

		
    public List<String> fetchPaymentIdsByCriteria(PaymentSearchCriteria paymentSearchCriteria) {
        Map<String, Object> preparedStatementValues = new HashMap<>();
        String query = paymentQueryBuilder.getIdQuery(paymentSearchCriteria, preparedStatementValues);
        log.info(query);
        log.info(preparedStatementValues.toString());
        return namedParameterJdbcTemplate.query(query, preparedStatementValues, new SingleColumnRowMapper<>(String.class));
	}

	
    public PropertyDetail fetchPropertyDetail(String consumerCode, String businessservice) {
        PropertyDetail propertyDetail = new PropertyDetail();

        ObjectMapper objectMapper = new ObjectMapper();
        List<String> oldConnectionno = fetchOldConnectionNo(consumerCode, businessservice);
        List<String> plotSize = fetchLandArea(consumerCode, businessservice);
        List<String> usageCategory = fetchUsageCategory(consumerCode, businessservice);
        List<String> propertyid = fetchpropertyid(consumerCode, businessservice);
        List<String> address = fetchadresss(consumerCode, businessservice);
        Set<String> consumerCodeSet = Collections.singleton(consumerCode);

        List<String> additional = adddetails(consumerCodeSet,null, businessservice);
        List<String> meterdetails = meterInstallmentDate(consumerCodeSet,null, businessservice);
        List<String> meterid = meterId(consumerCodeSet,null, businessservice);
        String meterMake = null;
        String averageMeterReading = null;
        String initialMeterReading = null;

        if (additional != null && !additional.isEmpty()) {
            for (String jsonString : additional) {
                try {
                    Map<String, String> map = objectMapper.readValue(jsonString, new TypeReference<Map<String, String>>() {});
                    meterMake = map.getOrDefault("meterMake", "No Meter Make Found");
                    averageMeterReading = map.getOrDefault("avarageMeterReading", "No avarageMeterReading Found");
                    initialMeterReading = map.getOrDefault("initialMeterReading", "No initialMeterReading Found");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        propertyDetail.setOldConnectionNo(!oldConnectionno.isEmpty() ? oldConnectionno.get(0) : "No oldConnectionno Found");
        propertyDetail.setPlotSize(!plotSize.isEmpty() && !StringUtils.isBlank(plotSize.get(0)) ? plotSize.get(0) : "No plotSize Found");
        propertyDetail.setUsageCategory(!usageCategory.isEmpty() && !StringUtils.isBlank(usageCategory.get(0)) ? usageCategory.get(0) : "No usageCategory present");
        propertyDetail.setPropertyId(!propertyid.isEmpty() && !StringUtils.isBlank(propertyid.get(0)) ? propertyid.get(0) : "No propertyid present");
        propertyDetail.setAddress(!address.isEmpty() && !StringUtils.isBlank(address.get(0)) ? address.get(0) : "No address present");
        propertyDetail.setMeterDetails(!meterdetails.isEmpty() && !StringUtils.isBlank(meterdetails.get(0)) ? meterdetails.get(0) : "No meterdetails present");
        propertyDetail.setMeterId(!meterid.isEmpty() && !StringUtils.isBlank(meterid.get(0)) ? meterid.get(0) : "No meterid present");

        propertyDetail.setMeterMake(meterMake);
        propertyDetail.setAverageMeterReading(averageMeterReading);
        propertyDetail.setInitialMeterReading(initialMeterReading);

        return propertyDetail;
    }
	
	
	public List<String> fetchOldConnectionNo(String consumerCode, String businessservice) {
		List<String> res = new ArrayList<>();
		String queryString = "";
		Boolean Isapp = false;
		if (consumerCode.contains("WS_AP"))
			Isapp = true;
		if (Isapp) {
			if (businessservice.equals("WS")) {

				queryString = "select oldconnectionno from eg_ws_connection where applicationno='" + consumerCode + "'";
			} else {
				queryString = "select oldconnectionno from eg_sw_connection where applicationno='" + consumerCode + "'";

			}
		} else {
			if (businessservice.equals("WS")) {

				queryString = "select oldconnectionno from eg_ws_connection where connectionno='" + consumerCode + "'";
			} else {
				queryString = "select oldconnectionno from eg_sw_connection where connectionno='" + consumerCode + "'";

			}
		}
		log.info("Query: " + queryString);
		try {
			// res = jdbcTemplate.queryForList(queryString, String.class);
			res = namedParameterJdbcTemplate.query(queryString, new SingleColumnRowMapper<>(String.class));
		} catch (Exception ex) {
			log.error("Exception while reading bill scheduler status" + ex.getMessage());
		}
		return res;
	}
	
	public List<String> fetchLandArea(String consumerCode, String businessservice) {
		List<String> res = new ArrayList<>();
		Map<String, Object> preparedStatementValues = new HashMap<>();
		String queryString = "";
		Boolean Isapp = false;
		if (consumerCode.contains("WS_AP"))
			Isapp = true;
		if (Isapp) {
			if (businessservice.equals("WS")) {
				queryString = "select a2.landarea from eg_ws_connection a1 inner join eg_pt_property a2 on a1.property_id= a2.propertyid"
						+ " where a1.applicationno = '" + consumerCode + "'"
						+ " and a1.status='Active'"
						+ " and a2.status='ACTIVE';";
			} else {
				queryString = "select a2.landarea from eg_sw_connection a1 inner join eg_pt_property a2 on a1.property_id= a2.propertyid"
						+ " where a1.applicationno = '" + consumerCode + "'"
						+ " and a1.status='Active'"
						+ " and a2.status='ACTIVE';";
			}
		} else {
			if (businessservice.equals("WS")) {
				queryString = "select a2.landarea from eg_ws_connection a1 inner join eg_pt_property a2 on a1.property_id= a2.propertyid"
						+ " where a1.connectionno = '" + consumerCode + "'"
						+ " and a1.status='Active'"
						+ " and a2.status='ACTIVE';";
			} else {
				queryString = "select a2.landarea from eg_sw_connection a1 inner join eg_pt_property a2 on a1.property_id= a2.propertyid"
						+ " where a1.connectionno = '" + consumerCode + "'"
						+ " and a1.status='Active'"
						+ " and a2.status='ACTIVE';";
			}
		}
		log.info("Query: " + queryString);
		try {
			// res = jdbcTemplate.queryForList(queryString, String.class);
			res = namedParameterJdbcTemplate.query(queryString, preparedStatementValues,
					new SingleColumnRowMapper<>(String.class));
		} catch (Exception ex) {
			log.error("Exception while reading bill scheduler status" + ex.getMessage());
		}
		return res;
	}
	
	
	
	public List<String> fetchUsageCategory(String consumerCode,String businessservice) {
		List<String> res = new ArrayList<>();
		Map<String, Object> preparedStatementValues = new HashMap<>();
		 String queryString = "";  // Declare queryString outside the if-else block
			Boolean Isapp=false;
			if (consumerCode.contains("WS_AP") || consumerCode.contains("SW_AP"))
				Isapp=true;
	if (Isapp) {
	    if(businessservice.equals("WS")) {
		 queryString = "select a2.usagecategory from eg_ws_connection a1 inner join eg_pt_property a2 on a1.property_id= a2.propertyid"
				+ " where a1.applicationno = '"+consumerCode+"'"
				+ " and a2.status='ACTIVE';";
	    }else {
	    	 queryString = "select a2.usagecategory from eg_sw_connection a1 inner join eg_pt_property a2 on a1.property_id= a2.propertyid"
	 				+ " where a1.applicationno = '"+consumerCode+"'"
	 				+ " and a2.status='ACTIVE';";
	    }
	}
	else
	{
		  if(businessservice.equals("WS")) {
				 queryString = "select a2.usagecategory from eg_ws_connection a1 inner join eg_pt_property a2 on a1.property_id= a2.propertyid"
						+ " where a1.connectionno = '"+consumerCode+"'"
						+ " and a2.status='ACTIVE';";
			    }else {
			    	 queryString = "select a2.usagecategory from eg_sw_connection a1 inner join eg_pt_property a2 on a1.property_id= a2.propertyid"
			 				+ " where a1.connectionno = '"+consumerCode+"'"
			 				+ " and a2.status='ACTIVE';";
			    }	
	}
		log.info("Query: " +queryString);
		try {
		//	res = jdbcTemplate.queryForList(queryString, String.class);
			res = namedParameterJdbcTemplate.query(queryString, preparedStatementValues, new SingleColumnRowMapper<>(String.class));
		} catch (Exception ex) {
			log.error("Exception while reading bill scheduler status" + ex.getMessage());
		}
		return res;
	}

	public List<String> fetchpropertyid(String consumerCode,String businessservice) {
		List<String> res = new ArrayList<>();
		Map<String, Object> preparedStatementValues = new HashMap<>();
		 String queryString = "";  // Declare queryString outside the if-else block
			Boolean Isapp=false;
			if (consumerCode.contains("WS_AP") || consumerCode.contains("SW_AP")) 
				Isapp=true;
	if (Isapp) {
	    if(businessservice.equals("WS")) {
		 queryString = "select a2.propertyid from eg_ws_connection a1 inner join eg_pt_property a2 on a1.property_id= a2.propertyid"
				+ " where a1.applicationno = '"+consumerCode+"'"
				+ " and a2.status='ACTIVE';";
	    }else {
	    	 queryString = "select a2.propertyid from eg_sw_connection a1 inner join eg_pt_property a2 on a1.property_id= a2.propertyid"
	 				+ " where a1.applicationno = '"+consumerCode+"'"
	 				+ " and a2.status='ACTIVE';";
	    }}
	else {
		 if(businessservice.equals("WS")) {
			 queryString = "select a2.propertyid from eg_ws_connection a1 inner join eg_pt_property a2 on a1.property_id= a2.propertyid"
					+ " where a1.connectionno = '"+consumerCode+"'"
					+ " and a2.status='ACTIVE';";
		    }else {
		    	 queryString = "select a2.propertyid from eg_sw_connection a1 inner join eg_pt_property a2 on a1.property_id= a2.propertyid"
		 				+ " where a1.connectionno = '"+consumerCode+"'"
		 				+ " and a2.status='ACTIVE';";
		    }
		
	}
		log.info("Query: " +queryString);
		try {
		//	res = jdbcTemplate.queryForList(queryString, String.class);
			res = namedParameterJdbcTemplate.query(queryString, preparedStatementValues, new SingleColumnRowMapper<>(String.class));
		} catch (Exception ex) {
			log.error("Exception while reading bill scheduler status" + ex.getMessage());
		}
		return res;
	}
	public List<String> fetchadresss(String consumerCode,String businessservice) {
		List<String> res = new ArrayList<>();
		Map<String, Object> preparedStatementValues = new HashMap<>();
		 String queryString = "";  // Declare queryString outside the if-else block
			Boolean Isapp=false;
			if (consumerCode.contains("WS_AP") || consumerCode.contains("SW_AP")) 
				Isapp=true;
	if (Isapp)
	{
	    if(businessservice.equals("WS")) {
	    	 queryString = "select CONCAT(doorno,'.',buildingname,'.',city) as address from eg_ws_connection a1 "
	 				+ " inner join eg_pt_property a2 on a1.property_id = a2.propertyid "
	 				+ " inner join eg_pt_address a3 on a2.id=a3.propertyid "
	 				+ " where a1.applicationno='"+consumerCode+"'"
	 				+ " and a2.status='ACTIVE';";
	 			       
	    }else {               
	    	queryString = "select CONCAT(doorno,'.',buildingname,'.',city) as address from eg_sw_connection a1 "
					+ " inner join eg_pt_property a2 on a1.property_id = a2.propertyid "
					+ " inner join eg_pt_address a3 on a2.id=a3.propertyid "
					+ " where a1.applicationno='"+consumerCode+"'"
					+ " and a2.status='ACTIVE';";
				       
	    }
	    }
	else {
		 if(businessservice.equals("WS")) {
			 queryString = "select CONCAT(doorno,'.',buildingname,'.',city) as address from eg_ws_connection a1 "
						+ " inner join eg_pt_property a2 on a1.property_id = a2.propertyid "
						+ " inner join eg_pt_address a3 on a2.id=a3.propertyid "
						+ " where a1.connectionno='"+consumerCode+"';"
						+ " and a2.status='ACTIVE';";
					       
		    }else {
		    	queryString = "select   CONCAT(doorno,'.',buildingname,'.',city) as address from eg_sw_connection a1 "
						+ " inner join eg_pt_property a2 on a1.property_id = a2.propertyid "
						+ " inner join eg_pt_address a3 on a2.id=a3.propertyid "
						+ " where a1.connectionno='"+consumerCode+"';"
						+ " and a2.status='ACTIVE';";
					     
		    }
		
	}
		log.info("Query: " +queryString);
		try {
		//	res = jdbcTemplate.queryForList(queryString, String.class);
			res = namedParameterJdbcTemplate.query(queryString, preparedStatementValues, new SingleColumnRowMapper<>(String.class));
		} catch (Exception ex) {
			log.error("Exception while reading bill scheduler status" + ex.getMessage());
		}
		return res;
	}



	
    
	public List<String> fetchUsageCategoryByApplicationno(Set<String> consumerCodes) {
		List<String> res = new ArrayList<>();
		String consumercode = null;
		 Iterator<String> iterate = consumerCodes.iterator();
		 while(iterate.hasNext()) {
			    consumercode =   iterate.next();			  
		}		
		Map<String, Object> preparedStatementValues = new HashMap<>();
		String queryString;
		if (consumercode.contains("WS_AP")) {
		    queryString = "select a2.usagecategory from eg_ws_connection a1 "
				+ " inner join eg_pt_property a2 on a1.property_id = a2.propertyid "
				+ " inner join eg_pt_address a3 on a2.id=a3.propertyid "
				+ " where a1.applicationno='"+consumercode+"'"
			        + " and a2.status='ACTIVE';";
		log.info("Query for fetchPaymentIdsByCriteria: " +queryString);
		} else {
			queryString = "select a2.usagecategory from eg_sw_connection a1 "
					+ " inner join eg_pt_property a2 on a1.property_id = a2.propertyid "
					+ " inner join eg_pt_address a3 on a2.id=a3.propertyid "
					+ " where a1.applicationno='"+consumercode+"'"
				        + " and a2.status='ACTIVE';";
			log.info("Query for fetchPaymentIdsByCriteria: " +queryString);
		}
		try {
			res = namedParameterJdbcTemplate.query(queryString, preparedStatementValues, new SingleColumnRowMapper<>(String.class));
		} catch (Exception ex) {
			log.error("Exception while reading usage category" + ex.getMessage());
		}
		return res;
	}
	public List<String> fetchAddressByApplicationno(Set<String> consumerCodes) {
		List<String> res = new ArrayList<>();
		String consumercode = null;
		 Iterator<String> iterate = consumerCodes.iterator();
		 while(iterate.hasNext()) {
			    consumercode =   iterate.next();			  
		}
		Map<String, Object> preparedStatementValues = new HashMap<>();
		String queryString;
		if (consumercode.contains("WS_AP")) {
		 queryString = "select CONCAT(doorno,buildingname,city) as address from eg_ws_connection a1 "
				+ " inner join eg_pt_property a2 on a1.property_id = a2.propertyid "
				+ " inner join eg_pt_address a3 on a2.id=a3.propertyid "
				+ " where a1.applicationno='"+consumercode+"'"
			        + " and a2.status='ACTIVE';";
		log.info("Query for fetchAddressByApplicationno: " +queryString);
		}
		else {
			 queryString = "select CONCAT(doorno,buildingname,city) as address from eg_sw_connection a1 "
						+ " inner join eg_pt_property a2 on a1.property_id = a2.propertyid "
						+ " inner join eg_pt_address a3 on a2.id=a3.propertyid "
						+ " where a1.applicationno='"+consumercode+"'"
				                + " and a2.status='ACTIVE';";
				log.info("Query for fetchAddressByApplicationno: " +queryString);
		}
		try {
			res = namedParameterJdbcTemplate.query(queryString, preparedStatementValues, new SingleColumnRowMapper<>(String.class));
		} catch (Exception ex) {
			log.error("Exception while reading usage category" + ex.getMessage());
		}
		return res;
	}


	//RECE
	
	
	public List<RoadCuttingInfo> fetchRoadCuttingInfo(Set<String> consumerCodes, Set<String> applicationNumbers, String businessService) {
	    List<RoadCuttingInfo> res = new ArrayList<>();
	    Map<String, Object> preparedStatementValues = new HashMap<>();
	    StringBuilder queryString = new StringBuilder("SELECT road.* ");

	    // Determine the correct table based on the businessService
	    if (businessService.contains("WS")) {
	        queryString.append("FROM eg_ws_connection as ws ");
	    } else {
	        queryString.append("FROM eg_sw_connection as ws "); // Adjust if there's a corresponding road cutting table for SW
	    }

	    queryString.append("JOIN eg_ws_roadcuttinginfo as road ON ws.id = road.wsid ")
	               .append("WHERE ws.status = 'Active'");

	    // Add condition for consumer codes if present
	    if (!CollectionUtils.isEmpty(consumerCodes)) {
	        queryString.append(" AND ws.connectionno IN (:consumerCodes)");
	        preparedStatementValues.put("consumerCodes", consumerCodes);
	    }

	    // Add condition for application numbers if present
	    if (!CollectionUtils.isEmpty(applicationNumbers)) {
	        queryString.append(" AND ws.applicationno IN (:applicationNumbers)");
	        preparedStatementValues.put("applicationNumbers", applicationNumbers);
	    }

	    // Log the final query string for debugging
	    log.info("Query for fetchRoadCuttingInfo: " + queryString);

	    try {
	        res = namedParameterJdbcTemplate.query(queryString.toString(), preparedStatementValues, new BeanPropertyRowMapper<>(RoadCuttingInfo.class));
	    } catch (Exception ex) {
	        log.error("Exception while fetching road cutting info: " + ex.getMessage(), ex);
	    }

	    return res;
	}


	public List<UsageCategoryInfo> fetchUsageCategoryByApplicationnos(Set<String> consumerCodes, Set<String> applicationNumbers, String businessService) {
	    List<UsageCategoryInfo> res = new ArrayList<>();
	    StringBuilder queryString = new StringBuilder("SELECT a2.usagecategory, a2.propertyid, a2.landarea FROM ");

	    // Determine the correct table based on the businessService
	    if (businessService.contains("WS")) {
	        queryString.append("eg_ws_connection a1 ");
	    } else {
	        queryString.append("eg_sw_connection a1 ");
	    }

	    queryString.append("INNER JOIN eg_pt_property a2 ON a1.property_id = a2.propertyid WHERE a1.status = 'Active' and a2.status='ACTIVE' ");

	    // Prepare parameters using MapSqlParameterSource
	    MapSqlParameterSource preparedStatementValues = new MapSqlParameterSource();

	    // Adding conditions dynamically for consumer codes
	    if (!CollectionUtils.isEmpty(consumerCodes)) {
	        queryString.append(" AND a1.connectionno IN (:consumerCodes)");
	        preparedStatementValues.addValue("consumerCodes", consumerCodes);
	    }

	    // Adding conditions dynamically for application numbers
	    if (!CollectionUtils.isEmpty(applicationNumbers)) {
	        queryString.append(" AND a1.applicationno IN (:applicationNumbers)");
	        preparedStatementValues.addValue("applicationNumbers", applicationNumbers);
	    }

	    queryString.append(" GROUP BY a2.usagecategory, a2.propertyid, a2.landarea");

	    // Log the final query string for debugging
	    log.info("Query for fetchUsageCategoryByApplicationnos: " + queryString);

	    try {
	        // Use BeanPropertyRowMapper to map result set to UsageCategoryInfo
	        res = namedParameterJdbcTemplate.query(queryString.toString(), preparedStatementValues, new BeanPropertyRowMapper<>(UsageCategoryInfo.class));
	    } catch (Exception ex) {
	        log.error("Exception while reading usage category: " + ex.getMessage(), ex);
	    }

	    return res;
	}
	
	
	public List<String> fetchlandareaByApplicationnos(Set<String> consumerCodes, Set<String> applicationNumbers, String businessService) {
	    List<String> res = new ArrayList<>();
	    Map<String, Object> preparedStatementValues = new HashMap<>();
	    StringBuilder queryString = new StringBuilder("SELECT a2.landarea FROM ");

	    // Determine the correct table based on the businessService
	    if (businessService.contains("WS")) {
	        queryString.append("eg_ws_connection a1 ");
	    } else {
	        queryString.append("eg_sw_connection a1 ");
	    }

	    queryString.append("INNER JOIN eg_pt_property a2 ON a1.property_id = a2.propertyid WHERE a1.status = 'Active' and a2.status='ACTIVE' ");

	    // Adding conditions dynamically for consumer codes
	    if (!CollectionUtils.isEmpty(consumerCodes)) {
	        queryString.append(" AND a1.connectionno IN (:consumerCodes)");
	        preparedStatementValues.put("consumerCodes", consumerCodes);
	    }

	    // Adding conditions dynamically for application numbers
	    if (!CollectionUtils.isEmpty(applicationNumbers)) {
	        queryString.append(" AND a1.applicationno IN (:applicationNumbers)");
	        preparedStatementValues.put("applicationNumbers", applicationNumbers);
	    }
	    queryString.append(" GROUP BY a2.landarea");

	    // Log the final query string for debugging
	    log.info("Query for fetchUsageCategoryByApplicationnos: " + queryString);

	    try {
	        res = namedParameterJdbcTemplate.query(queryString.toString(), preparedStatementValues, new SingleColumnRowMapper<>(String.class));
	    } catch (Exception ex) {
	        log.error("Exception while reading usage category: " + ex.getMessage(), ex);
	    }

	    return res;
	}
	
	public List<String> fetchAddressByApplicationnos(Set<String> consumerCodes, Set<String> applicationNumbers, String businessService) {
	    List<String> res = new ArrayList<>();
	    Map<String, Object> preparedStatementValues = new HashMap<>();
	    StringBuilder queryString = new StringBuilder("SELECT CONCAT(a3.doorno, ',', a3.plotno, ',', a3.buildingname, ',', a3.street, ',', a3.landmark, ',', a3.district, ',', a3.region, ',', a3.city) ");

	    // Determine the correct table based on the businessService
	    if (businessService.contains("WS")) {
	        queryString.append("FROM eg_ws_connection a1 ");
	    } else {
	        queryString.append("FROM eg_sw_connection a1 ");
	    }

	    queryString.append("INNER JOIN eg_pt_property a2 ON a1.property_id = a2.propertyid ")
	               .append("INNER JOIN eg_pt_address a3 ON a2.id = a3.propertyid ")
	               .append("WHERE a1.status = 'Active'")
	               .append(" AND a2.status = 'ACTIVE'");

	    // Add condition for consumer codes if present
	    if (!CollectionUtils.isEmpty(consumerCodes)) {
	        queryString.append(" AND a1.connectionno IN (:consumerCodes)");
	        preparedStatementValues.put("consumerCodes", consumerCodes);
	    }

	    // Add condition for application numbers if present
	    if (!CollectionUtils.isEmpty(applicationNumbers)) {
	        queryString.append(" AND a1.applicationno IN (:applicationNumbers)");
	        preparedStatementValues.put("applicationNumbers", applicationNumbers);
	    }

	    // Add GROUP BY clause to include all concatenated fields
	    queryString.append(" GROUP BY a3.doorno, a3.plotno, a3.buildingname, a3.street, a3.landmark, a3.district, a3.region, a3.city, a3.propertyid"); 

	    // Log the final query string for debugging
	    log.info("Query for fetchAddressByApplicationnos: " + queryString);

	    try {
	        res = namedParameterJdbcTemplate.query(queryString.toString(), preparedStatementValues, new SingleColumnRowMapper<>(String.class));
	    } catch (Exception ex) {
	        log.error("Exception while reading address: " + ex.getMessage(), ex);
	    }

	    return res;
	}


	// for propertyid//
	
	public List<String> fetchPropertyid(Set<String> consumerCodes, Set<String> applicationNumbers, String businessService) {
	    List<String> res = new ArrayList<>();
	    Map<String, Object> preparedStatementValues = new HashMap<>();
	    StringBuilder queryString = new StringBuilder("SELECT a1.property_id ");

	    // Determine the correct table based on the businessService
	    if (businessService.contains("WS")) {
	        queryString.append("FROM eg_ws_connection a1 ");
	    } else {
	        queryString.append("FROM eg_sw_connection a1 ");
	    }

	    queryString.append("INNER JOIN eg_pt_property a2 ON a1.property_id = a2.propertyid ")
	               .append("WHERE a1.status = 'Active'")
	               .append(" AND a2.status = 'ACTIVE'");

	    // Add condition for consumer codes if present
	    if (!CollectionUtils.isEmpty(consumerCodes)) {
	        queryString.append(" AND a1.connectionno IN (:consumerCodes)");
	        preparedStatementValues.put("consumerCodes", consumerCodes);
	    }

	    // Add condition for application numbers if present
	    if (!CollectionUtils.isEmpty(applicationNumbers)) {
	        queryString.append(" AND a1.applicationno IN (:applicationNumbers)");
	        preparedStatementValues.put("applicationNumbers", applicationNumbers);
	    }

	    // Add GROUP BY clause to ensure unique property IDs
	    queryString.append(" GROUP BY a1.property_id");  // Assuming property_id is the appropriate grouping column

	    // Log the final query string for debugging
	    log.info("Query for fetchPropertyid: " + queryString);

	    try {
	        res = namedParameterJdbcTemplate.query(queryString.toString(), preparedStatementValues, new SingleColumnRowMapper<>(String.class));
	    } catch (Exception ex) {
	        log.error("Exception while reading property IDs: " + ex.getMessage(), ex);
	    }

	    return res;
	}


	
	public List<String> adddetails(Set<String> consumerCodes, Set<String> applicationNumbers, String businessService) {
	    List<String> res = new ArrayList<>();
	    Map<String, Object> preparedStatementValues = new HashMap<>();
	    StringBuilder queryString = new StringBuilder("SELECT a1.additionaldetails ");

	    // Determine the correct table based on the businessService
	    if (businessService.contains("WS")) {
	        queryString.append("FROM eg_ws_connection a1 ");
	    } else {
	        queryString.append("FROM eg_sw_connection a1 ");
	    }

	    queryString.append("WHERE 1=1");

	    // Add condition for consumer codes if present
	    if (!CollectionUtils.isEmpty(consumerCodes)) {
	        queryString.append(" AND a1.connectionno IN (:consumerCodes)");
	        preparedStatementValues.put("consumerCodes", consumerCodes);
	    }

	    // Add condition for application numbers if present
	    if (!CollectionUtils.isEmpty(applicationNumbers)) {
	        queryString.append(" AND a1.applicationno IN (:applicationNumbers)");
	        preparedStatementValues.put("applicationNumbers", applicationNumbers);
	    }

	    // Log the final query string for debugging
	    log.info("Query for adddetails: " + queryString);

	    try {
	        res = namedParameterJdbcTemplate.query(queryString.toString(), preparedStatementValues, new SingleColumnRowMapper<>(String.class));
	    } catch (Exception ex) {
	        log.error("Exception while reading additional details: " + ex.getMessage(), ex);
	    }

	    return res;
	}

	
	
	
	
	
	
	public List<String> meterInstallmentDate(Set<String> consumerCodes, Set<String> applicationNumbers, String businessService) {
	    List<String> res = new ArrayList<>();
	    Map<String, Object> preparedStatementValues = new HashMap<>();
	    StringBuilder queryString = new StringBuilder("SELECT a2.meterinstallationdate ");

	    // Determine the correct table based on the businessService
	    if (businessService.contains("WS")) {
	        queryString.append("FROM eg_ws_connection a1 ");
	    } else {
	        queryString.append("FROM eg_sw_connection a1 ");
	    }

	    queryString.append("INNER JOIN eg_ws_service a2 ON a1.id = a2.connection_id ")
	               .append("WHERE 1=1");

	    // Add condition for consumer codes if present
	    if (!CollectionUtils.isEmpty(consumerCodes)) {
	        queryString.append(" AND a1.connectionno IN (:consumerCodes)");
	        preparedStatementValues.put("consumerCodes", consumerCodes);
	    }

	    // Add condition for application numbers if present
	    if (!CollectionUtils.isEmpty(applicationNumbers)) {
	        queryString.append(" AND a1.applicationno IN (:applicationNumbers)");
	        preparedStatementValues.put("applicationNumbers", applicationNumbers);
	    }

	    // Log the final query string for debugging
	    log.info("Query for meterInstallmentDate: " + queryString);

	    try {
	        res = namedParameterJdbcTemplate.query(queryString.toString(), preparedStatementValues, new SingleColumnRowMapper<>(String.class));
	    } catch (Exception ex) {
	        log.error("Exception while reading meter installation date: " + ex.getMessage(), ex);
	    }

	    return res;
	}

	
	
	public List<String> meterId(Set<String> consumerCodes, Set<String> applicationNumbers, String businessService) {
	    List<String> res = new ArrayList<>();
	    Map<String, Object> preparedStatementValues = new HashMap<>();
	    StringBuilder queryString = new StringBuilder("SELECT a2.meterid ");

	    // Determine the correct table based on the businessService
	    if (businessService.contains("WS")) {
	        queryString.append("FROM eg_ws_connection a1 ");
	    } else {
	        queryString.append("FROM eg_sw_connection a1 ");
	    }

	    queryString.append("INNER JOIN eg_ws_service a2 ON a1.id = a2.connection_id ")
	               .append("WHERE 1=1");

	    // Add condition for consumer codes if present
	    if (!CollectionUtils.isEmpty(consumerCodes)) {
	        queryString.append(" AND a1.connectionno IN (:consumerCodes)");
	        preparedStatementValues.put("consumerCodes", consumerCodes);
	    }

	    // Add condition for application numbers if present
	    if (!CollectionUtils.isEmpty(applicationNumbers)) {
	        queryString.append(" AND a1.applicationno IN (:applicationNumbers)");
	        preparedStatementValues.put("applicationNumbers", applicationNumbers);
	    }

	    // Log the final query string for debugging
	    log.info("Query for meterId: " + queryString);

	    try {
	        res = namedParameterJdbcTemplate.query(queryString.toString(), preparedStatementValues, new SingleColumnRowMapper<>(String.class));
	    } catch (Exception ex) {
	        log.error("Exception while reading meter ID: " + ex.getMessage(), ex);
	    }

	    return res;
	}

	
	
	
	
	/**
	 * API is to get the distinct ifsccode from payment
	 * 
	 * @return ifsccode list
	 */
	public List<String> fetchIfsccode() {

		return namedParameterJdbcTemplate.query("SELECT distinct ifsccode from egcl_payment where ifsccode is not null ",
				new SingleColumnRowMapper<>(String.class));

	}
public List<String> fetchConsumerCodeByReceiptNumber(String receiptnumber) {
		List<String> res = new ArrayList<>();
		Map<String, Object> preparedStatementValues = new HashMap<>();
		String queryString = "select bill.consumercode from egcl_paymentdetail pd, egcl_bill bill "
				+ " where bill.id=pd.billid  "
				+ " and pd.receiptnumber='"+receiptnumber+"'";
		log.info("Query: " +queryString);
		try {
			res = namedParameterJdbcTemplate.query(queryString, preparedStatementValues, new SingleColumnRowMapper<>(String.class));
		} catch (Exception ex) {
			log.error("Exception while reading usage category" + ex.getMessage());
		}
		return res;
	}
	/**
	 * API, All payments with @param ifsccode, additional details updated
	 * with @param additionaldetails
	 * 
	 * @param additionaldetails
	 * @param ifsccode
	 */

	@Transactional
	public void updatePaymentBankDetail(JsonNode additionaldetails, String ifsccode) {
		List<MapSqlParameterSource> parameterSource = new ArrayList<>();
		parameterSource.add(getParametersForBankDetailUpdate(additionaldetails, ifsccode));

		/**
		 * UPDATE_PAYMENT_BANKDETAIL_SQL query adds the bankdetails data to
		 * existing object type additionaldetails ex: object type
		 * additionaldetails data {"isWhatsapp": false }
		 */
		namedParameterJdbcTemplate.batchUpdate(UPDATE_PAYMENT_BANKDETAIL_SQL,
				parameterSource.toArray(new MapSqlParameterSource[0]));

		List<MapSqlParameterSource> emptyAddtlParameterSource = new ArrayList<>();
		emptyAddtlParameterSource.add(getParametersEmptyDtlBankDetailUpdate(additionaldetails, ifsccode));
		/**
		 * UPDATE_PAYMENT_BANKDETAIL_EMPTYADDTL_SQL query update the bankdetails
		 * to empty/null additionaldetails. ex: empty or 'null'
		 * additionaldetails data.
		 */
		namedParameterJdbcTemplate.batchUpdate(UPDATE_PAYMENT_BANKDETAIL_EMPTYADDTL_SQL,
				emptyAddtlParameterSource.toArray(new MapSqlParameterSource[0]));

		/**
		 * UPDATE_PAYMENT_BANKDETAIL_ARRAYADDTL_SQL query adds bankdetails data
		 * to existing array type additionaldetails. ex: array additional data
		 * :[{"bankName": "State Bank of India", "branchName": "Chandigarh Main
		 * Branch"}]
		 * 
		 */
		namedParameterJdbcTemplate.batchUpdate(UPDATE_PAYMENT_BANKDETAIL_ARRAYADDTL_SQL,
				emptyAddtlParameterSource.toArray(new MapSqlParameterSource[0]));

	}
		
	@SuppressWarnings("null")
	public Object Curl_WS(RequestInfo requestInfo, Set<String> consumerCodes,
	                      Set<String> applicationNo, String tenantId, String businessservice) {

	    List<Map<String, Object>> waterConnections = new ArrayList<>();
	    StringBuilder url = null;

	    if (businessservice.contains("WS")) {
	        url = new StringBuilder(config.getWsHost());
	        url.append(config.getWsUrl());
	    } else {
	        url = new StringBuilder(config.getSwHost());
	        url.append(config.getSwUrl());
	    }

	    String consumerCodeStr = (consumerCodes != null && !consumerCodes.isEmpty()) ? consumerCodes.iterator().next() : null;
	    String applicationNoStr = (applicationNo != null && !applicationNo.isEmpty()) ? applicationNo.iterator().next() : null;

	    if (consumerCodeStr != null && (applicationNoStr == null)) {
	        url.append("searchType=CONNECTION")
	           .append("&connectionNumber=")
	           .append(consumerCodeStr);
	    } else if (applicationNoStr != null && (consumerCodeStr == null)) {
	        url.append("isConnectionSearch=true");
	        url.append("&applicationNumber=").append(applicationNoStr);
	    } else if (consumerCodeStr != null) {
	        url.append("isConnectionSearch=true");
	        url.append("&connectionNumber=").append(consumerCodeStr);
	    } else {
	        throw new IllegalArgumentException("Either consumerCodes or applicationNo must be provided.");
	    }

	    if (tenantId != null && !tenantId.isEmpty()) {
	        url.append("&tenantId=").append(tenantId);
	    }

	    try {
	        log.info(url.toString());
	        RestTemplate restTemplate = new RestTemplate();
	        HttpHeaders headers = new HttpHeaders();
	        headers.setContentType(MediaType.APPLICATION_JSON);
	        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

	        Map<String, Object> requestBody = new HashMap<>();
	        requestBody.put("RequestInfo", requestInfo);
	        requestBody.put("tenantId", tenantId);
	        requestBody.put("isConnectionSearch", true);

	        if (applicationNoStr != null) {
	            requestBody.put("applicationNumber", applicationNoStr);
	        } else if (consumerCodeStr != null) {
	            requestBody.put("connectionNumber", consumerCodeStr);
	        }

	        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

	        ResponseEntity<String> response = restTemplate.exchange(url.toString(), HttpMethod.POST, entity, String.class);

	        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
	            ObjectMapper objectMapper = new ObjectMapper();
	            JsonNode rootNode = objectMapper.readTree(response.getBody());

	            JsonNode waterConnectionNode;
	            if (businessservice.contains("WS")) {
	                waterConnectionNode = rootNode.path("WaterConnection");
	            } else {
	                waterConnectionNode = rootNode.path("SewerageConnections");
	            }
	            if (waterConnectionNode.isArray()) {
	                for (JsonNode connection : waterConnectionNode) {
	                    Map<String, Object> connectionMap = objectMapper.convertValue(connection, Map.class);
	                    waterConnections.add(connectionMap);
	                }
	            }
	        }
	    } catch (Exception ex) {
	        log.error("Exception while calling WS service: ", ex);
	    }

	    return waterConnections;
	}

	



	public List<Map<String, Object>> Curl_Property(RequestInfo requestInfo, String tenantId, String Property_Id) {
		// TODO Auto-generated method stub
		List<Map<String, Object>> PTConnections = new ArrayList<>();
		StringBuilder property_url = new StringBuilder(config.getPtHost());
		property_url.append(config.getPtUrl())
					.append("tenantId=")
					.append(tenantId);
		
		if(!Property_Id.isEmpty() || Property_Id != null){
			property_url.append("&propertyIds=").append(Property_Id);
		}
	    try {
	    	log.info(property_url.toString());
	        RestTemplate restTemplate = new RestTemplate();
	        HttpHeaders headers = new HttpHeaders();
	        headers.setContentType(MediaType.APPLICATION_JSON);
	        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

	        // Creating request body as a map
	        Map<String, Object> requestBody = new HashMap<>();
	        requestBody.put("RequestInfo", requestInfo);
	        requestBody.put("tenantId", tenantId);
	        requestBody.put("isConnectionSearch", true);
	        requestBody.put("propertyId", Property_Id);
	        
	        // Wrapping request body into HttpEntity
	        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

	        // Making POST request
	        ResponseEntity<String> response = restTemplate.exchange( property_url.toString() , HttpMethod.POST, entity, String.class);

	        // Check if response is successful
	        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
	            ObjectMapper objectMapper = new ObjectMapper();
	            JsonNode rootNode = objectMapper.readTree(response.getBody());

	            // Extracting "propertyConnection" array
	            JsonNode ptConnectionNode = rootNode.path("Properties");

//	            JsonNode statusNode = ptConnectionNode.path("status");
	            
	            for (JsonNode connection : ptConnectionNode) {
	                JsonNode statusNode = connection.path("status");
	            
	                if (statusNode.asText().equalsIgnoreCase("ACTIVE") || statusNode.asText().equalsIgnoreCase("PENDINGWS") ) {
	                	Map<String, Object> connectionMap = objectMapper.convertValue(connection, Map.class);
	                	PTConnections.add(connectionMap);
	            }
	        }
	        
	      }
	        
	    }catch (Exception ex) {
	        log.error("Exception while calling PT service: ", ex);
	    }
		return PTConnections;
	}

}
	

