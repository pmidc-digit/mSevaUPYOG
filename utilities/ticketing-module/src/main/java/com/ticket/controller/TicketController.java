	package com.ticket.controller;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.ticket.configuration.S3Bucket;
import com.ticket.daoImpl.TicketDaoImpl;
import com.ticket.model.Ticket;
import com.ticket.model.User;

@Controller
public class TicketController {

	private static final String BUCKET_DIR = "https://pmidc-ticket-images.s3.ap-south-1.amazonaws.com/ticket-images/";

	@Autowired
	TicketDaoImpl ticketDao;
	
	
	
	@RequestMapping(value = { "/raise-ticket-form" }, method = RequestMethod.POST)
	public String uploadTicket( HttpServletRequest servletRequest, @ModelAttribute("ticket") Ticket ticket,
			HttpServletRequest request) {
		HttpSession session = request.getSession();
		StringBuffer imagePathAttach=new StringBuffer();
		SimpleDateFormat sdfDate = new SimpleDateFormat("yyyyMMddHHmmss");
	    Date now = new Date();
	    String strDate = sdfDate.format(now);
		if (session.getAttribute("userObj") == null) {
			return "login";
		} else {
			User user = (User)session.getAttribute("userObj");
			if(user.getUserType()==3)
			{
				user.setUlbId(ticket.getUlbId());
			}
			String imgPath = null;
				if(ticket.getAttachment().toString().matches("0"))
				{
					ticketDao.insertTicketWithoutImg(ticket,user);
				}
				else
				{
					for (MultipartFile file : ticket.getFiles()) {
				try {
					byte[] bytes = file.getBytes();
					imgPath = strDate+"_"+file.getOriginalFilename();
					Path path = Paths.get(imgPath);
					Files.write(path, bytes);
					imagePathAttach.append(imgPath+",");
					new S3Bucket().uploadFileS3Bucket(imgPath,path.toString(), "ticket");
					
				} catch (IOException e) {
					e.printStackTrace();
				}

			}
					ticket.setAttachment(imagePathAttach.toString());
					ticketDao.insertTicketWithImg(ticket,user);
		}
			
		}
		return "redirect:/dashboard";
	}
	


