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
  Toast,
  ConnectingCheckPoints,
  CheckPoint,
  MultiLink,
  CheckBox
} from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";

import CLUDocumentTableView from "../../../pageComponents/CLUDocumentTableView";
import CLUFeeEstimationDetails from "../../../pageComponents/CLUFeeEstimationDetails";
import CLUDocumentView from "../../../pageComponents/CLUDocumentView";
import { getCLUAcknowledgementData } from "../../../utils/getCLUAcknowledgementData";
import { amountToWords } from "../../../utils/index";
import NewApplicationTimeline from "../../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
import CLUImageView from "../../../pageComponents/CLUImgeView";
import CLUSitePhotographs from "../../../pageComponents/CLUSitePhotographs";
import CLUFeeEstimationDetailsTable from "../../../pageComponents/CLUFeesEstimationDetailsTable";
import { convertToDDMMYYYY } from "../../../utils/index";
import CustomLocationSearch from "../../../components/CustomLocationSearch";

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

const CLUApplicationDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const [displayData, setDisplayData] = useState({});
  const [loading, setLoading] = useState(false);

  const [feeAdjustments, setFeeAdjustments] = useState([]);

  const { isLoading, data } = Digit.Hooks.obps.useCLUSearchApplication({ applicationNo: id }, tenantId);
  const applicationDetails = data?.resData;
  const [siteImages, setSiteImages] = useState(applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.siteImages ? {
      documents: applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.siteImages
  } : []);

  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  let user = Digit.UserService.getUser();
  const disableFeeTable = ["INITIATED", "PENDINGAPPLICATIONPAYMENT", "FIELDINSPECTION_INPROGRESS","INSPECTION_REPORT_PENDING"];
  const disableSiteInspectionImage = ["INITIATED", "PENDINGAPPLICATIONPAYMENT", "FIELDINSPECTION_INPROGRESS"];

  //   if (window.location.href.includes("/obps") || window.location.href.includes("/noc")) {
  //     const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
  //     const userInfo = userInfos ? JSON.parse(userInfos) : {};
  //     user = userInfo?.value;
  //   }

  const userRoles = user?.info?.roles?.map((e) => e.code);

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
    }
  }, [applicationDetails?.Clu]);

  
  const businessServiceCode = applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.siteDetails?.businessService || "";

  const { data: reciept_data1, isLoading: recieptDataLoading1 } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "CLU.PAY1",
      consumerCodes: id,
      isEmployee: false,
    },
    { enabled: id ? true : false }
  );
  const { data: reciept_data2, isLoading: recieptDataLoading2 } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "CLU.PAY2",
      consumerCodes: id,
      isEmployee: false,
    },
    { enabled: id ? true : false }
  );

  console.log('businessServiceCode', businessServiceCode)
  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: businessServiceCode, 
  });

  console.log('workflowDetails', workflowDetails)

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

  let approveComments = []
  let approvalDate ,approvalTime= ""
  // Assuming workflowDetails.timeline exists
  if (workflowDetails?.data && !workflowDetails.isLoading) {
    approveComments = workflowDetails?.data?.timeline?.filter((item) => item?.performedAction === "APPROVE")?.flatMap((item) => item?.wfComment || []);
    approvalDate = workflowDetails?.data?.timeline?.find((item) => item?.performedAction === "PAY")?.auditDetails?.lastModified || "";
    approvalTime = workflowDetails?.data?.timeline?.find((item) => item?.performedAction === "PAY")?.auditDetails?.timing || "";

  }

 // console.log("Approve Comments:", approveComments);


  // const amountPaid = reciept_data?.Payments?.[0]?.totalAmountPaid;
  
  const handleDownloadPdf = async () => {
  try {
    setLoading(true);
    const Property = applicationDetails?.Clu?.[0];
    const site = Property?.cluDetails?.additionalDetails?.siteDetails;
    const ulbType = site?.ulbType;
    const ulbName = site?.ulbName?.city?.name;

    const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
    const acknowledgementData = await getCLUAcknowledgementData(Property, tenantInfo, ulbType, ulbName, t);

    Digit.Utils.pdf.generateFormatted(acknowledgementData);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};



  async function getRecieptSearch({ tenantId, payments, pdfkey, ...params }) {
    
     try {
      setLoading(true);
        const application = applicationDetails?.Clu;
        const approvecomments = approveComments?.[0];
        let conditionText = "";
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
      const response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments, Clu: application, ApproverComment : finalComment, usage,amountinwords, approvalDate: approvalDate , approvalTime:approvalTime }] }, pdfkey);
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
      window.open(fileStore[response?.filestoreIds[0]], "_blank");

    } catch (error) {
      console.error("Sanction Letter download error:", error);
      }
      finally { setLoading(false); }
    }

  const dowloadOptions = [];
  if (applicationDetails?.Clu?.[0]?.applicationStatus === "APPROVED") {
      dowloadOptions.push({
        label: t("PDF_STATIC_LABEL_WS_CONSOLIDATED_SANCTION_LETTER"),
        onClick: () => getRecieptSearch({ tenantId: reciept_data2?.Payments[0]?.tenantId, payments: reciept_data2?.Payments[0], pdfkey:"clu-sanctionletter" }),
      });
    dowloadOptions.push({
      label: t("DOWNLOAD_CERTIFICATE"),
      onClick: handleDownloadPdf,
    });

    if (reciept_data1 && reciept_data1?.Payments.length > 0 && !recieptDataLoading1) {
      dowloadOptions.push({
        label: t("CLU_FEE_RECEIPT_1"),
        onClick: () => getRecieptSearch({ tenantId: reciept_data1?.Payments[0]?.tenantId, payments: reciept_data1?.Payments[0], pdfkey:"clu-receipt" }),
      });
    }
    if (reciept_data2 && reciept_data2?.Payments.length > 0 && !recieptDataLoading2) {
      dowloadOptions.push({
        label: t("CLU_FEE_RECEIPT_2"),
        onClick: () => getRecieptSearch({ tenantId: reciept_data2?.Payments[0]?.tenantId, payments: reciept_data2?.Payments[0], pdfkey:"clu-receiptsecond" }),
      });
    }
  }

  useEffect(() => {
      const latestCalc = applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.calculations?.find((c) => c?.isLatest);
      if (latestCalc?.taxHeadEstimates) {
        setFeeAdjustments(latestCalc.taxHeadEstimates);
      }
  }, [applicationDetails]);

  //here workflow details
  const [showToast, setShowToast] = useState(null);
  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  const menuRef = useRef();

  const closeToast = () => {
    setShowToast(null);
  };

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);
  

  
  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

  
  useEffect(() => {
    if (workflowDetails) {
      workflowDetails.revalidate();
    }

    if (data) {
      data.revalidate();
    }
  }, []);

  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  //console.log("actions here", actions);

  function onActionSelect(action) {
    console.log("selected action", action);
    const appNo = applicationDetails?.Clu?.[0]?.applicationNo;
    const applicationStatus = applicationDetails?.Clu?.[0]?.applicationStatus;

    const payload = {
      Licenses: [action],
    };

    if (action?.action == "EDIT") {
      history.push(`/digit-ui/citizen/obps/clu/edit-application/${appNo}`);
    } else if (action?.action == "DRAFT") {
      setShowToast({ key: "true", warning: true, message: "COMMON_EDIT_APPLICATION_BEFORE_SAVE_OR_SUBMIT_LABEL" });
      setTimeout(()=>{setShowToast(null);},3000)
    } else if (action?.action == "APPLY" || action?.action == "RESUBMIT" || action?.action == "CANCEL") {
      submitAction(payload);
    } else if (action?.action == "PAY") {
      const code = applicationStatus === "PENDINGAPPLICATIONPAYMENT" ? "CLU.PAY1" : "CLU.PAY2";
      history.push(`/digit-ui/citizen/payment/collect/${code}/${appNo}/${tenantId}?tenantId=${tenantId}`);
    } else {
      setSelectedAction(action);
    }
  }

  const submitAction = async (data) => {
    const payloadData = applicationDetails?.Clu?.[0] || {};
    // console.log("data ==>", data);

   // const vasikaNumber =  payloadData?.cluDetails?.additionalDetails?.siteDetails?.vasikaNumber || "";
   // const vasikaDate = convertToDDMMYYYY(payloadData?.cluDetails?.additionalDetails?.siteDetails?.vasikaDate) ||"";

    const updatedApplicant = {
      ...payloadData,
     // vasikaNumber,
      //vasikaDate,
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
      const response = await Digit.OBPSService.CLUUpdate({ tenantId, details: finalPayload });

      if (response?.ResponseInfo?.status === "successful") {
        if (filtData?.action === "CANCEL") {
          setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" });
          workflowDetails.revalidate();
          setSelectedAction(null);
        } else {
          //Else case for "APPLY" or "RESUBMIT" or "DRAFT"
          console.log("We are calling citizen response page");
          history.replace({
            pathname: `/digit-ui/citizen/obps/clu/response/${response?.Clu?.[0]?.applicationNo}`,
            state: { data: response },
          });
        }
      } else {
        setShowToast({ key: "true", warning: true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" });
        setSelectedAction(null);
      }
    } catch (err) {
      setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" });
    }finally{
       setTimeout(()=>{setShowToast(null);},3000);
    }
  };

  const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
  };

  console.log("displayData==>", displayData);

  const coordinates = applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.coordinates;
  //console.log("coordinates==>", coordinates);
  const sitePhotographs = displayData?.Documents?.filter((doc)=> (doc?.documentType === "OWNER.SITEPHOTOGRAPHONE" || doc?.documentType === "OWNER.SITEPHOTOGRAPHTWO"))?.sort((a, b) => (a?.documentType ?? "").localeCompare(b?.documentType ?? ""));
  const remainingDocs = displayData?.Documents?.filter((doc)=> !(doc?.documentType === "OWNER.SITEPHOTOGRAPHONE" || doc?.documentType === "OWNER.SITEPHOTOGRAPHTWO"));

  //console.log("sitePhotoGrahphs==>", sitePhotographs);
  //console.log("remainingDocs==>", remainingDocs);

  const ownersList= applicationDetails?.Clu?.[0]?.cluDetails.additionalDetails?.applicationDetails?.owners?.map((item)=> item.ownerOrFirmName);
  const combinedOwnersName = ownersList?.join(", ");
  //console.log("combinerOwnersName", combinedOwnersName);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={"employee-main-application-details"}>
      <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
        <Header styles={{ fontSize: "32px" }}>{t("BPA_APP_OVERVIEW_HEADER")}</Header>
        {loading && <Loader />}
        {dowloadOptions && dowloadOptions.length > 0 && (
          <MultiLink
            className="multilinkWrapper"
            onHeadClick={() => setShowOptions(!showOptions)}
            displayOptions={showOptions}
            options={dowloadOptions}
          />
        )}
      </div>

      <Card>
      <CardSubHeader>{t("OWNER_OWNERPHOTO")}</CardSubHeader>
      <CLUImageView ownerFileStoreId={displayData?.ownerPhotoList?.[0]?.filestoreId} ownerName={displayData?.applicantDetails?.[0]?.owners?.[0]?.ownerOrFirmName} />
      </Card>

      <Card>
        <StatusTable>
          <Row label={t("BPA_APPLICATION_NUMBER_LABEL")} text={id} />
        </StatusTable>
      </Card>
   

      {displayData?.applicantDetails?.[0]?.owners?.map((detail,index)=>(
      <React.Fragment>
         <Card>
          <CardSubHeader>{index === 0 ? t("BPA_PRIMARY_OWNER") : `OWNER ${index+1}`}</CardSubHeader>
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

      {displayData?.applicantDetails?.some(detail => detail?.professionalName?.trim()?.length > 0) &&
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
    

      {/* <Card>
        <CardSubHeader>{t("NOC_SITE_COORDINATES_LABEL")}</CardSubHeader>
        {displayData?.coordinates?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("COMMON_LATITUDE1_LABEL")} text={detail?.Latitude1 || "N/A"} />
              <Row label={t("COMMON_LONGITUDE1_LABEL")} text={detail?.Longitude1 || "N/A"} />

              <Row label={t("COMMON_LATITUDE2_LABEL")} text={detail?.Latitude2 || "N/A"} />
              <Row label={t("COMMON_LONGITUDE2_LABEL")} text={detail?.Longitude2 || "N/A"} />
            </StatusTable>
          </div>
        ))}
      </Card> */}

      <Card>
      <CardSubHeader>{t("BPA_UPLOADED _SITE_PHOTOGRAPHS_LABEL")}</CardSubHeader>
      <StatusTable>
         {sitePhotographs?.length > 0 && <CLUSitePhotographs documents={sitePhotographs} coordinates={coordinates}/>}
      </StatusTable>
      </Card>

      {
        applicationDetails?.Clu?.[0]?.applicationStatus && !disableSiteInspectionImage?.includes(applicationDetails?.Clu?.[0]?.applicationStatus) && siteImages?.documents?.length > 0 &&
        <Card>
          <CardSubHeader>{t("BPA_FIELD_INSPECTION_SITE_PHOTOGRAPHS_LABEL")}</CardSubHeader>
          <StatusTable>
          <CLUSitePhotographs documents={siteImages.documents} />
          </StatusTable>
          {   geoLocations?.length > 0 &&
              <React.Fragment>
                <CardSectionHeader style={{ marginBottom: "16px", marginTop: "32px" }}>{t("SITE_INSPECTION_IMAGES_LOCATIONS")}</CardSectionHeader>
                <CustomLocationSearch position={geoLocations}/>
              </React.Fragment>
          }
        </Card>
      }
    

        <Card>
        <CardSubHeader>{t("BPA_UPLOADED_OWNER_ID")}</CardSubHeader>
        <StatusTable>{applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.ownerIds?.length > 0 && <CLUDocumentTableView documents={applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.ownerIds} />}</StatusTable>
        </Card>

        <Card>
        <CardSubHeader>{t("BPA_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
        <StatusTable>{remainingDocs?.length > 0 && <CLUDocumentTableView documents={remainingDocs} />}</StatusTable>
        </Card>

        <Card>
        <CardSubHeader>{t("BPA_FEE_DETAILS_LABEL")}</CardSubHeader>
        {applicationDetails?.Clu?.[0]?.cluDetails && (
          <CLUFeeEstimationDetails
            formData={{
              apiData: { ...applicationDetails },
              applicationDetails: { ...applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.applicationDetails },
              siteDetails: { ...applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.siteDetails },
            }}
            feeType="PAY1"
          />
        )}
        </Card>
    

      {applicationDetails?.Clu?.[0]?.applicationStatus && !disableFeeTable?.includes(applicationDetails?.Clu?.[0]?.applicationStatus) && 
        <Card>
        <CardSubHeader>{t("BPA_FEE_DETAILS_TABLE_LABEL")}</CardSubHeader>
        {applicationDetails?.Clu?.[0]?.cluDetails && (
          <CLUFeeEstimationDetailsTable
            formData={{
              apiData: { ...applicationDetails },
              applicationDetails: { ...applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.applicationDetails },
              siteDetails: { ...applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.siteDetails },
              calculations: applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.calculations || []
            }}
            feeType="PAY2"
            feeAdjustments={feeAdjustments}
            setFeeAdjustments={setFeeAdjustments}
            disable={true}
            applicationStatus={applicationDetails?.Clu?.[0]?.applicationStatus}
          />
        )}
      </Card>
      }

      <CheckBox
        label={`I/We hereby solemnly affirm and declare that I am submitting this application on behalf of the applicant (${
          combinedOwnersName
        }). I/We along with the applicant have read the Policy and understand all the terms and conditions of the Policy. We are committed to fulfill/abide by all the terms and conditions of the Policy. The information/documents submitted are true and correct as per record and no part of it is false and nothing has been concealed/misrepresented therein.`}
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

      <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />

      {actions && actions.length > 0 && (
        <ActionBar>
          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu
              localeKeyPrefix={`WF_EMPLOYEE_BPA`}
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

      {showToast && (
        <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />
      )}
    </div>
  );
};

export default CLUApplicationDetails;