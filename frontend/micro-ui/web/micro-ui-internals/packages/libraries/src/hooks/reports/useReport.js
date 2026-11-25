import { ReportsService } from "../../services/elements/Reports";
import { useQuery } from "react-query";
import React from "react";

const useReportMeta = {
  fetchMetaData: (moduleName, reportName, tenantId, endpoint = "report", config = {}) =>
    useQuery(
      ["reportMeta", endpoint, moduleName, reportName, tenantId],
      () => ReportsService.fetchMeta({ moduleName, reportName, tenantId, endpoint }),
      config
    ),
  fetchReportData: (moduleName, reportName, tenantId, searchParams, config = {}, endpoint = "report") =>
    useQuery(
      ["reportMetaData", endpoint, moduleName, reportName, tenantId, searchParams],
      () => ReportsService.fetchReportsData({ moduleName, reportName, tenantId, searchParams, endpoint }),
      config
    ),

  fetchReportData1: (moduleName, reportName, tenantId, searchParams, config = {}) =>
    useQuery(
      ["reportMetaData", moduleName, searchParams],
      () => ReportsService.fetchReportsData1({ moduleName, reportName, tenantId, searchParams }),
      config
    ),
};
export default useReportMeta;
