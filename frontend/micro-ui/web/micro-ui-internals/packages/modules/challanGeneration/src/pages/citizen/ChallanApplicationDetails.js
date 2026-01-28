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
import NewApplicationTimeline from "../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
import CHBDocument from "../../components/ChallanDocument";
import { useParams } from "react-router-dom";
import { Loader } from "../../components/Loader";
import { ChallanData, getLocationName } from "../../utils/index";

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

      <div >
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
      setLoader(false);
    }
  };
  let challanEmpData = ChallanData(tenantId, acknowledgementIds);

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
    setLoader(true);
    try {
      const applicationDetails = await Digit.ChallanGenerationService.search({ tenantId, filters: { challanNo: acknowledgementIds } });
      const location = await getLocationName(
        applicationDetails?.challans?.[0]?.additionalDetail?.latitude,
        applicationDetails?.challans?.[0]?.additionalDetail?.longitude
      );
      console.log("location", location);
      const challan = {
        ...applicationDetails,
        ...challanEmpData,
      };
      let application = challan;
      let fileStoreId = applicationDetails?.Applications?.[0]?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        let response = await Digit.PaymentService.generatePdf(tenantId, { challan: { ...application, ...payments, location } }, "challan-notice");
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      setLoader(false);
      window.open(fileStore[fileStoreId], "_blank");
    } catch (err) {
      setLoader(false);
      return err;
    }
  }

  async function printChallanReceipt({ tenantId, payments, ...params }) {
    setLoader(true);
    try {
      const applicationDetails = await Digit.ChallanGenerationService.search({ tenantId, filters: { challanNo: acknowledgementIds } });

      const challan = {
        ...applicationDetails,
        ...challanEmpData,
      };
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
      setLoader(false);
      window.open(fileStore[fileStoreId], "_blank");
    } catch (err) {
      setLoader(false);
      return err;
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
      <div className="challan-application-details">
        <div className="cardHeaderWithOptions" >
          <Header className="challan-custom-header-font">{t("CHALLAN_DETAILS")}</Header>
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
          <CardSubHeader className="challan-custom-subheader-font" >{t("CHALLAN_OFFENDER_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("CORE_COMMON_NAME")} text={getChallanData?.citizen?.name || t("CS_NA")} />
            <Row className="border-none" label={t("CORE_COMMON_PROFILE_MOBILE_NUMBER")} text={getChallanData?.citizen?.mobileNumber || t("CS_NA")} />
            <Row className="border-none" label={t("NDC_ADDRESS")} text={getChallanData?.address?.addressLine1 || t("CS_NA")} />
            {/* <Row className="border-none" label={t("CORE_EMAIL_ID")} text={getChallanData?.citizen?.emailId || t("CS_NA")} /> */}
          </StatusTable>

          <CardSubHeader className="challan-custom-subheader-font">{t("CHALLAN_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("CHALLAN_NUMBER")} text={t(getChallanData?.challanNo) || t("CS_NA")} />
            <Row className="border-none" label={t("reports.mcollect.status")} text={t(getChallanData?.challanStatus) || t("CS_NA")} />
            <Row className="border-none" label={t("CHALLAN_OFFENCE_NAME")} text={t(getChallanData?.offenceTypeName) || t("CS_NA")} />
            <Row className="border-none" label={t("CHALLAN_OFFENCE_TYPE")} text={getChallanData?.offenceCategoryName || t("CS_NA")} />
            <Row
              className="border-none"
              label={t("CHALLAN_AMOUNT")}
              text={Math.max(getChallanData?.amount?.[0]?.amount || 0, getChallanData?.challanAmount || 0)}
            />
            {getChallanData?.feeWaiver && <Row className="border-none" label={t("FEE_WAIVER_AMOUNT")} text={getChallanData?.feeWaiver} />}
          </StatusTable>

          <CardSubHeader className="challan-custom-subheader-font">{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
          <StatusTable>
            <Card className="challan-custom-card" >
              {getChallanData?.documents?.length > 0 ? (
                getChallanData?.documents?.map((doc, index) => (
                  <React.Fragment key={index}>
                    <div>
                      <CHBDocument value={getChallanData?.documents} Code={doc?.documentType} index={index} />
                      <CardSectionHeader >{t(doc?.documentType)}</CardSectionHeader>
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <h5>{t("CS_NO_DOCUMENTS_UPLOADED")}</h5>
              )}
            </Card>
          </StatusTable>
        </Card>
        <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />
      </div>
      {(loader || workflowDetails?.isLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default ChallanApplicationDetails;
