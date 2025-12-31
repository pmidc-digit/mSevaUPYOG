import {
  Card,
  CardLabel,
  CardCaption,
  TextInput,
  CardHeader,
  Label,
  StatusTable,
  Row,
  SubmitBar,
  Loader,
  FormStep,
  ActionBar,
  CardLabelError,
  Dropdown
} from "@mseva/digit-ui-react-components";
import React, { use, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Timeline from "../components/Timeline";
import { useForm, Controller } from "react-hook-form";
import { PropertySearch } from "./PropertySearch";
import { PropertySearchModal } from "./PropertySearchModal";
import { useDispatch, useSelector } from "react-redux";
import { RESET_OBPS_FORM, UPDATE_OBPS_FORM } from "../redux/actions/OBPSActions";
import { PropertySearchLudhiana } from "./PropertySearchLudhiana";
import { PropertySearchBathinda } from "./PropertySearchBathinda";
import { oldscrutinyDetailsData } from "../utils";

const PlotDetails = ({ formData, onSelect, config, currentStepData, onGoBack}) => {
  const isEditApplication = window.location.href.includes("editApplication");
  const [editConfig, setEditConfig] = useState(config);
  const { t } = useTranslation();
  const [registrationDetails, setRegistrationDetails] = useState("");
  const [boundaryWallLength, setBoundaryWallLength] = useState("");
  const [wardnumber, setWardNumber] = useState("");
  const [isClubbedPlot, setIsClubbedPlot] = useState({});
  const [isSelfCertification, setIsSelfCertification] = useState({}); //sSelfCertificationRequired
  const [isPropertyAvailable, setIsPropertyAvailable] = useState({});
  const [zonenumber, setZoneNumber] = useState("");
  const [khasraNumber, setKhasraNumber] = useState("");
  const [architectid, setArchitectId] = useState("");
  const [bathnumber, setBathNumber] = useState("");
  const [kitchenNumber, setKitchenNumber] = useState("");
  const [approxinhabitants, setApproxInhabitants] = useState("");
  const [distancefromsewer, setDistanceFromSewer] = useState("");
  const [sourceofwater, setSourceOfWater] = useState("");
  const [watercloset, setWaterCloset] = useState("");
  const [materialused, setMaterialUsed] = useState("");
  const [materialusedinfloor, setMaterialUsedInFloor] = useState("");
  const [materialusedinroofs, setMaterialUsedInRoofs] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [oldEDCR, setOldEDCR] = useState([]);
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const checkingFlow = formData?.uiFlow?.flow;
  const state = Digit.ULBService.getStateId();
  const [errors, setErrors] = useState({});
  const isMobile = window.Digit.Utils.browser.isMobile();
  const [apiLoading, setApiLoading] = useState(false);
  const tenantId = localStorage.getItem("CITIZEN.CITY")
  const userInfo = Digit.UserService.getUser();
  const uuid = userInfo?.info?.uuid;
  const isUserArchitect = userInfo?.info?.roles?.find((item) => item?.code === "BPA_ARCHITECT")
  const requestor = userInfo?.info?.mobileNumber;
  const queryObject = { 0: { tenantId: state }, 1: {mobileNumber: requestor} };
  const { data: LicenseData, isLoading: LicenseDataLoading } = Digit.Hooks.obps.useBPAREGSearch(isUserArchitect? "pb.punjab" : tenantId, {}, {mobileNumber: requestor}, {cacheTime : 0});
  const [approvedLicense, setApprovedLicense] = useState(null);
  const [ptLoading, setPtLoading] = useState(false);
  const [edcrLoading, setedcrLoading] = useState(false);
  const [showModal, setShowModal] = useState(false)
  const { data: menuList, isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "egov-location", [{ name: "TenantBoundary" }]);
  const { data: menuList2, isLoading: isLoading2 } = Digit.Hooks.useCustomMDMS(state, "tenant", [{name:"zoneMaster",filter: `$.[?(@.tanentId == '${tenantId}')]`}]);
  const { data: userDetails, isLoading: isUserLoading } = Digit.Hooks.useUserSearch(state, { uuid: [uuid] }, {}, { enabled: uuid ? true : false });
  const zonesOptions = menuList2?.tenant?.zoneMaster?.[0]?.zones || [];
  const dispatch = useDispatch();
  const LUDHIANA_TENANT = "pb.ludhiana";
  const BATHINDA_TENANT = "pb.bathinda";
  const common = [
    {
      code: "YES",
      i18nKey: "YES",
      value: true
    },
    {
      code: "NO",
      i18nKey: "NO",
      value: false
    },
  ]
  const { data: buildingHeightData, isLoading: isBuildingHeightLoading} =  Digit.Hooks.useCustomMDMS(tenantId, "BPA", [{ name: "BuildingHeight" }]);
  const inProgressEDCR = React.useRef(new Set());

  // const { data, isLoading } = Digit.Hooks.obps.useScrutinyDetails(state, formData?.data?.scrutinyNumber);
  const data = currentStepData?.BasicDetails?.edcrDetails;
  const { occupancyTypes, subOccupancyTypes, value: heightLimit} = buildingHeightData?.BPA?.BuildingHeight?.find(val => val.name === "SELF_CERTIFICATION") || {};
  const isSelfCertificationCondition = (occupancyTypes?.includes(data?.planDetail?.virtualBuilding?.occupancyTypes?.[0]?.type?.code)) && (subOccupancyTypes?.includes(data?.planDetail?.virtualBuilding?.occupancyTypes?.[0]?.subtype?.code)) && (data?.planDetail?.blocks?.[0]?.building?.buildingHeight < heightLimit);
  console.log("menuList2",currentStepData?.BasicDetails?.edcrDetails?.planDetail?.virtualBuilding) //buildingHeightData?.BPA?.BuildingHeight?.[0]?.value

console.log("sessionStorageData",currentStepData);

  const renderField = (label, value, setValue, errorKey, placeholder, isDisabled=false) =>  (
    
    <div>
      <CardLabel>{label}</CardLabel>
      <TextInput value={value} placeholder={t(placeholder)} onChange={(e) => setValue(e.target.value)} disable={isDisabled}/>
      {errors[errorKey] && (
        <CardLabelError >{errors[errorKey]}</CardLabelError>
      )}
    </div>
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth" // use "auto" for instant scroll
    });    
  }, [])

  useEffect(() => {
    if(!currentStepData?.cpt && currentStepData?.createdResponse?.additionalDetails?.propertyuid && tenantId !== LUDHIANA_TENANT){
      fetchPropertyDetails(currentStepData?.createdResponse?.additionalDetails?.propertyuid);
    }    
  }, [currentStepData]);

  useEffect(()=>{
    if(currentStepData?.BasicDetails && currentStepData?.createdResponse?.edcrNumber && currentStepData?.BasicDetails?.scrutinyNumber?.edcrNumber != currentStepData?.createdResponse?.edcrNumber && ((!currentStepData?.createdResponse?.additionalDetails?.oldEDCR) || (JSON.stringify(oldEDCR) === JSON.stringify(currentStepData?.createdResponse?.additionalDetails?.oldEDCR)))){
      addInPreviousEDCR(currentStepData?.createdResponse?.edcrNumber);
    }
  },[oldEDCR])

  async function fetchPropertyDetails(propertyId){
    try {
            const fetchedData = await Digit.PTService.search({
                tenantId, filters: {
                    propertyIds: propertyId
                }
            })
            console.log("fetchedData", fetchedData, propertyId);
            if (fetchedData?.Properties?.length > 0) {
                setPtLoading(false)
                dispatch(UPDATE_OBPS_FORM("cpt", {  details: fetchedData?.Properties?.[0], id: fetchedData?.Properties?.[0]?.propertyId }))
            }else{
                setPtLoading(false)
                return;
            }
        } catch (err) {
            setPtLoading(false)
            console.error("Error fetching property details:", err);
            return;
        }
  }

  // 

  // async function addInPreviousEDCR(oldEdcrNumber){
  //   const isEDCRPresent = oldEDCR?.find((val) => val?.edcrNumber === oldEdcrNumber);
  //   console.log("oldEDCR", oldEDCR, isEDCRPresent)
  //   if(isEDCRPresent?.edcrNumber){
  //     console.log("oldEDCR 1", oldEDCR, isEDCRPresent)
  //     return;
  //   }else{
  //     console.log("oldEDCR 2", oldEDCR, isEDCRPresent)
  //     try{
  //     setedcrLoading(true);
  //     const details = await oldscrutinyDetailsData(oldEdcrNumber, state);
  //     if (details?.type == "ERROR") {
  //       setedcrLoading(false);
  //     }
  //     if (details?.edcrNumber) {
  //       console.log("PREVIOUS_EDCR_DATA",details)
  //       const newEDCRObject = {
  //         appliactionType: details?.appliactionType,
  //         applicationDate: details?.applicationDate,
  //         edcrNumber: details?.edcrNumber,
  //         planReport: details?.planReport,
  //         status: details?.status
  //       }
  //       setOldEDCR((prev) => ([...prev, newEDCRObject]))
  //       setedcrLoading(false);
  //     }
  //   }catch(e){
  //     console.error(e);
  //     setedcrLoading(false);
  //   }
  //   }
  // }

  console.log("oldEDCR", oldEDCR)

  async function addInPreviousEDCR(oldEdcrNumber) {

    // 🔒 Prevent duplicate async calls
    if (inProgressEDCR.current.has(oldEdcrNumber)) {
      return;
    }

    // Mark as in-progress
    inProgressEDCR.current.add(oldEdcrNumber);

    const isEDCRPresent = oldEDCR?.find(
      (val) => val?.edcrNumber === oldEdcrNumber
    );

    if (isEDCRPresent?.edcrNumber) {
      inProgressEDCR.current.delete(oldEdcrNumber);
      return;
    }

    try {
      setedcrLoading(true);

      const details = await oldscrutinyDetailsData(oldEdcrNumber, state);

      if (details?.type === "ERROR") {
        return;
      }

      if (details?.edcrNumber) {
        const newEDCRObject = {
          appliactionType: details?.appliactionType,
          applicationDate: details?.applicationDate,
          edcrNumber: details?.edcrNumber,
          planReport: details?.planReport,
          status: details?.status
        };

        setOldEDCR(prev => {
          // Extra safety: avoid duplicate insert
          if (prev.some(e => e.edcrNumber === oldEdcrNumber)) return prev;
          return [...prev, newEDCRObject];
        });
      }

    } catch (e) {
      console.error(e);
    } finally {
      setedcrLoading(false);
      // Remove lock after completion
      inProgressEDCR.current.delete(oldEdcrNumber);
    }
  }

  
  useEffect(() => {
    if (isEditApplication) {
      const newConfig = {
        ...config,
        inputs: config.inputs.map((input) => {
          if (input.name === "boundaryWallLength") {
            return { ...input, disable: true };
          }
          return input;
        }),
      };
      setEditConfig(newConfig);
    }
  }, [checkingFlow, isEditApplication]);

  useEffect(() => {
      if(LicenseData){for (let i = 0; i < LicenseData?.Licenses?.length; i++) {
        if (LicenseData?.Licenses?.[i]?.status === "APPROVED") {
          setApprovedLicense(LicenseData?.Licenses?.[i]);
          break;
        }
      }}
  }, [LicenseData]);

  useEffect(() => {
        if (typeof isPropertyAvailable === "boolean") {
          const plan = common.find((item) => item.value === isPropertyAvailable);
          if (plan) setIsPropertyAvailable(plan);
        } else if (isPropertyAvailable === null) {
          if (currentStepData?.createdResponse?.additionalDetails?.isPropertyAvailable) {
            setIsPropertyAvailable(currentStepData?.createdResponse?.additionalDetails?.isPropertyAvailable);
          }
        }
  }, [isPropertyAvailable, currentStepData?.createdResponse?.additionalDetails?.isPropertyAvailable]);
  
  useEffect(() => {
        if (typeof isClubbedPlot === "boolean") {
          const plan = common.find((item) => item.value === isClubbedPlot);
          if (plan) setIsClubbedPlot(plan);
        } else if (isClubbedPlot === null) {
          if (currentStepData?.createdResponse?.additionalDetails?.isClubbedPlot) {
            setIsClubbedPlot(currentStepData?.createdResponse?.additionalDetails?.isClubbedPlot);
          }
        }
  }, [isClubbedPlot, currentStepData?.createdResponse?.additionalDetails?.isClubbedPlot]);
  
  useEffect(() => {
    if (buildingHeightData?.BPA?.BuildingHeight?.[0]?.value) {
      if (isSelfCertificationCondition) {
        if (typeof isSelfCertification === "boolean") {
          const plan = common.find((item) => item.value === isSelfCertification);
          if (plan) setIsSelfCertification(plan);
        } else if (isSelfCertification === null) {
          if (currentStepData?.createdResponse?.additionalDetails?.isSelfCertification) {
            setIsSelfCertification(currentStepData?.createdResponse?.additionalDetails?.isSelfCertification);
          } else {
            setIsSelfCertification(currentStepData?.createdResponse?.additionalDetails?.isSelfCertification);
          }
        }
      } else {
        if (typeof isSelfCertification === "boolean") {
          const plan = common.find((item) => item.value === isSelfCertification);
          if (plan) setIsSelfCertification(plan);
        } else if (isSelfCertification === null) {
          if (currentStepData?.createdResponse?.additionalDetails?.isSelfCertification) {
            setIsSelfCertification(currentStepData?.createdResponse?.additionalDetails?.isSelfCertification);
          } else {
            setIsSelfCertification(currentStepData?.createdResponse?.additionalDetails?.isSelfCertification);
          }
        } else if (!isSelfCertification?.code) {
          setIsSelfCertification(common?.[1])
        }
      }
    }
  }, [isSelfCertification, currentStepData?.createdResponse?.additionalDetails?.isSelfCertification, buildingHeightData]);

  // useEffect(() => {
  //   const userInfoString = window.localStorage.getItem("user-info");
  //   if (userInfoString) {
  //     try {
  //       const userInfo = JSON.parse(userInfoString);
  //       if (userInfo?.id) {
  //         setArchitectId(userInfo.id);
  //       }
  //     } catch (err) {
  //       console.error("Error parsing user-info from local storage", err);
  //     }
  //   }
  // }, []);

  useEffect(() => {
    if(typeof zonenumber === "string" && zonesOptions?.length > 0){
      const zone = zonesOptions.find((zone) => zone.code === zonenumber);
      if(zone){
        setZoneNumber(zone);
      }
    }else if(zonenumber === null){
      setZoneNumber(currentStepData?.createdResponse?.additionalDetails?.zonenumber || "");
    }
  }, [zonenumber, menuList2]);
  useEffect(() => {
    if (LicenseData) {
        if (LicenseData?.Licenses?.[0]?.tradeLicenseDetail) {
          const architectNo = (LicenseData?.Licenses?.find(item => item?.status === "APPROVED")?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo === null || LicenseData?.Licenses?.[0]?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo === "") ? LicenseData?.Licenses?.[0]?.licenseNumber : LicenseData?.Licenses?.[0]?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo;
          setArchitectId(architectNo);
        }
    }
  }, [LicenseData]);

  useEffect(()=>{
    if(data && data?.planDetail?.planInfoProperties?.KHASRA_NO){
      setKhasraNumber(data?.planDetail?.planInfoProperties?.KHASRA_NO);
    }
    if(data && data?.planDetail?.planInformation?.plotBndryWallLength && boundaryWallLength === ""){
      setBoundaryWallLength(data?.planDetail?.planInformation?.plotBndryWallLength?.toString());
    }
  },[currentStepData?.BasicDetails?.edcrDetails])

  useEffect(() => {
  if (currentStepData?.createdResponse?.additionalDetails) {
    const details = currentStepData.createdResponse.additionalDetails;

    setRegistrationDetails(details?.registrationDetails || "");
    setBoundaryWallLength(details?.boundaryWallLength || "");
    setWardNumber(details?.wardnumber || "");
    setIsClubbedPlot(details?.isClubbedPlot !== null ? details?.isClubbedPlot : {});
    setIsSelfCertification(details?.isSelfCertification !== null ? details?.isSelfCertification : true);
    setIsPropertyAvailable(details?.isPropertyAvailable !== null ? details?.isPropertyAvailable : {});
    setZoneNumber(details?.zonenumber || "");
    setKhasraNumber(details?.khasraNumber || "");
    setArchitectId(details?.architectid || "");
    setBathNumber(details?.bathnumber || "");
    setKitchenNumber(details?.kitchenNumber || "");
    setApproxInhabitants(details?.approxinhabitants || "");
    setDistanceFromSewer(details?.distancefromsewer || "");
    setSourceOfWater(details?.sourceofwater || "");
    setWaterCloset(details?.watercloset || "");
    setMaterialUsed(details?.materialused || "");
    setMaterialUsedInFloor(details?.materialusedinfloor || "");
    setMaterialUsedInRoofs(details?.materialusedinroofs || "");
    setEstimatedCost(details?.estimatedCost || "");
    if(oldEDCR?.length===0){
      setOldEDCR(details?.oldEDCR || []);
    }
    // setPropertyUid(details?.propertyuid || "");
  }
}, [currentStepData?.createdResponse]);

