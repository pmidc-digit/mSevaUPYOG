import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {Loader,Toast, ActionBar, SubmitBar, Dropdown, CardLabelError, LabelFieldPair, CardLabel } from "@mseva/digit-ui-react-components";
import { UPDATE_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Controller, useForm } from "react-hook-form";

const LayoutStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.obps.LayoutNewApplicationFormReducer.formData;
  });

    const applicationNo = useSelector((state) => state.obps.LayoutNewApplicationFormReducer.formData?.applicationNo);
  

  const userInfo = Digit.UserService.getUser();
  //console.log("userInfo type here", userInfo?.info?.type);

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
  } = useForm();

  const commonProps = { Controller, control, setValue, errors, trigger, errorStyle};


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
  
  const onSubmit = (data) => {
    //console.log("data in first step", data);
    trigger();

    if (errors.length > 0) {
      console.log("Plz fill mandatory fields in Step1");
      return;
    }
    goNext(data);
  };

  function goNext(data) {
    dispatch(UPDATE_OBPS_FORM(config.key, data));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(null);
    setError("");
  };
  
  
  const [isRegisteredStakeHolder, setIsRegisteredStakeHolder]=useState(currentStepData?.applicationDetails?.isRegisteredStakeHolder || false);
  const stateCode = Digit.ULBService.getStateId();
  const [stakeHolderRoles, setStakeholderRoles] = useState(false);
  const userRoles = userInfo?.info?.roles?.map((roleData) => roleData.code);

  const { data: stakeHolderDetails, isLoading: stakeHolderDetailsLoading } = Digit.Hooks.obps.useMDMS(
    stateCode,
    "StakeholderRegistraition",
    "TradeTypetoRoleMapping"
  );

    useEffect(() => {
      if (!stakeHolderDetailsLoading) {
        let roles = [];
        stakeHolderDetails?.StakeholderRegistraition?.TradeTypetoRoleMapping?.map((type) => {
          type?.role?.map((role) => {
            roles.push(role);
          });
        });
        const uniqueRoles = roles?.filter((item, i, ar) => ar.indexOf(item) === i);

        uniqueRoles?.map((unRole) => {
          if (userRoles?.includes(unRole)) {
            setIsRegisteredStakeHolder(true);
          }
        });
      
      }
    }, [stakeHolderDetailsLoading]);

  useEffect(() => {
    if (currentStepData?.applicationDetails?.isRegisteredStakeHolder) {
     setValue("isRegisteredStakeHolder", "true");
    }
  }, []);

  const LayoutProfessionalDetails = Digit?.ComponentRegistryService?.getComponent("LayoutProfessionalDetails");
  const LayoutApplicantDetails = Digit?.ComponentRegistryService?.getComponent("LayoutApplicantDetails");

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="employeeCard">
            
        {isRegisteredStakeHolder ? (
            <React.Fragment>
             <LayoutProfessionalDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
             <LayoutApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
            </React.Fragment>
          ): (
            <React.Fragment>
             <LayoutApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
            </React.Fragment>
          )
        }   
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>

      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default LayoutStepFormOne;
