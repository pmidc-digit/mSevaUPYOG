import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { useState } from "react";
import _ from "lodash";

const LayoutStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const stateId = Digit.ULBService.getStateId();
  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "NOC", ["Documents"]);


  // const tenantId = Digit.ULBService.getCurrentTenantId();
const tenantId = window.localStorage.getItem("CITIZEN.CITY");
const applicationNumber = useSelector((state) => state.obps.OBPSFormReducer.formData?.applicationNo);
const applicationId = useSelector((state) => state.obps.OBPSFormReducer.formData?.applicationId);
console.log(applicationNumber,applicationId, "APPLICATION NUMBER");


  const currentStepData = useSelector(function (state) {
    return state.obps.OBPSFormReducer.formData && state.obps.OBPSFormReducer.formData[config?.key]
      ? state.obps.OBPSFormReducer.formData[config?.key]
      : {};
  });

  function goNext(finaldata) {
    //console.log(`Data in step ${config.currStepNumber} is: \n`, finaldata);
    const missingFields = validation(finaldata);
    if (missingFields.length > 0) {
      setError(`${t("NOC_PLEASE_ATTACH_LABEL")} ${t(missingFields[0].replace(".", "_").toUpperCase())}`);
      setShowToast(true);
      return;
    }

    if(!sessionStorage.getItem("Latitude1") || !sessionStorage.getItem("Longitude1") || !sessionStorage.getItem("Latitude2") || !sessionStorage.getItem("Longitude2") ){
      setError(`${t("NOC_PLEASE_ATTACH_GEO_TAGGED_PHOTOS_LABEL")}`);
      setShowToast(true);
      return;
    }
    //Check for Location Details

    onGoNext();
    //}
  }

  function validation(documents) {
    if (!isLoading) {
      const layoutDocumentsType = data?.BPA?.LayoutDocuments || [];
      const documentsData = documents?.documents?.documents || [];

      // Step 1: Extract required document codes from layoutDocumentsType
      const requiredDocs = layoutDocumentsType.filter((doc) => doc.required).map((doc) => doc.code);
      console.log("required Documnets in Layout", requiredDocs);

      // Step 2: Extract uploaded documentTypes
      const uploadedDocs = documentsData.map((doc) => doc.documentType);

      // Step 3: Identify missing required document codes
      const missingDocs = requiredDocs.filter((reqDoc) => !uploadedDocs.includes(reqDoc));

      return missingDocs;
    }
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_OBPS_FORM(config.key, data));
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  const searchApplication = async () => {
  if (!applicationNumber && !applicationId) {
    console.error("[v0] No application number or ID found");
    return;
  }

  const userInfo = Digit.UserService.getUser()?.info;
  const authToken = Digit.UserService.getUser()?.access_token;


  const searchParams = {
    applicationNumber: applicationNumber,
  };

  console.log("[v0] Searching application with params:", searchParams);

  try {
    setIsSearching(true);
    const response = await Digit.OBPSService.LayoutSearch(tenantId, searchParams);
    
    console.log("[v0] Search API Response:", response);

    if (response?.Layout?.[0]) {
      const layoutData = response.Layout[0];
      setApplicationData(layoutData);
      
      // <CHANGE> Update Redux store with fetched application data
      const additionalDetails = layoutData?.layoutDetails?.additionalDetails;
      
      if (additionalDetails?.applicationDetails) {
        dispatch(UPDATE_OBPS_FORM("applicationDetails", additionalDetails.applicationDetails));
      }
      
      if (additionalDetails?.siteDetails) {
        dispatch(UPDATE_OBPS_FORM("siteDetails", additionalDetails.siteDetails));
      }
      
      // Store the full layout response for reference
      dispatch(UPDATE_OBPS_FORM("layoutResponse", layoutData));
      dispatch(UPDATE_OBPS_FORM("applicationNo", layoutData.applicationNo));
      
      console.log("[v0] Redux updated with search response");
    } else {
      throw new Error("Application not found");
    }
  } catch (error) {
    console.error("[v0] Search API Error:", error);
    setError(t("FAILED_TO_FETCH_APPLICATION"));
    setShowToast(true);
  } finally {
    setIsSearching(false);
  }
};

React.useEffect(() => {
  if (applicationNumber || applicationId) {
    searchApplication();
  }
}, []);

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default LayoutStepFormThree;
