import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const EMPTY_SEARCH = {
  applicationNumber: "",
  mobileNumber: "",
  tradeLicenseNumber: "",
  applicationType: "",
  fromDate: "",
  toDate: "",
  ownerName: "",
};

const getDateInputValue = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const getFormValues = (values) => ({
  ...EMPTY_SEARCH,
  ...(values || {}),
  fromDate: getDateInputValue(values?.fromDate),
  toDate: getDateInputValue(values?.toDate),
});

const TLNewInboxSearch = ({ values, onSearch, onNewApplication }) => {
  const { t } = useTranslation();
  const [searchValues, setSearchValues] = useState(() => getFormValues(values));

  useEffect(() => {
    setSearchValues(getFormValues(values));
  }, [values]);

  const updateValue = (field, value) => {
    setSearchValues((current) => ({ ...current, [field]: value }));
  };

  const submitSearch = (event) => {
    event.preventDefault();
    onSearch({
      ...searchValues,
      mobileNumber: String(searchValues.mobileNumber || "").replace(/\D/g, ""),
      fromDate: searchValues.fromDate ? new Date(searchValues.fromDate).getTime() : "",
      toDate: searchValues.toDate ? new Date(`${searchValues.toDate}T23:59:59.999`).getTime() : "",
    });
  };

  const clearSearch = () => {
    setSearchValues(EMPTY_SEARCH);
    onSearch(EMPTY_SEARCH);
  };

  return (
    <form className="new-inbox-topbar tl-new-inbox-search" onSubmit={submitSearch}>
      <div className="tl-new-inbox-search-fields">
        <label>
          <span>{t("TL_HOME_SEARCH_RESULTS_APP_NO_LABEL")}</span>
          <input value={searchValues.applicationNumber} onChange={(event) => updateValue("applicationNumber", event.target.value)} />
        </label>
        <label>
          <span>{t("CORE_COMMON_MOBILE_NUMBER")}</span>
          <input type="tel" inputMode="numeric" maxLength={10} value={searchValues.mobileNumber} onChange={(event) => updateValue("mobileNumber", event.target.value.replace(/\D/g, ""))} />
        </label>
        <label>
          <span>{t("TL_HOME_SEARCH_RESULTS_TRADE_LICENSE_NO_LABEL")}</span>
          <input value={searchValues.tradeLicenseNumber} onChange={(event) => updateValue("tradeLicenseNumber", event.target.value)} />
        </label>
        <label>
          <span>{t("TL_APPLICATION_TYPE_LABEL")}</span>
          <select value={searchValues.applicationType} onChange={(event) => updateValue("applicationType", event.target.value)}>
            <option value="">{t("TL_SELECT_APPLICATION_TYPE")}</option>
            <option value="NEW">{t("TL_NEW")}</option>
            <option value="RENEWAL">{t("TL_RENEWAL")}</option>
          </select>
        </label>
        <label>
          <span>{t("TL_FROM_DATE_LABEL")}</span>
          <input type="date" value={searchValues.fromDate} onChange={(event) => updateValue("fromDate", event.target.value)} />
        </label>
        <label>
          <span>{t("TL_TO_DATE_LABEL")}</span>
          <input type="date" value={searchValues.toDate} onChange={(event) => updateValue("toDate", event.target.value)} />
        </label>
        <label>
          <span>{t("TL_OWNER_NAME_LABEL")}</span>
          <input value={searchValues.ownerName} onChange={(event) => updateValue("ownerName", event.target.value)} />
        </label>
      </div>
      <div className="tl-new-inbox-search-actions">
        <button type="submit" className="tl-new-inbox-search-button">{t("ES_COMMON_SEARCH")}</button>
        <button type="button" className="tl-new-inbox-clear-button" onClick={clearSearch}>{t("CS_COMMON_CLEAR_SEARCH")}</button>
        <button type="button" className="tl-new-inbox-application-button" onClick={onNewApplication}>{t("TL_NEW_APPLICATION")}</button>
      </div>
    </form>
  );
};

export default TLNewInboxSearch;
