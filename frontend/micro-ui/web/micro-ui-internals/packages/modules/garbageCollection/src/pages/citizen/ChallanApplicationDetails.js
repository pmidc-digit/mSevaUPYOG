import {
  Card,
  CardSubHeader,
  CardSectionHeader,
  Header,
  Row,
  StatusTable,
  MultiLink,
  // CheckPoint,
  // ConnectingCheckPoints,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NDCDocumentTimline from "../../components/ChallanDocument";
import { useParams } from "react-router-dom";
import get from "lodash/get";
import { Loader } from "../../components/Loader";
import { ChallanData, getAcknowledgementData } from "../../utils/index";
import CHBDocument from "../../components/ChallanDocument";
import NewApplicationTimeline from "../../../../templates/ApplicationDetails/components/NewApplicationTimeline";

// const getTimelineCaptions = (checkpoint, index, arr, t) => {
//   const { wfComment: comment, thumbnailsToShow, wfDocuments } = checkpoint;
//   const caption = {
//     date: checkpoint?.auditDetails?.lastModified,
//     name: checkpoint?.assigner?.name,
//     // mobileNumber: checkpoint?.assigner?.mobileNumber,
//     source: checkpoint?.assigner?.source,
//   };

//   return (
//     <div>
//       {comment?.length > 0 && (
//         <div className="TLComments">
//           <h3>{t("WF_COMMON_COMMENTS")}</h3>
//           <p style={{ overflowX: "scroll" }}>{comment}</p>
//         </div>
//       )}

//       {thumbnailsToShow?.thumbs?.length > 0 && (
//         <DisplayPhotos
//           srcs={thumbnailsToShow.thumbs}
//           onClick={(src, idx) => {
//             let fullImage = thumbnailsToShow.fullImage?.[idx] || src;
//             Digit.Utils.zoomImage(fullImage);
//           }}
//         />
//       )}

//       {wfDocuments?.length > 0 && (
//         <div>
//           {wfDocuments?.map((doc, index) => (
//             <div key={index}>
//               <NDCDocumentTimline value={wfDocuments} Code={doc?.documentType} index={index} />
//             </div>
//           ))}
//         </div>
//       )}

//       <div style={{ marginTop: "8px" }}>
//         {caption.date && <p>{caption.date}</p>}
//         {caption.name && <p>{caption.name}</p>}
//         {/* {caption.mobileNumber && <p>{caption.mobileNumber}</p>} */}
//         {caption.source && <p>{t("ES_COMMON_FILED_VIA_" + caption.source.toUpperCase())}</p>}
//       </div>
//     </div>
//   );
// };

const ChallanApplicationDetails = () => {
  const { t } = useTranslation();
  const { acknowledgementIds } = useParams();
  const tenantId = localStorage.getItem("CITIZEN.CITY");
  const [showOptions, setShowOptions] = useState(false);
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const [loader, setLoader] = useState(false);
  const [getChallanData, setChallanData] = useState();
  const [chbPermissionLoading, setChbPermissionLoading] = useState(false);
  const [printing, setPrinting] = useState(false);

  // const { isLoading, data, refetch } = Digit.Hooks.chb.useChbSearch({
  //   tenantId,
  //   filters: { bookingNo: acknowledgementIds },
  // });

  // const mutation = Digit.Hooks.chb.useChbCreateAPI(tenantId, false);

  // const pathname = window.location.pathname;

  // const afterApplication = pathname.split("/application/")[1];
  // const parts = afterApplication.split("/");

  // const applicationNumber = parts.slice(0, 4).join("/");

  const fetchChallans = async (filters) => {
    setLoader(true);
    try {
      const responseData = await Digit.GCService.search({ tenantId, filters });
      console.log("search ", responseData);
      setChallanData(responseData?.GarbageConnection?.[0]);
      setLoader(false);
    } catch (error) {
      console.log("error", error);
      setLoader(false);
    }
  };
  let challanEmpData = ChallanData(tenantId, acknowledgementIds);

  useEffect(() => {
    if (acknowledgementIds) {
      const filters = {};
      filters.applicationNumber = acknowledgementIds;
      fetchChallans(filters);
    }
  }, [acknowledgementIds]);

  // Getting HallsBookingDetails
  // const hallsBookingApplication = get(data, "hallsBookingApplication", []);

  // let chb_details = (hallsBookingApplication && hallsBookingApplication.length > 0 && hallsBookingApplication[0]) || {};
  // const application = chb_details;

  // sessionStorage.setItem("chb", JSON.stringify(application));

  const getAcknowledgement = async () => {
    setLoader(true);
    try {
      const applications = getChallanData;
      const tenantInfo = tenants.find((tenant) => tenant.code === applications.tenantId);
      const acknowldgementDataAPI = await getAcknowledgementData({ ...applications }, tenantInfo, t);
      setTimeout(() => {
        Digit.Utils.pdf.generate(acknowldgementDataAPI);
        setLoader(false);
      }, 0);
    } catch (error) {
      console.error("Error generating acknowledgement:", error);
      setLoader(false);
    }
  };

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: acknowledgementIds,
    moduleCode: "NewGC",
    role: "EMPLOYEE",
  });

  console.log("workflowDetails", workflowDetails);

  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "GC.ONE_TIME_FEE",
      consumerCodes: acknowledgementIds,
      isEmployee: false,
    },
    { enabled: acknowledgementIds ? true : false }
  );
  const dowloadOptions = [];

  dowloadOptions.push({
    label: t("CHB_DOWNLOAD_ACK_FORM"),
    onClick: () => getAcknowledgement(),
  });
  async function getRecieptSearch({ tenantId, payments, ...params }) {
    setLoader(true);
    try {
      let response = null;
      if (payments?.fileStoreId) {
        response = { filestoreIds: [payments?.fileStoreId] };
      } else {
        response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments }] }, "garbage-receipt");
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, {
        fileStoreIds: response.filestoreIds[0],
      });
      setLoader(false);
      window.open(fileStore[response?.filestoreIds[0]], "_blank");
    } catch (error) {
      console.error(error);
      setLoader(false);
    }
  }

  if (reciept_data && reciept_data?.Payments.length > 0 && !recieptDataLoading) {
    dowloadOptions.push({
      label: t("PTR_FEE_RECIEPT"),
      onClick: () => getRecieptSearch({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
    });
  }

  return (
    <React.Fragment>
      <div>
        <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
          <Header styles={{ fontSize: "32px", margin: "30px 0 5px" }}>{t("GC_APPLICATION_DETAILS")}</Header>
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
          <CardSubHeader style={{ fontSize: "24px", margin: "30px 0 5px" }}>{t("GC_OWNER_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("CORE_COMMON_NAME")} text={getChallanData?.connectionHolders?.[0]?.name || t("CS_NA")} />
            <Row
              className="border-none"
              label={t("CORE_COMMON_PROFILE_MOBILE_NUMBER")}
              text={getChallanData?.connectionHolders?.[0]?.mobileNumber || t("CS_NA")}
            />
            <Row className="border-none" label={t("CORE_EMAIL_ID")} text={getChallanData?.connectionHolders?.[0]?.emailId || t("CS_NA")} />
            {getChallanData?.connectionHolders?.[0]?.permanentAddress && (
              <Row className="border-none" label={t("PTR_ADDRESS")} text={getChallanData?.connectionHolders?.[0]?.permanentAddress || t("CS_NA")} />
            )}
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px", margin: "30px 0 5px" }}>{t("GC_CONNECTION_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("APPLICATION_NUMBER")} text={t(getChallanData?.applicationNo) || t("CS_NA")} />
            <Row className="border-none" label={t("ACTION_TEST_APPLICATION_STATUS")} text={t(getChallanData?.applicationStatus) || t("CS_NA")} />
            <Row className="border-none" label={t("GC_CONNECTION_TYPE")} text={getChallanData?.connectionCategory || t("CS_NA")} />
            <Row className="border-none" label={t("GC_FREQUENCY")} text={getChallanData?.frequency || t("CS_NA")} />
            <Row className="border-none" label={t("GC_WASTE_TYPE")} text={getChallanData?.typeOfWaste || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px", margin: "30px 0 5px" }}>{t("PT_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("NDC_MSG_PROPERTY_LABEL")} text={getChallanData?.propertyId || t("CS_NA")} />
            <Row className="border-none" label={t("NDC_MSG_PROPERTY_TYPE_LABEL")} text={getChallanData?.propertyType || t("CS_NA")} />
            <Row
              className="border-none"
              label={t("PDF_STATIC_LABEL_WS_CONSOLIDATED_ACKNOWELDGMENT_PLOT_SIZE")}
              text={getChallanData?.plotSize || t("CS_NA")}
            />
            <Row className="border-none" label={t("GC_LOCATION")} text={getChallanData?.location || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px", marginTop: "30px" }}>{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
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
          </StatusTable>
        </Card>
        {/* {workflowDetails?.data?.timeline && (
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
        )} */}

        <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />
      </div>
      {(loader || workflowDetails?.isLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default ChallanApplicationDetails;
