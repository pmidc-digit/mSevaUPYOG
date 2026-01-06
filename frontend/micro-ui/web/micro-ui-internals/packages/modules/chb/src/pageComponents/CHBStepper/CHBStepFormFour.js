import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { useHistory } from "react-router-dom";
import { UPDATE_CHBApplication_FORM, RESET_CHB_APPLICATION_FORM } from "../../redux/action/CHBApplicationActions";
import { useState } from "react";
import CHBSummary from "../../pageComponents/CHBSummary";
import _ from "lodash";
import { Loader } from "../../components/Loader";

const NewADSStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [loader, setLoader] = useState(false);
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
    console.log("inputData===", inputData);

    const owners = [
      {
        name: baseApplication?.owners?.[0]?.name,
        mobileNumber: baseApplication?.owners?.[0]?.mobileNumber,
        emailId: baseApplication?.owners?.[0]?.emailId,
        type: "CITIZEN",
      },
    ];

    const { owners: _baseOwners, ...baseWithoutOwners } = baseApplication || {};
    const { owners: _hallOwners, ...hallWithoutOwners } = hallInfo || {};

    // Clone and modify workflow action
    const updatedApplication = {
      ...baseWithoutOwners,
      ...hallWithoutOwners,
      owners,
      purpose: {
        purpose: hallInfo?.purpose?.purpose?.code,
      },
      // purpose: hallInfo?.purpose?.purpose?.name,
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

    console.log("payload====", payload);

    // return;

    return payload;
  }

  const onSubmit = async (data, actionStatus) => {
    const finalPayload = mapToNDCPayload(data, actionStatus);
    setLoader(true);

    // return;
    try {
      const response = await Digit.CHBServices.update({ tenantId, ...finalPayload });
      setLoader(false);
      dispatch(RESET_CHB_APPLICATION_FORM());
      sessionStorage.removeItem("CitizenConsentdocFilestoreidCHB");
      if (response?.responseInfo?.status == "SUCCESSFUL") {
        return { isSuccess: true, response };
      } else {
        return { isSuccess: false, response };
      }
    } catch (error) {
      setLoader(false);
      return error;
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
      {loader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default NewADSStepFormFour;
