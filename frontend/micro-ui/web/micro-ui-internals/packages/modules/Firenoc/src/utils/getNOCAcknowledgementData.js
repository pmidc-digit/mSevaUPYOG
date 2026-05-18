import React from "react";
import {pdfDownloadLink, pdfDocumentName} from "./index"
import {Loader} from "@mseva/digit-ui-react-components";
import EXIF from "exif-js";

const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1);
const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ");

const na = (v) => (v == null || v === "" ? "NA" : String(v));

const formatEpochDate = (epoch) => {
  if (!epoch) return "NA";
  return Digit.DateUtils.ConvertTimestampToDate(epoch, "dd/MM/yyyy") || "NA";
};

const row = (title, value) => ({ title, value: na(value) });

const section = (title, values) => ({
  title,
  values: values.filter(Boolean),
});

const getFloorLabel = (index, t) => {
  if (index === 0) return t("NOC_GROUND_FLOOR_AREA_LABEL");

  const floorNumber = index;
  const lastDigit = floorNumber % 10;
  const lastTwoDigits = floorNumber % 100;

  let suffix = "th";
  if (lastTwoDigits < 11 || lastTwoDigits > 13) {
    if (lastDigit === 1) suffix = "st";
    else if (lastDigit === 2) suffix = "nd";
    else if (lastDigit === 3) suffix = "rd";
  }
  return `${floorNumber}${suffix} ${t("NOC_FLOOR_AREA_LABEL")}`;
};

const getRegistrationDetails = (appData, t) => {
  let values = [
    {
      title: t("CS_APPLICATION_NUMBER"),
      value: appData?.applicationNumber || "N/A",
    },
    {
      title: t("REGISTRATION_FILED_DATE"),
      value: Digit.DateUtils.ConvertTimestampToDate(appData?.auditDetails?.createdTime, "dd/MM/yyyy") || "NA"
    },
    {
      title: t("CS_APPLICATION_NUMBER"),
      value: appData?.applicationNumber || "N/A",
    },
  ];

  return {
    title: t("CS_APPLICATION_DETAILS"),
    values: values,
  };
};

/** Matches overview: Application Summary card */
const getApplicationSummarySection = (fireNOC, t) => {
  const d = fireNOC?.fireNOCDetails || {};
  return section(t("NOC_APPLICATION_SUMMARY"), [
    row(t("NOC_APPLICATION_NUMBER"), d.applicationNumber),
    row(t("NOC_FIRENOC_NUMBER"), fireNOC?.fireNOCNumber),
    row(t("NOC_APPLICATION_STATUS"), d.status),
    row(t("NOC_FIRENOC_TYPE"), d.fireNOCType),
    row(t("NOC_FIRESTATION_ID"), d.firestationId),
    row(t("NOC_APPLICATION_DATE"), formatEpochDate(d.applicationDate)),
    d.issuedDate && row(t("NOC_ISSUED_DATE"), formatEpochDate(d.issuedDate)),
    d.validTo && row(t("NOC_VALID_TILL"), formatEpochDate(d.validTo)),
  ]);
};

