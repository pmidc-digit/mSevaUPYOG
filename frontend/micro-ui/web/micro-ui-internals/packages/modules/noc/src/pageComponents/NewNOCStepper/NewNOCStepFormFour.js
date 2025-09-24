import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {Menu, ActionBar, FormComposer, Toast, SubmitBar } from "@mseva/digit-ui-react-components";
import { UPDATE_NOCNewApplication_FORM, RESET_NOC_NEW_APPLICATION_FORM } from "../../redux/action/NOCNewApplicationActions";
import { useState, useRef } from "react";
import _ from "lodash";
import { useHistory, useLocation } from "react-router-dom";
import NOCSummary from "../NOCSummary";

const NewNOCStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state?.noc?.NOCNewApplicationFormReducer?.formData || {};
  });

  const coordinates = useSelector(function (state) {
        return state?.noc?.NOCNewApplicationFormReducer?.coordinates || {};
  });

  console.log("coordinates in summary page", coordinates);

  const menuRef = useRef();
  let user = Digit.UserService.getUser();
  const userRoles = user?.info?.roles?.map((e) => e.code);
  const [displayMenu, setDisplayMenu] = useState(false);

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  const history = useHistory();

  let tenantId;

  if(window.location.href.includes("citizen"))tenantId=window.localStorage.getItem("CITIZEN.CITY");

  else {tenantId=window.localStorage.getItem("Employee.tenant-id");}
  

  const goNext = async(action)=> {
    console.log("formData in parent SummaryPage", currentStepData);

   try{
      const res = await onSubmit(currentStepData,action);
      
      if (res?.isSuccess) {
        if(window.location.href.includes("citizen")){
           console.log("we are calling citizen response page")
           history.replace({
           pathname:`/digit-ui/citizen/noc/response/${res?.response?.Noc?.[0]?.applicationNo}`,
           state: { data: res?.response }
        });
        }

        else{
           console.log("we are calling employee response page")
           history.replace({
           pathname: `/digit-ui/employee/noc/response/${res?.response?.Noc?.[0]?.applicationNo}`,
           state: { data: res?.response }
        });
        }

         onGoNext();
        
      } else {
        console.error("Submission failed, not moving to next step.", res?.response);
        setError("Update failed due to some error occurred, plz try after some time");
        setShowToast(true);
        
      }
   }catch(error){
      //  alert(`Error: ${error?.message}`);
     console.log("errors here in goNext - catch block", error);
     setError("Update failed due to some error occurred, plz try again");
     setShowToast(true);
   }


  }

  const onSubmit= async (data, selectedAction)=>{
    console.log("formData inside onSubmit", data);

    const finalPayload = mapToNOCPayload(data, selectedAction);
    console.log("finalPayload here==>", finalPayload);
    
    try{
    const response = await Digit.NOCService.NOCUpdate({ tenantId, details: finalPayload });
    //dispatch(RESET_NOC_NEW_APPLICATION_FORM());
    if (response?.ResponseInfo?.status === "successful") {
          console.log("success: Update API ")
          dispatch(RESET_NOC_NEW_APPLICATION_FORM());
          return { isSuccess: true, response };
     } else {
          return { isSuccess: false, response };
     }

    }catch(error){
      console.log("Error: Update API in onSubmit-catch block");
      return { isSuccess: false, error };
    }
  }

  function mapToNOCPayload(nocFormData, selectedAction){
    console.log("nocFormData", nocFormData);

   const updatedApplication = {
    ...nocFormData?.apiData?.Noc?.[0],
    workflow:{
      action: selectedAction?.action || "",
      // assignes:selectedAction?.action || "",
      // status:selectedAction?.action || "",
    },
    nocDetails: {
     ...nocFormData?.apiData?.Noc?.[0]?.nocDetails,
     //update data with redux as we can not use old data for update api 
     additionalDetails: {
      ...nocFormData?.apiData?.Noc?.[0]?.nocDetails.additionalDetails,
      applicationDetails:{...nocFormData?.applicationDetails}, 
      siteDetails:{...nocFormData?.siteDetails},
      coordinates:{...coordinates}
    }
   
    },
    documents:[]
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

    return payload;
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  // const onFormValueChange = (setValue = true, data) => {
  //   //console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
  //   if (!_.isEqual(data, currentStepData)) {
  //     dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));
  //   }
  // };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };
   
  console.log("currentStepData in StepFour", currentStepData);
  const applicationNo=currentStepData?.apiData?.Noc?.[0]?.applicationNo || "";
  console.log("applicationNo here==>", applicationNo);
  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: applicationNo,
    moduleCode: "NOC",
  });

  console.log("workflow Details here==>", workflowDetails);

  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  console.log("actions here", actions);

  function onActionSelect(action) {
    goNext(action);
    //console.log("selectedAction here", action);
  }

  

  return (
    <React.Fragment>
 
      <NOCSummary onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t}/>

      {actions && (
      <ActionBar>
        <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />

        {displayMenu &&  (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu 
              localeKeyPrefix={`WF_EMPLOYEE_${"NOC"}`} 
              options={actions} 
              optionKey={"action"} 
              t={t} 
              onSelect={onActionSelect} 
            />
          ) : null}
        <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar>
      )}

      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewNOCStepFormFour;
