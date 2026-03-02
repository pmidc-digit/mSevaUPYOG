import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { useState } from "react";
import _ from "lodash";

const CLUStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const stateId = Digit.ULBService.getStateId();
  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "CLU", ["Documents"]);

  const currentStepData = useSelector(function (state) {
    return state.obps.OBPSFormReducer.formData && state.obps.OBPSFormReducer.formData[config?.key]
      ? state.obps.OBPSFormReducer.formData[config?.key]
      : {};
  });

  const latestCurrentStepData = useSelector((state) => state?.obps?.OBPSFormReducer?.formData) || {};


  const coordinates = useSelector(function (state) {
      return state?.obps?.OBPSFormReducer?.coordinates || {};
  });
  

  function goNext(finaldata) {
    const missingFields = validation(finaldata);
    if (missingFields.length > 0) {
      setError(`${t("BPA_PLEASE_ATTACH_LABEL")} ${t(missingFields[0].replace(".", "_").toUpperCase())}`);
      setShowToast(true);
      setTimeout(()=>{
        setShowToast(false);
        setError("");
      },3000);
      return;
    }

     if(!(coordinates?.Latitude1?.trim()) || !(coordinates?.Latitude2?.trim()) ||  !(coordinates?.Longitude1?.trim()) || !(coordinates?.Longitude2?.trim())){
      setError(`${t("BPA_PLEASE_ATTACH_GEO_TAGGED_PHOTOS_LABEL")}`);
      setShowToast(true);
      setTimeout(()=>{
        setShowToast(false);
        setError("");
      },3000);
      return;
    }

    onGoNext();
  }

  //const completeData=useSelector((state)=>state?.noc?.NOCNewApplicationFormReducer?.formData) || {};

  function validation(documents) {
    if (!isLoading) {
      const isCluAppliedCategoryIndustry = latestCurrentStepData?.siteDetails?.appliedCluCategory?.code === "INDUSTRY_GODOWN_WAREHOUSING_COLD_STORE" || false;


      const owners = latestCurrentStepData?.applicationDetails?.owners || [];
      const isFirm = owners.some((owner) => {
          const typeCode = owner?.ownerType?.code || owner?.ownerType;
          return typeCode?.toString()?.toUpperCase() === "FIRM";
      });

      const cluDocumentsType = data?.CLU?.Documents?.map((item)=> {
          if(item?.code === "OWNER.INDUSTRYCATEGORYSUPPORTINGDOCUMENT"){
              return {...item, required: isCluAppliedCategoryIndustry ? true : false};
          }

          if (item?.code === "OWNER.FIRMDOCUMENT") {
            const updatedItem = { ...item, required: isFirm ? true : false };
            return updatedItem;
          }

          return item;
      });


      const documentsData = documents?.documents?.documents || [];

      // Step 1: Extract required document codes from layoutDocumentsType
      const requiredDocs = cluDocumentsType.filter((doc) => doc.required).map((doc) => doc.code);

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
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_OBPS_FORM(config.key, data));
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

export default CLUStepFormThree;
