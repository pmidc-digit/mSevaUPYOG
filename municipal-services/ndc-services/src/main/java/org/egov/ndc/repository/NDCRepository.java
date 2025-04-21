package org.egov.ndc.repository;

import java.util.ArrayList;
import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.egov.ndc.config.NDCConfiguration;
import org.egov.ndc.producer.Producer;
import org.egov.ndc.repository.builder.NdcQueryBuilder;
import org.egov.ndc.repository.rowmapper.NdcRowMapper;
import org.egov.ndc.web.model.Ndc;
import org.egov.ndc.web.model.NdcRequest;
import org.egov.ndc.web.model.NdcSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@Slf4j
public class NDCRepository {
	
	@Autowired
	private Producer producer;
	
	@Autowired
	private NDCConfiguration config;	

	@Autowired
	private NdcQueryBuilder queryBuilder;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private NdcRowMapper rowMapper;
	
	/**
	 * push the ndcRequest object to the producer on the save topic
	 * @param ndcRequest
	 */
//	public void save(NdcRequest ndcRequest) {
//		producer.push(config.getSaveTopic(), ndcRequest);
//	}
	
	/**
	 * pushes the ndcRequest object to updateTopic if stateupdatable else to update workflow topic
	 * @param ndcRequest
	 * @param isStateUpdatable
	 */
//	public void update(NdcRequest ndcRequest, boolean isStateUpdatable) {
//		log.info("Pushing NDC record with application status - "+ndcRequest.getNdc().getApplicationStatus());
//		if (isStateUpdatable) {
//			producer.push(config.getUpdateTopic(), ndcRequest);
//		} else {
//		    producer.push(config.getUpdateWorkflowTopic(), ndcRequest);
//		}
//	}
	/**
	 * using the queryBulider query the data on applying the search criteria and return the data 
	 * parsing throw row mapper
	 * @param criteria
	 * @return
	 */
	public List<Ndc> getNdcData(NdcSearchCriteria criteria) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = queryBuilder.getNdcSearchQuery(criteria, preparedStmtList, false);
		List<Ndc> ndcList = jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
		return ndcList;
	}
	
	/**
         * using the queryBulider query the data on applying the search criteria and return the count 
         * parsing throw row mapper
         * @param criteria
         * @return
         */
        public Integer getNdcCount(NdcSearchCriteria criteria) {
                List<Object> preparedStmtList = new ArrayList<>();
                String query = queryBuilder.getNdcSearchQuery(criteria, preparedStmtList, true);
                int count = jdbcTemplate.queryForObject(query, preparedStmtList.toArray(), Integer.class);
                return count;
        }

}