	@ResponseBody
	@RequestMapping(value = { "/raise-ticket" }, method = RequestMethod.GET)
	public String raised(HttpServletRequest request, @RequestParam("status") int status,
			@RequestParam("heading") String HEADING) {
		HttpSession session = request.getSession();
		String list = null;
		try {
			int userId = (Integer) session.getAttribute("userId");
			int userType = (Integer) session.getAttribute("userType");
			List<Ticket> lists = ticketDao.getAllTicketRaisedByMe(userId, status);
			StringBuffer sb = new StringBuffer();
			String notificationImagePath="";
			sb.append(
					"<section class=\"panel\">\r\n" + "                    <header class=\"panel-heading wht-bg\">\r\n"
							+ "                       <a class=\"btn btn-head\"> " + HEADING + " </a>\r\n"
							+ "                       </header>\r\n"
							+ "                     <div class=\"stats-last-agile\">\r\n"
							+ "					<table class=\"table stats-table example\">\r\n"
							+ "						<thead>\r\n" + "							<tr>\r\n"
							+ "								<th>Ticket.NO</th>\r\n"
							+ "								<th>Project</th>\r\n"
							+ "								<th>ULB</th>\r\n"
							+ "								<th>Issue Category</th>\r\n"
							+ "								<th>created-Date</th>\r\n"
							+ "								<th>FeedBack</th>\r\n"
							+ "								<th>View</th>\r\n"
							+ "							</tr>\r\n" + "						</thead><tbody>");

			for (Ticket tkt : lists) {
				if(tkt.getReadStatus()==0) 
				{ notificationImagePath=""; }
				else {notificationImagePath="<span class='notifi'>"+tkt.getReadStatus()+"</span>"; } 
				sb.append("<tr>");
				sb.append("<th scope=\"row\">TKT-" + tkt.getTktId() + "</th>\r\n" + "									<td>"
						+ tkt.getProject() + "</td>\r\n" + "									<td>" + tkt.getUlbName()
						+ "									<td>" + tkt.getIssueCategoryName() + "</td>\r\n"
						+ "									<td>" + tkt.getRaisedDate() + "</td>\r\n"
						+ "									<td>" + tkt.getIssueFeedbackName() + "</td>\r\n"
						+ "									<td><span class='btn btn-compose' onclick=viewRaisdTicket("
						+  tkt.getTktId() +","+userId+","+tkt.getTktTypeId()+",'"+tkt.getTktType()+"',"+userType+",'assign')><i class='fa fa-eye parent'> </i>"+notificationImagePath+"</span></span></td>");
				sb.append("</tr>");
			}
			sb.append("</tbody></table></div></section>");

			list = sb.toString();
			return list;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return list;
	}

	@ResponseBody
	@RequestMapping(value = { "/assign-ticket" }, method = RequestMethod.GET)
	public String assigned(HttpServletRequest request, @RequestParam("status") int status,
			@RequestParam("heading") String HEADING) {
		HttpSession session = request.getSession();
		String list = null;
		try {
			int userId = (Integer) session.getAttribute("userId");
			int userType = (Integer) session.getAttribute("userType");
			List<Ticket> lists = ticketDao.getAllTicketAssignedToMe(userId, status);
			StringBuffer sb = new StringBuffer();
			String notificationImagePath="";
			sb.append(
					"<section class=\"panel\">\r\n" + "                    <header class=\"panel-heading wht-bg\">\r\n"
							+ "                       <a class=\"btn btn-head\"> " + HEADING + " </a>\r\n"
							+ "                       </header>\r\n"
							+ "                     <div class=\"stats-last-agile\">\r\n"
							+ "					<table class=\"table stats-table example\">\r\n"
							+ "						<thead>\r\n" + "							<tr>\r\n"
							+ "								<th>Ticket.NO</th>\r\n"
							+ "								<th>Project</th>\r\n"
							+ "								<th>ULB</th>\r\n"
							+ "								<th>Raised By</th>\r\n"
							+ "								<th>Issue Category</th>\r\n"
							+ "								<th>Created Date</th>\r\n"
							+ "								<th>Updated Date</th>\r\n"
							+ "								<th>View</th>\r\n"
							+ "							</tr>\r\n" + "						</thead><tbody>");
		
			for (Ticket tkt : lists) {
				if(tkt.getReadStatus()==0) 
				{ notificationImagePath=""; }
				else {notificationImagePath="<span class='notifi'>"+tkt.getReadStatus()+"</span>"; } 
				sb.append("<tr>");
				sb.append("<th scope=\"row\">TKT-" + tkt.getTktId() + "</th>\r\n" + "									<td>"
						+ tkt.getProject() + "</td>\r\n" + "									<td>" + tkt.getUlbName()
						+ "</td>\r\n" + "									<td>" + tkt.getRaiserName() + "</td>\r\n"
						+ "									<td>" + tkt.getIssueCategoryName() + "</td>\r\n"
						+ "									<td>" + tkt.getRaisedDate() + "</td>\r\n"
						+ "									<td>" + tkt.getUpdatedDate() + "</td>\r\n"
						+"									<td><span class='btn btn-compose' onclick=viewAssignedTicket("
						+ tkt.getTktId() + ","+userId+","+tkt.getTktTypeId()+",'"+tkt.getTktType()+"',"+userType+",'assign','push')><i class='fa fa-eye parent'> </i>"+notificationImagePath+"</span></td>");
				sb.append("</tr>");
			}
			sb.append("</tbody></table></div></section>");

			list = sb.toString();
			return list;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return list;
	}


	@RequestMapping(value = { "/download/{attachment:.+}" }, method = RequestMethod.GET)
	public ResponseEntity<byte[]> downloadAllResource(HttpServletRequest request, @PathVariable String attachment,
			HttpServletResponse response) throws IOException {
		ByteArrayOutputStream downloadInputStream = new S3Bucket().downloadFile(attachment, "ticket");
		  
	    return ResponseEntity.ok()
	          .contentType(contentType(attachment))
	          .header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\"" + attachment + "\"")
	          .body(downloadInputStream.toByteArray());  
	  }
	  
	  private MediaType contentType(String keyname) {
	    String[] arr = keyname.split("\\.");
	    String type = arr[arr.length-1];
	    switch(type) {
	      case "txt": return MediaType.TEXT_PLAIN;
	      case "png": return MediaType.IMAGE_PNG;
	      case "jpg": return MediaType.IMAGE_JPEG;
	      default: return MediaType.APPLICATION_OCTET_STREAM;
	    }
		
	}

		@ResponseBody
		@RequestMapping(value = { "/view-ticket" }, method = RequestMethod.GET)
		public Ticket view(HttpServletRequest request, @RequestParam("tkt_id") int tktId) {
			Ticket tkt = new Ticket();
			HttpSession session = request.getSession();
			int userId = (Integer) session.getAttribute("userId");
			try {
				tkt = ticketDao.getTicketDetailsById(tktId, userId);
				return tkt;
			} catch (Exception e) {
				e.printStackTrace();
			}
			return tkt;
		}





	@RequestMapping(value = { "/image-url/{imageName:.+}" }, method = RequestMethod.GET)
	@ResponseBody

	public HttpEntity<byte[]> getPhoto(@PathVariable String imageName, HttpServletRequest request ) throws IOException {
		final String STATIC_IMG_DIR = request.getSession().getServletContext().getRealPath("/static/images")+"/";
		String path = "";
		if(imageName.equals("null"))
		{
			path = STATIC_IMG_DIR + "no-image.png";
		}
		else
		{
			System.out.println("else");
			String extension = imageName.substring(imageName.lastIndexOf(".") + 1);
		if (extension.equalsIgnoreCase("pdf")) {
			path = STATIC_IMG_DIR + "pdf.png";
		} else if (extension.equalsIgnoreCase("zip")) {
			path = STATIC_IMG_DIR + "zip.png";
		} else if (extension.equalsIgnoreCase("xlsx") || extension.equalsIgnoreCase("docx") || extension.equalsIgnoreCase("csv")) {
			path = STATIC_IMG_DIR + "xls-icon.png";
		}else {
			path = BUCKET_DIR +imageName;

		}
		}
		

		byte[] image = org.apache.commons.io.FileUtils.readFileToByteArray(new File(path));
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.IMAGE_PNG);
		headers.setContentLength(image.length);
		return new HttpEntity<byte[]>(image, headers);
	}


