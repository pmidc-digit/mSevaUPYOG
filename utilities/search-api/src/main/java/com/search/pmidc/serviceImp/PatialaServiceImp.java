
  package com.search.pmidc.serviceImp;
  
  import java.util.List; import java.util.Map; 
  import java.util.Set;
  
  import org.springframework.beans.factory.annotation.Autowired; 
  import org.springframework.data.domain.PageRequest; 
  import org.springframework.stereotype.Service; 
  import org.springframework.transaction.annotation.Transactional;

import com.search.pmidc.bean.PatialaBean;
import com.search.pmidc.bean.PatialaBoundaryBean; 
import com.search.pmidc.repository.PatialaBoundaryRepository; 
import com.search.pmidc.repository.PatialaRepository; 
import com.search.pmidc.service.PatialaService;
  
  
  
  @Service
  @Transactional 
  public class PatialaServiceImp implements PatialaService{
  
  
  @Autowired 
  PatialaRepository patialaRepository;
  
  @Autowired 
  PatialaBoundaryRepository patialaBoundRepo;
  
  
  @Override public Map<Object, Object> collectSumByAssYear(String assYear) {
  return (Map<Object, Object>) patialaRepository.collectSumByAssYear(assYear);
  }
  
  @Override public List<PatialaBoundaryBean> findLocality(String keyword) {
  return (List<PatialaBoundaryBean>) patialaBoundRepo.findLocality(keyword); 
  }
  
  @Override public List<PatialaBean> findAll(String owner) { return
  (List<PatialaBean>) patialaRepository.findAllReco(owner, new PageRequest(0,50)); 
  }
  
  @Override public List<PatialaBean> findAllByReturnId(String returnId) {
  return (List<PatialaBean>) patialaRepository.findAllByRetId(returnId); 
  }
  
  @Override public List<PatialaBean> findAllByAssYear(String returnId, String assYear) {
  return (List<PatialaBean>) patialaRepository.findAllByAssYear(returnId, assYear); 
  }
  
  @Override public List<PatialaBean> findByPhone(String phone) { 
  return(List<PatialaBean>) patialaRepository.findByPhone(phone, new PageRequest(0,50)); 
  }
  
  @Override public List<PatialaBean> findAllByAssYearOwner(String assYear,String owner) { 
  return (List<PatialaBean>)patialaRepository.findAllByAssYearOwner(owner, assYear, new PageRequest(0,50)); 
  }
  
  @Override public List<PatialaBean> findHistory(Set<String> sessionReturnId) {
  return (List<PatialaBean>) patialaRepository.findHistory(sessionReturnId); 
  }
  
  @Override public PatialaBean findOnePtByPrevAssYearRid(String prev_returnId,String assYear) { 
  return (PatialaBean)patialaRepository.findOnePtByPrevAssYearRid(prev_returnId, assYear); 
  }
  
  @Override public PatialaBean findOnePtByAssYearRid(String returnId, String assYear) { 
  return (PatialaBean)patialaRepository.findOnePtByAssYearRid(returnId, assYear); }
  
  }
 