import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ApplicationDetailsTemplate from "../../../../templates/ApplicationDetails";
import NewApplicationTimeline from "../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
import cloneDeep from "lodash/cloneDeep";
import { useParams } from "react-router-dom";
import { Header, MultiLink, LinkButton } from "@mseva/digit-ui-react-components";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import getPDFData from "../../utils/getTLAcknowledgementData";

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
    filteredActions = get(workflowDetails?.data?.processInstances[0], "nextActions", [])?.filter((item) => item.action != "ADHOC");
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

  if (rolearray && applicationDetails?.applicationData?.status === "PENDINGPAYMENT") {
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
    console.log("applicationDetails here: ", applicationDetails);
    console.log("applicationData here: ", applicationDetails?.applicationData);
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
    console.log("res1res1res1res1res1", res1);
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
        console.error("❌ PDF Generation failed:", pdfError);

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
      console.error("❌ Certificate generation failed:", error);
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
      console.error("❌ Certificate download failed:", error);
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
      console.log("🎯 Starting certificate eSign process with custom hook...");

      // Reuse existing certificate data or generate if not available
      const { fileStoreId } = await generateCertificateData();

      // Use custom hook for eSign
      eSignCertificate(
        { fileStoreId, tenantId },
        {
          onSuccess: () => {
            console.log("✅ eSign process initiated successfully");
            setIsDisplayDownloadMenu(false);
          },
          onError: (error) => {
            console.error("❌ Certificate eSign failed:", error);
            setShowToast({
              key: "error",
              error: true,
              label: error.message || "Failed to initiate digital signing process",
            });
          },
        }
      );
    } catch (error) {
      console.error("❌ Certificate preparation failed:", error);
      setShowToast({
        key: "error",
        error: true,
        label: error.message || "Failed to prepare certificate for eSign",
      });
    }
  };
  const [isDisplayDownloadMenu, setIsDisplayDownloadMenu] = useState(false);
  const applicationStatus = applicationDetails?.applicationData?.status;

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

  return (
    <div className={"employee-main-application-details"}>
      <div className={"employee-application-details"} style={{ marginBottom: "15px" }}>
        <Header>
          {applicationDetails?.applicationData?.workflowCode == "NewTL" && applicationDetails?.applicationData?.status !== "APPROVED"
            ? t("TL_TRADE_APPLICATION")
            : t("TL_TRADE_LICENSE_DETAILS_LABEL")}
        </Header>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ zIndex: "10", position: "relative" }}>
            <MultiLink
              className="multilinkWrapper"
              onHeadClick={() => setIsDisplayDownloadMenu(!isDisplayDownloadMenu)}
              displayOptions={isDisplayDownloadMenu}
              options={dowloadOptions}
              downloadBtnClassName={"employee-download-btn-className"}
              optionsClassName={"employee-options-btn-className"}
              optionStyle={{ padding: "10px" }}
            />
          </div>
          {/* <div>
            <LinkButton label={t("VIEW_TIMELINE")} style={{ color: "#A52A2A" }} onClick={handleViewTimeline}></LinkButton>
          </div> */}
        </div>
      </div>
      <ApplicationDetailsTemplate
        applicationDetails={applicationDetails}
        isLoading={isLoading}
        isDataLoading={isLoading}
        applicationData={applicationDetails?.applicationData}
        mutate={mutate}
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
