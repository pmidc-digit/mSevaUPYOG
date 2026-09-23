import { get } from "lodash";

// Convert epoch to DD/MM/YYYY format
const convertEpochToDate = (epoch) => {
  if (!epoch) return "";
  const date = new Date(epoch);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Process tax head and update tax variables
const processTaxHead = (ele, adjusted, total) => {
  if (ele.taxHeadCode == "PT_TAX") {
    adjusted.tax = ele.adjustedAmount;
    total.tax = ele.amount;
  }
  else if (ele.taxHeadCode == "PT_TIME_REBATE") {
    adjusted.rebate = ele.adjustedAmount;
    total.rebate = ele.amount;
  }
  else if (ele.taxHeadCode == "PT_CANCER_CESS") {
    adjusted.cancercess = ele.adjustedAmount;
    total.cancercess = ele.amount;
  }
  else if (ele.taxHeadCode == "PT_FIRE_CESS") {
    adjusted.firecess = ele.adjustedAmount;
    total.firecess = ele.amount;
  }
  else if (ele.taxHeadCode == "PT_TIME_INTEREST") {
    adjusted.interest = ele.adjustedAmount;
    total.interest = ele.amount;
  }
  else if (ele.taxHeadCode == "PT_TIME_PENALTY") {
    adjusted.penalty = ele.adjustedAmount;
    total.penalty = ele.amount;
  }
  else if (ele.taxHeadCode == "PT_OWNER_EXEMPTION") {
    adjusted.special_category_exemption = ele.adjustedAmount;
    total.special_category_exemption = ele.amount;
  }
  else if (ele.taxHeadCode == "PT_ROUNDOFF") {
    adjusted.roundoff = ele.adjustedAmount;
    total.roundoff = ele.amount;
  }
  else if (ele.taxHeadCode == "PT_UNIT_USAGE_EXEMPTION") {
    adjusted.usage_exemption = ele.adjustedAmount;
    total.usage_exemption = ele.amount;
  }
  else if (ele.taxHeadCode == "PT_ADHOC_PENALTY") {
    adjusted.adhoc_penalty = ele.adjustedAmount;
    total.adhoc_penalty = ele.amount;
  }
  else if (ele.taxHeadCode == "PT_ADHOC_REBATE") {
    adjusted.adhoc_rebate = ele.adjustedAmount;
    total.adhoc_rebate = ele.amount;
  }
};

// Initialize tax variables object
const initTaxVars = () => ({
  roundoff: 0,
  tax: 0,
  firecess: 0,
  cancercess: 0,
  penalty: 0,
  rebate: 0,
  interest: 0,
  usage_exemption: 0,
  special_category_exemption: 0,
  adhoc_penalty: 0,
  adhoc_rebate: 0
});

// Build arrear row for a single bill detail
const buildArrearRow = (element, assessmentYearForReceipt, adjusted) => ({
  "year": assessmentYearForReceipt,
  "tax": adjusted.tax,
  "firecess": adjusted.firecess,
  "cancercess": adjusted.cancercess,
  "penalty": adjusted.penalty,
  "rebate": adjusted.rebate,
  "interest": adjusted.interest,
  "usage_exemption": adjusted.usage_exemption,
  "special_category_exemption": adjusted.special_category_exemption,
  "adhoc_penalty": adjusted.adhoc_penalty,
  "adhoc_rebate": adjusted.adhoc_rebate,
  "roundoff": adjusted.roundoff,
  "total": element.amountPaid
});

// Build tax row for a single bill detail
const buildTaxRow = (element, assessmentYearForReceipt, total) => ({
  "year": assessmentYearForReceipt,
  "tax": total.tax,
  "firecess": total.firecess,
  "cancercess": total.cancercess,
  "penalty": total.penalty,
  "rebate": total.rebate,
  "interest": total.interest,
  "usage_exemption": total.usage_exemption,
  "special_category_exemption": total.special_category_exemption,
  "adhoc_penalty": total.adhoc_penalty,
  "adhoc_rebate": total.adhoc_rebate,
  "roundoff": total.roundoff,
  "total": element.amount
});

// Process bill details and return arrays
const processBillDetailsArray = (billDetails) => {
  const arrearArray = [];
  const taxArray = [];
  let assessmentYear = "";
  let count = 0;

  billDetails.forEach(element => {
    if (element.amount > 0 || element.amountPaid > 0) {
      count++;
      const fromDate = convertEpochToDate(element.fromPeriod).split("/")[2];
      const toDate = convertEpochToDate(element.toPeriod).split("/")[2];
      const assessmentYearForReceipt = fromDate + "-" + toDate;

      assessmentYear = assessmentYear == ""
        ? fromDate + "-" + toDate + "(Rs." + element.amountPaid + ")"
        : assessmentYear + "," + fromDate + "-" + toDate + "(Rs." + element.amountPaid + ")";

      const adjusted = initTaxVars();
      const total = initTaxVars();

      element.billAccountDetails.forEach(ele => {
        processTaxHead(ele, adjusted, total);
      });

      arrearArray.push(buildArrearRow(element, assessmentYearForReceipt, adjusted));
      taxArray.push(buildTaxRow(element, assessmentYearForReceipt, total));
    }
  });

  return { arrearArray, taxArray, assessmentYear, count };
};

// Process when count is 0
const processBillDetailsWhenEmpty = (billDetails) => {
  const firstBillDetail = billDetails[0];
  const fromDate = convertEpochToDate(firstBillDetail.fromPeriod).split("/")[2];
  const toDate = convertEpochToDate(firstBillDetail.toPeriod).split("/")[2];
  const assessmentYearForReceipt = fromDate + "-" + toDate;

  const adjusted = initTaxVars();
  const total = initTaxVars();

  firstBillDetail.billAccountDetails.forEach(ele => {
    processTaxHead(ele, adjusted, total);
  });

  return {
    arrearArray: [buildArrearRow(firstBillDetail, assessmentYearForReceipt, adjusted)],
    taxArray: [buildTaxRow(firstBillDetail, assessmentYearForReceipt, total)],
    assessmentYear: fromDate + "-" + toDate
  };
};

// Main function to process PT payment with fetched data
export const processPTPayment = (payment, propertyData, assessmentData) => {
  try {
    const businessService = payment?.paymentDetails?.[0]?.businessService;

    // Only process if it's PT service
    if (businessService !== "PT") {
      return payment;
    }

    const consumerCode = payment.paymentDetails[0]?.bill?.consumerCode;
    if (!consumerCode) {
      return payment;
    }

    // Get last modifier name from property data
    let lastmodifier = null;
    if (propertyData && propertyData.Properties && propertyData.Properties[0]) {
      const uuid = propertyData.Properties[0].auditDetails?.lastModifiedBy;
      if (uuid) {
        // Get user name from property data if available, otherwise null
        lastmodifier = propertyData.Properties[0].auditDetails?.lastModifiedBy || null;
      }
    }

    // Process assessment reasons
    let adhocPenaltyReason = null;
    let adhocRebateReason = null;

    if (assessmentData && assessmentData.Assessments && assessmentData.Assessments.length > 0 && assessmentData.Assessments[0].additionalDetails) {
      adhocPenaltyReason = assessmentData.Assessments[0].additionalDetails.adhocPenaltyReason ? assessmentData.Assessments[0].additionalDetails.adhocPenaltyReason : 'NA';
      adhocRebateReason = assessmentData.Assessments[0].additionalDetails.adhocExemptionReason ? assessmentData.Assessments[0].additionalDetails.adhocExemptionReason : 'NA';
    }

    // Set assessment reasons in bill.additionalDetails
    const reasonss = {
      "adhocPenaltyReason": adhocPenaltyReason,
      "adhocRebateReason": adhocRebateReason,
      "lastModifier": lastmodifier
    };
    payment.paymentDetails[0].bill.additionalDetails = reasonss;

    // Process bill details
    const billDetails = payment.paymentDetails[0].bill.billDetails;
    const { arrearArray, taxArray, assessmentYear, count } = processBillDetailsArray(billDetails);

    let finalAssessmentYear = assessmentYear;
    let finalArrearArray = arrearArray;
    let finalTaxArray = taxArray;

    // If count is 0, process empty bill
    if (count == 0) {
      const emptyResult = processBillDetailsWhenEmpty(billDetails);
      finalAssessmentYear = emptyResult.assessmentYear;
      finalArrearArray = emptyResult.arrearArray;
      finalTaxArray = emptyResult.taxArray;
    }

    // Build final additionalDetails for paymentDetails
    const details = {
      "assessmentYears": finalAssessmentYear,
      "arrearArray": finalArrearArray,
      "taxArray": finalTaxArray
    };

    payment.paymentDetails[0].additionalDetails = details;

    return payment;

  } catch (error) {
    console.error("Error processing PT payment:", error);
    // Return original payment if processing fails
    return payment;
  }
};
