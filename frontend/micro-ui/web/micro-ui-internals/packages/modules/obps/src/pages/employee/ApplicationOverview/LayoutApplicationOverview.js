import {
  CardSectionHeader,
  Header,
  Row,
  StatusTable,
  Card,
  CardSubHeader,
  ActionBar,
  SubmitBar,
  Menu,
  DisplayPhotos,
  Toast,
  ConnectingCheckPoints,
  CheckPoint,
  MultiLink,
  LinkButton,
  CheckBox,
  Modal,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, useRef, Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import LayoutModal from "../../../pageComponents/LayoutModal";
import LayoutFeeEstimationDetails from "../../../pageComponents/LayoutFeeEstimationDetails";
import LayoutFeeEstimationDetailsTable from "../../../pageComponents/LayoutFeeEstimationDetailsTable";
import LayoutDocumentTableView from "../../../pageComponents/LayoutDocumentTableView";
import LayoutSitePhotographs from "../../../components/LayoutSitePhotographs";
import LayoutDocumentChecklist from "../../../components/LayoutDocumentChecklist";
import InspectionReport from "../../../pageComponents/InspectionReport";
import InspectionReportDisplay from "../../../pageComponents/InspectionReportDisplay";
import NOCDocument from "../../../../../noc/src/pageComponents/NOCDocument";
import { getLayoutAcknowledgementData } from "../../../utils/getLayoutAcknowledgementData";
import LayoutDocumentView from "../../citizen/Applications/LayoutDocumentView";
import { Loader } from "../../../config/Loader";
import NewApplicationTimeline from "../../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
import { SiteInspection } from "../../../pageComponents/SiteInspection";
import CustomLocationSearch from "../../../components/CustomLocationSearch";
import ZoneModal from "../../../components/ZoneModal";
import CustomOwnerImage from "../../../components/CustomOwnerImage";
import { amountToWords, formatDuration, formatDate, decryptId } from "../../../utils/index";
import OBPSPaymentHistory from "../../../../../templates/ApplicationDetails/components/OBPSPaymentHistory";
import PdfPreviewModal from "../../../components/PdfPreviewModal";


const getTimelineCaptions = (checkpoint, index, arr, t) => {
  //console.log("checkpoint here", checkpoint);
  const { wfComment: comment, thumbnailsToShow, wfDocuments } = checkpoint;
  //console.log("wfDocuments", wfDocuments);
  const caption = {
    date: checkpoint?.auditDetails?.lastModified,
    time: checkpoint?.auditDetails?.timing,
    name: checkpoint?.assigner?.name,
    mobileNumber: checkpoint?.assigner?.mobileNumber,
    source: checkpoint?.assigner?.source,
  };

  return (
    <div>
      {comment?.length > 0 && (
        <div className="TLComments">
          <h3>{t("WF_COMMON_COMMENTS")}</h3>
          <p style={{ overflowX: "scroll" }}>{comment}</p>
        </div>
      )}

      {thumbnailsToShow?.thumbs?.length > 0 && (
        <DisplayPhotos
          srcs={thumbnailsToShow.thumbs}
          onClick={(src, idx) => {
            const fullImage = thumbnailsToShow.fullImage?.[idx] || src;
            Digit.Utils.zoomImage(fullImage); // Digit is now declared
          }}
        />
      )}

      {wfDocuments?.length > 0 && (
        <div>
          <div>
            <NOCDocument value={{ workflowDocs: wfDocuments }} index={index} />
          </div>
        </div>
      )}

      <div style={{ marginTop: "8px" }}>
        {caption.time && <p>{caption.time}</p>}
        {caption.date && <p>{caption.date}</p>}
        {caption.name && <p>{caption.name}</p>}
        {caption.mobileNumber && <p>{caption.mobileNumber}</p>}
        {caption.source && <p>{t("ES_COMMON_FILED_VIA_" + caption.source.toUpperCase())}</p>}
      </div>
    </div>
  );
};

const DocumentLink = ({ fileStoreId, cluNumber, stateCode, t, label }) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrl = async () => {
      let fId = fileStoreId;
      const effectiveState = stateCode || Digit.ULBService.getStateId();
      let fetchTenantId = effectiveState;

      if (!fId && cluNumber) {
        try {
          const parts = String(cluNumber).split("-");
          const searchTenantId = parts.length >= 4 && parts[3] ? `pb.${parts[3].toLowerCase()}` : effectiveState;
          const searchRes = await Digit.OBPSService.CLUSearch({
            filters: { applicationNo: cluNumber },
            tenantId: searchTenantId,
          });
          const cluApp = searchRes?.Clu?.[0];
          if (cluApp) {
            fId = cluApp?.cluDetails?.additionalDetails?.sanctionLetterFilestoreId ||
                  cluApp?.additionalDetails?.sanctionLetterFilestoreId;
            if (cluApp?.tenantId) {
              fetchTenantId = cluApp.tenantId;
            }
          }
        } catch (e) {
          console.error("Error searching CLU for document:", e);
        }
      }

      if (fId) {
        try {
          const result = await Digit.UploadServices.Filefetch([fId], fetchTenantId);
          let fetchedUrl = "";
          if (result?.data?.fileStoreIds?.[0]?.url) {
            fetchedUrl = result.data.fileStoreIds[0].url;
          } else if (result?.data?.[fId]) {
            fetchedUrl = result.data[fId];
          }
          if (fetchedUrl) {
            setUrl(typeof fetchedUrl === "string" ? fetchedUrl.split(",")?.[0] : fetchedUrl);
          }
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      }
      setLoading(false);
    };
    fetchUrl();
  }, [fileStoreId, cluNumber, stateCode]);

  if (loading) return <span>{t("LOADING") || "Loading..."}</span>;
  if (!url) return <span>{t("CS_NA") || "NA"}</span>;

  return <LinkButton label={t("View") || "View"} onClick={() => window.open(url, "_blank")} />;
};

