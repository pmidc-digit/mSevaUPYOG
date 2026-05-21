package com.search.pmidc.repository;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.search.pmidc.bean.BathindaBean;



public interface BathindaRepository extends CrudRepository<BathindaBean, Long>{

	
	 @Query("SELECT SUM(cast(taxamt as float)) AS sum, COUNT(*) AS total FROM BathindaBean WHERE session=:assYear") 
	  public Map<Object, Object> collectSumByAssYear(@Param("assYear") String assYear);
	  
	  @Query("FROM BathindaBean WHERE owner LIKE %:owner% order by session") public
	  List<BathindaBean> findAllReco(@Param("owner") String owner, Pageable pageable);
	  
	  @Query("FROM BathindaBean WHERE owner LIKE %:phone% order by session") public
	  List<BathindaBean> findByPhone(@Param("phone") String phone, Pageable pageable);
	  
	  @Query("FROM BathindaBean WHERE returnid=:returnId OR previous_returnid=:returnId order by session") 
	  public List<BathindaBean> findAllByRetId(@Param("returnId") String returnId);
	  
	  @Query("FROM BathindaBean WHERE returnid=:returnId AND session=:assYear")
	  public List<BathindaBean> findAllByAssYear(@Param("returnId") String returnId, @Param("assYear") String assYear);
	  
	  @Query("FROM BathindaBean WHERE owner LIKE %:owner% AND session=:assYear order by session") 
	  public List<BathindaBean> findAllByAssYearOwner(@Param("owner") String owner, @Param("assYear") String assYear, Pageable pageable);
	  
	  @Query("FROM BathindaBean WHERE concat(session,':',returnid) IN :sessionReturnId order by session") 
	  public List<BathindaBean> findHistory(@Param("sessionReturnId")Set<String>sessionReturnId);
	  
	  
	  @Query("FROM BathindaBean WHERE previous_returnid=:prev_returnId AND session=:assYear") 
	  public BathindaBean findOnePtByPrevAssYearRid(@Param("prev_returnId")String prev_returnId, @Param("assYear")String assYear);
	  
	  @Query("FROM BathindaBean WHERE returnid=:returnId AND session=:assYear")
	  public BathindaBean findOnePtByAssYearRid(@Param("returnId")String returnId, @Param("assYear")String assYear);
	  
}
