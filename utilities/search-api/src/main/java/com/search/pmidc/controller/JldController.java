package com.search.pmidc.controller;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.search.pmidc.bean.JldBean;
import com.search.pmidc.bean.JldBoundaryBean;
import com.search.pmidc.service.JldService;

@Controller
@RequestMapping(value = { "/" })
public class JldController {
	@Autowired
	JldService jldService;
	private HashMap <String,String>id_session = new HashMap<String,String>();
	private String latest_rid,latest_session;
	
	@RequestMapping(value = { "/", "/jld" })
	public String getjldPage(Model model) {
		model.addAttribute("page", "JALANDHAR PROPERTY TAX LEGACY DATA");
//		model.addAttribute("onclickFunction", "hitButton('jld')");
		model.addAttribute("ulb", "jld");
		return "index";
	}
	
	@GetMapping(value = { "/jldlocality" })
	@ResponseBody
	public List<JldBoundaryBean> getJldLocality(@RequestParam("keyword") String keyword) {
		List<JldBoundaryBean> bean;
			  bean = jldService.findLocality(keyword.toUpperCase());
		return bean;
	}

	@PostMapping(value = { "/search-jldbyphone" })
	@ResponseBody
	public List<JldBean> getJldDataByPhone(@RequestParam("phone") String phone) {
		List<JldBean> bean;
			  bean = jldService.findByPhone(phone);
		return bean;
	}
	
	@PostMapping(value = { "/search-jldbyowner" })
	@ResponseBody
	public List<JldBean> getJldData(@RequestParam("owner") String owner) {
		List<JldBean> bean;
			  bean = jldService.findAll(owner.toUpperCase());
		return bean;
	}
	
	@PostMapping(value = { "/search-jldbyrid" })
	@ResponseBody
	public List<JldBean> getJldDataByrid(@RequestParam(value = "returnid") String returnid) {
		List<JldBean> bean = jldService.findAllByReturnId(returnid);
		return bean;
	}

	@PostMapping(value = { "/search-jldbyyear" })
	@ResponseBody
	public List<JldBean> getJldDataByAssYear(@RequestParam(value = "assYear") String assYear, @RequestParam(value = "returnid") String returnid) {
		List<JldBean> bean = jldService.findAllByAssYear(returnid, assYear);
		return bean;
	}

	@PostMapping(value = { "/search-jldbyyearowner" })
	@ResponseBody
	public List<JldBean> getJldDataByAssYearName(@RequestParam(value = "assYear") String assYear, @RequestParam(value = "owner") String owner) {
		List<JldBean> bean = jldService.findAllByAssYearOwner(owner.toUpperCase(), assYear);
		return bean;
	}
	
	@PostMapping(value = { "/search-jldviewbysessionrid" })
	@ResponseBody
	public List<JldBean> getJldPTDataByRid(@RequestParam(value = "session") String session, @RequestParam(value = "returnid") String returnid) {
		Set<String> sessionNReturnId = new HashSet<String>();
		HashMap<String, String>history= fetch_history (returnid, session);
		for(String key : history.keySet())
			sessionNReturnId.add(key+":"+history.get(key));
		List<JldBean> bean = jldService.findHistory(sessionNReturnId);	
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
				JldBean bean = jldService.findOnePtByPrevAssYearRid(latest_rid, get_next_session(latest_session));		
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
	   JldBean beans = jldService.findOnePtByAssYearRid(rid, session);		
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
