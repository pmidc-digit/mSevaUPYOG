import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormComposer, Modal, Toast, Loader } from "@mseva/digit-ui-react-components";
import { REASON_CONSTRAINTS } from "../constants";
import { resolveTenantDetails } from "../utils/jurisdictionUtils";

const Heading = (props) => {
  return <h1 className={`heading-m ${props.className || ""}`}>{props.label}</h1>;
};

const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className={`icon-bg-secondary ${props.className || ""}`} onClick={props.onClick}>
      <Close />
    </div>
  );
};

const getI18n = (t, key, fallback) => {
  if (!t || !key) return fallback || "";
  const val = t(key);
  return !val || val === key ? fallback || key : val;
};

/**
 * Remove Confirmation Modal
 * Styled identically to Rent & Lease Add Rebate and Penalty modal (RALModal.js)
 * Using standard DIGIT Modal and FormComposer components.
 */
const RemoveConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  employee,
  targetUlb,
  targetUlbName,
  batchDetails = null,
  allTenants = [],
  isSubmitting = false,
  workflowPendingCount = 0,
}) => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);

  const removalsList = useMemo(() => {
    return batchDetails?.removals || (targetUlb ? [targetUlb] : []);
  }, [batchDetails, targetUlb]);

  // Compute detailed info for each removed jurisdiction
  const detailedRemovals = useMemo(() => {
    if (!employee || removalsList.length === 0) return [];

    return removalsList.map((removalKey) => {
      const foundJurisdiction = (employee.jurisdictions || []).find(
        (j) =>
          (j.id && j.id === removalKey) ||
          j.boundary === removalKey ||
          j.tenantId === removalKey
      );

      const boundaryCode =
        foundJurisdiction?.boundary ||
        foundJurisdiction?.tenantId ||
        (String(removalKey).startsWith("pb") ? removalKey : "");

      const tenantInfo = resolveTenantDetails(boundaryCode, allTenants);

      const rolesUnderBoundary = (employee.user?.roles || []).filter(
        (r) => r.tenantId?.toLowerCase() === boundaryCode?.toLowerCase()
      );

      // Resolve clean human-readable ULB name - NEVER display UUID or database ID
      let cleanUlbName = "";
      if (boundaryCode) {
        const matched = (allTenants || []).find((u) => u?.code?.toLowerCase() === boundaryCode.toLowerCase());
        cleanUlbName = matched?.name || tenantInfo.ulbName;
      }
      if (!cleanUlbName || cleanUlbName.includes("-") || cleanUlbName === removalKey) {
        cleanUlbName = targetUlbName && !targetUlbName.includes("-")
          ? targetUlbName
          : boundaryCode
          ? boundaryCode.replace(/^pb\./i, "").toUpperCase()
          : "ULB";
      }

      return {
        key: removalKey,
        boundary: boundaryCode,
        ulbName: cleanUlbName,
        districtName: tenantInfo.districtName,
        hierarchy: foundJurisdiction?.hierarchy || "REVENUE",
        boundaryType: foundJurisdiction?.boundaryType || "City",
        roles: rolesUnderBoundary,
      };
    });
  }, [employee, removalsList, allTenants, targetUlbName]);

  const headingText = useMemo(() => {
    return removalsList.length > 1
      ? getI18n(t, "JUR_CONFIRM_BATCH_SAVE_TITLE", "Confirm Jurisdiction Removal")
      : getI18n(t, "JUR_CONFIRM_REMOVE_TITLE", "Confirm Jurisdiction Removal");
  }, [t, removalsList]);

  const submitText = useMemo(() => {
    return isSubmitting
      ? getI18n(t, "ES_SUBMITTING", "Saving...")
      : getI18n(t, "HR_REMOVE", "Confirm Removal");
  }, [t, isSubmitting]);

  const cancelText = useMemo(() => {
    return getI18n(t, "CS_COMMON_CANCEL", "Cancel");
  }, [t]);

  const formConfig = useMemo(() => {
    return [
      {
        body: [
          {
            label: getI18n(t, "JUR_REMOVAL_SUMMARY", "Jurisdiction Details"),
            type: "custom",
            populators: {
              name: "summarySection",
              component: () => (
                <div style={{ marginBottom: "16px" }}>
                  {/* Employee Name & Code */}
                  <div style={{ marginBottom: "12px", fontSize: "14px", color: "#0b0c0c" }}>
                    <span style={{ color: "#505a5f" }}>{getI18n(t, "HR_EMPLOYEE_NAME_LABEL", "Employee")}: </span>
                    <strong style={{ fontWeight: 600 }}>{employee?.user?.name || "N/A"}</strong>{" "}
                    <span style={{ color: "#505a5f" }}>({employee?.code})</span>
                  </div>

                  {/* List of Jurisdictions & Roles being removed */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {detailedRemovals.map((item, idx) => (
                      <div
                        key={item.key || idx}
                        style={{
                          backgroundColor: "#f9f9f9",
                          border: "1px solid #d6d5d4",
                          borderLeft: "4px solid #d4351c",
                          borderRadius: "4px",
                          padding: "10px 14px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                          <div>
                            <span style={{ color: "#505a5f", fontSize: "13px" }}>{getI18n(t, "HR_ULB_LABEL", "ULB")}: </span>
                            <strong style={{ fontSize: "14px", color: "#0b0c0c" }}>{item.ulbName}</strong>
                          </div>
                          {item.districtName && (
                            <div style={{ fontSize: "13px", color: "#505a5f" }}>
                              <span>{getI18n(t, "HR_DISTRICT_LABEL", "District")}: </span>
                              <strong style={{ color: "#0b0c0c" }}>{item.districtName}</strong>
                            </div>
                          )}
                        </div>

                        {/* Roles that will be revoked */}
                        <div style={{ marginTop: "6px", fontSize: "13px" }}>
                          <span style={{ color: "#d4351c", fontWeight: 600 }}>
                            {getI18n(t, "JUR_ROLES_REVOKED", "Roles Revoked")}:{" "}
                          </span>
                          {item.roles.length > 0 ? (
                            <span style={{ color: "#0b0c0c" }}>
                              {item.roles.map((r) => r.name || r.code).join(", ")}
                            </span>
                          ) : (
                            <span style={{ color: "#505a5f", fontStyle: "italic" }}>
                              {getI18n(t, "HR_NO_ROLES_ASSIGNED", "None assigned")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Workflow task blocker notice if pending items exist */}
                  {workflowPendingCount > 0 && (
                    <div
                      style={{
                        backgroundColor: "#fef7f7",
                        borderLeft: "4px solid #d4351c",
                        padding: "8px 12px",
                        marginTop: "10px",
                        color: "#d4351c",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      ⚠️ {getI18n(t, "ERR_REASSIGN_PENDING_ITEMS", `Reassign ${workflowPendingCount} pending items before removing this jurisdiction.`)}
                    </div>
                  )}

                  {/* Batch additions notice */}
                  {batchDetails?.additions?.length > 0 && (
                    <div style={{ marginTop: "8px", fontSize: "13px", color: "#00703c" }}>
                      <strong>+{batchDetails.additions.length}</strong> {getI18n(t, "JUR_NEW_ADDITIONS_IN_BATCH", "new jurisdiction(s) will also be added in this save.")}
                    </div>
                  )}
                </div>
              ),
            },
          },
          {
            label: getI18n(t, "JUR_REASON_FOR_MODIFICATION", "Reason for Removal"),
            type: "textarea",
            isMandatory: true,
            validation: {
              required: true,
              validate: (val) => {
                const trimmed = (val || "").trim();
                if (!trimmed || trimmed.length < REASON_CONSTRAINTS.MIN_LENGTH) {
                  return getI18n(
                    t,
                    "ERR_REASON_MANDATORY",
                    `A reason for removal is mandatory (minimum ${REASON_CONSTRAINTS.MIN_LENGTH} characters).`
                  );
                }
                if (trimmed.length > REASON_CONSTRAINTS.MAX_LENGTH) {
                  return getI18n(
                    t,
                    "ERR_REASON_TOO_LONG",
                    `Reason cannot exceed ${REASON_CONSTRAINTS.MAX_LENGTH} characters.`
                  );
                }
                return true;
              },
            },
            populators: {
              name: "reason",
              placeholder: getI18n(t, "JUR_ENTER_REASON_PLACEHOLDER", "Enter detailed reason for removing this jurisdiction..."),
              error: getI18n(t, "ERR_REASON_MANDATORY", "A reason for removal is mandatory (minimum 3 characters)."),
              validation: {
                required: true,
                validate: (val) => {
                  const trimmed = (val || "").trim();
                  if (!trimmed || trimmed.length < REASON_CONSTRAINTS.MIN_LENGTH) {
                    return getI18n(
                      t,
                      "ERR_REASON_MANDATORY",
                      `A reason for removal is mandatory (minimum ${REASON_CONSTRAINTS.MIN_LENGTH} characters).`
                    );
                  }
                  if (trimmed.length > REASON_CONSTRAINTS.MAX_LENGTH) {
                    return getI18n(
                      t,
                      "ERR_REASON_TOO_LONG",
                      `Reason cannot exceed ${REASON_CONSTRAINTS.MAX_LENGTH} characters.`
                    );
                  }
                  return true;
                },
              },
            },
          },
        ],
      },
    ];
  }, [t, employee, detailedRemovals, workflowPendingCount, batchDetails]);

  if (!isOpen) return null;

  const handleSubmit = (data) => {
    if (workflowPendingCount > 0) {
      setShowToast({
        key: true,
        label: getI18n(
          t,
          "ERR_REASSIGN_PENDING_ITEMS",
          `Reassign ${workflowPendingCount} pending items before removing this jurisdiction.`
        ),
      });
      return;
    }

    const reason = (data?.reason || "").trim();
    if (!reason || reason.length < REASON_CONSTRAINTS.MIN_LENGTH) {
      setShowToast({
        key: true,
        label: getI18n(
          t,
          "ERR_REASON_MANDATORY",
          `A reason for removal is mandatory (minimum ${REASON_CONSTRAINTS.MIN_LENGTH} characters).`
        ),
      });
      return;
    }

    if (reason.length > REASON_CONSTRAINTS.MAX_LENGTH) {
      setShowToast({
        key: true,
        label: getI18n(
          t,
          "ERR_REASON_TOO_LONG",
          `Reason cannot exceed ${REASON_CONSTRAINTS.MAX_LENGTH} characters.`
        ),
      });
      return;
    }

    onConfirm(reason);
  };

  return (
    <Modal
      headerBarMain={<Heading label={headingText} className="ral-modal-header" />}
      headerBarEnd={<CloseBtn onClick={onClose} className="ral-modal-close" />}
      actionCancelLabel={cancelText}
      actionCancelOnSubmit={onClose}
      actionSaveLabel={submitText}
      actionSaveOnSubmit={() => {}}
      formId="modal-action"
      isDisabled={isSubmitting || workflowPendingCount > 0}
    >
      <FormComposer
        config={formConfig}
        className="BPAemployeeCard bpa-workflow-modal-form"
        noBoxShadow
        inline
        childrenAtTheBottom
        onSubmit={handleSubmit}
        defaultValues={{ reason: "" }}
        formId="modal-action"
      />
      {showToast && (
        <Toast
          error={showToast.key}
          label={showToast.label}
          isDleteBtn={true}
          onClose={() => setShowToast(null)}
        />
      )}
      {isSubmitting && <Loader page={true} />}
    </Modal>
  );
};

export default RemoveConfirmationModal;
