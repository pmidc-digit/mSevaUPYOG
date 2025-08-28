package org.egov.wf.web.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(of = {"id"})	
@ToString
public class FileEmployees {

private String name;
private String id;
private String fileDate;
private String clearenceDate;
private String isCurrent;
}
