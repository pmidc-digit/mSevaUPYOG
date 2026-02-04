import {
  TextInput,
  Header,
  Toast,
  Card,
  StatusTable,
  Row,
  Loader,
  Menu,
  PDFSvg,
  SubmitBar,
  LinkButton,
  ActionBar,
  CheckBox,
  MultiLink,
  CardText,
  CardSubHeader,
  CardLabel,
  OTPInput,
  TextArea,
  UploadFile,
  CardHeader,
  Table
} from "@mseva/digit-ui-react-components"
import React, { Fragment, useEffect, useState, useMemo } from "react"
import { useParams, useHistory } from "react-router-dom"
import { useQueryClient } from "react-query"
import { useTranslation } from "react-i18next"
import BPAApplicationTimeline from "./BPAApplicationTimeline"
import ActionModal from "./Modal"
import SubOccupancyTable from "../../../../../templates/ApplicationDetails/components/SubOccupancyTable"
import InspectionReport from "../../../../../templates/ApplicationDetails/components/InspectionReport"
import {
  getBusinessServices,
  getBPAFormData,
  convertDateToEpoch,
  printPdf,
  downloadPdf,
  getOrderDocuments,
  getDocsFromFileUrls,
  scrutinyDetailsData,
  amountToWords,
  getBase64Img
} from "../../../utils"
import cloneDeep from "lodash/cloneDeep"
import DocumentsPreview from "../../../../../templates/ApplicationDetails/components/DocumentsPreview"
import ScruntinyDetails from "../../../../../templates/ApplicationDetails/components/ScruntinyDetails"
import { Link } from "react-router-dom"
import CitizenConsent from "./CitizenConsent"
import FeeEstimation from "../../../pageComponents/FeeEstimation"
import CitizenAndArchitectPhoto from "../../../pageComponents/CitizenAndArchitectPhoto"
import ApplicationTimeline from "../../../../../templates/ApplicationDetails/components/ApplicationTimeline"
import NewApplicationTimeline from "../../../../../templates/ApplicationDetails/components/NewApplicationTimeline"


const BpaApplicationDetail = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenantId = localStorage.getItem("CITIZEN.CITY")
  // const tenantId = "pb.testing";
  const stateCode = Digit.ULBService.getStateId()
  const isMobile = window.Digit.Utils.browser.isMobile()
  const queryClient = useQueryClient()
  const [showToast, setShowToast] = useState(null)
  const [isTocAccepted, setIsTocAccepted] = useState(false)
  const [displayMenu, setDisplayMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [showOptions, setShowOptions] = useState(false)
  const [checkBoxVisible, setCheckBoxVisible] = useState(false)
  const [isEnableLoader, setIsEnableLoader] = useState(false)
  const [viewTimeline, setViewTimeline] = useState(false)
  const [datafromAPI, setDatafromAPI] = useState(null);
  const [isLoadingScrutiny, setIsLoadingScrutiny] = useState(false);
  sessionStorage.removeItem("BPA_SUBMIT_APP")
  sessionStorage.setItem("isEDCRDisable", JSON.stringify(true))
  sessionStorage.setItem("BPA_IS_ALREADY_WENT_OFF_DETAILS", JSON.stringify(false))
  const [fileUrls, setFileUrls] = useState({});
  const [ownerFileUrls, setOwnerFileUrls] = useState({});
  const [isOwnerFileLoading, setIsOwnerFileLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [userSelected, setUser] = useState(null);

  const user = Digit.UserService.getUser()

  const citizenmobilenumber = user?.info?.mobileNumber
  // data?.applicationData?.landInfo?.owners?.[0]?.mobileNumber

  const history = useHistory()
  sessionStorage.setItem("bpaApplicationDetails", false)
  let isFromSendBack = false
  const { data: stakeHolderDetails, isLoading: stakeHolderDetailsLoading } = Digit.Hooks.obps.useMDMS(
    stateCode,
    "StakeholderRegistraition",
    "TradeTypetoRoleMapping",
  )
  const value = "";
  const { isLoading: bpaDocsLoading, data: bpaDocs } = Digit.Hooks.obps.useMDMS(stateCode, "BPA", ["DocTypeMapping"])
  const { data, isLoading } = Digit.Hooks.obps.useBPADetailsPage(tenantId, { applicationNo: id })
  console.log('data for obps inbox', data)
  const { isMdmsLoadingFees, data: mdmsDataFees } = Digit.Hooks.obps.useMDMS(stateCode, "BPA", ["GaushalaFees", "MalbaCharges", "LabourCess"]);
  const isUserCitizen = data?.applicationData?.landInfo?.owners?.find((item) => item.mobileNumber === citizenmobilenumber) || false;
  const cities = Digit.Hooks.useTenants();
  const applicationType = data?.edcrDetails?.appliactionType
  const isOCApplication = applicationType === "BUILDING_OC_PLAN_SCRUTINY";




  // const { data: datafromAPI, isLoadingScrutiny, refetch } = Digit.Hooks.obps.useScrutinyDetails(tenantId, data?.applicationData?.edcrNumber, {
  //   enabled: data?.applicationData?.edcrNumber && tenantId ? true : false,
  // });
console.log('cities', cities, isOCApplication)
let ulbType,districtCode,ulbCode, subjectLine = "";
const loginCity = JSON.parse(sessionStorage.getItem("Digit.CITIZEN.COMMON.HOME.CITY"))?.value?.city?.name;
console.log('loginCity', loginCity)
if (cities.data !== undefined) {
    const selectedTenantData = cities.data.find((item) => item?.city?.name === loginCity);
    console.log('selectedTenantData', selectedTenantData)
    ulbType = selectedTenantData?.city?.ulbGrade;
    ulbCode= selectedTenantData?.city?.code;
    districtCode = selectedTenantData?.city?.districtCode;

    subjectLine =
      ulbType === "Municipal Corporation"
        ? "Sanction u/s 262(1) of PMC Act,1976"
        : ulbType === "Improvement Trust"
          ? "Sanctioned under Punjab Town Improvement Act, 1922"
          : "Sanction u/s 193 of PM Act,1911";
}
  console.log('ulbCode & districtCode & ulbType & subjectLine', ulbCode, districtCode,ulbType , subjectLine)

let buildingCategorysection,usage, fileno;
if (data){
      buildingCategorysection = data?.applicationDetails?.find(
      (section) => section.title === "BPA_BASIC_DETAILS_TITLE"
    );

    usage = t(buildingCategorysection?.values?.find(
      (val) => val.title === "BPA_BASIC_DETAILS_OCCUPANCY_LABEL"
    )?.value);
    if(cities.data !== undefined){
        fileno = `PB/${districtCode}/${ulbCode}/${+data?.applicationData?.approvalNo?.slice(-6) + 500000}`;

    }

}

  
console.log("building category here: & fileNo", usage,fileno);



  let improvedDoc = [];
  data?.applicationData?.documents?.map((appDoc) => {
    improvedDoc.push({ ...appDoc, module: "OBPS" });
  });
  data?.applicationData?.nocDocuments?.map((nocDoc) => {
    improvedDoc.push({ ...nocDoc, module: "NOC" });
  });

  const { data: pdfDetails, isLoading: pdfLoading, error } = Digit.Hooks.useDocumentSearch(improvedDoc, {
    enabled: improvedDoc?.length > 0 ? true : false,
  });

  let applicationDocs = [],
    nocAppDocs = [];
  if (pdfDetails?.pdfFiles?.length > 0) {
    pdfDetails?.pdfFiles?.map((pdfAppDoc) => {
      if (pdfAppDoc?.module == "OBPS") applicationDocs.push(pdfAppDoc);
      if (pdfAppDoc?.module == "NOC") nocAppDocs.push(pdfAppDoc);
    });
  }
  const [development, setDevelopment] = useState(() => {
    return data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES || "0";
  });


  const [otherCharges, setOtherCharges] = useState(() => {
    return data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES || "0";
  });

  const [lessAdjusment, setLessAdjusment] = useState(() => {
    return data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT || "0";
  });

  const [otherChargesDisc, setOtherChargesDisc] = useState(() => {
    return data?.applicationData?.additionalDetails?.otherFeesDiscription || "";
  });

  const [uploadedFile, setUploadedFile] = useState();
  const [uploadedFileLess, setUploadedFileLess] = useState(() => {
    return data?.applicationData?.additionalDetails?.uploadedFileLess || [];
  });
  const [file, setFile] = useState();
  // const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(tenantId.split(".")[0], "BPA", ["RiskTypeComputation"]);
  const applicationTenantId = data?.applicationData?.tenantId
  const safeTenantId = applicationTenantId ? applicationTenantId.split(".")[0] : null
  const [labourCess, setLabourCess] = useState(() => data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_LABOUR_CESS || "");
  const [gaushalaFees, setGaushalaFees] = useState(() => data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_GAUSHALA_CHARGES_CESS || "");
  const [malbafees, setMalbafees] = useState(() => data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_MALBA_CHARGES || "");
  const [waterCharges, setWaterCharges] = useState(() => data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_WATER_CHARGES || "");

  const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(safeTenantId, "BPA", ["RiskTypeComputation"], {
    enabled: !!safeTenantId,
  })

  const [adjustedAmounts, setAdjustedAmounts] = useState(() => data?.applicationData?.additionalDetails?.adjustedAmounts || []);

  // const ecbcDocumentsData = useMemo(() => {
  //         return (getDocsFromFileUrls(fileUrls) || []).map((doc, index) => ({
  //             id: index,
  //             title: doc.title ? t(doc.title) : t("CS_NA"), // ✅ no extra BPA_
  //             fileUrl: doc.fileURL || null, // adjusted since `doc` already has fileURL
  //         }));
  // }, [fileUrls, t]);

  const ecbcDocumentsData = useMemo(() => {
  const docs = getDocsFromFileUrls(fileUrls) || [];

  return docs.map((doc, index) => ({
    id: index,
    title: doc.title ? t(doc.title) : t("CS_NA"),
    fileUrl: doc.fileURL || null,
  }));
}, [fileUrls, t]);

  const ownerDocumentsData = useMemo(() => {
  // ownerFileUrls: { 0: { documentFile: 'url', ownerPhoto: 'url' }, 1: { ... } }
  if (!ownerFileUrls || typeof ownerFileUrls !== "object") return [];

  const ownersCount = Object.keys(ownerFileUrls).length;

  // Flatten into { "0_documentFile": "url", "1_ownerPhoto": "url", ... }
  const flatFileUrls = Object.entries(ownerFileUrls).reduce((acc, [ownerIdx, files]) => {
    if (files && typeof files === "object") {
      Object.entries(files).forEach(([prop, url]) => {
        if (url && url !== "NA" && url !== "" && url !== null && url !== undefined) {
          acc[`${ownerIdx}_${prop}`] = url;
        }
      });
    }
    return acc;
  }, {});

  const docs = getDocsFromFileUrls(flatFileUrls) || [];

  return docs.map((doc, index) => {
    // doc.id will be like "0_documentFile"
    const [ownerIdx, ...propParts] = String(doc.id).split("_");
    const prop = propParts.join("_"); // "documentFile" or "ownerPhoto"
    const baseTitle = (prop ? prop.toUpperCase() : (doc.title || "").toUpperCase());

    // Append index if more than 1 owner (ownerIdx is 0-based so +1)
    const title = ownersCount > 1 ? `${t(baseTitle)} ${parseInt(ownerIdx, 10) + 1}` : t(baseTitle);

    return {
      id: index,
      title,
      fileUrl: doc.fileURL || null,
    };
  });
}, [ownerFileUrls, t]);


  const mutation = Digit.Hooks.obps.useObpsAPI(data?.applicationData?.tenantId, false)
  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: data?.applicationData?.tenantId,
    id: id,
    moduleCode: "OBPS",
    config: {
      enabled: !!data,
    },
  })
  const userInfo = Digit.UserService.getUser();
