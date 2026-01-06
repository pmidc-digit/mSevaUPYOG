import { Dropdown, UploadFile } from "@mseva/digit-ui-react-components";
import React from "react";
import DropdownWithDesignation from "../components/DropDownWithDesignation";

export const configBPAApproverApplication = ({
  t,
  action,
  approvers,
  selectedApprover,
  setSelectedApprover,
  selectedBlockReason,
  setBlockReason,
  selectFile,
  uploadedFile,
  setUploadedFile,
  assigneeLabel,
  businessService,
  error,
  blockReasonFiltered
}) => {
  let isRejectOrRevocate = false;
  if(action?.action == "REVOCATE" || action?.action == "REJECT" || action.action == "SKIP_PAYMENT" || action?.action == "SEND_BACK_TO_CITIZEN" || action?.action == "APPROVE") {
    isRejectOrRevocate = true;
  }

  let isCommentRequired = false;
  if(action?.action == "REVOCATE" || action?.action == "REJECT") {
    isCommentRequired = true;
  }
  console.log("actionInModal", action);
  
  return {
    label: {
      heading: `WF_${action?.action}_APPLICATION`,
      submit: `WF_${businessService}_${action?.action}`,
      cancel: "BPA_CITIZEN_CANCEL_BUTTON",
    },
    form: [
      {
        body: [
          {
            label: action.isTerminateState || isRejectOrRevocate || (action?.action=="BLOCK") || (action?.action=="VERIFY")|| (action?.action=="SEND_FOR_INSPECTION_REPORT") || (action?.action=="ESIGN") ? null : t(assigneeLabel || `WF_ROLE_${action.assigneeRoles?.[0]}`),
            type: "dropdown",
            populators: (action.isTerminateState || isRejectOrRevocate || (action?.action=="BLOCK") || (action?.action=="VERIFY")|| (action?.action=="SEND_FOR_INSPECTION_REPORT")) || (action?.action=="ESIGN") ? null : (
              <DropdownWithDesignation
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
            label: (action?.action=="BLOCK") ? t(`BLOCK_REASON`):null  ,
            type: "dropdown",
            populators: (action?.action=="BLOCK") ?  (
              <Dropdown
                option={blockReasonFiltered}
                autoComplete="off"
                optionKey="name"
                id="fieldInspector"
                select={setBlockReason}
                selected={selectedBlockReason}
                isMandatory={true}
              />
            ):null ,
          },
          {
            label: t("WF_COMMON_COMMENTS"),
            type: "textarea",
            isMandatory: true,
            populators: {
              name: "comments",
            },
          },
          {
            label: `${t("WF_APPROVAL_UPLOAD_HEAD")}`,
            populators: (
              <UploadFile
                id={"workflow-doc"}
                onUpload={selectFile}
                onDelete={() => {
                  setUploadedFile(null);
                }}
                message={uploadedFile ? `1 ${t(`ES_PT_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
                accept= "image/*, .pdf, .png, .jpeg, .jpg"
                iserror={error}
              />
            ),
          },
        ],
      },
    ],
  };
};
