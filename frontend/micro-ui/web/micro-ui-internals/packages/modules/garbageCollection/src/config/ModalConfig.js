import { Dropdown, UploadFile } from "@mseva/digit-ui-react-components";
import React from "react";

export const ModalConfig = ({
  t,
  action,
  setAmount,
  approvers,
  selectedApprover,
  setSelectedApprover,
  selectFile,
  uploadedFile,
  setUploadedFile,
  assigneeLabel,
  businessService,
}) => {
  console.log("action=====", action);
  console.log("uploadedFile=====", uploadedFile);
  let checkCondtions = true;
  if (
    action?.action == "SEND_BACK_TO_CITIZEN" ||
    action?.action == "ACTIVATE_CONNECTION" ||
    action?.action == "REJECT" ||
    action?.action == "SENDBACK" ||
    action?.action == "VERIFIED" ||
    action?.action == "SEND_BACK_FOR_DOCUMENT_VERIFICATION" ||
    action?.action == "APPROVE"
  )
    checkCondtions = false;
  if (action.isTerminateState) checkCondtions = false;

  console.log("action=====", action.action);

  return {
    label: {
      heading: ``,
      submit: `${action?.action}`,
      cancel: "WF_EMPLOYEE_NEWTL_CANCEL",
    },
    form: [
      {
        body: [
          {
            label: !checkCondtions ? null : `${t("WF_ASSIGNEE_NAME_LABEL")} *`,
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
