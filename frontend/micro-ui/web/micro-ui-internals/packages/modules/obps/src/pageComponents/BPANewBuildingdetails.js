

import React, { useEffect, useState } from "react";
import { FormStep, TextInput, CardLabel, Dropdown, UploadFile, SearchIcon } from "@mseva/digit-ui-react-components";
import Timeline from "../components/Timeline";
import { useLocation } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import Stepper from "../../../../react-components/src/customComponents/Stepper";



const BPANewBuildingdetails = ({ t, config, onSelect, formData }) => {
  const { pathname: url } = useLocation()
  const index = window.location.href.charAt(window.location.href.length - 1)
  let validation = {}

  const SESSION_STORAGE_KEY = "Digit.BUILDING_PERMIT"
  const tenantId = localStorage.getItem("tenant-id")

const createEmployeeConfig = [
  {
    route: "plot-details",
    head: "APPLICATION DETAILS",
    stepLabel: "NOC_APPLICATION_DETAILS",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "dummy",
    key: "data",
    
  },
  {
    route: "scrutiny-details",
    head: "SITE DETAILS",
    stepLabel: "NOC_SITE_DETAILS",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "dummy",
    key: "subOccupancy",
    withoutLabel: true,
    
  },


];

  const getSessionData = () => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.value || {}
      }
    } catch (error) {
      console.error("Error reading session storage:", error)
    }
    return {}
  }

  const sessionData = getSessionData()
  console.log(sessionData, "SESSION DATA")
  const cityData = sessionData.city || {}
  console.log(cityData, "CITY DATA")
  const dataObj = sessionData.data || {}
  console.log(formData, "FORMDATA")

  const [UlbName, setUlbName] = useState(() => {
    const cityName = formData?.address?.city?.name
    return cityName || ""
  })

  const [District, setDistrict] = useState(() => {
    const districtName = formData?.address?.city?.city?.districtName
    return districtName || ""
  })

  const [Ulblisttype, setUlblisttype] = useState(() => {
    const cityType = formData?.address?.city?.city?.ulbType
    return cityType || ""
  })

  const [errors, setErrors] = useState({})

  const [approvedColony, setapprovedColony] = useState(formData?.owners?.approvedColony || "")
  const [masterPlan, setmasterPlan] = useState(formData?.owners?.masterPlan || "")
  const [buildingStatus, setbuildingStatus] = useState(formData?.owners?.buildingStatus || "")
  const [purchasedFAR, setpurchasedFAR] = useState(formData?.owners?.purchasedFAR || "")
  const [greenbuilding, setgreenbuilding] = useState(formData?.owners?.greenbuilding || "")
  const [restrictedArea, setrestrictedArea] = useState(formData?.owners?.restrictedArea || "")
  const [proposedSite, setproposedSite] = useState(formData?.owners?.proposedSite || "")
  const [nameofApprovedcolony, setnameofApprovedcolony] = useState(formData?.owners?.nameofApprovedcolony || "")
  const [NocNumber, setNocNumber] = useState(formData?.owners?.NocNumber || "")
  const [schemesselection, setschemesselection] = useState(formData?.owners?.schemesselection || "")
  const [schemeName, setschemeName] = useState(formData?.owners?.schemeName || "")
  const [transferredscheme, settransferredscheme] = useState("Pre-Approved Standard Designs" || "")
  const [rating, setrating] = useState(formData?.owners?.rating || "")
  const [use, setUse] = useState(formData?.owners?.use || "")
  const [uploadedFile, setUploadedFile] = useState(formData?.owners?.uploadedFile)
  const [greenuploadedFile, setGreenUploadedFile] = useState(formData?.owners?.greenuploadedFile)
  const [uploadMessage, setUploadMessage] = useState("")
  const [ecbcElectricalLoad, setEcbcElectricalLoad] = useState(formData?.owners?.ecbcElectricalLoad || "")
  const [ecbcDemandLoad, setEcbcDemandLoad] = useState(formData?.owners?.ecbcDemandLoad || "")
  const [ecbcAirConditioned, setEcbcAirConditioned] = useState(formData?.owners?.ecbcAirConditioned || "")

  const [ecbcElectricalLoadFile, setEcbcElectricalLoadFile] = useState(formData?.owners?.ecbcElectricalLoadFile)
  const [ecbcDemandLoadFile, setEcbcDemandLoadFile] = useState(formData?.owners?.ecbcDemandLoadFile)
  const [ecbcAirConditionedFile, setEcbcAirConditionedFile] = useState(formData?.owners?.ecbcAirConditionedFile)

  const [ecbcElectricalLoadFileObj, setEcbcElectricalLoadFileObj] = useState()
  const [ecbcDemandLoadFileObj, setEcbcDemandLoadFileObj] = useState()
  const [ecbcAirConditionedFileObj, setEcbcAirConditionedFileObj] = useState()

  const [ecbcCertificateFile, setEcbcCertificateFile] = useState(null);
