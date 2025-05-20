import { Dropdown, UploadFile } from "@mseva/digit-ui-react-components";
import React from "react";

export const configTLDirectRenewApplication = ({
  t,
  action,
  years,
  selectedApprover,
  setSelectedApprover,
  assigneeLabel,
  businessService,
}) => {

  return {
    label: {
      heading: `WF_${action?.action}_APPLICATION`,
      submit: `WF_${businessService?.toUpperCase()}_${action?.action}`,
      cancel: "WF_EMPLOYEE_NEWTL_CANCEL",
    },
    form: [
      {
        body: [
          {
            label: t("TL_VALID_FOR_NO_OF_YEARS"),
            type: "dropdown",
            populators: 
              <Dropdown
                option={years}
                autoComplete="off"
                select={setSelectedApprover}
                selected={selectedApprover}
              />
          },
        ],
      },
    ],
  };
};