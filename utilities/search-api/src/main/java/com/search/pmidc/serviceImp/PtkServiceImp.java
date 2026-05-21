package com.search.pmidc.serviceImp;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.search.pmidc.bean.PtkBean;
import com.search.pmidc.repository.PtkRepository;
import com.search.pmidc.service.PtkService;

@Service
@Transactional
public class PtkServiceImp implements PtkService {

	
	@Autowired
	PtkRepository ptkRepository;

	@Override
	public List<PtkBean> findByPhone(String phone) {
			return (List<PtkBean>) ptkRepository.findByPhone(phone, new PageRequest(0, 50));
		}
	
	@Override
	public List<PtkBean> findAll(String owner) {
			return (List<PtkBean>) ptkRepository.findAllReco(owner, new PageRequest(0, 50));
		}
	
	@Override public List<PtkBean> findAllByReturnId(String returnId) {
		  return  (List<PtkBean>) ptkRepository.findAllByRetId(returnId);
		  
		  }

	@Override
	public List<PtkBean> findAllByAssYear(String returnId, String assYear) {
		return  (List<PtkBean>) ptkRepository.findAllByAssYear(returnId, assYear);
	}
	
	@Override
	public List<PtkBean> findAllByAssYearOwner(String owner, String assYear) {
		return  (List<PtkBean>) ptkRepository.findAllByOwnerAssYear(owner, assYear, new PageRequest(0, 50));
	}
	
	@Override
	public List<PtkBean> findHistory(Set<String> sessionReturnId) {
		return  (List<PtkBean>) ptkRepository.findHistory(sessionReturnId);
	}

	@Override
	public PtkBean findOnePtByPrevAssYearRid(String prev_returnId, String assYear) {
		return  (PtkBean) ptkRepository.findOnePtByPrevAssYearRid(prev_returnId, assYear);
	}
	
	@Override
	public PtkBean findOnePtByAssYearRid(String returnId, String assYear) {
		return  (PtkBean) ptkRepository.findOnePtByAssYearRid(returnId, assYear);
	}
}