// useEffect(() => {
//   if (menuList && currentStepData?.cpt?.details?.address?.locality && !currentStepData?.createdResponse?.additionalDetails) {
//     const boundary = menuList?.["egov-location"]?.TenantBoundary?.find(item => item?.hierarchyType?.code === "REVENUE")?.boundary;
//     console.log("menuList", boundary);
//     let ward = {}
//     const zone = boundary?.children?.find(item => item?.children?.some((children) => {
//       if(children?.children?.some(child => child?.code === currentStepData?.cpt?.details?.address?.locality?.code)){
//         ward = children
//         return true
//       }else{
//         return false
//       }
//     }));
//     console.log("menuList zone", zone, ward)
//   }
// }, [menuList, currentStepData?.cpt?.details?.address?.locality]);

// useEffect(() => {
//   if (currentStepData?.cpt?.zonalMapping?.zone?.code && !currentStepData?.createdResponse?.additionalDetails?.zonenumber) {
//     setZoneNumber(currentStepData?.cpt?.zonalMapping?.zone?.code || "");
//   }else if(currentStepData?.cpt?.zonalMapping?.zone && typeof currentStepData?.cpt?.zonalMapping?.zone === "string" && !currentStepData?.createdResponse?.additionalDetails?.zonenumber) {
//     setZoneNumber(currentStepData?.cpt?.zonalMapping?.zone);
//   }
// }, [currentStepData?.cpt?.zonalMapping?.zone]);

