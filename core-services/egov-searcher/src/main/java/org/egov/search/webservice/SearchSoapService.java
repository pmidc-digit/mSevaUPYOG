package org.egov.search.webservice;

import java.util.Map;

import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebResult;
import jakarta.jws.WebService;
import jakarta.xml.ws.RequestWrapper;
import jakarta.xml.ws.ResponseWrapper;

import org.egov.search.model.SearchRequest;
import org.egov.search.model.SoapRespnse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;



@WebService(targetNamespace = "http://org.egov.search.webservice/", name = "SearchSoapService")

public interface SearchSoapService {

	
	@WebResult(name = "return", targetNamespace = "")
    @RequestWrapper(localName = "getData",
                    targetNamespace = "http://org.egov.search.webservice/",
                    className = "org.egov.search.webservice.GetData")
    @WebMethod(action = "urn:GetData")
	
    @ResponseWrapper(
                     targetNamespace = "http://org.egov.search.webservice/",
                     className = "org.egov.search.model.SoapRespnses")
   
	//String sayHello(@WebParam(name = "myname", targetNamespace = "") String myname);
	
	public SoapRespnse getData(@WebParam(name = "moduleName", targetNamespace = "") String moduleName,
			@PathVariable("searchName") String searchName,
			@RequestBody SearchRequest searchRequest, @RequestParam Map<String, String> queryParams) ;	
	
}


