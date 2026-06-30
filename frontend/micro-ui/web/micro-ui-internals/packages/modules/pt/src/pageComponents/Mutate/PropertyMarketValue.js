import React, { useEffect, useState } from "react";
import { FormStep, TextInput, LabelFieldPair, CardLabel, CardLabelError } from "@mseva/digit-ui-react-components";
import Timeline from "../../components/TLTimeline";

const PropertyMarketValue = (props) => {
  const { t, config, onSelect, userType, formData, setError, clearErrors, errors, formState } = props;
  const [marketValue, setSelected] = useState(formData?.[config.key]?.marketValue);

  useEffect(() => {
    if (userType === "employee") {
      if (!marketValue) {
        setError("additionalDetails.marketValue", { type: "Required" });
      } else if (errors?.additionalDetails?.marketValue) {
        clearErrors("additionalDetails.marketValue");
      }
      goNext();
    }
  }, [marketValue]);

  const goNext = () => {
    onSelect(config.key, { ...formData?.[config.key], marketValue });
  };
  const onSkip = () => {};

  if (userType === "employee") {
    return (
      <React.Fragment>
        <LabelFieldPair>
          <CardLabel style={{ fontWeight: "bold" }} className="card-label-smaller">
            {t("PT_MUTATION_MARKET_VALUE") + " *"}
          </CardLabel>
          <div className="field">
            <TextInput type={"number"} min={1} onChange={(e) => setSelected(e.target.value)} value={marketValue} />
          </div>
        </LabelFieldPair>
        {formState?.submitCount > 0 && !marketValue && (
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
      <FormStep t={t} config={config} onSelect={goNext} onSkip={onSkip} isDisabled={!marketValue}>
        <div className="field-container">
          <span className="citizen-card-input citizen-card-input--front">₹</span>
          <TextInput type={"number"} min={0} onChange={(e) => setSelected(e.target.value)} value={marketValue} />
        </div>
      </FormStep>
    </React.Fragment>
  );
};

export default PropertyMarketValue;
