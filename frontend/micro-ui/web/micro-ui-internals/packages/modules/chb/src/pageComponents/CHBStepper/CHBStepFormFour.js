import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { useHistory } from "react-router-dom";
import { UPDATE_CHBApplication_FORM, RESET_CHB_APPLICATION_FORM } from "../../redux/action/CHBApplicationActions";
import { useState } from "react";
import CHBSummary from "../../pageComponents/CHBSummary";
import _ from "lodash";

const NewADSStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const isCitizen = window.location.href.includes("citizen");
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const currentStepData = useSelector(function (state) {
    return state.chb.CHBApplicationFormReducer.formData || {};
  });

  function validateStepData(data) {
    const missingFields = [];
    const notFormattedFields = [];

    return { missingFields, notFormattedFields };
  }

  const goNext = async (data) => {
    const actionStatus = data?.action;

    // return;
    try {
      const res = await onSubmit(currentStepData, actionStatus); // wait for the API response
      // Check if the API call was successful
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
    const hallInfo = currentStepData?.ownerDetails?.hallsBookingApplication || {};

    // Clone and modify workflow action
    const updatedApplication = {
      ...baseApplication,
      ...hallInfo,
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

    // return;
    const response = await Digit.CHBServices.update({ tenantId, ...finalPayload });
    dispatch(RESET_CHB_APPLICATION_FORM());
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
      dispatch(UPDATE_CHBApplication_FORM(config.key, data));
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };
  return (
    <React.Fragment>
      <CHBSummary formData={currentStepData} goNext={goNext} onGoBack={onGoBack} />
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

export default NewADSStepFormFour;
