/**
 * Verify-document modules are the workflow businessService values
 * (BPA, Layout_mcUp, …). Search adapters stay here because each backend
 * has its own API.
 */

const firstOwnerName = (owners = []) =>
  owners.find((owner) => owner?.isPrimaryOwner)?.name || owners?.[0]?.name || "";

export const SEARCH_ADAPTERS = {
  BPA: {
    search: (tenantId, applicationNo) => Digit.OBPSService.BPASearchPublic(tenantId, { applicationNo }),
    pick: (response) => (Array.isArray(response?.BPA) ? response.BPA[0] : response?.BPA),
    status: (record) => record?.status,
    signedFileId: (record) => record?.additionalDetails?.sanctionLetterFilestoreId,
    applicant: (record) => firstOwnerName(record?.additionalDetails?.owners),
  },
  LAYOUT: {
    search: (tenantId, applicationNo) => Digit.OBPSService.LayoutSearchPublic(tenantId, {}, { applicationNo }),
    pick: (response) => (Array.isArray(response?.Layout) ? response.Layout[0] : response?.Layout),
    status: (record) => record?.applicationStatus || record?.status,
    signedFileId: (record) => record?.layoutDetails?.additionalDetails?.LOIFilestoreId,
    applicant: (record) =>
      firstOwnerName(record?.owners) ||
      record?.layoutDetails?.additionalDetails?.applicationDetails?.applicantOwnerOrFirmName,
  },
  NOC: {
    search: (tenantId, applicationNo) => Digit.OBPSService.NOCSearchPublic(tenantId, { applicationNo }),
    pick: (response) => (Array.isArray(response?.Noc) ? response.Noc[0] : response?.Noc),
    status: (record) => record?.applicationStatus || record?.status,
    isApproved: (status) => status === "E-SIGNED",
    signedFileId: (record) => record?.nocDetails?.additionalDetails?.sanctionLetterFilestoreId,
    applicant: (record) =>
      firstOwnerName(record?.owners) ||
      record?.nocDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.firmName ||
      record?.nocDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.ownerOrFirmName,
  },
  CLU: {
    search: (tenantId, applicationNo) => Digit.OBPSService.CLUSearchPublic({ tenantId, filters: { applicationNo } }),
    pick: (response) => (Array.isArray(response?.Clu) ? response.Clu[0] : response?.Clu),
    status: (record) => record?.applicationStatus || record?.status,
    isApproved: (status) => status === "E-SIGNED",
    signedFileId: (record) =>
      record?.cluDetails?.additionalDetails?.sanctionLetterFilestoreId || record?.additionalDetails?.sanctionLetterFilestoreId,
    applicant: (record) =>
      firstOwnerName(record?.owners) ||
      record?.cluDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.firmName ||
      record?.cluDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.ownerOrFirmName,
  },
};

const asKey = (value) => String(value || "").trim().toUpperCase();

/** Payment / fee heads are not application modules. */
const isFeeBusinessService = (code) => /PAY|FEE|BILL|COLLECTION/.test(asKey(code));

export const inferSearchTypeFromBusinessService = (code) => {
  const key = asKey(code);
  if (!key || isFeeBusinessService(key)) return "";
  if (key.includes("LAYOUT")) return "LAYOUT";
  if (key.includes("BPA")) return "BPA";
  if (key.includes("NOC")) return "NOC";
  if (key.includes("CLU")) return "CLU";
  return SEARCH_ADAPTERS[key] ? key : "";
};

export const readApplicationBusinessService = (record) =>
  record?.businessService ||
  record?.layoutDetails?.additionalDetails?.siteDetails?.businessService ||
  record?.nocDetails?.additionalDetails?.businessService ||
  record?.cluDetails?.additionalDetails?.businessService ||
  record?.additionalDetails?.businessService ||
  "";

const toBusinessServiceOption = (item) => {
  const code = String(item?.businessService || item?.code || item || "").trim();
  const searchType = inferSearchTypeFromBusinessService(code);
  if (!code || !searchType) return null;
  if (item?.active === false || item?.enabled === false) return null;
  return {
    code,
    name: code,
    searchType,
    aliases: [asKey(code), searchType].filter(Boolean),
  };
};

