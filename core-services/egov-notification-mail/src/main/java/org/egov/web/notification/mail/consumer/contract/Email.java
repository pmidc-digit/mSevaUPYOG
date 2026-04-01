package org.egov.web.notification.mail.consumer.contract;

import java.util.Set;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Email {

	private Set<String> emailTo;
	private String subject;
	private String body;
	@JsonProperty("isHTML")
	private boolean isHTML;
	
	private Map<String, String> inlineResources; // Key: "evidence1", Value: "https://..."
	@JsonProperty("attachments")
    private List<String> attachments;

}
