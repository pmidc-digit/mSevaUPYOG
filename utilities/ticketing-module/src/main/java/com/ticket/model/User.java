package com.ticket.model;

import java.io.Serializable;

public class User implements Serializable {

	private static final long serialVersionUID = 1L;
	private int userId;
	private String userName;
	private String userEmail;
	private String userPassword;
	private String userMobileNo;
	private int userType;
	private int ulbId;
	private long pendingTKT;
	private long resolvedTKT;

	public User() {
		super();
		// TODO Auto-generated constructor stub
	}

	public User(int userId, String userName, String userEmail, String userPassword, String userMobileNo, int userType,
			int ulbId, long pendingTKT, long resolvedTKT) {
		super();
		this.userId = userId;
		this.userName = userName;
		this.userEmail = userEmail;
		this.userPassword = userPassword;
		this.userMobileNo = userMobileNo;
		this.userType = userType;
		this.ulbId = ulbId;
		this.pendingTKT = pendingTKT;
		this.resolvedTKT = resolvedTKT;
	}

	@Override
	public String toString() {
		return "User [userId=" + userId + ", userName=" + userName + ", userEmail=" + userEmail + ", userPassword="
				+ userPassword + ", userMobileNo=" + userMobileNo + ", userType=" + userType + ", ulbId=" + ulbId
				+ ", pendingTKT=" + pendingTKT + ", resolvedTKT=" + resolvedTKT + "]";
	}

	public int getUserId() {
		return userId;
	}

	public void setUserId(int userId) {
		this.userId = userId;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getUserEmail() {
		return userEmail;
	}

	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}

	public String getUserPassword() {
		return userPassword;
	}

	public void setUserPassword(String userPassword) {
		this.userPassword = userPassword;
	}

	public String getUserMobileNo() {
		return userMobileNo;
	}

	public void setUserMobileNo(String userMobileNo) {
		this.userMobileNo = userMobileNo;
	}

	public int getUserType() {
		return userType;
	}

	public void setUserType(int userType) {
		this.userType = userType;
	}

	public int getUlbId() {
		return ulbId;
	}

	public void setUlbId(int ulbId) {
		this.ulbId = ulbId;
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
