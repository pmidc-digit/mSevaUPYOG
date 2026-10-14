import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const PTRInboxSearch = ({ values, petTypes, onSearch }) => {
  const { t } = useTranslation();
  const [searchValues, setSearchValues] = useState({
    applicationNumber: values?.applicationNumber || "",
    mobileNumber: values?.mobileNumber || "",
    petType: values?.petType || "",
  });

  useEffect(() => {
    setSearchValues({
      applicationNumber: values?.applicationNumber || "",
      mobileNumber: values?.mobileNumber || "",
      petType: values?.petType || "",
    });
  }, [values?.applicationNumber, values?.mobileNumber, values?.petType]);

  const clearSearch = () => {
    const clearedValues = { applicationNumber: "", mobileNumber: "", petType: "" };
    setSearchValues(clearedValues);
    onSearch(clearedValues);
  };

  return (
    <form
      className="new-inbox-topbar ptr-new-inbox-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(searchValues);
      }}
    >
      <div className="ptr-new-inbox-search-fields">
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
        <label>
          <span>{t("PTR_SEARCH_PET_TYPE")}</span>
          <select value={searchValues.petType} onChange={(event) => setSearchValues((current) => ({ ...current, petType: event.target.value }))}>
            <option value="">{t("Select Pet Type")}</option>
            {petTypes.map((petType) => (
              <option key={petType.code} value={petType.code}>
                {t(`${petType.code}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="ptr-new-inbox-search-actions">
        <button type="submit" className="ptr-new-inbox-search-button">
          {t("ES_COMMON_SEARCH")}
        </button>
        <button type="button" className="ptr-new-inbox-clear-button" onClick={clearSearch}>
          {t("CS_COMMON_CLEAR_SEARCH")}
        </button>
      </div>
    </form>
  );
};

export default PTRInboxSearch;
