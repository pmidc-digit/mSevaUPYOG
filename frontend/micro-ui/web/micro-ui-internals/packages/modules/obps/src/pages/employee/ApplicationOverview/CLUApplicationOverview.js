import {
  CardSectionHeader,
  Header,
  MultiUploadWrapper,
  PDFSvg,
  Row,
  StatusTable,
  LabelFieldPair,
  CardLabel,
  Loader,
  Card,
  CardSubHeader,
  ActionBar,
  SubmitBar,
  Menu,
  LinkButton,
  DisplayPhotos,
  Toast,
  ConnectingCheckPoints,
  CheckPoint,
  MultiLink,
  Table,
  Modal,
  CheckBox
} from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useState, useRef, useMemo } from "react";
import { composeInitialProps, useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import CLUDocumentTableView from "../../../pageComponents/CLUDocumentTableView";
import CLUFeeEstimationDetails from "../../../pageComponents/CLUFeeEstimationDetails";
import CLUDocumentView from "../../../pageComponents/CLUDocumentView";
import { getCLUAcknowledgementData } from "../../../utils/getCLUAcknowledgementData";
import CLUModal from "../../../pageComponents/CLUModal";
import NewApplicationTimeline from "../../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
import CLUImageView from "../../../pageComponents/CLUImgeView";
import { SiteInspection } from "../../../pageComponents/SiteInspection";
import CustomLocationSearch from "../../../components/CustomLocationSearch";
import CLUSitePhotographs from "../../../pageComponents/CLUSitePhotographs";
import CLUFeeEstimationDetailsTable from "../../../pageComponents/CLUFeesEstimationDetailsTable";
import CLUDocumentChecklist from "../../../pageComponents/CLUDocumentCheckList";
import InspectionReport from "../../../pageComponents/InspectionReport";
import InspectionReportDisplay from "../../../pageComponents/InspectionReportDisplay";
import { amountToWords, formatDuration } from "../../../utils";
import PaymentHistory from "../../../../../templates/ApplicationDetails/components/PaymentHistory";
import { getDrivingDistance } from "../../../utils/getDistance";
const getTimelineCaptions = (checkpoint, index, arr, t) => {
  const { wfComment: comment, thumbnailsToShow, wfDocuments } = checkpoint;
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
            let fullImage = thumbnailsToShow.fullImage?.[idx] || src;
            Digit.Utils.zoomImage(fullImage);
          }}
        />
      )}

      {wfDocuments?.length > 0 && (
        <div>
          <div>
            <CLUDocumentView value={{ workflowDocs: wfDocuments }} index={index} />
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

const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className="icon-bg-secondary" onClick={props.onClick}>
      <Close />
    </div>
  );
};

const CLUEmployeeApplicationDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const state = tenantId?.split(".")[0];
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);
  const [checklistRemarks, setChecklistRemarks] = useState({});
 // console.log("checkListRemarks==>", checklistRemarks);
  const [showErrorToast, setShowErrorToastt] = useState(null);
  const [errorOne, setErrorOne] = useState(null);
  const [displayData, setDisplayData] = useState({});

  const [feeAdjustments, setFeeAdjustments] = useState([]);
  const [empDesignation,setEmpDesignation] = useState(null);

  const [getEmployees, setEmployees] = useState([]);
  const [getLoader, setLoader] = useState(false);
  const [getWorkflowService, setWorkflowService] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [timeObj, setTimeObj] = useState(null);
  const isMobile = window?.Digit?.Utils?.browser?.isMobile();
  const { mutate: eSignCertificate, isLoading: eSignLoading, error: eSignError } = Digit.Hooks.tl.useESign();
  const [distances, setDistances] = useState([]);  
  const { isLoading, data } = Digit.Hooks.obps.useCLUSearchApplication({ applicationNo: id }, tenantId);
  const applicationDetails = data?.resData;
  console.log("applicationDetails here===>", applicationDetails);
  const [siteImages, setSiteImages] = useState(applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.siteImages ? {
      documents: applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.siteImages
  } : []);

  const businessServiceCode = applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.siteDetails?.businessService ?? null;
  //console.log("businessService here", businessServiceCode, siteImages);
  
