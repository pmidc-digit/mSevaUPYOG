import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {Loader,Toast, ActionBar, SubmitBar, Dropdown, CardLabelError, LabelFieldPair, CardLabel } from "@mseva/digit-ui-react-components";
import { UPDATE_NOCNewApplication_FORM } from "../../redux/action/NOCNewApplicationActions";
import { useState, useEffect } from "react";
import NOCApplicantDetails from "../NOCApplicantDetails";
import NOCProfessionalDetails from "../NOCProfessionalDetails";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Controller, useForm } from "react-hook-form";

const NewNOCStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.noc.NOCNewApplicationFormReducer.formData;
  });

  const userInfo = Digit.UserService.getUser();
  //console.log("userInfo type here", userInfo?.info?.type);

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
    reset
  } = useForm();

  const commonProps = { Controller, control, setValue, errors, trigger, errorStyle, reset};

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
    dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));
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



  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="employeeCard">
            
        {isRegisteredStakeHolder ? (
            <React.Fragment>
             <NOCProfessionalDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
             <NOCApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
            </React.Fragment>
          ): (
            <React.Fragment>
             <NOCApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
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

export default NewNOCStepFormOne;
