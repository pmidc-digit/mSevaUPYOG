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

const NewNOCStepFormTwo = ({ config, onBackClick, onGoNext }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
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
    
    dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));
    
    //Use updated data 
    if (currentStepData?.apiData?.Noc?.[0]?.applicationNo) {
      onGoNext();
    } else {
    callCreateAPI({ ...currentStepData, siteDetails:{...data} });
    }

   // callCreateAPI({ ...currentStepData, siteDetails:{...data} });
  };


  const callCreateAPI= async (formData)=>{ 
        
        // Prepare nocFormData
        const nocFormData = {...formData};

        // console.log("nocFormData ==>", nocFormData)
    
        const ownerObj={
          mobileNumber: userInfo?.mobileNumber || "",
          name: userInfo?.name || "",
          emailId:userInfo?.emailId || "",
          type: userInfo?.type || "",
          userName: userInfo?.userName || ""
        }
    
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
        
        const response = await Digit.NOCService.NOCcreate({ tenantId, details: payload });
    
        if (response?.ResponseInfo?.status === "successful") {
          console.log("success :create api executed successfully !!!");
          dispatch(UPDATE_NOCNewApplication_FORM("apiData", response));
          onGoNext();
          return { isSuccess: true, response };
        } else {
          console.log("error  : create api not executed successfully !!!");
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
    setShowToast(false);
    setError("");
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

      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewNOCStepFormTwo;