const stateId = Digit.ULBService.getStateId();
  const {  data: feeData } = Digit.Hooks.pt.usePropertyMDMS(stateId, "CLU", ["FeeNotificationChargesRule"]);
  

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: businessServiceCode,//dynamic moduleCode
  });

  console.log("workflowDetails here=>", workflowDetails);

  const { data: searchChecklistData } =  Digit.Hooks.obps.useCLUCheckListSearch({ applicationNo: id }, tenantId);
  const [fieldInspectionPending, setFieldInspectionPending] = useState([]);

  const { data: reciept_data2, isLoading: recieptDataLoading2 } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "CLU.PAY2",
      consumerCodes: id,
      isEmployee: false,
    },
    { enabled: id ? true : false }
  );

  const { data: reciept_data1, isLoading: recieptDataLoading1 } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "CLU.PAY1",
      consumerCodes: id,
      isEmployee: false,
    },
    { enabled: id ? true : false }
  );

  const combinedPayments = useMemo(() => {
    const p1 = reciept_data1?.Payments || [];
    const p2 = reciept_data2?.Payments || [];
    return [...p1, ...p2];
  }, [reciept_data1, reciept_data2]);

  const hasPayments = combinedPayments.length > 0;

  const geoLocations = useMemo(() => {
    if (siteImages?.documents && siteImages?.documents.length > 0) {
      return siteImages?.documents?.map((img) => {
        return {
          latitude: img?.latitude || "",
          longitude: img?.longitude || "",
        }
      })
    }
  }, [siteImages]);

  useEffect(() => {
        if (eSignError) {
          setShowToast({
            key: "true",
            error: true,
            message: "eSign process failed. Please try again.",
          });
        }
      }, [eSignError]);
  
  let approveComments = []
  let approvalDate ,approvalTime= ""
  // Assuming workflowDetails.timeline exists
  if (workflowDetails?.data && !workflowDetails.isLoading) {
    approveComments = workflowDetails?.data?.timeline?.filter((item) => item?.performedAction === "APPROVE")?.flatMap((item) => item?.wfComment || []);
    approvalDate = workflowDetails?.data?.timeline?.find((item) => item?.performedAction === "PAY")?.auditDetails?.lastModified || "";
    approvalTime = workflowDetails?.data?.timeline?.find((item) => item?.performedAction === "PAY")?.auditDetails?.timing || "";

  }

  async function openSanctionLetterPopup() {
  try {
    setLoader(true);

    // Get filestoreId from sanction letter function
    const fileStoreId = await getRecieptSearch({
      tenantId: reciept_data2?.Payments[0]?.tenantId,
      payments: reciept_data2?.Payments[0],
      pdfkey: "clu-sanctionletter",
    });

    if (!fileStoreId) throw new Error("No filestoreId found for sanction letter");

    // Use printReciept to fetch the actual file URL
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });

    // Open in new tab/popup
    window.open(fileStore[fileStoreId], "_blank");

  } catch (error) {
    console.error("Sanction Letter popup error:", error);
  } finally {
    setLoader(false);
  }
}

  async function getRecieptSearch({ tenantId, payments, pdfkey, ...params }) {
      
       try {
        setLoader(true);
          const application = applicationDetails?.Clu;
          const approvecomments = approveComments?.[0];
          const firmName = application?.[0]?.cluDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.firmName
          const owners = application?.[0]?.owners || [];
          let ownersString = "NA";
          if (!firmName) {
            if (owners?.length > 1) {
              ownersString = owners?.map((o, idx) => (o?.name ? o.name : `owner ${idx + 1}`)).join(", ");
            } else if (owners?.length === 1) {
              ownersString = owners[0]?.name || "owner 1";
            }
          } else {
            ownersString = firmName;
          }
          let conditionText = "";
          let fileStoreId = application?.[0]?.cluDetails?.additionalDetails?.sanctionLetterFilestoreId;
          console.log('fileStoreId HERE', fileStoreId)
        if (approvecomments?.includes("[#?..**]")) {
          conditionText = approvecomments.split("[#?..**]")[1] || "";
        }
         const finalComment = conditionText
          ? `The above approval is subjected to the following conditions: ${conditionText}`
          : "";
        console.log('application', application)
        if (!application) {
          throw new Error("CLU Application data is missing");
        }
        const usage = displayData?.siteDetails?.[0]?.buildingCategory?.name
        const fee = payments?.totalAmountPaid;
        const amountinwords = amountToWords(fee);
        if (!fileStoreId){
          const response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments, Clu: application, ApproverComment : finalComment, usage,amountinwords, approvalDate: approvalDate , approvalTime:approvalTime, ownersString }] }, pdfkey);
          fileStoreId = response?.filestoreIds[0];
        }
        return fileStoreId;  
      } catch (error) {
        console.error("Sanction Letter download error:", error);
        }
        finally { setLoader(false); }
      }
  const printCertificateWithESign = async () => {
    try {
      console.log("🎯 Starting certificate eSign process...");

      const fileStoreId = await getRecieptSearch({
        tenantId: reciept_data2?.Payments[0]?.tenantId,
        payments: reciept_data2?.Payments[0],
        pdfkey:"clu-sanctionletter",
      });

      // Update application with sanctionLetterFilestoreId here
      const application = applicationDetails?.Noc?.[0];
      // const updatedApplication = {
      //   ...application,
      //   workflow: { action: "ESIGN" },
      //   nocDetails: {
      //     ...application?.nocDetails,
      //     additionalDetails: {
      //       ...application?.nocDetails?.additionalDetails,
      //       sanctionLetterFilestoreId: fileStoreId,
      //     },
      //   },
      // };

      // await mutation.mutateAsync({ Noc: updatedApplication });
      // refetch();

      const callbackUrl = `${window.location.origin}/digit-ui/employee/obps/clu/esign/complete/${id}`;

      // Trigger eSign
      eSignCertificate(
        { fileStoreId, tenantId, callbackUrl },
        {
          onSuccess: () => console.log("✅ eSign initiated successfully"),
          onError: (error) => {
            console.error("❌ eSign failed:", error);
            setShowToast({
              key: "true",
              error: true,
              message: error.message || "Failed to initiate digital signing process, Kindly check if the document is e-signed already",
            });
          },
        }
      );
    } catch (error) {
      console.error("❌ Certificate preparation failed:", error);
      setShowToast({
        key: "true",
        error: true,
        message: error.message || "Failed to prepare certificate for eSign, Kindly check if the document is e-signed already",
      });
    }
  };
  const documentData = useMemo(() => siteImages?.documents?.map((value, index) => ({
    title: value?.documentType,
    fileStoreId: value?.filestoreId,
    latitude: value?.latitude,
    longitude: value?.longitude,
  })), [siteImages]);

  //console.log("documentData here==>", documentData);

  const documentsColumnsSiteImage = [
    {
      Header: t("BPA_DOCUMENT_NAME"),
      accessor: "title",
      Cell: ({ value }) => t(value) || t("CS_NA"),
    },
    {
      Header: t("BPA_DOCUMENT_FILE"),
      accessor: "fileStoreId",
      Cell: ({ value }) => {
        return value ? (
          <LinkButton style={{ float: "right", display: "inline" }}
            label={t("View")}
            onClick={() => routeToImage(value)}
          />
        ) : (
          t("CS_NA")
        )
      },
    }
  ];

  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

  useEffect(() => {
    if (isLoading || !tenantId || !businessServiceCode) return;
      
     (async () => {
      try{
        setLoader(true);
        const wf = await Digit.WorkflowService.init(tenantId, businessServiceCode);
        //console.log("wf=>", wf);
        setLoader(false);
        setWorkflowService(wf?.BusinessServices?.[0]?.states);
      }catch(e){
         console.error(e);
      }finally{
        setLoader(false);
      }
     })();
    
  }, [tenantId, businessServiceCode, isLoading]);

  useEffect(() => {

  const latestCalc = applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.calculations?.find((c) => c.isLatest);
  const apiEstimates = data?.Calculation?.[0]?.taxHeadEstimates || [];
  if (apiEstimates.length === 0) return;

  setFeeAdjustments((prev = []) => {
    // build prev map
    const prevByTax = (prev || []).reduce((acc, it) => {
      if (it?.taxHeadCode) acc[it.taxHeadCode] = it;
      return acc;
    }, {});

    // build merged but keep prev edited rows
    const merged = apiEstimates.map((tax) => {
      const saved = latestCalc?.taxHeadEstimates?.find((c) => c.taxHeadCode === tax.taxHeadCode);
      const prevItem = prevByTax[tax.taxHeadCode] || {};
      const isEdited = !!prevItem.edited;

      return {
        taxHeadCode: tax?.taxHeadCode,
        category: tax?.category,
        adjustedAmount: isEdited ? prevItem.adjustedAmount : tax.estimateAmount ?? saved?.estimateAmount ?? 0,
        remark: isEdited ? prevItem.remark ?? "" : tax.remarks ?? saved?.remarks ?? "",
        filestoreId: prevItem?.filestoreId !== undefined ? prevItem.filestoreId : tax.filestoreId ?? saved?.filestoreId ?? null,
        onDocumentLoading: false,
        documentError: null,
        edited: prevItem.edited ?? false,
      };
    });

    return merged;
  });
  }, [applicationDetails, data]);


 // console.log("getWorkflowService =>", getWorkflowService);

  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewTimeline, setViewTimeline] = useState(false);

  const closeToast = () => {
    setShowToast(null);
  };

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  const closeToastOne = () => {
    setShowErrorToastt(null);
  };

  let user = Digit.UserService.getUser();
  const menuRef = useRef();

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  const userRoles = user?.info?.roles?.map((e) => e.code);

  useEffect(()=>{
        if(workflowDetails){
          workflowDetails.revalidate();
        }
  
        if(data){
          data.revalidate();
        }
  },[]);

  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  console.log("actions here", actions);

  useEffect(() => {
    const cluObject = applicationDetails?.Clu?.[0];

    if (cluObject) {
      const applicantDetails = cluObject?.cluDetails?.additionalDetails?.applicationDetails;

      const siteDetails = cluObject?.cluDetails?.additionalDetails?.siteDetails;

      const coordinates = cluObject?.cluDetails?.additionalDetails?.coordinates;

      const Documents = cluObject?.documents || [];

      const ownerPhotoList = cluObject?.cluDetails?.additionalDetails?.ownerPhotos || [];  

      const finalDisplayData = {
        applicantDetails: applicantDetails ? [applicantDetails] : [],
        siteDetails: siteDetails ? [siteDetails] : [],
        coordinates: coordinates ? [coordinates] : [],
        Documents: Documents.length > 0 ? Documents : [],
        ownerPhotoList: ownerPhotoList
      };

      setDisplayData(finalDisplayData);

      const siteImagesFromData = cluObject?.cluDetails?.additionalDetails?.siteImages;

      setSiteImages(siteImagesFromData? { documents: siteImagesFromData } : {});

      setFieldInspectionPending(applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.fieldinspection_pending);

      const submittedOn = cluObject?.cluDetails?.additionalDetails?.SubmittedOn;
      const lastModified = cluObject?.auditDetails?.lastModifiedTime;
      const totalTime = submittedOn && lastModified ? lastModified - submittedOn : null;
      const time = totalTime ? formatDuration(totalTime) : null;
      setTimeObj(time);
    }
  }, [applicationDetails?.Clu]);

  function routeToImage(filestoreId) {
    getUrlForDocumentView(filestoreId)
  }
  
  const getUrlForDocumentView = async (filestoreId) => {
    if (filestoreId?.length === 0) return;
    try {
      const result = await Digit.UploadServices.Filefetch([filestoreId], state);
      if (result?.data) {
        const fileUrl = result.data[filestoreId];
        if (fileUrl) {
          // window.open(fileUrl, "_blank");
          if(!isMobile){
            window.open(fileUrl, "_blank");
          }else{
            setShowImageModal(true);
            setImageUrl(fileUrl);            
          }         
        } else {
          // if (props?.setError) {
          //   props?.setError(t("CS_FILE_FETCH_ERROR"));
          // } else {
            console.error(t("CS_FILE_FETCH_ERROR"))
          // }
        }
      } else {
        // if (props?.setError) {
        //   props?.setError(t("CS_FILE_FETCH_ERROR"));
        // } else {
          console.error(t("CS_FILE_FETCH_ERROR"))
        // }
      }
    } catch (e) {
      // if (props?.setError) {
      //   props?.setError(t("CS_FILE_FETCH_ERROR"));
      // } else {
        console.error(t("CS_FILE_FETCH_ERROR"))
      // }
    }
  }

  const closeImageModal = () => {
    setShowImageModal(false);
    setImageUrl(null);
  }

  function onActionSelect(action) {
    console.log("selected action", action);
    const appNo = applicationDetails?.Clu?.[0]?.applicationNo;
    const validationMsg = validateSiteImages(action);
    console.log('validationMsg', validationMsg)
    const filterNexState = action?.state?.actions?.filter((item) => item.action == action?.action);
    const filterRoles = getWorkflowService?.filter((item) => item?.uuid == filterNexState[0]?.nextState);
    setEmployees(filterRoles?.[0]?.actions);

    const payload = {
      Licenses: [action],
    };

    if (action?.action == "EDIT") {
      setShowToast({ key: "true", warning: true, message: "COMMON_NOT_EDITABLE_HERE_LABEL" });
      setTimeout(()=>{setShowToast(null);},3000);
      //cant be edited here
    } else if (action?.action == "DRAFT") {
      setShowToast({ key: "true", warning: true, message: "COMMON_EDIT_APPLICATION_BEFORE_SAVE_OR_SUBMIT_LABEL" });
      setTimeout(()=>{setShowToast(null);},3000);
    } else if (action?.action == "ESIGN") {
      // Automatically trigger the eSign process for the certificate
      printCertificateWithESign();
    }else if (action?.action == "APPLY" || action?.action == "RESUBMIT" || action?.action == "CANCEL") {
      submitAction(payload);
    } else if (action?.action == "PAY") {
      history.push(`/digit-ui/employee/payment/collect/clu/${appNo}/${tenantId}?tenantId=${tenantId}`);
    }else if(validationMsg){
      setShowToast({ key: "true", error: true, message: validationMsg }); 
      return;
    }else {      
      if(applicationDetails?.Clu?.[0]?.applicationStatus === "FIELDINSPECTION_INPROGRESS" && (!siteImages?.documents || siteImages?.documents?.length < 4)){
        setShowToast({ key: "true", error: true, message: "Please_Add_Site_Images_With_Geo_Location" });
        return;
      }
      setShowModal(true);
      setSelectedAction(action);
    }
  }

  const onChangeReport = (key, value) => {
    //console.log("key,value", key, value);
    setFieldInspectionPending(value);
  }
  //console.log("fieldInspectionPending state==>", fieldInspectionPending)

  const isFeeDisabled = applicationDetails?.Clu?.[0]?.applicationStatus === "FIELDINSPECTION_INPROGRESS";

  
  function getRemarkEntries(record) {
   return Object.entries(record ?? {}).filter(([k]) => k.startsWith('Remarks'));
  }

 function areAllRemarksFilled(record) {
  const remarkEntries = getRemarkEntries(record);
  //console.log("remarksEntries==>", remarkEntries);
  return (
    remarkEntries.length > 0 &&
    remarkEntries.every(([, v]) => typeof v === 'string' && v.trim().length > 0)
  );
  }

  function areAllRemarksFilledForDocumentCheckList(record){
    const entries = Object.entries(record);
    console.log("entries==>", entries);
    console.log("remainingDocs?.length==>", remainingDocs?.length);
    console.log("checklistRemarks state==>", checklistRemarks);
    
    // Rule 1: Must have exact entries equal to remainingDocs
    if (entries.length !== remainingDocs?.length) {
      console.log("Entries length mismatch: entries=", entries.length, "remainingDocs=", remainingDocs?.length);
      return false;
    }

   // Rule 2: Every value must be a non-empty string (trimmed)
    const allFilled = entries.every(([key, value]) => {
      const isFilled = typeof value === 'string' && value.trim().length > 0;
      if (!isFilled) console.log("Remark not filled for key:", key, "value:", value);
      return isFilled;
    });
    
    console.log("allFilled==>", allFilled);
    return allFilled;

  }


  const submitAction = async (data) => {
    const payloadData = applicationDetails?.Clu?.[0] || {};
    // console.log("data ==>", data);
    //console.log("feeAdjustments==>", feeAdjustments);

    //Validation For Site CheckList AT JE/BI Label
    if(applicationDetails?.Clu?.[0]?.applicationStatus === "INSPECTION_REPORT_PENDING"){
     
      if(fieldInspectionPending?.length === 0 || fieldInspectionPending?.[0]?.questionLength === 0){
        closeModal();
        setTimeout(()=>{setShowToast(null);},3000);
        setShowToast({ key: "true", error: true, message: "BPA_FIELD_INSPECTION_REPORT_PENIDNG_VALIDATION_LABEL" });
        return;
      }
      else{

        const record = fieldInspectionPending?.[0] ?? {};
        const allRemarksFilled = areAllRemarksFilled(record);
        //console.log("allRemarsFilled", allRemarksFilled);

        if(!allRemarksFilled){
         closeModal();
         setTimeout(()=>{setShowToast(null);},3000);
         setShowToast({ key: "true", error: true, message: "BPA_FIELD_INSPECTION_REPORT_PENDING_QUESTION_VALIDATION_LABEL" });
         return;
        }
      }      
    }

   // console.log("fieldInspectionPending",fieldInspectionPending)

    //Validation for Document CheckList At DM Level
    if(applicationDetails?.Clu?.[0]?.applicationStatus === "DOC_VERIFICATION_PENDING"){
      console.log("Validating document checklist remarks...");
      console.log("Current checklistRemarks:", checklistRemarks);
      console.log("remainingDocs:", remainingDocs);
      const allRemarksFilled = areAllRemarksFilledForDocumentCheckList(checklistRemarks);
      console.log("allRemarks at DM Level", allRemarksFilled);

        if(!allRemarksFilled){
         closeModal();
         setTimeout(()=>{setShowToast(null);},3000);
         setShowToast({ key: "true", error: true, message: "BPA_DOCUMENT_VERIFICATION_VALIDATION_LABEL" });
         return;
        }

    }
   
    //Validation For Updating Fee At Any Level
    if (!isFeeDisabled) {
    const hasNonZeroFee = (feeAdjustments || []).some((row) => (row.amount || 0) + (row.adjustedAmount ?? 0) > 0);
    const allRemarksFilled = (feeAdjustments || []).every((row) => !row.edited || (row.remark && row.remark.trim() !== ""));

    //console.log("hasNonZeroFee==>",hasNonZeroFee);
    //console.log("allRemarksFilled==>", allRemarksFilled);

    if (!hasNonZeroFee) {
      closeModal();
      setTimeout(()=>{setShowToast(null);},3000);
      setShowToast({ key: "true", error: true, message: "BPA_ENTER_FEE_ADD_LABEL" });
      return;
    }

    if (!allRemarksFilled) {
      closeModal();
      setTimeout(()=>{setShowToast(null);},3000);
      setShowToast({ key: "true", error: true, message: "BPA_REMARKS_MANDATORY_LABEL" });
      return;
    }
   }

   const newCalculation = {
      isLatest: true,
      updatedBy: Digit.UserService.getUser()?.info?.name,
      taxHeadEstimates: feeAdjustments
        .filter((row) => row.taxHeadCode !== "CLU_TOTAL") // exclude UI-only total row
        .map((row) => ({
          taxHeadCode: row.taxHeadCode,
          estimateAmount: (row.adjustedAmount ?? 0), // baseline + delta
          category: row.category,
          remarks: row.remark || null,
          filestoreId: row.filestoreId || null,
        })),
    };

    const oldCalculations = (payloadData?.cluDetails?.additionalDetails?.calculations || [])?.map(c => ({ ...c, isLatest: false }));

    const updatedApplicant = {
      ...payloadData,
      cluDetails: {
        ...payloadData.cluDetails,
        additionalDetails: {
          ...payloadData.cluDetails?.additionalDetails,
          siteImages: siteImages?.documents || [],
          calculations: [...oldCalculations, newCalculation],
          fieldinspection_pending: fieldInspectionPending,
        }
      },
      workflow: {},
    };

    const filtData = data?.Licenses?.[0];
    //console.log("filtData", filtData);

    updatedApplicant.workflow = {
      action: filtData.action,
      assignes: filtData?.assignee,
      comment: filtData?.comment,
      documents: filtData?.wfDocuments,
    };

    const finalPayload = {
      Clu: { ...updatedApplicant },
    };

    try {

      // Build document checklist payload from remarks state
      const checklistPayload = {
        checkList: (remainingDocs || []).map((doc) => {
          const existing = searchChecklistData?.checkList?.find((c) => c.documentuid === doc.documentUid);
          return {
            id: existing?.id, // include if updating
            documentuid: doc?.documentUid,
            applicationNo: id,
            tenantId,
            action: existing ? "update" : "INITIATE",
            remarks: checklistRemarks[doc?.documentUid] || "",
          };
        }),
      };

      // Call checklist API before CLUUpdate but only incase of application status = "DOC_VERIFICATION_PENDING"
      if (applicationDetails?.Clu?.[0]?.applicationStatus === "DOC_VERIFICATION_PENDING" && user?.info?.roles.filter(role => role.code === "OBPAS_CLU_DM")?.length > 0 && checklistPayload?.checkList?.length > 0) {
        if (searchChecklistData?.checkList?.length > 0) {
          await Digit.OBPSService.CLUCheckListUpdate({
            details: checklistPayload,
            filters: { tenantId },
          });
        } else {
          await Digit.OBPSService.CLUCheckListCreate({
            details: checklistPayload,
            filters: {},
          });
        }
      }

      const response = await Digit.OBPSService.CLUUpdate({ tenantId, details: finalPayload });

      if(response?.ResponseInfo?.status === "successful"){
        if(filtData?.action === "CANCEL"){
          setShowToast({ key: "true", success:true, message: "COMMON_APPLICATION_CANCELLED_LABEL" });
          workflowDetails.revalidate();
          setSelectedAction(null);
          setTimeout(() => {
            history.push("/digit-ui/employee/obps/clu/inbox");
          }, 3000);
        }
        else if(filtData?.action === "APPLY" || filtData?.action === "RESUBMIT" || filtData?.action === "DRAFT"){
          //Else If case for "APPLY" or "RESUBMIT" or "DRAFT"
          console.log("We are calling employee response page");
          history.replace({
           pathname: `/digit-ui/employee/obps/clu/response/${response?.Clu?.[0]?.applicationNo}`,
           state: { data: response }
          });
        }
        else{
           //Else case for "VERIFY" or "APPROVE" or "SENDBACKTOCITIZEN" or "SENDBACKTOVERIFIER"
          setShowToast({ key: "true", success:true, message: "COMMON_SUCCESSFULLY_UPDATED_APPLICATION_STATUS_LABEL" });
          workflowDetails.revalidate();
          setSelectedAction(null);
          setTimeout(() => {
            history.push("/digit-ui/employee/obps/clu/inbox");
            window.location.reload();
          }, 3000);
        }
      }
      else{
        setShowToast({ key: "true", warning:true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" });
        setSelectedAction(null); 
      }
    } catch (err) {
      setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" });
    }finally{
      setTimeout(()=>{setShowToast(null);},3000);
    }
  };

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
  };

  const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
  };

  const handleViewTimeline = () => {
    setViewTimeline(true);
    const timelineSection = document.getElementById("timeline");
    if (timelineSection) timelineSection.scrollIntoView({ behavior: "smooth" });
  };

  console.log("displayData here", displayData);

  const coordinates = applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.coordinates;
  //console.log("coordinates==>", coordinates);
  const sitePhotographs = displayData?.Documents?.filter((doc)=> (doc?.documentType === "OWNER.SITEPHOTOGRAPHONE" || doc?.documentType === "OWNER.SITEPHOTOGRAPHTWO"))?.sort((a, b) => (a?.documentType ?? "").localeCompare(b?.documentType ?? ""));

  const remainingDocs = displayData?.Documents?.filter((doc)=> !(doc?.documentType === "OWNER.SITEPHOTOGRAPHONE" || doc?.documentType === "OWNER.SITEPHOTOGRAPHTWO"));

  //console.log("sitePhotoGrahphs==>", sitePhotographs);
  //console.log("remainingDocs==>", remainingDocs);

  useEffect(() => {
    const fetchDistances = async () => {
      if (coordinates?.Latitude1 && coordinates?.Latitude2 && geoLocations?.length > 0) {
        try {
          const results = await Promise.all(
            geoLocations.map(async (loc, idx) => {
              const d1 = await getDrivingDistance(
                parseFloat(coordinates?.Latitude1),
                parseFloat(coordinates?.Longitude1),
                parseFloat(loc?.latitude),
                parseFloat(loc?.longitude)
              );
              const d2 = await getDrivingDistance(
                parseFloat(coordinates?.Latitude2),
                parseFloat(coordinates?.Longitude2),
                parseFloat(loc?.latitude),
                parseFloat(loc?.longitude)
              );
              const minDistance = Math.min(d1, d2);
              console.log(`Image ${idx + 1}: d1=${d1}m, d2=${d2}m, min=${minDistance}m`);
              return minDistance;
            })
          );
          setDistances(results);
          console.log("Final distances (m):", results);
        } catch (err) {
          console.error("Error fetching distances:", err);
        }
      }
    };

    fetchDistances();
  }, [coordinates, geoLocations]);

  const validateSiteImages = (action) => {
    if (applicationDetails?.Clu?.[0]?.applicationStatus === "FIELDINSPECTION_INPROGRESS") {
      // Check distances
      if (distances?.length > 0) {
        for (let i = 0; i < distances.length; i++) {
          const d = distances[i];
          if (d > 50) {
            // return with index (human-friendly: +1)
            return `Site image ${i + 1} is not within 50 meters`;
          }
        }
      }
    }
    return null; // no error
  };


  console.log('distances here ', distances)


  const ownersList= applicationDetails?.Clu?.[0]?.cluDetails.additionalDetails?.applicationDetails?.owners?.map((item)=> item.ownerOrFirmName);
  const combinedOwnersName = ownersList?.join(", ");

  const siteInspectionEmp = useMemo(() => {
    return workflowDetails?.data?.processInstances
      ?.find((item) => item?.action === "SEND_FOR_INSPECTION_REPORT")
      ?.assigner;
  }, [workflowDetails]);

  
  const empUserName = siteInspectionEmp?.userName ?? "";
  const empName = siteInspectionEmp?.name ?? "";

  const handleSetEmpDesignation = (key)=>{
    setEmpDesignation(key);
  }


  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={"employee-main-application-details"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
        <Header styles={{ fontSize: "32px" }}>{t("BPA_APP_OVERVIEW_HEADER")}</Header>
        <LinkButton label={t("VIEW_TIMELINE")} onClick={handleViewTimeline} />
        {(isLoading || recieptDataLoading2 || recieptDataLoading1) && <Loader />}
        {["APPROVED", "E-SIGNED"].includes(applicationDetails?.Clu?.[0]?.applicationStatus) && (
          <SubmitBar label={t("OPEN_SANCTION_LETTER")} onSubmit={() => openSanctionLetterPopup()} />
        )}
      </div>

      <Card>
        <CardSubHeader>{t("OWNER_OWNERPHOTO")}</CardSubHeader>
        <CLUImageView
          ownerFileStoreId={displayData?.ownerPhotoList?.[0]?.filestoreId}
          ownerName={displayData?.applicantDetails?.[0]?.owners?.[0]?.ownerOrFirmName}
        />
      </Card>

      <Card>
        <StatusTable>
          <Row label={t("BPA_APPLICATION_NUMBER_LABEL")} text={id} />
        </StatusTable>
      </Card>

      {displayData?.applicantDetails?.[0]?.owners?.map((detail, index) => (
        <React.Fragment>
          <Card>
            <CardSubHeader>{index === 0 ? t("BPA_PRIMARY_OWNER") : `OWNER ${index + 1}`}</CardSubHeader>
            <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
              <StatusTable>
                <Row label={t("BPA_FIRM_OWNER_NAME_LABEL")} text={detail?.ownerOrFirmName || "N/A"} />
                <Row label={t("BPA_APPLICANT_EMAIL_LABEL")} text={detail?.emailId || "N/A"} />
                <Row label={t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL")} text={detail?.fatherOrHusbandName || "N/A"} />
                <Row label={t("BPA_APPLICANT_MOBILE_NO_LABEL")} text={detail?.mobileNumber || "N/A"} />
                <Row label={t("BPA_APPLICANT_DOB_LABEL")} text={formatDate(detail?.dateOfBirth) || "N/A"} />
                <Row label={t("BPA_APPLICANT_GENDER_LABEL")} text={detail?.gender?.code || detail?.gender || "N/A"} />
                <Row label={t("BPA_APPLICANT_ADDRESS_LABEL")} text={detail?.address || "N/A"} />
                <Row label={t("BPA_OWNERSHIP_IN_PCT_LABEL")} text={detail?.ownershipInPct || "N/A"} />
              </StatusTable>
            </div>
          </Card>
        </React.Fragment>
      ))}

      {displayData?.applicantDetails?.some((detail) => detail?.professionalName?.trim()?.length > 0) &&
        displayData?.applicantDetails?.map((detail, index) => (
          <React.Fragment>
            <Card>
              <CardSubHeader>{t("BPA_PROFESSIONAL_DETAILS")}</CardSubHeader>
              <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
                <StatusTable>
                  <Row label={t("BPA_PROFESSIONAL_NAME_LABEL")} text={detail?.professionalName || "N/A"} />
                  <Row label={t("BPA_PROFESSIONAL_EMAIL_LABEL")} text={detail?.professionalEmailId || "N/A"} />
                  <Row label={t("BPA_PROFESSIONAL_REGISTRATION_ID_LABEL")} text={detail?.professionalRegId || "N/A"} />
                  <Row label={t("BPA_PROFESSIONAL_REGISTRATION_ID_VALIDITY_LABEL")} text={detail?.professionalRegIdValidity || "N/A"} />
                  <Row label={t("BPA_PROFESSIONAL_MOBILE_NO_LABEL")} text={detail?.professionalMobileNumber || "N/A"} />
                  <Row label={t("BPA_PROFESSIONAL_ADDRESS_LABEL")} text={detail?.professionalAddress || "N/A"} />
                </StatusTable>
              </div>
            </Card>
          </React.Fragment>
        ))}

      <Card>
        <CardSubHeader>{t("BPA_LOCALITY_INFO_LABEL")}</CardSubHeader>
        {displayData?.siteDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("BPA_AREA_TYPE_LABEL")} text={detail?.localityAreaType?.name || "N/A"} />

              {detail?.localityAreaType?.code === "SCHEME_AREA" && (
                <Row label={t("BPA_SCHEME_COLONY_TYPE_LABEL")} text={detail?.localityColonyType?.name || "N/A"} />
              )}

              {detail?.localityAreaType?.code === "SCHEME_AREA" && (
                <Row label={t("BPA_SCHEME_NAME_LABEL")} text={detail?.localitySchemeName || "N/A"} />
              )}
            </StatusTable>
          </div>
        ))}
      </Card>

      <Card>
        <CardSubHeader>{t("BPA_SITE_DETAILS")}</CardSubHeader>
        {displayData?.siteDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("BPA_PLOT_NO_LABEL")} text={detail?.plotNo || "N/A"} />
              <Row label={t("BPA_KHEWAT_KHATUNI_NO_LABEL")} text={detail?.khewatOrKhatuniNo || "N/A"} />
              <Row label={t("BPA_CORE_AREA_LABEL")} text={detail?.coreArea?.code || "N/A"} />

              <Row label={t("BPA_PROPOSED_SITE_ADDRESS")} text={detail?.proposedSiteAddress || "N/A"} />
              <Row label={t("BPA_ULB_NAME_LABEL")} text={detail?.ulbName?.name || detail?.ulbName || "N/A"} />
              <Row label={t("BPA_ULB_TYPE_LABEL")} text={detail?.ulbType || "N/A"} />

              <Row label={t("BPA_DISTRICT_LABEL")} text={detail?.district?.name || detail?.district || "N/A"} />
              <Row label={t("BPA_ZONE_LABEL")} text={detail?.zone?.name || detail?.zone || "N/A"} />

              <Row label={t("BPA_KHASRA_NO_LABEL")} text={detail?.khasraNo || "N/A"} />
              <Row label={t("BPA_HADBAST_NO_LABEL")} text={detail?.hadbastNo || "N/A"} />
              <Row label={t("BPA_ROAD_TYPE_LABEL")} text={detail?.roadType?.name || detail?.roadType || "N/A"} />
              <Row label={t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL")} text={detail?.areaLeftForRoadWidening || "N/A"} />
              <Row label={t("BPA_NET_PLOT_AREA_AFTER_WIDENING_LABEL")} text={detail?.netPlotAreaAfterWidening || "N/A"} />
              <Row label={t("BPA_NET_TOTAL_AREA_LABEL")} text={detail?.netTotalArea || "N/A"} />

              <Row label={t("BPA_ROAD_WIDTH_AT_SITE_LABEL")} text={detail?.roadWidthAtSite || "N/A"} />

              <Row label={t("BPA_SITE_WARD_NO_LABEL")} text={detail?.wardNo || "N/A"} />

              <Row label={t("BPA_SITE_VASIKA_NO_LABEL")} text={detail?.vasikaNumber || "N/A"} />
              <Row label={t("BPA_SITE_VASIKA_DATE_LABEL")} text={formatDate(detail?.vasikaDate) || "N/A"} />
              <Row label={t("BPA_SITE_VILLAGE_NAME_LABEL")} text={detail?.villageName || "N/A"} />

              {/* <Row label={t("BPA_OWNERSHIP_IN_PCT_LABEL")} text={detail?.ownershipInPct || "N/A"} /> */}
              <Row label={t("BPA_PROPOSED_ROAD_WIDTH_AFTER_WIDENING_LABEL")} text={detail?.proposedRoadWidthAfterWidening || "N/A"} />

              <Row label={t("BPA_CATEGORY_APPLIED_FOR_CLU_LABEL")} text={detail?.appliedCluCategory?.name || "N/A"} />
              <Row label={t("BPA_PROPERTY_UID_LABEL")} text={detail?.propertyUid || "N/A"} />
              <Row label={t("BPA_BUILDING_STATUS_LABEL")} text={detail?.buildingStatus?.name || "N/A"} />
              <Row label={t("BPA_IS_ORIGINAL_CATEGORY_AGRICULTURE_LABEL")} text={detail?.isOriginalCategoryAgriculture?.code || "N/A"} />
              <Row label={t("BPA_RESTRICTED_AREA_LABEL")} text={detail?.restrictedArea?.code || "N/A"} />
              <Row label={t("BPA_IS_SITE_UNDER_MASTER_PLAN_LABEL")} text={detail?.isSiteUnderMasterPlan?.code || "N/A"} />

              {/* <Row label={t("BPA_BUILDING_CATEGORY_LABEL")} text={detail?.buildingCategory?.name || "N/A"} /> */}
            </StatusTable>
          </div>
        ))}
      </Card>

      <Card>
        <CardSubHeader>{t("BPA_SPECIFICATION_DETAILS")}</CardSubHeader>
        {displayData?.siteDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("BPA_PLOT_AREA_JAMA_BANDI_LABEL")} text={detail?.specificationPlotArea || "N/A"} />
            </StatusTable>
          </div>
        ))}
      </Card>

      <Card>
        <CardSubHeader>{t("BPA_UPLOADED _SITE_PHOTOGRAPHS_LABEL")}</CardSubHeader>
        <StatusTable>{sitePhotographs?.length > 0 && <CLUSitePhotographs documents={sitePhotographs} coordinates={coordinates} />}</StatusTable>
      </Card>

      {applicationDetails?.Clu?.[0]?.applicationStatus !== "FIELDINSPECTION_INPROGRESS" && siteImages?.documents?.length > 0 && (
        <Card>
          <CardSubHeader>{`FIELD INSPECTION SITE PHOTOGRAPHS UPLOADED BY ${empName} - ${empDesignation}`}</CardSubHeader>
          <StatusTable>
          <CLUSitePhotographs documents={siteImages?.documents?.sort((a, b) => (a?.documentType ?? "").localeCompare(b?.documentType ?? ""))} />
          </StatusTable>
          {geoLocations?.length > 0 && (
            <React.Fragment>
              <CardSectionHeader style={{ marginBottom: "16px", marginTop: "32px" }}>{t("SITE_INSPECTION_IMAGES_LOCATIONS")}</CardSectionHeader>
              <CustomLocationSearch position={geoLocations} />
            </React.Fragment>
          )}
        </Card>
      )}

      <Card>
        <CardSubHeader>{t("BPA_UPLOADED_OWNER_ID")}</CardSubHeader>
        <StatusTable>
          {applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.ownerIds?.length > 0 && (
            <CLUDocumentTableView documents={applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.ownerIds} />
          )}
        </StatusTable>
      </Card>

