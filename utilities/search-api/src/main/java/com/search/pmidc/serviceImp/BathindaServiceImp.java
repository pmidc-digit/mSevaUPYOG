package com.search.pmidc.serviceImp;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.search.pmidc.bean.BathindaBean;
import com.search.pmidc.bean.BathindaBoundaryBean;
import com.search.pmidc.repository.BathindaBoundaryRepository;
import com.search.pmidc.repository.BathindaRepository;
import com.search.pmidc.service.BathindaService;


@Service
@Transactional 
public class BathindaServiceImp implements BathindaService{

	
	@Autowired 
	BathindaRepository bathindaRepository;
	  
	  @Autowired 
	  BathindaBoundaryRepository bathindaBoundRepo;
	  
	  
	  @Override public Map<Object, Object> collectSumByAssYear(String assYear) {
	  return (Map<Object, Object>) bathindaRepository.collectSumByAssYear(assYear);
	  }
	  
	  @Override public List<BathindaBoundaryBean> findLocality(String keyword) {
	  return (List<BathindaBoundaryBean>) bathindaBoundRepo.findLocality(keyword); 
	  }
	  
	  @Override public List<BathindaBean> findAll(String owner) { return
	  (List<BathindaBean>) bathindaRepository.findAllReco(owner, new PageRequest(0,50)); 
	  }
	  
	  @Override public List<BathindaBean> findAllByReturnId(String returnId) {
	  return (List<BathindaBean>) bathindaRepository.findAllByRetId(returnId); 
	  }
	  
	  @Override public List<BathindaBean> findAllByAssYear(String returnId, String assYear) {
	  return (List<BathindaBean>) bathindaRepository.findAllByAssYear(returnId, assYear); 
	  }
	  
	  @Override public List<BathindaBean> findByPhone(String phone) { 
	  return(List<BathindaBean>) bathindaRepository.findByPhone(phone, new PageRequest(0,50)); 
	  }
	  
	  @Override public List<BathindaBean> findAllByAssYearOwner(String assYear,String owner) { 
	  return (List<BathindaBean>)bathindaRepository.findAllByAssYearOwner(owner, assYear, new PageRequest(0,50)); 
	  }
	  
	  @Override public List<BathindaBean> findHistory(Set<String> sessionReturnId) {
	  return (List<BathindaBean>) bathindaRepository.findHistory(sessionReturnId); 
	  }
	  
	  @Override public BathindaBean findOnePtByPrevAssYearRid(String prev_returnId,String assYear) { 
	  return (BathindaBean)bathindaRepository.findOnePtByPrevAssYearRid(prev_returnId, assYear); 
	  }
	  
	  @Override public BathindaBean findOnePtByAssYearRid(String returnId, String assYear) { 
	  return (BathindaBean)bathindaRepository.findOnePtByAssYearRid(returnId, assYear); }
	  
	
}
