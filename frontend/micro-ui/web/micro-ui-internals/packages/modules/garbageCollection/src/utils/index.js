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

export const ChallanData = (tenantId, consumerCode) => {
  const wfData = Digit.Hooks.useWorkflowDetails({
    tenantId,
    id: consumerCode,
    moduleCode: "challan-generation",
    role: "EMPLOYEE",
  });

  const officerInstance = wfData?.data?.processInstances?.find((pi) => pi?.action === "SUBMIT");

  const codes = officerInstance?.assigner?.userName;
  const employeeData = Digit.Hooks.useEmployeeSearch(tenantId, { codes: codes, isActive: true }, { enabled: !!codes && !wfData?.isLoading });
  console.log("employeeData", employeeData);
  const officerRaw = employeeData?.data?.Employees?.[0];
  const officerAssignment = officerRaw?.assignments?.[0];

  const officer = officerRaw
    ? {
        code: officerRaw?.code,
        id: officerRaw?.id,
        name: officerRaw?.user?.name,
        department: officerAssignment?.department,
      }
    : null;

  return { officer };
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

export const businessServiceList = (isCode = false) => {
  let isSearchScreen = window.location.href.includes("/search");
  const availableBusinessServices = [
    {
      code: isSearchScreen ? "FIRE_NOC" : "FIRE_NOC_SRV",
      active: true,
      roles: ["FIRE_NOC_APPROVER"],
      i18nKey: "WF_FIRE_NOC_FIRE_NOC_SRV",
    },
    {
      code: isSearchScreen ? "AIRPORT_AUTHORITY" : "AIRPORT_NOC_SRV",
      active: true,
      roles: ["AIRPORT_AUTHORITY_APPROVER"],
      i18nKey: "WF_FIRE_NOC_AIRPORT_NOC_SRV",
    },
  ];

  const newAvailableBusinessServices = [];
  const loggedInUserRoles = Digit.UserService.getUser().info.roles;
  availableBusinessServices.map(({ roles }, index) => {
    roles.map((role) => {
      loggedInUserRoles.map((el) => {
        if (el.code === role) {
          isCode
            ? newAvailableBusinessServices.push(availableBusinessServices?.[index]?.code)
            : newAvailableBusinessServices.push(availableBusinessServices?.[index]);
        }
      });
    });
  });

  return newAvailableBusinessServices;
};

export const getAcknowledgementData = async (application, tenantInfo, t) => {
  console.log("application in getAcknowledgement", application);

  const details = [];

  // Application Details
  details.push({
    title: t("CS_APPLICATION_DETAILS"),
    values: [
      {
        title: t("CS_APPLICATION_NUMBER"),
        value: application?.applicationNo || "NA",
      }
    ],
  });

  // License Details
  
  details.push({
      title: "Owner Details",
      values: [
        {
          title: t("CORE_COMMON_NAME"),
          value: application?.connectionHolders?.[0]?.name || t("CS_NA"),
        },
        {
          title: t("CORE_COMMON_PROFILE_MOBILE_NUMBER"),
          value: application?.connectionHolders?.[0]?.mobileNumber || t("CS_NA"),
        },
        {
          title: t("CORE_EMAIL_ID"),
          value: application?.connectionHolders?.[0]?.emailId || t("CS_NA"),
        }
      ],
    });
  
  

    // Licensee Details
  details.push({
    title: t("GC_CONNECTION_DETAILS"),
    values: [
      {
        title: t("Application Status"),
        value: t(application?.applicationStatus) || "NA",
      },
      {
        title: t("GC_CONNECTION_TYPE"),
        value: application?.connectionCategory || "NA",
      },
      {
        title: t("GC_FREQUENCY"),
        value: application?.frequency || "NA",
      },
      {
        title: t("GC_WASTE_TYPE"),
        value: application?.typeOfWaste || "NA",
      },
      {
        title: t("GC_LOCATION"),
        value: application?.location || "N/A",
      },
    ],
  });




  // Documents
  // const documents = application?.Licenses?.[0]?.tradeLicenseDetail?.documents || [];
  const docDetails = application?.documents?.map((doc, index) => ({
    title: t(`${doc.documentType}`) || "NA",
    value: " ",
    link: doc.fileStoreId ? Digit.Utils.getFileUrl(doc.fileStoreId) : "",
  }));

  details.push({
    title: t("BPA_APPLICATION_DOCUMENTS"),
    values: docDetails?.length ? docDetails : [{ title: t("CS_NO_DOCUMENTS_UPLOADED"), value: "NA" }],
  });

  const imageURL = application?.applicationDetails?.find(detail => detail.title === "BPA_DOCUMENT_DETAILS_LABEL")?.additionalDetails?.documentsWithUrl?.[0]?.values?.find(doc => doc?.documentType === "APPL.BPAREG_PASS_PORT_SIZE_PHOTO")?.url || null;
  // console.log("imageURL", imageURL);
  return {
    t: t,
    tenantId: tenantInfo?.code,
    name: t("Acknowledgment letter for Garbage Collection"),
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("LOCAL_GOVERNMENT_PUNJAB"),
    applicationNumber: application?.applicationNo || "NA",
    details,
    imageURL
  };
};