useEffect(() => {
  if (currentStepData?.cpt?.zonalMapping?.ward) {
    setWardNumber(currentStepData?.cpt?.zonalMapping?.ward?.code || "");
  }
  if(currentStepData?.cpt?.details?.address && !currentStepData?.createdResponse?.additionalDetails?.registrationDetails && !registrationDetails){
    const { doorNo, plotNo, buildingName, street, city, district, state} = currentStepData?.cpt?.details?.address
    const address = [doorNo, plotNo, buildingName, street, city, district, state]?.filter(Boolean)?.join(" ,");
    if(address) setRegistrationDetails(address);
  }
}, [currentStepData?.cpt]);



  const validate = () => {
    const newErrors = {};

    if (!registrationDetails.trim()) {
      newErrors.registrationDetails = t("BPA_REGISTRATION_DETAILS_REQUIRED");
    }

    if (!isSelfCertification?.code && currentStepData?.BasicDetails?.edcrDetails?.planDetail?.blocks?.[0]?.building?.mostRestrictiveFarHelper?.type?.code?.includes("A")) {
      newErrors.isSelfCertification = t("BPA_IS_SELF_CERTIFICATION_REQUIRED_MESSAGE");
    }

    if(!isPropertyAvailable?.code){
      newErrors.isPropertyAvailable = t("BPA_IS_PROPERTY_AVAILABLE_REQUIRED");
    }
    
    if (!isClubbedPlot?.code) {
      newErrors.isClubbedPlot = t("BPA_IS_CLUBBED_PLOT_REQUIRED");
    }

    if (!boundaryWallLength) {
      newErrors.boundaryWallLength = t("BPA_BOUNDARY_WALL_LENGTH_REQUIRED");
    } else if (isNaN(boundaryWallLength)) {
      newErrors.boundaryWallLength = t("BPA_BOUNDARY_WALL_LENGTH_INVALID");
    }

    if (!wardnumber.trim()) {
      newErrors.wardnumber = t("BPA_WARD_NUMBER_REQUIRED");
    }

    if (!zonenumber?.code) {
      newErrors.zonenumber = t("BPA_ZONE_NUMBER_REQUIRED");
    }

    if (!khasraNumber.trim()) {
      newErrors.khasraNumber = t("BPA_KHASRA_NUMBER_REQUIRED");
    }

    if (!architectid) {
      newErrors.architectid = t("BPA_ARCHITECT_ID_REQUIRED");
    }

    if (isPropertyAvailable?.value) {
      if (!(currentStepData?.cpt?.id?.trim() || currentStepData?.cpt?.details?.propertyId?.trim())) {
        newErrors.propertyuid = t("BPA_PROPERTY_UID_REQUIRED");
      }
    }

    if (!bathnumber) {
      newErrors.bathnumber = t("BPA_BATH_NUMBER_REQUIRED");
    } else if (isNaN(bathnumber)) {
      newErrors.bathnumber = t("BPA_BATH_NUMBER_INVALID");
    }

    if (!kitchenNumber) {
      newErrors.kitchenNumber = t("BPA_KITCHEN_NUMBER_REQUIRED");
    } else if (isNaN(kitchenNumber)) {
      newErrors.kitchenNumber = t("BPA_KITCHEN_NUMBER_INVALID");
    }

    if (!approxinhabitants) {
      newErrors.approxinhabitants = t("BPA_APPROX_INHABITANTS_REQUIRED");
    } else if (isNaN(approxinhabitants)) {
      newErrors.approxinhabitants = t("BPA_APPROX_INHABITANTS_INVALID");
    }

    if (!distancefromsewer) {
      newErrors.distancefromsewer = t("BPA_DISTANCE_FROM_SEWER_REQUIRED");
    } else if (isNaN(distancefromsewer)) {
      newErrors.distancefromsewer = t("BPA_DISTANCE_FROM_SEWER_INVALID");
    }

    if (!sourceofwater.trim()) {
      newErrors.sourceofwater = t("BPA_SOURCE_OF_WATER_REQUIRED");
    }

    if (!watercloset.trim()) {
      newErrors.watercloset = t("BPA_WATER_CLOSET_REQUIRED");
    }

    if (!materialused.trim()) {
      newErrors.materialused = t("BPA_MATERIAL_USED_REQUIRED");
    }

    if (!materialusedinfloor.trim()) {
      newErrors.materialusedinfloor = t("BPA_MATERIAL_USED_IN_FLOOR_REQUIRED");
    }

    if (!materialusedinroofs.trim()) {
      newErrors.materialusedinroofs = t("BPA_MATERIAL_USED_IN_ROOFS_REQUIRED");
    }

    if (!estimatedCost.trim()) {
      newErrors.estimatedCost = t("BPA_ESTIMATED_COST_IS_REQUIRED");
    } else if (isNaN(estimatedCost)) {
      newErrors.estimatedCost = t("BPA_ESTIMATED_COST_INVALID");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


    const handleSubmit = async () => {
    if (!validate()) return;

    const userInfo = Digit.UserService.getUser()
    const isArchitect = userInfo?.info?.roles?.some((role) => role?.code?.includes("BPA_ARCHITECT"));
    const applicationType = data?.appliactionType || "";
    const serviceType = data?.applicationSubType || "";
    let architectName = sessionStorage.getItem("BPA_ARCHITECT_NAME")
    const typeOfArchitect = isArchitect ? "ARCHITECT" : userInfo?.info?.roles?.find(role => (role?.code?.includes("BPA") && role?.tenantId === tenantId))?.code?.split("_")?.[1] || "" // 
    if(architectName){
      architectName = JSON.parse(architectName)
    }
    let isSelfCertificationRequired = sessionStorage.getItem("isSelfCertificationRequired")
      if (isSelfCertificationRequired === "undefined" || isSelfCertificationRequired === null) {
        isSelfCertificationRequired = "false"
      }
    // const stakeholderName =  JSON.parse(sessionStorage.getItem("BPA_STAKEHOLDER_NAME")) || null;
    const stakeholderName =  userInfo?.info?.name || null;
    const stakeholderRegistrationNumber= JSON.parse(
        sessionStorage.getItem("BPA_STAKEHOLDER_REGISTRATION_NUMBER"),
      ) || null;
    const stakeholderAddress= userDetails?.user[0]?.correspondenceAddress || null;
    const stakeholderState = userDetails?.user[0]?.correspondenceState
    const stakeholderDistrict = userDetails?.user[0]?.correspondenceDistrict
    const architectMobileNumber = userInfo?.info?.mobileNumber || "";
    const propertyuid = currentStepData?.cpt?.details?.propertyId || currentStepData?.cpt?.id || currentStepData?.createdResponse?.additionalDetails?.propertyuid;
    const address = {
      ...currentStepData?.cpt?.details?.address,
      city: currentStepData?.cpt?.details?.address?.tenantId || currentStepData?.cpt?.details?.address?.city || "",
      id: null
    } || currentStepData?.createdResponse?.landInfo?.address || undefined;
    const ownershipCategory = currentStepData?.cpt?.details?.ownershipCategory || currentStepData?.createdResponse?.landInfo?.ownershipCategory || undefined;
    const owners = currentStepData?.cpt?.details?.owners?.map((data) => ({
      ...data,
      status: data?.status?.trim() === "ACTIVE"? true : false,
    })) || currentStepData?.createdResponse?.landInfo?.owners || undefined;
    const landInfo = {
      address,
      ownershipCategory,
      owners,
      tenantId,
      unit: []
    }
    const customSelfcertificationRequired = (data?.planDetail?.blocks?.[0]?.building?.buildingHeight < buildingHeightData?.BPA?.BuildingHeight?.[0]?.value)
    const farDetails = currentStepData?.BasicDetails?.edcrDetails?.planDetail?.farDetails;
    const roadType = currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInformation?.roadType;
    const additionalDetails = formData?.data?.applicationNo ? {
      ...currentStepData?.createdResponse?.additionalDetails,
      registrationDetails,
      boundaryWallLength,
      wardnumber,
      zonenumber: zonenumber?.code,
      khasraNumber,
      architectid,
      propertyuid: isPropertyAvailable?.value ? propertyuid : null,
      bathnumber,
      kitchenNumber,
      approxinhabitants,
      distancefromsewer,
      sourceofwater,
      watercloset,
      materialused,
      materialusedinfloor,
      materialusedinroofs,
      estimatedCost,
      area: data?.planDetail?.planInformation?.plotArea?.toString(),
      height: data?.planDetail?.blocks?.[0]?.building?.buildingHeight?.toString(),
      usage: data?.planDetail?.planInformation?.occupancy,
      builtUpArea: data?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea?.toString(),
      applicationType,
      serviceType,
      architectName,
      architectMobileNumber,
      typeOfArchitect,
      stakeholderName,
      stakeholderRegistrationNumber,
      stakeholderAddress,
      stakeholderState,
      stakeholderDistrict,
      isSelfCertificationRequired,
      architectPhoto: approvedLicense?.tradeLicenseDetail?.applicationDocuments?.find((item) => item?.documentType === "APPL.BPAREG_PASS_PORT_SIZE_PHOTO")?.fileStoreId || null,
      isClubbedPlot: isClubbedPlot?.value,
      isPropertyAvailable: isPropertyAvailable?.value,
      isSelfCertification: isSelfCertification?.value,
      categories: currentStepData?.BasicDetails?.edcrDetails?.planDetail?.virtualBuilding?.occupancyTypes?.[0]?.type?.code,
      subcategories: currentStepData?.BasicDetails?.edcrDetails?.planDetail?.virtualBuilding?.occupancyTypes?.[0]?.subtype?.code,
      categoriesName: currentStepData?.BasicDetails?.edcrDetails?.planDetail?.virtualBuilding?.occupancyTypes?.[0]?.type?.name,
      subcategoriesName: currentStepData?.BasicDetails?.edcrDetails?.planDetail?.virtualBuilding?.occupancyTypes?.[0]?.subtype?.name,
      oldEDCR
    } :{
      registrationDetails,
      boundaryWallLength,
      wardnumber,
      zonenumber: zonenumber?.code,
      khasraNumber,
      architectid,
      propertyuid: isPropertyAvailable?.value ? propertyuid : null,
      bathnumber,
      kitchenNumber,
      approxinhabitants,
      distancefromsewer,
      sourceofwater,
      watercloset,
      materialused,
      materialusedinfloor,
      materialusedinroofs,
      estimatedCost,
      stakeholderState,
      stakeholderDistrict,
      area: data?.planDetail?.planInformation?.plotArea?.toString(),
      height: data?.planDetail?.blocks?.[0]?.building?.buildingHeight?.toString(),
      usage: data?.planDetail?.planInformation?.occupancy,
      builtUpArea: data?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea?.toString(),
      applicationType,
      serviceType,
      architectName,
      architectMobileNumber,
      typeOfArchitect,
      stakeholderName,
      stakeholderRegistrationNumber,
      stakeholderAddress,
      isSelfCertificationRequired,
      architectPhoto: approvedLicense?.tradeLicenseDetail?.applicationDocuments?.find((item) => item?.documentType === "APPL.BPAREG_PASS_PORT_SIZE_PHOTO")?.fileStoreId || null,
      roadType,
      farDetails,
      isClubbedPlot: isClubbedPlot?.value,
      isPropertyAvailable: isPropertyAvailable?.value,
      isSelfCertification: isSelfCertification?.value,
      categories: currentStepData?.BasicDetails?.edcrDetails?.planDetail?.virtualBuilding?.occupancyTypes?.[0]?.type?.code,
      subcategories: currentStepData?.BasicDetails?.edcrDetails?.planDetail?.virtualBuilding?.occupancyTypes?.[0]?.subtype?.code,
      categoriesName: currentStepData?.BasicDetails?.edcrDetails?.planDetail?.virtualBuilding?.occupancyTypes?.[0]?.type?.name,
      subcategoriesName: currentStepData?.BasicDetails?.edcrDetails?.planDetail?.virtualBuilding?.occupancyTypes?.[0]?.subtype?.name,
      oldEDCR
    };
    const edcrNumber = data?.edcrNumber;
    const riskType = currentStepData?.BasicDetails?.riskType;
    // const tenantId = data?.tenantId;
    const accountId = userInfo?.info?.uuid
    const workflowAction = formData?.data?.applicationNo ? "SAVE_AS_DRAFT" : "INITIATE";

    console.log("Submitting form:", {BPA: {
      edcrNumber,
      riskType,
      applicationType,
      serviceType,
      tenantId,
      accountId,
      documents: [],
      additionalDetails,
      landInfo: null,
      workflow: {
        action: workflowAction,
        assignes: [accountId],
      }
    }});

    if(formData?.data?.applicationNo){
      console.log("UpdateAPIFlow") // Change to the update flow
      try{
        setApiLoading(true);
        const result = await Digit.OBPSService.update({ BPA: {
          ...currentStepData?.createdResponse,
          edcrNumber,
          riskType,
          applicationType,
          serviceType,
          additionalDetails,
          workflow: {
            action: workflowAction,
            assignes: [accountId]
          }
        } }, tenantId)
        if(result?.ResponseInfo?.status === "successful"){
          setApiLoading(false);
          onSelect("LicenseData",{...approvedLicense, landInfo});
        }else{
          alert(t("BPA_CREATE_APPLICATION_FAILED"));
          setApiLoading(false);
        }
      }catch(e){
        console.log("error", e);
        alert(t("BPA_CREATE_APPLICATION_FAILED"));
        setApiLoading(false);
      }
    }else{
      console.log("CreateFlow")
      try{
        setApiLoading(true);
        const result = await Digit.OBPSService.create({BPA: {
          edcrNumber,
          riskType,
          applicationType,
          serviceType,
          tenantId,
          accountId,
          documents: [],
          additionalDetails,
          // landInfo: currentStepData?.cpt?.details ? landInfo : null,
          landInfo: null,
          workflow: {
            action: workflowAction,
            assignes: [accountId]
          }
        }}, tenantId);
        if(result?.ResponseInfo?.status === "successful"){
        const newAppNo = result?.BPA?.[0]?.applicationNo;
        sessionStorage.setItem("Digit.BUILDING_PERMIT", JSON.stringify({
          value:{
            ...formData,
            data: {
              ...formData?.data,
              applicationNo: newAppNo
            }
          }
        }));
      setApiLoading(false);
      onSelect("LicenseData",{...approvedLicense, landInfo});
      }else{
        alert(t("BPA_CREATE_APPLICATION_FAILED"));
        setApiLoading(false);
      }
    }catch(e){
        console.log("error", e);
        if(e.response?.data?.Errors?.[0]?.code === "DUPLICATE EDCR"){
          alert(e.response?.data?.Errors?.[0]?.message);
          setApiLoading(false);
        }
        else if(e.response?.data?.Errors?.[0]?.code){
          alert(e.response?.data?.Errors?.[0]?.message);
          setApiLoading(false);
        }else{
        alert(t("BPA_CREATE_APPLICATION_FAILED"));
        setApiLoading(false);
        }
      }
    }
    // onSelect(config.key, payload);
  }; 

  const onSkip = () => onSelect();

  if (apiLoading || LicenseDataLoading || isLoading2 || edcrLoading || isBuildingHeightLoading) {
    return <Loader />;
  }

  function setClubbedPlot(option) {
    setIsClubbedPlot(option)
  }
  
  function setSelfCertificationRequired(option) {
    setIsSelfCertification(option)
  }

  function setProperyAvailable(option) {
    setIsPropertyAvailable(option)
  }

  function closeModal() {
    setShowModal(false)
  }

  console.log("currentStepData in plot details", currentStepData?.BasicDetails?.edcrDetails?.planDetail?.blocks?.[0]?.building?.mostRestrictiveFarHelper?.type?.code);



  return (
    <div>
      {/* {isMobile && <Timeline flow={checkingFlow === "OCBPA" ? "OCBPA" : ""} />} */}
      <div>
        <FormStep config={{ ...config, texts: {
          // headerCaption: "BPA_PLOT_DETAILS_TITLE",
          header: "BPA_PLOT_DETAILS_TITLE",cardText: "",skipText: null,} }}  onSelect={handleSubmit} childrenAtTheBottom={false} t={t}  onSkip={onSkip}>
          <StatusTable >
            <Row
              className="border-none"
              label={t(`BPA_BOUNDARY_PLOT_AREA_LABEL`)}
              text={data?.planDetail?.plot?.area ? `${data?.planDetail?.plot?.area} ${t(`BPA_SQ_MTRS_LABEL`)}` : "NA"}
            />
            <Row className="border-none" label={t(`BPA_PLOT_NUMBER_LABEL`)} text={data?.planDetail?.planInformation?.plotNo} />
            <Row className="border-none" label={t(`BPA_KHATHA_NUMBER_LABEL`)} text={data?.planDetail?.planInfoProperties?.KHATA_NO} />

            
          </StatusTable>

          <div style={{ marginTop: "1rem" }}>
            <CardLabel>{`${t("BPA_IS_PROPERTY_AVAILABLE_LABEL")} *`}</CardLabel>
            <Dropdown
              placeholder={t("IS_PROPERTY_AVAILABLE")}
              selected={isPropertyAvailable}
              select={setProperyAvailable}
              option={common}
              optionKey="i18nKey"
              t={t}
            />
          </div>
          {errors["isPropertyAvailable"] && (
            <CardLabelError style={{ fontSize: "12px", color: "red" }}>{errors["isPropertyAvailable"]}</CardLabelError>
          )}
          {(isPropertyAvailable?.value === false) && <CardLabelError style={{ fontSize: "12px", color: "black" }}>{t("NO_PROPERTY_AVAILABLE_DISCLAIMER")}</CardLabelError>}
          {tenantId === LUDHIANA_TENANT && <div>
            {isPropertyAvailable?.value && <PropertySearchLudhiana formData={currentStepData} setApiLoading={setPtLoading} menuList={menuList} />}            
            {errors["propertyuid"] && (
              <CardLabelError style={{ fontSize: "12px", color: "red" }}>{errors["propertyuid"]}</CardLabelError>
            )}
          </div>}
          {tenantId === BATHINDA_TENANT && <div>
            {isPropertyAvailable?.value && <PropertySearchBathinda formData={currentStepData} setApiLoading={setPtLoading} menuList={menuList} />}            
            {errors["propertyuid"] && (
              <CardLabelError style={{ fontSize: "12px", color: "red" }}>{errors["propertyuid"]}</CardLabelError>
            )}
          </div>}
          {(tenantId != LUDHIANA_TENANT) && (tenantId != BATHINDA_TENANT) && <div>
          {isPropertyAvailable?.value && <SubmitBar style={{marginBottom:"1rem"}} label={t("PT_SEARCH_PROPERTY")} onSubmit={() => {setShowModal(true)}} />}
          {showModal &&           
          <PropertySearchModal  closeModal={closeModal} formData={currentStepData} setApiLoading={setPtLoading} menuList={menuList}/>}

          {errors["propertyuid"] && (
          <CardLabelError>{errors["propertyuid"]}</CardLabelError>
          )}

          {isPropertyAvailable?.value &&(currentStepData?.createdResponse?.additionalDetails?.propertyuid || currentStepData?.cpt?.id) && <StatusTable style={{marginBottom:"1rem"}} >
            <Row
              className="border-none"
              label={t(`PROPERTY_ID`)}
              text={currentStepData?.cpt?.id || currentStepData?.createdResponse?.additionalDetails?.propertyuid || "NA"}
            />
          </StatusTable>}
          </div>}

          <CardLabel>{`${t("BPA_IS_CLUBBED_PLOT_LABEL")} *`}</CardLabel>
          <Dropdown
            placeholder={t("IS_CLUBBED_PLOT")}
            selected={isClubbedPlot}
            select={setClubbedPlot}//setClubbedPlot
            option={common}
            optionKey="i18nKey"
            t={t}
          />
          {errors["isClubbedPlot"] && (
            <CardLabelError>{errors["isClubbedPlot"]}</CardLabelError>
          )}
          
          {occupancyTypes.includes(currentStepData?.BasicDetails?.edcrDetails?.planDetail?.virtualBuilding?.occupancyTypes?.[0]?.type?.code) &&
            <React.Fragment>
              <CardLabel>{`${t("BPA_IS_SELF_CERTIFICATION_REQUIRED")} *`}</CardLabel>
              <Dropdown
                placeholder={t("BPA_IS_SELF_CERTIFICATION_REQUIRED")}
                selected={isSelfCertification}
                select={setSelfCertificationRequired}
                option={common}
                optionKey="i18nKey"
                t={t}
                disable={!isSelfCertificationCondition || currentStepData?.createdResponse?.applicationNo}
              />
            </React.Fragment>
          }
          {errors["isSelfCertification"] && (
            <CardLabelError style={{ fontSize: "12px", color: "red" }}>{errors["isSelfCertification"]}</CardLabelError>
          )}
            
          {renderField(t("BPA_BOUNDARY_LAND_REG_DETAIL_LABEL")+"*", registrationDetails, setRegistrationDetails, "registrationDetails", "Enter Proposed Site Address ...")}
          {renderField(t("BPA_BOUNDARY_WALL_LENGTH_LABEL_INPUT")+"*", boundaryWallLength, setBoundaryWallLength, "boundaryWallLength", "Enter boundary wall length (in meters)", data?.planDetail?.planInformation?.plotBndryWallLength)}
          {renderField(t("BPA_WARD_NUMBER_LABEL")+"*", wardnumber, setWardNumber, "wardnumber", "Ward Number", currentStepData?.cpt?.zonalMapping?.ward)}
          {/* {renderField(t("BPA_ZONE_NUMBER_LABEL")+"*", zonenumber, setZoneNumber, "zonenumber", "Zone Number" , currentStepData?.cpt?.zonalMapping?.zone)} */}
          <CardLabel>{`${t("BPA_ZONE_NUMBER_LABEL")} *`}</CardLabel>
          <Dropdown
            placeholder={t("BPA_ZONE_NUMBER_LABEL")}
            selected={zonenumber}
            select={setZoneNumber}//setClubbedPlot
            option={zonesOptions}
            optionKey="name"
            t={t}
          />
          {errors["zonenumber"] && (
            <CardLabelError style={{ fontSize: "12px", color: "red" }}>{errors["zonenumber"]}</CardLabelError>
          )}
          {renderField(t("BPA_KHASRA_NUMBER_LABEL")+"*", khasraNumber, setKhasraNumber, "khasraNumber", "Khasra Number", true)}
          {renderField(t("BPA_ARCHITECT_ID")+"*", architectid, setArchitectId, "architectid", "Architect ID", true)}
          {/* {renderField(t("BPA_PROPERTY_UID")+"*", propertyuid, setPropertyUid, "propertyuid", "Property UID")} */}
          {renderField(t("BPA_NUMBER_OF_BATHS")+"*", bathnumber, setBathNumber, "bathnumber", "Number of Bathrooms")}
          {renderField(t("BPA_NUMBER_OF_KITCHENS")+"*", kitchenNumber, setKitchenNumber, "kitchenNumber", "Number of Kitchens")}
          {renderField(t("BPA_APPROX_INHABITANTS_FOR_ACCOMODATION")+"*", approxinhabitants, setApproxInhabitants, "approxinhabitants", "Approximate inhabitants")}
          {renderField(t("BPA_DISTANCE_FROM_SEWER")+"*", distancefromsewer, setDistanceFromSewer, "distancefromsewer", "Distance from sewer (in meters)")}
          {renderField(t("BPA_SOURCE_OF_WATER")+"*", sourceofwater, setSourceOfWater, "sourceofwater", "Source of Water")}
          {renderField(t("BPA_NUMBER_OF_WATER_CLOSETS")+"*", watercloset, setWaterCloset, "watercloset", "Water Closet")}
          {renderField(t("BPA_MATERIAL_TO-BE_USED_IN_WALLS")+"*", materialused, setMaterialUsed, "materialused", "e.g. Cement, Bricks, etc")}
          {renderField(t("BPA_MATERIAL_TO-BE_USED_IN_FLOOR")+"*", materialusedinfloor, setMaterialUsedInFloor, "materialusedinfloor", "e.g. Cement, Bricks, etc")}
          {renderField(t("BPA_MATERIAL_TO-BE_USED_IN_ROOFS")+"*", materialusedinroofs, setMaterialUsedInRoofs, "materialusedinroofs", "e.g. Cement, Bricks, etc")}
          {renderField(t("BPA_ESTIMATED_COST_LABEL")+"*", estimatedCost, setEstimatedCost, "estimatedCost", "Please Provide Estimated Cost")}

          
          <ActionBar>
            <SubmitBar
                      label="Back"
                     
                      onSubmit={onGoBack}
            />
            {<SubmitBar label={t(`CS_COMMON_NEXT`)} onSubmit={handleSubmit} disabled={apiLoading || LicenseDataLoading || ptLoading || isLoading || isLoading2 || isUserLoading || isBuildingHeightLoading || edcrLoading} />}
          </ActionBar>
        </FormStep>
      </div>
    </div>
  );
};

export default PlotDetails;
