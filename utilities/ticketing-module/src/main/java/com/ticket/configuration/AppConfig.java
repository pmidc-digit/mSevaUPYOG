package com.ticket.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewResolverRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.tiles3.TilesConfigurer;
import org.springframework.web.servlet.view.tiles3.TilesViewResolver;

import com.ticket.daoImpl.CommentDaoImpl;
import com.ticket.daoImpl.TicketDaoImpl;
import com.ticket.daoImpl.UserDaoImpl;

@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "com.ticket")
@PropertySource("classpath:application.properties")
public class AppConfig extends WebMvcConfigurerAdapter {

	private int maxUploadSizeInMb = 25 * 1024 * 1024; // 25 MB

	// Bean name must be "multipartResolver", by default Spring uses method name as
	// bean name.
	
	 @Bean
	    public static PropertySourcesPlaceholderConfigurer propertyConfigurer() {
	        return new PropertySourcesPlaceholderConfigurer();
	    }
	 
	@Bean
	public CommonsMultipartResolver multipartResolver() {

		CommonsMultipartResolver cmr = new CommonsMultipartResolver();
		cmr.setMaxUploadSize(maxUploadSizeInMb * 2);
		cmr.setMaxUploadSizePerFile(maxUploadSizeInMb); // bytes
		return cmr;

	}

	/**
	 * Configure TilesConfigurer.
	 */
	@Bean
	public TilesConfigurer tilesConfigurer() {
		TilesConfigurer tilesConfigurer = new TilesConfigurer();
		tilesConfigurer.setDefinitions(new String[] { "/WEB-INF/views/**/tiles.xml" });
		tilesConfigurer.setCheckRefresh(true);
		return tilesConfigurer;
	}

	/**
	 * Configure ViewResolvers to deliver preferred views.
	 */
	@Override
	public void configureViewResolvers(ViewResolverRegistry registry) {
		TilesViewResolver viewResolver = new TilesViewResolver();
		registry.viewResolver(viewResolver);
	}

	/**
	 * Configure ResourceHandlers to serve static resources like CSS/ Javascript
	 * etc...
	 */

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/static/**").addResourceLocations("/static/");
	}

	@Bean
	public UserDaoImpl userDao() {
		return new UserDaoImpl();
	}
	
	

	@Bean
	public TicketDaoImpl ticketDao() {
		return new TicketDaoImpl();
	}
	
	@Bean
	public CommentDaoImpl commentDao() {
		return new CommentDaoImpl();
	}
}
