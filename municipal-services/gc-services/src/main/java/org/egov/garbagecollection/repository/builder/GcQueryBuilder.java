package org.egov.garbagecollection.repository.builder;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.garbagecollection.config.GCConfiguration;
import org.egov.garbagecollection.util.GcServicesUtil;
import org.egov.garbagecollection.web.models.Property;
import org.egov.garbagecollection.web.models.SearchCriteria;
import org.egov.garbagecollection.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import static org.egov.garbagecollection.constants.GCConstants.SEARCH_TYPE_CONNECTION;

@Component
@Slf4j
public class GcQueryBuilder {

	@Autowired
	private GcServicesUtil gcServicesUtil;

	@Autowired
	private GCConfiguration config;
	
	@Autowired
	private UserService userService;

	private static final String INNER_JOIN_STRING = "INNER JOIN";
    private static final String LEFT_OUTER_JOIN_STRING = " LEFT OUTER JOIN ";
//	private static final String Offset_Limit_String = "OFFSET ? LIMIT ?";
    
    private static String holderSelectValues = "connectionholder.tenantid as holdertenantid, connectionholder.connectionid as holderapplicationId, userid, connectionholder.status as holderstatus, isprimaryholder, connectionholdertype, holdershippercentage, connectionholder.relationship as holderrelationship, connectionholder.createdby as holdercreatedby, connectionholder.createdtime as holdercreatedtime, connectionholder.lastmodifiedby as holderlastmodifiedby, connectionholder.lastmodifiedtime as holderlastmodifiedtime";

    
	private static final String GARBAGE_SEARCH_QUERY = "SELECT count(*) OVER() AS full_count, conn.*, gc.*, document.*,connectionholder.*, gc.connectionCategory, gc.connectionType,"
//			+ " gc.meterId, gc.meterInstallationDate, gc.pipeSize, gc.noOfTaps, gc.proposedPipeSize, gc.proposedTaps, "
			+ " gc.connection_id as connection_Id, gc.connectionExecutionDate, gc.appCreatedDate as gc_appCreatedDate, "
			+ " gc.detailsprovidedby, gc.estimationfileStoreId , gc.sanctionfileStoreId , gc.estimationLetterDate,"
			+ " conn.id as conn_id, conn.tenantid, conn.applicationNo, conn.applicationStatus, conn.status, conn.connectionNo, conn.oldConnectionNo, conn.property_id, conn.unit_id, conn.property_type,conn.plot_size,conn.location,conn.frequency_of_garbage_collection,conn.type_of_waste,"
			+ " conn.action, conn.adhocpenalty, conn.adhocrebate, conn.adhocpenaltyreason, conn.applicationType, conn.channel, conn.dateEffectiveFrom,"
			+ " conn.adhocpenaltycomment, conn.adhocrebatereason, conn.adhocrebatecomment, conn.createdBy as gc_createdBy, conn.lastModifiedBy as gc_lastModifiedBy,"
			+ " conn.createdTime as gc_createdTime, conn.lastModifiedTime as gc_lastModifiedTime,conn.additionaldetails,connectionholder.tenantid as holdertenantid, "
			+ " conn.locality, conn.isoldapplication,conn.disconnectionreason, conn.isDisconnectionTemporary, gc.disconnectionExecutionDate, document.id as doc_Id, document.gcid as gc_Id, document.documenttype, document.filestoreid, document.active as doc_active ,connectionholder.userid as userid,connectionholder.relationship as holderrelationship, connectionholder.status as holderstatus, connectionholder.connectionid as holderapplicationId"
			+ " FROM eg_gc_connection conn "
			+  INNER_JOIN_STRING 
			+" eg_gc_service gc ON gc.connection_id = conn.id"
			+  LEFT_OUTER_JOIN_STRING
			+ "eg_gc_applicationdocument document ON document.gcid = conn.id"
			+ LEFT_OUTER_JOIN_STRING
			+ "eg_gc_connectionholder connectionholder ON connectionholder.connectionid = conn.id ";

	private static final String SEARCH_COUNT_QUERY =  " FROM eg_gc_connection conn "
			+  INNER_JOIN_STRING 
			+" eg_gc_service gc ON gc.connection_id = conn.id"
			+  LEFT_OUTER_JOIN_STRING
			+ "eg_gc_applicationdocument document ON document.gcid = conn.id"
			+ LEFT_OUTER_JOIN_STRING
			+ "eg_gc_connectionholder connectionholder ON connectionholder.connectionid = conn.id ";

