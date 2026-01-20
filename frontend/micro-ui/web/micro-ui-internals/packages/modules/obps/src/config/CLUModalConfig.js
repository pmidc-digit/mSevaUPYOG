import { Dropdown, UploadFile } from "@mseva/digit-ui-react-components";
import React from "react";

export const CLUModalConfig = ({
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
  applicationData
}) => {
  let checkCondtions = true;
  if (action?.action == "SENDBACKTOCITIZEN" || action?.action == "APPROVE" || action?.action == "REJECT" || action?.action == "SENDBACK" ||  action?.action == "SENDBACKTOPROFESSIONAL")
    checkCondtions = false;
  if (action.isTerminateState) checkCondtions = false;

  return {
    label: {
      heading: action?.action === "APPROVE" ? `WF_EMPLOYEE_APPROVE_APPLICATION` : `WF_EMPLOYEE_FORWARD_APPLICATION`,
      submit: `WF_EMPLOYEE_BPA_${action?.action}`,
      cancel: "WF_EMPLOYEE_BPA_CANCEL",
    },
    form: [
      {
        body: [
          {
            label: !checkCondtions ? null : `${t("WF_ASSIGNEE_NAME_LABEL")}*`,
            placeholder: !checkCondtions ? null : t("WF_ASSIGNEE_NAME_PLACEHOLDER"),
            type: "dropdown",
            populators: !checkCondtions ? null : (
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
            label: `${t("WF_COMMON_COMMENTS_LABEL")}*`,
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
