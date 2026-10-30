package com.ticket.daoImpl;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import com.ticket.configuration.HibernateConfig;
import com.ticket.dao.TicketDao;
import com.ticket.mapper.ProjectMapper;
import com.ticket.mapper.TicketMapper;
import com.ticket.model.Project;
import com.ticket.model.Ticket;
import com.ticket.model.User;

public class TicketDaoImpl extends HibernateConfig implements TicketDao {
	SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
	Date date = new Date();
	/*
	 * DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy"); LocalDate
	 * localDate = LocalDate.now();
	 */
	/*
	 * SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	 * Date date = new Date(); String updatedDate = formatter.format(date);
	 */
//	System.out.println(dtf.format(localDate)); //2016/11/16

	@Override
	public List<Ticket> getAllCommonTicket(int projectId) {
		List<Ticket> list = new ArrayList<Ticket>();
		try {
			String sql = "SELECT tkt.*, '0' as comment, pr.project_name, ty.type,tkt.environment_type, ulb.town_name, usrs.user_name AS raiser_name, usas.user_name AS assignee_name, iscat.issue_category, isfbk.feedback FROM  tickets AS tkt LEFT JOIN tkt_project AS pr ON tkt.project_id=pr.project_id LEFT JOIN tkt_type AS ty ON tkt.tkt_type_id=ty.type_id LEFT JOIN towns AS ulb ON tkt.ulb_id=ulb.town_id LEFT JOIN tkt_user AS usas ON tkt.assigned_to_id=usas.user_id LEFT JOIN tkt_user AS usrs ON tkt.raised_by_id=usrs.user_id LEFT JOIN tkt_issue_category AS iscat ON tkt.issue_category_id=iscat.id LEFT JOIN tkt_issue_feedback AS isfbk ON tkt.issue_feedback_id=isfbk.id  WHERE tkt.project_id=? AND tkt.assigned_to_id=0 ORDER BY tkt.tkt_id DESC";
			list = getJdbcTemplate().query(sql, new TicketMapper(), projectId);
			return list;
		} catch (Exception e) {
			return list;
		}
	}

	@Override
	public List<Ticket> getAllTicketRaisedByMe(int userId, int status) {
		List<Ticket> list = new ArrayList<Ticket>();
		try {
			// String sql = "SELECT tkt.*, pr.project_name, ty.type,tkt.environment_type,
			// ulb.town_name, usrs.user_name AS raiser_name, usas.user_name AS
			// assignee_name, iscat.issue_category, isfbk.feedback FROM tickets AS tkt LEFT
			// JOIN tkt_project AS pr ON tkt.project_id=pr.project_id LEFT JOIN tkt_type AS
			// ty ON tkt.tkt_type_id=ty.type_id LEFT JOIN towns AS ulb ON
			// tkt.ulb_id=ulb.town_id LEFT JOIN tkt_user AS usas ON
			// tkt.assigned_to_id=usas.user_id LEFT JOIN tkt_user AS usrs ON
			// tkt.raised_by_id=usrs.user_id LEFT JOIN tkt_issue_category AS iscat ON
			// tkt.issue_category_id=iscat.id LEFT JOIN tkt_issue_feedback AS isfbk ON
			// tkt.issue_feedback_id=isfbk.id WHERE tkt.raised_by_id=? AND tkt.tkt_type_id=?
			// ORDER BY tkt.tkt_id DESC";
			String sql = "select * from (select tkt.*, pr.project_name, ty.type, ulb.town_name, usrs.user_name AS raiser_name, usas.user_name AS assignee_name, iscat.issue_category, isfbk.feedback FROM  tickets AS tkt LEFT JOIN tkt_project AS pr ON tkt.project_id=pr.project_id LEFT JOIN tkt_type AS ty ON tkt.tkt_type_id=ty.type_id LEFT JOIN towns AS ulb ON tkt.ulb_id=ulb.town_id LEFT JOIN tkt_user AS usas ON tkt.assigned_to_id=usas.user_id LEFT JOIN tkt_user AS usrs ON tkt.raised_by_id=usrs.user_id LEFT JOIN tkt_issue_category AS iscat ON tkt.issue_category_id=iscat.id LEFT JOIN tkt_issue_feedback AS isfbk ON tkt.issue_feedback_id=isfbk.id WHERE tkt.raised_by_id=? AND tkt.tkt_type_id=? ORDER BY tkt.tkt_id DESC)a LEFT JOIN (select tkt_id, count(*)as comment  from tkt_comment where user_id!=? and read_status=0  group by tkt_id) b on a.tkt_id=b.tkt_id";

			list = getJdbcTemplate().query(sql, new TicketMapper(), userId, status, userId);
			return list;
		} catch (Exception e) {
			return list;
		}
	}

