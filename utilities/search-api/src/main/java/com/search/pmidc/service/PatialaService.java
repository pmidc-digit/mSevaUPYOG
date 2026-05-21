package com.search.pmidc.service;

import java.util.List;
import java.util.Map;
import java.util.Set;

import com.search.pmidc.bean.PatialaBean;
import com.search.pmidc.bean.PatialaBoundaryBean;

public interface PatialaService {

	public Map<Object, Object> collectSumByAssYear(String assYear);
	public List<PatialaBoundaryBean> findLocality(String keyword);
	public List<PatialaBean> findAll(String owner);
	public List<PatialaBean> findAllByReturnId(String returnId); 
	public List<PatialaBean> findAllByAssYear(String returnId, String assYear);
	public List<PatialaBean> findByPhone(String phone);
	public List<PatialaBean> findAllByAssYearOwner(String assYear, String owner);
	public List<PatialaBean> findHistory(Set<String> sessionReturnId);
	public PatialaBean findOnePtByPrevAssYearRid(String prev_returnId, String assYear);
	public PatialaBean findOnePtByAssYearRid(String returnId, String assYear);
}
