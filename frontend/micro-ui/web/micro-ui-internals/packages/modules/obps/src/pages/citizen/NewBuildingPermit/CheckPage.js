// import {
//   Card,
//   CardHeader,
//   CardSubHeader,
//   CardText,
//   TextInput,
//   CardLabel,
//   CheckBox,
//   LabelFieldPair,
//   UploadFile,
//   CitizenInfoLabel,
//   Header,
//   LinkButton,
//   Row,
//   StatusTable,
//   SubmitBar,
//   Table,
//   CardSectionHeader,
//   EditIcon,
//   PDFSvg,
//   Loader,
//   TextArea,
// } from "@mseva/digit-ui-react-components";
// import React, { useEffect, useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { useHistory, useRouteMatch } from "react-router-dom";
// import Timeline from "../../../components/Timeline";
// import { convertEpochToDateDMY, stringReplaceAll, getOrderDocuments } from "../../../utils";
// import DocumentsPreview from "../../../../../templates/ApplicationDetails/components/DocumentsPreview";
// import Architectconcent from "./Architectconcent";
// import { OTPInput, CardLabelError } from "@mseva/digit-ui-react-components";
// import useScrutinyDetails from "../../../../../../../../micro-ui-internals/packages/libraries/src/hooks/obps/useScrutinyDetails";
// import CitizenConsent from "../BpaApplicationDetail/CitizenConsent";

// const CheckPage = ({ onSubmit, value }) => {
//   // Initialize states with sessionStorage values to persist across refreshes
//   const [development, setDevelopment] = useState(() => {
//     const stored = sessionStorage.getItem("development");
//     return stored || value?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES || "";
//   });

//   const [otherCharges, setOtherCharges] = useState(() => {
//     const stored = sessionStorage.getItem("otherCharges");
//     return stored || value?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES || "";
//   });

//   const [lessAdjusment, setLessAdjusment] = useState(() => {
//     const stored = sessionStorage.getItem("lessAdjusment");
//     return stored || value?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT || "";
//   });

//   const [otherChargesDisc, setOtherChargesDisc] = useState(() => {
//     const stored = sessionStorage.getItem("otherChargesDisc");
//     return stored || value?.additionalDetails?.otherFeesDiscription || "";
//   });
//   const [labourCess, setLabourCess] = useState(() => sessionStorage.getItem("LabourCess") || "");
//   const [gaushalaFees, setGaushalaFees] = useState(() => sessionStorage.getItem("GaushalaFees") || "");
//   const [malbafees, setMalbafees] = useState(() => sessionStorage.getItem("Malbafees") || "");
//   const [waterCharges, setWaterCharges] = useState(() => sessionStorage.getItem("WaterCharges") || "");

//   const [ownersData, setOwnersData] = useState(() => {
//     // <CHANGE> Get data from the correct session storage key
//     const storedBuildingPermit = sessionStorage.getItem("Digit.BUILDING_PERMIT");

//     if (storedBuildingPermit) {
//       try {
//         const parsedData = JSON.parse(storedBuildingPermit);
//         // <CHANGE> Access owners data from the nested structure
//         return parsedData?.value?.data?.owners || [];
//       } catch (error) {
//         console.error("Error parsing building permit data:", error);
//         return [];
//       }
//     }

//     return [];
//   });

//   const getPlotDataFromStorage = () => {
//     try {
//       const storedValue = sessionStorage.getItem("Digit.BUILDING_PERMIT");
//       if (storedValue) {
//         const parsedData = JSON.parse(storedValue);
//         return parsedData?.value?.data?.edcrDetails || null;
//       }
//     } catch (error) {
//       console.error("Error parsing sessionStorage data:", error);
//     }
//     return null;
//   };

//   const getPlanInfoProperties = () => {
//     try {
//       const storedValue = sessionStorage.getItem("Digit.BUILDING_PERMIT");
//       if (storedValue) {
//         const parsedData = JSON.parse(storedValue);
//         console.log(parsedData?.value?.data?.edcrDetails, "))))))))");
//         return parsedData?.value?.data?.edcrDetails || null;
//       }
//     } catch (error) {
//       console.error("Error parsing planInfoProperties:", error);
//     }
//     return null;
//   };

//   // Replace/add this section after the existing building extract section:
//   const planInfoProps = getPlanInfoProperties();

//   const plotDataFromStorage = getPlotDataFromStorage();

//   const { t } = useTranslation();
//   const history = useHistory();
//   const match = useRouteMatch();
//   const user = Digit.UserService.getUser();
//   const state = Digit.ULBService.getStateId();

//   // Dynamic tenant ID calculation - this is the key fix
//   const tenantId = useMemo(() => {
//     return value?.address?.city?.code || value?.tenantId || user?.info?.permanentCity || Digit.ULBService.getCurrentTenantId();
//   }, [value?.address?.city?.code, value?.tenantId, user?.info?.permanentCity]);

//   const architectmobilenumber = user?.info?.mobileNumber;

//   const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(state, "BPA", ["GaushalaFees", "MalbaCharges", "LabourCess"]);

//   const [uploadedFile, setUploadedFile] = useState();
//   const [uploadedFileLess, setUploadedFileLess] = useState(() => {
//     const stored = sessionStorage.getItem("uploadedFileLess");
//     return stored ? JSON.parse(stored) : [];
//   });

//   const [file, setFile] = useState();
//   const [uploadMessage, setUploadMessage] = useState("");
//   const [errorFile, setError] = useState(null);
//   const [docLessAdjustment, setDocuments] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   let acceptFormat = ".pdf";
//   let BusinessService;
//   if (value.businessService === "BPA_LOW") BusinessService = "BPA.LOW_RISK_PERMIT_FEE";
//   else if (value.businessService === "BPA") BusinessService = "BPA.NC_APP_FEE";

//   const {
//     data,
//     address,
//     owners,
//     nocDocuments,
//     documents,
//     additionalDetails,
//     subOccupancy,
//     PrevStateDocuments,
//     PrevStateNocDocuments,
//     applicationNo,
//   } = value;

//   const isEditApplication = window.location.href.includes("editApplication");

//   // Initialize agreement states with sessionStorage persistence
//   const [agree, setAgree] = useState(() => {
//     const stored = sessionStorage.getItem("professionalAgree");
//     return stored === "true";
//   });

//   const [showTermsPopup, setShowTermsPopup] = useState(false);
//   const [showTermsPopupOwner, setShowTermsPopupOwner] = useState(false);

//   const [showMobileInput, setShowMobileInput] = useState(() => {
//     const stored = sessionStorage.getItem("showMobileInput");
//     return stored === "true";
//   });

//   const [mobileNumber, setMobileNumber] = useState(() => sessionStorage.getItem("mobileNumber") || architectmobilenumber || "");

//   const [showOTPInput, setShowOTPInput] = useState(() => {
//     const stored = sessionStorage.getItem("showOTPInput");
//     return stored === "true";
//   });

//   const [otp, setOTP] = useState("");

//   const [isOTPVerified, setIsOTPVerified] = useState(() => {
//     const stored = sessionStorage.getItem("isOTPVerified");
//     const timestamp = sessionStorage.getItem("otpVerifiedTimestamp");
//     return stored === "true" && timestamp;
//   });

//   const [otpError, setOTPError] = useState("");

//   const [otpVerifiedTimestamp, setOTPVerifiedTimestamp] = useState(() => {
//     const stored = sessionStorage.getItem("otpVerifiedTimestamp");
//     return stored ? new Date(stored) : null;
//   });

//   // Owner verification states with sessionStorage persistence
//   const [ownerAgree, setOwnerAgree] = useState(() => {
//     const stored = sessionStorage.getItem("ownerAgree");
//     return stored === "true";
//   });

//   const [showOwnerMobileInput, setShowOwnerMobileInput] = useState(() => {
//     const stored = sessionStorage.getItem("showOwnerMobileInput");
//     return stored === "true";
//   });

//   const [ownerMobileNumber, setOwnerMobileNumber] = useState(() => {
//     // Try to get from sessionStorage first (from OwnerDetails page)
//     const storedOwnerData = sessionStorage.getItem("currentOwnerData");
//     const storedOwnerMobile = sessionStorage.getItem("ownerMobileNumber");
//     const storedOwnerFields = sessionStorage.getItem("ownerFields");

//     if (storedOwnerMobile) return storedOwnerMobile;
//     if (storedOwnerData) {
//       const parsedData = JSON.parse(storedOwnerData);
//       return parsedData?.owners?.[0]?.mobileNumber || "";
//     }
//     if (storedOwnerFields) {
//       const parsedFields = JSON.parse(storedOwnerFields);
//       return parsedFields?.[0]?.mobileNumber || "";
//     }
//     return owners?.owners?.[0]?.mobileNumber || "";
//   });

//   const [showOwnerOTPInput, setShowOwnerOTPInput] = useState(() => {
//     const stored = sessionStorage.getItem("showOwnerOTPInput");
//     return stored === "true";
//   });

//   const [ownerOtp, setOwnerOTP] = useState("");

//   const [isOwnerOTPVerified, setIsOwnerOTPVerified] = useState(() => {
//     const stored = sessionStorage.getItem("isOwnerOTPVerified");
//     return stored === "true";
//   });

//   const [ownerOtpError, setOwnerOtpError] = useState("");

//   const Architectvalidations = sessionStorage.getItem("ArchitectConsentdocFilestoreid") ? true : false;

//   // Persist states to sessionStorage whenever they change
//   useEffect(() => {
//     sessionStorage.setItem("professionalAgree", agree.toString());
//   }, [agree]);

//   useEffect(() => {
//     sessionStorage.setItem("ownerAgree", ownerAgree.toString());
//   }, [ownerAgree]);

//   useEffect(() => {
//     sessionStorage.setItem("showMobileInput", showMobileInput.toString());
//   }, [showMobileInput]);

//   useEffect(() => {
//     sessionStorage.setItem("showOTPInput", showOTPInput.toString());
//   }, [showOTPInput]);

//   useEffect(() => {
//     sessionStorage.setItem("showOwnerMobileInput", showOwnerMobileInput.toString());
//   }, [showOwnerMobileInput]);

//   useEffect(() => {
//     sessionStorage.setItem("showOwnerOTPInput", showOwnerOTPInput.toString());
//   }, [showOwnerOTPInput]);

//   useEffect(() => {
//     sessionStorage.setItem("isOTPVerified", isOTPVerified.toString());
//   }, [isOTPVerified]);

//   useEffect(() => {
//     sessionStorage.setItem("isOwnerOTPVerified", isOwnerOTPVerified.toString());
//   }, [isOwnerOTPVerified]);

//   useEffect(() => {
//     sessionStorage.setItem("mobileNumber", mobileNumber);
//   }, [mobileNumber]);

//   useEffect(() => {
//     sessionStorage.setItem("ownerMobileNumber", ownerMobileNumber);
//   }, [ownerMobileNumber]);

//   // Add these useEffect hooks to persist missing data
//   useEffect(() => {
//     sessionStorage.setItem("development", development);
//   }, [development]);

//   useEffect(() => {
//     sessionStorage.setItem("otherCharges", otherCharges);
//   }, [otherCharges]);

//   useEffect(() => {
//     sessionStorage.setItem("lessAdjusment", lessAdjusment);
//   }, [lessAdjusment]);

//   useEffect(() => {
//     sessionStorage.setItem("otherChargesDisc", otherChargesDisc);
//   }, [otherChargesDisc]);

//   useEffect(() => {
//     if (otpVerifiedTimestamp) {
//       sessionStorage.setItem("otpVerifiedTimestamp", otpVerifiedTimestamp.toISOString());
//     }
//   }, [otpVerifiedTimestamp]);

//   const handleTermsLinkClick = (e) => {
//     e.preventDefault();
//     if (isOTPVerified) {
//       setShowTermsPopup(true);
//     } else {
//       alert("Please verify yourself");
//     }
//   };

//   const checkLabels = () => {
//     return (
//       <div>
//         {t("I_AGREE_TO_BELOW_UNDERTAKING")}
//         <LinkButton label={t("DECLARATION_UNDER_SELF_CERTIFICATION_SCHEME")} onClick={handleTermsLinkClick} />
//       </div>
//     );
//   };

//   const handleVerifyClick = (e) => {
//     e.preventDefault(); // Prevent form submission
//     setShowMobileInput(true);
//   };

//   const handleMobileNumberChange = (e) => {
//     setMobileNumber(e.target.value);
//   };

//   const handleGetOTPClick = async (e) => {
//     e.preventDefault(); // Prevent form submission
//     try {
//       const response = await Digit.UserService.sendOtp({
//         otp: {
//           mobileNumber: mobileNumber,
//           tenantId: user?.info?.tenantId,
//           userType: user?.info?.type,
//           type: "login",
//         },
//       });

//       if (response.isSuccessful) {
//         setShowOTPInput(true);
//       } else {
//         console.error("Error sending OTP Response is false:", response.error);
//         alert("Something Went Wrong");
//       }
//     } catch (error) {
//       console.error("Error sending OTP:", error);
//       alert("Something went wrong");
//     }
//   };

//   // const handleOTPChange = (e) => {
//   //   setOTP(e.target.value);
//   // };

//   const requestData = {
//     username: mobileNumber,
//     password: otp,
//     tenantId: user?.info?.tenantId,
//     userType: user?.info?.type,
//   };

//   const handleVerifyOTPClick = async (e) => {
//     e.preventDefault(); // Prevent form submission
//     console.log("OTP++++++++>");
//     try {
//       const response = await Digit.UserService.authenticate(requestData);
//       if (response.ResponseInfo.status === "Access Token generated successfully") {
//         setIsOTPVerified(true);
//         setOTPError(t("VERIFIED"));
//         const currentTimestamp = new Date();
//         setOTPVerifiedTimestamp(currentTimestamp);
//         sessionStorage.setItem("otpVerifiedTimestamp", currentTimestamp.toISOString());
//       } else {
//         setIsOTPVerified(false);
//         setOTPError(t("WRONG OTP"));
//       }
//     } catch (error) {
//       console.error("Error verifying OTP:", error);
//       alert("OTP Verification Error ");
//       setIsOTPVerified(false);
//       setOTPError(t("OTP Verification Error"));
//     }
//   };

//   const setdeclarationhandler = (e) => {
//     e.preventDefault(); // Prevent form submission
//     if (!isOTPVerified) {
//       setShowMobileInput(true);
//     } else {
//       setAgree(!agree);
//     }
//   };

//   // Owner verification functions
//   const handleOwnerTermsLinkClick = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (isOwnerOTPVerified) {
//       setShowTermsPopupOwner(true);
//       console.log("OPEN");
//     } else {
//       alert("Please verify owner first");
//     }
//   };

