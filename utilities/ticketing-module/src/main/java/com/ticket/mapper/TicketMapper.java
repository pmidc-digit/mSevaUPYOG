package com.ticket.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import com.ticket.model.Ticket;

public class TicketMapper implements RowMapper<Ticket> {

	@Override
	public Ticket mapRow(ResultSet rs, int rowNum) throws SQLException {
		Ticket ticket = new Ticket();

		ticket.setTktId(rs.getInt("tkt_id"));
		ticket.setProjectId(rs.getInt("project_id"));
		ticket.setProject(rs.getString("project_name"));
		ticket.setUlbId(rs.getInt("ulb_id"));
		ticket.setUlbName(rs.getString("town_name"));
		ticket.setRaisedById(rs.getInt("raised_by_id"));
		ticket.setAssignedToId(rs.getInt("assigned_to_id"));
		ticket.setRaiserName(rs.getString("raiser_name"));
		ticket.setAssigneeName(rs.getString("assignee_name"));
		ticket.setTktTypeId(rs.getInt("tkt_type_id"));
		ticket.setTktType(rs.getString("type"));
		ticket.setTktDescription(rs.getString("tkt_description"));
		ticket.setAttachment(rs.getString("attachment"));
		ticket.setTktSummary(rs.getString("tkt_summary"));
		ticket.setRaisedDate(rs.getString("raised_date"));
		ticket.setUpdatedDate(rs.getString("updated_date"));
		ticket.setClosedDate(rs.getString("closed_date"));
		ticket.setIssueCategoryName(rs.getString("issue_category"));
		ticket.setReadStatus(rs.getInt("comment"));
		if (rs.getInt("issue_feedback_id") == 0) ticket.setIssueFeedbackName("Pending");
		else ticket.setIssueFeedbackName(rs.getString("feedback"));
		
		ticket.setStatus(rs.getInt("status"));
		if (rs.getInt("environment_type") == 1) ticket.setEnvironment("UAT");
		else ticket.setEnvironment("Production");

		return ticket;
	}

}
