import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast, Loader } from "@mseva/digit-ui-react-components";
import { SET_OBPS_STEP, UPDATE_OBPS_FORM, RESET_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { useState, useEffect } from "react";
import ScrutinyDetails from "../../../pageComponents/ScrutinyDetails";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const OCStepFormThree = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
            try{
              setIsLoading(true)
              const response = await Digit.OBPSService.BPASearch(tenantId, {applicationNo})
              if(response?.ResponseInfo?.status === "successful"){
                dispatch(UPDATE_OBPS_FORM("createdResponse", response?.BPA?.[0]));
                setIsLoading(false)
              }else{
                setError(t("Some_Unknown_Error"))
                setShowToast(true);
                setIsLoading(false)
              }
            }catch(e){
              setError(t(e.message))
              setShowToast(true);
              setIsLoading(false)
            }
          }
    }, [applicationNo])

  const currentStepData = useSelector(function (state) {
    return state.obps.OBPSFormReducer.formData;
  });

  function goNext(key, data) {
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

  if(isLoading) return (<Loader />)

  return (
    <React.Fragment>
      <ScrutinyDetails onGoBack={onGoBack} onSelect={goNext} formData={scrutinyDetails} t={t} currentStepData={currentStepData}/>
      <div></div>
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default OCStepFormThree;
