
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
  let checkCondtions = action?.action === "FORWARD_FOR_TECH_REVIEW"

  return {
  label: {
      heading: action?.action === "APPROVE" ? `WF_EMPLOYEE_APPROVE_APPLICATION` : `WF_EMPLOYEE_FORWARD_APPLICATION`,
      submit: t(`WF_EMPLOYEE_LAYOUT_${businessService}`.toUpperCase() + `_${action?.action?.toUpperCase()}`) ,
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
          // action?.action === "APPROVE"
          //   ? {
          //       label: t("WF_CONDITIONAL_COMMENTS_LABEL"),
          //       type: "textarea",
          //       populators: {
          //         name: "conditionalComments",
          //       },
          //       validation: {
          //         required: false, // not mandatory
          //         title: t("WF_COMMON_COMMENTS_ERROR"),
          //       },
          //     }
          //   : null,
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
        ]?.filter((obj) => obj != null),
      },
    ],
  }
}
