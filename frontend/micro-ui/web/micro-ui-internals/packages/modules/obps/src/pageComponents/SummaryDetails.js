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
import { convertEpochToDateDMY, stringReplaceAll, getOrderDocuments, getDocsFromFileUrls } from "../utils"
import DocumentsPreview from "../../../templates/ApplicationDetails/components/DocumentsPreview"
import Architectconcent from "../pages/citizen/NewBuildingPermit/Architectconcent"
import { OTPInput, CardLabelError } from "@mseva/digit-ui-react-components";

const SummaryDetails = ({ onSelect, formData, currentStepData, onGoBack }) => {
    const { t } = useTranslation();
    const history = useHistory();
    const match = useRouteMatch();
    const user = Digit.UserService.getUser();
    const state = Digit.ULBService.getStateId();
    const [showMobileInput, setShowMobileInput] = useState(false)
    const architectmobilenumber = user?.info?.mobileNumber;
    const [mobileNumber, setMobileNumber] = useState(() => architectmobilenumber || "");
    const isArchitectDeclared = sessionStorage.getItem("ArchitectConsentdocFilestoreid") || currentStepData?.currentStepData?.additionalDetails?.isArchitectDeclared;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiLoading, setApiLoading] = useState(false);
    const tenantId = localStorage.getItem("CITIZEN.CITY");
    const menuRef = useRef();
    const [displayMenu, setDisplayMenu] = useState(false);
    const [isFileLoading, setIsFileLoading] = useState(false)
    const [fileUrls, setFileUrls] = useState({});
    const [ownerFileUrls, setOwnerFileUrls] = useState({});
    const [isOwnerFileLoading, setIsOwnerFileLoading] = useState(false);

    const closeMenu = () => {
        setDisplayMenu(false);
    };

    Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

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

    const [otpVerifiedTimestamp, setOTPVerifiedTimestamp] = useState(() => {
        const stored = sessionStorage.getItem("otpVerifiedTimestamp");
        return stored ? new Date(stored) : null;
    });

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

        block?.building?.floors?.forEach((ob) => {
            const builtUp = Number(ob.occupancies?.[0]?.builtUpArea) || 0
            const floor = Number(ob.occupancies?.[0]?.floorArea) || 0

            totalBuiltUpArea += builtUp
            totalFloorArea += floor

            floors.push({
                Floor: t(`BPA_FLOOR_NAME_${ob.number}`),
                Level: ob.number,
                Occupancy: t(`${ob.occupancies?.[0]?.type}`),

                BuildupArea: Number(builtUp).toFixed(2),
                FloorArea: Number(floor).toFixed(2),
            })
        })

        // Add Totals Row
        floors.push({
            Floor: t("BPA_TOTAL"),
            Level: "",
            Occupancy: "",
            BuildupArea: `${Number(totalBuiltUpArea).toFixed(2)} ${t("BPA_SQ_MTRS_LABEL")}`,
            FloorArea: `${Number(totalFloorArea).toFixed(2)} ${t("BPA_SQ_MTRS_LABEL")}`,
        })

        return floors
    }

    const tableHeader = [
        { name: "BPA_TABLE_COL_FLOOR", id: "Floor" },
        { name: "BPA_TABLE_COL_LEVEL", id: "Level" },
        { name: "BPA_TABLE_COL_OCCUPANCY", id: "Occupancy" },
        { name: "BPA_TABLE_COL_BUILDUPAREA", id: "BuildupArea" },
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

    const ecbcDocumentsData = useMemo(() => {
        return (getDocsFromFileUrls(fileUrls) || []).map((doc, index) => ({
            id: index,
            title: doc.title ? t(doc.title) : t("CS_NA"), // ✅ no extra BPA_
            fileUrl: doc.fileURL || null, // adjusted since `doc` already has fileURL
        }));
    }, [fileUrls, t]);

    // useEffect(() => {
    //     console.log("ecbcDocumentsData", ecbcDocumentsData, fileUrls)
    // },[ecbcDocumentsData])


    const handleTermsLinkClick = (e) => {
        e.preventDefault();
        if (isOTPVerified) {
            setShowTermsPopup(true);
        } else {
            alert("Please verify yourself");
        }
    };

    const setdeclarationhandler = (e) => {
        // e.preventDefault(); // Prevent form submission
        console.log("setdeclarationhandler", e);
        if (!isOTPVerified) {
            setShowMobileInput(true);
        } else {
            setAgree(!agree);
        }
    };

    const checkLabels = () => {
        return (
            <div>
                {t("I_AGREE_TO_BELOW_UNDERTAKING")}
                <br />
                {!isArchitectDeclared && <LinkButton style={{ marginLeft: "-55px", background: "#fff" }} label={t("DECLARATION_UNDER_SELF_CERTIFICATION_SCHEME")} onClick={handleTermsLinkClick} />}
                {isArchitectDeclared && <div onClick={handleTermsLinkClick} style={{ color: "green" }} >{t("VIEW_DECLARATION")} </div>}
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
        const title = ownersCount > 1 ? `${t(baseTitle)}_${parseInt(ownerIdx, 10) + 1}` : t(baseTitle);
    
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
            Header: t("BPA_DOCUMENT_FILE"),
            accessor: "fileUrl",
            Cell: ({ value }) =>
                value ? (
                    <LinkButton style={{ float: "right", display: "inline", background: "#fff" }}
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
            const response = await Digit.UserService.authenticate(requestData);
            if (response.ResponseInfo.status === "Access Token generated successfully") {
                setIsOTPVerified(true);
                setOTPSuccess(t("VERIFIED"));
                setOTPError(false);
                const currentTimestamp = new Date();
                setOTPVerifiedTimestamp(currentTimestamp);
                sessionStorage.setItem("otpVerifiedTimestamp", currentTimestamp.toISOString());
                setSetOtpLoading(false);
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
        if (!isArchitectDeclared) {
            alert(t("Please_declare_and_upload_architect_consent"));
            return;
        }
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
                        isArchitectDeclared
                    },
                    documents,
                    workflow: {
                        action: workflowAction,
                        assignes: [accountId]
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
        console.log("Selected Action", action?.action)
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

            const fileKeys = ["ecbcCertificateFile", "greenuploadedFile", "uploadedFile"];

            // Collect valid fileStoreIds
            const validFileStoreIds = fileKeys
                .map((key) => currentStepData?.createdResponse?.additionalDetails?.[key])
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


    if (apiLoading || isFileLoading) return (<Loader />);

    return (
        <React.Fragment>
            <Header>{t("BPA_STEPPER_SUMMARY_HEADER")}</Header>
            <div style={{ marginTop: "30px", paddingBottom: "30px" }}>
                <Card style={{ padding: "20px", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", background: "#fff" }} >
                    <StatusTable>
                        <Row className="border-none" label={t(`BPA_APPLICATION_NUMBER_LABEL`)} text={currentStepData?.createdResponse?.applicationNo} />
                    </StatusTable>
                </Card>
                <Card style={{ padding: "20px", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", background: "#fff" }} >
                    <CardHeader style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
                        {t(`BPA_BASIC_DETAILS_TITLE`)}
                    </CardHeader>
                    <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
                    <StatusTable>
                        <Row className="border-none" label={t(`BPA_BASIC_DETAILS_APP_DATE_LABEL`)} text={convertEpochToDateDMY(Number(currentStepData?.BasicDetails?.applicationDate))} />
                        <Row className="border-none" label={t(`BPA_BASIC_DETAILS_APPLICATION_TYPE_LABEL`)} text={t(`WF_BPA_${currentStepData?.BasicDetails?.applicationType}`)} />
                        <Row className="border-none" label={t(`BPA_BASIC_DETAILS_SERVICE_TYPE_LABEL`)} text={t(currentStepData?.BasicDetails?.serviceType)} />
                        <Row className="border-none" label={t(`BPA_BASIC_DETAILS_OCCUPANCY_LABEL`)} text={currentStepData?.BasicDetails?.occupancyType} />
                        <Row className="border-none" label={t(`BPA_BASIC_DETAILS_RISK_TYPE_LABEL`)} text={t(`WF_BPA_${currentStepData?.BasicDetails?.riskType}`)} />
                    </StatusTable>
                </Card>

                <Card style={{ padding: "20px", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", background: "#fff" }} >
                    <StatusTable>
                        <CardHeader style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>{t("BPA_PLOT_DETAILS_TITLE")}</CardHeader>
                        <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />

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
                    </StatusTable>
                </Card>

                <Card>
                    <CardHeader>{t("BPA_STEPPER_SCRUTINY_DETAILS_HEADER")}</CardHeader>
                    <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
                    <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_EDCR_DETAILS")}</CardSubHeader>

                    <div style={{ marginTop: "19px", background: "#FAFAFA", border: "1px solid #D6D5D4", borderRadius: "4px", padding: "12px", maxWidth: "960px", minWidth: "280px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px" }}>
                            <tbody>
                                {/* EDCR Number */}
                                <tr style={{ borderBottom: "1px solid #eaeaea" }}>
                                    <td style={{ padding: "8px", fontWeight: "600", color: "#333" }}>{t("BPA_EDCR_NO_LABEL")}</td>
                                    <td style={{ padding: "8px", textAlign: "right", color: "#555" }}>
                                        {currentStepData?.BasicDetails?.scrutinyNumber?.edcrNumber || currentStepData?.BasicDetails?.edcrDetails?.edcrNumber || t("CS_NA")}
                                    </td>
                                </tr>

                                {/* Uploaded Plan */}
                                <tr>
                                    <td style={{ padding: "12px 8px", fontWeight: "600", color: "#333" }}>{t("BPA_UPLOADED_PLAN_DIAGRAM")}</td>
                                    <td style={{ padding: "12px 8px", textAlign: "right" }}>
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
                                    <td style={{ padding: "12px 8px", fontWeight: "600", color: "#333" }}>{t("BPA_SCRUNTINY_REPORT_OUTPUT")}</td>
                                    <td style={{ padding: "12px 8px", textAlign: "right" }}>
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

                {/* <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} /> */}
                {/* <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_BUILDING_EXTRACT_HEADER")}</CardSubHeader> */}

                <Card style={{ padding: "20px", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", background: "#fff" }}>
                    <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_PLAN_INFORMATION_PROPERTIES")}</CardSubHeader>
                    <StatusTable>
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
                            label={t("BPA_DISTRICT")}
                            text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.DISTRICT || t("CS_NA")}
                        />
                        <Row className="border-none" label={t("BPA_MAUZA")} text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.MAUZA || t("CS_NA")} />
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

                        <CardSubHeader style={{ fontSize: "18px", marginTop: "20px" }}>{t("BPA_PLOT_DIMENSIONS")}</CardSubHeader>
                        <Row className="border-none" label={t("BPA_AVG_PLOT_DEPTH")} text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.AVG_PLOT_DEPTH} />
                        <Row className="border-none" label={t("BPA_AVG_PLOT_WIDTH")} text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.AVG_PLOT_WIDTH} />

                        <CardSubHeader style={{ fontSize: "18px", marginTop: "20px" }}>{t("BPA_ROAD_DETAILS")}</CardSubHeader>
                        <Row className="border-none" label={t("BPA_ROAD_TYPE")} text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.ROAD_TYPE || t("CS_NA")} />
                        <Row className="border-none" label={t("BPA_ROAD_WIDTH")} text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.ROAD_WIDTH} />

                        <CardSubHeader style={{ fontSize: "18px", marginTop: "20px" }}>{t("BPA_SUSTAINABILITY_FEATURES")}</CardSubHeader>
                        <Row
                            className="border-none"
                            label={t("BPA_GREEN_BUILDINGS_SUSTAINABILITY")}
                            text={currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInfoProperties?.PROVISION_FOR_GREEN_BUILDINGS_AND_SUSTAINABILITY || t("CS_NA")}
                        />
                    </StatusTable>
                    <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
                    <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_OCC_SUBOCC_HEADER")}</CardSubHeader>
                    {currentStepData?.BasicDetails?.edcrDetails?.planDetail?.blocks?.map((block, index) => (
                        <div
                            key={index}
                            style={
                                currentStepData?.BasicDetails?.edcrDetails?.planDetail?.blocks?.length > 1
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

                    <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
                    <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_APP_DETAILS_DEMOLITION_DETAILS_LABEL")}</CardSubHeader>
                    <StatusTable style={{ border: "none" }}>
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

                    <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_APP_DETAILS_ECBC_DETAILS_LABEL")}</CardSubHeader>
                    <StatusTable>
                        <Row className="border-none" label={t(`ECBC - Proposed Connected Electrical Load is above 100 Kw`)} text={currentStepData?.createdResponse?.additionalDetails?.ecbcElectricalLoad} />
                        <Row className="border-none" label={t(`ECBC - Proposed Demand of Electrical Load is above 120 Kw`)} text={currentStepData?.createdResponse?.additionalDetails?.ecbcDemandLoad} />
                        <Row className="border-none" label={t(`ECBC - Proposed Air Conditioned Area above 500 sq.mt`)} text={currentStepData?.createdResponse?.additionalDetails?.ecbcAirConditioned} />
                    </StatusTable>
                </Card>

                <Card style={{ padding: "20px", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", background: "#fff" }} >
                    <StatusTable>
                        <CardHeader>{t("BPA_ECBC_DETAILS_LABEL")}</CardHeader>
                        <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
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
                </Card>

                <Card style={{ padding: "20px", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", background: "#fff" }} >
                    <StatusTable>
                        <CardHeader>{t("BPA_NEW_TRADE_DETAILS_HEADER_DETAILS")}</CardHeader>
                        <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
                        {/* <LinkButton style={{ float: "right", display: "inline", marginTop: "-80px", background: "#fff" }}
                            label={<EditIcon color="white" style={{ color: "white" }} />}

                            onClick={() => { }}
                        /> */}
                        <Row className="border-none" label={t(`BPA_DETAILS_PIN_LABEL`)} text={currentStepData?.createdResponse?.landInfo?.address?.pincode || t("CS_NA")} />
                        <Row className="border-none" label={t(`BPA_CITY_LABEL`)} text={currentStepData?.LocationDetails?.selectedCity?.name || t("CS_NA")} />
                        <Row className="border-none" label={t(`BPA_LOC_MOHALLA_LABEL`)} text={currentStepData?.createdResponse?.landInfo?.address?.locality?.name || t("CS_NA")} />
                        {/* <Row className="border-none" label={t(`BPA_DETAILS_SRT_NAME_LABEL`)} text={address?.street || t("CS_NA")} /> */}
                        {/* <Row className="border-none" label={t(`ES_NEW_APPLICATION_LOCATION_LANDMARK`)} text={address?.landmark || t("CS_NA")} /> */}
                    </StatusTable>
                </Card>

                <Card style={{ padding: "20px", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", background: "#fff" }}>
                    <StatusTable>
                        <CardHeader>{t("BPA_APPLICANT_DETAILS_HEADER")}</CardHeader>
                        <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
                        {/* <LinkButton style={{ float: "right", display: "inline", marginTop: "-80px", background: "#fff" }}
                            label={<EditIcon color="white" style={{ color: "white" }} />}

                            onClick={() => { }}
                        /> */}
                        {currentStepData?.createdResponse?.landInfo?.owners &&
                            currentStepData?.createdResponse?.landInfo?.owners?.length > 0 &&
                            currentStepData?.createdResponse?.landInfo?.owners?.map((ob, index) => (
                                <div
                                    key={index}
                                    style={
                                        currentStepData?.createdResponse?.landInfo?.owners.length > 1
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
                                    {currentStepData?.createdResponse?.landInfo?.owners.length > 1 && (
                                        <CardSubHeader>
                                            {t("COMMON_OWNER")} {index + 1}
                                        </CardSubHeader>
                                    )}
                                    <StatusTable>
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
                                        <Row className="border-none" label={t(`BPA_IS_PRIMARY_OWNER_LABEL`)} text={`${ob?.isPrimaryOwner === true ? "Yes" : "No"}`} />
                                    </StatusTable>
                                </div>
                            ))}
                    </StatusTable>
                    <StatusTable>
                                                <CardHeader>{t("BPA_OWNER_DETAILS_LABEL")}</CardHeader>
                                                <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
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

                <Card style={{ padding: "20px", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", background: "#fff" }} >
                    <StatusTable>
                        <CardHeader>{t("BPA_ADDITIONAL_BUILDING_DETAILS")}</CardHeader>
                        <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
                        <Row
                            className="border-none"
                            label={t(`BPA_APPROVED_COLONY_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.approvedColony || t("CS_NA")}
                        />
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
                            label={t(`BPA_DISTRICT_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.District || t("CS_NA")}
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_BUILDING_STATUS_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.buildingStatus || t("CS_NA")}
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_CORE_AREA_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.coreArea || t("CS_NA")}
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
                            text={currentStepData?.createdResponse?.additionalDetails?.purchasedFAR || t("CS_NA")}
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_MASTER_PLAN_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.masterPlan || t("CS_NA")}
                        />
                        <Row
                            className="border-none"
                            label={t(`BPA_GREEN_BUILDING_LABEL`)}
                            text={currentStepData?.createdResponse?.additionalDetails?.greenbuilding || t("CS_NA")}
                        />
                    </StatusTable>
                </Card>

                <Card style={{ padding: "20px", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", background: "#fff" }} >
                    <StatusTable>
                        <CardHeader>{t("BPA_DOCUMENT_DETAILS_LABEL")}</CardHeader>
                        <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
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


                <Card style={{ padding: "20px", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", background: "#fff" }} >
                    {currentStepData?.createdResponse?.status === "INITIATED" && (
                        <div>
                            {/* <CardLabel>{t("ARCHITECT_SHOULD_VERIFY_HIMSELF_BY_CLICKING_BELOW_BUTTON")}</CardLabel> */}
                            {/* <LinkButton style={{ float:"right", width:"100px", display:"inline", marginTop:"-80px", background:"#fff" }} label={t("BPA_VERIFY")} onClick={handleVerifyClick} /> */}
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
                    )}
                    <br></br>
                    <br></br>
                    <div>
                        {/* <CHANGE> Added checked prop to make checkbox active state visible */}
                        <CheckBox label={checkLabels()} onChange={setdeclarationhandler} styles={{ height: "auto" }} checked={agree} />
                        {showTermsPopup && (
                            <Architectconcent showTermsPopup={showTermsPopup} setShowTermsPopup={setShowTermsPopup} otpVerifiedTimestamp={otpVerifiedTimestamp} currentStepData={currentStepData} />
                        )}
                    </div>
                    <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />

                </Card>
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
                    <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} disabled={!agree || !isOTPVerified || isSubmitting || !isArchitectDeclared} />
                </ActionBar>
            </div>
        </React.Fragment>
    )
}

export default SummaryDetails;
