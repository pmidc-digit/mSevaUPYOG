package com.search.pmidc.serviceImp;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.search.pmidc.bean.JldBean;
import com.search.pmidc.bean.JldBoundaryBean;
import com.search.pmidc.repository.JldBoundaryRepository;
import com.search.pmidc.repository.JldRepository;
import com.search.pmidc.service.JldService;

@Service
@Transactional
public class JldServiceImp implements JldService {
	@Autowired
	JldRepository jldRepository;
	@Autowired
	JldBoundaryRepository jldBoundRepo;
	
	@Override
	public List<JldBoundaryBean> findLocality(String keyword) {
			return (List<JldBoundaryBean>) jldBoundRepo.findLocality(keyword);
		}

	@Override
	public List<JldBean> findByPhone(String phone) {
			return (List<JldBean>) jldRepository.findByPhone(phone, new PageRequest(0, 50));
		}
	
	@Override
	public List<JldBean> findAll(String owner) {
			return (List<JldBean>) jldRepository.findAllReco(owner, new PageRequest(0, 50));
		}
	
	@Override public List<JldBean> findAllByReturnId(String returnId) {
		  return  (List<JldBean>) jldRepository.findAllByRetId(returnId);
		  
		  }

	@Override
	public List<JldBean> findAllByAssYear(String returnId, String assYear) {
		return  (List<JldBean>) jldRepository.findAllByAssYear(returnId, assYear);
	}
	
	@Override
	public List<JldBean> findAllByAssYearOwner(String owner, String assYear) {
		return  (List<JldBean>) jldRepository.findAllByOwnerAssYear(owner, assYear, new PageRequest(0, 50));
	}
	
	@Override
	public List<JldBean> findHistory(Set<String> sessionReturnId) {
		return  (List<JldBean>) jldRepository.findHistory(sessionReturnId);
	}

	@Override
	public JldBean findOnePtByPrevAssYearRid(String prev_returnId, String assYear) {
		return  (JldBean) jldRepository.findOnePtByPrevAssYearRid(prev_returnId, assYear);
	}
	
	@Override
	public JldBean findOnePtByAssYearRid(String returnId, String assYear) {
		return  (JldBean) jldRepository.findOnePtByAssYearRid(returnId, assYear);
	}
}