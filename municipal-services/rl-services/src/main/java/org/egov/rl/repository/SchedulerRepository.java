
package org.egov.rl.repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import org.egov.rl.models.AllotmentClsure;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.ClosureCriteria;
import org.egov.rl.models.NotificationSchedule;
import org.egov.rl.repository.builder.AllotmentQueryBuilder;
import org.egov.rl.repository.builder.ClosureApplicationSearchQueryBuilder;
import org.egov.rl.repository.builder.ClsureQueryBuilder;
import org.egov.rl.repository.builder.SchedulerQueryBuilder;
import org.egov.rl.repository.rowmapper.AllotmentRowMapper;
import org.egov.rl.repository.rowmapper.ClsurerRowMapper;
import org.egov.rl.repository.rowmapper.NotificationScheduleRowMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Slf4j
@Repository
public class SchedulerRepository {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private SchedulerQueryBuilder schedulerQueryBuilder;
	
	@Autowired
	private NotificationScheduleRowMapper rowMapper;
    
	
	public List<NotificationSchedule> getNotifications() {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = schedulerQueryBuilder.getSchdulerQuery();
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);

	}
	
	public List<NotificationSchedule> getNotificationsByApplicationNumber(String applicationNumber) {
		List<Object> preparedStmtList = new ArrayList<>();
		String query = schedulerQueryBuilder.getSchdulerQueryByApplicationnumber(applicationNumber);
        return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);

	}
	

}
