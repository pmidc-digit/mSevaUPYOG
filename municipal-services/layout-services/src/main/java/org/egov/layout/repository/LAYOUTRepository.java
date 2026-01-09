package org.egov.layout.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.egov.layout.config.LAYOUTConfiguration;
import org.egov.layout.producer.Producer;
import org.egov.layout.repository.builder.LayoutQueryBuilder;
import org.egov.layout.repository.rowmapper.LayoutRowMapper;
import org.egov.layout.web.model.Layout;
import org.egov.layout.web.model.LayoutRequest;
import org.egov.layout.web.model.LayoutSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@Slf4j
public class LAYOUTRepository {
	
	@Autowired
	private Producer producer;
	
	@Autowired
	private LAYOUTConfiguration config;

	@Autowired
	private LayoutQueryBuilder queryBuilder;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private LayoutRowMapper rowMapper;
	
	/**
	 * push the nocRequest object to the producer on the save topic
	 * @param nocRequest
	 */
	public void save(LayoutRequest nocRequest) {
		producer.push(config.getSaveTopic(), nocRequest);
	}
	
	/**
	 * pushes the nocRequest object to updateTopic if stateupdatable else to update workflow topic
	 * @param nocRequest
	 * @param isStateUpdatable
	 */
	public void update(LayoutRequest nocRequest, boolean isStateUpdatable) {
		log.info("Pushing NOC record with application status - "+nocRequest.getLayout().getApplicationStatus());
		if (isStateUpdatable) {
			producer.push(config.getUpdateTopic(), nocRequest);
		} else {
		    producer.push(config.getUpdateWorkflowTopic(), nocRequest);
		}
	}




	private static final String SQL_GET_USER_IDS =
			"SELECT uuid FROM eg_layoutowner WHERE layout_id = ?";

	/**
	 * Fetches all user_ids for a given layout_id.

	 * @param layoutId layout id
	 * @return list of user_ids; empty list if none found
	 * @throws SQLException if a database access error occurs
	 */

	public List<String> getOwnerUserIdsByLayoutId(String layoutId) {
		List<Object> preparedStmtList = new ArrayList<>();

		// Build SQL via your QueryBuilder: e.g., "SELECT user_id FROM eg_layoutowner WHERE layout_id = ?"
		String query = queryBuilder.getOwnerUserIdsQuery(layoutId, preparedStmtList);

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
	 * using the queryBulider query the data on applying the search criteria and return the data 
	 * parsing throw row mapper
	 * @param criteria
	 * @return
	 */
	public List<Layout> getNocData(LayoutSearchCriteria criteria) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = queryBuilder.getNocSearchQuery(criteria, preparedStmtList, false);
		List<Layout> nocList = jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
		return nocList;
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

}
