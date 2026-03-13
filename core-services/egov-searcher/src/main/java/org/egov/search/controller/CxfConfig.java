package org.egov.search.controller;

import jakarta.xml.ws.Endpoint;
import org.apache.cxf.Bus;
import org.apache.cxf.jaxws.EndpointImpl;
import org.egov.search.service.SearchService;
import org.egov.search.webservice.SearchSoapServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CxfConfig {

    private final Bus bus;
    private final SearchService searchService;

    public CxfConfig(Bus bus, SearchService searchService) {
        this.bus = bus;
        this.searchService = searchService;
    }

    @Bean
    public Endpoint endpoint() {
        EndpointImpl endpoint = new EndpointImpl(bus, new SearchSoapServiceImpl(searchService));
        endpoint.publish("/SearchPMIDC");
        return endpoint;
    }
}