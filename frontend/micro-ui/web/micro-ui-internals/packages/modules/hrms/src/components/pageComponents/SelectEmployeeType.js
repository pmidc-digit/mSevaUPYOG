import React, { useState, useEffect } from "react";
import { Loader } from "@mseva/digit-ui-react-components";
import { Dropdown, LabelFieldPair, CardLabel } from "@mseva/digit-ui-react-components";
import { useLocation } from "react-router-dom";

const SelectEmployeeType = ({ t, config, onSelect, formData = {}, userType }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const { pathname: url } = useLocation();
  const editScreen = url.includes("/modify-application/");
  const { data: EmployeeTypes = [], isLoading } = Digit.Hooks.hrms.useHrmsMDMS(tenantId, "egov-hrms", "EmployeeType") || {};
  const [employeeType, setEmployeeType] = useState(formData?.SelectEmployeeType);
  function SelectEmployeeType(value) {
    setEmployeeType(value);
  }


  useEffect(() => {
    onSelect(config.key, employeeType);
  }, [employeeType]);
  const inputs = [
    {
      label: "HR_EMPLOYMENT_TYPE_LABEL",
      type: "text",
      name: "EmployeeType",
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
          selected={employeeType}
          option={EmployeeTypes?.["egov-hrms"]?.EmployeeType}
          select={SelectEmployeeType}
          optionKey="code"
          placeholder={t("HR_EMPLOYMENT_TYPE_PLACEHOLDER")}
          defaultValue={undefined}
          t={t}
        />
      </LabelFieldPair>
    );
  });
};

export default SelectEmployeeType;
