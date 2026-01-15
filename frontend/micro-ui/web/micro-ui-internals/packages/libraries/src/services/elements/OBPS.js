import { Request } from "../atoms/Utils/Request";
import Urls from "../atoms/urls";
import { format } from "date-fns";
import { MdmsService } from "./MDMS";
import React from "react";
import { UploadServices } from "../atoms/UploadServices";

export const OBPSService = {
  scrutinyDetails: (tenantId, params) =>
    Request({
      url: Urls.obps.scrutinyDetails,
      params: { tenantId, ...params },
      auth: true,
      userService: true,
      method: "POST",
    }),
  comparisionReport: (tenantId, params) =>
    Request({
      url: Urls.obps.comparisionReport,
      params: { tenantId, ...params },
      auth: true,
      userService: true,
      method: "POST",
    }),
  create: (details, tenantId) =>
    Request({
      url: Urls.obps.create,
      data: details,
      useCache: false,
      setTimeParam: false,
      userService: true,
      method: "POST",
      params: {},
      auth: true,
    }),
  NOCSearch: (tenantId, sourceRefId) =>
    Request({
      url: Urls.obps.nocSearch,
      params: { tenantId, ...sourceRefId },
      auth: true,
      userService: true,
      method: "POST",
    }),
  update: (details, tenantId) =>
    Request({
      url: Urls.obps.update,
      data: details,
      useCache: false,
      setTimeParam: false,
      userService: true,
      method: "POST",
      params: {},
      auth: true,
    }),
  updateNOC: (details, tenantId) =>
    Request({
      url: Urls.obps.updateNOC,
      data: details,
      useCache: false,
      setTimeParam: false,
      userService: true,
      method: "POST",
      params: {},
      auth: true,
    }),
  BPASearch: (tenantId, params) =>
    Request({
      url: Urls.obps.bpaSearch,
      params: { tenantId, ...params },
      auth: true,
      userService: true,
      method: "POST",
    }),


  // BPAREGSearch: (tenantId, details, params) => {

  //   const transformedTenantId = tenantId === "pb" ? "pb.punjab" : tenantId
  //   const { tenantId: removedTenantId, ...cleanParams } = params || {}
  //   const finalParams = { tenantId: transformedTenantId, ...cleanParams }


  //   return Request({
  //     url: Urls.obps.bpaRegSearch,
  //     params: finalParams,
  //     auth: true,
  //     userService: true,
  //     method: "POST",
  //     data: details,
  //   })
  // },



  BPAREGSearch: (tenantId, details, params) =>
    Request({
      url: Urls.obps.bpaRegSearch,
      params: { tenantId, ...params },
      auth: true,
      userService: true,
      method: "POST",
      data: details,
    }),



  BPAREGCreate: (details, tenantId) =>
    Request({
      url: Urls.obps.bpaRegCreate,
      data: details,
      useCache: false,
      setTimeParam: false,
      userService: window.location.href.includes("openlink") ? false : true,
      method: "POST",
      params: {},
      auth: window.location.href.includes("openlink") ? false : true,
    }),

  LayoutCreate: (details, tenantId) =>
    Request({
      url: Urls.obps.layoutCreate,
      data: details,
      useCache: false,
      setTimeParam: false,
      userService: window.location.href.includes("openlink") ? false : true,
      method: "POST",
      params: {},
      auth: window.location.href.includes("openlink") ? false : true,
    }),

  LayoutSearch: (tenantId, details, params, config = {}) => {
    const { includeMobileNumber = true } = config;
    let finalParams = { tenantId, ...params };
    
    // Conditionally exclude mobileNumber if caller specifies includeMobileNumber: false
    if (!includeMobileNumber && finalParams.mobileNumber) {
      delete finalParams.mobileNumber;
    }
    
    return Request({
      url: Urls.obps.layoutSearch,
      params: finalParams,
      auth: true,
      userService: true,
      method: "POST",
      data: details,
    });
  },
  LayoutUpdate: (details, tenantId) =>
    Request({
      url: Urls.obps.layoutUpdate,
      data: details,
      useCache: false,
      setTimeParam: false,
      userService: window.location.href.includes("openlink") ? false : true,
      method: "POST",
      params: {},
      auth: window.location.href.includes("openlink") ? false : true,
    }),
  CLUCreate: ({ tenantId, filters, details }) => {
    return Request({
      url: Urls.obps.cluCreate,
      data: details,
      useCache: true,
      method: "POST",
      params: {},
      auth: true,
      userService: true,
    });
  },
  CLUUpdate: ({ tenantId, filters, details }) =>
    Request({
      url: Urls.obps.cluUpdate,
      data: details,
      useCache: true,
      userService: true,
      method: "POST",
      params: { tenantId, ...filters },
      auth: true,
  }),
  CLUSearch: ({ tenantId, filters }) =>
    Request({
      url: Urls.obps.cluSearch,
      useCache: false,
      method: "POST",
      auth: true,
      userService: false,
      params: { tenantId, ...filters },
  }),
  CLUCalculator: ({ filters, details }) => 
    Request({
      url: Urls.obps.cluCalculator,
      useCache: true,
      method: "POST",
      auth: true,
      userService: true,
      data: details,
      params:filters
   }),
  LayoutCalculator: ({ filters, details }) => 
    Request({
      url: Urls.obps.layoutCalculator,
      useCache: true,
      method: "POST",
      auth: true,
      userService: true,
      data: details,
      params:filters
    }),

  LayoutCollectionSearch: ({ filters, details }) => 
    Request({
      url: Urls.obps.layoutCollectionSearch,
      useCache: true,
      method: "POST",
      auth: true,
      userService: true,
      data: details,
      params:filters
    }),

    

  BPAREGGetBill: (tenantId, filters = {}) =>
    Request({
      url: Urls.obps.bpaRegGetBill,
      useCache: false,
      method: "POST",
      auth: false,
      userService: false,
      params: { tenantId, ...filters },
    })
      .then((d) => {
        return d;
      })
      .catch((err) => {
        if (err?.response?.data?.Errors?.[0]?.code === "EG_BS_BILL_NO_DEMANDS_FOUND") return { Bill: [] };
        else throw err;
      }),
  BPAREGupdate: (details, tenantId) =>
    Request({
      url: Urls.obps.bpaRegUpdate,
      data: details,
      useCache: false,
      setTimeParam: false,
      userService: window.location.href.includes("openlink") ? false : true,
      method: "POST",
      params: {},
      auth: window.location.href.includes("openlink") ? false : true,
    }),
  receipt_download: (bussinessService, consumerCode, tenantId, filters = {}) =>
    Request({
      url: Urls.obps.receipt_download,
      data: {},
      useCache: true,
      method: "POST",
      params: { bussinessService, consumerCode, tenantId, ...filters },
      auth: true,
      locale: true,
      userService: true,
      userDownload: true,
    }),
  edcr_report_download: (details, tenantId) =>
    Request({
      url: Urls.obps.edcrreportdownload,
      data: details,
      useCache: true,
      method: "POST",
      auth: true,
      locale: true,
      userService: false,
      userDownload: true,
    }),
  BPAOpensearch: (data) =>
    Request({
      url: Urls.obps.getSearchDetails,
      useCache: false,
      method: "POST",
      auth: false,
      noRequestInfo: true,
      userService: false,
      data: data,
    }),
  LicenseDetails: async (tenantId, params) => {
    const response = await OBPSService.BPAREGSearch(tenantId, {}, params);

    if (!response?.Licenses?.length) {
      return;
    }
    const [License] = response?.Licenses;

    console.log(License, "LIIIIII");

    const paymentRes = await Digit.PaymentService.recieptSearch(License?.tenantId, "BPAREG", {
      consumerCodes: License?.applicationNumber,
      isEmployee: true,
    });

    const mdmsRes = await MdmsService.getMultipleTypes(License?.tenantId, "StakeholderRegistraition", ["TradeTypetoRoleMapping"]);

    if (License?.tradeLicenseDetail?.applicationDocuments?.length && mdmsRes?.StakeholderRegistraition?.TradeTypetoRoleMapping?.length > 0) {
      mdmsRes?.StakeholderRegistraition?.TradeTypetoRoleMapping?.map((doc) => {
        if (doc?.docTypes?.length > 0 && doc?.tradeType == License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType) {
          doc?.docTypes?.map((docType) => {
            License?.tradeLicenseDetail?.applicationDocuments?.forEach((document) => {
              if (docType?.code == document?.documentType && docType?.info) document.info = docType?.info;
            });
          });
        }
      });
    }

    const appDocumentFileStoreIds = License?.tradeLicenseDetail?.applicationDocuments?.map((appDoc) => appDoc?.fileStoreId);
    let fileDetails = {};
    if (appDocumentFileStoreIds?.length > 0) {
      fileDetails = await UploadServices.Filefetch(appDocumentFileStoreIds, Digit.ULBService.getStateId());
    }

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(Number(timestamp));

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const dob = typeof License?.tradeLicenseDetail?.owners?.[0]?.dob === "string" ? License?.tradeLicenseDetail?.owners?.[0]?.dob : formatDate(License?.tradeLicenseDetail?.owners?.[0]?.dob)
const getFormattedULBName = (ulbCode = "") => {
    if (!ulbCode) return t("BPA_ULB_NOT_AVAILABLE");

    const parts = ulbCode.split(".");
    if (parts.length < 2) return ulbCode.charAt(0).toUpperCase() + ulbCode.slice(1);

    const namePart = parts[1];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const ulbName = getFormattedULBName(License?.tradeLicenseDetail?.additionalDetail?.Ulb);




    const details = [
      {
        title: " ",
        values: [{ title: "BPA_APPLICATION_NUMBER_LABEL", value: License?.applicationNumber || "NA" }],
      },
      License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType.includes("ARCHITECT")
        ? {
          title: "BPA_LICENSE_DETAILS_LABEL",
          asSectionHeader: true,
          values: [
            {
              title: "BPA_QUALIFICATION_TYPE",
              value: License?.tradeLicenseDetail?.additionalDetail?.qualificationType || "NA",
            },
            {
              title: "BPA_LICENSE_TYPE",
              value: `TRADELICENSE_TRADETYPE_${License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}` || "NA",
            },
            { title: "BPA_COUNCIL_OF_ARCH_NO_LABEL", value: License?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo || "NA" },
            { title: "BPA_SELECTED_ULB", value:"BPA_ULB_SELECTED_MESSAGE" || "NA" },
            { title: "BPA_CERTIFICATE_EXPIRY_DATE", value: formatDate(License?.validTo) || "NA" },
          ],
        }
        : License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType.includes("TOWNPLANNER") ? {
          title: "BPA_LICENSE_DETAILS_LABEL",
          asSectionHeader: true,
          values: [
            {
              title: "BPA_QUALIFICATION_TYPE",
              value: License?.tradeLicenseDetail?.additionalDetail?.qualificationType || "NA",
            },
            { title: "BPA_ASSOCIATE_OR_FELLOW_NUMBER", value: License?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo || "NA" },         
            {
              title: "BPA_LICENSE_TYPE",
              value: `TRADELICENSE_TRADETYPE_${License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}` || "NA",
            },
            { title: "BPA_SELECTED_ULB", value:  ulbName || "NA" },
          ],
        } : {
          title: "BPA_LICENSE_DETAILS_LABEL",
          asSectionHeader: true,
          values: [
            {
              title: "BPA_QUALIFICATION_TYPE",
              value: License?.tradeLicenseDetail?.additionalDetail?.qualificationType || "NA",
            },            
            {
              title: "BPA_LICENSE_TYPE",
              value: `TRADELICENSE_TRADETYPE_${License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}` || "NA",
            },
            { title: "BPA_SELECTED_ULB", value:  ulbName || "NA" },
          ],
        },
      {
        title: "BPA_LICENSEE_DETAILS_HEADER_OWNER_INFO",
        asSectionHeader: true,
        values: [
          { title: "BPA_APPLICANT_NAME_LABEL", value: License?.tradeLicenseDetail?.owners?.[0]?.name || "NA" },
          { title: "BPA_APPLICANT_GENDER_LABEL", value: License?.tradeLicenseDetail?.owners?.[0]?.gender || "NA" },
          { title: "BPA_OWNER_MOBILE_NO_LABEL", value: License?.tradeLicenseDetail?.owners?.[0]?.mobileNumber || "NA" },
          { title: "BPA_APPLICANT_EMAIL_LABEL", value: License?.tradeLicenseDetail?.owners?.[0]?.emailId || "NA" },
          { title: "BPA_APPLICANT_DOB_LABEL", value: dob || "NA" },
          // { title: "BPA_APPLICANT_PAN_NO", value: License?.tradeLicenseDetail?.owners?.[0]?.pan || "NA" },
        ],
      },
      {
        title: "BPA_PERMANANT_ADDRESS_LABEL",
        asSectionHeader: true,
        values: [
          { title: "BPA_APPLICANT_ADDRESS_LABEL", value: License?.tradeLicenseDetail?.owners?.[0]?.permanentAddress || "NA" },
          { title: "BPA_STATE_TYPE", value: License?.tradeLicenseDetail?.owners?.[0]?.permanentState || "NA" },
          { title: "BPA_DISTRICT_TYPE", value: License?.tradeLicenseDetail?.owners?.[0]?.permanentDistrict || "NA" },
          { title: "BPA_DETAILS_PIN_LABEL", value: License?.tradeLicenseDetail?.owners?.[0]?.permanentPinCode || "NA" },
        ],
      },
      {
        title: "BPA_APPLICANT_CORRESPONDENCE_ADDRESS_LABEL",
        asSectionHeader: true,
        values: [
          { title: "BPA_APPLICANT_CORRESPONDENCE_ADDRESS_LABEL", value: License?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress || "NA" },
          { title: "BPA_STATE_TYPE", value: License?.tradeLicenseDetail?.owners?.[0]?.correspondenceState || "NA" },
          { title: "BPA_DISTRICT_TYPE", value: License?.tradeLicenseDetail?.owners?.[0]?.correspondenceDistrict || "NA" },
          { title: "BPA_DETAILS_PIN_LABEL", value: License?.tradeLicenseDetail?.owners?.[0]?.correspondencePinCode || "NA" },
        ],
      },
      {
        title: "BPA_DOCUMENT_DETAILS_LABEL",
        asSectionHeader: true,
        additionalDetails: {
          documentsWithUrl: [
            {
              title: "",
              values: License?.tradeLicenseDetail?.applicationDocuments?.map((doc) => ({
                title: `BPAREG_HEADER_${doc?.documentType?.replaceAll(".", "_")}`,
                documentType: doc?.documentType,
                documentUid: doc?.documentUid,
                fileStoreId: doc?.fileStoreId,
                id: doc?.id,
                docInfo: doc?.info,
                url: fileDetails?.data[doc?.fileStoreId] ? fileDetails?.data[doc?.fileStoreId]?.split(",")[0] : "",
              })),
            },
          ],
        },
      },
      paymentRes?.Payments?.length > 0 && {
        title: "BPA_FEE_DETAILS_LABEL",
        additionalDetails: {
          inspectionReport: [],
          values: [
            { title: "BPAREG_FEES", value: <span>&#8377;{paymentRes?.Payments?.[0]?.totalAmountPaid}</span> },
            {
              title: "BPA_STATUS_LABEL",
              isTransLate: true,
              isStatus: true,
              value:
                paymentRes?.Payments?.[0]?.totalAmountPaid !== null || paymentRes?.Payments?.[0]?.totalAmountPaid !== undefined
                  ? "WF_BPA_PAID"
                  : "NA",
              isTransLate: true,
            },
          ],
        },
      },
    ];

    return {
      applicationData: License,
      applicationDetails: details,
      tenantId: License?.tenantId,
      payments: paymentRes?.Payments || [],
    };
  },
  BPADetailsPage: async (tenantId, filters) => {
    console.log("edcrInHooks")
    const response = await OBPSService.BPASearch(tenantId, filters);
    console.log(response, "APPP");
    let appDocumentFileStoreIds = response?.BPA?.[0]?.documents?.map((docId) => docId.fileStoreId);
    if (!appDocumentFileStoreIds) appDocumentFileStoreIds = [];
    response?.BPA?.[0]?.additionalDetails?.fieldinspection_pending?.map((fiData) => {
      fiData?.docs?.map((fiDoc) => {
        if (fiDoc?.fileStoreId) appDocumentFileStoreIds.push(fiDoc?.fileStoreId);
      });
    });

    console.log(response, "EEEEE");

    // if (!response?.BPA?.length) {
    //   return;
    // }

    console.log("After If");
    sessionStorage.setItem(
      "BPA_ARCHITECT_NAME",
      JSON.stringify(response?.BPA?.[0]?.additionalDetails?.typeOfArchitect ? response?.BPA?.[0]?.additionalDetails?.typeOfArchitect : "ARCHITECT")
    );
    const [BPA] = response?.BPA;
    console.log(BPA, "KHA");
    const edcrResponse = await OBPSService.scrutinyDetails(BPA?.tenantId, { edcrNumber: BPA?.edcrNumber });
    const [edcr] = edcrResponse?.edcrDetail;
    let height = edcr?.planDetail?.blocks?.[0]?.building?.buildingHeight;

    // if (typeof height === "number") {
    //   height = Math.floor(height * 100) / 100; // truncate to 2 decimals
    //   const remainder = (edcr?.planDetail?.blocks?.[0]?.building?.buildingHeight * 1000) % 10;

    //   if (remainder > 5) {
    //     height = parseFloat((height + 0.01).toFixed(2));
    //   } else {
    //     height = parseFloat(height.toFixed(2));
    //   }
    // }
    console.log(edcr, "KHATA");
    const mdmsRes = await MdmsService.getMultipleTypes(tenantId, "BPA", ["RiskTypeComputation", "CheckList"]);
    const riskType = Digit.Utils.obps.calculateRiskType(mdmsRes?.BPA?.RiskTypeComputation, edcr?.planDetail?.plot?.area, edcr?.planDetail?.blocks);
    BPA.riskType = riskType;
    // const nocResponse = await OBPSService.NOCSearch(BPA?.tenantId, { sourceRefId: BPA?.applicationNo });
    // const noc = nocResponse?.Noc;
    const noc = [];
    console.log("edcrInHooks", BPA)
    const filter = { approvalNo: response?.BPA?.[0]?.approvalNo };
    const bpaResponse = await OBPSService.BPASearch(tenantId, { ...filter });
    const comparisionRep = {
      ocdcrNumber: BPA?.edcrNumber.includes("OCDCR") ? BPA?.edcrNumber : bpaResponse?.BPA?.[0]?.edcrNumber,
      edcrNumber: bpaResponse?.BPA?.[0]?.edcrNumber.includes("OCDCR") ? BPA?.edcrNumber : bpaResponse?.BPA?.[0]?.edcrNumber,
    };
    // const comparisionReport = await OBPSService.comparisionReport(BPA?.tenantId, { ...comparisionRep });
    const comparisionReport = [];

    noc?.map((nocDetails) => {
      nocDetails?.documents?.map((nocDoc) => {
        if (nocDoc?.fileStoreId) appDocumentFileStoreIds.push(nocDoc?.fileStoreId);
      });
    });

    let fileDetails = {};
    if (appDocumentFileStoreIds?.length > 0) {
      fileDetails = await UploadServices.Filefetch(appDocumentFileStoreIds, Digit.ULBService.getStateId());
    }

    let appBusinessService = [],
      collectionBillDetails = [],
      collectionBillArray = [],
      totalAmount = 0,
      collectionBillRes = [];

    if (BPA?.businessService === "BPA_LOW") appBusinessService = ["BPA.NC_APP_FEE", "BPA.NC_SAN_FEE"];
    else if (BPA?.businessService === "BPA") appBusinessService = ["BPA.NC_APP_FEE", "BPA.NC_SAN_FEE"];
    else if (BPA?.businessService === "BPA_OC") appBusinessService = ["BPA.NC_OC_APP_FEE", "BPA.NC_OC_SAN_FEE"];
    else appBusinessService = ["BPA.NC_APP_FEE", "BPA.NC_SAN_FEE"];

    let fetchBillRes = {};
    console.log(appBusinessService, "GGGGG");
    if (appBusinessService?.[1]) {
      fetchBillRes = await Digit.PaymentService.fetchBill(BPA?.tenantId, {
        consumerCode: BPA?.applicationNo,
        businessService: appBusinessService[1],
      });
    }

    for (let i = 0; i < appBusinessService?.length; i++) {
      let collectionres = await Digit.PaymentService.recieptSearch(BPA?.tenantId, appBusinessService[i], {
        consumerCodes: BPA?.applicationNo,
        isEmployee: true,
      });
      if (collectionres?.Payments?.length > 0) {
        collectionres?.Payments?.map((res) => {
          res?.paymentDetails?.map((resData) => {
            if (resData?.businessService == appBusinessService[i]) {
              collectionBillRes.push(res);
            }
          });
        });
      }
      if (collectionres?.Payments?.length > 0) collectionBillDetails.push(...collectionres?.Payments);
    }

    if (collectionBillRes?.length > 0) {
      collectionBillRes?.map((ob) => {
        ob?.paymentDetails?.[0]?.bill?.billDetails?.[0]?.billAccountDetails.map((bill, index) => {
          collectionBillArray.push(
            { title: `${bill?.taxHeadCode}_DETAILS`, value: "", isSubTitle: true },
            { title: bill?.taxHeadCode, value: `₹${bill?.amount}` },
            { title: "BPA_STATUS_LABEL", value: "Paid" }
          );
          totalAmount = totalAmount + parseInt(bill?.amount);
        });
      });
    }
    if (fetchBillRes?.Bill?.length > 0) {
      collectionBillArray.push(
        {
          title: `${fetchBillRes?.Bill?.[0]?.billDetails?.[0]?.billAccountDetails?.[0]?.taxHeadCode}_DETAILS` || `BPA_SANC_FEE_DETAILS`,
          value: "",
          isSubTitle: true,
        },
        { title: `BPA_SANC_FEE_LABEL`, value: `₹${fetchBillRes?.Bill?.[0]?.totalAmount}` },
        { title: "BPA_STATUS_LABEL", value: `${fetchBillRes?.Bill?.[0]?.totalAmount == 0 ? "Paid" : "Unpaid"}` }
      );
    }
    totalAmount > 0 && collectionBillArray.push({ title: "BPA_TOT_AMT_PAID", value: `₹${totalAmount}` });

    const billDetails = {
      title: "BPA_FEE_DETAILS_LABEL",
      isFeeDetails: true,
      additionalDetails: {
        inspectionReport: [],
        values: [...collectionBillArray],
      },
    };

    BPA?.additionalDetails?.fieldinspection_pending?.forEach((fiData) => {
      fiData?.docs?.forEach((fiDoc) => {
        if (fileDetails?.data[fiDoc?.fileStoreId]) fiDoc.url = fileDetails?.data[fiDoc?.fileStoreId]?.split(",")[0];
      });
    });

    function ConvertEpochToValidityDate(dateEpoch) {
      if (dateEpoch == null || dateEpoch == undefined || dateEpoch == "") {
        return "NA";
      }
      const dateFromApi = new Date(dateEpoch);
      let month = dateFromApi.getMonth() + 1;
      let day = dateFromApi.getDate();
      let year = dateFromApi.getFullYear() - 3;
      month = (month > 9 ? "" : "0") + month;
      day = (day > 9 ? "" : "0") + day;
      return `${day}/${month}/${year}`;
    }

    const nocDetails = noc?.map((nocDetails, index) => ({
      title: index === 0 ? "BPA_NOC_DETAILS_SUMMARY" : "",
      values: [
        {
          title: `BPA_${nocDetails?.nocType}_LABEL`,
          value: nocDetails?.applicationNo,
          isNotTranslated: true,
        },
        {
          title: `BPA_NOC_STATUS`,
          value: nocDetails?.applicationStatus,
          field: "STATUS",
        },
        nocDetails?.additionalDetails?.SubmittedOn && {
          title: "BPA_SUDMITTED_ON_LABEL",
          value: nocDetails?.additionalDetails?.SubmittedOn
            ? format(new Date(Number(nocDetails?.additionalDetails?.SubmittedOn)), "dd/MM/yyyy")
            : "NA",
          isNotTranslated: true,
        },
        nocDetails?.nocNo && {
          title: "BPA_APPROVAL_NUMBER_LABEL",
          value: nocDetails?.nocNo || "NA",
          isNotTranslated: true,
        },
        nocDetails?.nocNo && {
          title: "BPA_APPROVED_REJECTED_ON_LABEL",
          value:
            nocDetails?.applicationStatus === "APPROVED" ||
              nocDetails?.applicationStatus === "REJECTED" ||
              nocDetails?.applicationStatus === "AUTO_APPROVED" ||
              nocDetails?.applicationStatus === "AUTO_REJECTED"
              ? format(new Date(Number(nocDetails?.auditDetails?.lastModifiedTime)), "dd/MM/yyyy")
              : "NA",
          isNotTranslated: true,
        },
      ],
      additionalDetails: {
        data: nocDetails,
        noc: [
          {
            title: "BPA_DOCUMENT_DETAILS_LABEL",
            values: nocDetails?.documents?.map((doc) => ({
              title: doc?.documentType?.replaceAll(".", "_"),
              documentType: doc?.documentType,
              documentUid: doc?.documentUid,
              fileStoreId: doc?.fileStoreId,
              id: doc?.id,
              url: fileDetails?.data?.[doc?.fileStoreId] ? fileDetails?.data?.[doc?.fileStoreId]?.split(",")[0] : "",
            })),
          },
        ],
      },
    }));
    let inspectionReport = [];
    let checklist = [];
    // BPA?.additionalDetails?.fieldinspection_pending
    //   ?.filter((ob) => ob.docs && ob.docs.length > 0)
    //   .map((ob, ind) => {
    //     checklist = [];
    //     inspectionReport.push({
    //       title: "BPA_FI_REPORT",
    //       asSectionHeader: true,
    //       values: [
    //         {
    //           title: "BPA_FI_DATE_LABEL",
    //           value: ob.date.includes("-") ? `${ob.date?.split("-")[2]}/${ob.date?.split("-")[1]}/${ob.date?.split("-")[0]}` : ob.date,
    //         },
    //         { title: "BPA_FI_TIME_LABEL", value: ob.time },
    //       ],
    //     });
    //     ob?.questions?.map((q, index) => {
    //       checklist.push({ title: q.question, value: q.value });
    //       checklist.push({ title: "BPA_ENTER_REMARKS", value: q.remarks });
    //     });
    //     inspectionReport.push({
    //       title: "BPA_CHECK_LIST_DETAILS",
    //       asSectionHeader: true,
    //       values: checklist,
    //     });
    //     inspectionReport.push({
    //       title: "BPA_DOCUMENT_DETAILS_LABEL",
    //       asSectionHeader: true,
    //       additionalDetails: {
    //         obpsDocuments: [
    //           {
    //             title: "",
    //             values: ob?.docs?.map((doc) => ({
    //               title: doc?.documentType?.replaceAll(".", "_"),
    //               documentType: doc?.documentType,
    //               documentUid: doc?.fileStore,
    //               fileStoreId: doc?.fileStoreId,
    //               id: doc?.id,
    //               url: fileDetails?.data?.[doc?.fileStoreId] ? fileDetails?.data?.[doc?.fileStoreId]?.split(",")[0] : "",
    //             })),
    //           },
    //         ],
    //       },
    //     });
    //   });

    let details = [];

    let applicationDetailsInfo = {
      title: " ",
      isCommon: true,
      values: [{ title: "BPA_APPLICATION_NUMBER_LABEL", value: BPA?.applicationNo || "NA" }],
    };

    let envCitizenName = window.location.href.includes("/employee") ? "employee" : "citizen";

    if (BPA?.businessService.includes("BPA_OC")) {
      applicationDetailsInfo["values"] = [
        ...applicationDetailsInfo?.values,
        {
          title: "BPA_PERMIT_APP_NUMBER",
          to: `/digit-ui/${envCitizenName}/obps/bpa/${bpaResponse?.BPA?.[0]?.applicationNo}`,
          value: bpaResponse?.BPA?.[0]?.approvalNo,
          isLink: true,
        },
      ];
      applicationDetailsInfo["values"] = [
        ...applicationDetailsInfo?.values,
        {
          title: "BPA_PERMIT_VALIDITY",
          value: bpaResponse?.BPA?.[0]?.additionalDetails?.validityDate
            ? `${ConvertEpochToValidityDate(bpaResponse?.BPA?.[0]?.additionalDetails?.validityDate)} - ${format(
              new Date(bpaResponse?.BPA?.[0]?.additionalDetails?.validityDate),
              "dd/MM/yyyy"
            )}`
            : "NA",
        },
      ];
    }

    let permitcondn = [];
    BPA?.additionalDetails?.pendingapproval &&
      BPA?.additionalDetails?.pendingapproval.length > 0 &&
      BPA?.additionalDetails?.pendingapproval.map((ob, index) => {
        permitcondn.push({ title: `${index + 1}. ${ob}`, value: "" });
      });

    let PermitConditions = {
      title: "BPA_PERMIT_CONDITIONS",
      isTitleVisible: permitcondn?.length > 0 ? false : true,
      isNotAllowed: permitcondn?.length > 0 ? false : true,
      additionalDetails: {
        inspectionReport: [],
        permit: [...permitcondn],
      },
    };

    if (permitcondn.length == 0) PermitConditions = {};
    if (riskType == "LOW" && permitcondn.length > 0) {
      permitcondn = [];
      PermitConditions = {};
    }

    if (BPA?.approvalNo) {
      applicationDetailsInfo?.values?.push({
        title: BPA?.businessService !== "BPA_OC" ? "BPA_PERMIT_NUMBER_LABEL" : "BPA_OC_PERMIT_NUMBER_LABEL",
        value: BPA?.approvalNo || "NA",
      });
      applicationDetailsInfo?.values?.push({
        title: BPA?.businessService !== "BPA_OC" ? "BPA_PERMIT_VALIDITY" : "BPA_OC_PERMIT_VALIDITY",
        value: BPA?.additionalDetails?.validityDate
          ? `${ConvertEpochToValidityDate(BPA?.additionalDetails?.validityDate)} - ${format(
            new Date(BPA?.additionalDetails?.validityDate),
            "dd/MM/yyyy"
          )}`
          : "NA",
      });
    }

    console.log("Log 5");

    const basicDetails = {
      title: "BPA_BASIC_DETAILS_TITLE",
      asSectionHeader: true,
      isInsert: true,
      isCommon: true,
      values: [
        {
          title: "BPA_BASIC_DETAILS_APP_DATE_LABEL",
          value: BPA?.auditDetails?.createdTime ? format(new Date(BPA?.auditDetails?.createdTime), "dd/MM/yyyy") : "",
        },
        { title: "BPA_BASIC_DETAILS_APPLICATION_TYPE_LABEL", value: `WF_BPA_${edcr?.appliactionType}` },
        { title: "BPA_BASIC_DETAILS_SERVICE_TYPE_LABEL", value: edcr?.applicationSubType },
        { title: "BPA_BASIC_DETAILS_OCCUPANCY_LABEL", value: edcr?.planDetail?.planInformation?.occupancy },
        { title: "BPA_BASIC_DETAILS_RISK_TYPE_LABEL", value: `${BPA?.additionalDetails?.riskType}`, isInsert: true },
        { title: "BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL", value: edcr?.planDetail?.planInformation?.applicantName },
      ],
    };

    const plotDetails = {
      title: "BPA_PLOT_AND_SITE_DETAILS_TITLE",
      asSectionHeader: true,
      isCommon: true,
      values: [
        {
          title: "BPA_BOUNDARY_PLOT_AREA_LABEL",
          value: `${edcr?.planDetail?.planInformation?.plotArea}`,
          isNotTranslated: true,
          isUnit: "BPA_SQ_MTRS_LABEL",
        },
        { title: "BPA_PLOT_NUMBER_LABEL", value: edcr?.planDetail?.planInformation?.plotNo || "NA", isNotTranslated: true },
        { title: "BPA_KHATHA_NUMBER_LABEL", value: edcr?.planDetail?.planInformation?.khatuniNo || "NA", isNotTranslated: true },
        // { title: "BPA_HOLDING_NUMBER_LABEL", value: BPA?.additionalDetails?.holdingNo || "NA", isNotTranslated: true },
        { title: "BPA_IS_PROPERTY_AVAILABLE_LABEL", value: BPA?.additionalDetails?.isPropertyAvailable ? "YES" : "NO", isNotTranslated: true },
        ...(BPA?.additionalDetails?.propertyuid ? [{ title: "PROPERTY_ID", value: BPA?.additionalDetails?.propertyuid || "NA", isNotTranslated: true }] : []),
        { title: "BPA_IS_CLUBBED_PLOT_LABEL", value: BPA?.additionalDetails?.isClubbedPlot ? "YES" : "NO", isNotTranslated: true },
        ...(BPA?.additionalDetails?.isSelfCertification != null ? [{ title: "BPA_IS_SELF_CERTIFICATION_REQUIRED", value: BPA?.additionalDetails?.isSelfCertification? "YES" : "NO" , isNotTranslated: true }] : []),
        { title: "BPA_BOUNDARY_LAND_REG_DETAIL_LABEL", value: BPA?.additionalDetails?.registrationDetails || "NA", isNotTranslated: true },
        { title: "BPA_BOUNDARY_WALL_LENGTH_LABEL", value: BPA?.additionalDetails?.boundaryWallLength || "NA", isNotTranslated: true },
        { title: ("BPA_DETAILS_PIN_LABEL"), value: BPA?.landInfo?.address?.pincode },
        { title: ("BPA_CITY_LABEL"), value: BPA?.landInfo?.address?.city },
        { title: ("BPA_LOC_MOHALLA_LABEL"), value: BPA?.landInfo?.address?.locality?.name },
        { title: ("BPA_LAT"), value: BPA?.landInfo?.address?.geoLocation?.latitude ? BPA?.landInfo?.address?.geoLocation?.latitude?.toFixed(6)?.toString() : "NA" },
        { title: ("BPA_LONG"), value: BPA?.landInfo?.address?.geoLocation?.longitude ? BPA?.landInfo?.address?.geoLocation?.longitude?.toFixed(6)?.toString() : "NA" },
        { title: "BPA_WARD_NUMBER_LABEL", value: BPA?.additionalDetails?.wardnumber || "NA", isNotTranslated: true },
        { title: "BPA_ZONE_NUMBER_LABEL", value: BPA?.additionalDetails?.zonenumber?.name || BPA?.additionalDetails?.zonenumber || "NA", isNotTranslated: true },
        { title: "BPA_KHASRA_NUMBER_LABEL", value: BPA?.additionalDetails?.khasraNumber || "NA", isNotTranslated: true },
        { title: "BPA_ARCHITECT_ID", value: BPA?.additionalDetails?.architectid || "NA", isNotTranslated: true },
        { title: "BPA_NUMBER_OF_BATHS", value: BPA?.additionalDetails?.bathnumber || "NA", isNotTranslated: true },
        { title: "BPA_NUMBER_OF_KITCHENS", value: BPA?.additionalDetails?.kitchenNumber || "NA", isNotTranslated: true },
        { title: "BPA_APPROX_INHABITANTS_FOR_ACCOMODATION", value: BPA?.additionalDetails?.approxinhabitants || "NA", isNotTranslated: true },
        { title: "BPA_DISTANCE_FROM_SEWER", value: BPA?.additionalDetails?.distancefromsewer || "NA", isNotTranslated: true },
        { title: "BPA_SOURCE_OF_WATER", value: BPA?.additionalDetails?.sourceofwater || "NA", isNotTranslated: true },
        { title: "BPA_NUMBER_OF_WATER_CLOSETS", value: BPA?.additionalDetails?.watercloset || "NA", isNotTranslated: true },
        { title: "BPA_MATERIAL_TO-BE_USED_IN_WALLS", value: BPA?.additionalDetails?.materialused || "NA", isNotTranslated: true },
        { title: "BPA_MATERIAL_TO-BE_USED_IN_FLOOR", value: BPA?.additionalDetails?.materialusedinfloor || "NA", isNotTranslated: true },
        { title: "BPA_MATERIAL_TO-BE_USED_IN_ROOFS", value: BPA?.additionalDetails?.materialusedinroofs || "NA", isNotTranslated: true },
        { title: "BPA_ESTIMATED_COST_LABEL", value: BPA?.additionalDetails?.estimatedCost || "NA", isNotTranslated: true },
      ],
    };
    const [y1, m1, d1] = BPA?.additionalDetails?.nocObject?.approvedOn?.split("-") || [];
    const nocApprovedDate = `${d1}/${m1}/${y1}`;
    const additionalDetail = {
      title: "BPA_ADDITIONAL_BUILDING_DETAILS",
      asSectionHeader: true,
      isCommon: true,
      values: [
        { title: "BPA_ULB_NAME", value: BPA?.additionalDetails?.UlbName || "NA", isNotTranslated: true },
        { title: "BPA_ULB_TYPE", value: BPA?.additionalDetails?.Ulblisttype || "NA", isNotTranslated: true },
        { title: "BPA_APPROVED_COLONY", value: BPA?.additionalDetails?.approvedColony || "NA", isNotTranslated: true },
        ...(BPA?.additionalDetails?.approvedColony === "YES"
          ? [{ title: "BPA_APPROVED_COLONY_NAME", value: BPA?.additionalDetails?.nameofApprovedcolony || "NA", isNotTranslated: true }]
          : []),
        ...(BPA?.additionalDetails?.approvedColony === "NO"
          ? [
            { title: "BPA_NOC_NUMBER", value: BPA?.additionalDetails?.NocNumber || "NA", isNotTranslated: true },
            { title: "BPA_NOC_APPLICANT_NAME", value: BPA?.additionalDetails?.nocObject?.applicantOwnerOrFirmName || "NA", isNotTranslated: true },
            { title: "BPA_NOC_ULB_NAME", value: BPA?.additionalDetails?.nocObject?.ulbName || "NA", isNotTranslated: true },
            { title: "BPA_NOC_ULB_TYPE", value: BPA?.additionalDetails?.nocObject?.ulbType || "NA", isNotTranslated: true },
            { title: "BPA_NOC_APPROVED_ON", value: nocApprovedDate || "NA", isNotTranslated: true },
          ]
          : []),
        // { title: "BPA_NOC_NUMBER", value: BPA?.additionalDetails?.NocNumber || "NA", isNotTranslated: true },
        { title: "BPA_MASTER_PLAN", value: BPA?.additionalDetails?.masterPlan || "NA", isNotTranslated: true },
        ...(BPA?.additionalDetails?.masterPlan === "YES"
          ? [{ title: "BPA_USE", value: BPA?.additionalDetails?.use || "NA", isNotTranslated: true }]
          : []),
        { title: "BPA_PURCHASED_FAR", value: BPA?.additionalDetails?.purchasedFAR ? "YES" : "NO", isNotTranslated: true },
        ...(BPA?.additionalDetails?.purchasedFAR
          ? [
            { title: "BPA_PROVIDED_FAR", value: BPA?.additionalDetails?.providedFAR || "NA", isNotTranslated: true },
            { title: "BPA_ALLOWED_PROVIDED_FAR", value: BPA?.additionalDetails?.purchasableFAR || "NA", isNotTranslated: true },
          ]
          : []),
        { title: "BPA_PERMISSIBLE_FAR", value: BPA?.additionalDetails?.permissableFar || "NA", isNotTranslated: true },
        { title: "BPA_FAR_ACHIEVED", value: BPA?.additionalDetails?.achievedFar || "NA", isNotTranslated: true },
        { title: "BPA_ECS_REQUIRED", value: BPA?.additionalDetails?.ecsRequired || "NA", isNotTranslated: true },
        { title: "BPA_ECS_PROVIDED", value: BPA?.additionalDetails?.ecsProvided || "NA", isNotTranslated: true },
        { title: "BPA_GREEN_BUIDINGS", value: BPA?.additionalDetails?.greenbuilding || "NA", isNotTranslated: true },
        ...(BPA?.additionalDetails?.greenbuilding === "YES"
          ? [{ title: "BPA_SELECTED_RATINGS", value: BPA?.additionalDetails?.rating || "NA", isNotTranslated: true }]
          : []),
        { title: "BPA_RESTRICTED_AREA", value: BPA?.additionalDetails?.restrictedArea || "NA", isNotTranslated: true },
        { title: "BPA_PROPOSED_SITE_TYPE", value: BPA?.additionalDetails?.proposedSite || "NA", isNotTranslated: true },
        { title: "ECBC - Proposed Connected Electrical Load is above 100 Kw", value: BPA?.additionalDetails?.ecbcElectricalLoad || "NA", isNotTranslated: true },
        { title: "ECBC - Proposed Demand of Electrical Load is above 120 Kw", value: BPA?.additionalDetails?.ecbcDemandLoad || "NA", isNotTranslated: true },
        { title: "ECBC - Proposed Air Conditioned Area above 500 sq.mt", value: BPA?.additionalDetails?.ecbcAirConditioned || "NA", isNotTranslated: true },
        
      ],
    };

    const scrutinyDetails = {
      title: "BPA_STEPPER_SCRUTINY_DETAILS_HEADER",
      isScrutinyDetails: true,
      isBackGroundColor: true,
      additionalDetails: {
        values: [
          { title: "BPA_EDCR_DETAILS", value: " ", isHeader: true },
          { title: BPA?.businessService !== "BPA_OC" ? "BPA_EDCR_NO_LABEL" : "BPA_OC_EDCR_NO_LABEL", value: BPA?.edcrNumber || "NA" },
        ],
        scruntinyDetails: [
          { title: "BPA_UPLOADED_PLAN_DIAGRAM", value: edcr?.updatedDxfFile, text: "BPA_UPLOADED_PLAN_DXF" },
          { title: "BPA_SCRUNTINY_REPORT_OUTPUT", value: edcr?.planReport, text: "BPA_SCRUTINY_REPORT_PDF" },
        ],
      },
    };

    console.log("Log 4");

    const buildingExtractionDetails = {
      title: "",
      isScrutinyDetails: true,
      isBackGroundColor: true,
      additionalDetails: {
        values: [
          {
            title: BPA?.businessService !== "BPA_OC" ? "BPA_BUILDING_EXTRACT_HEADER" : "BPA_ACTUAL_BUILDING_EXTRACT_HEADER",
            value: " ",
            isHeader: true,
          },
          { title: "BPA_TOTAL_BUILT_UP_AREA_HEADER", value: Number(edcr?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea).toFixed(2), isUnit: "BPA_SQ_MTRS_LABEL" },
          { title: "BPA_SCRUTINY_DETAILS_NUMBER_OF_FLOORS_LABEL", value: edcr?.planDetail?.blocks?.[0]?.building?.totalFloors || "NA" },
          { title: "BPA_HEIGHT_FROM_GROUND_LEVEL", value: Number(edcr?.planDetail?.blocks?.[0]?.building?.buildingHeight).toFixed(2), isUnit: "BPA_MTRS_LABEL" },
        ],
        scruntinyDetails: [],
      },
    };

    const demolitionAreaDetails = {
      title: "",
      isScrutinyDetails: true,
      isBackGroundColor: true,
      additionalDetails: {
        values: [
          { title: "BPA_APP_DETAILS_DEMOLITION_DETAILS_LABEL", value: " ", isHeader: true },
          { title: "BPA_APPLICATION_DEMOLITION_AREA_LABEL", value: edcr?.planDetail?.planInformation?.demolitionArea, isUnit: "BPA_SQ_MTRS_LABEL" },
        ],
        scruntinyDetails: [],
      },
    };

    const subOccupancyTableDetails = {
      title: "",
      isSubOccupancyTable: true,
      isTitleRepeat: true,
      additionalDetails: {
        values: [{ title: "BPA_OCC_SUBOCC_HEADER", value: " ", isHeader: true }],
        subOccupancyTableDetails: [
          { title: "BPA_APPLICATION_DEMOLITION_AREA_LABEL", value: edcr },
          { title: "NO_REPEAT", value: "" },
        ],
      },
    };

    console.log("Log 3");

    const addressDetails = {
      title: "BPA_NEW_TRADE_DETAILS_HEADER_DETAILS",
      asSectionHeader: true,
      isCommon: true,
      values: [
        
        // { title: ("BPA_DETAILS_SRT_NAME_LABEL"), value: BPA?.landInfo?.address?.street },
        // { title: ("ES_NEW_APPLICATION_LOCATION_LANDMARK"), value: BPA?.landInfo?.address?.landmark },
      ],
    };

    const checkOwnerLength = BPA?.landInfo?.owners?.length || 1;
    if (BPA?.landInfo?.owners?.length > 0) {
      // BPA?.landInfo?.owners.sort((a, b) => b.isPrimaryOwner - a.isPrimaryOwner);
      BPA?.landInfo?.owners?.forEach((ownerD) => {
        if (!ownerD.isPrimaryOwner) ownerD.isPrimaryOwner = "false";
      });
    }
    const ownerDetails = {
      title: "BPA_APPLICANT_DETAILS_HEADER",
      isOwnerDetails: true,
      additionalDetails: {
        owners: BPA?.landInfo?.owners?.map((owner, index) => {
          return {
            title: Number(checkOwnerLength) > 1 ? "COMMON_OWNER" : "",
            values: [
              { title: "CORE_COMMON_NAME", value: owner?.name },
              { title: "BPA_APPLICANT_GENDER_LABEL", value: owner?.gender },
              { title: "CORE_COMMON_MOBILE_NUMBER", value: owner?.mobileNumber },
              { title: "CORE_COMMON_EMAIL_ID", value: owner?.emailId },
              { title: "BPA_APPLICANT_ADDRESS_LABEL", value: owner?.permanentAddress || "Not Provided" },
              { title: "BPA_IS_PRIMARY_OWNER_LABEL", value: owner?.isPrimaryOwner === true ? "Yes" : "No", isNotTranslated: false },
            ],
          };
        }),
      },
    };

    const documentDetails = {
      title: "BPA_DOCUMENT_DETAILS_LABEL",
      asSectionHeader: true,
      isDocumentDetails: true,
      additionalDetails: {
        obpsDocuments: [
          {
            title: "",
            values: BPA?.documents?.map((doc) => ({
              title: doc?.documentType?.replaceAll(".", "_"),
              documentType: doc?.documentType,
              documentUid: doc?.documentUid,
              fileStoreId: doc?.fileStoreId,
              id: doc?.id,
              url: fileDetails?.data?.[doc?.fileStoreId] ? fileDetails?.data?.[doc?.fileStoreId]?.split(",")[0] : "",
            })),
          },
        ],
      },
    };

    console.log("Log 2");

    let approvalChecks = [];
    let approvalChecksDetails = {};
    if (BPA?.status === "APPROVAL_INPROGRESS") {
      // mdmsRes?.BPA?.CheckList.forEach((checklist) => {
      //   if (
      //     checklist?.RiskType === riskType &&
      //     checklist?.applicationType === edcr?.appliactionType &&
      //     checklist?.ServiceType === edcr?.applicationSubType &&
      //     checklist?.WFState === "PENDINGAPPROVAL" &&
      //     checklist?.conditions?.length > 0
      //   ) {
      //     approvalChecks.push(...checklist?.conditions);
      //   }
      // });

      mdmsRes?.BPA?.CheckList?.forEach((checklist) => {
        if (
          checklist?.RiskType === riskType &&
          checklist?.applicationType === edcr?.applicationType && // also fixed typo here
          checklist?.ServiceType === edcr?.applicationSubType &&
          checklist?.WFState === "PENDINGAPPROVAL" &&
          checklist?.conditions?.length > 0
        ) {
          approvalChecks.push(...checklist?.conditions);
        }
      });


      approvalChecksDetails = {
        title: "", //window.location.href.includes("/employee") ? "" : "BPA_PERMIT_CONDITIONS",
        isTitleVisible: approvalChecks?.length > 0 ? false : true,
        asSectionHeader: true,
        isPermissions: true,
        additionalDetails: {
          permissions: approvalChecks,
        },
      };
    }

    if (riskType == "LOW" && approvalChecks.length > 0) approvalChecksDetails = {};

    console.log("Log 1")
    // if(inspectionReport) details.push(inspectionReport);\
    let val;
    var i;
    let FieldInspectionData = [];
    // inspectionReport &&
    //   BPA?.additionalDetails?.fieldinspection_pending?.[0]?.questions.length > 0 &&
    //   inspectionReport.map((ob, index) => {
    //     if (ob.title.includes("FI_REPORT"))
    //       FieldInspectionData = [...FieldInspectionData, { title: ob.title, additionalDetails: { inspectionReport: [], values: ob.values } }];
    //     else if (ob.title.includes("CHECK_LIST"))
    //       FieldInspectionData = [
    //         ...FieldInspectionData,
    //         { title: ob.title, additionalDetails: { isChecklist: true, inspectionReport: [], values: ob.values } },
    //       ];
    //     else {
    //       let improvedDoc = [...ob.additionalDetails.obpsDocuments?.[0]?.values];
    //       improvedDoc.map((ob) => {
    //         ob["isNotDuplicate"] = true;
    //       });
    //       improvedDoc.map((ob, index) => {
    //         val = ob.documentType;
    //         if (ob.isNotDuplicate == true)
    //           for (i = index + 1; i < improvedDoc.length; i++) {
    //             if (val === improvedDoc[i].documentType) improvedDoc[i].isNotDuplicate = false;
    //           }
    //       });
    //       FieldInspectionData = [
    //         ...FieldInspectionData,
    //         { title: ob.title, additionalDetails: { FIdocuments: [], documents: [{ values: improvedDoc }] } },
    //       ];
    //     }
    //   });

    const fiReports = {
      title: "BPA_FI_REPORT",
      isFieldInspection: true,
      // isNotAllowed: BPA?.additionalDetails?.fieldinspection_pending?.length > 0 ? false : true,
      additionalDetails: {
        values: [],
        // fiReport: BPA?.additionalDetails?.fieldinspection_pending?.length > 0 ? true : false,
      },
    };

    if (BPA?.businessService !== "BPA_OC") {
      details = [
        ...details,
        applicationDetailsInfo,
        ownerDetails,
        basicDetails,
        plotDetails,
        // addressDetails,
        scrutinyDetails,
        buildingExtractionDetails,
        subOccupancyTableDetails,
        demolitionAreaDetails,
        additionalDetail,
        documentDetails,
        fiReports,
        ...nocDetails,
        approvalChecksDetails,
        PermitConditions,
      ];
    } else {
      details = [
        ...details,
        applicationDetailsInfo,
        basicDetails,
        plotDetails,
        scrutinyDetails,
        buildingExtractionDetails,
        subOccupancyTableDetails,
        demolitionAreaDetails,
        documentDetails,
        fiReports,
        ...nocDetails,
        PermitConditions,
      ];
    }

    if (billDetails?.additionalDetails?.values?.length) {
      details.push(billDetails);
    }

    let bpaFilterDetails = details?.filter((data) => data);

    console.log("ServiceLOG", {
      applicationData: BPA,
      applicationDetails: bpaFilterDetails,
      tenantId: BPA?.tenantId,
      edcrDetails: edcr,
      nocData: noc,
      comparisionReport: comparisionReport?.comparisonDetail,
      businessService: BPA?.businessService,
      applicationNo: BPA?.applicationNo,
      applicationStatus: BPA?.status,
      collectionBillDetails: collectionBillDetails,
    })

    return {
      applicationData: BPA,
      applicationDetails: bpaFilterDetails,
      tenantId: BPA?.tenantId,
      edcrDetails: edcr,
      nocData: noc,
      comparisionReport: comparisionReport?.comparisonDetail,
      businessService: BPA?.businessService,
      applicationNo: BPA?.applicationNo,
      applicationStatus: BPA?.status,
      collectionBillDetails: collectionBillDetails,
    };
  },
  paymentsearch: ({ tenantId, filters, auth }) =>
    Request({
      url: Urls.obps.payment_search,
      useCache: false,
      method: "POST",
      auth: auth === false ? auth : true,
      userService: auth === false ? auth : true,
      params: { tenantId, ...filters },
    }),
  bpaCalculate: async (data) =>
    Request({
      url: Urls.obps.bpaCalculator,
      useCache: false,
      method: "POST",
      auth: false,
      userService: false,
      data: data,
    })
};
