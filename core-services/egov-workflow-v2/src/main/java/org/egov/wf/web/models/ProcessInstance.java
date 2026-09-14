package org.egov.wf.web.models;

import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import org.egov.common.contract.request.User;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.annotations.ApiModel;
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
@ApiModel(description = "A Object holds the basic data for a Trade License")
@Validated
@javax.annotation.Generated(value = "org.egov.codegen.SpringBootCodegen", date = "2018-12-04T11:26:25.532+05:30")

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(of = {"id"})
@ToString
public class ProcessInstance   {

        @Size(max=64)
        @JsonProperty("id")
        private String id = null;

        @NotNull
        @Size(max=128)
        @JsonProperty("tenantId")
        private String tenantId = null;

        @NotNull
        @Size(max=128)
        @JsonProperty("businessService")
        private String businessService = null;

        @NotNull
        @Size(max=128)
        @JsonProperty("businessId")
        private String businessId = null;

        @NotNull
        @Size(max=128)
        @JsonProperty("action")
        private String action = null;

        @NotNull
        @Size(max=64)
        @JsonProperty("moduleName")
        private String moduleName = null;

        @JsonProperty("state")
        private State state = null;

        @Size(max=5120)
        @JsonProperty("comment")
        private String comment = null;

        @JsonProperty("documents")
        @Valid
        private List<Document> documents = null;

        @JsonProperty("assigner")
        private User assigner = null;

        @JsonProperty("assignes")
        private List<User> assignes = null;

        @JsonProperty("nextActions")
        @Valid
        private List<Action> nextActions = null;

        @JsonProperty("stateSla")
        private Long stateSla = null;

        @JsonProperty("businesssServiceSla")
        private Long businesssServiceSla = null;

        @JsonProperty("previousStatus")
        @Size(max=128)
        private String previousStatus = null;

        @JsonProperty("entity")
        private Object entity = null;

        @JsonProperty("auditDetails")
        private AuditDetails auditDetails = null;

        @JsonProperty("rating")
        private Integer rating = null;

        @JsonProperty("escalated")
        private Boolean escalated = false;

        /**
         * True when this row is the current/latest transition for its businessId.
         * Backed by the eg_wf_processinstance_v2.latest column and populated by the
         * search row mapper. Required by the workflow legacy-index backfill so that
         * consumers can tell the current state apart from historical transitions.
         */
        @JsonProperty("latest")
        private Boolean latest = null;


        /**
         * Backwards-compatible copy of the constructor Lombok used to generate
         * before {@code latest} was added to the model, so existing callers keep
         * compiling unchanged. {@code latest} is deliberately left null here; set
         * it through the builder or {@code setLatest(...)}. New code should prefer
         * the builder or the generated all-args constructor.
         */
        public ProcessInstance(String id, String tenantId, String businessService, String businessId, String action,
                               String moduleName, State state, String comment, List<Document> documents,
                               User assigner, List<User> assignes, List<Action> nextActions, Long stateSla,
                               Long businesssServiceSla, String previousStatus, Object entity,
                               AuditDetails auditDetails, Integer rating, Boolean escalated) {
            this.id = id;
            this.tenantId = tenantId;
            this.businessService = businessService;
            this.businessId = businessId;
            this.action = action;
            this.moduleName = moduleName;
            this.state = state;
            this.comment = comment;
            this.documents = documents;
            this.assigner = assigner;
            this.assignes = assignes;
            this.nextActions = nextActions;
            this.stateSla = stateSla;
            this.businesssServiceSla = businesssServiceSla;
            this.previousStatus = previousStatus;
            this.entity = entity;
            this.auditDetails = auditDetails;
            this.rating = rating;
            this.escalated = escalated;
        }


        public ProcessInstance addDocumentsItem(Document documentsItem) {
            if (this.documents == null) {
            this.documents = new ArrayList<>();
            }
            if(!this.documents.contains(documentsItem))
                this.documents.add(documentsItem);

        return this;
        }

        public ProcessInstance addNextActionsItem(Action nextActionsItem) {
            if (this.nextActions == null) {
            this.nextActions = new ArrayList<>();
            }
            this.nextActions.add(nextActionsItem);
            return this;
        }

        public ProcessInstance addUsersItem(User usersItem) {
                if (this.assignes == null) {
                        this.assignes = new ArrayList<>();
                }
                if(!this.assignes.contains(usersItem))
                        this.assignes.add(usersItem);

                return this;
        }

}

