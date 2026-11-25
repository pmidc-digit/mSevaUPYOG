import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Toast } from "@mseva/digit-ui-react-components";
import { buildSearchParams, getMissingMandatoryFields, getReportEndpoint, getResultLabel } from "../util";

// Generic report page — same flow as the old rainmaker report module (report.js + searchForm.js):
//  1. POST /{report|report-v2}/{module}/metadata/_get   -> search form definition
//  2. POST /{report|report-v2}/{module}/_get            -> report rows, on "Apply"
// Works for every report defined in the report service; nothing here is report specific
// except the two rules the old module also had (oldPGR date strings, PT ReceiptRegister_V2 7-day limit).

const getErrorMessage = (error, t) => {
  const apiError = error?.response?.data?.Errors?.[0];
  const msg = apiError?.message || apiError?.code;
  return msg ? t(msg) : t("Something went wrong or try again later");
};

const Report = () => {
  const { endpoint: routeEndpoint, moduleName, reportName } = useParams();
  const endpoint = getReportEndpoint(routeEndpoint);
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const [filter, setFilter] = useState(null);
  const [searchData, setSearchData] = useState({});
  const [resultLabel, setResultLabel] = useState("");
  const [toast, setToast] = useState(null);
  const lastFilter = useRef(null);

  const showError = (label) => setToast({ label, error: true });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const { isLoading: SearchFormIsLoading, data: SearchFormUIData, isError: isMetaError, error: metaError } =
    Digit.Hooks.reports.useReportMeta.fetchMetaData(moduleName, reportName, tenantId, endpoint, {
      onError: (err) => showError(getErrorMessage(err, t)),
    });

  const { isFetching: isLoadingReportsData, data: ReportsData, refetch } = Digit.Hooks.reports.useReportMeta.fetchReportData(
    moduleName,
    reportName,
    tenantId,
    filter,
    {
      enabled: filter !== null,
      onError: (err) => showError(getErrorMessage(err, t)),
    },
    endpoint
  );

  const SearchApplication = Digit.ComponentRegistryService.getComponent("ReportSearchApplication");

  const onSubmit = (data) => {
    const searchFields = SearchFormUIData?.reportDetails?.searchParams || [];

    if (getMissingMandatoryFields(data, searchFields).length) {
      showError(t("COMMON_MANDATORY_MISSING_ERROR") !== "COMMON_MANDATORY_MISSING_ERROR" ? t("COMMON_MANDATORY_MISSING_ERROR") : "Please fill all mandatory fields to search");
      return;
    }

    const { searchParams, error } = buildSearchParams({ formData: data, searchFields, moduleName, reportName });
    if (error) {
      const fallback = {
        REPORT_SEARCHFORM_DATE_GREATER: "To date should be greater than or equal to From date",
        COMMON_MANDATORY_SEVEN_ERROR: "Date range should not be more than 7 days",
      };
      showError(t(error) !== error ? t(error) : fallback[error] || error);
      return;
    }

    setSearchData(data);
    setResultLabel(getResultLabel(data, t));

    // Same filter again -> fetch again (old "Apply" always re-queried)
    const key = JSON.stringify(searchParams);
    if (lastFilter.current === key && filter !== null) refetch();
    lastFilter.current = key;
    setFilter(searchParams);
  };

  const onReset = () => {
    setFilter(null);
    lastFilter.current = null;
    setResultLabel("");
  };

  const hasResult = filter !== null && !isLoadingReportsData && ReportsData;
  const noData = hasResult && !(ReportsData?.reportData?.length > 0);

  return (
    <React.Fragment>
      <SearchApplication
        onSubmit={onSubmit}
        onReset={onReset}
        isLoading={SearchFormIsLoading}
        isMetaError={isMetaError}
        metaError={metaError}
        data={SearchFormUIData}
        tableData={filter === null ? null : noData ? { display: "ES_COMMON_NO_DATA" } : ReportsData}
        isTableDataLoading={filter !== null && isLoadingReportsData}
        Count={ReportsData?.reportData?.length || 0}
        searchData={searchData}
        reportName={reportName}
        moduleName={moduleName}
        resultLabel={resultLabel}
        tenantId={tenantId}
      />
      {toast && (
        <Toast error={toast.error} label={toast.label} isDleteBtn={true} onClose={() => setToast(null)} style={{ zIndex: 10000 }} />
      )}
    </React.Fragment>
  );
};

export default Report;
