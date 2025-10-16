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
} from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import NOCDocument from "../../../pageComponents/NOCDocument";
import NOCModal from "../../../pageComponents/NOCModal";
import NOCDocumentTableView from "../../../pageComponents/NOCDocumentTableView";
import NOCFeeEstimationDetails from "../../../pageComponents/NOCFeeEstimationDetails";

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
            let fullImage = thumbnailsToShow.fullImage?.[idx] || src;
            Digit.Utils.zoomImage(fullImage);
          }}
        />
      )}

      {wfDocuments?.length > 0 && (
        <div>
          {/* {wfDocuments?.map((doc, index) => (
            <div key={index}>
              <NOCDocument value={doc?.id || ""} index={index} />
            </div>
          ))} */}
          <div>
            <NOCDocument value={{ workflowDocs: wfDocuments}} index={index}/>
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


const NOCEmployeeApplicationOverview = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const history = useHistory();
  const state = tenantId?.split(".")[0];
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);
  
  const [showErrorToast, setShowErrorToastt] = useState(null);
  const [errorOne, setErrorOne] = useState(null);
  const [displayData, setDisplayData] = useState({});
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const { isLoading, data } = Digit.Hooks.noc.useNOCSearchApplication({ applicationNo: id }, tenantId);
  const applicationDetails= data?.resData;
  console.log("applicationDetails here==>", applicationDetails);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: "obpas_noc",
  });

  console.log("workflowDetails here=>", workflowDetails);

  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const closeToastOne = () => {
    setShowErrorToastt(null);
  };

