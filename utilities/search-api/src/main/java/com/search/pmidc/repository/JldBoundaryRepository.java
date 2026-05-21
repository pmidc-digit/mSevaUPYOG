package com.search.pmidc.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.search.pmidc.bean.JldBoundaryBean;


public interface JldBoundaryRepository extends CrudRepository<JldBoundaryBean, Long>{
	
	
	  @Query("select code FROM JldBoundaryBean WHERE code LIKE %:keyword%") 
	  public List<JldBoundaryBean>  findLocality(@Param("keyword") String keyword);
	 

}
