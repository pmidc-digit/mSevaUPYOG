import Urls from "../atoms/urls";
import { Request } from "../atoms/Utils/Request";

export const ChallanGenerationService = {
  search: ({ tenantId, filters }) =>
    Request({
      url: Urls.challangeneration.search_new,
      useCache: false,
      method: "POST",
      auth: true,
      userService: true,
      params: { tenantId, ...filters },
    }),

  create: (details, tenantId) =>
    Request({
      url: Urls.challangeneration.create_new,
      data: details,
      useCache: true,
      method: "POST",
      params: { tenantId },
      auth: true,
      userService: true,
    }),

  generateBill: (consumerCode, tenantId, businessService, operation) =>
    Request({
      url: Urls.challangeneration.fetch_bill,
      data: {},
      useCache: true,
      method: "POST",
      params: { consumerCode, tenantId, businessService },
      auth: true,
      userService: true,
    }),

  search_bill: (tenantId, filters) =>
    Request({
      url: filters?.businesService !== "PT" ? Urls.challangeneration.search_bill : Urls.challangeneration.search_bill_pt,
      useCache: false,
      method: "POST",
      data: { searchCriteria: { tenantId, ...filters } },
      auth: true,
      userService: false,
      //params: { tenantId, ...filters },
    }),

  recieptSearch: (tenantId, businessService, params) => {
    console.log("🔍 [challangenerationService.recieptSearch] Params:", {
      tenantId,
      businessService,
      ...params,
    });

    return Request({
      url: Urls.challangeneration.reciept_search,
      urlParams: { businessService },
      method: "POST",
      auth: true,
      params: { tenantId, ...params },
    });
  },

  generatePdf: (tenantId, data = {}, key) =>
    Request({
      url: Urls.challangeneration.generate_pdf,
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
      url: Urls.challangeneration.file_fetch,
      useCache: false,
      method: "GET",
      auth: true,
      userService: true,
      params: { tenantId, fileStoreIds },
    }),

  update: (details, tenantId) =>
    Request({
      url: Urls.challangeneration.update_new,
      data: details,
      useCache: true,
      method: "POST",
      //params: { tenantId },
      auth: true,
      userService: true,
    }),

  downloadPdf: (challanNo, tenantId) =>
    Request({
      url: Urls.challangeneration.download_pdf,
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
      url: Urls.challangeneration.receipt_download,
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
      url: Urls.challangeneration.count,
      useCache: false,
      method: "POST",
      auth: true,
      userService: true,
      params: { tenantId },
    }),

  ChallanGenerationOpenSearch: ({ tenantId, filters }) =>
    Request({
      url: Urls.challangeneration.search,
      useCache: false,
      method: "POST",
      auth: false,
      userService: false,
      params: { tenantId, ...filters },
    }),
};
