// RenewSummaryStepFour.jsx

import React from "react";
import { useSelector } from "react-redux";
import { FormComposer } from "@mseva/digit-ui-react-components";
import { useHistory } from "react-router-dom";

const RenewTLSummaryStepFour = ({ config, onGoNext, onBackClick, t }) => {
  const formData = useSelector((state) => state.tl.tlNewApplicationForm.formData);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const history = useHistory();

  const goNext = async () => {
    const response = await Digit.TLService.update({ Licenses: [formData?.CreatedResponse] }, tenantId);
    if (response?.Licenses?.length > 0) {
      history.replace(`/digit-ui/employee/tl/application-details/${response?.Licenses?.[0]?.applicationNumber}`);
    }
  };

  const onGoBack = () => {
    onBackClick(config.key, formData);
  };

  return (
    <React.Fragment>
    <FormComposer
      defaultValues={formData}
      config={config.currStepConfig}
      onSubmit={goNext}
      label={t(config.texts.submitBarLabel)}
      currentStep={config.currStepNumber}
      onBackClick={onGoBack}
    />
    </React.Fragment>
  );
};

export default RenewTLSummaryStepFour
