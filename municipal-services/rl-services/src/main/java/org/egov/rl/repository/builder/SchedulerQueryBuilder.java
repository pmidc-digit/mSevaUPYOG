
package org.egov.rl.repository.builder;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class SchedulerQueryBuilder {
//	
//	private static final String BASE_QUERY ="SELECT "
//			+ "ar.*"
//			+ "FROM eg_rl_allotment_scheduler ar "
//			+ "INNER JOIN eg_rl_allotment ap ON ap.id = ar.allotment_id"
//			+ " where ar.status=1 AND payment_success_id IS NULL ORDER BY ar.notification_created_date DESC ";
	

	private static final String BASE_QUERY ="SELECT "
			+ "ar.*"
			+ " FROM eg_rl_allotment_scheduler ar "
			+ "INNER JOIN eg_rl_allotment ap ON ap.id = ar.allotment_id"
			+ " where ar.application_number_status='ACTIVE'";// AND (ar.nextcycle_date::date - CURRENT_DATE) >= -7 AND (ar.nextcycle_date::date - CURRENT_DATE) <= 7 ORDER BY ar.notification_created_date DESC ";
	
	// after payment have to update :  ispayement_reminder=false and nextcycle_date=next date for payment
	
	public String getSchdulerQuery() {
		StringBuilder subQuery = new StringBuilder("");
		subQuery.append(BASE_QUERY);
		return subQuery.toString();
	}
	
	public String getSchdulerQueryByApplicationnumber(String applicationNumber) {
		StringBuilder subQuery = new StringBuilder("");
		subQuery.append(BASE_QUERY+" AND ar.application_number="+applicationNumber);
		return subQuery.toString();
	}

}
