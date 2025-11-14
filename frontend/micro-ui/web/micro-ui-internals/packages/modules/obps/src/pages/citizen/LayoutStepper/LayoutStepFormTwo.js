import React,{useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast, ActionBar, SubmitBar} from "@mseva/digit-ui-react-components";
import { UPDATE_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Controller, useForm, useFieldArray } from "react-hook-form";

const LayoutStepFormTwo = ({ config, onBackClick, onGoNext }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [isErrorToast, setIsErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  
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
    return state.obps.LayoutNewApplicationFormReducer.formData;
  });
  const applicationNo = useSelector((state) => state.obps.LayoutNewApplicationFormReducer.formData?.applicationNo);

//   useEffect(() => {
//   const formattedData = currentStepData?.siteDetails;
//   if (formattedData?.floorArea) {
//     setValue("floorArea", formattedData.floorArea);
//   }
// }, [currentStepData, setValue]);


  const commonProps = { Controller, control, setValue, errors, errorStyle, useFieldArray, watch};

  // const tenantId = window.localStorage.getItem("CITIZEN.CITY");

  let tenantId;

  if(window.location.href.includes("citizen"))tenantId=window.localStorage.getItem("CITIZEN.CITY");

  else {tenantId=window.localStorage.getItem("Employee.tenant-id");}


  // <CHANGE> Add this useEffect to populate form when editing (loading existing data from API)
useEffect(() => {
  // Check if we have API response data to populate
  const apiResponse = currentStepData?.applicationDetails;

  console.log(currentStepData, "RESSSSSSS");
  
  if (apiResponse?.layoutDetails?.additionalDetails) {
    const additionalDetails = apiResponse.layoutDetails.additionalDetails;
    
    // Populate siteDetails if available
    if (additionalDetails.siteDetails) {
      const siteData = additionalDetails.siteDetails;
      
      // Set all form values from API response
      Object.entries(siteData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
    
    // Populate applicationDetails if available
    if (additionalDetails.applicationDetails) {
      const appData = additionalDetails.applicationDetails;
      
      Object.entries(appData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }
}, [currentStepData?.apiResponse, setValue]);

  const onSubmit = async(data) => {
    trigger();
    
    dispatch(UPDATE_OBPS_FORM(config.key, data));

     if (applicationNo) {
      console.log("Skipping Create API, already have applicationNo:", applicationNo);
      onGoNext();
      return;
    }
    
    // Use updated data 
    await callCreateAPI({ ...currentStepData, siteDetails:{...data} });
  };


  // const callCreateAPI= async (formData)=>{ 
        
  //       // Prepare nocFormData
  //       const nocFormData = {...formData};

  //       console.log("nocFormData ==>", nocFormData)
    
  //       // Final payload
  //       const payload = {
  //         Noc: {
  //             applicationType: "NEW",
  //             documents: [],
  //             nocType: "NOC",
  //             status: "ACTIVE",
  //             tenantId,
  //             workflow: {action: "INITIATE"},
  //             nocDetails:{
  //               additionalDetails: nocFormData,
  //               tenantId
  //             }
  //           },
  //       }

  //       console.log("final Payload here==>", payload);
        
  //       // const response = await Digit.NOCService.NOCcreate({ tenantId, details: payload });
    
  //       // if (response?.ResponseInfo?.status === "successful") {
  //       //   dispatch(UPDATE_NOCNewApplication_FORM("apiData", response));
  //       //   onGoNext();
  //       //   return { isSuccess: true, response };
  //       // } else {
  //       //   return { isSuccess: false, response };
  //       // }

  //       setTimeout(()=>{
  //         console.log("we are inside setTime out");
  //       }, 1000);

  //       onGoNext();
  // }


  const callCreateAPI = async (formData) => {
  // <CHANGE> Get user info and auth token for RequestInfo
  const userInfo = Digit.UserService.getUser()?.info;
  const authToken = Digit.UserService.getUser()?.access_token;

  console.log("  Form data for API:", formData);

  // <CHANGE> Build payload matching backend API structure
  const payload = {
    Layout: {
      applicationType: "NEW",
      documents: [],
      layoutType: "LAYOUT",
      status: "ACTIVE",
      tenantId: tenantId,
      owners: [
        {
          mobileNumber: userInfo?.mobileNumber || formData?.applicationDetails?.applicantMobileNumber,
          name: userInfo?.name || formData?.applicationDetails?.applicantOwnerOrFirmName,
          emailId: userInfo?.emailId || formData?.applicationDetails?.applicantEmailId,
          userName: userInfo?.userName || userInfo?.mobileNumber
        }
      ],
      workflow: {
        action: "INITIATE"
      },
      layoutDetails: {
        additionalDetails: {
          applicationDetails: formData?.applicationDetails || {},
          siteDetails: formData?.siteDetails || {}
        },
        tenantId: tenantId
      }
    },
  };

  console.log("  Final API payload:", payload);

  try {
    // <CHANGE> Call the actual API using the service you created
    const response = await Digit.OBPSService.LayoutCreate(payload, tenantId);

    console.log("  API Response:", response);

    if (response?.Layout?.[0]) {
      const applicationNumber = response.Layout[0].applicationNumber;
      const applicationId = response.Layout[0].id;

      console.log("  Application created successfully:", applicationNumber);

      dispatch(UPDATE_OBPS_FORM("applicationNumber", applicationNumber));
      dispatch(UPDATE_OBPS_FORM("applicationId", applicationId));
      dispatch(UPDATE_OBPS_FORM("apiResponse", response.Layout[0]));

      setTimeout(() => {
        onGoNext();
      }, 1500);

      return { isSuccess: true, response };
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("  API Error:", error?.response?.data?.Errors?.[0]?.code, error?.response?.data?.Errors?.[0]?.message);
    
    const backendError = error?.response?.data?.Errors?.[0] || error?.response?.Errors?.[0] || {};

    const errorMessage = backendError?.message || backendError?.description || t("FAILED_TO_CREATE_APPLICATION");

    // Show toast
    setIsErrorToast(true);
    setToastMessage(error?.response?.data?.Errors?.[0]?.message || error?.response?.data?.Errors?.[0]?.code);
    setShowToast(true);

    return { isSuccess: false, error };
  }
};





  function goNext(data) {
    dispatch(UPDATE_OBPS_FORM(config.key, data));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

const closeToast = () => {
  setShowToast(false);
  setIsErrorToast(false);
  setToastMessage("");
};


  const LayoutLocalityInfo = Digit?.ComponentRegistryService?.getComponent("LayoutLocalityInfo");
  const LayoutSiteDetails = Digit?.ComponentRegistryService?.getComponent("LayoutSiteDetails");
  const LayoutSpecificationDetails = Digit?.ComponentRegistryService?.getComponent("LayoutSpecificationDetails");
  const LayoutCLUDetails = Digit?.ComponentRegistryService?.getComponent("LayoutCLUDetails");

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="employeeCard">
          <LayoutLocalityInfo onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
          <LayoutSiteDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
          <LayoutSpecificationDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
          <LayoutCLUDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
        </div>
        <ActionBar>
          <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>

      {showToast && (
  <Toast
    isDleteBtn={true}
    error={isErrorToast}
    label={toastMessage}
    onClose={closeToast}
  />
)}

    </React.Fragment>
  );
};

export default LayoutStepFormTwo;
