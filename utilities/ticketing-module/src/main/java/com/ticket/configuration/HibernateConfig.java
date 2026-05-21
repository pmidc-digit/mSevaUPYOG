package com.ticket.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@Configuration
public class HibernateConfig {


	@Value("${db.sv.driver}")
    private String dbDriver;
	
	@Value("${db.sv.user}")
    private String dbUser;
	
	@Value("${db.sv.url}")
    private String dbUrl;
	
	@Value("${db.sv.password}")
    private String dbPassword;


	DriverManagerDataSource ds = new DriverManagerDataSource();
	@Bean
	public JdbcTemplate getJdbcTemplate() {
//For live
		ds.setDriverClassName(dbDriver);
	//ds.setDriverClassName("com.mysql.jdbc.Driver");
	//ds.setUrl("jdbc:mysql://pmidcdbinstance.c7gelbottzkp.ap-south-1.rds.amazonaws.com:3306/pmidcdb");
	//ds.setUsername("pmidcdb");
	//ds.setPassword("Pmidc123");

	ds.setUrl(dbUrl);
	ds.setUsername(dbUser);
	ds.setPassword(dbPassword);
// FOr Local
	/*ds.setDriverClassName("com.mysql.jdbc.Driver");
	ds.setUrl("jdbc:mysql://localhost:3306/pmidcdb");
	ds.setUsername("scott");
	ds.setPassword("tiger");*/
	
	JdbcTemplate jdbcTemplate = new JdbcTemplate(ds);
		return jdbcTemplate;
	}
	

}
