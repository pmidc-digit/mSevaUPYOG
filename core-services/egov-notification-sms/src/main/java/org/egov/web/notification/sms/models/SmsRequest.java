package org.egov.web.notification.sms.models;

import org.egov.common.contract.request.RequestInfo;

public class SmsRequest {

    private RequestInfo requestInfo;
    private Sms sms;

    public RequestInfo getRequestInfo() {
        return requestInfo;
    }

    public void setRequestInfo(RequestInfo requestInfo) {
        this.requestInfo = requestInfo;
    }

    public Sms getSms() {
        return sms;
    }

    public void setSms(Sms sms) {
        this.sms = sms;
    }
}
