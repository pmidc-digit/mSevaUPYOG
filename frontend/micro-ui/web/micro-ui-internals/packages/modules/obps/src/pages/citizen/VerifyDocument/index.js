import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CardLabel, Dropdown, TextInput, Toast } from "@mseva/digit-ui-react-components";
import { LoaderNew } from "../../../components/LoaderNew";
import { BpaDetailsGrid, BpaDetailsRow } from "../../../components/BpaDetailsAccordion";
import {
  buildVerifyDocumentSearch,
  buildVerifyModuleOptions,
  findVerifyModule,
  getSearchAdapter,
  inferTenantFromApplicationNo,
  pickCityTenantId,
  readApplicationBusinessService,
} from "../../../utils/verifyDocumentModules";

const label = (t, key, fallback) => {
  const translated = t?.(key);
  return translated && translated !== key ? translated : fallback;
};

const uniqueTenants = (...values) => [...new Set(values.filter(Boolean))];

const formatStamp = (ts) => {
  const time = Number(ts);
  if (!time) return "—";
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const readQrParams = (search) => {
  const params = new URLSearchParams(search || "");
  const moduleCode = (
    params.get("module") ||
    params.get("moduleName") ||
    params.get("service") ||
    params.get("serviceType") ||
    ""
  ).trim();
  const applicationNo = (
    params.get("applicationNo") ||
    params.get("applicationNumber") ||
    params.get("applicationno") ||
    params.get("applNo") ||
    ""
  ).trim();
  const tenantId = (params.get("tenantId") || params.get("tenantid") || "").trim();
  return { moduleCode, applicationNo, tenantId, isQrLaunch: Boolean(moduleCode && applicationNo) };
};

const VerifyDocument = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { search, pathname } = useLocation();
  const qrParams = useMemo(() => readQrParams(search), [search]);
  const isLoggedIn = Boolean(Digit.UserService.getUser()?.access_token);
  const stateId = Digit.ULBService.getStateId();
  const citizenCity = window.localStorage.getItem("CITIZEN.CITY");

  const { data: workflowServices, isLoading: isWorkflowLoading } = Digit.Hooks.obps.useBusinessServiceData(stateId, "BPA,LAYOUT", {
    enabled: !!stateId,
    retry: false,
  });
  const { data: verifyModuleMdms, isLoading: isVerifyModuleLoading } = Digit.Hooks.useCustomMDMS(
    stateId,
    "BPA",
    [{ name: "VerifyDocumentModules" }],
    { retry: false }
  );
  const { data: homePageMdms, isLoading: isHomePageLoading } = Digit.Hooks.useCustomMDMS(stateId, "BPA", [{ name: "OBPSHomePageUI" }]);
  const { data: tenantMdms } = Digit.Hooks.useCustomMDMS(stateId, "tenant", [{ name: "tenants" }], { retry: false });
  const tenants = tenantMdms?.tenant?.tenants || [];

  const moduleOptions = useMemo(
    () =>
      buildVerifyModuleOptions({
        businessServices: workflowServices?.BusinessServices,
        verifyModules: verifyModuleMdms?.BPA?.VerifyDocumentModules,
        homePageUi: homePageMdms?.BPA?.OBPSHomePageUI,
      }),
    [workflowServices, verifyModuleMdms, homePageMdms]
  );
  const isModulesLoading = isWorkflowLoading || isVerifyModuleLoading || isHomePageLoading;

  const [selectedModule, setSelectedModule] = useState(null);
  const [applicationNo, setApplicationNo] = useState(qrParams.applicationNo || "");
  const [isVerifying, setIsVerifying] = useState(qrParams.isQrLaunch);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const isMountedRef = useRef(true);
  const hasAutoVerifiedRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  


  const verify = useCallback(
    async (moduleCode, appNo, extraTenantId) => {
      const module = findVerifyModule(moduleCode, moduleOptions);
      const config = getSearchAdapter(module);
      const trimmedAppNo = String(appNo || "").trim();
      if (!config || !trimmedAppNo) return;

      const writeSearch = (tenantId) => {
        const nextSearch = buildVerifyDocumentSearch({
          module: module.code,
          applicationNo: trimmedAppNo,
          tenantId,
          stateId,
        });
        if (search !== nextSearch) {
          hasAutoVerifiedRef.current = true;
          history.replace({ pathname, search: nextSearch });
        }
      };

      const inferredTenant = inferTenantFromApplicationNo(trimmedAppNo, tenants, stateId);
      const cityTenantHint = pickCityTenantId(stateId, extraTenantId, inferredTenant, citizenCity);

      setIsVerifying(true);
      setResult(null);
      try {
        let record = null;
        for (const tenantId of uniqueTenants(cityTenantHint, extraTenantId, citizenCity, stateId)) {
          const response = await config.search(tenantId, trimmedAppNo);
          record = config.pick(response);
          if (record) break;
        }

        if (!isMountedRef.current) return;

        if (!record) {
          setShowToast({
            error: true,
            message: label(t, "BPA_VERIFY_APPLICATION_NOT_FOUND", "No application found for this number in the selected module."),
          });
          return;
        }

        writeSearch(pickCityTenantId(stateId, record?.tenantId, cityTenantHint, inferredTenant));

        const status = String(config.status(record) || "").toUpperCase();
        const businessService = readApplicationBusinessService(record) || module.name || module.code;
        setResult({
          moduleCode: module.code,
          moduleName: businessService,
          record,
          status,
          isApproved: config.isApproved ? config.isApproved(status, record) : status === "APPROVED",
          signedFileId: config.signedFileId(record),
          applicant: config.applicant(record),
        });
      } catch (error) {
        if (!isMountedRef.current) return;
        setShowToast({
          error: true,
          message:
            error?.response?.data?.Errors?.[0]?.message ||
            error?.message ||
            label(t, "CS_COMMON_SOMETHING_WENT_WRONG", "Something went wrong. Please try again."),
        });
      } finally {
        if (isMountedRef.current) setIsVerifying(false);
      }
    },
    [stateId, citizenCity, t, search, pathname, history, moduleOptions, tenants]
  );

  useEffect(() => {
    if (qrParams.moduleCode) {
      const option = findVerifyModule(qrParams.moduleCode, moduleOptions);
      if (option?.name) setSelectedModule(option);
    }
    if (qrParams.applicationNo) setApplicationNo(qrParams.applicationNo);
  }, [qrParams.moduleCode, qrParams.applicationNo, moduleOptions]);

  useEffect(() => {
    if (hasAutoVerifiedRef.current || !qrParams.isQrLaunch) return;
    if (isModulesLoading) return;
    const module = findVerifyModule(qrParams.moduleCode, moduleOptions);
    if (!getSearchAdapter(module)) return;
    hasAutoVerifiedRef.current = true;
    verify(qrParams.moduleCode, qrParams.applicationNo, qrParams.tenantId);
  }, [qrParams, verify, isModulesLoading, moduleOptions]);

  const onVerify = () => {
    if (!selectedModule?.code) {
      setShowToast({ error: true, message: label(t, "BPA_VERIFY_SELECT_MODULE", "Please select a module.") });
      return;
    }
    if (!String(applicationNo || "").trim()) {
      setShowToast({
        error: true,
        message: label(t, "BPA_VERIFY_ENTER_APPLICATION_NO", "Please enter an application number."),
      });
      return;
    }
    verify(selectedModule.code, applicationNo, pickCityTenantId(stateId, qrParams.tenantId, citizenCity));
  };

  const onDownload = async () => {
    const fileStoreId = result?.signedFileId;
    if (!fileStoreId) return;

    setIsDownloading(true);
    try {
      let url = null;
      for (const tenantId of uniqueTenants(result?.record?.tenantId, qrParams.tenantId, stateId, citizenCity)) {
        try {
          const response = await Digit.PaymentService.printRecieptPublic(tenantId, { fileStoreIds: fileStoreId });
          url = response?.[fileStoreId];
          if (url) break;
        } catch (error) {
          /* wrong tenant for this file, try the next one */
        }
      }

      if (!isMountedRef.current) return;

      if (!url) {
        setShowToast({
          error: true,
          message: label(t, "BPA_VERIFY_DOCUMENT_FETCH_FAILED", "Could not fetch the approved document. Please try again."),
        });
        return;
      }
      window.location.href = url;
    } finally {
      if (isMountedRef.current) setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (result?.isApproved && result?.signedFileId && qrParams.isQrLaunch) {
      onDownload();
    }
  }, [result]);

  const goBack = () => {
    if (isLoggedIn) history.push("/digit-ui/citizen");
    else history.push("/digit-ui/landing-page");
  };

  const statusPillClass = result?.isApproved ? "plinth-draft-status-pill--applied" : "plinth-draft-status-pill--open";
  const showSearchForm = !qrParams.isQrLaunch || (!result && !isVerifying);

  return (
    <div className="plinth-draft-page">
      {(isVerifying || isDownloading || (isModulesLoading && qrParams.isQrLaunch)) && <LoaderNew page={true} />}

      <button type="button" className="plinth-draft-back" onClick={goBack}>
        ← {label(t, "CS_COMMON_BACK", "Back")}
      </button>

      <div className="plinth-draft-hero">
        <div>
          <p className="plinth-draft-hero__eyebrow">{label(t, "BPA_VERIFY_DOCUMENT_EYEBROW", "Document Verification")}</p>
          <h1 className="plinth-draft-hero__title">{label(t, "BPA_VERIFY_DOCUMENT_TITLE", "Verify Approved Document")}</h1>
          <p className="plinth-draft-hero__subtitle">
            {qrParams.isQrLaunch
              ? label(t, "BPA_VERIFY_QR_HINT", "The scanned QR is being verified. The approved document will appear below if it is available.")
              : label(
                  t,
                  "BPA_VERIFY_DOCUMENT_HINT",
                  "Select the module and enter the application number to view and download the digitally signed approved document."
                )}
          </p>
        </div>
      </div>

      {showSearchForm ? (
        <div className="plinth-draft-form-card bpa-stepper-form-section">
          <div className="plinth-draft-form-grid">
            <div className="plinth-draft-field">
              <CardLabel>
                {label(t, "BPA_VERIFY_MODULE_LABEL", "Module")}
                <span className="plinth-draft-required">*</span>
              </CardLabel>
              <Dropdown
                t={t}
                option={moduleOptions}
                optionKey="name"
                selected={selectedModule}
                select={setSelectedModule}
                placeholder={label(t, "BPA_VERIFY_MODULE_PLACEHOLDER", "Select module")}
                disable={isVerifying || isModulesLoading}
              />
            </div>

            <div className="plinth-draft-field">
              <CardLabel>
                {label(t, "BPA_APPLICATION_NUMBER_LABEL", "Application Number")}
                <span className="plinth-draft-required">*</span>
              </CardLabel>
              <div className="plinth-draft-sanction-row">
                <TextInput
                  name="applicationNo"
                  value={applicationNo}
                  onChange={(e) => setApplicationNo(e?.target?.value ?? e)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onVerify();
                    }
                  }}
                  placeholder={label(t, "BPA_VERIFY_APPLICATION_NO_PLACEHOLDER", "Enter application number")}
                  disabled={isVerifying}
                />
                <button
                  type="button"
                  className="plinth-draft-btn plinth-draft-btn--primary"
                  onClick={onVerify}
                  disabled={isVerifying}
                >
                  {isVerifying ? label(t, "CS_COMMON_LOADING", "Verifying...") : label(t, "BPA_VERIFY_ACTION", "Verify")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="plinth-draft-list-card">
          <div className="plinth-draft-list-card__header">
            <h2 className="plinth-draft-list-card__title">{label(t, "BPA_VERIFY_RESULT_TITLE", "Application found")}</h2>
            <span className={`plinth-draft-status-pill ${statusPillClass}`}>
              {t(`WF_${result.moduleCode}_${result.status}`) !== `WF_${result.moduleCode}_${result.status}`
                ? t(`WF_${result.moduleCode}_${result.status}`)
                : result.status || label(t, "CS_NA", "NA")}
            </span>
          </div>

          <BpaDetailsGrid>
            <BpaDetailsRow
              label={label(t, "BPA_VERIFY_MODULE_LABEL", "Module")}
              value={result.moduleName || result.moduleCode}
            />
            <BpaDetailsRow
              label={label(t, "BPA_APPLICATION_NUMBER_LABEL", "Application Number")}
              value={result.record?.applicationNo || label(t, "CS_NA", "NA")}
            />
            <BpaDetailsRow
              label={label(t, "BPA_APPLICANT_NAME_LABEL", "Applicant Name")}
              value={result.applicant || label(t, "CS_NA", "NA")}
            />
            <BpaDetailsRow label={label(t, "BPA_ULB_LABEL", "ULB")} value={result.record?.tenantId || label(t, "CS_NA", "NA")} />
            <BpaDetailsRow
              label={label(t, "BPA_VERIFY_APPROVED_ON", "Last Updated On")}
              value={formatStamp(result.record?.auditDetails?.lastModifiedTime || result.record?.auditDetails?.createdTime)}
            />
          </BpaDetailsGrid>

          <div className="plinth-draft-list-card__actions">
            {result.isApproved && result.signedFileId ? (
              <button
                type="button"
                className="plinth-draft-btn plinth-draft-btn--primary"
                onClick={onDownload}
                disabled={isDownloading}
              >
                {isDownloading
                  ? label(t, "CS_COMMON_LOADING", "Preparing...")
                  : label(t, "BPA_VERIFY_DOWNLOAD_DOCUMENT", "Download Approved Document")}
              </button>
            ) : (
              <p className="plinth-draft-empty">
                {result.isApproved
                  ? label(
                      t,
                      "BPA_VERIFY_NO_SIGNED_DOCUMENT",
                      "This application is approved but its digitally signed document is not available yet."
                    )
                  : label(t, "BPA_VERIFY_NOT_APPROVED", "This application is not approved yet, so there is no document to verify.")}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {showToast ? (
        <Toast error={showToast.error} label={showToast.message} isDleteBtn onClose={() => setShowToast(null)} />
      ) : null}
    </div>
  );
};

export default VerifyDocument;
