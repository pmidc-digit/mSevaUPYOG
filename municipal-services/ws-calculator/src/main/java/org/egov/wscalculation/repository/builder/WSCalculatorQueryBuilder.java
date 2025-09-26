package org.egov.wscalculation.repository.builder;

import java.util.Collections;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;
import java.util.StringJoiner;

import org.egov.wscalculation.config.WSCalculationConfiguration;
import org.egov.wscalculation.constants.WSCalculationConstant;
import org.egov.wscalculation.web.models.BillGenerationSearchCriteria;
import org.egov.wscalculation.web.models.BillSearch;
import org.egov.wscalculation.web.models.BillSearchs;
import org.egov.wscalculation.web.models.CancelDemand;
import org.egov.wscalculation.web.models.CancelList;
import org.egov.wscalculation.web.models.Canceldemandsearch;
import org.egov.wscalculation.web.models.MeterReadingSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

@Component
public class WSCalculatorQueryBuilder {
	
	

	@Autowired
	private WSCalculationConfiguration config;

	private static final String Offset_Limit_String = "OFFSET ? LIMIT ?";
	private final static String Query = "SELECT mr.id, mr.connectionNo as connectionId, mr.billingPeriod, mr.meterStatus, mr.lastReading, mr.lastReadingDate, mr.currentReading,"
			+ " mr.currentReadingDate, mr.createdBy as mr_createdBy, mr.tenantid, mr.lastModifiedBy as mr_lastModifiedBy,"
			+ " mr.createdTime as mr_createdTime, mr.lastModifiedTime as mr_lastModifiedTime FROM eg_ws_meterreading mr";

	private static final String LocalityListAsPerBatchQuery = "SELECT distinct(localitycode) FROM eg_bndry_mohalla conn";

	private final static String noOfConnectionSearchQuery = "SELECT count(*) FROM eg_ws_meterreading WHERE";

	private final static String noOfConnectionSearchQueryForCurrentMeterReading = "select mr.currentReading from eg_ws_meterreading mr";

	private final static String getMeterReadingId = "select mr.id from eg_ws_meterreading mr";

	private final static String tenantIdWaterConnectionSearchQuery = "select DISTINCT tenantid from eg_ws_connection";

	private final static String connectionNoWaterConnectionSearchQuery = "SELECT conn.connectionNo as conn_no FROM eg_ws_service wc INNER JOIN eg_ws_connection conn ON wc.connection_id = conn.id";

	private static final String connectionNoListQuery = "SELECT distinct(conn.connectionno),ws.connectionexecutiondate FROM eg_ws_connection conn INNER JOIN eg_ws_service ws ON conn.id = ws.connection_id";
	// private static final String connectionNoListQuery = "SELECT
	// distinct(conn.connectionno) FROM eg_ws_connection conn INNER JOIN
	// eg_ws_service ws ON conn.id = ws.connection_id";
	
	
	
	private static final String getDemandId = "SELECT DISTINCT d.id AS demandId, d.status AS Status, dd.collectionamount as amountCollected FROM egbs_demand_v1 d INNER JOIN egbs_demanddetail_v1 dd ON dd.demandid = d.id  ";

	private static final String connectionNoListQueryCancel = "SELECT  distinct d.id, d.consumercode from egbs_demand_v1 d INNER JOIN egbs_demanddetail_v1 dd ON dd.demandid = d.id  ";
	private static final String connectionNoListQueryUpdate = "UPDATE egbs_demand_v1 set ";
	
	private static final String connectionNoListQuerybill = "UPDATE egbs_bill_v1 " +
            "SET status = 'EXPIRED' " +
            "FROM egbs_billdetail_v1 ";
	
	
    private static final String connectionNoBill =  " select distinct(bill.id) from egbs_bill_v1 bill, egbs_billdetail_v1 bd  ";
    
    private static final String connectionNoBills =  " select distinct(consumercode) from egbs_billdetail_v1 bd  ";


	private static final String distinctTenantIdsCriteria = "SELECT distinct(tenantid) FROM eg_ws_connection ws";

	private static final String connectionNoByLocality = "SELECT distinct(conn.connectionno) FROM eg_ws_connection conn INNER JOIN eg_ws_service ws ON conn.id = ws.connection_id  ";

	private static final String BILL_SCHEDULER_STATUS_SEARCH_QUERY = "select status from eg_ws_scheduler ";
	private static final String LAST_DEMAND_GEN_FOR_CONN = " SELECT d.taxperiodfrom FROM egbs_demand_v1 d ";

	private static final String isConnectionDemandAvailableForBillingCycle = "select EXISTS (select 1 from egbs_demand_v1 d ";

	public static final String BILL_STATUS_UPDATE_QUERY = "UPDATE egbs_bill_v1 SET status=? WHERE status='ACTIVE' ";
	private static final String fiterConnectionBasedOnTaxPeriod = " AND conn.connectionno not in (select distinct consumercode from egbs_demand_v1 d ";
	private static String holderSelectValues = "connectionholder.tenantid as holdertenantid, connectionholder.connectionid as holderapplicationId, userid, connectionholder.status as holderstatus, isprimaryholder, connectionholdertype, holdershippercentage, connectionholder.relationship as holderrelationship, connectionholder.createdby as holdercreatedby, connectionholder.createdtime as holdercreatedtime, connectionholder.lastmodifiedby as holderlastmodifiedby, connectionholder.lastmodifiedtime as holderlastmodifiedtime";

