package com.search.pmidc.service;

import java.util.List;
import java.util.Map;
import java.util.Set;

import com.search.pmidc.bean.BathindaBean;
import com.search.pmidc.bean.BathindaBoundaryBean;

public interface BathindaService {

	public Map<Object, Object> collectSumByAssYear(String assYear);
	public List<BathindaBoundaryBean> findLocality(String keyword);
	public List<BathindaBean> findAll(String owner);
	public List<BathindaBean> findAllByReturnId(String returnId); 
	public List<BathindaBean> findAllByAssYear(String returnId, String assYear);
	public List<BathindaBean> findByPhone(String phone);
	public List<BathindaBean> findAllByAssYearOwner(String assYear, String owner);
	public List<BathindaBean> findHistory(Set<String> sessionReturnId);
	public BathindaBean findOnePtByPrevAssYearRid(String prev_returnId, String assYear);
	public BathindaBean findOnePtByAssYearRid(String returnId, String assYear);
}
