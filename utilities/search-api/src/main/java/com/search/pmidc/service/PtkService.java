package com.search.pmidc.service;

import java.util.List;
import java.util.Set;

import com.search.pmidc.bean.PtkBean;

public interface PtkService {

	public List<PtkBean> findByPhone(String phone);
	public List<PtkBean> findAll(String owner);
	public List<PtkBean> findAllByReturnId(String returnId); 
	public List<PtkBean> findAllByAssYear(String returnId, String assYear);
	public List<PtkBean> findAllByAssYearOwner(String owner, String assYear);
	public List<PtkBean> findHistory(Set<String> sessionReturnId);
	public PtkBean findOnePtByPrevAssYearRid(String prev_returnId, String assYear);
	public PtkBean findOnePtByAssYearRid(String returnId, String assYear);
}
