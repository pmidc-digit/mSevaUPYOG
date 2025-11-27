import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header, CardSectionHeader, PDFSvg, StatusTable, Row, MultiLink, LinkButton, CardLabel } from "@mseva/digit-ui-react-components";
import ApplicationDetailsTemplate from "../../../../../templates/ApplicationDetails";
import { downloadAndPrintReciept } from "../../../utils";

const ApplicationDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const state = tenantId?.split('.')[0]
  const [showToast, setShowToast] = useState(null);
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const [showOptions, setShowOptions] = useState(false);
  const { isLoading, data: applicationDetails } = Digit.Hooks.obps.useLicenseDetails(tenantId === "pb"? "pb.punjab" :tenantId, { applicationNumber: id, tenantId: tenantId === "pb"? "pb.punjab" : tenantId }, {});
  const License = applicationDetails?.applicationData
  const [documents, setDocuments] = useState({});
  console.log('applicationDetails of obps here', applicationDetails)
 const ulbType = tenants?.find((tenant) => tenant.code === tenantId)?.city?.ulbType;
  console.log('ulbType', ulbType)
const licenseSection = applicationDetails?.applicationDetails?.find(
  (section) => section.title === "BPA_LICENSE_DETAILS_LABEL"
);

const licenseType = t(licenseSection?.values?.find(
  (val) => val.title === "BPA_LICENSE_TYPE"
)?.value);

console.log("licenseType:", licenseType);

  const isMobile = window.Digit.Utils.browser.isMobile();
  const [viewTimeline, setViewTimeline]=useState(false);
  const {
    isLoading: updatingApplication,
    isError: updateApplicationError,
    data: updateResponse,
    error: updateError,
    mutate,
  } = Digit.Hooks.obps.useBPAREGApplicationActions(tenantId === "pb"? "pb.punjab" : tenantId);

  useEffect(() => {
      if (License?.tradeLicenseDetail?.applicationDocuments?.length) {
        const fileStoresIds = License?.tradeLicenseDetail?.applicationDocuments?.map((document) => document?.fileStoreId);
        Digit.UploadServices.Filefetch(fileStoresIds, tenantId.split(".")[0]).then((res) => setDocuments(res?.data));
      }
    }, [License]);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId === "pb"? "pb.punjab" : tenantId,
    id: id,
    moduleCode: "BPAREG",
  });

  const boldLabelStyle = { fontWeight: "bold", color: "#555" }

  const closeToast = () => {
    setShowToast(null);
  };
  
  const handleViewTimeline=()=>{
    setViewTimeline(true);
      const timelineSection=document.getElementById('timeline');
      if(timelineSection){
        timelineSection.scrollIntoView({behavior: 'smooth'});
      } 
  };
  let dowloadOptions = [];
  console.log("applicationDetails",applicationDetails)
  if (applicationDetails?.payments?.length > 0 && licenseType) {
    dowloadOptions.push({
      label: t("TL_RECEIPT"),
      onClick: () => downloadAndPrintReciept(applicationDetails?.payments?.[0]?.paymentDetails?.[0]?.businessService || "BPAREG", applicationDetails?.applicationData?.applicationNumber, "pb.punjab",applicationDetails?.payments,licenseType, ulbType),
    })
  }

  return (
    <div className={"employee-main-application-details"}>
        <div  className={"employee-application-details"} style={{marginBottom: "40px"}}>
        <Header>{t("CS_TITLE_APPLICATION_DETAILS")}</Header>
        <div style={{zIndex: "10", display: "flex", flexDirection:"row", gap: "10px", justifyContent:"space-between", alignItems:"center"}}> 
                {(() => {
            const passportPhoto = License?.tradeLicenseDetail?.applicationDocuments?.find(
              (doc) => doc.documentType === "APPL.BPAREG_PASS_PORT_SIZE_PHOTO",
            )

            if (!passportPhoto || !documents[passportPhoto.fileStoreId]) return null

            return (
              <div style={{display: "flex", flexDirection:"column" , alignItems: "center", marginBottom: "1rem"}}>
              <img
                src={documents[passportPhoto.fileStoreId]?.split(",")[0] || "/placeholder.svg"}
                alt="Owner Photograph"
                style={{
                  maxWidth: "120px",
                  maxHeight: "120px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  flexShrink: 0,
                  marginTop: "245px"
                }}
                onError={(e) => {
                  e.target.style.display = "none"
                }}
              />
              <CardLabel style={boldLabelStyle}>{License?.tradeLicenseDetail?.owners?.[0]?.name}</CardLabel>
              </div>
            )
          })()}       
        {/* {workflowDetails?.data?.timeline?.length>0 && (
        <LinkButton label={t("VIEW_TIMELINE")} style={{ color:"#A52A2A"}} onClick={handleViewTimeline}></LinkButton>
        )} */}
        </div>
        </div>
      <ApplicationDetailsTemplate
        applicationDetails={applicationDetails}
        isLoading={isLoading}
        id={"timeline"}
        isDataLoading={isLoading}
        applicationData={applicationDetails?.applicationData}
        mutate={mutate}
        workflowDetails={workflowDetails}
        businessService={workflowDetails?.data?.applicationBusinessService ? workflowDetails?.data?.applicationBusinessService : applicationDetails?.applicationData?.businessService}
        moduleCode="BPAREG"
        showToast={showToast}
        setShowToast={setShowToast}
        ActionBarStyle={isMobile?{}:{paddingRight:"50px"}}
        MenuStyle={isMobile?{}:{right:"50px"}}
        closeToast={closeToast}
        timelineStatusPrefix={"WF_NEWTL_"}
        propertyId={applicationDetails?.applicationData?.applicationNumber}
      />
    </div>
  )
}

export default ApplicationDetail;