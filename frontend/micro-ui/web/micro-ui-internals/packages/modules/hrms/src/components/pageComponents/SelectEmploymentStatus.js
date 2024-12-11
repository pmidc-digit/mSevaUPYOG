import React, { useState, useEffect } from "react";
import { Loader } from "@upyog/digit-ui-react-components";
import { Dropdown, LabelFieldPair, CardLabel } from "@upyog/digit-ui-react-components";
import { useLocation } from "react-router-dom";

const SelectEmploymentStatus = ({ t, config, onSelect, formData = {}, userType }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const { pathname: url } = useLocation();
  const editScreen = url.includes("/modify-application/");
  // const { data: EmployeeTypes = [], isLoading } = Digit.Hooks.hrms.useHrmsMDMS(tenantId, "egov-hrms", "EmployeeStatus") || {};

  const { data: EmployeeStatusData } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "egov-hrms", [{ name: "EmployeeStatus" }], {
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

  const [employeeType, setemployeeType] = useState(formData?.SelectEmployeeType);
  function SelectEmployeeType(value) {
    setemployeeType(value);
  }

  useEffect(() => {
    onSelect(config.key, employeeType);
  }, [employeeType]);
  const inputs = [
    {
      label: "HR_EMPLOYMENT_STATUS_LABEL",
      type: "text",
      name: "employmentStatus",
      validation: {
        isRequired: true,
      },
      //isMandatory: true,
    },
  ];

  // if (isLoading) {
  //   return <Loader />;
  // }
  // console.log("EmployeeTypes: ", EmployeeTypes, tenantId);

  return inputs?.map((input, index) => {
    return (
      <LabelFieldPair key={index}>
        <CardLabel className="card-label-smaller">
          {t(input.label)}
          {input.isMandatory ? " * " : null}
        </CardLabel>
        <Dropdown
          className="form-field"
          selected={employeeType}
          option={employeeStatusOptions}
          select={SelectEmployeeType}
          optionKey="code"
          defaultValue={undefined}
          t={t}
        />
      </LabelFieldPair>
    );
  });
};

export default SelectEmploymentStatus;
