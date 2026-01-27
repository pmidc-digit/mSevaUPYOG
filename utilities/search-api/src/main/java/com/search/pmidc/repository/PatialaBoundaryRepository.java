
  package com.search.pmidc.repository;
  
  import java.util.List;
  
  import org.springframework.data.jpa.repository.Query; 
  import org.springframework.data.repository.CrudRepository; 
  import org.springframework.data.repository.query.Param;
  
  import com.search.pmidc.bean.PatialaBean; 
  import com.search.pmidc.bean.PatialaBoundaryBean;
  
  public interface PatialaBoundaryRepository extends CrudRepository<PatialaBean, Long>{
  
  @Query("select code FROM PatialaBoundaryBean WHERE code LIKE %:keyword%")
  public List<PatialaBoundaryBean> findLocality(@Param("keyword") String keyword); 
  
 }
 