console.log('userInfo', userInfo)
  const isArchitect = data?.applicationData?.additionalDetails?.architectMobileNumber === userInfo?.info?.mobileNumber;

  console.log("datata=====", workflowDetails, data, isArchitect)

  const [agree, setAgree] = useState(false)
  const setdeclarationhandler = () => {
    setShowTermsPopup(true)
    setAgree(true)
  }

  const state = Digit.ULBService.getStateId()
  const [showTermsPopup, setShowTermsPopup] = useState(false)
  const [showMobileInput, setShowMobileInput] = useState(false)
  const [mobileNumber, setMobileNumber] = useState(citizenmobilenumber || "")
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [otp, setOTP] = useState("")
  const [isOTPVerified, setIsOTPVerified] = useState(false)
  const [otpError, setOTPError] = useState("")
  const [otpSuccess, setOTPSuccess] = useState("");
  const otpVerifiedTimestamp = sessionStorage.getItem("otpVerifiedTimestampcitizen") || "";
  const isCitizenDeclared = sessionStorage.getItem("CitizenConsentdocFilestoreid") || "";
  const [errorFile, setError] = useState(null);
  const [isFileLoading, setIsFileLoading] = useState(false)

  useEffect(() => {
      if (!userSelected) {
        return;
      }
      Digit.SessionStorage.set("citizen.userRequestObject", user);
      Digit.UserService.setUser(userSelected);
      setCitizenDetail(userSelected?.info, userSelected?.access_token, stateCode);
  }, [userSelected]);

  const setCitizenDetail = (userObject, token, tenantId) => {
    let locale = JSON.parse(sessionStorage.getItem("Digit.initData"))?.value?.selectedLanguage;
    localStorage.setItem("Citizen.tenant-id", tenantId);
    localStorage.setItem("tenant-id", tenantId);
    localStorage.setItem("citizen.userRequestObject", JSON.stringify(userObject));
    localStorage.setItem("locale", locale);
    localStorage.setItem("Citizen.locale", locale);
    localStorage.setItem("token", token);
    localStorage.setItem("Citizen.token", token);
    localStorage.setItem("user-info", JSON.stringify(userObject));
    localStorage.setItem("Citizen.user-info", JSON.stringify(userObject));
  };

  const handleTermsLinkClick = (e) => {
      setShowTermsPopup(true)
  }

  const checkLabels = () => {
    return (
      <div>
        {t("I_AGREE_TO_BELOW_UNDERTAKING")}
        <br />
        {/* {!isCitizenDeclared && <LinkButton label={t("DECLARATION_UNDER_SELF_CERTIFICATION_SCHEME")} onClick={handleTermsLinkClick} />} */}
        {isCitizenDeclared !== "" && <div onClick={handleTermsLinkClick} style={{ color: "green" }} >{t("VIEW_DECLARATION")} </div>}
      </div>
    )
  }

  const handleVerifyClick = () => {
    setShowMobileInput(true)
  }

  const handleMobileNumberChange = (e) => {
    setMobileNumber(e.target.value)
  }
  const requestor = userInfo?.info?.mobileNumber;
console.log(requestor); 

    const { data: LicenseData, isLoading: LicenseDataLoading } = Digit.Hooks.obps.useBPAREGSearch(isArchitect? "pb.punjab" : tenantId, {}, {mobileNumber: requestor}, {cacheTime : 0});


  console.log('LicenseData', LicenseData)

  let stakeholderAddress="";

