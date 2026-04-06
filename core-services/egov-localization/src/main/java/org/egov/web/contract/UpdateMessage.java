package org.egov.web.contract;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotEmpty;
import org.egov.domain.model.SanitizeHtml;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateMessage {
	@NotEmpty
    @SanitizeHtml
	private String code;
	@NotEmpty
    @SanitizeHtml
	private String message;
}