//   const ownerCheckLabels = () => {
//     return (
//       <div>
//         {t("OWNER_AGREES_TO_BELOW_UNDERTAKING")}
//         <LinkButton
//           label={t("OWNER_DECLARATION_UNDER_SELF_CERTIFICATION_SCHEME")}
//           onClick={handleOwnerTermsLinkClick}
//           disabled={!isOwnerOTPVerified}
//         />
//       </div>
//     );
//   };

//   const handleOwnerVerifyClick = (e) => {
//     e.preventDefault(); // Prevent form submission
//     setShowOwnerMobileInput(true);
//   };

//   const handleOwnerMobileNumberChange = (e) => {
//     setOwnerMobileNumber(e.target.value);
//   };

//   const handleOwnerGetOTPClick = async (e) => {
//     e.preventDefault(); // Prevent form submission
//     try {
//       const response = await Digit.UserService.sendOtp({
//         otp: {
//           mobileNumber: ownerMobileNumber,
//           tenantId: user?.info?.tenantId,
//           userType: "CITIZEN",
//           type: "login",
//         },
//       });

//       if (response.isSuccessful) {
//         setShowOwnerOTPInput(true);
//       } else {
//         console.error("Error sending Owner OTP Response is false:", response.error);
//         alert("Something Went Wrong");
//       }
//     } catch (error) {
//       console.error("Error sending Owner OTP:", error);
//       alert("Something went wrong");
//     }
//   };

//   // const handleOwnerOTPChange = (e) => {
//   //   setOwnerOTP(e.target.value);
//   // };

//   const ownerRequestData = {
//     username: ownerMobileNumber,
//     password: ownerOtp,
//     tenantId: user?.info?.tenantId,
//     userType: "CITIZEN",
//   };
//   const handleOwnerVerifyOTPClick = async (e) => {
//     e.preventDefault(); // Prevent form submission
//     console.log("Owner OTP++++++++>");
//     try {
//       const response = await Digit.UserService.authenticate(ownerRequestData);
//       if (response.ResponseInfo.status === "Access Token generated successfully") {
//         setIsOwnerOTPVerified(true);
//         setOwnerOtpError(t("VERIFIED")); // Changed from setOwnerOTPError to setOwnerOtpError
//         setOwnerAgree(true);
//       } else {
//         setIsOwnerOTPVerified(false);
//         setOwnerOtpError(t("WRONG OTP")); // Changed from setOwnerOTPError to setOwnerOtpError
//       }
//     } catch (error) {
//       console.error("Error verifying Owner OTP:", error);
//       alert("Owner OTP Verification Error ");
//       setIsOwnerOTPVerified(false);
//       setOwnerOtpError(t("OTP Verification Error")); // Changed from setOwnerOTPError to setOwnerOtpError
//     }
//   };

//   const setOwnerDeclarationHandler = (e) => {
//     e.preventDefault(); // Prevent form submission
//     if (!isOwnerOTPVerified) {
//       setShowOwnerMobileInput(true);
//     } else {
//       setOwnerAgree(!ownerAgree);
//     }
//   };

//   const isValidMobileNumber = mobileNumber.length === 10 && /^[0-9]+$/.test(mobileNumber);
//   const isValidOwnerMobileNumber = ownerMobileNumber.length === 10 && /^[0-9]+$/.test(ownerMobileNumber);

//   useEffect(() => {
//     (async () => {
//       setError(null);
//       if (file && file?.type) {
//         if (!acceptFormat?.split(",")?.includes(`.${file?.type?.split("/")?.pop()}`)) {
//           setError(t("PT_UPLOAD_FORMAT_NOT_SUPPORTED"));
//         } else if (file.size >= 2000000) {
//           setError(t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
//         } else {
//           try {
//             const response = await Digit.UploadServices.Filestorage("property-upload", file, Digit.ULBService.getStateId());
//             if (response?.data?.files?.length > 0) {
//               setUploadedFileLess([...uploadedFileLess, { fileStoreId: response?.data?.files[0]?.fileStoreId, time: new Date() }]);
//             } else {
//               setError(t("PT_FILE_UPLOAD_ERROR"));
//             }
//           } catch (err) {}
//         }
//       }
//     })();
//   }, [file]);

//   useEffect(() => {
//     sessionStorage.setItem("uploadedFileLess", JSON.stringify(uploadedFileLess));
//   }, [uploadedFileLess]);

//   useEffect(() => {
//     if (value?.additionalDetails?.lessAdjustmentFeeFiles?.length) {
//       const fileStoresIds = value?.additionalDetails?.lessAdjustmentFeeFiles.map((document, index) =>
//         index === value?.additionalDetails?.lessAdjustmentFeeFiles?.length - 1
//           ? value?.additionalDetails?.lessAdjustmentFeeFiles[value?.additionalDetails?.lessAdjustmentFeeFiles?.length - 1]?.fileStoreId
//           : null
//       );
//       Digit.UploadServices.Filefetch(fileStoresIds, state).then((res) => setDocuments(res?.data));
//     }
//     if (isEditApplication) {
//       setDevelopment(value?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES);
//       sessionStorage.setItem("development", value?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES);
//       setOtherCharges(value?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES);
//       sessionStorage.setItem("otherCharges", value?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES);
//       setLessAdjusment(value?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT);
//       sessionStorage.setItem("lessAdjusment", value?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT);
//       setOtherChargesDisc(value?.additionalDetails?.otherFeesDiscription);
//       sessionStorage.setItem("otherChargesDisc", value?.additionalDetails?.otherFeesDiscription);
//       setUploadedFileLess(value?.additionalDetails?.lessAdjustmentFeeFiles);
//     }
//     let plotArea =
//       parseInt(sessionStorage.getItem("plotArea")) || datafromAPI?.planDetail?.planInformation?.plotArea || value?.additionalDetails?.area;
//     const LabourCess = Math.round(plotArea * 10.7639 > 909 ? mdmsData?.BPA?.LabourCess[1].rate * (plotArea * 10.7639) : 0);
//     const GaushalaFees = Math.round(mdmsData?.BPA?.GaushalaFees[0].rate);
//     const Malbafees = Math.round(
//       plotArea * 10.7639 <= 500
//         ? mdmsData?.BPA?.MalbaCharges[0].rate
//         : plotArea * 10.7639 > 500 && plotArea * 10.7639 <= 1000
//         ? mdmsData?.BPA?.MalbaCharges?.[1].rate
//         : mdmsData?.BPA?.MalbaCharges[2].rate || 500
//     );
//     sessionStorage.setItem("Malbafees", Malbafees);
//     sessionStorage.setItem("WaterCharges", Malbafees / 2);
//     sessionStorage.setItem("GaushalaFees", GaushalaFees);
//     sessionStorage.setItem("LabourCess", LabourCess);
//     setGaushalaFees(GaushalaFees);
//     setLabourCess(LabourCess);
//     setMalbafees(Malbafees);
//     setWaterCharges(Malbafees / 2);
//   }, [mdmsData, value?.additionalDetails]);

//   // for application documents
//   let improvedDoc = [];
//   PrevStateDocuments?.map((preDoc) => {
//     improvedDoc.push({ ...preDoc, module: "OBPS" });
//   });
//   documents?.documents?.map((appDoc) => {
//     improvedDoc.push({ ...appDoc, module: "OBPS" });
//   });

//   //for NOC documents
//   PrevStateNocDocuments?.map((preNocDoc) => {
//     improvedDoc.push({ ...preNocDoc, module: "NOC" });
//   });
//   nocDocuments?.nocDocuments?.map((nocDoc) => {
//     improvedDoc.push({ ...nocDoc, module: "NOC" });
//   });

//   const { data: pdfDetails, isLoading: pdfLoading, error } = Digit.Hooks.useDocumentSearch(improvedDoc, {
//     enabled: improvedDoc?.length > 0 ? true : false,
//   });

//   let applicationDocs = [],
//     nocAppDocs = [];
//   if (pdfDetails?.pdfFiles?.length > 0) {
//     pdfDetails?.pdfFiles?.map((pdfAppDoc) => {
//       if (pdfAppDoc?.module == "OBPS") applicationDocs.push(pdfAppDoc);
//       if (pdfAppDoc?.module == "NOC") nocAppDocs.push(pdfAppDoc);
//     });
//   }

//   // Use the updated custom hook with proper parameters
//   const { data: datafromAPI, isLoading, refetch } = useScrutinyDetails(tenantId, value?.data?.scrutinyNumber, {
//     enabled: value?.data?.scrutinyNumber && tenantId ? true : false,
//   });

//   let consumerCode = value?.applicationNo;
//   const fetchBillParams = { consumerCode };

//   function getdate(date) {
//     let newdate = Date.parse(date);
//     return `${
//       new Date(newdate).getDate().toString() + "/" + (new Date(newdate).getMonth() + 1).toString() + "/" + new Date(newdate).getFullYear().toString()
//     }`;
//   }

//   const { data: paymentDetails } = Digit.Hooks.useFetchBillsForBuissnessService(
//     { businessService: BusinessService, ...fetchBillParams, tenantId: tenantId },
//     {
//       enabled: consumerCode ? true : false,
//       retry: false,
//     }
//   );

//   if (!isEditApplication) {
//     // value.additionalDetails.P1charges=paymentDetails?.Bill[0]?.billDetails[0]?.amount;
//   }

//   const sendbacktocitizenApp = window.location.href.includes("sendbacktocitizen");

//   let routeLink = `/digit-ui/citizen/obps/bpa/${additionalDetails?.applicationType.toLowerCase()}/${additionalDetails?.serviceType.toLowerCase()}`;
//   if (isEditApplication) routeLink = `/digit-ui/citizen/obps/editApplication/bpa/${value?.tenantId}/${value?.applicationNo}`;
//   if (sendbacktocitizenApp) routeLink = `/digit-ui/citizen/obps/sendbacktocitizen/bpa/${value?.tenantId}/${value?.applicationNo}`;

//   const tableHeader = [
//     { name: "BPA_TABLE_COL_FLOOR", id: "Floor" },
//     { name: "BPA_TABLE_COL_LEVEL", id: "Level" },
//     { name: "BPA_TABLE_COL_OCCUPANCY", id: "Occupancy" },
//     { name: "BPA_TABLE_COL_BUILDUPAREA", id: "BuildupArea" },
//     { name: "BPA_TABLE_COL_FLOORAREA", id: "FloorArea" },
//     { name: "BPA_TABLE_COL_CARPETAREA", id: "CarpetArea" },
//   ];

//   const accessData = (plot) => {
//     const name = plot;
//     return (originalRow, rowIndex, columns) => {
//       return originalRow[name];
//     };
//   };

//   const tableColumns = useMemo(() => {
//     return tableHeader.map((ob) => ({
//       Header: t(`${ob.name}`),
//       accessor: accessData(ob.id),
//       id: ob.id,
//     }));
//   });

//   function getFloorData(block) {
//     let floors = [];
//     block?.building?.floors.map((ob) => {
//       floors.push({
//         Floor: t(`BPA_FLOOR_NAME_${ob.number}`),
//         Level: ob.number,
//         Occupancy: t(`${ob.occupancies?.[0]?.type}`),
//         BuildupArea: ob.occupancies?.[0]?.builtUpArea,
//         FloorArea: ob.occupancies?.[0]?.floorArea || 0,
//         CarpetArea: ob.occupancies?.[0]?.CarpetArea || 0,
//         key: t(`BPA_FLOOR_NAME_${ob.number}`),
//       });
//     });
//     return floors;
//   }

//   function routeTo(jumpTo) {
//     location.href = jumpTo;
//   }

//   function getBlockSubOccupancy(index) {
//     let subOccupancyString = "";
//     let returnValueArray = [];
//     subOccupancy &&
//       subOccupancy[`Block_${index + 1}`] &&
//       subOccupancy[`Block_${index + 1}`].map((ob) => {
//         returnValueArray.push(`${t(stringReplaceAll(ob?.i18nKey?.toUpperCase(), "-", "_"))}`);
//       });
//     return returnValueArray?.length ? returnValueArray.join(", ") : "NA";
//   }

//   if (pdfLoading || isLoading) {
//     return <Loader />;
//   }

//   const dynamicTenantId = value?.address?.city?.code || address?.city?.code || tenantId;

//   function onSubmitCheck() {
//     if (!development) {
//       sessionStorage.setItem("development", 0);
//     }
//     if (!lessAdjusment) {
//       sessionStorage.setItem("lessAdjusment", 0);
//     }
//     if (!otherCharges) {
//       sessionStorage.setItem("otherCharges", 0);
//     }
//     if (
//       parseInt(lessAdjusment) >
//       parseInt(development) + parseInt(otherCharges) + parseInt(malbafees) + parseInt(labourCess) + parseInt(waterCharges) + parseInt(gaushalaFees)
//     ) {
//       alert(t("Enterd Less Adjustment amount is invalid"));
//     } else {
//       // onSubmit({ dynamicTenantId, edcrNumber });

//       const edcrNumber =
//         value?.data?.scrutinyNumber?.edcrNumber || value?.data?.scrutinyNumber || data?.scrutinyNumber?.edcrNumber || plotDataFromStorage?.edcrNumber;

//       onSubmit({
//         tenantId: dynamicTenantId,
//         edcrNumber: edcrNumber,
//       });
//     }
//   }

//   function setOtherChargesVal(value) {
//     if (/^[0-9]*$/.test(value)) {
//       setOtherCharges(value);
//       sessionStorage.setItem("otherCharges", value);
//     } else {
//       alert(t("Please enter numbers"));
//     }
//   }

//   function setDevelopmentVal(value) {
//     if (/^\d{0,10}$/.test(value)) {
//       setDevelopment(value);
//       sessionStorage.setItem("development", value);
//     } else {
//       alert(t("Please enter numbers"));
//     }
//   }

//   function setLessAdjusmentVal(value) {
//     if (/^[0-9]*$/.test(value)) {
//       if (
//         parseInt(value) >
//         (parseInt(development) ? parseInt(development) : 0) +
//           (parseInt(otherCharges) ? parseInt(otherCharges) : 0) +
//           parseInt(malbafees) +
//           parseInt(labourCess) +
//           parseInt(waterCharges) +
//           parseInt(gaushalaFees)
//       ) {
//         alert(t("Less adjustment fees cannot be grater than Total of other P2 fees"));
//       } else {
//         setLessAdjusment(value);
//         sessionStorage.setItem("lessAdjusment", value);
//       }
//     } else {
//       alert(t("Please enter numbers"));
//     }
//   }

//   function setOtherChargesDis(value) {
//     setOtherChargesDisc(value);
//     sessionStorage.setItem("otherChargesDisc", value);
//   }

//   function selectfile(e) {
//     setUploadedFile(e.target.files[0]);
//     setFile(e.target.files[0]);
//   }

