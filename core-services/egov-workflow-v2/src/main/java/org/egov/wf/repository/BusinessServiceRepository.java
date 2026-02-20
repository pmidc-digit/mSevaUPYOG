package org.egov.wf.repository;

import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.Role;
import org.egov.tracer.model.CustomException;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.repository.querybuilder.BusinessServiceQueryBuilder;
import org.egov.wf.repository.rowmapper.BusinessServiceRowMapper;
import org.egov.wf.service.MDMSService;
import org.egov.wf.web.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;

import java.util.*;

@Slf4j
@Repository
public class BusinessServiceRepository {


    private BusinessServiceQueryBuilder queryBuilder;

    private JdbcTemplate jdbcTemplate;

    private BusinessServiceRowMapper rowMapper;

    private WorkflowConfig config;

    private MDMSService mdmsService;


    @Autowired
    public BusinessServiceRepository(BusinessServiceQueryBuilder queryBuilder, JdbcTemplate jdbcTemplate,
                                     BusinessServiceRowMapper rowMapper, WorkflowConfig config, MDMSService mdmsService) {
        this.queryBuilder = queryBuilder;
        this.jdbcTemplate = jdbcTemplate;
        this.rowMapper = rowMapper;
        this.config = config;
        this.mdmsService = mdmsService;
    }






    public List<BusinessService> getBusinessServices(BusinessServiceSearchCriteria criteria){
        String query;

        List<String> stateLevelBusinessServices = new LinkedList<>();
        List<String> tenantBusinessServices = new LinkedList<>();

        Map<String, Boolean> stateLevelMapping = mdmsService.getStateLevelMapping();

        if(!CollectionUtils.isEmpty(criteria.getBusinessServices())){

            criteria.getBusinessServices().forEach(businessService -> {
                if(stateLevelMapping.get(businessService)==null || stateLevelMapping.get(businessService))
                    stateLevelBusinessServices.add(businessService);
                else
                    tenantBusinessServices.add(businessService);
            });
        }

        List<BusinessService> searchResults = new LinkedList<>();

        if(!CollectionUtils.isEmpty(stateLevelBusinessServices)){
            BusinessServiceSearchCriteria stateLevelCriteria = new BusinessServiceSearchCriteria();
            stateLevelCriteria.setTenantId(criteria.getTenantId().split("\\.")[0]);
            stateLevelCriteria.setBusinessServices(stateLevelBusinessServices);
            List<Object> stateLevelPreparedStmtList = new ArrayList<>();
            query = queryBuilder.getBusinessServices(stateLevelCriteria, stateLevelPreparedStmtList);
            searchResults.addAll(jdbcTemplate.query(query, stateLevelPreparedStmtList.toArray(), rowMapper));
        }
        if(!CollectionUtils.isEmpty(tenantBusinessServices)){
            BusinessServiceSearchCriteria tenantLevelCriteria = new BusinessServiceSearchCriteria();
            tenantLevelCriteria.setTenantId(criteria.getTenantId());
            tenantLevelCriteria.setBusinessServices(tenantBusinessServices);
            List<Object> tenantLevelPreparedStmtList = new ArrayList<>();
            query = queryBuilder.getBusinessServices(tenantLevelCriteria, tenantLevelPreparedStmtList);
            searchResults.addAll(jdbcTemplate.query(query, tenantLevelPreparedStmtList.toArray(), rowMapper));
        }

        return searchResults;
    }


