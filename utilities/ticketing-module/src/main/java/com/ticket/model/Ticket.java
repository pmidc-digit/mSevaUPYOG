package com.ticket.model;

import java.io.Serializable;
import java.util.Arrays;

import org.springframework.web.multipart.MultipartFile;

public class Ticket implements Serializable {

	private static final long serialVersionUID = 1L;
	private int tktId;
	private int ulbId;
	private String ulbName;
	private int projectId;
	private String project;
	private int tktTypeId;
	private String tktType;
	private int environmentType;
	private String environment;
	private int raisedById;
	private String AssigneeName;
	private String RaiserName;
	private int assignedToId;
	private String tktSummary;
	private String tktDescription;
	private String attachment;
	private int tktPriority;
	private String priority;
	private int status;
	private String raisedDate;
	private String updatedDate;
	private String closedDate;
	private int issueCategoryId;
	private String issueCategoryName;
	private int issueFeedbackId;
	private String issueFeedbackName;
	private MultipartFile [] files;
	private int readStatus;
	private String imageUrl;

	public Ticket() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Ticket(int tktId, int ulbId, String ulbName, int projectId, String project, int tktTypeId, String tktType,
			int environmentType, String environment, int raisedById, String assigneeName, String raiserName,
			int assignedToId, String tktSummary, String tktDescription, String attachment, int tktPriority,
			String priority, int status, String raisedDate, String updatedDate, String closedDate, int issueCategoryId,
			String issueCategoryName, int issueFeedbackId, String issueFeedbackName, MultipartFile[] files,
			int readStatus, String imageUrl) {
		super();
		this.tktId = tktId;
		this.ulbId = ulbId;
		this.ulbName = ulbName;
		this.projectId = projectId;
		this.project = project;
		this.tktTypeId = tktTypeId;
		this.tktType = tktType;
		this.environmentType = environmentType;
		this.environment = environment;
		this.raisedById = raisedById;
		AssigneeName = assigneeName;
		RaiserName = raiserName;
		this.assignedToId = assignedToId;
		this.tktSummary = tktSummary;
		this.tktDescription = tktDescription;
		this.attachment = attachment;
		this.tktPriority = tktPriority;
		this.priority = priority;
		this.status = status;
		this.raisedDate = raisedDate;
		this.updatedDate = updatedDate;
		this.closedDate = closedDate;
		this.issueCategoryId = issueCategoryId;
		this.issueCategoryName = issueCategoryName;
		this.issueFeedbackId = issueFeedbackId;
		this.issueFeedbackName = issueFeedbackName;
		this.files = files;
		this.readStatus = readStatus;
		this.imageUrl= imageUrl;
	}

	@Override
	public String toString() {
		return "Ticket [tktId=" + tktId + ", ulbId=" + ulbId + ", ulbName=" + ulbName + ", projectId=" + projectId
				+ ", project=" + project + ", tktTypeId=" + tktTypeId + ", tktType=" + tktType + ", environmentType="
				+ environmentType + ", environment=" + environment + ", raisedById=" + raisedById + ", AssigneeName="
				+ AssigneeName + ", RaiserName=" + RaiserName + ", assignedToId=" + assignedToId + ", tktSummary="
				+ tktSummary + ", tktDescription=" + tktDescription + ", attachment=" + attachment + ", tktPriority="
				+ tktPriority + ", priority=" + priority + ", status=" + status + ", raisedDate=" + raisedDate
				+ ", updatedDate=" + updatedDate + ", closedDate=" + closedDate + ", issueCategoryId=" + issueCategoryId
				+ ", issueCategoryName=" + issueCategoryName + ", issueFeedbackId=" + issueFeedbackId
				+ ", issueFeedbackName=" + issueFeedbackName + ", files=" + Arrays.toString(files) + ", readStatus="
				+ readStatus + ", imageUrl=" + imageUrl + "]";
	}

	public int getTktId() {
		return tktId;
	}

	public void setTktId(int tktId) {
		this.tktId = tktId;
	}

