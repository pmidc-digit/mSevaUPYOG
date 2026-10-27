import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader, Toast, ActionBar, SubmitBar, Dropdown, CardLabelError, LabelFieldPair, CardLabel } from "@mseva/digit-ui-react-components";
import { UPDATE_OBPS_FORM, UPDATE_OBPS_OwnerIds, UPDATE_OBPS_OwnerPhotos } from "../../../redux/actions/OBPSActions";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Controller, useForm, useFieldArray } from "react-hook-form";

const CLUStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState("");

  const [ownerIdList, setOwnerIdList] = useState([]);
  const [ownerPhotoList, setOwnerPhotoList] = useState([]);

  const currentStepData = useSelector(function (state) {
    return state.obps.OBPSFormReducer.formData;
  });

  const ownerIds = useSelector(function (state) {
    return state.obps.OBPSFormReducer.ownerIds;
  });

  const ownerPhotos = useSelector(function (state) {
    return state.obps.OBPSFormReducer.ownerPhotos;
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth" // use "auto" for instant scroll
    });
  }, [])

  useEffect(() => {
    if (!_.isEqual(ownerIdList, ownerIds)) setOwnerIdList(ownerIds?.ownerIdList);

    if (!_.isEqual(ownerPhotoList, ownerPhotos)) setOwnerPhotoList(ownerPhotos?.ownerPhotoList);
  }, [ownerIds, ownerPhotos]);

  const userInfo = Digit.UserService.getUser();


  const errorStyle = { color: "red", marginTop: "4px", marginBottom: "0" };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
    watch,
    reset,
    getValues,
  } = useForm({
    defaultValues: {
      owners: [
        {
          mobileNumber: "",
          ownerOrFirmName: "",
          emailId: "",
          fatherOrHusbandName: "",
          gender: null,
          dateOfBirth: "",
          address: "",
          ownershipInPct: "",
        },
      ],
    },
  });

  const commonProps = {
    Controller,
    control,
    setValue,
    errors,
    trigger,
    errorStyle,
    reset,
    useFieldArray,
    watch,
    config,
    ownerIdList,
    setOwnerIdList,
    ownerPhotoList,
    setOwnerPhotoList,
  };

  const onSubmit = async (data) => {
    const applicants = currentStepData?.applicants || [];
    const activeApplicants = applicants.filter((a) => a?.status !== false && a?.status !== "false");
    const rawApplicantType = currentStepData?.applicationDetails?.aplicantType || currentStepData?.applicationDetails?.applicantType;
    const typeCode = (typeof rawApplicantType === "string" ? rawApplicantType : rawApplicantType?.code || rawApplicantType?.name || "").toUpperCase();

    if (activeApplicants?.length === 0) {
      setShowToast({ key: "true", error: true, message: t("AT LEAST ONE OWNER REQUIRED") });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    if (typeCode === "MULTIPLE" && activeApplicants?.length < 2) {
      setShowToast({ key: "true", error: true, message: t("MULTIPLE OWNER TYPE REQUIRES MORE THAN ONE OWNER") });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    if (typeCode === "INDIVIDUAL" && activeApplicants?.length > 1) {
      setShowToast({ key: "true", error: true, message: t("INDIVIDUAL OWNER TYPE CAN HAVE ONLY ONE OWNER") });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    if (typeCode === "MULTIPLE") {
      const ownershipPctArr = activeApplicants.map((owner) => parseFloat(owner?.ownershipInPct || 0));
      const totalOwnershipSum = ownershipPctArr.reduce((acc, curr) => acc + curr, 0);
      if (Math.round(totalOwnershipSum) !== 100) {
        setShowToast({ key: "true", error: true, message: t("TOTAL_OWNERSHIP_SUM_VALIDATION_MESSAGE") });
        setTimeout(() => setShowToast(null), 3000);
        return;
      }
    }

    goNext(data);
  };

  function goNext(data) {
    const formattedOwners = currentStepData?.applicationDetails?.owners || [];
    const mergedData = {
      ...currentStepData?.applicationDetails,
      ...data,
      owners: formattedOwners,
    };
    dispatch(UPDATE_OBPS_FORM(config.key, mergedData));
    if (ownerIdList && ownerIdList.length > 0) {
      dispatch(UPDATE_OBPS_OwnerIds("ownerIdList", ownerIdList));
    }
    if (ownerPhotoList && ownerPhotoList.length > 0) {
      dispatch(UPDATE_OBPS_OwnerPhotos("ownerPhotoList", ownerPhotoList));
    }
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(null);
    setError("");
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

  useEffect(() => {
    if (currentStepData?.applicationDetails?.isRegisteredStakeHolder) {
      setValue("isRegisteredStakeHolder", "true");
    }
  }, []);

  const CLUProfessionalDetails = Digit?.ComponentRegistryService?.getComponent("CLUProfessionalDetails");
  const CLUNewApplicantDetails = Digit?.ComponentRegistryService?.getComponent("CLUNewApplicantDetails");

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="employeeCard">
          {isRegisteredStakeHolder ? (
            <React.Fragment>
              <CLUProfessionalDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
              <CLUNewApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <CLUNewApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
            </React.Fragment>
          )}
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>

      {showToast && (
        <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />
      )}
    </React.Fragment>
  );
};

export default CLUStepFormOne;
