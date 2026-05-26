package org.egov.rl.services.models.workflow;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import org.egov.rl.services.models.AuditDetails;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * A Object holds the basic data for a Trade License
 */
@Schema(description = "A Object holds the basic data for a Trade License")
@Validated
@jakarta.annotation.Generated(value = "org.egov.codegen.SpringBootCodegen", date = "2018-12-04T11:26:25.532+05:30")

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(of = {"tenantId","currentState","action"})
public class Action   {

        @Size(max=256)
        @Pattern(regexp = "^[^<>]*$")
        @JsonProperty("uuid")
        private String uuid;

        @Size(max=256)
        @Pattern(regexp = "^[^<>]*$")
        @JsonProperty("tenantId")
        private String tenantId;

        @Size(max=256)
        @Pattern(regexp = "^[^<>]*$")
        @JsonProperty("currentState")
        private String currentState;

        @Size(max=256)
        @Pattern(regexp = "^[^<>]*$")
        @JsonProperty("action")
        private String action;

        @Size(max=256)
        @Pattern(regexp = "^[^<>]*$")
        @JsonProperty("nextState")
        private String nextState;

        @Size(max=1024)
        @JsonProperty("roles")
        @Valid
        private List<String> roles;

        private AuditDetails auditDetails;


        public Action addRolesItem(String rolesItem) {
            if (this.roles == null) {
            this.roles = new ArrayList<>();
            }
        this.roles.add(rolesItem);
        return this;
        }

}

