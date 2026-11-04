import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader, Toast, ActionBar, SubmitBar, Dropdown, CardLabelError, LabelFieldPair, CardLabel } from "@mseva/digit-ui-react-components";
import { UPDATE_NOCNewApplication_FORM, UPDATE_NOC_OwnerIds, UPDATE_NOC_OwnerPhotos } from "../../redux/action/NOCNewApplicationActions";
import NOCNewApplicantDetails from "../NOCNewApplicantDetails";
import NOCProfessionalDetails from "../NOCProfessionalDetails";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { formatDateForInput } from "../../utils";
const NewNOCStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState("");

  const [ownerIdList, setOwnerIdList] = useState([]);
  const [ownerPhotoList, setOwnerPhotoList] = useState([]);

  const currentStepData = useSelector(function (state) {
    return state.noc.NOCNewApplicationFormReducer.formData;
  });

  const ownerIds = useSelector(function (state) {
    return state.noc.NOCNewApplicationFormReducer.ownerIds;
  });

  const ownerPhotos = useSelector(function (state) {
    return state.noc.NOCNewApplicationFormReducer.ownerPhotos;
  });

  const tenantId = localStorage.getItem("CITIZEN.CITY");




  React.useEffect(() => {
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


  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

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
          propertyId: "",
          gender: null,
          dateOfBirth: "",
          address: "",
          PropertyOwnerName: "",
          PropertyOwnerMobileNumber: "",
          PropertyOwnerAddress: "",
          PropertyOwnerPlotArea: null,
          ownerType: "",
          propertyVasikaDate: "",
          propertyVasikaNo: "",
          firmName: "",
          localityAreaType: null,
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
    getValues,
    config,
    ownerIdList,
    setOwnerIdList,
    ownerPhotoList,
    setOwnerPhotoList,
  };

  const onSubmit = (data) => {
    const applicants = currentStepData?.applicants || [];
    const activeApplicants = applicants.filter((a) => a?.status !== false && a?.status !== "false");
    const isPropAvail = data?.isPropertyAvailable?.value || currentStepData?.applicationDetails?.isPropertyAvailable?.value;

    if (activeApplicants?.length === 0) {
      setShowToast({ key: "true", error: true, message: t("AT LEAST ONE OWNER REQUIRED") });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    if (isPropAvail) {
      const propId =
        currentStepData?.applicationDetails?.propertyId ||
        currentStepData?.applicationDetails?.owners?.[0]?.propertyId;
      if (!propId || !propId.trim()) {
        setShowToast({ key: "true", error: true, message: t("NOC_PROPERTY_ID_REQUIRED_IF_YES_MSG") });
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
    dispatch(UPDATE_NOCNewApplication_FORM(config.key, mergedData));
    if (ownerIdList && ownerIdList.length > 0) {
      dispatch(UPDATE_NOC_OwnerIds("ownerIdList", ownerIdList));
    }
    if (ownerPhotoList && ownerPhotoList.length > 0) {
      dispatch(UPDATE_NOC_OwnerPhotos("ownerPhotoList", ownerPhotoList));
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
  const userRolesMapped = userInfo?.info?.roles?.map((roleData) => ({role: roleData?.code, tenantId: roleData?.tenantId}));

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
        if(userRoles?.includes("BPA_ARCHITECT")){
          setIsRegisteredStakeHolder(true);
        }
        else if (userRolesMapped?.find((userRole) => userRole?.role === unRole && userRole?.tenantId === tenantId)) {
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
              <NOCNewApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <NOCNewApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
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

export default NewNOCStepFormOne;
