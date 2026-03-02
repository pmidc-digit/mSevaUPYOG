import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";

import Stepper from "../../../../../../react-components/src/customComponents/Stepper"
import {layoutStepperConfig} from "../../../config/layoutStepperConfig";
import {
  SET_LayoutNewApplication_STEP,
  UPDATE_LayoutNewApplication_FORM,
  UPDATE_LayoutNewApplication_CoOrdinates,
  RESET_LayoutNewApplication_FORM,
 } from "../../../redux/actions/LayoutNewApplicationActions";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";

//Config for steps
const createEmployeeConfig = [
  {
    head: "APPLICATION DETAILS",
    stepLabel: "BPA_APPLICATION_DETAILS",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "LayoutStepFormOne",
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
    component: "LayoutStepFormTwo",
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
    component: "LayoutStepFormThree",
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
    component: "LayoutStepFormFour",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },

];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: layoutStepperConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

// console.log("updatedCreateEmployeeconfig: ", updatedCreateEmployeeconfig);
const useQueryParam = (key) => {
  const { search } = useLocation();
  return new URLSearchParams(search).get(key);
};

const LayoutStepperForm = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.obps.LayoutNewApplicationFormReducer);
  const formData = formState.formData;
  const step = formState.step;
  let tenantId;
  if (window.location.pathname.includes("employee")) {
    tenantId = window.localStorage.getItem("Employee.tenant-id");
  } else {
    tenantId = window.localStorage.getItem("CITIZEN.CITY");
  }
  const stateId = Digit.ULBService.getStateId();
  const applicationNo = useQueryParam("applicationNo");

  //console.log("applicationNo:", applicationNo);

  const { isLoading, data } = Digit?.Hooks?.obps?.useLayoutCitizenSearchApplication({ applicationNo }, tenantId, { enabled: !!applicationNo });

  //console.log("API data fetched for applicationNo:", applicationNo, data);

  const applicationAppliedUnderOptions = [
    { code: "PAPRA", name: "PAPRA", i18nKey: "PAPRA" },
    { code: "TOWN_PLANNING", name: "TOWN PLANNING", i18nKey: "Town Planning" },
    { code: "AFFORDABLE", name: "AFFORDABLE", i18nKey: "Affordable" },
    { code: "DEVELOPMENT", name: "DEVELOPMENT", i18nKey: "Development" },
  ]

  const { data: buildingTypeData, isLoading: isBuildingTypeLoading } = Digit?.Hooks?.obps?.useLayoutBuildingType(stateId);
  const { data: buildingCategoryData, isLoading: isBuildingCategoryLoading } = Digit?.Hooks?.obps?.useLayoutBuildingCategory(stateId);
  const { data: roadTypeData, isLoading: isRoadTypeLoading } = Digit?.Hooks?.obps?.useLayoutRoadType(stateId);
  const { data: layoutTypeData, isLoading: isLayoutTypeLoading } = Digit?.Hooks?.obps?.useLayoutType(stateId);
  const { data: mdmsData, isLoading: isMdmsLoading } = Digit?.Hooks?.useCustomMDMS(stateId, "BPA", [{ name: "LayoutType" }]);
  const areaTypeOptions = mdmsData?.BPA?.LayoutType?.[0]?.areaType || [];
