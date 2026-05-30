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
  isEmployee,
}) => {
  // ── RESUBMIT action: custom fields per role ──────────────────────────────
  if (action?.action === "RESUBMIT") {
    const resubmitBody = [
      // Assignee Name — employee side only
      isEmployee
        ? {
          label: `${t("WF_ASSIGNEE_NAME_LABEL")}*`,
          placeholder: t("WF_ASSIGNEE_NAME_PLACEHOLDER"),
          type: "dropdown",
          populators: (
            <Dropdown
              option={approvers}
              autoComplete="off"
              optionKey="name"
              id="fieldInspector"
              select={setSelectedApprover}
              selected={selectedApprover}
            />
          ),
        }
        : null,
      // Comments — both sides
      {
        label: t("WF_COMMON_COMMENTS_LABEL"),
        type: "textarea",
        populators: { name: "comments" },
        validation: {
          pattern: getPattern("Comments"),
          required: false,
          title: t("WF_COMMON_COMMENTS_ERROR"),
        },
      },
      // Applicant Name — both sides
      {
        label: t("NOC_OWNER_NAME"),
        type: "text",
        populators: { name: "applicantName" },
        validation: { required: false },
      },
      // Date — both sides
      {
        label: t("NOC_APPLICATION_DATE"),
        type: "date",
        populators: { name: "resubmitDate" },
        validation: { required: false },
      },
      // Supporting Documents — both sides
      {
        label: t("TL_APPROVAL_CHECKLIST_BUTTON_UP_FILE"),
        populators: (
          <UploadFile
            id={"workflow-doc"}
            onUpload={selectFile}
            onDelete={() => setUploadedFile(null)}
            message={
              uploadedFile
                ? `1 ${t("ES_PT_ACTION_FILEUPLOADED")}`
                : t("CS_ACTION_NO_FILEUPLOADED")
            }
          />
        ),
      },
    ].filter(Boolean);

    return {
      label: {
        heading: "WF_RESUBMIT_APPLICATION",
        submit: "WF_EMPLOYEE_NOC_RESUBMIT",
        cancel: "WF_EMPLOYEE_NOC_CANCEL",
      },
      form: [{ body: resubmitBody }],
    };
  }

  // ── All other actions: original behaviour ────────────────────────────────
  let checkCondtions = true;
  if (
    action?.action == "SENDBACKTOCITIZEN" ||
    action?.action == "APPROVE" ||
    action?.action == "REJECT" ||
    action?.action == "SEND_FOR_INSPECTION_REPORT" ||
    action?.action == "UPDATE_FEE"
  )
    checkCondtions = false;
  if (action.isTerminateState && action?.action !== "CANCEL") checkCondtions = false;

  return {
    label: {
      heading: `WF_${action?.action}_APPLICATION`,
      submit: `WF_EMPLOYEE_NOC_${action?.action}`,
      cancel: "WF_EMPLOYEE_NOC_CANCEL",
    },
    form: [
      {
        body: [
          action?.action === "CANCEL"
            ? {
                label: `${t("WF_ASSIGNEE_NAME_LABEL")}*`,
                type: "text",
                populators: {
                  name: "assigneeName",
                },
                validation: {
                  required: true,
                },
              }
            : {
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
              title: t("WF_COMMON_COMMENTS_ERROR"),
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
