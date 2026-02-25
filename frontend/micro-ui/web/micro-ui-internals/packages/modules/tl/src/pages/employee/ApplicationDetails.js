import React, { useEffect, useState, Fragment } from "react";
import { useTranslation } from "react-i18next";
import ApplicationDetailsTemplate from "../../../../templates/ApplicationDetails";
import NewApplicationTimeline from "../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
import cloneDeep from "lodash/cloneDeep";
import { useParams } from "react-router-dom";
import { Header, MultiLink, LinkButton, Loader, Toast, Card } from "@mseva/digit-ui-react-components";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import getPDFData from "../../utils/getTLAcknowledgementData";
import BreakupModal from "../../components/BreakupModal";
import AdhocRebatePenaltyModal from "../../components/AdhocRebatePenaltyModal";

const ApplicationDetails = () => {
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { id: applicationNumber } = useParams();
  const [showToast, setShowToast] = useState(null);
  // const [callUpdateService, setCallUpdateValve] = useState(false);
  const [businessService, setBusinessService] = useState("NewTL"); //DIRECTRENEWAL
  const [numberOfApplications, setNumberOfApplications] = useState([]);

  // eSign Custom Hook
  const { mutate: eSignCertificate, isLoading: eSignLoading, error: eSignError } = Digit.Hooks.tl.useESign();

  // Cache certificate data to avoid duplicate API calls
  const [certificateData, setCertificateData] = useState(null);

  const [allowedToNextYear, setAllowedToNextYear] = useState(false);
  const [oldRenewalAppNo, setoldRenewalAppNo] = useState("");
  const [viewTimeline, setViewTimeline] = useState(false);
  const [latestRenewalYearofAPP, setlatestRenewalYearofAPP] = useState("");
  sessionStorage.setItem("applicationNumber", applicationNumber);
  const { renewalPending } = Digit.Hooks.useQueryParams();

  // Fee Estimation states
  const [showBreakupModal, setShowBreakupModal] = useState(false);
  const [breakupData, setBreakupData] = useState(null);
  const [breakupLoading, setBreakupLoading] = useState(false);
  const [billData, setBillData] = useState(null);

  // ADHOC Rebate/Penalty states
  const [showAdhocPopup, setShowAdhocPopup] = useState(false);
  const [isAdhocUpdating, setIsAdhocUpdating] = useState(false);
  const [adhocLicenseData, setAdhocLicenseData] = useState(null);

  const { isLoading, isError, data: applicationDetails, error } = Digit.Hooks.tl.useApplicationDetail(t, tenantId, applicationNumber);

  const stateId = Digit.ULBService.getStateId();
  const { data: TradeRenewalDate = {} } = Digit.Hooks.tl.useTradeLicenseMDMS(stateId, "TradeLicense", ["TradeRenewal"]);

  const {
    isLoading: updatingApplication,
    isError: updateApplicationError,
    data: updateResponse,
    error: updateError,
    mutate,
  } = Digit.Hooks.tl.useApplicationActions(tenantId);

  // Sanitize null document arrays to prevent server NPE in EnrichmentService.enrichTLUpdateRequest
  const safeMutate = (data, ...rest) => {
    if (data?.Licenses?.[0]?.tradeLicenseDetail) {
      const detail = data.Licenses[0].tradeLicenseDetail;
      if (!detail.applicationDocuments) detail.applicationDocuments = [];
      if (!detail.verificationDocuments) detail.verificationDocuments = [];
    }
    return mutate(data, ...rest);
  };

  let EditRenewalApplastModifiedTime = Digit.SessionStorage.get("EditRenewalApplastModifiedTime");

  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: applicationDetails?.tenantId || tenantId,
    id: applicationDetails?.applicationData?.applicationNumber,
    moduleCode: businessService,
    role: "TL_CEMP",
    config: { EditRenewalApplastModifiedTime: EditRenewalApplastModifiedTime },
  });

  const closeToast = () => {
    setShowToast(null);
  };

  const { data: paymentsHistory } = Digit.Hooks.tl.useTLPaymentHistory(tenantId, applicationDetails?.applicationData?.applicationNumber);

  // Fetch bill data for fee estimation section
  // Check if PAY is a next action in workflow (handles NEWTL.HAZ where status is APPLIED but payment is pending)
  const hasPayAction = workflowDetails?.data?.nextActions?.some?.((a) => a.action === "PAY");
  useEffect(() => {
    const fetchBill = async () => {
      const status = applicationDetails?.applicationData?.status;
      if (status === "PENDINGPAYMENT" || status === "APPROVED" || status === "EXPIRED" || hasPayAction) {
        try {
          const appTenantId = applicationDetails?.applicationData?.tenantId || tenantId;
          const consumerCode = applicationDetails?.applicationData?.applicationNumber;
          const result = await Digit.PaymentService.fetchBill(appTenantId, {
            businessService: "TL",
            consumerCode: consumerCode,
          });
          setBillData(result?.Bill?.[0]);
        } catch (err) {
          console.error("Error fetching bill", err);
        }
      }
    };
    if (applicationDetails?.applicationData?.applicationNumber) {
      fetchBill();
    }
  }, [applicationDetails?.applicationData?.status, applicationDetails?.applicationData?.applicationNumber, hasPayAction]);

  useEffect(() => {
    if (applicationDetails?.numOfApplications?.length > 0) {
      let financialYear = cloneDeep(applicationDetails?.applicationData?.financialYear);
      const financialYearDate = financialYear?.split("-")[1];
      const finalFinancialYear = `20${Number(financialYearDate)}-${Number(financialYearDate) + 1}`;
      const latestFinancialYear = Math.max.apply(
        Math,
        applicationDetails?.numOfApplications
          ?.filter((ob) => ob.licenseNumber === applicationDetails?.applicationData?.licenseNumber)
          ?.map(function (o) {
            return parseInt(o.financialYear.split("-")[0]);
          })
      );
      const isAllowedToNextYear = applicationDetails?.numOfApplications?.filter(
        (data) => data.financialYear == finalFinancialYear && data?.status !== "REJECTED"
      );
      if (isAllowedToNextYear?.length > 0) {
        setAllowedToNextYear(false);
        setoldRenewalAppNo(isAllowedToNextYear?.[0]?.applicationNumber);
      }
      if (!applicationDetails?.applicationData?.financialYear.includes(`${latestFinancialYear}`))
        setlatestRenewalYearofAPP(applicationDetails?.applicationData?.financialYear);
      if (!isAllowedToNextYear || isAllowedToNextYear?.length == 0) setAllowedToNextYear(true);
      setNumberOfApplications(applicationDetails?.numOfApplications);
    }
  }, [applicationDetails?.numOfApplications]);

  useEffect(() => {
    if (workflowDetails?.data?.applicationBusinessService) {
      setBusinessService(workflowDetails?.data?.applicationBusinessService);
    }
  }, [workflowDetails.data]);

  // Display error toast for eSign failures
  useEffect(() => {
    if (eSignError) {
      setShowToast({
        key: "error",
        error: true,
        label: eSignError.message || "eSign process failed. Please try again.",
      });
    }
  }, [eSignError]);

  // Reset certificate cache when application changes
  useEffect(() => {
    setCertificateData(null);
  }, [applicationDetails?.applicationData?.applicationNumber]);

  if (workflowDetails?.data?.processInstances?.length > 0) {
    let filteredActions = [];
    filteredActions = get(workflowDetails?.data?.processInstances[0], "nextActions", [])?.filter((item) => item.action != "ADHOC" && item.action != "INITIATE");
    let actions = orderBy(filteredActions, ["action"], ["desc"]);
    if ((!actions || actions?.length == 0) && workflowDetails?.data?.actionState) workflowDetails.data.actionState.nextActions = [];

    workflowDetails?.data?.actionState?.nextActions?.forEach((data) => {
      if (data.action == "RESUBMIT") {
        (data.redirectionUrl = {
          pathname: `/digit-ui/employee/tl/edit-application-details/${applicationNumber}`,
          state: applicationDetails,
        }),
          (data.tenantId = stateId);
      }
      if (data.action == "APPLY") {
        (data.redirectionUrl = {
          pathname: `/digit-ui/employee/tl/edit-application-details/${applicationNumber}`,
          state: applicationDetails,
        }),
          (data.tenantId = stateId);
      }
    });
  }

  const userInfo = Digit.UserService.getUser();
  const rolearray = userInfo?.info?.roles.filter((item) => {
    if ((item.code == "TL_CEMP" && item.tenantId === tenantId) || item.code == "CITIZEN") return true;
  });

  const rolecheck = rolearray.length > 0 ? true : false;
  const validTo = applicationDetails?.applicationData?.validTo;
  const currentDate = Date.now();
  const duration = validTo - currentDate;
  const renewalPeriod = TradeRenewalDate?.TradeLicense?.TradeRenewal?.[0]?.renewalPeriod;

  const getToastMessages = () => {
    if (allowedToNextYear == false && oldRenewalAppNo && applicationDetails?.applicationData?.status !== "MANUALEXPIRED") {
      return `${t("TL_ERROR_TOAST_RENEWAL_1")} ${oldRenewalAppNo} ${t("TL_ERROR_TOAST_RENEWAL_2")}`;
    } else if (applicationDetails?.applicationData?.status === "CANCELLED") {
      return `${t("TL_ERROR_TOAST_RENEWAL_CANCEL")}`;
    } else if (/* latestRenewalYearofAPP && */ applicationDetails?.applicationData?.status === "MANUALEXPIRED") {
      return `${t("TL_ERROR_TOAST_MUTUALLY_EXPIRED")}`;
    }
  };

  if (
    rolecheck &&
    (applicationDetails?.applicationData?.status === "APPROVED" ||
      applicationDetails?.applicationData?.status === "EXPIRED" ||
      applicationDetails?.applicationData?.status === "CANCELLED" ||
      applicationDetails?.applicationData?.status === "MANUALEXPIRED") /* && renewalPending==="true" */ /* && duration <= renewalPeriod */
  ) {
    if (workflowDetails?.data /* && allowedToNextYear */) {
      if (!workflowDetails?.data?.actionState) {
        workflowDetails.data.actionState = {};
        workflowDetails.data.actionState.nextActions = [];
      }
      const flagData = workflowDetails?.data?.actionState?.nextActions?.filter((data) => data.action == "RENEWAL_SUBMIT_BUTTON");
      if (flagData && flagData.length === 0) {
        workflowDetails?.data?.actionState?.nextActions?.push({
          action: "RENEWAL_SUBMIT_BUTTON",
          isToast:
            allowedToNextYear == false ||
            applicationDetails?.applicationData?.status === "CANCELLED" ||
            applicationDetails?.applicationData?.status === "MANUALEXPIRED" /* && latestRenewalYearofAPP */
              ? true
              : false,
          toastMessage: getToastMessages(),
          redirectionUrl: {
            pathname: `/digit-ui/employee/tl/renew-application-details/${applicationNumber}`,
            state: applicationDetails,
          },
          tenantId: stateId,
          role: [],
        });
      }
      // workflowDetails = {
      //   ...workflowDetails,
      //   data: {
      //     ...workflowDetails?.data,
      //     actionState: {
      //       nextActions: allowedToNextYear ?[
      //         {
      //           action: "RENEWAL_SUBMIT_BUTTON",
      //           redirectionUrl: {
      //             pathname: `/digit-ui/employee/tl/renew-application-details/${applicationNumber}`,
      //             state: applicationDetails
      //           },
      //           tenantId: stateId,
      //         }
      //       ] : [],
      //     },
      //   },
      // };
    }
  }

  if (rolearray && (applicationDetails?.applicationData?.status === "PENDINGPAYMENT" || hasPayAction)) {
    workflowDetails?.data?.nextActions?.map((data) => {
      if (data.action === "PAY") {
        workflowDetails = {
          ...workflowDetails,
          data: {
            ...workflowDetails?.data,
            actionState: {
              nextActions: [
                {
                  action: data.action,
                  redirectionUrll: {
                    pathname: `TL/${applicationDetails?.applicationData?.applicationNumber}/${tenantId}`,
                    state: tenantId,
                  },
                  tenantId: tenantId,
                },
              ],
            },
          },
        };
      }
    });

    workflowDetails?.data?.actionState?.nextActions?.forEach((action) => {
      if (action?.action === "PAY") {
        action.redirectionUrll = {
          pathname: `TL/${applicationDetails?.applicationData?.applicationNumber}/${tenantId}`,
          state: applicationDetails?.tenantId || tenantId,
        };
      }
    });
  }

  const wfDocs = workflowDetails.data?.timeline?.reduce((acc, { wfDocuments }) => {
    return wfDocuments ? [...acc, ...wfDocuments] : acc;
  }, []);
  const ownerdetails = applicationDetails?.applicationDetails.find((e) => e.title === "ES_NEW_APPLICATION_OWNERSHIP_DETAILS");
  let appdetailsDocuments = ownerdetails?.additionalDetails?.documents;
  if (appdetailsDocuments && wfDocs?.length && !appdetailsDocuments.find((e) => e.title === "TL_WORKFLOW_DOCS")) {
    ownerdetails.additionalDetails.documents = [
      ...ownerdetails.additionalDetails.documents,
      {
        title: "TL_WORKFLOW_DOCS",
        values: wfDocs?.map?.((e) => ({ ...e, title: e.documentType })),
      },
    ];
  }

  const handleDownloadPdf = async () => {
    const tenantInfo = tenants.find((tenant) => tenant.code === applicationDetails.tenantId);
    const data = await getPDFData(applicationDetails?.applicationData, tenantInfo, t);
    //data.then((ress) => Digit.Utils.pdf.generate(ress));
    Digit.Utils.pdf.generate(data);
    setIsDisplayDownloadMenu(false);
  };

  const handleViewTimeline = () => {
    setViewTimeline(true);
    const timelineSection = document.getElementById("timeline");
    if (timelineSection) {
      timelineSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  // const printReciept = async (businessService="TL", consumerCode=applicationDetails?.applicationData?.applicationNumber) => {
  //   await Digit.Utils.downloadReceipt(consumerCode, businessService, 'tradelicense-receipt');
  //   setIsDisplayDownloadMenu(false)
  // };
  const printReciept = async (businessService = "TL", consumerCode = applicationDetails?.applicationData?.applicationNumber) => {
    const receiptFile = { filestoreIds: [paymentsHistory.Payments[0]?.fileStoreId] };
    if (receiptFile.filestoreIds[0] !== null) {
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: receiptFile.filestoreIds[0] });
      window.open(fileStore[receiptFile.filestoreIds[0]], "_blank");
    } else {
      const newResponse = await Digit.PaymentService.generatePdf(tenantId, { Payments: [paymentsHistory.Payments[0]] }, "tradelicense-receipt");
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: newResponse.filestoreIds[0] });
      window.open(fileStore[newResponse.filestoreIds[0]], "_blank");
    }
  };
  const fetchDigiLockerDocuments = async (file) => {
    let TokenReq = {
      pdfUrl: file,
      redirectUrl: "",
    };
    const res1 = await Digit.DigiLockerService.pdfUrl({ TokenReq });
    window.location.href = res1;
  };
  // Generate and cache certificate data to avoid duplicate API calls
  const generateCertificateData = async () => {
    if (certificateData) {
      return certificateData; // Return cached data
    }

    try {
      let res = await Digit.TLService.TLsearch({
        tenantId: tenantId,
        filters: { applicationNumber: applicationDetails?.applicationData?.applicationNumber },
      });

      if (!res?.Licenses || res.Licenses.length === 0) {
        throw new Error("License not found for this application");
      }

      // Generate PDF certificate with enhanced error handling
      let TLcertificatefile;
      try {
        TLcertificatefile = await Digit.PaymentService.generatePdf(tenantId, { Licenses: res?.Licenses }, "tlcertificate");
      } catch (pdfError) {

        if (pdfError.message?.includes("Lexical error")) {
          throw new Error("PDF template error. Please contact system administrator to fix the certificate template.");
        } else if (pdfError.message?.includes("ProcessInstanc")) {
          throw new Error("Certificate template has configuration issues. Please contact technical support.");
        } else {
          throw new Error(`Certificate generation failed: ${pdfError.message || "Unknown error"}`);
        }
      }

      const fileStoreId = TLcertificatefile?.filestoreIds?.[0];

      if (!fileStoreId) {
        throw new Error("Failed to generate certificate file");
      }

      // Cache the result
      const data = { fileStoreId, certificateFile: TLcertificatefile };
      setCertificateData(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const printCertificate = async () => {
    try {
      const { fileStoreId } = await generateCertificateData();

      const receiptFile = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });

      const certificateUrl = receiptFile[fileStoreId];

      if (certificateUrl) {
        window.open(certificateUrl, "_blank");
      } else {
        setShowToast({
          key: "error",
          error: true,
          label: "Certificate URL not found. Please try again.",
        });
      }

      setIsDisplayDownloadMenu(false);
    } catch (error) {
      setShowToast({
        key: "error",
        error: true,
        label: error.message || "Failed to download certificate",
      });
    }
  };

  // eSign Certificate - reuses cached PDF data
  const printCertificateWithESign = async () => {
    try {

      // Reuse existing certificate data or generate if not available
      const { fileStoreId } = await generateCertificateData();

      // Use custom hook for eSign
      eSignCertificate(
        { fileStoreId, tenantId },
        {
          onSuccess: () => {
            setIsDisplayDownloadMenu(false);
          },
          onError: (error) => {
            setShowToast({
              key: "error",
              error: true,
              label: error.message || "Failed to initiate digital signing process",
            });
          },
        }
      );
    } catch (error) {
      setShowToast({
        key: "error",
        error: true,
        label: error.message || "Failed to prepare certificate for eSign",
      });
    }
  };
  const getTaxHeadLabel = (taxHeadCode) => {
    const labels = {
      TL_TAX: "Trade License Tax",
      TL_ADHOC_PENALTY: "Adhoc Penalty",
      TL_ADHOC_REBATE: "Adhoc Rebate",
      TL_RENEWAL_REBATE: "Renewal Rebate",
      TL_RENEWAL_PENALTY: "Penalty",
    };
    return t(taxHeadCode) !== taxHeadCode ? t(taxHeadCode) : labels[taxHeadCode] || taxHeadCode;
  };

  // Helper to get bill account details from bill or payment history
  const getBillAccountDetails = () => {
    if (billData?.billDetails?.[0]?.billAccountDetails) {
      return billData.billDetails[0].billAccountDetails;
    }
    if (paymentsHistory?.Payments?.[0]?.paymentDetails?.[0]?.bill?.billDetails?.[0]?.billAccountDetails) {
      return paymentsHistory.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails;
    }
    return [];
  };

  const getTotalAmount = () => {
    if (billData?.totalAmount !== undefined && billData?.totalAmount !== null) return billData.totalAmount;
    if (paymentsHistory?.Payments?.[0]?.totalAmountPaid !== undefined) return paymentsHistory.Payments[0].totalAmountPaid;
    return 0;
  };

  // Get summarized fee line items for the fee card
  const getFeeLineItems = () => {
    const details = getBillAccountDetails();
    const tlTax = details.find(d => d.taxHeadCode === "TL_TAX")?.amount || 0;
    const renewalRebate = details.find(d => d.taxHeadCode === "TL_RENEWAL_REBATE")?.amount || 0;
    const renewalPenalty = details.find(d => d.taxHeadCode === "TL_RENEWAL_PENALTY")?.amount || 0;
    const adhocPenalty = details.find(d => d.taxHeadCode === "TL_ADHOC_PENALTY")?.amount || 0;
    const adhocRebate = details.find(d => d.taxHeadCode === "TL_ADHOC_REBATE")?.amount || 0;

    // Get reasons from license data for tooltips
    const licData = adhocLicenseData || applicationDetails?.applicationData;
    const penaltyReason = licData?.tradeLicenseDetail?.adhocPenaltyReason || "";
    const rebateReason = licData?.tradeLicenseDetail?.adhocExemptionReason || "";

    const items = [
      { label: "Trade License Tax", amount: tlTax },
      { label: "Renewal Rebate", amount: renewalRebate },
      { label: "Penalty", amount: renewalPenalty },
    ];
    // Only show adhoc rows when they have non-zero values
    if (adhocPenalty !== 0) {
      items.push({ label: "Adhoc Penalty", amount: adhocPenalty, tooltip: penaltyReason });
    }
    if (adhocRebate !== 0) {
      items.push({ label: "Adhoc Rebate", amount: adhocRebate, tooltip: rebateReason });
    }
    return items;
  };

  // Open ADHOC popup — pre-populate with existing values from license data
  const openAdhocPopup = async () => {
    try {
      // Fetch fresh license data so modal has latest values
      const res = await Digit.TLService.TLsearch({
        tenantId: applicationDetails?.applicationData?.tenantId || tenantId,
        filters: { applicationNumber: applicationDetails?.applicationData?.applicationNumber },
      });
      const license = res?.Licenses?.[0];
      if (license) {
        setAdhocLicenseData(license);
      }
    } catch (err) {
      console.error("Error fetching license for ADHOC:", err);
    }
    setShowAdhocPopup(true);
  };

  // Handle ADHOC submit — update license, then refresh bill + breakup
  const handleAdhocSubmit = async ({ adhocPenalty, adhocPenaltyReason, penaltyComments, adhocExemption, adhocExemptionReason, rebateComments }) => {
    setIsAdhocUpdating(true);
    try {
      // Fetch fresh license data
      const res = await Digit.TLService.TLsearch({
        tenantId: applicationDetails?.applicationData?.tenantId || tenantId,
        filters: { applicationNumber: applicationDetails?.applicationData?.applicationNumber },
      });
      const license = res?.Licenses?.[0];
      if (!license) {
        throw new Error("License not found");
      }

      // Set ADHOC fields on license
      license.action = "ADHOC";
      license.assignee = [];
      license.tradeLicenseDetail.adhocPenalty = adhocPenalty; // string
      license.tradeLicenseDetail.adhocExemption = adhocExemption; // negative number
      license.tradeLicenseDetail.adhocPenaltyReason = adhocPenaltyReason;
      license.tradeLicenseDetail.adhocExemptionReason = adhocExemptionReason;
      license.tradeLicenseDetail.additionalDetail = {
        ...license.tradeLicenseDetail.additionalDetail,
        penaltyComments: penaltyComments,
        rebateComments: rebateComments,
      };

      // Call _update API
      const updateRes = await Digit.TLService.update({ Licenses: [license] }, tenantId);
      const updatedLicense = updateRes?.Licenses?.[0];

      if (updatedLicense) {
        setAdhocLicenseData(updatedLicense);
      }

      // Refresh bill + breakup data
      await refreshAfterAdhocUpdate();

      setShowAdhocPopup(false);
      setShowToast({ key: "success", label: "Adhoc Penalty/Rebate added successfully" });
    } catch (err) {
      console.error("Error submitting ADHOC update:", err);
      setShowToast({ key: "error", error: true, label: err?.message || "Failed to add Adhoc Penalty/Rebate" });
    } finally {
      setIsAdhocUpdating(false);
    }
  };

  // Re-fetch bill + breakup data after ADHOC update
  const refreshAfterAdhocUpdate = async () => {
    try {
      const appTenantId = applicationDetails?.applicationData?.tenantId || tenantId;
      const consumerCode = applicationDetails?.applicationData?.applicationNumber;

      // 1. Re-fetch bill from billing-service
      const billResult = await Digit.PaymentService.fetchBill(appTenantId, {
        businessService: "TL",
        consumerCode: consumerCode,
      });
      setBillData(billResult?.Bill?.[0]);

      // 2. Clear cached breakup data so VIEW BREAKUP re-fetches
      setBreakupData(null);

      // 3. Pre-fetch tl-calculator _getbill
      const getbillRes = await Digit.TLService.getbill({
        tenantId: appTenantId,
        filters: { consumerCode, businessService: "TL" },
      });
      const billingSlabIds = getbillRes?.billingSlabIds || {};
      const tradeSlabEntries = billingSlabIds?.tradeTypeBillingSlabIds || [];
      const accessorySlabEntries = billingSlabIds?.accesssoryBillingSlabIds || [];

      const allSlabIds = [...tradeSlabEntries, ...accessorySlabEntries]
        .map((entry) => entry?.split("|")?.[0])
        .filter(Boolean);

      // 4. Pre-fetch billing slabs
      let slabs = [];
      if (allSlabIds.length > 0) {
        const slabRes = await Digit.TLService.billingslab({
          tenantId: appTenantId,
          filters: { ids: allSlabIds.join(",") },
        });
        slabs = slabRes?.billingSlab || [];
      }

      // 5. Rebuild breakup data
      const bill = billResult?.Bill?.[0];
      const billAccDetails = bill?.billDetails?.[0]?.billAccountDetails || [];

      const tradeUnitBreakup = tradeSlabEntries.map((entry) => {
        const slabId = entry?.split("|")?.[0];
        const slab = slabs.find((s) => s.id === slabId);
        return {
          name: t(formatTradeType(slab?.tradeType)) || "Trade Unit",
          rate: slab?.rate || 0,
        };
      });

      const accessoryBreakup = (accessorySlabEntries || []).map((entry) => {
        const slabId = entry?.split("|")?.[0];
        const slab = slabs.find((s) => s.id === slabId);
        const catFormatted = slab?.accessoryCategory?.replace(/\./g, "_")?.replace(/-/g, "_");
        return {
          name: t(`TRADELICENSE_ACCESSORIESCATEGORY_${catFormatted}`) || slab?.accessoryCategory || "Accessory",
          rate: slab?.rate || 0,
        };
      });

      const tradeUnitTotal = tradeUnitBreakup.reduce((sum, item) => sum + item.rate, 0);
      const accessoryTotal = accessoryBreakup.reduce((sum, item) => sum + item.rate, 0);
      const validityYears = applicationDetails?.applicationData?.tradeLicenseDetail?.additionalDetail?.validityYears || 1;

      const tlTax = billAccDetails.find((a) => a.taxHeadCode === "TL_TAX")?.amount || 0;
      const rebate = (billAccDetails.find((a) => a.taxHeadCode === "TL_RENEWAL_REBATE")?.amount || 0) +
                     (billAccDetails.find((a) => a.taxHeadCode === "TL_ADHOC_REBATE")?.amount || 0);
      const penalty = (billAccDetails.find((a) => a.taxHeadCode === "TL_RENEWAL_PENALTY")?.amount || 0) +
                      (billAccDetails.find((a) => a.taxHeadCode === "TL_ADHOC_PENALTY")?.amount || 0);

      setBreakupData({
        tradeUnitBreakup,
        accessoryBreakup,
        tradeUnitTotal,
        accessoryTotal,
        validityYears,
        tlTax,
        rebate,
        penalty,
        totalAmount: bill?.totalAmount || tlTax,
        finalAmount: (tradeUnitTotal + accessoryTotal) * validityYears,
      });
    } catch (err) {
      console.error("Error refreshing after ADHOC update:", err);
    }
  };

  const formatTradeType = (tradeType) => {
    if (!tradeType) return "NA";
    const formatted = tradeType.replace(/\./g, '_').replace(/-/g, '_');
    return `TRADELICENSE_TRADETYPE_${formatted}`;
  };

  // Fetch detailed calculation breakup data for the modal
  const fetchBreakupData = async () => {
    if (breakupData) {
      setShowBreakupModal(true);
      return;
    }
    setBreakupLoading(true);
    try {
      const appTenantId = applicationDetails?.applicationData?.tenantId || tenantId;
      const consumerCode = applicationDetails?.applicationData?.applicationNumber;

      // Step 1: Fetch bill — for paid apps, fetchBill may return empty, so fall back to payment history
      let bill = null;
      let billAccDetails = [];
      try {
        const fetchBillRes = await Digit.PaymentService.fetchBill(appTenantId, {
          businessService: "TL",
          consumerCode: consumerCode,
        });
        bill = fetchBillRes?.Bill?.[0];
        billAccDetails = bill?.billDetails?.[0]?.billAccountDetails || [];
      } catch (billErr) {
        console.warn("fetchBill failed (possibly paid), falling back to payment history", billErr);
      }

      // Fallback: use payment history bill data for paid applications
      if (billAccDetails.length === 0 && paymentsHistory?.Payments?.length > 0) {
        const paymentBill = paymentsHistory.Payments[0]?.paymentDetails?.[0]?.bill;
        bill = paymentBill || bill;
        billAccDetails = paymentBill?.billDetails?.[0]?.billAccountDetails || [];
      }

      // Step 2: Fetch TL calculator bill to get billingSlabIds
      const getbillRes = await Digit.TLService.getbill({ tenantId: appTenantId, filters: { consumerCode, businessService: "TL" } });
      const billingSlabIds = getbillRes?.billingSlabIds || {};
      const tradeSlabEntries = billingSlabIds?.tradeTypeBillingSlabIds || [];
      const accessorySlabEntries = billingSlabIds?.accesssoryBillingSlabIds || [];

      // Collect all slab IDs (format: "slabId|value|someId")
      const allSlabIds = [...tradeSlabEntries, ...accessorySlabEntries]
        .map((entry) => entry?.split("|")?.[ 0])
        .filter(Boolean);

      // Step 3: Fetch billing slabs
      let slabs = [];
      if (allSlabIds.length > 0) {
        const slabRes = await Digit.TLService.billingslab({ tenantId: appTenantId, filters: { ids: allSlabIds.join(",") } });
        slabs = slabRes?.billingSlab || [];
      }

      // Build trade unit breakup
      const tradeUnitBreakup = tradeSlabEntries.map((entry) => {
        const parts = entry?.split("|") || [];
        const slabId = parts[0];
        const slab = slabs.find((s) => s.id === slabId);
        return {
          name: t(formatTradeType(slab?.tradeType)) || "Trade Unit",
          rate: slab?.rate || 0,
        };
      });

      // Build accessory breakup
      const accessoryBreakup = accessorySlabEntries.map((entry) => {
        const parts = entry?.split("|") || [];
        const slabId = parts[0];
        const slab = slabs.find((s) => s.id === slabId);
        const catFormatted = slab?.accessoryCategory?.replace(/\./g, "_")?.replace(/-/g, "_");
        return {
          name: t(`TRADELICENSE_ACCESSORIESCATEGORY_${catFormatted}`) || slab?.accessoryCategory || "Accessory",
          rate: slab?.rate || 0,
        };
      });

      const tradeUnitTotal = tradeUnitBreakup.reduce((sum, item) => sum + item.rate, 0);
      const accessoryTotal = accessoryBreakup.reduce((sum, item) => sum + item.rate, 0);
      const validityYears = applicationDetails?.applicationData?.tradeLicenseDetail?.additionalDetail?.validityYears || 1;

      // Get tax head amounts from bill
      const tlTax = billAccDetails.find((a) => a.taxHeadCode === "TL_TAX")?.amount || 0;
      const rebate = (billAccDetails.find((a) => a.taxHeadCode === "TL_RENEWAL_REBATE")?.amount || 0) +
                     (billAccDetails.find((a) => a.taxHeadCode === "TL_ADHOC_REBATE")?.amount || 0);
      const penalty = (billAccDetails.find((a) => a.taxHeadCode === "TL_RENEWAL_PENALTY")?.amount || 0) +
                      (billAccDetails.find((a) => a.taxHeadCode === "TL_ADHOC_PENALTY")?.amount || 0);
      const totalAmount = bill?.totalAmount || tlTax;

      setBreakupData({
        tradeUnitBreakup,
        accessoryBreakup,
        tradeUnitTotal,
        accessoryTotal,
        validityYears,
        tlTax,
        rebate,
        penalty,
        totalAmount,
        finalAmount: (tradeUnitTotal + accessoryTotal) * validityYears,
      });
      setShowBreakupModal(true);
    } catch (error) {
      console.error("Error fetching breakup data:", error);
    } finally {
      setBreakupLoading(false);
    }
  };

  const [isDisplayDownloadMenu, setIsDisplayDownloadMenu] = useState(false);
  const [isDisplayPrintMenu, setIsDisplayPrintMenu] = useState(false);
  const applicationStatus = applicationDetails?.applicationData?.status;

  // Check if payment has been done for this application (from payment history)
  const appConsumerCode = applicationDetails?.applicationData?.applicationNumber;
  const hasPaymentDone = paymentsHistory?.Payments?.some(
    (p) => p.paymentDetails?.some((pd) => pd.bill?.consumerCode === appConsumerCode)
  );

  const isPaid = applicationStatus === "APPROVED" || applicationStatus === "EXPIRED" || hasPaymentDone;
  const isPendingPayment = (applicationStatus === "PENDINGPAYMENT" || hasPayAction) && !hasPaymentDone;
  // Show fee section whenever we have bill data or payment history for this app (any flow, any status)
  const showFeeSection = billData || hasPaymentDone;

  const dowloadOptions =
    applicationStatus === "APPROVED"
      ? [
          {
            label: t("TL_CERTIFICATE"),
            onClick: printCertificate,
          },
          {
            label: t("TL_RECEIPT"),
            onClick: printReciept,
          },
          {
            label: t("TL_APPLICATION"),
            onClick: handleDownloadPdf,
          },
          // {
          //   label: eSignLoading ? "🔄 Preparing eSign..." : "📤 eSign Certificate",
          //   onClick: printCertificateWithESign,
          //   disabled: eSignLoading,
          // },
        ]
      : [
          {
            label: t("TL_APPLICATION"),
            onClick: handleDownloadPdf,
          },
        ];

  const printOptions =
    applicationStatus === "APPROVED"
      ? [
          {
            label: t("TL_CERTIFICATE"),
            onClick: printCertificate,
          },
          {
            label: t("TL_RECEIPT"),
            onClick: printReciept,
          },
          {
            label: t("TL_APPLICATION"),
            onClick: handleDownloadPdf,
          },
        ]
      : [
          {
            label: t("TL_APPLICATION"),
            onClick: handleDownloadPdf,
          },
        ];

  return (
    <div className={"employee-main-application-details"}>
      <div className={"employee-application-details TL-mb-15"}>
        <Header>
          {applicationDetails?.applicationData?.workflowCode == "NewTL" && applicationDetails?.applicationData?.status !== "APPROVED"
            ? t("TL_TRADE_APPLICATION")
            : t("TL_TRADE_LICENSE_DETAILS_LABEL")}
        </Header>
        <div className="TL-flex-center-start-gap10">
          <div className="TL-z10-relative">
            <MultiLink
              className="multilinkWrapper"
              onHeadClick={() => { setIsDisplayDownloadMenu(!isDisplayDownloadMenu); setIsDisplayPrintMenu(false); }}
              showOptions={(val) => { setIsDisplayDownloadMenu(val); }}
              displayOptions={isDisplayDownloadMenu}
              options={dowloadOptions}
              downloadBtnClassName={"employee-download-btn-className"}
              optionsStyle={{ position: "absolute", top: "100%", right: 0, margin: 0, zIndex: 20, width: "max-content", boxShadow: "0 1px 4px rgba(0,0,0,0.16)", backgroundColor: "#fff", borderRadius: "2px" }}
              optionStyle={{ padding: "10px", cursor: "pointer" }}
            />
          </div>
          <div className="TL-z10-relative">
            <MultiLink
              className="multilinkWrapper"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18" fill="none"><path d="M17 5H3C1.34 5 0 6.34 0 8V14H4V18H16V14H20V8C20 6.34 18.66 5 17 5ZM14 16H6V11H14V16ZM17 9C16.45 9 16 8.55 16 8C16 7.45 16.45 7 17 7C17.55 7 18 7.45 18 8C18 8.55 17.55 9 17 9ZM16 0H4V4H16V0Z" fill="#1359C8"/></svg>}
              label={"Print"}
              onHeadClick={() => { setIsDisplayPrintMenu(!isDisplayPrintMenu); setIsDisplayDownloadMenu(false); }}
              showOptions={(val) => { setIsDisplayPrintMenu(val); }}
              displayOptions={isDisplayPrintMenu}
              options={printOptions}
              downloadBtnClassName={"employee-download-btn-className"}
              optionsStyle={{ position: "absolute", top: "100%", right: 0, margin: 0, zIndex: 20, width: "max-content", boxShadow: "0 1px 4px rgba(0,0,0,0.16)", backgroundColor: "#fff", borderRadius: "2px" }}
              optionStyle={{ padding: "10px", cursor: "pointer" }}
            />
          </div>
          {/* <div>
            <LinkButton label={t("VIEW_TIMELINE")} style={{ color: "#A52A2A" }} onClick={handleViewTimeline}></LinkButton>
          </div> */}
        </div>
      </div>

      {/* Fee Estimation / Amount Section */}
      {showFeeSection && (
        <Card style={{ marginTop: "16px" }}>
          <div className="TL-fee-layout">
            {/* Left: Always-visible fee line items */}
            <div className="TL-flex-1">
              <table className="TL-fee-table">
                <tbody>
                  {getFeeLineItems().map((item, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#f0f0f0" : "white" }}>
                      <td className="TL-fee-td-label">
                        {item.label}
                        {item.tooltip && (
                          <span
                            title={item.tooltip}
                            className="TL-tooltip-icon"
                          >
                            i
                          </span>
                        )}
                      </td>
                      <td className="TL-fee-td-right">
                        {item.amount}
                      </td>
                    </tr>
                  ))}
                  <tr className="TL-fee-total-row">
                    <td className="TL-fee-td-total-label">
                      Total Amount
                    </td>
                    <td className="TL-fee-td-total-amount">
                      {getTotalAmount()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right: Total Amount Summary */}
            <div className="TL-fee-summary-box">
              <div className="TL-fee-summary-label">Total Amount</div>
              <div className="TL-fee-summary-amount">
                {`Rs ${getTotalAmount()}`}
              </div>
              <div
                style={{
                  color: isPaid ? "#00703C" : "#d4351c",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                {isPaid ? "Paid Successfully" : "Not Paid"}
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="TL-fee-actions">
            <span
              className="TL-action-link"
              onClick={fetchBreakupData}
            >
              {breakupLoading ? "Loading..." : "VIEW BREAKUP"}
            </span>
            {isPendingPayment && !hasPaymentDone && (
              <span
                className="TL-action-link"
                onClick={openAdhocPopup}
              >
                ADD REBATE/PENALTY
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Calculation Breakup Modal */}
      {showBreakupModal && breakupData && (
        <BreakupModal
          breakupData={breakupData}
          onClose={() => setShowBreakupModal(false)}
        />
      )}

      {/* ADHOC Rebate/Penalty Modal */}
      {showAdhocPopup && (
        <AdhocRebatePenaltyModal
          t={t}
          licenseData={adhocLicenseData || applicationDetails?.applicationData}
          onClose={() => setShowAdhocPopup(false)}
          onSubmit={handleAdhocSubmit}
          isUpdating={isAdhocUpdating}
        />
      )}

      {/* Loader overlay when ADHOC is updating */}
      {isAdhocUpdating && (
        <div className="TL-loader-overlay">
          <Loader />
        </div>
      )}

      <ApplicationDetailsTemplate
        applicationDetails={applicationDetails}
        isLoading={isLoading}
        isDataLoading={isLoading}
        applicationData={applicationDetails?.applicationData}
        mutate={safeMutate}
        id={"timeline"}
        workflowDetails={workflowDetails}
        businessService={businessService}
        moduleCode="TL"
        showToast={showToast}
        setShowToast={setShowToast}
        closeToast={closeToast}
        timelineStatusPrefix={"WF_NEWTL_"}
        showTimeLine={false}
      />

      <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />
    </div>
  );
};

export default ApplicationDetails;
