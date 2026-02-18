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
import React, { Fragment, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";


import LayoutFeeEstimationDetails from "../../../pageComponents/LayoutFeeEstimationDetails";
// import LayoutDocumentView from "../../../pageComponents/LayoutDocumentView";
import { getLayoutAcknowledgementData } from "../../../utils/getLayoutAcknowledgementData";
import { amountToWords } from "../../../utils/index";
import NewApplicationTimeline from "../../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
import { LoaderNew } from "../../../components/LoaderNew";

// Component to render document link for owner documents
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

  return (
    <LinkButton
     
      label={t("View") || "View"}
      onClick={() => window.open(url, "_blank")}
    />
  );
};


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

      {wfDocuments?.length > 0 && (
        <div>
          <div>
            <LayoutDocumentTableView documents={wfDocuments} index={index} />
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

const LayoutApplicationSummary = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const [displayData, setDisplayData] = useState({});
  const [loading, setLoading] = useState(false);
  const [feeAdjustments, setFeeAdjustments] = useState([]);

  const { isLoading, data } = Digit.Hooks.obps.useLayoutSearchApplication({ applicationNo: id }, tenantId);
  const applicationDetails = data?.resData;

  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  let user = Digit.UserService.getUser();

  if (window.location.href.includes("/obps") || window.location.href.includes("/layout")) {
    const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
    const userInfo = userInfos ? JSON.parse(userInfos) : {};
    user = userInfo?.value;
  }

  const userRoles = user?.info?.roles?.map((e) => e.code);

  // Statuses where fee table should not be shown
  const disableFeeTable = ["INITIATED", "PENDINGAPPLICATIONPAYMENT", "FIELDINSPECTION_INPROGRESS", "INSPECTION_REPORT_PENDING"];

  // Handle both array and single object for Layout data
  const layoutData = applicationDetails?.Layout?.[0] || applicationDetails?.Layout;

  useEffect(() => {
    if (layoutData) {
      const applicantDetails = layoutData?.layoutDetails?.additionalDetails?.applicationDetails;
      const siteDetails = layoutData?.layoutDetails?.additionalDetails?.siteDetails;
      const coordinates = layoutData?.layoutDetails?.additionalDetails?.coordinates;
      const Documents = layoutData?.documents || [];
      const ownerPhotoList = layoutData?.owners?.map((owner, idx) => ({
        filestoreId: owner?.additionalDetails?.ownerPhoto,
        ownerName: owner?.name,
        index: idx,
      })) || [];

      const finalDisplayData = {
        applicantDetails: applicantDetails ? [applicantDetails] : [],
        siteDetails: siteDetails ? [siteDetails] : [],
        coordinates: coordinates ? [coordinates] : [],
        Documents: Documents.length > 0 ? Documents : [],
        ownerPhotoList: ownerPhotoList,
        owners: layoutData?.owners || [],
      };

      setDisplayData(finalDisplayData);
    }
  }, [layoutData]);

  useEffect(() => {
    const latestCalc = layoutData?.layoutDetails?.additionalDetails?.calculations?.find((c) => c?.isLatest);
    if (latestCalc?.taxHeadEstimates) {
      setFeeAdjustments(latestCalc.taxHeadEstimates);
    }
  }, [layoutData]);

  const handleDownloadPdf = async () => {
    try {
      setLoading(true);
      const Property = applicationDetails?.Layout?.[0];
      const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
      const ulbType = tenantInfo?.city?.ulbType;
      const acknowledgementData = await getLayoutAcknowledgementData(Property, tenantInfo, ulbType, t);
      await Digit.Utils.pdf.generateFormatted(acknowledgementData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "layout",
      consumerCodes: id,
      isEmployee: false,
    },
    { enabled: id ? true : false }
  );

  const dowloadOptions = [];
  if (layoutData?.applicationStatus === "APPROVED") {
    dowloadOptions.push({
      label: t("DOWNLOAD_CERTIFICATE"),
      onClick: handleDownloadPdf,
    });

    if (reciept_data && reciept_data?.Payments.length > 0 && !recieptDataLoading) {
      dowloadOptions.push({
        label: t("CHB_FEE_RECEIPT"),
        onClick: () => getRecieptSearch({ tenantId: tenantId, payments: reciept_data?.Payments[0] }),
      });
    }
  }

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

  const businessServiceCode = layoutData?.layoutDetails?.additionalDetails?.siteDetails?.businessService || "";

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: businessServiceCode,
  });

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

  function onActionSelect(action) {
    console.log("selected action", action);
    const appNo = layoutData?.applicationNo;
    const applicationStatus = layoutData?.applicationStatus;

    const payload = {
      Licenses: [action],
    };

    if (action?.action == "EDIT") {
      history.push(`/digit-ui/citizen/obps/layout/edit-application/${appNo}`);
    } else if (action?.action == "DRAFT") {
      setShowToast({ key: "true", warning: true, message: "COMMON_EDIT_APPLICATION_BEFORE_SAVE_OR_SUBMIT_LABEL" });
      setTimeout(()=>{setShowToast(null);},3000)
    } else if (action?.action == "APPLY" || action?.action == "RESUBMIT" || action?.action == "CANCEL") {
      submitAction(payload);
    } else if (action?.action == "PAY") {
      const code = applicationStatus === "PENDINGAPPLICATIONPAYMENT" ? "LAYOUT.PAY1" : "LAYOUT.PAY2";
      history.push(`/digit-ui/citizen/payment/collect/${code}/${appNo}/${tenantId}?tenantId=${tenantId}`);
    } else {
      setSelectedAction(action);
    }
  }

  const submitAction = async (data) => {
    const payloadData = layoutData || {};

    const updatedApplicant = {
      ...payloadData,
      workflow: {},
    };

    const filtData = data?.Licenses?.[0];

    updatedApplicant.workflow = {
      action: filtData.action,
      assignes: filtData?.assignee,
      comment: filtData?.comment,
      documents: filtData?.wfDocuments,
    };

    const finalPayload = {
      Layout: { ...updatedApplicant },
    };

    try {
      const response = await Digit.OBPSService.LayoutUpdate({ tenantId, ...finalPayload });

      if (response?.ResponseInfo?.status === "successful") {
        if (filtData?.action === "CANCEL") {
          setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" });
          workflowDetails.revalidate();
          setSelectedAction(null);
        } else {
          history.replace({
            pathname: `/digit-ui/citizen/obps/layout/response/${response?.Layout?.[0]?.applicationNo}`,
            state: { data: response },
          });
        }
      } else {
        setShowToast({ key: "true", warning: true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" });
        setSelectedAction(null);
      }
    } catch (err) {
      setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" });
    } finally {
      setTimeout(()=>{setShowToast(null);},3000);
    }
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

  const coordinates = layoutData?.layoutDetails?.additionalDetails?.coordinates;
  const sitePhotographs = displayData?.Documents?.filter((doc)=> (doc?.documentType === "OWNER.SITEPHOTOGRAPHONE" || doc?.documentType === "OWNER.SITEPHOTOGRAPHTWO"));
  const remainingDocs = displayData?.Documents?.filter((doc)=> !(doc?.documentType === "OWNER.SITEPHOTOGRAPHONE" || doc?.documentType === "OWNER.SITEPHOTOGRAPHTWO"));

  const ownersList = displayData?.owners?.map((item)=> item.name);
  const combinedOwnersName = ownersList?.join(", ");

  if (isLoading || loading) {
    return <LoaderNew page={true} />;
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

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: window.innerWidth > 768 ? "24px" : "0",
      }}>

      {/* APPLICATION INFO */}
      <div>
      
        <StatusTable>
          <Row label={t("Application No")} text={layoutData?.applicationNo || "N/A"} />
          <Row label={t("Application Status")} text={layoutData?.applicationStatus || "N/A"} />
        </StatusTable>
      </div>

{console.log("displayData", displayData)}
      {/* APPLICANT DETAILS */}
      <div>
        <CardSubHeader>{t("Applicant Details")}</CardSubHeader>
        <StatusTable>
          {displayData?.owners?.map((owner, idx) => (
            <React.Fragment key={idx}>
              {renderLabel(idx === 0 ? t("BPA_PRIMARY_OWNER") : `${t("OWNER")} ${idx + 1}`, owner?.name)}
              {renderLabel(t("BPA_APPLICANT_EMAIL_LABEL"), owner?.emailId)}
              {renderLabel(t("BPA_APPLICANT_MOBILE_NO_LABEL"), owner?.mobileNumber)}
              {renderLabel("PAN Number", owner?.pan)}
              {renderLabel("Gender", owner?.gender)}
              {renderLabel(t("BPA_APPLICANT_ADDRESS_LABEL"), owner?.permanentAddress)}
              

              
              {idx < displayData?.owners?.length - 1 && <hr style={{ margin: "10px 0" }} />}
            </React.Fragment>
          ))}
        </StatusTable>
      </div>

      {/* PROFESSIONAL DETAILS */}
      {displayData?.applicantDetails?.[0]?.professionalName && (
        <div>
          <CardSubHeader>{t("BPA_PROFESSIONAL_DETAILS")}</CardSubHeader>
          <StatusTable>
            {renderLabel(t("BPA_PROFESSIONAL_NAME_LABEL"), displayData?.applicantDetails?.[0]?.professionalName)}
            {renderLabel(t("BPA_PROFESSIONAL_EMAIL_LABEL"), displayData?.applicantDetails?.[0]?.professionalEmailId)}
            {renderLabel(t("BPA_PROFESSIONAL_REGISTRATION_ID_LABEL"), displayData?.applicantDetails?.[0]?.professionalRegId)}
            {renderLabel(t("BPA_PROFESSIONAL_MOBILE_NO_LABEL"), displayData?.applicantDetails?.[0]?.professionalMobileNumber)}
            {renderLabel(t("BPA_PROFESSIONAL_ADDRESS_LABEL"), displayData?.applicantDetails?.[0]?.professionalAddress)}
            {renderLabel("Professional Registration Validity", displayData?.applicantDetails?.[0]?.professionalRegistrationValidity)}
            {renderLabel("PAN Number", displayData?.applicantDetails?.[0]?.panNumber)}
          </StatusTable>
        </div>
      )}

      {/* APPLICANT AND PROFESSIONAL DOCUMENTS */}
      {(() => {
        const applicantDocuments = [];
        
        // Collect owner documents
        displayData?.owners?.forEach((owner, ownerIdx) => {
          if (owner?.additionalDetails?.panDocument) {
            applicantDocuments.push({
              documentType: "OWNER_PAN_DOCUMENT",
              documentUid: owner?.additionalDetails?.panDocument,
              filestoreId: owner?.additionalDetails?.panDocument,
            });
          }
          if (owner?.additionalDetails?.documentFile) {
            applicantDocuments.push({
              documentType: "OWNER_PRIMARY_DOCUMENT",
              documentUid: owner?.additionalDetails?.documentFile,
              filestoreId: owner?.additionalDetails?.documentFile,
            });
          }
          if (owner?.additionalDetails?.ownerPhoto) {
            applicantDocuments.push({
              documentType: "OWNER_PHOTO",
              documentUid: owner?.additionalDetails?.ownerPhoto,
              filestoreId: owner?.additionalDetails?.ownerPhoto,
            });
          }
        });
        
        // Collect professional documents
        if (displayData?.applicantDetails?.[0]?.primaryOwnerDocument) {
          applicantDocuments.push({
            documentType: "PROFESSIONAL_DOCUMENT",
            documentUid: displayData?.applicantDetails?.[0]?.primaryOwnerDocument,
            filestoreId: displayData?.applicantDetails?.[0]?.primaryOwnerDocument,
          });
        }
        if (displayData?.applicantDetails?.[0]?.primaryOwnerPhoto) {
          applicantDocuments.push({
            documentType: "PROFESSIONAL_PHOTO",
            documentUid: displayData?.applicantDetails?.[0]?.primaryOwnerPhoto,
            filestoreId: displayData?.applicantDetails?.[0]?.primaryOwnerPhoto,
          });
        }

        return applicantDocuments?.length > 0 && (
          <div>
            <CardSubHeader>{t("Applicant and Professional Documents")}</CardSubHeader>
            <LayoutDocumentTableView documents={applicantDocuments} />
          </div>
        );
      })()}

      {/* SITE DETAILS */}
      <div>
        <CardSubHeader>{t("BPA_SITE_DETAILS")}</CardSubHeader>
        <StatusTable>
          {displayData?.siteDetails?.[0] && (
            <>
              {renderLabel(t("BPA_PLOT_NO_LABEL"), displayData?.siteDetails?.[0]?.plotNo)}
              {renderLabel(t("BPA_PLOT_AREA_LABEL"), displayData?.siteDetails?.[0]?.specificationPlotArea)}
              {renderLabel("Net Total Area", displayData?.siteDetails?.[0]?.netTotalArea)}
              {renderLabel(t("BPA_PROPOSED_SITE_ADDRESS"), displayData?.siteDetails?.[0]?.proposedSiteAddress)}
              {renderLabel(t("BPA_ULB_NAME_LABEL"), displayData?.siteDetails?.[0]?.ulbName?.name || displayData?.siteDetails?.[0]?.ulbName)}
              {renderLabel("ULB Type", displayData?.siteDetails?.[0]?.ulbType)}
              {renderLabel(t("BPA_KHASRA_NO_LABEL"), displayData?.siteDetails?.[0]?.khasraNo)}
              {renderLabel("Khanuti No", displayData?.siteDetails?.[0]?.khanutiNo)}
              {renderLabel(t("BPA_HADBAST_NO_LABEL"), displayData?.siteDetails?.[0]?.hadbastNo)}
              {renderLabel(t("BPA_ROAD_TYPE_LABEL"), displayData?.siteDetails?.[0]?.roadType?.name || displayData?.siteDetails?.[0]?.roadType)}
              {renderLabel("Road Width at Site (m)", displayData?.siteDetails?.[0]?.roadWidthAtSite)}
              {renderLabel(t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"), displayData?.siteDetails?.[0]?.areaLeftForRoadWidening)}
              {renderLabel(t("BPA_NET_PLOT_AREA_AFTER_WIDENING_LABEL"), displayData?.siteDetails?.[0]?.netPlotAreaAfterWidening)}
              {renderLabel(t("BPA_SITE_WARD_NO_LABEL"), displayData?.siteDetails?.[0]?.wardNo)}
              {renderLabel(t("BPA_DISTRICT_LABEL"), displayData?.siteDetails?.[0]?.district?.name || displayData?.siteDetails?.[0]?.district)}
              {renderLabel(t("BPA_ZONE_LABEL"), displayData?.siteDetails?.[0]?.zone)}
              {renderLabel(t("BPA_SITE_VASIKA_NO_LABEL"), displayData?.siteDetails?.[0]?.vasikaNumber)}
              {renderLabel(t("BPA_SITE_VASIKA_DATE_LABEL"), formatDate(displayData?.siteDetails?.[0]?.vasikaDate))}
              {renderLabel(t("BPA_SITE_VILLAGE_NAME_LABEL"), displayData?.siteDetails?.[0]?.villageName)}
              
              {/* Additional Site Details */}
              {renderLabel("CLU Type", displayData?.siteDetails?.[0]?.cluType)}
              {renderLabel("CLU Number", displayData?.siteDetails?.[0]?.cluNumber)}
              {renderLabel("CLU is Approved", displayData?.siteDetails?.[0]?.cluIsApproved?.name || displayData?.siteDetails?.[0]?.cluIsApproved?.code)}
              {renderLabel("CLU Approval Date", formatDate(displayData?.siteDetails?.[0]?.cluApprovalDate))}
              {renderLabel("Is CLU Required", displayData?.siteDetails?.[0]?.isCluRequired)}
              {renderLabel("Residential Type", displayData?.siteDetails?.[0]?.residentialType?.name || displayData?.siteDetails?.[0]?.residentialType)}
              {renderLabel("Building Category", displayData?.siteDetails?.[0]?.buildingCategory?.name || displayData?.siteDetails?.[0]?.buildingCategory)}
              {renderLabel("Building Status", displayData?.siteDetails?.[0]?.buildingStatus)}
              {renderLabel("Layout Area Type", displayData?.siteDetails?.[0]?.layoutAreaType?.name || displayData?.siteDetails?.[0]?.layoutAreaType)}
              {renderLabel("Layout Scheme Name", displayData?.siteDetails?.[0]?.layoutSchemeName)}
              {renderLabel("Type of Application", displayData?.siteDetails?.[0]?.typeOfApplication?.name || displayData?.siteDetails?.[0]?.typeOfApplication)}
              {renderLabel("Is Area Under Master Plan", displayData?.siteDetails?.[0]?.isAreaUnderMasterPlan?.name || displayData?.siteDetails?.[0]?.isAreaUnderMasterPlan?.code)}
              
              {/* Area Breakdown */}
              {renderLabel("Area Under EWS (Sq.M)", displayData?.siteDetails?.[0]?.areaUnderEWS)}
              {renderLabel("Area Under Road (Sq.M)", displayData?.siteDetails?.[0]?.areaUnderRoadInSqM)}
              {renderLabel("Area Under Road (%)", displayData?.siteDetails?.[0]?.areaUnderRoadInPct)}
              {renderLabel("Area Under Park (Sq.M)", displayData?.siteDetails?.[0]?.areaUnderParkInSqM)}
              {renderLabel("Area Under Park (%)", displayData?.siteDetails?.[0]?.areaUnderParkInPct)}
              {renderLabel("Area Under Parking (Sq.M)", displayData?.siteDetails?.[0]?.areaUnderParkingInSqM)}
              {renderLabel("Area Under Parking (%)", displayData?.siteDetails?.[0]?.areaUnderParkingInPct)}
              {renderLabel("Area Under Other Amenities (Sq.M)", displayData?.siteDetails?.[0]?.areaUnderOtherAmenitiesInSqM)}
              {renderLabel("Area Under Other Amenities (%)", displayData?.siteDetails?.[0]?.areaUnderOtherAmenitiesInPct)}
              {renderLabel("Area Under Residential Use (Sq.M)", displayData?.siteDetails?.[0]?.areaUnderResidentialUseInSqM)}
              {renderLabel("Area Under Residential Use (%)", displayData?.siteDetails?.[0]?.areaUnderResidentialUseInPct)}
              
              {/* Floor Area Details */}
              {displayData?.siteDetails?.[0]?.floorArea && displayData?.siteDetails?.[0]?.floorArea?.length > 0 && (
                <React.Fragment>
                  {displayData?.siteDetails?.[0]?.floorArea?.map((floor, idx) => 
                    renderLabel(`Floor ${idx + 1} Area (Sq.M)`, floor?.value)
                  )}
                </React.Fragment>
              )}
            </>
          )}
        </StatusTable>
      </div>

      {/* SITE PHOTOGRAPHS */}
      {sitePhotographs?.length > 0 && (
        <div>
          <CardSubHeader>{t("Uploaded Site Photographs")}</CardSubHeader>
          <LayoutSitePhotographs documents={sitePhotographs} coordinates={coordinates} />
        </div>
      )}

      {/* DOCUMENTS */}
      {displayData?.Documents?.length > 0 && (
        <div>
          <CardSubHeader>{t("Documents Uploaded")}</CardSubHeader>
          <LayoutDocumentTableView documents={displayData?.Documents} />
        </div>
      )}

      {/* FEE DETAILS */}
      {layoutData?.layoutDetails && (
        <div>
          <CardSubHeader>{t("Fee Details")}</CardSubHeader>
          <LayoutFeeEstimationDetails
            formData={{
              apiData: { ...applicationDetails },
              applicationDetails: { ...layoutData?.layoutDetails?.additionalDetails?.applicationDetails },
              siteDetails: { ...layoutData?.layoutDetails?.additionalDetails?.siteDetails },
            }}
            feeType="PAY1"
          />
        </div>
      )}

      {/* FEE DETAILS TABLE - Only show if status is not in disableFeeTable */}
      {layoutData?.applicationStatus && !disableFeeTable?.includes(layoutData?.applicationStatus) &&
        <div>
          <CardSubHeader>{t("Fee Details Table")}</CardSubHeader>
          {layoutData?.layoutDetails && (
            <LayoutFeeEstimationDetailsTable
              formData={{
                apiData: { ...applicationDetails },
                applicationDetails: { ...layoutData?.layoutDetails?.additionalDetails?.applicationDetails },
                siteDetails: { ...layoutData?.layoutDetails?.additionalDetails?.siteDetails },
                calculations: layoutData?.layoutDetails?.additionalDetails?.calculations || []
              }}
              feeType="PAY2"
              feeAdjustments={feeAdjustments}
              setFeeAdjustments={setFeeAdjustments}
              disable="true"
            />
          )}
        </div>
      }

      <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />

      {actions && actions.length > 0 && (
        <ActionBar>
          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu
              localeKeyPrefix={`WF_EMPLOYEE_LAYOUT`}
              options={actions}
              optionKey={"action"}
              t={t}
              onSelect={onActionSelect}
            />
          ) : null}
          <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
        </ActionBar>
      )}

      {showToast && (
        <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />
      )}
      </div>
    </div>
  );
};

export default LayoutApplicationSummary;