    /**
     * Creates map of roles vs tenantId vs List of status uuids from all the avialable businessServices
     * @return
     */
    @Cacheable(value = "roleTenantAndStatusesMapping")
    public Map<String,Map<String,List<String>>> getRoleTenantAndStatusMapping(ProcessInstanceSearchCriteria criteria){


        Map<String, Map<String,List<String>>> roleTenantAndStatusMapping = new HashMap();

        List<BusinessService> businessServices = getAllBusinessService(criteria);

        for(BusinessService businessService : businessServices){

            String tenantId = businessService.getTenantId();

            // Collect all roles present in this business service (from any state's actions)
            Set<String> rolesInService = new HashSet<>();
            businessService.getStates().forEach(st -> {
                if(!CollectionUtils.isEmpty(st.getActions())){
                    st.getActions().forEach(ac -> {
                        if(!CollectionUtils.isEmpty(ac.getRoles())){
                            rolesInService.addAll(ac.getRoles());
                        }
                    });
                }
            });

            for(State state : businessService.getStates()){

                String uuid = state.getUuid();

                // Ensure terminate states are also counted (they usually have no actions/roles)
                if (Boolean.TRUE.equals(state.getIsTerminateState())) {
                    // Add terminate state to all roles seen in this business service
                    for (String role : rolesInService) {
                        Map<String, List<String>> tenantToStatusMap = roleTenantAndStatusMapping.get(role);
                        if (tenantToStatusMap == null) {
                            tenantToStatusMap = new HashMap<>();
                            roleTenantAndStatusMapping.put(role, tenantToStatusMap);
                        }

                        List<String> statuses = tenantToStatusMap.get(tenantId);
                        if (statuses == null) {
                            statuses = new LinkedList<>();
                            tenantToStatusMap.put(tenantId, statuses);
                        }

                        if (!statuses.contains(uuid)) {
                            statuses.add(uuid);
                        }
                    }
                }

                if(!CollectionUtils.isEmpty(state.getActions())){

                    for(Action action : state.getActions()){

                        List<String> roles = action.getRoles();

                        if(!CollectionUtils.isEmpty(roles)){
                            for(String role : roles){

                                Map<String, List<String>> tenantToStatusMap;

                                if (roleTenantAndStatusMapping.containsKey(role))
                                    tenantToStatusMap = roleTenantAndStatusMapping.get(role);
                                else tenantToStatusMap = new HashMap();

                                List<String> statuses;

                                if(tenantToStatusMap.containsKey(tenantId))
                                    statuses = tenantToStatusMap.get(tenantId);
                                else statuses = new LinkedList<>();

                                statuses.add(uuid);

                                tenantToStatusMap.put(tenantId, statuses);
                                roleTenantAndStatusMapping.put(role, tenantToStatusMap);
                            }
                        }
                    }

                }

            }

        }

        return roleTenantAndStatusMapping;

    }

    /**
     * Returns all the avialable businessServices
     * @return
     */
    private List<BusinessService> getAllBusinessService(ProcessInstanceSearchCriteria criteria){

        List<Object> preparedStmtList = new ArrayList<>();
        String query=null;

        BusinessServiceSearchCriteria businessCriteria = new BusinessServiceSearchCriteria();

        if (criteria != null && criteria.getBusinessService() != null) {
            businessCriteria.setBusinessServices(
                Arrays.asList(criteria.getBusinessService())
            );
        }

        query = queryBuilder.getBusinessServices(businessCriteria, preparedStmtList);

        List<BusinessService> businessServices =
                jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);

        return filterBusinessServices(businessServices);
    }



    /**
     * Will filter out configurations which are not in sync with MDMS master data
     * @param businessServices
     * @return
     */
    private List<BusinessService> filterBusinessServices(List<BusinessService> businessServices){

        Map<String, Boolean> stateLevelMapping = mdmsService.getStateLevelMapping();
        List<BusinessService> filteredBusinessService = new LinkedList<>();

        for(BusinessService businessService : businessServices){

            String code = businessService.getBusinessService();
            String tenantId = businessService.getTenantId();
            Boolean isStatelevel = stateLevelMapping.get(code);

            if(isStatelevel == null){
                isStatelevel = true;
               // throw new CustomException("INVALID_MDMS_CONFIG","The master data is missing for businessService: "+code);
            }

            if(isStatelevel){
                if(tenantId.equalsIgnoreCase(config.getStateLevelTenantId())){
                    filteredBusinessService.add(businessService);
                }
            }
            else {
                if(!tenantId.equalsIgnoreCase(config.getStateLevelTenantId())){
                    filteredBusinessService.add(businessService);
                }
            }
        }

        return filteredBusinessService;
    }





}
