import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_NOCNewApplication_FORM } from "../../redux/action/NOCNewApplicationActions";
import { useState } from "react";
import _ from "lodash";

const NewNOCStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const stateId = Digit.ULBService.getStateId();
  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "NOC", ["Documents"]);

  const currentStepData = useSelector(function (state) {
    return state.noc.NOCNewApplicationFormReducer.formData && state.noc.NOCNewApplicationFormReducer.formData[config?.key]
      ? state.noc.NOCNewApplicationFormReducer.formData[config?.key]
      : {};
  });

  const coordinates = useSelector(function (state) {
        return state?.noc?.NOCNewApplicationFormReducer?.coordinates || {};
  });

  console.log("coordinates from redux", coordinates);

  function goNext(finaldata) {

    const missingFields = validation(finaldata);
    if (missingFields.length > 0) {
      setError(`${t("NOC_PLEASE_ATTACH_LABEL")} ${t(missingFields[0].replace(".", "_").toUpperCase())}`);
      setShowToast(true);
      setTimeout(()=>{
        setShowToast(false);
        setError("");
      },3000);
      return;
    }
    

     if(!(coordinates?.Latitude1?.trim()) || !(coordinates?.Latitude2?.trim()) ||  !(coordinates?.Longitude1?.trim()) || !(coordinates?.Longitude2?.trim())){
      setError(`${t("NOC_PLEASE_ATTACH_GEO_TAGGED_PHOTOS_LABEL")}`);
      setShowToast(true);
      setTimeout(()=>{
        setShowToast(false);
        setError("");
      },3000);
      return;
    }
  
    onGoNext();
   
  }

  const completeData=useSelector((state)=>state?.noc?.NOCNewApplicationFormReducer?.formData) || {};

  function validation(documents) {
    if (!isLoading) {
      const isVacant= completeData?.siteDetails?.buildingStatus?.code === "VACANT" || false;
      //console.log("isVacant Here==>", isVacant);

      const nocDocumentsType = isVacant ? data?.NOC?.Documents.filter((doc)=> doc.code !== "OWNER.BUILDINGDRAWING") : data?.NOC?.Documents;

      const documentsData = documents?.documents?.documents || [];

      // Step 1: Extract required document codes from nocDocumentsType
      const requiredDocs = nocDocumentsType.filter((doc) => doc.required).map((doc) => doc.code);

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
    //console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };
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

export default NewNOCStepFormThree;
