package com.search.pmidc.service;

import java.util.List;
import java.util.Map;
import java.util.Set;

import com.search.pmidc.bean.AsrBean;
import com.search.pmidc.bean.AsrBoundaryBean;

public interface AsrService {
	public Map<Object, Object> collectSumByAssYear(String assYear);
	public List<AsrBoundaryBean> findLocality(String keyword);
	public List<AsrBean> findAll(String owner);
	public List<AsrBean> findAllByReturnId(String returnId); 
	public List<AsrBean> findAllByAssYear(String returnId, String assYear);
	public List<AsrBean> findByPhone(String phone);
	public List<AsrBean> findAllByAssYearOwner(String assYear, String owner);
	public List<AsrBean> findHistory(Set<String> sessionReturnId);
	public AsrBean findOnePtByPrevAssYearRid(String prev_returnId, String assYear);
	public AsrBean findOnePtByAssYearRid(String returnId, String assYear);
}
