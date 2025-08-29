import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_OBPS_FORM, RESET_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { useState } from "react";
import _ from "lodash";
import { useHistory, useLocation } from "react-router-dom";

const LayoutStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.obps.OBPSFormReducer.formData || {};
  });

  const history = useHistory();
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");


  const goNext = async(data)=> {
    console.log("formData in parent SummaryPage", currentStepData);

   // try{
      const res = await onSubmit(currentStepData);
      
      console.log("we reached here finally !!!");
      
      // if (res?.isSuccess) {
      //   if(window.location.href.includes("citizen")){
      //     //modify below as per response from api
      //     history.push("/digit-ui/citizen/noc/response/" + res?.response?.Noc?.uuid);
      //   }

      //   else{
      //      //modify below as per response from api
      //     history.push("/digit-ui/employee/noc/response/" + res?.response?.Noc?.uuid);
      //   }
        
      // } else {
      //   console.error("Submission failed, not moving to next step.", res?.response);
      //   alert(`Submission Failed ${res?.response}`)
      // }
   // }catch(e){
       //alert(`Error: ${error?.message}`);
     
   // }

    
   onGoNext();
  }

  const onSubmit= async (data)=>{
    console.log("formData inside onSubmit", data);

    const finalPayload = mapToNOCPayload(data);
    console.log("finalPayload here==", finalPayload);

    //remove below once completed
    setTimeout(()=>{
      console.log("we are here in setTimeOut")
    },1000);

    return true;
    
    // const response = await Digit.NOCService.NOCUpdate({ tenantId, details: finalPayload });
    // dispatch(RESET_NOC_NEW_APPLICATION_FORM());
    // if (response?.ResponseInfo?.status === "successful") {
    //       return { isSuccess: true, response };
    // } else {
    //       return { isSuccess: false, response };
    // }
  }

  function mapToNOCPayload(nocFormData){
    console.log("nocFormData", nocFormData);

    const updatedApplication= {
        applicationType: "NEW",
        documents: [],
        nocType: "NOC",
        status: "ACTIVE",
        tenantId,
        workflow: {action: "INITIATE"},
        nocDetails:{
            //modify below from apiData key using redux
            additionalDetails: {applicationDetails:{...nocFormData?.applicationDetails}, siteDetails:{...nocFormData?.siteDetails}},
            tenantId
        }
    }
    
   const docsArray = nocFormData?.documents?.documents?.documents || [];
     docsArray.forEach((doc) => {
       updatedApplication.documents.push({
       uuid: doc?.documentUid,
       documentType: doc?.documentType,
       documentAttachment: doc?.filestoreId
    });
  });

    const payload={
      Noc:{...updatedApplication}
    }

    console.log("payload in mapTONOCPayload", payload);

    return payload;
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    //console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
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

export default LayoutStepFormFour;
