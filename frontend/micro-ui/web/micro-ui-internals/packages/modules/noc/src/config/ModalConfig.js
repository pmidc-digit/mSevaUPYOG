import { Dropdown, UploadFile } from "@mseva/digit-ui-react-components";
import React from "react";
import { getPattern } from "../utils";
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
  let checkCondtions = true;
  if (action?.action == "SENDBACKTOCITIZEN" || action?.action == "APPROVE" || action?.action == "REJECT" || action?.action == "SENDBACK")
    checkCondtions = false;
  if (action.isTerminateState) checkCondtions = false;

  return {
    label: {
      heading: `WF_${action?.action}_APPLICATION`,
      submit: `WF_EMPLOYEE_NOC_${action?.action}`,
      cancel: "WF_EMPLOYEE_NOC_CANCEL",
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
            validation: { 
              pattern: getPattern("Comments"), 
              required: true, 
              title: t("WF_COMMON_COMMENTS_ERROR") 
            },
          },

          action?.action === "APPROVE"
            ? {
                label: t("WF_CONDITIONAL_COMMENTS_LABEL"),
                type: "textarea",
                populators: {
                  name: "conditionalComments",
                },
                validation: {
                  pattern: getPattern("Comments"),
                  required: false, // not mandatory
                  title: t("WF_COMMON_COMMENTS_ERROR"),
                },
              }
            : null,
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
        ].filter(Boolean),
      },
    ],
  };
};
