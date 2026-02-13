import React, { useState, useEffect } from "react";
import { Loader } from "@mseva/digit-ui-react-components";
import { Dropdown, LabelFieldPair, CardLabel } from "@mseva/digit-ui-react-components";

const SelectEmploymentStatus = ({ t, config, onSelect, formData = {}, userType }) => {
  const { data: EmployeeStatusData=[], isLoading } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "egov-hrms", [{ name: "EmployeeStatus" }], {
    select: (data) => {
      const formattedData = data?.["egov-hrms"]?.["EmployeeStatus"];
      return formattedData;
    },
  });
  let employeeStatusOptions = [];
  EmployeeStatusData &&
    EmployeeStatusData.map((item) => {
      employeeStatusOptions.push({ i18nKey: `${item.name}`, code: `${item.code}`, value: `${item.name}` });
    });

  const [employeeStatus, setEmployeeStatus] = useState(formData?.SelectEmploymentStatus);
  function SelectEmployeeStatus(value) {
    setEmployeeStatus(value);
  }

  useEffect(() => {
    onSelect(config.key, employeeStatus);
  }, [employeeStatus]);
  const inputs = [
    {
      label: "HR_STATUS_LABEL",
      type: "text",
      name: "employmentStatus",
      validation: {
        isRequired: true,
      },
      isMandatory: true,
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return inputs?.map((input, index) => {
    return (
      <LabelFieldPair key={index}>
        <CardLabel className="card-label-smaller hrms-text-transform-none">
          {t(input.label)}
          {input.isMandatory ? <span className="hrms-emp-mapping__required-asterisk"> * </span> : null}
        </CardLabel>
        <Dropdown
          className="form-field"
          selected={employeeStatus}
          option={employeeStatusOptions}
          select={SelectEmployeeStatus}
          optionKey="code"
          placeholder={t("HR_STATUS_PLACEHOLDER")}
          defaultValue={undefined}
          t={t}
        />
      </LabelFieldPair>
    );
  });
};

export default SelectEmploymentStatus;
