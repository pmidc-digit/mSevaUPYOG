// import {
//   Card,
//   CardLabel,
//   CardCaption,
//   TextInput,
//   CardHeader,
//   Label,
//   StatusTable,
//   Row,
//   SubmitBar,
//   Loader,
//   FormStep,
// } from "@mseva/digit-ui-react-components";
// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import Timeline from "../components/Timeline";

// const PlotDetails = ({ formData, onSelect, config }) => {
//   const isEditApplication = window.location.href.includes("editApplication");
//   const [editConfig, setEditConfig] = useState(config);
//   const { t } = useTranslation();
//   const [registrationDetails, setRegistrationDetails] = useState("");
//   const [boundaryWallLength, setBoundaryWallLength] = useState("");
//   const [wardnumber, setWardNumber] = useState("");
//   const [zonenumber, setZoneNumber] = useState("");
//   const [khasraNumber, setKhasraNumber] = useState("");
//   const [architectid, setArchitectId] = useState("");
//   const [bathnumber, setBathNumber] = useState("");
//   const [kitchenNumber, setKitchenNumber] = useState("");
//   const [approxinhabitants, setApproxInhabitants] = useState("");
//   const [distancefromsewer, setDistanceFromSewer] = useState("");
//   const [sourceofwater, setSourceOfWater] = useState("");
//   const [watercloset, setWaterCloset] = useState("");
//   const [materialused, setMaterialUsed] = useState("");
//   const [materialusedinfloor, setMaterialUsedInFloor] = useState("");
//   const [materialusedinroofs, setMaterialUsedInRoofs] = useState("");
//   const [propertyuid, setPropertyUid] = useState("");
//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const checkingFlow = formData?.uiFlow?.flow;
//   const state = Digit.ULBService.getStateId();
//   const [errors, setErrors] = useState({});

  
//   useEffect(() => {
//     if (isEditApplication) {
//       const newConfig = {
//         ...config,
//         inputs: config.inputs.map((input) => {
//           if (input.name === "boundaryWallLength") {
//             return { ...input, disable: true };
//           }
//           return input;
//         }),
//       };
//       setEditConfig(newConfig);
//     }
//   }, [checkingFlow, isEditApplication]);

//   useEffect(() => {
//     const userInfoString = window.localStorage.getItem("user-info");
//     if (userInfoString) {
//       try {
//         const userInfo = JSON.parse(userInfoString);
//         if (userInfo?.id) {
//           setArchitectId(userInfo.id);
//         }
//       } catch (err) {
//         console.error("Error parsing user-info from local storage", err);
//       }
//     }
//   }, []);

//   const { data, isLoading } = Digit.Hooks.obps.useScrutinyDetails(state, formData?.data?.scrutinyNumber);

//   const validate = () => {
//     let newErrors = {};

//     editConfig?.inputs?.forEach((input) => {
//       const value = formData?.data?.[input.name] || "";

//       if (input.isMandatory && !value) {
//         newErrors[input.name] = `${input.label} is required`;
//       }

//       if (input.type === "number" && value && isNaN(value)) {
//         newErrors[input.name] = `${input.label} must be a valid number`;
//       }

