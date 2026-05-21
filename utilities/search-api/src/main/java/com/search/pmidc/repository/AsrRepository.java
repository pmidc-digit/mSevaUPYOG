package com.search.pmidc.repository;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.search.pmidc.bean.AsrBean;

public interface AsrRepository extends CrudRepository<AsrBean, Long>

{
	 @Query("SELECT SUM(cast(taxamt as float)) AS sum, COUNT(*) AS total FROM AsrBean WHERE session=:assYear") 
	  public Map<Object, Object> collectSumByAssYear(@Param("assYear") String assYear);

	 @Query("FROM AsrBean WHERE owner LIKE %:owner% order by session") 
	  public List<AsrBean> findAllReco(@Param("owner") String owner, Pageable pageable);
	 
	  @Query("FROM AsrBean WHERE owner LIKE %:phone% order by session") 
	  public List<AsrBean> findByPhone(@Param("phone") String phone, Pageable pageable);
	  
	  @Query("FROM AsrBean WHERE returnid=:returnId OR previous_returnid=:returnId order by session")
	  public List<AsrBean> findAllByRetId(@Param("returnId") String returnId);
	  
	  @Query("FROM AsrBean WHERE returnid=:returnId AND session=:assYear")
	  public List<AsrBean> findAllByAssYear(@Param("returnId") String returnId, @Param("assYear") String assYear);
	
	  @Query("FROM AsrBean WHERE owner LIKE %:owner% AND session=:assYear order by session") 
	  public List<AsrBean> findAllByAssYearOwner(@Param("owner") String owner, @Param("assYear") String assYear, Pageable pageable);
	  
	  @Query("FROM AsrBean WHERE concat(session,':',returnid) IN :sessionReturnId order by session") 
	  public List<AsrBean> findHistory(@Param("sessionReturnId")Set<String> sessionReturnId);
	 
	  
	  @Query("FROM AsrBean WHERE previous_returnid=:prev_returnId AND session=:assYear") 
	  public AsrBean findOnePtByPrevAssYearRid(@Param("prev_returnId")String prev_returnId, @Param("assYear")String assYear);
	  
	  @Query("FROM AsrBean WHERE returnid=:returnId AND session=:assYear") 
	  public AsrBean findOnePtByAssYearRid(@Param("returnId")String returnId, @Param("assYear")String assYear);
	  
}
