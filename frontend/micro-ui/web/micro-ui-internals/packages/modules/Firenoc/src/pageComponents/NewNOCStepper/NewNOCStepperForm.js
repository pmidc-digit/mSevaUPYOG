import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";

import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import {stepperConfig} from "../../config/Create/stepperConfig";
import {
  SET_NOCNewApplication_STEP, RESET_NOC_NEW_APPLICATION_FORM,
  UPDATE_NOCNewApplication_FORM, UPDATE_NOCNewApplication_CoOrdinates, UPDATE_NOC_OwnerIds, UPDATE_NOC_OwnerPhotos
} from "../../redux/action/NOCNewApplicationActions";
import { CardHeader, Toast, Loader } from "@mseva/digit-ui-react-components";
import { formatDateForInput } from "../../utils";

//Config for steps
const createEmployeeConfig = [
  {
    head: "NOC DETAILS",
    stepLabel: "NOC_NOC_DETAILS_HEADER",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "FIRENOCStepFormNocDetails",
    key: "nocDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "PROPERTY DETAILS",
    stepLabel: "NOC_PROPERTY_DETAILS",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "FIRENOCStepFormTwo",
    key: "siteDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "APPLICANT DETAILS",
    stepLabel: "NOC_APPLICANT_DETAILS",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "FIRENOCStepFormOne",
    key: "applicationDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "DOCUMENT DETAILS",
    stepLabel: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "FIRENOCStepFormThree",
    key: "documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "SUMMARY DETAILS",
    stepLabel: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 5,
    isStepEnabled: true,
    type: "component",
    component: "FIRENOCStepFormFour",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },
];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: stepperConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});


