
  package com.search.pmidc.repository;
  
  import java.util.List; import java.util.Map; 
  import java.util.Set;
  
  import org.springframework.data.domain.Pageable; 
  import org.springframework.data.jpa.repository.Query; 
  import org.springframework.data.repository.CrudRepository; 
  import org.springframework.data.repository.query.Param;
  
  import com.search.pmidc.bean.PatialaBean;
  
  public interface PatialaRepository extends CrudRepository<PatialaBean, Long>{
  
  @Query("SELECT SUM(cast(taxamt as float)) AS sum, COUNT(*) AS total FROM PatialaBean WHERE session=:assYear") 
  public Map<Object, Object> collectSumByAssYear(@Param("assYear") String assYear);
  
  @Query("FROM PatialaBean WHERE owner LIKE %:owner% order by session") public
  List<PatialaBean> findAllReco(@Param("owner") String owner, Pageable pageable);
  
  @Query("FROM PatialaBean WHERE owner LIKE %:phone% order by session") public
  List<PatialaBean> findByPhone(@Param("phone") String phone, Pageable pageable);
  
  @Query("FROM PatialaBean WHERE returnid=:returnId OR previous_returnid=:returnId order by session") 
  public List<PatialaBean> findAllByRetId(@Param("returnId") String returnId);
  
  @Query("FROM PatialaBean WHERE returnid=:returnId AND session=:assYear")
  public List<PatialaBean> findAllByAssYear(@Param("returnId") String returnId, @Param("assYear") String assYear);
  
  @Query("FROM PatialaBean WHERE owner LIKE %:owner% AND session=:assYear order by session") 
  public List<PatialaBean> findAllByAssYearOwner(@Param("owner") String owner, @Param("assYear") String assYear, Pageable pageable);
  
  @Query("FROM PatialaBean WHERE concat(session,':',returnid) IN :sessionReturnId order by session") 
  public List<PatialaBean> findHistory(@Param("sessionReturnId")Set<String>sessionReturnId);
  
  
  @Query("FROM PatialaBean WHERE previous_returnid=:prev_returnId AND session=:assYear") 
  public PatialaBean findOnePtByPrevAssYearRid(@Param("prev_returnId")String prev_returnId, @Param("assYear")String assYear);
  
  @Query("FROM PatialaBean WHERE returnid=:returnId AND session=:assYear")
  public PatialaBean findOnePtByAssYearRid(@Param("returnId")String returnId, @Param("assYear")String assYear);
  
  }
 