	private static final String INNER_JOIN_STRING = "INNER JOIN";
	private static final String BILL_SCHEDULER_STATUS_UPDATE_QUERY = "UPDATE eg_ws_scheduler SET status=? where id=?";
	private static final String LEFT_OUTER_JOIN_STRING = " LEFT OUTER JOIN ";
	private static final String billGenerationSchedulerSearchQuery = "SELECT * from eg_ws_scheduler ";
	private static final String WATER_SEARCH_QUERY = "SELECT conn.*, wc.*, document.*, plumber.*, wc.connectionCategory, wc.connectionType, wc.waterSource,"
			+ " wc.meterId, wc.meterInstallationDate, wc.pipeSize, wc.noOfTaps, wc.proposedPipeSize, wc.proposedTaps, wc.connection_id as connection_Id, wc.connectionExecutionDate, wc.initialmeterreading, wc.appCreatedDate,"
			+ " wc.detailsprovidedby, wc.estimationfileStoreId , wc.sanctionfileStoreId , wc.estimationLetterDate,"
			+ " conn.id as conn_id, conn.tenantid, conn.applicationNo, conn.applicationStatus, conn.status, conn.connectionNo, conn.oldConnectionNo, conn.property_id, conn.roadcuttingarea,"
			+ " conn.action, conn.adhocpenalty, conn.adhocrebate, conn.adhocpenaltyreason, conn.applicationType, conn.dateEffectiveFrom,"
			+ " conn.adhocpenaltycomment, conn.adhocrebatereason, conn.adhocrebatecomment, conn.createdBy as ws_createdBy, conn.lastModifiedBy as ws_lastModifiedBy,"
			+ " conn.createdTime as ws_createdTime, conn.lastModifiedTime as ws_lastModifiedTime,conn.additionaldetails, "
			+ " conn.locality, conn.isoldapplication, conn.roadtype, document.id as doc_Id, document.documenttype, document.filestoreid, document.active as doc_active, plumber.id as plumber_id,"
			+ " plumber.name as plumber_name, plumber.licenseno, roadcuttingInfo.id as roadcutting_id, roadcuttingInfo.roadtype as roadcutting_roadtype, roadcuttingInfo.roadcuttingarea as roadcutting_roadcuttingarea, roadcuttingInfo.roadcuttingarea as roadcutting_roadcuttingarea,"
			+ " roadcuttingInfo.active as roadcutting_active, plumber.mobilenumber as plumber_mobileNumber, plumber.gender as plumber_gender, plumber.fatherorhusbandname, plumber.correspondenceaddress,"
			+ " plumber.relationship, " + holderSelectValues + " FROM eg_ws_connection conn " + INNER_JOIN_STRING
			+ " eg_ws_service wc ON wc.connection_id = conn.id" + LEFT_OUTER_JOIN_STRING
			+ "eg_ws_applicationdocument document ON document.wsid = conn.id" + LEFT_OUTER_JOIN_STRING
			+ "eg_ws_plumberinfo plumber ON plumber.wsid = conn.id" + LEFT_OUTER_JOIN_STRING
			+ "eg_ws_connectionholder connectionholder ON connectionholder.connectionid = conn.id"
			+ LEFT_OUTER_JOIN_STRING + "eg_ws_roadcuttinginfo roadcuttingInfo ON roadcuttingInfo.wsid = conn.id ";

	/*
	 * + INNER_JOIN_STRING +
	 * " egbs_demand_v1 as dmd on dmd.consumercode = conn.connectionno";
	 */

	private static final String WATER_SEARCH_CONNECTION_QUERY = "SELECT conn.*, wc.*, plumber.*, wc.connectionCategory, wc.connectionType, wc.waterSource,"
			+ " wc.meterId, wc.meterInstallationDate, wc.pipeSize, wc.noOfTaps, wc.proposedPipeSize, wc.proposedTaps, wc.connection_id as connection_Id, wc.connectionExecutionDate, wc.initialmeterreading, wc.appCreatedDate,"
			+ " wc.detailsprovidedby, wc.estimationfileStoreId , wc.sanctionfileStoreId , wc.estimationLetterDate,"
			+ " conn.id as conn_id, conn.tenantid, conn.applicationNo, conn.applicationStatus, conn.status, conn.connectionNo, conn.oldConnectionNo, conn.property_id, conn.roadcuttingarea,"
			+ " conn.action, conn.adhocpenalty, conn.adhocrebate, conn.adhocpenaltyreason, conn.applicationType, conn.dateEffectiveFrom,"
			+ " conn.adhocpenaltycomment, conn.adhocrebatereason, conn.adhocrebatecomment, conn.createdBy as ws_createdBy, conn.lastModifiedBy as ws_lastModifiedBy,"
			+ " conn.createdTime as ws_createdTime, conn.lastModifiedTime as ws_lastModifiedTime,conn.additionaldetails, "
			+ " conn.locality, conn.isoldapplication, conn.roadtype,plumber.id as plumber_id,"
			+ " plumber.name as plumber_name, plumber.licenseno, roadcuttingInfo.id as roadcutting_id, roadcuttingInfo.roadtype as roadcutting_roadtype, roadcuttingInfo.roadcuttingarea as roadcutting_roadcuttingarea, roadcuttingInfo.roadcuttingarea as roadcutting_roadcuttingarea,"
			+ " roadcuttingInfo.active as roadcutting_active, plumber.mobilenumber as plumber_mobileNumber, plumber.gender as plumber_gender, plumber.fatherorhusbandname, plumber.correspondenceaddress,"
			+ " plumber.relationship, " + holderSelectValues + " FROM eg_ws_connection conn " + INNER_JOIN_STRING
			+ " eg_ws_service wc ON wc.connection_id = conn.id" + LEFT_OUTER_JOIN_STRING
			+ "eg_ws_plumberinfo plumber ON plumber.wsid = conn.id" + LEFT_OUTER_JOIN_STRING
			+ "eg_ws_connectionholder connectionholder ON connectionholder.connectionid = conn.id"
			+ LEFT_OUTER_JOIN_STRING + "eg_ws_roadcuttinginfo roadcuttingInfo ON roadcuttingInfo.wsid = conn.id ";