const dedupeOptions = (options) => {
  const seen = new Set();
  return options.filter((option) => {
    const key = asKey(option?.code);
    if (!option || !key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const ensureSearchableModules = (options) => {
  const next = [...options];
  const haveType = new Set(next.map((item) => item.searchType));
  Object.keys(SEARCH_ADAPTERS).forEach((searchType) => {
    if (haveType.has(searchType)) return;
    next.push({ code: searchType, name: searchType, searchType, aliases: [searchType] });
  });
  return next;
};

export const buildVerifyModuleOptions = ({ businessServices, verifyModules, homePageUi } = {}) => {
  const fromWorkflow = (Array.isArray(businessServices) ? businessServices : []).map(toBusinessServiceOption).filter(Boolean);
  const fromDedicated = (Array.isArray(verifyModules) ? verifyModules : []).map(toBusinessServiceOption).filter(Boolean);
  const fromHome = (Array.isArray(homePageUi) ? homePageUi : [])
    .map((item) => {
      const raw = item?.title || item?.code || item?.name || "";
      const searchType = inferSearchTypeFromBusinessService(raw);
      return searchType ? toBusinessServiceOption({ code: searchType, businessService: searchType }) : null;
    })
    .filter(Boolean);

  return ensureSearchableModules(dedupeOptions([...fromWorkflow, ...fromDedicated, ...fromHome]));
};

export const findVerifyModule = (value, options = []) => {
  const key = asKey(value);
  if (!key) return null;
  return (
    options.find((item) => asKey(item.code) === key || item.aliases.includes(key)) ||
    options.find((item) => item.searchType === key) ||
    (SEARCH_ADAPTERS[key] ? { code: key, name: key, searchType: key, aliases: [] } : null)
  );
};

export const getSearchAdapter = (moduleOrType) =>
  SEARCH_ADAPTERS[asKey(moduleOrType?.searchType || inferSearchTypeFromBusinessService(moduleOrType) || moduleOrType)] || null;

const isStateLevelTenant = (tenantId, stateId) => {
  const value = String(tenantId || "").trim();
  if (!value) return true;
  if (stateId && value === stateId) return true;
  return !value.includes(".");
};

/** City ULB only — never state `cg`. */
export const pickCityTenantId = (stateId, ...values) =>
  values.find((value) => String(value || "").trim() && !isStateLevelTenant(value, stateId)) || "";

/** CG/RPR/TNCP/... → match MDMS tenant city code / name, e.g. cg.raipur. */
export const inferTenantFromApplicationNo = (applicationNo, tenants = [], stateId) => {
  const cityToken = String(applicationNo || "").split("/")[1]?.trim();
  if (!cityToken) return "";
  const key = cityToken.toUpperCase();
  const match = (tenants || []).find((tenant) => {
    const code = String(tenant?.code || "").toUpperCase();
    const cityCode = String(tenant?.city?.code || tenant?.cityCode || "").toUpperCase();
    const name = String(tenant?.name || tenant?.city?.name || "").toUpperCase().replace(/\s+/g, "");
    const codeCity = code.includes(".") ? code.split(".").pop() : code;
    return cityCode === key || cityCode.endsWith(`.${key}`) || codeCity === key || name === key;
  });
  return pickCityTenantId(stateId, match?.code);
};

/** Query used by Verify QR: module, applicationNo, tenantId. */
export const buildVerifyDocumentSearch = ({ module, applicationNo, tenantId, stateId } = {}) => {
  const params = new URLSearchParams();
  if (module) params.set("module", module);
  if (applicationNo) params.set("applicationNo", applicationNo);
  const cityTenant = pickCityTenantId(stateId, tenantId);
  if (cityTenant) params.set("tenantId", cityTenant);
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const buildVerifyDocumentHref = ({ module, applicationNo, tenantId, origin } = {}) => {
  const base = `${origin || (typeof window !== "undefined" ? window.location.origin : "")}/digit-ui/citizen/obps/verify-document`;
  return `${base}${buildVerifyDocumentSearch({ module, applicationNo, tenantId })}`;
};
