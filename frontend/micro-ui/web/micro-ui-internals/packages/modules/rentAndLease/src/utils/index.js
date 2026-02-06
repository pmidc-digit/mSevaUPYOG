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

  // License Details

  application?.OwnerInfo?.forEach((owner, index) => {
    details.push({
      title: `Owner ${index + 1} Details`,
      values: [
        {
          title: t("CORE_COMMON_NAME"),
          value: owner?.name || t("CS_NA"),
        },
        {
          title: t("CORE_COMMON_PROFILE_MOBILE_NUMBER"),
          value: owner?.mobileNo || t("CS_NA"),
        },
        {
          title: t("CORE_EMAIL_ID"),
          value: owner?.emailId || t("CS_NA"),
        },
        {
          title: t("Permanent Address"),
          value: `${owner?.permanentAddress?.addressId || t("CS_NA")} , ${owner?.permanentAddress?.pincode || t("CS_NA")}`,
        },
        {
          title: t("Correspondence Address"),
          value: `${owner?.correspondenceAddress?.addressId || t("CS_NA")} , ${owner?.correspondenceAddress?.pincode || t("CS_NA")}`,
        },
      ],
    });
  });

  details.push({
    title: t("PT_PROPERTY_DETAILS"),
    values: [
      {
        title: t("STATUS"),
        value: t(application?.status) || "NA",
      },
      {
        title: t("PROPERTY_ID"),
        value: t(application?.additionalDetails?.propertyId) || "NA",
      },
      {
        title: t("PT_ACK_LOCALIZATION_PROPERTY_ADDRESS"),
        value: application?.additionalDetails?.address || "NA",
      },
      {
        title: t("Allotment Type"),
        value: application?.additionalDetails?.allotmentType || "NA",
      },
      {
        title: t("Property Name"),
        value: application?.additionalDetails?.propertyName || "NA",
      },
      {
        title: t("Property Area"),
        value: `${application?.additionalDetails?.propertySizeOrArea || "NA"} sq. meters`,
      },
      {
        title: t("PDF_STATIC_LABEL_WS_CONSOLIDATED_ACKNOWELDGMENT_PROPERTY_TYPE"),
        value: application?.additionalDetails?.propertyType || "NA",
      },
      {
        title: t("Location Type"),
        value: application?.additionalDetails?.locationType || "NA",
      },
      {
        title: t("Security Deposit"),
        value: `Rs. ${application?.additionalDetails?.securityDeposit || "NA"}`,
      },
      {
        title: t("Base Rent"),
        value: `Rs. ${application?.additionalDetails?.baseRent || "NA"}`,
      },
      ...(application?.amountToBeDeducted
        ? [
            {
              title: t("Penalty Amount"),
              value: `Rs. ${application?.amountToBeDeducted}`,
            },
            {
              title: t("Penalty Amount (After Security Deposit)"),
              value: `Rs. ${application?.amountToBeDeducted - (application?.additionalDetails?.securityDeposit || 0)}`,
            },
          ]
        : []),
    ],
  });

  if (application?.additionalDetails?.applicationType === "Legacy") {
    details.push({
      title: t("RAL_ARREAR_DETAILS"),
      values: [
        {
          title: t("Arrears"),
          value: application?.additionalDetails?.arrear || "NA",
        },
        {
          title: t("RAL_START_DATE"),
          value: convertEpochToDate(application?.additionalDetails?.arrearStartDate) || "NA",
        },
        {
          title: t("RAL_END_DATE"),
          value: convertEpochToDate(application?.additionalDetails?.arrearEndDate) || "NA",
        },
        {
          title: t("Reason"),
          value: application?.additionalDetails?.arrearReason || "NA",
        },
        {
          title: t("Remarks"),
          value: application?.additionalDetails?.remarks || "NA",
        },
      ],
    });
  }

  const standardDocs =
    application?.Document?.map((doc, index) => ({
      title: t(`${doc.documentType}`) || "NA",
      value: " ",
      link: doc.fileStoreId ? Digit.Utils.getFileUrl(doc.fileStoreId) : "",
    })) || [];

  const arrearDoc = application?.additionalDetails?.arrearDoc
    ? [
        {
          title: t("Arrear Doc"),
          value: " ",
          link: Digit.Utils.getFileUrl(application.additionalDetails.arrearDoc),
        },
      ]
    : [];

  const docDetails = [...standardDocs, ...arrearDoc];

  details.push({
    title: t("BPA_APPLICATION_DOCUMENTS"),
    values: docDetails?.length ? docDetails : [{ title: t("CS_NO_DOCUMENTS_UPLOADED"), value: "NA" }],
  });

  const imageURL = application?.additionalDetails?.propertyImage;
  return {
    t: t,
    tenantId: tenantInfo?.code,
    name: `${t(tenantInfo?.i18nKey)} ${ulbCamel(t(`ULBGRADE_${tenantInfo?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`))}`,
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("Allotment letter for Rent and Lease Services"),
    applicationNumber: application?.applicationNumber || "NA",
    details,
    imageURL,
  };
};