/** Matches overview: Applicant Details card */
const getApplicantSection = (fireNOC, t) => {
  const d = fireNOC?.fireNOCDetails || {};
  const owners = d?.applicantDetails?.owners || [];
  const ownership = d?.applicantDetails?.ownerShipType?.replace?.("INDIVIDUAL.", "") || d?.applicantDetails?.ownerShipType;

  if (owners.length === 0) {
    return section(t("NOC_APPLICANT_DETAILS"), [
      row(t("PT_OWNERSHIP_TYPE"), ownership),
    ]);
  }

  return owners?.map((owner, index) =>
    section(
      index === 0 ? t("NOC_APPLICANT_DETAILS") : `${t("NOC_APPLICANT_DETAILS")} - ${index + 1}`,
      [
        row(t("NOC_OWNER_NAME"), owner?.name),
        row(t("NOC_MOBILE_NUMBER"), owner?.mobileNumber),
        index === 0 && row(t("PT_OWNERSHIP_TYPE"), ownership),
        owner?.emailId && row(t("NOC_APPLICANT_EMAIL_LABEL"), owner.emailId),
        owner?.fatherOrHusbandName && row(t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL"), owner.fatherOrHusbandName),
        owner?.correspondenceAddress && row(t("NOC_APPLICANT_ADDRESS_LABEL"), owner.correspondenceAddress),
      ].filter(Boolean)
    )
  );
};

/** Matches overview: Site / Property card */
const getPropertyLocationSection = (fireNOC, t) => {
  const address = fireNOC?.fireNOCDetails?.propertyDetails?.address || {};
  return section(t("NOC_SITE_DETAILS"), [
    row(t("NOC_CITY"), address?.city || address?.tenantId),
    row(t("NOC_AREA_TYPE"), address?.areaType),
    row(t("NOC_LOCALITY"), address?.locality?.name || address?.locality?.code),
    address?.doorNo && row(t("NOC_DOOR_NO"), address?.doorNo),
    address?.buildingName && row(t("NOC_BUILDING_NAME"), address?.buildingName),
    address?.street && row(t("NOC_STREET"), address?.street),
    address?.pincode && row(t("NOC_PINCODE"), address?.pincode),
  ]);
};

/** Matches overview: Building Details card */
const getBuildingSection = (fireNOC, t) => {
  const building = fireNOC?.fireNOCDetails?.buildings?.[0];
  if (!building) return null;

  const uomMap = {};
  (building.uoms || [])
    ?.filter((u) => u.active !== false)
    ?.forEach((u) => {
      uomMap[u?.code] = u?.value;
    });

  const values = [
    row(t("NOC_BUILDING_NAME"), building?.name),
    row(t("NOC_USAGE_TYPE"), building?.usageType),
    row(t("NOC_USAGE_SUB_TYPE"), building?.usageSubType),
    uomMap?.NO_OF_FLOORS !== undefined && row(t("NOC_NO_OF_FLOORS"), uomMap?.NO_OF_FLOORS),
    uomMap?.HEIGHT_OF_BUILDING !== undefined &&
      row(t("NOC_HEIGHT_OF_BUILDING"), `${uomMap?.HEIGHT_OF_BUILDING} m`),
    uomMap?.NO_OF_BASEMENTS !== undefined && row(t("NOC_NO_OF_BASEMENTS"), uomMap?.NO_OF_BASEMENTS),
    uomMap?.BUILTUP_AREA !== undefined && row(t("NOC_BUILTUP_AREA"), uomMap?.BUILTUP_AREA),
    building?.landArea && row(t("NOC_PLOT_AREA"), `${building?.landArea} sq.m`),
    building?.totalCoveredArea && row(t("NOC_COVERED_AREA"), `${building?.totalCoveredArea} sq.m`),
  ].filter(Boolean);

  return section(t("NOC_BUILDING_DETAILS"), values);
};

const getPaymentSection = (payment, t) => {
  if (!payment) return null;
  const paymentDetail = payment?.paymentDetails?.[0];
  return section(t("NOC_PAYMENT_DETAILS"), [
    row(t("PAYMENT_AMOUNT_PAID"), `₹ ${payment.totalAmountPaid?.toLocaleString("en-IN") || "NA"}`),
    row(t("PAYMENT_MODE"), payment.paymentMode),
    row(t("PAYMENT_RECEIPT_NUMBER"), paymentDetail?.receiptNumber),
    row(t("PAYMENT_TRANSACTION_DATE"), formatEpochDate(payment?.transactionDate)),
  ]);
};

const getDocumentsSection = (fireNOC, t) => {
  const docs = fireNOC?.fireNOCDetails?.additionalDetail?.documents || [];
  if (!docs.length) {
    return section(t("NOC_DOCUMENTS"), [{ title: t("PT_NO_DOCUMENTS"), value: "NA" }]);
  }

  return section(
    t("NOC_DOCUMENTS"),
    docs?.map((doc, idx) => ({
      title: doc?.title?.replace(/_/g, " ") || doc?.name || `${t("NOC_DOCUMENT")} ${idx + 1}`,
      value: doc?.name || " ",
      link: doc?.link || undefined,
    }))
  );
};

const getUploadedDocumentsSection = async (fireNOC, t) => {
  const filteredDocs =
    fireNOC?.documents?.filter(
      (doc) =>
        doc?.documentType !== "OWNER.SITEPHOTOGRAPHONE" &&
        doc?.documentType !== "OWNER.SITEPHOTOGRAPHTWO"
    ) || [];

  if (!filteredDocs.length) return null;

  const sortedDocs = [...filteredDocs]?.sort((a, b) => (a?.order || 0) - (b?.order || 0));
  const filesArray = sortedDocs?.map((d) => d?.uuid);
  const res =
    filesArray.length > 0 &&
    (await Digit.UploadServices.Filefetch(filesArray, Digit.ULBService.getStateId()));

  return section(
    t("BPA_TITILE_DOCUMENT_UPLOADED"),
    sortedDocs?.map((document, index) => ({
      title: `${index + 1}. ${t(document?.documentType?.replace(/\./g, "_")) || t("CS_NA")}`,
      value: " ",
      link: pdfDownloadLink(res?.data, document?.uuid) || "",
    }))
  );
};






export const getNOCAcknowledgementData = async (
  fireNOC,          
  tenantInfo,
  ulbType,
  ulbName,
  t,
  isView = false,
  checklistData = null,
  payment = null     
) => {
  const d = fireNOC?.fireNOCDetails || {};
  console.log('fireNOC, ulbType', fireNOC, ulbType)
  const tenantId = tenantInfo?.code || fireNOC?.tenantId;
  const applicationNumber = d.applicationNumber || fireNOC?.applicationNo || "NA";
  const applicationDate = formatEpochDate(d.applicationDate);

  const applicantSections = getApplicantSection(fireNOC, t);
  const applicantBlocks = Array.isArray(applicantSections) ? applicantSections : [applicantSections];

  const details = [
    getApplicationSummarySection(fireNOC, t),
    ...applicantBlocks,
    getPropertyLocationSection(fireNOC, t),
    getBuildingSection(fireNOC, t),
    getPaymentSection(payment, t),
    getDocumentsSection(fireNOC, t),
    await getUploadedDocumentsSection(fireNOC, t),
    ].filter(Boolean);

  const data = {
    t,
    tenantId,
    name: "NOC Application",
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("Application Confirmation Form"),
    applicationNumber,
    applicationDate,
    details,
    ulbType: ulbType || d?.propertyDetails?.address?.city,
    ulbName,
    logo: null,              
    qrCodeDataUrl: null,    
    imageURL: null,
  };

  if (isView) data.openInNewTab = true;
  return data;
};
