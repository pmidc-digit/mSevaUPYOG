package org.egov.layout.repository;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.egov.layout.config.CLUConfiguration;
import org.egov.layout.producer.Producer;
import org.egov.layout.repository.builder.CluQueryBuilder;
import org.egov.layout.repository.rowmapper.CLUDocumentCheckListRowMapper;
import org.egov.layout.repository.rowmapper.CluRowMapper;
import org.egov.layout.web.model.Clu;
import org.egov.layout.web.model.CluRequest;
import org.egov.layout.web.model.LayoutSearchCriteria;
import org.egov.layout.web.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@Slf4j
public class CLURepository {
	
	@Autowired
	private Producer producer;
	
	@Autowired
	private CLUConfiguration config;

	@Autowired
	private CluQueryBuilder queryBuilder;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private CluRowMapper rowMapper;

	@Autowired
	private CLUDocumentCheckListRowMapper checkListRowMapper;
	
	/**
	 * push the nocRequest object to the producer on the save topic
	 * @param nocRequest
	 */
	public void save(CluRequest nocRequest) {
		producer.push(config.getSaveTopic(),nocRequest.getLayout().getApplicationNo(), nocRequest);
	}
	
	/**
	 * pushes the nocRequest object to updateTopic if stateupdatable else to update workflow topic
	 * @param nocRequest
	 * @param isStateUpdatable
	 */
	public void update(CluRequest nocRequest, boolean isStateUpdatable) {
		log.info("Pushing NOC record with application status - "+nocRequest.getLayout().getApplicationStatus());
		if (isStateUpdatable) {
			producer.push(config.getUpdateTopic(),nocRequest.getLayout().getApplicationNo(), nocRequest);
		} else {
		    producer.push(config.getUpdateWorkflowTopic(),nocRequest.getLayout().getApplicationNo(), nocRequest);
		}
	}
	/**
	 * using the queryBulider query the data on applying the search criteria and return the data 
	 * parsing throw row mapper
	 * @param criteria
	 * @return
	 */
	public List<Clu> getNocData(LayoutSearchCriteria criteria) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = queryBuilder.getNocSearchQuery(criteria, preparedStmtList, false);
		List<Clu> nocList = jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
		return nocList;
	}


	public List<String> getOwnerUserIdsByCluId(String clu) {
		List<Object> preparedStmtList = new ArrayList<>();

		// Build SQL via your QueryBuilder: e.g., "SELECT user_id FROM eg_layoutowner WHERE layout_id = ?"
		String query = queryBuilder.getOwnerUserIdsQuery(clu, preparedStmtList);

		// Map each row's "user_id" to Long
		List<String> userIds = jdbcTemplate.query(
				query,
				preparedStmtList.toArray(),
				(rs, rowNum) -> {
					String userId = rs.getString("uuid");
					// If user_id can be NULL, guard with rs.wasNull()
					return userId;
				}
		);

		return userIds;
	}
	/**
         * using the queryBulider query the data on applying the search criteria and return the count 
         * parsing throw row mapper
         * @param criteria
         * @return
         */
        public Integer getNocCount(LayoutSearchCriteria criteria) {
                List<Object> preparedStmtList = new ArrayList<>();
                String query = queryBuilder.getNocSearchQuery(criteria, preparedStmtList, true);
                int count = jdbcTemplate.queryForObject(query, preparedStmtList.toArray(), Integer.class);
                return count;
        }
	public List<DocumentCheckList> getDocumentCheckList(String applicationNo, String tenantId){
		List<Object> params = new LinkedList<>();
		String query = queryBuilder.getCLUDocumantsCheckListQuery(applicationNo, tenantId, params);
		return jdbcTemplate.query(query, params.toArray(), checkListRowMapper);
	}

	public void saveDocumentCheckList(CheckListRequest checkListRequest) {
		producer.push(config.getSaveCheckListTopic(),checkListRequest.getCheckList().get(0).getApplicationNo(), checkListRequest);
	}

	public void updateDocumentCheckList(CheckListRequest checkListRequest) {
		producer.push(config.getUpdateCheckListTopic(),checkListRequest.getCheckList().get(0).getApplicationNo(), checkListRequest);
	}

}
