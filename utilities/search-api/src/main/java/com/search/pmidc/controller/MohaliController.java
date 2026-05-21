package com.search.pmidc.controller;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.search.pmidc.bean.MohaliBean;
import com.search.pmidc.bean.MohaliBoundaryBean;
import com.search.pmidc.service.MohaliService;

@Controller
public class MohaliController {
	@Autowired
	MohaliService mohaliService;
	private HashMap <String,String>id_session = new HashMap<String,String>();
	private String latest_rid,latest_session;
	

	@RequestMapping(value = { "/mohali" })
	public String getAsrPage(Model model) {
		model.addAttribute("page", "MOHALI PROPERTY TAX LEGACY DATA");
//		model.addAttribute("onclickFunction", "hitButton('asr')");
		model.addAttribute("ulb", "mohali");
		return "index";

	}
	
	@PostMapping(value = { "/collectSum-mohalibyyear" })
	@ResponseBody
	public Map<Object, Object> getAsrCollectSum(@RequestParam("assYear") String assYear) {
		Map<Object, Object> summary;
		summary = (Map<Object, Object>) mohaliService.collectSumByAssYear(assYear);
		return summary;
	}
	
	
	@PostMapping(value = { "/search-mohalibyowner" })
	@ResponseBody
	public List<MohaliBean> getAsrData(@RequestParam("owner") String owner) {
		List<MohaliBean> bean;
			  bean = mohaliService.findAll(owner.toUpperCase());
		return bean;
	}
	
	@PostMapping(value = { "/search-mohalibyrid" })
	@ResponseBody
	public List<MohaliBean> getAsrDataByrid(@RequestParam(value = "returnid") String returnid) {
		List<MohaliBean> bean = mohaliService.findAllByReturnId(returnid);
		return bean;
	}
	
	@PostMapping(value = { "/search-mohalibyyear" })
	@ResponseBody
	public List<MohaliBean> getAsrDataByAssYear(@RequestParam(value = "assYear") String assYear, @RequestParam(value = "returnid") String returnid) {
		List<MohaliBean> bean = mohaliService.findAllByAssYear(returnid, assYear);
		return bean;
	}
	
	@GetMapping(value = { "/mohalilocality" })
	@ResponseBody
	public List<MohaliBoundaryBean> getAsrLocality(@RequestParam("keyword") String keyword) {
		List<MohaliBoundaryBean> bean;
			  bean = mohaliService.findLocality(keyword.toUpperCase());
		return bean;
	}
	
	@PostMapping(value = { "/search-mohalibyphone" })
	@ResponseBody
	public List<MohaliBean> getAsrDataByPhone(@RequestParam("phone") String phone) {
		List<MohaliBean> bean;
			  bean = mohaliService.findByPhone(phone);
		return bean;
	}

	@PostMapping(value = { "/search-mohalibyyearOwner" })
	@ResponseBody
	public List<MohaliBean> findAllByAssYearOwner(@RequestParam(value = "assYear") String assYear, @RequestParam(value = "owner") String owner) {
		List<MohaliBean> bean = mohaliService.findAllByAssYearOwner(owner.toUpperCase(), assYear);
		return bean;
	}
	
	@PostMapping(value = { "/search-mohaliviewbysessionrid" })
	@ResponseBody
	public List<MohaliBean> getMohaliPTDataByRid(@RequestParam(value = "session") String session, @RequestParam(value = "returnid") String returnid) {
		Set<String> sessionNReturnId = new HashSet<String>();
		HashMap<String, String>history= fetch_history (returnid, session);
		for(String key : history.keySet())
			sessionNReturnId.add(key+":"+history.get(key));
		List<MohaliBean> bean = mohaliService.findHistory(sessionNReturnId);	
		return bean;
	}
		
		public HashMap<String, String> fetch_history (String rid,String session) 
		{
			latest_rid=rid;
			latest_session=session;
			get_latest_return();
			fetch_id_session(latest_rid,latest_session);
			return id_session;
		}
		
	private static String get_previos_session(String sess)
		{
		   	 String b[]=sess.split("-");
	   	     String prev_session=""+(Integer.parseInt(b[0])-1)+"-"+(Integer.parseInt(b[1])-1);
	   	     return prev_session;
		}
		
	private static String get_next_session(String sess)
		{
		   	 String b[]=sess.split("-");
	   	     String next_session=""+(Integer.parseInt(b[0])+1)+"-"+(Integer.parseInt(b[1])+1);
	   	     return next_session;
		}
		
	 private void get_latest_return()
		{
			
			try
			{
				MohaliBean bean = mohaliService.findOnePtByPrevAssYearRid(latest_rid, get_next_session(latest_session));		
			if(bean!=null && bean.getReturnid()!=null)
			{
				latest_rid=bean.getReturnid();
				latest_session=bean.getSession();
				get_latest_return();
			}
			}
			catch(Exception ex)
			{
				System.out.println("Exception :" +ex);
			}	
		}
	
	private void fetch_id_session(String rid,String session)
	{
		try
		{
	   id_session.put(session,rid);
	   MohaliBean beans = mohaliService.findOnePtByAssYearRid(rid, session);		
	   if(beans!=null && beans.getSession()!=null )
	   {
	   	 if(beans.getPrevious_returnid()!=null)
	   	 {
	   	 String prev_rid=beans.getPrevious_returnid();
	   	 String prev_session=get_previos_session(session);
	   	 fetch_id_session(prev_rid,prev_session);
	   	 }
	   }
		}
		catch(Exception ex)
		{
			System.out.println("error:"+ex);
		}

}

}
