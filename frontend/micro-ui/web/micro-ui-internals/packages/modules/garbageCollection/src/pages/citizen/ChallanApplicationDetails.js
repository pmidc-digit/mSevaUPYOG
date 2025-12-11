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
import NDCDocumentTimline from "../../components/ChallanDocument";
import { useParams } from "react-router-dom";
import get from "lodash/get";
import { Loader } from "../../components/Loader";
import { ChallanData } from "../../utils/index";
import CHBDocument from "../../components/ChallanDocument";

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
      businessService: "Challan_Generation",
      consumerCodes: acknowledgementIds,
      isEmployee: false,
    },
    { enabled: acknowledgementIds ? true : false }
  );
  const dowloadOptions = [];

  async function printChallanNotice({ tenantId, payments, ...params }) {
    if (chbPermissionLoading) return;
    setChbPermissionLoading(true);
    try {
      const applicationDetails = await Digit.ChallanGenerationService.search({ tenantId, filters: { challanNo: acknowledgementIds } });
      const challan = {
        ...applicationDetails,
        ...challanEmpData,
      };
      console.log("applicationDetails", applicationDetails);
      let application = challan;
      let fileStoreId = applicationDetails?.Applications?.[0]?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        let response = await Digit.PaymentService.generatePdf(tenantId, { challan: { ...application, ...payments } }, "challan-notice");
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } finally {
      setChbPermissionLoading(false);
    }
  }

  async function printChallanReceipt({ tenantId, payments, ...params }) {
    console.log("payments", payments);
    if (printing) return;
    setPrinting(true);
    try {
      const applicationDetails = await Digit.ChallanGenerationService.search({ tenantId, filters: { challanNo: acknowledgementIds } });
      const challan = {
        ...applicationDetails,
        ...challanEmpData,
      };
      console.log("applicationDetails", applicationDetails);
      let application = challan;
      let fileStoreId = applicationDetails?.Applications?.[0]?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        let response = await Digit.PaymentService.generatePdf(
          tenantId,
          { Payments: [{ ...payments, challan: application }] },
          "challangeneration-receipt"
        );
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } finally {
      setPrinting(false);
    }
  }
  dowloadOptions.push({
    label: t("Challan_Notice"),
    onClick: () => printChallanNotice({ tenantId, payments: reciept_data?.Payments[0] }),
  });

  if (reciept_data && reciept_data?.Payments.length > 0 && !recieptDataLoading) {
    dowloadOptions.push({
      label: t("PTR_FEE_RECIEPT"),
      onClick: () => printChallanReceipt({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
    });
  }

  return (
    <React.Fragment>
      <div>
        <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
          <Header styles={{ fontSize: "32px" }}>{t("GC_APPLICATION_DETAILS")}</Header>
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
          <CardSubHeader style={{ fontSize: "24px" }}>{t("GC_OWNER_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("CORE_COMMON_NAME")} text={getChallanData?.connectionHolders?.[0]?.name || t("CS_NA")} />
            <Row
              className="border-none"
              label={t("CORE_COMMON_PROFILE_MOBILE_NUMBER")}
              text={getChallanData?.connectionHolders?.[0]?.mobileNumber || t("CS_NA")}
            />
            <Row className="border-none" label={t("CORE_EMAIL_ID")} text={getChallanData?.connectionHolders?.[0]?.emailId || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("GC_CONNECTION_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("APPLICATION_NUMBER")} text={t(getChallanData?.applicationNo) || t("CS_NA")} />
            <Row className="border-none" label={t("ACTION_TEST_APPLICATION_STATUS")} text={t(getChallanData?.applicationStatus) || t("CS_NA")} />
            <Row className="border-none" label={t("GC_CONNECTION_TYPE")} text={getChallanData?.connectionCategory || t("CS_NA")} />
            <Row className="border-none" label={t("GC_FREQUENCY")} text={getChallanData?.frequency || t("CS_NA")} />
            <Row className="border-none" label={t("GC_WASTE_TYPE")} text={getChallanData?.typeOfWaste || t("CS_NA")} />
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
