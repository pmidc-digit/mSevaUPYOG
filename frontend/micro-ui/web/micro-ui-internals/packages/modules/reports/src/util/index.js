// Helpers ported from the old rainmaker report module
// (rainmaker/packages/employee/src/modules/employee/reports).

export const ALL_OPTION_CODE = "__ALL__";

/** "report" | "report-v2" — which report-service endpoint a page URL maps to (old commons/url.js). */
export const getReportEndpoint = (routeEndpoint) => (routeEndpoint === "report-v2" ? "report-v2" : "report");

/** Parses the DatePicker value ("YYYY-MM-DD") as a LOCAL date (new Date("YYYY-MM-DD") would be UTC midnight). */
export const parseLocalDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const pad2 = (n) => (n > 9 ? `${n}` : `0${n}`);

/** Date -> "YYYY-MM-DD" (DatePicker value format). */
export const toInputDate = (date) => (date ? `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}` : "");

/** epoch / Date -> "dd/mm/yyyy" (old reportResult.checkIfDate). */
export const epochToDisplayDate = (value) => {
  if (value === null || value === undefined || value === "") return value;
  const d = new Date(Number(value));
  if (isNaN(d.getTime())) return value;
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/** Date -> "d/m/yyyy" as used in the old "Showing data for" label. */
const shortDate = (d) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

/** Indian-style digit grouping, e.g. 1234567.5 -> "12,34,567.5" (old reportResult.addCommas). */
export const addCommas = (num) => {
  if (num === null || num === undefined || num === "" || isNaN(num)) return num;
  let value = num.toString().trim();
  const decLoc = value.indexOf(".") > -1 ? value.indexOf(".") : value.length;
  let i = decLoc - 3;
  if (i >= 1 && value.charAt(i - 1) !== "-") {
    value = value.substr(0, i) + "," + value.substr(i, value.length);
    i -= 2;
    while (i >= 1) {
      if (value.charAt(i - 1) === "-") break;
      value = value.substr(0, i) + "," + value.substr(i, value.length);
      i -= 2;
    }
  }
  return value;
};

/** Number formatting for currency / total columns (old checkIfDate's numeric branch). */
export const formatAmount = (val) => {
  const n = Number(val);
  if (val === null || val === undefined || val === "" || isNaN(n)) return val;
  return addCommas(n % 1 === 0 ? n : n.toFixed(2));
};

/** Pulls a number out of a cell, ignoring commas and trailing text (old renderFooter.intVal). */
export const toNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").replace(/[^-+0-9. ]/g, " ").split(" ")[0];
    if (cleaned === "" || isNaN(Number(cleaned))) return undefined;
    return Number(cleaned);
  }
  return undefined;
};

export const isAmountColumn = (header) => header?.type === "currency" || !!header?.total;

/** "ReceiptRegisterSummary_V2" -> "Receipt Register Summary_ V2" — same split as the old getReportTitle. */
export const getReportTitleFromName = (reportName = "") =>
  (reportName || "")
    .split(/(?=[A-Z])/)
    .map((part) => (part.length === 1 ? part : ` ${part}`))
    .join("")
    .trim();

/** Report heading: additionalConfig.reportTitle (translated) when present, otherwise the split report name. */
export const getReportTitle = (reportDetails, reportName, t) => {
  const configured = reportDetails?.additionalConfig?.reportTitle;
  if (configured) return t ? t(configured) : configured;
  return getReportTitleFromName(reportDetails?.reportName || reportName);
};

/** Converts the old "options of a dropdown" map ({key: label}) into [{code, name}] with an "All" entry first. */
export const getDropdownOptions = (defaultValue, t, { localisationPrefix, localisationRequired } = {}) => {
  if (!defaultValue || typeof defaultValue !== "object" || Object.keys(defaultValue).length === 0) return [];
  const opts = Object.keys(defaultValue).map((code) => {
    const label = defaultValue[code];
    return { code, name: localisationRequired && localisationPrefix ? t(`${localisationPrefix}${label}`) : t ? t(label) : label };
  });
  return [{ code: ALL_OPTION_CODE, name: t ? t("ALL") : "All" }, ...opts];
};

