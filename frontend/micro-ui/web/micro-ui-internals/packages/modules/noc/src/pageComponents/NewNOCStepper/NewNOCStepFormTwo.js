import React,{useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast, ActionBar, SubmitBar} from "@mseva/digit-ui-react-components";
import { UPDATE_NOCNewApplication_FORM } from "../../redux/action/NOCNewApplicationActions";
import { useState } from "react";
import NOCSiteDetails from "../NOCSiteDetails";
import NOCSpecificationDetails from "../NOCSpecificationDetails";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { useLocation } from "react-router-dom";

const NewNOCStepFormTwo = ({ config, onBackClick, onGoNext }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState("");
  const userInfo = Digit.UserService.getUser()?.info || {};


  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
    watch
  } = useForm({ 
     defaultValues: {
       floorArea: [{ value: "" }] 
  }
});

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

  const currentStepData = useSelector(function (state) {
    return state.noc.NOCNewApplicationFormReducer.formData;
  });

//   useEffect(() => {
//   const formattedData = currentStepData?.siteDetails;
//   if (formattedData?.floorArea) {
//     setValue("floorArea", formattedData.floorArea);
//   }
// }, [currentStepData, setValue]);


  const commonProps = { Controller, control, setValue, errors, errorStyle, useFieldArray, watch};

  let tenantId;

  if(window.location.href.includes("citizen"))tenantId=window.localStorage.getItem("CITIZEN.CITY");

  else {tenantId=window.localStorage.getItem("Employee.tenant-id");}
  
  // console.log("tenantId here==>", tenantId);

  const onSubmit = (data) => {
    trigger();

    //Validation for Jamabandi Area, JamabandiArea = Net Plot Area After Widening + Area Left After Widening
    const areaLeft = parseFloat(data?.areaLeftForRoadWidening) || 0;
    const netArea =  parseFloat(data?.netPlotAreaAfterWidening) || 0;
    const specArea = parseFloat(data?.specificationPlotArea) || 0;

    const totalSum = areaLeft + netArea;

    if(Math.abs(specArea - totalSum) > Number.EPSILON){
      setShowToast({ key: "true", error:true, message: "NOC_PLOT_AREA_SUM_VALIDATION_MESG_LABEL"});
      return;
    }
    
    //Save data in redux
    dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));
    
    //If create api is already called then move to next step
    if (currentStepData?.apiData?.Noc?.[0]?.applicationNo) {
      onGoNext();
    } else {
    //Call Create API and move to next Page
    callCreateAPI({ ...currentStepData, siteDetails:{...data} });
    }

   //onGoNext();

  };


  const callCreateAPI= async (formData)=>{ 
        
        // Prepare nocFormData
      const nocFormData = 
      {
        applicationDetails:{
          ...formData?.applicationDetails,
          applicantGender : formData?.applicationDetails?.applicantGender?.code || "",
        },
        siteDetails:{
         ...formData?.siteDetails,
         ulbName: formData?.siteDetails?.ulbName?.name || "",
         roadType: formData?.siteDetails?.roadType?.name || "",
         buildingStatus:formData?.siteDetails?.buildingStatus?.name || "",
         isBasementAreaAvailable: formData?.siteDetails?.isBasementAreaAvailable?.code || "",
         district: formData?.siteDetails?.district?.name || "",
         zone: formData?.siteDetails?.zone?.name || "",

         specificationBuildingCategory: formData?.siteDetails?.specificationBuildingCategory?.name || "",
         specificationNocType: formData?.siteDetails?.specificationNocType?.name || "",
         specificationRestrictedArea: formData?.siteDetails?.specificationRestrictedArea?.code || "",
         specificationIsSiteUnderMasterPlan:formData?.siteDetails?.specificationIsSiteUnderMasterPlan?.code || ""
        }
      };

       // console.log("nocFormData ==>", nocFormData)

      const ownerObj = {
       mobileNumber: nocFormData?.applicationDetails?.applicantMobileNumber || "",
       name: nocFormData?.applicationDetails?.applicantOwnerOrFirmName || "",
       emailId: nocFormData?.applicationDetails?.applicantEmailId || "",
       userName: nocFormData?.applicationDetails?.applicantMobileNumber || ""
      };

    
        // Final payload
        const payload = {
          Noc: {
              applicationType: "NEW",
              documents: [],
              nocType: "NOC",
              status: "ACTIVE",
              tenantId,
              owners:[ownerObj],
              workflow: {action: "INITIATE"},
              nocDetails:{
                additionalDetails: nocFormData,
                tenantId
              }
            },
        }

        console.log("final Payload here==>", payload);

        try{
        
        const response = await Digit.NOCService.NOCcreate({ tenantId, details: payload });
    
        if (response?.ResponseInfo?.status === "successful") {
          console.log("success :create api executed successfully !!!");
          dispatch(UPDATE_NOCNewApplication_FORM("apiData", response));
          onGoNext();
          return { isSuccess: true, response };
        } else {

          console.error("error  : create api not executed properly !!!");
          setShowToast({ key: "true", error:true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL"});
          return { isSuccess: false, response };
        }
       }catch(error){
          console.log("errors here in goNext - catch block", error);
          setShowToast({ key: "true", error:true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL"});
          return { isSuccess: false, response };
      }

        // onGoNext();
  }





  function goNext(data) {
    dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(null);
    // setError("");
  };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="employeeCard">
          <NOCSiteDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
          <NOCSpecificationDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
        </div>
        <ActionBar>
          <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>

      {showToast && <Toast isDleteBtn={true} error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewNOCStepFormTwo;
