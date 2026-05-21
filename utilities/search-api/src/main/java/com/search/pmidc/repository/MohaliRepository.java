package com.search.pmidc.repository;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.search.pmidc.bean.MohaliBean;

public interface MohaliRepository extends CrudRepository<MohaliBean, Long>

{
	 @Query("SELECT SUM(cast(taxamt as float)) AS sum, COUNT(*) AS total FROM MohaliBean WHERE session=:assYear") 
	  public Map<Object, Object> collectSumByAssYear(@Param("assYear") String assYear);

	 @Query("FROM MohaliBean WHERE owner LIKE %:owner% order by session") 
	  public List<MohaliBean> findAllReco(@Param("owner") String owner, Pageable pageable);
	 
	  @Query("FROM MohaliBean WHERE owner LIKE %:phone% order by session") 
	  public List<MohaliBean> findByPhone(@Param("phone") String phone, Pageable pageable);
	  
	  @Query("FROM MohaliBean WHERE returnid=:returnId OR previous_returnid=:returnId order by session")
	  public List<MohaliBean> findAllByRetId(@Param("returnId") String returnId);
	  
	  @Query("FROM MohaliBean WHERE returnid=:returnId AND session=:assYear")
	  public List<MohaliBean> findAllByAssYear(@Param("returnId") String returnId, @Param("assYear") String assYear);
	
	  @Query("FROM MohaliBean WHERE owner LIKE %:owner% AND session=:assYear order by session") 
	  public List<MohaliBean> findAllByAssYearOwner(@Param("owner") String owner, @Param("assYear") String assYear, Pageable pageable);
	  
	  @Query("FROM MohaliBean WHERE concat(session,':',returnid) IN :sessionReturnId order by session") 
	  public List<MohaliBean> findHistory(@Param("sessionReturnId")Set<String> sessionReturnId);
	 
	  
	  @Query("FROM MohaliBean WHERE previous_returnid=:prev_returnId AND session=:assYear") 
	  public MohaliBean findOnePtByPrevAssYearRid(@Param("prev_returnId")String prev_returnId, @Param("assYear")String assYear);
	  
	  @Query("FROM MohaliBean WHERE returnid=:returnId AND session=:assYear") 
	  public MohaliBean findOnePtByAssYearRid(@Param("returnId")String returnId, @Param("assYear")String assYear);
	  
}
