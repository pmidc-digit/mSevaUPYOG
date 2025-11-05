import {
  Card,
  CardSubHeader,
  CardSectionHeader,
  Header,
  Row,
  StatusTable,
  MultiLink,
  CheckPoint,
  ConnectingCheckPoints,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NDCDocumentTimline from "../../components/NDCDocument";
import { useParams } from "react-router-dom";
import CHBDocument from "../../pageComponents/CHBDocument";
import get from "lodash/get";
import { Loader } from "../../components/Loader";

const getTimelineCaptions = (checkpoint, index, arr, t) => {
  const { wfComment: comment, thumbnailsToShow, wfDocuments } = checkpoint;
  const caption = {
    date: checkpoint?.auditDetails?.lastModified,
    name: checkpoint?.assigner?.name,
    // mobileNumber: checkpoint?.assigner?.mobileNumber,
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
          {wfDocuments?.map((doc, index) => (
            <div key={index}>
              <NDCDocumentTimline value={wfDocuments} Code={doc?.documentType} index={index} />
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "8px" }}>
        {caption.date && <p>{caption.date}</p>}
        {caption.name && <p>{caption.name}</p>}
        {/* {caption.mobileNumber && <p>{caption.mobileNumber}</p>} */}
        {caption.source && <p>{t("ES_COMMON_FILED_VIA_" + caption.source.toUpperCase())}</p>}
      </div>
    </div>
  );
};

const ChallanApplicationDetails = () => {
  const { t } = useTranslation();
  const { acknowledgementIds, tenantId } = useParams();
  const [showOptions, setShowOptions] = useState(false);
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const [loader, setLoader] = useState(false);
  const [getChallanData, setChallanData] = useState();

  // const { isLoading, data, refetch } = Digit.Hooks.chb.useChbSearch({
  //   tenantId,
  //   filters: { bookingNo: acknowledgementIds },
  // });

  // const mutation = Digit.Hooks.chb.useChbCreateAPI(tenantId, false);

  const fetchChallans = async (filters) => {
    setLoader(true);
    try {
      const responseData = await Digit.ChallanGenerationService.search({ tenantId, filters });
      console.log("search ", responseData);
      setChallanData(responseData?.challans?.[0]);
      setLoader(false);
    } catch (error) {
      console.log("error", error);
      setLoader(false);
    }
  };

  useEffect(() => {
    if (acknowledgementIds) {
      const filters = {};
      // filters.mobileNumber = userInfo?.info?.mobileNumber;
      filters.challanNo = acknowledgementIds;
      fetchChallans(filters);
    }
  }, []);

  // Getting HallsBookingDetails
  // const hallsBookingApplication = get(data, "hallsBookingApplication", []);

  // let chb_details = (hallsBookingApplication && hallsBookingApplication.length > 0 && hallsBookingApplication[0]) || {};
  // const application = chb_details;

  // sessionStorage.setItem("chb", JSON.stringify(application));

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: acknowledgementIds,
    moduleCode: "challan-generation",
    role: "EMPLOYEE",
  });

  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

  return (
    <React.Fragment>
      <div>
        <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
          <Header styles={{ fontSize: "32px" }}>{t("CHALLAN_DETAILS")}</Header>
        </div>
        <Card>
          <CardSubHeader style={{ fontSize: "24px" }}>{t("CHALLAN_OFFENDER_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("CORE_COMMON_NAME")} text={getChallanData?.citizen?.name || t("CS_NA")} />
            <Row className="border-none" label={t("CORE_COMMON_PROFILE_MOBILE_NUMBER")} text={getChallanData?.citizen?.mobileNumber || t("CS_NA")} />
            <Row className="border-none" label={t("CORE_EMAIL_ID")} text={getChallanData?.citizen?.emailId || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("CHALLAN_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("CHALLAN_NUMBER")} text={t(getChallanData?.challanNo) || t("CS_NA")} />
            <Row className="border-none" label={t("reports.mcollect.status")} text={t(getChallanData?.challanStatus) || t("CS_NA")} />
            <Row className="border-none" label={t("CHALLAN_OFFENCE_NAME")} text={t(getChallanData?.offenceTypeName) || t("CS_NA")} />
            <Row className="border-none" label={t("CHALLAN_OFFENCE_TYPE")} text={getChallanData?.offenceCategoryName || t("CS_NA")} />
          </StatusTable>

          {/* <CardSubHeader style={{ fontSize: "24px", marginTop: "30px" }}>{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
          <StatusTable>
            <Card style={{ display: "flex", flexDirection: "row", gap: "30px" }}>
              {getChallanData?.documents?.length > 0 ? (
                getChallanData?.documents?.map((doc, index) => (
                  <React.Fragment key={index}>
                    <div>
                      <CHBDocument value={getChallanData?.documents} Code={doc?.documentType} index={index} />
                      <CardSectionHeader style={{ marginTop: "10px", fontSize: "15px" }}>{t(doc?.documentType)}</CardSectionHeader>
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <h5>{t("CS_NO_DOCUMENTS_UPLOADED")}</h5>
              )}
            </Card>
          </StatusTable> */}
        </Card>
        {workflowDetails?.data?.timeline && (
          <Card style={{ marginTop: "20px" }}>
            <CardSubHeader style={{ fontSize: "24px" }}>{t("CS_APPLICATION_DETAILS_APPLICATION_TIMELINE")}</CardSubHeader>
            {workflowDetails?.data?.timeline.length === 1 ? (
              <CheckPoint isCompleted={true} label={t(workflowDetails?.data?.timeline[0]?.status)} />
            ) : (
              <ConnectingCheckPoints>
                {workflowDetails?.data?.timeline.map((checkpoint, index, arr) => (
                  <CheckPoint
                    keyValue={index}
                    isCompleted={index === 0}
                    label={t(checkpoint.status)}
                    customChild={getTimelineCaptions(checkpoint, index, arr, t)}
                  />
                ))}
              </ConnectingCheckPoints>
            )}
          </Card>
        )}
      </div>
      {(loader || workflowDetails?.isLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default ChallanApplicationDetails;
