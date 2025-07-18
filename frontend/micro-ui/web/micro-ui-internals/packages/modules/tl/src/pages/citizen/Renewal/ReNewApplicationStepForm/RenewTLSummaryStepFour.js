// RenewSummaryStepFour.jsx

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { FormComposer } from "@mseva/digit-ui-react-components";
import { useHistory } from "react-router-dom";

export const RenewTLSummaryStepFour = ({ config, onGoNext, onBackClick, t }) => {
  const formData = useSelector((state) => state.tl.tlNewApplicationForm.formData);
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const history = useHistory();

  useEffect(() => {
      Digit.TLService.fetch_bill({ tenantId: tenantId, filters: { consumerCode: formData?.CreatedResponse?.applicationNumber, businessService: "TL" } });
      
  },[])

  const goNext = async () => {
    // const response = await Digit.TLService.update({ Licenses: [formData?.CreatedResponse] }, tenantId);

    // if (response?.Licenses?.length > 0) {
    //   history.replace(`/digit-ui/employee/tl/application-details/${response?.Licenses?.[0]?.applicationNumber}`);
    // }
    console.log("Full form data submitted: ", formData);
    
    const res = onSubmit(formData?.CreatedResponse);
    console.log("API response: ", res);

    if (res) {
      console.log("Submission successful, moving to next step.");

      history.replace(`/digit-ui/citizen/tl/tradelicence/application/${formData?.CreatedResponse?.applicationNumber}/${tenantId}`);
    } else {
      console.error("Submission failed, not moving to next step.");
    }
  };

  const onSubmit = async (data) => {
    console.log("formData", data);
    let formdata = {...data};
    formdata.tradeLicenseDetail.applicationDocuments = formData?.Documents?.documents?.documents;
    formdata.wfDocuments = formData?.Documents?.documents?.documents;
    formdata.calculation.applicationNumber = formdata.applicationNumber;
    formdata.action = "APPLY";
    formdata.status = "INITIATED";
    formdata


    const response = await Digit.TLService.update({ Licenses: [formdata] }, tenantId);
    return (response?.ResponseInfo?.status === "successful");
  }

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
