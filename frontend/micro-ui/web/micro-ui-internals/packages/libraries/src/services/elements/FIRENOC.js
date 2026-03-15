import Urls from "../atoms/urls";

export const FIRENOCService = {
  search: async ({ filters }) => {
    const authToken = Digit.UserService.getUser()?.access_token || "";
    const params = new URLSearchParams(filters).toString();
    const resp = await fetch(`${Urls.firenoc.search}?${params}`, {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      body: JSON.stringify({
        RequestInfo: {
          apiId: "Mihy",
          ver: ".01",
          action: "",
          did: "1",
          key: "",
          msgId: `${Date.now()}|en_IN`,
          requesterId: "",
          authToken,
        },
      }),
    });
    const data = await resp.json();
    if (!resp.ok) throw data;
    return data;
  },
  create: async ({ tenantId, details }) => {
    const authToken = Digit.UserService.getUser()?.access_token || "";
    const body = {
      RequestInfo: {
        apiId: "Mihy",
        ver: ".01",
        action: "",
        did: "1",
        key: "",
        msgId: `${Date.now()}|en_IN`,
        authToken,
      },
      ...details,
    };
    const resp = await fetch(`${Urls.firenoc.create}?tenantId=${encodeURIComponent(tenantId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (!resp.ok) throw data;
    return data;
  },
  update: async ({ tenantId, details }) => {
    const authToken = Digit.UserService.getUser()?.access_token || "";
    const body = {
      RequestInfo: {
        apiId: "Mihy",
        ver: ".01",
        action: "",
        did: "1",
        key: "",
        msgId: `${Date.now()}|en_IN`,
        authToken,
      },
      ...details,
    };
    const resp = await fetch(`${Urls.firenoc.update}?tenantId=${encodeURIComponent(tenantId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (!resp.ok) throw data;
    return data;
  },
}