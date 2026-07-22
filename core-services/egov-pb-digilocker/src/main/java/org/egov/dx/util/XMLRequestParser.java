package org.egov.dx.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.security.AnyTypePermission;
import com.thoughtworks.xstream.security.NoTypePermission;
import com.thoughtworks.xstream.security.NullPermission;
import com.thoughtworks.xstream.security.PrimitiveTypePermission;
import lombok.extern.slf4j.Slf4j;
import org.egov.dx.web.models.PullDocRequest;
import org.egov.dx.web.models.PullURIRequest;
import org.egov.dx.web.models.SearchCriteria;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class XMLRequestParser {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public SearchCriteria parsePullURIRequest(String xmlBody, String origin) {
        XStream xstream = configureXStream();
        xstream.processAnnotations(PullURIRequest.class);
        Object obj = xstream.fromXML(xmlBody);
        PullURIRequest request = objectMapper.convertValue(obj, PullURIRequest.class);
        String txn = extractTxn(xmlBody, request.getTxn()); 
        
        // FIX: Check for both propertyId and consumerCode
        String idToSearch = request.getDocDetails().getPropertyId();
        if (idToSearch == null || idToSearch.trim().isEmpty()) {
            idToSearch = request.getDocDetails().getConsumerCode();
        }

        SearchCriteria criteria = SearchCriteria.builder()
            .propertyId(trim(idToSearch))
            .city(trim(request.getDocDetails().getCity()))
            .connType(trim(request.getDocDetails().getConnType()))
            .level1(trim(request.getDocDetails().getLevel1()))
            .level2(trim(request.getDocDetails().getLevel2()))
            .origin(trim(origin))
            .txn(trim(txn))
            .docType(trim(request.getDocDetails().getDocType()))
            .payerName(trim(request.getDocDetails().getFullName()))
            .mobile(trim(request.getDocDetails().getMobile()))
            .build();
            
        return criteria;
    }

    public SearchCriteria parsePullDocRequest(String xmlBody, String origin) {
        XStream xstream = configureXStream();
        xstream.processAnnotations(PullDocRequest.class);
        PullDocRequest request = (PullDocRequest) xstream.fromXML(xmlBody);
        String txn = extractTxn(xmlBody, request.getTxn());
        SearchCriteria criteria = new SearchCriteria();
        criteria.setURI(trim(request.getDocDetails().getURI()));
        criteria.setOrigin(trim(origin));
        criteria.setTxn(trim(txn));
        return criteria;
    }

    private String extractTxn(String xmlBody, String txnAttr) {
        if (txnAttr != null) return txnAttr.trim();
        // Fallback regex split from original
        return xmlBody.split("txn=\"")[1].split("\"")[0].trim();
    }

    private String trim(String val) {
        return val != null ? val.trim() : null;
    }

    private XStream configureXStream() {
        XStream xstream = new XStream();
        xstream.addPermission(NoTypePermission.NONE);
        xstream.addPermission(NullPermission.NULL);
        xstream.addPermission(PrimitiveTypePermission.PRIMITIVES);
        xstream.addPermission(AnyTypePermission.ANY);
        return xstream;
    }
}
