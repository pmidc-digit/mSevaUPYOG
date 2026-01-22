package com.search.pmidc.controller;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.search.pmidc.bean.PtkBean;
import com.search.pmidc.service.PtkService;


@Controller
public class PtkController {

	
	@Autowired
	PtkService ptkService;
	private HashMap <String,String>id_session = new HashMap<String,String>();
	private String latest_rid,latest_session;
	

	@RequestMapping(value = { "/ptk" })
	public String getAsrPage(Model model) {
		model.addAttribute("page", "PATHANKOT PROPERTY TAX LEGACY DATA");
		model.addAttribute("ulb", "ptk");
//		model.addAttribute("onclickFunction", "hitButton('ptk')");
		return "index";

	}
	
	@PostMapping(value = { "/search-ptkbyphone" })
	@ResponseBody
	public List<PtkBean> getPtkDataByPhone(@RequestParam("phone") String phone) {
		List<PtkBean> bean;
			  bean = ptkService.findByPhone(phone);
		return bean;
	}
	

	@PostMapping(value = { "/search-ptkbyowner" })
	@ResponseBody
	public List<PtkBean> getAsrData(@RequestParam("owner") String owner) {
		List<PtkBean> bean;
			  bean = ptkService.findAll(owner.toUpperCase());
		return bean;
	}
	
	@PostMapping(value = { "/search-ptkbyrid" })
	@ResponseBody
	public List<PtkBean> getAsrDataByrid(@RequestParam(value = "returnid") String returnid) {
		List<PtkBean> bean = ptkService.findAllByReturnId(returnid);
		return bean;
	}
	
	@PostMapping(value = { "/search-ptkbyyear" })
	@ResponseBody
	public List<PtkBean> getAsrDataByAssYear(@RequestParam(value = "assYear") String assYear, @RequestParam(value = "returnid") String returnid) {
		List<PtkBean> bean = ptkService.findAllByAssYear(returnid, assYear);
		return bean;
	}

	@PostMapping(value = { "/search-ptkbyyearOwner" })
	@ResponseBody
	public List<PtkBean> findAllByAssYearOwner(@RequestParam(value = "assYear") String assYear, @RequestParam(value = "owner") String owner) {
		List<PtkBean> bean = ptkService.findAllByAssYearOwner(owner.toUpperCase(), assYear);
		return bean;
	}
	
	@PostMapping(value = { "/search-ptkviewbysessionrid" })
	@ResponseBody
	public List<PtkBean> getPtkPTDataByRid(@RequestParam(value = "session") String session, @RequestParam(value = "returnid") String returnid) {
		Set<String> sessionNReturnId = new HashSet<String>();
		HashMap<String, String>history= fetch_history (returnid, session);
		for(String key : history.keySet())
			sessionNReturnId.add(key+":"+history.get(key));
		List<PtkBean> bean = ptkService.findHistory(sessionNReturnId);	
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
				PtkBean bean = ptkService.findOnePtByPrevAssYearRid(latest_rid, get_next_session(latest_session));		
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
	   PtkBean beans = ptkService.findOnePtByAssYearRid(rid, session);		
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
