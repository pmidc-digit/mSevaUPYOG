package com.ticket.controller;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.ticket.daoImpl.TicketDaoImpl;
import com.ticket.daoImpl.UserDaoImpl;
import com.ticket.model.Project;
import com.ticket.model.User;

@Controller
@RequestMapping("/")
public class AppController {

	@Autowired
	UserDaoImpl userDao;

	@Autowired
	TicketDaoImpl ticketDao;

	@RequestMapping(value = { "/","/login" }, method = RequestMethod.GET)
	public ModelAndView homePage() {
		ModelAndView map = new ModelAndView("login");
		map.addObject("logStyle", "display: block");
		map.addObject("regStyle", "display: none");
		return map;
	}
	
	@RequestMapping(value = { "/user_register" }, method = RequestMethod.GET)
	public ModelAndView registerPage() {
		ModelAndView map = new ModelAndView("login");
		map.addObject("regStyle", "display: block");
		map.addObject("logStyle", "display: none");
		return map;
	}
	
	@RequestMapping(value = "/register", method = RequestMethod.POST)
	public ModelAndView userRegister(@ModelAttribute("user") User user) {
		ModelAndView map = new ModelAndView("login");
		try {
				String errorMessage = userDao.save(user);
				map.addObject("errorMessage", errorMessage);
				map.addObject("regStyle", "display: block");
				map.addObject("logStyle", "display: none");
				return map;

		} catch (Exception ex) {
			ex.printStackTrace();
			return map;
		}
	}


	/*@RequestMapping(value = { "/login" }, method = RequestMethod.GET)
	public String loginPage(ModelMap model) {
		return "login";
	}*/

	@RequestMapping(value = "/logout", method = RequestMethod.GET)
	public String adminLogout(HttpServletRequest request) {
		HttpSession session = request.getSession();
		session.removeAttribute("userObj");
		return "redirect:/login";
	}

	@RequestMapping(value = "/dashboard", method = RequestMethod.POST)
	public ModelAndView adminLogin(@ModelAttribute("user") User user, HttpServletRequest request) {
		ModelAndView map = new ModelAndView("dashboard");
		ModelAndView lgmap = new ModelAndView("login");
		lgmap.addObject("logStyle", "display: block");
		lgmap.addObject("regStyle", "display: none");
		HttpSession session = request.getSession();
		try {

			if (user.getUserEmail() == null || user.getUserEmail().isEmpty() || user.getUserEmail().trim() == ""
					|| user.getUserPassword() == null || user.getUserPassword().isEmpty()
					|| user.getUserPassword().trim() == "") {
				lgmap.addObject("message", "Please Enter Valid User Name Or Password!");
				return lgmap;
			} else {
				User userObj = userDao.getAllDetails(user);

				if (userObj.getUserId() == 0) {
					lgmap.addObject("message", "Please Enter Valid User Name Or Password!");
					return lgmap;
				}else {
					session.setAttribute("userObj", userObj);
				session.setAttribute("userName", userObj.getUserName());
				session.setAttribute("userId", userObj.getUserId());
				session.setAttribute("userType", userObj.getUserType());
				session.setAttribute("ulbId", userObj.getUlbId());
				if(userObj.getUserType()==2)
				{
					List<User> staffList = userDao.getStaffDetails(userObj.getUserId());
					List<Project> projectList = ticketDao.getAllProject();
					long pendingTicket = ticketDao.countTotalPendingTicket();
					long resolvedTicket = ticketDao.countTotalResolvedTicket();
					map.addObject("staffList", staffList);
					map.addObject("proList", projectList);
					map.addObject("resolvedTicket", resolvedTicket);
					map.addObject("pendingTicket", pendingTicket);
				}
				else if(userObj.getUserType()==1)
				{
					
					long pendingTicket = ticketDao.countPendingTicket(userObj.getUserId());
					long resolvedTicket = ticketDao.countResolvedTicket(userObj.getUserId());
					
					map.addObject("resolvedTicket", resolvedTicket);
					map.addObject("pendingTicket", pendingTicket);
				}
				else {
//				long totalTicket = ticketDao.countAllTicket(userObj.getUserId());
					long ticketRaisedByMe = ticketDao.countAllTicketRaisedByMe(userObj.getUserId());
//				long ticketReportedByMe = ticketDao.countAllTicketReportedByMe(userObj.getUserId());
				long pendingTicket = ticketDao.countPendingTicket(userObj.getUserId());
				long resolvedTicket = ticketDao.countResolvedTicket(userObj.getUserId());
			
				
//				map.addObject("totalTicket", totalTicket);
				map.addObject("ticketRaisedByMe", ticketRaisedByMe);
//				map.addObject("ticketReportedByMe", ticketReportedByMe);
				map.addObject("resolvedTicket", resolvedTicket);
				map.addObject("pendingTicket", pendingTicket);
				}
				map.addObject("userType", userObj.getUserType());
				map.addObject("userObj", userObj);
				List<Map<String, Object>> raiseCountList = ticketDao.getAllRaisedTicketCount(userObj.getUserId());
				List<Map<String, Object>> assignCountList = ticketDao.getAllAssignedTicketCount(userObj.getUserId());
				map.addObject("raiseCountList", raiseCountList);
				map.addObject("assignCountList", assignCountList);
				
				List<Map<String, Object>> projectList = ticketDao.getProject();
				List<Map<String, Object>> userList = ticketDao.getUser(userObj.getUserId());
				List<Map<String, Object>> cityList = ticketDao.getTowns();
				List<Map<String, Object>> priority = ticketDao.getPriority();
				map.addObject("projectList", projectList);
				map.addObject("userList", userList);
				map.addObject("cityList", cityList);
				map.addObject("priority", priority);
				}
				return map;

			}
		} catch (Exception ex) {
			ex.printStackTrace();
			return lgmap;
		}
	}

