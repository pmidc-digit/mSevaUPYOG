package com.ticket.dao;

import java.util.List;
import java.util.Map;

import com.ticket.model.Project;
import com.ticket.model.Ticket;
import com.ticket.model.User;

public interface TicketDao {

	public List<Ticket> getAllTicketRaisedByMe(int userId, int status);

	public List<Ticket> getAllTicketAssignedToMe(int userId, int status);

	public List<Ticket> getAllTicket(int userId);

	public long countAllTicketRaisedByMe(int userId);

	public long countAllTicketReportedByMe(int userId);

	public long countAllTicket(int userId);

	public long countPendingTicket(int userId);
	
	public long countResolvedTicket(int userId);
	
	public long countTotalPendingTicket();
	
	public long countTotalResolvedTicket();

	public List<Map<String, Object>> getProject();

	public List<Map<String, Object>> getIssueType();
	
	public List<Map<String, Object>> getTktIssueType();

	public List<Map<String, Object>> getUser(int userId);

	public List<Map<String, Object>> getTowns();

	public List<Map<String, Object>> getPriority();

	public int insertTicketWithImg(Ticket ticket,User usr);
	
	public int insertTicketWithoutImg(Ticket ticket,User usr);

	public List<Map<String, Object>> getAllRaisedTicketCount(int userId);

	public List<Map<String, Object>> getAllAssignedTicketCount(int userId);

	// public List<Map<String, Object>> getTicketDetailsById(int tktId);

	public Ticket getTicketDetailsById(int tktId, int userId);

	public String getImgPath(int tktId);

	// public List<Type> getTicketType();

	public int updateTicketType(int tktId, int typeId, int priorityId);
	
	public List<Map<String, Object>> getTktIssueCategory(int projectId);
	
	public List<Ticket> getAllCommonTicket(int projectId);
	
	public int pushTicket(int ticketID);
	
	public int popTicket(int ticketID, int userID);

	public List<Project> getAllProject();
}
