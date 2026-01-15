package com.ticket.model;

public class Project {
	
	private int projectId;
	private String projectName;
	private int projectStatus;
	private long pendingTKT;
	private long resolvedTKT;
	public Project() {
		super();
		// TODO Auto-generated constructor stub
	}
	public Project(int projectId, String projectName, int projectStatus, long pendingTKT, long resolvedTKT) {
		super();
		this.projectId = projectId;
		this.projectName = projectName;
		this.projectStatus = projectStatus;
		this.pendingTKT = pendingTKT;
		this.resolvedTKT = resolvedTKT;
	}
	@Override
	public String toString() {
		return "Project [projectId=" + projectId + ", projectName=" + projectName + ", projectStatus=" + projectStatus
				+ ", pendingTKT=" + pendingTKT + ", resolvedTKT=" + resolvedTKT + "]";
	}
	public int getProjectId() {
		return projectId;
	}
	public void setProjectId(int projectId) {
		this.projectId = projectId;
	}
	public String getProjectName() {
		return projectName;
	}
	public void setProjectName(String projectName) {
		this.projectName = projectName;
	}
	public int getProjectStatus() {
		return projectStatus;
	}
	public void setProjectStatus(int projectStatus) {
		this.projectStatus = projectStatus;
	}
	public long getPendingTKT() {
		return pendingTKT;
	}
	public void setPendingTKT(long pendingTKT) {
		this.pendingTKT = pendingTKT;
	}
	public long getResolvedTKT() {
		return resolvedTKT;
	}
	public void setResolvedTKT(long resolvedTKT) {
		this.resolvedTKT = resolvedTKT;
	}

	
}
