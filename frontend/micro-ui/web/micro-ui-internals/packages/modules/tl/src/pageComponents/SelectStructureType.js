import React, { useState } from "react";
import { TypeSelectCard } from "@mseva/digit-ui-react-components";
import { FormStep, RadioOrSelect, RadioButtons } from "@mseva/digit-ui-react-components";
import Timeline from "../components/TLTimeline";

const SelectStructureType = ({ t, config, onSelect, userType, formData }) => {
  const [StructureType, setStructureType] = useState(formData?.TradeDetails?.StructureType);
  const isEdit = window.location.href.includes("/edit-application/")||window.location.href.includes("renew-trade");
  const menu = [
    { i18nKey: "COMMON_MASTERS_STRUCTURETYPE_IMMOVABLE", code: "IMMOVABLE" },
    { i18nKey: "COMMON_MASTERS_STRUCTURETYPE_MOVABLE", code: "MOVABLE" },
  ];

  const onSkip = () => onSelect();

  function selectStructuretype(value) {
    setStructureType(value);
  }

  function goNext() {
    sessionStorage.setItem("StructureType", StructureType.i18nKey);
    onSelect(config.key, { StructureType });
  }
  return (
    <React.Fragment>
      <div className="step-form-wrapper">
        {window.location.href.includes("/citizen") ? <Timeline /> : null}
        <FormStep t={t} config={config} onSelect={goNext} onSkip={onSkip} isDisabled={!StructureType} cardStyle = {{ boxShadow: "none"}}>
          <RadioButtons
            t={t}
            optionsKey="i18nKey"
            isMandatory={config.isMandatory}
            options={menu}
            selectedOption={StructureType}
            onSelect={selectStructuretype}
            disabled={isEdit}
          />
        </FormStep>
      </div>
    </React.Fragment>
  );
};
export default SelectStructureType;
