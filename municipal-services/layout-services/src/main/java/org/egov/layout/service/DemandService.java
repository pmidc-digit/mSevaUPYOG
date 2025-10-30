package org.egov.layout.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.layout.config.LAYOUTConfiguration;
import org.egov.layout.repository.ServiceRequestRepository;
import org.egov.layout.util.LAYOUTConstants;
import org.egov.layout.web.model.calculator.Calculation;
import org.egov.layout.web.model.demand.Demand;
import org.egov.layout.web.model.demand.DemandDetail;
import org.egov.layout.web.model.demand.DemandRequest;
import org.egov.layout.web.model.demand.DemandResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class DemandService {

    @Autowired
    private LAYOUTConfiguration nocConfiguration;

    @Autowired
    private ObjectMapper mapper = new ObjectMapper();

    @Autowired
    private ServiceRequestRepository repository;

    public List<Demand> generateDemands(RequestInfo requestInfo, List<Calculation> calculations){
        List<Demand> demands = new ArrayList<>();

        for(Calculation calculation : calculations){
            DemandDetail demandDetail = DemandDetail.builder()
                    .tenantId(calculation.getTenantId())
                    .taxAmount(BigDecimal.valueOf(calculation.getTotalAmount()))
                    .taxHeadMasterCode(nocConfiguration.getTaxHeadMasterCode()).build();

            Demand demand = Demand.builder()
                    .tenantId(calculation.getTenantId()).consumerCode(calculation.getApplicationNumber())
                    .consumerType("NOC_APPLICATION_FEE")
                    .businessService(LAYOUTConstants.LAYOUT_MODULE)
                    .taxPeriodFrom(System.currentTimeMillis()).taxPeriodTo(System.currentTimeMillis())
                    .demandDetails(Collections.singletonList(demandDetail))
                    .build();

            demands.add(demand);
        }

        StringBuilder url = new StringBuilder().append(nocConfiguration.getBillingServiceHost())
                .append(nocConfiguration.getDemandCreateEndpoint());

        DemandRequest demandRequest = DemandRequest.builder().requestInfo(requestInfo).demands(demands).build();

        Object response = repository.fetchResult(url,demandRequest);

        DemandResponse demandResponse = mapper.convertValue(response,DemandResponse.class);
        return demandResponse.getDemands();
    }

//    public BillResponse getBill(RequestInfoWrapper requestInfoWrapper, String tenantId, String applicationNumber) {
//        String uri = getFetchBillURI();
//        uri = uri.replace("{1}", tenantId);
//        uri = uri.replace("{2}", applicationNumber);
//        uri = uri.replace("{3}", ndcConfiguration.getModuleCode());
//
//        Object response = repository.fetchResult(new StringBuilder(uri), requestInfoWrapper);
//        BillResponse billResponse = mapper.convertValue(response, BillResponse.class);
//
//        return billResponse;
//    }
//
//    public String getFetchBillURI(){
//        StringBuilder url = new StringBuilder(ndcConfiguration.getBillingServiceHost());
//        url.append(ndcConfiguration.getFetchBillEndpoint());
//        url.append("?");
//        url.append("tenantId=");
//        url.append("{1}");
//        url.append("&");
//        url.append("consumerCode=");
//        url.append("{2}");
//        url.append("&");
//        url.append("businessService=");
//        url.append("{3}");
//
//        return url.toString();
//    }
}
