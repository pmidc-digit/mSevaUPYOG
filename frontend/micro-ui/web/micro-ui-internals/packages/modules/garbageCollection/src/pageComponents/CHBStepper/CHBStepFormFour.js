import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { useHistory } from "react-router-dom";
import { UPDATE_GarbageApplication_FORM, RESET_GarbageAPPLICATION_FORM } from "../../../redux/action/GarbageApplicationActions";
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
    return state.gc.GarbageApplicationFormReducer.formData || {};
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
      const id = res?.response?.GarbageConnection?.[0]?.applicationNo;
      if (res?.isSuccess) {
        if (isCitizen) {
          history.push("/digit-ui/citizen/garbagecollection/response/" + id);
        } else {
          history.push("/digit-ui/employee/garbagecollection/response/" + id);
        }
      } else {
        console.error("Submission failed, not moving to next step.", res?.response);
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
    }
    // onGoNext();
  };

  const onSubmit = async (data, actionStatus) => {
    setLoader(true);
    console.log("data", data);
    const apiDocs = data?.apiResponseData?.documents || [];
    const formDocs = data?.documents?.documents?.documents || [];

    // Extract existing fileStoreIds from API
    const existingFileStoreIds = apiDocs?.map((doc) => doc.fileStoreId);

    // Filter out documents that already exist in API
    const newDocuments = formDocs.filter((doc) => !existingFileStoreIds?.includes(doc.fileStoreId));

    console.log("NEW DOCUMENTS TO SEND:", newDocuments);

    // return;

    const payload = {
      GarbageConnection: {
        ...data?.venueDetails,
        processInstance: {
          ...data?.venueDetails?.processInstance,
          action: actionStatus,
        },
        documents: newDocuments,
      },
    };

    // (currentStepData?.documents?.documents?.documents || [])?.forEach((doc) => {
    //   payload.documents.push({
    //     documentdetailid: doc?.documentUid,
    //     documentType: doc?.documentType,
    //     fileStoreId: doc?.filestoreId,
    //   });
    // });

    // currentStepData?.documents?.documents?.documents

    try {
      const response = await Digit.GCService.update(payload);
      setLoader(false);
      dispatch(RESET_GarbageAPPLICATION_FORM());
      const id = response?.GarbageConnection?.[0]?.applicationNo;
      if (isCitizen) {
        history.push("/digit-ui/citizen/garbagecollection/response/" + id);
      } else {
        history.push("/digit-ui/employee/garbagecollection/response/" + id);
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
      dispatch(UPDATE_GarbageApplication_FORM(config.key, data));
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
