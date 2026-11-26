package org.egov.investpunjab.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.investpunjab.constants.InvestPunjabConstants;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class MunicipalServiceStatusMapper {

    // Status map for Trade License (BF_TL)
    private static final Map<String, Integer> TL_STATUS_MAP;
    // Status map for Water Connection (BF_LG_WC)
    private static final Map<String, Integer> WS_STATUS_MAP;
    // Status map for Sewerage Connection (BF_LG_SC)
    private static final Map<String, Integer> SW_STATUS_MAP;

    static {
        // Trade License (TL) Status Mapping
        Map<String, Integer> tlMap = new HashMap<>();
        tlMap.put("INITIATED", InvestPunjabConstants.STATUS_DRAFT);
        tlMap.put("APPLIED", InvestPunjabConstants.STATUS_SUBMIT_PRE_SCRUTINY);
        tlMap.put("DOCVERIFY", InvestPunjabConstants.STATUS_FILE_IN_PROCESS);
        tlMap.put("PENDINGDOCVERIFY", InvestPunjabConstants.STATUS_FILE_IN_PROCESS);
        tlMap.put("FIELDINSPECTION", InvestPunjabConstants.STATUS_FILE_IN_PROCESS);
        tlMap.put("PENDINGFIELDINSPECTION", InvestPunjabConstants.STATUS_FILE_IN_PROCESS);
        tlMap.put("SENDBACKTOCITIZEN", InvestPunjabConstants.STATUS_OBJECTION_RAISED);
        tlMap.put("CITIZENACTION", InvestPunjabConstants.STATUS_OBJECTION_RAISED);
        tlMap.put("OBJECTION", InvestPunjabConstants.STATUS_OBJECTION_RAISED);
        tlMap.put("RESUBMITTED", InvestPunjabConstants.STATUS_OBJECTION_RESOLVED);
        tlMap.put("PENDINGPAYMENT", InvestPunjabConstants.STATUS_BALANCE_FEE_RAISED);
        tlMap.put("PAID", InvestPunjabConstants.STATUS_BALANCE_FEE_PAID);
        tlMap.put("FORWARDED", InvestPunjabConstants.STATUS_FORWARDED_TO_OFFICER);
        tlMap.put("PENDINGAPPROVAL", InvestPunjabConstants.STATUS_FORWARDED_TO_OFFICER);
        tlMap.put("APPROVED", InvestPunjabConstants.STATUS_APPROVED);
        tlMap.put("REJECTED", InvestPunjabConstants.STATUS_REJECTED);
        tlMap.put("CANCELLED", InvestPunjabConstants.STATUS_WITHDRAWN);
        TL_STATUS_MAP = Collections.unmodifiableMap(tlMap);

        // Water Connection (WS) Status Mapping
        Map<String, Integer> wsMap = new HashMap<>();
        wsMap.put("INITIATED", InvestPunjabConstants.STATUS_DRAFT);
        wsMap.put("APPLIED", InvestPunjabConstants.STATUS_SUBMIT_PRE_SCRUTINY);
        wsMap.put("PENDING_FOR_DOCUMENT_VERIFICATION", InvestPunjabConstants.STATUS_SUBMIT_PRE_SCRUTINY);
        wsMap.put("PENDING_FOR_FIELD_INSPECTION", InvestPunjabConstants.STATUS_FILE_IN_PROCESS);
        wsMap.put("PENDING_APPROVAL_FOR_CONNECTION", InvestPunjabConstants.STATUS_FORWARDED_TO_OFFICER);
        wsMap.put("PENDING_FOR_CITIZEN_ACTION", InvestPunjabConstants.STATUS_OBJECTION_RAISED);
        wsMap.put("RESUBMITTED", InvestPunjabConstants.STATUS_OBJECTION_RESOLVED);
        wsMap.put("PENDING_FOR_PAYMENT", InvestPunjabConstants.STATUS_BALANCE_FEE_RAISED);
        wsMap.put("PAID", InvestPunjabConstants.STATUS_BALANCE_FEE_PAID);
        wsMap.put("PENDING_FOR_CONNECTION_ACTIVATION", InvestPunjabConstants.STATUS_APPROVED);
        wsMap.put("APPROVED", InvestPunjabConstants.STATUS_APPROVED);
        wsMap.put("REJECTED", InvestPunjabConstants.STATUS_REJECTED);
        WS_STATUS_MAP = Collections.unmodifiableMap(wsMap);

        // Sewerage Connection (SW) Status Mapping
        Map<String, Integer> swMap = new HashMap<>();
        swMap.put("INITIATED", InvestPunjabConstants.STATUS_DRAFT);
        swMap.put("APPLIED", InvestPunjabConstants.STATUS_SUBMIT_PRE_SCRUTINY);
        swMap.put("PENDING_FOR_DOCUMENT_VERIFICATION", InvestPunjabConstants.STATUS_SUBMIT_PRE_SCRUTINY);
        swMap.put("PENDING_FOR_FIELD_INSPECTION", InvestPunjabConstants.STATUS_FILE_IN_PROCESS);
        swMap.put("PENDING_APPROVAL_FOR_CONNECTION", InvestPunjabConstants.STATUS_FORWARDED_TO_OFFICER);
        swMap.put("PENDING_FOR_CITIZEN_ACTION", InvestPunjabConstants.STATUS_OBJECTION_RAISED);
        swMap.put("RESUBMITTED", InvestPunjabConstants.STATUS_OBJECTION_RESOLVED);
        swMap.put("PENDING_FOR_PAYMENT", InvestPunjabConstants.STATUS_BALANCE_FEE_RAISED);
        swMap.put("PAID", InvestPunjabConstants.STATUS_BALANCE_FEE_PAID);
        swMap.put("PENDING_FOR_CONNECTION_ACTIVATION", InvestPunjabConstants.STATUS_APPROVED);
        swMap.put("APPROVED", InvestPunjabConstants.STATUS_APPROVED);
        swMap.put("REJECTED", InvestPunjabConstants.STATUS_REJECTED);
        SW_STATUS_MAP = Collections.unmodifiableMap(swMap);
    }

    /**
     * Maps an mSeva service status to an Invest Punjab status ID.
     *
     * @param serviceType "BF_TL", "BF_LG_WC", or "BF_LG_SC"
     * @param rawStatus mSeva status string (e.g. "APPROVED", "PENDING_FOR_DOCUMENT_VERIFICATION")
     * @return Invest Punjab status ID (11-27) per Technical Spec v1.2
     */
    public Integer mapStatus(String serviceType, String rawStatus) {
        if (StringUtils.isBlank(rawStatus)) {
            return InvestPunjabConstants.STATUS_FILE_IN_PROCESS;
        }

        String normalized = rawStatus.trim().toUpperCase();
        Integer mappedId = null;

        if (InvestPunjabConstants.SERVICE_TRADE_LICENSE.equalsIgnoreCase(serviceType)) {
            mappedId = TL_STATUS_MAP.get(normalized);
        } else if (InvestPunjabConstants.SERVICE_WATER_CONNECTION.equalsIgnoreCase(serviceType)) {
            mappedId = WS_STATUS_MAP.get(normalized);
        } else if (InvestPunjabConstants.SERVICE_SEWER_CONNECTION.equalsIgnoreCase(serviceType)) {
            mappedId = SW_STATUS_MAP.get(normalized);
        }

        if (mappedId == null) {
            log.warn("No explicit Invest Punjab status mapped for serviceType '{}' and status '{}'. Defaulting to STATUS_FILE_IN_PROCESS (21).",
                    serviceType, rawStatus);
            return InvestPunjabConstants.STATUS_FILE_IN_PROCESS;
        }

        return mappedId;
    }

    /**
     * Returns standard description for a mapped status ID.
     */
    public String getStatusDescription(Integer statusId) {
        if (statusId == null) {
            return "File In Process";
        }
        return InvestPunjabConstants.STATUS_NAME_MAP.getOrDefault(statusId, "File In Process");
    }
}
