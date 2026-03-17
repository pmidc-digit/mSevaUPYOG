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
//     onGoNext();
//   }
//   function onGoBack(data) {
//     onBackClick(config.key, data);
//   }

//   const onFormValueChange = (setValue = true, data) => {
//     if (!_.isEqual(data, currentStepData)) {
//       dispatch(UPDATE_PtNewApplication(config.key, data));
//     }
//   };


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
  let tenantId = Digit.ULBService.getCurrentTenantId() || Digit.ULBService.getCitizenCurrentTenant();

  const history = useHistory();
  const dispatch = useDispatch();
  const [getLoader, setLoader] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
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

  // Auto-close toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Function to handle the "Next" button click
  const goNext = async (data) => {

    // Validate checkbox
    if (!window.declarationChecked) {
      setError("Please accept the declaration to proceed");
      setShowToast(true);
      return;
    }

    const res = await onSubmit(formData?.CreatedResponse);

    if (res) {
      history.replace(`/digit-ui/employee/tl/response/${formData?.CreatedResponse?.applicationNumber}`);
    } else {
      console.error("Submission failed, not moving to next step.");
      setError("Submission failed. Please try again.");
      setShowToast(true);
    }
  };

  const onSubmit = async (data) => {
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
      return false;
    }

  };

  // Function to handle the "Back" button click
  const onGoBack = (data) => {
    onBackClick(config.key, data);
  };

  // Function to handle form value changes
  // const onFormValueChange = (setValue = true, data) => {
  //   dispatch(UPDATE_tlNewApplication(config.key, data));
  // };


  // useEffect(() => {
  //     if (showToast) {
  //       const timer = setTimeout(() => {
  //         closeToast();
  //       }, 3000); 
  //       return () => clearTimeout(timer);
  //     }
  //   }, [showToast]);

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={formData}
        config={config.currStepConfig}
        onSubmit={goNext}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
        isDisabled={isButtonDisabled}
      />
      {getLoader && <Loader page={true} />}
      {showToast && (
        <Toast
          error={true}
          label={error}
          isDleteBtn={true}
          onClose={() => {
            setShowToast(false);
            setError("");
          }}
        />
      )}
    </React.Fragment>
  );
};

export default TLNewSummaryStepFour;