/** Returns the field's initial form value from metadata.initialValue (old componentWillReceiveProps). */
export const getInitialFieldValue = (field, t) => {
  const initial = field?.initialValue;
  if (initial === undefined || initial === null || initial === "") return undefined;
  switch (field.type) {
    case "epoch":
    case "date":
      return toInputDate(parseLocalDate(initial));
    case "singlevaluelist":
      return getDropdownOptions(field.defaultValue, t, field).find((o) => o.code === `${initial}`);
    case "multivaluelist":
      return getDropdownOptions(field.defaultValue, t, field).filter((o) => [].concat(initial).map(String).includes(o.code));
    case "checkbox":
      return !!initial;
    default:
      return initial;
  }
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Builds the report-service searchParams from the form values, following the old searchForm.search():
 *  - display-only fields are not sent, "All" / empty values are skipped
 *  - fromDate -> start of day, toDate -> end of day (oldPGR uses "YYYY-MM-DD HH:mm:ss" strings)
 *  - boundarylist sends the locality code array
 * Returns { searchParams, error } where error is a localisation key when validation fails.
 */
export const buildSearchParams = ({ formData = {}, searchFields = [], moduleName, reportName }) => {
  const searchParams = [];
  const fieldByName = {};
  searchFields.forEach((f) => (fieldByName[f.name] = f));

  for (const field of searchFields) {
    if (field.displayOnly || field.name === "tenantId") continue;
    const value = formData[field.name];
    let input;

    switch (field.type) {
      case "epoch":
      case "date": {
        const d = parseLocalDate(value);
        if (!d) break;
        if (moduleName === "oldPGR" && (field.name === "fromDate" || field.name === "toDate")) {
          input = `${toInputDate(d)} ${field.name === "fromDate" ? "00:00:00" : "23:59:59"}`;
        } else if (field.name === "toDate") {
          d.setHours(23, 59, 59, 999);
          input = d.getTime();
        } else {
          d.setHours(0, 0, 0, 0);
          input = d.getTime();
        }
        break;
      }
      case "singlevaluelist":
        if (value && typeof value === "object") input = value.code;
        else input = value;
        if (input === ALL_OPTION_CODE) input = undefined;
        break;
      case "multivaluelist": {
        const codes = (Array.isArray(value) ? value : []).map((v) => (v && typeof v === "object" ? v.code : v)).filter(Boolean);
        input = codes.length && !codes.includes(ALL_OPTION_CODE) ? codes : undefined;
        break;
      }
      case "boundarylist":
        input = value?.localityArray?.length ? value.localityArray : undefined;
        break;
      case "checkbox":
        input = value ? true : undefined;
        break;
      default:
        input = typeof value === "string" ? value.trim() : value;
    }

    if (input !== undefined && input !== null && input !== "" && input !== "All") {
      searchParams.push({ name: field.name, input });
    }
  }

  // fromDate must not be after toDate (old validateDate)
  const from = searchParams.find((p) => p.name === "fromDate")?.input;
  const to = searchParams.find((p) => p.name === "toDate")?.input;
  if (typeof from === "number" && typeof to === "number" && to < from) {
    return { searchParams, error: "REPORT_SEARCHFORM_DATE_GREATER" };
  }
  // Old rule: PT ReceiptRegister_V2 allows at most 7 days
  if (
    moduleName === "rainmaker-pt" &&
    reportName === "ReceiptRegister_V2" &&
    typeof from === "number" &&
    typeof to === "number" &&
    (to - from) / DAY_MS > 7
  ) {
    return { searchParams, error: "COMMON_MANDATORY_SEVEN_ERROR" };
  }
  return { searchParams };
};

/** Mandatory fields that have no value (old search() mandatory check). Boundary is always filled, like the old picker. */
export const getMissingMandatoryFields = (formData = {}, searchFields = []) =>
  searchFields
    .filter((f) => f.isMandatory && f.name !== "tenantId" && !f.displayOnly && f.type !== "boundarylist")
    .filter((f) => {
      const v = formData[f.name];
      if (Array.isArray(v)) return v.length === 0;
      if (v && typeof v === "object") return !v.code && !Object.keys(v).length;
      return v === undefined || v === null || v === "";
    })
    .map((f) => f.name);

/** "Showing data for : d/m/yyyy to d/m/yyyy  Zone: x Block: y" (old fetchResults tab label). */
export const getResultLabel = (formData = {}, t) => {
  let label = "";
  const from = parseLocalDate(formData.fromDate);
  const to = parseLocalDate(formData.toDate);
  if (from && to) label = `Showing data for : ${shortDate(from)} to ${shortDate(to)}`;
  const boundary = Object.values(formData).find((v) => v && typeof v === "object" && v.selected && v.localityArray);
  if (boundary) {
    Object.entries(boundary.selected).forEach(([level, node]) => {
      if (node?.name) label += `  ${level}: ${node.name}`;
    });
  }
  return label.trim();
};
