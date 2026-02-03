package com.search.pmidc.repository;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;

import com.search.pmidc.bean.PtkBean;

@Service
public interface PtkRepository extends CrudRepository<PtkBean, Long>{

	@Query("FROM PtkBean WHERE owner LIKE %:phone%")
	public List<PtkBean> findByPhone(@Param("phone") String phone, Pageable pageable);

	@Query("FROM PtkBean WHERE owner LIKE %:owner%")
	public List<PtkBean> findAllReco(@Param("owner") String owner, Pageable pageable);

	@Query("FROM PtkBean WHERE returnid =:returnId OR previous_returnid =:returnId")
	public List<PtkBean> findAllByRetId(@Param("returnId") String returnId);

	@Query("FROM PtkBean WHERE returnid =:returnId AND session=:assYear")
	public List<PtkBean> findAllByAssYear(@Param("returnId") String returnId, @Param("assYear") String assYear);

	@Query("FROM PtkBean WHERE owner LIKE %:owner% AND session=:assYear")
	public List<PtkBean> findAllByOwnerAssYear(@Param("owner") String owner, @Param("assYear") String assYear,
			Pageable pageable);
	
	  @Query("FROM PtkBean WHERE concat(session,':',returnid) IN :sessionReturnId order by session") 
	  public List<PtkBean> findHistory(@Param("sessionReturnId")Set<String> sessionReturnId);
	 
	  
	  @Query("FROM PtkBean WHERE previous_returnid=:prev_returnId AND session=:assYear") 
	  public PtkBean findOnePtByPrevAssYearRid(@Param("prev_returnId")String prev_returnId, @Param("assYear")String assYear);
	  
	  @Query("FROM PtkBean WHERE returnid=:returnId AND session=:assYear") 
	  public PtkBean findOnePtByAssYearRid(@Param("returnId")String returnId, @Param("assYear")String assYear);

}
