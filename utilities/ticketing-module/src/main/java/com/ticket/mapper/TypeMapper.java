package com.ticket.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import com.ticket.model.Type;

public class TypeMapper implements RowMapper<Type> {

	@Override
	public Type mapRow(ResultSet rs, int rowNum) throws SQLException {
		Type type = new Type();
		type.setTypeId(rs.getInt("type_id"));
		type.setType(rs.getString("type"));
		return type;
	}

}
