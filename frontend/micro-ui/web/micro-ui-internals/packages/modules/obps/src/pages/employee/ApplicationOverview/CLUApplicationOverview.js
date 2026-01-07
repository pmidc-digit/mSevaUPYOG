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
} from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { composeInitialProps, useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import CLUDocumentTableView from "../../../pageComponents/CLUDocumentTableView";
import CLUFeeEstimationDetails from "../../../pageComponents/CLUFeeEstimationDetails";
import CLUDocumentView from "../../../pageComponents/CLUDocumentView";
import { getCLUAcknowledgementData } from "../../../utils/getCLUAcknowledgementData";
import CLUModal from "../../../pageComponents/CLUModal";
import NewApplicationTimeline from "../../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
import CLUImageView from "../../../pageComponents/CLUImgeView";


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

const CLUEmployeeApplicationDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const state = tenantId?.split(".")[0];
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);

  const [showErrorToast, setShowErrorToastt] = useState(null);
  const [errorOne, setErrorOne] = useState(null);
  const [displayData, setDisplayData] = useState({});

  const [getEmployees, setEmployees] = useState([]);
  const [getLoader, setLoader] = useState(false);
  const [getWorkflowService, setWorkflowService] = useState([]);

  const { isLoading, data } = Digit.Hooks.obps.useCLUSearchApplication({ applicationNo: id }, tenantId);
  const applicationDetails = data?.resData;
  console.log("applicationDetails here==>", applicationDetails);

  const businessServiceCode = applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.siteDetails?.businessService ?? null;
  console.log("businessService here", businessServiceCode);
  
  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: businessServiceCode,//dynamic moduleCode
  });

  console.log("workflowDetails here=>", workflowDetails);

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
        console.log("wf=>", wf);
        setLoader(false);
        setWorkflowService(wf?.BusinessServices?.[0]?.states);
      }catch(e){
         console.error(e);
      }finally{
        setLoader(false);
      }
     })();
    
  }, [tenantId, businessServiceCode, isLoading]);


 // console.log("getWorkflowService =>", getWorkflowService);

  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    }
  }, [applicationDetails?.Clu]);

  function onActionSelect(action) {
    console.log("selected action", action);
    const appNo = applicationDetails?.Clu?.[0]?.applicationNo;

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
    } else if (action?.action == "APPLY" || action?.action == "RESUBMIT" || action?.action == "CANCEL") {
      submitAction(payload);
    } else if (action?.action == "PAY") {
      history.push(`/digit-ui/employee/payment/collect/clu/${appNo}/${tenantId}?tenantId=${tenantId}`);
    } else {
      setShowModal(true);
      setSelectedAction(action);
    }
  }

  const submitAction = async (data) => {
    const payloadData = applicationDetails?.Clu?.[0] || {};
    // console.log("data ==>", data);

    const updatedApplicant = {
      ...payloadData,
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

  console.log("displayData here", displayData);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={"employee-main-application-details"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
        <Header styles={{ fontSize: "32px" }}>{t("BPA_APP_OVERVIEW_HEADER")}</Header>
      </div>

      <Card>
        <CardSubHeader>{t("OWNER_OWNERPHOTO")}</CardSubHeader>
        <CLUImageView ownerFileStoreId={displayData?.ownerPhotoList?.[0]?.filestoreId} ownerName={displayData?.applicantDetails?.[0]?.owners?.[0]?.ownerOrFirmName} />
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
                <Row label={t("BPA_SCHEME_NAME_LABEL")} text={detail?.localitySchemeName || "N/A"} />
              )}
              {detail?.localityAreaType?.code === "APPROVED_COLONY" && (
                <Row label={t("BPA_APPROVED_COLONY_NAME_LABEL")} text={detail?.localityApprovedColonyName || "N/A"} />
              )}
              {detail?.localityAreaType?.code === "NON_SCHEME" && (
                <Row label={t("BPA_NON_SCHEME_TYPE_LABEL")} text={detail?.localityNonSchemeType?.name || "N/A"} />
              )}

              <Row label={t("BPA_NOTICE_ISSUED_LABEL")} text={detail?.localityNoticeIssued?.code || "N/A"} />

              {detail?.localityNoticeIssued?.code === "YES" && (
                <Row label={t("BPA_NOTICE_NUMBER_LABEL")} text={detail?.localityNoticeNumber || "N/A"} />
              )}

              <Row label={t("BPA_SCHEME_COLONY_TYPE_LABEL")} text={detail?.localityColonyType?.name || "N/A"} />
              <Row label={t("BPA_TRANSFERRED_SCHEME_TYPE_LABEL")} text={detail?.localityTransferredSchemeType?.name || "N/A"} />
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

              <Row label={t("BPA_PLOT_AREA_LABEL")} text={detail?.plotArea || "N/A"} />
              <Row label={t("BPA_KHEWAT_KHATUNI_NO_LABEL")} text={detail?.khewatOrKhatuniNo || "N/A"} />
              <Row label={t("BPA_CORE_AREA_LABEL")} text={detail?.coreArea?.code || "N/A"} />

              <Row label={t("BPA_PROPOSED_SITE_ADDRESS")} text={detail?.proposedSiteAddress || "N/A"} />
              <Row label={t("BPA_ULB_NAME_LABEL")} text={detail?.ulbName?.name || detail?.ulbName || "N/A"} />
              <Row label={t("BPA_ULB_TYPE_LABEL")} text={detail?.ulbType || "N/A"} />
              <Row label={t("BPA_KHASRA_NO_LABEL")} text={detail?.khasraNo || "N/A"} />
              <Row label={t("BPA_HADBAST_NO_LABEL")} text={detail?.hadbastNo || "N/A"} />
              <Row label={t("BPA_ROAD_TYPE_LABEL")} text={detail?.roadType?.name || detail?.roadType || "N/A"} />
              <Row label={t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL")} text={detail?.areaLeftForRoadWidening || "N/A"} />
              <Row label={t("BPA_NET_PLOT_AREA_AFTER_WIDENING_LABEL")} text={detail?.netPlotAreaAfterWidening || "N/A"} />
              <Row label={t("BPA_NET_TOTAL_AREA_LABEL")} text={detail?.netTotalArea || "N/A"} />

              <Row label={t("BPA_ROAD_WIDTH_AT_SITE_LABEL")} text={detail?.roadWidthAtSite || "N/A"} />

              <Row label={t("BPA_SITE_WARD_NO_LABEL")} text={detail?.wardNo || "N/A"} />
              <Row label={t("BPA_DISTRICT_LABEL")} text={detail?.district?.name || detail?.district || "N/A"} />
              <Row label={t("BPA_ZONE_LABEL")} text={detail?.zone?.name || detail?.zone || "N/A"} />

              <Row label={t("BPA_SITE_VASIKA_NO_LABEL")} text={detail?.vasikaNumber || "N/A"} />
              <Row label={t("BPA_SITE_VILLAGE_NAME_LABEL")} text={detail?.villageName || "N/A"} />

              <Row label={t("BPA_OWNERSHIP_IN_PCT_LABEL")} text={detail?.ownershipInPct || "N/A"} />
              <Row label={t("BPA_PROPOSED_ROAD_WIDTH_AFTER_WIDENING_LABEL")} text={detail?.proposedRoadWidthAfterWidening || "N/A"} />

              <Row label={t("BPA_CATEGORY_APPLIED_FOR_CLU_LABEL")} text={detail?.appliedCluCategory?.name || "N/A"} />
              <Row label={t("BPA_PROPERTY_UID_LABEL")} text={detail?.propertyUid || "N/A"} />
              <Row label={t("BPA_BUILDING_STATUS_LABEL")} text={detail?.buildingStatus?.name || "N/A"} />
              <Row label={t("BPA_IS_ORIGINAL_CATEGORY_AGRICULTURE_LABEL")} text={detail?.isOriginalCategoryAgriculture?.code || "N/A"} />
              <Row label={t("BPA_RESTRICTED_AREA_LABEL")} text={detail?.restrictedArea?.code || "N/A"} />
              <Row label={t("BPA_IS_SITE_UNDER_MASTER_PLAN_LABEL")} text={detail?.isSiteUnderMasterPlan?.code || "N/A"} />

              <Row label={t("BPA_BUILDING_CATEGORY_LABEL")} text={detail?.buildingCategory?.name || "N/A"} />
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
        <CardSubHeader>{t("BPA_SITE_COORDINATES_LABEL")}</CardSubHeader>
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
      </Card>

      <Card>
        <CardSubHeader>{t("BPA_UPLOADED_OWNER_ID")}</CardSubHeader>
        <StatusTable>{applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.ownerIds?.length > 0 && <CLUDocumentTableView documents={applicationDetails?.Clu?.[0]?.cluDetails?.additionalDetails?.ownerIds} />}</StatusTable>
      </Card>

      <Card>
        <CardSubHeader>{t("BPA_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
        <StatusTable>{displayData?.Documents?.length > 0 && <CLUDocumentTableView documents={displayData.Documents} />}</StatusTable>
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
          />
        )}
      </Card>

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

      {actions?.length > 0 && (
        <ActionBar>
          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu
              localeKeyPrefix={(applicationDetails?.Clu?.[0]?.applicationStatus === "DOCUMENTVERIFY_MTP/ME")  && (businessServiceCode === "clu_mco") ? "WF_EMPLOYEE_BPA_JC":`WF_EMPLOYEE_${"BPA"}`}
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

      {(isLoading || getLoader) && <Loader page={true} />}
    </div>
  );
};

export default CLUEmployeeApplicationDetails;
