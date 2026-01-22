package org.egov.noc.repository;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.egov.noc.config.NOCConfiguration;
import org.egov.noc.producer.Producer;
import org.egov.noc.repository.builder.NocQueryBuilder;
import org.egov.noc.repository.rowmapper.NOCDocumentCheckListRowMapper;
import org.egov.noc.repository.rowmapper.NocRowMapper;
import org.egov.noc.web.model.Noc;
import org.egov.noc.web.model.NocRequest;
import org.egov.noc.web.model.NocSearchCriteria;
import org.egov.noc.web.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@Slf4j
public class NOCRepository {
	
	@Autowired
	private Producer producer;
	
	@Autowired
	private NOCConfiguration config;	

	@Autowired
	private NocQueryBuilder queryBuilder;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private NocRowMapper rowMapper;

	@Autowired
	private NOCDocumentCheckListRowMapper checkListRowMapper;
	
	/**
	 * push the nocRequest object to the producer on the save topic
	 * @param nocRequest
	 */
	public void save(NocRequest nocRequest) {
		producer.push(config.getSaveTopic(), nocRequest.getNoc().getApplicationNo(),nocRequest);
	}
	
	/**
	 * pushes the nocRequest object to updateTopic if stateupdatable else to update workflow topic
	 * @param nocRequest
	 * @param isStateUpdatable
	 */
	public void update(NocRequest nocRequest, boolean isStateUpdatable) {
		log.info("Pushing NOC record with application status - "+nocRequest.getNoc().getApplicationStatus());
		if (isStateUpdatable) {
			producer.push(config.getUpdateTopic(),nocRequest.getNoc().getApplicationNo(), nocRequest);
		} else {
		    producer.push(config.getUpdateWorkflowTopic(),nocRequest.getNoc().getApplicationNo(), nocRequest);
		}
	}
	/**
	 * using the queryBulider query the data on applying the search criteria and return the data 
	 * parsing throw row mapper
	 * @param criteria
	 * @return
	 */
	public List<Noc> getNocData(NocSearchCriteria criteria) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = queryBuilder.getNocSearchQuery(criteria, preparedStmtList, false);
		List<Noc> nocList = jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
		return nocList;
	}

	public List<DocumentCheckList> getDocumentCheckList(String applicationNo, String tenantId){
		List<Object> params = new LinkedList<>();
		String query = queryBuilder.getNOCDocumantsCheckListQuery(applicationNo, tenantId, params);
		return jdbcTemplate.query(query, params.toArray(), checkListRowMapper);
	}

	public void saveDocumentCheckList(CheckListRequest checkListRequest) {
		producer.push(config.getSaveCheckListTopic(), checkListRequest.getCheckList().get(0).getApplicationNo(),checkListRequest);
	}

	public void updateDocumentCheckList(CheckListRequest checkListRequest) {
		producer.push(config.getUpdateCheckListTopic(), checkListRequest.getCheckList().get(0).getApplicationNo(),checkListRequest);
	}
	public List<String> getOwnerUserIdsByNocId(String clu) {
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
        public Integer getNocCount(NocSearchCriteria criteria) {
                List<Object> preparedStmtList = new ArrayList<>();
                String query = queryBuilder.getNocSearchQuery(criteria, preparedStmtList, true);
                int count = jdbcTemplate.queryForObject(query, preparedStmtList.toArray(), Integer.class);
                return count;
        }

}
