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

const PlotDetails = ({ formData, onSelect, config, currentStepData}) => {
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
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const checkingFlow = formData?.uiFlow?.flow;
  const state = Digit.ULBService.getStateId();
  const [errors, setErrors] = useState({});
  const isMobile = window.Digit.Utils.browser.isMobile();

  const { data, isLoading } = Digit.Hooks.obps.useScrutinyDetails(state, formData?.data?.scrutinyNumber);

console.log("sessionStorageData",formData);

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


  const renderField = (label, value, setValue, errorKey, placeholder) => (
    <div style={{ marginBottom: "1rem" }}>
      <CardLabel>{label}</CardLabel>
      <TextInput value={value} placeholder={t(placeholder)} onChange={(e) => setValue(e.target.value)} />
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


    const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
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
    };

    console.log("Submitting form:", payload);
    onSelect(config.key, payload);
  }; 

  const onSkip = () => onSelect();

  if (isLoading) {
    return <Loader />;
  }

  const getDataDefaults = {
    khasraNumber: data?.planDetail?.planInfoProperties?.KHASRA_NO,
  };

  // const defaultValues = {
  //   ...getDataDefaults,
  //   architectid,
  //   ...formData?.data,
  // };




const handleChange = (name, value, validation) => {
  let error = "";

  if (validation?.required && !value.trim()) {
    error = validation.errorMessage || `${name} is required`;
  }

  if (!error && validation?.pattern && value) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      error = validation.errorMessage || validation.title;
    }
  }

  setErrors((prev) => ({ ...prev, [name]: error }));
};

// const configWithErrors = [
//       {
//         label: "BPA_BOUNDARY_LAND_REG_DETAIL_LABEL",
//         type: "text",
//         placeholder: "Give Land Registration Detail...", 
//         validation: {
//           required: true,
//           title: "Enter registration details",
//           errorMessage: "Registration details are required",
//         },
//         name: "registrationDetails",
//       },
//       {
//         label: "BPA_BOUNDARY_WALL_LENGTH_LABEL_INPUT",
//         type: "text",
//         placeholder: "Enter boundary wall length (in meters)", 
//         validation: {
//           required: true,
//           pattern: "^[0-9]*$",
//           title: "Enter boundary wall length in numbers [0-9]",
//           errorMessage: "Boundary wall length must be a number",
//         },
//         name: "boundaryWallLength",
//       },
//       {
//         label: "BPA_WARD_NUMBER_LABEL",
//         type: "text",
//         placeholder:"Ward Number",
//         validation: {
//           required: true,
//           pattern: "^[a-zA-Z0-9 -]+$",
//           title: "Enter alphanumeric ward number",
//           errorMessage: "Ward number must be alphanumeric",
//         },
//         name: "wardnumber",
//       },
//       {
//         label: "BPA_ZONE_NUMBER_LABEL",
//         type: "text",
//         placeholder:"Zone Number",
//         validation: {
//           required: true,
//           title: "Enter zone number",
//           errorMessage: "Zone number is required",
//         },
//         name: "zonenumber",
//       },
//       {
//         label: "BPA_KHASRA_NUMBER_LABEL",
//         type: "text",
//         validation: {
//           required: true,
//           title: "Enter khasra number",
//           errorMessage: "Khasra number is required",
//         },
//         name: "khasraNumber",
//         disable: true,
//       },
//       {
//         label: "BPA_ARCHITECT_ID",
//         type: "text",
        
