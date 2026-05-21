package com.search.pmidc.serviceImp;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.search.pmidc.bean.AsrBean;
import com.search.pmidc.bean.AsrBoundaryBean;
import com.search.pmidc.repository.AsrBoundaryRepository;
import com.search.pmidc.repository.AsrRepository;
import com.search.pmidc.service.AsrService;

@Service
@Transactional
public class AsrServiceImp implements AsrService {
	@Autowired
	AsrRepository asrRepository;
	@Autowired
	AsrBoundaryRepository asrBoundRepo;
	
	@Override
	public Map<Object, Object> collectSumByAssYear(String assYear) {
		return (Map<Object, Object>) asrRepository.collectSumByAssYear(assYear);
	}
	
	@Override
	public List<AsrBoundaryBean> findLocality(String keyword) {
			return (List<AsrBoundaryBean>) asrBoundRepo.findLocality(keyword);
		}

	@Override
	public List<AsrBean> findAll(String owner) {
			return (List<AsrBean>) asrRepository.findAllReco(owner, new PageRequest(0, 50));
		}
	
	@Override public List<AsrBean> findAllByReturnId(String returnId) {
		  return  (List<AsrBean>) asrRepository.findAllByRetId(returnId);
		  
		  }
	
	@Override
	public List<AsrBean> findByPhone(String phone) {
			return (List<AsrBean>) asrRepository.findByPhone(phone, new PageRequest(0, 50));
		}

	@Override
	public List<AsrBean> findAllByAssYear(String returnId, String assYear) {
		return  (List<AsrBean>) asrRepository.findAllByAssYear(returnId, assYear);
	}

	@Override
	public List<AsrBean> findAllByAssYearOwner(String owner, String assYear) {
		return  (List<AsrBean>) asrRepository.findAllByAssYearOwner(owner, assYear, new PageRequest(0, 50));
	}
	
	@Override
	public List<AsrBean> findHistory(Set<String> sessionReturnId) {
		return  (List<AsrBean>) asrRepository.findHistory(sessionReturnId);
	}

	@Override
	public AsrBean findOnePtByPrevAssYearRid(String prev_returnId, String assYear) {
		return  (AsrBean) asrRepository.findOnePtByPrevAssYearRid(prev_returnId, assYear);
	}
	
	@Override
	public AsrBean findOnePtByAssYearRid(String returnId, String assYear) {
		return  (AsrBean) asrRepository.findOnePtByAssYearRid(returnId, assYear);
	}

	
}
