import Urls from "../atoms/urls";
import { Request } from "../atoms/Utils/Request";


export const ASSETService = {
  create: (details, tenantId) =>
    Request({
      url: Urls.asset.create,
      data: details,
      useCache: false,
      setTimeParam: false,
      userService: true,
      method: "POST",
      params: {},
      auth: true,
    }),
    assetDisposedCreate: (details, tenantId) =>
      Request({
        url: Urls.asset.assetDisposedCreate,
        data: details,
        useCache: false,
        setTimeParam: false,
        userService: true,
        method: "POST",
        params: {},
        auth: true,
      }),  
  search: ({ tenantId, filters, auth }) =>
    Request({
      url: Urls.asset.search,
      useCache: false,
      method: "POST",
      auth: auth === false ? auth : true,
      userService: auth === false ? auth : true,
      params: { tenantId, ...filters },
    }),
    update: (details, tenantId) =>
      Request({
        url: Urls.asset.update,
        data: details,
        useCache: false,
        setTimeParam: false,
        userService: true,
        method: "POST",
        params: {},
        auth: true,
    }),
    assign: (details, tenantId) =>
      Request({
        url: Urls.asset.assign,
        data: details,
        useCache: false,
        setTimeParam: false,
        userService: true,
        method: "POST",
        params: {},
        auth: true,
      }),
      depriciationProcess: (details, tenantId) =>
        Request({
          url: Urls.asset.depriciationProcess,
          data: details,
          useCache: false,
          setTimeParam: false,
          userService: true,
          method: "POST",
          params: {},
          auth: true,
        }),
        depriciationList: (details, tenantId) =>
          Request({
            url: Urls.asset.depriciationList,
            data: details,
            useCache: false,
            setTimeParam: false,
            userService: true,
            method: "POST",
            params: {},
            auth: true,
          }),
      return_asset: (details, tenantId) =>
        Request({
          url: Urls.asset.return_asset,
          data: details,
          useCache: false,
          setTimeParam: false,
          userService: true,
          method: "POST",
          params: {},
          auth: true,
      }),
    
    
};