//   const { data: storeData } = Digit.Hooks.useStore.getInitData();
//   const { tenants } = storeData || {};

  let user = Digit.UserService.getUser();
  const menuRef = useRef();

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  if (window.location.href.includes("/obps") || window.location.href.includes("/noc")) {
    const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
    const userInfo = userInfos ? JSON.parse(userInfos) : {};
    user = userInfo?.value;
  }

  const userRoles = user?.info?.roles?.map((e) => e.code);

  useEffect(()=>{
        if(workflowDetails){
          workflowDetails.revalidate();
        }
  
        if(data){
          data.revalidate();
        }
  },[])
  
  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

   console.log("actions here", actions);

  useEffect(()=>{
    const nocObject = applicationDetails?.Noc?.[0];

    if(nocObject){
      const applicantDetails = nocObject?.nocDetails?.additionalDetails?.applicationDetails;

      const siteDetails = nocObject?.nocDetails?.additionalDetails?.siteDetails;

       const coordinates = nocObject?.nocDetails?.additionalDetails?.coordinates;

      const Documents= nocObject?.documents || [];
      
      //console.log("applicantDetails",applicantDetails);
      //console.log("siteDetails", siteDetails);
        
      const finalDisplayData = {
       applicantDetails: applicantDetails ? [applicantDetails] : [],
       siteDetails: siteDetails ? [siteDetails] : [],
       coordinates: coordinates ? [coordinates]: [],
       Documents: Documents.length > 0 ? Documents: []
      };

      setDisplayData(finalDisplayData);
    }

  },[applicationDetails?.Noc])
  
   
  function onActionSelect(action) {
    console.log("selected action", action);
    const appNo= applicationDetails?.Noc?.[0]?.applicationNo;

    const payload = {
      Licenses: [action],
    };

    if (action?.action == "EDIT") {
      history.push(`/digit-ui/employee/noc/edit-application/${appNo}`);
    }
    else if (action?.action == "DRAFT") {
      setShowToast({ key: "true", warning:true, message: "COMMON_EDIT_APPLICATION_BEFORE_SAVE_OR_SUBMIT_LABEL"});
    }
    else if (action?.action == "APPLY" || action?.action == "RESUBMIT" || action?.action == "CANCEL") {
      submitAction(payload);
    } 
    else if (action?.action == "PAY") {
      history.push(`/digit-ui/employee/payment/collect/obpas_noc/${appNo}/${tenantId}?tenantId=${tenantId}`);
    } else {
      setShowModal(true);
      setSelectedAction(action);
    }
  }

  const submitAction = async (data) => {
    const payloadData = applicationDetails?.Noc?.[0]|| {};

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

   // console.log("updatedApplicant", updatedApplicant);

    const finalPayload = {
      Noc: {...updatedApplicant},
    };

    console.log("final Payload ", finalPayload);

    try {
      const response = await Digit.NOCService.NOCUpdate({ tenantId, details: finalPayload });
      
      if(response?.ResponseInfo?.status === "successful"){
        if(filtData?.action === "CANCEL"){
          setShowToast({ key: "true", success:true, message: "COMMON_APPLICATION_CANCELLED_LABEL" });
          workflowDetails.revalidate();
          setSelectedAction(null);
        }
        else if(filtData?.action === "APPLY" || filtData?.action === "RESUBMIT" || filtData?.action === "DRAFT"){
          //Else If case for "APPLY" or "RESUBMIT" or "DRAFT"
          console.log("We are calling employee response page");
          history.replace({
           pathname: `/digit-ui/employee/noc/response/${response?.Noc?.[0]?.applicationNo}`,
           state: { data: response }
          });
        }
        else{
           //Else case for "VERIFY" or "APPROVE" or "SENDBACKTOCITIZEN" or "SENDBACKTOVERIFIER"
          setShowToast({ key: "true", success:true, message: "COMMON_SUCCESSFULLY_UPDATED_APPLICATION_STATUS_LABEL" });
          workflowDetails.revalidate();
          setSelectedAction(null);
        }
      }
      else{
        setShowToast({ key: "true", warning:true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" });
        setSelectedAction(null); 
      }
    } catch (err) {
      setShowToast({ key: "true", error:true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" });
    }
  };

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
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

  if (isLoading) {
    return <Loader />;
  }

  console.log("displayData here", displayData);

  return (
    <div className={"employee-main-application-details"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
        <Header styles={{ fontSize: "32px" }}>{t("NDC_APP_OVER_VIEW_HEADER")}</Header>
      </div>

      <Card>
        <CardSubHeader>{t("NOC_APPLICANT_DETAILS")}</CardSubHeader>
        {displayData?.applicantDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("NOC_FIRM_OWNER_NAME_LABEL")} text={detail?.applicantOwnerOrFirmName || "N/A"} />
              <Row label={t("NOC_APPLICANT_EMAIL_LABEL")} text={detail?.applicantEmailId || "N/A"} />
              <Row label={t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL")} text={detail?.applicantFatherHusbandName || "N/A"} />
              <Row label={t("NOC_APPLICANT_MOBILE_NO_LABEL")} text={detail?.applicantMobileNumber || "N/A"} />
              <Row label={t("NOC_APPLICANT_DOB_LABEL")} text={detail?.applicantDateOfBirth || "N/A"} />
              <Row label={t("NOC_APPLICANT_GENDER_LABEL")} text={detail?.applicantGender?.code || detail?.applicantGender || "N/A"} />
              <Row label={t("NOC_APPLICANT_ADDRESS_LABEL")} text={detail?.applicantAddress || "N/A"} />
              <Row label={t("NOC_APPLICANT_PROPERTY_ID_LABEL")} text={detail?.applicantPropertyId || "N/A"} />
            </StatusTable>
          </div>
        ))}
      </Card>

        {displayData?.applicantDetails?.professionalName && displayData?.applicantDetails?.map((detail, index) => (
          <React.Fragment>
           <Card>
          <CardSubHeader>{t("NOC_PROFESSIONAL_DETAILS")}</CardSubHeader>
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
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
      

      <Card>
        <CardSubHeader>{t("NOC_SITE_DETAILS")}</CardSubHeader>
        {displayData?.siteDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("NOC_PLOT_NO_LABEL")} text={detail?.plotNo || "N/A"} />
              <Row label={t("NOC_PROPOSED_SITE_ADDRESS")} text={detail?.proposedSiteAddress || "N/A"} />
              <Row label={t("NOC_ULB_NAME_LABEL")} text={detail?.ulbName?.name || detail?.ulbName || "N/A"} />
              <Row label={t("NOC_ULB_TYPE_LABEL")} text={detail?.ulbType || "N/A"} />
              <Row label={t("NOC_KHASRA_NO_LABEL")} text={detail?.khasraNo || "N/A"} />
              <Row label={t("NOC_HADBAST_NO_LABEL")} text={detail?.hadbastNo || "N/A"} />
              <Row label={t("NOC_ROAD_TYPE_LABEL")} text={detail?.roadType?.name || detail?.roadType || "N/A"} />
              <Row label={t("NOC_AREA_LEFT_FOR_ROAD_WIDENING_LABEL")} text={detail?.areaLeftForRoadWidening || "N/A"} />
              <Row label={t("NOC_NET_PLOT_AREA_AFTER_WIDENING_LABEL")} text={detail?.netPlotAreaAfterWidening || "N/A"} />
              <Row label={t("NOC_NET_TOTAL_AREA_LABEL")} text={detail?.netTotalArea || "N/A"} />
              <Row label={t("NOC_ROAD_WIDTH_AT_SITE_LABEL")} text={detail?.roadWidthAtSite || "N/A"} />
              <Row label={t("NOC_BUILDING_STATUS_LABEL")} text={detail?.buildingStatus?.name || detail?.buildingStatus || "N/A"} />


              <Row label={t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL")} text={detail?.isBasementAreaAvailable?.code || detail?.isBasementAreaAvailable || "N/A"} />

              {detail?.buildingStatus == "Built Up" && 
               <Row label={t("NOC_BASEMENT_AREA_LABEL")} text={detail?.basementArea || "N/A"}/>
              }

              {detail?.buildingStatus == "Built Up" && detail?.floorArea?.map((floor, index)=>(
               <Row label={getFloorLabel(index)} text={floor.value || "N/A"}/>
              ))}

              {detail?.buildingStatus == "Built Up" && 
               <Row label={t("NOC_TOTAL_FLOOR_BUILT_UP_AREA_LABEL")} text={detail?.totalFloorArea || "N/A"}/>
              }

              <Row label={t("NOC_DISTRICT_LABEL")} text={detail?.district?.name || detail?.district || "N/A"} />
              <Row label={t("NOC_ZONE_LABEL")} text={detail?.zone?.name || detail?.zone || "N/A"} />
              <Row label={t("NOC_SITE_WARD_NO_LABEL")} text={detail?.wardNo || "N/A"} />
              <Row label={t("NOC_SITE_VILLAGE_NAME_LABEL")} text={detail?.villageName || "N/A"} />

              <Row label={t("NOC_SITE_COLONY_NAME_LABEL")} text={detail?.colonyName || "N/A"} />
              <Row label={t("NOC_SITE_VASIKA_NO_LABEL")} text={detail?.vasikaNumber || "N/A"} />
              <Row label={t("NOC_SITE_KHEWAT_AND_KHATUNI_NO_LABEL")} text={detail?.khewatAndKhatuniNo || "N/A"} />


            </StatusTable>
          </div>
        ))}
      </Card>

      <Card>
        <CardSubHeader>{t("NOC_SPECIFICATION_DETAILS")}</CardSubHeader>
        {displayData?.siteDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("NOC_PLOT_AREA_JAMA_BANDI_LABEL")} text={detail?.specificationPlotArea || "N/A"} />
              <Row label={t("NOC_BUILDING_CATEGORY_LABEL")} text={detail?.specificationBuildingCategory?.name || detail?.specificationBuildingCategory || "N/A"} />

              <Row label={t("NOC_NOC_TYPE_LABEL")} text={detail?.specificationNocType?.name || detail?.specificationNocType || "N/A"} />
              <Row label={t("NOC_RESTRICTED_AREA_LABEL")} text={detail?.specificationRestrictedArea?.code || detail?.specificationRestrictedArea || "N/A"} />
              <Row label={t("NOC_IS_SITE_UNDER_MASTER_PLAN_LABEL")} text={detail?.specificationIsSiteUnderMasterPlan?.code || detail?.specificationIsSiteUnderMasterPlan || "N/A"} />
            </StatusTable>
          </div>
        ))}
      </Card>

    <Card>
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
    </Card>

      {/* <Card>
        <CardSubHeader>{t("NOC_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
        <div style={{ display: "flex", gap: "16px" }}>
          {Array.isArray(displayData?.Documents) && displayData?.Documents?.length > 0 ? (
            <NOCDocument value={{ workflowDocs: displayData?.Documents }} />
          ) : (
            <div>{t("NOC_NO_DOCUMENTS_MSG")}</div>
          )}
        </div>
      </Card> */}

      <Card>
        <CardSubHeader>{t("NOC_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
         <StatusTable>
          {displayData?.Documents?.length >0 && 
           <NOCDocumentTableView documents={displayData.Documents}/>
          }
         </StatusTable>
      </Card>

      <Card>
       <CardSubHeader>{t("NOC_FEE_DETAILS_LABEL")}</CardSubHeader>
          {applicationDetails?.Noc?.[0]?.nocDetails &&  (
              <NOCFeeEstimationDetails 
                  formData={{
                    apiData:{...applicationDetails},
                    applicationDetails:{...applicationDetails?.Noc?.[0]?.nocDetails?.additionalDetails?.applicationDetails},
                    siteDetails: {...applicationDetails?.Noc?.[0]?.nocDetails?.additionalDetails?.siteDetails} 
                  }}
              />
            )}
      </Card>

      {workflowDetails?.data?.timeline && (
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
                  label={t("NOC_STATUS_" + checkpoint.status)}
                  customChild={getTimelineCaptions(checkpoint, index, arr, t)}
                />
              ))}
            </ConnectingCheckPoints>
          )}
        </Card>
      )}

      {actions?.length >0 && (
        <ActionBar>
          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu
              localeKeyPrefix={`WF_EMPLOYEE_${"NOC"}`}
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
        <NOCModal
          t={t}
          action={selectedAction}
          tenantId={tenantId}
          state={state}
          id={id}
          applicationDetails={applicationDetails}
          applicationData={applicationDetails?.Noc}
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

      {showToast && <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />}


    </div>
  );
};

export default NOCEmployeeApplicationOverview;
