import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const printReciept = async (businessService, receiptNumber) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const state = Digit.ULBService.getStateId();
  const payments = await Digit.PaymentService.getReciept(tenantId, businessService, { consumerCodes: receiptNumber });
  let response = { filestoreIds: [payments.Payments[0]?.fileStoreId] };

  if (!payments.Payments[0]?.fileStoreId) {
    response = await Digit.PaymentService.generatePdf(state, { Payments: payments.Payments }, "consolidatedreceipt");
  }
  const fileStore = await Digit.PaymentService.printReciept(state, { fileStoreIds: response.filestoreIds[0] });
  window.open(fileStore[response.filestoreIds[0]], "_blank");
};

export const getActionButton = (businessService, receiptNumber) => {
  const { t } = useTranslation();
  return (
    <a
      href="javascript:void(0)"
      style={{
        color: "#FE7A51",
        cursor: "pointer",
      }}
      onClick={(value) => {
        // printReciept(businessService, receiptNumber);
        downloadAndPrintReciept(businessService, receiptNumber);
      }}
    >
      {" "}
      {t(`${"CS_COMMON_DOWNLOAD_RECEIPT"}`)}{" "}
    </a>
  );
};

export const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
  if (searcher == "") return str;
  while (str.includes(searcher)) {
    str = str.replace(searcher, replaceWith);
  }
  return str;
};

export const convertEpochToDate = (dateEpoch) => {
  if (dateEpoch == null || dateEpoch == undefined || dateEpoch == "") {
    return "NA";
  }
  const dateFromApi = new Date(dateEpoch);
  let month = dateFromApi.getMonth() + 1;
  let day = dateFromApi.getDate();
  let year = dateFromApi.getFullYear();
  month = (month > 9 ? "" : "0") + month;
  day = (day > 9 ? "" : "0") + day;
  return `${day}/${month}/${year}`;
};

export const downloadPdf = (blob, fileName) => {
  if (window.mSewaApp && window.mSewaApp.isMsewaApp() && window.mSewaApp.downloadBase64File) {
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      var base64data = reader.result;
      window.mSewaApp.downloadBase64File(base64data, fileName);
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

export const printPdf = (blob) => {
  const fileURL = URL.createObjectURL(blob);
  var myWindow = window.open(fileURL);
  if (myWindow != undefined) {
    myWindow.addEventListener("load", (event) => {
      myWindow.focus();
      myWindow.print();
    });
  }
};

export const downloadAndPrintChallan = async (challanNo, mode) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const response = await Digit.ChallanGenerationService.downloadPdf(challanNo, tenantId);
  const responseStatus = parseInt(response.status, 10);
  if (responseStatus === 201 || responseStatus === 200) {
    mode == "print"
      ? printPdf(new Blob([response.data], { type: "application/pdf" }))
      : downloadPdf(new Blob([response.data], { type: "application/pdf" }), `CHALLAN-${challanNo}.pdf`);
  }
};

export const downloadAndPrintReciept = async (bussinessService, consumerCode, mode) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const data = await Digit.PaymentService.getReciept(tenantId, bussinessService, { consumerCodes: consumerCode });
  const payments = data?.Payments[0];

  let response = null;
  if (payments?.fileStoreId) {
    response = { filestoreIds: [payments?.fileStoreId] };
  }
  const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
  window.open(fileStore[response?.filestoreIds[0]], "_blank");
  const responseStatus = parseInt(response.status, 10);
  if (responseStatus === 201 || responseStatus === 200) {
    let fileName =
      mode == "print"
        ? printPdf(new Blob([response.data], { type: "application/pdf" }))
        : downloadPdf(new Blob([response.data], { type: "application/pdf" }), `CHALLAN-${consumerCode}.pdf`);
  }
};