//   return (
//     <React.Fragment>
//       <Timeline currentStep={4} />
//       <Header styles={{ marginLeft: "10px" }}>{t("BPA_STEPPER_SUMMARY_HEADER")}</Header>
//       <Card style={{ paddingRight: "16px" }}>
//         <StatusTable>
//           <Row className="border-none" label={t(`BPA_APPLICATION_NUMBER_LABEL`)} text={plotDataFromStorage?.applicationNumber} />
//         </StatusTable>
//       </Card>
//       <Card style={{ paddingRight: "16px" }}>
//         <CardHeader>{t(`BPA_BASIC_DETAILS_TITLE`)}</CardHeader>
//         <StatusTable>
//           <Row className="border-none" label={t(`BPA_BASIC_DETAILS_APP_DATE_LABEL`)} text={convertEpochToDateDMY(Number(data?.applicationDate))} />
//           <Row className="border-none" label={t(`BPA_BASIC_DETAILS_APPLICATION_TYPE_LABEL`)} text={t(`WF_BPA_${data?.applicationType}`)} />
//           <Row className="border-none" label={t(`BPA_BASIC_DETAILS_SERVICE_TYPE_LABEL`)} text={t(data?.serviceType)} />
//           <Row className="border-none" label={t(`BPA_BASIC_DETAILS_OCCUPANCY_LABEL`)} text={data?.occupancyType} />
//           <Row className="border-none" label={t(`BPA_BASIC_DETAILS_RISK_TYPE_LABEL`)} text={t(`WF_BPA_${data?.riskType}`)} />
//         </StatusTable>
//       </Card>
//       <Card style={{ paddingRight: "16px" }}>
//         <StatusTable>
//           <CardHeader>{t("BPA_PLOT_DETAILS_TITLE")}</CardHeader>
//           <LinkButton
//             label={<EditIcon style={{ marginTop: "-10px", float: "right", position: "relative", bottom: "32px" }} />}
//             style={{ width: "100px", display: "inline" }}
//             onClick={() => routeTo(`${routeLink}/plot-details`)}
//           />

//           <Row
//             className="border-none"
//             textStyle={{ paddingLeft: "12px" }}
//             label={t(`BPA_BOUNDARY_PLOT_AREA_LABEL`)}
//             text={
//               plotDataFromStorage?.planDetail?.planInformation?.plotArea ||
//               datafromAPI?.planDetail?.planInformation?.plotArea ||
//               value?.data?.edcrDetails?.planDetail?.planInformation?.plotArea
//                 ? `${
//                     plotDataFromStorage?.planDetail?.planInformation?.plotArea ||
//                     datafromAPI?.planDetail?.planInformation?.plotArea ||
//                     value?.data?.edcrDetails?.planDetail?.planInformation?.plotArea
//                   } ${t(`BPA_SQ_MTRS_LABEL`)}`
//                 : t("CS_NA")
//             }
//           />
//           <Row
//             className="border-none"
//             label={t(`BPA_PLOT_NUMBER_LABEL`)}
//             text={plotDataFromStorage?.planDetail?.planInfoProperties?.PLOT_NO || t("CS_NA")}
//           />
//           <Row
//             className="border-none"
//             label={t(`BPA_KHATHA_NUMBER_LABEL`)}
//             text={plotDataFromStorage?.planDetail?.planInfoProperties?.KHATA_NO || t("CS_NA")}
//           />
//           {console.log(plotDataFromStorage, "P+++++")}
//           <Row
//             className="border-none"
//             label={t(`BPA_BOUNDARY_LAND_REG_DETAIL_LABEL`)}
//             text={data?.registrationDetails || value?.data?.registrationDetails || t("CS_NA")}
//           />
//           <Row
//             className="border-none"
//             label={t(`BPA_BOUNDARY_WALL_LENGTH_LABEL`)}
//             text={data?.boundaryWallLength || value?.data?.boundaryWallLength || t("CS_NA")}
//           />
//           <Row
//             className="border-none"
//             label={t(`BPA_KHASRA_NUMBER_LABEL`)}
//             text={
//               plotDataFromStorage?.planInfoProperties?.KHASRA_NO ||
//               data?.khasraNumber ||
//               value?.additionalDetails?.khasraNumber ||
//               value?.data?.khasraNumber ||
//               t("CS_NA")
//             }
//           />
//           <Row
//             className="border-none"
//             label={t(`BPA_WARD_NUMBER_LABEL`)}
//             text={data?.wardnumber || value?.additionalDetails?.wardnumber || value?.data?.wardnumber || t("CS_NA")}
//           />
//         </StatusTable>
//       </Card>
//       <Card style={{ paddingRight: "16px" }}>
//         <CardHeader>{t("BPA_STEPPER_SCRUTINY_DETAILS_HEADER")}</CardHeader>
//         <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_EDCR_DETAILS")}</CardSubHeader>
//         <StatusTable style={{ border: "none" }}>
//           <Row className="border-none" label={t("BPA_EDCR_NO_LABEL")} text={data?.scrutinyNumber?.edcrNumber}></Row>
//           <CardSubHeader>{t("BPA_UPLOADED_PLAN_DIAGRAM")}</CardSubHeader>
//           <LinkButton label={<PDFSvg />} onClick={() => routeTo(datafromAPI?.updatedDxfFile)} />
//           <p
//             style={{
//               marginTop: "8px",
//               marginBottom: "20px",
//               textAlign: "Left",
//               fontSize: "16px",
//               lineHeight: "19px",
//               color: "#505A5F",
//               fontWeight: "400",
//             }}
//           >
//             {t(`Uploaded Plan.pdf`)}
//           </p>
//           <CardSubHeader>{t("BPA_SCRUNTINY_REPORT_OUTPUT")}</CardSubHeader>
//           <LinkButton label={<PDFSvg />} onClick={() => routeTo(datafromAPI?.planReport)} />
//           <p
//             style={{
//               marginTop: "8px",
//               marginBottom: "20px",
//               textAlign: "Left",
//               fontSize: "16px",
//               lineHeight: "19px",
//               color: "#505A5F",
//               fontWeight: "400",
//             }}
//           >
//             {t(`BPA_SCRUTINY_REPORT_PDF`)}
//           </p>
//         </StatusTable>
//         <hr style={{ color: "#cccccc", backgroundColor: "#cccccc", height: "2px", marginTop: "20px", marginBottom: "20px" }} />
//         <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_BUILDING_EXTRACT_HEADER")}</CardSubHeader>

//         <Card style={{ paddingRight: "16px" }}>
//           <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_PLAN_INFORMATION_PROPERTIES")}</CardSubHeader>
//           <StatusTable>
//             <Row
//               className="border-none"
//               label={t("BPA_PLOT_AREA_M2")}
//               text={`${planInfoProps?.PLOT_AREA_M2 || t("CS_NA")} ${planInfoProps?.PLOT_AREA_M2 ? t("BPA_SQ_MTRS_LABEL") : ""}`}
//             />
//             {console.log(planInfoProps, "PLAN")}
//             <Row
//               className="border-none"
//               label={t("BPA_PLOT_NUMBER")}
//               text={plotDataFromStorage?.planDetail?.planInfoProperties?.PLOT_NO || t("CS_NA")}
//             />
//             <Row
//               className="border-none"
//               label={t("BPA_KHASRA_NUMBER")}
//               text={plotDataFromStorage?.planDetail?.planInfoProperties?.KHASRA_NO || t("CS_NA")}
//             />
//             <Row
//               className="border-none"
//               label={t("BPA_KHATA_NUMBER")}
//               text={plotDataFromStorage?.planDetail?.planInfoProperties?.KHATA_NO || t("CS_NA")}
//             />
//             <Row
//               className="border-none"
//               label={t("BPA_KHATUNI_NUMBER")}
//               text={plotDataFromStorage?.planDetail?.planInfoProperties?.KHATUNI_NO || t("CS_NA")}
//             />
//             <Row
//               className="border-none"
//               label={t("BPA_DISTRICT")}
//               text={plotDataFromStorage?.planDetail?.planInfoProperties?.DISTRICT || t("CS_NA")}
//             />
//             <Row className="border-none" label={t("BPA_MAUZA")} text={plotDataFromStorage?.planDetail?.planInfoProperties?.MAUZA || t("CS_NA")} />
//             <Row
//               className="border-none"
//               label={t("BPA_AREA_TYPE")}
//               text={plotDataFromStorage?.planDetail?.planInfoProperties?.AREA_TYPE || t("CS_NA")}
//             />
//             <Row
//               className="border-none"
//               label={t("BPA_LAND_USE_ZONE")}
//               text={plotDataFromStorage?.planDetail?.planInfoProperties?.LAND_USE_ZONE || t("CS_NA")}
//             />
//             <Row
//               className="border-none"
//               label={t("BPA_NUMBER_OF_FLOORS")}
//               text={plotDataFromStorage?.planDetail?.planInfoProperties?.NUMBER_OF_FLOORS || t("CS_NA")}
//             />
//             <Row
//               className="border-none"
//               label={t("BPA_ULB_TYPE")}
//               text={plotDataFromStorage?.planDetail?.planInfoProperties?.ULB_TYPE || t("CS_NA")}
//             />

//             <CardSubHeader style={{ fontSize: "18px", marginTop: "20px" }}>{t("BPA_PLOT_DIMENSIONS")}</CardSubHeader>
//             <Row className="border-none" label={t("BPA_AVG_PLOT_DEPTH")} text={plotDataFromStorage?.planDetail?.planInfoProperties?.AVG_PLOT_DEPTH} />
//             <Row className="border-none" label={t("BPA_AVG_PLOT_WIDTH")} text={plotDataFromStorage?.planDetail?.planInfoProperties?.AVG_PLOT_WIDTH} />

//             <CardSubHeader style={{ fontSize: "18px", marginTop: "20px" }}>{t("BPA_ROAD_DETAILS")}</CardSubHeader>
//             <Row className="border-none" label={t("BPA_ROAD_TYPE")} text={planInfoProps?.ROAD_TYPE || t("CS_NA")} />
//             <Row className="border-none" label={t("BPA_ROAD_WIDTH")} text={plotDataFromStorage?.planDetail?.planInfoProperties?.ROAD_WIDTH} />

//             <CardSubHeader style={{ fontSize: "18px", marginTop: "20px" }}>{t("BPA_SUSTAINABILITY_FEATURES")}</CardSubHeader>
//             <Row
//               className="border-none"
//               label={t("BPA_GREEN_BUILDINGS_SUSTAINABILITY")}
//               text={plotDataFromStorage?.planDetail?.planInfoProperties?.PROVISION_FOR_GREEN_BUILDINGS_AND_SUSTAINABILITY || t("CS_NA")}
//             />

