package org.egov.ndc.repository.builder;

import java.util.Arrays;
import java.util.List;

import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.web.model.NdcSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class NdcQueryBuilder {

	@Autowired
	private NDCConfiguration ndcConfig;
	
	@Value("${egov.ndc.fuzzysearch.isFuzzyEnabled}")
	private boolean isFuzzyEnabled;

	private static final String QUERY = "SELECT ndc.*,ndcdoc.*,ndc.id as ndc_id,ndc.tenantid as ndc_tenantId,ndc.lastModifiedTime as "
			+ "ndc_lastModifiedTime,ndc.createdBy as ndc_createdBy,ndc.lastModifiedBy as ndc_lastModifiedBy,ndc.createdTime as "
			+ "ndc_createdTime,ndc.additionalDetails,ndc.landId as ndc_landId, ndcdoc.id as ndc_doc_id, ndcdoc.additionalDetails as doc_details, "
			+ "ndcdoc.documenttype as ndc_doc_documenttype,ndcdoc.filestoreid as ndc_doc_filestore"
			+ " FROM eg_ndc ndc  LEFT OUTER JOIN "
			+ "eg_ndc_document ndcdoc ON ndcdoc.ndcid = ndc.id WHERE 1=1 ";

	private final String paginationWrapper = "SELECT * FROM "
			+ "(SELECT *, DENSE_RANK() OVER (ORDER BY ndc_lastModifiedTime DESC) offset_ FROM " + "({})"
			+ " result) result_offset " + "WHERE offset_ > ? AND offset_ <= ?";
	
	private final String countWrapper = "SELECT COUNT(DISTINCT(ndc_id)) FROM ({INTERNAL_QUERY}) as ndc_count";

	/**
	 * To give the Search query based on the requirements.
	 * 
	 * @param criteria
	 *            NDC search criteria
	 * @param preparedStmtList
	 *            values to be replased on the query
	 * @return Final Search Query
	 */
	public String getNdcSearchQuery(NdcSearchCriteria criteria, List<Object> preparedStmtList, boolean isCount) {

		StringBuilder builder = new StringBuilder(QUERY);

		if (criteria.getTenantId() != null) {
	        addClauseIfRequired(builder);
	        builder.append(" ndc.tenantid=? ");
	        preparedStmtList.add(criteria.getTenantId());
			log.info(criteria.getTenantId());
		}

		List<String> ids = criteria.getIds();
		if (!CollectionUtils.isEmpty(ids)) {
			addClauseIfRequired(builder);
			builder.append(" ndc.id IN (").append(createQuery(ids)).append(")");
			addToPreparedStatement(preparedStmtList, ids);
		}		

		String applicationNo = criteria.getApplicationNo();
                if (applicationNo != null) {
                    List<String> applicationNos = Arrays.asList(applicationNo.split(","));
                    addClauseIfRequired(builder);
                    if (isFuzzyEnabled) {
                        builder.append(" ndc.applicationNo LIKE ANY(ARRAY[ ").append(createQuery(applicationNos)).append("])");
                        addToPreparedStatementForFuzzySearch(preparedStmtList, applicationNos);
                    } else {
                        builder.append(" ndc.applicationNo IN (").append(createQuery(applicationNos)).append(")");
                        addToPreparedStatement(preparedStmtList, applicationNos);
                    }
                }

		
		String approvalNo = criteria.getNdcNo();
                if (approvalNo != null) {
                    List<String> approvalNos = Arrays.asList(approvalNo.split(","));
                    addClauseIfRequired(builder);
                    if (isFuzzyEnabled) {
                        builder.append(" ndc.ndcNo LIKE ANY(ARRAY[ ").append(createQuery(approvalNos)).append("])");
                        addToPreparedStatementForFuzzySearch(preparedStmtList, approvalNos);
                    } else {
                        builder.append(" ndc.ndcNo IN (").append(createQuery(approvalNos)).append(")");
                        addToPreparedStatement(preparedStmtList, approvalNos);
                    }
                }

		
		String source = criteria.getSource();
		if (source!=null) {
			addClauseIfRequired(builder);
			builder.append(" ndc.source = ?");
			preparedStmtList.add(criteria.getSource());
			log.info(criteria.getSource());
		}

		String sourceRefId = criteria.getSourceRefId();
                if (sourceRefId != null) {
					sourceRefId = sourceRefId.replace("[","");
					sourceRefId = sourceRefId.replace("]","");
					List<String> sourceRefIds = Arrays.asList(sourceRefId.split(","));
					addClauseIfRequired(builder);
                    if (isFuzzyEnabled) {
                        builder.append(" ndc.sourceRefId LIKE ANY(ARRAY[ ").append(createQuery(sourceRefIds)).append("])");
                        addToPreparedStatementForFuzzySearch(preparedStmtList, sourceRefIds);
                    } else {
                        builder.append(" ndc.sourceRefId IN (").append(createQuery(sourceRefIds)).append(")");
                        addToPreparedStatement(preparedStmtList, sourceRefIds);
                    }
                }

		
		String ndcType = criteria.getNdcType();
		if (ndcType!=null) {
		        List<String> ndcTypes = Arrays.asList(ndcType.split(","));
			addClauseIfRequired(builder);
			builder.append(" ndc.ndcType IN (").append(createQuery(ndcTypes)).append(")");
                        addToPreparedStatement(preparedStmtList, ndcTypes);
                        log.info(ndcType);
                }
                
                List<String> status = criteria.getStatus();
                if (status!=null) {
                        addClauseIfRequired(builder);
                        builder.append(" ndc.status IN (").append(createQuery(status)).append(")");
                        addToPreparedStatement(preparedStmtList, status);
                }

		
		log.info(criteria.toString());
		log.info("Final Query");
		log.info(builder.toString());
		if(isCount)
	            return addCountWrapper(builder.toString());
		
		return addPaginationWrapper(builder.toString(), preparedStmtList, criteria);

	}

	/**
	 * 
	 * @param query
	 *            prepared Query
	 * @param preparedStmtList
	 *            values to be replased on the query
	 * @param criteria
	 *            bpa search criteria
	 * @return the query by replacing the placeholders with preparedStmtList
	 */
	private String addPaginationWrapper(String query, List<Object> preparedStmtList, NdcSearchCriteria criteria) {

		int limit = ndcConfig.getDefaultLimit();
		int offset = ndcConfig.getDefaultOffset();
		String finalQuery = paginationWrapper.replace("{}", query);

		if (criteria.getLimit() != null && criteria.getLimit() <= ndcConfig.getMaxSearchLimit())
			limit = criteria.getLimit();

		if (criteria.getLimit() != null && criteria.getLimit() > ndcConfig.getMaxSearchLimit()) {
			limit = ndcConfig.getMaxSearchLimit();
		}

		if (criteria.getOffset() != null)
			offset = criteria.getOffset();

		if (limit == -1) {
			finalQuery = finalQuery.replace("WHERE offset_ > ? AND offset_ <= ?", "");
		} else {
			preparedStmtList.add(offset);
			preparedStmtList.add(limit + offset);
		}

		log.info(finalQuery.toString());
		return finalQuery;

	}

	private void addClauseIfRequired(StringBuilder queryString) {
			queryString.append(" AND");
	}

	private void addToPreparedStatement(List<Object> preparedStmtList, List<String> ids) {
		ids.forEach(preparedStmtList::add);

	}
	
	private void addToPreparedStatementForFuzzySearch(List<Object> preparedStmtList, List<String> ids) {
	    ids.forEach(id -> preparedStmtList.add("%"+id.trim()+"%"));
	}

	private Object createQuery(List<String> ids) {
		StringBuilder builder = new StringBuilder();
		int length = ids.size();
		for (int i = 0; i < length; i++) {
			builder.append(" ?");
			if (i != length - 1)
				builder.append(",");
		}
		return builder.toString();
	}
	
	private String addCountWrapper(String query) {
	    return countWrapper.replace("{INTERNAL_QUERY}", query);
	}
}
