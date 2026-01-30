import {
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
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import LayoutModal from "../../../pageComponents/LayoutModal";
import LayoutFeeEstimationDetailsTable from "../../../pageComponents/LayoutFeeEstimationDetailsTable";
import NOCDocument from "../../../../../noc/src/pageComponents/NOCDocument";
import { getLayoutAcknowledgementData } from "../../../utils/getLayoutAcknowledgementData";
import LayoutDocumentView from "../../citizen/Applications/LayoutDocumentView";
import { Loader } from "../../../config/Loader";
import NewApplicationTimeline from "../../../../../templates/ApplicationDetails/components/NewApplicationTimeline";

const getTimelineCaptions = (checkpoint, index, arr, t) => {
  console.log("checkpoint here", checkpoint);
  const { wfComment: comment, thumbnailsToShow, wfDocuments } = checkpoint;
  console.log("wfDocuments", wfDocuments);
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

  const { isLoading, data } = Digit.Hooks.obps.useLayoutSearchApplication({ applicationNo: id }, tenantId, {
    cacheTime: 0,
  });
  const applicationDetails = data?.resData;
  console.log("applicationDetails here==>", applicationDetails);

const workflowDetails = Digit.Hooks.useWorkflowDetails({
  tenantId: tenantId,
  id: id,
  moduleCode: applicationDetails?.layoutDetails?.additionalDetails?.siteDetails?.businessService || "Layout_mcUp",
});

  console.log("workflowDetails here=>", workflowDetails);
  console.log("next employee ======>", data,applicationDetails,applicationDetails?.businessService);

  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

useEffect(() => {
  let WorkflowService = null;
  const businessService = applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails?.businessService;
  
  console.log("  Business service:", businessService);
  console.log("  Tenant ID:", tenantId);
  
  if (businessService && tenantId) {
    (async () => {
      setLoader(true);
      try {
        WorkflowService = await Digit.WorkflowService.init(tenantId, businessService);
        const states = WorkflowService?.BusinessServices?.[0]?.states || [];
        console.log("  Setting workflowService state with", states.length, "states");
        setWorkflowService(states);
      } catch (error) {
        console.error("  Error fetching workflow service:", error);
      } finally {
        setLoader(false);
      }
    })();
  } else {
    console.log("  Skipping workflow load - missing business service or tenant");
  }
}, [tenantId, applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails?.businessService]);
  let user = Digit.UserService.getUser();
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
    user = userInfo?.value;
  }

  const userRoles = user?.info?.roles?.map((e) => e.code);
  const actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  console.log("actions here", actions);

  useEffect(() => {
    const layoutObject = applicationDetails?.Layout?.[0];
    console.log(layoutObject, "layoutObject---in---useEffect");

    if (layoutObject) {
      const applicantDetails = layoutObject?.layoutDetails?.additionalDetails?.applicationDetails;
      const siteDetails = layoutObject?.layoutDetails?.additionalDetails?.siteDetails;
      const coordinates = layoutObject?.layoutDetails?.additionalDetails?.coordinates;
      const Documents = layoutObject?.documents || [];

      const finalDisplayData = {
        applicantDetails: applicantDetails ? [applicantDetails] : [],
        siteDetails: siteDetails ? [siteDetails] : [],
        coordinates: coordinates ? [coordinates] : [],
        Documents: Documents.length > 0 ? Documents : [],
      };

      setDisplayData(finalDisplayData);
    }
  }, [applicationDetails?.Layout]);

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
    console.log(" useEffect triggered - id changed to:", id);

    if (workflowDetails) {
      workflowDetails.revalidate();
    }

    if (data) {
      data.revalidate();
    }
  }, [id]);

  const submitAction = async (data) => {
    console.log(" submitAction called with data:", data);
    setIsSubmitting(true);

    try {
      const filtData = data?.Licenses?.[0];
      console.log(" filtData:", filtData);

      if (!filtData) {
        console.error(" ERROR: filtData is undefined");
        setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" });
        setIsSubmitting(false);
        return;
      }

      const layoutObject = applicationDetails?.Layout?.[0];
      console.log(" layoutObject:", layoutObject);

      if (!layoutObject) {
        console.error(" ERROR: layoutObject is undefined");
        setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" });
        setIsSubmitting(false);
        return;
      }

      // Ensure all nested data is properly preserved
      const updatedApplicant = {
        ...layoutObject,
        layoutDetails: {
          ...layoutObject?.layoutDetails,
          additionalDetails: {
            ...layoutObject?.layoutDetails?.additionalDetails,
            applicationDetails: {
              ...layoutObject?.layoutDetails?.additionalDetails?.applicationDetails,
            },
            siteDetails: {
              ...layoutObject?.layoutDetails?.additionalDetails?.siteDetails,
            },
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

      console.log(" finalPayload:", JSON.stringify(finalPayload, null, 2));

      const response = await Digit.OBPSService.LayoutUpdate(finalPayload, tenantId);
      console.log(" API response:", response);

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
          console.log("We are calling employee response page");
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
      
    }finally {
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

  console.log("check action === ", action);

  const filterNexState = action?.state?.actions?.filter((item) => item.action == action?.action);
  console.log("check filterNexState=== ", filterNexState[0]?.nextState );

  const filterRoles = getWorkflowService?.filter((item) => item?.uuid == filterNexState[0]?.nextState);

  console.log("check getWorkflowService === ", getWorkflowService);
  console.log(filterRoles, "filterRoles");
  
  // <CHANGE> Added detailed logging and fallback to empty array
  const nextStateRoles = filterRoles?.[0]?.actions || [];
  console.log("  Next state roles to filter employees:", nextStateRoles);
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
  } else {
    // <CHANGE> Log before opening modal to verify employees are set
    console.log("  Opening modal with filtered employees:", nextStateRoles);
    setShowModal(true);
    setSelectedAction(action);
  }
}

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

  // Helper function to render label-value pairs only when value exists
  const renderLabel = (label, value) => {
    if (!value || value === "NA" || value === "" || value === null || value === undefined) {
      return null;
    }
    
    // Extract value from object if it has 'name' property
    let displayValue = value;
    if (typeof value === 'object' && value !== null) {
      displayValue = value?.name || value?.code || JSON.stringify(value);
    }

    return (
      <Row 
        label={label} 
        text={displayValue} 
      />
    );
  };

  console.log("displayData here", displayData);

  const handleViewTimeline = () => {
    setViewTimeline(true);
    const timelineSection = document.getElementById("timeline");
    if (timelineSection) timelineSection.scrollIntoView({ behavior: "smooth" });
  };

  const RenderRow = ({ label, value }) => {
    if (!value) return null;
    return <Row label={label} text={value} />;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={"employee-main-application-details"}>
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

      {displayData?.applicantDetails?.professionalName &&
        displayData?.applicantDetails?.map((detail, index) => (
          <React.Fragment key={index}>
            <Card>
              <CardSubHeader>{t("LAYOUT_PROFESSIONAL_DETAILS")}</CardSubHeader>
              <div style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
                <StatusTable>
                  <Row label={t("NOC_PROFESSIONAL_NAME_LABEL")} text={detail?.professionalName || "N/A"} />
                  <Row label={t("NOC_PROFESSIONAL_EMAIL_LABEL")} text={detail?.professionalEmailId || "N/A"} />
                  <Row label={t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL")} text={detail?.professionalRegId || "N/A"} />
                  <Row label={t("NOC_PROFESSIONAL_MOBILE_NO_LABEL")} text={detail?.professionalMobileNumber || "N/A"} />
                  <Row label={t("NOC_PROFESSIONAL_ADDRESS_LABEL")} text={detail?.professionalAddress || "N/A"} />
                </StatusTable>
              </div>
            </Card>
          </React.Fragment>
        ))}

      {/* -------------------- APPLICANT DETAILS -------------------- */}
      <Card>
        <CardSubHeader>{t("LAYOUT_APPLICANT_DETAILS")}</CardSubHeader>
        {displayData?.applicantDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <RenderRow label={t("NOC_FIRM_OWNER_NAME_LABEL")} value={detail?.applicantOwnerOrFirmName} />
              <RenderRow label={t("NOC_APPLICANT_EMAIL_LABEL")} value={detail?.applicantEmailId} />
              <RenderRow label={t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL")} value={detail?.applicantFatherHusbandName} />
              <RenderRow label={t("NOC_APPLICANT_MOBILE_NO_LABEL")} value={detail?.applicantMobileNumber} />
              <RenderRow label={t("NOC_APPLICANT_DOB_LABEL")} value={detail?.applicantDateOfBirth} />
              <RenderRow label={t("NOC_APPLICANT_GENDER_LABEL")} value={detail?.applicantGender?.code || detail?.applicantGender} />
              <RenderRow label={t("NOC_APPLICANT_ADDRESS_LABEL")} value={detail?.applicantAddress} />
              <RenderRow label={t("NOC_APPLICANT_PROPERTY_ID_LABEL")} value={detail?.applicantPropertyId} />
            </StatusTable>
          </div>
        ))}
      </Card>

      {/* -------------------- PROFESSIONAL DETAILS -------------------- */}
      {displayData?.applicantDetails?.[0]?.professionalName &&
        displayData?.applicantDetails?.map((detail, index) => (
          <Card key={index}>
            <CardSubHeader>{t("LAYOUT_PROFESSIONAL_DETAILS")}</CardSubHeader>
            <div style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
              <StatusTable>
                <RenderRow label={t("NOC_PROFESSIONAL_NAME_LABEL")} value={detail?.professionalName} />
                <RenderRow label={t("NOC_PROFESSIONAL_EMAIL_LABEL")} value={detail?.professionalEmailId} />
                <RenderRow label={t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL")} value={detail?.professionalRegId} />
                <RenderRow label={t("NOC_PROFESSIONAL_MOBILE_NO_LABEL")} value={detail?.professionalMobileNumber} />
                <RenderRow label={t("NOC_PROFESSIONAL_ADDRESS_LABEL")} value={detail?.professionalAddress} />
                <RenderRow label={t("BPA_CERTIFICATE_EXPIRY_DATE")} value={detail?.professionalRegistrationValidity} />
              </StatusTable>
            </div>
          </Card>
        ))}

      {/* -------------------- SITE DETAILS -------------------- */}
      <Card>
        <CardSubHeader>{t("LAYOUT_SITE_DETAILS")}</CardSubHeader>
        {displayData?.siteDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              {renderLabel(t("NOC_PLOT_NO_LABEL"), detail?.plotNo)}
              {renderLabel(t("BPA_PLOT_AREA_LABEL"), detail?.specificationPlotArea)}
              {renderLabel("Net Total Area", detail?.netTotalArea)}
              {renderLabel(t("NOC_PROPOSED_SITE_ADDRESS"), detail?.proposedSiteAddress)}
              {renderLabel(t("NOC_ULB_NAME_LABEL"), detail?.ulbName?.name || detail?.ulbName)}
              {renderLabel("ULB Type", detail?.ulbType)}
              {renderLabel(t("NOC_KHASRA_NO_LABEL"), detail?.khasraNo)}
              {renderLabel("Khanuti No", detail?.khanutiNo)}
              {renderLabel(t("NOC_HADBAST_NO_LABEL"), detail?.hadbastNo)}
              {renderLabel(t("NOC_ROAD_TYPE_LABEL"), detail?.roadType?.name || detail?.roadType)}
              {renderLabel("Road Width at Site (m)", detail?.roadWidthAtSite)}
              {renderLabel(t("NOC_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"), detail?.areaLeftForRoadWidening)}
              {renderLabel(t("NOC_NET_PLOT_AREA_AFTER_WIDENING_LABEL"), detail?.netPlotAreaAfterWidening)}
              {renderLabel(t("NOC_SITE_WARD_NO_LABEL"), detail?.wardNo)}
              {renderLabel(t("NOC_DISTRICT_LABEL"), detail?.district?.name || detail?.district)}
              {renderLabel(t("NOC_ZONE_LABEL"), detail?.zone)}
              {renderLabel(t("NOC_SITE_VASIKA_NO_LABEL"), detail?.vasikaNumber)}
              {renderLabel(t("NOC_SITE_VASIKA_DATE_LABEL"), formatDate(detail?.vasikaDate))}
              {renderLabel(t("NOC_SITE_VILLAGE_NAME_LABEL"), detail?.villageName)}
              
              {/* Additional Site Details */}
              {renderLabel("CLU Type", detail?.cluType)}
              {renderLabel("CLU Number", detail?.cluNumber)}
              {renderLabel("CLU is Approved", detail?.cluIsApproved?.name || detail?.cluIsApproved?.code)}
              {renderLabel("CLU Approval Date", formatDate(detail?.cluApprovalDate))}
              {renderLabel("Is CLU Required", detail?.isCluRequired)}
              {renderLabel("Residential Type", detail?.residentialType?.name || detail?.residentialType)}
              {renderLabel("Building Category", detail?.buildingCategory?.name || detail?.buildingCategory)}
              {renderLabel("Building Status", detail?.buildingStatus)}
              {renderLabel("Layout Area Type", detail?.layoutAreaType?.name || detail?.layoutAreaType)}
              {renderLabel("Layout Scheme Name", detail?.layoutSchemeName)}
              {renderLabel("Type of Application", detail?.typeOfApplication?.name || detail?.typeOfApplication)}
              {renderLabel("Is Area Under Master Plan", detail?.isAreaUnderMasterPlan?.name || detail?.isAreaUnderMasterPlan?.code)}
              
              {/* Area Breakdown */}
              {renderLabel("Area Under EWS (Sq.M)", detail?.areaUnderEWS)}
              {renderLabel("Area Under Road (Sq.M)", detail?.areaUnderRoadInSqM)}
              {renderLabel("Area Under Road (%)", detail?.areaUnderRoadInPct)}
              {renderLabel("Area Under Park (Sq.M)", detail?.areaUnderParkInSqM)}
              {renderLabel("Area Under Park (%)", detail?.areaUnderParkInPct)}
              {renderLabel("Area Under Parking (Sq.M)", detail?.areaUnderParkingInSqM)}
              {renderLabel("Area Under Parking (%)", detail?.areaUnderParkingInPct)}
              {renderLabel("Area Under Other Amenities (Sq.M)", detail?.areaUnderOtherAmenitiesInSqM)}
              {renderLabel("Area Under Other Amenities (%)", detail?.areaUnderOtherAmenitiesInPct)}
              {renderLabel("Area Under Residential Use (Sq.M)", detail?.areaUnderResidentialUseInSqM)}
              {renderLabel("Area Under Residential Use (%)", detail?.areaUnderResidentialUseInPct)}
              
              {/* Floor Area Details */}
              {detail?.floorArea && detail?.floorArea?.length > 0 && (
                <>
                  {detail?.floorArea?.map((floor, idx) => 
                    renderLabel(`Floor ${idx + 1} Area (Sq.M)`, floor?.value)
                  )}
                </>
              )}
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
      {displayData?.coordinates && displayData.coordinates.length > 0 && (
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
      )}

      {/* 2️⃣ DOCUMENTS CARD */}
      {displayData?.Documents && displayData.Documents.length > 0 && (
        <Card>
          <CardSubHeader>{t("LAYOUT_DOCUMENTS_UPLOADED")}</CardSubHeader>
          <StatusTable>
            <LayoutDocumentView documents={displayData.Documents} />
          </StatusTable>
        </Card>
      )}

      {/* 3️⃣ FEE DETAILS CARD */}
      {(applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.applicationDetails || applicationDetails?.Layout?.layoutDetails?.additionalDetails?.applicationDetails) && (
        <Card>
          <CardSubHeader>{t("LAYOUT_FEE_DETAILS_LABEL")}</CardSubHeader>

          <LayoutFeeEstimationDetailsTable
            formData={{
              apiData: applicationDetails?.Layout?.[0] || applicationDetails?.Layout,
              applicationDetails: {
                ...applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.applicationDetails || applicationDetails?.Layout?.layoutDetails?.additionalDetails?.applicationDetails,
              },
              siteDetails: {
                ...applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails || applicationDetails?.Layout?.layoutDetails?.additionalDetails?.siteDetails,
              },
              calculations: applicationDetails?.Layout?.[0]?.layoutDetails?.additionalDetails?.calculations || applicationDetails?.Layout?.layoutDetails?.additionalDetails?.calculations || []
            }}
            feeType="PAY1"
            feeAdjustments={[]}
            setFeeAdjustments={() => {}}
            disable={false}
          />
        </Card>
      )}

      <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />

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

      {/* {(isLoading || getLoader) && <Loader page={true} />} */}
       {(isLoading || isDetailsLoading || getLoader) && <Loader page={true} />}
    </div>
  );
};

export default LayoutEmployeeApplicationOverview;