//       if (input.name === "wardnumber" && value && !/^[a-zA-Z0-9]+$/.test(value)) {
//         newErrors[input.name] = "Ward No must be alphanumeric";
//       }
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (data) => {
//     if (!validate()) return;
//     onSelect(editConfig?.key, { ...data });
//   };

//   const onSkip = () => onSelect();

//   if (isLoading) {
//     return <Loader />;
//   }

//   const getDataDefaults = {
//     khasraNumber: data?.planDetail?.planInfoProperties?.KHASRA_NO,
//   };

//   const defaultValues = {
//     ...getDataDefaults,
//     architectid,
//     ...formData?.data,
//   };



// const handleChange = (name, value, validation) => {
//   let error = "";

//   if (validation?.required && !value.trim()) {
//     error = validation.errorMessage || `${name} is required`;
//   }

//   if (!error && validation?.pattern && value) {
//     const regex = new RegExp(validation.pattern);
//     if (!regex.test(value)) {
//       error = validation.errorMessage || validation.title;
//     }
//   }

//   setErrors((prev) => ({ ...prev, [name]: error }));
// };

// const configWithErrors = {
//     ...editConfig,
//     inputs: editConfig.inputs.map((input) => ({
//       ...input,
//       customJSX: (
//         <React.Fragment>
//           {errors[input.name] && (
//             <p style={{ color: "red", fontSize: "14px", marginTop: "4px" }}>
//               {errors[input.name]}
//             </p>
//           )}
//         </React.Fragment>
//       ),
//       onChange: (e) => handleChange(input.name, e.target.value, input.validation),
//     })),
//   };



//   return (

//         <FormStep  config={configWithErrors} onSelect={handleSubmit} childrenAtTheBottom={false} t={t} _defaultValues={defaultValues} onSkip={onSkip}>
//           <StatusTable>
//             <Row
//               className="border-none"
//               label={t(`BPA_BOUNDARY_PLOT_AREA_LABEL`)}
//               text={data?.planDetail?.planInformation?.plotArea ? `${data?.planDetail?.planInformation?.plotArea} ${t(`BPA_SQ_MTRS_LABEL`)}` : "NA"}
//             />
//             <Row className="border-none" label={t(`BPA_PLOT_NUMBER_LABEL`)} text={data?.planDetail?.planInformation?.plotNo} />
//             <Row className="border-none" label={t(`BPA_KHATHA_NUMBER_LABEL`)} text={data?.planDetail?.planInfoProperties?.KHATA_NO} />

           
//           </StatusTable>
//         </FormStep>

//   );
// };

// export default PlotDetails;

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

// const STORAGE_KEY = "BUILDING_PERMIT";



// const PlotDetails = ({ formData, onSelect, config }) => {
//   const isEditApplication = window.location.href.includes("editApplication");
//   const [editConfig, setEditConfig] = useState(config);
//   const { t } = useTranslation();

//   const [errors, setErrors] = useState({});
//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const checkingFlow = formData?.uiFlow?.flow;
//   const state = Digit.ULBService.getStateId();

// const STORAGE_KEY = `BUILDING_PERMIT_${formData?.data?.applicationNo || "NEW"}`;
//   const { data, isLoading } = Digit.Hooks.obps.useScrutinyDetails(
//     state,
//     formData?.data?.scrutinyNumber
//   );


//   const [architectid, setArchitectId] = useState("");

//   useEffect(() => {
//   if (!formData?.data?.applicationNo) {
//     sessionStorage.removeItem(`BUILDING_PERMIT_NEW`);
//   }
// }, [formData?.data?.applicationNo]);


//   useEffect(() => {
//     const userInfoString = window.localStorage.getItem("user-info");
//     if (userInfoString) {
//       try {
//         const userInfo = JSON.parse(userInfoString);
//         if (userInfo?.id) {
//           setArchitectId(userInfo.id);
//         }
//       } catch (err) {
//         console.error("Error parsing user-info from local storage", err);
//       }
//     }
//   }, []);

//   // ✅ Disable inputs in edit mode
//   useEffect(() => {
//     if (isEditApplication) {
//       const newConfig = {
//         ...config,
//         inputs: config.inputs.map((input) =>
//           input.name === "boundaryWallLength"
//             ? { ...input, disable: true }
//             : input
//         ),
//       };
//       setEditConfig(newConfig);
//     }
//   }, [checkingFlow, isEditApplication]);

//   // ✅ Load saved session storage data
//   const getStoredData = () => {
//     try {
//       const stored = sessionStorage.getItem(STORAGE_KEY);
//       return stored ? JSON.parse(stored) : {};
//     } catch {
//       return {};
//     }
//   };

//   // ✅ Prefill values from API + sessionStorage + formData
//   const getDataDefaults = {
//     khasraNumber: data?.planDetail?.planInfoProperties?.KHASRA_NO,
//   };

//   const defaultValues = {
//     ...getDataDefaults,
//     architectid,
//     ...formData?.data,
//     ...getStoredData(),
//   };

//   // ✅ Validation
//   const validate = () => {
//     let newErrors = {};
//     editConfig?.inputs?.forEach((input) => {
//       const value = defaultValues?.[input.name] || "";
//       if (input.isMandatory && !value) {
//         newErrors[input.name] = `${input.label} is required`;
//       }
//       if (input.type === "number" && value && isNaN(value)) {
//         newErrors[input.name] = `${input.label} must be a valid number`;
//       }
//       if (input.name === "wardnumber" && value && !/^[a-zA-Z0-9]+$/.test(value)) {
//         newErrors[input.name] = "Ward No must be alphanumeric";
//       }
//     });
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // ✅ Handle field change + save to sessionStorage
//   const handleChange = (name, value, validation) => {
//     let error = "";

//     if (validation?.required && !value.trim()) {
//       error = validation.errorMessage || `${name} is required`;
//     }
//     if (!error && validation?.pattern && value) {
//       const regex = new RegExp(validation.pattern);
//       if (!regex.test(value)) {
//         error = validation.errorMessage || validation.title;
//       }
//     }
//     setErrors((prev) => ({ ...prev, [name]: error }));

//     // save in sessionStorage
//     const stored = getStoredData();
//     const updated = { ...stored, [name]: value };
//     sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
//   };

//   const configWithErrors = {
//     ...editConfig,
//     inputs: editConfig.inputs.map((input) => ({
//       ...input,
//       customJSX: errors[input.name] ? (
//         <p style={{ color: "red", fontSize: "14px", marginTop: "4px" }}>
//           {errors[input.name]}
//         </p>
//       ) : null,
//       onChange: (e) =>
//         handleChange(input.name, e.target.value, input.validation),
//     })),
//   };

//   const handleSubmit = (data) => {
//     if (!validate()) return;
//     // also update sessionStorage on submit
//     sessionStorage.setItem(
//       STORAGE_KEY,
//       JSON.stringify({ ...getStoredData(), ...data })
//     );
//     onSelect(editConfig?.key, { ...data });
//   };

//   const onSkip = () => onSelect();

//   if (isLoading) return <Loader />;

//   return (
//     <FormStep
//       config={configWithErrors}
//       onSelect={handleSubmit}
//       childrenAtTheBottom={false}
//       t={t}
//       _defaultValues={defaultValues}
//       onSkip={onSkip}
//     >
//       <StatusTable>
//         <Row
//           className="border-none"
//           label={t(`BPA_BOUNDARY_PLOT_AREA_LABEL`)}
//           text={
//             data?.planDetail?.planInformation?.plotArea
//               ? `${data?.planDetail?.planInformation?.plotArea} ${t(
//                   `BPA_SQ_MTRS_LABEL`
//                 )}`
//               : "NA"
//           }
//         />
//         <Row
//           className="border-none"
//           label={t(`BPA_PLOT_NUMBER_LABEL`)}
//           text={data?.planDetail?.planInformation?.plotNo}
//         />
//         <Row
//           className="border-none"
//           label={t(`BPA_KHATHA_NUMBER_LABEL`)}
//           text={data?.planDetail?.planInfoProperties?.KHATA_NO}
//         />
//       </StatusTable>
//     </FormStep>
//   );
// };

// export default PlotDetails;


const PlotDetails = ({ formData, onSelect, config, sessionId }) => {
  const isEditApplication = window.location.href.includes("editApplication")
  const [editConfig, setEditConfig] = useState(config)
  const { t } = useTranslation()
  const tenantId = localStorage.getItem("CITIZEN.CITY") || Digit.ULBService.getCurrentTenantId()
  console.log(tenantId, "TEN")
  const checkingFlow = formData?.uiFlow?.flow
  const state = Digit.ULBService.getStateId()
  const [errors, setErrors] = useState({})

  const getSessionStorageKey = () => {
    if (sessionId) {
      return `BUILDING_PERMIT_${sessionId}_PLOT_DETAILS`
    }
    // Fallback to application-specific key if sessionId not available
    const applicationNo = formData?.data?.applicationNo || formData?.applicationNo
    return `BUILDING_PERMIT_${applicationNo || "NEW"}_PLOT_DETAILS`
  }

  const [plotFormData, setPlotFormData] = useState(() => {
    const storageKey = getSessionStorageKey()
    const stored = sessionStorage.getItem(storageKey)
    const parsedStored = stored ? JSON.parse(stored) : {}
    return {
      ...parsedStored,
      ...formData?.data,
    }
  })

  useEffect(() => {
    if (plotFormData && Object.keys(plotFormData).length > 0) {
      const storageKey = getSessionStorageKey()
      sessionStorage.setItem(storageKey, JSON.stringify(plotFormData))
    }
  }, [plotFormData, sessionId])

  useEffect(() => {
    const storageKey = getSessionStorageKey()
    const stored = sessionStorage.getItem(storageKey)
    if (stored) {
      const parsedData = JSON.parse(stored)
      if (!formData.data) formData.data = {}
      formData.data = { ...formData.data, ...parsedData }
      setPlotFormData(parsedData)
    }
  }, [sessionId])

  useEffect(() => {
    const currentApplicationNo = formData?.data?.applicationNo || formData?.applicationNo
    if (!currentApplicationNo && sessionId) {
      // This is a new application, clear any old data for this session
      const storageKey = getSessionStorageKey()
      const stored = sessionStorage.getItem(storageKey)
      if (!stored) {
        // No data for current session, clear any old "NEW" data
        sessionStorage.removeItem("BUILDING_PERMIT_NEW_PLOT_DETAILS")
      }
    }
  }, [formData?.data?.applicationNo, sessionId])

  useEffect(() => {
    if (isEditApplication) {
      const newConfig = {
        ...config,
        inputs: config.inputs.map((input) => {
          if (input.name === "boundaryWallLength") {
            return { ...input, disable: true }
          }
          return input
        }),
      }
      setEditConfig(newConfig)
    }
  }, [checkingFlow, isEditApplication])

  useEffect(() => {
    const userInfoString = window.localStorage.getItem("user-info")
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString)
        if (userInfo?.id) {
          if (!formData.data) formData.data = {}
          formData.data.architectid = userInfo.id
        }
      } catch (err) {
        console.error("Error parsing user-info from local storage", err)
      }
    }
  }, [])

  const { data, isLoading } = Digit.Hooks.obps.useScrutinyDetails(state, formData?.data?.scrutinyNumber)

  const validate = () => {
    const newErrors = {}

    editConfig?.inputs?.forEach((input) => {
      const value = formData?.data?.[input.name] || ""

      if (input.isMandatory && !value) {
        newErrors[input.name] = `${input.label} is required`
      }

      if (input.type === "number" && value && isNaN(value)) {
        newErrors[input.name] = `${input.label} must be a valid number`
      }

      if (input.name === "wardnumber" && value && !/^[a-zA-Z0-9]+$/.test(value)) {
        newErrors[input.name] = "Ward No must be alphanumeric"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (data) => {
    if (!validate()) return

    console.log("Plot details form data:", formData?.data)

    // const enhancedData = {
    //   ...formData,
    //   data: {
    //     ...formData?.data,
    //     area: data?.planDetail?.planInformation?.plotArea?.toString() || "",
    //     height: data?.planDetail?.blocks?.[0]?.building?.buildingHeight?.toString() || "",
    //     builtUpArea: data?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea?.toString() || "",
    //     plotArea: data?.planDetail?.planInformation?.plotArea || "",
    //     plotNo: data?.planDetail?.planInformation?.plotNo || "",
    //     khataNo: data?.planDetail?.planInfoProperties?.KHATA_NO || "",
    //   },
    // }

    onSelect(editConfig?.key, {...data})
  }

  const onSkip = () => onSelect()

  if (isLoading) {
    return <Loader />
  }

  const getDataDefaults = {
    khasraNumber: data?.planDetail?.planInfoProperties?.KHATA_NO,
  }

  const defaultValues = {
    ...getDataDefaults,
    architectid: formData?.data?.architectid,
    ...formData?.data,
  }

  const handleChange = (name, value, validation) => {
    let error = ""

    if (validation?.required && !value.trim()) {
      error = validation.errorMessage || `${name} is required`
    }

    if (!error && validation?.pattern && value) {
      const regex = new RegExp(validation.pattern)
      if (!regex.test(value)) {
        error = validation.errorMessage || validation.title
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }))

    if (!formData.data) {
      formData.data = {}
    }
    formData.data[name] = value

    const updatedData = { ...plotFormData, [name]: value }
    setPlotFormData(updatedData)
  }

  const configWithErrors = {
    ...editConfig,
    inputs: editConfig.inputs.map((input) => ({
      ...input,
      customJSX: (
        <React.Fragment>
          {errors[input.name] && (
            <p style={{ color: "red", fontSize: "14px", marginTop: "4px" }}>{errors[input.name]}</p>
          )}
        </React.Fragment>
      ),
      onChange: (e) => handleChange(input.name, e.target.value, input.validation),
    })),
  }

  return (
    <FormStep
      config={configWithErrors}
      onSelect={handleSubmit}
      childrenAtTheBottom={false}
      t={t}
      _defaultValues={defaultValues}
      onSkip={onSkip}
    >
      <StatusTable>
        <Row
          className="border-none"
          label={t(`BPA_BOUNDARY_PLOT_AREA_LABEL`)}
          text={
            data?.planDetail?.planInformation?.plotArea
              ? `${data?.planDetail?.planInformation?.plotArea} ${t(`BPA_SQ_MTRS_LABEL`)}`
              : "NA"
          }
        />
        <Row
          className="border-none"
          label={t(`BPA_PLOT_NUMBER_LABEL`)}
          text={data?.planDetail?.planInformation?.plotNo}
        />
        <Row
          className="border-none"
          label={t(`BPA_KHATHA_NUMBER_LABEL`)}
          text={data?.planDetail?.planInfoProperties?.KHATA_NO}
        />
      </StatusTable>
    </FormStep>
  )
}

export default PlotDetails