	@RequestMapping(value = "/dashboard", method = RequestMethod.GET)
	public ModelAndView dashboardPage(HttpServletRequest request) {
		HttpSession session = request.getSession();
		ModelAndView map = new ModelAndView("dashboard");
		ModelAndView lgmap = new ModelAndView("login");
		lgmap.addObject("logStyle", "display: block");
		lgmap.addObject("regStyle", "display: none");
		try {
			if (session.getAttribute("userObj") != null) {
				User user = (User) session.getAttribute("userObj");
				User userObj = userDao.getAllDetails(user);
				/*long totalTicket = ticketDao.countAllTicket(user.getUserId());
				long ticketRaisedByMe = ticketDao.countAllTicketRaisedByMe(user.getUserId());
				long ticketReportedByMe = ticketDao.countAllTicketReportedByMe(user.getUserId());
				long pendingTicket = ticketDao.countPendingTicket(user.getUserId());
				long resolvedTicket = ticketDao.countResolvedTicket(user.getUserId());
				List<User> staffList = userDao.getStaffDetails(1);

				map.addObject("userObj", userObj);
				map.addObject("totalTicket", totalTicket);
				map.addObject("ticketRaisedByMe", ticketRaisedByMe);
				map.addObject("ticketReportedByMe", ticketReportedByMe);
				map.addObject("pendingTicket", pendingTicket);
				map.addObject("resolvedTicket", resolvedTicket);
				map.addObject("staffList", staffList);
				map.addObject("userType", userObj.getUserType());

				List<Map<String, Object>> raiseCountList = ticketDao.getAllRaisedTicketCount(userObj.getUserId());
				List<Map<String, Object>> assignCountList = ticketDao.getAllAssignedTicketCount(userObj.getUserId());
				map.addObject("raiseCountList", raiseCountList);
				map.addObject("assignCountList", assignCountList);
				
				List<Map<String, Object>> projectList = ticketDao.getProject();
				List<Map<String, Object>> userList = ticketDao.getUser(userObj.getUserId());
				List<Map<String, Object>> cityList = ticketDao.getCity();
				List<Map<String, Object>> priority = ticketDao.getPriority();
				map.addObject("projectList", projectList);
				map.addObject("userList", userList);
				map.addObject("cityList", cityList);
				map.addObject("priority", priority);*/
				
				
				if(userObj.getUserType()==2)
				{
					List<User> staffList = userDao.getStaffDetails(userObj.getUserId());
					List<Project> projectList = ticketDao.getAllProject();
					long pendingTicket = ticketDao.countTotalPendingTicket();
					long resolvedTicket = ticketDao.countTotalResolvedTicket();
					map.addObject("staffList", staffList);
					map.addObject("proList", projectList);
					map.addObject("resolvedTicket", resolvedTicket);
					map.addObject("pendingTicket", pendingTicket);
				}
				else if(userObj.getUserType()==1)
				{
					
					long pendingTicket = ticketDao.countPendingTicket(userObj.getUserId());
					long resolvedTicket = ticketDao.countResolvedTicket(userObj.getUserId());
					
					map.addObject("resolvedTicket", resolvedTicket);
					map.addObject("pendingTicket", pendingTicket);
				}
				else {
//				long totalTicket = ticketDao.countAllTicket(userObj.getUserId());
					long ticketRaisedByMe = ticketDao.countAllTicketRaisedByMe(userObj.getUserId());
//				long ticketReportedByMe = ticketDao.countAllTicketReportedByMe(userObj.getUserId());
				long pendingTicket = ticketDao.countPendingTicket(userObj.getUserId());
				long resolvedTicket = ticketDao.countResolvedTicket(userObj.getUserId());
			
				
//				map.addObject("totalTicket", totalTicket);
				map.addObject("ticketRaisedByMe", ticketRaisedByMe);
//				map.addObject("ticketReportedByMe", ticketReportedByMe);
				map.addObject("resolvedTicket", resolvedTicket);
				map.addObject("pendingTicket", pendingTicket);
				}
				map.addObject("userType", userObj.getUserType());
				map.addObject("userObj", userObj);
				List<Map<String, Object>> raiseCountList = ticketDao.getAllRaisedTicketCount(userObj.getUserId());
				List<Map<String, Object>> assignCountList = ticketDao.getAllAssignedTicketCount(userObj.getUserId());
				map.addObject("raiseCountList", raiseCountList);
				map.addObject("assignCountList", assignCountList);
				
				List<Map<String, Object>> projectList = ticketDao.getProject();
				List<Map<String, Object>> userList = ticketDao.getUser(userObj.getUserId());
				List<Map<String, Object>> cityList = ticketDao.getTowns();
				List<Map<String, Object>> priority = ticketDao.getPriority();
				map.addObject("projectList", projectList);
				map.addObject("userList", userList);
				map.addObject("cityList", cityList);
				map.addObject("priority", priority);
				return map;
			} else {
				
				return lgmap;
			}
		} catch (Exception ex) {
			ex.printStackTrace();
			return lgmap;
		}

	}

