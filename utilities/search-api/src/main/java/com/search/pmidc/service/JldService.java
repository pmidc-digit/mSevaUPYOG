package com.search.pmidc.service;

import java.util.List;
import java.util.Set;

import com.search.pmidc.bean.JldBean;
import com.search.pmidc.bean.JldBoundaryBean;

public interface JldService {

	public List<JldBoundaryBean> findLocality(String keyword);
	public List<JldBean> findByPhone(String phone);
	public List<JldBean> findAll(String owner);
	public List<JldBean> findAllByReturnId(String returnId); 
	public List<JldBean> findAllByAssYear(String returnId, String assYear);
	public List<JldBean> findAllByAssYearOwner(String owner, String assYear);
	public List<JldBean> findHistory(Set<String> sessionReturnId);
	public JldBean findOnePtByPrevAssYearRid(String prev_returnId, String assYear);
	public JldBean findOnePtByAssYearRid(String returnId, String assYear);
	

}
