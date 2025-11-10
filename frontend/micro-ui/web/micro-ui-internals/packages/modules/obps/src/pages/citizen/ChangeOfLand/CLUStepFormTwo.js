import React,{useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast, ActionBar, SubmitBar} from "@mseva/digit-ui-react-components";
import { UPDATE_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Controller, useForm, useFieldArray } from "react-hook-form";

const CLUStepFormTwo = ({ config, onBackClick, onGoNext }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);

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


  const commonProps = { Controller, control, setValue, errors, errorStyle, useFieldArray, watch};

  // const tenantId = window.localStorage.getItem("CITIZEN.CITY");

  let tenantId;

  if(window.location.href.includes("citizen"))tenantId=window.localStorage.getItem("CITIZEN.CITY");

  else {tenantId=window.localStorage.getItem("Employee.tenant-id");}

  const onSubmit = (data) => {
    trigger();

    //Validation for Jamabandi Area Must Be Equal To Net Plot Total Area in sq mt (A+B)
    const isEqual= (data?.netTotalArea === data?.specificationPlotArea) || false;

    if(!isEqual){
        setShowToast({ key: "true", error:true, message: "BPA_PLOT_AREA_SUM_VALIDATION_MESG_LABEL"});
        return;
    }
    
    //Save data in redux
    dispatch(UPDATE_OBPS_FORM(config.key, data));
    
    //If create api is already called then move to next step
    // if (currentStepData?.apiData?.Noc?.[0]?.applicationNo) {
    //   onGoNext();
    // } else {
    // //Call Create API and move to next Page
    // callCreateAPI({ ...currentStepData, siteDetails:{...data} });
    // }

    onGoNext();
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
    setShowToast(null);
    
  };

  const CLULocalityInfo = Digit?.ComponentRegistryService?.getComponent("CLULocalityInfo");
  const CLUSiteDetails = Digit?.ComponentRegistryService?.getComponent("CLUSiteDetails");
  const CLUSpecificationDetails = Digit?.ComponentRegistryService?.getComponent("CLUSpecificationDetails");

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="employeeCard">
          <CLULocalityInfo onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
          <CLUSiteDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
          <CLUSpecificationDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} /> 
        </div>
        <ActionBar>
          <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>

      {showToast && <Toast isDleteBtn={true} error={showToast?.error} warning={showToast?.warning} label={showToast?.message} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default CLUStepFormTwo;
