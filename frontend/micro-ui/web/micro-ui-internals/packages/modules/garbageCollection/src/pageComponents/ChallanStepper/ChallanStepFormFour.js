import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { useHistory } from "react-router-dom";
import { UPDATE_ChallanApplication_FORM, RESET_ChallanAPPLICATION_FORM } from "../../../redux/action/ChallanApplicationActions";
import { useState } from "react";
import ChallanSummary from "../ChallanSummary";
import _ from "lodash";

const ChallanStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const isCitizen = window.location.href.includes("citizen");
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const currentStepData = useSelector(function (state) {
    return state.challan.ChallanApplicationFormReducer.formData || {};
  });

  console.log("currentStepData===", currentStepData);

  function validateStepData(data) {
    const missingFields = [];
    const notFormattedFields = [];

    return { missingFields, notFormattedFields };
  }

  const goNext = async (data) => {
    console.log("data", data);
    console.log("currentStepData", currentStepData);
    const actionStatus = data?.action;

    // return;
    try {
      const res = await onSubmit(currentStepData, actionStatus); // wait for the API response
      // Check if the API call was successful
      console.log("res", res);
      const id = res?.response?.hallsBookingApplication?.[0]?.bookingNo;
      if (res?.isSuccess) {
        if (isCitizen) {
          history.push("/digit-ui/citizen/chb/response/" + id);
        } else {
          history.push("/digit-ui/employee/chb/response/" + id);
        }
      } else {
        console.error("Submission failed, not moving to next step.", res?.response);
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
    }
    // onGoNext();
  };

  function mapToNDCPayload(inputData, actionStatus) {
    // Pick the source of truth for the application
    const baseApplication = inputData?.venueDetails?.[0] || {};

    // Clone and modify workflow action
    const updatedApplication = {
      ...baseApplication,
      workflow: {
        ...baseApplication?.workflow,
        action: actionStatus,
      },
      documents: [], // We'll populate below
    };

    (inputData?.documents?.documents?.documents || [])?.forEach((doc) => {
      updatedApplication.documents.push({
        documentdetailid: doc?.documentUid,
        documentType: doc?.documentType,
        fileStoreId: doc?.filestoreId,
      });
    });

    // Final payload matches update API structure
    const payload = {
      hallsBookingApplication: updatedApplication,
    };

    return payload;
  }

  const onSubmit = async (data, actionStatus) => {
    const finalPayload = mapToNDCPayload(data, actionStatus);

    console.log("finalPayload", finalPayload);
    // return;
    const response = await Digit.CHBServices.update({ tenantId, ...finalPayload });
    console.log("response", response);
    dispatch(RESET_ChallanAPPLICATION_FORM());
    if (response?.responseInfo?.status == "SUCCESSFUL") {
      return { isSuccess: true, response };
    } else {
      return { isSuccess: false, response };
    }
  };

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_ChallanApplication_FORM(config.key, data));
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };
  return (
    <React.Fragment>
      <ChallanSummary formData={currentStepData} goNext={goNext} onGoBack={onGoBack} />
      {/* <FormComposer
        defaultValues={currentStepData}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      /> */}
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default ChallanStepFormFour;
