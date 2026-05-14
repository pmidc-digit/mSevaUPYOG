import { useCallback } from "react";

/* =========================
   Helpers (private)
   ========================= */

const cleanBillAccountDetails = (billAccountDetails = []) => {
  const hasArrears = billAccountDetails?.some((item) => item?.taxHeadCode === "RL_ARREAR_FEE" && Number(item?.amount) > 0);

  return billAccountDetails?.filter((item) => {
    // remove roundoff always
    if (item?.taxHeadCode === "RL_FEE_ROUND_OFF" || item?.taxHeadCode === "GC_FEE_ROUND_OFF") return false;

    // remove security deposit ONLY if arrears exist
    if (hasArrears && item?.taxHeadCode === "RL_SECURITY_DEPOSIT_FEE") {
      return false;
    }

    return true;
  });
};

const normalizeBills = (data) => {
  if (!data) return [];

  // ✅ Bills array
  if (Array.isArray(data)) return data;

  // ✅ Full Payments response: { Payments: [] }
  if (Array.isArray(data?.Payments)) {
    return data.Payments.flatMap((payment) => payment.paymentDetails?.map((pd) => pd.bill)?.filter(Boolean) || []);
  }

  // ✅ Single Payment object
  if (Array.isArray(data?.paymentDetails)) {
    return data.paymentDetails?.map((pd) => pd.bill)?.filter(Boolean) || [];
  }

  // ✅ Single Bill object
  if (Array.isArray(data?.billDetails)) {
    return [data];
  }

  return [];
};

const fetchServiceSearchData = async ({ serviceType, identifier, tenantId }) => {
  if (!identifier) return null;
  const filters = { applicationNumber: identifier };
  try {
    switch (serviceType) {
      case "rl-services": {
        const res = await Digit.RentAndLeaseService.search({ tenantId, filters: { applicationNumbers: identifier } });
        return res?.AllotmentDetails?.[0] || null;
      }

      case "GC.ONE_TIME_FEE":
      case "GC": {
        let res = await Digit.GCService.search({ tenantId, filters });

        let data = res?.GarbageConnection?.[0];

        // fallback for connection number 
        if (!data) {
          res = await Digit.GCService.search({
            tenantId,
            filters: { connectionNumber: identifier },
          });
          data = res?.GarbageConnection?.[0];
        }

        return data || null;
      }

      default:
        console.warn("No search handler for service:", serviceType);
        return null;
    }
  } catch (e) {
    console.error("Service search failed:", serviceType, identifier, e);
    return null;
  }
};

const transformBillsForPdf = (Bills, meta = {}) => {
  const billsArray = normalizeBills(Bills);
  if (!billsArray?.length) return { Bills: [] };

  const { searchDataMap = {}, businessService, rootKey = "BILLS", ...commonMeta } = meta;

  const mergedBillDetails = [];

  billsArray?.forEach((bill) => {
    const { billDetails = [], consumerCode, applicationNumber, ...billRootData } = bill;

    const identifier = consumerCode || applicationNumber;
    const searchData = searchDataMap[identifier] || null;

    billDetails?.forEach((detail) => {
      const cleanedAccountDetails = cleanBillAccountDetails(detail?.billAccountDetails);
      mergedBillDetails?.push({
        billRootData: {
          ...billRootData,
          identifier,

          ...(searchData && {
            [businessService === "rl-services"
              ? "rlSearchData"
              : businessService === "GC.ONE_TIME_FEE"
              ? "gcSearchData"
              : businessService === "GC"
              ? "gcSearchData"
              : undefined]: searchData,
          }),

          ...commonMeta,
        },
        ...detail,
        billAccountDetails: cleanedAccountDetails,
      });
    });
  });

  const { tenantId, billNumber } = billsArray?.[0];

  const payload = {
    tenantId,
    billNumber,
    billDetails: mergedBillDetails,
  };

  return rootKey === "PAYMENTS" ? { Payments: [payload] } : { Bills: [payload] };
};

