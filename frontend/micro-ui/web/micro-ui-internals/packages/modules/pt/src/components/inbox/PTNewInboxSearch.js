import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const EMPTY_SEARCH = {
  acknowledgementIds: "",
  mobileNumber: "",
  propertyIds: "",
};

const PTNewInboxSearch = ({ values, onSearch }) => {
  const { t } = useTranslation();
  const [searchValues, setSearchValues] = useState({ ...EMPTY_SEARCH, ...(values || {}) });

  useEffect(() => {
    setSearchValues({ ...EMPTY_SEARCH, ...(values || {}) });
  }, [values]);

  const updateValue = (field, value) => {
    setSearchValues((current) => ({ ...current, [field]: value }));
  };

  const clearSearch = () => {
    setSearchValues(EMPTY_SEARCH);
    onSearch(EMPTY_SEARCH);
  };

  return (
    <form
      className="new-inbox-topbar pt-new-inbox-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch({ ...searchValues, mobileNumber: String(searchValues.mobileNumber || "").replace(/\D/g, "") });
      }}
    >
      <div className="pt-new-inbox-search-fields">
        <label>
          <span>{t("PT_PROPERTY_APPLICATION_NO")}</span>
          <input value={searchValues.acknowledgementIds} onChange={(event) => updateValue("acknowledgementIds", event.target.value)} />
        </label>
        <label>
          <span>{t("ES_SEARCH_APPLICATION_MOBILE_NO")}</span>
          <input type="tel" inputMode="numeric" maxLength={10} value={searchValues.mobileNumber} onChange={(event) => updateValue("mobileNumber", event.target.value.replace(/\D/g, ""))} />
        </label>
        <label>
          <span>{t("ES_INBOX_UNIQUE_PROPERTY_ID")}</span>
          <input value={searchValues.propertyIds} onChange={(event) => updateValue("propertyIds", event.target.value)} />
        </label>
      </div>
      <div className="pt-new-inbox-search-actions">
        <button type="submit" className="pt-new-inbox-search-button">{t("ES_COMMON_SEARCH")}</button>
        <button type="button" className="pt-new-inbox-clear-button" onClick={clearSearch}>{t("CS_COMMON_CLEAR_SEARCH")}</button>
        <Link to="/digit-ui/employee/pt/new-application" className="pt-new-inbox-application-button">{t("ES_TITLE_NEW_REGISTRATION")}</Link>
        <Link to="/digit-ui/employee/pt/search" className="pt-new-inbox-secondary-link">{t("PT_SEARCH_PROPERTY")}</Link>
        <Link to="/digit-ui/employee/pt/application-search" className="pt-new-inbox-secondary-link">{t("ES_COMMON_APPLICATION_SEARCH")}</Link>
      </div>
    </form>
  );
};

export default PTNewInboxSearch;
