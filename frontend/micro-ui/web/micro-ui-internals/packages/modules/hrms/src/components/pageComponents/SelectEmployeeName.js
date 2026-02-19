import React from "react";
import { LabelFieldPair, CardLabel, TextInput, CardLabelError } from "@mseva/digit-ui-react-components";
import { useLocation } from "react-router-dom";

const SelectEmployeeName = ({ t, config, onSelect, formData = {}, userType, register, errors }) => {
  const { pathname: url } = useLocation();
  const inputs = [
    {
      label: "HR_EMP_NAME_LABEL",
      type: "text",
      name: "employeeName",
      placeHolder: "HR_EMP_NAME_PLACEHOLDER", 
      validation: {
        isRequired: true,
        pattern: Digit.Utils.getPattern("Name"),
        title: t("CORE_COMMON_APPLICANT_NAME_INVALID"),
      },
      isMandatory: true,
    },
  ];

  function setValue(value, input) {
    onSelect(config.key, { ...formData[config.key], [input]: value });
  }

  return (
    <div>
      {inputs?.map((input, index) => {
        let currentValue = (formData && formData[config.key] && formData[config.key][input.name]) || "";
        return (
          <React.Fragment key={index}>
            {errors[input.name] && <CardLabelError>{t(input.error)}</CardLabelError>}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller hrms-text-transform-none">
                {t(input.label)}
                {input.isMandatory ? <span className="hrms-emp-mapping__required-asterisk"> *</span>: null}
              </CardLabel>
              <div className="field">
                <TextInput
                  key={input.name}
                  value={formData && formData[config.key] ? formData[config.key][input.name] : undefined}
                  onChange={(e) => setValue(e.target.value, input.name)}
                  disable={false}
                  placeholder={t(input.placeHolder)}
                  defaultValue={undefined}
                  {...input.validation}
                />
               
              </div>
            </LabelFieldPair>
             {currentValue && currentValue.length > 0 && !currentValue.match(Digit.Utils.getPattern("Name")) && (
                  <CardLabelError className="w-full -mt-3.5 text-base mb-3">
                    {t("CORE_COMMON_APPLICANT_NAME_INVALID")}
                  </CardLabelError>
                )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default SelectEmployeeName;
