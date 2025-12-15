package org.egov.rl.repository.rowmapper;

import org.egov.rl.models.NotificationSchedule;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class NotificationScheduleRowMapper implements ResultSetExtractor<List<NotificationSchedule>> {

	@Override
    public List<NotificationSchedule> extractData(ResultSet rs) throws SQLException, DataAccessException {

		List<NotificationSchedule> list = new ArrayList<>();
    	while (rs.next()) {

    		 list.add(NotificationSchedule.builder()
    		                .id(rs.getString("id"))
    		                .allotmentId(rs.getString("allotment_id"))
    		                .applicationNumber(rs.getString("application_number"))
    		                .tenantId(rs.getString("tenant_id"))
    		                .status(rs.getInt("status"))
    		                .paymentSuccessId(rs.getString("payment_success_id"))
    		                .demandId(rs.getString("demand_id"))
//    		                .currentNotificationDate(rs.getLong("current_notification_date"))
//    		                .nextCycle(rs.getString("next_cycle"))
//    		                .nextNotificationDate(rs.getString("next_notification_date"))
    		                .notificationType(rs.getInt("notification_type"))
//    		                .notificationStatus(rs.getInt("notification_status"))
    		                .notificationCountForCurrentCycle(rs.getInt("notification_count_for_current_cycle"))
//    		                .notificationMessage(rs.getString("notification_message"))
//    		                .paymentLink(rs.getString("payment_link"))
    		                .createdTime(rs.getLong("created_time"))
    		                .createdBy(rs.getString("created_by"))
//    		                .lastmodifiedTime(0)
    		                .lastmodifiedBy(rs.getString("lastmodified_by"))
    		                .build());
    	}
        return list;
    };
}