//           </StatusTable>
//         </Card>
//         <hr style={{ color: "#cccccc", backgroundColor: "#cccccc", height: "2px", marginTop: "20px", marginBottom: "20px" }} />
//         <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_OCC_SUBOCC_HEADER")}</CardSubHeader>
//         {datafromAPI?.planDetail?.blocks.map((block, index) => (
//           <div
//             key={index}
//             style={
//               datafromAPI?.planDetail?.blocks?.length > 1
//                 ? {
//                     marginTop: "19px",
//                     background: "#FAFAFA",
//                     border: "1px solid #D6D5D4",
//                     borderRadius: "4px",
//                     padding: "8px",
//                     lineHeight: "19px",
//                     maxWidth: "960px",
//                     minWidth: "280px",
//                   }
//                 : {}
//             }
//           >
//             <CardSubHeader style={{ marginTop: "15px", fontSize: "18px" }}>
//               {t("BPA_BLOCK_SUBHEADER")} {index + 1}
//             </CardSubHeader>
//             <StatusTable>
//               <Row
//                 className="border-none"
//                 textStyle={{ wordBreak: "break-word" }}
//                 label={t("BPA_SUB_OCCUPANCY_LABEL")}
//                 text={getBlockSubOccupancy(index) === "" ? t("CS_NA") : getBlockSubOccupancy(index)}
//               ></Row>
//             </StatusTable>
//             <div style={{ overflow: "scroll" }}>
//               <Table
//                 className="customTable table-fixed-first-column table-border-style"
//                 t={t}
//                 disableSort={false}
//                 autoSort={true}
//                 manualPagination={false}
//                 isPaginationRequired={false}
//                 initSortId="S N "
//                 data={getFloorData(block)}
//                 columns={tableColumns}
//                 getCellProps={(cellInfo) => {
//                   return {
//                     style: {},
//                   };
//                 }}
//               />
//             </div>
//           </div>
//         ))}
//         <hr style={{ color: "#cccccc", backgroundColor: "#cccccc", height: "2px", marginTop: "20px", marginBottom: "20px" }} />
//         <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_APP_DETAILS_DEMOLITION_DETAILS_LABEL")}</CardSubHeader>
//         <StatusTable style={{ border: "none" }}>
//           <Row
//             className="border-none"
//             label={t("BPA_APPLICATION_DEMOLITION_AREA_LABEL")}
//             text={
//               datafromAPI?.planDetail?.planInformation?.demolitionArea
//                 ? `${datafromAPI?.planDetail?.planInformation?.demolitionArea} ${t("BPA_SQ_MTRS_LABEL")}`
//                 : t("CS_NA")
//             }
//           ></Row>
//         </StatusTable>
//       </Card>
//       <Card style={{ paddingRight: "16px" }}>
//         <StatusTable>
//           <CardHeader>{t("BPA_NEW_TRADE_DETAILS_HEADER_DETAILS")}</CardHeader>
//           <LinkButton
//             label={<EditIcon style={{ marginTop: "-10px", float: "right", position: "relative", bottom: "32px" }} />}
//             style={{ width: "100px", display: "inline" }}
//             onClick={() => routeTo(`${routeLink}/location`)}
//           />
//           <Row className="border-none" textStyle={{ paddingLeft: "12px" }} label={t(`BPA_DETAILS_PIN_LABEL`)} text={address?.pincode || t("CS_NA")} />
//           <Row className="border-none" label={t(`BPA_CITY_LABEL`)} text={address?.city?.name || t("CS_NA")} />
//           <Row className="border-none" label={t(`BPA_LOC_MOHALLA_LABEL`)} text={address?.locality?.name || t("CS_NA")} />
//           <Row className="border-none" label={t(`BPA_DETAILS_SRT_NAME_LABEL`)} text={address?.street || t("CS_NA")} />
//           <Row className="border-none" label={t(`ES_NEW_APPLICATION_LOCATION_LANDMARK`)} text={address?.landmark || t("CS_NA")} />
//         </StatusTable>
//       </Card>
//       <Card style={{ paddingRight: "16px" }}>
//         <StatusTable>
//           <CardHeader>{t("BPA_APPLICANT_DETAILS_HEADER")}</CardHeader>
//           <LinkButton
//             label={<EditIcon style={{ marginTop: "-10px", float: "right", position: "relative", bottom: "32px" }} />}
//             style={{ width: "100px", display: "inline" }}
//             onClick={() => routeTo(`${routeLink}/owner-details`)}
//           />
//           {ownersData &&
//             ownersData.length > 0 &&
//             ownersData.map((ob, index) => (
//               <div
//                 key={index}
//                 style={
//                   ownersData.length > 1
//                     ? {
//                         marginTop: "19px",
//                         background: "#FAFAFA",
//                         border: "1px solid #D6D5D4",
//                         borderRadius: "4px",
//                         padding: "8px",
//                         lineHeight: "19px",
//                         maxWidth: "960px",
//                         minWidth: "280px",
//                       }
//                     : {}
//                 }
//               >
//                 {ownersData.length > 1 && (
//                   <CardSubHeader>
//                     {t("COMMON_OWNER")} {index + 1}
//                   </CardSubHeader>
//                 )}
//                 <StatusTable>
//                   <Row
//                     className="border-none"
//                     textStyle={index == 0 && ownersData.length == 1 ? { paddingLeft: "12px" } : {}}
//                     label={t(`CORE_COMMON_NAME`)}
//                     text={ob?.name || "N/A"}
//                   />
//                   <Row
//                     className="border-none"
//                     label={t(`BPA_APPLICANT_GENDER_LABEL`)}
//                     text={ob?.gender?.i18nKey ? t(ob.gender.i18nKey) : ob?.gender?.code || "N/A"}
//                   />
//                   <Row className="border-none" label={t(`CORE_COMMON_MOBILE_NUMBER`)} text={ob?.mobileNumber || "N/A"} />
//                   <Row className="border-none" label={t(`CORE_COMMON_EMAIL_ID`)} text={ob?.emailId || t("CS_NA")} />
//                   <Row className="border-none" label={t(`BPA_IS_PRIMARY_OWNER_LABEL`)} text={`${ob?.isPrimaryOwner || false}`} />
//                 </StatusTable>
//               </div>
//             ))}
//         </StatusTable>
//       </Card>
//       <Card style={{ paddingRight: "16px" }}>
//         <StatusTable>
//           <CardHeader>{t("BPA_ADDITIONAL_BUILDING_DETAILS")}</CardHeader>
//           <Row
//             className="border-none"
//             label={t(`BPA_APPROVED_COLONY_LABEL`)}
//             text={owners?.approvedColony?.i18nKey || value?.additionalDetails?.approvedColony || t("CS_NA")}
//           />
//           <Row
//             className="border-none"
//             label={t(`BPA_ULB_TYPE_LABEL`)}
//             text={owners?.Ulblisttype?.value || value?.additionalDetails?.Ulblisttype || t("CS_NA")}
//           />
//           <Row
//             className="border-none"
//             label={t(`BPA_ULB_NAME_LABEL`)}
//             text={owners?.UlbName?.code || value?.additionalDetails?.UlbName || t("CS_NA")}
//           />
//           <Row
//             className="border-none"
//             label={t(`BPA_DISTRICT_LABEL`)}
//             text={owners?.District?.code || value?.additionalDetails?.District || t("CS_NA")}
//           />
//           <Row
//             className="border-none"
//             label={t(`BPA_BUILDING_STATUS_LABEL`)}
//             text={owners?.buildingStatus?.code || value?.additionalDetails?.buildingStatus || t("CS_NA")}
//           />
//           <Row
//             className="border-none"
//             label={t(`BPA_CORE_AREA_LABEL`)}
//             text={datafromAPI?.planDetail?.coreArea || value?.additionalDetails?.coreArea || t("CS_NA")}
//           />
//           <Row
//             className="border-none"
//             label={t(`BPA_PROPOSED_SITE_LABEL`)}
//             text={owners?.proposedSite?.code || value?.additionalDetails?.proposedSite || t("CS_NA")}
//           />
//           {owners?.schemes?.code === "SCHEME" && (
//             <React.Fragment>
//               <Row
//                 className="border-none"
//                 label={t(`BPA_SCHEME_TYPE_LABEL`)}
//                 text={owners?.schemesselection?.value || value?.additionalDetails?.schemesselection || t("CS_NA")}
//               />
//               <Row
//                 className="border-none"
//                 label={t(`BPA_SCHEME_NAME_LABEL`)}
//                 text={owners?.schemeName || value?.additionalDetails?.schemeName || t("CS_NA")}
//               />
//               <Row
//                 className="border-none"
//                 label={t(`BPA_TRANFERRED_SCHEME_LABEL`)}
//                 text={owners?.transferredscheme || value?.additionalDetails?.transferredscheme || t("CS_NA")}
//               />
//             </React.Fragment>
//           )}
//           <Row
//             className="border-none"
//             label={t(`BPA_PURCHASED_FAR_LABEL`)}
//             text={owners?.purchasedFAR?.code || value?.additionalDetails?.purchasedFAR || t("CS_NA")}
//           />
//           <Row
//             className="border-none"
//             label={t(`BPA_MASTER_PLAN_LABEL`)}
//             text={owners?.masterPlan?.code || value?.additionalDetails?.masterPlan || t("CS_NA")}
//           />
//           <Row
//             className="border-none"
//             label={t(`BPA_GREEN_BUILDING_LABEL`)}
//             text={owners?.greenbuilding?.code || value?.additionalDetails?.greenbuilding || t("CS_NA")}
//           />
//         </StatusTable>
//       </Card>
//       <Card style={{ paddingRight: "16px" }}>
//         <StatusTable>
//           <CardHeader>{t("BPA_DOCUMENT_DETAILS_LABEL")}</CardHeader>
//           <LinkButton
//             label={<EditIcon style={{ marginTop: "-10px", float: "right", position: "relative", bottom: "32px" }} />}
//             style={{ width: "100px", display: "inline" }}
//             onClick={() => routeTo(`${routeLink}/document-details`)}
//           />
//           {
//             <DocumentsPreview
//               documents={getOrderDocuments(applicationDocs)}
//               svgStyles={{}}
//               isSendBackFlow={false}
//               isHrLine={true}
//               titleStyles={{ fontSize: "18px", lineHeight: "24px", fontWeight: 700, marginBottom: "10px" }}
//             />
//           }
//         </StatusTable>
//       </Card>
//       <Card style={{ paddingRight: "16px" }}>
//         <CardSubHeader>{t("BPA_SUMMARY_FEE_EST")}</CardSubHeader>
//         <StatusTable>
//           <CardSubHeader>{t("BPA_P1_SUMMARY_FEE_EST")}</CardSubHeader>
//           <Row
//             className="border-none"
//             label={t(`BPA_APPL_FEES`)}
//             text={`₹ ${value?.additionalDetails?.P1charges || paymentDetails?.Bill[0]?.billDetails[0]?.amount}`}
//           />
//           <Row
//             className="border-none"
//             label={t(`BUILDING_APPLICATION_FEES`)}
//             text={`₹ ${Math.round(datafromAPI?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea * 10.7639 * 2.5)}`}
//           />
//           <Row className="border-none" label={t(`BOUNDARY_WALL_FEES`)} text={`₹ ${data?.boundaryWallLength * 2.5}`} />
//           <CardSubHeader>{t("BPA_P2_SUMMARY_FEE_EST")}</CardSubHeader>
//           <Row className="border-none" label={t(`BPA_COMMON_MALBA_AMT`)} text={`₹ ${malbafees}`} />
//           <Row className="border-none" label={t(`BPA_COMMON_LABOUR_AMT`)} text={`₹ ${labourCess}`} />
//           <Row className="border-none" label={t(`BPA_COMMON_WATER_AMT`)} text={`₹ ${waterCharges}`} />
//           <Row className="border-none" label={t(`BPA_COMMON_GAUSHALA_AMT`)} text={`₹ ${gaushalaFees}`} />
//           <CardSubHeader>{t("BPA_P2_SUMMARY_FEE_EST_MANUAL")}</CardSubHeader>
//           <CardLabel>{t("BPA_COMMON_DEVELOPMENT_AMT")}</CardLabel>
//           <TextInput
//             t={t}
//             type={"text"}
//             isMandatory={false}
//             optionKey="i18nKey"
//             name="development"
//             defaultValue={value?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES}
//             value={development}
//             onChange={(e) => {
//               setDevelopmentVal(e.target.value);
//             }}
//             {...{ required: true, pattern: "^[0-9]*$" }}
//           />
//           <CardLabel>{t("BPA_COMMON_OTHER_AMT")}</CardLabel>
//           <TextInput
//             t={t}
//             type={"text"}
//             isMandatory={false}
//             optionKey="i18nKey"
//             name="otherCharges"
//             defaultValue={value?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES}
//             value={otherCharges}
//             onChange={(e) => {
//               setOtherChargesVal(e.target.value);
//             }}
//             {...{ required: true, pattern: /^[0-9]*$/ }}
//           />
//           {parseInt(otherCharges) > 0 ? (
//             <div>
//               <CardLabel>{t("BPA_COMMON_OTHER_AMT_DISCRIPTION")}</CardLabel>
//               <TextArea
//                 t={t}
//                 type={"text"}
//                 name="otherChargesDiscription"
//                 defaultValue={value?.additionalDetails?.otherFeesDiscription}
//                 value={otherChargesDisc}
//                 onChange={(e) => {
//                   setOtherChargesDis(e.target.value);
//                 }}
//                 {...{ required: true }}
//               />
//             </div>
//           ) : null}
//           <CardLabel>{t("BPA_COMMON_LESS_AMT")}</CardLabel>
//           <TextInput
//             t={t}
//             type={"text"}
//             isMandatory={false}
//             optionKey="i18nKey"
//             name="lessAdjusment"
//             defaultValue={value?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT}
//             value={lessAdjusment}
//             onChange={(e) => {
//               setLessAdjusmentVal(e.target.value);
//             }}
//             {...{ required: true, pattern: "^[0-9]*$" }}
//           />
//           {parseInt(lessAdjusment) > 0 ? (
//             <div>
//               <CardLabel>{t("BPA_COMMON_LESS_AMT_FILE")}</CardLabel>
//               <UploadFile
//                 id={"noc-doc"}
//                 style={{ marginBottom: "200px" }}
//                 onUpload={selectfile}
//                 onDelete={() => {
//                   setUploadedFile(null);
//                   setFile("");
//                 }}
//                 message={uploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
//                 error={errorFile}
//                 uploadMessage={uploadMessage}
//               />
//             </div>
//           ) : null}
//           {docLessAdjustment?.fileStoreIds?.length && parseInt(value?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT) > 0 && (
//             <CardLabel style={{ marginTop: "15px" }}>{t("BPA_COMMON_LESS_AMT_PREVIOUS_FILE")}</CardLabel>
//           )}
//           {docLessAdjustment?.fileStoreIds?.length && parseInt(value?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT) > 0 && (
//             <a target="_blank" href={docLessAdjustment?.fileStoreIds[0]?.url}>
//               <PDFSvg />
//             </a>
//           )}
//           <Row className="border-none"></Row>
//           <Row
//             className="border-none"
//             label={t(`BPA_P2_TOTAL_FEE`)}
//             text={`₹ ${
//               (parseInt(development) ? parseInt(development) : 0) +
//               (parseInt(otherCharges) ? parseInt(otherCharges) : 0) +
//               parseInt(malbafees) +
//               parseInt(labourCess) +
//               parseInt(waterCharges) +
//               parseInt(gaushalaFees) -
//               (parseInt(lessAdjusment) ? parseInt(lessAdjusment) : 0)
//             }`}
//           />
//           {value?.status === "INITIATED" && (
//             <div>
//               <CardLabel>{t("ARCHITECT_SHOULD_VERIFY_HIMSELF_BY_CLICKING_BELOW_BUTTON")}</CardLabel>
//               <LinkButton label={t("BPA_VERIFY")} onClick={handleVerifyClick} />
//               <br></br>
//               {showMobileInput && (
//                 <React.Fragment>
//                   <br></br>
//                   <CardLabel>{t("BPA_MOBILE_NUMBER")}</CardLabel>
//                   <TextInput
//                     t={t}
//                     type="tel"
//                     isMandatory={true}
//                     optionKey="i18nKey"
//                     name="mobileNumber"
//                     value={mobileNumber}
//                     onChange={handleMobileNumberChange}
//                     {...{ required: true, pattern: "[0-9]{10}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
//                   />
//                   <LinkButton label={t("BPA_GET_OTP")} onClick={handleGetOTPClick} disabled={!isValidMobileNumber} />
//                 </React.Fragment>
//               )}
//               <br></br>
//               {showOTPInput && (
//                 <React.Fragment>
//                   <br></br>
//                   <CardLabel>{t("BPA_OTP")}</CardLabel>
//                   <OTPInput length={6} onChange={(value) => setOTP(value)} value={otp} />
//                   <SubmitBar label={t("VERIFY_OTP")} onSubmit={handleVerifyOTPClick} />
//                   {otpError && <CardLabel style={{ color: "red" }}>{otpError}</CardLabel>}
//                 </React.Fragment>
//               )}
//             </div>
//           )}
//         </StatusTable>
//         <br></br>
//         <br></br>
//         <div>
//           <CheckBox label={checkLabels()} onChange={setdeclarationhandler} styles={{ height: "auto" }} />
//           {showTermsPopup && (
//             <Architectconcent showTermsPopup={showTermsPopup} setShowTermsPopup={setShowTermsPopup} otpVerifiedTimestamp={otpVerifiedTimestamp} />
//           )}
//         </div>
//         <hr style={{ color: "#cccccc", backgroundColor: "#cccccc", height: "2px", marginTop: "20px", marginBottom: "20px" }} />
//       </Card>
//       <Card>
//         <div style={{ marginBottom: "30px" }}>
//           {isOTPVerified && isOwnerOTPVerified && (
//             <div>
//               <CheckBox label={checkLabels()} onChange={setdeclarationhandler} styles={{ height: "auto" }} checked={agree} />
//             </div>
//           )}
//           {isOTPVerified && <CardLabel style={{ color: "green", marginTop: "10px" }}>✓ {t("PROFESSIONAL_VERIFICATION_COMPLETED")}</CardLabel>}
//         </div>
//         {showMobileInput && !isOTPVerified && (
//           <React.Fragment>
//             <CardLabel>{t("BPA_MOBILE_NUMBER")}</CardLabel>
//             <TextInput
//               t={t}
//               type="tel"
//               isMandatory={true}
//               optionKey="i18nKey"
//               name="mobileNumber"
//               value={mobileNumber}
//               onChange={handleMobileNumberChange}
//               {...{ required: true, pattern: "[0-9]{10}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
//             />
//             <LinkButton label={t("BPA_GET_OTP")} onClick={handleGetOTPClick} disabled={!isValidMobileNumber} />
//           </React.Fragment>
//         )}
//         {showOTPInput && !isOTPVerified && (
//           <React.Fragment>
//             <br />
//             <CardLabel>{t("BPA_OTP")}</CardLabel>
//             <OTPInput length={6} onChange={(value) => setOTP(value)} value={otp} />
//             <SubmitBar label={t("VERIFY_OTP")} onSubmit={handleVerifyOTPClick} />
//             {otpError && <CardLabel style={{ color: otpError === t("VERIFIED") ? "green" : "red" }}>{otpError}</CardLabel>}
//           </React.Fragment>
//         )}
//         <hr style={{ color: "#cccccc", backgroundColor: "#cccccc", height: "1px", marginTop: "20px", marginBottom: "20px" }} />
//         <div style={{ marginBottom: "30px" }}>
//           <CheckBox
//             label={ownerCheckLabels()}
//             onChange={setOwnerDeclarationHandler}
//             styles={{ height: "auto" }}
//             checked={ownerAgree}
//             disabled={!isOTPVerified}
//           />
//           {isOwnerOTPVerified && <CardLabel style={{ color: "green", marginTop: "10px" }}>✓ {t("OWNER_VERIFICATION_COMPLETED")}</CardLabel>}
//         </div>
//         {showOwnerMobileInput && !isOwnerOTPVerified && (
//           <React.Fragment>
//             <CardLabel>{t("OWNER_MOBILE_NUMBER")}</CardLabel>
//             <TextInput
//               t={t}
//               type="tel"
//               isMandatory={true}
//               optionKey="i18nKey"
//               name="ownerMobileNumber"
//               value={ownerMobileNumber}
//               onChange={handleOwnerMobileNumberChange}
//               {...{ required: true, pattern: "[0-9]{10}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
//             />
//             <LinkButton label={t("BPA_GET_OTP")} onClick={handleOwnerGetOTPClick} disabled={!isValidOwnerMobileNumber} />
//           </React.Fragment>
//         )}
//         {showOwnerOTPInput && !isOwnerOTPVerified && (
//           <React.Fragment>
//             <br />
//             <CardLabel>{t("ENTER_OTP_SENT_ON_OWNER_MOBILE")}</CardLabel>
//             <OTPInput length={6} onChange={(value) => setOwnerOTP(value)} value={ownerOtp} />
//             <SubmitBar label={t("VERIFY_OWNER_OTP")} onSubmit={handleOwnerVerifyOTPClick} />
//             {ownerOtpError && <CardLabel style={{ color: ownerOtpError === t("VERIFIED") ? "green" : "red" }}>{ownerOtpError}</CardLabel>}
//           </React.Fragment>
//         )}
//         {showTermsPopupOwner && (
//           <CitizenConsent
//             showTermsPopupOwner={showTermsPopupOwner}
//             setShowTermsPopupOwner={setShowTermsPopupOwner}
//             otpVerifiedTimestamp={otpVerifiedTimestamp}
//           />
//         )}
//         <hr style={{ color: "#cccccc", backgroundColor: "#cccccc", height: "2px", marginTop: "20px", marginBottom: "20px" }} />
//         <SubmitBar
//           label={isSubmitting ? t("SUBMITTING...") : t("BPA_SEND_TO_CITIZEN_LABEL")}
//           onSubmit={async () => {
//             setIsSubmitting(true);
//             try {
//               await onSubmitCheck();
//             } catch (error) {
//               console.error("Submission error:", error);
//               alert("Submission failed. Please try again.");
//             } finally {
//               setIsSubmitting(false);
//             }
//           }}
//           disabled={!agree || !isOTPVerified || !isOwnerOTPVerified || isSubmitting}
//         />
//       </Card>
//     </React.Fragment>
//   );
// };