	public int getUlbId() {
		return ulbId;
	}

	public void setUlbId(int ulbId) {
		this.ulbId = ulbId;
	}

	public String getUlbName() {
		return ulbName;
	}

	public void setUlbName(String ulbName) {
		this.ulbName = ulbName;
	}

	public int getProjectId() {
		return projectId;
	}

	public void setProjectId(int projectId) {
		this.projectId = projectId;
	}

	public String getProject() {
		return project;
	}

	public void setProject(String project) {
		this.project = project;
	}

	public int getTktTypeId() {
		return tktTypeId;
	}

	public void setTktTypeId(int tktTypeId) {
		this.tktTypeId = tktTypeId;
	}

	public String getTktType() {
		return tktType;
	}

	public void setTktType(String tktType) {
		this.tktType = tktType;
	}

	public int getEnvironmentType() {
		return environmentType;
	}

	public void setEnvironmentType(int environmentType) {
		this.environmentType = environmentType;
	}

	public String getEnvironment() {
		return environment;
	}

	public void setEnvironment(String environment) {
		this.environment = environment;
	}

	public int getRaisedById() {
		return raisedById;
	}

	public void setRaisedById(int raisedById) {
		this.raisedById = raisedById;
	}

	public String getAssigneeName() {
		return AssigneeName;
	}

	public void setAssigneeName(String assigneeName) {
		AssigneeName = assigneeName;
	}

	public String getRaiserName() {
		return RaiserName;
	}

	public void setRaiserName(String raiserName) {
		RaiserName = raiserName;
	}

	public int getAssignedToId() {
		return assignedToId;
	}

	public void setAssignedToId(int assignedToId) {
		this.assignedToId = assignedToId;
	}

	public String getTktSummary() {
		return tktSummary;
	}

	public void setTktSummary(String tktSummary) {
		this.tktSummary = tktSummary;
	}

	public String getTktDescription() {
		return tktDescription;
	}

	public void setTktDescription(String tktDescription) {
		this.tktDescription = tktDescription;
	}

	public String getAttachment() {
		return attachment;
	}

	public void setAttachment(String attachment) {
		this.attachment = attachment;
	}

	public int getTktPriority() {
		return tktPriority;
	}

	public void setTktPriority(int tktPriority) {
		this.tktPriority = tktPriority;
	}

	public String getPriority() {
		return priority;
	}

	public void setPriority(String priority) {
		this.priority = priority;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public String getRaisedDate() {
		return raisedDate;
	}

	public void setRaisedDate(String raisedDate) {
		this.raisedDate = raisedDate;
	}

	public String getUpdatedDate() {
		return updatedDate;
	}

	public void setUpdatedDate(String updatedDate) {
		this.updatedDate = updatedDate;
	}

	public String getClosedDate() {
		return closedDate;
	}

	public void setClosedDate(String closedDate) {
		this.closedDate = closedDate;
	}

	public int getIssueCategoryId() {
		return issueCategoryId;
	}

	public void setIssueCategoryId(int issueCategoryId) {
		this.issueCategoryId = issueCategoryId;
	}

	public String getIssueCategoryName() {
		return issueCategoryName;
	}

	public void setIssueCategoryName(String issueCategoryName) {
		this.issueCategoryName = issueCategoryName;
	}

	public int getIssueFeedbackId() {
		return issueFeedbackId;
	}

	public void setIssueFeedbackId(int issueFeedbackId) {
		this.issueFeedbackId = issueFeedbackId;
	}

	public String getIssueFeedbackName() {
		return issueFeedbackName;
	}

	public void setIssueFeedbackName(String issueFeedbackName) {
		this.issueFeedbackName = issueFeedbackName;
	}

	public MultipartFile[] getFiles() {
		return files;
	}

	public void setFiles(MultipartFile[] files) {
		this.files = files;
	}

	public int getReadStatus() {
		return readStatus;
	}

	public void setReadStatus(int readStatus) {
		this.readStatus = readStatus;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	
}
