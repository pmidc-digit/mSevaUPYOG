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
  let checkCondtions = true;
  if (
    action?.action == "SENDBACKTOCITIZEN" ||
    action?.action == "APPROVE" ||
    action?.action == "NOT_VERIFIED" ||
    action?.action == "SENDBACK" ||
    action?.action == "VERIFIED"
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
          // {
          //   label: !checkCondtions ? null : `${t("WF_ASSIGNEE_NAME_LABEL")} *`,
          //   placeholder: !checkCondtions ? null : t("WF_ASSIGNEE_NAME_PLACEHOLDER"),
          //   type: "dropdown",
          //   populators: !checkCondtions ? null : (
          //     <Dropdown
          //       option={approvers}
          //       autoComplete="off"
          //       optionKey="name"
          //       id="fieldInspector"
          //       select={setSelectedApprover}
          //       selected={selectedApprover}
          //     />
          //   ),
          // },
          {
            label: `${t("PAY_CUSTOM_AMOUNT")} *`,
            // type: "text",
            // populators: {
            //   name: "amount",
            // },
            populators: (
              <input
                className="employee-card-input focus-visible"
                type="number"
                style={{ marginBottom: 0, width: "100%" }}
                // value={props.value}
                // error={errors?.name?.message}
                onChange={(e) => setAmount(e.target.value)}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                  }
                }}
              />
            ),
          },
          // {
          //   label: t("TL_APPROVAL_CHECKLIST_BUTTON_UP_FILE"),
          //   populators: (
          //     <UploadFile
          //       id={"workflow-doc"}
          //       // accept=".jpg"
          //       onUpload={selectFile}
          //       onDelete={() => {
          //         setUploadedFile(null);
          //       }}
          //       message={uploadedFile ? `1 ${t(`ES_PT_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
          //     />
          //   ),
          // },
        ],
      },
    ],
  };
};
