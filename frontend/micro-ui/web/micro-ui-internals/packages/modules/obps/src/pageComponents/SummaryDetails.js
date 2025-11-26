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
    ActionBar,
    Menu
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import Timeline from "../components/Timeline"
import { convertEpochToDateDMY, stringReplaceAll, getOrderDocuments, getDocsFromFileUrls, scrutinyDetailsData } from "../utils"
import DocumentsPreview from "../../../templates/ApplicationDetails/components/DocumentsPreview"
import Architectconcent from "../pages/citizen/NewBuildingPermit/Architectconcent"
import { OTPInput, CardLabelError, Toast } from "@mseva/digit-ui-react-components";
import FeeEstimation from "./FeeEstimation"

const SummaryDetails = ({ onSelect, formData, currentStepData, onGoBack }) => {
    const { t } = useTranslation();
    const history = useHistory();
    const match = useRouteMatch();
    const user = Digit.UserService.getUser();
    const state = Digit.ULBService.getStateId();
    const [showMobileInput, setShowMobileInput] = useState(false)
    const architectmobilenumber = user?.info?.mobileNumber;
    const [mobileNumber, setMobileNumber] = useState(() => architectmobilenumber || "");
    // const isArchitectDeclared = sessionStorage.getItem("ArchitectConsentdocFilestoreid");
    const [isArchitectDeclared, setIsArchitectDeclared] = useState(currentStepData?.Timestamp?.isArchitectDeclared || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiLoading, setApiLoading] = useState(false);
    const tenantId = localStorage.getItem("CITIZEN.CITY");
    const menuRef = useRef();
    const [displayMenu, setDisplayMenu] = useState(false);
    const [isFileLoading, setIsFileLoading] = useState(false)
    const [fileUrls, setFileUrls] = useState({});
    const [ownerFileUrls, setOwnerFileUrls] = useState({});
    const [isOwnerFileLoading, setIsOwnerFileLoading] = useState(false);
    const [datafromAPI, setDatafromAPI] = useState(null);
    const [isLoadingScrutiny, setIsLoadingScrutiny] = useState(false);
    const [errorFile, setError] = useState(null);
    const [development, setDevelopment] = useState(() => {
        return currentStepData?.createdResponse?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES || "0";
      });
    const [userSelected, setUser] = useState(null);
    const [showToast, setShowToast] = useState(null)
    
    
      const [otherCharges, setOtherCharges] = useState(() => {
        return currentStepData?.createdResponse?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES || "0";
      });
    
      const [lessAdjusment, setLessAdjusment] = useState(() => {
        return currentStepData?.createdResponse?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT || "0";
      });
    
      const [otherChargesDisc, setOtherChargesDisc] = useState(() => {
        return currentStepData?.createdResponse?.additionalDetails?.otherFeesDiscription || "";
      });
    
      const [uploadedFile, setUploadedFile] = useState();
      const [uploadedFileLess, setUploadedFileLess] = useState(() => {
        return currentStepData?.createdResponse?.additionalDetails?.lessAdjustmentFeeFiles || [];
      });
      const [file, setFile] = useState();
      // const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(tenantId.split(".")[0], "BPA", ["RiskTypeComputation"]);
      const applicationTenantId = currentStepData?.createdResponse?.tenantId
      const safeTenantId = applicationTenantId ? applicationTenantId.split(".")[0] : null
      const [labourCess, setLabourCess] = useState(() => currentStepData?.createdResponse?.additionalDetails?.selfCertificationCharges?.BPA_LABOUR_CESS || "");
      const [gaushalaFees, setGaushalaFees] = useState(() => currentStepData?.createdResponse?.additionalDetails?.selfCertificationCharges?.BPA_GAUSHALA_CHARGES_CESS || "");
      const [malbafees, setMalbafees] = useState(() => currentStepData?.createdResponse?.additionalDetails?.selfCertificationCharges?.BPA_MALBA_CHARGES || "");
      const [waterCharges, setWaterCharges] = useState(() => currentStepData?.createdResponse?.additionalDetails?.selfCertificationCharges?.BPA_WATER_CHARGES || "");
      const { isMdmsLoadingFees, data: mdmsDataFees } = Digit.Hooks.obps.useMDMS(state, "BPA", ["GaushalaFees", "MalbaCharges", "LabourCess"]);
      const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(safeTenantId, "BPA", ["RiskTypeComputation"], {
            enabled: !!safeTenantId,
        })
    const [adjustedAmounts, setAdjustedAmounts] = useState(() => currentStepData?.createdResponse?.additionalDetails?.adjustedAmounts || []);

    const closeMenu = () => {
        setDisplayMenu(false);
    };

    Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);
    let acceptFormat = ".pdf";

    useEffect(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth" // use "auto" for instant scroll
        });
    }, [])

    useEffect(() => {
          if (!userSelected) {
            return;
          }
          Digit.SessionStorage.set("citizen.userRequestObject", user);
          Digit.UserService.setUser(userSelected);
          setCitizenDetail(userSelected?.info, userSelected?.access_token, state);
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

    useEffect(() => {
      if (currentStepData?.createdResponse?.additionalDetails) {
        const selfCert = currentStepData?.createdResponse?.additionalDetails?.selfCertificationCharges || {};
        const otherDetails = currentStepData?.createdResponse?.additionalDetails || {};
    
        setLabourCess(selfCert.BPA_LABOUR_CESS || "0");
        setGaushalaFees(selfCert.BPA_GAUSHALA_CHARGES_CESS || "0");
        setMalbafees(selfCert.BPA_MALBA_CHARGES || "0");
        setWaterCharges(selfCert.BPA_WATER_CHARGES || "0");
    
        setDevelopment(selfCert.BPA_DEVELOPMENT_CHARGES || "0");
        setOtherCharges(selfCert.BPA_OTHER_CHARGES || "0");
        setLessAdjusment(selfCert.BPA_LESS_ADJUSMENT_PLOT || "0");
    
        setOtherChargesDisc(otherDetails.otherFeesDiscription || "");
        setUploadedFileLess(otherDetails.lessAdjustmentFeeFiles || []);
      }
      if(currentStepData?.Timestamp?.isArchitectDeclared){
        setIsArchitectDeclared(currentStepData?.Timestamp?.isArchitectDeclared);
      }
      if(currentStepData?.Timestamp?.TimeStamp){        
        setOTPVerifiedTimestamp(currentStepData?.Timestamp?.TimeStamp);
      }
    }, [currentStepData]);

    useEffect(()=>{
        if(!uploadedFile && uploadedFileLess?.length >0){
            console.log("ApplicationFeesAndSanctionFee 1", uploadedFileLess);
            
            setUploadedFile(uploadedFileLess[0]?.fileStoreId)
        }
    },[uploadedFileLess])

    useEffect(async () => {
        if (currentStepData?.createdResponse?.edcrNumber) {
          setIsLoadingScrutiny(true)
          const details = await scrutinyDetailsData(currentStepData?.createdResponse?.edcrNumber, state);
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
    }, [currentStepData?.createdResponse?.edcrNumber])

    useEffect(() => {
        let plotArea = datafromAPI?.planDetail?.planInformation?.plotArea || currentStepData?.createdResponse?.additionalDetails?.area;
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
    }, [mdmsData, isMdmsLoading, currentStepData?.createdResponse?.additionalDetails, mdmsDataFees, isMdmsLoadingFees]);

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

    const [showOTPInput, setShowOTPInput] = useState(() => {
        const stored = sessionStorage.getItem("showOTPInput");
        return stored === "true";
    });
    const [showTermsPopup, setShowTermsPopup] = useState(false);

    const [otp, setOTP] = useState("");

    const [isOTPVerified, setIsOTPVerified] = useState(() => {
        const stored = sessionStorage.getItem("isOTPVerified");
        const timestamp = sessionStorage.getItem("otpVerifiedTimestamp");
        return stored === "true" && timestamp;
    });

    const [otpError, setOTPError] = useState("");
    const [otpSuccess, setOTPSuccess] = useState("");

    const [otpVerifiedTimestamp, setOTPVerifiedTimestamp] = useState(currentStepData?.TimeStamp?.TimeStamp || "");

    const [agree, setAgree] = useState(() => {
        const stored = sessionStorage.getItem("professionalAgree");
        return stored === "true";
    });
    const [getOtpLoading, setGetOtpLoading] = useState(false);
    const [setOtpLoading, setSetOtpLoading] = useState(false);
    function routeTo(jumpTo) {
        window.open(jumpTo, "_blank");
    }

    let improvedDoc = [];
    currentStepData?.createdResponse?.documents?.map((appDoc) => {
        improvedDoc.push({ ...appDoc, module: "OBPS" });
    });
    currentStepData?.createdResponse?.nocDocuments?.map((nocDoc) => {
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

    function getBlockSubOccupancy(index) {
        let subOccupancyString = "";
        let returnValueArray = [];
        console.log("currentStepData",currentStepData);
        currentStepData?.ScrutinyDetails?.subOccupancy &&
            currentStepData?.ScrutinyDetails?.subOccupancy[`Block_${index + 1}`] &&
            currentStepData?.ScrutinyDetails?.subOccupancy[`Block_${index + 1}`].map((ob) => {
                returnValueArray.push(`${t(stringReplaceAll(ob?.i18nKey?.toUpperCase(), "-", "_"))}`);
            });
        return returnValueArray?.length ? returnValueArray.join(", ") : "NA";
    }

    function getFloorData(block) {

        const floors = []
        let totalBuiltUpArea = 0
        let totalFloorArea = 0
        let totalDeduction = 0

        block?.building?.floors?.forEach((ob) => {
            const builtUp = Number(ob.occupancies?.[0]?.builtUpArea) || 0
            const floor = Number(ob.occupancies?.[0]?.floorArea) || 0
            const deduction = Number(ob.occupancies?.[0]?.deduction) || 0

            totalBuiltUpArea += builtUp
            totalFloorArea += floor
            totalDeduction += deduction

            floors.push({
                Floor: t(`BPA_FLOOR_NAME_${ob.number}`),
                Level: ob.number,
                Occupancy: t(`${ob.occupancies?.[0]?.type}`),

                BuildupArea: Number(builtUp).toFixed(2),
                Deduction: Number(deduction).toFixed(2),
                FloorArea: Number(floor).toFixed(2),
            })
        })

        // Add Totals Row
        floors.push({
            Floor: t("BPA_TOTAL"),
            Level: "",
            Occupancy: "",
            BuildupArea: `${Number(totalBuiltUpArea).toFixed(2)} ${t("BPA_SQ_MTRS_LABEL")}`,
            Deduction: `${Number(totalDeduction).toFixed(2)} ${t("BPA_SQ_MTRS_LABEL")}`,
            FloorArea: `${Number(totalFloorArea).toFixed(2)} ${t("BPA_SQ_MTRS_LABEL")}`,
        })

        return floors
    }

    const tableHeader = [
        { name: "BPA_TABLE_COL_FLOOR", id: "Floor" },
        { name: "BPA_TABLE_COL_LEVEL", id: "Level" },
        { name: "BPA_TABLE_COL_OCCUPANCY", id: "Occupancy" },
        { name: "BPA_TABLE_COL_BUILDUPAREA", id: "BuildupArea" },
        { name: "BPA_TABLE_COL_DEDUCTION", id: "Deduction" },
        { name: "BPA_TABLE_COL_FLOORAREA", id: "FloorArea" },
        // { name: "BPA_TABLE_COL_CARPETAREA", id: "CarpetArea" },
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

    const documentsData = (getOrderDocuments(applicationDocs) || []).map((doc, index) => ({
        id: index,
        title: doc.title ? t(doc.title) : t("CS_NA"), // ✅ no extra BPA_
        fileUrl: doc.values?.[0]?.fileURL || null,
    }));

    // const ecbcDocumentsData = useMemo(() => {
    //     return (getDocsFromFileUrls(fileUrls) || []).map((doc, index) => ({
    //         id: index,
    //         title: doc.title ? t(doc.title) : t("CS_NA"), // ✅ no extra BPA_
    //         fileUrl: doc.fileURL || null, // adjusted since `doc` already has fileURL
    //     }));
    // }, [fileUrls, t]);

    // useEffect(() => {
    //     console.log("ecbcDocumentsData", ecbcDocumentsData, fileUrls)
    // },[ecbcDocumentsData])
      const ecbcDocumentsData = useMemo(() => {
      const docs = getDocsFromFileUrls(fileUrls) || [];
          
    
      return docs.map((doc, index) => ({
        id: index,
        title: doc.title ? t(doc.title) : t("CS_NA"),
        fileUrl: doc.fileURL || null,
      }));
    }, [fileUrls, t]);


    const handleTermsLinkClick = (e) => {
        setShowTermsPopup(true);
    };

    const setdeclarationhandler = (e) => {
        // e.preventDefault(); // Prevent form submission
        
        if (!otpVerifiedTimestamp || otpVerifiedTimestamp === "") {
            console.log("setdeclarationhandler", e, isOTPVerified);
            setShowTermsPopup(true);
            setAgree(true);
        }else{
            setAgree(true);
        }
    };

    const checkLabels = () => {
        return (
            <div>
                {t("I_AGREE_TO_BELOW_UNDERTAKING")}
                <br />
                {/* {!isArchitectDeclared && <LinkButton style={{ marginLeft: "-55px", background: "#fff" }} label={t("DECLARATION_UNDER_SELF_CERTIFICATION_SCHEME")} onClick={handleTermsLinkClick} />} */}
                {isArchitectDeclared && <div className="view-declaration-link" onClick={handleTermsLinkClick} >{t("VIEW_DECLARATION")} </div>}
            </div>
        );
    };

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


    const documentsColumns = [
        {
            Header: t("BPA_DOCUMENT_NAME"),
            accessor: "title",
            Cell: ({ value }) => value || t("CS_NA"),
        },
        {
            Header: t(""),
            accessor: "fileUrl",
            Cell: ({ value }) =>
                value ? (
                    <LinkButton className="view-link-button"
                        label={t("View")}
                        onClick={() => routeTo(value)}
                    />
                ) : (
                    t("CS_NA")
                ),
        },
    ];

    const handleMobileNumberChange = (e) => {
        setMobileNumber(e.target.value);
    };

    const handleGetOTPClick = async (e) => {
        e.preventDefault(); // Prevent form submission
        try {
            setGetOtpLoading(true);
            const response = await Digit.UserService.sendOtp({
                otp: {
                    mobileNumber: mobileNumber,
                    tenantId: user?.info?.tenantId,
                    userType: user?.info?.type,
                    type: "login",
                },
            });

            if (response.isSuccessful) {
                setGetOtpLoading(false);
                setShowOTPInput(true);
            } else {
                console.error("Error sending OTP Response is false:", response.error);
                alert("Something Went Wrong");
                setGetOtpLoading(false);
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Something went wrong");
            setGetOtpLoading(false);
        }
    };

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
            setSetOtpLoading(true)
            // const response = await Digit.UserService.authenticate(requestData);
            const { ResponseInfo, UserRequest: info, ...tokens } = await Digit.UserService.authenticate(requestData);
            if (ResponseInfo.status === "Access Token generated successfully") {
                setIsOTPVerified(true);
                setOTPSuccess(t("VERIFIED"));
                setOTPError(false);
                const currentTimestamp = new Date();
                setOTPVerifiedTimestamp(currentTimestamp);
                sessionStorage.setItem("otpVerifiedTimestamp", currentTimestamp.toISOString());
                setSetOtpLoading(false);
                setUser({ info, ...tokens });
            } else {
                setIsOTPVerified(false);
                setOTPError(t("WRONG OTP"));
                setSetOtpLoading(false)
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert("OTP Verification Error ");
            setIsOTPVerified(false);
            setOTPError(t("OTP Verification Error"));
            setSetOtpLoading(false);
        }
    };

    const isValidMobileNumber = mobileNumber.length === 10 && /^[0-9]+$/.test(mobileNumber);

    const workflowDetails = Digit.Hooks.useWorkflowDetails({
        tenantId: tenantId,
        id: currentStepData?.createdResponse?.applicationNo,
        moduleCode: currentStepData?.createdResponse?.businessService,
    });

    const userRoles = user?.info?.roles?.map((e) => e.code);
    let actions =
        workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
            return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
        }) ||
        workflowDetails?.data?.nextActions?.filter((e) => {
            return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
        });

    async function onSubmitCheck(action) {
        // if (!isArchitectDeclared) {
        //     alert(t("Please_declare_and_upload_architect_consent"));
        //     return;
        // }
        if (!action) {
            alert(t("Something_went_wrong"));
            return;
        }

        const userInfo = Digit.UserService.getUser()
        const accountId = userInfo?.info?.uuid
        const workflowAction = action;
        let consentDocument = currentStepData?.createdResponse?.documents?.find((item) => item.documentType === "ARCHITECT.UNDERTAKING")
        if (consentDocument) {
            consentDocument.fileStoreId = isArchitectDeclared
            consentDocument.documentUid = isArchitectDeclared;
        } else {
            consentDocument = {
                documentType: "ARCHITECT.UNDERTAKING",
                fileStoreId: isArchitectDeclared,
                documentUid: isArchitectDeclared,
                additionalDetails: null,
                auditDetails: null
            }
        }
        const documents = currentStepData?.createdResponse?.documents?.filter((item) => item.documentType !== "ARCHITECT.UNDERTAKING")
        documents.push(consentDocument);

        try {
            setApiLoading(true);
            const result = await Digit.OBPSService.update({
                BPA: {
                    ...currentStepData?.createdResponse,
                    additionalDetails: {
                        ...currentStepData?.createdResponse?.additionalDetails,
                        isArchitectDeclared,
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
                    },
                    documents,
                    workflow: {
                        action: workflowAction,
                        assignes: workflowAction === "RESUBMIT" ? [] : [accountId]
                    }
                }
            }, tenantId)
            if (result?.ResponseInfo?.status === "successful") {
                setApiLoading(false);
                history.push(`/digit-ui/citizen/obps/self-certification/response/${currentStepData?.createdResponse?.applicationNo}`);
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

    async function onActionSelect(action) {
        // onSubmitCheck(action);
        // setShowModal(true);
        // setSelectedAction(action);
        console.log("Selected Action", action?.action, otpVerifiedTimestamp, isArchitectDeclared, agree);
        if(action?.action !== "SAVE_AS_DRAFT" && (!agree || otpVerifiedTimestamp === "" || isArchitectDeclared === "")){
            if(!agree){
                setShowToast({ key: "true", error: true, message: t("Professinal Undertaking is not Agreed") })
                return
            }
            if(otpVerifiedTimestamp === ""){
                setShowToast({ key: "true", error: true, message: t("User OTP Not Verified") })
                return
            }if(isArchitectDeclared === ""){
                setShowToast({ key: "true", error: true, message: t("Professinal Undertaking is not Uploaded") })
                return
            }
        }
        setIsSubmitting(true);
        try {
            await onSubmitCheck(action?.action);
        } catch (error) {
            console.error("Submission error:", error);
            alert("Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        const fetchFileUrls = async () => {
          if (!currentStepData?.createdResponse?.additionalDetails) return;
    
          const fileKeys = ["ecbcCertificateFile", "greenuploadedFile", "uploadedFile", "lessAdjustmentFeeFiles"];
    
          // Collect valid fileStoreIds
          const validFileStoreIds = fileKeys
            .map((key) => {
              if (key === "lessAdjustmentFeeFiles") return currentStepData?.createdResponse?.additionalDetails?.[key]?.[0]?.fileStoreId || null;
              return currentStepData?.createdResponse?.additionalDetails?.[key]
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
                const fileId = currentStepData?.createdResponse?.additionalDetails?.[key];
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
      }, [currentStepData?.createdResponse?.additionalDetails]);

      useEffect(() => {
      const fetchOwnerFileUrls = async () => {
        const owners = currentStepData?.createdResponse?.landInfo?.owners || [];
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
    }, [currentStepData?.createdResponse?.landInfo?.owners]);

    useEffect(() => {
        console.log("ECBCDocs", fileUrls);
    }, [fileUrls])

    const closeToast = () => {
        setShowToast(null)
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

  const [y1, m1, d1] = currentStepData?.createdResponse?.additionalDetails?.nocObject?.approvedOn?.split("-") || [];
  const nocApprovedDate = `${d1}/${m1}/${y1}`;


    if (apiLoading || isFileLoading) return (<Loader />);

    return (
        <React.Fragment>
            <Header>{t("BPA_STEPPER_SUMMARY_HEADER")}</Header>
            <div className="summary-content-wrapper">
                <Card className="summary-main-card"   >
                    <StatusTable >
                        <Row className="border-none" label={t(`BPA_APPLICATION_NUMBER_LABEL`)} text={currentStepData?.createdResponse?.applicationNo} />
                    </StatusTable>
                </Card>

                <Card className="summary-main-card"  >
                    <CardSubHeader className="summary-subheader"  >{t("BPA_APPLICANT_DETAILS_HEADER")}</CardSubHeader>
                     <hr className="summary-hr-divider"   />
                    <StatusTable>
                        {/* <LinkButton style={{ float: "right", display: "inline", marginTop: "-80px", background: "#fff" }}
                            label={<EditIcon color="white" style={{ color: "white" }} />}

                            onClick={() => { }}
                        /> */}
                        {currentStepData?.createdResponse?.landInfo?.owners &&
                            currentStepData?.createdResponse?.landInfo?.owners?.length > 0 &&
                            currentStepData?.createdResponse?.landInfo?.owners?.map((ob, index) => (
                                <div className={currentStepData?.createdResponse?.landInfo?.owners.length > 1 ? "owner-details-card" : ""}
                                    key={index}
                                   
                                >
                                    {currentStepData?.createdResponse?.landInfo?.owners.length > 1 && (
                                        <CardSubHeader className="summary-subheader"  >
                                            {t("COMMON_OWNER")} {index + 1}
                                        </CardSubHeader>
                                    )}
                                    <StatusTable >
                                        <Row
                                            className="border-none"
                                            // textStyle={index == 0 && ownersData.length == 1 ? { paddingLeft: "12px" } : {}}
                                            label={t(`CORE_COMMON_NAME`)}
                                            text={ob?.name || "N/A"}

                                        />
                                        <Row
                                            className="border-none"
                                            label={t(`BPA_APPLICANT_GENDER_LABEL`)}
                                            text={ob?.gender?.i18nKey ? t(ob.gender.i18nKey) : ob?.gender || "N/A"}

                                        />
                                        <Row className="border-none" label={t(`CORE_COMMON_MOBILE_NUMBER`)} text={ob?.mobileNumber || "N/A"} />
                                        <Row className="border-none" label={t(`CORE_COMMON_EMAIL_ID`)} text={ob?.emailId || t("CS_NA")} />
                                        <Row className="border-none" label={t(`BPA_APPLICANT_ADDRESS_LABEL`)} text={ob?.permanentAddress || t("CS_NA")} />
                                        <Row className="border-none" label={t(`BPA_IS_PRIMARY_OWNER_LABEL`)} text={`${ob?.isPrimaryOwner === true ? "Yes" : "No"}`} />
                                    </StatusTable>
                                </div>
                            ))}
                    </StatusTable>
                    <CardSubHeader className="summary-subheader"  >{t("BPA_OWNER_DETAILS_LABEL")}</CardSubHeader>
                     <hr className="summary-hr-divider"   />
                    <StatusTable>
                        {(pdfLoading || isOwnerFileLoading) ? <Loader /> : <Table
                            className="customTable table-border-style"
                            t={t}
                            data={ownerDocumentsData}
                            columns={documentsColumns}
                            getCellProps={() => ({ style: {} })}
                            disableSort={false}
                            autoSort={true}
                            manualPagination={false}
                            isPaginationRequired={false}
                        />}
                    </StatusTable>
                </Card>

                <Card className="summary-main-card"   >
                    <CardSubHeader className="summary-subheader"  >
                        {t(`BPA_BASIC_DETAILS_TITLE`)}
                    </CardSubHeader>
                     <hr className="summary-hr-divider"   />
                    <StatusTable >
                        <Row className="border-none" label={t(`BPA_BASIC_DETAILS_APP_DATE_LABEL`)} text={convertEpochToDateDMY(Number(currentStepData?.BasicDetails?.applicationDate))} />
                        <Row className="border-none" label={t(`BPA_BASIC_DETAILS_APPLICATION_TYPE_LABEL`)} text={t(`WF_BPA_${currentStepData?.BasicDetails?.applicationType}`)} />
                        <Row className="border-none" label={t(`BPA_BASIC_DETAILS_SERVICE_TYPE_LABEL`)} text={t(currentStepData?.BasicDetails?.serviceType)} />
                        <Row className="border-none" label={t(`BPA_BASIC_DETAILS_OCCUPANCY_LABEL`)} text={currentStepData?.BasicDetails?.occupancyType} />
                        <Row className="border-none" label={t(`BPA_BASIC_DETAILS_RISK_TYPE_LABEL`)} text={t(`WF_BPA_${currentStepData?.BasicDetails?.riskType}`)} />
                    </StatusTable>
                </Card>

                <Card className="summary-main-card"   >
                    <CardSubHeader className="summary-subheader"  >{t("BPA_PLOT_AND_SITE_DETAILS_TITLE")}</CardSubHeader>
                     <hr className="summary-hr-divider"   />
                    <StatusTable >
                        

                        {/* <LinkButton style={{ float: "right", display: "inline", marginTop: "-80px", background: "#fff" }}
                            label={<EditIcon color="white" style={{ color: "white" }} />}

                            onClick={() => { }}
                        /> */}

                        <Row
                            className="border-none"
                            label={t(`BPA_BOUNDARY_PLOT_AREA_LABEL`)}
                            text={
                                currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInformation?.plotArea
                                    ? `${currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInformation?.plotArea
                                    } ${t(`BPA_SQ_MTRS_LABEL`)}`
                                    : t("CS_NA")
                            }
                            
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_PLOT_NUMBER_LABEL`)}
                            text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.PLOT_NO || t("CS_NA")}
                            
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_KHATHA_NUMBER_LABEL`)}
                            text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.KHATA_NO || t("CS_NA")}
                            
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_BOUNDARY_LAND_REG_DETAIL_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.registrationDetails || t("CS_NA")}
                            
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_BOUNDARY_WALL_LENGTH_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.boundaryWallLength || t("CS_NA")}
                            
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_KHASRA_NUMBER_LABEL`)}
                            text={
                                currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.KHASRA_NO ||
                                currentStepData?.createdResponse?.additionalDetails?.khasraNumber ||
                                t("CS_NA")
                            }
                            
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_WARD_NUMBER_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.wardnumber || t("CS_NA")}
                            
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_WARD_NUMBER_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.zonenumber || t("CS_NA")}
                            
                        />                        
                        <Row
                            className="border-none"
                            label={t(`BPA_KHASRA_NUMBER_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.khasraNumber || t("CS_NA")}
                            
                        />                        
                        <Row
                            className="border-none"
                            label={t(`BPA_ARCHITECT_ID`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.architectid || t("CS_NA")}
                            
                        />                        
                        <Row
                            className="border-none"
                            label={t(`BPA_NUMBER_OF_BATHS`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.bathnumber || t("CS_NA")}
                            
                        />                        
                        <Row
                            className="border-none"
                            label={t(`BPA_NUMBER_OF_KITCHENS`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.kitchenNumber || t("CS_NA")}
                            
                        />                        
                        <Row
                            className="border-none"
                            label={t(`BPA_APPROX_INHABITANTS_FOR_ACCOMODATION`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.approxinhabitants || t("CS_NA")}
                            
                        />                        
                        <Row
                            className="border-none"
                            label={t(`BPA_DISTANCE_FROM_SEWER`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.distancefromsewer || t("CS_NA")}
                            
                        />                        
                        <Row
                            className="border-none"
                            label={t(`BPA_SOURCE_OF_WATER`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.sourceofwater || t("CS_NA")}
                            
                        />                        
                        <Row
                            className="border-none"
                            label={t(`BPA_NUMBER_OF_WATER_CLOSETS`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.watercloset || t("CS_NA")}
                            
                        />                        
                        <Row
                            className="border-none"
                            label={t(`BPA_MATERIAL_TO-BE_USED_IN_WALLS`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.materialused || t("CS_NA")}
                            
                        />                        
                        <Row
                            className="border-none"
                            label={t(`BPA_MATERIAL_TO-BE_USED_IN_FLOOR`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.materialusedinfloor || t("CS_NA")}
                            
                        />                        
                        <Row
                            className="border-none"
                            label={t(`BPA_MATERIAL_TO-BE_USED_IN_ROOFS`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.materialusedinroofs || t("CS_NA")}
                            
                        />                        
                        <Row
                            className="border-none"
                            label={t(`BPA_ESTIMATED_COST_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.estimatedCost || t("CS_NA")}
                            
                        />                        
                    {/* </StatusTable>
                </Card>

                <Card   >
                    <CardSubHeader  >{t("BPA_NEW_TRADE_DETAILS_HEADER_DETAILS")}</CardSubHeader>
                     <hr className="summary-hr-divider"   />
                    <StatusTable >                                                 */}
                        {/* <LinkButton style={{ float: "right", display: "inline", marginTop: "-80px", background: "#fff" }}
                            label={<EditIcon color="white" style={{ color: "white" }} />}

                            onClick={() => { }}
                        /> */}
                        {currentStepData?.createdResponse?.landInfo?.address?.pincode && <Row className="border-none" label={t(`BPA_DETAILS_PIN_LABEL`)} text={currentStepData?.createdResponse?.landInfo?.address?.pincode || t("CS_NA")} />}
                        <Row className="border-none" label={t(`BPA_CITY_LABEL`)} text={currentStepData?.LocationDetails?.selectedCity?.name || t("CS_NA")} />
                        <Row
                            className="border-none"
                            label={t("BPA_DISTRICT")}
                            text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.DISTRICT || t("CS_NA")}
                            
                        /> 
                        <Row className="border-none" label={t(`BPA_LOC_MOHALLA_LABEL`)} text={currentStepData?.createdResponse?.landInfo?.address?.locality?.name || t("CS_NA")} />
                        <Row className="border-none" label={t(`BPA_LAT`)} text={currentStepData?.createdResponse?.landInfo?.address?.geoLocation?.latitude ? currentStepData?.createdResponse?.landInfo?.address?.geoLocation?.latitude?.toFixed(6)?.toString() : t("CS_NA")} />
                        <Row className="border-none" label={t(`BPA_LONG`)} text={currentStepData?.createdResponse?.landInfo?.address?.geoLocation?.longitude ? currentStepData?.createdResponse?.landInfo?.address?.geoLocation?.longitude?.toFixed(6)?.toString() : t("CS_NA")} />
                        {/* <Row className="border-none" label={t(`BPA_DETAILS_SRT_NAME_LABEL`)} text={address?.street || t("CS_NA")} /> */}
                        {/* <Row className="border-none" label={t(`ES_NEW_APPLICATION_LOCATION_LANDMARK`)} text={address?.landmark || t("CS_NA")} /> */}
                    </StatusTable>
                </Card>

                <Card className="summary-main-card">
                    <CardSubHeader className="summary-subheader"  >{t("BPA_STEPPER_SCRUTINY_DETAILS_HEADER")}</CardSubHeader>
                     <hr className="summary-hr-divider"   />
                    <CardSubHeader className="summary-subheader"  >{t("BPA_EDCR_DETAILS")}</CardSubHeader>

                    <div className="summary-page-table-container" >
                        <table className="summary-page-table">
                            <tbody>
                                {/* EDCR Number */}
                                <tr className="summary-page-table-row">
                                    <td className="summary-page-table-data" >{t("BPA_EDCR_NO_LABEL")}</td>
                                    <td className="summary-page-tabledata" >
                                        {currentStepData?.BasicDetails?.scrutinyNumber?.edcrNumber || currentStepData?.BasicDetails?.edcrDetails?.edcrNumber || t("CS_NA")}
                                    </td>
                                </tr>

                                {/* Uploaded Plan */}
                                <tr>
                                    <td className="summary-page-uploaded-tabledata" >{t("BPA_UPLOADED_PLAN_DIAGRAM")}</td>
                                    <td className="summary-page-uploaded-table-data">
                                        {currentStepData?.BasicDetails?.edcrDetails?.updatedDxfFile ? (
                                            <LinkButton
                                                label={t("View")}
                                                onClick={() => routeTo(currentStepData?.BasicDetails?.edcrDetails?.updatedDxfFile)}
                                            />
                                        ) : (
                                            t("CS_NA")
                                        )}
                                    </td>
                                </tr>

                                {/* Scrutiny Report */}
                                <tr>
                                    <td className="summary-page-uploaded-tabledata" >{t("BPA_SCRUNTINY_REPORT_OUTPUT")}</td>
                                    <td className="summary-page-uploaded-table-data" >
                                        {currentStepData?.BasicDetails?.edcrDetails?.planReport ? (
                                            <LinkButton
                                                label={t("View")}
                                                onClick={() => routeTo(currentStepData?.BasicDetails?.edcrDetails?.planReport)}
                                            />
                                        ) : (
                                            t("CS_NA")
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/*  <hr className="summary-hr-divider"   /> */}
                {/* <CardSubHeader   style={{ fontSize: "20px" }}>{t("BPA_BUILDING_EXTRACT_HEADER")}</CardSubHeader> */}

                <Card className="summary-main-card"  >
                    <CardSubHeader className="summary-subheader"  >{t("BPA_PLAN_INFORMATION_PROPERTIES")}</CardSubHeader>
                    <StatusTable >
                        <Row
                            className="border-none"
                            label={t("BPA_PLOT_AREA_M2")}
                            // text=`{${planInfoProps?.planDetail?.plotArea?.area ? t("BPA_SQ_MTRS_LABEL") : ""}`
                            text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.plot?.area ? `${currentStepData?.BasicDetails?.edcrDetails?.planDetail?.plot?.area} ${t(`BPA_SQ_MTRS_LABEL`)}` : t("CS_NA")}
                            
                        />
                        <Row
                            className="border-none"
                            label={t("BPA_KHATUNI_NUMBER")}
                            text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.KHATUNI_NO || t("CS_NA")}
                            
                        />                                   
                        <Row
                            className="border-none"
                            label={t("BPA_AREA_TYPE")}
                            text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.AREA_TYPE || t("CS_NA")}
                            
                        />
                        <Row
                            className="border-none"
                            label={t("BPA_LAND_USE_ZONE")}
                            text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.LAND_USE_ZONE || t("CS_NA")}
                            
                        />
                        <Row
                            className="border-none"
                            label={t("BPA_NUMBER_OF_FLOORS")}
                            text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.NUMBER_OF_FLOORS || t("CS_NA")}
                            
                        />
                        <Row
                            className="border-none"
                            label={t("BPA_ULB_TYPE")}
                            text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.ULB_TYPE || t("CS_NA")}
                            
                        />
                        <Row className="border-none" label={t("BPA_MAUZA")} text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.MAUZA || t("CS_NA")} />
                        </StatusTable>
                    <CardSubHeader className="summary-subheader"  >{t("BPA_PLOT_DIMENSIONS")}</CardSubHeader>
                    <StatusTable >
                        <Row className="border-none" label={t("BPA_AVG_PLOT_DEPTH")} text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.AVG_PLOT_DEPTH} />
                        <Row className="border-none" label={t("BPA_AVG_PLOT_WIDTH")} text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.AVG_PLOT_WIDTH} />
                    </StatusTable>
                    <CardSubHeader className="summary-subheader"  >{t("BPA_ROAD_DETAILS")}</CardSubHeader>
                    <StatusTable >
                        <Row className="border-none" label={t("BPA_ROAD_TYPE")} text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.ROAD_TYPE || t("CS_NA")} />
                        <Row className="border-none" label={t("BPA_ROAD_WIDTH")} text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.ROAD_WIDTH} />
                    </StatusTable>
                    <CardSubHeader className="summary-subheader"  >{t("BPA_SUSTAINABILITY_FEATURES")}</CardSubHeader>
                    <StatusTable >
                        <Row
                            className="border-none"
                            label={t("BPA_GREEN_BUILDINGS_SUSTAINABILITY")}
                            text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.PROVISION_FOR_GREEN_BUILDINGS_AND_SUSTAINABILITY || t("CS_NA")}
                            
                        />
                    </StatusTable>
                     <hr className="summary-hr-divider"   />
                    <CardSubHeader className="summary-subheader"  >{t("BPA_OCC_SUBOCC_HEADER")}</CardSubHeader>
                    {currentStepData?.BasicDetails?.edcrDetails?.planDetail?.blocks?.map((block, index) => (
                        <div className={currentStepData?.createdResponse?.landInfo?.owners.length > 1 ? "owner-details-card" : ""}
                            key={index}
                          
                        >
                            <CardSubHeader className="summary-subheader"  >
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
                            <div className="summary-page-scroll">
                                <Table
                                    className="customTable table-fixed-first-column table-border-style"
                                    t={t}
                                    disableSort={true}
                                    autoSort={false}
                                    manualPagination={false}
                                    isPaginationRequired={false}
                                    initSortId="S N "
                                    data={getFloorData(block)}
                                    columns={tableColumns}
                                    showFooter={true}
                                    getCellProps={(cellInfo) => {
                                        return {
                                            style: {},
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    ))}

                     <hr className="summary-hr-divider"   />
                    <CardSubHeader className="summary-subheader"  >{t("BPA_APP_DETAILS_DEMOLITION_DETAILS_LABEL")}</CardSubHeader>
                    <StatusTable >
                        <Row
                            className="border-none"
                            label={t("BPA_APPLICATION_DEMOLITION_AREA_LABEL")}
                            text={
                                currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInformation?.demolitionArea
                                    ? `${currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInformation?.demolitionArea} ${t("BPA_SQ_MTRS_LABEL")}`
                                    : t("CS_NA")
                            }
                            
                        ></Row>
                    </StatusTable>                    
                </Card>
                

                <Card className="summary-main-card"   >
                    <CardSubHeader className="summary-subheader"  >{t("BPA_ADDITIONAL_BUILDING_DETAILS")}</CardSubHeader>
                     <hr className="summary-hr-divider"   />
                    <StatusTable>                                                
                        <Row
                            className="border-none"
                            label={t(`BPA_APPROVED_COLONY_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.approvedColony || t("CS_NA")}
                            
                        />
                        {currentStepData?.createdResponse?.additionalDetails?.approvedColony === "YES" &&
                        <Row
                            className="border-none"
                            label={t(`BPA_APPROVED_COLONY_NAME`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.nameofApprovedcolony || t("CS_NA")}                            
                        />
                        }
                        {currentStepData?.createdResponse?.additionalDetails?.approvedColony === "NO" &&
                        <Row
                            className="border-none"
                            label={t(`BPA_NOC_NUMBER`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.NocNumber || t("CS_NA")}                            
                        />
                        }
                        {currentStepData?.createdResponse?.additionalDetails?.approvedColony === "NO" &&
                        <Row
                            className="border-none"
                            label={t(`BPA_NOC_APPLICANT_NAME`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.nocObject?.applicantOwnerOrFirmName || t("CS_NA")}                            
                        />
                        }
                        {currentStepData?.createdResponse?.additionalDetails?.approvedColony === "NO" &&
                        <Row
                            className="border-none"
                            label={t(`BPA_NOC_ULB_NAME`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.nocObject?.ulbName || t("CS_NA")}                            
                        />
                        }
                        {currentStepData?.createdResponse?.additionalDetails?.approvedColony === "NO" &&
                        <Row
                            className="border-none"
                            label={t(`BPA_NOC_ULB_TYPE`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.nocObject?.ulbType || t("CS_NA")}                            
                        />
                        }
                        {currentStepData?.createdResponse?.additionalDetails?.approvedColony === "NO" &&
                        <Row
                            className="border-none"
                            label={t(`BPA_NOC_APPROVED_ON`)}
                            text={nocApprovedDate || t("CS_NA")}                            
                        />
                        }                        
                        <Row
                            className="border-none"
                            label={t(`BPA_ULB_TYPE_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.Ulblisttype || t("CS_NA")}
                            
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_ULB_NAME_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.UlbName || t("CS_NA")}
                            
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_MASTER_PLAN`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.masterPlan || t("CS_NA")}
                            
                        />
                        {currentStepData?.createdResponse?.additionalDetails?.masterPlan==="YES"&&<Row
                            className="border-none"
                            label={t(`BPA_USE`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.use || t("CS_NA")}
                            
                        />}
                        {/* <Row
                            className="border-none"
                            label={t(`BPA_DISTRICT_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.District || t("CS_NA")}
                            
                        /> */}
                        {/* <Row
                            className="border-none"
                            label={t(`BPA_BUILDING_STATUS_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.buildingStatus || t("CS_NA")}
                            
                        /> */}
                        <Row
                            className="border-none"
                            label={t(`BPA_CORE_AREA_LABEL`)}
                            text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.coreArea || t("CS_NA")}
                            
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_PROPOSED_SITE_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.proposedSite || t("CS_NA")}
                            
                        />
                        {currentStepData?.createdResponse?.additionalDetails?.schemes === "SCHEME" && (
                            <React.Fragment>
                                <Row
                                    className="border-none"
                                    label={t(`BPA_SCHEME_TYPE_LABEL`)}
                                    text={currentStepData?.createdResponse?.additionalDetails?.schemesselection || t("CS_NA")}
                                    
                                />
                                <Row
                                    className="border-none"
                                    label={t(`BPA_SCHEME_NAME_LABEL`)}
                                    text={currentStepData?.createdResponse?.additionalDetails?.schemeName || t("CS_NA")}
                                    
                                />
                                <Row
                                    className="border-none"
                                    label={t(`BPA_TRANFERRED_SCHEME_LABEL`)}
                                    text={currentStepData?.createdResponse?.additionalDetails?.transferredscheme || t("CS_NA")}
                                    
                                />
                            </React.Fragment>
                        )}
                        <Row
                            className="border-none"
                            label={t(`BPA_PURCHASED_FAR_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.purchasedFAR ? "YES" : "NO" || t("CS_NA")}
                            
                        />
                        {currentStepData?.createdResponse?.additionalDetails?.purchasedFAR && <Row
                            className="border-none"
                            label={t(`BPA_PROVIDED_FAR`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.providedFAR || t("CS_NA")}
                            
                        />}
                        <Row
                            className="border-none"
                            label={t(`BPA_MASTER_PLAN_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.masterPlan || t("CS_NA")}
                            
                        />
                        {currentStepData?.createdResponse?.additionalDetails?.masterPlan === "YES" && <Row
                            className="border-none"
                            label={t(`BPA_USE`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.use || t("CS_NA")}
                            
                        />}
                        <Row
                            className="border-none"
                            label={t(`BPA_GREEN_BUILDING_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.greenbuilding || t("CS_NA")}
                            
                        />
                        {currentStepData?.createdResponse?.additionalDetails?.greenbuilding==="YES"&&<Row
                            className="border-none"
                            label={t(`BPA_SELECTED_RATINGS`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.rating || t("CS_NA")}
                            
                        />}
                    </StatusTable>

                    <CardSubHeader className="summary-subheader"  >{t("BPA_APP_DETAILS_ECBC_DETAILS_LABEL")}</CardSubHeader>
                    <StatusTable >
                        <Row className="border-none" label={t(`ECBC - Proposed Connected Electrical Load is above 100 Kw`)} text={currentStepData?.createdResponse?.additionalDetails?.ecbcElectricalLoad} />
                        <Row className="border-none" label={t(`ECBC - Proposed Demand of Electrical Load is above 120 Kw`)} text={currentStepData?.createdResponse?.additionalDetails?.ecbcDemandLoad} />
                        <Row className="border-none" label={t(`ECBC - Proposed Air Conditioned Area above 500 sq.mt`)} text={currentStepData?.createdResponse?.additionalDetails?.ecbcAirConditioned} />
                    </StatusTable>
                </Card>

                {ecbcDocumentsData?.length > 0 && <Card className="summary-main-card"   >
                    <CardSubHeader className="summary-subheader"  >{t("BPA_ECBC_DETAILS_LABEL")}</CardSubHeader>
                     <hr className="summary-hr-divider"   />
                    <StatusTable>                        
                        {pdfLoading ? <Loader /> : <Table
                            className="customTable table-border-style"
                            t={t}
                            data={ecbcDocumentsData}
                            columns={documentsColumns}
                            getCellProps={() => ({ style: {} })}
                            disableSort={false}
                            autoSort={true}
                            manualPagination={false}
                            isPaginationRequired={false}
                        />}
                    </StatusTable>
                </Card>}

                <Card className="summary-main-card"   >
                    <CardSubHeader className="summary-subheader"  >{t("BPA_DOCUMENT_DETAILS_LABEL")}</CardSubHeader>
                     <hr className="summary-hr-divider"   />
                    <StatusTable>                        
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
                    </StatusTable>
                </Card>

                <Card className="summary-main-card">
                    {(isMdmsLoading || isLoadingScrutiny || isMdmsLoadingFees) ? <Loader/> : <FeeEstimation                    
                        currentStepData={currentStepData}                        
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
                    />}
                </Card>


                <Card className="summary-main-card"   >
                    {(currentStepData?.createdResponse?.status === "INITIATED" || currentStepData?.createdResponse?.status === "BLOCKED") && <CardSubHeader className="summary-subheader"  >{t("BPA_Profesion_Consent_Form")}</CardSubHeader>}
                    {/* {(currentStepData?.createdResponse?.status === "INITIATED" || currentStepData?.createdResponse?.status === "BLOCKED") && (
                        <div>
                            <br></br>
                            {showMobileInput && (
                                <React.Fragment>
                                    <br></br>
                                    <CardLabel>{t("BPA_ARCHITECT_MOBILE_NUMBER")}</CardLabel>
                                    <TextInput
                                        t={t}
                                        type="tel"
                                        isMandatory={true}
                                        optionKey="i18nKey"
                                        disable={true}
                                        name="mobileNumber"
                                        value={mobileNumber}
                                        onChange={handleMobileNumberChange}
                                        {...{ required: true, pattern: "[0-9]{10}", type: "tel", title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") }}
                                    />
                                    {getOtpLoading ? <Loader /> : <LinkButton style={{ display: "inline", background: "#fff" }} label={t("BPA_GET_OTP")} onClick={handleGetOTPClick} disabled={!isValidMobileNumber} />}
                                </React.Fragment>
                            )}
                            <br></br>
                            {showOTPInput && (
                                <React.Fragment>
                                    <br></br>
                                    <CardLabel>{t("BPA_OTP")}</CardLabel>
                                    <OTPInput length={6} onChange={(value) => setOTP(value)} value={otp} />
                                    {setOtpLoading ? <Loader /> : <SubmitBar label={t("VERIFY_OTP")} onSubmit={handleVerifyOTPClick} />}
                                    {otpError && <CardLabel style={{ color: "red" }}>{t(otpError)}</CardLabel>}
                                    {otpSuccess && <CardLabel style={{ color: "green" }}>{t(otpSuccess)}</CardLabel>}
                                </React.Fragment>
                            )}
                        </div>
                    )} */}
                    <br></br>
                    <br></br>
                    <div>
                        {/* <CHANGE> Added checked prop to make checkbox active state visible */}
                        <CheckBox label={checkLabels()} onChange={setdeclarationhandler} className="summary-page-checkbox" checked={agree} />
                        {showTermsPopup && (
                            <Architectconcent showTermsPopup={showTermsPopup} setShowTermsPopup={setShowTermsPopup} otpVerifiedTimestamp={otpVerifiedTimestamp} currentStepData={currentStepData} formData={formData} onSelect={onSelect}/>
                        )}
                    </div>
                     <hr className="summary-hr-divider"   />

                </Card>
                <ActionBar>
                    <SubmitBar className="back-submit-button"
                        label="Back"
                      
                        onSubmit={onGoBack}
                    />
                    {/* <SubmitBar
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
                        disabled={!agree || !isOTPVerified || isSubmitting}
                    /> */}
                    {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
                        <Menu localeKeyPrefix={`WF_EMPLOYEE_${"NDC"}`} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
                    ) : null}
                    <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} disabled={isSubmitting} />
                </ActionBar>
            </div>
            {showToast && (
                <Toast
                error={showToast?.error}
                warning={showToast?.warning}
                label={t(showToast?.message)}
                isDleteBtn={true}
                onClose={closeToast}
                />
            )}
        </React.Fragment>
    )
}

export default SummaryDetails;
