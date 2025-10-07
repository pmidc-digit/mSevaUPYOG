import {
  Card,
  CardSubHeader,
  CardSectionHeader,
  Header,
  LinkButton,
  Loader,
  Row,
  StatusTable,
  MultiLink,
  PopUp,
  Toast,
  SubmitBar,
  CardHeader,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import { useHistory, useParams, Link } from "react-router-dom";
import getChbAcknowledgementData from "../../getChbAcknowledgementData";
import CHBWFApplicationTimeline from "../../pageComponents/CHBWFApplicationTimeline";
import CHBDocument from "../../pageComponents/CHBDocument";
import ApplicationTable from "../../components/inbox/ApplicationTable";
import { pdfDownloadLink } from "../../utils";

import get from "lodash/get";
import { size } from "lodash";
import { doc } from "prettier";

const CHBApplicationDetails = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { acknowledgementIds, tenantId } = useParams();
  const [acknowldgementData, setAcknowldgementData] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [popup, setpopup] = useState(false);
  const [showToast, setShowToast] = useState(null);
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  const { isLoading, isError, error, data, refetch } = Digit.Hooks.chb.useChbSearch({
    tenantId,
    filters: { bookingNo: acknowledgementIds },
  });
  const mutation = Digit.Hooks.chb.useChbCreateAPI(tenantId, false);

  const [billData, setBillData] = useState(null);

  // Getting HallsBookingDetails
  const hallsBookingApplication = get(data, "hallsBookingApplication", []);
  const chbId = get(data, "hallsBookingApplication[0].bookingNo", []);

  let chb_details = (hallsBookingApplication && hallsBookingApplication.length > 0 && hallsBookingApplication[0]) || {};
  const application = chb_details;

  sessionStorage.setItem("chb", JSON.stringify(application));

  const [loading, setLoading] = useState(false);

  const fetchBillData = async () => {
    setLoading(true);
    const result = await Digit.PaymentService.fetchBill(tenantId, { businessService: "chb-services", consumerCode: acknowledgementIds });

    setBillData(result);
    setLoading(false);
  };
  useEffect(() => {
    fetchBillData();
  }, [tenantId, acknowledgementIds]);

  const { isLoading: auditDataLoading, isError: isAuditError, data: auditResponse } = Digit.Hooks.chb.useChbSearch(
    {
      tenantId,
      filters: { bookingNo: chbId, audit: true },
    },
    {
      enabled: true,
    }
  );

  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "chb-services",
      consumerCodes: acknowledgementIds,
      isEmployee: false,
    },
    { enabled: acknowledgementIds ? true : false }
  );
  //WorkFlow
  // if (!chb_details.workflow) {
  //   let workflow = {
  //     id: null,
  //     tenantId: tenantId,
  //     businessService: "chb-services",
  //     businessId: application?.bookingNo,
  //     action: "",
  //     moduleName: "chb-services",
  //     state: null,
  //     comment: null,
  //     documents: null,
  //     assignes: null,
  //   };
  //   chb_details.workflow = workflow;
  // }

  let docs = [];
  docs = application?.documents;

  if (isLoading || auditDataLoading) {
    return <Loader />;
  }

  const getChbAcknowledgement = async () => {
    const applications = application || {}; // getting application details
    const tenantInfo = tenants.find((tenant) => tenant.code === applications.tenantId);
    const acknowldgementDataAPI = await getChbAcknowledgementData({ ...applications }, tenantInfo, t);
    Digit.Utils.pdf.generate(acknowldgementDataAPI);
  };

  let documentDate = t("CS_NA");
  if (chb_details?.additionalDetails?.documentDate) {
    const date = new Date(chb_details?.additionalDetails?.documentDate);
    const month = Digit.Utils.date.monthNames[date.getMonth()];
    documentDate = `${date.getDate()} ${month} ${date.getFullYear()}`;
  }

  async function getRecieptSearch({ tenantId, payments, ...params }) {
    let application = data?.hallsBookingApplication?.[0];
    let fileStoreId = application?.paymentReceiptFilestoreId;
    if (!fileStoreId) {
      let response = { filestoreIds: [payments?.fileStoreId] };
      response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments }] }, "chbservice-receipt");
      const updatedApplication = {
        ...application,
        paymentReceiptFilestoreId: response?.filestoreIds[0],
      };
      await mutation.mutateAsync({
        hallsBookingApplication: updatedApplication,
      });
      fileStoreId = response?.filestoreIds[0];
      refetch();
    }
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
    window.open(fileStore[fileStoreId], "_blank");
  }
  async function getPermissionLetter({ tenantId, payments, ...params }) {
    let application = data?.hallsBookingApplication?.[0];
    let fileStoreId = application?.permissionLetterFilestoreId;
    if (!fileStoreId) {
      const response = await Digit.PaymentService.generatePdf(tenantId, { hallsBookingApplication: [application] }, "chbpermissionletter");
      const updatedApplication = {
        ...application,
        permissionLetterFilestoreId: response?.filestoreIds[0],
      };
      await mutation.mutateAsync({
        hallsBookingApplication: updatedApplication,
      });
      fileStoreId = response?.filestoreIds[0];
      refetch();
    }
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
    window.open(fileStore[fileStoreId], "_blank");
  }

  const handleDownload = async (document, tenantid) => {
    let tenantId = tenantid ? tenantid : tenantId;
    const res = await Digit.UploadServices.Filefetch([document?.fileStoreId], tenantId);
    let documentLink = pdfDownloadLink(res.data, document?.fileStoreId);
    window.open(documentLink, "_blank");
  };

  let dowloadOptions = [];

  // // Payment Receipt Button on Acknowledgement Page
  // if (reciept_data?.Payments[0]?.paymentStatus !== "DEPOSITED")
  // dowloadOptions.push({
  //   label: t("CHB_DOWNLOAD_ACK_FORM"),
  //   onClick: () => getChbAcknowledgement(),
  // });

  //commented out, need later for download receipt and certificate
  if (reciept_data && reciept_data?.Payments.length > 0 && recieptDataLoading == false)
    dowloadOptions.push({
      label: t("CHB_FEE_RECEIPT"),
      onClick: () => getRecieptSearch({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
    });
  if (reciept_data && reciept_data?.Payments.length > 0 && recieptDataLoading == false)
    dowloadOptions.push({
      label: t("CHB_PERMISSION_LETTER"),
      onClick: () => getPermissionLetter({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
    });

  // if (reciept_data?.Payments[0]?.paymentStatus === "DEPOSITED")
  //   dowloadOptions.push({
  //     label: t("CHB_CERTIFICATE"),
  //     onClick: () => printCertificate(),
  //   });

  //   const getBookingDateRange = (bookingSlotDetails) => {
  //     if (!bookingSlotDetails || bookingSlotDetails.length === 0) {
  //       return t("CS_NA");
  //     }
  //     const startDate = bookingSlotDetails[0]?.bookingDate;
  //     const endDate = bookingSlotDetails[bookingSlotDetails.length - 1]?.bookingDate;
  //     if (startDate === endDate) {
  //       return startDate; // Return only the start date
  //     } else {
  //       // Format date range as needed, for example: "startDate - endDate"
  //       return startDate && endDate ? `${endDate} - ${startDate} ` : t("CS_NA");
  //     }
  //   };
  //  const getBookingTimeRange = (bookingSlotDetails) => {
  //     if (!bookingSlotDetails || bookingSlotDetails.length === 0) {
  //       return "10:00 - 11:59"; // Default time range if details are not present
  //     }
  //     const startTime = bookingSlotDetails[0]?.bookingFromTime;
  //     // const endTime = bookingSlotDetails[bookingSlotDetails.length - 1]?.bookingToTime;
  //     const length = bookingSlotDetails.length;
  //     let defaultEndTime = "11:59"; // Default end time for length 1
  //     if (length === 2) {
  //       defaultEndTime = "23:59"; // End time for length 2
  //     } else if (length === 3) {
  //       defaultEndTime = "71:59"; // End time for length 3
  //     }
  //     // Return formatted time range
  //     return startTime ? `${startTime} - ${defaultEndTime}` : t("CS_NA");
  //   };
  const columns = [
    { Header: `${t("CHB_HALL_NUMBER")}`, accessor: "communityHallCode" },
    { Header: `${t("CHB_HALL_CODE")}`, accessor: "hallCode" },
    { Header: `${t("CHB_BOOKING_DATE")}`, accessor: "bookingDate" },
    { Header: `${t("PT_COMMON_TABLE_COL_STATUS_LABEL")}`, accessor: "bookingStatus" },
  ];

  const slotlistRows =
    chb_details?.bookingSlotDetails?.map((slot) => ({
      communityHallCode: `${t(chb_details?.communityHallCode)}`,
      hallCode: t(slot.hallCode) + " - " + slot.capacity,
      bookingDate: slot.bookingDate + " (" + slot.bookingFromTime + " - " + slot.bookingToTime + ")",
      bookingStatus: t(`WF_NEWTL_${slot?.status}`),
    })) || [];
  return (
    <React.Fragment>
      <div>
        <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
          <Header styles={{ fontSize: "32px" }}>{t("CHB_BOOKING_DETAILS")}</Header>
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
          {/* <StatusTable>
            
          </StatusTable> */}

          <CardSubHeader style={{ fontSize: "24px" }}>{t("CHB_APPLICANT_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("CHB_APPLICANT_NAME")} text={chb_details?.applicantDetail?.applicantName || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_MOBILE_NUMBER")} text={chb_details?.applicantDetail?.applicantMobileNo || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_EMAIL_ID")} text={chb_details?.applicantDetail?.applicantEmailId || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_BOOKING_NO")} text={chb_details?.bookingNo} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("CHB_EVENT_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("CHB_SPECIAL_CATEGORY")} text={t(chb_details?.specialCategory?.category) || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_PURPOSE")} text={t(chb_details?.purpose?.purpose) || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_PURPOSE_DESCRIPTION")} text={chb_details?.purposeDescription || t("CS_NA")} />
          </StatusTable>

          {/* <CardSubHeader style={{ fontSize: "24px" }}>{t("CHB_ADDRESS_DETAILS")}</CardSubHeader> */}
          {/* <StatusTable>
            <Row className="border-none" label={t("CHB_PINCODE")} text={chb_details?.address?.pincode || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_CITY")} text={chb_details?.address?.city || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_LOCALITY")} text={chb_details?.address?.locality || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_STREET_NAME")} text={chb_details?.address?.streetName || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_HOUSE_NO")} text={chb_details?.address?.houseNo || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_LANDMARK")} text={chb_details?.address?.landmark || t("CS_NA")} />
          </StatusTable> */}
          {/* <CardSubHeader style={{ fontSize: "24px" }}>{t("CHB_BANK_DETAILS")}</CardSubHeader> */}
          {/* <StatusTable>
            <Row className="border-none" label={t("CHB_ACCOUNT_NUMBER")} text={chb_details?.applicantDetail?.accountNumber || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_IFSC_CODE")} text={chb_details?.applicantDetail?.ifscCode || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_BANK_NAME")} text={chb_details?.applicantDetail?.bankName || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_BANK_BRANCH_NAME")} text={chb_details?.applicantDetail?.bankBranchName || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_ACCOUNT_HOLDER_NAME")} text={chb_details?.applicantDetail?.accountHolderName || t("CS_NA")} />
          </StatusTable> */}
          <CardSubHeader style={{ fontSize: "24px", marginTop: "30px" }}>{t("SLOT_DETAILS")}</CardSubHeader>
          <ApplicationTable
            t={t}
            data={slotlistRows}
            columns={columns}
            getCellProps={(cellInfo) => ({
              style: {
                minWidth: "150px",
                padding: "10px",
                fontSize: "16px",
                paddingLeft: "20px",
              },
            })}
            isPaginationRequired={false}
            totalRecords={slotlistRows.length}
          />

          <CardSubHeader style={{ fontSize: "24px", marginTop: "30px" }}>{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
          <StatusTable>
            {console.log("doc===", docs)}
            <Card style={{ display: "flex", flexDirection: "row", gap: "30px" }}>
              {docs?.length > 0 ? (
                docs?.map((doc, index) => (
                  <React.Fragment key={index}>
                    <div>
                      <CHBDocument value={docs} Code={doc?.documentType} index={index} />
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
      </div>
    </React.Fragment>
  );
};

export default CHBApplicationDetails;
