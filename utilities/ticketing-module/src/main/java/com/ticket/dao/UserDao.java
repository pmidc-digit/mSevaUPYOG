package com.ticket.dao;

import java.util.List;

import com.ticket.model.User;

public interface UserDao {

	public String save(User user);
	
	public User getAllDetails(User user);

	public List<User> getStaffDetails(int userId);

	public int updatePassword(String userName, String password);

}
