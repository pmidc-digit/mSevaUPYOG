import React from "react";
import { LabelFieldPair, CardLabel, TextInput, CardLabelError } from "@mseva/digit-ui-react-components";
import { useLocation } from "react-router-dom";

const SelectEmployeeEmailId = ({ t, config, onSelect, formData = {}, userType, register, errors }) => {
  const { pathname: url } = useLocation();

  const inputs = [
    {
      label: "HR_EMAIL_LABEL",
      type: "email",
      name: "emailId",
      placeHolder: "HR_EMAIL_PLACEHOLDER",
      validation: {
        title: t("CORE_COMMON_APPLICANT_NAME_INVALID"),
      },
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
              <CardLabel className="card-label-smaller">
                {t(input.label)}
                {input.isMandatory ? " * " : null}
              </CardLabel>
              <div className="field">
                <TextInput
                  type={input.type}
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
              {currentValue && currentValue.length > 0 && !currentValue.match(Digit.Utils.getPattern("Email")) && (
                  <CardLabelError className="w-full -mt-3.5 text-base mb-3">
                    {t("CS_PROFILE_EMAIL_ERRORMSG")}
                  </CardLabelError>
                )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default SelectEmployeeEmailId;