export const convertEpochToDateInput = (epoch) => {
  if (!epoch) return "";
  const date = new Date(epoch);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`; // Format required by <input type="date" />
};

/*   method to get required format from fielstore url*/
export const pdfDownloadLink = (documents = {}, fileStoreId = "", format = "") => {
  /* Need to enhance this util to return required format*/
  let downloadLink = documents[fileStoreId] || "";
  let differentFormats = downloadLink?.split(",") || [];
  let fileURL = "";
  differentFormats.length > 0 &&
    differentFormats.map((link) => {
      if (!link.includes("large") && !link.includes("medium") && !link.includes("small")) {
        fileURL = link;
      }
    });
  return fileURL;
};

/*   method to get filename  from fielstore url*/
export const pdfDocumentName = (documentLink = "", index = 0) => {
  let documentName = decodeURIComponent(documentLink.split("?")[0].split("/").pop().slice(13)) || `Document - ${index + 1}`;
  return documentName;
};

const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1);

const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ");

export const getAcknowledgementData = async (application, tenantInfo, t) => {
  const details = [];

  const propertyDetails = application?.additionalDetails?.propertyDetails?.[0];
  const rawAdditionalDetails = application?.additionalDetails;
  const isLegacy = rawAdditionalDetails?.applicationType === "Legacy";

  // Citizen (Owner) Details — mirrors "RAL_CITIZEN_DETAILS" StatusTable
  application?.OwnerInfo?.forEach((owner, index) => {
    details.push({
      title: `${t("RAL_APPLICANT")} ${index + 1}`,
      values: [
        { title: t("PT_OWNERSHIP_INFO_NAME"), value: owner?.name || t("CS_NA") },
        { title: t("CORE_COMMON_PROFILE_EMAIL"), value: owner?.emailId || t("CS_NA") },
        { title: t("CORE_MOBILE_NUMBER"), value: owner?.mobileNo || t("CS_NA") },
        {
          title: t("PT_COMMON_COL_ADDRESS"),
          value: owner?.correspondenceAddress?.addressId || owner?.permanentAddress?.addressId || t("CS_NA"),
        },
        {
          title: t("CORE_COMMON_PINCODE"),
          value: owner?.correspondenceAddress?.pincode || owner?.permanentAddress?.pincode || t("CS_NA"),
        },
      ],
    });
  });

  // Building/Plot/Shop Details — mirrors that StatusTable exactly, incl. conditional rows
  details.push({
    title: t("Building/Plot/Shop Details"),
    values: [
      ...(application?.registrationNumber
        ? [{ title: t("RAL_REGISTRATION_NUMBER"), value: application.registrationNumber }]
        : []),
      { title: t("APPLICATION_NUMBER"), value: application?.applicationNumber || t("CS_NA") },
      { title: t("Unit Id"), value: propertyDetails?.propertyId || t("CS_NA") },
      { title: t("Building/Plot/Shop Name"), value: propertyDetails?.propertyName || t("CS_NA") },
      { title: t("RAL_ALLOTMENT_TYPE"), value: propertyDetails?.allotmentType || t("CS_NA") },
      { title: t("Building/Plot/Shop Type"), value: propertyDetails?.propertyType || t("CS_NA") },
      { title: t("Building/Plot/Shop Locality"), value: propertyDetails?.address || t("CS_NA") },
      { title: t("RAL_PROPERTY_AMOUNT"), value: propertyDetails?.baseRent || t("CS_NA") },
      { title: t("PENALTY_TYPE"), value: propertyDetails?.penaltyType || t("CS_NA") },
      {
        title: t("RAL_FEE_CYCLE"),
        value: propertyDetails?.feesPeriodCycle
          ? propertyDetails.feesPeriodCycle[0].toUpperCase() + propertyDetails.feesPeriodCycle.slice(1).toLowerCase()
          : t("CS_NA"),
      },
      { title: t("Building/Plot/Shop Size"), value: propertyDetails?.propertySizeOrArea || t("CS_NA") },
      { title: t("RENT_LEASE_LOCATION_TYPE"), value: propertyDetails?.locationType || t("CS_NA") },
      ...(!isLegacy ?
        [{
          title: t("RAL_START_DATE"), value: convertEpochToDate(application?.startDate) || t("CS_NA")
        },
        {
          title: t("RAL_END_DATE"), value: convertEpochToDate(application?.endDate) || t("CS_NA")
        },
        ] : []),
      ...(application?.amountToBeDeducted > 0
        ? [{ title: t("RAL_PROPERTY_PENALTY"), value: `Rs. ${application.amountToBeDeducted}` }]
        : []),
      ...(!isLegacy
        ? [{ title: t("SECURITY_DEPOSIT"), value: `Rs. ${propertyDetails?.securityDeposit || "NA"}` }]
        : []),
      ...(application?.amountToBeDeducted - propertyDetails?.securityDeposit > 0
        ? [
            {
              title: t("RAL_AMOUNT_TO_TAKE_FROM_CITIZEN"),
              value: `Rs. ${application.amountToBeDeducted - propertyDetails.securityDeposit}`,
            },
          ]
        : []),
      ...(application?.amountToBeRefund > 0
        ? [{ title: t("RAL_AMOUNT_TO_REFUND"), value: `Rs. ${application.amountToBeRefund}` }]
        : []),
      ...(application?.tradeLicenseNumber
        ? [{ title: t("RENT_LEASE_TRADE_LICENSE_NUMBER"), value: application.tradeLicenseNumber }]
        : []),
    ],
  });

  if (isLegacy) {
    details.push({
      title: t("RAL_ARREAR_DETAILS"),
      values: [
        { title: t("Arrears"), value: rawAdditionalDetails?.arrear || t("CS_NA") },
        {
          title: t("Last Billing Period"),
          value: rawAdditionalDetails?.lastBillingPeriod
            ? new Date(rawAdditionalDetails.lastBillingPeriod).toLocaleDateString("en-IN")
            : "-",
        },
        ...(rawAdditionalDetails?.lastRentRevisedDate
          ? [
              {
                title: t("Last Rent Revised Date"),
                value: new Date(rawAdditionalDetails.lastRentRevisedDate).toLocaleDateString("en-IN"),
              },
            ]
          : []),
        ...(rawAdditionalDetails?.incrementPeriodMonths
          ? [{ title: t("Increment Period Months"), value: rawAdditionalDetails.incrementPeriodMonths }]
          : []),
        ...(rawAdditionalDetails?.incrementPercentage
          ? [{ title: t("Increment Percentage"), value: rawAdditionalDetails.incrementPercentage }]
          : []),
        { title: t("Reason"), value:  rawAdditionalDetails?.arrearReason?.name || rawAdditionalDetails?.arrearReason || t("CS_NA") },
        { title: t("Remarks"), value: rawAdditionalDetails?.remarks || t("CS_NA") },
      ],
    });
  }

  // Documents — mirrors allDocuments mapping
 const docDetails = [
   ...(application?.Document?.map((doc) => ({
     title: t(doc?.documentType) || "NA",
     value: " ",
   })) || []),
   ...(application?.additionalDetails?.arrearDoc ? [{ title: t("Arrear Doc"), value: " " }] : []),
 ];

 details.push({
   title: t("BPA_APPLICATION_DOCUMENTS"),
   values: docDetails.length ? docDetails : [{ title: t("CS_NO_DOCUMENTS_UPLOADED"), value: "NA" }],
 });
  return {
    t: t,
    tenantId: tenantInfo?.code,
    name: `${t(tenantInfo?.i18nKey)} ${ulbCamel(t(`ULBGRADE_${tenantInfo?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`))}`,
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("Allotment letter for Rent and Lease Services"),
    applicationNumber: application?.applicationNumber || "NA",
    details,
  };
};
