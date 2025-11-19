import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_LayoutNewApplication_FORM } from "../../../redux/actions/LayoutNewApplicationActions";
import { useState } from "react";
import _ from "lodash";

const LayoutStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const stateId = Digit.ULBService.getStateId();
  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "BPA", ["LayoutDocuments"]);

  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  
  const applicationNumberFromRedux = useSelector((state) => state.obps.LayoutNewApplicationFormReducer.formData?.layoutResponse?.Layout?.[0]?.applicationNo);
  const applicationIdFromRedux = useSelector((state) => state.obps.LayoutNewApplicationFormReducer.formData?.applicationId);
  
  const getApplicationNoFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const applicationNoFromURL = urlParams.get('applicationNo') || urlParams.get('applicationNumber');
    
    // Also check if it's in the pathname (e.g., /edit/LA-2024-01-001)
    const pathname = window.location.pathname;
    const pathMatch = pathname.match(/\/(?:edit|view)\/([A-Z]+-\d{4}-\d{2}-\d{3,})/i);
    
    return applicationNoFromURL || (pathMatch ? pathMatch[1] : null);
  };

  const applicationNumber = applicationNumberFromRedux || getApplicationNoFromURL();
  const applicationId = applicationIdFromRedux;
  
  console.log("Application Number (URL or Redux):", applicationNumber);
  console.log("Application ID:", applicationId);

  const currentStepData = useSelector(function (state) {
    return state.obps.LayoutNewApplicationFormReducer.formData && state.obps.LayoutNewApplicationFormReducer.formData[config?.key]
      ? state.obps.LayoutNewApplicationFormReducer.formData[config?.key]
      : {};
  });

  const applicationNo = currentStepData?.apiData?.Layout?.[0]?.applicationNo || "";

  const coordinates = useSelector(function (state) {
    return state?.obps?.LayoutNewApplicationFormReducer?.coordinates || {};
  });

  console.log("coordinates from redux", coordinates);

  function goNext(finaldata) {
    const missingFields = validation(finaldata);
    if (missingFields.length > 0) {
      setError(`${t("NOC_PLEASE_ATTACH_LABEL")} ${t(missingFields[0].replace(".", "_").toUpperCase())}`);
      setShowToast(true);
      return;
    }

    if(!(coordinates?.Latitude1?.trim()) || !(coordinates?.Latitude2?.trim()) ||  !(coordinates?.Longitude1?.trim()) || !(coordinates?.Longitude2?.trim())){
      setError(`${t("NOC_PLEASE_ATTACH_GEO_TAGGED_PHOTOS_LABEL")}`);
      setShowToast(true);
      return;
    }
  
    onGoNext();
  }

  const completeData = useSelector((state) => state?.obps?.LayoutNewApplicationFormReducer?.formData) || {};

  function validation(documents) {
    if (!isLoading) {
      const isVacant = completeData?.siteDetails?.buildingStatus?.code === "VACANT" || false;

      const layoutDocumentsType = isVacant 
        ? data?.BPA?.LayoutDocuments?.filter((doc) => doc.code !== "OWNER.BUILDINGDRAWING") 
        : data?.BPA?.LayoutDocuments;

      const documentsData = documents?.documents?.documents || [];

      const requiredDocs = (layoutDocumentsType || []).filter((doc) => doc.required).map((doc) => doc.code);

      const uploadedDocs = documentsData.map((doc) => doc.documentType);

      const missingDocs = requiredDocs.filter((reqDoc) => !uploadedDocs.includes(reqDoc));

      return missingDocs;
    }
    return [];
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_LayoutNewApplication_FORM(config.key, data));
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  const searchApplication = async () => {
    if (!applicationNumber && !applicationId) {
      console.log("  searchApplication skipped: No application number or ID found");
      return;
    }

    if (applicationNumberFromRedux && applicationData) {
      console.log("  Application data already loaded, skipping search");
      return;
    }

    const searchParams = {
      applicationNumber: applicationNumber,
    };

    console.log("  Searching application with params:", searchParams);

    try {
      setIsSearching(true);
      const response = await Digit.OBPSService.LayoutSearch(tenantId, searchParams);
      
      console.log("  Search API Response:", response);

      if (response?.Layout?.[0]) {
        const layoutData = response.Layout[0];
        setApplicationData(layoutData);
        
        const additionalDetails = layoutData?.layoutDetails?.additionalDetails;
        
        dispatch(UPDATE_LayoutNewApplication_FORM("apiData", response));
        
        dispatch(UPDATE_LayoutNewApplication_FORM("layoutResponse", layoutData));
        
        dispatch(UPDATE_LayoutNewApplication_FORM("applicationNo", layoutData.applicationNo));
        dispatch(UPDATE_LayoutNewApplication_FORM("applicationId", layoutData.id));
        
        if (additionalDetails?.applicationDetails) {
          dispatch(UPDATE_LayoutNewApplication_FORM("applicationDetails", additionalDetails.applicationDetails));
          console.log("  Redux updated: applicationDetails");
        }
        
        if (additionalDetails?.siteDetails) {
          dispatch(UPDATE_LayoutNewApplication_FORM("siteDetails", additionalDetails.siteDetails));
          console.log("  Redux updated: siteDetails");
        }
        
        if (layoutData.documents && layoutData.documents.length > 0) {
          const formattedDocs = {
            documents: layoutData.documents.map(doc => ({
              documentType: doc.documentType,
              filestoreId: doc.filestoreId || doc.fileStoreId,
              documentUid: doc.documentUid || doc.id,
              documentAttachment: doc.documentAttachment || doc.filestoreId || doc.fileStoreId
            }))
          };
          dispatch(UPDATE_LayoutNewApplication_FORM("documents", formattedDocs));
          console.log("  Redux updated: documents");
        }
        
        console.log("  Redux fully updated with application data");
        console.log("  Data structure:");
        console.log("  - formData.applicationNo:", layoutData.applicationNo);
        console.log("  - formData.applicationId:", layoutData.id);
        console.log("  - formData.layoutResponse:", layoutData);
        console.log("  - formData.apiData:", response);
      } else {
        throw new Error("Application not found in response");
      }
    } catch (error) {
      console.error("  Search API Error:", error);
      setError(t("FAILED_TO_FETCH_APPLICATION"));
      setShowToast(true);
    } finally {
      setIsSearching(false);
    }
  };

  React.useEffect(() => {
    console.log("  useEffect triggered for application search");
    console.log("  - applicationNumber:", applicationNumber);
    console.log("  - applicationId:", applicationId);
    console.log("  - isSearching:", isSearching);
    
    if ((applicationNumber || applicationId) && !isSearching) {
      searchApplication();
    }
  }, [applicationNumber, applicationId]);

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
