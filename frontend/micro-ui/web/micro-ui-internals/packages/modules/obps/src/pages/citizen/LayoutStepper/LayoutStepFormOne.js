import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader, Toast, ActionBar, SubmitBar, Dropdown, CardLabelError, LabelFieldPair, CardLabel } from "@mseva/digit-ui-react-components";
import { UPDATE_LayoutNewApplication_FORM } from "../../../redux/actions/LayoutNewApplicationActions";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Controller, useForm } from "react-hook-form";

const LayoutStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  // const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.obps.LayoutNewApplicationFormReducer.formData;
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
    getValues,
    setError,
    clearErrors,
    register,
  } = useForm();

  const commonProps = { Controller, control, setValue, errors, trigger, errorStyle, getValues, setError, clearErrors, register };
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

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

  const validateApplicants = (applicants, applicantType) => {
    let hasError = false;
    //console.log("errorFound: Step 1 validation started for applicants", applicants);

    // if (applicantType?.code === "INDIVIDUAL") {
    //   if (applicants.length !== 1) {
    //     setError(`applicants`, {
    //       type: "manual",
    //       message: t("MULTIPLE_OWNER_TYPE_REQUIRES_MORE_THAN_ONE_OWNER"),
    //     });
    //     hasError = true;
    //   }
    // } else if (applicantType?.code === "MULTIPLE") {
    //   if (applicants.length < 2) {
    //     setError(`applicants`, {
    //       type: "manual",
    //       message: t("MULTIPLE_OWNER_TYPE_REQUIRES_MORE_THAN_ONE_OWNER"),
    //     });
    //     hasError = true;
    //   }
    // }

    const activeApplicants = applicants?.filter((a) => a?.status !== false && a?.status !== "false") || [];

    activeApplicants.forEach((applicant) => {
      const originalIndex = applicant.actualIndex !== undefined ? applicant.actualIndex : applicants.indexOf(applicant);
      // Clear old errors for this applicant
      clearErrors([
        `applicants.${originalIndex}.mobileNumber`,
        `applicants.${originalIndex}.name`,
        `applicants.${originalIndex}.emailId`,
        `applicants.${originalIndex}.address`,
        `applicants.${originalIndex}.dob`,
        `applicants.${originalIndex}.gender`,
        `applicants.${originalIndex}.photo`,
        `applicants.${originalIndex}.document`,
        `applicants.${originalIndex}.panDocument`,
        `applicants.${originalIndex}.panNumber`,
      ]);

      /* ---------------- Mobile Number ---------------- */
      if (!applicant.mobileNumber) {
        setError(`applicants.${originalIndex}.mobileNumber`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: mobile number error for applicant index", originalIndex);
      } else if (!/^[6-9]\d{9}$/.test(applicant.mobileNumber)) {
        setError(`applicants.${originalIndex}.mobileNumber`, {
          type: "manual",
          message: t("INVALID_MOBILE_NUMBER"),
        });
        hasError = true;
        //console.log("errorFound: mobile number else error for applicant index", originalIndex);
      }

      /* ---------------- Name ---------------- */
      if (!applicant.name || !applicant.name.trim()) {
        setError(`applicants.${originalIndex}.name`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: name error for applicant index", originalIndex);
      }

      /* ---------------- Email ---------------- */
      if (!applicant.emailId) {
        setError(`applicants.${originalIndex}.emailId`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: email id error for applicant index", originalIndex);
      }

      /* ---------------- Address ---------------- */
      if (!applicant.address || !applicant.address.trim()) {
        setError(`applicants.${originalIndex}.address`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: address error for applicant index", originalIndex);
      } else if (applicant.address.length > 100) {
        setError(`applicants.${originalIndex}.address`, {
          type: "manual",
          message: t("MAX_100_CHARACTERS_ALLOWED"),
        });
        hasError = true;
      }

      /* ---------------- DOB (18+ validation) ---------------- */
      if (!applicant.dob) {
        setError(`applicants.${originalIndex}.dob`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: dob error for applicant index", originalIndex)
      } else {
        const dob = new Date(applicant.dob);
        if (isNaN(dob.getTime())) {
          setError(`applicants.${originalIndex}.dob`, {
            type: "manual",
            message: t("Invalid Date Format"),
          });
          hasError = true;
        } else {
          const today = new Date();

          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          const d = today.getDate() - dob.getDate();

          if (age < 18 || (age === 18 && (m < 0 || (m === 0 && d < 0)))) {
            setError(`applicants.${originalIndex}.dob`, {
              type: "manual",
              message: t("DOB_MUST_BE_18_YEARS_OLD"),
            });
            hasError = true;
          }
        }
      }

      /* ---------------- Gender ---------------- */
      if (!applicant.gender) {
        setError(`applicants.${originalIndex}.gender`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: gender error for applicant index", originalIndex)
      }

      /* ---------------- Passport Photo ---------------- */
      if (!applicant.photoUploadedFiles) {
        setError(`applicants.${originalIndex}.photo`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: photo error for applicant index", originalIndex)
      }

      /* ---------------- ID Proof ---------------- */
      if (!applicant.documentUploadedFiles) {
        setError(`applicants.${originalIndex}.document`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: id proof error for applicant index", originalIndex)
      }

      /* ---------------- PAN Document ---------------- */
      if (!applicant.panDocumentUploadedFiles) {
        setError(`applicants.${originalIndex}.panDocument`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: panDocument error for applicant index", originalIndex)
      }

      /* ---------------- PAN Number ---------------- */
      if (!applicant.panNumber) {
        setError(`applicants.${originalIndex}.panNumber`, {
          type: "manual",
          message: t("REQUIRED_FIELD"),
        });
        hasError = true;
        //console.log("errorFound: panNumber error for applicant index", originalIndex)
      } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(applicant.panNumber)) {
        setError(`applicants.${originalIndex}.panNumber`, {
          type: "manual",
          message: t("Invalid PAN Number format. Format should be like AAAAA1234A"),
        });
        hasError = true;
        //console.log("errorFound: panNumber else error for applicant index", originalIndex)
      }
    });

    //console.log("errorFound: Step final validation ends for applicants", applicants);

    return !hasError;
  };

  const onSubmit = async (data) => {
    const applicants = currentStepData?.applicants || [];
    const activeApplicants = applicants.filter((a) => a?.status !== false && a?.status !== "false");
    const rawApplicantType = currentStepData?.applicationDetails?.aplicantType || currentStepData?.applicationDetails?.applicantType;
    const typeCode = (typeof rawApplicantType === "string" ? rawApplicantType : rawApplicantType?.code || rawApplicantType?.name || "").toUpperCase();

    if (activeApplicants?.length === 0) {
      setShowToast({ error: true, label: t("AT LEAST ONE OWNER REQUIRED") });
      return;
    }

    if (typeCode === "MULTIPLE" && activeApplicants?.length < 2) {
      setShowToast({ error: true, label: t("MULTIPLE OWNER TYPE REQUIRES MORE THAN ONE OWNER") });
      return;
    }

    if (typeCode === "INDIVIDUAL" && activeApplicants?.length > 1) {
      setShowToast({ error: true, label: t("INDIVIDUAL OWNER TYPE CAN HAVE ONLY ONE OWNER") });
      return;
    }

    // 1. Validate applicants manually
    // const isApplicantsValid = validateApplicants(applicants, applicantType);

    // if (!isApplicantsValid) {
    //   return; // stop submission
    // }

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
    const applicantType = currentStepData?.applicationDetails?.applicantType;
    validateApplicants(applicants, applicantType);
  };

  function goNext(data) {
    dispatch(UPDATE_LayoutNewApplication_FORM(config.key, data));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(null);
  };

  const [isRegisteredStakeHolder, setIsRegisteredStakeHolder] = useState(currentStepData?.applicationDetails?.isRegisteredStakeHolder || false);
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

  console.log("CurrentStepDataInStepOne", currentStepData);

  useEffect(() => {
    if (currentStepData?.applicationDetails?.isRegisteredStakeHolder) {
      setValue("isRegisteredStakeHolder", "true");
    }
  }, []);

  const LayoutProfessionalDetails = React.useMemo(() => Digit?.ComponentRegistryService?.getComponent("LayoutProfessionalDetails"), []);
  const LayoutNewApplicantDetails = React.useMemo(() => Digit?.ComponentRegistryService?.getComponent("LayoutNewApplicantDetails"), []);

  return (
    <React.Fragment>
      {/* <form onSubmit={handleSubmit(onSubmit, onInvalid)}> */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="employeeCard">
          {isRegisteredStakeHolder ? (
            <React.Fragment>
              <LayoutProfessionalDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
              <LayoutNewApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <LayoutNewApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
            </React.Fragment>
          )}
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>

      {showToast && <Toast isDleteBtn={true} error={showToast?.error} label={showToast?.label} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default LayoutStepFormOne;