	@Override
	public List<Ticket> getAllTicketAssignedToMe(int userId, int status) {
		List<Ticket> list = new ArrayList<Ticket>();
		try {
			// String sql = "SELECT tkt.*, pr.project_name, ty.type,tkt.environment_type,
			// ulb.town_name, usrs.user_name AS raiser_name, usas.user_name AS
			// assignee_name, iscat.issue_category, isfbk.feedback FROM tickets AS tkt LEFT
			// JOIN tkt_project AS pr ON tkt.project_id=pr.project_id LEFT JOIN tkt_type AS
			// ty ON tkt.tkt_type_id=ty.type_id LEFT JOIN towns AS ulb ON
			// tkt.ulb_id=ulb.town_id LEFT JOIN tkt_user AS usas ON
			// tkt.assigned_to_id=usas.user_id LEFT JOIN tkt_user AS usrs ON
			// tkt.raised_by_id=usrs.user_id LEFT JOIN tkt_issue_category AS iscat ON
			// tkt.issue_category_id=iscat.id LEFT JOIN tkt_issue_feedback AS isfbk ON
			// tkt.issue_feedback_id=isfbk.id WHERE tkt.assigned_to_id=? AND
			// tkt.tkt_type_id=? ORDER BY tkt.tkt_id DESC";
			String sql = "select * from (select tkt.*, pr.project_name, ty.type, ulb.town_name, usrs.user_name AS raiser_name, usas.user_name AS assignee_name, iscat.issue_category, isfbk.feedback FROM  tickets AS tkt LEFT JOIN tkt_project AS pr ON tkt.project_id=pr.project_id LEFT JOIN tkt_type AS ty ON tkt.tkt_type_id=ty.type_id LEFT JOIN towns AS ulb ON tkt.ulb_id=ulb.town_id LEFT JOIN tkt_user AS usas ON tkt.assigned_to_id=usas.user_id LEFT JOIN tkt_user AS usrs ON tkt.raised_by_id=usrs.user_id LEFT JOIN tkt_issue_category AS iscat ON tkt.issue_category_id=iscat.id LEFT JOIN tkt_issue_feedback AS isfbk ON tkt.issue_feedback_id=isfbk.id WHERE tkt.assigned_to_id=? AND tkt.tkt_type_id=? ORDER BY tkt.tkt_id DESC)a LEFT JOIN (select tkt_id, count(*)as comment  from tkt_comment where user_id!=? and read_status=0  group by tkt_id) b on a.tkt_id=b.tkt_id";
			list = getJdbcTemplate().query(sql, new TicketMapper(), userId, status, userId);
			return list;
		} catch (Exception e) {
			return list;
		}
	}

	@Override
	public List<Ticket> getAllTicket(int userId) {
		List<Ticket> list = new ArrayList<Ticket>();
		try {
			String sql = "SELECT * from tickets WHERE raised_by_id=? OR assigned_to_id=? ORDER BY tkt_id DESC";
			list = getJdbcTemplate().query(sql, new TicketMapper(), userId, userId);
			return list;
		} catch (Exception e) {
			return list;
		}
	}

	@Override
	public long countAllTicketRaisedByMe(int userId) {
		long total = 0;
		try {
			String sql = "SELECT COUNT(*) FROM tickets WHERE raised_by_id=?";
			total = getJdbcTemplate().queryForLong(sql, userId);
			return total;
		} catch (Exception e) {
			return total;
		}
	}