const [ecbcCertificateFileObj, setEcbcCertificateFileObj] = useState(null);

const [previewUrl, setPreviewUrl] = useState(null); 

const [step, setStep] = useState("")


  const validateFields = () => {
    const newErrors = {}

    if (!UlbName) newErrors.UlbName = "ULB Name is required"
    if (!District) newErrors.District = "District is required"
    if (!Ulblisttype) newErrors.Ulblisttype = "ULB Type is required"
    if (!approvedColony) newErrors.approvedColony = "Approved Colony is required"
    if (!masterPlan) newErrors.masterPlan = "Master Plan is required"
    if (!buildingStatus) newErrors.buildingStatus = "Building Status is required"
    if (!purchasedFAR) newErrors.purchasedFAR = "Purchased FAR is required"
    if (!greenbuilding) newErrors.greenbuilding = "Green Building is required"
    if (!restrictedArea) newErrors.restrictedArea = "Restricted Area is required"
    if (!proposedSite) newErrors.proposedSite = "Proposed Site Type is required"

    if (!ecbcElectricalLoad) newErrors.ecbcElectricalLoad = "ECBC Electrical Load is required"
    if (!ecbcDemandLoad) newErrors.ecbcDemandLoad = "ECBC Demand Load is required"
    if (!ecbcAirConditioned) newErrors.ecbcAirConditioned = "ECBC Air Conditioned Area is required"

    // Conditional validations
    if (approvedColony?.code === "YES" && !nameofApprovedcolony) {
      newErrors.nameofApprovedcolony = "Approved Colony Name is required"
    }

    if (approvedColony?.code === "NO" && !NocNumber && !uploadedFile) {
      newErrors.NocNumber = "NOC Number or NOC Document is required"
    }

    if (greenbuilding?.code === "YES") {
      if (!greenuploadedFile) newErrors.greenuploadedFile = "Green Building Document is required"
      if (!rating) newErrors.rating = "Rating is required"
    }

    if (masterPlan?.code === "YES" && !use) {
      newErrors.use = "Use is required"
    }
const anyYes = 
  ecbcElectricalLoad?.code === "YES" || 
  ecbcDemandLoad?.code === "YES" || 
  ecbcAirConditioned?.code === "YES";

if (anyYes && !ecbcCertificateFile) {
  newErrors.ecbcCertificateFile = "Please upload ECBC Certificate";
}





    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const selectEcbcCertificateFile = async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const response = await Digit.UploadServices.Filestorage("OBPS", file, Digit.ULBService.getStateId());
      if (response?.data?.files?.length > 0) {
        setEcbcCertificateFile(response.data.files[0].fileStoreId); // ✅ fileStoreId
        setEcbcCertificateFileObj(file); // optional for preview
      }
    } catch (err) {
      console.error("File upload failed", err);
    }
  }
};


  const saveToSessionStorage = () => {
    try {
      const currentData = getSessionData()
      const updatedData = {
        ...currentData,
        buildingDetails: {
          approvedColony,
          masterPlan,
          UlbName,
          buildingStatus,
          purchasedFAR,
          greenbuilding,
          restrictedArea,
          District,
          proposedSite,
          nameofApprovedcolony,
          NocNumber,
          schemesselection,
          schemeName,
          transferredscheme,
          rating,
          use,
          Ulblisttype,
          uploadedFile,
          greenuploadedFile,
          ecbcElectricalLoad,
          ecbcDemandLoad,
          ecbcAirConditioned,
          ecbcElectricalLoadFile,
          ecbcDemandLoadFile,
          ecbcAirConditionedFile,
          lastUpdated: Date.now(),
        },
      }

      const sessionStorageData = {
        value: updatedData,
        ttl: 86400,
        expiry: Date.now() + 86400 * 1000,
      }

      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionStorageData))
    } catch (error) {
      console.error("Error saving to session storage:", error)
    }
  }

  sessionStorage.setItem("set-step",3)

  useEffect(() => {
    saveToSessionStorage()
  }, [
    approvedColony,
    masterPlan,
    UlbName,
    buildingStatus,
    purchasedFAR,
    greenbuilding,
    restrictedArea,
    District,
    proposedSite,
    nameofApprovedcolony,
    NocNumber,
    schemesselection,
    schemeName,
    transferredscheme,
    rating,
    use,
    Ulblisttype,
    uploadedFile,
    greenuploadedFile,
    ecbcElectricalLoad,
    ecbcDemandLoad,
    ecbcAirConditioned,
    ecbcElectricalLoadFile,
    ecbcDemandLoadFile,
    ecbcAirConditionedFile,
  ])

  const [files, setFiles] = useState()
  const [file, setFile] = useState()
  const Webview = !Digit.Utils.browser.isMobile()
  const acceptFormat = ".pdf"

 
  useEffect(() => {
    ;(async () => {
      if (files && files?.type) {
        if (!acceptFormat?.split(",")?.includes(`.${files?.type?.split("/")?.pop()}`)) {
          setErrors((prev) => ({ ...prev, files: t("PT_UPLOAD_FORMAT_NOT_SUPPORTED") }))
        } else if (files.size >= 2000000) {
          setErrors((prev) => ({ ...prev, files: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              files,
              Digit.ULBService.getStateId(),
            )
            if (response?.data?.files?.length > 0) {
              setGreenUploadedFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, files: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {}
        }
      }
    })()
  }, [files])

  useEffect(() => {
    ;(async () => {
      if (ecbcElectricalLoadFileObj && ecbcElectricalLoadFileObj?.type) {
        if (!acceptFormat?.split(",")?.includes(`.${ecbcElectricalLoadFileObj?.type?.split("/")?.pop()}`)) {
          setErrors((prev) => ({ ...prev, ecbcElectricalLoadFile: t("PT_UPLOAD_FORMAT_NOT_SUPPORTED") }))
        } else if (ecbcElectricalLoadFileObj.size >= 2000000) {
          setErrors((prev) => ({ ...prev, ecbcElectricalLoadFile: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              ecbcElectricalLoadFileObj,
              Digit.ULBService.getStateId(),
            )
            if (response?.data?.files?.length > 0) {
              setEcbcElectricalLoadFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, ecbcElectricalLoadFile: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {}
        }
      }
    })()
  }, [ecbcElectricalLoadFileObj])

  useEffect(() => {
    ;(async () => {
      if (ecbcDemandLoadFileObj && ecbcDemandLoadFileObj?.type) {
        if (!acceptFormat?.split(",")?.includes(`.${ecbcDemandLoadFileObj?.type?.split("/")?.pop()}`)) {
          setErrors((prev) => ({ ...prev, ecbcDemandLoadFile: t("PT_UPLOAD_FORMAT_NOT_SUPPORTED") }))
        } else if (ecbcDemandLoadFileObj.size >= 2000000) {
          setErrors((prev) => ({ ...prev, ecbcDemandLoadFile: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              ecbcDemandLoadFileObj,
              Digit.ULBService.getStateId(),
            )
            if (response?.data?.files?.length > 0) {
              setEcbcDemandLoadFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, ecbcDemandLoadFile: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {}
        }
      }
    })()
  }, [ecbcDemandLoadFileObj])

  useEffect(() => {
    ;(async () => {
      if (ecbcAirConditionedFileObj && ecbcAirConditionedFileObj?.type) {
        if (!acceptFormat?.split(",")?.includes(`.${ecbcAirConditionedFileObj?.type?.split("/")?.pop()}`)) {
          setErrors((prev) => ({ ...prev, ecbcAirConditionedFile: t("PT_UPLOAD_FORMAT_NOT_SUPPORTED") }))
        } else if (ecbcAirConditionedFileObj.size >= 2000000) {
          setErrors((prev) => ({ ...prev, ecbcAirConditionedFile: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              ecbcAirConditionedFileObj,
              Digit.ULBService.getStateId(),
            )
            if (response?.data?.files?.length > 0) {
              setEcbcAirConditionedFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, ecbcAirConditionedFile: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {}
        }
      }
    })()
  }, [ecbcAirConditionedFileObj])


useEffect(() => {
  if (ecbcCertificateFile) {
    fetch(
      `${window.location.origin}/filestore/v1/files/id?tenantId=${tenantId}&fileStoreId=${ecbcCertificateFile}`
    )
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      });
  }
}, [ecbcCertificateFile]);

  const approvedcolonyStatus = [
    {
      code: "YES",
      i18nKey: "YES",
    },
    {
      code: "NO",
      i18nKey: "NO",
    },
    {
      code: "LAL_LAKEER",
      i18nKey: "LAL LAKEER",
    },
  ]

  const common = [
    {
      code: "YES",
      i18nKey: "YES",
    },
    {
      code: "NO",
      i18nKey: "NO",
    },
  ]

  const Typeofproposedsite = [
    {
      code: "PROPOSED",
      i18nKey: "Proposed",
    },
    {
      code: "Addition/Alteration",
      i18nKey: "Addition/Alteration",
    },
    {
      code: "Revised",
      i18nKey: "Revised",
    },
    {
      code: "Re-validation",
      i18nKey: "Re-validation",
    },
  ]

  const yesNoOptions = [
    { code: "YES", i18nKey: "YES" },
    { code: "NO", i18nKey: "NO" },
  ]

  const stateId = Digit.ULBService.getStateId()

  const { data: ulbList } = Digit.Hooks.obps.useUlbType(stateId, "BPA", "UlbType")
  const { data: districtMenu } = Digit.Hooks.obps.useDistricts(stateId, "BPA", "Districts")
  const { data: ULB } = Digit.Hooks.obps.useULBList(stateId, "BPA", "Ulb")

  const ulblists = []
  const menu = []
  const ulb = []

  ulbList &&
    ulbList.map((ulbtypelist) => {
      if (ulbtypelist?.Districts === District?.code || ulbtypelist?.Districts === District?.value)
        ulblists.push({ i18nKey: `${ulbtypelist.name}`, code: `${ulbtypelist.code}`, value: `${ulbtypelist.name}` })
    })

  districtMenu &&
    districtMenu.map((districts) => {
      menu.push({ i18nKey: `${districts.name}`, code: `${districts.code}`, value: `${districts.name}` })
    })

  ULB &&
    ULB.map((ulblist) => {
      if (ulblist.Districts == District?.code || ulblist.Districts == District?.value) {
        ulb.push({
          i18nKey: `${ulblist.name}`,
          code: `${ulblist.code}`,
          value: `${ulblist.name}`,
        })
      }
    })

  const { data: commonBuilding } = Digit.Hooks.useCustomMDMS(
    Digit.ULBService.getStateId(),
    "BPA",
    [{ name: "BuildingStatus" }],
    {
      select: (data) => {
        const formattedData = data?.["BPA"]?.["BuildingStatus"]
        return formattedData
      },
    },
  )

  const building_status = []

  commonBuilding &&
    commonBuilding.map((selectBuilding) => {
      building_status.push({
        i18nKey: `BPA_${selectBuilding.code}`,
        code: `${selectBuilding.code}`,
        value: `${selectBuilding.name}`,
      })
    })

  const { data: commonrating } = Digit.Hooks.useCustomMDMS(
    Digit.ULBService.getStateId(),
    "BPA",
    [{ name: "RatingValue" }],
    {
      select: (data) => {
        const formattedData = data?.["BPA"]?.["RatingValue"]
        return formattedData
      },
    },
  )

  const selectRating = []

  commonrating &&
    commonrating.map((selectRatings) => {
      selectRating.push({
        i18nKey: `BPA_${selectRatings.code}`,
        code: `${selectRatings.code}`,
        value: `${selectRatings.name}`,
      })
    })

  const { data: commonmasterFields } = Digit.Hooks.useCustomMDMS(
    Digit.ULBService.getStateId(),
    "BPA",
    [{ name: "MasterFields" }],
    {
      select: (data) => {
        const formattedData = data?.["BPA"]?.["MasterFields"]
        return formattedData
      },
    },
  )

  const selectmasterDrop = []

  commonmasterFields &&
    commonmasterFields.map((selectMaster) => {
      selectmasterDrop.push({
        i18nKey: `BPA_${selectMaster.code}`,
        code: `${selectMaster.code}`,
        value: `${selectMaster.name}`,
      })
    })

  const { control } = useForm()

  function setdistrict(option) {
    setDistrict(option)
    setUlblisttype("") // Reset ULB type when district changes
    setErrors((prev) => ({ ...prev, District: "", Ulblisttype: "" }))
  }

  function setulbname(option) {
    setUlbName(option)
    setErrors((prev) => ({ ...prev, UlbName: "" }))
  }

  function setulblisttype(option) {
    setUlblisttype(option)
    setErrors((prev) => ({ ...prev, Ulblisttype: "" }))
  }

  function setApprovedColony(option) {
    setapprovedColony(option)
    setErrors((prev) => ({ ...prev, approvedColony: "" }))
  }

  function setMasterPlan(option) {
    setmasterPlan(option)
    setErrors((prev) => ({ ...prev, masterPlan: "" }))
  }

  function setBuildingStatus(option) {
    setbuildingStatus(option)
    setErrors((prev) => ({ ...prev, buildingStatus: "" }))
  }

  function setPurchasedFAR(option) {
    setpurchasedFAR(option)
    setErrors((prev) => ({ ...prev, purchasedFAR: "" }))
  }

  function setGreenbuilding(option) {
    setgreenbuilding(option)
    setErrors((prev) => ({ ...prev, greenbuilding: "" }))
  }

  function setRestrictedArea(option) {
    setrestrictedArea(option)
    setErrors((prev) => ({ ...prev, restrictedArea: "" }))
  }

  function setProposedSite(option) {
    setproposedSite(option)
    setErrors((prev) => ({ ...prev, proposedSite: "" }))
  }

  function setEcbcElectricalLoadHandler(option) {
    console.log("[v0] ECBC Electrical Load selected:", option)
    console.log("[v0] Option code:", option?.code)
    setEcbcElectricalLoad(option)
    setErrors((prev) => ({ ...prev, ecbcElectricalLoad: "" }))
    // Force component re-render
    setTimeout(() => {
      console.log("[v0] State after update:", option)
    }, 100)
  }

  function setEcbcDemandLoadHandler(option) {
    console.log("[v0] ECBC Demand Load selected:", option)
    console.log("[v0] Option code:", option?.code)
    setEcbcDemandLoad(option)
    setErrors((prev) => ({ ...prev, ecbcDemandLoad: "" }))
    // Force component re-render
    setTimeout(() => {
      console.log("[v0] State after update:", option)
    }, 100)
  }

  function setEcbcAirConditionedHandler(option) {
    console.log("[v0] ECBC Air Conditioned selected:", option)
    console.log("[v0] Option code:", option?.code)
    setEcbcAirConditioned(option)
    setErrors((prev) => ({ ...prev, ecbcAirConditioned: "" }))
    // Force component re-render
    setTimeout(() => {
      console.log("[v0] State after update:", option)
    }, 100)
  }

  function setNameapprovedcolony(e) {
    setnameofApprovedcolony(e.target.value)
    setErrors((prev) => ({ ...prev, nameofApprovedcolony: "" }))
  }

  function setnocNumber(e) {
    setNocNumber(e.target.value)
    setErrors((prev) => ({ ...prev, NocNumber: "" }))
  }

  function selectfile(e) {
    setUploadedFile(e.target.files[0])
    setFile(e.target.files[0])
    setErrors((prev) => ({ ...prev, file: "" }))
  }

  function onClick(e) {
    console.log("inside_NOC_search")
  }

  function selectfiles(e) {
    setGreenUploadedFile(e.target.files[0])
    setFiles(e.target.files[0])
    setErrors((prev) => ({ ...prev, files: "" }))
  }

  function selectEcbcElectricalLoadFile(e) {
    setEcbcElectricalLoadFile(e.target.files[0])
    setEcbcElectricalLoadFileObj(e.target.files[0])
    setErrors((prev) => ({ ...prev, ecbcElectricalLoadFile: "" }))
  }

  function selectEcbcDemandLoadFile(e) {
    setEcbcDemandLoadFile(e.target.files[0])
    setEcbcDemandLoadFileObj(e.target.files[0])
    setErrors((prev) => ({ ...prev, ecbcDemandLoadFile: "" }))
  }

  function selectEcbcAirConditionedFile(e) {
    setEcbcAirConditionedFile(e.target.files[0])
    setEcbcAirConditionedFileObj(e.target.files[0])
    setErrors((prev) => ({ ...prev, ecbcAirConditionedFile: "" }))
  }

  const goNext = () => {
    if (!validateFields()) {
      return
    }

    const owners = formData.owners && formData.owners[index]
    const ownerStep = {
      ...owners,
      approvedColony,
      use,
      UlbName,
      Ulblisttype,
      District,
      rating,
      masterPlan,
      buildingStatus,
      purchasedFAR,
      greenbuilding,
      restrictedArea,
      proposedSite,
      nameofApprovedcolony,
      schemeName,
      transferredscheme,
      NocNumber,
      uploadedFile,
      greenuploadedFile,
      ecbcElectricalLoad,
      ecbcDemandLoad,
      ecbcAirConditioned,
      ecbcElectricalLoadFile,
      ecbcDemandLoadFile,
      ecbcAirConditionedFile,
    }
    const updatedFormData = { ...formData }

    if (!updatedFormData.owners) {
      updatedFormData.owners = []
    }

    onSelect(config.key, { ...formData[config.key], ...ownerStep }, updatedFormData, false, index)
  }

  const onSkip = () => onSelect()

  const ErrorMessage = ({ error }) => {
    if (!error) return null
    return <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{error}</div>
  }

  const handleSubmit = () => {

  }

  return (
    <React.Fragment>
     
      <FormStep config={config} onSelect={goNext} onSkip={onSkip} t={t} isDisabled={false}>
       <div className="test-card-demo"> 
          {/* <Timeline currentStep={2} /> */}
          {/* <Stepper stepsList={createEmployeeConfig} onSubmit={handleSubmit} step={step} setStep={setStep} /> */}
        <div>
          <CardLabel>{`${t("BPA_ULB_NAME")} *`}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="UlbName"
            value={UlbName}
            onChange={() => {}} // No-op since it's disabled
            // style={{ width: "86%" }}
            ValidationRequired={false}
            disabled={true}
            
          />
          <ErrorMessage error={errors.UlbName} />

          <CardLabel>{`${t("BPA_DISTRICT")} *`}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="District"
            value={District}
            onChange={() => {}} // No-op since it's disabled
            // style={{ width: "86%" }}
            ValidationRequired={false}
            disabled={true}
          />
          <ErrorMessage error={errors.District} />

          <CardLabel>{`${t("BPA_ULB_TYPE")} *`}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="Ulblisttype"
            value={Ulblisttype}
            onChange={() => {}} // No-op since it's disabled
            // style={{ width: "86%" }}
            ValidationRequired={false}
            disabled={true}
          />
          <ErrorMessage error={errors.Ulblisttype} />

          <CardLabel>{`${t("BPA_APPROVED_COLONY")} *`}</CardLabel>
          <Controller
            control={control}
            name={"approvedColony"}
            defaultValue={approvedColony}
            render={(props) => (
              <Dropdown
                // className="form-field"
                selected={approvedColony}
                select={setApprovedColony}
                option={approvedcolonyStatus}
                placeholder="Select Colony"
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.approvedColony} />

          {approvedColony?.code === "YES" && (
            <React.Fragment>
              <CardLabel>{`${t("BPA_APPROVED_COLONY_NAME")} *`}</CardLabel>
              <TextInput
                t={t}
                type={"text"}
                isMandatory={false}
                optionKey="i18nKey"
                name="nameofApprovedcolony"
                value={nameofApprovedcolony}
                placeholder="Approved Colony Name"
                onChange={setNameapprovedcolony}
                // style={{ width: "86%" }}
                ValidationRequired={false}
                {...(validation = {
                  isRequired: true,
                  pattern: "^[a-zA-Z ]*$",
                  type: "text",
                  title: t("TL_NAME_ERROR_MESSAGE"),
                })}
              />
              {errors.nameofApprovedcolony && <ErrorMessage error={errors.nameofApprovedcolony} />}
            </React.Fragment>
          )}
          {approvedColony?.code === "NO" && (
            <React.Fragment>
              <CardLabel>{`${t("BPA_NOC_NUMBER")} *`}</CardLabel>
              <div className="field-container">
                <TextInput
                  t={t}
                  type={"text"}
                  isMandatory={false}
                  optionKey="i18nKey"
                  name="NocNumber"
                  placeholder="NOC Number"
                  value={NocNumber}
                  onChange={setnocNumber}
                  // style={{ width: "86%" }}
                  ValidationRequired={false}
                  {...(validation = {
                    pattern: "^[a-zA-Z0-9]*$",
                    type: "text",
                    title: t("TL_NAME_ERROR_MESSAGE"),
                  })}
                />
                <div
                  style={{
                    position: "relative",
                    zIndex: "100",
                    right: "95px",
                    marginTop: "-24px",
                    marginRight: Webview ? "-20px" : "-20px",
                  }}
                  onClick={(e) => onClick(e)}
                >
                  {" "}
                  <SearchIcon />{" "}
                </div>
              </div>
              <div style={{ position: "relative", fontWeight: "bold", left: "20px" }}>OR</div>
              <UploadFile
                id={"noc-doc"}
                // style={{ width: "86%" }}
                onUpload={selectfile}
                onDelete={() => {
                  setUploadedFile(null)
                  setFile("")
                }}
                message={uploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
                error={errors.file}
                // uploadMessage={""}
              />
              {errors.NocNumber && <ErrorMessage error={errors.NocNumber} />}
            </React.Fragment>
          )}

          <CardLabel style={{ marginTop: "15px" }}>{`${t("BPA_MASTER_PLAN")} *`}</CardLabel>
          <Controller
            control={control}
            name={"masterPlan"}
            defaultValue={masterPlan}
            render={(props) => (
              <Dropdown
                placeholder="Have Master Plan?"
               
                selected={masterPlan}
                select={setMasterPlan}
                option={common}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.masterPlan} />

          {masterPlan?.code === "YES" && (
            <React.Fragment>
              <CardLabel>{`${t("BPA_USE")} *`}</CardLabel>
              <Controller
                control={control}
                name={"use"}
                defaultValue={use}
                render={(props) => (
                  <Dropdown
                    placeholder="USE"
                  
                    selected={use}
                    select={setUse}
                    option={selectmasterDrop}
                    optionKey="i18nKey"
                    t={t}
                  />
                )}
              />
              {errors.use && <ErrorMessage error={errors.use} />}
            </React.Fragment>
          )}

          <CardLabel>{`${t("BPA_BUILDING_STATUS")} *`}</CardLabel>
          <Controller
            control={control}
            name={"buildingStatus"}
            defaultValue={buildingStatus}
            render={(props) => (
              <Dropdown
               
                selected={buildingStatus}
                select={setBuildingStatus}
                option={building_status}
                placeholder="Building Status"
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.buildingStatus} />

          <CardLabel>{`${t("BPA_PURCHASED_FAR")} *`}</CardLabel>
          <Controller
            control={control}
            name={"purchasedFAR"}
            defaultValue={purchasedFAR}
            render={(props) => (
              <Dropdown
                placeholder="Purchased FAR"
              
                selected={purchasedFAR}
                select={setPurchasedFAR}
                option={common}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.purchasedFAR} />

          <CardLabel>{`${t("BPA_GREEN_BUIDINGS")} *`}</CardLabel>
          <Controller
            control={control}
            name={"greenbuilding"}
            defaultValue={greenbuilding}
            render={(props) => (
              <Dropdown
                placeholder="Is Green Building?"
               
                selected={greenbuilding}
                select={setGreenbuilding}
                option={common}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.greenbuilding} />

          {greenbuilding?.code === "YES" && (
            <React.Fragment>
              <UploadFile
                id={"green-building-doc"}
                onUpload={selectfiles}
                onDelete={() => {
                  setGreenUploadedFile(null)
                  setFiles("")
                }}
                message={greenuploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
                error={errors.files}
                // uploadMessage={""}
              />
              <br></br>

              <CardLabel>{`${t("BPA_SELECT_RATINGS")} *`}</CardLabel>
              <Controller
                control={control}
                name={"rating"}
                defaultValue={rating}
                render={(props) => (
                  <Dropdown
                    placeholder="Select Ratings"
                   
                    selected={rating}
                    select={setrating}
                    option={selectRating}
                    optionKey="i18nKey"
                    t={t}
                  />
                )}
              />
              {errors.rating && <ErrorMessage error={errors.rating} />}
            </React.Fragment>
          )}

          <CardLabel>{`${t("BPA_RESTRICTED_AREA")}`}</CardLabel>
          <Controller
            control={control}
            name={"restrictedArea"}
            defaultValue={restrictedArea}
            render={(props) => (
              <Dropdown
                placeholder="Is Restricted Area?"
               
                selected={restrictedArea}
                select={setRestrictedArea}
                option={common}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.restrictedArea} />

          <CardLabel>{`${t("BPA_PROPOSED_SITE_TYPE")} *`}</CardLabel>
          <Controller
            control={control}
            name={"proposedSite"}
            defaultValue={proposedSite}
            render={(props) => (
              <Dropdown
               
                selected={proposedSite}
                select={setProposedSite}
                option={Typeofproposedsite}
                placeholder="Proposed Site Type"
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.proposedSite} />

          <CardLabel>{`ECBC - Proposed Connected Electrical Load is above 100 Kw`}</CardLabel>
          <Controller
            control={control}
            name={"ecbcElectricalLoad"}
            defaultValue={ecbcElectricalLoad}
            render={(props) => (
              <Dropdown
               
                selected={ecbcElectricalLoad}
                select={setEcbcElectricalLoadHandler}
                option={yesNoOptions}
                placeholder="Electrical Load > 100Kw?"
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.ecbcElectricalLoad} />

          <CardLabel>{`ECBC - Proposed Demand of Electrical Load is above 120 Kw`}</CardLabel>
          <Controller
            control={control}
            name={"ecbcDemandLoad"}
            defaultValue={ecbcDemandLoad}
            render={(props) => (
              <Dropdown
               
                selected={ecbcDemandLoad}
                select={setEcbcDemandLoadHandler}
                option={yesNoOptions}
                placeholder="Electrical Load > 120Kw?"
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.ecbcDemandLoad} />

          <CardLabel>{`ECBC - Proposed Air Conditioned Area above 500 sq.mt`}</CardLabel>
          <Controller
            control={control}
            name={"ecbcAirConditioned"}
            defaultValue={ecbcAirConditioned}
            render={(props) => (
              <Dropdown
                
                selected={ecbcAirConditioned}
                select={setEcbcAirConditionedHandler}
                option={yesNoOptions}
                placeholder="Conditioned Area > 500 sq.mt?"
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          <ErrorMessage error={errors.ecbcAirConditioned} />
         {(ecbcElectricalLoad?.code === "YES" || 
            ecbcDemandLoad?.code === "YES" || 
            ecbcAirConditioned?.code === "YES") && (
            <div className="field">
              <CardLabel>{`${t("BPA_UPLOAD_ECBC_DOCUMENT")} *`}</CardLabel>
              <UploadFile
                id="ecbc-certificate"
                accept=".pdf,.jpg,.png"
                onUpload={selectEcbcCertificateFile}
                onDelete={() => {
                  setEcbcCertificateFile(null);
                  setEcbcCertificateFileObj(null);
                }}
                message={ecbcCertificateFileObj?.name || "Choose a file"}
              />

             {ecbcCertificateFile && (
              <div style={{ marginTop: "16px" }}>
                <CardLabel>{t("BPA_DOC_PREVIEW")}</CardLabel>
                <iframe className="doc-preview"
                  src={`${window.location.origin}/filestore/v1/files/id?tenantId=${tenantId}&fileStoreId=${ecbcCertificateFile}`}
                  title="PDF Preview"
                 
                />
              </div>
            )}


              {errors.ecbcCertificateFile && (
                <p className="error" style={{ color: "red" }}>
                  {errors.ecbcCertificateFile}
                </p>
              )}
            </div>
          )}


        </div>
       </div>
      </FormStep>
    </React.Fragment>
  )
}

export default BPANewBuildingdetails

