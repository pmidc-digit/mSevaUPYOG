import { Dropdown, UploadFile } from "@mseva/digit-ui-react-components";
import React from "react";

export const ModalConfig = ({
  t,
  action,
  approvers,
  selectedApprover,
  setSelectedApprover,
  selectFile,
  uploadedFile,
  setUploadedFile,
  assigneeLabel,
  businessService,
}) => {
  let checkAssigneeVisible =
    // action?.action === "SENDBACKTOOVERIFIER" ||
    // action?.action === "VERIFY" ||
    // action?.action === "FORWARD" ||
    // action?.action === "FORWARDFORFIELDINSPECTION" ||
    // action?.action === "FORWARDFORAPPROVAL" ||
    action?.action === "PENDING_FOR_FIELDINSPECTION" ||
    action?.action === "FORWARD_FOR_APPROVAL" ||
    action?.action === "PENDING_FOR_DOCUMENT_VERIFY" ||
    action?.action === "REQUEST_FOR_DISCONNECTION" ||
    action?.action === "DISCONNECTION_FIELD_INSPECTION" ||
    action?.action === "FORWARD_FOR_FIELDINSPECTION" ||
    action?.action === "FORWARD_FOT_SETLEMENT" ||
    action?.action === "FORWARD_FOR_DESCONNECTION_FIELD_INSPECTION";
  if (action?.isTerminateState) checkAssigneeMandatory = false;

  if (action.isTerminateState) {
    checkAssigneeVisible = false;
  }
  if (action?.action === "RENEWAL" || action?.action === "RAL_RENEWAL") {
    return {
      label: {
        // heading: t("RAL_RENEWAL_MODAL_HEADING"),
        submit: t("RAL_RENEWAL_SUBMIT"),
        cancel: t("WF_EMPLOYEE_NEWTL_CANCEL"),
      },
      form: [
        {
          body: [
            {
              label: t("RAL_TRADE_LICENSE_NUMBER"),
              isMandatory: true,
              type: "text",
              validation: {
                // required: true,
                message: t("CORE_COMMON_REQUIRED_ERRMSG"),
                pattern: {
                  value: /^[A-Z0-9\/-]{6,20}$/,
                  message: t("RAL_INVALID_TRADE_LICENSE_NUMBER"),
                },
              },
              populators: {
                name: "tradeLicenseNumber",
              },
            },
          ],
        },
      ],
    };
  }

  return {
    label: {
      // heading: t(`WF_${action?.action}_APPLICATION`),
      heading: "",
      submit: t(`${action?.action}`),
      cancel: t("WF_EMPLOYEE_NEWTL_CANCEL"),
    },
    form: [
      {
        body: [
          {
            label: !checkAssigneeVisible ? null : t("WF_ASSIGNEE_NAME_LABEL"),
            placeholder: !checkAssigneeVisible ? null : t("WF_ASSIGNEE_NAME_PLACEHOLDER"),
            type: "dropdown",
            isMandatory: checkAssigneeVisible,
            validation: checkAssigneeVisible ? { required: true, message: t("CORE_COMMON_REQUIRED_ERRMSG") } : {},
            populators: !checkAssigneeVisible ? null : (
              <Dropdown
                option={approvers}
                autoComplete="off"
                optionKey="name"
                id="fieldInspector"
                select={setSelectedApprover}
                selected={selectedApprover}
              />
            ),
          },
          {
            label: t("CS_COMMON_COMMENTS"),
            isMandatory: true,
            type: "textarea",
            populators: {
              name: "comments",
            },
          },
          {
            label: t("TL_APPROVAL_CHECKLIST_BUTTON_UP_FILE"),
            populators: (
              <UploadFile
                id={"workflow-doc"}
                // accept=".jpg"
                onUpload={selectFile}
                onDelete={() => {
                  setUploadedFile(null);
                }}
                message={uploadedFile ? `1 ${t("ES_PT_ACTION_FILEUPLOADED")}` : t("CS_ACTION_NO_FILEUPLOADED")}
              />
            ),
          },
          ...(action?.action === "FORWARD_FOT_SETLEMENT"
            ? [
                {
                  label: `${t("RAL_PROPERTY_DAMAGE_PENALTY")}`,
                  type: "number",
                  populators: {
                    name: "amountToBeDeducted",
                  },
                },
              ]
            : []),
        ],
      },
    ],
  };
};
