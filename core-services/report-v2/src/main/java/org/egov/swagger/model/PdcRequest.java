package org.egov.swagger.model;

import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.egov.common.contract.request.RequestInfo;
import org.egov.domain.model.MetaDataRequest;

public class PdcRequest extends MetaDataRequest {

    @JsonProperty("searchParams")
    private List<SearchParam> searchParams;

    @JsonProperty("departmentId")
    private String departmentId;

    @JsonProperty("serviceId") 
    private String serviceId;

    public List<SearchParam> getSearchParams() {
        return searchParams;
    }

    public void setSearchParams(List<SearchParam> searchParams) {
        this.searchParams = searchParams;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getServiceId() { 
        return serviceId;
    }

    public void setServiceId(String serviceId) {  
        this.serviceId = serviceId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PdcRequest that = (PdcRequest) o;
        return Objects.equals(searchParams, that.searchParams) &&
               Objects.equals(departmentId, that.departmentId) &&
               Objects.equals(serviceId, that.serviceId) &&  // ✅ Include serviceId in equals check
               super.equals(o);
    }

    @Override
    public int hashCode() {
        return Objects.hash(searchParams, departmentId, serviceId, super.hashCode());  // ✅ Include serviceId in hashCode
    }

    @Override
    public String toString() {
        return "PdcRequest{" +
                "departmentId='" + departmentId + '\'' +
                ", serviceId='" + serviceId + '\'' +  // ✅ Include serviceId in toString
                ", searchParams=" + searchParams +
                "} " + super.toString();
    }
}
