package com.search.pmidc.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.search.pmidc.bean.MohaliBean;
import com.search.pmidc.bean.MohaliBoundaryBean;

public interface MohaliBoundaryRepository extends CrudRepository<MohaliBean, Long>{
	
	
	  @Query("select code FROM MohaliBoundaryBean WHERE code LIKE %:keyword%") 
	  public List<MohaliBoundaryBean>  findLocality(@Param("keyword") String keyword);


}
