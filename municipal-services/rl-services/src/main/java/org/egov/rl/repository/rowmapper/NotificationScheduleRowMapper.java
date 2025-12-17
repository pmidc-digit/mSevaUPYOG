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
    		                .lastNotificationStatus(rs.getString("last_notification_status"))
    		                .lastNotificationDate(rs.getTimestamp("last_notification_date").toLocalDateTime())
    		                .lastPaymentDate(rs.getTimestamp("last_payment_date").toLocalDateTime())
    		                .notificationCreatedDate(rs.getTimestamp("notification_created_date").toLocalDateTime())
    		                .nextCycleDate(rs.getTimestamp("nextcycle_date").toLocalDateTime())
    		                .applicationNumberStatus(rs.getString("application_number_status"))
    		                .notificationType(rs.getInt("notification_type"))
    		                .notificationCountForCurrentCycle(rs.getInt("notification_count_for_current_cycle"))
    		                .notificationType(rs.getInt("notification_type"))
    		                .noOfNotificationHavetoSend(rs.getInt("noof_notification_haveto_send"))
    		                .notificationInteravalInDay(rs.getInt("notification_interaval_inday"))
    		                .cycleCount(rs.getInt("cycle_count"))
    		                .schedullerType(rs.getString("scheduller_type"))
    		                .createdTime(rs.getLong("created_time"))
    		                .createdBy(rs.getString("created_by"))
    		                .lastmodifiedTime(rs.getLong("lastmodified_time"))
    		                .lastmodifiedBy(rs.getString("lastmodified_by"))
    		                .build());
    	}
        return list;
    };
}


