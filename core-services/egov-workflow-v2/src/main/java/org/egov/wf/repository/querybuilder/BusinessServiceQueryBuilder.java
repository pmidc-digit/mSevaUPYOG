package org.egov.wf.repository.querybuilder;

import org.egov.wf.web.models.BusinessServiceSearchCriteria;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.List;

@Component
public class BusinessServiceQueryBuilder {



     private static final String INNER_JOIN = " INNER JOIN ";

     private static final String LEFT_OUTER_JOIN = " LEFT OUTER JOIN ";

     private static final String BASE_QUERY = "SELECT bs.*,st.*,ac.*,bs.uuid as bs_uuid," +
             " bs.lastModifiedTime as bs_lastModifiedTime,bs.createdTime as bs_createdTime," +
             "bs.createdBy as bs_createdBy,bs.lastModifiedBy as bs_lastModifiedBy,bs.tenantId as bs_tenantId," +
             " st.lastModifiedTime as st_lastModifiedTime,st.createdTime as st_createdTime," +
             "st.tenantId as st_tenantId,st.createdBy as st_createdBy,st.uuid as st_uuid," +
             " st.lastModifiedBy as st_lastModifiedBy,"  +
             " ac.lastModifiedTime as ac_lastModifiedTime,ac.createdTime as ac_createdTime," +
             "ac.createdBy as ac_createdBy,ac.lastModifiedBy as ac_lastModifiedBy," +
             "ac.uuid as ac_uuid,ac.tenantId as ac_tenantId,ac.active as ac_active "  +
             " FROM eg_wf_businessService_v2 bs " +
            INNER_JOIN + " eg_wf_state_v2 st ON st.businessServiceId = bs.uuid " +
            LEFT_OUTER_JOIN  + " eg_wf_action_v2 ac ON ac.currentState = st.uuid AND ac.active=TRUE ";




    public String getBusinessServices(BusinessServiceSearchCriteria criteria, List<Object> preparedStmtList){
        StringBuilder builder = new StringBuilder(BASE_QUERY);

        String tenantId = criteria.getTenantId();
        if (tenantId != null) {
            addClauseIfRequired(preparedStmtList, builder);
            builder.append(" bs.tenantId = ? ");
            preparedStmtList.add(tenantId);
        }

        List<String> businessServices = criteria.getBusinessServices();
        if (!CollectionUtils.isEmpty(businessServices)) {
            addClauseIfRequired(preparedStmtList, builder);
            builder.append("  bs.businessService IN (").append(createQuery(businessServices)).append(")");
            addToPreparedStatement(preparedStmtList, businessServices);
        }

        List<String> stateUuids = criteria.getStateUuids();
        if (!CollectionUtils.isEmpty(stateUuids)) {
            addClauseIfRequired(preparedStmtList, builder);
            builder.append("  st.uuid IN (").append(createQuery(stateUuids)).append(")");
            addToPreparedStatement(preparedStmtList, stateUuids);
        }

        List<String> actionUuids = criteria.getActionUuids();
        if (!CollectionUtils.isEmpty(actionUuids)) {
            addClauseIfRequired(preparedStmtList, builder);
            builder.append("  ac.uuid IN (").append(createQuery(actionUuids)).append(")");
            addToPreparedStatement(preparedStmtList, actionUuids);
        }

        builder.append(" ORDER BY seq");

        return builder.toString();
    }


    /**
     * Tenant-scoped, paginated query used by the workflow legacy-index backfill.
     * <p>
     * Unlike {@link #getBusinessServices} this does no MDMS state-level splitting
     * and applies a single tenant filter: a state-level tenantId (no dots) matches
     * with LIKE so one run covers the state and its ULBs, while a ULB tenantId
     * matches exactly.
     * <p>
     * OFFSET/LIMIT are mandatory: the indexer's legacy job pages by incrementing
     * offset until a page comes back empty, so an unpaginated response would make
     * the job loop forever.
     */
    public String getBusinessServicesForPlainSearch(BusinessServiceSearchCriteria criteria, List<Object> preparedStmtList) {
        StringBuilder builder = new StringBuilder(BASE_QUERY);

        String tenantId = criteria.getTenantId();
        if (tenantId != null) {
            addClauseIfRequired(preparedStmtList, builder);
            if (tenantId.split("\\.").length == 1) {
                builder.append(" bs.tenantId like ? ");
                preparedStmtList.add('%' + tenantId + '%');
            } else {
                builder.append(" bs.tenantId = ? ");
                preparedStmtList.add(tenantId);
            }
        }

        List<String> businessServices = criteria.getBusinessServices();
        if (!CollectionUtils.isEmpty(businessServices)) {
            addClauseIfRequired(preparedStmtList, builder);
            builder.append("  bs.businessService IN (").append(createQuery(businessServices)).append(")");
            addToPreparedStatement(preparedStmtList, businessServices);
        }

        builder.append(" ORDER BY seq");
        builder.append(" OFFSET ? LIMIT ?");
        preparedStmtList.add(criteria.getOffset() != null && criteria.getOffset() >= 0 ? criteria.getOffset() : 0);
        preparedStmtList.add(criteria.getLimit() != null && criteria.getLimit() > 0 ? criteria.getLimit() : 50);

        return builder.toString();
    }


    /*
     * private String createQuery(Set<String> ids) {
     *
     * final String quotes = "'"; final String comma = ","; StringBuilder builder =
     * new StringBuilder(); Iterator<String> iterator = ids.iterator();
     * while(iterator.hasNext()) {
     * builder.append(quotes).append(iterator.next()).append(quotes);
     * if(iterator.hasNext()) builder.append(comma); } return builder.toString(); }
     */

    private String createQuery(List<String> ids) {
        StringBuilder builder = new StringBuilder();
        int length = ids.size();
        for (int i = 0; i < length; i++) {
            builder.append(" ?");
            if (i != length - 1)
                builder.append(",");
        }
        return builder.toString();
    }

    private void addToPreparedStatement(List<Object> preparedStmtList, List<String> ids) {
        ids.forEach(id -> {
            preparedStmtList.add(id);
        });
    }

    private static void addClauseIfRequired(List<Object> values, StringBuilder queryString) {
        if (values.isEmpty())
            queryString.append(" WHERE ");
        else {
            queryString.append(" AND");
        }
    }


}
