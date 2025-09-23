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
  let checkAssigneeVisible = action?.action === "VERIFY" || action?.action === "FORWARD" || action?.action === "SENDBACKTOVERIFIER";
  let checkCommentsMandatory =
    action?.action === "APPROVE" ||
    action?.action === "VERIFY" ||
    action?.action === "REJECT" ||
    action?.action === "SENDBACKTOCITIZEN" ||
    action?.action === "FORWARD" ||
    action?.action === "SENDBACKTOVERIFIER";
  if (action.isTerminateState) {
    checkAssigneeVisible = false;
    checkCommentsMandatory = true;
  }
  return {
    label: {
      heading: t(`WF_${action?.action}_APPLICATION`),
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
            label: t("WF_COMMON_COMMENTS"),
            type: "textarea",
            isMandatory:
              action?.action === "REJECT" ||
              action?.action === "APPROVE" ||
              action?.action === "VERIFY" ||
              action?.action === "SENDBACKTOCITIZEN" ||
              action?.action === "FORWARD",
            validation:
              action?.action === "REJECT" ||
              action?.action === "APPROVE" ||
              action?.action === "VERIFY" ||
              action?.action === "SENDBACKTOCITIZEN" ||
              action?.action === "FORWARD"
                ? { required: true, message: t("CORE_COMMON_REQUIRED_ERRMSG") }
                : {},
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
