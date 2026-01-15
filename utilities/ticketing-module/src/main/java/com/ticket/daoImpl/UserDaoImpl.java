package com.ticket.daoImpl;

import java.util.ArrayList;
import java.util.List;

import com.ticket.configuration.HibernateConfig;
import com.ticket.dao.UserDao;
import com.ticket.mapper.UserMapper;
import com.ticket.model.User;

public class UserDaoImpl extends HibernateConfig implements UserDao {
	
	@Override
	public String save(User user) {
		String message = user.getUserName()+"Has been registered successfully.";
		try {
			String sql = "INSERT INTO tkt_user (user_name, user_email, user_password, user_mobile_no, user_city) VALUES (?,?,?,?,?)";
			getJdbcTemplate().update(sql, user.getUserName(), user.getUserEmail(), user.getUserPassword(), user.getUserMobileNo(), user.getUlbId());
		} catch (Exception e) {
			if(e.toString().contains("Duplicate entry '"+user.getUserEmail()+"' for key 'user_email'"))
			{
				message = "Duplicate entry for Email. Please try again!";
			}
			else
			{
				message = "Duplicate entry for Mobile No. Please try again!";
			}
			
		}
		return message;
	}
	

	@Override
	public User getAllDetails(User user) {
		User userDetails = new User();
		try {
			String sql = "SELECT u.*, (SELECT count(*) from tickets WHERE ASSIGNED_TO_ID=u.user_id and STATUS=1)as resolved, (SELECT count(*) from tickets WHERE ASSIGNED_TO_ID=u.user_id and STATUS=0)as pending FROM tkt_user AS u WHERE u.user_email=? AND u.user_password=?";
			userDetails = (User) getJdbcTemplate().queryForObject(sql, new UserMapper(), user.getUserEmail(),
					user.getUserPassword());
			return userDetails;
		} catch (Exception e) {
			return userDetails;
		}
	}

	@Override
	public int updatePassword(String userName, String password) {
		int status = 0;
		try {
			String SQL = "update tkt_user set user_password = ? where user_name = ?";
			status = getJdbcTemplate().update(SQL, password, userName);
			return status;
		} catch (Exception e) {
			return status;
		}
	}

	@Override
	public List<User> getStaffDetails(int userId) {
		List<User> userList = new ArrayList<User>();
		try {
			String sql = "SELECT u.*, (SELECT count(*) from tickets WHERE ASSIGNED_TO_ID=u.user_id and STATUS=1)as resolved, (SELECT count(*) from tickets WHERE ASSIGNED_TO_ID=u.user_id and STATUS=0)as pending FROM tkt_user as u where u.user_type=1 AND user_id!=?";
			userList = getJdbcTemplate().query(sql, new UserMapper(), userId);
			return userList;
		} catch (Exception e) {
			return userList;
		}

	}

}
