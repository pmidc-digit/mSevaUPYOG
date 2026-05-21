package com.search.pmidc.repository;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.search.pmidc.bean.LudBean;

public interface LudRepository extends CrudRepository<LudBean, Long>

{
	 @Query("FROM LudBean WHERE owner LIKE %:owner%") 
	  public List<LudBean> findAllReco(@Param("owner") String owner, Pageable pageable);
	  
	  @Query("FROM LudBean WHERE returnid=:returnId OR previous_returnid=:returnId order by session")
	  public List<LudBean> findAllByRetId(@Param("returnId") String returnId);
	  
	  @Query("FROM LudBean WHERE returnid =:returnId AND session=:assYear")
	  public List<LudBean> findAllByAssYear(@Param("returnId") String returnId, @Param("assYear") String assYear);
	
	  @Query("FROM LudBean WHERE owner LIKE %:owner% AND session=:assYear order by session") 
	  public List<LudBean> findAllByAssYearOwner(@Param("owner") String owner, @Param("assYear") String assYear, Pageable pageable);
	  
	  @Query("FROM LudBean WHERE concat(session,':',returnid) IN :sessionReturnId order by session") 
	  public List<LudBean> findHistory(@Param("sessionReturnId")Set<String> sessionReturnId);
	 
	  
	  @Query("FROM LudBean WHERE previous_returnid=:prev_returnId AND session=:assYear") 
	  public LudBean findOnePtByPrevAssYearRid(@Param("prev_returnId")String prev_returnId, @Param("assYear")String assYear);
	  
	  @Query("FROM LudBean WHERE returnid=:returnId AND session=:assYear") 
	  public LudBean findOnePtByAssYearRid(@Param("returnId")String returnId, @Param("assYear")String assYear);
	  
}