	private static final String WATER_SEARCH_DEMAND_QUERY = "SELECT conn.*, wc.*, wc.connectionCategory, wc.connectionType, wc.waterSource,"
			+ " wc.meterId, wc.meterInstallationDate, wc.pipeSize, wc.noOfTaps, wc.proposedPipeSize, wc.proposedTaps, wc.connection_id as connection_Id, wc.connectionExecutionDate, wc.initialmeterreading, wc.appCreatedDate,"
			+ " wc.detailsprovidedby, wc.estimationfileStoreId , wc.sanctionfileStoreId , wc.estimationLetterDate,"
			+ " conn.id as conn_id, conn.tenantid, conn.applicationNo, conn.applicationStatus, conn.status, conn.connectionNo, conn.oldConnectionNo, conn.property_id, conn.roadcuttingarea,"
			+ " conn.action, conn.adhocpenalty, conn.adhocrebate, conn.adhocpenaltyreason, conn.applicationType, conn.dateEffectiveFrom,"
			+ " conn.adhocpenaltycomment, conn.adhocrebatereason, conn.adhocrebatecomment, conn.createdBy as ws_createdBy, conn.lastModifiedBy as ws_lastModifiedBy,"
			+ " conn.createdTime as ws_createdTime, conn.lastModifiedTime as ws_lastModifiedTime,conn.additionaldetails, "
			+ " conn.locality, conn.isoldapplication, conn.roadtype," + holderSelectValues
			+ " FROM eg_ws_connection conn " + INNER_JOIN_STRING + " eg_ws_service wc ON wc.connection_id = conn.id"
			+ LEFT_OUTER_JOIN_STRING
			+ "eg_ws_connectionholder connectionholder ON connectionholder.connectionid = conn.id";
	public static final String EG_WS_BILL_SCHEDULER_CONNECTION_STATUS_INSERT = "INSERT INTO eg_ws_bill_scheduler_connection_status "
			+ "(id, eg_ws_scheduler_id, locality, module, createdtime, lastupdatedtime, status, tenantid, reason, consumercode) "
			+ "VALUES (?,?,?,?,?,?,?,?,?,?);";
	
	public static final String RELATED_SW_CONNECTION_SEARCH_QUERY = "SELECT conn.relatedSwConn from eg_ws_connection conn ";

	public String getDistinctTenantIds() {
		return distinctTenantIdsCriteria;
	}

	public String getCountQuery() {
		return getCountQuery();
	}

