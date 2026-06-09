const PAYMENT_HISTORY_DETAILS_PATH = ["Payments", 0, "paymentDetails", 0, "bill", "billDetails", 0, "billAccountDetails"];

export const TL_TAX_HEAD_LABELS = {
  TL_TAX: "Trade License Tax",
  TL_ADHOC_PENALTY: "Adhoc Penalty",
  TL_ADHOC_REBATE: "Adhoc Rebate",
  TL_RENEWAL_REBATE: "Renewal Rebate",
  TL_RENEWAL_PENALTY: "Penalty",
};

const NON_TAX_HEAD_CODES = ["TL_ADHOC_PENALTY", "TL_RENEWAL_PENALTY", "TL_ADHOC_REBATE", "TL_RENEWAL_REBATE"];
const SOURCE_PRIORITY = {
  paymentsHistory: 3,
  fetchBill: 2,
  fetchBreakupFetchBill: 2,
  slabFallback: 1,
};

const getNestedValue = (source, path) => path.reduce((value, key) => value?.[key], source);

export const getTLTaxHeadLabel = (taxHeadCode) => TL_TAX_HEAD_LABELS[taxHeadCode] || taxHeadCode;

export const getTLBillAccountDetails = ({ billData, paymentsHistory } = {}) => {
  const billAccountDetails = billData?.billDetails?.[0]?.billAccountDetails;
  if (Array.isArray(billAccountDetails) && billAccountDetails.length > 0) {
    return billAccountDetails;
  }

  const paymentBillAccountDetails = getNestedValue(paymentsHistory, PAYMENT_HISTORY_DETAILS_PATH);
  if (Array.isArray(paymentBillAccountDetails)) {
    return paymentBillAccountDetails;
  }

  return [];
};

export const getTLTotalAmount = ({ billData, paymentsHistory } = {}) => {
  if (billData?.totalAmount !== undefined && billData?.totalAmount !== null) {
    return billData.totalAmount;
  }

  const totalAmountPaid = paymentsHistory?.Payments?.[0]?.totalAmountPaid;
  if (totalAmountPaid !== undefined && totalAmountPaid !== null) {
    return totalAmountPaid;
  }

  return 0;
};

export const getTLTaxHeadAmount = (billAccountDetails = [], taxHeadCode) => {
  const matchedTaxHead = billAccountDetails.find((item) => item?.taxHeadCode === taxHeadCode);
  return matchedTaxHead?.amount ?? 0;
};

export const buildTLPaymentBreakup = ({
  billAccountDetails = [],
  totalAmount = 0,
  applicationType,
  penaltyReason = "",
  rebateReason = "",
} = {}) => {
  const tlTaxFromBill = getTLTaxHeadAmount(billAccountDetails, "TL_TAX");
  const renewalRebate = getTLTaxHeadAmount(billAccountDetails, "TL_RENEWAL_REBATE");
  const renewalPenalty = getTLTaxHeadAmount(billAccountDetails, "TL_RENEWAL_PENALTY");
  const adhocPenalty = getTLTaxHeadAmount(billAccountDetails, "TL_ADHOC_PENALTY");
  const adhocRebate = getTLTaxHeadAmount(billAccountDetails, "TL_ADHOC_REBATE");
  const rebate = renewalRebate + adhocRebate;
  const penalty = renewalPenalty + adhocPenalty;
  const isRenewal = applicationType === "RENEWAL";
  const tradeLicenseTax = tlTaxFromBill || (totalAmount - rebate - penalty);

  const feeLineItems = [
    { label: isRenewal ? "Trade License Renewal Fee" : "Trade License Tax", amount: tradeLicenseTax },
    { label: isRenewal ? "Rebate" : "Renewal Rebate", amount: renewalRebate },
    { label: "Penalty", amount: renewalPenalty },
  ];

  if (adhocPenalty !== 0) {
    feeLineItems.push({ label: "Adhoc Penalty", amount: adhocPenalty, tooltip: penaltyReason });
  }

  if (adhocRebate !== 0) {
    feeLineItems.push({ label: "Adhoc Rebate", amount: adhocRebate, tooltip: rebateReason });
  }

  return {
    tradeLicenseTax,
    tlTaxFromBill,
    renewalRebate,
    renewalPenalty,
    adhocPenalty,
    adhocRebate,
    rebate,
    penalty,
    totalAmount,
    feeLineItems,
    hasTaxHead: (taxHeadCode) => billAccountDetails.some((item) => item?.taxHeadCode === taxHeadCode),
  };
};

export const createTLPaymentSnapshot = ({ source, billAccountDetails = [], totalAmount = 0 } = {}) => {
  const normalizedBillAccountDetails = Array.isArray(billAccountDetails) ? billAccountDetails : [];
  const nonTaxHeadCount = NON_TAX_HEAD_CODES.filter((taxHeadCode) =>
    normalizedBillAccountDetails.some((item) => item?.taxHeadCode === taxHeadCode)
  ).length;

  return {
    source,
    billAccountDetails: normalizedBillAccountDetails,
    totalAmount: totalAmount ?? 0,
    quality: {
      headCount: normalizedBillAccountDetails.length,
      nonTaxHeadCount,
      sourcePriority: SOURCE_PRIORITY[source] || 0,
    },
  };
};

export const describeTLPaymentSnapshot = (snapshot) => {
  if (!snapshot) {
    return null;
  }

  return {
    source: snapshot.source,
    totalAmount: snapshot.totalAmount,
    headCodes: snapshot.billAccountDetails.map((item) => `${item?.taxHeadCode}:${item?.amount ?? 0}`),
    quality: snapshot.quality,
  };
};

export const getTLPaymentSnapshotDecision = (currentSnapshot, candidateSnapshot) => {
  if (!candidateSnapshot) {
    return { shouldReplace: false, reason: "missing-candidate" };
  }

  if (!currentSnapshot) {
    return { shouldReplace: true, reason: "first-snapshot" };
  }

  if (candidateSnapshot.quality.nonTaxHeadCount !== currentSnapshot.quality.nonTaxHeadCount) {
    return {
      shouldReplace: candidateSnapshot.quality.nonTaxHeadCount > currentSnapshot.quality.nonTaxHeadCount,
      reason: "non-tax-head-count",
    };
  }

  if (candidateSnapshot.quality.headCount !== currentSnapshot.quality.headCount) {
    return {
      shouldReplace: candidateSnapshot.quality.headCount > currentSnapshot.quality.headCount,
      reason: "tax-head-count",
    };
  }

  if (candidateSnapshot.totalAmount !== currentSnapshot.totalAmount) {
    return {
      shouldReplace: candidateSnapshot.totalAmount > currentSnapshot.totalAmount,
      reason: "total-amount",
    };
  }

  if (candidateSnapshot.quality.sourcePriority !== currentSnapshot.quality.sourcePriority) {
    return {
      shouldReplace: candidateSnapshot.quality.sourcePriority > currentSnapshot.quality.sourcePriority,
      reason: "source-priority",
    };
  }

  return { shouldReplace: false, reason: "same-or-weaker-snapshot" };
};