import { Dropdown, UploadFile } from "@mseva/digit-ui-react-components";
import React from "react";
import { convertEpochToDate } from "../Utils/index";
import { getLatestDeactivation } from "../../utils/employeeUtils";

// Local calendar date, so the default is today for the user and not yesterday in timezones ahead of UTC
const today = () => convertEpochToDate(Date.now());

export const configEmployeeActiveApplication = ({ t, action, selectFile, uploadedFile, setUploadedFile, selectedReason, Reasons, selectReason, employees = {} }) => {
  const latestDeactivation = getLatestDeactivation(employees?.deactivationDetails);
  return {
    label: {
      heading: `HR_ACTIVATE_EMPLOYEE_HEAD`,
      submit: `HR_ACTIVATE_EMPLOYEE_HEAD`,
    },
    form: [
      {
        body: [
          {
            label: t("HR_ACTIVATION_REASON"),
            type: "dropdown",
            isMandatory: true,
            name: "reasonForDeactivation",
            populators: <Dropdown isMandatory selected={selectedReason} optionKey="i18key" option={Reasons} select={selectReason} t={t} />,
          },
          {
            label: t("HR_ORDER_NO"),
            type: "text",
            populators: {
              name: "orderNo",
            },
          },

          {
            label: t("HR_EFFECTIVE_DATE"),
            type: "date",
            isMandatory: true,
            disable: true /* Disabled date and set defaultvalue */,
            populators: {
              error: t("HR_EFFECTIVE_DATE_INVALID"),
              name: "effectiveFrom",
              min: convertEpochToDate(latestDeactivation?.effectiveFrom),
              max: today(),
              defaultValue: today(),
            },
          },
          {
            label: t("HR_APPROVAL_UPLOAD_HEAD"),
            populators: (
              <div className="mb-8">
                <span>{t("TL_APPROVAL_UPLOAD_SUBHEAD")}</span>
                <UploadFile
                  id={"hrms-activation-doc"}
                  accept="image/*, .pdf, .png, .jpeg"
                  onUpload={selectFile}
                  onDelete={() => {
                    setUploadedFile(null);
                  }}
                  message={uploadedFile ? `1 ${t(`HR_ACTION_FILEUPLOADED`)}` : t(`HR_ACTION_NO_FILEUPLOADED`)}
                />
              </div>
            ),
          },

          {
            label: t("HR_REMARKS"),
            type: "text",
            populators: {
              name: "remarks",
            },
          },
        ],
      },
    ],
  };
};
