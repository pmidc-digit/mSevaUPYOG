package org.egov.wf.repository.rowmapper;


import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.egov.common.contract.request.User;
import org.egov.wf.web.models.Action;
import org.egov.wf.web.models.AuditDetails;
import org.egov.wf.web.models.Document;
import org.egov.wf.web.models.FileEmployees;
import org.egov.wf.web.models.ProcessInstance;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class FileEmployeeRowMapper implements ResultSetExtractor<List<FileEmployees>> {


    /**
     * Converts resultset to List of processInstances	
     * @param rs The resultSet from db query
     * @return List of ProcessInstances from the resultset
     * @throws SQLException
     * @throws DataAccessException
     */
    public List<FileEmployees> extractData(ResultSet rs) throws SQLException, DataAccessException {
    	List<FileEmployees> employeesList = new ArrayList<>();
        while (rs.next()){
            
            FileEmployees employees = new FileEmployees();
            employees.setId(rs.getString("id"));
            employees.setName(rs.getString("name"));
            employees.setIsCurrent(rs.getString("is_current"));
            employees.setClearenceDate(rs.getString("lastmodifiedtime"));
            employees.setFileDate(rs.getString("createdtime"));
            employeesList.add(employees);
        }
        return new ArrayList<>(employeesList);
    }


    /**
     * Adds nested object to the parent
     * @param rs The resultSet from db query
     * @param processInstance The parent ProcessInstance Object
     * @throws SQLException
     */
    private void addChildrenToProperty(ResultSet rs, ProcessInstance processInstance) throws SQLException {

        // Building the assignes object
        String assigneeUuid = rs.getString("assigneeuuid");

        if(!StringUtils.isEmpty(assigneeUuid)){
            processInstance.addUsersItem(User.builder().uuid(assigneeUuid).build());
        }


        String documentId = rs.getString("doc_id");

        if(documentId!=null){

            Long lastModifiedTime = rs.getLong("doc_lastModifiedTime");
            if (rs.wasNull()) {
                lastModifiedTime = null;
            }

            AuditDetails auditdetails = AuditDetails.builder()
                    .createdBy(rs.getString("doc_createdBy"))
                    .createdTime(rs.getLong("doc_createdTime"))
                    .lastModifiedBy(rs.getString("doc_lastModifiedBy"))
                    .lastModifiedTime(lastModifiedTime)
                    .build();

            Document document = Document.builder()
                    .id(documentId)
                    .tenantId(rs.getString("doc_tenantid"))
                    .documentUid(rs.getString("documentUid"))
                    .documentType(rs.getString("documentType"))
                    .fileStoreId(rs.getString("fileStoreId"))
                    .auditDetails(auditdetails)
                    .build();
            processInstance.addDocumentsItem(document);
        }

        String actionUuid = rs.getString("ac_uuid");
        /*
         * null check added for action id to avoid adding empty action object in end state
         * 
         * also avoiding action related errors on end state
         */
        if(null != actionUuid) {
        String roles = rs.getString("roles");
        Action action = Action.builder()
                .tenantId(rs.getString("ac_tenantId"))
                .action(rs.getString("ac_action"))
                .nextState(rs.getString("nextState"))
                .uuid(actionUuid)
                .currentState(rs.getString("currentState"))
                .roles(StringUtils.isEmpty(roles) ? Arrays.asList() : Arrays.asList(roles.split(","))) 
                .build();
        processInstance.getState().addActionsItem(action);
        }
    }



    }
