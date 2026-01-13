import { Banner, Card, CardText, Loader, Row, StatusTable, SubmitBar, DownloadPrefixIcon } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { Link, useParams, useLocation } from "react-router-dom";
import { transformBookingResponseToBookingData, ChallanData, amountToWords, getLocationName, formatDate } from "../../index";

export const SuccessfulPayment = (props) => {
  console.log("Getting Here 2");
  if (localStorage.getItem("BillPaymentEnabled") !== "true") {
    window.history.forward();
    return null;
  }
  return <WrapPaymentComponent {...props} />;
};

export const convertEpochToDate = (dateEpoch) => {
  // Returning NA in else case because new Date(null) returns Current date from calender
  if (dateEpoch) {
    const dateFromApi = new Date(dateEpoch);
    let month = dateFromApi.getMonth() + 1;
    let day = dateFromApi.getDate();
    let year = dateFromApi.getFullYear();
    month = (month > 9 ? "" : "0") + month;
    day = (day > 9 ? "" : "0") + day;
    return `${day}/${month}/${year}`;
  } else {
    return "NA";
  }
};

const WrapPaymentComponent = (props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { eg_pg_txnid: egId, workflow: workflw, propertyId } = Digit.Hooks.useQueryParams();
  const [printing, setPrinting] = useState(false);
  const [chbPermissionLoading, setChbPermissionLoading] = useState(false);

  const [allowFetchBill, setallowFetchBill] = useState(false);
  const { businessService: business_service, consumerCode, tenantId, receiptNumber } = useParams();
  console.log("business_service here in citizen payment", business_service);
  console.log("tenantId here", tenantId);
  const { data: bpaData = {}, isLoading: isBpaSearchLoading, isSuccess: isBpaSuccess, error: bpaerror } = Digit.Hooks.obps.useOBPSSearch(
    "",
    {},
    tenantId,
    { applicationNo: consumerCode },
    {},
    { enabled: window.location.href.includes("bpa") || window.location.href.includes("BPA") }
  );

  console.log("bpaData rn here", bpaData);
  const { data: applicationDetails } = Digit.Hooks.obps.useLicenseDetails(tenantId, { applicationNumber: consumerCode, tenantId }, {});
  console.log("applicationDetails rn here", applicationDetails);

  const { data: cluapplicationdetails } = Digit.Hooks.obps.useCLUSearchApplication({ applicationNo: consumerCode }, tenantId, {});
  const { data: layoutapplicationdetails } = Digit.Hooks.obps.useLayoutSearchApplication({ applicationNo: consumerCode }, tenantId);

  console.log("cluapplicationdetails", cluapplicationdetails);
  console.log("layoutapplicationdetails", layoutapplicationdetails);
  let challanEmpData = ChallanData(tenantId, consumerCode);

  const { isLoading, data, isError } = Digit.Hooks.usePaymentUpdate({ egId }, business_service, {
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const cities = Digit.Hooks.useTenants();
  console.log("cities", cities);
  let ulbType,
    districtCode,
    ulbCode = "";
  const loginCity = JSON.parse(sessionStorage.getItem("Digit.CITIZEN.COMMON.HOME.CITY"))?.value?.city?.districtName;
  console.log("loginCity", loginCity);
  if (cities.data !== undefined) {
    const selectedTenantData = cities.data.find((item) => item?.city?.name === loginCity);
    console.log("selectedTenantData", selectedTenantData);
    ulbType = selectedTenantData?.city?.ulbGrade;
    ulbCode = selectedTenantData?.city?.code;
    districtCode = selectedTenantData?.city?.districtCode;
  }
  console.log("ulbCode & districtCode", ulbCode, districtCode);

  // const { label } = Digit.Hooks.useApplicationsForBusinessServiceSearch({ businessService: business_service }, { enabled: false });

  // const { data: demand } = Digit.Hooks.useDemandSearch(
  //   { consumerCode, businessService: business_service },
  //   { enabled: !isLoading, retry: false, staleTime: Infinity, refetchOnWindowFocus: false }
  // );

  // const { data: billData, isLoading: isBillDataLoading } = Digit.Hooks.useFetchPayment(
  //   { tenantId, consumerCode, businessService: business_service },
  //   { enabled: allowFetchBill, retry: false, staleTime: Infinity, refetchOnWindowFocus: false }
  // );

  const mutation = Digit.Hooks.chb.useChbCreateAPI(tenantId, false);

  const newTenantId = business_service.includes("WS.ONE_TIME_FEE" || "SW.ONE_TIME_FEE") ? Digit.ULBService.getStateId() : tenantId;
  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId,
      businessService: business_service,
      receiptNumbers: data?.payments?.Payments?.[0]?.paymentDetails[0].receiptNumber,
    },
    {
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      select: (dat) => {
        return dat.Payments[0];
      },
      enabled: allowFetchBill,
    }
  );

  const { data: generatePdfKey } = Digit.Hooks.useCommonMDMS(newTenantId, "common-masters", "ReceiptKey", {
    select: (data) =>
      business_service === "BPA.NC_SAN_FEE"
        ? "bpa-receiptsecond"
        : business_service === "BPA.NC_APP_FEE"
        ? "bpa-obps-receipt"
        : business_service === "GC.ONE_TIME_FEE"
        ? "garbage-receipt"
        : business_service === "clu"
        ? "clu-receipt"
        : business_service === "layout"
        ? "layout-receipt"
        : business_service === "rl-services"
        ? "rentandlease-receipt"
        : data["common-masters"]?.uiCommonPay?.filter(({ code }) => business_service?.includes(code))[0]?.receiptKey,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  //if businessservice= san fee make bpa-receiptsecond as the generatedpdfkey
  //if businessservice = app fee make bpa-obps-receipt as generatedpdfkey
  const payments = data?.payments;

  useEffect(() => {
    return () => {
      localStorage.setItem("BillPaymentEnabled", "false");
      queryClient.clear();
    };
  }, []);

  useEffect(() => {
    if (data && data.txnStatus && data.txnStatus !== "FAILURE") {
      setallowFetchBill(true);
    }
  }, [data]);

  if (isLoading || recieptDataLoading) {
    return <Loader />;
  }

  const applicationNo = data?.applicationNo;

  const isMobile = window.Digit.Utils.browser.isMobile();

  if (isError || !payments || !payments.Payments || payments.Payments.length === 0 || data.txnStatus === "FAILURE") {
    return (
      <Card>
        <Banner
          message={t("CITIZEN_FAILURE_COMMON_PAYMENT_MESSAGE")}
          info={t("CS_PAYMENT_TRANSANCTION_ID")}
          applicationNumber={egId}
          successful={false}
        />
        <CardText>{t("CS_PAYMENT_FAILURE_MESSAGE")}</CardText>
        {!business_service?.includes("PT") ? (
          <Link to={`/digit-ui/citizen`}>
            <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
          </Link>
        ) : (
          <React.Fragment>
            <Link to={(applicationNo && `/digit-ui/citizen/payment/my-bills/${business_service}/${applicationNo}`) || "/digit-ui/citizen"}>
              <SubmitBar label={t("CS_PAYMENT_TRY_AGAIN")} />
            </Link>
            {/* {business_service?.includes("PT") &&<div style={{marginTop:"10px"}}><Link to={`/digit-ui/citizen/feedback?redirectedFrom=${"digit-ui/citizen/payment/success"}&propertyId=${consumerCode? consumerCode : ""}&acknowldgementNumber=${egId ? egId : ""}&tenantId=${tenantId}&creationReason=${business_service?.split(".")?.[1]}`}>
              <SubmitBar label={t("CS_REVIEW_AND_FEEDBACK")} />
            </Link></div>} */}
            <div className="link" style={isMobile ? { marginTop: "8px", width: "100%", textAlign: "center" } : { marginTop: "8px" }}>
              <Link to={`/digit-ui/citizen`}>{t("CORE_COMMON_GO_TO_HOME")}</Link>
            </div>
          </React.Fragment>
        )}
      </Card>
    );
  }
  const paymentData = data?.payments?.Payments[0];
  console.log("paymentData here here", paymentData);
  const amount = reciept_data?.paymentDetails?.[0]?.totalAmountPaid;
  const transactionDate = paymentData?.transactionDate;
  const printCertificate = async () => {
    //const tenantId = Digit.ULBService.getCurrentTenantId();
    const state = tenantId;
    const applicationDetails = await Digit.TLService.search({ applicationNumber: consumerCode, tenantId });
    const generatePdfKeyForTL = "tlcertificate";

    if (applicationDetails) {
      let response = await Digit.PaymentService.generatePdf(state, { Licenses: applicationDetails?.Licenses }, generatePdfKeyForTL);
      const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
      window.open(fileStore[response.filestoreIds[0]], "_blank");
    }
  };

  const svCertificate = async () => {
    //const tenantId = Digit.ULBService.getCurrentTenantId();
    const state = tenantId;
    const applicationDetails = await Digit.SVService.search({ tenantId, filters: { applicationNumber: consumerCode, isDraftApplication: false } });
    const generatePdfKeyForTL = "svcertificate";

    if (applicationDetails) {
      let response = await Digit.PaymentService.generatePdf(state, { SVDetail: [applicationDetails?.SVDetail?.[0]] }, generatePdfKeyForTL);
      const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
      window.open(fileStore[response.filestoreIds[0]], "_blank");
    }
  };

  const svIdCard = async () => {
    //const tenantId = Digit.ULBService.getCurrentTenantId();
    const state = tenantId;
    const applicationDetails = await Digit.SVService.search({ tenantId, filters: { applicationNumber: consumerCode, isDraftApplication: false } });
    const generatePdfKeyForTL = "svidentitycard";

    if (applicationDetails) {
      let response = await Digit.PaymentService.generatePdf(state, { SVDetail: [applicationDetails?.SVDetail?.[0]] }, generatePdfKeyForTL);
      const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
      window.open(fileStore[response.filestoreIds[0]], "_blank");
    }
  };

  // const printpetCertificate = async () => {
  //   // const tenantId = Digit.ULBService.getCurrentTenantId();
  //   const state = tenantId;
  //   const applicationDetails = await Digit.PTRService.search({ applicationNumber: consumerCode, tenantId });
  //   console.log("aplllldetailllin citizen",applicationDetails)
  //   const generatePdfKeyForPTR = "petservicecertificate";

  //   if (applicationDetails) {
  //     let response = await Digit.PaymentService.generatePdf(state, { PetRegistrationApplications: applicationDetails?.PetRegistrationApplications }, generatePdfKeyForPTR);
  //     const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
  //     window.open(fileStore[response.filestoreIds[0]], "_blank");
  //   }
  // };

  const printReciept = async () => {
    console.log("function is payment receipt");
    let generatePdfKeyForWs = "ws-onetime-receipt";
    if (printing) return;
    setPrinting(true);
    let paymentArray = [];
    const tenantId = paymentData?.tenantId;

    let licenseSection, licenseType, usage, fileNo, fileStoreTenant;

    if (applicationDetails) {
      licenseSection = applicationDetails?.applicationDetails?.find((section) => section?.title === "BPA_LICENSE_DETAILS_LABEL");

      licenseType = t(licenseSection?.values?.find((val) => val?.title === "BPA_LICENSE_TYPE")?.value);
    }

    const sourceData =
      bpaData?.[0] || cluapplicationdetails?.resData?.Clu?.[0]?.cluDetails || layoutapplicationdetails?.resData?.Layout?.[0]?.layoutDetails;

    if (sourceData) {
      fileNo = `PB/${districtCode}/${ulbCode}/${+sourceData?.approvalNo?.slice(-6) + 500000}`;
      console.log("newCode", fileNo);
      usage = sourceData?.additionalDetails?.usage || sourceData?.additionalDetails?.siteDetails?.buildingCategory?.name;
      console.log("usage", usage);
    }

    console.log("licenseType:", licenseType);
    const state = Digit.ULBService.getStateId();
    const fee = paymentData?.totalAmountPaid;
    console.log("fee here here", fee);
    const amountinwords = amountToWords(fee);
    let response = { filestoreIds: [payments.Payments[0]?.fileStoreId] };
    if (!paymentData?.fileStoreId) {
      //if not filestoreid
      let assessmentYear = "",
        assessmentYearForReceipt = "";
      let count = 0;
      let toDate, fromDate;
      if (payments.Payments[0].paymentDetails[0].businessService == "PT") {
        payments.Payments[0].paymentDetails[0].bill.billDetails.map((element) => {
          if (element.amount > 0 || element.amountPaid > 0) {
            count = count + 1;
            toDate = convertEpochToDate(element.toPeriod).split("/")[2];
            fromDate = convertEpochToDate(element.fromPeriod).split("/")[2];
            assessmentYear =
              assessmentYear == ""
                ? fromDate + "-" + toDate + "(Rs." + element.amountPaid + ")"
                : assessmentYear + "," + fromDate + "-" + toDate + "(Rs." + element.amountPaid + ")";
            assessmentYearForReceipt = fromDate + "-" + toDate;
          }
        });

        if (count == 0) {
          let toDate = convertEpochToDate(payments.Payments[0].paymentDetails[0].bill.billDetails[0].toPeriod).split("/")[2];
          let fromDate = convertEpochToDate(payments.Payments[0].paymentDetails[0].bill.billDetails[0].fromPeriod).split("/")[2];
          assessmentYear = assessmentYear == "" ? fromDate + "-" + toDate : assessmentYear + "," + fromDate + "-" + toDate;
          assessmentYearForReceipt = fromDate + "-" + toDate;
        }

        const details = {
          assessmentYears: assessmentYear,
          arrearCode: "",
        };

        payments.Payments[0].paymentDetails[0].additionalDetails = details;
        printRecieptNew(payments);
      } else {
        let details;

        if (payments.Payments[0].paymentDetails[0].businessService == "BPAREG") {
          details = { ...payments.Payments[0].additionalDetails, stakeholderType: "Application" };
        }
        payments.Payments[0].additionalDetails = details;
        paymentArray[0] = payments.Payments[0];
        if (business_service == "WS" || business_service == "SW") {
          response = await Digit.PaymentService.generatePdf(state, { Payments: [{ ...paymentData }] }, generatePdfKeyForWs);
        } else if (
          paymentData.paymentDetails[0].businessService.includes("BPA") ||
          paymentData.paymentDetails[0].businessService.includes("clu") ||
          paymentData.paymentDetails[0].businessService.includes("layout")
        ) {
          const designation = ulbType === "Municipal Corporation" ? "Municipal Commissioner" : "Executive Officer";
          let updatedpayments;
          if (paymentData.paymentDetails[0].businessService.includes("BPAREG")) {
            updatedpayments = {
              ...paymentData,
              paymentDetails: [
                {
                  ...paymentData?.paymentDetails?.[0],
                  additionalDetails: {
                    ...paymentData?.paymentDetails?.[0]?.additionalDetails,
                    stakeholderType: "Applicant",
                  },
                },
              ],
              additionalDetails: {
                ...paymentData.additionalDetails,
                designation: designation,
                ulbType: ulbType,
              },
              licenseType,
              amountinwords,
              ulbType,
            };
          } else {
            updatedpayments = {
              ...paymentData,
              additionalDetails: {
                ...paymentData.additionalDetails,
                designation: designation,
                ulbType: ulbType,
                ulbCode,
                districtCode,
              },
              licenseType,
              amountinwords,
              usage,
              fileNo,
            };
          }

          response = await Digit.PaymentService.generatePdf(state, { Payments: [{ ...updatedpayments }] }, generatePdfKey);
        } else {
          response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...paymentData }] }, generatePdfKey);
        }
      }
    }
    fileStoreTenant = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });

    const fileStore =
      fileStoreTenant && fileStoreTenant[response.filestoreIds[0]]
        ? fileStoreTenant
        : await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });

    if (fileStore && fileStore[response.filestoreIds[0]]) {
      window.open(fileStore[response.filestoreIds[0]], "_blank");
    }
    setPrinting(false);
  };

  const convertDateToEpoch = (dateString, dayStartOrEnd = "dayend") => {
    //example input format : "2018-10-02"
    try {
      const parts = dateString.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      const DateObj = new Date(Date.UTC(parts[1], parts[2] - 1, parts[3]));
      DateObj.setMinutes(DateObj.getMinutes() + DateObj.getTimezoneOffset());
      if (dayStartOrEnd === "dayend") {
        DateObj.setHours(DateObj.getHours() + 24);
        DateObj.setSeconds(DateObj.getSeconds() - 1);
      }
      return DateObj.getTime();
    } catch (e) {
      return dateString;
    }
  };

  const printPdf = (blob) => {
    const fileURL = URL.createObjectURL(blob);
    var myWindow = window.open(fileURL);
    if (myWindow != undefined) {
      myWindow.addEventListener("load", (event) => {
        myWindow.focus();
        myWindow.print();
      });
    }
  };

  const downloadPdf = (blob, fileName) => {
    if (window.mSewaApp && window.mSewaApp.isMsewaApp() && window.mSewaApp.downloadBase64File) {
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        var base64data = reader.result;
        mSewaApp.downloadBase64File(base64data, fileName);
      };
    } else {
      const link = document.createElement("a");
      // create a blobURI pointing to our Blob
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      // some browser needs the anchor to be in the doc
      document.body.append(link);
      link.click();
      link.remove();
      // in case the Blob uses a lot of memory
      setTimeout(() => URL.revokeObjectURL(link.href), 7000);
    }
  };
  // let workflowDetails = Digit.Hooks.useWorkflowDetails({
  //   tenantId: "pg.citya",
  //   id: "PG-BP-2024-09-23-001337",
  //   moduleCode: "OBPS",
  // });
  // console.log("workflowDetails",workflowDetails)
  const getPermitOccupancyOrderSearch = async (order, mode = "download") => {
    let queryObj = { applicationNo: bpaData?.[0]?.applicationNo };
    let bpaResponse = await Digit.OBPSService.BPASearch(bpaData?.[0]?.tenantId, queryObj);
    const edcrResponse = await Digit.OBPSService.scrutinyDetails(bpaData?.[0]?.tenantId, { edcrNumber: bpaData?.[0]?.edcrNumber });
    let bpaDataDetails = bpaResponse?.BPA?.[0],
      edcrData = edcrResponse?.edcrDetail?.[0];
    let currentDate = new Date();
    bpaDataDetails.additionalDetails.runDate = convertDateToEpoch(
      currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate()
    );
    let reqData = { ...bpaDataDetails, edcrDetail: [{ ...edcrData }] };
    const state = Digit.ULBService.getStateId();

    let count = 0;
    reqData.additionalDetails.submissionDate = bpaData?.[0]?.workflowData?.auditDetails?.createdTime;
    // for(let i=0;i<bpaData?.[0]?.data?.processInstances?.length;i++){
    //   if((workflowDetails?.data?.processInstances[i]?.action==="POST_PAYMENT_APPLY" ||workflowDetails?.data?.processInstances[i]?.action==="PAY" ) && (workflowDetails?.data?.processInstances?.[i]?.state?.applicationStatus==="APPROVAL_INPROGRESS")   && count==0 ){
    //       reqData.additionalDetails.submissionDate=workflowDetails?.data?.processInstances[i]?.auditDetails?.createdTime;
    //       count=1;
    //     }
    // }

    if (reqData?.additionalDetails?.approvedColony == "NO") {
      reqData.additionalDetails.permitData =
        "The plot has been officially regularized under No." +
        reqData?.additionalDetails?.NocNumber +
        "  dated dd/mm/yyyy, registered in the name of <name as per the NOC>. This regularization falls within the jurisdiction of " +
        state +
        ".Any form of misrepresentation of the NoC is strictly prohibited. Such misrepresentation renders the building plan null and void, and it will be regarded as an act of impersonation. Criminal proceedings will be initiated against the owner and concerned architect / engineer/ building designer / supervisor involved in such actions";
    } else if (reqData?.additionalDetails?.approvedColony == "YES") {
      reqData.additionalDetails.permitData = "The building plan falls under approved colony " + reqData?.additionalDetails?.nameofApprovedcolony;
    } else {
      reqData.additionalDetails.permitData = "The building plan falls under Lal Lakir";
    }
    let response = await Digit.PaymentService.generatePdf(bpaDataDetails?.tenantId, { Bpa: [reqData] }, order);
    const fileStore = await Digit.PaymentService.printReciept(bpaDataDetails?.tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");

    reqData["applicationType"] = bpaDataDetails?.additionalDetails?.applicationType;
    let edcrresponse = await Digit.OBPSService.edcr_report_download({ BPA: { ...reqData } });
    const responseStatus = parseInt(edcrresponse.status, 10);
    if (responseStatus === 201 || responseStatus === 200) {
      mode == "print"
        ? printPdf(new Blob([edcrresponse.data], { type: "application/pdf" }))
        : downloadPdf(new Blob([edcrresponse.data], { type: "application/pdf" }), `edcrReport.pdf`);
    }
  };

  const getBillingPeriod = (billDetails) => {
    const { taxPeriodFrom, taxPeriodTo, fromPeriod, toPeriod } = billDetails || {};
    if (taxPeriodFrom && taxPeriodTo) {
      let from = new Date(taxPeriodFrom).getFullYear().toString();
      let to = new Date(taxPeriodTo).getFullYear().toString();
      return "FY " + from + "-" + to;
    } else if (fromPeriod && toPeriod) {
      if (workflw === "mcollect") {
        let from =
          new Date(fromPeriod).getDate().toString() +
          " " +
          Digit.Utils.date.monthNames[new Date(fromPeriod).getMonth()].toString() +
          " " +
          new Date(fromPeriod).getFullYear().toString();
        let to =
          new Date(toPeriod).getDate() + " " + Digit.Utils.date.monthNames[new Date(toPeriod).getMonth()] + " " + new Date(toPeriod).getFullYear();
        return from + " - " + to;
      } else if (workflw === "WNS") {
        let from =
          new Date(fromPeriod).getDate().toString() +
          "/" +
          (new Date(fromPeriod).getMonth() + 1).toString() +
          "/" +
          new Date(fromPeriod).getFullYear().toString();
        let to = new Date(toPeriod).getDate() + "/" + (new Date(toPeriod).getMonth() + 1) + "/" + new Date(toPeriod).getFullYear();
        return from + " - " + to;
      }
      let from = new Date(fromPeriod).getFullYear().toString();
      let to = new Date(toPeriod).getFullYear().toString();
      return "FY " + from + "-" + to;
    } else return "N/A";
  };

  const printChallanReceipt = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const applicationDetails = await Digit.ChallanGenerationService.search({ tenantId, filters: { challanNo: consumerCode } });
      const challan = {
        ...applicationDetails,
        ...challanEmpData,
      };
      console.log("applicationDetails", applicationDetails);
      let application = challan;
      let fileStoreId = applicationDetails?.Applications?.[0]?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        const payments = await Digit.PaymentService.getReciept(tenantId, business_service, { receiptNumbers: receiptNumber });
        let response = await Digit.PaymentService.generatePdf(
          tenantId,
          { Payments: [{ ...(payments?.Payments?.[0] || {}), challan: application }] },
          "challangeneration-receipt"
        );
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } finally {
      setPrinting(false);
    }
  };
  const printChallanNotice = async () => {
    if (chbPermissionLoading) return;
    setChbPermissionLoading(true);
    try {
      const applicationDetails = await Digit.ChallanGenerationService.search({ tenantId, filters: { challanNo: consumerCode } });
      const location = await getLocationName(
        applicationDetails?.challans?.[0]?.additionalDetail?.latitude,
        applicationDetails?.challans?.[0]?.additionalDetail?.longitude
      );
      console.log("location", location);
      const challan = {
        ...applicationDetails,
        ...challanEmpData,
      };
      console.log("applicationDetails", applicationDetails);
      let application = challan;
      let fileStoreId = applicationDetails?.Applications?.[0]?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        const payments = await Digit.PaymentService.getReciept(tenantId, business_service, { receiptNumbers: receiptNumber });
        let response = await Digit.PaymentService.generatePdf(
          tenantId,
          { challan: { ...application, ...(payments?.Payments?.[0] || {}), location } },
          "challan-notice"
        );
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } finally {
      setChbPermissionLoading(false);
    }
  };
  const printPermissionLetter = async () => {
    if (chbPermissionLoading) return;
    setChbPermissionLoading(true);
    try {
      const applicationDetails = await Digit.CHBServices.search({ tenantId, filters: { bookingNo: consumerCode } });
      let application = {
        hallsBookingApplication: (applicationDetails?.hallsBookingApplication || []).map((app) => {
          return {
            ...app,
            bookingSlotDetails: [...(app.bookingSlotDetails || [])]
              .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate))
              .map((slot) => ({
                ...slot,
                bookingDate: formatDate(slot.bookingDate),
                bookingEndDate: formatDate(slot.bookingEndDate),
              })),
          };
        }),
      };

      let fileStoreId = applicationDetails?.hallsBookingApplication?.[0]?.permissionLetterFilestoreId;
      const generatePdfKeyForTL = "chb-permissionletter";
      if (!fileStoreId) {
        const payments = await Digit.PaymentService.getReciept(tenantId, business_service, { receiptNumbers: receiptNumber });

        const response = await Digit.PaymentService.generatePdf(
          tenantId,
          { Payments: [{ ...(payments?.Payments?.[0] || {}), ...application }] },
          generatePdfKeyForTL
        );
        const updatedApplication = {
          ...applicationDetails?.hallsBookingApplication[0],
          permissionLetterFilestoreId: response?.filestoreIds[0],
        };
        await mutation.mutateAsync({
          hallsBookingApplication: updatedApplication,
        });
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } finally {
      setChbPermissionLoading(false);
    }
  };

  const printCHBReceipt = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const applicationDetails = await Digit.CHBServices.search({ tenantId, filters: { bookingNo: consumerCode } });
      let application = {
        hallsBookingApplication: (applicationDetails?.hallsBookingApplication || []).map((app) => {
          return {
            ...app,
            bookingSlotDetails: [...(app.bookingSlotDetails || [])]
              .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate))
              .map((slot) => ({
                ...slot,
                bookingDate: formatDate(slot.bookingDate),
                bookingEndDate: formatDate(slot.bookingEndDate),
              })),
          };
        }),
      };
      let fileStoreId = applicationDetails?.hallsBookingApplication?.[0]?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        let response = { filestoreIds: [payments?.fileStoreId] };
        response = await Digit.PaymentService.generatePdf(
          tenantId,
          { Payments: [{ ...(payments?.Payments?.[0] || {}), ...application }] },
          "chbservice-receipt"
        );
        const updatedApplication = {
          ...applicationDetails?.hallsBookingApplication[0],
          paymentReceiptFilestoreId: response?.filestoreIds[0],
        };
        await mutation.mutateAsync({
          hallsBookingApplication: updatedApplication,
        });
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } finally {
      setPrinting(false);
    }
  };

  const printNDCReceipt = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      console.log("consumerCode for ndc", consumerCode);
      console.log("tenantId for ndc", tenantId);
      const applicationDetails = await Digit.NDCService.NDCsearch({
        tenantId,
        filters: { applicationNo: consumerCode },
      });
      let application = applicationDetails?.Applications?.[0];
      let fileStoreId = applicationDetails?.Applications?.[0]?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        const payments = await Digit.PaymentService.getReciept(tenantId, business_service, { receiptNumbers: receiptNumber });
        let response = await Digit.PaymentService.generatePdf(
          tenantId,
          { Payments: [{ ...(payments?.Payments?.[0] || {}), ...application }] },
          "ndc-receipt"
        );
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } finally {
      setPrinting(false);
    }
  };

  const printADVReceipt = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const applicationDetails = await Digit.ADSServices.search({ tenantId, filters: { bookingNo: consumerCode } });
      const new_data = transformBookingResponseToBookingData(applicationDetails);
      let application = new_data;
      let fileStoreId = applicationDetails?.BookingApplication?.[0]?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        const payments = await Digit.PaymentService.getReciept(tenantId, business_service, { receiptNumbers: receiptNumber });
        let response = await Digit.PaymentService.generatePdf(
          tenantId,
          { Payments: [{ ...(payments?.Payments?.[0] || {}), ...application }] },
          "adv-bill"
        );
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } finally {
      setPrinting(false);
    }
  };
  let bannerText;
  if (workflw) {
    bannerText = `CITIZEN_SUCCESS_UC_PAYMENT_MESSAGE`;
  } else {
    if (paymentData?.paymentDetails?.[0]?.businessService && paymentData?.paymentDetails?.[0]?.businessService?.includes("BPA")) {
      let nameOfAchitect = sessionStorage.getItem("BPA_ARCHITECT_NAME");
      let parsedArchitectName = nameOfAchitect ? JSON.parse(nameOfAchitect) : "ARCHITECT";
      bannerText = `CITIZEN_SUCCESS_${paymentData?.paymentDetails[0]?.businessService.replace(/\./g, "_")}_${parsedArchitectName}_PAYMENT_MESSAGE`;
    } else if (business_service?.includes("WS") || business_service?.includes("SW")) {
      bannerText = t(`CITIZEN_SUCCESS_${paymentData?.paymentDetails[0].businessService.replace(/\./g, "_")}_WS_PAYMENT_MESSAGE`);
    } else {
      bannerText = paymentData?.paymentDetails[0]?.businessService
        ? `CITIZEN_SUCCESS_${paymentData?.paymentDetails[0]?.businessService.replace(/\./g, "_")}_PAYMENT_MESSAGE`
        : t("CITIZEN_SUCCESS_UC_PAYMENT_MESSAGE");
    }
  }

  // https://dev.digit.org/collection-services/payments/FSM.TRIP_CHARGES/_search?tenantId=pb.amritsar&consumerCodes=107-FSM-2021-02-18-063433

  // if (billDataLoading) return <Loader />;

  const rowContainerStyle = {
    padding: "4px 0px",
    justifyContent: "space-between",
  };
  //New Payment Reciept For PT module with year bifurcations

  const IconWrapperStyle1 = { display: "flex", fontSize: "16px", fontWeight: "500", gap: "4px", flex: 1 };
  const IconWrapperStyle2 = { display: "flex", fontSize: "16px", fontWeight: "500", gap: "4px", flex: 2 };
  const IconWrapperStyle = { display: "flex", fontSize: "16px", fontWeight: "500", gap: "4px" };

  const printRecieptNew = async (payment) => {
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const state = Digit.ULBService.getStateId();
    let paymentArray = [];
    const payments = await Digit.PaymentService.getReciept(tenantId, "PT", { receiptNumbers: payment.Payments[0].paymentDetails[0].receiptNumber });
    let response = { filestoreIds: [payments.Payments[0]?.fileStoreId] };
    if (true) {
      let assessmentYear = "",
        assessmentYearForReceipt = "";
      let count = 0;
      let toDate, fromDate;
      if (payments.Payments[0].paymentDetails[0].businessService == "PT") {
        let arrearRow = {};
        let arrearArray = [];
        let taxRow = {};
        let taxArray = [];

        let roundoff = 0,
          tax = 0,
          firecess = 0,
          cancercess = 0,
          penalty = 0,
          rebate = 0,
          interest = 0,
          usage_exemption = 0,
          special_category_exemption = 0,
          adhoc_penalty = 0,
          adhoc_rebate = 0,
          total = 0;
        let roundoffT = 0,
          taxT = 0,
          firecessT = 0,
          cancercessT = 0,
          penaltyT = 0,
          rebateT = 0,
          interestT = 0,
          usage_exemptionT = 0,
          special_category_exemptionT = 0,
          adhoc_penaltyT = 0,
          adhoc_rebateT = 0,
          totalT = 0;

        payments.Payments[0].paymentDetails[0].bill.billDetails.map((element) => {
          if (element.amount > 0 || element.amountPaid > 0) {
            count = count + 1;
            toDate = convertEpochToDate(element.toPeriod).split("/")[2];
            fromDate = convertEpochToDate(element.fromPeriod).split("/")[2];
            assessmentYear =
              assessmentYear == ""
                ? fromDate + "-" + toDate + "(Rs." + element.amountPaid + ")"
                : assessmentYear + "," + fromDate + "-" + toDate + "(Rs." + element.amountPaid + ")";
            assessmentYearForReceipt = fromDate + "-" + toDate;

            element.billAccountDetails.map((ele) => {
              if (ele.taxHeadCode == "PT_TAX") {
                tax = ele.adjustedAmount;
                taxT = ele.amount;
              } else if (ele.taxHeadCode == "PT_TIME_REBATE") {
                rebate = ele.adjustedAmount;
                rebateT = ele.amount;
              } else if (ele.taxHeadCode == "PT_CANCER_CESS") {
                cancercess = ele.adjustedAmount;
                cancercessT = ele.amount;
              } else if (ele.taxHeadCode == "PT_FIRE_CESS") {
                firecess = ele.adjustedAmount;
                firecessT = ele.amount;
              } else if (ele.taxHeadCode == "PT_TIME_INTEREST") {
                interest = ele.adjustedAmount;
                interestT = ele.amount;
              } else if (ele.taxHeadCode == "PT_TIME_PENALTY") {
                penalty = ele.adjustedAmount;
                penaltyT = ele.amount;
              } else if (ele.taxHeadCode == "PT_OWNER_EXEMPTION") {
                special_category_exemption = ele.adjustedAmount;
                special_category_exemptionT = ele.amount;
              } else if (ele.taxHeadCode == "PT_ROUNDOFF") {
                roundoff = ele.adjustedAmount;
                roundoffT = ele.amount;
              } else if (ele.taxHeadCode == "PT_UNIT_USAGE_EXEMPTION") {
                usage_exemption = ele.adjustedAmount;
                usage_exemptionT = ele.amount;
              } else if (ele.taxHeadCode == "PT_ADHOC_PENALTY") {
                adhoc_penalty = ele.adjustedAmount;
                adhoc_penaltyT = ele.amount;
              } else if (ele.taxHeadCode == "PT_ADHOC_REBATE") {
                adhoc_rebate = ele.adjustedAmount;
                adhoc_rebateT = ele.amount;
              }

              totalT = totalT + ele.amount;
            });
            arrearRow = {
              year: assessmentYearForReceipt,
              tax: tax,
              firecess: firecess,
              cancercess: cancercess,
              penalty: penalty,
              rebate: rebate,
              interest: interest,
              usage_exemption: usage_exemption,
              special_category_exemption: special_category_exemption,
              adhoc_penalty: adhoc_penalty,
              adhoc_rebate: adhoc_rebate,
              roundoff: roundoff,
              total: element.amountPaid,
            };
            taxRow = {
              year: assessmentYearForReceipt,
              tax: taxT,
              firecess: firecessT,
              cancercess: cancercessT,
              penalty: penaltyT,
              rebate: rebateT,
              interest: interestT,
              usage_exemption: usage_exemptionT,
              special_category_exemption: special_category_exemptionT,
              adhoc_penalty: adhoc_penaltyT,
              adhoc_rebate: adhoc_rebateT,
              roundoff: roundoffT,
              total: element.amount,
            };
            arrearArray.push(arrearRow);
            taxArray.push(taxRow);
          }
        });

        if (count == 0) {
          let toDate = convertEpochToDate(payments.Payments[0].paymentDetails[0].bill.billDetails[0].toPeriod).split("/")[2];
          let fromDate = convertEpochToDate(payments.Payments[0].paymentDetails[0].bill.billDetails[0].fromPeriod).split("/")[2];
          assessmentYear = assessmentYear == "" ? fromDate + "-" + toDate : assessmentYear + "," + fromDate + "-" + toDate;
          assessmentYearForReceipt = fromDate + "-" + toDate;

          payments.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails.map((ele) => {
            if (ele.taxHeadCode == "PT_TAX") {
              tax = ele.adjustedAmount;
              taxT = ele.amount;
            } else if (ele.taxHeadCode == "PT_TIME_REBATE") {
              rebate = ele.adjustedAmount;
              rebateT = ele.amount;
            } else if (ele.taxHeadCode == "PT_CANCER_CESS") {
              cancercess = ele.adjustedAmount;
              cancercessT = ele.amount;
            } else if (ele.taxHeadCode == "PT_FIRE_CESS") {
              firecess = ele.adjustedAmount;
              firecessT = ele.amount;
            } else if (ele.taxHeadCode == "PT_TIME_INTEREST") {
              interest = ele.adjustedAmount;
              interestT = ele.amount;
            } else if (ele.taxHeadCode == "PT_TIME_PENALTY") {
              penalty = ele.adjustedAmount;
              penaltyT = ele.amount;
            } else if (ele.taxHeadCode == "PT_OWNER_EXEMPTION") {
              special_category_exemption = ele.adjustedAmount;
              special_category_exemptionT = ele.amount;
            } else if (ele.taxHeadCode == "PT_ROUNDOFF") {
              roundoff = ele.adjustedAmount;
              roundoffT = ele.amount;
            } else if (ele.taxHeadCode == "PT_UNIT_USAGE_EXEMPTION") {
              usage_exemption = ele.adjustedAmount;
              usage_exemptionT = ele.amount;
            } else if (ele.taxHeadCode == "PT_ADHOC_PENALTY") {
              adhoc_penalty = ele.adjustedAmount;
              adhoc_penaltyT = ele.amount;
            } else if (ele.taxHeadCode == "PT_ADHOC_REBATE") {
              adhoc_rebate = ele.adjustedAmount;
              adhoc_rebateT = ele.amount;
            }

            total = total + ele.adjustedAmount;
            totalT = totalT + ele.amount;
          });
          arrearRow = {
            year: assessmentYearForReceipt,
            tax: tax,
            firecess: firecess,
            cancercess: cancercess,
            penalty: penalty,
            interest: interest,
            usage_exemption: usage_exemption,
            special_category_exemption: special_category_exemption,
            adhoc_penalty: adhoc_penalty,
            adhoc_rebate: adhoc_rebate,
            roundoff: roundoff,
            total: payments.Payments[0].paymentDetails[0].bill.billDetails[0].amountPaid,
          };
          taxRow = {
            year: assessmentYearForReceipt,
            tax: taxT,
            firecess: firecessT,
            cancercess: cancercessT,
            penalty: penaltyT,
            rebate: rebateT,
            interest: interestT,
            usage_exemption: usage_exemptionT,
            special_category_exemption: special_category_exemptionT,
            adhoc_penalty: adhoc_penaltyT,
            adhoc_rebate: adhoc_rebateT,
            roundoff: roundoffT,
            total: payments.Payments[0].paymentDetails[0].bill.billDetails[0].amount,
          };
          arrearArray.push(arrearRow);
          taxArray.push(taxRow);
        }

        const details = {
          assessmentYears: assessmentYear,
          arrearArray: arrearArray,
          taxArray: taxArray,
        };
        payments.Payments[0].paymentDetails[0].additionalDetails = details;
      }

      paymentArray[0] = payments.Payments[0];
      response = await Digit.PaymentService.generatePdf(state, { Payments: paymentArray }, generatePdfKey);
    }
    const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response.filestoreIds[0]], "_blank");
  };
  const ommitRupeeSymbol = ["PT"].includes(business_service);

  if ((window.location.href.includes("bpa") || window.location.href.includes("BPA")) && isBpaSearchLoading) return <Loader />;

  return (
    <Card>
      <Banner
        svg={
          <svg className="payment-svg" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM16 30L6 20L8.82 17.18L16 24.34L31.18 9.16L34 12L16 30Z"
              fill="white"
            />
          </svg>
        }
        message={t("CS_COMMON_PAYMENT_COMPLETE")}
        info={t("CS_COMMON_RECIEPT_NO")}
        applicationNumber={paymentData?.paymentDetails[0].receiptNumber}
        successful={true}
      />
      <CardText></CardText>
      <StatusTable>
        <Row rowContainerStyle={rowContainerStyle} last label={t("APPLICATION_NUMBER")} text={applicationNo} />
        {/** TODO : move this key and value into the hook based on business Service */}
        {(business_service === "PT" || workflw) && (
          <Row
            rowContainerStyle={rowContainerStyle}
            last
            label={t("CS_PAYMENT_BILLING_PERIOD")}
            text={getBillingPeriod(paymentData?.paymentDetails[0]?.bill?.billDetails[0])}
          />
        )}

        {(business_service === "PT" || workflw) && (
          <Row
            rowContainerStyle={rowContainerStyle}
            last
            label={t("CS_PAYMENT_AMOUNT_PENDING")}
            text={
              paymentData?.totalDue - paymentData?.totalAmountPaid ||
              (reciept_data?.paymentDetails?.[0]?.totalDue && reciept_data?.paymentDetails?.[0]?.totalAmountPaid)
                ? `₹ ${reciept_data?.paymentDetails?.[0]?.totalDue - reciept_data?.paymentDetails?.[0]?.totalAmountPaid}`
                : `₹ ${0}`
            }
          />
        )}

        <Row rowContainerStyle={rowContainerStyle} last label={t("CS_PAYMENT_TRANSANCTION_ID")} text={egId} />
        <Row
          rowContainerStyle={rowContainerStyle}
          last
          label={t(ommitRupeeSymbol ? "CS_PAYMENT_AMOUNT_PAID_WITHOUT_SYMBOL" : "CS_PAYMENT_AMOUNT_PAID")}
          text={
            paymentData?.totalAmountPaid ||
            (reciept_data?.paymentDetails?.[0]?.totalAmountPaid ? "₹ " + reciept_data?.paymentDetails?.[0]?.totalAmountPaid : `₹ 0`)
          }
        />
        {(business_service !== "PT" || workflw) && (
          <Row
            rowContainerStyle={rowContainerStyle}
            last
            label={t("CS_PAYMENT_TRANSANCTION_DATE")}
            // text={transactionDate && new Date(transactionDate).toLocaleDateString("in")}
            text={
              transactionDate &&
              new Date(transactionDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            }
          />
        )}
      </StatusTable>
      {/* <div style={{ display: "flex" }}> */}
      {business_service == "TL" ? (
        <div
          className="primary-label-btn d-grid"
          style={{ marginLeft: "unset", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}
          onClick={printReciept}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("TL_RECEIPT")}
        </div>
      ) : null}
      {/* {business_service == "TL" ? (
        <div className="primary-label-btn d-grid" style={{ marginLeft: "unset", marginTop: "15px" }} onClick={printCertificate}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("TL_CERTIFICATE")}
        </div>
      ) : null} */}
      {business_service == "sv-services" ? (
        <div
          className="primary-label-btn d-grid"
          style={{ marginLeft: "unset", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}
          onClick={printReciept}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("SV_FEE_RECIEPT")}
        </div>
      ) : null}
      {business_service == "sv-services" ? (
        <div
          className="primary-label-btn d-grid"
          style={{ marginLeft: "unset", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}
          onClick={svCertificate}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("SV_CERTIFICATE")}
        </div>
      ) : null}
      {business_service == "sv-services" ? (
        <div
          className="primary-label-btn d-grid"
          style={{ marginLeft: "unset", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}
          onClick={svIdCard}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("SV_ID_CARD")}
        </div>
      ) : null}

      {business_service == "chb-services" ? (
        <div style={{ marginTop:"20px",display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap:"wrap", gap:"20px" }}>
          <div style={IconWrapperStyle1} onClick={printing ? undefined : printCHBReceipt}>
            {printing ? (
              <Loader />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
                </svg>
                {t("CHB_FEE_RECEIPT")}
              </>
            )}
          </div>
          <div style={IconWrapperStyle2} onClick={chbPermissionLoading ? undefined : printPermissionLetter}>
            {chbPermissionLoading ? (
              <Loader />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
                </svg>
                {t("CHB_PERMISSION_LETTER")}
              </>
            )}
          </div>

          {business_service == "chb-services" && (
            <Link to={`/digit-ui/citizen`}>
              <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
            </Link>
          )}
        </div>
      ) : null}

      {business_service == "Challan_Generation" ? (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "20px", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}>
          <div className="primary-label-btn d-grid" onClick={printing ? undefined : printChallanReceipt}>
            {printing ? (
              <Loader />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                </svg>
                {t("CHB_FEE_RECEIPT")}
              </>
            )}
          </div>
          <div className="primary-label-btn d-grid" onClick={chbPermissionLoading ? undefined : printChallanNotice}>
            {chbPermissionLoading ? (
              <Loader />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                </svg>
                {t("Challan_Notice")}
              </>
            )}
          </div>
          {business_service == "Challan_Generation" && (
            <Link to={`/digit-ui/citizen/challangeneration-home`}>
              <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} style={{ marginLeft: "100px" }} />
            </Link>
          )}
        </div>
      ) : null}

      {business_service == "NDC" ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "15px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <SubmitBar onSubmit={printNDCReceipt} label={t("CS_DOWNLOAD_RECEIPT")} />
          <Link to={`/digit-ui/citizen`}>
            <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
          </Link>
        </div>
      ) : null}

      {business_service == "GarbageCollection" && (
        <Link to={`/digit-ui/citizen/garbagecollection-home`}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} style={{ marginLeft: "100px" }} />
        </Link>
      )}

      {business_service == "adv-services" ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",flexWrap:"wrap", gap:"20px" }}>
          <div style={IconWrapperStyle} onClick={printing ? undefined : printADVReceipt}>
            {printing ? (
              <Loader />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
                </svg>
                {t("CHB_FEE_RECEIPT")}
              </>
            )}
          </div>
          {business_service == "adv-services" && (
            <Link to={`/digit-ui/citizen`}>
              <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} style={{ marginTop: "10px", marginLeft: "100px" }} />
            </Link>
          )}
        </div>
      ) : null}

      {business_service == "sv-services" && (
        <Link to={`/digit-ui/citizen`}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} style={{ marginTop: "15px" }} />
        </Link>
      )}

      {/*for pett */}
      {/* {business_service == "pet-services" ? (
        <div
          className="primary-label-btn d-grid"
          style={{ marginLeft: "unset", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}
          onClick={printReciept}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("PTR_FEE_RECEIPT")}
        </div>
      ) : null} */}
      {/* {business_service == "pet-services" ? (
        <div className="primary-label-btn d-grid" style={{ marginLeft: "unset", marginTop:"15px" }} onClick={printpetCertificate}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("PTR_CERTIFICATE")}
        </div>
      ) : null} */}
      {/*for pett */}
      {bpaData?.[0]?.businessService === "BPA_OC" && (bpaData?.[0]?.status === "APPROVED" || bpaData?.[0]?.status === "PENDING_SANC_FEE_PAYMENT") ? (
        <div
          className="primary-label-btn d-grid"
          style={{ marginLeft: "unset" }}
          onClick={(e) => getPermitOccupancyOrderSearch("occupancy-certificate")}
        >
          <DownloadPrefixIcon />
          {t("BPA_OC_CERTIFICATE")}
        </div>
      ) : null}
      {/* {bpaData?.[0]?.businessService === "BPA_LOW" ? (
          <div
            className="primary-label-btn d-grid"
            style={{ marginLeft: "unset" }}
            onClick={(r) => getPermitOccupancyOrderSearch("buildingpermit-low")}
          >
            <DownloadPrefixIcon />
            {t("BPA_PERMIT_ORDER")}
          </div>
        ) : null}
        {bpaData?.[0]?.businessService === "BPA" &&
        bpaData?.[0]?.businessService !== "BPA_LOW" &&
        bpaData?.[0]?.businessService !== "BPA_OC" &&
        (bpaData?.[0]?.status === "PENDING_SANC_FEE_PAYMENT" || bpaData?.[0]?.status === "APPROVED") ? (
          <div className="primary-label-btn d-grid" style={{ marginLeft: "unset" }} onClick={(r) => getPermitOccupancyOrderSearch("buildingpermit")}>
            <DownloadPrefixIcon />
            {t("BPA_PERMIT_ORDER")}
          </div>
        ) : null} */}
      {/* </div> */}
      {business_service?.includes("PT") && (
        <div style={{ marginTop: "10px" }}>
          <Link
            to={`/digit-ui/citizen/feedback?redirectedFrom=${"digit-ui/citizen/payment/success"}&propertyId=${
              consumerCode ? consumerCode : ""
            }&acknowldgementNumber=${egId ? egId : ""}&tenantId=${tenantId}&creationReason=${business_service?.split(".")?.[1]}`}
          >
            <SubmitBar label={t("CS_REVIEW_AND_FEEDBACK")} />
          </Link>
        </div>
      )}
      {/* {business_service?.includes("PT") ? (
        <div
          className="link"
          style={isMobile ? { marginTop: "8px", width: "100%", textAlign: "center" } : { marginTop: "8px" }}
          onClick={printReciept}
        >
          {t("CS_DOWNLOAD_RECEIPT")}
        </div>
      ) : null} */}
      {business_service === "BPAREG" ? (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px",flexWrap:"wrap", gap:"20px" }}>
          <SubmitBar onSubmit={printReciept} label={t("CS_DOWNLOAD_RECEIPT")} />
          <Link to={`/digit-ui/citizen`}>
            <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
          </Link>
        </div>
      ) : (
        !(
          business_service === "adv-services" ||
          business_service === "chb-services" ||
          business_service === "NDC" ||
          business_service === "Challan_Generation"
        ) && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "15px",
              flexWrap:"wrap", gap:"20px"
            }}
          >
            {printing ? <Loader /> : <SubmitBar onSubmit={printReciept} label={t("CS_DOWNLOAD_RECEIPT")} />}
            {/* {!(business_service === "TL") && !business_service?.includes("PT") && (
            <SubmitBar onSubmit={printReciept} label={t("COMMON_DOWNLOAD_RECEIPT")} />
          )}

          {!(business_service === "TL") && !business_service?.includes("PT") && (
            <div className="link" style={isMobile ? { marginTop: "8px", width: "100%", textAlign: "center" } : { marginTop: "8px" }}>
              <Link to={`/digit-ui/citizen`}>{t("CORE_COMMON_GO_TO_HOME")}</Link>
            </div>
          )} */}

            {business_service === "TL" && (
              <Link to={`/digit-ui/citizen`}>
                <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
              </Link>
            )}

            <Link to={`/digit-ui/citizen`}>
              <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
            </Link>
          </div>
        )
      )}

      {/* )} */}
    </Card>
  );
};