	/**
	 * 
	 * @param criteria          would be meter reading criteria
	 * @param preparedStatement Prepared SQL Statement
	 * @return Query for given criteria
	 */
	public String getSearchQueryString(MeterReadingSearchCriteria criteria, List<Object> preparedStatement) {
		if (criteria.isEmpty()) {
			return null;
		}
		StringBuilder query = new StringBuilder(Query);
		if (!StringUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" mr.tenantid= ? ");
			preparedStatement.add(criteria.getTenantId());
		}
		if (!CollectionUtils.isEmpty(criteria.getConnectionNos())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" mr.connectionNo IN (").append(createQuery(criteria.getConnectionNos())).append(" )");
			addToPreparedStatement(preparedStatement, criteria.getConnectionNos());
		}
		addOrderBy(query);
		return addPaginationWrapper(query, preparedStatement, criteria);
	}

	private String createQuery(Set<String> ids) {
		StringBuilder builder = new StringBuilder();
		int length = ids.size();
		for (int i = 0; i < length; i++) {
			builder.append(" ?");
			if (i != length - 1)
				builder.append(",");
		}
		return builder.toString();
	}

	private void addToPreparedStatement(List<Object> preparedStatement, Set<String> ids) {
		preparedStatement.addAll(ids);
	}

	private void addClauseIfRequired(List<Object> values, StringBuilder queryString) {
		if (values.isEmpty())
			queryString.append(" WHERE ");
		else {
			queryString.append(" AND");
		}
	}

	private String addPaginationWrapper(StringBuilder query, List<Object> preparedStmtList,
			MeterReadingSearchCriteria criteria) {
		query.append(" ").append(Offset_Limit_String);
		Integer limit = config.getMeterReadingDefaultLimit();
		Integer offset = config.getMeterReadingDefaultOffset();

		if (criteria.getLimit() != null && criteria.getLimit() <= config.getMeterReadingDefaultLimit())
			limit = criteria.getLimit();

		if (criteria.getLimit() != null && criteria.getLimit() > config.getMeterReadingDefaultLimit())
			limit = config.getMeterReadingDefaultLimit();

		if (criteria.getOffset() != null)
			offset = criteria.getOffset();

		preparedStmtList.add(offset);
		preparedStmtList.add(limit + offset);
		return query.toString();
	}

	public String getNoOfMeterReadingConnectionQuery(Set<String> connectionIds, List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(noOfConnectionSearchQuery);
		query.append(" connectionNo in (").append(createQuery(connectionIds)).append(" )");
		addToPreparedStatement(preparedStatement, connectionIds);
		return query.toString();
	}

	public String getCurrentReadingConnectionQuery(MeterReadingSearchCriteria criteria,
			List<Object> preparedStatement) {
		if (criteria.isEmpty()) {
			return null;
		}
		StringBuilder query = new StringBuilder(noOfConnectionSearchQueryForCurrentMeterReading);
		if (!StringUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" mr.tenantid= ? ");
			preparedStatement.add(criteria.getTenantId());
		}
		if (!CollectionUtils.isEmpty(criteria.getConnectionNos())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" mr.connectionNo IN (").append(createQuery(criteria.getConnectionNos())).append(" )");
			addToPreparedStatement(preparedStatement, criteria.getConnectionNos());
		}
		query.append(" ORDER BY mr.currentReadingDate DESC LIMIT 1");
		return query.toString();
	}

	
	public String getCurrentReadingConnectionSearchQuery(MeterReadingSearchCriteria criteria,
			List<Object> preparedStatement) {
		if (criteria.isEmpty()) {
			return null;
		}
		StringBuilder query = new StringBuilder(noOfConnectionSearchQueryForCurrentMeterReading);
		if (!StringUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" mr.tenantid= ? ");
			preparedStatement.add(criteria.getTenantId());
		}
		if (!CollectionUtils.isEmpty(criteria.getConnectionNos())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" mr.connectionNo IN (").append(createQuery(criteria.getConnectionNos())).append(" )");
			addToPreparedStatement(preparedStatement, criteria.getConnectionNos());
		}
		query.append(" ORDER BY mr.currentReadingDate DESC LIMIT 1 offset 1");
		return query.toString();
	}
	
	
	public String getMeterId(String connectionNo, Long lastReadingDate, Long currentDate, String tenantId,
			List<Object> preparedStatement) {
		if (connectionNo.isEmpty()) {
			return null;
		}
		StringBuilder query = new StringBuilder(getMeterReadingId);
		   if (tenantId != null && !tenantId.isEmpty()) {
		        addClauseIfRequired(preparedStatement, query);
		        query.append(" mr.tenantid = ? ");
		        preparedStatement.add(tenantId);
		    }

		    addClauseIfRequired(preparedStatement, query);
		    query.append(" mr.connectionNo = ? ");
		    preparedStatement.add(connectionNo);

		    // Optional filtering
		    if (lastReadingDate != null) {
		        addClauseIfRequired(preparedStatement, query);
		        query.append(" mr.lastReadingDate = ? ");
		        preparedStatement.add(lastReadingDate);
		    }

		    
		    query.append(" ORDER BY mr.currentReadingDate DESC LIMIT 1");

		    return query.toString();
	}

	/**
	 * Bill expire query builder
	 * 
	 * @param billIds
	 * @param preparedStmtList
	 */
	public String getBillSchedulerUpdateQuery(String schedulerId, List<Object> preparedStmtList) {

		StringBuilder builder = new StringBuilder(BILL_SCHEDULER_STATUS_UPDATE_QUERY);

		return builder.toString();
	}

	public String getTenantIdConnectionQuery() {
		return tenantIdWaterConnectionSearchQuery;
	}

	private void addOrderBy(StringBuilder query) {
		query.append(" ORDER BY mr.currentReadingDate DESC");
	}

	public String getConnectionNumberFromWaterServicesQuery(List<Object> preparedStatement, String connectionType,
			String tenentId) {
		StringBuilder query = new StringBuilder(connectionNoWaterConnectionSearchQuery);
		if (!StringUtils.isEmpty(connectionType)) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" wc.connectionType = ? ");
			preparedStatement.add(connectionType);
		}

		if (!StringUtils.isEmpty(tenentId)) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.tenantId = ? ");
			preparedStatement.add(tenentId);
		}
		return query.toString();

	}

	public String getLocalityListWithBatch(String tenantId, String batchCode, List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(LocalityListAsPerBatchQuery);
		// add batchcode
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.blockcode = ? ");
		preparedStatement.add(batchCode);

		// add tenantid
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.tenantid = ? ");
		preparedStatement.add(tenantId);

		return query.toString();
	}

	public String getConnectionNumberList(String tenantId, String connectionType, String status, Long taxPeriodFrom,
			Long taxPeriodTo, String cone, List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(connectionNoListQuery);

		// Add connection type
		addClauseIfRequired(preparedStatement, query);
		query.append(" ws.connectiontype = ? ");
		preparedStatement.add(connectionType);

		// Active status
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.status = ? ");
		preparedStatement.add(status);

		// Get the activated connections status
		addClauseIfRequired(preparedStatement, query);
		query.append(" (conn.applicationstatus = ?  or conn.applicationstatus = ?)");
		preparedStatement.add(WSCalculationConstant.CONNECTION_ACTIVATED);
		preparedStatement.add(WSCalculationConstant.MODIFIED_APPROVED);

		// add tenantid
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.tenantid = ? ");
		preparedStatement.add(tenantId);

//		 Test with connection number
//		addClauseIfRequired(preparedStatement, query);
//		query.append(" conn.connectionno = '0603000900' ");

		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.connectionno is not null");

		if (cone != null && cone != "") {
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.connectionno = ? ");
			preparedStatement.add(cone);
		}
		query.append(fetchConnectionsToBeGenerate(tenantId, taxPeriodFrom, taxPeriodTo, preparedStatement));

		return query.toString();

	}

	public String fetchConnectionsToBeGenerate(String tenantId, Long taxPeriodFrom, Long taxPeriodTo,
			List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(fiterConnectionBasedOnTaxPeriod);

		query.append(" WHERE d.tenantid = ? ");
		preparedStatement.add(tenantId);

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.status = 'ACTIVE' ");

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.taxPeriodFrom = ? ");
		preparedStatement.add(taxPeriodFrom);

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.taxPeriodTo = ? ");
		preparedStatement.add(taxPeriodTo);

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.businessservice = ? ) ");
		preparedStatement.add(WSCalculationConstant.SERVICE_FIELD_VALUE_WS);

		return query.toString();
	}

	public String getConnectionNumberList(String tenantId, String connectionType, List<Object> preparedStatement,
			Integer batchOffset, Integer batchsize, Long fromDate, Long toDate) {
		// StringBuilder query = new StringBuilder(connectionNoListQuery);
		// StringBuilder query = new StringBuilder(connectionNoListQuery);
		StringBuilder query = new StringBuilder(WATER_SEARCH_QUERY);
		// Add connection type
		addClauseIfRequired(preparedStatement, query);
		query.append(" wc.connectiontype = ? ");
		preparedStatement.add(connectionType);
		// add tenantid
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.tenantid = ? ");
		preparedStatement.add(tenantId);
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.connectionno is not null");

		addClauseIfRequired(preparedStatement, query);
		query.append(
				" conn.connectionno NOT IN (select distinct(consumercode) from egbs_demand_v1 dmd where (dmd.taxperiodfrom >= ? and dmd.taxperiodto <= ?) and businessservice = 'WS' and tenantid=?)");
		preparedStatement.add(fromDate);
		preparedStatement.add(toDate);
		preparedStatement.add(tenantId);

		addClauseIfRequired(preparedStatement, query);
		String orderbyClause = " conn.connectionno IN (select connectionno FROM eg_ws_connection where tenantid=? and connectionno is not null ORDER BY connectionno OFFSET ? LIMIT ?)";
		preparedStatement.add(tenantId);
		preparedStatement.add(batchOffset);
		preparedStatement.add(batchsize);
		query.append(orderbyClause);

		return query.toString();

	}

	public String getConnectionsNoByLocality(String tenantId, String connectionType, String status, String locality,String groups,
			List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(connectionNoByLocality);

		// add tenantid
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.tenantid = ? ");
		preparedStatement.add(tenantId);

		// Add connection type
		addClauseIfRequired(preparedStatement, query);
		query.append(" ws.connectiontype = ? ");
		preparedStatement.add(connectionType);

		// Active status
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.status = ? ");
		preparedStatement.add(status);

		if (locality != null) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.locality = ? ");
			preparedStatement.add(locality);
		}

		if (groups != null) {
	        addClauseIfRequired(preparedStatement, query);
	        query.append(" conn.additionaldetails->>'groups' = ? ");
	        preparedStatement.add(groups); // Exact match
	    }
		// Getting only non exempted connection to generate bill
		addClauseIfRequired(preparedStatement, query);
		query.append(" (conn.additionaldetails->>'isexempted')::boolean is not true ");

		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.connectionno is not null");
		return query.toString();

	}

	public String getConnectionNumberListForDemand(String tenantId, String connectionType,
			List<Object> preparedStatement, Long fromDate, Long toDate) {
		// StringBuilder query = new StringBuilder(connectionNoListQuery);
		// StringBuilder query = new StringBuilder(connectionNoListQuery);
		StringBuilder query = new StringBuilder(WATER_SEARCH_DEMAND_QUERY);
		// Add connection type
		addClauseIfRequired(preparedStatement, query);
		query.append(" wc.connectiontype = ? ");
		preparedStatement.add(connectionType);
		// add tenantid
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.tenantid = ? ");
		preparedStatement.add(tenantId);
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.connectionno is not null");

		addClauseIfRequired(preparedStatement, query);
		query.append(
				" conn.connectionno NOT IN (select distinct(consumercode) from egbs_demand_v1 dmd where (dmd.taxperiodfrom >= ? and dmd.taxperiodto <= ?) and businessservice = 'WS' and tenantid=?)");
		preparedStatement.add(fromDate);
		preparedStatement.add(toDate);
		preparedStatement.add(tenantId);

		// addClauseIfRequired(preparedStatement, query);
		String orderbyClause = " order by conn.connectionno";
		query.append(orderbyClause);

		return query.toString();

	}

	public String getConnectionNumber(String tenantId, String consumerCode, String connectionType,
			List<Object> preparedStatement, Long fromDate, Long toDate) {
		// StringBuilder query = new StringBuilder(connectionNoListQuery);
		// StringBuilder query = new StringBuilder(connectionNoListQuery);
		StringBuilder query = new StringBuilder(WATER_SEARCH_CONNECTION_QUERY);
		// Add connection type
		addClauseIfRequired(preparedStatement, query);
		query.append(" wc.connectiontype = ? ");
		preparedStatement.add(connectionType);
		// add tenantid
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.tenantid = ? ");
		preparedStatement.add(tenantId);
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.connectionno is not null");

		addClauseIfRequired(preparedStatement, query);
		query.append(
				" conn.connectionno NOT IN (select distinct(consumercode) from egbs_demand_v1 dmd where (dmd.taxperiodfrom >= ? and dmd.taxperiodto <= ?) and businessservice = 'WS' and tenantid=? and consumercode = ?)");
		preparedStatement.add(fromDate);
		preparedStatement.add(toDate);
		preparedStatement.add(tenantId);
		preparedStatement.add(consumerCode);

		addClauseIfRequired(preparedStatement, query);
		String orderbyClause = " conn.connectionno =? ";
		preparedStatement.add(consumerCode);
		query.append(orderbyClause);

		return query.toString();

	}

	public String isBillingPeriodExists(String connectionNo, String billingPeriod, List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(noOfConnectionSearchQuery);
		query.append(" connectionNo = ? ");
		preparedStatement.add(connectionNo);
		addClauseIfRequired(preparedStatement, query);
		query.append(" billingPeriod = ? ");
		preparedStatement.add(billingPeriod);
		return query.toString();
	}

	public String getBillSchedulerSearchQuery(String locality, Long billFromDate, Long billToDate, String tenantId, String group,
			List<Object> preparedStmtList) {

		StringBuilder query = new StringBuilder(BILL_SCHEDULER_STATUS_SEARCH_QUERY);

		addClauseIfRequired(preparedStmtList, query);
		query.append(" tenantid = ? ");
		preparedStmtList.add(tenantId);

		if (locality != null) {
			addClauseIfRequired(preparedStmtList, query);
			query.append(" locality = ? ");
			preparedStmtList.add(locality);
		}
		if (billFromDate != null) {
			addClauseIfRequired(preparedStmtList, query);
			query.append(" billingcyclestartdate = ? ");
			preparedStmtList.add(billFromDate);
		}
		if (billToDate != null) {
			addClauseIfRequired(preparedStmtList, query);
			query.append(" billingcycleenddate = ? ");
			preparedStmtList.add(billToDate);
		}
		if (group != null) {
			addClauseIfRequired(preparedStmtList, query);
			query.append(" groups = ? ");
			preparedStmtList.add(group);
		}
		return query.toString();
	}

	public String getBillGenerationSchedulerQuery(BillGenerationSearchCriteria criteria,
			List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(billGenerationSchedulerSearchQuery);
		if (!StringUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" tenantid= ? ");
			preparedStatement.add(criteria.getTenantId());
		}
		if (criteria.getLocality() != null) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" locality = ? ");
			preparedStatement.add(criteria.getLocality());
		}
		if (criteria.getBatch() != null) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" batch = ? ");
			preparedStatement.add(criteria.getBatch());
		}
		if (criteria.getGroup() != null) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" groups = ? ");
			preparedStatement.add(criteria.getGroup());
		}
		if (criteria.getStatus() != null) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" status = ? ");
			preparedStatement.add(criteria.getStatus());
		}
		if (criteria.getBillingcycleStartdate() != null) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" billingcyclestartdate >= ? ");
			preparedStatement.add(criteria.getBillingcycleStartdate());
		}
		if (criteria.getBillingcycleEnddate() != null) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" billingcycleenddate <= ? ");
			preparedStatement.add(criteria.getBillingcycleEnddate());
		}

		query.append(" ORDER BY createdtime ");

		return query.toString();
	}

	public String getBillStatusUpdateQuery(List<String> consumerCodes, String businessService,
			List<Object> preparedStmtList) {
		StringBuilder builder = new StringBuilder(BILL_STATUS_UPDATE_QUERY);

		if (!CollectionUtils.isEmpty(consumerCodes)) {

			builder.append(" AND id IN ( SELECT billid from egbs_billdetail_v1 where consumercode IN (");
			appendListToQuery(consumerCodes, preparedStmtList, builder);
			builder.append(" AND businessservice=? )");
			preparedStmtList.add(businessService);
		}

		return builder.toString();
	}

	public String searchLastDemandGenFromDate(String consumerCode, String tenantId, List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(LAST_DEMAND_GEN_FOR_CONN);

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.businessservice = ? ");
		preparedStatement.add(WSCalculationConstant.SERVICE_FIELD_VALUE_WS);

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.tenantid = ? ");
		preparedStatement.add(tenantId);

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.consumercode = ? ");
		preparedStatement.add(consumerCode);

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.status = 'ACTIVE' ");

		query.append(" ORDER BY d.taxperiodfrom desc limit 1 ");

		return query.toString();
	}

	/**
	 * @param billIds
	 * @param preparedStmtList
	 * @param builder
	 */
	private void appendListToQuery(List<String> values, List<Object> preparedStmtList, StringBuilder builder) {
		int length = values.size();

		for (int i = 0; i < length; i++) {
			builder.append(" ?");
			if (i != length - 1)
				builder.append(",");
			preparedStmtList.add(values.get(i));
		}
		builder.append(")");
	}

	public String isConnectionDemandAvailableForBillingCycle(String tenantId, Long taxPeriodFrom, Long taxPeriodTo,
			String consumerCode, List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(isConnectionDemandAvailableForBillingCycle);

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.tenantid = ? ");
		preparedStatement.add(tenantId);

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.consumercode = ? ");
		preparedStatement.add(consumerCode);

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.status = 'ACTIVE' ");

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.taxPeriodFrom = ? ");
		preparedStatement.add(taxPeriodFrom);

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.taxPeriodTo = ? ");
		preparedStatement.add(taxPeriodTo);

		addClauseIfRequired(preparedStatement, query);
		query.append(" d.businessservice = ? ) ");
		preparedStatement.add(WSCalculationConstant.SERVICE_FIELD_VALUE_WS);

		return query.toString();
	}

	public String getCancelBill(String businessService, String tenantId, String consumerCode, Long taxPeriodTo, Long taxperiodfrom,
			List<Object> preparedStatement) {
StringBuilder query = new StringBuilder(connectionNoListQueryCancel);
		
		
		// Add connection type
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.businessservice = ? ");
		preparedStatement.add(businessService);
		
		//Add Businessservice
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.tenantId = ? ");
		preparedStatement.add(tenantId);
		
		
		//Add TenantId
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.consumercode = ? ");
		preparedStatement.add(consumerCode);
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.status = 'ACTIVE' ");
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.ispaymentcompleted = 'false' ");
				
		//Add taxperiodfrom
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.taxperiodfrom >= ? ") ;
		preparedStatement.add(taxperiodfrom);
		
		//Add taxperiodto
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.taxperiodto <= ? ");
		preparedStatement.add(taxPeriodTo);

		return query.toString();
	}
	
	
	
	public String getCollection( String tenantId,   Long taxperiodfrom,Long taxPeriodTo,String consumerCode,
			List<Object> preparedStatement) {
StringBuilder query = new StringBuilder(getDemandId);
		
		
		// Add connection type

		
		//Add Businessservice
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.tenantId = ? ");
		preparedStatement.add(tenantId);
		
		
		//Add TenantId
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.consumercode = ? ");
		preparedStatement.add(consumerCode);
		
		
		query.append("AND d.businessservice = 'WS' ");
		
//		addClauseIfRequired(preparedStatement, query);
//		query.append(" dd.collectionamount = '0' ");
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.ispaymentcompleted = 'false' ");
				
		//Add taxperiodfrom
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.taxperiodfrom >= ? ") ;
		preparedStatement.add(taxperiodfrom);
		
//		//Add taxperiodto
//		addClauseIfRequired(preparedStatement, query);
//		query.append(" d.taxperiodto <= ? ");
//		preparedStatement.add(taxPeriodTo);


		return query.toString();
	}
	
	
	
	// alternative id pick 
	
	
	public String getCancelBills(String tenantId, String demandid,
			List<Object> preparedStatement) {
StringBuilder query = new StringBuilder(connectionNoListQueryCancel);
				
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.tenantId = ? ");
		preparedStatement.add(tenantId);
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.id = ? ");
		preparedStatement.add(demandid);
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.status = 'ACTIVE' ");
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" d.ispaymentcompleted = 'false' ");
				
		return query.toString();
	}
	
	
	
	
	
	
	// DEMAND CANCELLED //
	
	public String getUpdateDemand(List<Canceldemandsearch> demandList, List<Object> preparedStatement) {
StringBuilder query = new StringBuilder(connectionNoListQueryUpdate);     
       query.append("status='CANCELLED' ");     
       addClauseIfRequired(preparedStatement, query);
       // Add the IN clause with placeholders
       query.append(" id IN (");
       
       // Use StringJoiner to build the placeholders string
       StringJoiner placeholders = new StringJoiner(", ");
       for (Canceldemandsearch demand : demandList) {
           placeholders.add("?");
           preparedStatement.add(demand.getDemandid());
       }
       query.append(placeholders.toString());
       query.append(")");
		return query.toString();
	}
	
	
	public String getUpdateDemands(List<Canceldemandsearch> demandLists, List<Object> preparedStatement) {
	    StringBuilder query = new StringBuilder(connectionNoListQueryUpdate);
	    query.append("status='CANCELLED' ");
	    addClauseIfRequired(preparedStatement, query);

	    if (demandLists.isEmpty()) {
	        // Add a condition that matches nothing
	        query.append(" id IN (NULL) ");
	    } else {
	        // Add the IN clause with placeholders
	        query.append(" id IN (");

	        // Use StringJoiner to build the placeholders string
	        StringJoiner placeholders = new StringJoiner(", ");
	        for (Canceldemandsearch demand : demandLists) {
	            placeholders.add("?");
	            preparedStatement.add(demand.getDemandid());
	        }
	        query.append(placeholders.toString());
	        query.append(")");
	    }

	    return query.toString();
	}
	
	
	
	// BILL EXPIRY//
	
	
	public String getBillid(String consumercode, String businessService, List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(connectionNoBill);	
		
		
		
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" bd.consumercode = ? ");
		preparedStatement.add(consumercode);
		addClauseIfRequired(preparedStatement, query);
		query.append(" bd.billid=bill.id");
				//Add Businessservice
		addClauseIfRequired(preparedStatement, query);
		query.append(" bd.businessService = ? ");
		preparedStatement.add(businessService);
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" bill.status='ACTIVE'");
		
        return query.toString();
	}
	
	
	public String getBillids(String tenantid, String demandid, List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(connectionNoBill);	
		
		
		
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" bd.tenantid = ? ");
		preparedStatement.add(tenantid);
		addClauseIfRequired(preparedStatement, query);
		query.append(" bd.billid=bill.id");
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" bd.demandid = ? ");
		preparedStatement.add(demandid);
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" bill.status='ACTIVE'");
		
        return query.toString();
	}
	
	public String getBillidss(String tenantid, String demandid, List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(connectionNoBills);	
		
		
		
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" bd.tenantid = ? ");
		preparedStatement.add(tenantid);
