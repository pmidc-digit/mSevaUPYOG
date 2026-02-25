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

import com.search.pmidc.bean.BathindaBean;
import com.search.pmidc.bean.BathindaBoundaryBean;
import com.search.pmidc.service.BathindaService;

@Controller
public class BathindaController {

	@Autowired 
	BathindaService bathindaService;
	
	private HashMap <String,String>id_session = new HashMap<String,String>();
	private String latest_rid,latest_session;
	 
	 
	@RequestMapping(value = { "/bathinda" }) public String getAsrPage(Model model)
	  { 
	  model.addAttribute("page", "BATHINDA PROPERTY TAX LEGACY DATA");
	  // model.addAttribute("onclickFunction", "hitButton('bathinda')");
	  model.addAttribute("ulb", "bathinda"); 
	  return "index";
	  } 
	
	@PostMapping(value = { "/collectSum-bathindabyyear" })
	@ResponseBody
	public Map<Object, Object> getAsrCollectSum(@RequestParam("assYear") String assYear) {
		Map<Object, Object> summary;
		summary = (Map<Object, Object>) bathindaService.collectSumByAssYear(assYear);
		return summary;
	}
	
	
	@PostMapping(value = { "/search-bathindabyowner" })
	@ResponseBody
	public List<BathindaBean> getAsrData(@RequestParam("owner") String owner) {
		List<BathindaBean> bean;
			  bean = bathindaService.findAll(owner.toUpperCase());
		return bean;
	}
	
	@PostMapping(value = { "/search-bathindabyrid" })
	@ResponseBody
	public List<BathindaBean> getAsrDataByrid(@RequestParam(value = "returnid") String returnid) {
		List<BathindaBean> bean = bathindaService.findAllByReturnId(returnid);
		return bean;
	}
	
	
	
	
	
	
	
	@PostMapping(value = { "/search-bathindabyyear" })
	@ResponseBody
	public List<BathindaBean> getAsrDataByAssYear(@RequestParam(value = "assYear") String assYear, @RequestParam(value = "returnid") String returnid) {
		List<BathindaBean> bean = bathindaService.findAllByAssYear(returnid, assYear);
		return bean;
	}
  
  
  @GetMapping(value = { "/bathindalocality" })
	@ResponseBody
	public List<BathindaBoundaryBean> getAsrLocality(@RequestParam("keyword") String keyword) {
		List<BathindaBoundaryBean> bean;
			  bean = bathindaService.findLocality(keyword.toUpperCase());
		return bean;
	}
  
  
  @PostMapping(value = { "/search-bathindabyphone" })
	@ResponseBody
	public List<BathindaBean> getAsrDataByPhone(@RequestParam("phone") String phone) {
		List<BathindaBean> bean;
			  bean = bathindaService.findByPhone(phone);
		return bean;
	}
  
  
  
  @PostMapping(value = { "/search-bathindabyyearOwner" })
	@ResponseBody
	public List<BathindaBean> findAllByAssYearOwner(@RequestParam(value = "assYear") String assYear, @RequestParam(value = "owner") String owner) {
		List<BathindaBean> bean = bathindaService.findAllByAssYearOwner(owner.toUpperCase(), assYear);
		return bean;
	}
  
  
  @PostMapping(value = { "/search-bathindaviewbysessionrid" })
	@ResponseBody
	public List<BathindaBean> getBathindaPTDataByRid(@RequestParam(value = "session") String session, @RequestParam(value = "returnid") String returnid) {
		Set<String> sessionNReturnId = new HashSet<String>();
		HashMap<String, String>history= fetch_history (returnid, session);
		for(String key : history.keySet())
			sessionNReturnId.add(key+":"+history.get(key));
		List<BathindaBean> bean = bathindaService.findHistory(sessionNReturnId);	
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
			BathindaBean bean = bathindaService.findOnePtByPrevAssYearRid(latest_rid, get_next_session(latest_session));		
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
	   BathindaBean beans = bathindaService.findOnePtByAssYearRid(rid, session);		
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
