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
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

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
    return state.obps.OBPSFormReducer.formData;
  });

//   useEffect(() => {
//   const formattedData = currentStepData?.siteDetails;
//   if (formattedData?.floorArea) {
//     setValue("floorArea", formattedData.floorArea);
//   }
// }, [currentStepData, setValue]);


  const commonProps = { Controller, control, setValue, errors, errorStyle, useFieldArray, watch};

  const tenantId = window.localStorage.getItem("CITIZEN.CITY");

  const onSubmit = (data) => {
    trigger();
    
    dispatch(UPDATE_OBPS_FORM(config.key, data));
    
    // Use updated data 
    callCreateAPI({ ...currentStepData, siteDetails:{...data} });
  };


  const callCreateAPI= async (formData)=>{ 
        
        // Prepare nocFormData
        const nocFormData = {...formData};

        console.log("nocFormData ==>", nocFormData)
    
        // Final payload
        const payload = {
          Noc: {
              applicationType: "NEW",
              documents: [],
              nocType: "NOC",
              status: "ACTIVE",
              tenantId,
              workflow: {action: "INITIATE"},
              nocDetails:{
                additionalDetails: nocFormData,
                tenantId
              }
            },
        }

        console.log("final Payload here==>", payload);
        
        // const response = await Digit.NOCService.NOCcreate({ tenantId, details: payload });
    
        // if (response?.ResponseInfo?.status === "successful") {
        //   dispatch(UPDATE_NOCNewApplication_FORM("apiData", response));
        //   onGoNext();
        //   return { isSuccess: true, response };
        // } else {
        //   return { isSuccess: false, response };
        // }

        setTimeout(()=>{
          console.log("we are inside setTime out");
        }, 1000);

        onGoNext();
  }





  function goNext(data) {
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

      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default LayoutStepFormTwo;
