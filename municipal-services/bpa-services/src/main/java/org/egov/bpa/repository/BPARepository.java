package org.egov.bpa.repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.egov.bpa.config.BPAConfiguration;
import org.egov.bpa.producer.Producer;
import org.egov.bpa.repository.querybuilder.BPAQueryBuilder;
import org.egov.bpa.repository.rowmapper.BPADocumentCheckListRowMapper;
import org.egov.bpa.repository.rowmapper.BPARowMapper;
import org.egov.bpa.web.model.BPA;
import org.egov.bpa.web.model.BPARequest;
import org.egov.bpa.web.model.BPASearchCriteria;
import org.egov.bpa.web.model.CheckListRequest;
import org.egov.bpa.web.model.DocumentCheckList;
import org.egov.common.contract.request.RequestInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class BPARepository {

	@Autowired
	private BPAConfiguration config;

	@Autowired
	private Producer producer;

	@Autowired
	private BPAQueryBuilder queryBuilder;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private BPARowMapper rowMapper;
	
	@Autowired
	private BPADocumentCheckListRowMapper checkListRowMapper;

	/**
	 * Pushes the request on save topic through kafka
	 *
	 * @param bpaRequest
	 *            The bpa create request
	 */
	public void save(BPARequest bpaRequest) {
		producer.push(config.getSaveTopic(),bpaRequest.getBPA().getApplicationNo(), bpaRequest);
	}

	/**
	 * pushes the request on update or workflow update topic through kafaka based on th isStateUpdatable 
	 * @param bpaRequest
	 * @param isStateUpdatable
	 */
	public void update(BPARequest bpaRequest, boolean isStateUpdatable) {
		RequestInfo requestInfo = bpaRequest.getRequestInfo();

		BPA bpaForStatusUpdate = null;
		BPA bpaForUpdate = null;

		BPA bpa = bpaRequest.getBPA();

		if (isStateUpdatable) {
			bpaForUpdate = bpa;
		} else {
			bpaForStatusUpdate = bpa;
		}
		if (bpaForUpdate != null)
			producer.push(config.getUpdateTopic(),bpaRequest.getBPA().getApplicationNo(), new BPARequest(requestInfo, bpaForUpdate));

		if (bpaForStatusUpdate != null)
			producer.push(config.getUpdateWorkflowTopic(),bpaRequest.getBPA().getApplicationNo(), new BPARequest(requestInfo, bpaForStatusUpdate));

	}

	/**
	 * BPA search in database
	 *
	 * @param criteria
	 *            The BPA Search criteria
	 * @return List of BPA from search
	 */
	public List<BPA> getBPAData(BPASearchCriteria criteria, List<String> edcrNos) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = queryBuilder.getBPASearchQuery(criteria, preparedStmtList, edcrNos, false);
		List<BPA> BPAData = jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
		return BPAData;
	}
	
	/**
         * BPA search count in database
         *
         * @param criteria
         *            The BPA Search criteria
         * @return count of BPA from search
         */
        public int getBPACount(BPASearchCriteria criteria, List<String> edcrNos) {
                List<Object> preparedStmtList = new ArrayList<>();
                String query = queryBuilder.getBPASearchQuery(criteria, preparedStmtList, edcrNos, true);
                int count = jdbcTemplate.queryForObject(query, preparedStmtList.toArray(), Integer.class);
                return count;
        }
        
        public List<BPA> getBPADataForPlainSearch(BPASearchCriteria criteria, List<String> edcrNos) {
    		List<Object> preparedStmtList = new ArrayList<>();
    		String query = queryBuilder.getBPASearchQueryForPlainSearch(criteria, preparedStmtList, edcrNos, false);
    		List<BPA> BPAData = jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
    		return BPAData;
    	}
        
        public List<DocumentCheckList> getDocumentCheckList(String applicationNo, String tenantId){
        	List<Object> params = new LinkedList<>();
        	String query = queryBuilder.getBPADocumantsCheckListQuery(applicationNo, tenantId, params);
        	return jdbcTemplate.query(query, params.toArray(), checkListRowMapper);
        }
        
        public void saveDocumentCheckList(CheckListRequest checkListRequest) {
        	producer.push(config.getSaveCheckListTopic(),checkListRequest.getCheckList().get(0).getApplicationNo(), checkListRequest);
    	}
        
        public void updateDocumentCheckList(CheckListRequest checkListRequest) {
        	producer.push(config.getUpdateCheckListTopic(),checkListRequest.getCheckList().get(0).getApplicationNo(), checkListRequest);
    	}

}
