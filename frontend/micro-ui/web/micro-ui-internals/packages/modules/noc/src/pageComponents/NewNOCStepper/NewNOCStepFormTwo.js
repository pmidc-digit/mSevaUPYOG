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
import { convertToDDMMYYYY } from "../../utils";
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
       floorArea: [{ value: "" }] ,
       vasikaNumber: "",
       vasikaDate: ""
  }
});

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

  const currentStepData = useSelector(function (state) {
    return state.noc.NOCNewApplicationFormReducer.formData;
  });

  console.log('currentStepData at step 2', currentStepData)

  const ownerIds = useSelector(function (state) {
    return state.noc.NOCNewApplicationFormReducer.ownerIds;
  });

  const ownerPhotos = useSelector(function (state) {
    return state.noc.NOCNewApplicationFormReducer.ownerPhotos;
  });

  const commonProps = { Controller, control, setValue, errors, errorStyle, useFieldArray, watch};

  let tenantId;

  if(window.location.href.includes("citizen"))tenantId=window.localStorage.getItem("CITIZEN.CITY");

  else {tenantId=window.localStorage.getItem("Employee.tenant-id");}
  
  


  // console.log("tenantId here==>", tenantId);
  const toNum2 = (val) => {
  if (val === null || val === undefined) return NaN;
  // Strip commas / spaces; keep only digits and decimal point
  const cleaned = String(val).trim().replace(/,/g, '');
  const num = Number(cleaned);
  if (Number.isNaN(num)) return NaN;
  // Round to 5 decimals to normalize "300", "300.0", "300.00", "300.000", "300.0000", "300.00000"
  return Number(num.toFixed(5));
  };
   

 const isEqualArea = (a, b) => {
  const n1 = toNum2(a);
  const n2 = toNum2(b);
  if (Number.isNaN(n1) || Number.isNaN(n2)) return false;
  const epsilon = 1e-9; // extremely small tolerance
  return Math.abs(n1 - n2) <= epsilon;
 }; 
  
 function checkValidation(data){
    //Validation for Jamabandi Area Must Be Equal To Net Plot Total Area in sq mt (A+B)
    const isEqual = isEqualArea(data?.netTotalArea, data?.specificationPlotArea); 

    const isBuiltUp = data?.buildingStatus?.code === "BUILTUP" ?? false;

    const netPlotArea= parseFloat(data?.specificationPlotArea);;
    const groundFloorArea = data?.floorArea?.[0]?.value ? parseFloat(data?.floorArea?.[0]?.value) : 0;

    if(!isEqual){
        setTimeout(()=>{setShowToast(null);},3000);
        setShowToast({ key: "true", error:true, message: "NOC_PLOT_AREA_SUM_VALIDATION_MESG_LABEL"});
        return false;
    }
    else if(isBuiltUp && groundFloorArea > netPlotArea){
        setTimeout(()=>{setShowToast(null);},3000);
        setShowToast({ key: "true", error:true, message: "NOC_GROUND_FLOOR_AREA_VALIDATION_LABEL"});
        return false;
    }else{
      return true;
    }
 };

  const onSubmit = async (data) => {
  trigger();
  if (!checkValidation(data)) return;

  try {
    const searchResponse = await Digit.NOCService.NOCsearch({
      tenantId,
      filters: {
        vasikaNumber: data?.vasikaNumber,
        vasikaDate: convertToDDMMYYYY(data?.vasikaDate),
      },
    });

    const applications = searchResponse?.Noc ?? [];
    const activeApp = applications.find(
      (app) => app?.applicationNo && app?.status !== "REJECTED"
    );

    if (activeApp) {
      setShowToast({ key: "true", error: true, message: "Active application already exists..." });
      return;
    }

    // Save data in redux
    dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));

    // ✅ Only one create call
    if (currentStepData?.apiData?.Noc?.[0]?.applicationNo) {
      onGoNext();
    } else {
      callCreateAPI({ ...currentStepData, siteDetails: { ...data } });
    }
  } catch (error) {
    setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" });
  }
};



  const callCreateAPI= async (formData)=>{
    
    console.log('formData', formData)
        
        // Prepare nocFormData
      const nocFormData = {
        applicationDetails: {
          ...formData?.applicationDetails,
          // applicantGender : formData?.applicationDetails?.applicantGender?.code || "",
        },
        siteDetails: {
          ...formData?.siteDetails,
          ulbName: formData?.siteDetails?.ulbName?.name || "",
          roadType: formData?.siteDetails?.roadType?.name || "",
          buildingStatus: formData?.siteDetails?.buildingStatus?.name || "",
          isBasementAreaAvailable: formData?.siteDetails?.isBasementAreaAvailable?.code || "",
          district: formData?.siteDetails?.district || "",
          zone: formData?.siteDetails?.zone?.name || "",
          vasikaDate: formData?.siteDetails?.vasikaDate ? convertToDDMMYYYY(formData?.siteDetails?.vasikaDate) : "",
          specificationBuildingCategory: formData?.siteDetails?.specificationBuildingCategory?.name || "",
          specificationNocType: formData?.siteDetails?.specificationNocType?.name || "",
          specificationRestrictedArea: formData?.siteDetails?.specificationRestrictedArea?.code || "",
          specificationIsSiteUnderMasterPlan: formData?.siteDetails?.specificationIsSiteUnderMasterPlan?.code || "",
        },
        ownerPhotos: Array.isArray(ownerPhotos?.ownerPhotoList) ? ownerPhotos.ownerPhotoList : [],
        ownerIds: Array.isArray(ownerIds?.ownerIdList) ? ownerIds.ownerIdList : [],
      };

       // console.log("nocFormData ==>", nocFormData)

    const ownerData = (nocFormData?.applicationDetails?.owners ?? [])?.map((item,index)=>{
      return {
        mobileNumber: item?.mobileNumber || "",
        name: item?.ownerOrFirmName || "",
        emailId: item?.emailId || "",
        userName: item?.mobileNumber || "",
        fatherOrHusbandName: item?.fatherOrHusbandName || "",
        permanentAddress: item?.address || "",
        gender: item?.gender?.code || "",
        dob: Digit.Utils.pt.convertDateToEpoch(item?.dateOfBirth || ""),
        additionalDetails:{
         ownerPhoto :{...ownerPhotos?.ownerPhotoList?.[index]},
         ownerId: {...ownerIds?.ownerIdList?.[index]}
        }
      }
     });

    
        // Final payload
        const payload = {
          Noc: {
              vasikaDate: convertToDDMMYYYY (formData?.siteDetails?.vasikaDate),
              vasikaNumber : formData?.siteDetails?.vasikaNumber,
              applicationType: "NEW",
              documents: [],
              nocType: "NOC",
              status: "ACTIVE",
              tenantId,
              owners:ownerData,
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
        } else {

          console.error("error  : create api not executed properly !!!");
          setShowToast({ key: "true", error:true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL"});
        }
       }catch(error){
          console.log("errors here in goNext - catch block", error);
          setShowToast({ key: "true", error:true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL"});
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
          <SubmitBar className="submit-bar-back" label="Back" onSubmit={onGoBack} />
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>

      {showToast && <Toast isDleteBtn={true} error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewNOCStepFormTwo;
