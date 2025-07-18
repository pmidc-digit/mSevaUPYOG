import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_tlNewApplication } from "../../../../redux/action/TLNewApplicationActions";
import { useHistory, useLocation } from "react-router-dom";

//   const dispatch = useDispatch();
//   const currentStepData = useSelector(function (state) {
//     return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.formData[config.key]
//         ? state.pt.PTNewApplicationForm.formData[config.key]
//         : {};
// });

//   function goNext(data) {
//     console.log(`Data in step ${config.currStepNumber} is: \n`, data);
//     onGoNext();
//   }
//   function onGoBack(data) {
//     onBackClick(config.key, data);
//   }

//   const onFormValueChange = (setValue = true, data) => {
//     console.log("onFormValueChange data in AdministrativeDetails: ", data,"\n Bool: ",!_.isEqual(data, currentStepData));
//     if (!_.isEqual(data, currentStepData)) {
//       dispatch(UPDATE_PtNewApplication(config.key, data));
//     }
//   };

//  // console.log("currentStepData in  Administrative details: ", currentStepData);

//   return (
//     <React.Fragment>
//       <FormComposer
//         defaultValues={currentStepData}
//         //heading={t("")}
//         config={config.currStepConfig}
//         onSubmit={goNext}
//         onFormValueChange={onFormValueChange}
//         //isDisabled={!canSubmit}
//         label={t(`${config.texts.submitBarLabel}`)}
//         currentStep={config.currStepNumber}
//         onBackClick={onGoBack}
//       />
//     </React.Fragment>
//   );
// };

const TLNewSummaryStepFour = ({ config, onGoNext, onBackClick, t }) => {
  //let tenantId = Digit.ULBService.getCurrentTenantId() || Digit.ULBService.getCitizenCurrentTenant();
  
  const currentUserType = JSON.parse(window.localStorage.getItem("user-info"))?.type;

  let tenantId;
  if(currentUserType === "CITIZEN"){
      tenantId = window.localStorage.getItem("CITIZEN.CITY");

  }else{
    tenantId = Digit.ULBService.getCurrentPermanentCity(); 
  }

  const history = useHistory();
  const dispatch = useDispatch();

  // Retrieve the entire formData object from the Redux store
  const formData = useSelector((state) => state.tl.tlNewApplicationForm.formData);

  useEffect(() => {
    Digit.TLService.fetch_bill({
      tenantId: tenantId,
      filters: { consumerCode: formData?.CreatedResponse?.applicationNumber, businessService: "TL" },
    });
  }, []);

  // Function to handle the "Next" button click
  const goNext = (data) => {
    console.log("Full form data submitted: ", formData);

    const res = onSubmit(formData?.CreatedResponse);
    console.log("API response: ", res);

    if (res) {
      console.log("Submission successful, moving to next step.");
      history.replace(`/digit-ui/citizen/tl/tradelicence/application/${formData?.CreatedResponse?.applicationNumber}/${tenantId}`);
    } else {
      console.error("Submission failed, not moving to next step.");
    }
    // onGoNext();
  };

  const onSubmit = async (data) => {
    console.log("formData", data);
    let formdata = { ...data };
    formdata.tradeLicenseDetail.applicationDocuments = formData?.Documents?.documents?.documents;
    formdata.wfDocuments = formData?.Documents?.documents?.documents;
    formdata.calculation.applicationNumber = formdata.applicationNumber;
    formdata.action = "APPLY";

    const response = await Digit.TLService.update({ Licenses: [formdata] }, tenantId);
    return response?.ResponseInfo?.status === "successful";
    // console.log("onSubmit data in step 4: ", formdata);
  };

  // Function to handle the "Back" button click
  const onGoBack = (data) => {
    onBackClick(config.key, data);
  };

  // Function to handle form value changes
  // const onFormValueChange = (setValue = true, data) => {
  //   // console.log("onFormValueChange data summary in step 5: ", data);
  //   dispatch(UPDATE_tlNewApplication(config.key, data));
  // };

  // console.log("config in step 4", config)

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={formData} // Pass the entire formData as default values
        config={config.currStepConfig} // Configuration for the current step
        onSubmit={goNext} // Handle form submission
        // onFormValueChange={onFormValueChange} // Handle form value changes
        label={t(`${config.texts.submitBarLabel}`)} // Submit button label
        currentStep={config.currStepNumber} // Current step number
        onBackClick={onGoBack} // Handle back button click
      />
    </React.Fragment>
  );
};

export default TLNewSummaryStepFour;