{/* {applicationDetails?.Clu?.[0]?.applicationStatus !== "INSPECTION_REPORT_PENDING" && */}
      {applicationDetails?.Clu?.[0]?.applicationStatus !== "INSPECTION_REPORT_PENDING" && (applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.fieldinspection_pending?.length > 0) && (
        <Card>
          <CardSubHeader>{`${t("BPA_FI_REPORT")} UPLOADED BY ${empName} - ${empDesignation}`}</CardSubHeader>
          <InspectionReportDisplay fiReport={applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.fieldinspection_pending} />
        </Card>
      )}

      {applicationDetails?.Clu?.[0]?.applicationStatus !== "DOC_VERIFICATION_PENDING" && (
        <Card>
          <CardSubHeader>{t("BPA_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
          <StatusTable>
            {remainingDocs?.length > 0 && (
              <CLUDocumentChecklist
                documents={remainingDocs}
                applicationNo={id}
                tenantId={tenantId}
                onRemarksChange={setChecklistRemarks}
                readOnly="true"
              />
            )}
          </StatusTable>
        </Card>
      )}

      {applicationDetails?.Clu?.[0]?.applicationStatus === "INSPECTION_REPORT_PENDING" &&
        (user?.info?.roles.filter((role) => role.code === "OBPAS_CLU_JE" || role.code === "OBPAS_CLU_BI")).length > 0 && (
          <Card>
            <InspectionReport
              isCitizen={true}
              fiReport={applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.fieldinspection_pending}
              onSelect={onChangeReport}
            />
          </Card>
        )}

      {applicationDetails?.Clu?.[0]?.applicationStatus === "DOC_VERIFICATION_PENDING" &&
        user?.info?.roles.filter((role) => role.code === "OBPAS_CLU_DM")?.length > 0 && (
          <Card>
            <CardSubHeader>{t("BPA_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
            <StatusTable>
              {remainingDocs?.length > 0 && (
                <CLUDocumentChecklist documents={remainingDocs} applicationNo={id} tenantId={tenantId} onRemarksChange={setChecklistRemarks} />
              )}
            </StatusTable>
          </Card>
        )}

      <Card>
        <CardSubHeader>{t("BPA_FEE_DETAILS_LABEL")}</CardSubHeader>
        {applicationDetails?.Clu?.[0]?.cluDetails && (
          <CLUFeeEstimationDetails
            formData={{
              apiData: { ...applicationDetails },
              applicationDetails: { ...applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.applicationDetails },
              siteDetails: { ...applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.siteDetails },
              calculations: applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.calculations || [],
            }}
            feeType="PAY1"
            hasPayments={hasPayments}
          />
        )}
        {hasPayments && (
          <div style={{ marginTop: "16px" }}>
            <PaymentHistory payments={combinedPayments} />
          </div>
        )}
      </Card>

{/* will not be shown on first step(FIELDINSPECTION_INPROGRESS) */}
      {applicationDetails?.Clu?.[0]?.applicationStatus !== "FIELDINSPECTION_INPROGRESS" && (
      <div className="employeeCard">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <CardSubHeader>{t("BPA_FEE_DETAILS_TABLE_LABEL")}</CardSubHeader>
          {feeData?.CLU?.FeeNotificationChargesRule?.[0]?.fileStoreId && (
            <LinkButton
              label={t("BPA_DOWNLOAD_FEE_NOTIFICATION")}
              onClick={() => routeToImage(feeData?.CLU?.FeeNotificationChargesRule?.[0]?.fileStoreId)}
            />
          )}
        </div>

        {applicationDetails?.Clu?.[0]?.cluDetails && (
          <CLUFeeEstimationDetailsTable
            formData={{
              apiData: { ...applicationDetails },
              applicationDetails: { ...applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.applicationDetails },
              siteDetails: { ...applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.siteDetails },
              calculations: applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.calculations || [],
            }}
            feeType="PAY2"
            feeAdjustments={feeAdjustments}
            setFeeAdjustments={setFeeAdjustments}
            disable={applicationDetails?.Clu?.[0]?.applicationStatus === "FIELDINSPECTION_INPROGRESS"}
            applicationStatus={applicationDetails?.Clu?.[0]?.applicationStatus}
          />
        )}
      </div>
      )}

      <CheckBox
        label={`I/We hereby solemnly affirm and declare that I am submitting this application on behalf of the applicant (${combinedOwnersName}). I/We along with the applicant have read the Policy and understand all the terms and conditions of the Policy. We are committed to fulfill/abide by all the terms and conditions of the Policy. The information/documents submitted are true and correct as per record and no part of it is false and nothing has been concealed/misrepresented therein.`}
        checked="true"
      />

      {/* {workflowDetails?.data?.timeline && (
        <Card>
          <CardSubHeader>{t("CS_APPLICATION_DETAILS_APPLICATION_TIMELINE")}</CardSubHeader>
          {workflowDetails?.data?.timeline.length === 1 ? (
            <CheckPoint isCompleted={true} label={t(workflowDetails?.data?.timeline[0]?.status)} />
          ) : (
            <ConnectingCheckPoints>
              {workflowDetails?.data?.timeline.map((checkpoint, index, arr) => (
                <CheckPoint
                  keyValue={index}
                  isCompleted={index === 0}
                  label={t("BPA_STATUS_" + checkpoint.status)}
                  customChild={getTimelineCaptions(checkpoint, index, arr, t)}
                />
              ))}
            </ConnectingCheckPoints>
          )}
        </Card>
      )} */}

      {applicationDetails?.Clu?.[0]?.applicationStatus === "FIELDINSPECTION_INPROGRESS" &&
        (user?.info?.roles.filter((role) => role.code === "OBPAS_CLU_JE" || role.code === "OBPAS_CLU_BI")).length > 0 && (
          <Card>
            <div id="fieldInspection"></div>
            <SiteInspection siteImages={siteImages} setSiteImages={setSiteImages} geoLocations={geoLocations} customOpen={routeToImage} />
          </Card>
        )}

      <div id="timeline">
         {/* <NewApplicationTimeline workflowDetails={workflowDetails} t={t} empUserName={empUserName} handleSetEmpDesignation={handleSetEmpDesignation}/> */}
       <NewApplicationTimeline workflowDetails={workflowDetails} t={t} timeObj={timeObj} empUserName={empUserName} handleSetEmpDesignation={handleSetEmpDesignation}/>
      </div>

      {actions?.length > 0 && (
        <ActionBar>
          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu
              localeKeyPrefix="WF_EMPLOYEE_BPA"
              options={actions}
              optionKey={"action"}
              t={t}
              onSelect={onActionSelect}
              // style={MenuStyle}
            />
          ) : null}
          <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
        </ActionBar>
      )}

      {showImageModal && (
        <Modal headerBarEnd={<CloseBtn onClick={closeImageModal} />}>
          {/* <img src={imageUrl} alt="Site Inspection" style={{ width: "100%", height: "100%" }} /> */}
          {imageUrl?.toLowerCase().endsWith(".pdf") ? (
            <a style={{ color: "blue" }} href={imageUrl} target="_blank" rel="noopener noreferrer">
              {t("CS_VIEW_DOCUMENT")}
            </a>
          ) : (
            <img src={imageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          )}
        </Modal>
      )}

      {showModal ? (
        <CLUModal
          t={t}
          action={selectedAction}
          tenantId={tenantId}
          state={state}
          getEmployees={getEmployees}
          id={id}
          applicationDetails={applicationDetails}
          applicationData={applicationDetails?.Clu}
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
        />
      ) : null}

      {showToast && (
        <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />
      )}

      {(isLoading || getLoader || recieptDataLoading1 || recieptDataLoading2) && <Loader page={true} />}
    </div>
  );
};

export default CLUEmployeeApplicationDetails;
