import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { SET_OBPS_STEP, UPDATE_OBPS_FORM, RESET_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { useState, useEffect } from "react";
import DocumentDetails from "../../../pageComponents/DocumentDetails";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const NewSelfCertificationStepFormSeven = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const scrutinyDetails = JSON.parse(sessionStorage.getItem("Digit.BUILDING_PERMIT"))?.value || {};
    const [applicationNo, setApplicationNo] = useState(scrutinyDetails?.data?.applicationNo || "")
    const tenantId = localStorage.getItem("CITIZEN.CITY")
  
  
    useEffect(()=>{
      if(scrutinyDetails?.data?.applicationNo){
        setApplicationNo(scrutinyDetails?.data?.applicationNo)
      }
    },[scrutinyDetails?.data?.applicationNo])
  
    useEffect(async () => {
      if(applicationNo){
        const response = await Digit.OBPSService.BPASearch(tenantId, {applicationNo})
        dispatch(UPDATE_OBPS_FORM("createdResponse", response?.BPA?.[0]));
      }
    }, [applicationNo])

  const currentStepData = useSelector(function (state) {
    return state.obps.OBPSFormReducer.formData;
  });

  function goNext(data) {
    console.log("NewSelfCertificationStepFormFour", data)
    dispatch(UPDATE_OBPS_FORM(config.key, data));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  console.log("me rendering instead", JSON.parse(sessionStorage.getItem("Digit.BUILDING_PERMIT")));

  return (
    <React.Fragment>
      <DocumentDetails onGoBack={onGoBack} onSelect={goNext} formData={scrutinyDetails} t={t} currentStepData={currentStepData}/>
      <div></div>
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewSelfCertificationStepFormSeven;
