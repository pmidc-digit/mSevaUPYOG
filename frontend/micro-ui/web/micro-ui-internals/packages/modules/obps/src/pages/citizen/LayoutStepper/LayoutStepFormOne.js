

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {Loader,Toast, ActionBar, SubmitBar, Dropdown, CardLabelError, LabelFieldPair, CardLabel } from "@mseva/digit-ui-react-components";
import { UPDATE_LayoutNewApplication_FORM } from "../../../redux/actions/LayoutNewApplicationActions";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Controller, useForm } from "react-hook-form";

const LayoutStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  // const [showToast, setShowToast] = useState(null);
  // const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.obps.LayoutNewApplicationFormReducer.formData;
  });

  console.log("currentStepData in LayoutStepFormOne", currentStepData);
  const userInfo = Digit.UserService.getUser();
  //console.log("userInfo type here", userInfo?.info?.type);

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
    getValues,
    setError,
    clearErrors,
  } = useForm();

  const commonProps = { Controller, control, setValue, errors, trigger, errorStyle, getValues, setError, clearErrors};

//   const validateApplicants = (applicants) => {
//   let hasError = false;

//   applicants.forEach((applicant, index) => {
//     if (!applicant.mobileNumber) {
//       setError(`applicants.${index}.mobileNumber`, {
//         type: "manual",
//         message: t("REQUIRED_FIELD"),
//       });
//       hasError = true;
//     } else if (!/^[6-9]\d{9}$/.test(applicant.mobileNumber)) {
//       setError(`applicants.${index}.mobileNumber`, {
//         type: "manual",
//         message: t("INVALID_MOBILE_NUMBER"),
//       });
//       hasError = true;
//     }
//   });



//   return !hasError;
// };


  const validateApplicants = (applicants) => {
    let hasError = false;
    //console.log("errorFound: Step 1 validation started for applicants", applicants);

    applicants.forEach((applicant, index) => {
      // Clear old errors for this applicant
      clearErrors(`applicants.${index}`);

      /* ---------------- Mobile Number ---------------- */
      if (!applicant.mobileNumber) {
        setError(`applicants.${index}.mobileNumber`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: mobile number error for applicant index", index);
      } else if (!/^[6-9]\d{9}$/.test(applicant.mobileNumber)) {
        setError(`applicants.${index}.mobileNumber`, {
          type: "manual",
          message: t("INVALID_MOBILE_NUMBER"),
        });
        hasError = true;
        //console.log("errorFound: mobile number else error for applicant index", index);
      }

      /* ---------------- Name ---------------- */
      if (!applicant.name || !applicant.name.trim()) {
        setError(`applicants.${index}.name`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: name error for applicant index", index);
      }

      /* ---------------- Email ---------------- */
      if (!applicant.emailId) {
        setError(`applicants.${index}.emailId`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: email id error for applicant index", index);
      } 
      // else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicant.emailId)) {
      //   setError(`applicants.${index}.emailId`, {
      //     type: "manual",
      //     message: t("INVALID_EMAIL_FORMAT"),
      //   });
      //   hasError = true;
      // }

      /* ---------------- Address ---------------- */
      if (!applicant.address || !applicant.address.trim()) {
        setError(`applicants.${index}.address`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: address error for applicant index", index);
      }

      /* ---------------- DOB (18+ validation) ---------------- */
      if (!applicant.dob) {
        setError(`applicants.${index}.dob`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: dob error for applicant index",index)
      } else {
        const dob = new Date(applicant.dob);
        const today = new Date();

        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        const d = today.getDate() - dob.getDate();

        if (age < 18 || (age === 18 && (m < 0 || (m === 0 && d < 0)))) {
          setError(`applicants.${index}.dob`, {
            type: "manual",
            message: t("DOB_MUST_BE_18_YEARS_OLD"),
          });
          hasError = true;
          //console.log("errorFound: dob else error for applicant index",index)
        }
      }

      /* ---------------- Gender ---------------- */
      if (!applicant.gender) {
        setError(`applicants.${index}.gender`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: gender error for applicant index",index)
      }

      /* ---------------- Passport Photo ---------------- */
      if (!applicant.photoUploadedFiles) {
        setError(`applicants.${index}.photo`, {
          type: "manual",
          message: t("BPA_PASSPORT_PHOTO_REQUIRED"),
        });
        hasError = true;
        //console.log("errorFound: photo error for applicant index",index)
      }

      /* ---------------- ID Proof ---------------- */
      if (!applicant.documentUploadedFiles) {
        setError(`applicants.${index}.document`, {
          type: "manual",
          message: t("BPA_ID_PROOF_REQUIRED"),
        });
        hasError = true;
        //console.log("errorFound: id proof error for applicant index",index)
      }

      /* ---------------- PAN Document ---------------- */
      if (!applicant.panDocumentUploadedFiles) {
        setError(`applicants.${index}.panDocument`, {
          type: "manual",
          message: t("PAN_DOCUMENT_REQUIRED"),
        });
        hasError = true;
        //console.log("errorFound: panDocument error for applicant index",index)
      }

      /* ---------------- PAN Number ---------------- */
      if (!applicant.panNumber) {
        setError(`applicants.${index}.panNumber`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: panNumber error for applicant index",index)
      } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(applicant.panNumber)) {
        setError(`applicants.${index}.panNumber`, {
          type: "manual",
          message: t("INVALID_PAN_FORMAT"),
        });
        hasError = true;
        //console.log("errorFound: panNumber else error for applicant index",index)
      }
    });

    //console.log("errorFound: Step final validation ends for applicants", applicants);

    return !hasError;
  };



  // const onSubmit = (data) => {
  //   //console.log("data in first step", data);
  //   const applicants = currentStepData?.applicants || [];
  //   const isApplicantsValid = validateApplicants(applicants);

  //   console.log("total errorFound: ", errors)

  //   if (!isApplicantsValid) {
  //     return;
  //   }
  //   trigger();

  //   if (errors.length > 0) {
  //     console.log("Plz fill mandatory fields in Step1");
  //     return;
  //   }
  //   goNext(data);
  // };

  const onSubmit = async (data) => {
    const applicants = currentStepData?.applicants || [];

    // 1. Validate applicants manually
    const isApplicantsValid = validateApplicants(applicants);

    if (!isApplicantsValid) {
      return; // stop submission
    }

    // 2. Trigger RHF validation and WAIT
    const isFormValid = await trigger();

    if (!isFormValid) {
      return; // RHF-controlled fields have errors
    }

    // 3. Safe to proceed
    goNext(data);
  };

  const onInvalid = () => {
    const applicants = currentStepData?.applicants || [];
    validateApplicants(applicants);
  };


  function goNext(data) {
    dispatch(UPDATE_LayoutNewApplication_FORM(config.key, data));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  // const closeToast = () => {
    // setShowToast(null);
    // setError("");
  // };
  
  
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
      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
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

      {/* {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />} */}
    </React.Fragment>
  );
};

export default LayoutStepFormOne;

