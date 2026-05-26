package org.egov.rl.calculator.web.models.workflow;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.egov.rl.calculator.web.models.property.AuditDetails;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

/**
 * A Object holds the basic data for a Trade License
 */
@Validated
@jakarta.annotation.Generated(value = "org.egov.codegen.SpringBootCodegen", date = "2018-12-04T11:26:25.532+05:30")

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(of = {"tenantId","businessServiceId","state"})
public class State   {

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
        @JsonProperty("businessServiceId")
        private String businessServiceId;

        @JsonProperty("sla")
        private Long sla;

        @Size(max=256)
        @Pattern(regexp = "^[^<>]*$")
        @JsonProperty("state")
        private String state;

        @Size(max=256)
        @Pattern(regexp = "^[^<>]*$")
        @JsonProperty("applicationStatus")
        private String applicationStatus;

        @JsonProperty("docUploadRequired")
        private Boolean docUploadRequired;

        @JsonProperty("isStartState")
        private Boolean isStartState;

        @JsonProperty("isTerminateState")
        private Boolean isTerminateState;

        @JsonProperty("isStateUpdatable")
        private Boolean isStateUpdatable;

        @JsonProperty("actions")
        @Valid
        private List<Action> actions;

        private AuditDetails auditDetails;


        public State addActionsItem(Action actionsItem) {
                if (this.actions == null) {
                        this.actions = new ArrayList<>();
                }
                this.actions.add(actionsItem);
                return this;
        }

}