const NewNOCStepperForm = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.noc.NOCNewApplicationFormReducer);
  const formData = formState.formData;
  const step = formState.step;

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  let applicationNumber = queryParams.get("applicationNumber");
  if (!applicationNumber) {
    const pathParts = window.location.pathname.split("/new-application/");
    if (pathParts.length > 1 && pathParts[1]) {
      applicationNumber = decodeURIComponent(pathParts[1].split("?")[0]);
    }
  }
  let queryTenantId = queryParams.get("tenantId");
  if (!queryTenantId) {
    if (window.location.pathname.includes("employee")) {
      queryTenantId = window.localStorage.getItem("Employee.tenant-id");
    } else {
      queryTenantId = window.localStorage.getItem("CITIZEN.CITY");
    }
  }

  const [hydrated, setHydrated] = useState(false);

  const { isLoading, data: nocObject } = Digit.Hooks.firenoc.useFIRENOCApplicationDetails(
    {
      tenantId: queryTenantId,
      applicationNumber: applicationNumber,
    },
    { enabled: !!applicationNumber }
  );

  const applicationDetails = { FireNOCs: nocObject ? [nocObject] : [] };

  const fireNOCDetails = nocObject?.fireNOCDetails || {};
  const applicantDetails = fireNOCDetails?.applicantDetails || {};
  const address = fireNOCDetails?.propertyDetails?.address || {};
  const siteDetails = {
    doorHouseNo: address.doorNo || "",
    streetName: address.street || "",
    landmarkName: address.landmark || "",
    pincode: address.pincode || "",
    propertyId: fireNOCDetails?.propertyDetails?.propertyId || "",
  };
  const documents = nocObject?.documents || fireNOCDetails?.applicantDetails?.additionalDetail?.ownerAuditionalDetail?.documents || [];
  const coordinates = fireNOCDetails?.additionalDetail?.coordinates || {};
  const ownerPhotoList = fireNOCDetails?.additionalDetail?.ownerPhotos || [];
  const ownerIdList = fireNOCDetails?.additionalDetail?.ownerIds || [];

  const setStep = (updatedStepNumber) => {
    dispatch(SET_NOCNewApplication_STEP(updatedStepNumber));
  };

  const stateId = Digit.ULBService.getStateId();
  const { data: buildingType, isLoading: isBuildingTypeLoading } = Digit.Hooks.noc.useBuildingType(stateId, { enabled: !!applicationNumber });
  const { data: roadType, isLoading: isRoadTypeLoading } = Digit.Hooks.noc.useRoadType(stateId, { enabled: !!applicationNumber });
  const { data: buildingCategory, isLoading: isBuildingCategoryLoading } = Digit.Hooks.noc.useBuildingCategory(stateId, { enabled: !!applicationNumber });
  const { data: nocType, isLoading: isNocTypeLoading } = Digit.Hooks.noc.useNocType(stateId, { enabled: !!applicationNumber });
  const { data: ulbList, isLoading: isUlbListLoading } = Digit.Hooks.useTenants();
  const ulbListOptions = ulbList?.map((city) => ({
    ...city,
    displayName: t(city.i18nKey),
  }));

  const { data: zoneList, isLoading: isZoneListLoading } = Digit.Hooks.useCustomMDMS(
    stateId,
    "tenant",
    [{ name: "zoneMaster", filter: `$.[?(@.tanentId == '${queryTenantId}')]` }],
    { enabled: !!applicationNumber }
  );

  const { data: fireStationData, isLoading: isFireStationLoading } = Digit.Hooks.useCustomMDMS(
    stateId,
    "firenoc",
    [{ name: "FireStations" }],
    {
      select: (d) => d?.firenoc?.FireStations?.filter((s) => s.active) || [],
      enabled: !!applicationNumber,
    }
  );
  const fireStationOptions = fireStationData
    ?.filter((s) => s.tenantId === queryTenantId)
    ?.map((s) => ({ code: s.id, name: s.name || s.id })) || [];

  const ready =
    !!applicationNumber &&
    !isLoading &&
    !isBuildingTypeLoading &&
    !isZoneListLoading &&
    !isNocTypeLoading &&
    !isUlbListLoading &&
    !isFireStationLoading &&
    applicationDetails?.FireNOCs?.length > 0;

  useEffect(() => {
    if (!applicationNumber) {
      dispatch(RESET_NOC_NEW_APPLICATION_FORM());
      setHydrated(true);
      return () => {
        dispatch(RESET_NOC_NEW_APPLICATION_FORM());
      };
    }
  }, [applicationNumber]);

  useEffect(() => {
    if (ready) {
      dispatch(RESET_NOC_NEW_APPLICATION_FORM());
      const formattedDocuments = {
        documents: {
          documents: documents?.map((doc) => {
            const fileId = doc?.fileStoreId || doc?.filestoreId || doc?.documentUid || doc?.uuid || "";
            return {
              documentType: doc?.documentType || "",
              uuid: doc?.uuid || "",
              documentUid: fileId,
              documentAttachment: fileId,
              filestoreId: fileId,
              dropdown: doc?.dropdown || null,
            };
          }),
        },
      };

      Object.entries(coordinates).forEach(([key, value]) => {
        dispatch(UPDATE_NOCNewApplication_CoOrdinates(key, value));
      });

      dispatch(UPDATE_NOC_OwnerIds("ownerIdList", ownerIdList));
      dispatch(UPDATE_NOC_OwnerPhotos("ownerPhotoList", ownerPhotoList));

      const formattedOwners = fireNOCDetails?.applicantDetails?.owners?.map((owner) => ({
        mobileNumber: owner?.mobileNumber || "",
        name: owner?.name || "",
        gender: owner?.gender ? { code: owner.gender, i18nKey: `COMMON_GENDER_${owner.gender}` } : null,
        dateOfBirth: owner?.dob ? formatDateForInput(new Date(owner.dob)) : "",
        emailId: owner?.emailId || "",
        fatherOrHusbandName: owner?.fatherOrHusbandName || "",
        relationship: owner?.relationship ? { code: owner.relationship.toUpperCase(), i18nKey: `COMMON_RELATION_${owner.relationship.toUpperCase()}` } : null,
        panNo: owner?.pan || owner?.panNo || "",
        address: owner?.correspondenceAddress || "",
      })) || [];

      const ownerShipType = fireNOCDetails?.applicantDetails?.ownerShipType || "";
      const ownerShipMajorType = fireNOCDetails?.applicantDetails?.ownerShipMajorType || ownerShipType.split(".")[0];

      const updatedApplicantDetails = {
        applicantType: ownerShipMajorType ? {
          code: ownerShipMajorType,
          name: `COMMON_MASTERS_OWNERSHIPCATEGORY_${ownerShipMajorType}`,
          i18nKey: ownerShipMajorType,
        } : null,
        applicantSubtype: ownerShipType ? {
          code: ownerShipType,
          name: `COMMON_MASTERS_OWNERSHIPCATEGORY_${ownerShipType.replaceAll(".", "_")}`,
          i18nKey: ownerShipType,
        } : null,
        owners: formattedOwners,
      };

      const selectedCity = ulbListOptions?.find((obj) => obj.code === address?.city) || null;
      const selectedSubDistrictCity = ulbListOptions?.find((obj) => obj.code === address?.subDistrict) || null;
      const districtName = selectedCity ? {
        code: selectedCity?.city?.districtTenantCode,
        name: selectedCity?.city?.districtName || selectedCity?.city?.districtTenantCode,
      } : null;

      const mohallaCode = address?.locality?.code || (typeof address?.locality === "string" ? address?.locality : "") || (address?.areaType?.toUpperCase() !== "RURAL" ? address?.addressLine2 : "") || "";
      const cityNameCode = address?.city || "";
      const i18nkey = cityNameCode && mohallaCode ? `${cityNameCode.toUpperCase().split(".").join("_")}_REVENUE_${mohallaCode}` : "";
      const mohalla = mohallaCode ? {
        code: mohallaCode,
        name: address?.locality?.name || mohallaCode,
        i18nkey: i18nkey,
      } : null;

      const formattedBuildings = fireNOCDetails?.buildings?.map((b) => {
        const heightVal = b?.uoms?.find((u) => u.code === "HEIGHT_OF_BUILDING")?.value || "";
        const floorsVal = b?.uoms?.find((u) => u.code === "NO_OF_FLOORS")?.value || "";
        const basementsVal = b?.uoms?.find((u) => u.code === "NO_OF_BASEMENTS")?.value || "";
        const builtUpAreaVal = b?.uoms?.find((u) => u.code === "BUILTUP_AREA")?.value || "";
        return {
          buildingName: b?.name || "",
          buildingUsageType: b?.usageType ? { code: b.usageType, name: b.usageType } : null,
          buildingUsageSubType: b?.usageSubType ? { code: b.usageSubType, name: b.usageSubType } : null,
          noOfFloors: floorsVal ? { code: String(floorsVal), name: String(floorsVal) } : null,
          noOfBasements: basementsVal ? { code: String(basementsVal), name: String(basementsVal) } : { code: "0", name: "0" },
          heightOfBuilding: heightVal,
          landArea: b?.landArea || "",
          totalCoveredArea: b?.totalCoveredArea || "",
          parkingArea: b?.parkingArea || "",
          leftSurrounding: b?.leftSurrounding || "",
          rightSurrounding: b?.rightSurrounding || "",
          frontSurrounding: b?.frontSurrounding || "",
          backSurrounding: b?.backSurrounding || "",
          groundFloorBuiltupArea: builtUpAreaVal,
        };
      }) || [];

      const getAreaTypeObj = (areaTypeStr) => {
        if (!areaTypeStr) return null;
        const upper = areaTypeStr.toUpperCase();
        if (upper === "URBAN") return { code: "URBAN", name: "Urban" };
        if (upper === "RURAL") return { code: "RURAL", name: "Rural" };
        return { code: upper, name: areaTypeStr };
      };

      const updatedSiteDetails = {
        areaType: getAreaTypeObj(address?.areaType),
        districtName: districtName,
        cityName: selectedSubDistrictCity 
          ? { code: selectedSubDistrictCity.code, name: selectedSubDistrictCity.name || selectedSubDistrictCity.code } 
          : (selectedCity ? { code: selectedCity.code, name: selectedCity.name || selectedCity.code } : null),
        villageName: address?.areaType?.toUpperCase() === "RURAL" ? address?.addressLine2 : "",
        mohalla: mohalla,
        pincode: address?.pincode || "",
        doorHouseNo: address?.doorNo || "",
        streetName: address?.street || "",
        landmarkName: address?.landmark || "",
        propertyId: fireNOCDetails?.propertyDetails?.propertyId || fireNOCDetails?.propertyId || "",
        plotSurveyNo: address?.doorNo || "",
        geoLocation: fireNOCDetails?.propertyDetails?.geoLocation || 
                     (fireNOCDetails?.propertyDetails?.latitude && fireNOCDetails?.propertyDetails?.longitude ? { latitude: Number(fireNOCDetails.propertyDetails.latitude), longitude: Number(fireNOCDetails.propertyDetails.longitude) } : null) ||
                     (address?.latitude && address?.longitude ? { latitude: Number(address.latitude), longitude: Number(address.longitude) } : null) ||
                     (coordinates?.latitude && coordinates?.longitude ? { latitude: Number(coordinates.latitude), longitude: Number(coordinates.longitude) } : null) || null,
        fireStationId: fireNOCDetails?.firestationId || "",
        noOfBuildings: fireNOCDetails?.noOfBuildings || "SINGLE",
        buildings: formattedBuildings,
      };

      const updatedNocDetails = {
        fireNOCType: nocType?.find((obj) => obj.code === fireNOCDetails?.fireNOCType || obj.name === fireNOCDetails?.fireNOCType) || {
          code: fireNOCDetails?.fireNOCType,
          name: t(`NOC_${fireNOCDetails?.fireNOCType}`),
        },
        firestationId: fireStationOptions?.find((obj) => obj.code === fireNOCDetails?.firestationId) || {
          code: fireNOCDetails?.firestationId,
          name: fireNOCDetails?.firestationId,
        },
        provisionalNocNumber: fireNOCDetails?.provisionalNocNumber || "",
        oldFireNocNumber: fireNOCDetails?.oldFireNocNumber || "",
      };

      dispatch(UPDATE_NOCNewApplication_FORM("nocDetails", updatedNocDetails));
      dispatch(UPDATE_NOCNewApplication_FORM("applicationDetails", updatedApplicantDetails));
      dispatch(UPDATE_NOCNewApplication_FORM("siteDetails", updatedSiteDetails));
      dispatch(UPDATE_NOCNewApplication_FORM("documents", formattedDocuments));
      dispatch(UPDATE_NOCNewApplication_FORM("uploadedDocuments", { documents: formattedDocuments.documents.documents }));
      dispatch(UPDATE_NOCNewApplication_FORM("apiData", applicationDetails));

      if (nocObject?.applicationStatus === "INITIATED") {
        dispatch(SET_NOCNewApplication_STEP(4));
      }
      setHydrated(true);
    }
  }, [ready]);

  useEffect(() => {
    if (ready && !hydrated) {
      setHydrated(true);
    }
  }, [ready, hydrated]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleSubmit = (dataGet) => {};

  if (!!applicationNumber && (isLoading || !hydrated)) {
    return <div><Loader /></div>;
  }

  return (
    <div className="card">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("NOC_REGISTRATION_APPLICATION")}
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

export default NewNOCStepperForm;
