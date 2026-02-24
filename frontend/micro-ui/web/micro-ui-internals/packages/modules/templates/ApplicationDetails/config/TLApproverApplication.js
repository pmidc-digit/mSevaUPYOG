import { Dropdown, UploadFile } from "@mseva/digit-ui-react-components";
import React from "react";

export const configTLApproverApplication = ({
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
  if (action?.action == "SENDBACKTOCITIZEN" || action?.action == "APPROVE") checkCondtions = false;
  if (action.isTerminateState) checkCondtions = false;

  const isCancelAction = action?.action === "CANCEL";

  return {
    label: {
      heading: `WF_${action?.action}_APPLICATION`,
      submit: isCancelAction ? "WF_CANCEL_LICENSE" : `WF_${businessService?.toUpperCase()}_${action?.action}`,
      cancel: "WF_EMPLOYEE_NEWTL_CANCEL",
    },
    form: [
      {
        body: [
          {
            label: !checkCondtions ? null : t("WF_ASSIGNEE_NAME_LABEL"),
            placeholder: !checkCondtions ? null : t("WF_ASSIGNEE_NAME_PLACEHOLDER"),
            // isMandatory: false,
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
            label: t("WF_COMMON_COMMENTS"),
            type: "textarea",
            populators: {
              name: "comments",
            },
          },
          ...(checkCondtions ? [{
            label: t("TL_FORWARD_NAME_LABEL"),
            type: "text",
            populators: {
              name: "name",
              placeholder: t("TL_FORWARD_NAME_PLACEHOLDER"),
            },
          },
          {
            label: t("TL_FORWARD_DATE_LABEL"),
            type: "date",
            populators: {
              name: "date",
            },
          }] : []),
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
            )
          },
          //   {
          //     label: action.docUploadRequired ? t("ES_PT_UPLOAD_FILE") : null,
          //     populators: action.docUploadRequired ? (
          //       <UploadFile
          //         // accept=".jpg"
          //         onUpload={selectFile}
          //         onDelete={() => {
          //           setUploadedFile(null);
          //         }}
          //         message={uploadedFile ? `1 ${t(`ES_PT_ACTION_FILEUPLOADED`)}` : t(`ES_PT_ACTION_NO_FILEUPLOADED`)}
          //       />
          //     ) : null,
          //   },
        ],
      },
    ],
  };
};