	private static final String TOTAL_APPLICATIONS_COUNT_QUERY = "select count(*) from eg_gc_connection where tenantid = ?;";
	
	private static final String PAGINATION_WRAPPER = "SELECT * FROM " +
            "(SELECT *, DENSE_RANK() OVER (ORDER BY gc_appCreatedDate DESC) offset_ FROM " +
            "({})" +
            " result) result_offset " +
            "WHERE offset_ > ? AND offset_ <= ?";
	
	private static final String COUNT_WRAPPER = " SELECT COUNT(*) FROM ({INTERNAL_QUERY}) AS count ";

	private static final String ORDER_BY_CLAUSE= " ORDER BY gc.appCreatedDate DESC";
	
	private static final String ORDER_BY_COUNT_CLAUSE= " ORDER BY appCreatedDate DESC";

	public static final String UPDATE_DISCONNECT_STATUS="update eg_gc_connection set status=? where id=?";
	
	private static final String LATEST_EXECUTED_MIGRATION_QUERY = "select * from eg_gc_enc_audit where tenantid = ? order by createdTime desc limit 1;";

	/**
	 * 
	 * @param criteria
	 *            The WaterCriteria
	 * @param preparedStatement
	 *            The Array Of Object
	 * @param requestInfo
	 *            The Request Info
	 * @return query as a string
	 */
	public String getSearchQueryString(SearchCriteria criteria, List<Object> preparedStatement,
									   RequestInfo requestInfo, Boolean iscitizenSearch) {
		if (criteria.isEmpty())
			return null;

		if (criteria.getIsCountCall() == null)
			criteria.setIsCountCall(Boolean.FALSE);

		StringBuilder query;
		if (!criteria.getIsCountCall())
			query = new StringBuilder(GARBAGE_SEARCH_QUERY);
		else if (criteria.getIsCountCall() && !StringUtils.isEmpty(criteria.getSearchType())
				&& criteria.getSearchType().equalsIgnoreCase(SEARCH_TYPE_CONNECTION)) {
			query = new StringBuilder(
					"SELECT DISTINCT(conn.connectionno),max(gc.appCreatedDate) appCreatedDate");
			query.append(SEARCH_COUNT_QUERY);
		} else {
			query = new StringBuilder("SELECT DISTINCT(conn.applicationNo),max(gc.appCreatedDate) appCreatedDate");
			query.append(SEARCH_COUNT_QUERY);
		}
		
		boolean propertyIdsPresent = false;

		Set<String> propertyIds = new HashSet<>();
		String propertyIdQuery = " (conn.property_id in (";



		if (!StringUtils.isEmpty(criteria.getMobileNumber()) || !StringUtils.isEmpty(criteria.getDoorNo())
				|| !StringUtils.isEmpty(criteria.getOwnerName()) || !StringUtils.isEmpty(criteria.getPropertyId())) {
			List<Property> propertyList = gcServicesUtil.propertySearchOnCriteria(criteria, requestInfo);
			propertyList.forEach(property -> propertyIds.add(property.getPropertyId()));
			criteria.setPropertyIds(propertyIds);
			if (!propertyIds.isEmpty()) {
				addClauseIfRequired(preparedStatement, query);
				query.append(propertyIdQuery).append(createQuery(propertyIds)).append(" )");
				addToPreparedStatement(preparedStatement, propertyIds);
				propertyIdsPresent = true;
			}
		}
		if (!StringUtils.isEmpty(criteria.getUserIds())) {
			addORClauseIfRequired(preparedStatement, query);
			if(!propertyIdsPresent)
				query.append("(");
			query.append(" connectionholder.userid in (").append(createQuery(criteria.getUserIds())).append(" )");
			addToPreparedStatement(preparedStatement, criteria.getUserIds());
			// Don't close here - will close later if needed
		}
		Set<String> uuids = null;
		if(!StringUtils.isEmpty(criteria.getMobileNumber()) || !StringUtils.isEmpty(criteria.getOwnerName())
				|| !StringUtils.isEmpty(criteria.getDoorNo())) {
			boolean userIdsPresent = false;
			if(!StringUtils.isEmpty(criteria.getMobileNumber()) || !StringUtils.isEmpty(criteria.getOwnerName())) {
				uuids = userService.getUUIDForUsers(criteria.getMobileNumber(),criteria.getOwnerName(), criteria.getTenantId(), requestInfo);
				criteria.setUserIds(uuids);
				}
			if (!CollectionUtils.isEmpty(uuids)) {
				addORClauseIfRequired(preparedStatement, query);
				if(!propertyIdsPresent)
					query.append("(");
				query.append(" connectionholder.userid in (").append(createQuery(uuids)).append(" )");
				addToPreparedStatement(preparedStatement, uuids);
				userIdsPresent = true;
			}
			// Close parenthesis if we opened it (either propertyIdsPresent or !propertyIdsPresent with userIds)
			if(propertyIdsPresent || (!propertyIdsPresent && userIdsPresent)){
				query.append(")");
			}
			if(!propertyIdsPresent && !userIdsPresent) {
				return null;
			}
		}
		
		/*
		 * to return empty result for mobilenumber empty result
		 */
		if (!StringUtils.isEmpty(criteria.getMobileNumber()) 
				&& !StringUtils.isEmpty(criteria.getDoorNo()) && !StringUtils.isEmpty(criteria.getOwnerName())
				&& CollectionUtils.isEmpty(criteria.getPropertyIds()) && CollectionUtils.isEmpty(criteria.getUserIds())
				&& StringUtils.isEmpty(criteria.getApplicationNumber()) && StringUtils.isEmpty(criteria.getPropertyId())
				&& StringUtils.isEmpty(criteria.getConnectionNumber()) && CollectionUtils.isEmpty(criteria.getIds())) {
			return null;
		}

		if (!StringUtils.isEmpty(criteria.getTenantId()) && !iscitizenSearch) {
			addClauseIfRequired(preparedStatement, query);
			if(criteria.getTenantId().equalsIgnoreCase(config.getStateLevelTenantId())){
				query.append(" conn.tenantid LIKE ? ");
				preparedStatement.add(criteria.getTenantId() + '%');
			}
			else{
				query.append(" conn.tenantid = ? ");
				preparedStatement.add(criteria.getTenantId());
			}
		}
		if (!StringUtils.isEmpty(criteria.getPropertyId()) && (StringUtils.isEmpty(criteria.getMobileNumber())
				 &&  StringUtils.isEmpty(criteria.getDoorNo())  &&  StringUtils.isEmpty(criteria.getOwnerName()))) {
			if(propertyIdsPresent)
				query.append(")");
			else{
				addClauseIfRequired(preparedStatement, query);
				query.append(" conn.property_id = ? ");
				preparedStatement.add(criteria.getPropertyId());
			}
		}
		if (!StringUtils.isEmpty(criteria.getUnitId())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.unit_id = ? ");
			preparedStatement.add(criteria.getUnitId());
		}
		if (!CollectionUtils.isEmpty(criteria.getIds())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.id in (").append(createQuery(criteria.getIds())).append(" )");
			addToPreparedStatement(preparedStatement, criteria.getIds());
		}
		if (!StringUtils.isEmpty(criteria.getOldConnectionNumber())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.oldconnectionno = ? ");
			preparedStatement.add(criteria.getOldConnectionNumber());
		}

		// Added clause to support multiple connectionNumbers search
		if (!CollectionUtils.isEmpty(criteria.getConnectionNumber())) {
			addClauseIfRequired(preparedStatement, query);
			query.append("  conn.connectionno IN (").append(createQuery(criteria.getConnectionNumber())).append(")");
			addToPreparedStatement(preparedStatement, criteria.getConnectionNumber());
		}
		if (!StringUtils.isEmpty(criteria.getStatus())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.status = ? ");
			preparedStatement.add(criteria.getStatus());
		}
		
		// Added clause to support multiple applicationNumbers search
		if (!CollectionUtils.isEmpty(criteria.getApplicationNumber())) {
			addClauseIfRequired(preparedStatement, query);
			query.append("  conn.applicationno IN (").append(createQuery(criteria.getApplicationNumber())).append(")");
			addToPreparedStatement(preparedStatement, criteria.getApplicationNumber());
		}
		// Added clause to support multiple applicationStatuses search
		if (!CollectionUtils.isEmpty(criteria.getApplicationStatus())) {
			if (StringUtils.isEmpty(criteria.getSearchType())
					|| !criteria.getSearchType().equalsIgnoreCase(SEARCH_TYPE_CONNECTION)) {
				addClauseIfRequired(preparedStatement, query);
				query.append("  conn.applicationStatus IN (").append(createQuery(criteria.getApplicationStatus()))
						.append(")");
				addToPreparedStatement(preparedStatement, criteria.getApplicationStatus());
			}
		}
		
		if (criteria.getFromDate() != null) {
			addClauseIfRequired(preparedStatement, query);
			query.append("  gc.appCreatedDate >= ? ");
			preparedStatement.add(criteria.getFromDate());
		}
		if (criteria.getToDate() != null) {
			addClauseIfRequired(preparedStatement, query);
			query.append("  gc.appCreatedDate <= ? ");
			preparedStatement.add(criteria.getToDate());
		}
		if(!StringUtils.isEmpty(criteria.getApplicationType())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.applicationType = ? ");
			preparedStatement.add(criteria.getApplicationType());
		}
		if(!StringUtils.isEmpty(criteria.getSearchType())
				&& criteria.getSearchType().equalsIgnoreCase(SEARCH_TYPE_CONNECTION)){
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.isoldapplication = ? ");
			preparedStatement.add(Boolean.FALSE);
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.connectionno is not null ");
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.applicationstatus in ('APPROVED','CONNECTION_ACTIVATED','DISCONNECTION_EXECUTED') ");
		}
		if (!StringUtils.isEmpty(criteria.getLocality())) {
			addClauseIfRequired(preparedStatement, query);
			query.append(" conn.locality = ? ");
			preparedStatement.add(criteria.getLocality());
		}
		
		if (criteria.getConnectionType() != null && !criteria.getConnectionType().isEmpty()) {
		    if (criteria.getConnectionType().equalsIgnoreCase("METERED")) {
		        if (!StringUtils.isEmpty(criteria.getConnectionType())) {
		            addClauseIfRequired(preparedStatement, query);
		            query.append(" gc.connectiontype = ? ");
		            preparedStatement.add(criteria.getConnectionType());
		        }
		    }
		}
		
		//Add group by and order by clause as per the search scenario
		if(criteria.getIsCountCall() && !StringUtils.isEmpty(criteria.getSearchType())
				&& criteria.getSearchType().equalsIgnoreCase(SEARCH_TYPE_CONNECTION))
			query.append("GROUP BY conn.connectionno ").append(ORDER_BY_COUNT_CLAUSE);
		else if(criteria.getIsCountCall())
			query.append("GROUP BY conn.applicationno ").append(ORDER_BY_COUNT_CLAUSE);
		else
			query.append(ORDER_BY_CLAUSE);

		// Pagination to limit results, do not paginate query in case of count call.
		if (!criteria.getIsCountCall())
			return addPaginationWrapper(query.toString(), preparedStatement, criteria);
		
		String queryInString=query.toString();
		
		return queryInString;		
	}
	
	
	public String getSearchCountQueryString(SearchCriteria criteria, List<Object> preparedStmtList,
			RequestInfo requestInfo, Boolean iscitizenSearch) {
		String query = getSearchQueryString(criteria, preparedStmtList, requestInfo,iscitizenSearch);
		if (query != null)
			return COUNT_WRAPPER.replace("{INTERNAL_QUERY}", query);
		else
			return query;
	}
	
