

import React, { useEffect, useMemo, useState } from "react";
import { FormStep, TextInput, CardLabel, Dropdown, UploadFile, SearchIcon, ActionBar, SubmitBar, Loader, DatePicker, Toast } from "@mseva/digit-ui-react-components";
import Timeline from "../components/Timeline";
import { useLocation } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import CustomUploadFile from "../components/CustomUploadFile";
import { LoaderNew } from "../components/LoaderNew";
import { EmployeeData, getNOCSanctionLetter } from "../utils";
import { set } from "lodash";




const BPANewBuildingdetails = ({ t, config, onSelect, formData, currentStepData, onGoBack }) => {
  const { pathname: url } = useLocation()
  const index = window.location.href.charAt(window.location.href.length - 1)
  let validation = {}
  const tenantId = localStorage.getItem("CITIZEN.CITY")

  const SESSION_STORAGE_KEY = "Digit.BUILDING_PERMIT"

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

  // console.log("formDataInNBDPage", currentStepData);

  const [UlbName, setUlbName] = useState(() => {
    const cityName = currentStepData?.LocationDetails?.selectedCity?.city?.name
    return cityName || ""
  })

  const [District, setDistrict] = useState(() => {
    const districtName = currentStepData?.LocationDetails?.selectedCity?.city?.districtName
    return districtName || ""
  })

  const [Ulblisttype, setUlblisttype] = useState(() => {
    const cityType = currentStepData?.LocationDetails?.selectedCity?.city?.ulbType
    return cityType || ""
  })

  //currentStepData?.createdResponse?.additionalDetails

  const [errors, setErrors] = useState({})

  const [approvedColony, setapprovedColony] = useState(currentStepData?.createdResponse?.additionalDetails?.approvedColony || "")
  const [masterPlan, setmasterPlan] = useState(currentStepData?.createdResponse?.additionalDetails?.masterPlan || "")
  const [buildingStatus, setbuildingStatus] = useState(currentStepData?.createdResponse?.additionalDetails?.buildingStatus || "")
  const [purchasedFAR, setpurchasedFAR] = useState(currentStepData?.createdResponse?.additionalDetails?.purchasedFAR || "")
  const [providedFAR, setProvidedFAR] = useState(0);
  const [purchasableFAR, setPurchasableFAR] = useState(0);
  const [greenbuilding, setgreenbuilding] = useState(currentStepData?.createdResponse?.additionalDetails?.greenbuilding || "")
  const [restrictedArea, setrestrictedArea] = useState(currentStepData?.createdResponse?.additionalDetails?.restrictedArea || "")
  const [proposedSite, setproposedSite] = useState(currentStepData?.createdResponse?.additionalDetails?.proposedSite || "")
  const [nameofApprovedcolony, setnameofApprovedcolony] = useState(currentStepData?.createdResponse?.additionalDetails?.nameofApprovedcolony || "")
  const [NocNumber, setNocNumber] = useState(currentStepData?.createdResponse?.additionalDetails?.NocNumber || "")
  const [applicantOwnerOrFirmName, setApplicantOwnerOrFirmName] = useState(currentStepData?.createdResponse?.additionalDetails?.nocObject?.applicantOwnerOrFirmName || "")
  const [nocULBType, setNocULBType] = useState(currentStepData?.createdResponse?.additionalDetails?.nocObject?.ulbType || "")
  const [nocULBName, setNocULBName] = useState(currentStepData?.createdResponse?.additionalDetails?.nocObject?.ulbName || "")
  const [nocApprovedOn, setNocApprovedOn] = useState(currentStepData?.createdResponse?.additionalDetails?.nocObject?.approvedOn || "")
  const [schemesselection, setschemesselection] = useState(currentStepData?.createdResponse?.additionalDetails?.schemesselection || "")
  const [schemeName, setschemeName] = useState(currentStepData?.createdResponse?.additionalDetails?.schemeName || "")
  const [transferredscheme, settransferredscheme] = useState("Pre-Approved Standard Designs" || "")
  const [rating, setrating] = useState(currentStepData?.createdResponse?.additionalDetails?.rating || "")
  const [use, setUse] = useState(currentStepData?.createdResponse?.additionalDetails?.use || "")
  const [uploadedFile, setUploadedFile] = useState(currentStepData?.createdResponse?.additionalDetails?.uploadedFile)
  const [greenuploadedFile, setGreenUploadedFile] = useState(currentStepData?.createdResponse?.additionalDetails?.greenuploadedFile)
  const [uploadMessage, setUploadMessage] = useState("")
  const [ecbcElectricalLoad, setEcbcElectricalLoad] = useState(currentStepData?.createdResponse?.additionalDetails?.ecbcElectricalLoad || "")
  const [ecbcDemandLoad, setEcbcDemandLoad] = useState(currentStepData?.createdResponse?.additionalDetails?.ecbcDemandLoad || "")
  const [ecbcAirConditioned, setEcbcAirConditioned] = useState(currentStepData?.createdResponse?.additionalDetails?.ecbcAirConditioned || "")

  const [ecbcElectricalLoadFile, setEcbcElectricalLoadFile] = useState(currentStepData?.createdResponse?.additionalDetails?.ecbcElectricalLoadFile)
  const [ecbcDemandLoadFile, setEcbcDemandLoadFile] = useState(currentStepData?.createdResponse?.additionalDetails?.ecbcDemandLoadFile)
  const [ecbcAirConditionedFile, setEcbcAirConditionedFile] = useState(currentStepData?.createdResponse?.additionalDetails?.ecbcAirConditionedFile)

  const [ecbcElectricalLoadFileObj, setEcbcElectricalLoadFileObj] = useState()
  const [ecbcDemandLoadFileObj, setEcbcDemandLoadFileObj] = useState()
  const [ecbcAirConditionedFileObj, setEcbcAirConditionedFileObj] = useState()

  const [ecbcCertificateFile, setEcbcCertificateFile] = useState(currentStepData?.createdResponse?.additionalDetails?.ecbcCertificateFile ||null);
const [ecbcCertificateFileObj, setEcbcCertificateFileObj] = useState(null);
const [apiLoading, setApiLoading] = useState(false);
const [loader, setLoader] = useState(false);

useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth" // use "auto" for instant scroll
    });
}, [])

