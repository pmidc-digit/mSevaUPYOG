import Urls from "../atoms/urls";
import { Request } from "../atoms/Utils/Request";

export const RentAndLeaseService = {
  search: ({ tenantId, filters }) =>
    Request({
      url: Urls.rentAndLease.search,
      useCache: false,
      method: "POST",
      auth: true,
      userService: true,
      params: { tenantId, ...filters },
    }),

  create: (details, tenantId) =>
    Request({
      url: Urls.rentAndLease.create,
      data: details,
      useCache: true,
      method: "POST",
      params: { tenantId },
      auth: true,
      userService: true,
    }),

  generateBill: (consumerCode, tenantId, businessService, operation) =>
    Request({
      url: Urls.rentAndLease.fetch_bill,
      data: {},
      useCache: true,
      method: "POST",
      params: { consumerCode, tenantId, businessService },
      auth: true,
      userService: true,
    }),

  search_bill: (tenantId, filters) =>
    Request({
      url: filters?.businesService !== "PT" ? Urls.rentAndLease.search_bill : Urls.rentAndLease.search_bill_pt,
      useCache: false,
      method: "POST",
      data: { searchCriteria: { tenantId, ...filters } },
      auth: true,
      userService: false,
      //params: { tenantId, ...filters },
    }),

  recieptSearch: (tenantId, businessService, params) => {
    console.log("🔍 [rentAndLeaseService.recieptSearch] Params:", {
      tenantId,
      businessService,
      ...params,
    });

    return Request({
      url: Urls.rentAndLease.reciept_search,
      urlParams: { businessService },
      method: "POST",
      auth: true,
      params: { tenantId, ...params },
    });
  },

  generatePdf: (tenantId, data = {}, key) =>
    Request({
      url: Urls.rentAndLease.generate_pdf,
      useCache: false,
      method: "POST",
      auth: true,
      userService: true,
      locale: true,
      params: { tenantId, key },
      data: data,
    }),

  file_fetch: (tenantId, fileStoreIds) =>
    Request({
      url: Urls.rentAndLease.file_fetch,
      useCache: false,
      method: "GET",
      auth: true,
      userService: true,
      params: { tenantId, fileStoreIds },
    }),

  update: (details, tenantId) =>
    Request({
      url: Urls.rentAndLease.update,
      data: details,
      useCache: true,
      method: "POST",
      //params: { tenantId },
      auth: true,
      userService: true,
    }),

  downloadPdf: (challanNo, tenantId) =>
    Request({
      url: Urls.rentAndLease.download_pdf,
      data: {},
      useCache: true,
      method: "POST",
      params: { challanNo, tenantId },
      auth: true,
      locale: true,
      userService: true,
      userDownload: true,
    }),

  receipt_download: (bussinessService, consumerCode, tenantId) =>
    Request({
      url: Urls.rentAndLease.receipt_download,
      data: {},
      useCache: true,
      method: "POST",
      params: { bussinessService, consumerCode, tenantId },
      auth: true,
      locale: true,
      userService: true,
      userDownload: true,
    }),

  count: (tenantId) =>
    Request({
      url: Urls.rentAndLease.count,
      useCache: false,
      method: "POST",
      auth: true,
      userService: true,
      params: { tenantId },
    }),

  RentAndLeaseOpenSearch: ({ tenantId, filters }) =>
    Request({
      url: Urls.rentAndLease.search,
      useCache: false,
      method: "POST",
      auth: false,
      userService: false,
      params: { tenantId, ...filters },
    }),
};
