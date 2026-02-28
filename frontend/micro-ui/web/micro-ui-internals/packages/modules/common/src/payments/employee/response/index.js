import React, { useEffect, useState, Fragment } from "react";
import { Banner, Card, CardText, SubmitBar, ActionBar, DownloadPrefixIcon, Loader, Menu } from "@mseva/digit-ui-react-components";
import { useHistory, useParams, Link, LinkLabel, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { format } from "date-fns";
import { transformBookingResponseToBookingData } from "../../index";
import { ChallanData, getLocationName, formatDate } from "../../index";

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
export const SuccessfulPayment = (props) => {
  const history = useHistory();
  const location = useLocation();
  const { addParams, clearParams } = props;
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { IsDisconnectionFlow } = Digit.Hooks.useQueryParams();
  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const isFSMResponse = location?.pathname?.includes("payment/success/FSM.TRIP_CHARGES");
  const combineResponseFSM = isFSMResponse ? `${t("PAYMENT_COLLECT_LABEL")} / ${t("PAYMENT_COLLECT")}` : t("PAYMENT_LOCALIZATION_RESPONSE");
  const [printing, setPrinting] = useState(false);
  const [chbPermissionLoading, setChbPermissionLoading] = useState(false);
  props.setLink(combineResponseFSM);
  const checkParam = useParams();
  const queryParams = new URLSearchParams(location.search);

  const egPgTxnId = queryParams.get("eg_pg_txnid");
  const razorpayPaymentId = queryParams.get("razorpayPaymentId");
  const razorpayOrderId = queryParams.get("razorpayOrderId");
  const razorpaySignature = queryParams.get("razorpaySignature");

  console.log("eg_pg_txnid:", egPgTxnId);

  let { consumerCode, receiptNumber, businessService } = useParams();

  console.log("checkParam", checkParam);
  console.log("egPgTxnId", egPgTxnId);
  console.log("businessService", businessService);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  receiptNumber = receiptNumber?.replace(/%2F/g, "/");
  const { data = {}, isLoading: isBpaSearchLoading, isSuccess: isBpaSuccess, error: bpaerror } = Digit.Hooks.obps.useOBPSSearch(
    "",
    {},
    tenantId,
    { applicationNo: consumerCode },
    {},
    { enabled: businessService?.includes("BPA") ? true : false }
  );
  const cities = Digit.Hooks.useTenants();
  let challanEmpData = ChallanData(tenantId, consumerCode);

  let ulbType = "";
  const loginCity = JSON.parse(sessionStorage.getItem("Digit.User"))?.value?.info?.tenantId;
  if (cities.data !== undefined) {
    const selectedTenantData = cities.data.find((item) => item.city.districtTenantCode === loginCity);
    ulbType = selectedTenantData?.city?.ulbGrade;
  }

  const { isLoading, data: dataCheck, isError } = Digit.Hooks.usePaymentUpdate({ egId: egPgTxnId }, businessService, {
    enabled: !!egPgTxnId,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const mutation = Digit.Hooks.chb.useChbCreateAPI(tenantId, false);

  const FSM_EDITOR = Digit.UserService.hasAccess("FSM_EDITOR_EMP") || false;

  function onActionSelect(action) {
    setSelectedAction(action);
    setDisplayMenu(false);
  }
  useEffect(() => {
    return () => {
      const fetchData = async () => {
        const tenantId = Digit.ULBService.getCurrentTenantId();
        const state = Digit.ULBService.getStateId();
        const payments = await Digit.PaymentService.getReciept(tenantId, businessService, { receiptNumbers: receiptNumber });
        let response = { filestoreIds: [payments.Payments[0]?.fileStoreId] };
        if (!payments.Payments[0]?.fileStoreId) {
          response = await Digit.PaymentService.generatePdf(state, { Payments: payments.Payments }, generatePdfKey);
        }
      };

      // call the function
      fetchData();
      queryClient.clear();
    };
  }, []);
  useEffect(() => {
    switch (selectedAction) {
      case "GO_TO_HOME":
        return history.push("/digit-ui/employee");
      case "ASSIGN_TO_DSO":
        return history.push(`/digit-ui/employee/fsm/application-details/${consumerCode}`);
      default:
        return null;
    }
  }, [selectedAction]);
  let ACTIONS = ["GO_TO_HOME"];
  if (FSM_EDITOR) {
    ACTIONS = [...ACTIONS, "ASSIGN_TO_DSO"];
  }

  const checkFSMResponse = businessService?.includes("FSM");
  const getMessage = () => t("ES_PAYMENT_COLLECTED");
  const getCardText = () => {
    if (businessService?.includes("BPA")) {
      let nameOfAchitect = sessionStorage.getItem("BPA_ARCHITECT_NAME");
      let parsedArchitectName = nameOfAchitect ? JSON.parse(nameOfAchitect) : "ARCHITECT";
      return t(`ES_PAYMENT_${businessService}_${parsedArchitectName}_SUCCESSFUL_DESCRIPTION`);
    } else if (businessService?.includes("WS") || businessService?.includes("SW")) {
      return t(`ES_PAYMENT_WS_${businessService?.replace(/\./g, "_")}_SUCCESSFUL_DESCRIPTION`);
    } else {
      return t("ES_PAYMENT_SUCCESSFUL_DESCRIPTION");
    }
  };

  const { data: generatePdfKey } = Digit.Hooks.useCommonMDMS(tenantId, "common-masters", "ReceiptKey", {
    select: (data) =>
      businessService === "GC.ONE_TIME_FEE"
        ? "garbage-receipt"
        : businessService === "rl-services"
        ? "rentandlease-receipt"
        : data["common-masters"]?.uiCommonPay?.filter(({ code }) => businessService?.includes(code))[0]?.receiptKey || "consolidatedreceipt",
  });

  const printCertificate = async () => {
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const state = Digit.ULBService.getStateId();
    const applicationDetails = await Digit.TLService.search({ applicationNumber: consumerCode, tenantId });
    const generatePdfKeyForTL = "tlcertificate";

    if (applicationDetails) {
      let response = await Digit.PaymentService.generatePdf(state, { Licenses: applicationDetails?.Licenses }, generatePdfKeyForTL);
      const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
      window.open(fileStore[response.filestoreIds[0]], "_blank");
    }
  };

  // const printpetCertificate = async () => {
  //   const tenantId = Digit.ULBService.getCurrentTenantId();
  //   const state = Digit.ULBService.getStateId();
  //   const applicationpetDetails = await Digit.PTRService.search({ tenantId, applicationNumber: consumerCode });
  //   console.log("aplllldetailll",consumerCode)
  //   const generatePdfKeyForPTR = "petservicecertificate";

  //   if (applicationpetDetails) {
  //     let response = await Digit.PaymentService.generatePdf(state, { PetRegistrationApplications: applicationpetDetails?.PetRegistrationApplications }, generatePdfKeyForPTR);
  //     const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
  //     window.open(fileStore[response.filestoreIds[0]], "_blank");
  //   }
  // };

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
        const payments = await Digit.PaymentService.getReciept(tenantId, businessService, { receiptNumbers: receiptNumber });
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
        const payments = await Digit.PaymentService.getReciept(tenantId, businessService, { receiptNumbers: receiptNumber });
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
        const payments = await Digit.PaymentService.getReciept(tenantId, businessService, { receiptNumbers: receiptNumber });
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
        const payments = await Digit.PaymentService.getReciept(tenantId, businessService, { receiptNumbers: receiptNumber });
        let response = { filestoreIds: [payments.Payments[0]?.fileStoreId] };
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
        const payments = await Digit.PaymentService.getReciept(tenantId, businessService, { receiptNumbers: receiptNumber });
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
  const printPetReceipt = async () => {
    if (printing) return;
    setPrinting(true);
    const payments = await Digit.PaymentService.getReciept(tenantId, businessService, { receiptNumbers: receiptNumber });
    try {
      let fileStoreId = payments.Payments[0]?.fileStoreId;
      if (!fileStoreId) {
        let response = await Digit.PaymentService.generatePdf(
          tenantId,
          { Payments: [{ ...(payments?.Payments?.[0] || {}) }] },
          "pet-receipt-employee"
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
      console.log("consumerCode for ndc", consumerCode);
      console.log("tenantId for ndc", tenantId);
      const applicationDetails = await Digit.NDCService.NDCsearch({
        tenantId,
        filters: { applicationNo: consumerCode },
      });
      let application = applicationDetails?.Applications?.[0];
      let fileStoreId = applicationDetails?.Applications?.[0]?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        const payments = await Digit.PaymentService.getReciept(tenantId, businessService, { receiptNumbers: receiptNumber });
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

  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: data?.[0]?.tenantId,
    id: data?.[0]?.applicationNo,
    moduleCode: "OBPS",
  });

  const getPermitOccupancyOrderSearch = async (order, mode = "download") => {
    let queryObj = { applicationNo: data?.[0]?.applicationNo };
    let bpaResponse = await Digit.OBPSService.BPASearch(data?.[0]?.tenantId, queryObj);
    const edcrResponse = await Digit.OBPSService.scrutinyDetails(data?.[0]?.tenantId, { edcrNumber: data?.[0]?.edcrNumber });
    let bpaData = bpaResponse?.BPA?.[0],
      edcrData = edcrResponse?.edcrDetail?.[0];
    let currentDate = new Date();
    bpaData.additionalDetails.runDate = convertDateToEpoch(
      currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate()
    );
    let reqData = { ...bpaData, edcrDetail: [{ ...edcrData }] };
    const state = Digit.ULBService.getStateId();

    let count = 0;
    for (let i = 0; i < workflowDetails?.data?.processInstances?.length; i++) {
      const newDate = new Date(workflowDetails?.data?.processInstances[i]?.auditDetails?.createdTime);
      const formattedDate = format(newDate, "dd-MM-yyyy HH:mm:ss");
      console.log("formatteddate2", formattedDate);
      if (
        (workflowDetails?.data?.processInstances[i]?.action === "POST_PAYMENT_APPLY" ||
          workflowDetails?.data?.processInstances[i]?.action === "PAY") &&
        workflowDetails?.data?.processInstances?.[i]?.state?.applicationStatus === "APPROVAL_INPROGRESS" &&
        count == 0
      ) {
        reqData.additionalDetails.submissionDate = workflowDetails?.data?.processInstances[i]?.auditDetails?.createdTime;
        reqData.additionalDetails.formattedSubmissionDate = formattedDate;
        count = 1;
      }
    }

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

    let response = await Digit.PaymentService.generatePdf(bpaData?.tenantId, { Bpa: [reqData] }, order);
    const fileStore = await Digit.PaymentService.printReciept(bpaData?.tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");
    reqData["applicationType"] = data?.[0]?.additionalDetails?.applicationType;
    let edcrResponseData = await Digit.OBPSService.edcr_report_download({ BPA: { ...reqData } });
    const responseStatus = parseInt(edcrResponseData.status, 10);
    if (responseStatus === 201 || responseStatus === 200) {
      mode == "print"
        ? printPdf(new Blob([edcrResponseData.data], { type: "application/pdf" }))
        : downloadPdf(new Blob([edcrResponseData.data], { type: "application/pdf" }), `edcrReport.pdf`);
    }
  };

  const printReciept = async () => {
    if (printing) return;
    setPrinting(true);
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const state = Digit.ULBService.getStateId();
    const payments = await Digit.PaymentService.getReciept(tenantId, businessService, { receiptNumbers: receiptNumber });
    let response = { filestoreIds: [payments.Payments[0]?.fileStoreId] };
    let fileStoreTenant;
    if (!payments.Payments[0]?.fileStoreId) {
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
        };
        payments.Payments[0].paymentDetails[0].additionalDetails = details;
        printRecieptNew(payments);
      } else if (payments.Payments[0].paymentDetails[0].businessService.includes("BPA")) {
        const designation = ulbType === "Municipal Corporation" ? "Municipal Commissioner" : "Executive Officer";
        const updatedpayments = {
          ...payments,
          payments: payments.Payments.map((payment, index) => {
            if (index === 0) {
              return {
                ...payment,
                additionalDetails: {
                  ...payment.additionalDetails,
                  designation: designation,
                  ulbType: ulbType,
                },
              };
            }
            return payment;
          }),
        };
        response = await Digit.PaymentService.generatePdf(state, { Payments: updatedpayments.payments }, generatePdfKey);
      } else {
        response = await Digit.PaymentService.generatePdf(tenantId, { Payments: payments.Payments }, generatePdfKey);
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

  const printDisconnectionRecipet = async () => {
    let tenantid = tenantId ? tenantId : Digit.ULBService.getCurrentTenantId();
    let consumercode = window.location.href.substring(window.location.href.lastIndexOf(consumerCode), window.location.href.lastIndexOf("?"));
    await Digit.Utils.downloadReceipt(consumercode, businessService, "consolidatedreceipt", tenantid);
  };
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
      console.log("payments", payments);
      response = await Digit.PaymentService.generatePdf(state, { Payments: paymentArray }, generatePdfKey);
      console.log("responseresponse", response);
    }
    const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response.filestoreIds[0]], "_blank");
  };
  if (businessService?.includes("BPA") && isBpaSearchLoading) return <Loader />;

  return (
    <React.Fragment>
      <Card>
        <Banner message={getMessage()} info={t("PAYMENT_LOCALIZATION_RECIEPT_NO")} applicationNumber={receiptNumber} successful={true} />
        <CardText>{getCardText()}</CardText>
        {generatePdfKey ? (
          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            {businessService !== "chb-services" &&
              businessService !== "adv-services" &&
              businessService !== "pet-services" &&
              businessService !== "NDC" &&
              businessService !== "Challan_Generation" && (
                <div
                  className="primary-label-btn d-grid"
                  style={{ marginLeft: "unset", marginRight: "20px" }}
                  onClick={printing ? undefined : IsDisconnectionFlow === "true" ? printDisconnectionRecipet : printReciept}
                >
                  {printing ? (
                    <Loader />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                      </svg>
                      {t("CS_COMMON_PRINT_RECEIPT")}
                    </>
                  )}
                </div>
              )}

            {businessService == "TL" ? (
              <div className="primary-label-btn d-grid" style={{ marginLeft: "unset" }} onClick={printCertificate}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                </svg>
                {t("CS_COMMON_PRINT_CERTIFICATE")}
              </div>
            ) : null}

            {/* {businessService !== "chb-services" &&
              businessService !== "adv-services" &&
              businessService !== "sv-services" &&
              businessService !== "pet-services" && (
                <div
                  className="primary-label-btn d-grid"
                  style={{ marginLeft: "unset", marginRight: "20px" }}
                  onClick={IsDisconnectionFlow === "true" ? printDisconnectionRecipet : printReciept}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                  </svg>
                  {t("CS_COMMON_PRINT_RECEIPT")}
                </div>
              )} */}

            {businessService == "sv-services" ? (
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

            {businessService == "sv-services" ? (
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
            {businessService == "sv-services" ? (
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

            {businessService == "chb-services" ? (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "20px", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}>
                <div className="primary-label-btn d-grid" onClick={printing ? undefined : printCHBReceipt}>
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
                <div className="primary-label-btn d-grid" onClick={chbPermissionLoading ? undefined : printPermissionLetter}>
                  {chbPermissionLoading ? (
                    <Loader />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                      </svg>
                      {t("CHB_PERMISSION_LETTER")}
                    </>
                  )}
                </div>
              </div>
            ) : null}

            {businessService == "adv-services" ? (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "20px", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}>
                <div className="primary-label-btn d-grid" onClick={printing ? undefined : printADVReceipt}>
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
              </div>
            ) : null}
            {businessService == "pet-services" ? (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "20px", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}>
                <div className="primary-label-btn d-grid" onClick={printing ? undefined : printPetReceipt}>
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
              </div>
            ) : null}

            {businessService == "NDC" ? (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "20px", marginRight: "20px", marginTop: "15px", marginBottom: "15px" }}>
                <div className="primary-label-btn d-grid" onClick={printing ? undefined : printNDCReceipt}>
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
              </div>
            ) : null}

            {businessService == "Challan_Generation" ? (
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
              </div>
            ) : null}

            {businessService == "sv-services" && (
              <Link to={`/digit-ui/citizen`}>
                <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} style={{ marginTop: "15px" }} />
              </Link>
            )}
            {/* {businessService == "pet-services" ? (
              <div className="primary-label-btn d-grid" style={{ marginLeft: "unset" }} onClick={printpetCertificate}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                </svg>
                {t("CS_COMMON_PRINT_CERTIFICATE")}
              </div>
            ) : null} */}
            {data?.[0]?.businessService === "BPA_OC" && (data?.[0]?.status === "APPROVED" || data?.[0]?.status === "PENDING_SANC_FEE_PAYMENT") ? (
              <div
                className="primary-label-btn d-grid"
                style={{ marginLeft: "unset" }}
                onClick={(e) => getPermitOccupancyOrderSearch("occupancy-certificate")}
              >
                <DownloadPrefixIcon />
                {t("BPA_OC_CERTIFICATE")}
              </div>
            ) : null}
            {data?.[0]?.businessService === "BPA_LOW" ? (
              <div
                className="primary-label-btn d-grid"
                style={{ marginLeft: "unset" }}
                onClick={(r) => getPermitOccupancyOrderSearch("buildingpermit-low")}
              >
                <DownloadPrefixIcon />
                {t("BPA_PERMIT_ORDER")}
              </div>
            ) : null}
            {data?.[0]?.businessService === "BPA" &&
            data?.[0]?.businessService !== "BPA_LOW" &&
            data?.[0]?.businessService !== "BPA_OC" &&
            (data?.[0]?.status === "PENDING_SANC_FEE_PAYMENT" || data?.[0]?.status === "APPROVED") ? (
              <div
                className="primary-label-btn d-grid"
                style={{ marginLeft: "unset" }}
                onClick={(r) => getPermitOccupancyOrderSearch("buildingpermit")}
              >
                <DownloadPrefixIcon />
                {t("BPA_PERMIT_ORDER")}
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>
      {checkFSMResponse ? (
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
          {displayMenu ? <Menu localeKeyPrefix={"ES_COMMON"} options={ACTIONS} t={t} onSelect={onActionSelect} /> : null}
          <SubmitBar label={t("ES_COMMON_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
        </ActionBar>
      ) : (
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
          <Link to="/digit-ui/employee">
            <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
          </Link>
        </ActionBar>
      )}
    </React.Fragment>
  );
};

export const FailedPayment = (props) => {
  props.setLink("Response");
  const { addParams, clearParams } = props;
  const { t } = useTranslation();
  const { consumerCode } = useParams();

  const getMessage = () => t("ES_PAYMENT_COLLECTED_ERROR");
  return (
    <React.Fragment>
      <Card>
        <Banner message={getMessage()} complaintNumber={consumerCode} successful={false} />
        <CardText>{t("ES_PAYMENT_FAILED_DETAILS")}</CardText>
      </Card>
      <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
        <Link to="/digit-ui/employee">
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
        </Link>
      </ActionBar>
    </React.Fragment>
  );
};
