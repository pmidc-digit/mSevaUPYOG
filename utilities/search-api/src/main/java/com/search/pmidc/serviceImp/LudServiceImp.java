package com.search.pmidc.serviceImp;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.search.pmidc.bean.LudBean;
import com.search.pmidc.repository.LudRepository;
import com.search.pmidc.service.LudService;

@Service
@Transactional
public class LudServiceImp implements LudService {
	@Autowired
	LudRepository ludRepository;

	@Override
	public List<LudBean> findAll(String owner) {
			return (List<LudBean>) ludRepository.findAllReco(owner, new PageRequest(0, 50));
		}
	
	@Override public List<LudBean> findAllByReturnId(String returnId) {
		  return  (List<LudBean>) ludRepository.findAllByRetId(returnId);
		  
		  }

	@Override
	public List<LudBean> findAllByAssYear(String returnId, String assYear) {
		return  (List<LudBean>) ludRepository.findAllByAssYear(returnId, assYear);
	}

	@Override
	public List<LudBean> findAllByAssYearOwner(String owner, String assYear) {
		return  (List<LudBean>) ludRepository.findAllByAssYearOwner(owner, assYear, new PageRequest(0, 50));
	}
	
	@Override
	public List<LudBean> findHistory(Set<String> sessionReturnId) {
		return  (List<LudBean>) ludRepository.findHistory(sessionReturnId);
	}

	@Override
	public LudBean findOnePtByPrevAssYearRid(String prev_returnId, String assYear) {
		return  (LudBean) ludRepository.findOnePtByPrevAssYearRid(prev_returnId, assYear);
	}
	
	@Override
	public LudBean findOnePtByAssYearRid(String returnId, String assYear) {
		return  (LudBean) ludRepository.findOnePtByAssYearRid(returnId, assYear);
	}
	
}