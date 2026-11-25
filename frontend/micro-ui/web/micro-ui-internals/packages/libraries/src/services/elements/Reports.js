import Urls from "../atoms/urls";
import { Request } from "../atoms/Utils/Request";

// Same URL rules as the old rainmaker report module (commons/url.js):
//   /{report | report-v2}/{moduleName}/metadata/_get   and   /{report | report-v2}/{moduleName}/_get
// The report name travels in the request body, never in the URL.
const getReportBase = (endpoint) => (endpoint === "report-v2" ? "/report-v2/" : Urls.reports.reportSearch);

export const ReportsService = {
    fetchMeta: ({ moduleName, reportName, tenantId, endpoint }) => {
        return Request({
            url: `${getReportBase(endpoint)}${moduleName}/metadata/_get`,
            params: { tenantId, pageSize: false, offset: 0 },
            method: "POST",
            auth: true,
            userService: true,
            reqTimestamp:true,
            data: { reportName: reportName, tenantId: tenantId },
        })
    },
    fetchReportsData:({moduleName,reportName,tenantId,searchParams,endpoint}) => {
        return Request({
            url: `${getReportBase(endpoint)}${moduleName}/_get`,
            params: { tenantId, pageSize: false, offset: 0 },
            method: "POST",
            auth: true,
            userService: true,
            reqTimestamp: true,
            data: { reportName: reportName, tenantId: tenantId, searchParams },
        })
    },
    fetchReportsData1: ({ moduleName, reportName, tenantId, searchParams }) => {
      return Request({
        url: `${Urls.reports.reportSearch}${moduleName}/_get`,
        params: {},
        method: "POST",
        auth: true,
        userService: true,
        reqTimestamp: true,
        data: { reportName: reportName, tenantId: tenantId, searchParams },
      });
    },
}