export const FailedPayment = (props) => {
  const { addParams, clearParams } = props;
  const { t } = useTranslation();
  const { consumerCode, businessService } = useParams();

  const getMessage = () => "Failure !";
  return (
    <Card>
      <Banner message={getMessage()} complaintNumber={consumerCode} successful={false} />
      <CardText>{t("ES_COMMON_TRACK_COMPLAINT_TEXT")}</CardText>
    </Card>
  );
};

export const SuccessfulZeroPayment = (props) => {
  if (localStorage.getItem("BillPaymentEnabled") !== "true") {
    window.history.forward();
    return null;
  }
  return <WrapPaymentZeroComponent {...props} />;
};

const WrapPaymentZeroComponent = (props) => {
  const { t } = useTranslation();
  const { state = {} } = useLocation();
  const transactionData = state?.transactionData;
  const queryClient = useQueryClient();
  const { eg_pg_txnid: egId, workflow: workflw, propertyId } = Digit.Hooks.useQueryParams();
  const [printing, setPrinting] = useState(false);
  const [chbPermissionLoading, setChbPermissionLoading] = useState(false);

  const [allowFetchBill, setallowFetchBill] = useState(false);
  const { businessService: business_service, consumerCode, tenantId, receiptNumber } = useParams();
  const { isLoading, data, isError } = Digit.Hooks.usePaymentUpdate({ egId }, business_service, {
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const { data: applicationDetails } = Digit.Hooks.obps.useLicenseDetails(tenantId, { applicationNumber: consumerCode, tenantId }, {});

  const { data: bpaData = {}, isLoading: isBpaSearchLoading, isSuccess: isBpaSuccess, error: bpaerror } = Digit.Hooks.obps.useOBPSSearch(
    "",
    {},
    tenantId,
    { applicationNo: consumerCode },
    {},
    { enabled: window.location.href.includes("bpa") || window.location.href.includes("BPA") }
  );

  //   const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearchNew(
  //     {
  //         tenantId: tenantId,
  //         billIds: transactionData?.billId
  //     },
  // );
  console.log("bpaData , data for zero", bpaData);
  const cities = Digit.Hooks.useTenants();
  let ulbType = "";
  const loginCity = JSON.parse(sessionStorage.getItem("Digit.User"))?.value?.info?.permanentCity;
  if (cities.data !== undefined) {
    const selectedTenantData = cities.data.find((item) => item?.city?.districtTenantCode === loginCity);
    ulbType = selectedTenantData?.city?.ulbGrade;
  }

  const { label } = Digit.Hooks.useApplicationsForBusinessServiceSearch({ businessService: business_service }, { enabled: false });

  const mutation = Digit.Hooks.chb.useChbCreateAPI(tenantId, false);

  const newTenantId = business_service.includes("WS.ONE_TIME_FEE" || "SW.ONE_TIME_FEE") ? Digit.ULBService.getStateId() : tenantId;
  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId,
      businessService: business_service,
      receiptNumbers: data?.payments?.Payments?.[0]?.paymentDetails[0].receiptNumber,
    },
    {
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      select: (dat) => {
        return dat.Payments[0];
      },
      enabled: allowFetchBill,
    }
  );

  const { data: generatePdfKey } = Digit.Hooks.useCommonMDMS(newTenantId, "common-masters", "ReceiptKey", {
    select: (data) =>
      data["common-masters"]?.uiCommonPay?.filter(({ code }) => business_service?.includes(code))[0]?.receiptKey || "consolidatedreceipt",
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const payments = reciept_data; // changed here

  useEffect(() => {
    return () => {
      localStorage.setItem("BillPaymentEnabled", "false");
      queryClient.clear();
    };
  }, []);

  if (isLoading || recieptDataLoading) {
    return <Loader />;
  }

  const isMobile = window.Digit.Utils.browser.isMobile();

  if (isError || !payments || !payments.Payments || payments.Payments.length === 0 || payments.length === 0) {
    return (
      <Card>
        <Banner
          message={t("CITIZEN_FAILURE_COMMON_PAYMENT_MESSAGE")}
          info={t("CS_PAYMENT_TRANSANCTION_ID")}
          // applicationNumber={egId}
          successful={false}
        />
        <CardText>{t("CS_PAYMENT_FAILURE_MESSAGE")}</CardText>
        {!business_service?.includes("PT") ? (
          <Link to={`/digit-ui/citizen`}>
            <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
          </Link>
        ) : (
          <React.Fragment>
            <Link to={(consumerCode && `/digit-ui/citizen/payment/my-bills/${business_service}/${consumerCode}`) || "/digit-ui/citizen"}>
              <SubmitBar label={t("CS_PAYMENT_TRY_AGAIN")} />
            </Link>
            {/* {business_service?.includes("PT") &&<div style={{marginTop:"10px"}}><Link to={`/digit-ui/citizen/feedback?redirectedFrom=${"digit-ui/citizen/payment/success"}&propertyId=${consumerCode? consumerCode : ""}&acknowldgementNumber=${egId ? egId : ""}&tenantId=${tenantId}&creationReason=${business_service?.split(".")?.[1]}`}>
              <SubmitBar label={t("CS_REVIEW_AND_FEEDBACK")} />
            </Link></div>} */}
            <div className="link" style={isMobile ? { marginTop: "8px", width: "100%", textAlign: "center" } : { marginTop: "8px" }}>
              <Link to={`/digit-ui/citizen`}>{t("CORE_COMMON_GO_TO_HOME")}</Link>
            </div>
          </React.Fragment>
        )}
      </Card>
    );
  }

  const paymentData = reciept_data?.Payments[0]; //changed here
  const transactionDate = paymentData?.transactionDate;
  const printCertificate = async () => {
    //const tenantId = Digit.ULBService.getCurrentTenantId();
    const state = tenantId;
    const applicationDetails = await Digit.TLService.search({ applicationNumber: consumerCode, tenantId });
    const generatePdfKeyForTL = "tlcertificate";

    if (applicationDetails) {
      let response = await Digit.PaymentService.generatePdf(state, { Licenses: applicationDetails?.Licenses }, generatePdfKeyForTL);
      const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
      window.open(fileStore[response.filestoreIds[0]], "_blank");
    }
  };

  const svCertificate = async () => {
    //const tenantId = Digit.ULBService.getCurrentTenantId();
    const state = tenantId;
    const applicationDetails = await Digit.SVService.search({ tenantId, filters: { applicationNumber: consumerCode, isDraftApplication: false } });
    const generatePdfKeyForTL = "svcertificate";

    if (applicationDetails) {
      let response = await Digit.PaymentService.generatePdf(state, { SVDetail: [applicationDetails?.SVDetail?.[0]] }, generatePdfKeyForTL);
      const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
      window.open(fileStore[response.filestoreIds[0]], "_blank");
    }
  };

  const svIdCard = async () => {
    //const tenantId = Digit.ULBService.getCurrentTenantId();
    const state = tenantId;
    const applicationDetails = await Digit.SVService.search({ tenantId, filters: { applicationNumber: consumerCode, isDraftApplication: false } });
    const generatePdfKeyForTL = "svidentitycard";

    if (applicationDetails) {
      let response = await Digit.PaymentService.generatePdf(state, { SVDetail: [applicationDetails?.SVDetail?.[0]] }, generatePdfKeyForTL);
      const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
      window.open(fileStore[response.filestoreIds[0]], "_blank");
    }
  };

  const printReciept = async () => {
    let generatePdfKeyForWs = "ws-onetime-receipt";
    if (printing) return;
    setPrinting(true);
    let paymentArray = [];
    let licenseSection, licenseType;
    if (applicationDetails) {
      licenseSection = applicationDetails?.applicationDetails?.find((section) => section.title === "BPA_LICENSE_DETAILS_LABEL");

      licenseType = t(licenseSection?.values?.find((val) => val.title === "BPA_LICENSE_TYPE")?.value);
    }
    const fee = paymentData?.totalAmountPaid;
    console.log("fee here here for zero fee", fee);
    const amountinwords = amountToWords(fee);
    const tenantId = paymentData?.tenantId;
    const state = Digit.ULBService.getStateId();
    let response = { filestoreIds: [payments?.Payments[0]?.fileStoreId] };
    if (!payments?.Payments[0]?.fileStoreId) {
      let assessmentYear = "",
        assessmentYearForReceipt = "";
      let count = 0;
      let toDate, fromDate;
      if (payments.Payments[0].paymentDetails[0].businessService == "PT") {
        payments.Payments[0].paymentDetails[0].bill.billDetails.map((element) => {
          if (element.amount > 0 || element.amountPaid > 0) {
            count = count + 1;
            toDate = convertEpochToDate(element.toPeriod).split("/")[2];
            fromDate = convertEpochToDate(element.fromPeriod).split("/")[2];
            assessmentYear =
              assessmentYear == ""
                ? fromDate + "-" + toDate + "(Rs." + element.amountPaid + ")"
                : assessmentYear + "," + fromDate + "-" + toDate + "(Rs." + element.amountPaid + ")";
            assessmentYearForReceipt = fromDate + "-" + toDate;
          }
        });

        if (count == 0) {
          let toDate = convertEpochToDate(payments.Payments[0].paymentDetails[0].bill.billDetails[0].toPeriod).split("/")[2];
          let fromDate = convertEpochToDate(payments.Payments[0].paymentDetails[0].bill.billDetails[0].fromPeriod).split("/")[2];
          assessmentYear = assessmentYear == "" ? fromDate + "-" + toDate : assessmentYear + "," + fromDate + "-" + toDate;
          assessmentYearForReceipt = fromDate + "-" + toDate;
        }

        const details = {
          assessmentYears: assessmentYear,
          arrearCode: "",
        };

        payments.Payments[0].paymentDetails[0].additionalDetails = details;
        printRecieptNew(payments);
      } else {
        let details;

        if (payments.Payments[0].paymentDetails[0].businessService == "BPAREG") {
          details = { ...payments.Payments[0].additionalDetails, stakeholderType: "Application", amountinwords, ulbType };
        }
        payments.Payments[0].additionalDetails = details;
        paymentArray[0] = payments.Payments[0];
        if (business_service == "WS" || business_service == "SW") {
          response = await Digit.PaymentService.generatePdf(state, { Payments: [{ ...paymentData }] }, generatePdfKeyForWs);
        } else if (paymentData.paymentDetails[0].businessService.includes("BPA")) {
          const designation = ulbType === "Municipal Corporation" ? "Municipal Commissioner" : "Executive Officer";
          const updatedpayments = {
            ...paymentData,
            additionalDetails: {
              ...paymentData.additionalDetails,
              designation: designation,
              ulbType: ulbType,
            },
            licenseType,
            amountinwords,
            ulbType,
          };

          response = await Digit.PaymentService.generatePdf(state, { Payments: [{ ...updatedpayments }] }, generatePdfKey);
        } else {
          response = await Digit.PaymentService.generatePdf(state, { Payments: [{ ...paymentData }] }, generatePdfKey);
        }
      }
    }
    const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
    if (fileStore && fileStore[response.filestoreIds[0]]) {
      window.open(fileStore[response.filestoreIds[0]], "_blank");
    }
    setPrinting(false);
  };

  const convertDateToEpoch = (dateString, dayStartOrEnd = "dayend") => {
    //example input format : "2018-10-02"
    try {
      const parts = dateString.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      const DateObj = new Date(Date.UTC(parts[1], parts[2] - 1, parts[3]));
      DateObj.setMinutes(DateObj.getMinutes() + DateObj.getTimezoneOffset());
      if (dayStartOrEnd === "dayend") {
        DateObj.setHours(DateObj.getHours() + 24);
        DateObj.setSeconds(DateObj.getSeconds() - 1);
      }
      return DateObj.getTime();
    } catch (e) {
      return dateString;
    }
  };

  const printPdf = (blob) => {
    const fileURL = URL.createObjectURL(blob);
    var myWindow = window.open(fileURL);
    if (myWindow != undefined) {
      myWindow.addEventListener("load", (event) => {
        myWindow.focus();
        myWindow.print();
      });
    }
  };

  const downloadPdf = (blob, fileName) => {
    if (window.mSewaApp && window.mSewaApp.isMsewaApp() && window.mSewaApp.downloadBase64File) {
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        var base64data = reader.result;
        mSewaApp.downloadBase64File(base64data, fileName);
      };
    } else {
      const link = document.createElement("a");
      // create a blobURI pointing to our Blob
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      // some browser needs the anchor to be in the doc
      document.body.append(link);
      link.click();
      link.remove();
      // in case the Blob uses a lot of memory
      setTimeout(() => URL.revokeObjectURL(link.href), 7000);
    }
  };

  const getPermitOccupancyOrderSearch = async (order, mode = "download") => {
    let queryObj = { applicationNo: bpaData?.[0]?.applicationNo };
    let bpaResponse = await Digit.OBPSService.BPASearch(bpaData?.[0]?.tenantId, queryObj);
    const edcrResponse = await Digit.OBPSService.scrutinyDetails(bpaData?.[0]?.tenantId, { edcrNumber: bpaData?.[0]?.edcrNumber });
    let bpaDataDetails = bpaResponse?.BPA?.[0],
      edcrData = edcrResponse?.edcrDetail?.[0];
    let currentDate = new Date();
    bpaDataDetails.additionalDetails.runDate = convertDateToEpoch(
      currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate()
    );
    let reqData = { ...bpaDataDetails, edcrDetail: [{ ...edcrData }] };
    const state = Digit.ULBService.getStateId();

    let count = 0;
    reqData.additionalDetails.submissionDate = bpaData?.[0]?.workflowData?.auditDetails?.createdTime;
    // for(let i=0;i<bpaData?.[0]?.data?.processInstances?.length;i++){
    //   if((workflowDetails?.data?.processInstances[i]?.action==="POST_PAYMENT_APPLY" ||workflowDetails?.data?.processInstances[i]?.action==="PAY" ) && (workflowDetails?.data?.processInstances?.[i]?.state?.applicationStatus==="APPROVAL_INPROGRESS")   && count==0 ){
    //       reqData.additionalDetails.submissionDate=workflowDetails?.data?.processInstances[i]?.auditDetails?.createdTime;
    //       count=1;
    //     }
    // }

    if (reqData?.additionalDetails?.approvedColony == "NO") {
      reqData.additionalDetails.permitData =
        "The plot has been officially regularized under No." +
        reqData?.additionalDetails?.NocNumber +
        "  dated dd/mm/yyyy, registered in the name of <name as per the NOC>. This regularization falls within the jurisdiction of " +
        state +
        ".Any form of misrepresentation of the NoC is strictly prohibited. Such misrepresentation renders the building plan null and void, and it will be regarded as an act of impersonation. Criminal proceedings will be initiated against the owner and concerned architect / engineer/ building designer / supervisor involved in such actions";
    } else if (reqData?.additionalDetails?.approvedColony == "YES") {
      reqData.additionalDetails.permitData = "The building plan falls under approved colony " + reqData?.additionalDetails?.nameofApprovedcolony;
    } else {
      reqData.additionalDetails.permitData = "The building plan falls under Lal Lakir";
    }
    let response = await Digit.PaymentService.generatePdf(bpaDataDetails?.tenantId, { Bpa: [reqData] }, order);
    const fileStore = await Digit.PaymentService.printReciept(bpaDataDetails?.tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");

    reqData["applicationType"] = bpaDataDetails?.additionalDetails?.applicationType;
    let edcrresponse = await Digit.OBPSService.edcr_report_download({ BPA: { ...reqData } });
    const responseStatus = parseInt(edcrresponse.status, 10);
    if (responseStatus === 201 || responseStatus === 200) {
      mode == "print"
        ? printPdf(new Blob([edcrresponse.data], { type: "application/pdf" }))
        : downloadPdf(new Blob([edcrresponse.data], { type: "application/pdf" }), `edcrReport.pdf`);
    }
  };

  const getBillingPeriod = (billDetails) => {
    const { taxPeriodFrom, taxPeriodTo, fromPeriod, toPeriod } = billDetails || {};
    if (taxPeriodFrom && taxPeriodTo) {
      let from = new Date(taxPeriodFrom).getFullYear().toString();
      let to = new Date(taxPeriodTo).getFullYear().toString();
      return "FY " + from + "-" + to;
    } else if (fromPeriod && toPeriod) {
      if (workflw === "mcollect") {
        let from =
          new Date(fromPeriod).getDate().toString() +
          " " +
          Digit.Utils.date.monthNames[new Date(fromPeriod).getMonth()].toString() +
          " " +
          new Date(fromPeriod).getFullYear().toString();
        let to =
          new Date(toPeriod).getDate() + " " + Digit.Utils.date.monthNames[new Date(toPeriod).getMonth()] + " " + new Date(toPeriod).getFullYear();
        return from + " - " + to;
      } else if (workflw === "WNS") {
        let from =
          new Date(fromPeriod).getDate().toString() +
          "/" +
          (new Date(fromPeriod).getMonth() + 1).toString() +
          "/" +
          new Date(fromPeriod).getFullYear().toString();
        let to = new Date(toPeriod).getDate() + "/" + (new Date(toPeriod).getMonth() + 1) + "/" + new Date(toPeriod).getFullYear();
        return from + " - " + to;
      }
      let from = new Date(fromPeriod).getFullYear().toString();
      let to = new Date(toPeriod).getFullYear().toString();
      return "FY " + from + "-" + to;
    } else return "N/A";
  };

  const printPermissionLetter = async () => {
    if (chbPermissionLoading) return;
    setChbPermissionLoading(true);
    try {
      const applicationDetails = await Digit.CHBServices.search({ tenantId, filters: { bookingNo: consumerCode } });
      let application = {
        hallsBookingApplication: (applicationDetails?.hallsBookingApplication || []).map((app) => {
          return {
            ...app,
            bookingSlotDetails: [...(app.bookingSlotDetails || [])].sort((a, b) => {
              return new Date(a.bookingDate) - new Date(b.bookingDate);
            }),
          };
        }),
      };
      let fileStoreId = applicationDetails?.hallsBookingApplication?.[0]?.permissionLetterFilestoreId;
      const generatePdfKeyForTL = "chb-permissionletter";
      if (!fileStoreId) {
        const payments = await Digit.PaymentService.getReciept(tenantId, business_service, { receiptNumbers: receiptNumber });

        const response = await Digit.PaymentService.generatePdf(
          tenantId,
          { Payments: [{ ...(payments?.Payments?.[0] || {}), ...application }] },
          generatePdfKeyForTL
        );
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } finally {
      setChbPermissionLoading(false);
    }
  };

  const printCHBReceipt = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const applicationDetails = await Digit.CHBServices.search({ tenantId, filters: { bookingNo: consumerCode } });
      let application = {
        hallsBookingApplication: applicationDetails?.hallsBookingApplication || [],
      };
      let fileStoreId = applicationDetails?.hallsBookingApplication?.[0]?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        let response = { filestoreIds: [payments?.fileStoreId] };
        response = await Digit.PaymentService.generatePdf(
          tenantId,
          { Payments: [{ ...(payments?.Payments?.[0] || {}), ...application }] },
          "chbservice-receipt"
        );
        const updatedApplication = {
          ...applicationDetails?.hallsBookingApplication[0],
          paymentReceiptFilestoreId: response?.filestoreIds[0],
        };
        await mutation.mutateAsync({
          hallsBookingApplication: updatedApplication,
        });
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } finally {
      setPrinting(false);
    }
  };

  const printADVReceipt = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const applicationDetails = await Digit.ADSServices.search({ tenantId, filters: { bookingNo: consumerCode } });
      const new_data = transformBookingResponseToBookingData(applicationDetails);
      let application = new_data;
      let fileStoreId = applicationDetails?.BookingApplication?.[0]?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        const payments = await Digit.PaymentService.getReciept(tenantId, business_service, { receiptNumbers: receiptNumber });
        let response = await Digit.PaymentService.generatePdf(
          tenantId,
          { Payments: [{ ...(payments?.Payments?.[0] || {}), ...application }] },
          "adv-bill"
        );
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } finally {
      setPrinting(false);
    }
  };

  const printNDCReceipt = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const applicationDetails = await Digit.NDCService.NDCsearch({ applicationNo: consumerCode }, tenantId);
      let application = applicationDetails.Applications;
      let fileStoreId = applicationDetails?.Applications?.[0]?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        const payments = await Digit.PaymentService.getReciept(tenantId, business_service, { receiptNumbers: receiptNumber });
        let response = await Digit.PaymentService.generatePdf(
          tenantId,
          { Payments: [{ ...(payments?.Payments?.[0] || {}), ...application }] },
          "ndc-receipt"
        );
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } finally {
      setPrinting(false);
    }
  };
  let bannerText;
  if (workflw) {
    bannerText = `CITIZEN_SUCCESS_UC_PAYMENT_MESSAGE`;
  } else {
    if (paymentData?.paymentDetails?.[0]?.businessService && paymentData?.paymentDetails?.[0]?.businessService?.includes("BPA")) {
      let nameOfAchitect = sessionStorage.getItem("BPA_ARCHITECT_NAME");
      let parsedArchitectName = nameOfAchitect ? JSON.parse(nameOfAchitect) : "ARCHITECT";
      bannerText = `CITIZEN_SUCCESS_${paymentData?.paymentDetails[0]?.businessService.replace(/\./g, "_")}_${parsedArchitectName}_PAYMENT_MESSAGE`;
    } else if (business_service?.includes("WS") || business_service?.includes("SW")) {
      bannerText = t(`CITIZEN_SUCCESS_${paymentData?.paymentDetails[0].businessService.replace(/\./g, "_")}_WS_PAYMENT_MESSAGE`);
    } else {
      bannerText = paymentData?.paymentDetails[0]?.businessService
        ? `CITIZEN_SUCCESS_${paymentData?.paymentDetails[0]?.businessService.replace(/\./g, "_")}_PAYMENT_MESSAGE`
        : t("CITIZEN_SUCCESS_UC_PAYMENT_MESSAGE");
    }
  }

  // https://dev.digit.org/collection-services/payments/FSM.TRIP_CHARGES/_search?tenantId=pb.amritsar&consumerCodes=107-FSM-2021-02-18-063433

  // if (billDataLoading) return <Loader />;

  const rowContainerStyle = {
    padding: "4px 0px",
    justifyContent: "space-between",
  };
  const IconWrapperStyle = { display: "flex", fontSize: "16px", fontWeight: "500", gap: "4px" };
  const IconWrapperStyle1 = { display: "flex", fontSize: "16px", fontWeight: "500", gap: "4px", flex: 1 };
  const IconWrapperStyle2 = { display: "flex", fontSize: "16px", fontWeight: "500", gap: "4px", flex: 2 };

  //New Payment Reciept For PT module with year bifurcations

  const printRecieptNew = async (payment) => {
    console.log("paymentpayment", payment, payment.Payments[0].paymentDetails[0].receiptNumber, payment.Payments[0]);
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const state = Digit.ULBService.getStateId();
    let paymentArray = [];
    const payments = await Digit.PaymentService.getReciept(tenantId, "PT", { receiptNumbers: payment.Payments[0].paymentDetails[0].receiptNumber });
    let response = { filestoreIds: [payments.Payments[0]?.fileStoreId] };
    if (true) {
      let assessmentYear = "",
        assessmentYearForReceipt = "";
      let count = 0;
      let toDate, fromDate;
      if (payments.Payments[0].paymentDetails[0].businessService == "PT") {
        let arrearRow = {};
        let arrearArray = [];
        let taxRow = {};
        let taxArray = [];

        let roundoff = 0,
          tax = 0,
          firecess = 0,
          cancercess = 0,
          penalty = 0,
          rebate = 0,
          interest = 0,
          usage_exemption = 0,
          special_category_exemption = 0,
          adhoc_penalty = 0,
          adhoc_rebate = 0,
          total = 0;
        let roundoffT = 0,
          taxT = 0,
          firecessT = 0,
          cancercessT = 0,
          penaltyT = 0,
          rebateT = 0,
          interestT = 0,
          usage_exemptionT = 0,
          special_category_exemptionT = 0,
          adhoc_penaltyT = 0,
          adhoc_rebateT = 0,
          totalT = 0;

        payments.Payments[0].paymentDetails[0].bill.billDetails.map((element) => {
          if (element.amount > 0 || element.amountPaid > 0) {
            count = count + 1;
            toDate = convertEpochToDate(element.toPeriod).split("/")[2];
            fromDate = convertEpochToDate(element.fromPeriod).split("/")[2];
            assessmentYear =
              assessmentYear == ""
                ? fromDate + "-" + toDate + "(Rs." + element.amountPaid + ")"
                : assessmentYear + "," + fromDate + "-" + toDate + "(Rs." + element.amountPaid + ")";
            assessmentYearForReceipt = fromDate + "-" + toDate;

            element.billAccountDetails.map((ele) => {
              if (ele.taxHeadCode == "PT_TAX") {
                tax = ele.adjustedAmount;
                taxT = ele.amount;
              } else if (ele.taxHeadCode == "PT_TIME_REBATE") {
                rebate = ele.adjustedAmount;
                rebateT = ele.amount;
              } else if (ele.taxHeadCode == "PT_CANCER_CESS") {
                cancercess = ele.adjustedAmount;
                cancercessT = ele.amount;
              } else if (ele.taxHeadCode == "PT_FIRE_CESS") {
                firecess = ele.adjustedAmount;
                firecessT = ele.amount;
              } else if (ele.taxHeadCode == "PT_TIME_INTEREST") {
                interest = ele.adjustedAmount;
                interestT = ele.amount;
              } else if (ele.taxHeadCode == "PT_TIME_PENALTY") {
                penalty = ele.adjustedAmount;
                penaltyT = ele.amount;
              } else if (ele.taxHeadCode == "PT_OWNER_EXEMPTION") {
                special_category_exemption = ele.adjustedAmount;
                special_category_exemptionT = ele.amount;
              } else if (ele.taxHeadCode == "PT_ROUNDOFF") {
                roundoff = ele.adjustedAmount;
                roundoffT = ele.amount;
              } else if (ele.taxHeadCode == "PT_UNIT_USAGE_EXEMPTION") {
                usage_exemption = ele.adjustedAmount;
                usage_exemptionT = ele.amount;
              } else if (ele.taxHeadCode == "PT_ADHOC_PENALTY") {
                adhoc_penalty = ele.adjustedAmount;
                adhoc_penaltyT = ele.amount;
              } else if (ele.taxHeadCode == "PT_ADHOC_REBATE") {
                adhoc_rebate = ele.adjustedAmount;
                adhoc_rebateT = ele.amount;
              }

              totalT = totalT + ele.amount;
            });
            arrearRow = {
              year: assessmentYearForReceipt,
              tax: tax,
              firecess: firecess,
              cancercess: cancercess,
              penalty: penalty,
              rebate: rebate,
              interest: interest,
              usage_exemption: usage_exemption,
              special_category_exemption: special_category_exemption,
              adhoc_penalty: adhoc_penalty,
              adhoc_rebate: adhoc_rebate,
              roundoff: roundoff,
              total: element.amountPaid,
            };
            taxRow = {
              year: assessmentYearForReceipt,
              tax: taxT,
              firecess: firecessT,
              cancercess: cancercessT,
              penalty: penaltyT,
              rebate: rebateT,
              interest: interestT,
              usage_exemption: usage_exemptionT,
              special_category_exemption: special_category_exemptionT,
              adhoc_penalty: adhoc_penaltyT,
              adhoc_rebate: adhoc_rebateT,
              roundoff: roundoffT,
              total: element.amount,
            };
            arrearArray.push(arrearRow);
            taxArray.push(taxRow);
          }
        });

        if (count == 0) {
          let toDate = convertEpochToDate(payments.Payments[0].paymentDetails[0].bill.billDetails[0].toPeriod).split("/")[2];
          let fromDate = convertEpochToDate(payments.Payments[0].paymentDetails[0].bill.billDetails[0].fromPeriod).split("/")[2];
          assessmentYear = assessmentYear == "" ? fromDate + "-" + toDate : assessmentYear + "," + fromDate + "-" + toDate;
          assessmentYearForReceipt = fromDate + "-" + toDate;

          payments.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails.map((ele) => {
            if (ele.taxHeadCode == "PT_TAX") {
              tax = ele.adjustedAmount;
              taxT = ele.amount;
            } else if (ele.taxHeadCode == "PT_TIME_REBATE") {
              rebate = ele.adjustedAmount;
              rebateT = ele.amount;
            } else if (ele.taxHeadCode == "PT_CANCER_CESS") {
              cancercess = ele.adjustedAmount;
              cancercessT = ele.amount;
            } else if (ele.taxHeadCode == "PT_FIRE_CESS") {
              firecess = ele.adjustedAmount;
              firecessT = ele.amount;
            } else if (ele.taxHeadCode == "PT_TIME_INTEREST") {
              interest = ele.adjustedAmount;
              interestT = ele.amount;
            } else if (ele.taxHeadCode == "PT_TIME_PENALTY") {
              penalty = ele.adjustedAmount;
              penaltyT = ele.amount;
            } else if (ele.taxHeadCode == "PT_OWNER_EXEMPTION") {
              special_category_exemption = ele.adjustedAmount;
              special_category_exemptionT = ele.amount;
            } else if (ele.taxHeadCode == "PT_ROUNDOFF") {
              roundoff = ele.adjustedAmount;
              roundoffT = ele.amount;
            } else if (ele.taxHeadCode == "PT_UNIT_USAGE_EXEMPTION") {
              usage_exemption = ele.adjustedAmount;
              usage_exemptionT = ele.amount;
            } else if (ele.taxHeadCode == "PT_ADHOC_PENALTY") {
              adhoc_penalty = ele.adjustedAmount;
              adhoc_penaltyT = ele.amount;
            } else if (ele.taxHeadCode == "PT_ADHOC_REBATE") {
              adhoc_rebate = ele.adjustedAmount;
              adhoc_rebateT = ele.amount;
            }

            total = total + ele.adjustedAmount;
            totalT = totalT + ele.amount;
          });
          arrearRow = {
            year: assessmentYearForReceipt,
            tax: tax,
            firecess: firecess,
            cancercess: cancercess,
            penalty: penalty,
            interest: interest,
            usage_exemption: usage_exemption,
            special_category_exemption: special_category_exemption,
            adhoc_penalty: adhoc_penalty,
            adhoc_rebate: adhoc_rebate,
            roundoff: roundoff,
            total: payments.Payments[0].paymentDetails[0].bill.billDetails[0].amountPaid,
          };
          taxRow = {
            year: assessmentYearForReceipt,
            tax: taxT,
            firecess: firecessT,
            cancercess: cancercessT,
            penalty: penaltyT,
            rebate: rebateT,
            interest: interestT,
            usage_exemption: usage_exemptionT,
            special_category_exemption: special_category_exemptionT,
            adhoc_penalty: adhoc_penaltyT,
            adhoc_rebate: adhoc_rebateT,
            roundoff: roundoffT,
            total: payments.Payments[0].paymentDetails[0].bill.billDetails[0].amount,
          };
          arrearArray.push(arrearRow);
          taxArray.push(taxRow);
        }

        const details = {
          assessmentYears: assessmentYear,
          arrearArray: arrearArray,
          taxArray: taxArray,
        };
        payments.Payments[0].paymentDetails[0].additionalDetails = details;
      }

      paymentArray[0] = payments.Payments[0];
      response = await Digit.PaymentService.generatePdf(state, { Payments: paymentArray }, generatePdfKey);
    }
    const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response.filestoreIds[0]], "_blank");
  };
  const ommitRupeeSymbol = ["PT"].includes(business_service);

  if ((window.location.href.includes("bpa") || window.location.href.includes("BPA")) && isBpaSearchLoading) return <Loader />;

  return (
    <Card>
      <Banner
        svg={
          <svg className="payment-svg" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM16 30L6 20L8.82 17.18L16 24.34L31.18 9.16L34 12L16 30Z"
              fill="white"
            />
          </svg>
        }
        message={t("CS_COMMON_PAYMENT_COMPLETE")}
        info={t("CS_COMMON_RECIEPT_NO")}
        applicationNumber={paymentData?.paymentDetails[0].receiptNumber}
        successful={true}
      />
      <CardText></CardText>
      <StatusTable>
        <Row rowContainerStyle={rowContainerStyle} last label={t(label)} text={consumerCode} />
        {/** TODO : move this key and value into the hook based on business Service */}
        {(business_service === "PT" || workflw) && (
          <Row
            rowContainerStyle={rowContainerStyle}
            last
            label={t("CS_PAYMENT_BILLING_PERIOD")}
            text={getBillingPeriod(paymentData?.paymentDetails[0]?.bill?.billDetails[0])}
          />
        )}

        {(business_service === "PT" || workflw) && (
          <Row
            rowContainerStyle={rowContainerStyle}
            last
            label={t("CS_PAYMENT_AMOUNT_PENDING")}
            text={
              paymentData?.totalDue - paymentData?.totalAmountPaid ||
              (reciept_data?.paymentDetails?.[0]?.totalDue && reciept_data?.paymentDetails?.[0]?.totalAmountPaid)
                ? `₹ ${reciept_data?.paymentDetails?.[0]?.totalDue - reciept_data?.paymentDetails?.[0]?.totalAmountPaid}`
                : `₹ ${0}`
            }
          />
        )}

        <Row rowContainerStyle={rowContainerStyle} last label={t("CS_PAYMENT_TRANSANCTION_ID")} text={egId} />
        <Row
          rowContainerStyle={rowContainerStyle}
          last
          label={t(ommitRupeeSymbol ? "CS_PAYMENT_AMOUNT_PAID_WITHOUT_SYMBOL" : "CS_PAYMENT_AMOUNT_PAID")}
          text={
            paymentData?.totalAmountPaid ||
            (reciept_data?.paymentDetails?.[0]?.totalAmountPaid ? "₹ " + reciept_data?.paymentDetails?.[0]?.totalAmountPaid : `₹ 0`)
          }
        />
        {(business_service !== "PT" || workflw) && (
          <Row
            rowContainerStyle={rowContainerStyle}
            last
            label={t("CS_PAYMENT_TRANSANCTION_DATE")}
            text={transactionDate && new Date(transactionDate).toLocaleDateString("in")}
          />
        )}
      </StatusTable>
      {/* <div style={{ display: "flex" }}> */}
      {business_service == "TL" ? (
        <div
          className="primary-label-btn d-grid"
          style={{ marginLeft: "unset", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}
          onClick={printReciept}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("TL_RECEIPT")}
        </div>
      ) : null}
      {business_service == "TL" ? (
        <div className="primary-label-btn d-grid" style={{ marginLeft: "unset", marginTop: "15px" }} onClick={printCertificate}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("TL_CERTIFICATE")}
        </div>
      ) : null}
      {business_service == "sv-services" ? (
        <div
          className="primary-label-btn d-grid"
          style={{ marginLeft: "unset", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}
          onClick={printReciept}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("SV_FEE_RECIEPT")}
        </div>
      ) : null}
      {business_service == "sv-services" ? (
        <div
          className="primary-label-btn d-grid"
          style={{ marginLeft: "unset", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}
          onClick={svCertificate}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("SV_CERTIFICATE")}
        </div>
      ) : null}
      {business_service == "sv-services" ? (
        <div
          className="primary-label-btn d-grid"
          style={{ marginLeft: "unset", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}
          onClick={svIdCard}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("SV_ID_CARD")}
        </div>
      ) : null}

      {business_service == "chb-services" ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",flexWrap:"wrap", gap:"20px" }}>
          <div style={IconWrapperStyle1} onClick={printing ? undefined : printCHBReceipt}>
            {printing ? (
              <Loader />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
                </svg>
                {t("CHB_FEE_RECEIPT")}
              </>
            )}
          </div>
          <div style={IconWrapperStyle2} onClick={chbPermissionLoading ? undefined : printPermissionLetter}>
            {chbPermissionLoading ? (
              <Loader />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
                </svg>
                {t("CHB_PERMISSION_LETTER")}
              </>
            )}
          </div>

          {business_service == "chb-services" && (
            <Link to={`/digit-ui/citizen`}>
              <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} style={{ marginLeft: "100px" }} />
            </Link>
          )}
        </div>
      ) : null}

      {business_service == "adv-services" ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",flexWrap:"wrap", gap:"20px" }}>
          <div style={IconWrapperStyle} onClick={printing ? undefined : printADVReceipt}>
            {printing ? (
              <Loader />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
                </svg>
                {t("CHB_FEE_RECEIPT")}
              </>
            )}
          </div>
          {business_service == "adv-services" && (
            <Link to={`/digit-ui/citizen`}>
              <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} style={{ marginTop: "10px", marginLeft: "100px" }} />
            </Link>
          )}
        </div>
      ) : null}

      {business_service == "NDC" ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "15px",
            flexWrap:"wrap", gap:"20px"
          }}
        >
          <SubmitBar onSubmit={printNDCReceipt} label={t("CS_DOWNLOAD_RECEIPT")} />
          <Link to={`/digit-ui/citizen`}>
            <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
          </Link>
        </div>
      ) : null}
      {business_service == "sv-services" && (
        <Link to={`/digit-ui/citizen`}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} style={{ marginTop: "15px" }} />
        </Link>
      )}

      {business_service == "chb-services" && (
        <Link to={`/digit-ui/citizen`}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
        </Link>
      )}

      {/*for pett */}
      {/* {business_service == "pet-services" ? (
        <div
          className="primary-label-btn d-grid"
          style={{ marginLeft: "unset", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}
          onClick={printReciept}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("PTR_FEE_RECEIPT")}
        </div>
      ) : null} */}
      {/* {business_service == "pet-services" ? (
        <div className="primary-label-btn d-grid" style={{ marginLeft: "unset", marginTop:"15px" }} onClick={printpetCertificate}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#a82227">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
          </svg>
          {t("PTR_CERTIFICATE")}
        </div>
      ) : null} */}
      {/*for pett */}
      {bpaData?.[0]?.businessService === "BPA_OC" && (bpaData?.[0]?.status === "APPROVED" || bpaData?.[0]?.status === "PENDING_SANC_FEE_PAYMENT") ? (
        <div
          className="primary-label-btn d-grid"
          style={{ marginLeft: "unset" }}
          onClick={(e) => getPermitOccupancyOrderSearch("occupancy-certificate")}
        >
          <DownloadPrefixIcon />
          {t("BPA_OC_CERTIFICATE")}
        </div>
      ) : null}
      {bpaData?.[0]?.businessService === "BPA_LOW" ? (
        <div
          className="primary-label-btn d-grid"
          style={{ marginLeft: "unset" }}
          onClick={(r) => getPermitOccupancyOrderSearch("buildingpermit-low")}
        >
          <DownloadPrefixIcon />
          {t("BPA_PERMIT_ORDER")}
        </div>
      ) : null}
      {bpaData?.[0]?.businessService === "BPA" &&
      bpaData?.[0]?.businessService !== "BPA_LOW" &&
      bpaData?.[0]?.businessService !== "BPA_OC" &&
      (bpaData?.[0]?.status === "PENDING_SANC_FEE_PAYMENT" || bpaData?.[0]?.status === "APPROVED") ? (
        <div className="primary-label-btn d-grid" style={{ marginLeft: "unset" }} onClick={(r) => getPermitOccupancyOrderSearch("buildingpermit")}>
          <DownloadPrefixIcon />
          {t("BPA_PERMIT_ORDER")}
        </div>
      ) : null}
      {/* </div>  */}
      {/* {business_service?.includes("PT") && (
        <div style={{ marginTop: "10px" }}>
          <Link
            to={`/digit-ui/citizen/feedback?redirectedFrom=${"digit-ui/citizen/payment/success"}&propertyId=${
              consumerCode ? consumerCode : ""
            }&acknowldgementNumber=${egId ? egId : ""}&tenantId=${tenantId}&creationReason=${business_service?.split(".")?.[1]}`}
          >
            <SubmitBar label={t("CS_REVIEW_AND_FEEDBACK")} />
          </Link>
        </div>
      )} */}
      {/* {business_service?.includes("PT") ? (
        <div
          className="link"
          style={isMobile ? { marginTop: "8px", width: "100%", textAlign: "center" } : { marginTop: "8px" }}
          onClick={printReciept}
        >
          {t("CS_DOWNLOAD_RECEIPT")}
        </div>
      ) : null} */}
      {/* {business_service?.includes("WS") ? (
        <div
          className="link"
          style={isMobile ? { marginTop: "8px", width: "100%", textAlign: "center" } : { marginTop: "8px" }}
          onClick={printReciept}
        >
          {t("CS_DOWNLOAD_RECEIPT")}
        </div>
      ) : null} */}
      {/* {business_service?.includes("SW") ? (
        <div
          className="link"
          style={isMobile ? { marginTop: "8px", width: "100%", textAlign: "center" } : { marginTop: "8px" }}
          onClick={printReciept}
        >
          {t("CS_DOWNLOAD_RECEIPT")}
        </div>
      ) : null} */}
      {/* {business_service?.includes("FSM") ? (
        <div
          className="link"
          style={isMobile ? { marginTop: "8px", width: "100%", textAlign: "center" } : { marginTop: "8px" }}
          onClick={printReciept}
        >
          {t("CS_DOWNLOAD_RECEIPT")}
        </div>
      ) : null} */}
      {/* {business_service?.includes("BPA") ? (
        <div
          className="link"
          style={isMobile ? { marginTop: "8px", width: "100%", textAlign: "center" } : { marginTop: "8px" }}
          onClick={printReciept}
        >
          {t("CS_DOWNLOAD_RECEIPT")}
        </div>
      ) : null} */}
      {/* {!(business_service == "TL") ||
        (!business_service?.includes("PT") && <SubmitBar onSubmit={printReciept} label={t("COMMON_DOWNLOAD_RECEIPT")} />)}
      {!(business_service == "TL") ||
        (!business_service?.includes("PT") && (
          <div className="link" style={isMobile ? { marginTop: "8px", width: "100%", textAlign: "center" } : { marginTop: "8px" }}>
            <Link to={`/digit-ui/citizen`}>{t("CORE_COMMON_GO_TO_HOME")}</Link>
          </div>
        ))} */}
      {business_service == "TL" && (
        <Link to={`/digit-ui/citizen`}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
        </Link>
      )}
      {business_service == "pet-services" && (
        <Link to={`/digit-ui/citizen`}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
        </Link>
      )}
      <Link to={`/digit-ui/citizen`}>
        <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
      </Link>
    </Card>
  );
};