useEffect(() => {
  console.log("loader",loader)
}, [loader])

useEffect(()=>{
  if(UlbName === "" && currentStepData?.LocationDetails?.selectedCity?.city?.name){
    setUlbName(currentStepData?.LocationDetails?.selectedCity?.city?.name)
  }
  if(District === "" && currentStepData?.LocationDetails?.selectedCity?.city?.districtName){
    setDistrict(currentStepData?.LocationDetails?.selectedCity?.city?.districtName)
  }
  if(Ulblisttype === "" && currentStepData?.LocationDetails?.selectedCity?.city?.ulbType){
    setUlblisttype(currentStepData?.LocationDetails?.selectedCity?.city?.ulbType)
  }
},[currentStepData?.LocationDetails?.selectedCity?.city])


  const validateFields = () => {
    const newErrors = {}
    const nameRegex = /^[A-Za-z ]+$/;

    if (!UlbName) newErrors.UlbName = t("ULB Name is required")
    if (!District) newErrors.District = t("District is required")
    if (!Ulblisttype) newErrors.Ulblisttype = t("ULB Type is required")
    if (!approvedColony) newErrors.approvedColony = t("Approved Colony is required")
    if (!masterPlan) newErrors.masterPlan = t("Master Plan is required")
    // if (!buildingStatus) newErrors.buildingStatus = t("Building Status is required")
    if (!purchasedFAR) newErrors.purchasedFAR = t("Purchased FAR is required")
    if (!greenbuilding) newErrors.greenbuilding = t("Green Building is required")
    if (!restrictedArea) newErrors.restrictedArea = t("Restricted Area is required")
    if (!proposedSite) newErrors.proposedSite = t("Proposed Site Type is required")

    if (!ecbcElectricalLoad) newErrors.ecbcElectricalLoad = t("ECBC Electrical Load is required")
    if (!ecbcDemandLoad) newErrors.ecbcDemandLoad = t("ECBC Demand Load is required")
    if (!ecbcAirConditioned) newErrors.ecbcAirConditioned = t("ECBC Air Conditioned Area is required")

    // Conditional validations
    if (approvedColony?.code === "YES" && !nameofApprovedcolony) {
      newErrors.nameofApprovedcolony = t("Approved Colony Name is required")
    }

    if (approvedColony?.code === "NO" && !NocNumber) {
      newErrors.NocNumber = t("NOC Number is required")
    }
    
    if(approvedColony?.code === "NO" && !uploadedFile){
      newErrors.NocDocument = t("NOC Document is required")
    }
    if(approvedColony?.code === "NO" && NocNumber && applicantOwnerOrFirmName.trim() === ""){
      newErrors.applicantOwnerOrFirmName = t("Applicant/Owner/Firm Name is Required")
    }else if(approvedColony?.code === "NO" && NocNumber && applicantOwnerOrFirmName && !nameRegex.test(applicantOwnerOrFirmName.trim())){
      newErrors.applicantOwnerOrFirmName = t("Applicant/Owner/Firm Name is Invalid")
    }

    if(approvedColony?.code === "NO" && NocNumber && nocULBName.trim() === ""){
      newErrors.nocULBName = t("ULB Name is Required")
    }else if(approvedColony?.code === "NO" && NocNumber && nocULBName && !nameRegex.test(nocULBName.trim())){
      newErrors.nocULBName = t("ULB Name is Invalid")
    }

    if(approvedColony?.code === "NO" && NocNumber && nocULBType.trim() === ""){
      newErrors.nocULBType = t("ULB Type is Required")
    }else if(approvedColony?.code === "NO" && NocNumber && nocULBType && !nameRegex.test(nocULBType.trim())){
      newErrors.nocULBType = t("ULB Type is Invalid")
    }
    
    if(approvedColony?.code === "NO" && NocNumber && nocApprovedOn.trim() === ""){
      newErrors.nocApprovedOn = t("Issue Date is Required")
    }
    else if(approvedColony?.code === "NO" && NocNumber && nocApprovedOn){
      if(new Date(nocApprovedOn) > new Date()){
        newErrors.nocApprovedOn = t("Issue Date is Invalid")
      }else if(new Date(nocApprovedOn) < new Date("1900-01-01")){
        newErrors.nocApprovedOn = t("Issue Date is Invalid")
      }
    }

    if (greenbuilding?.code === "YES") {
      if (!greenuploadedFile) newErrors.greenuploadedFile = t("Green Building Document is required")
      if (!rating) newErrors.rating = t("Rating is required")
    }

    if (masterPlan?.code === "YES" && !use) {
      newErrors.use = t("Use is required")
    }
const anyYes = 
  ecbcElectricalLoad?.code === "YES" || 
  ecbcDemandLoad?.code === "YES" || 
  ecbcAirConditioned?.code === "YES";

if (anyYes && !ecbcCertificateFile) {
  newErrors.ecbcCertificateFile = t("Please upload ECBC Certificate");
}





    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const selectEcbcCertificateFile = async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      setLoader(true)
      const response = await Digit.UploadServices.Filestorage("OBPS", file, Digit.ULBService.getStateId());
      setLoader(false)
      if (response?.data?.files?.length > 0) {
        setEcbcCertificateFile(response.data.files[0].fileStoreId); // ✅ fileStoreId
        setEcbcCertificateFileObj(file); // optional for preview
      }
    } catch (err) {
      setLoader(false)
      console.error("File upload failed", err);
    }
  }
};



  const [files, setFiles] = useState()
  const [file, setFile] = useState()
  const Webview = !Digit.Utils.browser.isMobile()
  const acceptFormat = ".pdf"
    const { data: commonmasterFields, isLoading: commonmasterFieldsLoading } = Digit.Hooks.useCustomMDMS(
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

 
  useEffect(() => {
    ;(async () => {
      if (file && file?.type) {
        if (file.size >= 2000000) {
          setErrors((prev) => ({ ...prev, NocDocument: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          setLoader(true);
          try {
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              file,
              Digit.ULBService.getStateId(),
            )
            setLoader(false);
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, NocDocument: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {
            setLoader(false);
          }
        }
      }
    })()
  }, [file])

  useEffect(() => {
    ;(async () => {
      if (files && files?.type) {
        if (files.size >= 2000000) {
          setErrors((prev) => ({ ...prev, greenuploadedFile: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          setLoader(true);
          try {            
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              files,
              Digit.ULBService.getStateId(),
            )
            setLoader(false);
            if (response?.data?.files?.length > 0) {
              setGreenUploadedFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, greenuploadedFile: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {
            setLoader(false);
          }
        }
      }
    })()
  }, [files])

  useEffect(() => {
    ;(async () => {
      if (ecbcElectricalLoadFileObj && ecbcElectricalLoadFileObj?.type) {
        if (ecbcElectricalLoadFileObj.size >= 2000000) {
          setErrors((prev) => ({ ...prev, ecbcElectricalLoadFile: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          setLoader(true);
          try {
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              ecbcElectricalLoadFileObj,
              Digit.ULBService.getStateId(),
            )
            setLoader(false);
            if (response?.data?.files?.length > 0) {
              setEcbcElectricalLoadFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, ecbcElectricalLoadFile: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {
            setLoader(false);
          }
        }
      }
    })()
  }, [ecbcElectricalLoadFileObj])

  useEffect(() => {
    ;(async () => {
      if (ecbcDemandLoadFileObj && ecbcDemandLoadFileObj?.type) {
        if (ecbcDemandLoadFileObj.size >= 2000000) {
          setErrors((prev) => ({ ...prev, ecbcDemandLoadFile: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          setLoader(true);
          try {
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              ecbcDemandLoadFileObj,
              Digit.ULBService.getStateId(),
            )
            setLoader(false);
            if (response?.data?.files?.length > 0) {
              setEcbcDemandLoadFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, ecbcDemandLoadFile: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {
            setLoader(false);
          }
        }
      }
    })()
  }, [ecbcDemandLoadFileObj])

  useEffect(() => {
    ;(async () => {
      if (ecbcAirConditionedFileObj && ecbcAirConditionedFileObj?.type) {
        if (ecbcAirConditionedFileObj.size >= 2000000) {
          setErrors((prev) => ({ ...prev, ecbcAirConditionedFile: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") }))
        } else {
          setLoader(true);
          try {
            const response = await Digit.UploadServices.Filestorage(
              "property-upload",
              ecbcAirConditionedFileObj,
              Digit.ULBService.getStateId(),
            )
            setLoader(false);
            if (response?.data?.files?.length > 0) {
              setEcbcAirConditionedFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setErrors((prev) => ({ ...prev, ecbcAirConditionedFile: t("PT_FILE_UPLOAD_ERROR") }))
            }
          } catch (err) {
            setLoader(false);
          }
        }
      }
    })()
  }, [ecbcAirConditionedFileObj])

  // ✅ approvedColony
    useEffect(() => {
      if (typeof approvedColony === "string") {
        const colony = approvedcolonyStatus.find((item) => item.code === approvedColony);
        if (colony) setapprovedColony(colony);
      } else if (approvedColony === null) {
        if (currentStepData?.createdResponse?.additionalDetails?.approvedColony) {
          setapprovedColony(currentStepData?.createdResponse?.additionalDetails?.approvedColony);
        }
      }
    }, [approvedColony, currentStepData?.createdResponse?.additionalDetails?.approvedColony]);

    // ✅ masterPlan
    useEffect(() => {
      if (typeof masterPlan === "string") {
        const plan = common.find((item) => item.code === masterPlan);
        if (plan) setmasterPlan(plan);
      } else if (masterPlan === null) {
        if (currentStepData?.createdResponse?.additionalDetails?.masterPlan) {
          setmasterPlan(currentStepData?.createdResponse?.additionalDetails?.masterPlan);
        }
      }
    }, [masterPlan, currentStepData?.createdResponse?.additionalDetails?.masterPlan]);


    // ✅ purchasedFAR
    useEffect(() => {
      const purchasedFARFromEDCR = currentStepData?.BasicDetails?.edcrDetails?.planDetail?.edcrRequest?.purchasableFar || false;
      const foundPurchasedFAR = common?.find((item) => item.value === purchasedFARFromEDCR) || null;
      setPurchasedFAR(foundPurchasedFAR);
    }, [currentStepData?.BasicDetails?.edcrDetails?.planDetail?.edcrRequest?.purchasableFar]);

    //providedFAR
    useEffect(() => {
      console.log("ProvidedFAR", providedFAR, currentStepData);
      if(currentStepData?.BasicDetails?.edcrDetails?.planDetail?.farDetails?.providedPurchasableFar){
        setProvidedFAR(currentStepData?.BasicDetails?.edcrDetails?.planDetail?.farDetails?.providedPurchasableFar)
      }else{
        setProvidedFAR("0.00");
      }
      if(currentStepData?.BasicDetails?.edcrDetails?.planDetail?.farDetails?.purchasableFar){
        setPurchasableFAR(currentStepData?.BasicDetails?.edcrDetails?.planDetail?.farDetails?.purchasableFar)
      }else{
        setPurchasableFAR("0.00");
      }
    }, [currentStepData?.BasicDetails?.edcrDetails?.planDetail?.farDetails])

    // ✅ greenbuilding
    useEffect(() => {
      if (typeof greenbuilding === "string") {
        const green = common.find((item) => item.code === greenbuilding);
        if (green) setgreenbuilding(green);
      } else if (greenbuilding === null) {
        if (currentStepData?.createdResponse?.additionalDetails?.greenbuilding) {
          setgreenbuilding(currentStepData?.createdResponse?.additionalDetails?.greenbuilding);
        }
      }
    }, [greenbuilding, currentStepData?.createdResponse?.additionalDetails?.greenbuilding]);

    // ✅ restrictedArea
    useEffect(() => {
      if (typeof restrictedArea === "string") {
        const area = common.find((item) => item.code === restrictedArea);
        if (area) setrestrictedArea(area);
      } else if (restrictedArea === null) {
        if (currentStepData?.createdResponse?.additionalDetails?.restrictedArea) {
          setrestrictedArea(currentStepData?.createdResponse?.additionalDetails?.restrictedArea);
        }
      }
    }, [restrictedArea, currentStepData?.createdResponse?.additionalDetails?.restrictedArea]);

    // ✅ proposedSite
    useEffect(() => {
      if (typeof proposedSite === "string") {
        const site = Typeofproposedsite.find((item) => item.code === proposedSite);
        if (site) setProposedSite(site);
      } else if (proposedSite === null) {
        if (currentStepData?.createdResponse?.additionalDetails?.proposedSite) {
          setProposedSite(currentStepData?.createdResponse?.additionalDetails?.proposedSite);
        }
      }
    }, [proposedSite, currentStepData?.createdResponse?.additionalDetails?.proposedSite]);

    // ✅ use (dropdown)
    useEffect(() => {
      if (typeof use === "string") {
        const usage = selectmasterDrop.find((item) => item.code === use);
        if (usage) setUse(usage);
      } else if (use === null) {
        if (currentStepData?.createdResponse?.additionalDetails?.use) {
          setUse(currentStepData?.createdResponse?.additionalDetails?.use);
        }
      }
    }, [use, currentStepData?.createdResponse?.additionalDetails?.use, commonmasterFieldsLoading, commonmasterFields]);

    // ✅ rating
    

    // ✅ ECBC fields
    useEffect(() => {
      if (typeof ecbcElectricalLoad === "string") {
        const val = yesNoOptions.find((item) => item.code === ecbcElectricalLoad);
        if (val) setEcbcElectricalLoad(val);
      }
    }, [ecbcElectricalLoad]);

    useEffect(() => {
      if (typeof ecbcDemandLoad === "string") {
        const val = yesNoOptions.find((item) => item.code === ecbcDemandLoad);
        if (val) setEcbcDemandLoad(val);
      }
    }, [ecbcDemandLoad]);

    useEffect(() => {
      if (typeof ecbcAirConditioned === "string") {
        const val = yesNoOptions.find((item) => item.code === ecbcAirConditioned);
        if (val) setEcbcAirConditioned(val);
      }
    }, [ecbcAirConditioned]);

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
    {
      code: "Colony Prior to 1995 (colony name)",
      i18nKey: "Colony Prior to 1995 (colony name)",
    },
    {
      code: "Stand Alone Projects",
      i18nKey: "Stand Alone Projects",

    }
  ]

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

  const TypeofproposedsiteSelected = useMemo(() => {
    if(currentStepData?.createdResponse?.additionalDetails?.isSelfCertification){
      return [{
      code: "PROPOSED",
      i18nKey: "Proposed",
    }]
    }else{
      return Typeofproposedsite
    }
  }, [currentStepData?.createdResponse?.additionalDetails?.isSelfCertification])

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

  // ✅ buildingStatus
    useEffect(() => {
      if (typeof buildingStatus === "string" && building_status?.length > 0) {
        const status = building_status.find((item) => item.code === buildingStatus);
        if (status) setbuildingStatus(status);
      } else if (buildingStatus === null) {
        if (currentStepData?.createdResponse?.additionalDetails?.buildingStatus) {
          setbuildingStatus(currentStepData?.createdResponse?.additionalDetails?.buildingStatus);
        }
      }
    }, [buildingStatus, commonBuilding, currentStepData?.createdResponse?.additionalDetails?.buildingStatus]);

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

    useEffect(() => {
      if (typeof rating === "string" && selectRating.length>0) {
        const rate = selectRating.find((item) => item.code === rating);
        if (rate) setrating(rate);
      } else if (rating === null) {
        if (currentStepData?.createdResponse?.additionalDetails?.rating) {
          setrating(currentStepData?.createdResponse?.additionalDetails?.rating);
        }
      }
    }, [rating, currentStepData?.createdResponse?.additionalDetails?.rating, commonrating]);

console.log("appDate", nocApprovedOn);

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
    console.log("  ECBC Electrical Load selected:", option)
    console.log("  Option code:", option?.code)
    setEcbcElectricalLoad(option)
    setErrors((prev) => ({ ...prev, ecbcElectricalLoad: "" }))
    // Force component re-render
    setTimeout(() => {
      console.log("  State after update:", option)
    }, 100)
  }

  function setEcbcDemandLoadHandler(option) {
    console.log("  ECBC Demand Load selected:", option)
    console.log("  Option code:", option?.code)
    setEcbcDemandLoad(option)
    setErrors((prev) => ({ ...prev, ecbcDemandLoad: "" }))
    // Force component re-render
    setTimeout(() => {
      console.log("  State after update:", option)
    }, 100)
  }

  function setEcbcAirConditionedHandler(option) {
    console.log("  ECBC Air Conditioned selected:", option)
    console.log("  Option code:", option?.code)
    setEcbcAirConditioned(option)
    setErrors((prev) => ({ ...prev, ecbcAirConditioned: "" }))
    // Force component re-render
    setTimeout(() => {
      console.log("  State after update:", option)
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

  function setapplicantOwnerOrFirmName(e) {
    setApplicantOwnerOrFirmName(e.target.value)
    setErrors((prev) => ({ ...prev, applicantOwnerOrFirmName: "" }))
  }
  function setnocULBName(e) {
    setNocULBName(e.target.value)
    setErrors((prev) => ({ ...prev, applicantOwnerOrFirmName: "" }))
  }
  function setnocULBType(e) {
    setNocULBType(e.target.value)
    setErrors((prev) => ({ ...prev, applicantOwnerOrFirmName: "" }))
  }

  function handleApproveDateChange(date) {
    console.log("Selected date:", date);
    setNocApprovedOn(date);
    setErrors((prev) => ({ ...prev, nocApprovedOn: "" }))
  }

  function selectfile(e) {
    // setUploadedFile(e.target.files[0])
    setFile(e.target.files[0])
    setErrors((prev) => ({ ...prev, file: "" }))
  }

  async function getRecieptSearch({ tenantId, payments, pdfkey, EmpData, applicationDetails, ...params }) {
    const application = applicationDetails?.Noc?.[0];
    try {
      if (!application) {
        throw new Error("Noc Application data is missing");
      }
      const nocSanctionData = await getNOCSanctionLetter(application, t, EmpData );

      let response = { filestoreIds: [payments?.fileStoreId] };
    response = await Digit.PaymentService.generatePdf(Digit.ULBService.getStateId(), { Payments: [{ ...payments ,Noc: nocSanctionData.Noc, }] }, pdfkey);
    setUploadedFile(response?.filestoreIds[0]);
    setLoader(false);
    // const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
    // window.open(fileStore[response?.filestoreIds[0]], "_blank");
    } catch (error) {
      setLoader(false);
      console.error("Sanction Letter download error:", error);
    }
    
  }

  async function onClick(e) {
    if(!NocNumber || NocNumber === ""){
      alert(t("NOC NUMBER IS REQUIRED BEFORE SEARCH"));
      return;
    }

    setLoader(true);
    try{
      const response = await Digit.OBPSService.NOCSearch(tenantId, { applicationNo: NocNumber });
      setLoader(false);
      console.log("NOC Search Response:", response);
      if(response && response?.Noc?.length>0 && response?.Noc?.[0]?.applicationStatus === "APPROVED"){
        const nocObject = response?.Noc?.[0];
        if(nocObject?.nocDetails?.additionalDetails?.applicationDetails?.applicantOwnerOrFirmName){
          setApplicantOwnerOrFirmName(nocObject?.nocDetails?.additionalDetails?.applicationDetails?.applicantOwnerOrFirmName)
        }
        if(nocObject?.nocDetails?.additionalDetails?.siteDetails?.ulbName){
          setNocULBName(nocObject?.nocDetails?.additionalDetails?.siteDetails?.ulbName)
        }
        if(nocObject?.nocDetails?.additionalDetails?.siteDetails?.ulbType){
          setNocULBType(nocObject?.nocDetails?.additionalDetails?.siteDetails?.ulbType)
        }
        if(nocObject?.nocDetails?.additionalDetails?.approvedOn){
          const [d1, m1, y1] = nocObject?.nocDetails?.additionalDetails?.approvedOn?.split("-");
          const jsDate1 = new Date(`${y1}-${m1}-${d1}`);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          jsDate1.setHours(0, 0, 0, 0);
          console.log("FetchedDate",nocObject?.nocDetails?.additionalDetails?.approvedOn, jsDate1);
          if (jsDate1 <= today) {
            setNocApprovedOn(`${y1}-${m1}-${d1}`)
          }          
        }
        setLoader(true);
        let EmpData = await EmployeeData(tenantId, NocNumber);
        console.log("Employee Data", EmpData);

        const reciept_data = await Digit.PaymentService.recieptSearch(tenantId,"obpas_noc",{consumerCodes: NocNumber,isEmployee: false,})
        if(reciept_data?.Payments?.length > 0){
          getRecieptSearch({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0],pdfkey: "noc-sanctionletter", EmpData, applicationDetails: response })
        }
        setLoader(false);
        return;
      }else if(response && response?.Noc?.length>0 && response?.Noc?.[0]?.applicationStatus !== "APPROVED"){
        alert(t("NOC NOT APPROVED"));
        return;
      }
      else{
        alert(t("NOC NOT FOUND OR NOT APPROVED"));
        return;
      }
    }catch(err){
      setLoader(false);
      alert(t("NOC NOT FOUND"));
      return;
    }    
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

  const goNext = async () => {
    if (!validateFields()) {
      return
    }

    // const additionalDetails = {
    //   ...currentStepData?.createdResponse?.additionalDetails,
    //   approvedColony,
    //   use,
    //   UlbName,
    //   Ulblisttype,
    //   District,
    //   rating,
    //   masterPlan,
    //   buildingStatus,
    //   purchasedFAR,
    //   greenbuilding,
    //   restrictedArea,
    //   proposedSite,
    //   nameofApprovedcolony,
    //   schemeName,
    //   transferredscheme,
    //   NocNumber,
    //   uploadedFile,
    //   greenuploadedFile,
    //   ecbcElectricalLoad,
    //   ecbcDemandLoad,
    //   ecbcAirConditioned,
    //   ecbcElectricalLoadFile,
    //   ecbcDemandLoadFile,
    //   ecbcAirConditionedFile,
    // }

    const additionalDetails = {
      ...currentStepData?.createdResponse?.additionalDetails,
      approvedColony: approvedColony?.code,
      use: use?.code,
      UlbName, // plain text
      Ulblisttype, // plain text
      District, // plain text
      rating: typeof rating === "string" ? rating : rating?.code,
      masterPlan: masterPlan?.code,
      // buildingStatus: buildingStatus?.code,
      buildingStatus:"",
      purchasedFAR: purchasedFAR?.value,
      providedFAR,
      purchasableFAR,
      greenbuilding: greenbuilding?.code,
      restrictedArea: restrictedArea?.code,
      proposedSite: proposedSite?.code,
      nameofApprovedcolony, // plain text
      schemeName, // plain text
      transferredscheme, // plain text
      NocNumber, // plain text
      nocObject: {
        applicantOwnerOrFirmName,
        ulbType: nocULBType,
        ulbName: nocULBName,
        approvedOn: nocApprovedOn,
      },      
      uploadedFile, // file object
      greenuploadedFile, // file object
      ecbcElectricalLoad: ecbcElectricalLoad?.code,
      ecbcDemandLoad: ecbcDemandLoad?.code,
      ecbcAirConditioned: ecbcAirConditioned?.code,
      ecbcElectricalLoadFile,
      ecbcDemandLoadFile,
      ecbcAirConditionedFile,
      ecbcCertificateFile
    };


    const userInfo = Digit.UserService.getUser()
    const accountId = userInfo?.info?.uuid
    const workflowAction = formData?.data?.applicationNo ? "SAVE_AS_DRAFT" : "INITIATE";

    try{
        setApiLoading(true);
        const result = await Digit.OBPSService.update({ BPA: {
          ...currentStepData?.createdResponse,
          additionalDetails,
          // documents,
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
        console.log("APIResponse", result);
      }catch(e){
        console.log("error", e);
        alert(t("BPA_CREATE_APPLICATION_FAILED"));
        setApiLoading(false);
      }

    console.log("formDataInNBDPage", additionalDetails, currentStepData?.createdResponse?.additionalDetails)

    // onSelect("")
  }

  const onSkip = () => onSelect()

  const ErrorMessage = ({ error }) => {
    if (!error) return null
    return <div className="newbuilding-error-message">{error}</div>
  }


  
    // ---------------- UI Classes are defined in BPANewBuildingdetails.css ----------------

    const renderLabel = (label, value) => (
      <div className="bpa-newbuilding-label-field-pair">
        <CardLabel className="bpa-newbuilding-bold-label">{label}</CardLabel>
        <div>{value || t("CS_NA")}</div>
      </div>
    );

    if(apiLoading) return <Loader/>

  return (
  <div >
    {/* {!Webview && <Timeline currentStep={2} />} */}
    <FormStep config={{...config, texts:{header: "BPA_ADDITIONAL_BUILDING_DETAILS"}}} onSelect={goNext} onSkip={onSkip} t={t} isDisabled={false}>
      <div className="bpa-newbuilding-bpa-section">
        {/* <h2 style={headingStyle}>{t("BPA_ULB_DETAILS")}</h2> */}

        <CardLabel>{`${t("BPA_ULB_NAME")} *`}</CardLabel>
        <TextInput
          t={t}
          type={"text"}
          isMandatory={false}
          optionKey="i18nKey"
          name="UlbName"
          value={UlbName}
          onChange={() => {}}
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
          onChange={() => {}}
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
          onChange={() => {}}
          ValidationRequired={false}
          disabled={true}
        />
        <ErrorMessage error={errors.Ulblisttype} />
      {/* </div>

      <div > */}

        <CardLabel>{`${t("BPA_APPROVED_COLONY")} *`}</CardLabel>
        <Controller
          control={control}
          name={"approvedColony"}
          defaultValue={approvedColony}
          render={(props) => (
            <Dropdown
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

        {(approvedColony?.code === "YES" || approvedColony?.code === "Colony Prior to 1995 (colony name)") && (
          <React.Fragment>
            <CardLabel>{`${t("BPA_APPROVED_COLONY_NAME")} *`}</CardLabel>
            <TextInput
              t={t}
              type={"text"}
              name="nameofApprovedcolony"
              value={nameofApprovedcolony}
              placeholder="Approved Colony Name"
              onChange={setNameapprovedcolony}
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
            <div className="bpa-newbuilding-field-container">
              <TextInput
                t={t}
                type={"text"}
                name="NocNumber"
                placeholder="NOC Number"
                value={NocNumber}
                onChange={setnocNumber}
                ValidationRequired={false}
                {...(validation = {
                  pattern: "^[a-zA-Z0-9]*$",
                  type: "text",
                  title: t("TL_NAME_ERROR_MESSAGE"),
                })}
              />
              <div className="bpa-newbuilding-search-icon-container" onClick={(e) => onClick(e)}>
                <SearchIcon />
              </div>
            </div>
            {errors.NocNumber && <ErrorMessage error={errors.NocNumber} />}
            <CardLabel>{`${t("BPA_NOC_APPLICANT_NAME")} *`}</CardLabel>
            <TextInput
                t={t}
                type={"text"}
                name="applicantOwnerOrFirmName"
                placeholder="Applicant/Owner/Firm Name"
                value={applicantOwnerOrFirmName}
                onChange={setapplicantOwnerOrFirmName}
                ValidationRequired={false}
                {...(validation = {
                  pattern: "^[a-zA-Z]*$",
                  type: "text",
                  title: t("TL_NAME_ERROR_MESSAGE"),
                })}
            />
            {errors.applicantOwnerOrFirmName && <ErrorMessage error={errors.applicantOwnerOrFirmName} />}              
            <CardLabel>{`${t("BPA_NOC_ULB_NAME")} *`}</CardLabel>
            <TextInput
                t={t}
                type={"text"}
                name="nocULBName"
                placeholder="Name Of ULB"
                value={nocULBName}
                onChange={setnocULBName}
                ValidationRequired={false}
                {...(validation = {
                  pattern: "^[a-zA-Z]*$",
                  type: "text",
                  title: t("TL_NAME_ERROR_MESSAGE"),
                })}
            />
            {errors.nocULBName && <ErrorMessage error={errors.nocULBName} />}              
            <CardLabel>{`${t("BPA_NOC_ULB_TYPE")} *`}</CardLabel>
            <TextInput
                t={t}
                type={"text"}
                name="nocULBType"
                placeholder="Type Of ULB"
                value={nocULBType}
                onChange={setnocULBType}
                ValidationRequired={false}
                {...(validation = {
                  pattern: "^[a-zA-Z]*$",
                  type: "text",
                  title: t("TL_NAME_ERROR_MESSAGE"),
                })}
            />
            {errors.nocULBType && <ErrorMessage error={errors.nocULBType} />}

              <div>
                <CardLabel>{t("BPA_NOC_APPROVED_ON")}</CardLabel> 
                <DatePicker
                  date={nocApprovedOn}
                  onChange={handleApproveDateChange}
                  min="1900-01-01"
                  max={new Date().toISOString().split("T")[0]}
                  isRequired={true}
                />
                {errors.nocApprovedOn && <ErrorMessage error={errors.nocApprovedOn} />}
              </div>         
            
            <div style={{marginBottom: "15px"}}>
            <CustomUploadFile
              id={"noc-doc"}
              onUpload={selectfile}
              onDelete={() => {
                setUploadedFile(null);
                setFile("");
              }}
              uploadedFile={uploadedFile}
              message={uploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
              error={errors.file}
              accept="image/*,.pdf"
            />
            {errors.NocDocument && <ErrorMessage error={errors.NocDocument} />}
            </div>
          </React.Fragment>
        )}
      {/* </div>

      <div> */}

        <CardLabel>{`${t("BPA_MASTER_PLAN")} *`}</CardLabel>
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

        {/* <CardLabel>{`${t("BPA_BUILDING_STATUS")} *`}</CardLabel>
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
        <ErrorMessage error={errors.buildingStatus} /> */}

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
              disable={true}
              t={t}
            />
          )}
        />
        <ErrorMessage error={errors.purchasedFAR} />

        {purchasedFAR?.code === "YES" && (
          <React.Fragment>
            <CardLabel>{`${t("BPA_ALLOWED_PROVIDED_FAR")} *`}</CardLabel>
            <TextInput
              t={t}
              type={"text"}
              name="purchasableFAR"
              value={purchasableFAR}
              disable={true}
            />
            {errors.purchasableFAR && <ErrorMessage error={errors.purchasableFAR} />}
            <CardLabel>{`${t("BPA_PROVIDED_FAR")} *`}</CardLabel>
            <TextInput
              t={t}
              type={"text"}
              name="providedFAR"
              value={providedFAR}
              disable={true}
            />
            {errors.providedFAR && <ErrorMessage error={errors.providedFAR} />}
          </React.Fragment>
        )}

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
            <CustomUploadFile
              id={"green-building-doc"}
              onUpload={selectfiles}
              onDelete={() => {
                setGreenUploadedFile(null);
                setFiles("");
              }}
              uploadedFile={greenuploadedFile}
              message={greenuploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
              error={errors.files}
              accept="image/*,.pdf"
            />
            {errors.greenuploadedFile && <ErrorMessage error={errors.greenuploadedFile} />}
            <br />

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
      {/* </div>

      <div> */}

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
              option={TypeofproposedsiteSelected}
              placeholder="Proposed Site Type"
              optionKey="i18nKey"
              t={t}
            />
          )}
        />
        <ErrorMessage error={errors.proposedSite} />
      {/* </div>

      <div> */}

        <CardLabel>{t(`ECBC - Proposed Connected Electrical Load is above 100 Kw`)}</CardLabel>
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

        <CardLabel>{t(`ECBC - Proposed Demand of Electrical Load is above 120 Kw`)}</CardLabel>
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

        <CardLabel>{t(`ECBC - Proposed Air Conditioned Area above 500 sq.mt`)}</CardLabel>
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
            <CustomUploadFile
              id="ecbc-certificate"
              accept=".pdf,.jpg,.png"
              onUpload={selectEcbcCertificateFile}
              onDelete={() => {
                setEcbcCertificateFile(null);
                setEcbcCertificateFileObj(null);
              }}
              uploadedFile={ecbcCertificateFile}
              // message={ecbcCertificateFileObj?.name || "Choose a file"}
              message={ecbcCertificateFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
            />
            {errors.ecbcCertificateFile && (
              <p className="error ecbc-error-text">{errors.ecbcCertificateFile}</p>
            )}
          </div>
        )}
      </div>
    </FormStep>    

    <ActionBar>
        <SubmitBar label="Back" className="submit-back" onSubmit={onGoBack} />
      <SubmitBar label={t(`CS_COMMON_NEXT`)} onSubmit={goNext} disabled={apiLoading} />
    </ActionBar>
    {loader && <LoaderNew page={true} />}
  </div>
  )
}

export default BPANewBuildingdetails

