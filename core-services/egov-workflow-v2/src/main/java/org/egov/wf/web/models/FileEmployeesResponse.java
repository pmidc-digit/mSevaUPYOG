package org.egov.wf.web.models;

import java.util.ArrayList;
import java.util.List;

import org.egov.common.contract.response.ResponseInfo;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder	
public class FileEmployeesResponse {
	  @JsonProperty("ResponseInfo")
private ResponseInfo responseInfo = null;
	List<FileEmployees> employee;
	

	  public FileEmployeesResponse addProceInstanceItem(FileEmployees employee) {
          if (this.employee == null) {
          this.employee = new ArrayList<>();
          }
      this.employee.add(employee);
      return this;
      }
}	