	@Override
	public long countAllTicketReportedByMe(int userId) {
		long total = 0;
		try {
			String sql = "SELECT COUNT(*) FROM tickets WHERE assigned_to_id=?";
			total = getJdbcTemplate().queryForLong(sql, userId);
			return total;
		} catch (Exception e) {
			return total;
		}
	}

	@Override
	public long countAllTicket(int userId) {
		long total = 0;
		try {
			String sql = "SELECT COUNT(*) FROM tickets WHERE (raised_by_id=? OR assigned_to_id=?)";
			total = getJdbcTemplate().queryForLong(sql, userId, userId);
			return total;
		} catch (Exception e) {
			return total;
		}
	}

	@Override
	public long countPendingTicket(int userId) {
		long total = 0;
		try {
			String sql = "SELECT COUNT(*) FROM tickets WHERE status=0 AND (raised_by_id=? OR assigned_to_id=?)";
			total = getJdbcTemplate().queryForLong(sql, userId, userId);
			return total;
		} catch (Exception e) {
			return total;
		}
	}

	@Override
	public long countTotalPendingTicket() {
		long total = 0;
		try {
			String sql = "SELECT COUNT(*) FROM tickets WHERE status=0";
			total = getJdbcTemplate().queryForLong(sql);
			return total;
		} catch (Exception e) {
			return total;
		}
	}

	@Override
	public long countTotalResolvedTicket() {
		long total = 0;
		try {
			String sql = "SELECT COUNT(*) FROM tickets WHERE status=1";
			total = getJdbcTemplate().queryForLong(sql);
			return total;
		} catch (Exception e) {
			return total;
		}
	}

	@Override
	public long countResolvedTicket(int userId) {
		long total = 0;
		try {
			String sql = "SELECT COUNT(*) FROM tickets WHERE status=1 AND (raised_by_id=? OR assigned_to_id=?)";
			total = getJdbcTemplate().queryForLong(sql, userId, userId);
			return total;
		} catch (Exception e) {
			return total;
		}
	}

