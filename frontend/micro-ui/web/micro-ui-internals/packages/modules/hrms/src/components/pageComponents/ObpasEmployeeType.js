import { CardLabel, Dropdown, LabelFieldPair, Loader, RemoveableTag, MultiSelectDropdown, LinkLabel } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import cleanup from "../Utils/cleanup";
import { EMPLOYEE_TYPE } from "../../../../../constants/DistrcitRegionBifurcation";
// import MultiSelectDropdown from "./Multiselect";

const ObpasEmployeeType = ({ t, config, onSelect, userType, formData }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [employeeType, setEmployeeType] = useState(formData?.employeeType || "");

  
  useEffect(() => {
    onSelect(
      config.key,
      employeeType
    );
  }, [employeeType]);

  const handleEmployeeType = (value) => {
    setEmployeeType(value);
  };

//   if (isLoading) {
//     return <Loader />;
//   }
  return (
    <div>
        <LabelFieldPair>
            <CardLabel isMandatory={true} className="card-label-smaller hrms-text-transform-none">{`${t("HR_EMPLOYEE_TYPE_LABEL")}`}<span className="hrms-emp-mapping__required-asterisk"> * </span></CardLabel>
            <Dropdown
                className="form-field"
                selected={employeeType}
                disable={false}
                isMandatory={true}
                option={EMPLOYEE_TYPE}
                select={handleEmployeeType}
                optionKey="name"
                placeholder={t("HR_EMPLOYEE_TYPE_PLACEHOLDER")}
                t={t}
            />
        </LabelFieldPair>
    </div>
  );
};

export default ObpasEmployeeType;
