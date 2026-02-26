import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {Loader,Toast, ActionBar, SubmitBar, Dropdown, CardLabelError, LabelFieldPair, CardLabel } from "@mseva/digit-ui-react-components";
import { UPDATE_NOCNewApplication_FORM, UPDATE_NOC_OwnerIds, UPDATE_NOC_OwnerPhotos } from "../../redux/action/NOCNewApplicationActions";
import { useState, useEffect } from "react";
import NOCApplicantDetails from "../NOCApplicantDetails";
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

  console.log('ownerIds', ownerIds)
  console.log('ownerPhotos', ownerPhotos)
  useEffect(()=>{
     console.log("useffect 8");
      if (!_.isEqual(ownerIdList, ownerIds)) setOwnerIdList(ownerIds?.ownerIdList);
  
      if (!_.isEqual(ownerPhotoList, ownerPhotos)) setOwnerPhotoList(ownerPhotos?.ownerPhotoList);
  
  },[ownerIds, ownerPhotos]);

  const userInfo = Digit.UserService.getUser();
  //console.log("userInfo type here", userInfo?.info?.type);

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
          ownerType:"",
          propertyVasikaDate: "",
          propertyVasikaNo:"",
          firmName:""
        },
      ],
    },
  });

  const commonProps = { Controller, control, setValue, errors, trigger, errorStyle,  reset, useFieldArray, watch, getValues, config, ownerIdList, setOwnerIdList, ownerPhotoList, setOwnerPhotoList};

  function checkValidation(data) {
    console.log("data in check val", data);
    const owners = data?.owners ?? [];

    console.log("ownerPhotoList", ownerPhotoList);
    // Filter photos/ids to only those that match current owners by mobileNumber

    const ownerPhotoCount = ownerPhotoList?.length ?? 0;
    const ownerIdCount = ownerIdList?.length ?? 0;
    console.log("ownerPhotoCount", ownerPhotoCount);
    const ownersCount = owners?.length;
    console.log("ownersCount", ownersCount);
    const uniqueOwnersList = new Set(data?.owners?.map((owner) => owner?.mobileNumber) || []);
    const isDuplicateOwner = uniqueOwnersList.size !== ownersCount;

    if (data.isPropertyAvailable?.value) {
      if (!data.owners[0]?.propertyId?.trim()) {
        setTimeout(() => {
          setShowToast(null);
        }, 3000);
        setShowToast({ key: "true", error: true, message: t("NOC_PROPERTY_ID_REQUIRED_IF_YES_MSG") }); // Use your NOC-specific translation key if different from BPA
        return false;
      }
    }

    if (ownersCount !== ownerPhotoCount) {
      setTimeout(() => {
        setShowToast(null);
      }, 3000);
      setShowToast({ key: "true", error: true, message: t("UPLOAD_ALL_OWNER_PHOTOS_LABEL") });
      return false;
    } else if (ownersCount !== ownerIdCount) {
      setTimeout(() => {
        setShowToast(null);
      }, 3000);
      setShowToast({ key: "true", error: true, message: t("UPLOAD_ALL_OWNER_IDS_LABEL") });
      return false;
    } else if (isDuplicateOwner) {
      setTimeout(() => {
        setShowToast(null);
      }, 3000);
      setShowToast({ key: "true", error: true, message: t("DUPLICATE_OWNER_FOUND_LABEL") });
      return false;
    } else {
      return true;
    }
  }

  const onSubmit = (data) => {
    //console.log("data in first step", data);
    trigger();

    if(!checkValidation(data))return;

    goNext(data);
  };

  function goNext(data) {

    dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));
    dispatch(UPDATE_NOC_OwnerIds("ownerIdList",ownerIdList));
    dispatch(UPDATE_NOC_OwnerPhotos("ownerPhotoList",ownerPhotoList));
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
        console.log("useffect 9");
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
      console.log("useffect 10");
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

      {showToast && <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast}/>}
    </React.Fragment>
  );
};

export default NewNOCStepFormOne;