if (!LicenseDataLoading && requestor) {
  const matchedLicense = LicenseData?.Licenses?.find(
    lic => lic?.tradeLicenseDetail?.owners?.[0]?.mobileNumber === requestor
  );

  console.log('matchedLicense', matchedLicense)
  if (matchedLicense) {
    const owner = matchedLicense?.tradeLicenseDetail?.owners?.[0];

stakeholderAddress = [
  owner?.permanentAddress,
  owner?.permanentCity,
  owner?.permanentDistrict,
  owner?.permanentPinCode
]
.filter(Boolean) 
.join(", ");

console.log(stakeholderAddress,"stakeholderAddress");  }
}
  const handleGetOTPClick = async () => {
    // Call the Digit.UserService.sendOtp API to send the OTP
    try {
      const response = await Digit.UserService.sendOtp({
        otp: { mobileNumber: mobileNumber, tenantId: user?.info?.tenantId, userType: user?.info?.type, type: "login" },
      })
      if (response.isSuccessful) {
        setShowOTPInput(true)
      } else {
        // Handle error case if OTP sending fails
        console.error("Error sending OTP Response is false:", response.error)
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
    }
  }

  const handleOTPChange = (e) => {
    setOTP(e.target.value)
  }

  const requestData = {
    username: mobileNumber,
    password: otp,
    tenantId: user?.info?.tenantId,
    userType: user?.info?.type,
  }

  const handleVerifyOTPClick = async () => {
    // Call the API to verify the OTP
    try {
      // const response = await Digit.UserService.authenticate(requestData)
      const { ResponseInfo, UserRequest: info, ...tokens } = await Digit.UserService.authenticate(requestData)
      if (ResponseInfo.status === "Access Token generated successfully") {
        setIsOTPVerified(true)
        setOTPSuccess(t("VERIFIED"))
        const currentTimestamp = new Date()
        setOTPVerifiedTimestamp(currentTimestamp)
        sessionStorage.setItem("otpVerifiedTimestampcitizen", currentTimestamp.toISOString())
        setUser({ info, ...tokens });
      } else {
        setIsOTPVerified(false)
        setOTPError(t("WRONG OTP"))
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      setIsOTPVerified(false)
      setOTPError(t("Error verifying OTP"))
    }
  }
  function routeTo(jumpTo) {
    window.open(jumpTo, "_blank");
  }

  const documentsData = (getOrderDocuments(applicationDocs) || []).map((doc, index) => ({
    id: index,
    title: doc.title ? t(doc.title) : t("CS_NA"), // ✅ no extra BPA_
    fileUrl: doc.values?.[0]?.fileURL || null,
  }));
  const documentsColumnsOwner = [
    {
      Header: t("BPA_OWNER_DETAILS_LABEL"),
      accessor: "title",
      Cell: ({ value }) => t(value) || t("CS_NA"),
    },
    {
      Header: t(" "),
      accessor: "fileUrl",
      Cell: ({ value }) =>
        value ? (
          <LinkButton style={{ float: "right", display: "inline" }}
            label={t("View")}
            onClick={() => routeTo(value)}
          />
        ) : (
          t("CS_NA")
        ),
    },
  ];
  const documentsColumns = [
    {
      Header: t("BPA_DOCUMENT_DETAILS_LABEL"),
      accessor: "title",
      Cell: ({ value }) => t(value) || t("CS_NA"),
    },
    {
      Header: t(" "),
      accessor: "fileUrl",
      Cell: ({ value }) =>
        value ? (
          <LinkButton style={{ float: "right", display: "inline" }}
            label={t("View")}
            onClick={() => routeTo(value)}
          />
        ) : (
          t("CS_NA")
        ),
    },
  ];
  const documentsColumnsECBC = [
    {
      Header: t("BPA_ECBC_DETAILS_LABEL"),
      accessor: "title",
      Cell: ({ value }) => t(value) || t("CS_NA"),
    },
    {
      Header: t(" "),
      accessor: "fileUrl",
      Cell: ({ value }) =>
        value ? (
          <LinkButton style={{ float: "right", display: "inline" }}
            label={t("View")}
            onClick={() => routeTo(value)}
          />
        ) : (
          t("CS_NA")
        ),
    },
  ];

  const documentsEDCRColumns = [
    {
      Header: t("BPA_DOCUMENT_NAME"),
      accessor: "text",
      Cell: ({ value }) => t(value) || t("CS_NA"),
    },
    {
      Header: t(" "),
      accessor: "value",
      Cell: ({ value }) =>
        value ? (
          <LinkButton style={{ float: "right", display: "inline" }}
            label={t("View")}
            onClick={() => routeTo(value)}
          />
        ) : (
          t("CS_NA")
        ),
    },
  ];

  const oldEDCRDocumentsColumns = [
            {
                Header: t("BPA_EDCR_NO_LABEL"),
                accessor: "edcrNumber",
                Cell: ({ value }) => value || t("CS_NA"),
            },
            {
                Header: t(""),
                accessor: "planReport",
                Cell: ({ value }) =>
                    value ? (
                        <LinkButton style={{ float: "right", display: "inline" }}
                            label={t("View")}
                            onClick={() => routeTo(value)}
                        />
                    ) : (
                        t("CS_NA")
                    ),
            },
    ];

  const isValidMobileNumber = mobileNumber?.length === 10 && /^[0-9]+$/.test(mobileNumber)
  const citizenvalidations = sessionStorage.getItem("CitizenConsentdocFilestoreid") ? true : false

  let businessService = []
  let acceptFormat = ".pdf";

  if (data && data?.applicationData?.businessService === "BPA_LOW") {
    businessService = ["BPA.LOW_RISK_PERMIT_FEE"]
  } else if (data && data?.applicationData?.businessService === "BPA" && data?.applicationData?.riskType === "HIGH") {
    businessService = ["BPA.NC_APP_FEE", "BPA.NC_SAN_FEE"]
  } else {
    businessService = ["BPA.NC_OC_APP_FEE", "BPA.NC_OC_SAN_FEE"]
  }

  // useEffect(() => {
  //   if (!bpaDocsLoading && !isLoading) {
  //     let filtredBpaDocs = []
  //     if (bpaDocs?.BPA?.DocTypeMapping) {
  //       filtredBpaDocs = bpaDocs?.BPA?.DocTypeMapping?.filter(
  //         (ob) =>
  //           ob.WFState == "INPROGRESS" &&
  //           ob.RiskType == data?.applicationData?.riskType &&
  //           ob.ServiceType == data?.applicationData?.additionalDetails?.serviceType &&
  //           ob.applicationType == data?.applicationData?.additionalDetails?.applicationType,
  //       )
  //       const documents = data?.applicationDetails?.filter((ob) => ob.title === "BPA_DOCUMENT_DETAILS_LABEL")[0]
  //         ?.additionalDetails?.obpsDocuments?.[0]?.values
  //       const RealignedDocument = []
  //       filtredBpaDocs &&
  //         filtredBpaDocs?.[0]?.docTypes &&
  //         filtredBpaDocs?.[0]?.docTypes.map((ob) => {
  //           documents &&
  //             documents
  //               .filter((x) => ob.code === x.documentType.slice(0, x.documentType.lastIndexOf(".")))
  //               .map((doc) => {
  //                 RealignedDocument.push(doc)
  //               })
  //         })
  //       // const newApplicationDetails = data?.applicationDetails.map((obj) => {
  //       //   if (obj.title === "BPA_DOCUMENT_DETAILS_LABEL") {
  //       //     return { ...obj, additionalDetails: { obpsDocuments: [{ title: "", values: RealignedDocument }] } };
  //       //   }
  //       //   return obj;
  //       // });

  //       // data.applicationDetails = [...newApplicationDetails];

  //       const newApplicationDetails = (data?.applicationDetails || []).map((obj) => {
  //         if (obj.title === "BPA_DOCUMENT_DETAILS_LABEL") {
  //           return {
  //             ...obj,
  //             additionalDetails: { obpsDocuments: [{ title: "", values: RealignedDocument }] },
  //           }
  //         }
  //         return obj
  //       })

  //       if (newApplicationDetails?.length > 0) {
  //         data.applicationDetails = [...newApplicationDetails]
  //       }
  //     }
  //   }
  // }, [bpaDocs, data])

  // When data is loaded, update all states
useEffect(() => {
  if (data?.applicationData?.additionalDetails) {
    const selfCert = data.applicationData.additionalDetails.selfCertificationCharges || {};
    const otherDetails = data.applicationData.additionalDetails || {};

    setLabourCess(selfCert.BPA_LABOUR_CESS || "0");
    setGaushalaFees(selfCert.BPA_GAUSHALA_CHARGES_CESS || "0");
    setMalbafees(selfCert.BPA_MALBA_CHARGES || "0");
    setWaterCharges(selfCert.BPA_WATER_CHARGES || "0");

    setDevelopment(selfCert.BPA_DEVELOPMENT_CHARGES || "0");
    setOtherCharges(selfCert.BPA_OTHER_CHARGES || "0");
    setLessAdjusment(selfCert.BPA_LESS_ADJUSMENT_PLOT || "0");

    setOtherChargesDisc(otherDetails.otherFeesDiscription || "");
    setUploadedFileLess(otherDetails.uploadedFileLess || []);
    setAdjustedAmounts(data.applicationData.additionalDetails.adjustedAmounts || []);
  }
}, [data]);


  useEffect(() => {
    if (data?.applicationData?.status == "CITIZEN_APPROVAL_INPROCESS" || data?.applicationData?.status == "INPROGRESS")
      setCheckBoxVisible(true)
    else setCheckBoxVisible(false)
  }, [data])

  useEffect(() => {
    (async () => {
      setError(null);
      if (file && file?.type) {
        if (!acceptFormat?.split(",")?.includes(`.${file?.type?.split("/")?.pop()}`)) {
          setError(t("PT_UPLOAD_FORMAT_NOT_SUPPORTED"));
        } else if (file.size >= 2000000) {
          setError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage("property-upload", file, Digit.ULBService.getStateId());
            if (response?.data?.files?.length > 0) {
              setUploadedFileLess([...uploadedFileLess, { fileStoreId: response?.data?.files[0]?.fileStoreId, time: new Date() }]);
            } else {
              setError(t("PT_FILE_UPLOAD_ERROR"));
            }
          } catch (err) { }
        }
      }
    })();
  }, [file]);

  useEffect(() => {
    let plotArea = datafromAPI?.planDetail?.planInformation?.plotArea || data?.applicationData?.additionalDetails?.area;
    const LabourCess = Math.round(plotArea * 10.7639 > 909 ? mdmsDataFees?.BPA?.LabourCess[1].rate * (plotArea * 10.7639) : 0);
    const GaushalaFees = Math.round(mdmsDataFees?.BPA?.GaushalaFees[0].rate);
    const Malbafees = Math.round(
      plotArea * 10.7639 <= 500
        ? mdmsDataFees?.BPA?.MalbaCharges[0].rate
        : plotArea * 10.7639 > 500 && plotArea * 10.7639 <= 1000
          ? mdmsDataFees?.BPA?.MalbaCharges?.[1].rate
          : mdmsDataFees?.BPA?.MalbaCharges[2].rate || 500
    );
    console.log("Charges ", typeof LabourCess, GaushalaFees, Malbafees)
    setGaushalaFees(GaushalaFees?.toString() || "");
    setLabourCess(LabourCess?.toString() || "");
    setMalbafees(Malbafees?.toString() || "");
    setWaterCharges((Malbafees / 2)?.toString() || "");
  }, [mdmsData, data?.applicationData?.additionalDetails]);

  useEffect(async () => {
    if (data?.applicationData?.edcrNumber) {
      setIsLoadingScrutiny(true)
      const details = await scrutinyDetailsData(data?.applicationData?.edcrNumber, stateCode);
      if (details?.type == "ERROR") {
        // setShowToast({ message: details?.message });
        setDatafromAPI(null);
        setIsLoadingScrutiny(false)
      }
      if (details?.edcrNumber) {
        setDatafromAPI(details);
        setIsLoadingScrutiny(false)
      }
    }
  }, [data?.applicationData?.edcrNumber])

  const getTranslatedValues = (dataValue, isNotTranslated) => {
    if (dataValue) {
      return !isNotTranslated ? t(dataValue) : dataValue
    } else {
      return t("NA")
    }
  }

  async function getRecieptSearch({ tenantId, payments, ...params }) {
    let response = null
    console.log('payments here here', payments)
    const fee = payments?.totalAmountPaid;
    console.log('fee', fee)

  const amountinwords = amountToWords(fee)
  console.log('amountinwords', amountinwords)
    if (payments?.fileStoreId) {
      response = { filestoreIds: [payments?.fileStoreId] }
    } else if(payments?.paymentDetails?.[0]?.businessService === "BPA.NC_SAN_FEE") {
      const fileNo = fileno
      response = await Digit.PaymentService.generatePdf(stateCode, { Payments: [{ ...payments,usage,amountinwords,fileNo  }] }, "bpa-receiptsecond")
      console.log("Final Payments array:", [{ ...payments, usage }]);
    }
    else if(payments?.paymentDetails?.[0]?.businessService === "BPA.NC_APP_FEE") {
      response = await Digit.PaymentService.generatePdf(stateCode, { Payments: [{ ...payments,usage,amountinwords  }] }, "bpa-obps-receipt")
      console.log("Final Payments array:", [{ ...payments, usage }]);
    }
    else{
        response = await Digit.PaymentService.generatePdf(stateCode, { Payments: [{ ...payments,usage,amountinwords  }] }, "bpa-receipt") //to do: bpa-obps-receipt
        console.log("Final Payments array:", [{ ...payments, usage }]);
    }

    const fileStore = await Digit.PaymentService.printReciept(stateCode, { fileStoreIds: response.filestoreIds[0] })
    window.open(fileStore[response?.filestoreIds[0]], "_blank")
  }

  async function getPermitOccupancyOrderSearch({ tenantId}, order, mode = "download") {
const nowIST = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }).replace(',', '') + ' IST';

    console.log('nowIST', nowIST)
    const newValidityDate = new Date(data?.applicationData?.approvalDate);

    // validity date = approval date + 3 as per feedback
    newValidityDate.setFullYear(newValidityDate.getFullYear() + 3);
    const approvalDatePlusThree = newValidityDate.getTime();

    console.log("validity date",approvalDatePlusThree); 

    const designation = ulbType === "Municipal Corporation" ? "Municipal Commissioner" : "Executive Officer";
    const requestData = { ...data?.applicationData, edcrDetail: [{ ...data?.edcrDetails }], subjectLine , fileno, nowIST, newValidityDate,designation}
    console.log('requestData', requestData)
    let count = 0
    for (let i = 0; i < workflowDetails?.data?.processInstances?.length; i++) {
      if (
        (workflowDetails?.data?.processInstances[i]?.action === "POST_PAYMENT_APPLY" ||
          workflowDetails?.data?.processInstances[i]?.action === "PAY") &&
        workflowDetails?.data?.processInstances?.[i]?.state?.applicationStatus === "APPROVAL_INPROGRESS" &&
        count == 0
      ) {
        requestData.additionalDetails.submissionDate =
          workflowDetails?.data?.processInstances[i]?.auditDetails?.createdTime
        count = 1
      }
    }
    if (stakeholderAddress && requestData && requestData?.additionalDetails) {
      requestData.additionalDetails.stakeholderAddress = stakeholderAddress;
    }
    if(requestData && requestData?.additionalDetails?.signature?.signURL){
      const result = await getBase64Img(requestData?.additionalDetails?.signature?.signURL, state);
      requestData.additionalDetails.signature = {...requestData.additionalDetails.signature, base64Signature: result};
    }

    if (requestData?.additionalDetails?.approvedColony == "NO") {
      requestData.additionalDetails.permitData =
        "The plot has been officially regularized under No. " +
        requestData?.additionalDetails?.NocNumber +
        "  dated " + requestData?.additionalDetails?.nocObject?.approvedOn +  " , registered in the name of "+  requestData?.additionalDetails?.nocObject?.applicantOwnerOrFirmName + ". This regularization falls within the jurisdiction of " +
        requestData?.additionalDetails?.UlbName +
        ".Any form of misrepresentation of the NoC is strictly prohibited. Such misrepresentation renders the building plan null and void, and it will be regarded as an act of impersonation. Criminal proceedings will be initiated against the owner and concerned architect / engineer/ building designer / supervisor involved in such actions"
    } else if (requestData?.additionalDetails?.approvedColony == "YES") {
      requestData.additionalDetails.permitData =
        "The building plan falls under approved colony " + requestData?.additionalDetails?.nameofApprovedcolony
    }else if (requestData?.additionalDetails?.approvedColony == "Colony Prior to 1995 (colony name)") {
      requestData.additionalDetails.permitData =
        "The building plan falls under Colonies prior to 1995  " + requestData?.additionalDetails?.nameofApprovedcolony
    }else if (requestData?.additionalDetails?.approvedColony == "Stand Alone Projects") {
      requestData.additionalDetails.permitData =
        "The building plan falls under Stand-Alone Project."
    } else {
      requestData.additionalDetails.permitData = "The building plan falls under Lal Lakir"
    }
    const response = await Digit.PaymentService.generatePdf(tenantId, { Bpa: [requestData] }, order)
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] })
    window.open(fileStore[response?.filestoreIds[0]], "_blank")
    requestData["applicationType"] = data?.applicationData?.additionalDetails?.applicationType
    // const edcrResponse = await Digit.OBPSService.edcr_report_download({ BPA: { ...requestData } })
    // const responseStatus = Number.parseInt(edcrResponse.status, 10)
    // if (responseStatus === 201 || responseStatus === 200) {
    //   mode == "print"
    //     ? printPdf(new Blob([edcrResponse.data], { type: "application/pdf" }))
    //     : downloadPdf(new Blob([edcrResponse.data], { type: "application/pdf" }), `edcrReport.pdf`)
    // }
  }

  async function getRevocationPDFSearch({ tenantId, ...params }) {
    const requestData = { ...data?.applicationData }
    const response = await Digit.PaymentService.generatePdf(tenantId, { Bpa: [requestData] }, "bpa-revocation")
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] })
    window.open(fileStore[response?.filestoreIds[0]], "_blank")
  }

  useEffect(() => {
    const workflow = { action: selectedAction }
    switch (selectedAction) {
      case "APPROVE":
      case "SEND_TO_ARCHITECT":
      case "APPLY":
      case "SKIP_PAYMENT":
      case "POST_PAYMENT_APPROVE":
      case "POST_PAYMENT_APPLY":
        setShowModal(true)
    }
  }, [selectedAction])

  useEffect(() => {
          const fetchFileUrls = async () => {
              if (!data?.applicationData?.additionalDetails) return;
  
              const fileKeys = ["ecbcCertificateFile", "greenuploadedFile", "uploadedFile", "lessAdjustmentFeeFiles"];
  
              // Collect valid fileStoreIds
              const validFileStoreIds = fileKeys
                  .map((key) => {
                    if(key === "lessAdjustmentFeeFiles") return data?.applicationData?.additionalDetails?.[key]?.[0]?.fileStoreId || null;
                    return data?.applicationData?.additionalDetails?.[key]
                  })
                  .filter(
                      (id) => id && id !== "NA" && id !== "" && id !== null && id !== undefined
                  );
  
              if (validFileStoreIds.length === 0) return;
  
              try {
                  setIsFileLoading(true);
  
                  // Call Digit service
                  const result = await Digit.UploadServices.Filefetch(validFileStoreIds, state);
                  if (result?.data?.fileStoreIds) {
                      const urls = {};
                      fileKeys.forEach((key) => {
                          const fileId = data?.applicationData?.additionalDetails?.[key];
                          if (fileId && result.data?.[fileId]) {
                              urls[key] = result.data?.[fileId];
                          }
                      });
  
                      // Store URLs in state (example: object with keys)
                      setFileUrls(urls);
                  }
              } catch (error) {
                  console.error("Error fetching file URLs", error);
              } finally {
                  setIsFileLoading(false);
              }
          };
  
          fetchFileUrls();
  }, [data?.applicationData?.additionalDetails]);

  useEffect(() => {
  const fetchOwnerFileUrls = async () => {
    const owners = data?.applicationData?.landInfo?.owners || [];
    if (owners.length === 0) return;

    // Collect valid fileStoreIds from each owner
    const fileIdsMap = []; // keeps mapping of ownerIndex + propertyName to fileStoreId
    const validFileStoreIds = [];

    owners.forEach((owner, index) => {
      const docFile = owner?.additionalDetails?.documentFile;
      const photoFile = owner?.additionalDetails?.ownerPhoto;

      if (docFile && docFile !== "NA") {
        validFileStoreIds.push(docFile);
        fileIdsMap.push({ index, key: "documentFile", fileId: docFile });
      }
      if (photoFile && photoFile !== "NA") {
        validFileStoreIds.push(photoFile);
        fileIdsMap.push({ index, key: "ownerPhoto", fileId: photoFile });
      }
    });

    if (validFileStoreIds.length === 0) return;

    try {
      setIsOwnerFileLoading(true);

      // Fetch URLs
      const result = await Digit.UploadServices.Filefetch(validFileStoreIds, state);
      if (result?.data) {
        const urls = {};

        fileIdsMap.forEach(({ index, key, fileId }) => {
          if (result.data[fileId]) {
            if (!urls[index]) urls[index] = {};
            urls[index][key] = result.data[fileId];
          }
        });

        // Example final structure:
        // {
        //   0: { documentFile: "url1", ownerPhoto: "url2" },
        //   1: { documentFile: "url3" }
        // }
        setOwnerFileUrls(urls);
      }
    } catch (error) {
      console.error("Error fetching owner file URLs", error);
    } finally {
      setIsOwnerFileLoading(false);
    }
  };

  fetchOwnerFileUrls();
}, [data?.applicationData?.landInfo?.owners]);

  const closeToast = () => {
    setShowToast(null)
  }

  const downloadDiagram = (val) => {
    location.href = val
  }

  const handleChange = () => { }

  const closeModal = () => {
    setSelectedAction(null)
    setShowModal(false)
  }

  const closeTermsModal = () => {
    setShowTermsModal(false)
  }

  function onActionSelect(action) {
    const path = data?.applicationData?.businessService == "BPA_OC" ? "ocbpa" : "bpa";
    // if(!agree || !isCitizenDeclared || !isTocAccepted){
    //   alert("Please Accept Terms, Upload and Accept Decleration");
    //   return 
    // }
    const isCitizenConsentIncluded = workflowDetails?.data?.actionState?.state === "CITIZEN_APPROVAL_PENDING" && isUserCitizen
    console.log("SelectedAction", action, isCitizenConsentIncluded, isUserCitizen)
    if (isCitizenConsentIncluded && !isOCApplication) {
      if (!agree) {
        setIsEnableLoader(false);
        setShowToast({
          key: "error",
          action: t("Citizen_Consent_was_not_accepted")
        });
        return;
      }
      if (!otpVerifiedTimestamp) { //notto
        setIsEnableLoader(false);
        setShowToast({
          key: "error",
          action: t("Not_OTP_VERIFIED")
        });
        return;
      }
      if (!sessionStorage.getItem("CitizenConsentdocFilestoreid")) {
        setIsEnableLoader(false);
        setShowToast({
          key: "error",
          action: t("Citizen_Consent_was_not_uploaded")
        });
        return;
      }
    }
    if (action === "FORWARD") {
      history.replace(
        `/digit-ui/citizen/obps/sendbacktocitizen/ocbpa/${data?.applicationData?.tenantId}/${data?.applicationData?.applicationNo}/check`,
        { data: data?.applicationData, edcrDetails: data?.edcrDetails },
      )
    }
    if (action === "PAY") {
      window.location.assign(
        `${window.location.origin}/digit-ui/citizen/payment/collect/${`${getBusinessServices(data?.businessService, data?.applicationStatus, data?.applicationData?.additionalDetails?.applicationType)}/${id}/${data?.tenantId
        }?tenantId=${data?.tenantId}`}`,
      )
    }
    if (action === "SAVE_AS_DRAFT") {
      getBPAFormData(data?.applicationData, mdmsData, history, t, path)
    }
    if(action === "SEND_TO_CITIZEN" || action === "RESUBMIT" || action === "RESUBMIT_AND_PAY" || action === "APPROVE_AND_PAY"){
      if(!validateDataForAction(action)){
        return;
      }
      saveAsDraft(data?.applicationData, action)
    }
    setSelectedAction(action)
    setDisplayMenu(false)
  }

  const validateDataForAction = (action) => {
    if(action === "SEND_TO_CITIZEN"){
      const isArchitectUnderTakingIncluded = data?.applicationData?.documents?.some(item => item?.documentType === "ARCHITECT.UNDERTAKING");
      const isFeesDeclared = data?.applicationData?.additionalDetails?.isFeesDeclared;
      if(!isFeesDeclared){
        setShowToast({
          key: "error",
          action: t("Please Declare Fees Under Self Certification Scheme")
        })
        return false
      }
      if(!isArchitectUnderTakingIncluded) {
        setShowToast({
          key: "error",
          action: t("Please_Upload_Architect_UnderTaking")
        })
        return false
      }
      else{
        return true
      }
    }
    else if(action === "APPROVE_AND_PAY" && !isOCApplication){
      if (!isTocAccepted) {
        setIsEnableLoader(false);
        setShowToast({
          key: "error",
          action: t("Terms_And_Condition_Not_Accepted")
        });
        return false;
      }
      else if (!agree) {
        setIsEnableLoader(false);
        setShowToast({
          key: "error",
          action: t("Citizen_Consent_was_not_accepted")
        });
        return false;
      }
      else if (!otpVerifiedTimestamp) { //notto
        setIsEnableLoader(false);
        setShowToast({
          key: "error",
          action: t("Not_OTP_VERIFIED")
        });
        return false;
      }
      else if (!sessionStorage.getItem("CitizenConsentdocFilestoreid")) {
        setIsEnableLoader(false);
        setShowToast({
          key: "error",
          action: t("Citizen_Consent_was_not_uploaded")
        });
        return false;
      }
      else{
        return true
      }
    }
    else{
      return true;
    }
  }

  const saveAsDraft = async (data,action ) => {
    console.log("SEND_TO_CITIZEN_Action",data)
    const app = data || {};
    const docs = Array.isArray(app.documents) ? app.documents : [];
    const dedupedDocs = Array.from(
      docs.reduce((map, doc) => {
        const key = doc?.documentType;
        if (!key) return map;
        const existing = map.get(key);
        if (!existing) {
          map.set(key, doc);
        } else if (!existing.fileStoreId && doc.fileStoreId) {
          map.set(key, doc);
        }
        return map;
      }, new Map()).values()
    );
    const isCitizenConsentIncluded = workflowDetails?.data?.actionState?.state === "CITIZEN_APPROVAL_PENDING" && isUserCitizen;

    if(!data?.additionalDetails?.selfCertificationCharges){
      setShowToast({
        key: "error",
        action: "Please_Complete_Application_First"
      })
      return;
    }
    let updatedDocuments
    if(action === "APPROVE_AND_PAY" && isCitizenConsentIncluded){
      const citizenUndertakingExists = dedupedDocs?.some(
        (doc) => doc.documentType === "CITIZEN.UNDERTAKING",
      )
      updatedDocuments = [
        ...dedupedDocs.filter((doc) => doc.documentType !== "CITIZEN.UNDERTAKING"),
        ...(citizenUndertakingExists
          ? dedupedDocs.filter((doc) => doc.documentType === "CITIZEN.UNDERTAKING")
          : [
            {
              documentType: "CITIZEN.UNDERTAKING",
              fileStoreId: sessionStorage.getItem("CitizenConsentdocFilestoreid"),
              fileStore: sessionStorage.getItem("CitizenConsentdocFilestoreid"),
            },
          ]),
      ]
    }
    const userInfo = Digit.UserService.getUser()
    const accountId = userInfo?.info?.uuid
    const workflowAction = action;
    try {
            setApiLoading(true);
            const result = await Digit.OBPSService.update({
                BPA: {
                  ...data,
                  applicationType,
                  riskType: data?.additionalDetails?.riskType,
                  documents: (isCitizenConsentIncluded && action === "APPROVE_AND_PAY") ? updatedDocuments : app.documents,
                  workflow: {
                        action: workflowAction,
                        assignes: (workflowAction === "RESUBMIT") || (workflowAction === "RESUBMIT_AND_PAY") || (workflowAction === "APPROVE_AND_PAY") ? [] : [accountId]
                  }
                }
            }, tenantId)
            if (result?.ResponseInfo?.status === "successful") {
                setApiLoading(false);
                if(action === "APPROVE_AND_PAY"){
                  history.replace(`/digit-ui/citizen/obps/response`, { data: result });                  
                }
                else{
                  history.push(`/digit-ui/citizen/obps/self-certification/response/${data?.applicationNo}`,{workflowAction});
                }                
            } else {
                alert(t("BPA_CREATE_APPLICATION_FAILED"));
                setApiLoading(false);
            }
            console.log("APIResponse", result);
        } catch (e) {
            console.log("error", e);
            alert(t("BPA_CREATE_APPLICATION_FAILED"));
            setApiLoading(false);
        }
  }

  function checkForSubmitDisable() {
    return false
    // Original logic commented out:
    // if (checkBoxVisible) return isFromSendBack ? !isFromSendBack : !isTocAccepted
    // else return false
  }

  // const submitAction = (workflow) => {
  //   setIsEnableLoader(true);
  //   mutation.mutate(
  //     { BPA: { ...data?.applicationData, workflow } },
  //     {
  //       onError: (error, variables) => {
  //         setIsEnableLoader(false);
  //         setShowModal(false);
  //         setShowToast({ key: "error", action: error?.response?.data?.Errors[0]?.message ? error?.response?.data?.Errors[0]?.message : error });
  //         setTimeout(closeToast, 5000);
  //       },
  //       onSuccess: (data, variables) => {
  //         setIsEnableLoader(false);
  //         history.replace(`/digit-ui/citizen/obps/response`, { data: data });
  //         setShowModal(false);
  //         setShowToast({ key: "success", action: selectedAction });
  //         setTimeout(closeToast, 5000);
  //         queryClient.invalidateQueries("BPA_DETAILS_PAGE");
  //         queryClient.invalidateQueries("workFlowDetails");
  //       },
  //     }
  //   );
  // }

  // const submitAction = (workflow) => {
  //   setIsEnableLoader(true)

  //   // Check if "CITIZEN.UNDERTAKING" document already exists
  // const citizenUndertakingExists = data?.applicationData?.documents?.some(
  //   (doc) => doc.documentType === "CITIZEN.UNDERTAKING",
  // )

  //   // Create a new array with the existing documents and the new Citizenconsentform (if it doesn't exist)
  // const updatedDocuments = [
  //   ...data?.applicationData?.documents.filter((doc) => doc.documentType !== "CITIZEN.UNDERTAKING"),
  //   ...(citizenUndertakingExists
  //     ? data?.applicationData?.documents.filter((doc) => doc.documentType === "CITIZEN.UNDERTAKING")
  //     : [
  //         {
  //           documentType: "CITIZEN.UNDERTAKING",
  //           fileStoreId: sessionStorage.getItem("CitizenConsentdocFilestoreid"),
  //           fileStore: sessionStorage.getItem("CitizenConsentdocFilestoreid"),
  //         },
  //       ]),
  // ]

  //   // Update the applicationData object with the new documents array
  //   const updatedApplicationData = {
  //     ...data?.applicationData,
  //     documents: updatedDocuments,
  //     additionalDetails: {
  //       ...data?.applicationData?.additionalDetails,
  //       otpVerifiedTimestampcitizen: sessionStorage.getItem("otpVerifiedTimestampcitizen"),
  //     },
  //   }

  //   mutation.mutate(
  //     { BPA: { ...updatedApplicationData, workflow } },
  //     {
  //       onError: (error, variables) => {
  //         setIsEnableLoader(false)
  //         setShowModal(false)
  //         setShowToast({
  //           key: "error",
  //           action: error?.response?.data?.Errors[0]?.message ? error?.response?.data?.Errors[0]?.message : error,
  //         })
  //         setTimeout(closeToast, 5000)
  //       },
  //       onSuccess: (data, variables) => {
  //         setIsEnableLoader(false)
  //         history.replace(`/digit-ui/citizen/obps/response`, { data: data })
  //         setShowModal(false)
  //         setShowToast({ key: "success", action: selectedAction })
  //         setTimeout(closeToast, 5000)
  //         queryClient.invalidateQueries("BPA_DETAILS_PAGE")
  //         queryClient.invalidateQueries("workFlowDetails")
  //       },
  //     },
  //   )
  // }

  function validateAmount(value) {
    if (value === null || value === undefined) return ""; // optional → allowed
    const str = String(value).trim(); // safely convert to string
    if (str === "") return ""; // treat empty as optional
    return /^[0-9]+(\.[0-9]{1,2})?$/.test(str) ? str : null;
  }

  const validateCharges = () => {
    const fields = [
      { name: t("Malba_Charges"), value: malbafees },
      { name: t("Labour_Cess"), value: labourCess },
      { name: t("Water_Charges"), value: waterCharges },
      { name: t("Gaushala_Fees"), value: gaushalaFees },
      { name: t("Less_Adjustment"), value: lessAdjusment },
      { name: t("Development_Charges"), value: development },
      { name: t("Other_Charges"), value: otherCharges },
    ];

    for (const field of fields) {
      if (validateAmount(field.value) === null) {
        setShowToast({
          key: "error",
          action: t(`Invalid value in ${field.name}. Please enter a valid number (up to 2 decimals).`)
        });
        return false;
      }
    }
    return true;
  };


  const submitAction = (workflow) => {
    setIsEnableLoader(true);

    const app = data?.applicationData || {};
    app.riskType = app?.additionalDetails?.riskType
    const docs = Array.isArray(app.documents) ? app.documents : [];
    const isCitizenConsentIncluded = workflowDetails?.data?.actionState?.state === "CITIZEN_APPROVAL_PENDING" && isUserCitizen
    const isArchitectSubmissionPending = workflowDetails?.data?.actionState?.state === "INPROGRESS" && !isUserCitizen;

    // Keep one per documentType; prefer entries that have fileStoreId
    const dedupedDocs = Array.from(
      docs.reduce((map, doc) => {
        const key = doc?.documentType;
        if (!key) return map;
        const existing = map.get(key);
        if (!existing) {
          map.set(key, doc);
        } else if (!existing.fileStoreId && doc.fileStoreId) {
          map.set(key, doc);
        }
        return map;
      }, new Map()).values()
    );
    if (!isTocAccepted) {
        setIsEnableLoader(false);
        setShowToast({
          key: "error",
          action: t("Terms_And_Condition_Not_Accepted")
        });
        return;
    }

    let updatedDocuments
    let additionalDetails
    if (isCitizenConsentIncluded && !isOCApplication) {
      if (!agree) {
        setIsEnableLoader(false);
        setShowToast({
          key: "error",
          action: t("Citizen_Consent_was_not_accepted")
        });
        return;
      }
      if (!otpVerifiedTimestamp) { //notto
        setIsEnableLoader(false);
        setShowToast({
          key: "error",
          action: t("Not_OTP_VERIFIED")
        });
        return;
      }
      if (!sessionStorage.getItem("CitizenConsentdocFilestoreid")) {
        setIsEnableLoader(false);
        setShowToast({
          key: "error",
          action: t("Citizen_Consent_was_not_uploaded")
        });
        return;
      }
      const citizenUndertakingExists = dedupedDocs?.some(
        (doc) => doc.documentType === "CITIZEN.UNDERTAKING",
      )
      updatedDocuments = [
        ...dedupedDocs.filter((doc) => doc.documentType !== "CITIZEN.UNDERTAKING"),
        ...(citizenUndertakingExists
          ? dedupedDocs.filter((doc) => doc.documentType === "CITIZEN.UNDERTAKING")
          : [
            {
              documentType: "CITIZEN.UNDERTAKING",
              fileStoreId: sessionStorage.getItem("CitizenConsentdocFilestoreid"),
              fileStore: sessionStorage.getItem("CitizenConsentdocFilestoreid"),
            },
          ]),
      ]
    }
    if (isArchitectSubmissionPending) {
      if (!validateCharges()) return;
      additionalDetails = {
        ...app?.additionalDetails,
        otherFeesDiscription: otherChargesDisc || "",
        lessAdjustmentFeeFiles: uploadedFileLess || [],
        adjustedAmounts: adjustedAmounts || [],
        selfCertificationCharges: {
          BPA_MALBA_CHARGES: malbafees?.length > 0 ? malbafees : "0",
          BPA_LABOUR_CESS: labourCess?.length > 0 ? labourCess : "0",
          BPA_WATER_CHARGES: waterCharges?.length > 0 ? waterCharges : "0",
          BPA_GAUSHALA_CHARGES_CESS: gaushalaFees?.length > 0 ? gaushalaFees : "0",
          BPA_LESS_ADJUSMENT_PLOT: lessAdjusment?.length > 0 ? lessAdjusment : "0",
          BPA_DEVELOPMENT_CHARGES: development?.length > 0 ? development : "0",
          BPA_OTHER_CHARGES: otherCharges?.length > 0 ? otherCharges : "0"
        }
      }
    }

    let payload = { ...app, applicationType, documents: isCitizenConsentIncluded ? updatedDocuments : dedupedDocs, additionalDetails: isArchitectSubmissionPending ? additionalDetails : app?.additionalDetails, workflow }; //

    mutation.mutate(
      { BPA: payload },
      {
        onError: (error, variables) => {
          setIsEnableLoader(false);
          setShowModal(false);
          setShowToast({
            key: "error",
            action: error?.response?.data?.Errors?.[0]?.message
              ? error?.response?.data?.Errors?.[0]?.message
              : error,
          });
          setTimeout(closeToast, 5000);
        },
        onSuccess: (data, variables) => {
          setIsEnableLoader(false);
          console.log("dataOfResponse", data);
          history.replace(`/digit-ui/citizen/obps/response`, { data: data });
          setShowModal(false);
          setShowToast({ key: "success", action: selectedAction });
          setTimeout(closeToast, 5000);
          queryClient.invalidateQueries("BPA_DETAILS_PAGE");
          queryClient.invalidateQueries("workFlowDetails");
        },
      }
    );
  }

  if (workflowDetails?.data?.newNextAction?.length > 0 && data?.applicationData?.status == "CITIZEN_APPROVAL_INPROCESS") {
    const userInfo = Digit.UserService.getUser()
    const rolearray = userInfo?.info?.roles
    if (data?.applicationData?.status == "CITIZEN_APPROVAL_INPROCESS") {
      if (rolearray?.length == 1 && rolearray?.[0]?.code == "CITIZEN") {
        workflowDetails.data.nextActions = workflowDetails?.data?.newNextAction
      } else {
        workflowDetails.data.nextActions = []
      }
    } else if (data?.applicationData?.status == "INPROGRESS") {
      let isArchitect = false
      const roles = []
      stakeHolderDetails?.StakeholderRegistraition?.TradeTypetoRoleMapping?.map((type) => {
        type?.role?.map((role) => {
          roles.push(role)
        })
      })
      const uniqueRoles = roles.filter((item, i, ar) => ar.indexOf(item) === i)
      if (rolearray?.length > 1) {
        rolearray.forEach((role) => {
          if (uniqueRoles.includes(role.code)) {
            isArchitect = true
          }
        })
      }
      if (isArchitect) {
        workflowDetails.data.nextActions = workflowDetails?.data?.newNextAction
      } else {
        workflowDetails.data.nextActions = []
      }
    }
  }

  if (workflowDetails?.data?.processInstances?.[0]?.action === "SEND_BACK_TO_CITIZEN") {
    if (isTocAccepted) setIsTocAccepted(true)
    isFromSendBack = true
    const userInfo = Digit.UserService.getUser()
    const rolearray = userInfo?.info?.roles
    if (rolearray?.length !== 1) {
      workflowDetails = {
        ...workflowDetails,
        data: {
          ...workflowDetails?.data,
          actionState: {
            nextActions: [],
          },
        },
        data: {
          ...workflowDetails?.data,
          nextActions: [],
        },
      }
    }
  }

  if (isLoading || isEnableLoader ||LicenseDataLoading || isMdmsLoading || isLoadingScrutiny || isMdmsLoadingFees || apiLoading) {
    return <Loader />
  }

  const dowloadOptions = []

  if (data?.collectionBillDetails?.length > 0) {
    const bpaPayments = cloneDeep(data?.collectionBillDetails)
    bpaPayments.forEach((pay) => {
      if (pay?.paymentDetails[0]?.businessService === "BPA.NC_OC_APP_FEE") {
        dowloadOptions.push({
          order: 1,
          label: t("BPA_APP_FEE_RECEIPT"),
          onClick: () =>
            getRecieptSearch({
              tenantId: data?.applicationData?.tenantId,
              payments: pay,
              consumerCodes: data?.applicationData?.applicationNo,
            }),
        })
      }

      if (pay?.paymentDetails[0]?.businessService === "BPA.NC_OC_SAN_FEE") {
        dowloadOptions.push({
          order: 2,
          label: t("BPA_OC_DEV_PEN_RECEIPT"),
          onClick: () =>
            getRecieptSearch({
              tenantId: data?.applicationData?.tenantId,
              payments: pay,
              consumerCodes: data?.applicationData?.applicationNo,
            }),
        })
      }

      if (pay?.paymentDetails[0]?.businessService === "BPA.LOW_RISK_PERMIT_FEE") {
        dowloadOptions.push({
          order: 1,
          label: t("BPA_FEE_RECEIPT"),
          onClick: () =>
            getRecieptSearch({
              tenantId: data?.applicationData?.tenantId,
              payments: pay,
              consumerCodes: data?.applicationData?.applicationNo,
            }),
        })
      }

      if (pay?.paymentDetails[0]?.businessService === "BPA.NC_APP_FEE") {
        dowloadOptions.push({
          order: 1,
          label: t("BPA_APP_FEE_RECEIPT"),
          onClick: () =>
            getRecieptSearch({
              tenantId: data?.applicationData?.tenantId,
              payments: pay,
              consumerCodes: data?.applicationData?.applicationNo,
            }),
        })
      }

      if (pay?.paymentDetails[0]?.businessService === "BPA.NC_SAN_FEE") {
        dowloadOptions.push({
          order: 2,
          label: t("BPA_SAN_FEE_RECEIPT"),
          onClick: () =>
            getRecieptSearch({
              tenantId: data?.applicationData?.tenantId,
              payments: pay,
              consumerCodes: data?.applicationData?.applicationNo,
            }),
        })
      }
    })
  }

  if (data && data?.applicationData?.businessService === "BPA_LOW" && data?.collectionBillDetails?.length > 0 && data?.applicationData?.additionalDetails?.isSanctionLetterGenerated) {
    !data?.applicationData?.status.includes("REVOCATION") &&
      dowloadOptions.push({
        order: 3,
        label: t("BPA_PERMIT_ORDER"),
        onClick: () =>
          getPermitOccupancyOrderSearch({ tenantId: stateCode}, "buildingpermit"),
      })
    data?.applicationData?.status.includes("REVOCATION") &&
      dowloadOptions.push({
        order: 3,
        label: t("BPA_REVOCATION_PDF_LABEL"),
        onClick: () => getRevocationPDFSearch({ tenantId: data?.applicationData?.tenantId }),
      })
  } else if (data && data?.applicationData?.businessService === "BPA" && data?.collectionBillDetails?.length > 0) {
    if (data?.applicationData?.status === "APPROVED") {
      dowloadOptions.push({
        order: 3,
        label: t("BPA_PERMIT_ORDER"),
        onClick: () => getPermitOccupancyOrderSearch({ tenantId: stateCode}, "buildingpermit"),
      })
    }
  } else {
    if (data?.applicationData?.status === "APPROVED") {
      dowloadOptions.push({
        order: 3,
        label: t("BPA_OC_CERTIFICATE"),
        onClick: () =>
          getPermitOccupancyOrderSearch({ tenantId: data?.applicationData?.tenantId }, "buildingpermit"),
      })
    }
  }

  if (data?.comparisionReport) {
    dowloadOptions.push({
      order: 4,
      label: t("BPA_COMPARISON_REPORT_LABEL"),
      onClick: () => window.open(data?.comparisionReport?.comparisonReport, "_blank"),
    })
  }

  dowloadOptions.sort((a, b) => a.order - b.order)

  if (workflowDetails?.data?.newNextAction?.length > 0) {
    workflowDetails.data.nextActions = workflowDetails?.data?.newNextAction?.filter((actn) => actn.action !== "INITIATE")
    workflowDetails.data.nextActions = workflowDetails?.data?.newNextAction?.filter((actn) => actn.action !== "ADHOC")
    workflowDetails.data.nextActions = workflowDetails?.data?.newNextAction?.filter(
      (actn) => actn.action !== "SKIP_PAYMENT",
    )
  }

  if (data?.applicationDetails?.length > 0) {
    data.applicationDetails =
      data?.applicationDetails?.length > 0 &&
      data?.applicationDetails?.filter((bpaData) => Object.keys(bpaData)?.length !== 0)
  }

  const getCheckBoxLable = () => {
    return (
      <div>
        <span>{`${t("BPA_I_AGREE_THE_LABEL")} `}</span>
        <span style={{ color: "#a82227", cursor: "pointer" }} onClick={() => setShowTermsModal(!showTermsModal)}>
          {t(`BPA_TERMS_AND_CONDITIONS_LABEL`)}
        </span>
      </div>
    )
  }
  const handleViewTimeline = () => {
    const timelineSection = document.getElementById("timeline")
    if (timelineSection) {
      timelineSection.scrollIntoView({ behavior: "smooth" })
    }
    setViewTimeline(true)
  }

  function setOtherChargesVal(value) {
    if (/^[0-9]*$/.test(value)) {
      setOtherCharges(value);
      sessionStorage.setItem("otherCharges", value);
    } else {
      alert(t("Please enter numbers"));
    }
  }

  function setDevelopmentVal(value) {
    if (/^\d{0,10}$/.test(value)) {
      setDevelopment(value);
      sessionStorage.setItem("development", value);
    } else {
      alert(t("Please enter numbers"));
    }
  }

  function setLessAdjusmentVal(value) {
    if (/^[0-9]*$/.test(value)) {
      if (
        parseInt(value) >
        (parseInt(development) ? parseInt(development) : 0) +
        (parseInt(otherCharges) ? parseInt(otherCharges) : 0) +
        parseInt(malbafees) +
        parseInt(labourCess) +
        parseInt(waterCharges) +
        parseInt(gaushalaFees)
      ) {
        alert(t("Less adjustment fees cannot be grater than Total of other P2 fees"));
      } else {
        setLessAdjusment(value);
        sessionStorage.setItem("lessAdjusment", value);
      }
    } else {
      alert(t("Please enter numbers"));
    }
  }

  function setOtherChargesDis(value) {
    setOtherChargesDisc(value);
    // sessionStorage.setItem("otherChargesDisc", value);
  }

  function selectfile(e) {
    setUploadedFile(e.target.files[0]);
    setFile(e.target.files[0]);
  }

  const results = data?.applicationDetails?.filter((element) => {
    if (Object.keys(element)?.length !== 0) {
      return true
    }
    return false
  })

  if (results?.length > 0) {
    data.applicationDetails = results
  }

  return (
    <Fragment>
      <div style={{ paddingBottom: "50px" }}>
        <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
          <Header styles={{ fontSize: "32px", marginLeft: "10px" }}>{t("CS_TITLE_APPLICATION_DETAILS")}</Header>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "nowrap" }}>
            <div>
              {dowloadOptions && dowloadOptions?.length > 0 && (
                <MultiLink
                  className="multilinkWrapper"
                  onHeadClick={() => setShowOptions(!showOptions)}
                  displayOptions={showOptions}
                  options={dowloadOptions}
                />
              )}
            </div>
            <LinkButton label={t("VIEW_TIMELINE")} style={{ color: "#A52A2A" }} onClick={handleViewTimeline}></LinkButton>
          </div>
        </div>

        {data?.applicationDetails
          ?.filter((ob) => Object.keys(ob)?.length > 0)
          .map((detail, index, arr) => {
            console.log("detailforme", detail)
            return (
              <div key={index}>
                {detail?.title === "BPA_APPLICANT_DETAILS_HEADER" && <CitizenAndArchitectPhoto data={data?.applicationData} />}
                {!detail?.isNotAllowed ? (
                  <Card
                    key={index}
                    // style={!detail?.additionalDetails?.fiReport && detail?.title === "" ? { marginTop: "-30px" } : {}}
                  >
                    {!detail?.isTitleVisible ? (
                      <CardSubHeader style={{ fontSize: "20px", marginTop: "20px" }}>{t(detail?.title)}</CardSubHeader>
                    ) : null}

                    <div
                      style={
                        detail?.isBackGroundColor
                          ? {
                            marginTop: "19px",
                            background: "#FAFAFA",
                            border: "1px solid #D6D5D4",
                            borderRadius: "4px",
                            padding: "8px",
                            lineHeight: "19px",
                            maxWidth: "950px",
                            minWidth: "280px",
                          }
                          : {}
                      }
                    >
                      {!detail?.isFeeDetails && detail?.additionalDetails?.values?.length > 0
                          ? detail?.additionalDetails?.values?.map((value) => (
                            <div key={value?.title}>
                              {!detail?.isTitleRepeat && value?.isHeader ? (
                                <CardSubHeader style={{ fontSize: "20px", marginTop: "20px" }}>{t(value?.title)}</CardSubHeader>
                              ) : null}
                      </div>)) : null}
                      <StatusTable>
                        {/* to get common values */}
                        {detail?.isCommon && detail?.values?.length > 0
                          ? detail?.values?.map((value) => {
                            if (value?.isUnit)
                              return (
                                <Row
                                  className="border-none"
                                  label={t(value?.title)}
                                  text={
                                    value?.value
                                      ? `${getTranslatedValues(value?.value, value?.isNotTranslated)} ${t(value?.isUnit)}`
                                      : t("CS_NA")
                                  }
                                />
                              )
                            if (value?.isLink)
                              return (
                                <Row
                                  className="border-none"
                                  label={t(value?.title)}
                                  text={
                                    <div>
                                      <Link to={value?.to}>
                                        <span className="link" style={{ color: "#a82227" }}>
                                          {value?.value}
                                        </span>
                                      </Link>
                                    </div>
                                  }
                                />
                              )
                            else
                              return (
                                <Row
                                  className="border-none"
                                  label={t(value?.title)}
                                  text={getTranslatedValues(value?.value, value?.isNotTranslated) || t("CS_NA")}
                                />
                              )
                          })
                          : null}
                        {/* to get additional common values */}
                        {!detail?.isFeeDetails && detail?.additionalDetails?.values?.length > 0
                          ? detail?.additionalDetails?.values?.map((value) => (
                            <div key={value?.title}>
                              {!detail?.isTitleRepeat && !value?.isHeader && !value?.isUnit ? (
                                <Row
                                  className="border-none"
                                  label={t(value?.title)}
                                  textStyle={
                                    value?.value === "Paid"
                                      ? { color: "darkgreen" }
                                      : value?.value === "Unpaid"
                                        ? { color: "red" }
                                        : {}
                                  }
                                  text={
                                    value?.value
                                      ? getTranslatedValues(value?.value, value?.isNotTranslated)
                                      : t("CS_NA")
                                  }
                                />
                              ) : null}
                              {!detail?.isTitleRepeat && value?.isUnit ? (
                                <Row
                                  className="border-none"
                                  label={t(value?.title)}
                                  text={
                                    value?.value
                                      ? `${getTranslatedValues(value?.value, value?.isNotTranslated)} ${t(value?.isUnit)}`
                                      : t("CS_NA")
                                  }
                                />
                              ) : null}
                              {/* {!detail?.isTitleRepeat && value?.isHeader ? (
                                <CardSubHeader style={{ fontSize: "20px", marginTop: "20px" }}>{t(value?.title)}</CardSubHeader>
                              ) : null} */}
                            </div>
                          ))
                          : null}

                        {/* to get subOccupancyValues values */}
                        {detail?.isSubOccupancyTable && detail?.additionalDetails?.subOccupancyTableDetails ? (
                          <SubOccupancyTable
                            edcrDetails={detail?.additionalDetails}
                            applicationData={data?.applicationData}
                          />
                        ) : null}

                        {/* to get Scrutiny values */}
                        {detail?.isScrutinyDetails && detail?.additionalDetails?.scruntinyDetails?.length > 0
                          ? <Table
                              className="customTable table-border-style"
                              t={t}
                              data={detail?.additionalDetails?.scruntinyDetails}
                              columns={documentsEDCRColumns}
                              getCellProps={() => ({ style: {} })}
                              disableSort={false}
                              autoSort={true}
                              manualPagination={false}
                              isPaginationRequired={false}
                            />
                          : null}

                        {detail?.isScrutinyDetails && data?.applicationData?.additionalDetails?.oldEDCR?.length > 0 &&
                          <Table
                            className="customTable table-border-style"
                            t={t}
                            data={data?.applicationData?.additionalDetails?.oldEDCR}
                            columns={oldEDCRDocumentsColumns}
                            getCellProps={() => ({ style: {} })}
                            disableSort={false}
                            autoSort={true}
                            manualPagination={false}
                            isPaginationRequired={false}
                          />}
                          

                        {/* to get Owner values */}
                        {detail?.isOwnerDetails && detail?.additionalDetails?.owners?.length > 0
                          ? detail?.additionalDetails?.owners.map((owner, index) => (
                            <div
                              key={index}
                              style={
                                detail?.additionalDetails?.owners?.length > 1
                                  ? {
                                    marginTop: "19px",
                                    background: "#FAFAFA",
                                    border: "1px solid #D6D5D4",
                                    borderRadius: "4px",
                                    padding: "8px",
                                    lineHeight: "19px",
                                    maxWidth: "950px",
                                    minWidth: "280px",
                                  }
                                  : {}
                              }
                            >
                              {detail?.additionalDetails?.owners?.length > 1 ? (
                                <Row className="border-none" label={`${t("Owner")} - ${index + 1}`} />
                              ) : null}
                              {owner?.values.map((value) => (
                                <Row
                                  className="border-none"
                                  label={t(value?.title)}
                                  text={getTranslatedValues(value?.value, value?.isNotTranslated) || t("CS_NA")}
                                  key={value?.title}
                                />
                              ))}
                            </div>
                          ))
                          : null}

                        {detail?.title === "BPA_DOCUMENT_DETAILS_LABEL" && (<>
                          {/* <CardSubHeader>{t("BPA_DOCUMENT_DETAILS_LABEL")}</CardSubHeader>
                          <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} /> */}                                                   
                            {pdfLoading ? <Loader /> : <Table
                              className="customTable table-border-style"
                              t={t}
                              data={documentsData}
                              columns={documentsColumns}
                              getCellProps={() => ({ style: {} })}
                              disableSort={false}
                              autoSort={true}
                              manualPagination={false}
                              isPaginationRequired={false}
                            />}                          
                          {/* <CardSubHeader>{t("BPA_ECBC_DETAILS_LABEL")}</CardSubHeader>
                          <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} /> */}                          
                            {ecbcDocumentsData?.length>0 &&<div>{(pdfLoading || isFileLoading) ? <Loader /> : <Table
                              className="customTable table-border-style"
                              t={t}
                              data={ecbcDocumentsData}
                              columns={documentsColumnsECBC}
                              getCellProps={() => ({ style: {} })}
                              disableSort={false}
                              autoSort={true}
                              manualPagination={false}
                              isPaginationRequired={false}
                            />}</div>}
                          {/* <CardSubHeader>{t("BPA_OWNER_DETAILS_LABEL")}</CardSubHeader>
                          <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} /> */}                                                   
                            
                          </>)}                          

                        {/* to get FieldInspection values */}
                        {detail?.isFieldInspection &&
                          data?.applicationData?.additionalDetails?.fieldinspection_pending?.length > 0 ? (
                          <InspectionReport
                            isCitizen={true}
                            fiReport={data?.applicationData?.additionalDetails?.fieldinspection_pending}
                          />
                        ) : null}

                        {/* to get NOC values */}
                        {detail?.additionalDetails?.noc?.length > 0
                          ? detail?.additionalDetails?.noc.map((nocob, ind) => (
                            <div
                              key={ind}
                              style={{
                                marginTop: "19px",
                                background: "#FAFAFA",
                                border: "1px solid #D6D5D4",
                                borderRadius: "4px",
                                padding: "8px",
                                lineHeight: "19px",
                                maxWidth: "960px",
                                minWidth: "280px",
                              }}
                            >
                              <StatusTable>
                                <Row
                                  className="border-none"
                                  label={t(`${`BPA_${detail?.additionalDetails?.data?.nocType}_HEADER`}`)}
                                  labelStyle={{ fontSize: "20px" }}
                                ></Row>
                                <Row
                                  className="border-none"
                                  label={t(`${detail?.values?.[0]?.title}`)}
                                  textStyle={{ marginLeft: "10px" }}
                                  text={getTranslatedValues(
                                    detail?.values?.[0]?.value,
                                    detail?.values?.[0]?.isNotTranslated,
                                  )}
                                />
                                <Row
                                  className="border-none"
                                  label={t(`${detail?.values?.[1]?.title}`)}
                                  textStyle={
                                    detail?.values?.[1]?.value == "APPROVED" ||
                                      detail?.values?.[1]?.value == "AUTO_APPROVED"
                                      ? { marginLeft: "10px", color: "#00703C" }
                                      : { marginLeft: "10px", color: "#D4351C" }
                                  }
                                  text={getTranslatedValues(
                                    detail?.values?.[1]?.value,
                                    detail?.values?.[1]?.isNotTranslated,
                                  )}
                                />
                                {detail?.values?.[2]?.value ? (
                                  <Row
                                    className="border-none"
                                    label={t(`${detail?.values?.[2]?.title}`)}
                                    textStyle={{ marginLeft: "10px" }}
                                    text={getTranslatedValues(
                                      detail?.values?.[2]?.value,
                                      detail?.values?.[2]?.isNotTranslated,
                                    )}
                                  />
                                ) : null}
                                {detail?.values?.[3]?.value ? (
                                  <Row
                                    className="border-none"
                                    label={t(`${detail?.values?.[3]?.title}`)}
                                    textStyle={{ marginLeft: "10px" }}
                                    text={getTranslatedValues(
                                      detail?.values?.[3]?.value,
                                      detail?.values?.[3]?.isNotTranslated,
                                    )}
                                  />
                                ) : null}
                                {detail?.values?.[3]?.value ? (
                                  <Row
                                    className="border-none"
                                    label={t(`${detail?.values?.[4]?.title}`)}
                                    textStyle={{ marginLeft: "10px" }}
                                    text={getTranslatedValues(
                                      detail?.values?.[4]?.value,
                                      detail?.values?.[4]?.isNotTranslated,
                                    )}
                                  />
                                ) : null}
                                <Row className="border-none" label={t(`${nocob?.title}`)}></Row>
                              </StatusTable>
                              <StatusTable>
                                {nocob?.values ? (
                                  <DocumentsPreview
                                    documents={getOrderDocuments(nocob?.values, true)}
                                    svgStyles={{}}
                                    isSendBackFlow={false}
                                    isHrLine={true}
                                    titleStyles={{
                                      fontSize: "18px",
                                      lineHeight: "24px",
                                      fontWeight: 700,
                                      marginBottom: "10px",
                                    }}
                                  />
                                ) : (
                                  <div>
                                    <CardText>{t("BPA_NO_DOCUMENTS_UPLOADED_LABEL")}</CardText>
                                  </div>
                                )}
                              </StatusTable>
                            </div>
                          ))
                          : null}

                        {/* to get permit values */}
                        {!detail?.isTitleVisible && detail?.additionalDetails?.permit?.length > 0
                          ? detail?.additionalDetails?.permit?.map((value) => (
                            <CardText key={value?.title}>{value?.title}</CardText>
                          ))
                          : null}

                        {/* to get Fee values */}
                        {detail?.additionalDetails?.inspectionReport && detail?.isFeeDetails && (
                          <ScruntinyDetails scrutinyDetails={detail?.additionalDetails} paymentsList={[]} />
                        )}
                        {/*blocking reason*/}
                        {detail?.additionalDetails?.inspectionReport &&
                          detail?.isFeeDetails &&
                          (workflowDetails?.data?.actionState?.nextActions?.[0]?.state ==
                            "POST_PAYMENT_CITIZEN_APPROVAL_PENDING" ||
                            workflowDetails?.data?.actionState?.state == "POST_PAYMENT_CITIZEN_APPROVAL_PENDING" ||
                            workflowDetails?.data?.actionState?.state == "POST_PAYMENT_INPROGRESS") && (
                            <div
                              style={{
                                marginTop: "19px",
                                background: "#FAFAFA",
                                border: "1px solid #D6D5D4",
                                borderRadius: "4px",
                                padding: "8px",
                                lineHeight: "19px",
                                maxWidth: "950px",
                                minWidth: "280px",
                              }}
                            >
                              <Row
                                className="border-none"
                                label={t(`BLOCKING_REASON`)}
                                labelStyle={{ fontSize: "15px" }}
                                text={data?.applicationData.additionalDetails.blockingReason || "NA"}
                              >
                                {" "}
                              </Row>
                            </div>
                          )}
                      </StatusTable>
                      {detail?.title === "BPA_APPLICANT_DETAILS_HEADER" && <div style={{ marginTop: "5px" }}>{(pdfLoading || isOwnerFileLoading) ? <Loader /> : <Table
                        className="customTable table-border-style"
                        t={t}
                        data={ownerDocumentsData}
                        columns={documentsColumnsOwner}
                        getCellProps={() => ({ style: {} })}
                        disableSort={false}
                        autoSort={true}
                        manualPagination={false}
                        isPaginationRequired={false}
                      />}</div>}
                    </div>
                  </Card>
                ) : null}

                {/* to get Timeline values */}
                {index === arr?.length - 1 && (
                  <Card>
                    <Fragment>
                      <div id="timeline">
                        {/* <BPAApplicationTimeline application={data?.applicationData} id={id} /> */}
                        <NewApplicationTimeline workflowDetails={workflowDetails?.data} t={t} />
                        {/* {!workflowDetails?.isLoading &&
                          workflowDetails?.data?.newNextAction?.length > 0 &&
                          !isFromSendBack &&
                          checkBoxVisible && (
                            <CheckBox
                              styles={{ margin: "20px 0 40px", paddingTop: "10px" }}
                              checked={isTocAccepted}
                              label={getCheckBoxLable()}
                              // label={getCheckBoxLabelData(t, data?.applicationData, workflowDetails?.data?.nextActions)}
                              onChange={() => {
                                setIsTocAccepted(!isTocAccepted)
                                isTocAccepted ? setDisplayMenu(!isTocAccepted) : ""
                              }}
                            />
                          )} */}
                      </div>
                      {((workflowDetails?.data?.actionState?.applicationStatus === "CITIZEN_APPROVAL_INPROCESS" || workflowDetails?.data?.actionState?.applicationStatus === "PENDING_SANC_FEE_PAYMENT" || workflowDetails?.data?.actionState?.applicationStatus === "PENDING_APPL_FEE") && !isArchitect) &&
                        <div>{!workflowDetails?.isLoading && workflowDetails?.data?.newNextAction?.length > 1 && (
                        //removed this styles to fix the action button in application details UM-5347
                        <ActionBar /*style={{ position: "relative", boxShadow: "none", minWidth: "240px", maxWidth: "310px", padding: "0px" }}*/
                        >
                          <div style={{ width: "100%" }}>
                            {displayMenu && workflowDetails?.data?.newNextAction ? (
                              <Menu
                                style={{minWidth: "310px" }}
                                localeKeyPrefix={"WF_BPA_ACTION"}
                                options={workflowDetails?.data?.newNextAction.map((action) => action.action)}
                                t={t}
                                onSelect={onActionSelect}
                              />
                            ) : null}
                            <SubmitBar
                            /*style={{ width: "100%" }}*/ disabled={
                                false
                                // Original condition commented out:
                                // checkForSubmitDisable(isFromSendBack, isTocAccepted) ||
                                // (workflowDetails?.data?.actionState?.state === "CITIZEN_APPROVAL_PENDING"
                                //   ? !agree || !isOTPVerified || !citizenvalidations
                                //   : false)
                              }
                              label={t("ES_COMMON_TAKE_ACTION")}
                              onSubmit={() => setDisplayMenu(!displayMenu)}
                            />
                          </div>
                        </ActionBar>
                      )}
                      {!workflowDetails?.isLoading && workflowDetails?.data?.newNextAction?.length == 1 && (
                        //removed this style to fix the action button in application details UM-5347
                        <ActionBar /*style={{ position: "relative", boxShadow: "none", minWidth: "240px", maxWidth: "310px", padding: "0px" }}*/
                        >
                          <div style={{ width: "100%" }}>
                            <button
                              style={{ color: "#FFFFFF", fontSize: isMobile ? "19px" : "initial" }}
                              className="submit-bar"
                              disabled={false}
                              name={workflowDetails?.data?.newNextAction?.[0]?.action}
                              value={workflowDetails?.data?.newNextAction?.[0]?.action}
                              onClick={(e) => {
                                onActionSelect(e.target.value)
                              }}
                            >
                              {t(`WF_BPA_${workflowDetails?.data?.newNextAction?.[0]?.action}`)}
                            </button>
                          </div>
                        </ActionBar>
                      )}
                      </div>}
                      {(workflowDetails?.data?.actionState?.applicationStatus != "CITIZEN_APPROVAL_INPROCESS" && isArchitect) &&
                        <div>{!workflowDetails?.isLoading && workflowDetails?.data?.newNextAction?.length > 1 && (
                        //removed this styles to fix the action button in application details UM-5347
                        <ActionBar /*style={{ position: "relative", boxShadow: "none", minWidth: "240px", maxWidth: "310px", padding: "0px" }}*/
                        >
                          <div style={{ width: "100%" }}>
                            {displayMenu && workflowDetails?.data?.newNextAction ? (
                              <Menu
                                style={{minWidth: "310px" }}
                                localeKeyPrefix={"WF_BPA_ACTION"}
                                options={workflowDetails?.data?.newNextAction.map((action) => action.action)}
                                t={t}
                                onSelect={onActionSelect}
                              />
                            ) : null}
                            <SubmitBar
                            /*style={{ width: "100%" }}*/ disabled={
                                false
                                // Original condition commented out:
                                // checkForSubmitDisable(isFromSendBack, isTocAccepted) ||
                                // (workflowDetails?.data?.actionState?.state === "CITIZEN_APPROVAL_PENDING"
                                //   ? !agree || !isOTPVerified || !citizenvalidations
                                //   : false)
                              }
                              label={t("ES_COMMON_TAKE_ACTION")}
                              onSubmit={() => setDisplayMenu(!displayMenu)}
                            />
                          </div>
                        </ActionBar>
                      )}
                      {!workflowDetails?.isLoading && workflowDetails?.data?.newNextAction?.length == 1 && (
                        //removed this style to fix the action button in application details UM-5347
                        <ActionBar /*style={{ position: "relative", boxShadow: "none", minWidth: "240px", maxWidth: "310px", padding: "0px" }}*/
                        >
                          <div style={{ width: "100%" }}>
                            <button
                              style={{ color: "#FFFFFF", fontSize: isMobile ? "19px" : "initial" }}
                              className="submit-bar"
                              disabled={false}
                              name={workflowDetails?.data?.newNextAction?.[0]?.action}
                              value={workflowDetails?.data?.newNextAction?.[0]?.action}
                              onClick={(e) => {
                                onActionSelect(e.target.value)
                              }}
                            >
                              {t(`WF_BPA_${workflowDetails?.data?.newNextAction?.[0]?.action}`)}
                            </button>
                          </div>
                        </ActionBar>
                      )}
                        </div>
                      }
                    </Fragment>
                  </Card>
                )}
              </div>
            )
          })}

        {
        // workflowDetails?.data?.actionState?.state === "INPROGRESS" && !isUserCitizen &&
         <Card style={{ padding: "20px", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", background: "#fff" }} >
          {/* <CardSubHeader style={{ fontSize: "20px", color: "#3f4351" }}>{t("BPA_P2_SUMMARY_FEE_EST_MANUAL")}</CardSubHeader>
          <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
          <CardLabel>{t("BPA_COMMON_DEVELOPMENT_AMT")}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="development"
            defaultValue={data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES}
            value={development}
            onChange={(e) => {
              setDevelopmentVal(e.target.value);
            }}
            {...{ required: true, pattern: "^[0-9]*$" }}
          />
          <CardLabel>{t("BPA_COMMON_OTHER_AMT")}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="otherCharges"
            defaultValue={data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES}
            value={otherCharges}
            onChange={(e) => {
              setOtherChargesVal(e.target.value);
            }}
            {...{ required: true, pattern: /^[0-9]*$/ }}
          />
          {parseInt(otherCharges) > 0 ? (
            <div>
              <CardLabel>{t("BPA_COMMON_OTHER_AMT_DISCRIPTION")}</CardLabel>
              <TextArea
                t={t}
                type={"text"}
                name="otherChargesDiscription"
                defaultValue={data?.applicationData?.additionalDetails?.otherFeesDiscription}
                value={otherChargesDisc}
                onChange={(e) => {
                  setOtherChargesDis(e.target.value);
                }}
                {...{ required: true }}
              />
            </div>
          ) : null}
          <CardLabel>{t("BPA_COMMON_LESS_AMT")}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="lessAdjusment"
            defaultValue={data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT}
            value={lessAdjusment}
            onChange={(e) => {
              setLessAdjusmentVal(e.target.value);
            }}
            {...{ required: true, pattern: "^[0-9]*$" }}
          />
          {parseInt(lessAdjusment) > 0 ? (
            <div>
              <CardLabel>{t("BPA_COMMON_LESS_AMT_FILE")}</CardLabel>
              <UploadFile
                id={"noc-doc"}
                style={{ marginBottom: "200px" }}
                onUpload={selectfile}
                onDelete={() => {
                  setUploadedFile(null);
                  setFile("");
                }}
                message={uploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
                error={errorFile}
              // uploadMessage={uploadMessage}
              />
            </div>
          ) : null} */}
          <FeeEstimation                    
            currentStepData={{
              createdResponse: {
                ...(data?.applicationData || {})
              }
            }}
            disable = {true}
            development={development}
            otherCharges={otherCharges}
            lessAdjusment={lessAdjusment}
            otherChargesDisc={otherChargesDisc}
            labourCess={labourCess}                  
            gaushalaFees={gaushalaFees}                 
            malbafees={malbafees}                    
            waterCharges={waterCharges}                 
            errorFile={errorFile}
            setError={setError}
            adjustedAmounts={adjustedAmounts}
            setAdjustedAmounts={setAdjustedAmounts}
          />
        </Card>}

        {workflowDetails?.data?.actionState?.state === "CITIZEN_APPROVAL_PENDING" && isUserCitizen && !isOCApplication && (
          <div>
            <Card>
              <CardSubHeader style={{ fontSize: "20px", marginTop: "20px" }}>{t("BPA_OWNER_UNDERTAKING")}</CardSubHeader>
              <React.Fragment>
                <div>
                  <CardLabel>{t("ARCHITECT_SHOULD_VERIFY_HIMSELF_BY_CLICKING_BELOW_BUTTON")}</CardLabel>
                  {/* <LinkButton label={t("BPA_VERIFY_BUTTON")} onClick={handleVerifyClick} /> */}
                  <br></br>
                  {/* {showMobileInput && (
                    <React.Fragment>
                      <br></br>
                      <CardLabel>{t("BPA_MOBILE_NUMBER")}</CardLabel>
                      <TextInput
                        t={t}
                        type="tel"
                        isMandatory={true}
                        optionKey="i18nKey"
                        name="mobileNumber"
                        value={mobileNumber}
                        disable={true}
                        onChange={handleMobileNumberChange}
                        {...{
                          required: true,
                          pattern: "[0-9]{10}",
                          type: "tel",
                          title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID"),
                        }}
                      />

                      <LinkButton label={t("BPA_GET_OTP")} onClick={handleGetOTPClick} disabled={!isValidMobileNumber} />
                    </React.Fragment>
                  )} */}
                  {/* {showOTPInput && (
                    <React.Fragment>
                      <br></br>
                      <CardLabel>{t("BPA_OTP")}</CardLabel>                    
                      <OTPInput length={6} onChange={(value) => setOTP(value)} value={otp} />

                      <SubmitBar label={t("VERIFY_OTP")} onSubmit={handleVerifyOTPClick} />
                      {otpError && <CardLabel style={{ color: "red" }}>{t(otpError)}</CardLabel>}
                      {otpSuccess && <CardLabel style={{ color: "green" }}>{t(otpSuccess)}</CardLabel>}
                    </React.Fragment>
                  )} */}
                </div>
                {!workflowDetails?.isLoading &&
                  workflowDetails?.data?.newNextAction?.length > 0 &&
                  !isFromSendBack &&
                  checkBoxVisible && (
                    <CheckBox
                      styles={{ margin: "20px 0 40px", paddingTop: "10px" }}
                      checked={isTocAccepted}
                      label={getCheckBoxLable()}
                      // label={getCheckBoxLabelData(t, data?.applicationData, workflowDetails?.data?.nextActions)}
                      onChange={() => {
                        setIsTocAccepted(!isTocAccepted)
                        isTocAccepted ? setDisplayMenu(!isTocAccepted) : ""
                      }}
                    />
                  )}
                <br></br>

                <div>
                  <CheckBox
                    label={checkLabels()}
                    onChange={setdeclarationhandler}
                    styles={{ height: "auto" }}
                    //disabled={!agree}
                    checked={agree}
                  />

                  {showTermsPopup && (
                    <CitizenConsent
                      showTermsPopupOwner={showTermsPopup}
                      setShowTermsPopupOwner={setShowTermsPopup}
                      otpVerifiedTimestamp={otpVerifiedTimestamp} // Pass timestamp as a prop
                      bpaData={data?.applicationData} // Pass the complete BPA application data
                      tenantId={tenantId} // Pass tenant ID for API calls
                    />
                  )}
                </div>
              </React.Fragment>
            </Card>
          </div>
        )}

        {workflowDetails?.data?.actionState?.applicationStatus === "INPROGRESS" && !isUserCitizen && (
          !workflowDetails?.isLoading &&
          workflowDetails?.data?.newNextAction?.length > 0 &&
          !isFromSendBack &&
          checkBoxVisible && (
            <Card style={{ padding: "20px", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", background: "#fff" }}>
            <CheckBox
              styles={{ margin: "20px 0 40px", paddingTop: "10px" }}
              checked={isTocAccepted}
              label={getCheckBoxLable()}
              // label={getCheckBoxLabelData(t, data?.applicationData, workflowDetails?.data?.nextActions)}
              onChange={() => {
                setIsTocAccepted(!isTocAccepted)
                isTocAccepted ? setDisplayMenu(!isTocAccepted) : ""
              }}
            />
            </Card>
          ))}

        {showTermsModal ? (
          <ActionModal
            t={t}
            action={"TERMS_AND_CONDITIONS"}
            tenantId={tenantId}
            id={id}
            closeModal={closeTermsModal}
            submitAction={submitAction}
            applicationData={data?.applicationData || {}}
          />
        ) : null}
        {showModal ? (
          <ActionModal
            t={t}
            action={selectedAction}
            tenantId={tenantId}
            // state={state}
            id={id}
            closeModal={closeModal}
            submitAction={submitAction}
            actionData={workflowDetails?.data?.timeline}
          />
        ) : null}
        {showToast && (
          <Toast
            error={showToast.key === "error" ? true : false}
            label={t(showToast.key === "success" ? `ES_OBPS_${showToast.action}_UPDATE_SUCCESS` : showToast.action)}
            onClose={closeToast}
            style={{ zIndex: "1000" }}
            isDleteBtn={"true"}
          />
        )}
      </div>
    </Fragment>
  )
}

export default BpaApplicationDetail

