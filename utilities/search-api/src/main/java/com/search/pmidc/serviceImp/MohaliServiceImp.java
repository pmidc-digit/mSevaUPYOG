package com.search.pmidc.serviceImp;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.search.pmidc.bean.MohaliBean;
import com.search.pmidc.bean.MohaliBoundaryBean;
import com.search.pmidc.repository.MohaliBoundaryRepository;
import com.search.pmidc.repository.MohaliRepository;
import com.search.pmidc.service.MohaliService;

@Service
@Transactional
public class MohaliServiceImp implements MohaliService {
	@Autowired
	MohaliRepository mohaliRepository;
	@Autowired
	MohaliBoundaryRepository mohaliBoundRepo;
	
	@Override
	public Map<Object, Object> collectSumByAssYear(String assYear) {
		return (Map<Object, Object>) mohaliRepository.collectSumByAssYear(assYear);
	}
	
	@Override
	public List<MohaliBoundaryBean> findLocality(String keyword) {
			return (List<MohaliBoundaryBean>) mohaliBoundRepo.findLocality(keyword);
		}

	@Override
	public List<MohaliBean> findAll(String owner) {
			return (List<MohaliBean>) mohaliRepository.findAllReco(owner, new PageRequest(0, 50));
		}
	
	@Override public List<MohaliBean> findAllByReturnId(String returnId) {
		  return  (List<MohaliBean>) mohaliRepository.findAllByRetId(returnId);
		  
		  }
	
	@Override
	public List<MohaliBean> findByPhone(String phone) {
			return (List<MohaliBean>) mohaliRepository.findByPhone(phone, new PageRequest(0, 50));
		}

	@Override
	public List<MohaliBean> findAllByAssYear(String returnId, String assYear) {
		return  (List<MohaliBean>) mohaliRepository.findAllByAssYear(returnId, assYear);
	}

	@Override
	public List<MohaliBean> findAllByAssYearOwner(String owner, String assYear) {
		return  (List<MohaliBean>) mohaliRepository.findAllByAssYearOwner(owner, assYear, new PageRequest(0, 50));
	}
	
	@Override
	public List<MohaliBean> findHistory(Set<String> sessionReturnId) {
		return  (List<MohaliBean>) mohaliRepository.findHistory(sessionReturnId);
	}

	@Override
	public MohaliBean findOnePtByPrevAssYearRid(String prev_returnId, String assYear) {
		return  (MohaliBean) mohaliRepository.findOnePtByPrevAssYearRid(prev_returnId, assYear);
	}
	
	@Override
	public MohaliBean findOnePtByAssYearRid(String returnId, String assYear) {
		return  (MohaliBean) mohaliRepository.findOnePtByAssYearRid(returnId, assYear);
	}

}