const transformPaymentsForPdf = (paymentsResponse, meta = {}) => {
  const { searchDataMap = {}, businessService, generatedAt } = meta;

  if (!Array.isArray(paymentsResponse?.Payments)) {
    return { Payments: [] };
  }

  const transformedPayments = paymentsResponse?.Payments?.map((payment) => {
    const extractedBillDetails = [];

    const {
      tenantId,
      receiptNumber,
      paymentDetails = [],
      ...paymentLevelData // everything else goes into billRootData
    } = payment;

    paymentDetails?.forEach((pd) => {
      const bill = pd?.bill;
      if (!bill) return;

      // IMMUTABLE split
      const { billDetails = [], consumerCode, applicationNumber, billNumber, ...billLevelData } = bill;

      const identifier = consumerCode || applicationNumber;
      const searchData = searchDataMap[identifier] || null;

      billDetails?.forEach((detail) => {
        const cleanedAccountDetails = cleanBillAccountDetails(detail?.billAccountDetails);
        extractedBillDetails?.push({
          ...detail,
          billAccountDetails: cleanedAccountDetails,
          billRootData: {
            // CLEAN bill (no billDetails)
            ...billLevelData,
            consumerCode,
            applicationNumber,
            billNumber,

            // payment-level context
            ...paymentLevelData,

            paymentDetails,

            identifier,

            ...(searchData && {
              [businessService === "rl-services"
                ? "rlSearchData"
                : businessService === "GC.ONE_TIME_FEE"
                ? "gcSearchData"
                : businessService === "GC"
                ? "gcSearchData"
                : undefined]: searchData,
            }),

            generatedAt,
          },
        });
      });

      // ✅ NOTHING is written back to pd.bill
    });

    return {
      tenantId,
      receiptNumber,
      billNumber: paymentDetails?.[0]?.bill?.billNumber,
      billDetails: extractedBillDetails,
    };
  });

  return { Payments: transformedPayments };
};

const normalizePayments = (data) => {
  if (!data) return null;

  // Full Payments response
  if (Array.isArray(data?.Payments)) {
    return data;
  }

  // Single Payment object → wrap it
  if (Array.isArray(data?.paymentDetails)) {
    return { Payments: [data] };
  }

  return null;
};
/* =========================
   Hook (public API)
   ========================= */

export const usePrintBillReceipt = ({ tenantId, setLoader, setShowToast = null, t, pdfkey }) => {
  const printReceipt = useCallback(
    async ({ billOrPaymentResponse = null, businessService, receiptNumber = null, rootKey = "BILLS" }) => {
      try {
        setLoader?.(true);

        let sourceData = billOrPaymentResponse;

        // ✅ 1. Prefer explicitly passed Payments

        const normalizedPayments = normalizePayments(billOrPaymentResponse);
        const hasPayments = !!normalizedPayments;

        console.log("hasPayments,normalizedPayments", hasPayments, normalizedPayments);
        if (!hasPayments && receiptNumber) {
          let billPayments = await Digit.PaymentService.getReciept(tenantId, businessService, { receiptNumbers: receiptNumber });

          if (!billPayments?.Payments?.length) {
            billPayments = await Digit.PaymentService.recieptSearch(tenantId, businessService, { consumerCodes: receiptNumber });
          }

          sourceData = billPayments;
        }
        console.log("sourceData", sourceData);
        const billsArray = normalizeBills(sourceData);
        console.log("billsArray", billsArray);
        if (!billsArray?.length) {
          throw new Error("No bills found");
        }

        //  Collect unique identifiers
        const identifiers = [...new Set(billsArray?.map((b) => b.consumerCode || b.applicationNumber)?.filter(Boolean))];
        //  Fetch search data per identifier
        const searchDataMap = {};
        await Promise.all(
          identifiers?.map(async (id) => {
            searchDataMap[id] = await fetchServiceSearchData({
              serviceType: businessService,
              identifier: id,
              tenantId,
            });
          })
        );

        const paymentsSource = rootKey === "PAYMENTS" ? normalizePayments(sourceData) : null;

        // Build PDF payload
        const pdfPayload =
          rootKey === "PAYMENTS"
            ? transformPaymentsForPdf(paymentsSource, {
                businessService,
                generatedAt: Date.now(),
                searchDataMap,
              })
            : transformBillsForPdf(billsArray, {
                businessService,
                generatedAt: Date.now(),
                searchDataMap,
                rootKey,
              });

        // Generate PDF

        let response = null;

        if (rootKey === "PAYMENTS") {
          const payment = sourceData?.Payments?.[0];
          if (payment?.fileStoreId) {
            response = { filestoreIds: [payment.fileStoreId] };
          }
        }

        if (!response) {
          response = await Digit.PaymentService.generatePdf(tenantId, pdfPayload, pdfkey);
        }

        const fileStore = await Digit.PaymentService.printReciept(tenantId, {
          fileStoreIds: response.filestoreIds[0],
        });

        response?.filestoreIds?.forEach((id) => {
          if (fileStore[id]) {
            window.open(fileStore[id], "_blank");
          }
        });
      } catch (err) {
        console.error("error in receipt generation", err);
        setShowToast?.({
          error: true,
          label: t?.("CS_COMMON_ERROR_GENERATING_RECEIPT"),
        });
      } finally {
        setLoader?.(false);
      }
    },
    [setLoader, pdfkey]
  );

  return { printReceipt };
};