//		addClauseIfRequired(preparedStatement, query);
//		query.append(" bd.billid=bill.id");
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" bd.demandid = ? ");
		preparedStatement.add(demandid);
		
//		addClauseIfRequired(preparedStatement, query);
//		query.append(" bill.status='ACTIVE'");
		
        return query.toString();
	}
	
	
	public String getBillDemand(List<BillSearch> BillSearch, List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(connectionNoListQuerybill);	
		
		
		addClauseIfRequired(preparedStatement, query);

		
		query.append("  egbs_billdetail_v1.billid IN (");
	        
	        // Use StringJoiner to build the placeholders string
	        StringJoiner placeholders = new StringJoiner(", ");
	        for (BillSearch billSearch : BillSearch) {
	            placeholders.add("?");
	            preparedStatement.add(billSearch.getId());
	        }
	        query.append(placeholders.toString());
	        query.append(")");
	        
	        addClauseIfRequired(preparedStatement, query);
			query.append(" status = 'ACTIVE' ");
			
			addClauseIfRequired(preparedStatement, query);
			query.append(" egbs_bill_v1.id = egbs_billdetail_v1.billid");
			
	        return query.toString();
}	
	
	
	public String getBillDemands(List<BillSearchs> billSearchsss, List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(connectionNoListQuerybill);	
		
		
		addClauseIfRequired(preparedStatement, query);
	
		query.append("  egbs_billdetail_v1.consumercode IN (");
		
	        // Use StringJoiner to build the placeholders string
	        StringJoiner placeholders = new StringJoiner(", ");
	        for (BillSearchs billSearchs : billSearchsss) {
	            placeholders.add("?");
	            preparedStatement.add(billSearchs.getConsumercode());
	        }
	        query.append(placeholders.toString());
	        query.append(")");
	            
	        addClauseIfRequired(preparedStatement, query);
			query.append(" status = 'ACTIVE' ");
			
			addClauseIfRequired(preparedStatement, query);
			query.append(" egbs_bill_v1.id = egbs_billdetail_v1.billid");
			
	        return query.toString();

}
	public String searchBillGenerationSchedulerQuery(BillGenerationSearchCriteria criteria,
			List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(billGenerationSchedulerSearchQuery);
		query.append("egws inner join eg_bndry_mohalla egbm on egws.locality = egbm.localitycode ");
		if(!StringUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" egws.tenantid= ? ");
			preparedStatement.add(criteria.getTenantId());
		}
		
		if (criteria.getStatus() != null) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" egws.status = ? ");
			preparedStatement.add(criteria.getStatus());
		}
		
		if (criteria.getBatch() != null) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" egbm.blockcode = ? ");
			preparedStatement.add(criteria.getBatch());
		}
		query.append(" ORDER BY egws.createdtime ");
		return query.toString();
	}
	
	
	
	public String searchBillGenerationSchedulerQuerys(BillGenerationSearchCriteria criteria,
			List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder(billGenerationSchedulerSearchQuery);
		if(!StringUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" tenantid= ? ");
			preparedStatement.add(criteria.getTenantId());
		}
		
		if (criteria.getStatus() != null) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" status = ? ");
			preparedStatement.add(criteria.getStatus());
		}
		query.append(" and groups is not null ");
		query.append(" ORDER BY createdtime ");
		return query.toString();
	}
	
	public String getRelatedSwConnenction( String tenantId , String consumerCode ,List<Object> preparedStatement) {
		StringBuilder query = new StringBuilder( RELATED_SW_CONNECTION_SEARCH_QUERY );
		if(!StringUtils.isEmpty(tenantId)){
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.tenantid = ? ");
			preparedStatement.add(tenantId);
		}
		
		if(!StringUtils.isEmpty(consumerCode)){
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.connectionno = ? ");
			preparedStatement.add(consumerCode);
		}
		
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.applicationstatus = 'CONNECTION_ACTIVATED' ");
		addClauseIfRequired(preparedStatement, query);
		query.append(" conn.status = 'Active' ");
		
		return query.toString();
		
	}
}