// export default CheckPage;

import {
  Card,
  CardHeader,
  CardSubHeader,
  CardText,
  TextInput,
  CardLabel,
  CheckBox,
  LabelFieldPair,
  UploadFile,
  CitizenInfoLabel,
  Header,
  LinkButton,
  Row,
  StatusTable,
  SubmitBar,
  Table,
  CardSectionHeader,
  EditIcon,
  PDFSvg,
  Loader,
  TextArea,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import Timeline from "../../../components/Timeline";
import { convertEpochToDateDMY, stringReplaceAll, getOrderDocuments } from "../../../utils";
import DocumentsPreview from "../../../../../templates/ApplicationDetails/components/DocumentsPreview";
import Architectconcent from "./Architectconcent";
import { OTPInput, CardLabelError } from "@mseva/digit-ui-react-components";
import useScrutinyDetails from "../../../../../../../../micro-ui-internals/packages/libraries/src/hooks/obps/useScrutinyDetails";
import CitizenConsent from "../BpaApplicationDetail/CitizenConsent";

const CheckPage = ({ onSubmit, value }) => {
  // Initialize states with sessionStorage values to persist across refreshes
  const [development, setDevelopment] = useState(() => {
    const stored = sessionStorage.getItem("development");
    return stored || value?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES || "";
  });

  const [otherCharges, setOtherCharges] = useState(() => {
    const stored = sessionStorage.getItem("otherCharges");
    return stored || value?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES || "";
  });

  const [lessAdjusment, setLessAdjusment] = useState(() => {
    const stored = sessionStorage.getItem("lessAdjusment");
    return stored || value?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT || "";
  });

  const [otherChargesDisc, setOtherChargesDisc] = useState(() => {
    const stored = sessionStorage.getItem("otherChargesDisc");
    return stored || value?.additionalDetails?.otherFeesDiscription || "";
  });
  const [labourCess, setLabourCess] = useState(() => sessionStorage.getItem("LabourCess") || "");
  const [gaushalaFees, setGaushalaFees] = useState(() => sessionStorage.getItem("GaushalaFees") || "");
  const [malbafees, setMalbafees] = useState(() => sessionStorage.getItem("Malbafees") || "");
  const [waterCharges, setWaterCharges] = useState(() => sessionStorage.getItem("WaterCharges") || "");

  const [ownersData, setOwnersData] = useState(() => {
    // <CHANGE> Simplified owner data retrieval from multiple possible sources
    const storedBuildingPermit = sessionStorage.getItem("Digit.BUILDING_PERMIT");
    const storedOwnerData = sessionStorage.getItem("currentOwnerData");
    const storedOwnerFields = sessionStorage.getItem("ownerFields");

    // Try building permit data first
    if (storedBuildingPermit) {
      try {
        const parsedData = JSON.parse(storedBuildingPermit);
        const owners = parsedData?.value?.data?.owners || parsedData?.owners || [];
        if (owners.length > 0) return owners;
      } catch (error) {
        console.error("Error parsing building permit data:", error);
      }
    }

    // Try current owner data
    if (storedOwnerData) {
      try {
        const parsedData = JSON.parse(storedOwnerData);
        const owners = parsedData?.owners || [];
        if (owners.length > 0) return owners;
      } catch (error) {
        console.error("Error parsing owner data:", error);
      }
    }

    // Try owner fields data
    if (storedOwnerFields) {
      try {
        const parsedFields = JSON.parse(storedOwnerFields);
        if (Array.isArray(parsedFields) && parsedFields.length > 0) return parsedFields;
      } catch (error) {
        console.error("Error parsing owner fields:", error);
      }
    }

    // Fallback to value prop or empty array
    return value?.data?.owners || [];
  });

  const getPlotDataFromStorage = () => {
    try {
      const storedValue = sessionStorage.getItem("Digit.BUILDING_PERMIT");
      if (storedValue) {
        const parsedData = JSON.parse(storedValue);
        return parsedData?.value?.data?.edcrDetails || null;
      }
    } catch (error) {
      console.error("Error parsing sessionStorage data:", error);
    }
    return null;
  };

  const getPlanInfoProperties = () => {
    try {
      const storedValue = sessionStorage.getItem("Digit.BUILDING_PERMIT");
      if (storedValue) {
        const parsedData = JSON.parse(storedValue);
        console.log(parsedData?.value?.data?.edcrDetails, "))))))))");
        return parsedData?.value?.data?.edcrDetails || null;
      }
    } catch (error) {
      console.error("Error parsing planInfoProperties:", error);
    }
    return null;
  };

  // Replace/add this section after the existing building extract section:
  const planInfoProps = getPlanInfoProperties();

  const plotDataFromStorage = getPlotDataFromStorage();

  const { t } = useTranslation();
  const history = useHistory();
  const match = useRouteMatch();
  const user = Digit.UserService.getUser();
  const state = Digit.ULBService.getStateId();

  // Dynamic tenant ID calculation - this is the key fix
  const tenantId = useMemo(() => {
    return value?.address?.city?.code || value?.tenantId || user?.info?.permanentCity || Digit.ULBService.getCurrentTenantId();
  }, [value?.address?.city?.code, value?.tenantId, user?.info?.permanentCity]);

  const architectmobilenumber = user?.info?.mobileNumber;

  const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(state, "BPA", ["GaushalaFees", "MalbaCharges", "LabourCess"]);

  const [uploadedFile, setUploadedFile] = useState();
  const [uploadedFileLess, setUploadedFileLess] = useState(() => {
    const stored = sessionStorage.getItem("uploadedFileLess");
    return stored ? JSON.parse(stored) : [];
  });

  const [file, setFile] = useState();
  const [uploadMessage, setUploadMessage] = useState("");
  const [errorFile, setError] = useState(null);
  const [docLessAdjustment, setDocuments] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  let acceptFormat = ".pdf";
  let BusinessService;
  if (value.businessService === "BPA_LOW") BusinessService = "BPA.LOW_RISK_PERMIT_FEE";
  else if (value.businessService === "BPA") BusinessService = "BPA.NC_APP_FEE";

  const {
    data,
    address,
    owners,
    nocDocuments,
    documents,
    additionalDetails,
    subOccupancy,
    PrevStateDocuments,
    PrevStateNocDocuments,
    applicationNo,
  } = value;

  const isEditApplication = window.location.href.includes("editApplication");

  // Initialize agreement states with sessionStorage persistence
  const [agree, setAgree] = useState(() => {
    const stored = sessionStorage.getItem("professionalAgree");
    return stored === "true";
  });

  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [showTermsPopupOwner, setShowTermsPopupOwner] = useState(false);

  const [showMobileInput, setShowMobileInput] = useState(() => {
    const stored = sessionStorage.getItem("showMobileInput");
    return stored === "true";
  });

  const [mobileNumber, setMobileNumber] = useState(() => sessionStorage.getItem("mobileNumber") || architectmobilenumber || "");

  const [showOTPInput, setShowOTPInput] = useState(() => {
    const stored = sessionStorage.getItem("showOTPInput");
    return stored === "true";
  });

  const [otp, setOTP] = useState("");

  const [isOTPVerified, setIsOTPVerified] = useState(() => {
    const stored = sessionStorage.getItem("isOTPVerified");
    const timestamp = sessionStorage.getItem("otpVerifiedTimestamp");
    return stored === "true" && timestamp;
  });

  const [otpError, setOTPError] = useState("");

  const [otpVerifiedTimestamp, setOTPVerifiedTimestamp] = useState(() => {
    const stored = sessionStorage.getItem("otpVerifiedTimestamp");
    return stored ? new Date(stored) : null;
  });

  // Owner verification states with sessionStorage persistence
  const [ownerAgree, setOwnerAgree] = useState(() => {
    const stored = sessionStorage.getItem("ownerAgree");
    return stored === "true";
  });

  const [showOwnerMobileInput, setShowOwnerMobileInput] = useState(() => {
    const stored = sessionStorage.getItem("showOwnerMobileInput");
    return stored === "true";
  });

  const [ownerMobileNumber, setOwnerMobileNumber] = useState(() => {
    // Try to get from sessionStorage first (from OwnerDetails page)
    const storedOwnerData = sessionStorage.getItem("currentOwnerData");
    const storedOwnerMobile = sessionStorage.getItem("ownerMobileNumber");
    const storedOwnerFields = sessionStorage.getItem("ownerFields");

    if (storedOwnerMobile) return storedOwnerMobile;
    if (storedOwnerData) {
      const parsedData = JSON.parse(storedOwnerData);
      return parsedData?.owners?.[0]?.mobileNumber || "";
    }
    if (storedOwnerFields) {
      const parsedFields = JSON.parse(storedOwnerFields);
      return parsedFields?.[0]?.mobileNumber || "";
    }
    return owners?.owners?.[0]?.mobileNumber || "";
  });

  const [showOwnerOTPInput, setShowOwnerOTPInput] = useState(() => {
    const stored = sessionStorage.getItem("showOwnerOTPInput");
    return stored === "true";
  });

  const [ownerOtp, setOwnerOTP] = useState("");

  const [isOwnerOTPVerified, setIsOwnerOTPVerified] = useState(() => {
    const stored = sessionStorage.getItem("isOwnerOTPVerified");
    return stored === "true";
  });

  const [ownerOtpError, setOwnerOtpError] = useState("");

  const Architectvalidations = sessionStorage.getItem("ArchitectConsentdocFilestoreid") ? true : false;

  // Persist states to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem("professionalAgree", agree.toString());
  }, [agree]);

  useEffect(() => {
    sessionStorage.setItem("ownerAgree", ownerAgree.toString());
  }, [ownerAgree]);

  useEffect(() => {
    sessionStorage.setItem("showMobileInput", showMobileInput.toString());
  }, [showMobileInput]);

  useEffect(() => {
    sessionStorage.setItem("showOTPInput", showOTPInput.toString());
  }, [showOTPInput]);

  useEffect(() => {
    sessionStorage.setItem("showOwnerMobileInput", showOwnerMobileInput.toString());
  }, [showOwnerMobileInput]);

  useEffect(() => {
    sessionStorage.setItem("showOwnerOTPInput", showOwnerOTPInput.toString());
  }, [showOwnerOTPInput]);

  useEffect(() => {
    sessionStorage.setItem("isOTPVerified", isOTPVerified.toString());
  }, [isOTPVerified]);

  useEffect(() => {
    sessionStorage.setItem("isOwnerOTPVerified", isOwnerOTPVerified.toString());
  }, [isOwnerOTPVerified]);

  useEffect(() => {
    sessionStorage.setItem("mobileNumber", mobileNumber);
  }, [mobileNumber]);

  useEffect(() => {
    sessionStorage.setItem("ownerMobileNumber", ownerMobileNumber);
  }, [ownerMobileNumber]);

  // Add these useEffect hooks to persist missing data
  useEffect(() => {
    sessionStorage.setItem("development", development);
  }, [development]);

  useEffect(() => {
    sessionStorage.setItem("otherCharges", otherCharges);
  }, [otherCharges]);

  useEffect(() => {
    sessionStorage.setItem("lessAdjusment", lessAdjusment);
  }, [lessAdjusment]);

  useEffect(() => {
    sessionStorage.setItem("otherChargesDisc", otherChargesDisc);
  }, [otherChargesDisc]);

  useEffect(() => {
    if (otpVerifiedTimestamp) {
      sessionStorage.setItem("otpVerifiedTimestamp", otpVerifiedTimestamp.toISOString());
    }
  }, [otpVerifiedTimestamp]);

  const handleTermsLinkClick = (e) => {
    e.preventDefault();
    if (isOTPVerified) {
      setShowTermsPopup(true);
    } else {
      alert("Please verify yourself");
    }
  };

  const checkLabels = () => {
    return (
      <div>
        {t("I_AGREE_TO_BELOW_UNDERTAKING")}
        <LinkButton label={t("DECLARATION_UNDER_SELF_CERTIFICATION_SCHEME")} onClick={handleTermsLinkClick} />
      </div>
    );
  };

  const handleVerifyClick = (e) => {
    e.preventDefault(); // Prevent form submission
    setShowMobileInput(true);
  };

  const handleMobileNumberChange = (e) => {
    setMobileNumber(e.target.value);
  };

  const handleGetOTPClick = async (e) => {
    e.preventDefault(); // Prevent form submission
    try {
      const response = await Digit.UserService.sendOtp({
        otp: {
          mobileNumber: mobileNumber,
          tenantId: user?.info?.tenantId,
          userType: user?.info?.type,
          type: "login",
        },
      });

      if (response.isSuccessful) {
        setShowOTPInput(true);
      } else {
        console.error("Error sending OTP Response is false:", response.error);
        alert("Something Went Wrong");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Something went wrong");
    }
  };

  // const handleOTPChange = (e) => {
  //   setOTP(e.target.value);
  // };

  const requestData = {
    username: mobileNumber,
    password: otp,
    tenantId: user?.info?.tenantId,
    userType: user?.info?.type,
  };

  const handleVerifyOTPClick = async (e) => {
    e.preventDefault(); // Prevent form submission
    console.log("OTP++++++++>");
    try {
      const response = await Digit.UserService.authenticate(requestData);
      if (response.ResponseInfo.status === "Access Token generated successfully") {
        setIsOTPVerified(true);
        setOTPError(t("VERIFIED"));
        const currentTimestamp = new Date();
        setOTPVerifiedTimestamp(currentTimestamp);
        sessionStorage.setItem("otpVerifiedTimestamp", currentTimestamp.toISOString());
      } else {
        setIsOTPVerified(false);
        setOTPError(t("WRONG OTP"));
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("OTP Verification Error ");
      setIsOTPVerified(false);
      setOTPError(t("OTP Verification Error"));
    }
  };

  const setdeclarationhandler = (e) => {
    e.preventDefault(); // Prevent form submission
    if (!isOTPVerified) {
      setShowMobileInput(true);
    } else {
      setAgree(!agree);
    }
  };

  // Owner verification functions
  const handleOwnerTermsLinkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOwnerOTPVerified) {
      setShowTermsPopupOwner(true);
      console.log("OPEN");
    } else {
      alert("Please verify owner first");
    }
  };

  const ownerCheckLabels = () => {
    return (
      <div>
        {t("OWNER_AGREES_TO_BELOW_UNDERTAKING")}
        <LinkButton
          label={t("OWNER_DECLARATION_UNDER_SELF_CERTIFICATION_SCHEME")}
          onClick={handleOwnerTermsLinkClick}
          disabled={!isOwnerOTPVerified}
        />
      </div>
    );
  };

  const handleOwnerVerifyClick = (e) => {
    e.preventDefault(); // Prevent form submission
    setShowOwnerMobileInput(true);
  };

  const handleOwnerMobileNumberChange = (e) => {
    setOwnerMobileNumber(e.target.value);
  };

  const handleOwnerGetOTPClick = async (e) => {
    e.preventDefault(); // Prevent form submission
    try {
      const response = await Digit.UserService.sendOtp({
        otp: {
          mobileNumber: ownerMobileNumber,
          tenantId: user?.info?.tenantId,
          userType: "CITIZEN",
          type: "login",
        },
      });

      if (response.isSuccessful) {
        setShowOwnerOTPInput(true);
      } else {
        console.error("Error sending Owner OTP Response is false:", response.error);
        alert("Something Went Wrong");
      }
    } catch (error) {
      console.error("Error sending Owner OTP:", error);
      alert("Something went wrong");
    }
  };

  // const handleOwnerOTPChange = (e) => {
  //   setOwnerOTP(e.target.value);
  // };

  const ownerRequestData = {
    username: ownerMobileNumber,
    password: ownerOtp,
    tenantId: user?.info?.tenantId,
    userType: "CITIZEN",
  };
  const handleOwnerVerifyOTPClick = async (e) => {
    e.preventDefault(); // Prevent form submission
    console.log("Owner OTP++++++++>");
    try {
      const response = await Digit.UserService.authenticate(ownerRequestData);
      if (response.ResponseInfo.status === "Access Token generated successfully") {
        setIsOwnerOTPVerified(true);
        setOwnerOtpError(t("VERIFIED")); // Changed from setOwnerOTPError to setOwnerOtpError
        setOwnerAgree(true);
      } else {
        setIsOwnerOTPVerified(false);
        setOwnerOtpError(t("WRONG OTP")); // Changed from setOwnerOTPError to setOwnerOtpError
      }
    } catch (error) {
      console.error("Error verifying Owner OTP:", error);
      alert("Owner OTP Verification Error ");
      setIsOwnerOTPVerified(false);
      setOwnerOtpError(t("OTP Verification Error")); // Changed from setOwnerOTPError to setOwnerOtpError
    }
  };

  const setOwnerDeclarationHandler = (e) => {
    e.preventDefault(); // Prevent form submission
    if (!isOwnerOTPVerified) {
      setShowOwnerMobileInput(true);
    } else {
      setOwnerAgree(!ownerAgree);
    }
  };

  const isValidMobileNumber = mobileNumber.length === 10 && /^[0-9]+$/.test(mobileNumber);
  const isValidOwnerMobileNumber = ownerMobileNumber.length === 10 && /^[0-9]+$/.test(ownerMobileNumber);

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
          } catch (err) {}
        }
      }
    })();
  }, [file]);

  useEffect(() => {
    sessionStorage.setItem("uploadedFileLess", JSON.stringify(uploadedFileLess));
  }, [uploadedFileLess]);

  useEffect(() => {
    if (value?.additionalDetails?.lessAdjustmentFeeFiles?.length) {
      const fileStoresIds = value?.additionalDetails?.lessAdjustmentFeeFiles.map((document, index) =>
        index === value?.additionalDetails?.lessAdjustmentFeeFiles?.length - 1
          ? value?.additionalDetails?.lessAdjustmentFeeFiles[value?.additionalDetails?.lessAdjustmentFeeFiles?.length - 1]?.fileStoreId
          : null
      );
      Digit.UploadServices.Filefetch(fileStoresIds, state).then((res) => setDocuments(res?.data));
    }
    if (isEditApplication) {
      setDevelopment(value?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES);
      sessionStorage.setItem("development", value?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES);
      setOtherCharges(value?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES);
      sessionStorage.setItem("otherCharges", value?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES);
      setLessAdjusment(value?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT);
      sessionStorage.setItem("lessAdjusment", value?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT);
      setOtherChargesDisc(value?.additionalDetails?.otherFeesDiscription);
      sessionStorage.setItem("otherChargesDisc", value?.additionalDetails?.otherFeesDiscription);
      setUploadedFileLess(value?.additionalDetails?.lessAdjustmentFeeFiles);
    }
    let plotArea =
      parseInt(sessionStorage.getItem("plotArea")) || datafromAPI?.planDetail?.planInformation?.plotArea || value?.additionalDetails?.area;
    const LabourCess = Math.round(plotArea * 10.7639 > 909 ? mdmsData?.BPA?.LabourCess[1].rate * (plotArea * 10.7639) : 0);
    const GaushalaFees = Math.round(mdmsData?.BPA?.GaushalaFees[0].rate);
    const Malbafees = Math.round(
      plotArea * 10.7639 <= 500
        ? mdmsData?.BPA?.MalbaCharges[0].rate
        : plotArea * 10.7639 > 500 && plotArea * 10.7639 <= 1000
        ? mdmsData?.BPA?.MalbaCharges?.[1].rate
        : mdmsData?.BPA?.MalbaCharges[2].rate || 500
    );
    sessionStorage.setItem("Malbafees", Malbafees);
    sessionStorage.setItem("WaterCharges", Malbafees / 2);
    sessionStorage.setItem("GaushalaFees", GaushalaFees);
    sessionStorage.setItem("LabourCess", LabourCess);
    setGaushalaFees(GaushalaFees);
    setLabourCess(LabourCess);
    setMalbafees(Malbafees);
    setWaterCharges(Malbafees / 2);
  }, [mdmsData, value?.additionalDetails]);

  // for application documents
  let improvedDoc = [];
  PrevStateDocuments?.map((preDoc) => {
    improvedDoc.push({ ...preDoc, module: "OBPS" });
  });
  documents?.documents?.map((appDoc) => {
    improvedDoc.push({ ...appDoc, module: "OBPS" });
  });

  //for NOC documents
  PrevStateNocDocuments?.map((preNocDoc) => {
    improvedDoc.push({ ...preNocDoc, module: "NOC" });
  });
  nocDocuments?.nocDocuments?.map((nocDoc) => {
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

  // Use the updated custom hook with proper parameters
  const { data: datafromAPI, isLoading, refetch } = useScrutinyDetails(tenantId, value?.data?.scrutinyNumber, {
    enabled: value?.data?.scrutinyNumber && tenantId ? true : false,
  });

  let consumerCode = value?.applicationNo;
  const fetchBillParams = { consumerCode };

  function getdate(date) {
    let newdate = Date.parse(date);
    return `${
      new Date(newdate).getDate().toString() + "/" + (new Date(newdate).getMonth() + 1).toString() + "/" + new Date(newdate).getFullYear().toString()
    }`;
  }

  const { data: paymentDetails } = Digit.Hooks.useFetchBillsForBuissnessService(
    { businessService: BusinessService, ...fetchBillParams, tenantId: tenantId },
    {
      enabled: consumerCode ? true : false,
      retry: false,
    }
  );

  if (!isEditApplication) {
    // value.additionalDetails.P1charges=paymentDetails?.Bill[0]?.billDetails[0]?.amount;
  }

  const sendbacktocitizenApp = window.location.href.includes("sendbacktocitizen");

  let routeLink = `/digit-ui/citizen/obps/bpa/${additionalDetails?.applicationType.toLowerCase()}/${additionalDetails?.serviceType.toLowerCase()}`;
  if (isEditApplication) routeLink = `/digit-ui/citizen/obps/editApplication/bpa/${value?.tenantId}/${value?.applicationNo}`;
  if (sendbacktocitizenApp) routeLink = `/digit-ui/citizen/obps/sendbacktocitizen/bpa/${value?.tenantId}/${value?.applicationNo}`;

  const tableHeader = [
    { name: "BPA_TABLE_COL_FLOOR", id: "Floor" },
    { name: "BPA_TABLE_COL_LEVEL", id: "Level" },
    { name: "BPA_TABLE_COL_OCCUPANCY", id: "Occupancy" },
    { name: "BPA_TABLE_COL_BUILDUPAREA", id: "BuildupArea" },
    { name: "BPA_TABLE_COL_FLOORAREA", id: "FloorArea" },
    { name: "BPA_TABLE_COL_CARPETAREA", id: "CarpetArea" },
  ];

  const accessData = (plot) => {
    const name = plot;
    return (originalRow, rowIndex, columns) => {
      return originalRow[name];
    };
  };

  const tableColumns = useMemo(() => {
    return tableHeader.map((ob) => ({
      Header: t(`${ob.name}`),
      accessor: accessData(ob.id),
      id: ob.id,
    }));
  });

  function getFloorData(block) {
    let floors = [];
    block?.building?.floors.map((ob) => {
      floors.push({
        Floor: t(`BPA_FLOOR_NAME_${ob.number}`),
        Level: ob.number,
        Occupancy: t(`${ob.occupancies?.[0]?.type}`),
        BuildupArea: ob.occupancies?.[0]?.builtUpArea,
        FloorArea: ob.occupancies?.[0]?.floorArea || 0,
        CarpetArea: ob.occupancies?.[0]?.CarpetArea || 0,
        key: t(`BPA_FLOOR_NAME_${ob.number}`),
      });
    });
    return floors;
  }

  function routeTo(jumpTo) {
    location.href = jumpTo;
  }

  function getBlockSubOccupancy(index) {
    let subOccupancyString = "";
    let returnValueArray = [];
    subOccupancy &&
      subOccupancy[`Block_${index + 1}`] &&
      subOccupancy[`Block_${index + 1}`].map((ob) => {
        returnValueArray.push(`${t(stringReplaceAll(ob?.i18nKey?.toUpperCase(), "-", "_"))}`);
      });
    return returnValueArray?.length ? returnValueArray.join(", ") : "NA";
  }

  if (pdfLoading || isLoading) {
    return <Loader />;
  }

  const dynamicTenantId = value?.address?.city?.code || address?.city?.code || tenantId;

  function onSubmitCheck() {
    if (!development) {
      sessionStorage.setItem("development", 0);
    }
    if (!lessAdjusment) {
      sessionStorage.setItem("lessAdjusment", 0);
    }
    if (!otherCharges) {
      sessionStorage.setItem("otherCharges", 0);
    }
    if (
      parseInt(lessAdjusment) >
      parseInt(development) + parseInt(otherCharges) + parseInt(malbafees) + parseInt(labourCess) + parseInt(waterCharges) + parseInt(gaushalaFees)
    ) {
      alert(t("Enterd Less Adjustment amount is invalid"));
    } else {
      // onSubmit({ dynamicTenantId, edcrNumber });

      const edcrNumber =
        value?.data?.scrutinyNumber?.edcrNumber || value?.data?.scrutinyNumber || data?.scrutinyNumber?.edcrNumber || plotDataFromStorage?.edcrNumber;

      onSubmit({
        tenantId: dynamicTenantId,
        edcrNumber: edcrNumber,
      });
    }
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
    sessionStorage.setItem("otherChargesDisc", value);
  }

  function selectfile(e) {
    setUploadedFile(e.target.files[0]);
    setFile(e.target.files[0]);
  }

  return (
    <React.Fragment>
      <Timeline currentStep={4} />
      <Header styles={{ marginLeft: "10px" }}>{t("BPA_STEPPER_SUMMARY_HEADER")}</Header>
      <Card style={{ paddingRight: "16px" }}>
        <StatusTable>
          <Row className="border-none" label={t(`BPA_APPLICATION_NUMBER_LABEL`)} text={plotDataFromStorage?.applicationNumber} />
        </StatusTable>
      </Card>
      <Card style={{ paddingRight: "16px" }}>
        <CardHeader>{t(`BPA_BASIC_DETAILS_TITLE`)}</CardHeader>
        <StatusTable>
          <Row className="border-none" label={t(`BPA_BASIC_DETAILS_APP_DATE_LABEL`)} text={convertEpochToDateDMY(Number(data?.applicationDate))} />
          <Row className="border-none" label={t(`BPA_BASIC_DETAILS_APPLICATION_TYPE_LABEL`)} text={t(`WF_BPA_${data?.applicationType}`)} />
          <Row className="border-none" label={t(`BPA_BASIC_DETAILS_SERVICE_TYPE_LABEL`)} text={t(data?.serviceType)} />
          <Row className="border-none" label={t(`BPA_BASIC_DETAILS_OCCUPANCY_LABEL`)} text={data?.occupancyType} />
          <Row className="border-none" label={t(`BPA_BASIC_DETAILS_RISK_TYPE_LABEL`)} text={t(`WF_BPA_${data?.riskType}`)} />
        </StatusTable>
      </Card>
      <Card style={{ paddingRight: "16px" }}>
        <StatusTable>
          <CardHeader>{t("BPA_PLOT_DETAILS_TITLE")}</CardHeader>
          <LinkButton
            label={<EditIcon style={{ marginTop: "-10px", float: "right", position: "relative", bottom: "32px" }} />}
            style={{ width: "100px", display: "inline" }}
            onClick={() => routeTo(`${routeLink}/plot-details`)}
          />

          <Row
            className="border-none"
            textStyle={{ paddingLeft: "12px" }}
            label={t(`BPA_BOUNDARY_PLOT_AREA_LABEL`)}
            text={
              plotDataFromStorage?.planDetail?.planInformation?.plotArea ||
              datafromAPI?.planDetail?.planInformation?.plotArea ||
              value?.data?.edcrDetails?.planDetail?.planInformation?.plotArea
                ? `${
                    plotDataFromStorage?.planDetail?.planInformation?.plotArea ||
                    datafromAPI?.planDetail?.planInformation?.plotArea ||
                    value?.data?.edcrDetails?.planDetail?.planInformation?.plotArea
                  } ${t(`BPA_SQ_MTRS_LABEL`)}`
                : t("CS_NA")
            }
          />
          <Row
            className="border-none"
            label={t(`BPA_PLOT_NUMBER_LABEL`)}
            text={plotDataFromStorage?.planDetail?.planInfoProperties?.PLOT_NO || t("CS_NA")}
          />
          <Row
            className="border-none"
            label={t(`BPA_KHATHA_NUMBER_LABEL`)}
            text={plotDataFromStorage?.planDetail?.planInfoProperties?.KHATA_NO || t("CS_NA")}
          />
          {console.log(plotDataFromStorage, "P+++++")}
          <Row
            className="border-none"
            label={t(`BPA_BOUNDARY_LAND_REG_DETAIL_LABEL`)}
            text={data?.registrationDetails || value?.data?.registrationDetails || t("CS_NA")}
          />
          <Row
            className="border-none"
            label={t(`BPA_BOUNDARY_WALL_LENGTH_LABEL`)}
            text={data?.boundaryWallLength || value?.data?.boundaryWallLength || t("CS_NA")}
          />
          <Row
            className="border-none"
            label={t(`BPA_KHASRA_NUMBER_LABEL`)}
            text={
              plotDataFromStorage?.planInfoProperties?.KHASRA_NO ||
              data?.khasraNumber ||
              value?.additionalDetails?.khasraNumber ||
              value?.data?.khasraNumber ||
              t("CS_NA")
            }
          />
          <Row
            className="border-none"
            label={t(`BPA_WARD_NUMBER_LABEL`)}
            text={data?.wardnumber || value?.additionalDetails?.wardnumber || value?.data?.wardnumber || t("CS_NA")}
          />
        </StatusTable>
      </Card>
      <Card style={{ paddingRight: "16px" }}>
        <CardHeader>{t("BPA_STEPPER_SCRUTINY_DETAILS_HEADER")}</CardHeader>
        <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_EDCR_DETAILS")}</CardSubHeader>
        <StatusTable style={{ border: "none" }}>
          <Row className="border-none" label={t("BPA_EDCR_NO_LABEL")} text={data?.scrutinyNumber?.edcrNumber}></Row>
          <CardSubHeader>{t("BPA_UPLOADED_PLAN_DIAGRAM")}</CardSubHeader>
          <LinkButton label={<PDFSvg />} onClick={() => routeTo(datafromAPI?.updatedDxfFile)} />
          <p
            style={{
              marginTop: "8px",
              marginBottom: "20px",
              textAlign: "Left",
              fontSize: "16px",
              lineHeight: "19px",
              color: "#505A5F",
              fontWeight: "400",
            }}
          >
            {t(`Uploaded Plan.pdf`)}
          </p>
          <CardSubHeader>{t("BPA_SCRUNTINY_REPORT_OUTPUT")}</CardSubHeader>
          <LinkButton label={<PDFSvg />} onClick={() => routeTo(datafromAPI?.planReport)} />
          <p
            style={{
              marginTop: "8px",
              marginBottom: "20px",
              textAlign: "Left",
              fontSize: "16px",
              lineHeight: "19px",
              color: "#505A5F",
              fontWeight: "400",
            }}
          >
            {t(`BPA_SCRUTINY_REPORT_PDF`)}
          </p>
        </StatusTable>
        <hr style={{ color: "#cccccc", backgroundColor: "#cccccc", height: "2px", marginTop: "20px", marginBottom: "20px" }} />
        <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_BUILDING_EXTRACT_HEADER")}</CardSubHeader>

        <Card style={{ paddingRight: "16px" }}>
          <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_PLAN_INFORMATION_PROPERTIES")}</CardSubHeader>
          <StatusTable>
            <Row
              className="border-none"
              label={t("BPA_PLOT_AREA_M2")}
              text={`${planInfoProps?.PLOT_AREA_M2 || t("CS_NA")} ${planInfoProps?.PLOT_AREA_M2 ? t("BPA_SQ_MTRS_LABEL") : ""}`}
            />
            {console.log(planInfoProps, "PLAN")}
            <Row
              className="border-none"
              label={t("BPA_PLOT_NUMBER")}
              text={plotDataFromStorage?.planDetail?.planInfoProperties?.PLOT_NO || t("CS_NA")}
            />
            <Row
              className="border-none"
              label={t("BPA_KHASRA_NUMBER")}
              text={plotDataFromStorage?.planDetail?.planInfoProperties?.KHASRA_NO || t("CS_NA")}
            />
            <Row
              className="border-none"
              label={t("BPA_KHATA_NUMBER")}
              text={plotDataFromStorage?.planDetail?.planInfoProperties?.KHATA_NO || t("CS_NA")}
            />
            <Row
              className="border-none"
              label={t("BPA_KHATUNI_NUMBER")}
              text={plotDataFromStorage?.planDetail?.planInfoProperties?.KHATUNI_NO || t("CS_NA")}
            />
            <Row
              className="border-none"
              label={t("BPA_DISTRICT")}
              text={plotDataFromStorage?.planDetail?.planInfoProperties?.DISTRICT || t("CS_NA")}
            />
            <Row className="border-none" label={t("BPA_MAUZA")} text={plotDataFromStorage?.planDetail?.planInfoProperties?.MAUZA || t("CS_NA")} />
            <Row
              className="border-none"
              label={t("BPA_AREA_TYPE")}
              text={plotDataFromStorage?.planDetail?.planInfoProperties?.AREA_TYPE || t("CS_NA")}
            />
            <Row
              className="border-none"
              label={t("BPA_LAND_USE_ZONE")}
              text={plotDataFromStorage?.planDetail?.planInfoProperties?.LAND_USE_ZONE || t("CS_NA")}
            />
            <Row
              className="border-none"
              label={t("BPA_NUMBER_OF_FLOORS")}
              text={plotDataFromStorage?.planDetail?.planInfoProperties?.NUMBER_OF_FLOORS || t("CS_NA")}
            />
            <Row
              className="border-none"
              label={t("BPA_ULB_TYPE")}
              text={plotDataFromStorage?.planDetail?.planInfoProperties?.ULB_TYPE || t("CS_NA")}
            />

            <CardSubHeader style={{ fontSize: "18px", marginTop: "20px" }}>{t("BPA_PLOT_DIMENSIONS")}</CardSubHeader>
            <Row className="border-none" label={t("BPA_AVG_PLOT_DEPTH")} text={plotDataFromStorage?.planDetail?.planInfoProperties?.AVG_PLOT_DEPTH} />
            <Row className="border-none" label={t("BPA_AVG_PLOT_WIDTH")} text={plotDataFromStorage?.planDetail?.planInfoProperties?.AVG_PLOT_WIDTH} />

            <CardSubHeader style={{ fontSize: "18px", marginTop: "20px" }}>{t("BPA_ROAD_DETAILS")}</CardSubHeader>
            <Row className="border-none" label={t("BPA_ROAD_TYPE")} text={planInfoProps?.ROAD_TYPE || t("CS_NA")} />
            <Row className="border-none" label={t("BPA_ROAD_WIDTH")} text={plotDataFromStorage?.planDetail?.planInfoProperties?.ROAD_WIDTH} />

            <CardSubHeader style={{ fontSize: "18px", marginTop: "20px" }}>{t("BPA_SUSTAINABILITY_FEATURES")}</CardSubHeader>
            <Row
              className="border-none"
              label={t("BPA_GREEN_BUILDINGS_SUSTAINABILITY")}
              text={plotDataFromStorage?.planDetail?.planInfoProperties?.PROVISION_FOR_GREEN_BUILDINGS_AND_SUSTAINABILITY || t("CS_NA")}
            />
          </StatusTable>
        </Card>
        <hr style={{ color: "#cccccc", backgroundColor: "#cccccc", height: "2px", marginTop: "20px", marginBottom: "20px" }} />
        <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_OCC_SUBOCC_HEADER")}</CardSubHeader>
        {datafromAPI?.planDetail?.blocks.map((block, index) => (
          <div
            key={index}
            style={
              datafromAPI?.planDetail?.blocks?.length > 1
                ? {
                    marginTop: "19px",
                    background: "#FAFAFA",
                    border: "1px solid #D6D5D4",
                    borderRadius: "4px",
                    padding: "8px",
                    lineHeight: "19px",
                    maxWidth: "960px",
                    minWidth: "280px",
                  }
                : {}
            }
          >
            <CardSubHeader style={{ marginTop: "15px", fontSize: "18px" }}>
              {t("BPA_BLOCK_SUBHEADER")} {index + 1}
            </CardSubHeader>
            <StatusTable>
              <Row
                className="border-none"
                textStyle={{ wordBreak: "break-word" }}
                label={t("BPA_SUB_OCCUPANCY_LABEL")}
                text={getBlockSubOccupancy(index) === "" ? t("CS_NA") : getBlockSubOccupancy(index)}
              ></Row>
            </StatusTable>
            <div style={{ overflow: "scroll" }}>
              <Table
                className="customTable table-fixed-first-column table-border-style"
                t={t}
                disableSort={false}
                autoSort={true}
                manualPagination={false}
                isPaginationRequired={false}
                initSortId="S N "
                data={getFloorData(block)}
                columns={tableColumns}
                getCellProps={(cellInfo) => {
                  return {
                    style: {},
                  };
                }}
              />
            </div>
          </div>
        ))}
        <hr style={{ color: "#cccccc", backgroundColor: "#cccccc", height: "2px", marginTop: "20px", marginBottom: "20px" }} />
        <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_APP_DETAILS_DEMOLITION_DETAILS_LABEL")}</CardSubHeader>
        <StatusTable style={{ border: "none" }}>
          <Row
            className="border-none"
            label={t("BPA_APPLICATION_DEMOLITION_AREA_LABEL")}
            text={
              datafromAPI?.planDetail?.planInformation?.demolitionArea
                ? `${datafromAPI?.planDetail?.planInformation?.demolitionArea} ${t("BPA_SQ_MTRS_LABEL")}`
                : t("CS_NA")
            }
          ></Row>
        </StatusTable>
      </Card>
      <Card style={{ paddingRight: "16px" }}>
        <StatusTable>
          <CardHeader>{t("BPA_NEW_TRADE_DETAILS_HEADER_DETAILS")}</CardHeader>
          <LinkButton
            label={<EditIcon style={{ marginTop: "-10px", float: "right", position: "relative", bottom: "32px" }} />}
            style={{ width: "100px", display: "inline" }}
            onClick={() => routeTo(`${routeLink}/location`)}
          />
          <Row className="border-none" textStyle={{ paddingLeft: "12px" }} label={t(`BPA_DETAILS_PIN_LABEL`)} text={address?.pincode || t("CS_NA")} />
          <Row className="border-none" label={t(`BPA_CITY_LABEL`)} text={address?.city?.name || t("CS_NA")} />
          <Row className="border-none" label={t(`BPA_LOC_MOHALLA_LABEL`)} text={address?.locality?.name || t("CS_NA")} />
          <Row className="border-none" label={t(`BPA_DETAILS_SRT_NAME_LABEL`)} text={address?.street || t("CS_NA")} />
          <Row className="border-none" label={t(`ES_NEW_APPLICATION_LOCATION_LANDMARK`)} text={address?.landmark || t("CS_NA")} />
        </StatusTable>
      </Card>
      <Card style={{ paddingRight: "16px" }}>
        <StatusTable>
          <CardHeader>{t("BPA_APPLICANT_DETAILS_HEADER")}</CardHeader>
          <LinkButton
            label={<EditIcon style={{ marginTop: "-10px", float: "right", position: "relative", bottom: "32px" }} />}
            style={{ width: "100px", display: "inline" }}
            onClick={() => routeTo(`${routeLink}/owner-details`)}
          />
          {ownersData &&
            ownersData.length > 0 &&
            ownersData.map((ob, index) => (
              <div
                key={index}
                style={
                  ownersData.length > 1
                    ? {
                        marginTop: "19px",
                        background: "#FAFAFA",
                        border: "1px solid #D6D5D4",
                        borderRadius: "4px",
                        padding: "8px",
                        lineHeight: "19px",
                        maxWidth: "960px",
                        minWidth: "280px",
                      }
                    : {}
                }
              >
                {ownersData.length > 1 && (
                  <CardSubHeader>
                    {t("COMMON_OWNER")} {index + 1}
                  </CardSubHeader>
                )}
                <StatusTable>
                  <Row
                    className="border-none"
                    textStyle={index == 0 && ownersData.length == 1 ? { paddingLeft: "12px" } : {}}
                    label={t(`CORE_COMMON_NAME`)}
                    text={ob?.name || "N/A"}
                  />
                  <Row
                    className="border-none"
                    label={t(`BPA_APPLICANT_GENDER_LABEL`)}
                    text={ob?.gender?.i18nKey ? t(ob.gender.i18nKey) : ob?.gender?.code || "N/A"}
                  />
                  <Row className="border-none" label={t(`CORE_COMMON_MOBILE_NUMBER`)} text={ob?.mobileNumber || "N/A"} />
                  <Row className="border-none" label={t(`CORE_COMMON_EMAIL_ID`)} text={ob?.emailId || t("CS_NA")} />
                  <Row className="border-none" label={t(`BPA_IS_PRIMARY_OWNER_LABEL`)} text={`${ob?.isPrimaryOwner || false}`} />
                </StatusTable>
              </div>
            ))}
        </StatusTable>
      </Card>
      <Card style={{ paddingRight: "16px" }}>
        <StatusTable>
          <CardHeader>{t("BPA_ADDITIONAL_BUILDING_DETAILS")}</CardHeader>
          <Row
            className="border-none"
            label={t(`BPA_APPROVED_COLONY_LABEL`)}
            text={owners?.approvedColony?.i18nKey || value?.additionalDetails?.approvedColony || t("CS_NA")}
          />
          <Row
            className="border-none"
            label={t(`BPA_ULB_TYPE_LABEL`)}
            text={owners?.Ulblisttype?.value || value?.additionalDetails?.Ulblisttype || t("CS_NA")}
          />
          <Row
            className="border-none"
            label={t(`BPA_ULB_NAME_LABEL`)}
            text={owners?.UlbName?.code || value?.additionalDetails?.UlbName || t("CS_NA")}
          />
          <Row
            className="border-none"
            label={t(`BPA_DISTRICT_LABEL`)}
            text={owners?.District?.code || value?.additionalDetails?.District || t("CS_NA")}
          />
          <Row
            className="border-none"
            label={t(`BPA_BUILDING_STATUS_LABEL`)}
            text={owners?.buildingStatus?.code || value?.additionalDetails?.buildingStatus || t("CS_NA")}
          />
          <Row
            className="border-none"
            label={t(`BPA_CORE_AREA_LABEL`)}
            text={datafromAPI?.planDetail?.coreArea || value?.additionalDetails?.coreArea || t("CS_NA")}
          />
          <Row
            className="border-none"
            label={t(`BPA_PROPOSED_SITE_LABEL`)}
            text={owners?.proposedSite?.code || value?.additionalDetails?.proposedSite || t("CS_NA")}
          />
          {owners?.schemes?.code === "SCHEME" && (
            <React.Fragment>
              <Row
                className="border-none"
                label={t(`BPA_SCHEME_TYPE_LABEL`)}
                text={owners?.schemesselection?.value || value?.additionalDetails?.schemesselection || t("CS_NA")}
              />
              <Row
                className="border-none"
                label={t(`BPA_SCHEME_NAME_LABEL`)}
                text={owners?.schemeName || value?.additionalDetails?.schemeName || t("CS_NA")}
              />
              <Row
                className="border-none"
                label={t(`BPA_TRANFERRED_SCHEME_LABEL`)}
                text={owners?.transferredscheme || value?.additionalDetails?.transferredscheme || t("CS_NA")}
              />
            </React.Fragment>
          )}
          <Row
            className="border-none"
            label={t(`BPA_PURCHASED_FAR_LABEL`)}
            text={owners?.purchasedFAR?.code || value?.additionalDetails?.purchasedFAR || t("CS_NA")}
          />
          <Row
            className="border-none"
            label={t(`BPA_MASTER_PLAN_LABEL`)}
            text={owners?.masterPlan?.code || value?.additionalDetails?.masterPlan || t("CS_NA")}
          />
          <Row
            className="border-none"
            label={t(`BPA_GREEN_BUILDING_LABEL`)}
            text={owners?.greenbuilding?.code || value?.additionalDetails?.greenbuilding || t("CS_NA")}
          />
        </StatusTable>
      </Card>
      <Card style={{ paddingRight: "16px" }}>
        <StatusTable>
          <CardHeader>{t("BPA_DOCUMENT_DETAILS_LABEL")}</CardHeader>
          <LinkButton
            label={<EditIcon style={{ marginTop: "-10px", float: "right", position: "relative", bottom: "32px" }} />}
            style={{ width: "100px", display: "inline" }}
            onClick={() => routeTo(`${routeLink}/document-details`)}
          />
          {
            <DocumentsPreview
              documents={getOrderDocuments(applicationDocs)}
              svgStyles={{}}
              isSendBackFlow={false}
              isHrLine={true}
              titleStyles={{ fontSize: "18px", lineHeight: "24px", fontWeight: 700, marginBottom: "10px" }}
            />
          }
        </StatusTable>
      </Card>
      <Card style={{ paddingRight: "16px" }}>
        <CardSubHeader>{t("BPA_SUMMARY_FEE_EST")}</CardSubHeader>
        <StatusTable>
          <CardSubHeader>{t("BPA_P1_SUMMARY_FEE_EST")}</CardSubHeader>
          <Row
            className="border-none"
            label={t(`BPA_APPL_FEES`)}
            text={`₹ ${value?.additionalDetails?.P1charges || paymentDetails?.Bill[0]?.billDetails[0]?.amount}`}
          />
          <Row
            className="border-none"
            label={t(`BUILDING_APPLICATION_FEES`)}
            text={`₹ ${Math.round(datafromAPI?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea * 10.7639 * 2.5)}`}
          />
          <Row className="border-none" label={t(`BOUNDARY_WALL_FEES`)} text={`₹ ${data?.boundaryWallLength * 2.5}`} />
          <CardSubHeader>{t("BPA_P2_SUMMARY_FEE_EST")}</CardSubHeader>
          <Row className="border-none" label={t(`BPA_COMMON_MALBA_AMT`)} text={`₹ ${malbafees}`} />
          <Row className="border-none" label={t(`BPA_COMMON_LABOUR_AMT`)} text={`₹ ${labourCess}`} />
          <Row className="border-none" label={t(`BPA_COMMON_WATER_CHARGE`)} text={`₹ ${waterCharges}`} />
          <Row className="border-none" label={t(`BPA_COMMON_GAUSHALA_AMT`)} text={`₹ ${gaushalaFees}`} />
          <Row className="border-none" label={t(`BPA_COMMON_MINING_CHARGE`)} text={`N/A`} />
          <Row className="border-none" label={t(`BPA_COMMON_SUB_DIV_CHARGE`)} text={`N/A`} />
          <Row className="border-none" label={t(`BPA_COMMON_COM_AMT`)} text={`N/A`} />
          {/* <Row className="border-none" label={t(`BPA_COMMON_GAUSHALA_AMT`)} text={`₹ ${gaushalaFees}`} /> */}
          <CardSubHeader>{t("BPA_P2_SUMMARY_FEE_EST_MANUAL")}</CardSubHeader>
          <CardLabel>{t("BPA_COMMON_DEVELOPMENT_AMT")}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="development"
            defaultValue={value?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES}
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
            defaultValue={value?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES}
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
                defaultValue={value?.additionalDetails?.otherFeesDiscription}
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
            defaultValue={value?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT}
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
                uploadMessage={uploadMessage}
              />
            </div>
          ) : null}
          {docLessAdjustment?.fileStoreIds?.length && parseInt(value?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT) > 0 && (
            <CardLabel style={{ marginTop: "15px" }}>{t("BPA_COMMON_LESS_AMT_PREVIOUS_FILE")}</CardLabel>
          )}
          {docLessAdjustment?.fileStoreIds?.length && parseInt(value?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT) > 0 && (
            <a target="_blank" href={docLessAdjustment?.fileStoreIds[0]?.url}>
              <PDFSvg />
            </a>
          )}
          <Row className="border-none"></Row>
          <Row
            className="border-none"
            label={t(`BPA_P2_TOTAL_FEE`)}
            text={`₹ ${
              (parseInt(development) ? parseInt(development) : 0) +
              (parseInt(otherCharges) ? parseInt(otherCharges) : 0) +
              parseInt(malbafees) +
              parseInt(labourCess) +
              parseInt(waterCharges) +
              parseInt(gaushalaFees) -
              (parseInt(lessAdjusment) ? parseInt(lessAdjusment) : 0)
            }`}
          />
          {value?.status === "INITIATED" && (
            <div>
              <CardLabel>{t("ARCHITECT_SHOULD_VERIFY_HIMSELF_BY_CLICKING_BELOW_BUTTON")}</CardLabel>
              <LinkButton label={t("BPA_VERIFY")} onClick={handleVerifyClick} />
              <br></br>
              {showMobileInput && (
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
                    onChange={handleMobileNumberChange}
                    {...{ required: true, pattern: "[0-9]{10}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
                  />
                  <LinkButton label={t("BPA_GET_OTP")} onClick={handleGetOTPClick} disabled={!isValidMobileNumber} />
                </React.Fragment>
              )}
              <br></br>
              {showOTPInput && (
                <React.Fragment>
                  <br></br>
                  <CardLabel>{t("BPA_OTP")}</CardLabel>
                  <OTPInput length={6} onChange={(value) => setOTP(value)} value={otp} />
                  <SubmitBar label={t("VERIFY_OTP")} onSubmit={handleVerifyOTPClick} />
                  {otpError && <CardLabel style={{ color: "red" }}>{otpError}</CardLabel>}
                </React.Fragment>
              )}
            </div>
          )}
        </StatusTable>
        <br></br>
        <br></br>
        <div>
          {/* <CHANGE> Added checked prop to make checkbox active state visible */}
          <CheckBox label={checkLabels()} onChange={setdeclarationhandler} styles={{ height: "auto" }} checked={agree} />
          {showTermsPopup && (
            <Architectconcent showTermsPopup={showTermsPopup} setShowTermsPopup={setShowTermsPopup} otpVerifiedTimestamp={otpVerifiedTimestamp} />
          )}
        </div>
        <hr style={{ color: "#cccccc", backgroundColor: "#cccccc", height: "2px", marginTop: "20px", marginBottom: "20px" }} />
      </Card>
      <Card>
        <div style={{ marginBottom: "30px" }}>
          {isOTPVerified && isOwnerOTPVerified && (
            <div>
              {/* <CHANGE> This checkbox already has checked prop, keeping it as is */}
              <CheckBox label={checkLabels()} onChange={setdeclarationhandler} styles={{ height: "auto" }} checked={agree} />
            </div>
          )}
          {isOTPVerified && <CardLabel style={{ color: "green", marginTop: "10px" }}>✓ {t("PROFESSIONAL_VERIFICATION_COMPLETED")}</CardLabel>}
        </div>
        {showMobileInput && !isOTPVerified && (
          <React.Fragment>
            <CardLabel>{t("BPA_MOBILE_NUMBER")}</CardLabel>
            <TextInput
              t={t}
              type="tel"
              isMandatory={true}
              optionKey="i18nKey"
              name="mobileNumber"
              value={mobileNumber}
              onChange={handleMobileNumberChange}
              {...{ required: true, pattern: "[0-9]{10}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
            />
            <LinkButton label={t("BPA_GET_OTP")} onClick={handleGetOTPClick} disabled={!isValidMobileNumber} />
          </React.Fragment>
        )}
        {showOTPInput && !isOTPVerified && (
          <React.Fragment>
            <br />
            <CardLabel>{t("BPA_OTP")}</CardLabel>
            <OTPInput length={6} onChange={(value) => setOTP(value)} value={otp} />
            <SubmitBar label={t("VERIFY_OTP")} onSubmit={handleVerifyOTPClick} />
            {otpError && <CardLabel style={{ color: otpError === t("VERIFIED") ? "green" : "red" }}>{otpError}</CardLabel>}
          </React.Fragment>
        )}
        <hr style={{ color: "#cccccc", backgroundColor: "#cccccc", height: "1px", marginTop: "20px", marginBottom: "20px" }} />
        <div style={{ marginBottom: "30px" }}>
          {/* <CHANGE> This checkbox already has checked prop, keeping it as is */}
          <CheckBox
            label={ownerCheckLabels()}
            onChange={setOwnerDeclarationHandler}
            styles={{ height: "auto" }}
            checked={ownerAgree}
            disabled={!isOTPVerified}
          />
          {isOwnerOTPVerified && <CardLabel style={{ color: "green", marginTop: "10px" }}>✓ {t("OWNER_VERIFICATION_COMPLETED")}</CardLabel>}
        </div>
        {showOwnerMobileInput && !isOwnerOTPVerified && (
          <React.Fragment>
            <CardLabel>{t("OWNER_MOBILE_NUMBER")}</CardLabel>
            <TextInput
              t={t}
              type="tel"
              isMandatory={true}
              optionKey="i18nKey"
              name="ownerMobileNumber"
              value={ownerMobileNumber}
              onChange={handleOwnerMobileNumberChange}
              {...{ required: true, pattern: "[0-9]{10}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
            />
            <LinkButton label={t("BPA_GET_OTP")} onClick={handleOwnerGetOTPClick} disabled={!isValidOwnerMobileNumber} />
          </React.Fragment>
        )}
        {showOwnerOTPInput && !isOwnerOTPVerified && (
          <React.Fragment>
            <br />
            <CardLabel>{t("ENTER_OTP_SENT_ON_OWNER_MOBILE")}</CardLabel>
            <OTPInput length={6} onChange={(value) => setOwnerOTP(value)} value={ownerOtp} />
            <SubmitBar label={t("VERIFY_OWNER_OTP")} onSubmit={handleOwnerVerifyOTPClick} />
            {ownerOtpError && <CardLabel style={{ color: ownerOtpError === t("VERIFIED") ? "green" : "red" }}>{ownerOtpError}</CardLabel>}
          </React.Fragment>
        )}
        {showTermsPopupOwner && (
          <CitizenConsent
            showTermsPopupOwner={showTermsPopupOwner}
            setShowTermsPopupOwner={setShowTermsPopupOwner}
            otpVerifiedTimestamp={otpVerifiedTimestamp}
          />
        )}
        <hr style={{ color: "#cccccc", backgroundColor: "#cccccc", height: "2px", marginTop: "20px", marginBottom: "20px" }} />
        <SubmitBar
          label={isSubmitting ? t("SUBMITTING...") : t("BPA_SEND_TO_CITIZEN_LABEL")}
          onSubmit={async () => {
            setIsSubmitting(true);
            try {
              await onSubmitCheck();
            } catch (error) {
              console.error("Submission error:", error);
              alert("Submission failed. Please try again.");
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={!agree || !isOTPVerified || !isOwnerOTPVerified || isSubmitting}
        />
      </Card>
    </React.Fragment>
  );
};

export default CheckPage;
