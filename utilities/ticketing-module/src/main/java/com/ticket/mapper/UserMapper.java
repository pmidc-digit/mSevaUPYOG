package com.ticket.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import com.ticket.model.User;

public class UserMapper implements RowMapper<User> {

	@Override
	public User mapRow(ResultSet rs, int rowNum) throws SQLException {
		User user = new User();
		user.setUserId(rs.getInt("user_id"));
		user.setUserName(rs.getString("user_name"));
		user.setUserEmail(rs.getString("user_email"));
		user.setUserMobileNo(rs.getString("user_mobile_no"));
		user.setUserPassword(rs.getString("user_password"));
		user.setUserType(rs.getInt("user_type"));
		user.setUlbId(rs.getInt("user_city"));
		user.setPendingTKT(rs.getLong("pending"));
		user.setResolvedTKT(rs.getLong("resolved"));
		return user;
	}

}
