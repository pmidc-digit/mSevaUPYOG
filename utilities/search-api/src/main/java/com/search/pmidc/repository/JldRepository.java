package com.search.pmidc.repository;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.search.pmidc.bean.JldBean;

public interface JldRepository extends CrudRepository<JldBean, Long>

{
	  
	  @Query("FROM JldBean WHERE owner LIKE %:phone%") 
	  public List<JldBean> findByPhone(@Param("phone") String phone, Pageable pageable);

	  @Query("FROM JldBean WHERE owner LIKE %:owner%") 
	  public List<JldBean> findAllReco(@Param("owner") String owner, Pageable pageable);
	  
	  @Query("FROM JldBean WHERE returnid =:returnId OR previous_returnid =:returnId order by session")
	  public List<JldBean> findAllByRetId(@Param("returnId") String returnId);
	  
	  @Query("FROM JldBean WHERE returnid =:returnId AND session=:assYear")
	  public List<JldBean> findAllByAssYear(@Param("returnId") String returnId, @Param("assYear") String assYear);
	
	  
	  @Query("FROM JldBean WHERE owner LIKE %:owner% AND session=:assYear order by session") 
	  public List<JldBean> findAllByOwnerAssYear(@Param("owner") String owner, @Param("assYear") String assYear, Pageable pageable);
	  
	  @Query("FROM JldBean WHERE concat(session,':',returnid) IN :sessionReturnId order by session") 
	  public List<JldBean> findHistory(@Param("sessionReturnId")Set<String> sessionReturnId);
	 
	  
	  @Query("FROM JldBean WHERE previous_returnid=:prev_returnId AND session=:assYear") 
	  public JldBean findOnePtByPrevAssYearRid(@Param("prev_returnId")String prev_returnId, @Param("assYear")String assYear);
	  
	  @Query("FROM JldBean WHERE returnid=:returnId AND session=:assYear") 
	  public JldBean findOnePtByAssYearRid(@Param("returnId")String returnId, @Param("assYear")String assYear);
	  
}
