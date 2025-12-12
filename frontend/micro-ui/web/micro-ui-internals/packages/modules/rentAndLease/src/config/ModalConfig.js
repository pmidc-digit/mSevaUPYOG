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
    action?.action == "SENDBACKTOVERIFIER" ||
    action?.action == "VERIFY" ||
    action?.action == "FORWARD" ||
    action?.action === "FORWARDFORFIELDINSPECTION" ||
    action?.action === "FORWARDFORAPPROVAL";
  if (action?.isTerminateState) checkAssigneeMandatory = false;

  if (action.isTerminateState) {
    checkAssigneeVisible = false;
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
            label: `${t("CS_COMMON_COMMENTS")} *`,
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
                message={uploadedFile ? `1 ${t(`ES_PT_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
              />
            ),
          },
        ],
      },
    ],
  };
};
