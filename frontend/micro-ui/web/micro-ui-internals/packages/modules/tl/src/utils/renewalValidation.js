export const RENEWAL_VALID_FROM_ERROR = "ValidFrom should be greater than the previous application's ValidTo Date";

const getFinancialYearStart = (financialYearCode) => {
  const [startYear] = String(financialYearCode || "").split("-");
  const parsedYear = Number(startYear);

  if (!parsedYear) return null;

  return Date.UTC(parsedYear, 3, 1);
};

export const getRenewalTradeDetailsValidation = (tradeDetails = {}, applicationData = {}) => {
  const selectedFinancialYearCode = tradeDetails?.tradedetils?.[0]?.financialYear?.code;
  const previousApplicationValidTo = applicationData?.validTo;

  if (!selectedFinancialYearCode || !previousApplicationValidTo) return null;

  // Only run renewal validation if the applicationData is an APPROVED or EXPIRED license
  if (applicationData?.status !== "APPROVED" && applicationData?.status !== "EXPIRED") {
    return null;
  }

  const financialYearStart = getFinancialYearStart(selectedFinancialYearCode);

  if (!financialYearStart) return null;

  if (financialYearStart <= Number(previousApplicationValidTo)) {
    return {
      fieldName: "financialYear",
      message: RENEWAL_VALID_FROM_ERROR,
    };
  }

  return null;
};