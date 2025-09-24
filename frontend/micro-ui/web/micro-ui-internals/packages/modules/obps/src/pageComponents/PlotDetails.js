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
  CardLabelError
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Timeline from "../components/Timeline";
import { useForm, Controller } from "react-hook-form";

const PlotDetails = ({ formData, onSelect, config, currentStepData, onGoBack}) => {
  const isEditApplication = window.location.href.includes("editApplication");
  const [editConfig, setEditConfig] = useState(config);
  const { t } = useTranslation();
  const [registrationDetails, setRegistrationDetails] = useState("");
  const [boundaryWallLength, setBoundaryWallLength] = useState("");
  const [wardnumber, setWardNumber] = useState("");
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
  const [propertyuid, setPropertyUid] = useState("");
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const checkingFlow = formData?.uiFlow?.flow;
  const state = Digit.ULBService.getStateId();
  const [errors, setErrors] = useState({});
  const isMobile = window.Digit.Utils.browser.isMobile();
  const [apiLoading, setApiLoading] = useState(false);
  const tenantId = localStorage.getItem("CITIZEN.CITY")

  // const { data, isLoading } = Digit.Hooks.obps.useScrutinyDetails(state, formData?.data?.scrutinyNumber);
  const data = currentStepData?.BasicDetails?.edcrDetails;

console.log("sessionStorageData",formData, data, currentStepData);

  // ---------------- UI Styles ----------------
  const pageStyle = {
    padding: "2rem",
    backgroundColor: "#f1f1f1ff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    paddingBottom: "5rem",
  };

  const labelFieldPairStyle = {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px dashed #e0e0e0",
    padding: "0.5rem 0",
    color: "#333",
  };


  const boldLabelStyle = { fontWeight: "bold", color: "#555" };


  const renderField = (label, value, setValue, errorKey, placeholder, isDisabled=false) => (
    <div style={{ marginBottom: "1rem" }}>
      <CardLabel>{label}</CardLabel>
      <TextInput value={value} placeholder={t(placeholder)} onChange={(e) => setValue(e.target.value)} disable={isDisabled}/>
      {errors[errorKey] && (
        <CardLabelError style={{ fontSize: "12px", color: "red" }}>{errors[errorKey]}</CardLabelError>
      )}
    </div>
  );


  
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
    const userInfoString = window.localStorage.getItem("user-info");
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        if (userInfo?.id) {
          setArchitectId(userInfo.id);
        }
      } catch (err) {
        console.error("Error parsing user-info from local storage", err);
      }
    }
  }, []);

  useEffect(()=>{
    if(data && data?.planDetail?.planInfoProperties?.KHASRA_NO){
      setKhasraNumber(data?.planDetail?.planInfoProperties?.KHASRA_NO);
    }
  },[currentStepData?.BasicDetails?.edcrDetails])

  useEffect(() => {
  if (currentStepData?.createdResponse?.additionalDetails) {
    const details = currentStepData.createdResponse.additionalDetails;

    setRegistrationDetails(details?.registrationDetails || "");
    setBoundaryWallLength(details?.boundaryWallLength || "");
    setWardNumber(details?.wardnumber || "");
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
    setPropertyUid(details?.propertyuid || "");
  }
}, [currentStepData?.createdResponse]);



  const validate = () => {
    const newErrors = {};

    if (!registrationDetails.trim()) {
      newErrors.registrationDetails = t("BPA_REGISTRATION_DETAILS_REQUIRED");
    }

    if (!boundaryWallLength) {
      newErrors.boundaryWallLength = t("BPA_BOUNDARY_WALL_LENGTH_REQUIRED");
    } else if (isNaN(boundaryWallLength)) {
      newErrors.boundaryWallLength = t("BPA_BOUNDARY_WALL_LENGTH_INVALID");
    }

    if (!wardnumber.trim()) {
      newErrors.wardnumber = t("BPA_WARD_NUMBER_REQUIRED");
    }

    if (!zonenumber.trim()) {
      newErrors.zonenumber = t("BPA_ZONE_NUMBER_REQUIRED");
    }

    if (!khasraNumber.trim()) {
      newErrors.khasraNumber = t("BPA_KHASRA_NUMBER_REQUIRED");
    }

    if (!architectid) {
      newErrors.architectid = t("BPA_ARCHITECT_ID_REQUIRED");
    }

    if (!propertyuid.trim()) {
      newErrors.propertyuid = t("BPA_PROPERTY_UID_REQUIRED");
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


    const handleSubmit = async () => {
    if (!validate()) return;

    const userInfo = Digit.UserService.getUser()
    const applicationType = data?.appliactionType || "";
    const serviceType = data?.applicationSubType || "";
    let architectName = sessionStorage.getItem("BPA_ARCHITECT_NAME")
    const typeOfArchitect = architectName ? JSON.parse(architectName) : "ARCHITECT"
    if(architectName){
      architectName = JSON.parse(architectName)
    }
    let isSelfCertificationRequired = sessionStorage.getItem("isSelfCertificationRequired")
      if (isSelfCertificationRequired === "undefined" || isSelfCertificationRequired === null) {
        isSelfCertificationRequired = "false"
      }
    const stakeholderName =  JSON.parse(sessionStorage.getItem("BPA_STAKEHOLDER_NAME")) || null;
    const stakeholderRegistrationNumber= JSON.parse(
        sessionStorage.getItem("BPA_STAKEHOLDER_REGISTRATION_NUMBER"),
      ) || null;
    const stakeholderAddress= JSON.parse(sessionStorage.getItem("BPA_STAKEHOLDER_ADDRESS")) || null;
    const architectMobileNumber = userInfo?.info?.mobileNumber || ""

    const additionalDetails = formData?.data?.applicationNo ? {
      ...currentStepData?.createdResponse?.additionalDetails,
      registrationDetails,
      boundaryWallLength,
      wardnumber,
      zonenumber,
      khasraNumber,
      architectid,
      propertyuid,
      bathnumber,
      kitchenNumber,
      approxinhabitants,
      distancefromsewer,
      sourceofwater,
      watercloset,
      materialused,
      materialusedinfloor,
      materialusedinroofs,
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
      isSelfCertificationRequired
    } :{
      registrationDetails,
      boundaryWallLength,
      wardnumber,
      zonenumber,
      khasraNumber,
      architectid,
      propertyuid,
      bathnumber,
      kitchenNumber,
      approxinhabitants,
      distancefromsewer,
      sourceofwater,
      watercloset,
      materialused,
      materialusedinfloor,
      materialusedinroofs,
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
      isSelfCertificationRequired
    };
    const edcrNumber = data?.edcrNumber;
    const riskType = data?.riskType || "LOW";
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
          additionalDetails,
          workflow: {
            action: workflowAction,
            assignes: [accountId]
          }
        } }, tenantId)
        if(result?.ResponseInfo?.status === "successful"){
          setApiLoading(false);
          onSelect("");
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
      onSelect("");
      }else{
        alert(t("BPA_CREATE_APPLICATION_FAILED"));
        setApiLoading(false);
      }
    }catch(e){
        console.log("error", e);
        alert(t("BPA_CREATE_APPLICATION_FAILED"));
        setApiLoading(false);
      }
    }
    // onSelect(config.key, payload);
  }; 

  const onSkip = () => onSelect();

  if (apiLoading) {
    return <Loader />;
  }




  return (
    <div>
      {isMobile && <Timeline flow={checkingFlow === "OCBPA" ? "OCBPA" : ""} />}
      <div style={{paddingBottom: isMobile ? "0px" : "8px"}}>
        <FormStep style={pageStyle}  onSelect={handleSubmit} childrenAtTheBottom={false} t={t}  onSkip={onSkip}>
          <StatusTable >
            <Row
              className="border-none"
              label={t(`BPA_BOUNDARY_PLOT_AREA_LABEL`)}
              text={data?.planDetail?.planInformation?.plotArea ? `${data?.planDetail?.planInformation?.plotArea} ${t(`BPA_SQ_MTRS_LABEL`)}` : "NA"}
            />
            <Row className="border-none" label={t(`BPA_PLOT_NUMBER_LABEL`)} text={data?.planDetail?.planInformation?.plotNo} />
            <Row className="border-none" label={t(`BPA_KHATHA_NUMBER_LABEL`)} text={data?.planDetail?.planInfoProperties?.KHATA_NO} />

            
          </StatusTable>

          {renderField(t("BPA_BOUNDARY_LAND_REG_DETAIL_LABEL"), registrationDetails, setRegistrationDetails, "registrationDetails", "Give Land Registration Detail...")}
          {renderField(t("BPA_BOUNDARY_WALL_LENGTH_LABEL_INPUT"), boundaryWallLength, setBoundaryWallLength, "boundaryWallLength", "Enter boundary wall length (in meters)")}
          {renderField(t("BPA_WARD_NUMBER_LABEL"), wardnumber, setWardNumber, "wardnumber", "Ward Number")}
          {renderField(t("BPA_ZONE_NUMBER_LABEL"), zonenumber, setZoneNumber, "zonenumber", "Zone Number")}
          {renderField(t("BPA_KHASRA_NUMBER_LABEL"), khasraNumber, setKhasraNumber, "khasraNumber", "Khasra Number", true)}
          {renderField(t("BPA_ARCHITECT_ID"), architectid, setArchitectId, "architectid", "Architect ID", true)}
          {renderField(t("BPA_PROPERTY_UID"), propertyuid, setPropertyUid, "propertyuid", "Property UID")}
          {renderField(t("BPA_NUMBER_OF_BATHS"), bathnumber, setBathNumber, "bathnumber", "Number of Bathrooms")}
          {renderField(t("BPA_NUMBER_OF_KITCHENS"), kitchenNumber, setKitchenNumber, "kitchenNumber", "Number of Kitchens")}
          {renderField(t("BPA_APPROX_INHABITANTS_FOR_ACCOMODATION"), approxinhabitants, setApproxInhabitants, "approxinhabitants", "Approximate inhabitants")}
          {renderField(t("BPA_DISTANCE_FROM_SEWER"), distancefromsewer, setDistanceFromSewer, "distancefromsewer", "Distance from sewer (in meters)")}
          {renderField(t("BPA_SOURCE_OF_WATER"), sourceofwater, setSourceOfWater, "sourceofwater", "Source of Water")}
          {renderField(t("BPA_NUMBER_OF_WATER_CLOSETS"), watercloset, setWaterCloset, "watercloset", "Water Closet")}
          {renderField(t("BPA_MATERIAL_TO-BE_USED_IN_WALLS"), materialused, setMaterialUsed, "materialused", "e.g. Cement, Bricks, etc")}
          {renderField(t("BPA_MATERIAL_TO-BE_USED_IN_FLOOR"), materialusedinfloor, setMaterialUsedInFloor, "materialusedinfloor", "e.g. Cement, Bricks, etc")}
          {renderField(t("BPA_MATERIAL_TO-BE_USED_IN_ROOFS"), materialusedinroofs, setMaterialUsedInRoofs, "materialusedinroofs", "e.g. Cement, Bricks, etc")}

          
          <ActionBar>
            <SubmitBar
                      label="Back"
                      style={{
                        border: "1px solid",
                        background: "transparent",
                        color: "#2947a3",
                        marginRight: "5px",
                      }}
                      onSubmit={onGoBack}
            />
            {<SubmitBar label={t(`CS_COMMON_NEXT`)} onSubmit={handleSubmit} disabled={apiLoading} />}
          </ActionBar>
        </FormStep>
      </div>
    </div>
  );
};

export default PlotDetails;
