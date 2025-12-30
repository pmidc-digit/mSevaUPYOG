import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

import Stepper from "../../../../../react-components/src/customComponents/Stepper";

import { layoutStepperConfig } from "../../config/layoutStepperConfig";
import {
  SET_LayoutNewApplication_STEP,
  RESET_LAYOUT_NEW_APPLICATION_FORM,
  UPDATE_LayoutNewApplication_FORM,
  UPDATE_LayoutNewApplication_CoOrdinates,
} from "../../redux/actions/LayoutNewApplicationActions";

import { CardHeader, Toast, Loader } from "@mseva/digit-ui-react-components";

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

const updatedCreateEmployeeconfig = createEmployeeConfig?.map((item) => {
  return { ...item, currStepConfig: layoutStepperConfig?.filter((newConfigItem) => newConfigItem?.stepNumber === item?.stepNumber) };
});

const EditLayoutApplication = () => {
  const { id } = useParams();
  const history = window.history;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);

  const formState = useSelector((state) => state?.obps?.LayoutNewApplicationFormReducer);
  const formData = formState?.formData;
  const step = formState?.step;

  console.log("FORM DATA FOR EDIT", formState);

  let tenantId;
  if (window.location.pathname.includes("employee")) {
    tenantId = window.localStorage.getItem("Employee.tenant-id");
  } else {
    tenantId = window.localStorage.getItem("CITIZEN.CITY");
  }

  const { isLoading, data } = Digit?.Hooks?.obps?.useLayoutCitizenSearchApplication({ applicationNo: id }, tenantId);
  const applicationDetails = data?.resData;
  console.log("applicationDetails here==>", data);
  const layoutObject = data?.data?.[0]?.Applications;
  const applicantDetails = layoutObject?.layoutDetails?.additionalDetails?.applicationDetails || {};
  const siteDetails = layoutObject?.layoutDetails?.additionalDetails?.siteDetails || {};
  const coordinates = layoutObject?.layoutDetails?.additionalDetails?.coordinates || {};
  const documents = layoutObject?.documents || [];
  console.log(siteDetails, "SSSSS");
  const setStep = (updatedStepNumber) => {
    dispatch(SET_LayoutNewApplication_STEP(updatedStepNumber));
  };

  const stateId = Digit.ULBService.getStateId();

  const { data: buildingTypeData, isLoading: isBuildingTypeLoading } = Digit?.Hooks?.obps?.useLayoutBuildingType(stateId);
  const { data: buildingCategoryData, isLoading: isBuildingCategoryLoading } = Digit?.Hooks?.obps?.useLayoutBuildingCategory(stateId);
  const { data: roadTypeData, isLoading: isRoadTypeLoading } = Digit?.Hooks?.obps?.useLayoutRoadType(stateId);
  const { data: layoutTypeData, isLoading: isLayoutTypeLoading } = Digit?.Hooks?.obps?.useLayoutType(stateId);
  console.log(layoutTypeData, "LAYOUT TYPE");

  const { data: mdmsData, isLoading: isMdmsLoading } = Digit?.Hooks?.useCustomMDMS(stateId, "BPA", [{ name: "LayoutType" }]);
  const areaTypeOptions = mdmsData?.BPA?.LayoutType?.[0]?.areaType || [];

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

  useEffect(() => {
    console.log("[v0] Loading states:", {
      isLoading,
      isBuildingTypeLoading,
      isBuildingCategoryLoading,
      isRoadTypeLoading,
      isLayoutTypeLoading,
      isUlbListLoading,
      isMdmsLoading,
    });
    console.log("[v0] Data availability:", {
      hasLayoutObject: !!layoutObject?.layoutDetails,
      buildingTypeLength: buildingTypeData?.length || 0,
      buildingCategoryLength: buildingCategoryData?.length || 0,
      layoutTypeLength: layoutTypeData?.length || 0,
      roadTypeLength: roadTypeData?.length || 0,
      areaTypeLength: areaTypeOptions.length,
      menuLength: menu.length,
    });
  }, [isLoading, isBuildingTypeLoading, isBuildingCategoryLoading, isRoadTypeLoading, isLayoutTypeLoading, isUlbListLoading, isMdmsLoading]);

  // First useEffect: Handle zone updates only
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

  // useEffect(() => {
  //   const hasApiData = !isLoading && layoutObject?.layoutDetails && !isUlbListLoading && ulbList?.length > 0

  //   console.log("[v0] hasApiData check:", hasApiData, "isDataInitialized:", isDataInitialized.current)

  //   if (hasApiData && !isDataInitialized.current) {
  //     console.log("[v0] Initializing form data with API data...")
  //     console.log("[v0] buildingType:", buildingTypeData)
  //     console.log("[v0] buildingCategory:", buildingCategoryData)
  //     console.log("[v0] roadType:", roadTypeData)
  //     console.log("[v0] siteDetails:", siteDetails)

  //     isDataInitialized.current = true

  //     dispatch(RESET_LAYOUT_NEW_APPLICATION_FORM())

  //     const formattedDocuments = {
  //       documents: {
  //         documents: documents?.map((doc) => ({
  //           documentType: doc?.documentType || "",
  //           uuid: doc?.uuid || "",
  //           documentUid: doc?.documentUid || "",
  //           documentAttachment: doc?.documentAttachment || "",
  //           filestoreId: doc?.uuid || "",
  //         })),
  //       },
  //     }

  //     Object.entries(coordinates || {}).forEach(([key, value]) => {
  //       dispatch(UPDATE_LayoutNewApplication_CoOrdinates(key, value))
  //     })

  //     const updatedApplicantDetails = {
  //       ...applicantDetails,
  //       applicantGender: menu?.find(
  //         (obj) =>
  //           obj.code === applicantDetails?.applicantGender?.code || obj.code === applicantDetails?.applicantGender,
  //       ),
  //     }

  //     const districtObj = cities?.find((obj) => {
  //       const siteDistrictValue = siteDetails?.district?.name || siteDetails?.district
  //       console.log("[v0] Comparing district:", obj.name, "with", siteDistrictValue)
  //       return obj.name === siteDistrictValue || obj.code === siteDetails?.district?.code
  //     })
  //     console.log("[v0] Found districtObj:", districtObj)
  //     if (districtObj) setSelectedDistrict(districtObj)

  //     const ulbNameObj = ulbListOptions?.find((obj) => {
  //       const siteUlbValue = siteDetails?.ulbName?.name || siteDetails?.ulbName
  //       console.log("[v0] Comparing ulb:", obj.name, "with", siteUlbValue)
  //       return obj.name === siteUlbValue || obj.code === siteDetails?.ulbName?.code
  //     })
  //     console.log("[v0] Found ulbNameObj:", ulbNameObj)

  //     const buildingCategoryObj = buildingCategoryData?.find((obj) => {
  //       const siteCategoryValue = siteDetails?.buildingCategory?.name || siteDetails?.buildingCategory
  //       console.log("[v0] Comparing buildingCategory:", obj.name, "with", siteCategoryValue)
  //       return obj.name === siteCategoryValue || obj.code === siteDetails?.buildingCategory?.code
  //     })
  //     console.log("[v0] Found buildingCategoryObj:", buildingCategoryObj)

  //     const buildingStatusObj = buildingTypeData?.find((obj) => {
  //       const siteStatusValue = siteDetails?.buildingStatus?.name || siteDetails?.buildingStatus
  //       console.log("[v0] Comparing buildingStatus:", obj.name, "with", siteStatusValue)
  //       return obj.name === siteStatusValue || obj.code === siteDetails?.buildingStatus?.code
  //     })
  //     console.log("[v0] Found buildingStatusObj:", buildingStatusObj)

  //     const updatedSiteDetails = {
  //       ...siteDetails,
  //       localityAreaType:
  //         areaTypeOptions?.find(
  //           (obj) =>
  //             obj.name === siteDetails?.localityAreaType?.name ||
  //             obj.name === siteDetails?.localityAreaType ||
  //             obj.code === siteDetails?.localityAreaType?.code ||
  //             obj.code === siteDetails?.localityAreaType,
  //         ) || siteDetails?.localityAreaType,
  //       ulbName: ulbNameObj || siteDetails?.ulbName,
  //       roadType:
  //         roadTypeData?.find(
  //           (obj) =>
  //             obj.name === siteDetails?.roadType?.name ||
  //             obj.name === siteDetails?.roadType ||
  //             obj.code === siteDetails?.roadType?.code ||
  //             obj.code === siteDetails?.roadType,
  //         ) || siteDetails?.roadType,
  //       buildingStatus: buildingStatusObj || siteDetails?.buildingStatus,
  //       isBasementAreaAvailable: options?.find(
  //         (obj) =>
  //           obj.code === siteDetails?.isBasementAreaAvailable?.code ||
  //           obj.code === siteDetails?.isBasementAreaAvailable,
  //       ),
  //       district: districtObj || siteDetails?.district,
  //       buildingCategory: buildingCategoryObj || siteDetails?.buildingCategory,
  //       specificationBuildingCategory:
  //         buildingCategoryData?.find(
  //           (obj) =>
  //             obj.name === siteDetails?.specificationBuildingCategory?.name ||
  //             obj.name === siteDetails?.specificationBuildingCategory ||
  //             obj.code === siteDetails?.specificationBuildingCategory?.code ||
  //             obj.code === siteDetails?.specificationBuildingCategory,
  //         ) || siteDetails?.specificationBuildingCategory,
  //       specificationLayoutType:
  //         layoutTypeData?.find(
  //           (obj) =>
  //             obj.name === siteDetails?.specificationLayoutType?.name ||
  //             obj.name === siteDetails?.specificationLayoutType ||
  //             obj.code === siteDetails?.specificationLayoutType?.code ||
  //             obj.code === siteDetails?.specificationLayoutType,
  //         ) || siteDetails?.specificationLayoutType,
  //       specificationRestrictedArea: options?.find(
  //         (obj) =>
  //           obj.code === siteDetails?.specificationRestrictedArea?.code ||
  //           obj.code === siteDetails?.specificationRestrictedArea,
  //       ),
  //       specificationIsSiteUnderMasterPlan: options?.find(
  //         (obj) =>
  //           obj.code === siteDetails?.specificationIsSiteUnderMasterPlan?.code ||
  //           obj.code === siteDetails?.specificationIsSiteUnderMasterPlan,
  //       ),
  //     }

  //     console.log("[v0] Updated siteDetails:", updatedSiteDetails)

  //     dispatch(UPDATE_LayoutNewApplication_FORM("applicationDetails", updatedApplicantDetails))
  //     dispatch(UPDATE_LayoutNewApplication_FORM("siteDetails", updatedSiteDetails))
  //     dispatch(UPDATE_LayoutNewApplication_FORM("documents", formattedDocuments))
  //     dispatch(UPDATE_LayoutNewApplication_FORM("apiData", layoutObject))

  //     console.log("[v0] Form data initialized successfully")
  //   }
  // }, [isLoading, isUlbListLoading, layoutObject, cities, ulbList, buildingTypeData, buildingCategoryData, roadTypeData])

  // <CHANGE> Simplify useEffect - remove the ref and complex initialization
  useEffect(() => {
    // Reset form only once when component mounts
    if (!hasResetForm.current) {
      dispatch(RESET_LAYOUT_NEW_APPLICATION_FORM());
      hasResetForm.current = true;
    }
    
    // Wait for all required data to be loaded including gender data
    // Also prevent re-initialization
    if (!isLoading && layoutObject?.layoutDetails && !isUlbListLoading && !isGenderLoading && menu.length > 0 && !isDataInitialized.current) {
      isDataInitialized.current = true;
      console.log("[EditLayoutApplication] Initializing form data with menu:", menu);
      
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

      Object.entries(coordinates).forEach(([key, value]) => {
        dispatch(UPDATE_LayoutNewApplication_CoOrdinates(key, value));
      });

      const updatedApplicantDetails = {
        ...applicantDetails,
        applicantGender: menu.find((obj) => obj.code === applicantDetails?.applicantGender?.code || obj.code === applicantDetails?.applicantGender),
      };

      const districtObj = cities.find((obj) => obj.name === siteDetails?.district?.name || obj.name === siteDetails?.district);
      setSelectedDistrict(districtObj);

      const updatedSiteDetails = {
        ...siteDetails,
        localityAreaType: areaTypeOptions.find(
          (obj) => obj.name === siteDetails?.localityAreaType?.name || obj.name === siteDetails?.localityAreaType
        ),
        ulbName: ulbListOptions.find((obj) => obj.name === siteDetails?.ulbName?.name || obj.name === siteDetails?.ulbName),
        roadType: roadTypeData.find((obj) => obj.name === siteDetails?.roadType?.name || obj.name === siteDetails?.roadType),
        buildingStatus: buildingTypeData.find((obj) => obj.name === siteDetails?.buildingStatus?.name || obj.name === siteDetails?.buildingStatus),
        isBasementAreaAvailable: options.find(
          (obj) => obj.code === siteDetails?.isBasementAreaAvailable?.code || obj.code === siteDetails?.isBasementAreaAvailable
        ),
        district: districtObj,
        buildingCategory: buildingCategoryData.find(
          (obj) => obj.name === siteDetails?.buildingCategory?.name || obj.name === siteDetails?.buildingCategory
        ),
        // specificationBuildingCategory: buildingCategoryData.find((obj)=> obj.name === siteDetails?.specificationBuildingCategory?.name || obj.name === siteDetails?.specificationBuildingCategory || {}),
        // specificationLayoutType: layoutTypeData.find((obj)=> obj.name === siteDetails?.specificationLayoutType?.name || obj.name === siteDetails?.specificationLayoutType || {}),
        // specificationRestrictedArea: options.find((obj) => (obj.code === siteDetails?.specificationRestrictedArea?.code || obj.code === siteDetails?.specificationRestrictedArea || {})),
        // specificationIsSiteUnderMasterPlan: options.find((obj) => (obj.code === siteDetails?.specificationIsSiteUnderMasterPlan?.code || obj.code === siteDetails?.specificationIsSiteUnderMasterPlan || {})),
      };

      dispatch(UPDATE_LayoutNewApplication_FORM("applicationDetails", updatedApplicantDetails));
      dispatch(UPDATE_LayoutNewApplication_FORM("siteDetails", updatedSiteDetails));
      dispatch(UPDATE_LayoutNewApplication_FORM("documents", formattedDocuments));
      dispatch(
        UPDATE_LayoutNewApplication_FORM("apiData", {
          Layout: [layoutObject],
        })
      );

      // Map owners array to applicants format for the form (skip first owner as it's the primary applicant)
      const ownersFromApi = layoutObject?.owners || [];
      console.log("[EditLayoutApplication] ownersFromApi:", ownersFromApi);
      
      if (ownersFromApi.length > 1) {
        // Map additional owners (skip index 0 as it's the primary owner already in applicationDetails)
        const additionalApplicants = ownersFromApi.slice(1).map((owner) => {
          // Convert timestamp to YYYY-MM-DD format for date input
          let formattedDob = "";
          if (owner?.dob) {
            const dobDate = new Date(owner.dob);
            const year = dobDate.getFullYear();
            const month = String(dobDate.getMonth() + 1).padStart(2, "0");
            const day = String(dobDate.getDate()).padStart(2, "0");
            formattedDob = `${year}-${month}-${day}`;
          }

          // Map gender to the dropdown format
          const genderObj = menu.find((g) => g.code === owner?.gender) || owner?.gender;

          return {
            name: owner?.name || "",
            fatherOrHusbandName: owner?.fatherOrHusbandName || "",
            mobileNumber: owner?.mobileNumber || "",
            emailId: owner?.emailId || "",
            address: owner?.permanentAddress || "",
            dob: formattedDob,
            gender: genderObj,
            // Store original owner data for reference
            uuid: owner?.uuid || "",
            id: owner?.id || "",
          };
        });

        // Keep the first empty placeholder at index 0, then add additional applicants
        // This is because the render logic in LayoutApplicantDetails skips index 0 (index > 0)
        const emptyPlaceholder = {
          name: "",
          fatherOrHusbandName: "",
          mobileNumber: "",
          emailId: "",
          address: "",
          dob: "",
          gender: "",
        };

        console.log("[EditLayoutApplication] additionalApplicants mapped:", additionalApplicants);
        // Dispatch additional applicants to Redux with empty placeholder at index 0
        dispatch(UPDATE_LayoutNewApplication_FORM("applicants", [emptyPlaceholder, ...additionalApplicants]));
      }

      // dispatch(UPDATE_LayoutNewApplication_FORM("apiData", {...applicationDetails, apiData: editApi?.Layout?.[0] || editApi})); // Store full response like CLU
    }
  }, [isLoading, isUlbListLoading, isGenderLoading, layoutObject, menu.length]); // Wait for all data to load

  const handleSubmit = (dataGet) => {};

  if (isLoading || !formData?.applicationDetails) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="card">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("Layout Application")}
      </CardHeader>
      <Stepper stepsList={updatedCreateEmployeeconfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
      {showToast && (
        <Toast
          error={showToast.key}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
          isDeleteBtn={"true"}
        />
      )}
    </div>
  );
};

export default EditLayoutApplication;
