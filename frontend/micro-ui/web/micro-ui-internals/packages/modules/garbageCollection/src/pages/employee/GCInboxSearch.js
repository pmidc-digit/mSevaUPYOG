import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const GCInboxSearch = ({ values, onSearch }) => {
  const { t } = useTranslation();
  const [searchValues, setSearchValues] = useState({
    applicationNumber: values?.applicationNumber || "",
    mobileNumber: values?.mobileNumber || "",
  });

  useEffect(() => {
    setSearchValues({
      applicationNumber: values?.applicationNumber || "",
      mobileNumber: values?.mobileNumber || "",
    });
  }, [values?.applicationNumber, values?.mobileNumber]);

  const clearSearch = () => {
    const clearedValues = { applicationNumber: "", mobileNumber: "" };
    setSearchValues(clearedValues);
    onSearch(clearedValues);
  };

  return (
    <form
      className="new-inbox-topbar gc-new-inbox-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(searchValues);
      }}
    >
      <div className="gc-new-inbox-search-fields">
        <label>
          <span>{t("NOC_HOME_SEARCH_RESULTS_APP_NO_LABEL")}</span>
          <input
            type="text"
            value={searchValues.applicationNumber}
            onChange={(event) => setSearchValues((current) => ({ ...current, applicationNumber: event.target.value }))}
          />
        </label>
        <label>
          <span>{t("CORE_COMMON_PHONE_NUMBER")}</span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={searchValues.mobileNumber}
            onChange={(event) => setSearchValues((current) => ({ ...current, mobileNumber: event.target.value.replace(/\D/g, "") }))}
          />
        </label>
      </div>
      <div className="gc-new-inbox-search-actions">
        <button type="submit" className="gc-new-inbox-search-button">
          {t("ES_COMMON_SEARCH")}
        </button>
        <button type="button" className="gc-new-inbox-clear-button" onClick={clearSearch}>
          {t("CS_COMMON_CLEAR_SEARCH")}
        </button>
      </div>
    </form>
  );
};

export default GCInboxSearch;
