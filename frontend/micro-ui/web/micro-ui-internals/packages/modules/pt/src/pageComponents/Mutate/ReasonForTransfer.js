import React, { useEffect, useState } from "react";
import { Dropdown, FormStep, LabelFieldPair, CardLabel, RadioOrSelect, CardLabelError } from "@mseva/digit-ui-react-components";
import Timeline from "../../components/TLTimeline";

const ReasonForTransfer = (props) => {
  const { t, config, onSelect, userType, formData, setError, clearErrors, errors, formState } = props;

  const { data, isLoading } = Digit.Hooks.pt.useMDMS(Digit.ULBService.getStateId(), "PropertyTax", "ReasonForTransfer", {});

  const [menu, setMenu] = useState([]);

  useEffect(() => {
    if (data) {
      let opt = data.PropertyTax.ReasonForTransfer.map((e) => ({ ...e, i18nKey: "PROPERTYTAX_REASONFORTRANSFER_" + e.code }));
      setMenu(opt);
    }
  }, [data]);

  const [reasonForTransfer, setSelected] = useState(formData?.[config.key]?.reasonForTransfer);

  const goNext = () => {
    onSelect(config.key, { ...formData?.[config.key], reasonForTransfer });
  };

  const onSkip = () => {};

  useEffect(() => {
    if (userType === "employee") {
      if (!reasonForTransfer) {
        setError("additionalDetails.reasonForTransfer", { type: "Required" });
      } else if (errors?.additionalDetails?.reasonForTransfer) {
        clearErrors("additionalDetails.reasonForTransfer");
      }
      goNext();
    }
  }, [reasonForTransfer]);

  if (userType === "employee") {
    return (
      <React.Fragment>
        <LabelFieldPair>
          <CardLabel style={{ fontWeight: "bold" }} className="card-label-smaller">
            {t("PT_MUTATION_TRANSFER_REASON") + " *"}
          </CardLabel>
          <div className="field">
            <Dropdown t={t} option={menu} optionKey={"i18nKey"} select={setSelected} selected={reasonForTransfer} />
          </div>
        </LabelFieldPair>
        {formState?.submitCount > 0 && !reasonForTransfer && (
          <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
            {t("CORE_COMMON_REQUIRED_ERRMSG")}
          </CardLabelError>
        )}
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <Timeline currentStep={2} flow="PT_MUTATE" />
      <FormStep t={t} config={config} onSelect={goNext} onSkip={onSkip} isDisabled={!reasonForTransfer}>
        <div>
          <RadioOrSelect
            t={t}
            optionKey="i18nKey"
            isMandatory={config.isMandatory}
            options={menu}
            onSelect={setSelected}
            selectedOption={reasonForTransfer}
            optionCardStyles={{ maxHeight: "50vh", overflow: "auto", zIndex: 100 }}
          />
        </div>
      </FormStep>
    </React.Fragment>
  );
};

export default ReasonForTransfer;