	private void addClauseIfRequired(List<Object> values, StringBuilder queryString) {
		if (values.isEmpty())
			queryString.append(" WHERE ");
		else {
			queryString.append(" AND");
		}
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


	/**
	 * 
	 * @param query
	 *            Query String
	 * @param preparedStmtList
	 *            Array of object for preparedStatement list
	 * @param criteria SearchCriteria
	 * @return It's returns query
	 */
	private String addPaginationWrapper(String query, List<Object> preparedStmtList, SearchCriteria criteria) {
		Integer limit = config.getDefaultLimit();
		Integer offset = config.getDefaultOffset();
		if (criteria.getLimit() == null && criteria.getOffset() == null)
			limit = config.getMaxLimit();

		if (criteria.getLimit() != null && criteria.getLimit() <= config.getDefaultLimit())
			limit = criteria.getLimit();

		if (criteria.getLimit() != null && criteria.getLimit() > config.getDefaultLimit())
			limit = config.getDefaultLimit();

		if (criteria.getOffset() != null)
			offset = criteria.getOffset();

		preparedStmtList.add(offset);
		preparedStmtList.add(limit + offset);
		return PAGINATION_WRAPPER.replace("{}",query);
	}
	
	private void addORClauseIfRequired(List<Object> values, StringBuilder queryString){
		if (values.isEmpty())
			queryString.append(" WHERE ");
		else {
			queryString.append(" OR");
		}
	}

	public String getSearchQueryStringForPlainSearch(SearchCriteria criteria, List<Object> preparedStatement,
			RequestInfo requestInfo) {
		if (criteria.isEmpty())
			return null;
		StringBuilder query = new StringBuilder(GARBAGE_SEARCH_QUERY);
		query = applyFiltersForPlainSearch(query, preparedStatement, criteria);
		return addPaginationWrapperForPlainSearch(query.toString(), preparedStatement, criteria);
	}
	
	public StringBuilder applyFiltersForPlainSearch(StringBuilder query, List<Object> preparedStatement, SearchCriteria criteria) {
		if (!StringUtils.isEmpty(criteria.getTenantId())) {
			addClauseIfRequired(preparedStatement, query);
			if (criteria.getTenantId().equalsIgnoreCase(config.getStateLevelTenantId())) {
				query.append(" conn.tenantid LIKE ? ");
				preparedStatement.add('%' + criteria.getTenantId() + '%');
			} else {
				query.append(" conn.tenantid = ? ");
				preparedStatement.add(criteria.getTenantId());
			}
		}
		return query;
	}

	private String addPaginationWrapperForPlainSearch(String query, List<Object> preparedStmtList, SearchCriteria criteria) {
		String string = addOrderByClauseForPlainSearch(criteria);
		StringBuilder queryString = new StringBuilder(query);
		queryString.append(string);

		Integer limit = config.getDefaultLimit();
		Integer offset = config.getDefaultOffset();
		StringBuilder finalQuery = null;

		if (criteria.getLimit() == null && criteria.getOffset() == null)
			limit = config.getMaxLimit();

		if (criteria.getLimit() != null && criteria.getLimit() <= config.getMaxLimit())
			limit = criteria.getLimit();

		if (criteria.getLimit() != null && criteria.getLimit() > config.getMaxLimit()) {
			limit = config.getMaxLimit();
		}

		if (criteria.getOffset() != null)
			offset = criteria.getOffset();

		if (limit <= 0) {
			return finalQuery.toString();
		} else {
			finalQuery = new StringBuilder(PAGINATION_WRAPPER.replace("{}", query));
			preparedStmtList.add(offset);
			preparedStmtList.add(limit + offset);
		}

		return finalQuery.toString();
	}
	
	private String addOrderByClauseForPlainSearch(SearchCriteria criteria) {
		StringBuilder builder = new StringBuilder();
		builder.append(" ORDER BY gc.appCreatedDate ");
		if (criteria.getSortOrder() == SearchCriteria.SortOrder.ASC)
			builder.append(" ASC ");
		else
			builder.append(" DESC ");

		return builder.toString();
	}

	public String getTotalApplicationsCountQueryString(SearchCriteria criteria, List<Object> preparedStatement) {
		preparedStatement.add(criteria.getTenantId());
		return TOTAL_APPLICATIONS_COUNT_QUERY;
	}

	public String getLastExecutionDetail(SearchCriteria criteria, List<Object> preparedStatement) {
		preparedStatement.add(criteria.getTenantId());
		return LATEST_EXECUTED_MIGRATION_QUERY;
	}
	
	public String getGCPlainSearchQuery(SearchCriteria criteria, List<Object> preparedStmtList) {
        StringBuilder builder = new StringBuilder(GARBAGE_SEARCH_QUERY);

        Set<String> ids = criteria.getIds();
        if (!CollectionUtils.isEmpty(ids)) {
            addClauseIfRequired(preparedStmtList,builder);
            builder.append(" conn.id IN (").append(createQuery(ids)).append(")");
            addToPreparedStatement(preparedStmtList, ids);
        }

        return addPaginationWrapper(builder.toString(), preparedStmtList, criteria);

    }

}
