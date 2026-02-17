import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router-dom";

import { CardHeader, Toast, Loader } from "@mseva/digit-ui-react-components";
import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import { cluStepperConfig } from "../../config/cluStepperConfig";
import { SET_OBPS_STEP,RESET_OBPS_FORM, UPDATE_OBPS_FORM, UPDATE_OBPS_CoOrdinates, UPDATE_OBPS_OwnerPhotos, UPDATE_OBPS_OwnerIds} from "../../redux/actions/OBPSActions";

//Config for steps
const createEmployeeConfig = [
  {
    head: "APPLICATION DETAILS",
    stepLabel: "BPA_APPLICATION_DETAILS",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "CLUStepFormOne",
    key: "applicationDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "SITE DETAILS",
    stepLabel: "BPA_SITE_DETAILS",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "CLUStepFormTwo",
    key: "siteDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "DOCUMENT DETAILS",
    stepLabel: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "CLUStepFormThree",
    key: "documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "SUMMARY DETAILS",
    stepLabel: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "CLUStepFormFour",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },

];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: cluStepperConfig?.filter((newConfigItem) => newConfigItem?.stepNumber === item?.stepNumber) };
});

const CLUEditApplication = () => {
  const { id } = useParams();
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.obps.OBPSFormReducer);
  const formData = formState.formData;
  const step = formState.step;

  //Makesure to pass tenantId correctly
  let tenantId;
  if(window.location.pathname.includes("employee")){
   tenantId = window.localStorage.getItem("Employee.tenant-id");
  }else{
   tenantId = window.localStorage.getItem("CITIZEN.CITY");
  }
  console.log("tenantId here", tenantId);

  const { isLoading, data} = Digit.Hooks.obps.useCLUSearchApplication({ applicationNo: id }, tenantId);
  const applicationDetails= data?.resData;
  console.log("applicationDetails here==>", applicationDetails);
  
  const cluObject = applicationDetails?.Clu?.[0] || {};
  const applicantDetails = cluObject?.cluDetails?.additionalDetails?.applicationDetails || {};
  const siteDetails = cluObject?.cluDetails?.additionalDetails?.siteDetails || {};
  const documents = cluObject?.documents?.filter((doc)=> (doc?.documentUid) || (doc?.documentType)) || [];
  const coordinates= cluObject?.cluDetails?.additionalDetails?.coordinates || {};
  const ownerPhotoList= cluObject?.cluDetails?.additionalDetails?.ownerPhotos || [];
  const ownerIdList= cluObject?.cluDetails?.additionalDetails?.ownerIds || [];

  
  const setStep = (updatedStepNumber) => {
    dispatch(SET_OBPS_STEP(updatedStepNumber));
  };

  // new changes here
  const stateId = Digit.ULBService.getStateId();

  const { data: mdmsData, isLoading:isMdmsLoading } = Digit.Hooks.useCustomMDMS(stateId, "BPA", [{ name: "LayoutType" }]);
  const areaTypeOptions = mdmsData?.BPA?.LayoutType?.[0]?.areaType || [];

  const { data: areaTypeData } = Digit.Hooks.useCustomMDMS(stateId, "CLU", [{ name: "AppliedCategory" }]);
  const appliedCluCategoryOptions = areaTypeData?.CLU?.AppliedCategory || [];
 
  const { data: buildingType, isLoading: isBuildingTypeLoading } = Digit.Hooks.noc.useBuildingType(stateId);
  const nonSchemeTypeOptions = mdmsData?.BPA?.LayoutType?.[0]?.nonSchemeType || [];
  const { data: roadType, isLoading: isRoadTypeLoading } = Digit.Hooks.noc.useRoadType(stateId);
  const { data: buildingCategory, isLoading: isBuildingCategoryLoading, error: buildingCategoryError } = Digit.Hooks.noc.useBuildingCategory(stateId);
  const { data: ulbList, isLoading: isUlbListLoading } = Digit.Hooks.useTenants();
  const [cities, setcitiesopetions] = useState(Digit.Hooks.obps.useTenants());
  const options = [
    {code: "YES",i18nKey: "YES",}, {code: "NO",i18nKey: "NO",},
  ];

  const ulbListOptions = ulbList?.map((city) => ({
    ...city,
    displayName: t(city.i18nKey),
  }));

  const { isGenderLoading, data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"]);

  let menu = [];
  genderTypeData &&
    genderTypeData["common-masters"]?.GenderType?.filter((data) => data.active)?.map((genderDetails) => {
      menu.push({ i18nKey: `COMMON_GENDER_${genderDetails.code}`, code: `${genderDetails.code}`, value: `${genderDetails.code}` });
  });

  const [selectedDistrict, setSelectedDistrict] = useState(null);

//   const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
//   selectedDistrict?.code,
//   "revenue",
//   { enabled: !!selectedDistrict },
//   t
//  );

 //console.log("fetchedLocalities", fetchedLocalities);

  const { data: zoneList, isLoading: isZoneListLoading } = Digit.Hooks.useCustomMDMS(stateId, "tenant", [{name:"zoneMaster",filter: `$.[?(@.tanentId == '${tenantId}')]`}]);
  const zoneOptions = zoneList?.tenant?.zoneMaster?.[0]?.zones || [];

//   useEffect(() => {
//   if (fetchedLocalities?.length > 0 && siteDetails?.zone) {
//     const zoneName = siteDetails?.zone?.name || siteDetails?.zone;
//     const matchedZone = fetchedLocalities?.find((loc) => loc.name === zoneName);

//     if (matchedZone) {
//       dispatch(
//         UPDATE_OBPS_FORM("siteDetails", {
//           ...formData.siteDetails,
//           zone: matchedZone,
//         })
//       );
//     }
//   }
// }, [fetchedLocalities, siteDetails?.zone]);

  useEffect(() => {
  if (zoneOptions?.length > 0 && siteDetails?.zone) {
    const zoneName = siteDetails?.zone?.name || siteDetails?.zone;
    const matchedZone = zoneOptions?.find((loc) => loc.name === zoneName);

    if (matchedZone) {
      dispatch(
        UPDATE_OBPS_FORM("siteDetails", {
          ...formData.siteDetails,
          zone: matchedZone,
        })
      );
    }
  }
}, [zoneOptions, siteDetails?.zone]);


  useEffect(() => {
    dispatch(RESET_OBPS_FORM());
    if(!isLoading && cluObject?.cluDetails  && !isUlbListLoading ){
        const formattedDocuments = {
       documents: {
        documents: documents?.map((doc) => ({
          documentType: doc?.documentType || "",
          uuid: doc?.uuid || "",
          documentUid: doc?.documentUid || "",
          documentAttachment: doc?.documentAttachment || "",
          filestoreId: doc?.uuid || "",
          cluId : doc?.cluId || ""
        })),
       },
        };

        Object.entries(coordinates).forEach(([key,value])=>{
        dispatch(UPDATE_OBPS_CoOrdinates(key, value));
        });

        dispatch(UPDATE_OBPS_OwnerIds("ownerIdList", ownerIdList));
        dispatch(UPDATE_OBPS_OwnerPhotos("ownerPhotoList", ownerPhotoList));

        const updatedApplicantDetails=
        {
          ...applicantDetails,
         // applicantGender : menu?.find((obj)=> (obj.code === applicantDetails?.applicantGender?.code || obj.code === applicantDetails?.applicantGender))
        }

       // const districtObj = cities?.find((obj) => (obj.name === siteDetails?.district?.name || obj.name === siteDetails?.district));
        //setSelectedDistrict(districtObj);

        const updatedSiteDetails=
        {
          ...siteDetails,
          localityAreaType: areaTypeOptions?.find((obj)=> obj.name === siteDetails?.localityAreaType?.name  || obj.name === siteDetails?.localityAreaType), 
          appliedCluCategory: appliedCluCategoryOptions?.find((obj)=> obj.name === siteDetails?.appliedCluCategory?.name || obj.name === siteDetails?.appliedCluCategory),
          ulbName: ulbListOptions?.find((obj)=> obj.name === siteDetails?.ulbName?.name  || obj.name === siteDetails?.ulbName),
          roadType: roadType?.find((obj) => (obj.name === siteDetails?.roadType?.name || obj.name === siteDetails?.roadType)),
          buildingStatus: buildingType?.find((obj) => (obj.name === siteDetails?.buildingStatus?.name || obj.name === siteDetails?.buildingStatus)),
         // district: districtObj,

          buildingCategory: buildingCategory?.find((obj) => (obj.name === siteDetails?.buildingCategory?.name || obj.name === siteDetails?.specificationBuildingCategory)),
        }
      
        dispatch(UPDATE_OBPS_FORM("applicationDetails", updatedApplicantDetails));
        dispatch(UPDATE_OBPS_FORM("siteDetails", updatedSiteDetails));
        dispatch(UPDATE_OBPS_FORM("documents", formattedDocuments));
        dispatch(UPDATE_OBPS_FORM("apiData", applicationDetails));
        
    }
  }, [isLoading, applicationDetails, isMdmsLoading, isBuildingTypeLoading]);


  const handleSubmit = (dataGet) => {
    
  };

  
   if (isLoading || !formData.applicationDetails) {
    return <div><Loader/></div>; // or a spinner component
   }


  return (
    <div className="card">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("BPA_CHANGE_OF_LAND_REGISTRATION_APPLICATION")}
      </CardHeader>
      <Stepper stepsList={updatedCreateEmployeeconfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
      {showToast && (
        <Toast
          error={showToast.key}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
          isDleteBtn={"true"}
        />
      )}
    </div>
  );
};

export default CLUEditApplication;
