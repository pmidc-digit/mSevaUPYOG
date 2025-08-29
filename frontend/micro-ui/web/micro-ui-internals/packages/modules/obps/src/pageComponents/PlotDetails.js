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
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Timeline from "../components/Timeline";

const PlotDetails = ({ formData, onSelect, config }) => {
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

  const { data, isLoading } = Digit.Hooks.obps.useScrutinyDetails(state, formData?.data?.scrutinyNumber);

  const validate = () => {
    let newErrors = {};

    editConfig?.inputs?.forEach((input) => {
      const value = formData?.data?.[input.name] || "";

      if (input.isMandatory && !value) {
        newErrors[input.name] = `${input.label} is required`;
      }

      if (input.type === "number" && value && isNaN(value)) {
        newErrors[input.name] = `${input.label} must be a valid number`;
      }

      if (input.name === "wardnumber" && value && !/^[a-zA-Z0-9]+$/.test(value)) {
        newErrors[input.name] = "Ward No must be alphanumeric";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (data) => {
    if (!validate()) return;
    onSelect(editConfig?.key, { ...data });
  };

  const onSkip = () => onSelect();

  if (isLoading) {
    return <Loader />;
  }

  const getDataDefaults = {
    khasraNumber: data?.planDetail?.planInfoProperties?.KHASRA_NO,
  };

  const defaultValues = {
    ...getDataDefaults,
    architectid,
    ...formData?.data,
  };



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



  return (
    <div>
      <Timeline flow={checkingFlow === "OCBPA" ? "OCBPA" : ""} />
      <div style={{ height: "80vh", overflow: "scroll" }}>
        <FormStep config={editConfig} onSelect={handleSubmit} childrenAtTheBottom={false} t={t} _defaultValues={defaultValues} onSkip={onSkip}>
          <StatusTable>
            <Row
              className="border-none"
              label={t(`BPA_BOUNDARY_PLOT_AREA_LABEL`)}
              text={data?.planDetail?.planInformation?.plotArea ? `${data?.planDetail?.planInformation?.plotArea} ${t(`BPA_SQ_MTRS_LABEL`)}` : "NA"}
            />
            <Row className="border-none" label={t(`BPA_PLOT_NUMBER_LABEL`)} text={data?.planDetail?.planInformation?.plotNo} />
            <Row className="border-none" label={t(`BPA_KHATHA_NUMBER_LABEL`)} text={data?.planDetail?.planInfoProperties?.KHATA_NO} />

            
          </StatusTable>
        </FormStep>
      </div>
    </div>
  );
};

export default PlotDetails;
