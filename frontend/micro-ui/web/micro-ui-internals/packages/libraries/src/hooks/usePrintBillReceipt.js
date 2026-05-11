import { useCallback } from "react";

/* =========================
   Helpers (private)
   ========================= */

const normalizeBills = (data) => {
  if (!data) return [];

  // Bills array
  if (Array.isArray(data)) return data;

  // Payments response
  if (Array.isArray(data?.Payments)) {
    return data.Payments.flatMap((payment) => payment.paymentDetails?.map((pd) => pd.bill)?.filter(Boolean) || []);
  }

  // Single bill object
  if (data?.billDetails) return [data];

  return [];
};

const fetchServiceSearchData = async ({ serviceType, identifier, tenantId }) => {
  if (!identifier) return null;
  const filters = { applicationNumber: identifier };
  try {
    switch (serviceType) {
      case "rl-services": {
        const res = await Digit.RentAndLeaseService.search({ tenantId, filters });
        return res?.AllotmentDetails?.[0] || null;
      }

      case "GC.ONE_TIME_FEE": {
        const res = await Digit.GCService.search({ tenantId, filters });
        return res?.GarbageConnection?.[0] || null;
      }

      case "GC": {
        const res = await Digit.GCService.search({ tenantId, filters });
        return res?.GarbageConnection?.[0] || null;
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
      mergedBillDetails?.push({
        billRootData: {
          ...billRootData,
          identifier,

          ...(searchData && {
            [businessService === "rl-services" ? "rlSearchData" : businessService === "GC.ONE_TIME_FEE" ? "gcSearchData" : businessService === "GC" ? "gcSearchData" : undefined]: searchData,
          }),

          ...commonMeta,
        },
        ...detail,
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

      const {
        billDetails = [],
        consumerCode,
        applicationNumber,
        billNumber,
        ...billLevelData // billDetails removed
      } = bill;

      const identifier = consumerCode || applicationNumber;
      const searchData = searchDataMap[identifier] || null;

      billDetails?.forEach((detail) => {
        extractedBillDetails?.push({
          ...detail,
          billRootData: {
            //  bill-level context
            ...billLevelData,
            billNumber,

            // payment-level context (ONLY here)
            ...paymentLevelData,

            // keep paymentDetails here as requested
            paymentDetails,

            identifier,

            ...(searchData && {
              [businessService === "rl-services" ? "rlSearchData" : businessService === "GC.ONE_TIME_FEE" ? "gcSearchData" : businessService === "GC" ? "gcSearchData" : undefined]: searchData,
            }),
            generatedAt,
          },
        });
      });

      // remove duplicate billDetails entirely
      pd.bill = billLevelData;
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

/* =========================
   Hook (public API)
   ========================= */

export const usePrintBillReceipt = ({ tenantId, setLoader, setShowToast = null, t, pdfkey }) => {
  const printReceipt = useCallback(
    async ({ billOrPaymentResponse = null, businessService, receiptNumber = null, rootKey = "BILLS" }) => {

      console.log('receiptNumber in hook', receiptNumber)
      try {
        setLoader?.(true);

        let sourceData = billOrPaymentResponse;

        if (receiptNumber) {
          const encodedReceiptNumber = encodeURIComponent(receiptNumber);
          console.log('encodedReceiptNumber', encodedReceiptNumber);

          const billPayments = await Digit.PaymentService.getReciept(tenantId, businessService, { receiptNumbers: encodedReceiptNumber });

          sourceData = billPayments;
        }

        const billsArray = normalizeBills(sourceData);
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

        // Build PDF payload
        const pdfPayload =
          rootKey === "PAYMENTS"
            ? transformPaymentsForPdf(sourceData, {
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
