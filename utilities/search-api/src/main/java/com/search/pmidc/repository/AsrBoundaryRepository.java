package com.search.pmidc.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.search.pmidc.bean.AsrBean;
import com.search.pmidc.bean.AsrBoundaryBean;

public interface AsrBoundaryRepository extends CrudRepository<AsrBean, Long>{
	
	
	  @Query("select code FROM AsrBoundaryBean WHERE code LIKE %:keyword%") 
	  public List<AsrBoundaryBean>  findLocality(@Param("keyword") String keyword);

}
