import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_tlNewApplication } from "../../../../redux/action/TLNewApplicationActions";
import { useHistory, useLocation } from "react-router-dom";
import { Loader } from "../../../../components/Loader";

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
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  let tenantId;
  if (currentUserType === "CITIZEN") {
    tenantId = window.localStorage.getItem("CITIZEN.CITY");
  } else {
    tenantId = Digit.ULBService.getCurrentPermanentCity();
  }
  const [getLoader, setLoader] = useState(false);

  const history = useHistory();
  const dispatch = useDispatch();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  // Retrieve the entire formData object from the Redux store
  const formData = useSelector((state) => state.tl.tlNewApplicationForm.formData);

  useEffect(() => {
    Digit.TLService.fetch_bill({
      tenantId: tenantId,
      filters: { consumerCode: formData?.CreatedResponse?.applicationNumber, businessService: "TL" },
    });
  }, []);

  // Monitor checkbox state and enable/disable button
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.declarationChecked) {
        setIsButtonDisabled(false);
      } else {
        setIsButtonDisabled(true);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Function to handle the "Next" button click
  // const goNext = (data) => {
  //   // console.log("checkDFpmr=====", formData);
  //   // console.log("data=====?", data);

  //   if (!data?.SummaryTL?.consentValue) {
  //     setError(`Please select checkbox`);
  //     setShowToast(true);
  //   }
  //   const res = onSubmit(formData?.CreatedResponse);
  //   console.log("API response: ", res);

  //   if (res) {
  //     // console.log("Submission successful, moving to next step.");
  //     // history.replace(`/digit-ui/citizen/tl/tradelicence/application/${formData?.CreatedResponse?.applicationNumber}/${tenantId}`);
  //     history.replace(`/digit-ui/citizen/tl/response/${formData?.CreatedResponse?.applicationNumber}`);
  //   } else {
  //     // console.error("Submission failed, not moving to next step.");
  //   }
  //   // onGoNext();
  // };

    const goNext = async (data) => {
    // Double check before submission
    if (!window.declarationChecked) {
      setError("Please accept the declaration to proceed");
      setShowToast(true);
      return;
    }

    const res = await onSubmit(formData?.CreatedResponse);
    
    if (res) {
      history.replace(`/digit-ui/citizen/tl/response/${formData?.CreatedResponse?.applicationNumber}`);
    } else {
      setError("Submission failed. Please try again.");
      setShowToast(true);
    }
  };

  const onSubmit = async (data) => {
    console.log("formData", data);
    let formdata = { ...data };
    formdata.tradeLicenseDetail.applicationDocuments = formData?.Documents?.documents?.documents;
    formdata.wfDocuments = formData?.Documents?.documents?.documents;
    formdata.calculation.applicationNumber = formdata.applicationNumber;
    formdata.action = "APPLY";
    setLoader(true);
    try {
      const response = await Digit.TLService.update({ Licenses: [formdata] }, tenantId);
      setLoader(false);
      return response?.ResponseInfo?.status === "successful";
    } catch (error) {
      setLoader(false);
      return error;
    }

    // console.log("onSubmit data in step 4: ", formdata);
  };

  // Function to handle the "Back" button click
  const onGoBack = (data) => {
    onBackClick(config.key, data);
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
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
        className="employeeCard"
        isDisabled={isButtonDisabled}
      />
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
      {getLoader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default TLNewSummaryStepFour;
