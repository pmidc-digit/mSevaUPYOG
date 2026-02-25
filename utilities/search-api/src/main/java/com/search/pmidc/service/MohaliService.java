package com.search.pmidc.service;

import java.util.List;
import java.util.Map;
import java.util.Set;

import com.search.pmidc.bean.MohaliBean;
import com.search.pmidc.bean.MohaliBoundaryBean;

public interface MohaliService {

	public Map<Object, Object> collectSumByAssYear(String assYear);
	public List<MohaliBoundaryBean> findLocality(String keyword);
	public List<MohaliBean> findAll(String owner);
	public List<MohaliBean> findAllByReturnId(String returnId); 
	public List<MohaliBean> findAllByAssYear(String returnId, String assYear);
	public List<MohaliBean> findByPhone(String phone);
	public List<MohaliBean> findAllByAssYearOwner(String assYear, String owner);
	public List<MohaliBean> findHistory(Set<String> sessionReturnId);
	public MohaliBean findOnePtByPrevAssYearRid(String prev_returnId, String assYear);
	public MohaliBean findOnePtByAssYearRid(String returnId, String assYear);
}