//         validation: {
//           required: true,
//           title: "Enter architect ID",
//           errorMessage: "Architect ID is required",
//         },
//         name: "architectid",
//         disable: true,
//       },
//       {
//         label: "BPA_PROPERTY_UID",
//         type: "text",
//         placeholder:"Property UID",
//         validation: {
//           required: true,
//           title: "Enter property UID",
//           pattern: "^(?=.*[A-Za-z])[A-Za-z0-9-]+$",
//           errorMessage: "Property UID is required",
//         },
//         name: "propertyuid",
//       },
//       {
//         label: "BPA_NUMBER_OF_BATHS",
//         placeholder:"Number Of Bathrooms",
//         type: "text",
//         validation: {
//           required: true,
//           pattern: "^[0-9]+$",
//           title: "Enter number of baths in digits",
//           errorMessage: "Number of baths must be numeric",
//         },
//         name: "bathnumber",
//       },
//       {
//         label: "BPA_NUMBER_OF_KITCHENS",
//         placeholder:"Number Of Kitchens",
//         type: "text",
//         validation: {
//           required: true,
//           pattern: "^[0-9]+$",
//           title: "Enter number of kitchens in digits",
//           errorMessage: "Number of kitchens must be numeric",
//         },
//         name: "kitchenNumber",
//       },
//       {
//         label: "BPA_APPROX_INHABITANTS_FOR_ACCOMODATION",
//         type: "text",
//         placeholder:"Approx Number Of Inhabitants For Accomodation",
//         validation: {
//           required: true,
//           pattern: "^[0-9]+$",
//           title: "Enter number of approximate inhabitants",
//           errorMessage: "Approximate inhabitants must be numeric",
//         },
//         name: "approxinhabitants",
//       },
//       {
//         label: "BPA_DISTANCE_FROM_SEWER",
//         type: "text",
//         placeholder:"Distance From Sewer",
//         validation: {
//           required: true,
//           pattern: "^[0-9]+$",
//           title: "Enter distance from sewer in meters",
//           errorMessage: "Distance from sewer must be numeric",
//         },
//         name: "distancefromsewer",
//       },
//       {
//         label: "BPA_SOURCE_OF_WATER",
//         placeholder:"Source Of Water",
//         type: "text",
//         validation: {
//           required: true,
//           title: "Enter source of water",
//           errorMessage: "Source of water is required",
//         },
//         name: "sourceofwater",
//       },
//       {
//         label: "BPA_NUMBER_OF_WATER_CLOSETS",
//         type: "text",
//         placeholder:"Number Of Water Closets",
//         validation: {
//           required: true,
//           pattern: "^[0-9]+$",
//           title: "Enter number of water closets in digits",
//           errorMessage: "Number of water closets must be numeric",
//         },
//         name: "watercloset",
//       },
//       {
//         label: "BPA_MATERIAL_TO-BE_USED_IN_WALLS",
//         placeholder:"e.g. Cement, Bricks, etc",
//         type: "text",
//         validation: {
//           required: true,
//           pattern: "^[A-Za-z\\s]+$",
//           title: "Enter material used in walls (alphabets only)",
//           errorMessage: "Material used in walls must contain only letters",
//         },
//         name: "materialused",
//       },
//       {
//         label: "BPA_MATERIAL_TO-BE_USED_IN_FLOOR",
//          placeholder:"e.g. Cement, Bricks, etc",
//         type: "text",
//         validation: {
//           required: true,
//           pattern: "^[A-Za-z\\s]+$",
//           title: "Enter material used in floor (alphabets only)",
//           errorMessage: "Material used in floor must contain only letters",
//         },
//         name: "materialusedinfloor",
//       },
//       {
//         label: "BPA_MATERIAL_TO-BE_USED_IN_ROOFS",
//          placeholder:"e.g. Cement, Bricks, etc",
//         type: "text",
//         validation: {
//           required: true,
//           pattern: "^[A-Za-z\\s]+$",
//           title: "Enter material used in roofs (alphabets only)",
//           errorMessage: "Material used in roofs must contain only letters",
//         },
//         name: "materialusedinroofs",
//       },
//     ]



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
          {renderField(t("BPA_KHASRA_NUMBER_LABEL"), khasraNumber, setKhasraNumber, "khasraNumber", "Khasra Number")}
          {renderField(t("BPA_ARCHITECT_ID"), architectid, setArchitectId, "architectid", "Architect ID")}
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
            {<SubmitBar label={t(`CS_COMMON_NEXT`)} submit="submit" />}
          </ActionBar>
        </FormStep>
      </div>
    </div>
  );
};

export default PlotDetails;