// isBuildingTypeLoading, isBuildingCategoryLoading, isRoadTypeLoading, isLayoutTypeLoading, isMdmsLoading
  // const isLoading = isBuildingTypeLoading || isBuildingCategoryLoading || isRoadTypeLoading || isLayoutTypeLoading || isMdmsLoading || isLoading;
  const { data: ulbList, isLoading: isUlbListLoading } = Digit?.Hooks?.useTenants();
    const [cities, setCitiesOptions] = useState([]);
  
    useEffect(() => {
      if (ulbList?.length > 0) {
        setCitiesOptions(ulbList);
      }
    }, [ulbList]);
  
  const [selectedDistrict, setSelectedDistrict] = useState(null);
    const { data: fetchedLocalities } = Digit?.Hooks?.useBoundaryLocalities(selectedDistrict?.code, "revenue", { enabled: !!selectedDistrict }, t);
  
    const isDataInitialized = useRef(false);
    const hasResetForm = useRef(false);

  const layoutObject = data?.data?.[0]?.Applications;
  const professionalDetails = layoutObject?.layoutDetails?.additionalDetails?.applicationDetails || {};
  const siteDetails = layoutObject?.layoutDetails?.additionalDetails?.siteDetails || {};
  const coordinates = layoutObject?.layoutDetails?.additionalDetails?.coordinates || {};
  const documents = layoutObject?.documents || [];

  const primaryOwner = layoutObject?.owners?.[0] || {};
  const applicantDetails = {
    // Applicant personal info from primary owner
    applicantName: primaryOwner?.name || "",
    applicantEmailId: primaryOwner?.emailId || "",
    applicantMobileNumber: primaryOwner?.mobileNumber || "",
    applicantGender: primaryOwner?.gender || "",
    applicantDob: primaryOwner?.dob || "",
    applicantAddress: primaryOwner?.permanentAddress || primaryOwner?.address || "",
    documentUploadedFiles: primaryOwner?.additionalDetails?.documentFile || "",
    photoUploadedFiles: primaryOwner?.additionalDetails?.ownerPhoto || "",
    panDocumentUploadedFiles: primaryOwner?.additionalDetails?.panDocument || "",
    fatherOrHusbandName: primaryOwner?.fatherOrHusbandName || "",
    panNumber: professionalDetails?.panNumber || primaryOwner?.pan || "",
    aplicantType: primaryOwner?.additionalDetails?.aplicantType,
    // Professional details
    professionalName: professionalDetails?.professionalName || "",
    professionalEmailId: professionalDetails?.professionalEmailId || "",
    professionalRegId: professionalDetails?.professionalRegId || "",
    professionalMobileNumber: professionalDetails?.professionalMobileNumber || "",
    professionalAddress: professionalDetails?.professionalAddress || "",
    professionalRegistrationValidity: professionalDetails?.professionalRegistrationValidity || "",
    // Documents from primaryOwner
    primaryOwnerPhoto: primaryOwner?.additionalDetails?.ownerPhoto || professionalDetails?.primaryOwnerPhoto || "",
    primaryOwnerDocument: primaryOwner?.additionalDetails?.documentFile || professionalDetails?.primaryOwnerDocument || "",
  };

  useEffect(() => {
      if (fetchedLocalities?.length > 0 && siteDetails?.zone) {
        const zoneName = siteDetails?.zone?.name || siteDetails?.zone
        const matchedZone = fetchedLocalities?.find((loc) => loc.name === zoneName)
        if (matchedZone && formData.siteDetails?.zone?.code !== matchedZone.code) {
          dispatch(
            UPDATE_LayoutNewApplication_FORM("siteDetails", {
              ...formData.siteDetails,
              zone: matchedZone,
            })
          );
        }
      }
    }, [fetchedLocalities, siteDetails?.zone]);
  
    const options = [
      { code: "YES", i18nKey: "YES" },
      { code: "NO", i18nKey: "NO" },
    ];

  const cluTypeOptions = [
    { code: "ONLINE", i18nKey: "Online" },
    { code: "OFFLINE", i18nKey: "Offline" },
  ]
  
    const ulbListOptions = ulbList?.map((city) => ({
      ...city,
      displayName: t(city.i18nKey),
    }));
  
    const { data: genderTypeData, isLoading: isGenderLoading } = Digit?.Hooks?.obps?.useMDMS(stateId, "common-masters", ["GenderType"]);
    const menu = [];
    genderTypeData &&
      genderTypeData["common-masters"]?.GenderType?.filter((data) => data.active)?.map((genderDetails) => {
        menu.push({
          i18nKey: `COMMON_GENDER_${genderDetails.code}`,
          code: `${genderDetails.code}`,
          value: `${genderDetails.code}`,
        });
      });
  const convertToISODate = (dateStr) => {
    const [dd, mm, yyyy] = dateStr.split("-");
    return `${yyyy}-${mm}-${dd}`;
  };


  useEffect(() => {
      // Reset form only once when component mounts
      if (!hasResetForm.current) {
        dispatch(RESET_LayoutNewApplication_FORM());
        hasResetForm.current = true;
      }
      
      // Wait for all required data to be loaded including gender data
      // Also prevent re-initialization
      // if (!isLoading && layoutObject?.layoutDetails && !isUlbListLoading && !isGenderLoading && menu.length > 0 && !isDataInitialized.current) {
      if (!isBuildingTypeLoading && !isBuildingCategoryLoading && !isRoadTypeLoading && !isLayoutTypeLoading && !isMdmsLoading && !isLoading && layoutObject?.layoutDetails && !isUlbListLoading && !isGenderLoading && menu.length > 0 && !isDataInitialized.current) {
        isDataInitialized.current = true;
        //console.log("[EditLayoutApplication] Initializing form data with menu:", menu);
        
        
        const formattedDocuments = {
          documents: {
            documents: documents?.map((doc) => ({
              documentType: doc?.documentType || "",
              uuid: doc?.uuid || "",
              documentUid: doc?.documentUid || "",
              documentAttachment: doc?.documentAttachment || "",
              filestoreId: doc?.uuid || "",
            })),
          },
        };
  
        // Also prepare photo and document file uploads from primary owner
        // These will be used to prefill the upload components
        const photoUploadedFiles = {};
        const documentUploadedFiles = {};
        const panDocumentUploadedFiles = {};
        
        if (primaryOwner?.additionalDetails?.ownerPhoto) {
          photoUploadedFiles[0] = {
            fileStoreId: primaryOwner.additionalDetails.ownerPhoto,
            fileName: "Owner Photo",
          };
        }
        
        if (primaryOwner?.additionalDetails?.documentFile) {
          documentUploadedFiles[0] = {
            fileStoreId: primaryOwner.additionalDetails.documentFile,
            fileName: "Primary Owner Document",
          };
        }
        
        if (applicantDetails?.panNumber && primaryOwner?.additionalDetails?.panDocument) {
          panDocumentUploadedFiles[0] = {
            fileStoreId: primaryOwner.additionalDetails.panDocument,
            fileName: "PAN Document",
          };
        }
  
        Object.entries(coordinates).forEach(([key, value]) => {
          dispatch(UPDATE_LayoutNewApplication_CoOrdinates(key, value));
        });
  
        const updatedApplicantDetails = {
          // Primary owner/applicant fields - map to form field names
          applicantOwnerOrFirmName: applicantDetails?.applicantName || "",
          applicantMobileNumber: applicantDetails?.applicantMobileNumber || "",
          applicantEmailId: applicantDetails?.applicantEmailId || "",
          applicantAddress: applicantDetails?.applicantAddress || "",
          applicantFatherHusbandName: applicantDetails?.fatherOrHusbandName || "",
          documentUploadedFiles: applicantDetails?.documentUploadedFiles || "",
          photoUploadedFiles: applicantDetails?.photoUploadedFiles || "",
          panDocumentUploadedFiles: applicantDetails?.panDocumentUploadedFiles || "",
          // Format DOB to YYYY-MM-DD if available
          applicantDateOfBirth: applicantDetails?.applicantDob ? 
            (new Date(applicantDetails.applicantDob) instanceof Date && !isNaN(new Date(applicantDetails.applicantDob).getTime())
              ? new Date(applicantDetails.applicantDob).toISOString().split('T')[0]
              : applicantDetails.applicantDob
            ) : "",
          applicantGender: menu?.find((obj) => obj?.code === applicantDetails?.applicantGender?.code || obj?.code === applicantDetails?.applicantGender),
          panNumber: applicantDetails?.panNumber || "",
          aplicantType: applicantDetails?.aplicantType,
          // Professional details (if applicable)
          professionalName: applicantDetails?.professionalName || "",
          professionalEmailId: applicantDetails?.professionalEmailId || "",
          professionalRegId: applicantDetails?.professionalRegId || "",
          professionalMobileNumber: applicantDetails?.professionalMobileNumber || "",
          professionalAddress: applicantDetails?.professionalAddress || "",
          professionalRegistrationValidity: applicantDetails?.professionalRegistrationValidity || "",
          // Document file references
          primaryOwnerPhoto: applicantDetails?.primaryOwnerPhoto || "",
          primaryOwnerDocument: applicantDetails?.primaryOwnerDocument || "",
        };
  
        const districtObj = cities?.find((obj) => obj?.name === siteDetails?.district?.name || obj?.name === siteDetails?.district);
        setSelectedDistrict(districtObj);
  
        const updatedSiteDetails = {
          ...siteDetails,
          localityAreaType: areaTypeOptions?.find(
            (obj) => obj?.name === siteDetails?.localityAreaType?.name || obj?.name === siteDetails?.localityAreaType
          ),
          ulbName: ulbListOptions?.find((obj) => obj?.name === siteDetails?.ulbName?.name || obj?.name === siteDetails?.ulbName),
          roadType: roadTypeData?.find((obj) => obj?.name === siteDetails?.roadType?.name || obj?.name === siteDetails?.roadType),
          buildingStatus: buildingTypeData?.find((obj) => obj?.name === siteDetails?.buildingStatus?.name || obj?.name === siteDetails?.buildingStatus),
          isBasementAreaAvailable: options?.find(
            (obj) => obj?.code === siteDetails?.isBasementAreaAvailable?.code || obj?.code === siteDetails?.isBasementAreaAvailable
          ),
          district: districtObj,
          cluType: cluTypeOptions?.find((obj) => obj?.code === siteDetails?.cluType?.code || obj?.code === siteDetails?.cluType),
          // buildingCategory: buildingCategoryData?.find(
          //   (obj) => obj?.name === siteDetails?.buildingCategory?.name || obj?.name === siteDetails?.buildingCategory
          // ),
          isCluRequired: options?.find((obj) => obj?.code === siteDetails?.isCluRequired?.code || obj?.code === siteDetails?.isCluRequired),
          applicationAppliedUnder: applicationAppliedUnderOptions?.find((obj) => obj?.code === siteDetails?.applicationAppliedUnder?.code || obj?.code === siteDetails?.applicationAppliedUnder),
          vasikaDate: convertToISODate(siteDetails?.vasikaDate),
          // specificationBuildingCategory: buildingCategoryData.find((obj)=> obj.name === siteDetails?.specificationBuildingCategory?.name || obj.name === siteDetails?.specificationBuildingCategory || {}),
          // specificationLayoutType: layoutTypeData.find((obj)=> obj.name === siteDetails?.specificationLayoutType?.name || obj.name === siteDetails?.specificationLayoutType || {}),
          // specificationRestrictedArea: options.find((obj) => (obj.code === siteDetails?.specificationRestrictedArea?.code || obj.code === siteDetails?.specificationRestrictedArea || {})),
          // specificationIsSiteUnderMasterPlan: options.find((obj) => (obj.code === siteDetails?.specificationIsSiteUnderMasterPlan?.code || obj.code === siteDetails?.specificationIsSiteUnderMasterPlan || {})),
        };
        //console.log("Mapped site details for form:",siteDetails, updatedSiteDetails, buildingCategoryData);
  
        dispatch(UPDATE_LayoutNewApplication_FORM("applicationDetails", updatedApplicantDetails));
        dispatch(UPDATE_LayoutNewApplication_FORM("siteDetails", updatedSiteDetails));
        dispatch(UPDATE_LayoutNewApplication_FORM("documents", formattedDocuments));
        dispatch(
          UPDATE_LayoutNewApplication_FORM("apiData", {
            Layout: [layoutObject],
          })
        );
  
        // Map ALL owners array to applicants format for the form
        // Index 0 = primary owner (used by form but not displayed in UI)
        // Index 1+ = additional owners (displayed in UI)
        const ownersFromApi = layoutObject?.owners || [];
        //console.log("[EditLayoutApplication] ownersFromApi:", ownersFromApi);
        
        // Helper function to format DOB
        const formatDobToDate = (dob) => {
          if (!dob) return "";
          try {
            const dobDate = new Date(dob);
            if (isNaN(dobDate.getTime())) return "";
            const year = dobDate.getFullYear();
            const month = String(dobDate.getMonth() + 1).padStart(2, "0");
            const day = String(dobDate.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          } catch (e) {
            console.error("[EditLayoutApplication] Error formatting DOB:", dob, e);
            return "";
          }
        };
  
        // Map all owners including primary (index 0)
        const allApplicants = ownersFromApi?.filter((owner, index) => (index !== 0))?.map((owner) => {
          const genderObj = menu.find((g) => g.code === owner?.gender) || owner?.gender;
          const formattedDob = formatDobToDate(owner?.dob);
  
          return {
            name: owner?.name || "",
            fatherOrHusbandName: owner?.fatherOrHusbandName || "",
            mobileNumber: owner?.mobileNumber || "",
            emailId: owner?.emailId || "",
            address: owner?.permanentAddress || owner?.address || "",
            dob: formattedDob,
            gender: genderObj,
            panNumber: owner?.pan || "",
            photoUploadedFiles: owner?.additionalDetails?.ownerPhoto ,
            documentUploadedFiles: owner?.additionalDetails?.documentFile ,
            panDocumentUploadedFiles: owner?.additionalDetails?.panDocument,
            aplicantType: owner?.additionalDetails?.aplicantType,
            // Store original owner data for reference
            uuid: owner?.uuid || "",
            id: owner?.id || "",
          };
        });
  
        const applicantsForForm = allApplicants.length > 0 ? allApplicants : [];
  
        //console.log("[EditLayoutApplication] applicantsForForm mapped:", applicantsForForm);
        dispatch(UPDATE_LayoutNewApplication_FORM("applicants", applicantsForForm));
  
        // dispatch(UPDATE_LayoutNewApplication_FORM("apiData", {...applicationDetails, apiData: editApi?.Layout?.[0] || editApi})); // Store full response like CLU
      }
    }, [isLoading, isUlbListLoading, isGenderLoading, layoutObject, menu.length, isBuildingTypeLoading, isBuildingCategoryLoading, isRoadTypeLoading, isLayoutTypeLoading, isMdmsLoading]);

  // console.log("formStatePTR: ", formState);

  const setStep = (updatedStepNumber) => {
    dispatch(SET_LayoutNewApplication_STEP(updatedStepNumber));
  };

  useEffect(() => {
    dispatch(RESET_LayoutNewApplication_FORM());
  }, []);

  // console.log("formData",formData);

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [step]);


  const handleSubmit = (dataGet) => {
    //console.log("dataGet===", dataGet);
    //const data = { ...formData.employeeDetails, ...formData.administrativeDetails };
    // let data = {};
    // createEmployeeConfig.forEach((config) => {
    //   if (config.isStepEnabled) {
    //     data = { ...data, ...formData[config.key] };
    //   }
    // });
    // onSubmit(data, tenantId, setShowToast, history);
  };


  //console.log("  LayoutStepperForm - formData:", formData);
//console.log("  LayoutStepperForm - step:", step);
  return (
    <div className="card">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("Layout Application")}
      </CardHeader>
      <Stepper stepsList={updatedCreateEmployeeconfig} onSubmit={handleSubmit} step={step} setStep={setStep} formData={formData} />
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

export default LayoutStepperForm;
