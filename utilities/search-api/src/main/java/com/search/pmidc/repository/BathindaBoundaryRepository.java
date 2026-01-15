package com.search.pmidc.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.search.pmidc.bean.BathindaBean;
import com.search.pmidc.bean.BathindaBoundaryBean;

public interface BathindaBoundaryRepository extends CrudRepository<BathindaBean, Long>{

	@Query("select code FROM BathindaBoundaryBean WHERE code LIKE %:keyword%")
	  public List<BathindaBoundaryBean> findLocality(@Param("keyword") String keyword); 
}
