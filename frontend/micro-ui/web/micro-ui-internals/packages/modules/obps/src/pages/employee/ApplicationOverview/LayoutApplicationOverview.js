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
import { SiteInspection } from "../../../../../noc/src/pageComponents/SiteInspection";
import CustomLocationSearch from "../../../components/CustomLocationSearch";
import ZoneModal from "../../../components/ZoneModal";
import CustomOwnerImage from "../../../components/CustomOwnerImage";

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

const DocumentLink = ({ fileStoreId, stateCode, t, label }) => {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const fetchUrl = async () => {
      if (fileStoreId) {
        try {
          const result = await Digit.UploadServices.Filefetch([fileStoreId], stateCode);
          if (result?.data?.fileStoreIds?.[0]?.url) {
            setUrl(result.data.fileStoreIds[0].url);
          }
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      }
    };
    fetchUrl();
  }, [fileStoreId, stateCode]);

  if (!url) return <span>{t("CS_NA") || "NA"}</span>;

  return <LinkButton label={t("View") || "View"} onClick={() => window.open(url, "_blank")} />;
};

const LayoutEmployeeApplicationOverview = () => {
  const { id } = useParams();
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

  const { isLoading, data } = Digit.Hooks.obps.useLayoutSearchApplication({ applicationNo: id }, tenantId, {
    cacheTime: 0,
  });
  const applicationDetails = data?.resData;
  //console.log("applicationDetails here==>", applicationDetails, checklistRemarks);
  const currentZoneCode = applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails?.zone?.code;

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

  //console.log("workflowDetails here=>", workflowDetails);
  //console.log("next employee ======>", data, applicationDetails, applicationDetails?.businessService);

  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

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
      const owners = layoutObject?.owners || [];
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
  ).sort((a,b) => a?.order - b?.order);
  const remainingDocs = displayData?.Documents?.sort((a,b) => a?.order - b?.order)?.filter(
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

  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "layout",
      consumerCodes: id,
      isEmployee: true,
    },
    { enabled: id ? true : false }
  );

  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  const handleDownloadPdf = async () => {
    const Property = applicationDetails?.Layout?.[0];
    const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
    const acknowledgementData = await getLayoutAcknowledgementData(Property, tenantInfo, t);
    Digit.Utils.pdf.generate(acknowledgementData);
  };

  async function getRecieptSearch({ tenantId, payments, ...params }) {
    let response = { filestoreIds: [payments?.fileStoreId] };
    response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments }] }, "layout-receipt");
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");
  }

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
  if (applicationDetails?.Layout?.[0]?.applicationStatus === "APPROVED") {
    dowloadOptions.push({
      label: t("DOWNLOAD_CERTIFICATE"),
      onClick: handleDownloadPdf,
    });

    if (reciept_data && reciept_data?.Payments.length > 0 && !recieptDataLoading) {
      dowloadOptions.push({
        label: t("CHB_FEE_RECEIPT"),
        onClick: () => getRecieptSearch({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
      });
    }
  }

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

      if(filtData?.action === "SEND_FOR_INSPECTION_REPORT"){
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
        if (filtData?.action === "CANCEL") {
          setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" });
          workflowDetails.revalidate();
          setSelectedAction(null);
          setShowModal(false);
        } else if (
          filtData?.action === "APPLY" ||
          filtData?.action === "APPROVE" ||
          filtData?.action === "RESUBMIT" ||
          filtData?.action === "DRAFT" ||
          filtData?.action === "FORWARD_L1" ||
          filtData?.action === "FORWARD_L2" ||
          filtData?.action === "FORWARD_L3" ||
          filtData?.action === "FORWARD_L4" ||
          filtData?.action === "FORWARD_L5" ||
          filtData?.action === "FORWARD_L6" ||
          filtData?.action === "FORWARD_L7" ||
          filtData?.action === "SENDBACKTOPROFESSIONAL"
        ) {
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
    } else if (action?.action == "UPDATE_ZONE") {
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
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

  const convertDateToISO = (dateStr) => {
    if (!dateStr) return "";

    const parts = dateStr.split("-");

    // yyyy-mm-dd (already ISO)
    if (parts[2].length === 4) {
      return dateStr;
    }

    // dd-mm-yyyy → yyyy-mm-dd
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
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

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={"employee-main-application-details"}>
      <CustomOwnerImage ownerFileStoreId={displayData?.owners?.[0]?.additionalDetails?.ownerPhoto} ownerName={displayData?.owners?.[0]?.name} />
      <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
        <Header styles={{ fontSize: "32px" }}>{t("LAYOUT_APP_OVER_VIEW_HEADER")}</Header>
        <LinkButton label={t("VIEW_TIMELINE")} style={{ color: "#A52A2A" }} onClick={handleViewTimeline} />
        {dowloadOptions && dowloadOptions.length > 0 && (
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

      <Card>
        <CardSubHeader>{t("LAYOUT_APPLICANT_DETAILS")}</CardSubHeader>
        <StatusTable>
          <Row label={t("Application Number")} text={applicationDetails?.Layout?.[0]?.applicationNo || "N/A"} />
        </StatusTable>
      </Card>

      {/* -------------------- PROFESSIONAL DETAILS -------------------- */}

      {displayData?.applicantDetails?.[0]?.professionalName && (
        <Card>
          <CardSubHeader>{t("LAYOUT_PROFESSIONAL_DETAILS")}</CardSubHeader>
          <div style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("NOC_PROFESSIONAL_NAME_LABEL")} text={displayData?.applicantDetails?.[0]?.professionalName || "N/A"} />
              <Row label={t("NOC_PROFESSIONAL_EMAIL_LABEL")} text={displayData?.applicantDetails?.[0]?.professionalEmailId || "N/A"} />
              <Row label={t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL")} text={displayData?.applicantDetails?.[0]?.professionalRegId || "N/A"} />
              <Row label={t("NOC_PROFESSIONAL_MOBILE_NO_LABEL")} text={displayData?.applicantDetails?.[0]?.professionalMobileNumber || "N/A"} />
              <Row label={t("NOC_PROFESSIONAL_ADDRESS_LABEL")} text={displayData?.applicantDetails?.[0]?.professionalAddress || "N/A"} />
              <Row
                label={t("BPA_CERTIFICATE_EXPIRY_DATE")}
                text={formatDate(displayData?.applicantDetails?.[0]?.professionalRegistrationValidity || "N/A")}
              />
            </StatusTable>
          </div>
        </Card>
      )}

      {/* -------------------- OWNERS / APPLICANTS DETAILS -------------------- */}
      {displayData?.owners &&
        displayData?.owners.length > 0 &&
        displayData?.owners?.map((applicant, index) => (
          <React.Fragment key={index}>
            <Card>
              <CardSubHeader>{index === 0 ? t("NOC_PRIMARY_OWNER") : `OWNER ${index + 1}`}</CardSubHeader>
              <div style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
                <StatusTable>
                  <Row
                    label={`${index === 0 ? t("PRIMARY_OWNER") || "Primary Owner" : t("ADDITIONAL_OWNER") || "Additional Owner"} - ${
                      applicant?.additionalDetails?.aplicantType?.code === "FIRM" ? t("NEW_LAYOUT_FIRM_OWNER_NAME_LABEL") : t("APPLICANT_NAME")
                    }`}
                    text={applicant?.name}
                  />
                  {index === 0 && <Row label={t(`CLU_OWNER_TYPE_LABEL`)} text={applicant?.additionalDetails?.aplicantType?.name} />}
                  {applicant?.additionalDetails?.aplicantType?.code === "FIRM" && (
                    <Row label={t(`NEW_LAYOUT_FIRM_NAME_LABEL`)} text={applicant?.additionalDetails?.authorisedPerson} />
                  )}
                  <Row label={t("NOC_APPLICANT_EMAIL_LABEL")} text={applicant?.emailId} />
                  <Row label={t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL")} text={applicant?.fatherOrHusbandName} />
                  <Row label={t("NOC_APPLICANT_MOBILE_NO_LABEL")} text={applicant?.mobileNumber} />
                  <Row label={t("NOC_APPLICANT_DOB_LABEL")} text={applicant?.dob ? new Date(applicant?.dob).toLocaleDateString() : ""} />
                  <Row label={t("NOC_APPLICANT_GENDER_LABEL")} text={applicant?.gender} />
                  <Row label={t("NOC_APPLICANT_ADDRESS_LABEL")} text={applicant?.permanentAddress} />
                  <Row label={t("BPA_PAN_NUMBER_LABEL")} text={applicant?.pan || "N/A"} />
                  <Row
                    label={t("BPA_APPLICANT_PASSPORT_PHOTO") || "Photo"}
                    text={<DocumentLink fileStoreId={findOwnerDocument(index, "OWNERPHOTO")} stateCode={stateCode} t={t} />}
                  />
                  <Row
                    label={t("BPA_APPLICANT_ID_PROOF") || "ID Proof"}
                    text={<DocumentLink fileStoreId={findOwnerDocument(index, "OWNERVALIDID")} stateCode={stateCode} t={t} />}
                  />
                  <Row
                    label={t("Pan") || "Pan"}
                    text={<DocumentLink fileStoreId={findOwnerDocument(index, "OWNERPAN")} stateCode={stateCode} t={t} />}
                  />
                </StatusTable>
              </div>
            </Card>
          </React.Fragment>
        ))}

      {/* -------------------- SITE DETAILS -------------------- */}
      <Card>
        <CardSubHeader>{t("LAYOUT_SITE_DETAILS")}</CardSubHeader>
        {displayData?.siteDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              {renderLabel(t("BPA_IS_CLU_REQUIRED_LABEL"), detail?.isCluRequired?.code || detail?.isCluRequired)}
              {(detail?.isCluRequired?.code === "NO" || detail?.isCluRequired === "NO") && (
                <React.Fragment>
                  {renderLabel(t("BPA_CLU_TYPE_LABEL"), detail?.cluType?.code || detail?.cluType)}
                  {(detail?.cluType?.code === "ONLINE" || detail?.cluType === "ONLINE") && renderLabel(t("BPA_CLU_NUMBER_LABEL"), detail?.cluNumber)}
                  {(detail?.cluType?.code === "OFFLINE" || detail?.cluType === "OFFLINE") &&
                    renderLabel(t("BPA_CLU_NUMBER_OFFLINE_LABEL"), detail?.cluNumberOffline)}
                  {renderLabel(t("BPA_CLU_APPROVAL_DATE_LABEL"), convertDateToISO(detail?.cluApprovalDate))}
                </React.Fragment>
              )}
              {(detail?.isCluRequired?.code === "YES" || detail?.isCluRequired === "YES") && (
                <React.Fragment>
                  {renderLabel(t("Application Applied Under"), detail?.applicationAppliedUnder?.code || detail?.applicationAppliedUnder)}
                </React.Fragment>
              )}
              {renderLabel(t("Type Of Application"), detail?.typeOfApplication?.name)}

              {/* <CardLabel style={{...boldLabelStyle, paddingLeft: "18px", fontSize: "20px"}}>{t("BPA_LOCATION_LABEL")}</CardLabel> */}
              {renderLabel(t("BPA_PROPOSED_SITE_ADDRESS"), detail?.proposedSiteAddress)}
              {renderLabel(t("BPA_SITE_WARD_NO_LABEL"), detail?.wardNo)}
              {renderLabel(t("BPA_KHASRA_NO_LABEL"), detail?.khasraNo)}
              {renderLabel(t("Khatuni No."), detail?.khanutiNo)}
              {renderLabel(t("BPA_HADBAST_NO_LABEL"), detail?.hadbastNo)}
              {renderLabel(t("BPA_SITE_VILLAGE_NAME_LABEL"), detail?.villageName)}
              {renderLabel(t("BPA_VASIKA_NUMBER_LABEL"), detail?.vasikaNumber)}
              {renderLabel(t("BPA_VASIKA_DATE_LABEL"), convertDateToISO(detail?.vasikaDate))}
              {renderLabel(t("BPA_ROAD_TYPE_LABEL"), detail?.roadType?.name)}
              {renderLabel(t("BPA_NET_TOTAL_AREA_LABEL"), detail?.areaLeftForRoadWidening)}
              {renderLabel(t("BPA_IS_AREA_UNDER_MASTER_PLAN_LABEL"), detail?.isAreaUnderMasterPlan?.i18nKey)}
              {renderLabel(t("BPA_ZONE_LABEL"), detail?.zone?.name)}
              {renderLabel(t("BPA_ULB_NAME_LABEL"), detail?.ulbName?.name)}
              {renderLabel(t("BPA_DISTRICT_LABEL"), detail?.district?.name)}
              {/* {renderLabel(t("BPA_BUILDING_CATEGORY_LABEL"), detail?.buildingCategory?.name)} */}
              {renderLabel(t("BPA_ULB_TYPE_LABEL"), detail?.ulbType)}
              {renderLabel(t("BPA_PLOT_NO_LABEL"), detail?.plotNo)}

              {/* <CardLabel style={{...boldLabelStyle, paddingLeft: "18px", fontSize: "20px"}}>{t("BPA_AREA_DISTRIBUTION_LABEL")}</CardLabel> */}
              {renderLabel(t("BPA_BUILDING_CATEGORY_LABEL"), detail?.buildingCategory?.name)}
              {renderLabel(t("BPA_BUILDING_CATEGORY_LABEL_TYPE"), detail?.residentialType?.name || detail?.buildingCategory?.name)}
              {renderLabel(t("BPA_NET_TOTAL_AREA_LABEL"), detail?.areaLeftForRoadWidening)}
              {renderLabel(t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"), detail?.netPlotAreaAfterWidening)}
              {renderLabel(t("BPA_BALANCE_AREA_IN_SQ_M_LABEL"), parseFloat(detail?.areaLeftForRoadWidening - detail?.netPlotAreaAfterWidening))}
              {renderLabel(t("BPA_AREA_UNDER_EWS_IN_SQ_M_LABEL"), detail?.areaUnderEWS)}
              {renderLabel(t("BPA_AREA_UNDER_EWS_IN_PCT_LABEL"), detail?.areaUnderEWSInPct)}
              {renderLabel(t("BPA_NET_SITE_AREA_IN_SQ_M_LABEL"), detail?.netTotalArea)}
              {renderLabel(t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_SQ_M_LABEL"), detail?.areaUnderResidentialUseInSqM)}
              {renderLabel(t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_PCT_LABEL"), detail?.areaUnderResidentialUseInPct)}
              {renderLabel(t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_SQ_M_LABEL"), detail?.areaUnderCommercialUseInSqM)}
              {renderLabel(t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_PCT_LABEL"), detail?.areaUnderCommercialUseInPct)}
              {renderLabel(t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_SQ_M_LABEL"), detail?.areaUnderInstutionalUseInSqM)}
              {renderLabel(t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_PCT_LABEL"), detail?.areaUnderInstutionalUseInPct)}
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

              {renderLabel(t("BPA_ROAD_WIDTH_AT_SITE_LABEL"), detail?.roadWidthAtSite)}
              {renderLabel(t("BPA_BUILDING_STATUS_LABEL"), detail?.buildingStatus?.name || detail?.buildingStatus?.code)}
            </StatusTable>
          </div>
        ))}
      </Card>

      {/* -------------------- SPECIFICATIONS -------------------- */}
      <Card>
        <CardSubHeader>{t("LAYOUT_SPECIFICATION_DETAILS")}</CardSubHeader>
        {displayData?.siteDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <RenderRow label={t("NOC_PLOT_AREA_JAMA_BANDI_LABEL")} value={detail?.specificationPlotArea} />
              <RenderRow
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
              />
            </StatusTable>
          </div>
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
                />
              )}
            </StatusTable>
          </Card>
        )}

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
          <CardSubHeader>{t("BPA_FIELD_INSPECTION_UPLOADED_DOCUMENTS")}</CardSubHeader>
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

          {geoLocations?.length > 0 && (
            <Fragment>
              <CardSectionHeader style={{ marginBottom: "16px", marginTop: "32px" }}>{t("SITE_INSPECTION_IMAGES_LOCATIONS")}</CardSectionHeader>
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
            <div id="fieldInspection"></div>
            <InspectionReportDisplay fiReport={applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.fieldinspection_pending} />
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
          />
        )}
      </Card>

      {/* FEE DETAILS TABLE CARD - CLU STYLE PART 2 */}
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
        label={`I/We hereby solemnly affirm and declare that I am submitting this application on behalf of the applicant ( ${displayData?.owners
          ?.map((applicant) => applicant?.name)
          ?.join(
            ", "
          )} ). I/We along with the applicant have read the Policy and understand all the terms and conditions of the Policy. We are committed to fulfill/abide by all the terms and conditions of the Policy. The information/documents submitted are true and correct as per record and no part of it is false and nothing has been concealed/misrepresented therein.`}
        checked="true"
      />
      <div id="timeline">
        <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />
      </div>
      {actions?.length > 0 && (
        <ActionBar>
          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu localeKeyPrefix={`WF_EMPLOYEE_${"LAYOUT"}`} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
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

      {/* {(isLoading || getLoader) && <Loader page={true} />} */}
      {(isLoading || isDetailsLoading || getLoader) && <Loader page={true} />}
    </div>
  );
};

export default LayoutEmployeeApplicationOverview;