const LayoutEmployeeApplicationOverview = () => {
  const { layid } = useParams();
  const id = decryptId(layid)
  const { t } = useTranslation();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const history = useHistory();
  const state = tenantId?.split(".")[0];
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);
  const [viewTimeline, setViewTimeline] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(null);
  const [errorOne, setErrorOne] = useState(null);
  const [displayData, setDisplayData] = useState({});
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [timeObj, setTimeObj] = useState(null);

  const [getEmployees, setEmployees] = useState([]);
  const [getLoader, setLoader] = useState(false);
  const [getWorkflowService, setWorkflowService] = useState([]);

  const [showOptions, setShowOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for payment summary data
  const [calculationData, setCalculationData] = useState(null);
  const [billData, setBillData] = useState(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  // States for site inspection images
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [siteImages, setSiteImages] = useState({});

  // States for field inspection
  const [fieldInspectionPending, setFieldInspectionPending] = useState([]);
  const [checklistRemarks, setChecklistRemarks] = useState({});
  const [feeAdjustments, setFeeAdjustments] = useState([]);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [empDesignation, setEmpDesignation] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const { mutate: eSignCertificate, isLoading: eSignLoading, error: eSignError } = Digit.Hooks.tl.useESign();
  const { isLoading, data } = Digit.Hooks.obps.useLayoutSearchApplication({ applicationNo: id }, tenantId, {
    cacheTime: 0,
  });
  const applicationDetails = data?.resData;
  //console.log("applicationDetails here==>", applicationDetails, checklistRemarks);
  const currentZoneCode = applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails?.zone?.code;
  const businessService = applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails?.businessService?.toUpperCase();
  const prefix= `WF_EMPLOYEE_LAYOUT_${businessService}`?.toUpperCase();
  const Statusprefix= `WF_EMPLOYEE_LAYOUT_STATUS_${businessService}`?.toUpperCase();
  // Fetch layout checklist data - only if not on first DM submission
  // Status DOCUMENTVERIFY_DM means DM is in the process, so don't fetch checklist yet (it will be created on their first submit)
  // For other statuses, checklist should already exist from previous submissions
  const shouldFetchChecklist = applicationDetails?.Layout?.[0]?.applicationStatus !== "DOCUMENTVERIFY_DM";
  const stateCode = Digit.ULBService.getStateId();
  const { data: checklistData, refetch: refetchChecklist } = Digit.Hooks.obps.useLayoutCheckListSearch({ applicationNo: id }, tenantId, {
    enabled: shouldFetchChecklist,
  });
  //console.log("DEBUG: Checklist data fetched:", checklistData, "Fetch enabled:", shouldFetchChecklist);

  const isMobile = window?.Digit?.Utils?.browser?.isMobile();

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: applicationDetails?.layoutDetails?.additionalDetails?.siteDetails?.businessService || "Layout_mcUp",
  });

    const siteInspectionEmp = useMemo(() => {
      return workflowDetails?.data?.processInstances?.find((item) => item?.action === "SEND_FOR_INSPECTION_REPORT")?.assigner;
    }, [workflowDetails]);
  
    const empUserName = siteInspectionEmp?.userName || "";
    const empName = siteInspectionEmp?.name || "";

      const handleSetEmpDesignation = (key) => {
    setEmpDesignation(key);
  };

  //console.log("workflowDetails here=>", workflowDetails);
  //console.log("next employee ======>", data, applicationDetails, applicationDetails?.businessService);

  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth" // use "auto" for instant scroll
    });
  }, [])

  useEffect(() => {
    let WorkflowService = null;
    const businessService = applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails?.businessService;

    //console.log("  Business service:", businessService);
    //console.log("  Tenant ID:", tenantId);

    if (businessService && tenantId) {
      (async () => {
        setLoader(true);
        try {
          WorkflowService = await Digit.WorkflowService.init(tenantId, businessService);
          const states = WorkflowService?.BusinessServices?.[0]?.states || [];
          //console.log("  Setting workflowService state with", states.length, "states");
          setWorkflowService(states);
        } catch (error) {
          console.error("  Error fetching workflow service:", error);
        } finally {
          setLoader(false);
        }
      })();
    } else {
      //console.log("  Skipping workflow load - missing business service or tenant");
    }
  }, [tenantId, applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails?.businessService]);
  let user = Digit.UserService.getUser();

  // Check if user has field inspection roles
  const hasRole = user?.info?.roles?.some((role) => role?.code === "OBPAS_LAYOUT_JE" || role?.code === "OBPAS_LAYOUT_BI");

  // Role-based status checks
  const isFeeDisabled = applicationDetails?.Layout?.[0]?.applicationStatus === "FIELDINSPECTION_INPROGRESS";
  const isDocPending = applicationDetails?.Layout?.[0]?.applicationStatus === "DOCUMENTVERIFY";

  const menuRef = useRef();
  const [displayMenu, setDisplayMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  const closeMenu = () => setDisplayMenu(false);
  const closeToast = () => setShowToast(null);
  const closeToastOne = () => setShowErrorToast(null);

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  if (window.location.href.includes("/obps") || window.location.href.includes("/layout")) {
    const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
    const userInfo = userInfos ? JSON.parse(userInfos) : {};
    // Keep employee user from Digit.UserService, don't overwrite with sessionStorage data
    if (!user?.info?.roles) {
      user = userInfo?.value;
    }
  }

  const userRoles = user?.info?.roles?.map((e) => e.code);
  const actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });


  // console.log("actions here", actions);

  useEffect(() => {
    const layoutObject = applicationDetails?.Layout?.[0];
    //console.log(layoutObject, "layoutObject---in---useEffect");

    if (layoutObject) {
      const applicantDetails = layoutObject?.layoutDetails?.additionalDetails?.applicationDetails;
      const rawOwners = layoutObject?.owners || [];
      const activeOwners = rawOwners.filter(o => o?.status !== false && o?.status !== "false");
      const owners = [...activeOwners].sort((a, b) => {
        const aPrimary = a?.isPrimaryOwner === true || a?.isPrimaryOwner === "true";
        const bPrimary = b?.isPrimaryOwner === true || b?.isPrimaryOwner === "true";
        if (aPrimary && !bPrimary) return -1;
        if (!aPrimary && bPrimary) return 1;
        return 0;
      });
      const siteDetails = layoutObject?.layoutDetails?.additionalDetails?.siteDetails;
      const coordinates = layoutObject?.layoutDetails?.additionalDetails?.coordinates;
      const Documents = layoutObject?.documents || [];

      //console.log("DEBUG: Documents array with remarks:", Documents.map(d => ({ documentType: d.documentType, remarks: d.remarks, uuid: d.uuid })));

      const finalDisplayData = {
        applicantDetails: applicantDetails ? [applicantDetails] : [],
        owners: owners.length > 0 ? owners : [],
        siteDetails: siteDetails ? [siteDetails] : [],
        coordinates: coordinates ? [coordinates] : [],
        Documents: Documents.length > 0 ? Documents : [],
      };

      setDisplayData(finalDisplayData);

      const submittedOn = layoutObject?.layoutDetails?.additionalDetails?.SubmittedOn;
      const endTime = Date.now();
      const totalTime = submittedOn != null ? endTime - submittedOn : null;
      const time = formatDuration(totalTime);
      setTimeObj(time);
    }
  }, [applicationDetails?.Layout]);

  // Initialize site images and field inspection data from application details
  useEffect(() => {
    const layoutObject = applicationDetails?.Layout?.[0];
    if (layoutObject && JSON.stringify(siteImages) === "{}") {
      const siteImagesFromData = layoutObject?.layoutDetails?.additionalDetails?.siteImages;
      setSiteImages(siteImagesFromData ? { documents: siteImagesFromData } : {});
      setFieldInspectionPending(layoutObject?.layoutDetails?.additionalDetails?.fieldinspection_pending || []);
    }
  }, [applicationDetails?.Layout]);

  // Initialize checklist remarks from API data
  useEffect(() => {
    if (checklistData?.checkList?.length > 0 && Object.keys(checklistRemarks).length === 0) {
      const remarksMap = {};
      checklistData.checkList.forEach((item) => {
        remarksMap[item.documentUid || item.documentuid] = item.remarks || "";
      });
      //console.log("DEBUG: Initialized checklistRemarks from API:", remarksMap);
      setChecklistRemarks(remarksMap);
    }
  }, [checklistData]);

  // Show warning toast if desktop user is on FIELDINSPECTION_INPROGRESS status
  useEffect(() => {
    if (applicationDetails?.Layout?.[0]?.applicationStatus === "FIELDINSPECTION_INPROGRESS" && hasRole && !isMobile) {
      //console.log("Field_Inspection_Only_Available_On_Mobile");
    }
  }, [applicationDetails?.Layout?.[0]?.applicationStatus, hasRole, isMobile]);

  // Filter site photographs and remaining documents
  const coordinates = applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.coordinates;
  const sitePhotos = displayData?.Documents?.filter(
    (doc) =>
      doc.documentType === "OWNER.SITEPHOTOGRAPHONE" ||
      doc.documentType === "OWNER.SITEPHOTOGRAPHTWO" ||
      doc.documentType === "SITE.PHOTOGRAPHONE" ||
      doc.documentType === "SITE.PHOTOGRAPHTWO"
  ).sort((a, b) => a?.order - b?.order);
  const remainingDocs = displayData?.Documents?.sort((a, b) => a?.order - b?.order)?.filter(
    (doc) =>
      !(
        doc?.documentType === "OWNER.SITEPHOTOGRAPHONE" ||
        doc?.documentType === "OWNER.SITEPHOTOGRAPHTWO" ||
        doc?.documentType === "SITE.PHOTOGRAPHONE" ||
        doc?.documentType === "SITE.PHOTOGRAPHTWO"
      )
  );

  // Calculate geo locations from site images
  const geoLocations = useMemo(() => {
    if (siteImages?.documents && siteImages?.documents.length > 0) {
      return siteImages?.documents?.map((img) => {
        return {
          latitude: img?.latitude || "",
          longitude: img?.longitude || "",
        };
      });
    }
  }, [siteImages]);

  // Format document data for display
  const documentData = useMemo(
    () =>
      siteImages?.documents?.map((value, index) => ({
        title: value?.documentType,
        fileStoreId: value?.filestoreId,
        latitude: value?.latitude,
        longitude: value?.longitude,
      })),
    [siteImages]
  );

  const { data: reciept_data2, isLoading: recieptDataLoading2 } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "LAYOUT.PAY2",
      consumerCodes: id,
      isEmployee: true,
    },
    { enabled: id ? true : false }
  );

  const { data: reciept_data1, isLoading: recieptDataLoading1 } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "LAYOUT.PAY1",
      consumerCodes: id,
      isEmployee: true,
    },
    { enabled: id ? true : false }
  );

  const combinedPayments = useMemo(() => {
    const p1 = reciept_data1?.Payments || [];
    const p2 = reciept_data2?.Payments || [];
    return [...p1, ...p2];
  }, [reciept_data1, reciept_data2]);

  const hasPayments = combinedPayments.length > 0;

  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  const handleDownloadPdf = async () => {
    try {
      setLoader(true);
      const Property = applicationDetails?.Layout?.[0];
      const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
      const ulbType = tenantInfo?.city?.ulbType;
      const acknowledgementData = await getLayoutAcknowledgementData(Property, tenantInfo, ulbType, t, combinedPayments);
      await Digit.Utils.pdf.generateFormattedNOC(acknowledgementData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoader(false);
    }
  };

  async function getRecieptSearch({ tenantId, payments, pdfkey, filestoreId = null, returnFileStoreId = false, ...params }) {
    try {
      setLoader(true);
      if (!filestoreId) {
        const site = displayData?.siteDetails?.[0];
        const owner = displayData?.owners?.[0];
        const city = site?.district?.city;

        const usage = site?.buildingCategory?.name;
        const fee = payments?.totalAmountPaid;
        const amountinwords = amountToWords(fee);

        // --- core fields, single source each, no aliasing ---
        const ulbType = site?.ulbType || city?.ulbType;
        const ulbName = site?.ulbName || city?.ulbName;
        const ulbGrade = city?.ulbGrade; // confirm exact codes: NP / MC / Corp
        const districtName = city?.districtName;
        const applicationNo = displayData?.applicationNo || applicationDetails?.Layout?.[0]?.applicationNo;
        const rawSubmissionDate = applicationDetails?.Layout?.[0]?.submissionDate || applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.SubmittedOn;
        const submissionDate = rawSubmissionDate ? Number(rawSubmissionDate) : undefined;
        const rawIssueDate = applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.approvalDate;
        const issueDate = rawIssueDate ? Number(rawIssueDate) : undefined;
        const colonyTypeName = usage;
        const proposedSiteAddress = site?.proposedSiteAddress || site?.district?.proposedSiteAddress;
        const hadbastNo = site?.hadbastNo || site?.district?.hadbastNo;
        const villageName = site?.villageName || site?.district?.villageName;
        const areaSqm = site?.netTotalArea || site?.district?.netTotalArea;

        const primaryOwner = applicationDetails?.Layout?.[0]?.owners?.find(o => o?.isPrimaryOwner === true || o?.isPrimaryOwner === "true") || displayData?.owners?.[0] || owner;
        const applicantType = (
          primaryOwner?.additionalDetails?.aplicantType?.code ||
          primaryOwner?.additionalDetails?.applicantType?.code ||
          "INDIVIDUAL"
        ).toUpperCase();

        const isFirm = applicantType !== "INDIVIDUAL";

        // Authorized Person vs Owner Name
        const rawAuthPerson = primaryOwner?.additionalDetails?.authorisedPerson || primaryOwner?.additionalDetails?.authorisedPersonName;
        const authorisedPersonName = typeof rawAuthPerson === "object" ? rawAuthPerson?.name : rawAuthPerson;

        const applicantName = isFirm
          ? (authorisedPersonName || primaryOwner?.name || owner?.name || "")
          : (primaryOwner?.name || owner?.name || "");

        // Firm / Company Name vs Individual Promoter
        const firmName =
          primaryOwner?.additionalDetails?.firmName ||
          primaryOwner?.additionalDetails?.companyName ||
          primaryOwner?.additionalDetails?.promoterFirmName ||
          primaryOwner?.additionalDetails?.institutionName;

        const promoterFirmName = isFirm
          ? (firmName || primaryOwner?.name || "")
          : " ";

        const applicantAddress = primaryOwner?.permanentAddress || primaryOwner?.correspondenceAddress || primaryOwner?.address || proposedSiteAddress || "N/A";

        // --- derived once, reused for both officerDesignation and signatoryDesignation ---
        const isSmallerUlb = ["NP", "MC"].includes(ulbGrade); // Nagar Panchayat or Municipal Council — confirm exact grade codes
        const officerDesignation = isSmallerUlb ? t("SMALLER_ULB_OFFICER") : t("BIGGER_ULB_OFFICER");
        const signatoryDesignation = isSmallerUlb
          ? t("SMALLER_ULB_DESIG")
          : t("BIGGER_ULB_DESIG");

        // same isSmallerUlb split decides which name goes with the Competent Authority
        const jurisdictionName = isSmallerUlb ? districtName : ulbName;

        // --- composed projectDescription (fill in Project Name once that field exists) ---
        const projectDescription = `${proposedSiteAddress || ""} on Land Measuring Area ${areaSqm || ""} sqm, Situated at Hadbast No. ${
          hadbastNo || ""
        }, Village - ${villageName || ""}, ${ulbName || ""}, Punjab.`;

        const response = await Digit.PaymentService.generatePdf(
          tenantId,
          {
            Payments: [
              {
                ...payments,
                usage,
                amountinwords,
                applicationDetails,
                ulbType,
                ulbName,
                ulbGrade,
                districtName,
                jurisdictionName,
                officerDesignation,
                signatoryDesignation,
                applicantName,
                applicationNo,
                submissionDate,
                issueDate,
                colonyTypeName,
                projectDescription,

                // still open / not sourced yet:
                officeName: signatoryDesignation, // ADC/MC basis for the header still to be confirmed
                officeSubLine: isSmallerUlb ? `Office Wing, ${districtName}` : `${ulbType} - ${ulbName}`,
                applicantAddress,
                promoterFirmName,
                dcrNo: undefined, // placeholder pending scrutiny module
                dcrApprovalDate: undefined,
                complianceDays: undefined,
                extensionDays: undefined,
              },
            ],
          },
          pdfkey
        );
        filestoreId = response?.filestoreIds[0];
      }
      if (returnFileStoreId) {
        return filestoreId;
      }
      let fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: filestoreId });

      if (!fileStore?.[filestoreId]?.length) {
        fileStore = await Digit.PaymentService.printReciept(Digit.ULBService.getStateId(), { fileStoreIds: filestoreId });
      }
      window.open(fileStore[filestoreId], "_blank");
    } catch (error) {
      console.error("receipt download error:", error);
    } finally {
      setLoader(false);
    }
  }

  async function openLOIPopup() {
    try {
      setLoader(true);
      const fileStoreId = await getRecieptSearch({
        tenantId: reciept_data2?.Payments?.[0]?.tenantId || tenantId,
        payments: reciept_data2?.Payments?.[0] || {},
        pdfkey: "layout-loi",
        returnFileStoreId: true,
      });
      if (!fileStoreId) throw new Error("No filestoreId found for LOI");
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      const receiptUrl = fileStore?.[fileStoreId];
      if (!receiptUrl) throw new Error("Could not resolve filestore URL");
      const urlObj = new URL(receiptUrl);
      const downloadUrl = `${window.origin}${urlObj.pathname}${urlObj.search}`;
      setPdfUrl(downloadUrl);
      setShowPdfModal(true);
    } catch (error) {
      console.error("LOI popup error:", error);
    } finally {
      setLoader(false);
    }
  }

  const printCertificateWithESign = async () => {
    try {
      const fileStoreId = await getRecieptSearch({
        tenantId: reciept_data2?.Payments?.[0]?.tenantId || tenantId,
        payments: reciept_data2?.Payments?.[0] || {},
        pdfkey: "layout-loi",
        returnFileStoreId: true,
      });
      if (!fileStoreId) throw new Error("No filestoreId found for LOI eSign");
      const callbackUrl = `${window.location.origin}/digit-ui/employee/obps/layout/esign/complete/${encodeURIComponent(id)}`;      
      const authToken = localStorage.getItem("token");
      eSignCertificate(
        { fileStoreId, tenantId, callbackUrl, authToken },
        {
          onSuccess: () => console.log("✅ LOI eSign initiated successfully"),
          onError: (error) => {
            setShowToast({
              key: "true",
              error: true,
              message: error.message || "Failed to initiate digital signing process, Kindly check if the document is e-signed already",
            });
          },
        }
      );
    } catch (error) {
      setShowToast({
        key: "true",
        error: true,
        message: error.message || "Failed to prepare LOI for eSign, Kindly check if the document is e-signed already",
      });
    }
  };

  function routeToImage(filestoreId) {
    getUrlForDocumentView(filestoreId);
  }

  const getUrlForDocumentView = async (filestoreId) => {
    if (filestoreId?.length === 0) return;
    try {
      const result = await Digit.UploadServices.Filefetch([filestoreId], state);
      if (result?.data) {
        const fileUrl = result.data[filestoreId];
        if (fileUrl) {
          window.open(fileUrl, "_blank");
        }
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  const dowloadOptions = [];
  if (applicationDetails?.Layout?.[0]) {
    dowloadOptions.push({
      label: t("Application Form"),
      onClick: handleDownloadPdf,
    });
  }

 
  if (
      applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.LOIFilestoreId
    ) {
      dowloadOptions.push({
        label: t("LETTER_OF_INTENT"),
       onClick: () =>
          getRecieptSearch({
            tenantId: tenantId,
            payments: {},
            filestoreId : applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.LOIFilestoreId
          }),
      });
    }

  if (reciept_data1 && reciept_data1?.Payments.length > 0 && !recieptDataLoading1) {
    dowloadOptions.push({
      label: t("CLU_FEE_RECEIPT_1"),
      onClick: () => getRecieptSearch({ tenantId: reciept_data1?.Payments[0]?.tenantId, payments: reciept_data1?.Payments[0], pdfkey: "layout-receipt" }),
    });
  }

  if (reciept_data2 && reciept_data2?.Payments.length > 0 && !recieptDataLoading2) {
    dowloadOptions.push({
      label: t("CLU_FEE_RECEIPT_2"),
      onClick: () => getRecieptSearch({ tenantId: reciept_data2?.Payments[0]?.tenantId, payments: reciept_data2?.Payments[0], pdfkey: "layoutreceipt-second" }),
    });
  }

  useEffect(() => {
    if (eSignError) {
      setShowToast({
        key: "true",
        error: true,
        message: "eSign process failed. Please try again.",
      });
    }
  }, [eSignError]);

  useEffect(() => {
    //console.log(" useEffect triggered - id changed to:", id);

    if (workflowDetails) {
      workflowDetails.revalidate();
    }

    if (data) {
      data.revalidate();
    }
  }, [id]);

  // Helper function to get remark entries from inspection report
  function getRemarkEntries(record) {
    return Object.entries(record || {}).filter(([k]) => k.startsWith("Remarks"));
  }

  // Helper function to check if all remarks are filled
  function areAllRemarksFilled(record) {
    const remarkEntries = getRemarkEntries(record);
    return remarkEntries.length > 0 && remarkEntries.every(([, v]) => typeof v === "string" && v.trim().length > 0);
  }

  const submitAction = async (data) => {
    //console.log(" submitAction called with data:", data);
    setIsSubmitting(true);

    console.log(data ,"data received in submit")
    try {
      const filtData = data?.Licenses?.[0];

      // if(filtData?.action === "SEND_FOR_INSPECTION_REPORT"){
      //   filtData.assignee = user?.info?.uuid;
      // }

      if (!filtData) {
        console.error(" ERROR: filtData is undefined");
        setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" });
        setIsSubmitting(false);
        return;
      }

      if (filtData?.action === "SEND_FOR_INSPECTION_REPORT") {
        filtData.assignee = [user?.info?.uuid];
      }

      const layoutObject = applicationDetails?.Layout?.[0];
      //console.log(" layoutObject:", layoutObject);

      if (!layoutObject) {
        console.error(" ERROR: layoutObject is undefined");
        setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" });
        setIsSubmitting(false);
        return;
      }

      // Validation For Site Inspection Report AT JE/BI Level
      if (applicationDetails?.Layout?.[0]?.applicationStatus === "INSPECTION_REPORT_PENDING") {
        if (fieldInspectionPending?.length === 0 || fieldInspectionPending?.[0]?.questionLength === 0) {
          closeModal();
          setShowToast({ key: "true", error: true, message: "BPA_FIELD_INSPECTION_REPORT_PENIDNG_VALIDATION_LABEL" });
          setIsSubmitting(false);
          return;
        } else {
          const record = fieldInspectionPending?.[0] || {};
          const allRemarksFilled = areAllRemarksFilled(record);

          if (!allRemarksFilled) {
            closeModal();
            setShowToast({ key: "true", error: true, message: "BPA_FIELD_INSPECTION_REPORT_PENDING_QUESTION_VALIDATION_LABEL" });
            setIsSubmitting(false);
            return;
          }

          const recommendations = record.Recommendations || "";
          if (recommendations.trim().length < 20) {
            closeModal();
            setShowToast({ key: "true", error: true, message: "Please fill in the Recommendations with minimum 20 characters" });
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Validation For Document Remarks AT DM Level
      if (applicationDetails?.Layout?.[0]?.applicationStatus === "DOCUMENTVERIFY_DM") {
        const isDM = user?.info?.roles?.some((role) => role.code === "OBPAS_LAYOUT_DM");
        if (isDM && remainingDocs?.length > 0) {
          // Check if all documents have remarks filled
          const allRemarksFilledForDocuments = remainingDocs.every((doc) => {
            const remark = checklistRemarks[doc.documentUid || doc.uuid];
            //console.log("remarkdoc",remainingDocs,doc,checklistRemarks, checklistRemarks[doc.documentUid || doc.uuid])
            return remark && typeof remark === "string" && remark.trim().length > 0;
          });

          //console.log("allRemarksFilledForDocuments",allRemarksFilledForDocuments)

          if (!allRemarksFilledForDocuments) {
            closeModal();
            setShowToast({ key: "true", error: true, message: "Please Give Remarks for all documents" });
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Build new calculation object from current fee adjustments
      const newCalculation = {
        isLatest: true,
        updatedBy: Digit.UserService.getUser()?.info?.name,
        taxHeadEstimates: feeAdjustments
          .filter((row) => row.taxHeadCode !== "LAYOUT_TOTAL") // exclude UI-only total row
          .map((row) => ({
            taxHeadCode: row.taxHeadCode,
            estimateAmount: row.adjustedAmount || 0, // baseline + delta
            category: row.category,
            remarks: row.remark || null,
            filestoreId: row.filestoreId || null,
          })),
      };

      // Get old calculations and mark them as not latest
      const oldCalculations = (layoutObject?.layoutDetails?.additionalDetails?.calculations || [])?.map((c) => ({ ...c, isLatest: false }));

      // Update documents with remarks from checklistRemarks
      const updatedDocuments =
        displayData?.Documents?.map((doc) => ({
          ...doc,
          remarks: checklistRemarks[doc.documentUid || doc.uuid] || doc.remarks || "",
        })) || [];

      // Ensure all nested data is properly preserved
      const updatedApplicant = {
        ...layoutObject,
        documents: updatedDocuments,
        layoutDetails: {
          vasikaNumber: layoutObject?.layoutDetails?.additionalDetails?.siteDetails?.vasikaNumber,
          vasikaDate: layoutObject?.layoutDetails?.additionalDetails?.siteDetails?.vasikaDate,
          ...layoutObject?.layoutDetails,
          additionalDetails: {
            ...layoutObject?.layoutDetails?.additionalDetails,
            applicationDetails: {
              ...layoutObject?.layoutDetails?.additionalDetails?.applicationDetails,
            },
            siteDetails: {
              ...layoutObject?.layoutDetails?.additionalDetails?.siteDetails,
              vasikaNumber: layoutObject?.layoutDetails?.additionalDetails?.siteDetails?.vasikaNumber,
              vasikaDate: layoutObject?.layoutDetails?.additionalDetails?.siteDetails?.vasikaDate,
            },
            siteImages: siteImages?.documents || [],
            fieldinspection_pending: fieldInspectionPending,
            calculations: [...oldCalculations, newCalculation],
          },
        },
        workflow: {
          action: filtData.action,
          assignes: filtData?.assignee,
          comment: filtData?.comment,
          documents: filtData?.wfDocuments,
        },
      };

      const finalPayload = {
        Layout: updatedApplicant,
      };

      //console.log(" finalPayload:", JSON.stringify(finalPayload, null, 2));

      const response = await Digit.OBPSService.LayoutUpdate(finalPayload, tenantId);
      //console.log(" API response:", response);

      // Also send checklist update/create for document remarks
      // CHECK: If on DM role (shouldFetchChecklist === false), CREATE checklist. Otherwise UPDATE if data exists
      if (response?.ResponseInfo?.status === "successful" && Object.keys(checklistRemarks).length > 0) {
        try {
          // At DM level: shouldFetchChecklist is false, so we ALWAYS CREATE on first DM submit
          // At other levels: shouldFetchChecklist is true, so checklistData contains existing records, and we UPDATE
          if (filtData?.action === "UPDATE_ZONE") {
            setShowToast({ key: "true", success: true, message: "Zone updated successfully" });
            workflowDetails.revalidate();
            // refetch();
            setShowZoneModal(false);
            setSelectedAction(null);
            setTimeout(() => {
              window.location.href = "/digit-ui/employee/obps/layout/inbox";
            }, 3000);
          }
          if (!shouldFetchChecklist) {
            // DM ROLE: CREATE checklist on first submit
            const checklistPayload = {
              checkList: (displayData?.Documents || []).map((doc) => ({
                documentuid: doc.documentUid || doc.uuid,
                applicationNo: id,
                tenantId: tenantId,
                action: "INITIATE",
                remarks: checklistRemarks[doc.documentUid || doc.uuid] || "",
              })),
            };
            //console.log("DEBUG: DM ROLE - Sending checklist CREATE payload:", checklistPayload);
            const checklistResponse = await Digit.OBPSService.LayoutCheckListCreate({ details: checklistPayload, filters: {} });
            //console.log("DEBUG: Checklist create response:", checklistResponse);
            // Refetch checklist after creation
            refetchChecklist();
          } else if (checklistData?.checkList?.length > 0) {
            // OTHER ROLES: UPDATE existing checklist records
            const checklistPayload = {
              checkList: (displayData?.Documents || []).map((doc) => {
                const existing = checklistData.checkList.find((c) => c.documentUid === doc.documentUid || c.documentuid === doc.documentUid);
                return {
                  id: existing?.id,
                  documentUid: doc.documentUid || doc.uuid,
                  applicationNo: id,
                  tenantId: tenantId,
                  action: "update",
                  remarks: checklistRemarks[doc.documentUid || doc.uuid] || "",
                };
              }),
            };
            //console.log("DEBUG: OTHER ROLES - Sending checklist UPDATE payload:", checklistPayload);
            const checklistResponse = await Digit.OBPSService.LayoutCheckListUpdate({ details: checklistPayload, filters: { tenantId } });
            //console.log("DEBUG: Checklist update response:", checklistResponse);
          } else {
            console.warn("DEBUG: Checklist data not available at non-DM roles - may need to search first");
          }
        } catch (checklistErr) {
          console.error("DEBUG: Error updating/creating checklist:", checklistErr);
          // Don't fail the main operation if checklist update fails
        }
      }

      if (response?.ResponseInfo?.status === "successful") {
        // if (filtData?.action === "CANCEL") {
        //   setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" });
        //   workflowDetails.revalidate();
        //   setSelectedAction(null);
        //   setShowModal(false);
        //    setTimeout(() => {
        //     window.location.href = "/digit-ui/employee/obps/layout/inbox";
        //   }, 3000);
        // } else
          if (filtData?.action) {
          //console.log("We are calling employee response page");
          history.replace({
            pathname: `/digit-ui/employee/obps/layout/response/${response?.Layout?.[0]?.applicationNo}`,
            state: { data: response },
          });
        } else {
          setShowToast({ key: "true", success: true, message: "COMMON_SUCCESSFULLY_UPDATED_APPLICATION_STATUS_LABEL" });
          workflowDetails.revalidate();
          setSelectedAction(null);
          setShowModal(false);
           setTimeout(() => {
            window.location.href = "/digit-ui/employee/obps/layout/inbox";
          }, 3000);
        }
      } else {
        console.error(" API response not successful:", response);
        setShowToast({ key: "true", warning: true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" });
        setSelectedAction(null);
      }
    } catch (err) {
      console.error(" ERROR in submitAction:", err);
      console.error(" Error message:", err?.message);
      console.error(" Error stack:", err?.stack);
      setShowToast({ key: "true", error: true, message: err?.response?.data?.Errors?.[0]?.message });
    } finally {
      // <CHANGE> Stop loading when submit completes (success or error)
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
  };

  // function onActionSelect(action) {
  //   const appNo = applicationDetails?.Layout?.[0]?.applicationNo;

  //   console.log("check action === ", action);

  //   const filterNexState = action?.state?.actions?.filter((item) => item.action == action?.action);

  //    console.log("check filterNexState=== ", filterNexState[0]?.nextState );

  //   const filterRoles = getWorkflowService?.filter((item) => item?.uuid == filterNexState[0]?.nextState);

  //   console.log("check getWorkflowService === ", getWorkflowService);

  //   console.log(filterRoles, "filterRoles");

  //   setEmployees(filterRoles?.[0]?.actions);

  //   const payload = {
  //     Licenses: [action],
  //   };

  //   if (action?.action == "EDIT") {
  //     history.push(`/digit-ui/employee/obps/layout/edit-application/${appNo}`);
  //   } else if (action?.action == "DRAFT") {
  //     setShowToast({ key: "true", warning: true, message: "COMMON_EDIT_APPLICATION_BEFORE_SAVE_OR_SUBMIT_LABEL" });
  //   } else if (action?.action == "APPLY" || action?.action == "RESUBMIT" || action?.action == "CANCEL") {
  //     submitAction(payload);
  //   } else if (action?.action == "PAY") {
  //     history.push(`/digit-ui/employee/payment/collect/layout/${appNo}/${tenantId}?tenantId=${tenantId}`);
  //   } else {
  //     setShowModal(true);
  //     setSelectedAction(action);
  //   }
  // }

  function onActionSelect(action) {
    const appNo = applicationDetails?.Layout?.[0]?.applicationNo;

    //console.log("check action === ", action);

    const filterNexState = action?.state?.actions?.filter((item) => item.action == action?.action);
    //console.log("check filterNexState=== ", filterNexState[0]?.nextState);

    const filterRoles = getWorkflowService?.filter((item) => item?.uuid == filterNexState[0]?.nextState);

    //console.log("check getWorkflowService === ", getWorkflowService);
    //console.log(filterRoles, "filterRoles");

    // <CHANGE> Added detailed logging and fallback to empty array
    const nextStateRoles = filterRoles?.[0]?.actions || [];
    //console.log("  Next state roles to filter employees:", nextStateRoles);
    setEmployees(nextStateRoles);

    const payload = {
      Licenses: [action],
    };

    if (action?.action == "EDIT") {
      history.push(`/digit-ui/employee/obps/layout/edit-application/${appNo}`);
    } else if (action?.action == "DRAFT") {
      setShowToast({ key: "true", warning: true, message: "COMMON_EDIT_APPLICATION_BEFORE_SAVE_OR_SUBMIT_LABEL" });
    } else if (action?.action == "APPLY" || action?.action == "RESUBMIT" || action?.action == "CANCEL") {
      submitAction(payload);
    } else if (action?.action == "PAY") {
      history.push(`/digit-ui/employee/payment/collect/layout/${appNo}/${tenantId}?tenantId=${tenantId}`);
    } else if (action?.action == "ESIGN") {
      // opens the sanctionletter popup
      // printCertificateWithESign();
      openLOIPopup();
    }else if (action?.action == "UPDATE_ZONE") {
      setShowZoneModal(true);
    } else {
      // Validation: Prevent forwarding without required site images during field inspection
      if (
        applicationDetails?.Layout?.[0]?.applicationStatus === "FIELDINSPECTION_INPROGRESS" &&
        (!siteImages?.documents || siteImages?.documents?.length < 4)
      ) {
        setShowToast({ key: "true", error: true, message: "Please_Add_Site_Images_With_Geo_Location" });
        return;
      }
      // <CHANGE> Log before opening modal to verify employees are set
      //console.log("  Opening modal with filtered employees:", nextStateRoles);
      setShowModal(true);
      setSelectedAction(action);
    }
  }

  const handleZoneSubmit = (selectedZone, comment) => {
    const payload = {
      Licenses: [
        {
          action: "UPDATE_ZONE",
          comment: comment,
          // Pass the zone object which contains both code and name
          zone: selectedZone,
        },
      ],
    };
    submitAction(payload);
  };

  const getFloorLabel = (index) => {
    if (index === 0) return t("NOC_GROUND_FLOOR_AREA_LABEL");

    const floorNumber = index;
    const lastDigit = floorNumber % 10;
    const lastTwoDigits = floorNumber % 100;

    let suffix = "th";
    if (lastTwoDigits < 11 || lastTwoDigits > 13) {
      if (lastDigit === 1) suffix = "st";
      else if (lastDigit === 2) suffix = "nd";
      else if (lastDigit === 3) suffix = "rd";
    }

    return `${floorNumber}${suffix} ${t("NOC_FLOOR_AREA_LABEL")}`;
  };

  const formatDateVasika = (dateString) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // Helper function to render label-value pairs only when value exists
  const renderLabel = (label, value) => {
    if (!value || value === "NA" || value === "" || value === null || value === undefined || value === "0.00") {
      return null;
    }

    // Extract value from object if it has 'name' property
    let displayValue = value;
    if (typeof value === "object" && value !== null) {
      displayValue = value?.name || value?.code || JSON.stringify(value);
    }

    return <Row label={label} text={displayValue} />;
  };

  const handleViewTimeline = () => {
    setViewTimeline(true);
    const timelineSection = document.getElementById("timeline");
    if (timelineSection) timelineSection.scrollIntoView({ behavior: "smooth" });
  };

  const onChangeReport = (key, value) => {
    //console.log("key,value", key, value);
    setFieldInspectionPending(value);
  };

  const RenderRow = ({ label, value }) => {
    if (!value) return null;
    return <Row label={label} text={value} />;
  };

  const findOwnerDocument = (ownerIndex, docType) => {
    // Then check owner's additionalDetails (same keys as LayoutSummary.js)
    const owners = displayData?.owners || [];
    if (owners && owners[ownerIndex]?.additionalDetails) {
      if (docType === "OWNERPHOTO" && owners[ownerIndex]?.additionalDetails?.ownerPhoto) {
        return owners[ownerIndex]?.additionalDetails?.ownerPhoto;
      }
      if (docType === "OWNERVALIDID" && owners[ownerIndex]?.additionalDetails?.documentFile) {
        return owners[ownerIndex]?.additionalDetails?.documentFile;
      }
      if (docType === "OWNERPAN" && owners[ownerIndex]?.additionalDetails?.documentFile) {
        return owners[ownerIndex]?.additionalDetails?.panDocument;
      }
    }

    return null;
  };

  const getApplicantNamesForDeclaration = () => {
    const owners = displayData?.owners || [];
    if (owners.length === 0) return "";

    return owners
      .map((applicant, index) => {
        if (index === 0) {
          const aplicantType = applicant?.additionalDetails?.aplicantType?.code;
          if (aplicantType === "FIRM") {
            return applicant?.additionalDetails?.authorisedPerson || applicant?.name;
          }
        }
        return applicant?.name;
      })
      .filter(Boolean)
      .join(", ");
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={"employee-main-application-details"}>
      {/* <CustomOwnerImage ownerFileStoreId={displayData?.owners?.[0]?.additionalDetails?.ownerPhoto} ownerName={displayData?.owners?.[0]?.name} /> */}
      <div className="cardHeaderWithOptions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Header styles={{ fontSize: "32px" }}>{t("LAYOUT_APP_OVER_VIEW_HEADER")}</Header>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "auto" }}>
          <LinkButton label={t("VIEW_TIMELINE")} style={{ color: "#A52A2A" }} onClick={handleViewTimeline} />
          {getLoader && <Loader />}
          {dowloadOptions && dowloadOptions.length > 0 && (
            (recieptDataLoading1 || recieptDataLoading2) ?
              <Loader /> :
              <div>
                <MultiLink
                  className="multilinkWrapper"
                  onHeadClick={() => setShowOptions(!showOptions)}
                  displayOptions={showOptions}
                  options={dowloadOptions}
                />
              </div>
          )}
        </div>
      </div>

      <Card>
        <CardSubHeader>{t("OWNER_OWNERPHOTO") || "OWNER'S PHOTO"}</CardSubHeader>
        <CustomOwnerImage ownerFileStoreId={displayData?.owners?.[0]?.additionalDetails?.ownerPhoto} ownerName={displayData?.owners?.[0]?.name} />
      </Card>

      <Card>
        <CardSubHeader>{t("LAYOUT_APPLICANT_DETAILS")}</CardSubHeader>
        <StatusTable>
          <Row label={t("Application Number")} text={applicationDetails?.Layout?.[0]?.applicationNo || "N/A"} />
          <Row label={t("Application Date")} text={applicationDetails?.Layout?.[0]?.auditDetails?.createdTime ? Digit.DateUtils.ConvertTimestampToDate(Number(applicationDetails?.Layout?.[0]?.auditDetails?.createdTime), "dd/MM/yyyy") : "N/A"} />
           {(applicationDetails?.Layout?.[0]?.applicationStatus !== "INITIATED") && (
          <Row label={t("Application Submission Date")} text={(applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.SubmittedOn) ? Digit.DateUtils.ConvertTimestampToDate(Number(applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.SubmittedOn), "dd/MM/yyyy") : "N/A"} />
           )}
          {(applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.approvalDate) && (
            <Row label={t("Application Approval Date")} text={(applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.approvalDate) ? Digit.DateUtils.ConvertTimestampToDate(Number(applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.approvalDate), "dd/MM/yyyy") : "N/A"} />
          )}
        </StatusTable>
      </Card>

      

      {/* -------------------- PROFESSIONAL DETAILS -------------------- */}

      {displayData?.applicantDetails?.[0]?.professionalName && (
        <Card>
          <CardSubHeader>{t("LAYOUT_PROFESSIONAL_DETAILS")}</CardSubHeader>
      
            <StatusTable>
              <RenderRow label={t("NOC_PROFESSIONAL_NAME_LABEL")} value={displayData?.applicantDetails?.[0]?.professionalName || "N/A"} />
              <RenderRow label={t("NOC_PROFESSIONAL_EMAIL_LABEL")} value={displayData?.applicantDetails?.[0]?.professionalEmailId || "N/A"} />
              <RenderRow label={t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL")} value={displayData?.applicantDetails?.[0]?.professionalRegId || "N/A"} />
              <RenderRow label={t("NOC_PROFESSIONAL_MOBILE_NO_LABEL")} value={displayData?.applicantDetails?.[0]?.professionalMobileNumber || "N/A"} />
              <RenderRow label={t("NOC_PROFESSIONAL_ADDRESS_LABEL")} value={displayData?.applicantDetails?.[0]?.professionalAddress || "N/A"} />
              <RenderRow
                label={t("BPA_PROFESSIONAL_REGISTRATION_ID_VALIDITY_LABEL")}
                value={formatDate(displayData?.applicantDetails?.[0]?.professionalRegistrationValidity || "N/A")}
              />
            </StatusTable>
          
        </Card>
      )}

      {/* -------------------- OWNERS / APPLICANTS DETAILS -------------------- */}
      {displayData?.owners &&
        displayData?.owners.length > 0 &&
        displayData?.owners?.map((applicant, index) => (
          <React.Fragment key={index}>
            <Card>
              <CardSubHeader>{index === 0 ? t("PRIMARY_OWNER") : `${t("Owner") || "Owner"} ${index + 1}`}</CardSubHeader>
         
                <StatusTable>

                  {index === 0 && <RenderRow label={t(`CLU_OWNER_TYPE_LABEL`)} value={applicant?.additionalDetails?.aplicantType?.name} />}
                  {applicant?.additionalDetails?.aplicantType?.code === "FIRM" && (
                    <RenderRow label={t(`NEW_LAYOUT_FIRM_NAME_LABEL`)} value={applicant?.additionalDetails?.authorisedPerson} />
                  )}
                  <RenderRow
                    label={`${applicant?.additionalDetails?.aplicantType?.code === "FIRM" ? t("NEW_LAYOUT_FIRM_OWNER_NAME_LABEL") : t("APPLICANT_NAME")
                      }`}
                    value={applicant?.name}
                  />
                  <RenderRow label={t("NOC_APPLICANT_EMAIL_LABEL")} value={applicant?.emailId} />
                  <RenderRow label={t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL")} value={applicant?.fatherOrHusbandName} />
                  <RenderRow label={t("NOC_APPLICANT_MOBILE_NO_LABEL")} value={applicant?.mobileNumber} />
                  <RenderRow label={t("NOC_APPLICANT_DOB_LABEL")} value={formatDate(applicant?.dob)} />
                  <RenderRow label={t("NOC_APPLICANT_GENDER_LABEL")} value={applicant?.gender} />
                  <RenderRow label={t("NOC_APPLICANT_ADDRESS_LABEL")} value={applicant?.permanentAddress} />
                  <RenderRow label={t("BPA_PAN_NUMBER_LABEL")} value={applicant?.pan || applicant?.panNumber || "N/A"} />
                  <Row className="document-row"
                    label={t("BPA_APPLICANT_PASSPORT_PHOTO") || "Photo"}
                    text={<DocumentLink fileStoreId={findOwnerDocument(index, "OWNERPHOTO")} stateCode={stateCode} t={t} />}
                  />
                  <Row className="document-row"
                    label={t("BPA_APPLICANT_ID_PROOF") || "ID Proof"}
                    text={<DocumentLink fileStoreId={findOwnerDocument(index, "OWNERVALIDID")} stateCode={stateCode} t={t} />}
                  />
                  <Row className="document-row"
                    label={t("BPA_PAN_DOCUMENT") || "Pan"}
                    text={<DocumentLink fileStoreId={findOwnerDocument(index, "OWNERPAN")} stateCode={stateCode} t={t} />}
                  />
                </StatusTable>
             
            </Card>
          </React.Fragment>
        ))}

      {/* -------------------- SITE DETAILS -------------------- */}
      <Card>
        <CardSubHeader>{t("LAYOUT_SITE_DETAILS")}</CardSubHeader>
        {displayData?.siteDetails?.map((detail, index) => (
     
            <StatusTable key={index}>
              {renderLabel(t("BPA_IS_CLU_REQUIRED_LABEL"), detail?.isCluRequired?.code || detail?.isCluRequired)}
              {(detail?.isCluRequired?.code === "NO" || detail?.isCluRequired === "NO") && (
                <React.Fragment>
                  {renderLabel(t("BPA_CLU_TYPE_LABEL"), detail?.cluType?.code || detail?.cluType)}
                  {(detail?.cluType?.code === "ONLINE" || detail?.cluType === "ONLINE") && renderLabel(t("BPA_CLU_NUMBER_LABEL"), detail?.cluNumber)}
                  {(detail?.cluType?.code === "OFFLINE" || detail?.cluType === "OFFLINE") && renderLabel(t("BPA_CLU_NUMBER_OFFLINE_LABEL"), detail?.cluNumberOffline)}
                  {(Boolean(detail?.cluDocumentUpload) || detail?.cluType?.code === "ONLINE" || detail?.cluType === "ONLINE") && (
                    <Row className="document-row"
                      label={t("BPA_CLU_DOCUMENT_LABEL") || t("CLU Document")}
                      text={
                        <DocumentLink
                          fileStoreId={
                            typeof detail?.cluDocumentUpload === "string"
                              ? detail?.cluDocumentUpload
                              : (detail?.cluDocumentUpload?.fileStoreId || detail?.cluDocumentUpload?.filestoreId || detail?.cluDocumentUpload?.uuid)
                          }
                          cluNumber={detail?.cluNumber}
                          stateCode={stateCode}
                          t={t}
                        />
                      }
                    />
                  )}
                  {renderLabel(t("BPA_CLU_APPROVAL_DATE_LABEL"), formatDate(detail?.cluApprovalDate))}
                </React.Fragment>
              )}
              {/* {(detail?.isCluRequired?.code === "YES" || detail?.isCluRequired === "YES") && ( */}
                <React.Fragment>
                  {renderLabel(t("Application Applied Under"), detail?.applicationAppliedUnder?.name || detail?.applicationAppliedUnder?.code || detail?.applicationAppliedUnder)}
                </React.Fragment>
              {/* )} */}
              {renderLabel(t("Type Of Application"), detail?.typeOfApplication?.name)}

              {/* <CardLabel style={{...boldLabelStyle, paddingLeft: "18px", fontSize: "20px"}}>{t("BPA_LOCATION_LABEL")}</CardLabel> */}
              {renderLabel(t("BPA_PROPOSED_SITE_ADDRESS"), detail?.proposedSiteAddress)}
              {renderLabel(t("BPA_ULB_NAME_LABEL"), detail?.ulbName || detail?.ulbName?.name)}
              {renderLabel(t("BPA_ULB_TYPE_LABEL"), detail?.ulbType)}
              {renderLabel(t("BPA_DISTRICT_LABEL"), detail?.district?.name)}
              {renderLabel(t("BPA_ZONE_LABEL"), detail?.zone?.name)}
              {renderLabel(t("BPA_SITE_VILLAGE_NAME_LABEL"), detail?.villageName)}
              {renderLabel(t("BPA_SITE_WARD_NO_LABEL"), detail?.wardNo)}
              {renderLabel(t("Khatuni No."), detail?.khanutiNo)}
              {renderLabel(t("BPA_KHASRA_NO_LABEL"), detail?.khasraNo)}
              {renderLabel(t("BPA_HADBAST_NO_LABEL"), detail?.hadbastNo)}
              {renderLabel(t("BPA_VASIKA_NUMBER_LABEL"), detail?.vasikaNumber)}
              {renderLabel(t("BPA_VASIKA_DATE_LABEL"), formatDate(detail?.vasikaDate))}
              {renderLabel(t("BPA_ROAD_TYPE_LABEL"), detail?.roadType?.name)}
              {renderLabel(t("BPA_IS_AREA_UNDER_MASTER_PLAN_LABEL"), detail?.isAreaUnderMasterPlan?.i18nKey)}
              
              
              {/* {renderLabel(t("BPA_BUILDING_CATEGORY_LABEL"), detail?.buildingCategory?.name)} */}
              
              {/* {renderLabel(t("BPA_PLOT_NO_LABEL"), detail?.plotNo)} */}

              {/* <CardLabel style={{...boldLabelStyle, paddingLeft: "18px", fontSize: "20px"}}>{t("BPA_AREA_DISTRIBUTION_LABEL")}</CardLabel> */}
              {renderLabel(t("BPA_TOTAL_AREA_UNDER_LAYOUT_IN_SQ_M_LABEL"), detail?.areaLeftForRoadWidening)}
              {renderLabel(t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"), detail?.netPlotAreaAfterWidening)}
              {renderLabel(t("BPA_BALANCE_AREA_IN_SQ_M_LABEL"), parseFloat(detail?.areaLeftForRoadWidening - detail?.netPlotAreaAfterWidening))}
              {renderLabel(t("BPA_AREA_UNDER_EWS_IN_SQ_M_LABEL"), detail?.areaUnderEWS)}
              {renderLabel(t("BPA_AREA_UNDER_EWS_IN_PCT_LABEL"), detail?.areaUnderEWSInPct)}
              {renderLabel(t("BPA_NET_SITE_AREA_IN_SQ_M_LABEL"), detail?.netTotalArea)}
              {renderLabel(t("BPA_ROAD_WIDTH_AT_SITE_LABEL"), detail?.roadWidthAtSite)}
              {renderLabel(t("BPA_BUILDING_CATEGORY_LABEL"), detail?.buildingCategory?.name)}
              {renderLabel(t("BPA_BUILDING_CATEGORY_LABEL_TYPE"), detail?.residentialType?.name || detail?.buildingCategory?.name)}
              {renderLabel(t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_SQ_M_LABEL"), detail?.areaUnderResidentialUseInSqM)}
              {renderLabel(t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_PCT_LABEL"), detail?.areaUnderResidentialUseInPct)}
              {renderLabel(t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_SQ_M_LABEL"), detail?.areaUnderCommercialUseInSqM)}
              {renderLabel(t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_PCT_LABEL"), detail?.areaUnderCommercialUseInPct)}
              {detail?.buildingCategory?.name
                ?.toLowerCase()
                .includes("industrial")
                ? (
                  <React.Fragment>
                    {renderLabel(t("BPA_AREA_UNDER_INDUSTRIAL_USE_IN_SQ_M_LABEL"), detail?.areaUnderIndustrialUseInSqM)}
                    {renderLabel(t("BPA_AREA_UNDER_INDUSTRIAL_USE_IN_PCT_LABEL"), detail?.areaUnderIndustrialUseInPct)}
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    {renderLabel(t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_SQ_M_LABEL"), detail?.areaUnderInstutionalUseInSqM)}
                    {renderLabel(t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_PCT_LABEL"), detail?.areaUnderInstutionalUseInPct)}
                  </React.Fragment>
                )}
              {renderLabel(t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_SQ_M_LABEL"), detail?.areaUnderCommunityCenterInSqM)}
              {renderLabel(t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_PCT_LABEL"), detail?.areaUnderCommunityCenterInPct)}
              {renderLabel(t("BPA_AREA_UNDER_PARK_IN_SQ_M_LABEL"), detail?.areaUnderParkInSqM)}
              {renderLabel(t("BPA_AREA_UNDER_PARK_IN_PCT_LABEL"), detail?.areaUnderParkInPct)}
              {renderLabel(t("BPA_AREA_UNDER_ROAD_IN_SQ_M_LABEL"), detail?.areaUnderRoadInSqM)}
              {renderLabel(t("BPA_AREA_UNDER_ROAD_IN_PCT_LABEL"), detail?.areaUnderRoadInPct)}
              {renderLabel(t("BPA_AREA_UNDER_PARKING_IN_SQ_M_LABEL"), detail?.areaUnderParkingInSqM)}
              {renderLabel(t("BPA_AREA_UNDER_PARKING_IN_PCT_LABEL"), detail?.areaUnderParkingInPct)}
              {renderLabel(t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_SQ_M_LABEL"), detail?.areaUnderOtherAmenitiesInSqM)}
              {renderLabel(t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_PCT_LABEL"), detail?.areaUnderOtherAmenitiesInPct)}

              {/* {renderLabel(t("BPA_BUILDING_STATUS_LABEL"), detail?.buildingStatus?.name || detail?.buildingStatus?.code)} */}
            </StatusTable>
          
        ))}
      </Card>

      {/* -------------------- SPECIFICATIONS -------------------- */}
      <Card>
        <CardSubHeader>{t("LAYOUT_SPECIFICATION_DETAILS")}</CardSubHeader>
        {displayData?.siteDetails?.map((detail, index) => (
         
            <StatusTable key={index}>
              <RenderRow label={t("LAYOUT_PLOT_AREA_JAMA_BANDI_LABEL")} value={detail?.specificationPlotArea} />
              {/* <RenderRow
                label={t("NOC_BUILDING_CATEGORY_LABEL")}
                value={detail?.specificationBuildingCategory?.name || detail?.specificationBuildingCategory}
              />
              <RenderRow label={t("LAYOUT_TYPE_LABEL")} value={detail?.specificationLayoutType?.name || detail?.specificationLayoutType} />
              <RenderRow
                label={t("NOC_RESTRICTED_AREA_LABEL")}
                value={detail?.specificationRestrictedArea?.code || detail?.specificationRestrictedArea}
              />
              <RenderRow
                label={t("NOC_IS_SITE_UNDER_MASTER_PLAN_LABEL")}
                value={detail?.specificationIsSiteUnderMasterPlan?.code || detail?.specificationIsSiteUnderMasterPlan}
              /> */}
            </StatusTable>
          
        ))}
      </Card>

      {/* 1️⃣ SITE COORDINATES CARD */}
      {/* {displayData?.coordinates && displayData.coordinates.length > 0 && (
        <Card>
          <CardSubHeader>{t("LAYOUT_SITE_COORDINATES_LABEL")}</CardSubHeader>

          {displayData.coordinates.map((detail, index) => (
            <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
              <StatusTable>
                <RenderRow label={t("COMMON_LATITUDE1_LABEL")} value={detail?.Latitude1} />
                <RenderRow label={t("COMMON_LONGITUDE1_LABEL")} value={detail?.Longitude1} />
                <RenderRow label={t("COMMON_LATITUDE2_LABEL")} value={detail?.Latitude2} />
                <RenderRow label={t("COMMON_LONGITUDE2_LABEL")} value={detail?.Longitude2} />
                <RenderRow label={t("COMMON_LATITUDE3_LABEL")} value={detail?.Latitude3} />
                <RenderRow label={t("COMMON_LONGITUDE3_LABEL")} value={detail?.Longitude3} />
                <RenderRow label={t("COMMON_LATITUDE4_LABEL")} value={detail?.Latitude4} />
                <RenderRow label={t("COMMON_LONGITUDE4_LABEL")} value={detail?.Longitude4} />
              </StatusTable>
            </div>
          ))}
        </Card>
      )} */}

      {/* SITE PHOTOGRAPHS */}
      <Card>
        <CardSubHeader>{t("BPA_UPLOADED_SITE_PHOTOGRAPHS_LABEL")}</CardSubHeader>
        <StatusTable
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {sitePhotos?.length > 0 &&
            [...sitePhotos]
              .map((doc) => (
                <LayoutSitePhotographs
                  key={doc?.filestoreId || doc?.uuid}
                  filestoreId={doc?.filestoreId || doc?.uuid}
                  documentType={doc?.documentType}
                  coordinates={coordinates}
                />
              ))}
        </StatusTable>
      </Card>



      {/* FIELD INSPECTION UPLOAD SECTION - Allow JE/BI to upload site photographs (mobile-only capture enforced in ChallanDocuments) */}
      {applicationDetails?.Layout?.[0]?.applicationStatus === "FIELDINSPECTION_INPROGRESS" && hasRole && (
        <Card>
          <div id="fieldInspection"></div>
          <SiteInspection siteImages={siteImages} setSiteImages={setSiteImages} geoLocations={geoLocations} customOpen={routeToImage} />
        </Card>
      )}

      {/* FIELD INSPECTION UPLOADED DOCUMENTS - Display when not in progress */}
      {applicationDetails?.Layout?.[0]?.applicationStatus !== "FIELDINSPECTION_INPROGRESS" && siteImages?.documents?.length > 0 && (
        <Card>
           <CardSubHeader>{empName ? `FIELD INSPECTION SITE PHOTOGRAPHS UPLOADED BY ${empName} - ${empDesignation}` : t("SITE_INPECTION_IMAGES")}</CardSubHeader>
          <StatusTable
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {documentData?.length > 0 &&
              documentData.map((doc) => (
                <LayoutSitePhotographs
                  key={doc?.fileStoreId || doc?.uuid}
                  filestoreId={doc?.fileStoreId || doc?.uuid}
                  documentType={doc?.title}
                  coordinates={{
                    latitude: doc?.latitude,
                    longitude: doc?.longitude,
                  }}
                />
              ))}
          </StatusTable>

          {applicationDetails?.Layout?.[0]?.applicationStatus !== "FIELDINSPECTION_INPROGRESS" && geoLocations?.length > 0 && (
            <Fragment>
              <CardSubHeader >{t("SITE_INSPECTION_IMAGES_LOCATIONS")}</CardSubHeader>
              <CustomLocationSearch position={geoLocations} />
            </Fragment>
          )}
        </Card>
      )}

      {/* INSPECTION REPORT SECTION */}
      {applicationDetails?.Layout?.[0]?.applicationStatus === "INSPECTION_REPORT_PENDING" && hasRole && (
        <Card>
          <div id="fieldInspection"></div>
          <InspectionReport
            isCitizen={true}
            fiReport={applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.fieldinspection_pending || []}
            onSelect={onChangeReport}
            applicationStatus={applicationDetails?.Layout?.[0]?.applicationStatus}
          />
        </Card>
      )}

      {/* INSPECTION REPORT DISPLAY SECTION */}
      {applicationDetails?.Layout?.[0]?.applicationStatus !== "INSPECTION_REPORT_PENDING" &&
        applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.fieldinspection_pending?.length > 0 && (
          <Card>
          <CardSubHeader>
            {empName
              ? `${t("BPA_FI_REPORT")} VERIFIED BY ${empName} - ${empDesignation}`
              : t("BPA_FI_REPORT")}
          </CardSubHeader>
            <InspectionReportDisplay fiReport={applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.fieldinspection_pending} />
          </Card>
        )}



      {/* Documents Uploaded - Read Only when NOT in DOCUMENTVERIFY_DM */}
      {applicationDetails?.Layout?.[0]?.applicationStatus !== "DOCUMENTVERIFY_DM" && (
        <Card>
          <CardSubHeader>{t("BPA_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
          <StatusTable>
            {remainingDocs?.length > 0 && (
              <LayoutDocumentChecklist
                documents={remainingDocs}
                applicationNo={id}
                tenantId={tenantId}
                onRemarksChange={setChecklistRemarks}
                value={checklistRemarks}
                readOnly="true"
                applicationStatus={applicationDetails?.Layout?.[0]?.applicationStatus}
              />
            )}
          </StatusTable>
        </Card>
      )}

      {/* Documents Uploaded - Editable ONLY for DM role when in DOCUMENTVERIFY_DM */}
      {applicationDetails?.Layout?.[0]?.applicationStatus === "DOCUMENTVERIFY_DM" &&
        user?.info?.roles.filter((role) => role.code === "OBPAS_LAYOUT_DM")?.length > 0 && (
          <Card>
            <CardSubHeader>{t("BPA_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
            <StatusTable>
              {remainingDocs?.length > 0 && (
                <LayoutDocumentChecklist
                  documents={remainingDocs}
                  applicationNo={id}
                  tenantId={tenantId}
                  onRemarksChange={setChecklistRemarks}
                  value={checklistRemarks}
                  applicationStatus={applicationDetails?.Layout?.[0]?.applicationStatus}
                />
              )}
            </StatusTable>
          </Card>
        )}



      {/* FEE DETAILS CARD - CLU STYLE PART 1 */}
      <Card>
        <CardSubHeader>{t("BPA_FEE_DETAILS_LABEL")}</CardSubHeader>
        {applicationDetails?.Layout?.[0]?.layoutDetails && (
          <LayoutFeeEstimationDetails
            formData={{
              apiData: { ...applicationDetails },
              applicationDetails: { ...applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.applicationDetails },
              siteDetails: { ...applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails },
              calculations: applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.calculations || [],
            }}
            feeType="PAY1"
            disable={isFeeDisabled}
            hasPayments={hasPayments}
          />
        )}
         {hasPayments && (
                  <div style={{ marginTop: "16px" }}>
                    <OBPSPaymentHistory payments={combinedPayments} />
                  </div>
                )}

      </Card>

      {/* FEE DETAILS TABLE CARD - CLU STYLE PART 2 */}
      {(applicationDetails?.Layout?.[0]?.applicationStatus !== "FIELDINSPECTION_INPROGRESS") && (
        <Card>
          <CardSubHeader>{t("BPA_FEE_DETAILS_TABLE_LABEL")}</CardSubHeader>
          {applicationDetails?.Layout?.[0]?.layoutDetails && (
            <LayoutFeeEstimationDetailsTable
              formData={{
                apiData: { ...applicationDetails },
                applicationDetails: { ...applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.applicationDetails },
                siteDetails: { ...applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails },
                calculations: applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.calculations || [],
              }}
              feeType="PAY2"
              feeAdjustments={feeAdjustments}
              setFeeAdjustments={setFeeAdjustments}
              disable={isFeeDisabled}
            />
          )}
        </Card>
      )}

      {/* {siteImages?.documents?.length > 0 && (
        <Card>
          <CardSubHeader>{t("SITE_INPECTION_IMAGES")}</CardSubHeader>
          <StatusTable
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {siteImages?.documents?.length > 0 &&
              [...siteImages.documents].reverse().map((doc) => (
                <LayoutSitePhotographs
                  key={doc?.filestoreId || doc?.uuid}
                  filestoreId={doc?.filestoreId || doc?.uuid}
                  documentType={doc?.documentType}
                  coordinates={{
                    latitude: doc?.latitude,
                    longitude: doc?.longitude,
                  }}
                />
              ))}
          </StatusTable>
        </Card>
      )} */}

      <CheckBox
        label={`I/We hereby solemnly affirm and declare that I am submitting this application on behalf of the applicant( ${getApplicantNamesForDeclaration()} ). I/We along with the applicant have read the Policy and understand all the terms and conditions of the Policy. We are committed to fulfill/abide by all the terms and conditions of the Policy. The information/documents submitted are true and correct as per record and no part of it is false and nothing has been concealed/misrepresented therein.`}
        checked="true"
      />
      <div id="timeline">
              {/* <NewApplicationTimeline workflowDetails={workflowDetails} t={t} empUserName={empUserName} handleSetEmpDesignation={handleSetEmpDesignation}/> */}
              <NewApplicationTimeline
                workflowDetails={workflowDetails}
                prefix= {prefix}
                t={t}
                timeObj={timeObj}
                Statusprefix ={Statusprefix} 
                empUserName={empUserName}
                handleSetEmpDesignation={handleSetEmpDesignation}
              />
            </div>
     
      {actions?.length > 0 && (
        <ActionBar>
          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu localeKeyPrefix={prefix} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
          ) : null}
          <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
        </ActionBar>
      )}

      {showModal ? (
        <div>
          <LayoutModal
            t={t}
            action={selectedAction}
            tenantId={tenantId}
            state={state}
            businessService= {businessService}
            getEmployees={getEmployees}
            id={id}
            applicationDetails={applicationDetails}
            applicationData={applicationDetails?.Layout}
            closeModal={closeModal}
            submitAction={submitAction}
            actionData={workflowDetails?.data?.timeline}
            workflowDetails={workflowDetails}
            showToast={showToast}
            setShowToast={setShowToast}
            closeToast={closeToast}
            errors={error}
            showErrorToast={showErrorToast}
            errorOne={errorOne}
            closeToastOne={closeToastOne}
            isSubmitting={isSubmitting}
          />
          <p>{t("LAYOUT_MODAL_PLACEHOLDER")}</p>
        </div>
      ) : null}

      {showToast && (
        <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />
      )}

      {showZoneModal && <ZoneModal onClose={() => setShowZoneModal(false)} onSelect={handleZoneSubmit} currentZoneCode={currentZoneCode} />}

      {showPdfModal && (
        <PdfPreviewModal
          open={showPdfModal}
          url={pdfUrl}
          onClose={() => {
            setShowPdfModal(false);
            setPdfUrl(null);
          }}
          title={t("LETTER_OF_INTENT")}
        >
          <ActionBar>
            <SubmitBar label={t("ESIGN")} onSubmit={printCertificateWithESign} disabled={eSignLoading} />
          </ActionBar>
        </PdfPreviewModal>
      )}

      {/* {(isLoading || getLoader) && <Loader page={true} />} */}
      {(isLoading || isDetailsLoading || getLoader || recieptDataLoading1 || recieptDataLoading2) && <Loader page={true} />}
    </div>
  );
};

export default LayoutEmployeeApplicationOverview;