	@Override
	public List<Map<String, Object>> getProject() {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			String sql = "SELECT project_id,project_name from tkt_project ORDER BY project_name";
			list = getJdbcTemplate().queryForList(sql);
			return list;
		} catch (Exception e) {
			return list;
		}
	}

	@Override
	public List<Map<String, Object>> getIssueType() {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			String sql = "SELECT type_id,type from tkt_type ORDER BY type";
			list = getJdbcTemplate().queryForList(sql);
			return list;
		} catch (Exception e) {
			return list;
		}
	}

	@Override
	public List<Map<String, Object>> getTktIssueType() {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			String sql = "SELECT id, feedback from tkt_issue_feedback";
			list = getJdbcTemplate().queryForList(sql);
			return list;
		} catch (Exception e) {
			return list;
		}
	}

	@Override
	public List<Map<String, Object>> getTktIssueCategory(int projectId) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			String sql = "SELECT id, issue_category from tkt_issue_category WHERE project_id=?";
			list = getJdbcTemplate().queryForList(sql, projectId);
			return list;
		} catch (Exception e) {
			return list;
		}
	}

	@Override
	public List<Map<String, Object>> getUser(int userId) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			String sql = "SELECT user_id,user_name from tkt_user WHERE user_id!=? ORDER BY user_name";
			list = getJdbcTemplate().queryForList(sql, userId);
			return list;
		} catch (Exception e) {
			return list;
		}
	}

	@Override
	public List<Map<String, Object>> getTowns() {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			String sql = "SELECT town_id,town_name from towns ORDER BY town_name";
			list = getJdbcTemplate().queryForList(sql);
			return list;
		} catch (Exception e) {
			return list;
		}
	}

	@Override
	public List<Map<String, Object>> getPriority() {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			String sql = "SELECT priority_id,priority from tkt_priority ORDER BY priority";
			list = getJdbcTemplate().queryForList(sql);
			return list;
		} catch (Exception e) {
			return list;
		}
	}

	@Override
	public int insertTicketWithImg(Ticket ticket, User userobj, String imageUrl) {
		int status = 0;
		try {

			String INSERT = "INSERT INTO tickets (PROJECT_ID, TKT_TYPE_ID, ULB_ID, RAISED_BY_ID, ASSIGNED_TO_ID, TKT_SUMMARY, TKT_DESCRIPTION, ATTACHMENT, TKT_PRIORITY, ISSUE_CATEGORY_ID, RAISED_DATE, IMAGE_URL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
			status = getJdbcTemplate().update(INSERT,
					new Object[] { ticket.getProjectId(), 1, userobj.getUlbId(), userobj.getUserId(),
							ticket.getAssignedToId(), ticket.getTktSummary(), ticket.getTktDescription(),
							ticket.getAttachment(), 1, ticket.getIssueCategoryId(), ticket.getRaisedDate(), imageUrl });

			/*
			 * long tid = getJdbcTemplate()
			 * .queryForLong("select max(TKT_ID) from tickets where RAISED_BY_ID=" +
			 * userobj.getUserId()); String
			 * sql="select user_email from tkt_user where user_id=?"; String em = (String)
			 * getJdbcTemplate().queryForObject(sql, new
			 * Object[]{ticket.getRaisedById()},String.class); String em =
			 * userobj.getUserEmail(); imageName = (String)
			 * getJdbcTemplate().queryForObject(sql, new Object[] { tktId }, String.class);
			 * 
			 * User u=(User) session.getAttribute("userobj");
			 * 
			 * if (status == 1) { String msg = "Dear " + userobj.getUserName() +
			 * " your ticket has been generated with id TKT-" + tid +
			 * ", please use this id for any future reference, issue will be resolved soon and will be to you"
			 * ; String sub = "Your issue received with ticket id TKT-" + tid;
			 * com.ticket.dao.Communicate.sendSMS(userobj.getUserMobileNo(), msg);
			 * com.ticket.dao.Communicate.sendMail(em,sub, msg); }
			 */
			return status;
		}

		catch (Exception e) {
			System.out.println(e.toString());
			return status;
		}
	}

	@Override
	public int insertTicketWithoutImg(Ticket ticket, User userobj) {
		int status = 0;
		try {

			String INSERT = "INSERT INTO tickets (PROJECT_ID, TKT_TYPE_ID, ULB_ID, RAISED_BY_ID, ASSIGNED_TO_ID, TKT_SUMMARY, TKT_DESCRIPTION, TKT_PRIORITY, ISSUE_CATEGORY_ID, RAISED_DATE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
			status = getJdbcTemplate().update(INSERT,
					new Object[] { ticket.getProjectId(), 1, userobj.getUlbId(), userobj.getUserId(),
							ticket.getAssignedToId(), ticket.getTktSummary(), ticket.getTktDescription(), 1,
							ticket.getIssueCategoryId(), ticket.getRaisedDate() });

			/*
			 * long tid = getJdbcTemplate()
			 * .queryForLong("select max(TKT_ID) from tickets where RAISED_BY_ID=" +
			 * userobj.getUserId()); String
			 * sql="select user_email from tkt_user where user_id=?"; String em = (String)
			 * getJdbcTemplate().queryForObject(sql, new
			 * Object[]{ticket.getRaisedById()},String.class); String em =
			 * userobj.getUserEmail(); imageName = (String)
			 * getJdbcTemplate().queryForObject(sql, new Object[] { tktId }, String.class);
			 * 
			 * User u=(User) session.getAttribute("userobj");
			 * 
			 * if (status == 1) { String msg = "Dear " + userobj.getUserName() +
			 * " your ticket has been generated with id TKT-" + tid +
			 * ", please use this id for any future reference, issue will be resolved soon and will be to you"
			 * ; String sub = "Your issue received with ticket id TKT-" + tid;
			 * com.ticket.dao.Communicate.sendSMS(userobj.getUserMobileNo(), msg);
			 * com.ticket.dao.Communicate.sendMail(em,sub, msg); }
			 */
			return status;
		}

		catch (Exception e) {
			System.out.println(e.toString());
			return status;
		}
	}

	@Override
	public List<Map<String, Object>> getAllRaisedTicketCount(int userId) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			String sql = "SELECT (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=1 AND raised_by_id=?) AS latest, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=2 AND raised_by_id=?) AS assigned, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=3 AND raised_by_id=?) AS progress, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=4 AND raised_by_id=?) AS hold, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=5 AND raised_by_id=?) AS resolved, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=6 AND raised_by_id=?) AS closed, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=7 AND raised_by_id=?) AS reassigned, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=8 AND raised_by_id=?) AS reopen FROM  tickets LIMIT 1";
			list = getJdbcTemplate().queryForList(sql, userId, userId, userId, userId, userId, userId, userId, userId);
			return list;
		} catch (Exception e) {
			return list;
		}
	}

	@Override
	public List<Map<String, Object>> getAllAssignedTicketCount(int userId) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			String sql = "SELECT (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=1 AND assigned_to_id=?) AS latest, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=1 AND assigned_to_id=?) AS assigned, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=3 AND assigned_to_id=?) AS progress, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=4 AND assigned_to_id=?) AS hold, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=5 AND assigned_to_id=?) AS resolved, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=6 AND assigned_to_id=?) AS closed, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=8 AND assigned_to_id=?) AS reassigned, (SELECT COUNT(1) FROM tickets WHERE tkt_type_id=8 AND assigned_to_id=?) AS reopen, (SELECT COUNT(1) FROM tickets WHERE assigned_to_id=0) AS common FROM  tickets LIMIT 1";
			list = getJdbcTemplate().queryForList(sql, userId, userId, userId, userId, userId, userId, userId, userId);
			return list;
		} catch (Exception e) {
			return list;
		}
	}

	/*
	 * @Override public List<Map<String, Object>> getTicketDetailsById(int tktId) {
	 * String sql =
	 * "SELECT tkt.*, pr.project_name, ty.type,tkt.environment_type, ulb.town_name, usrs.user_name AS raiser_name, usas.user_name AS assignee_name, prir.priority FROM  tickets AS tkt LEFT JOIN tkt_project AS pr ON tkt.project_id=pr.project_id LEFT JOIN tkt_type AS ty ON tkt.tkt_type_id=ty.type_id LEFT JOIN tkt_priority AS prir ON tkt.tkt_priority=prir.priority_id LEFT JOIN towns AS ulb ON tkt.ulb_id=ulb.town_id LEFT JOIN tkt_user AS usas ON tkt.assigned_to_id=usas.user_id LEFT JOIN tkt_user AS usrs ON tkt.raised_by_id=usrs.user_id WHERE tkt.tkt_id=? "
	 * ; return getJdbcTemplate().queryForList(sql, tktId);
	 * 
	 * }
	 */

	@Override
	public Ticket getTicketDetailsById(int tktId, int userId) {
		Ticket ticket = null;
		try {

			String sql = "SELECT tkt.*,'0' as comment, pr.project_name, ty.type,tkt.environment_type, ulb.town_name, usrs.user_name AS raiser_name, usas.user_name AS assignee_name, iscat.issue_category, isfbk.feedback FROM  tickets AS tkt LEFT JOIN tkt_project AS pr ON tkt.project_id=pr.project_id LEFT JOIN tkt_type AS ty ON tkt.tkt_type_id=ty.type_id LEFT JOIN towns AS ulb ON tkt.ulb_id=ulb.town_id LEFT JOIN tkt_user AS usas ON tkt.assigned_to_id=usas.user_id LEFT JOIN tkt_user AS usrs ON tkt.raised_by_id=usrs.user_id LEFT JOIN tkt_issue_category AS iscat ON tkt.issue_category_id=iscat.id LEFT JOIN tkt_issue_feedback AS isfbk ON tkt.issue_feedback_id=isfbk.id WHERE tkt.tkt_id=? ";
			ticket = getJdbcTemplate().queryForObject(sql, new TicketMapper(), tktId);

			try {
				String SQL = "update tkt_comment set read_status=1 where read_status=0 AND tkt_id = ? AND user_id!=?";
				getJdbcTemplate().update(SQL, tktId, userId);
			} catch (Exception e) {
				e.printStackTrace();
			}

		} catch (Exception e) {
			ticket = new Ticket();
		}
		return ticket;

	}

	@Override
	public String getImgPath(int tktId) {
		String imageName = null;
		try {
			String sql = "SELECT attachment FROM tickets WHERE tkt_id=?";
			imageName = (String) getJdbcTemplate().queryForObject(sql, new Object[] { tktId }, String.class);
			return imageName;
		} catch (Exception e) {
			return imageName;
		}
	}

	/*
	 * @Override public List<Type> getTicketType() { String sql =
	 * "SELECT TYPE_ID, TYPE FROM tkt_type "; return getJdbcTemplate().query(sql,
	 * new TypeMapper()); }
	 */

	@Override
	public int updateTicketType(int tktId, int typeId, int issueId) {
		int status = 0;
		int tktStatus = 0;
		int tktIssueId = 0;
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
		Date date = new Date();
		try {
			if (typeId == 5 || typeId == 6)
				tktStatus = 1;
			tktIssueId = issueId;
			String SQL = "update tickets set TKT_TYPE_ID=?, ISSUE_FEEDBACK_ID=?, STATUS=?, UPDATED_DATE=?  where TKT_ID = ?";
			status = getJdbcTemplate().update(SQL, typeId, tktIssueId, tktStatus, formatter.format(date), tktId);
			/*
			 * String uname = getJdbcTemplate().queryForObject(
			 * "select user_name from tkt_user where user_id=(select RAISED_BY_ID from tickets where TKT_ID="
			 * + tktId + ")", String.class); String u_email =
			 * getJdbcTemplate().queryForObject(
			 * "select user_email from tkt_user where user_id=(select RAISED_BY_ID from tickets where TKT_ID="
			 * + tktId + ")", String.class); String type =
			 * getJdbcTemplate().queryForObject("select TYPE from tkt_type where TYPE_ID=" +
			 * typeId, String.class);
			 * 
			 * String msg = "Dear " + uname + ", Your ticket id " + tktId +
			 * " has been updated with status=" + type; Communicate.sendMail(u_email,
			 * "Ticket ["+tktId+"] status changed",msg);
			 */
			return status;
		} catch (Exception e) {
			return status;
		}
	}

	@Override
	public int pushTicket(int ticketID) {
		int status = 0;
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
		Date date = new Date();

		try {
			String SQL = "update tickets set ASSIGNED_TO_ID=0, tkt_type_id=1, UPDATED_DATE=? where TKT_ID = ?";
			status = getJdbcTemplate().update(SQL, formatter.format(date), ticketID);
			return status;
		} catch (Exception e) {
			return status;
		}
	}

	@Override
	public int popTicket(int ticketID, int userID) {
		int status = 0;
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
		Date date = new Date();
		try {
			String SQL = "update tickets set ASSIGNED_TO_ID=?, UPDATED_DATE=?, tkt_type_id=1 where TKT_ID = ?";
			status = getJdbcTemplate().update(SQL, userID, formatter.format(date), ticketID);
			return status;
		} catch (Exception e) {
			return status;
		}
	}

	@Override
	public List<Project> getAllProject() {
		List<Project> project = new ArrayList<Project>();
		try {
			String sql = "SELECT p.*, (SELECT count(*) from tickets WHERE project_id=p.project_id and STATUS=1)as resolved, (SELECT count(*) from tickets WHERE project_id=p.project_id and STATUS=0)as pending FROM tkt_project AS p";
			project = getJdbcTemplate().query(sql, new ProjectMapper());
			return project;
		} catch (Exception e) {
			return project;
		}
	}

}