	/*
	 * @RequestMapping(value = { "/setting" }, method = RequestMethod.GET) public
	 * String adminSetting(HttpServletRequest request) { HttpSession session =
	 * request.getSession(); if (session.getAttribute("userObj") != null) { return
	 * "setting"; } else { return "redirect:/login"; } }
	 */

	@ResponseBody
	@RequestMapping(value = { "/update-setting" }, method = RequestMethod.POST)
	public String updateSetting(HttpServletRequest request, @RequestParam("oldPassword") String oldPassword,
			@RequestParam("newPassword") String newPassword) {
		HttpSession session = request.getSession();
//		User user = (User) session.getAttribute("userObj");
		try {
			if (session.getAttribute("userObj") != null) {
				User userObj = (User) session.getAttribute("userObj");
				String currPass = userObj.getUserPassword();
				String userName = userObj.getUserName();
				if (currPass.contentEquals(oldPassword)) {
					int updatePass = userDao.updatePassword(userName, newPassword);
					if (updatePass > 0) {
						userObj.setUserPassword(newPassword);
						return "Password Updated Successfully.";
						
					} else {
						return "Password Not Updated Please Try Again.";
					}
				} else {
					return "Old Password Does Not Exist!";
				}

			} else {
				return "redirect:/login";
			}
		} catch (Exception e) {

			return "redirect:/login";
		}
	}
	
	
	

	@RequestMapping(value = "/common-ticket", method = RequestMethod.GET)
	public ModelAndView getCommonTicket(HttpServletRequest request) {
		HttpSession session = request.getSession();
		ModelAndView map = new ModelAndView("common-ticket");
		ModelAndView lgmap = new ModelAndView("login");
		lgmap.addObject("logStyle", "display: block");
		lgmap.addObject("regStyle", "display: none");
		try {
			if (session.getAttribute("userObj") != null) {
				User user = (User) session.getAttribute("userObj");
				User userObj = userDao.getAllDetails(user);
				long totalTicket = ticketDao.countAllTicket(user.getUserId());
				long ticketRaisedByMe = ticketDao.countAllTicketRaisedByMe(user.getUserId());
				long ticketReportedByMe = ticketDao.countAllTicketReportedByMe(user.getUserId());
				long pendingTicket = ticketDao.countPendingTicket(user.getUserId());
				long resolvedTicket = ticketDao.countResolvedTicket(user.getUserId());
				List<User> staffList = userDao.getStaffDetails(1);

				map.addObject("userObj", userObj);
				map.addObject("totalTicket", totalTicket);
				map.addObject("ticketRaisedByMe", ticketRaisedByMe);
				map.addObject("ticketReportedByMe", ticketReportedByMe);
				map.addObject("pendingTicket", pendingTicket);
				map.addObject("resolvedTicket", resolvedTicket);
				map.addObject("staffList", staffList);
				map.addObject("userType", userObj.getUserType());

				List<Map<String, Object>> raiseCountList = ticketDao.getAllRaisedTicketCount(userObj.getUserId());
				List<Map<String, Object>> assignCountList = ticketDao.getAllAssignedTicketCount(userObj.getUserId());
				map.addObject("raiseCountList", raiseCountList);
				map.addObject("assignCountList", assignCountList);
				
				List<Map<String, Object>> projectList = ticketDao.getProject();
				List<Map<String, Object>> userList = ticketDao.getUser(userObj.getUserId());
				List<Map<String, Object>> cityList = ticketDao.getTowns();
				List<Map<String, Object>> priority = ticketDao.getPriority();
				map.addObject("projectList", projectList);
				map.addObject("userList", userList);
				map.addObject("cityList", cityList);
				map.addObject("priority", priority);

				return map;
			} else {
				
				return lgmap;
			}
		} catch (Exception ex) {
			ex.printStackTrace();
			return lgmap;
		}

	}
	
	@ResponseBody
	@RequestMapping(value = { "/get-towns" }, method = RequestMethod.GET)
	public List<Map<String, Object>> getTowns() {
		List<Map<String, Object>> cityList=null;
		try {
			cityList = ticketDao.getTowns();
			return cityList;
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		return cityList;
	}
	
}