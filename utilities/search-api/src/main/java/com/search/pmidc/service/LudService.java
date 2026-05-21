package com.search.pmidc.service;

import java.util.List;
import java.util.Set;

import com.search.pmidc.bean.LudBean;

public interface LudService {
	public List<LudBean> findAll(String owner);
	public List<LudBean> findAllByReturnId(String returnId); 
	public List<LudBean> findAllByAssYear(String returnId, String assYear);
	public List<LudBean> findAllByAssYearOwner(String assYear, String owner);
	public List<LudBean> findHistory(Set<String> sessionReturnId);
	public LudBean findOnePtByPrevAssYearRid(String prev_returnId, String assYear);
	public LudBean findOnePtByAssYearRid(String returnId, String assYear);
}
