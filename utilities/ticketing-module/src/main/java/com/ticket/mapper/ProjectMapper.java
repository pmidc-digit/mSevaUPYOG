package com.ticket.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import com.ticket.model.Project;

public class ProjectMapper implements RowMapper<Project> {



@Override
public Project mapRow(ResultSet rs, int rowNum) throws SQLException {
	Project project = new Project();
	project.setProjectId(rs.getInt("project_id"));
	project.setProjectName(rs.getString("project_name"));
	project.setProjectStatus(rs.getInt("status"));
	project.setPendingTKT(rs.getLong("pending"));
	project.setResolvedTKT(rs.getLong("resolved"));
	return project;
}
}
