import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {Loader,Toast, ActionBar, SubmitBar, Dropdown, CardLabelError, LabelFieldPair, CardLabel } from "@mseva/digit-ui-react-components";
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


  useEffect(()=>{
    if (!_.isEqual(ownerIdList, ownerIds)) setOwnerIdList(ownerIds?.ownerIdList);

    if (!_.isEqual(ownerPhotoList, ownerPhotos)) setOwnerPhotoList(ownerPhotos?.ownerPhotoList);

  },[ownerIds, ownerPhotos]);



  const userInfo = Digit.UserService.getUser();
  //console.log("userInfo type here", userInfo?.info?.type);

  const errorStyle = { color: "red", marginTop: "4px", marginBottom: "0" };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
    watch,
    reset, 
    getValues
  } = useForm({
    defaultValues:{
     owners: [
     {
      mobileNumber: "",
      ownerOrFirmName: "",
      emailId: "",
      fatherOrHusbandName: "",
      gender: null,
      dateOfBirth: "",
      address: "",
      ownershipInPct: ""
     }
    ]
   }
  });

  const commonProps = { Controller, control, setValue, errors, trigger, errorStyle, reset,useFieldArray, watch, config, ownerIdList, setOwnerIdList, ownerPhotoList, setOwnerPhotoList};

  function checkOwnershipSumVaildation(data){
    const ownersArr= data?.owners || [];
    const ownershipPctArr = ownersArr?.map((owner)=> parseFloat(owner?.ownershipInPct));
    const totalOwnershipSum= ownershipPctArr?.reduce((acc,curr)=>acc+curr,0);

    return totalOwnershipSum == 100 ? true : false;
  }

  function checkValidation(data) {

  const ownerPhotoCount = ownerPhotoList?.length ?? 0;        
  const ownerIdCount  = ownerIdList?.length ?? 0;         

  const ownersCount = data?.owners?.length ?? 0;

  const uniqueOwnersList= new Set(data?.owners?.map((owner)=> owner?.mobileNumber) || []);
  const isDuplicateOwner= uniqueOwnersList.size !== ownersCount;

  if(!checkOwnershipSumVaildation(data)){
    setTimeout(()=>{
      setShowToast(null);
    },3000);
    setShowToast({ key: "true", error: true, message: t("TOTAL_OWNERSHIP_SUM_VALIDATION_MESSAGE") });
    return false;
  }
  else if (ownersCount !== ownerPhotoCount) {
    setTimeout(()=>{
      setShowToast(null);
    },3000);
    setShowToast({ key: "true", error: true, message: t("UPLOAD_ALL_OWNER_PHOTOS_LABEL") });
    return false;
  }
  else if (ownersCount !== ownerIdCount) {
    setTimeout(()=>{
      setShowToast(null);
    },3000);
    setShowToast({ key: "true", error: true, message: t("UPLOAD_ALL_OWNER_IDS_LABEL") });
    return false;
  }
  else if (isDuplicateOwner) {
    setTimeout(()=>{
      setShowToast(null);
    },3000);
    setShowToast({ key: "true", error: true, message: t("DUPLICATE_OWNER_FOUND_LABEL") });
    return false;
  }
  else{
     return true;
  }
}


  const onSubmit = (data) => {
    trigger();

    if(!checkValidation(data))return;

    goNext(data);
  };

  function goNext(data) {
    dispatch(UPDATE_OBPS_FORM(config.key, data));
    dispatch(UPDATE_OBPS_OwnerIds("ownerIdList",ownerIdList));
    dispatch(UPDATE_OBPS_OwnerPhotos("ownerPhotoList",ownerPhotoList));
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

  const CLUProfessionalDetails = Digit?.ComponentRegistryService?.getComponent("CLUProfessionalDetails");
  const CLUApplicantDetails = Digit?.ComponentRegistryService?.getComponent("CLUApplicantDetails");

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="employeeCard">
            
        {isRegisteredStakeHolder ? (
            <React.Fragment>
             <CLUProfessionalDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
             <CLUApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
            </React.Fragment>
          ): (
            <React.Fragment>
             <CLUApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} {...commonProps} />
            </React.Fragment>
          )
        }   
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
