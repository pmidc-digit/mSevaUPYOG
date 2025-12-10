
import React from "react";
import { Dropdown, UploadFile } from "@mseva/digit-ui-react-components"

export const LayoutModalConfig = ({
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
  let checkCondtions = true
  if (
    action?.action == "SENDBACKTOCITIZEN" ||
    action?.action == "APPROVE" ||
    action?.action == "REJECT" ||
    action?.action == "SENDBACK" || action?.action == "SENDBACKTOPROFESSIONAL"
  )
    checkCondtions = false
  if (action.isTerminateState) checkCondtions = false

  return {
    label: {
      heading: `WF_EMPLOYEE_LAYOUT_${action?.action}`,
      submit: `WF_EMPLOYEE_LAYOUT_${action?.action}`,
      cancel: "WF_EMPLOYEE_LAYOUT_CANCEL",
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
                 t={t}
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
                onUpload={selectFile}
                onDelete={() => {
                  setUploadedFile(null)
                }}
                message={uploadedFile ? `1 ${t(`ES_PT_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
              />
            ),
          },
        ],
      },
    ],
  }
}