	@RequestMapping(value = { "/update-ticket-type" }, method = RequestMethod.GET)
	@ResponseBody
	public int updateType(@RequestParam("tkt_id") int tkt_id, @RequestParam("type_id") int type_id,
			@RequestParam("tkt_issue_id") int tkt_issue_id, HttpServletRequest request) {
		int updateStatus = 0;
		try {
			updateStatus = ticketDao.updateTicketType(tkt_id, type_id, tkt_issue_id);

			return updateStatus;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return updateStatus;
	}
	
	

	@RequestMapping(value = { "/getIssueType" }, method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> getIssueType() {
		List<Map<String, Object>> issueTypeList = new ArrayList<Map<String,Object>>();
		try {
			issueTypeList = ticketDao.getTktIssueType();
			return issueTypeList;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return issueTypeList;
	}
	
	@RequestMapping(value = { "/getIssueCategoryByProject" }, method = RequestMethod.GET)
	@ResponseBody
	public List<Map<String, Object>> getIssueCategoryByProject(@RequestParam("project_id") int project_id) {
		List<Map<String, Object>> issueCategoryList = new ArrayList<Map<String,Object>>();
		try {
			issueCategoryList = ticketDao.getTktIssueCategory(project_id);
			return issueCategoryList;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return issueCategoryList;
	}
	
	
	/*@RequestMapping(value = { "/common-ticket" }, method = RequestMethod.GET)
	public ModelAndView getCommonTicket() {
		ModelAndView map = new ModelAndView("common-ticket");
		try {
			List<Map<String, Object>> projectList = ticketDao.getProject();
			map.addObject("page", "Common ticket like pool tiket");
			map.addObject("projectList", projectList);
			return map;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return map;
	}*/
	
	@ResponseBody
	@RequestMapping(value = { "/getCommontTicketByProject" }, method = RequestMethod.GET)
	public String getCommontTicketByProject(HttpServletRequest request, @RequestParam("projectID") int projectID) {
		HttpSession session = request.getSession();
		int userId = (Integer) session.getAttribute("userId");
		int userType = (Integer) session.getAttribute("userType");
		String list = null;
		try {
			
			List<Ticket> lists = ticketDao.getAllCommonTicket(projectID);

			StringBuffer sb = new StringBuffer();
			sb.append(
					"<section class=\"panel\">\r\n" + "                    <header class=\"panel-heading wht-bg\">\r\n"
							+ "                       <a class=\"btn btn-head\">COMMON-TICKET-LIST</a>\r\n"
							+ "                       </header>\r\n"
							+ "                     <div class=\"stats-last-agile\">\r\n"
							+ "					<table class=\"table stats-table example\">\r\n"
							+ "						<thead>\r\n" + "							<tr>\r\n"
							+ "								<th>Ticket.NO</th>\r\n"
							+ "								<th>Project</th>\r\n"
							+ "								<th>ULB</th>\r\n"
							+ "								<th>Raised By</th>\r\n"
							+ "								<th>Issue Category</th>\r\n"
							+ "								<th>Created Date</th>\r\n"
							+ "								<th>Updated Date</th>\r\n"
							+ "								<th>View</th>\r\n"
							+ "							</tr>\r\n" + "						</thead><tbody>");
		

			for (Ticket tkt : lists) {
				sb.append("<tr>");
				sb.append("<th scope=\"row\">TKT-" + tkt.getTktId() + "</th>\r\n" + "									<td>"
						+ tkt.getProject() + "</td>\r\n" + "									<td>" + tkt.getUlbName()
						+ "</td>\r\n" + "									<td>" + tkt.getRaiserName() + "</td>\r\n"
						+ "									<td>" + tkt.getIssueCategoryName() + "</td>\r\n"
						+ "									<td>" + tkt.getRaisedDate() + "</td>\r\n"
						+ "									<td>" + tkt.getUpdatedDate() + "</td>\r\n"
						+ "									<td><span class='btn btn-compose' onclick=viewAssignedTicket("
						+ tkt.getTktId() + ","+userId+","+tkt.getTktTypeId()+",'"+tkt.getTktType()+"',"+userType+",'assign','pop')><i class='fa fa-eye'> </i></span></td>");
				sb.append("</tr>");
			}
			sb.append("</tbody></table></div></section>");

			list = sb.toString();
			return list;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return list;
	}
	

	@RequestMapping(value = { "/push-pop" }, method = RequestMethod.GET)
	@ResponseBody
	public int pushPop(@RequestParam("ticketID") int ticketID,@RequestParam("userID") int userID,@RequestParam("option") String option) {
		int status = 0;
		try {
			if(option.equals("push"))
			status = ticketDao.pushTicket(ticketID);
			else
			status = ticketDao.popTicket(ticketID, userID);
			return status;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return status;
	}
	
	
}
