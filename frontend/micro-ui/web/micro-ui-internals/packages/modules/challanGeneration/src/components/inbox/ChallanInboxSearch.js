import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const ChallanInboxSearch = ({ values, onSearch }) => {
  const { t } = useTranslation();
  const [searchValues, setSearchValues] = useState({
    challanNo: values?.challanNo || "",
    mobileNumber: values?.mobileNumber || "",
  });

  useEffect(() => {
    setSearchValues({
      challanNo: values?.challanNo || "",
      mobileNumber: values?.mobileNumber || "",
    });
  }, [values?.challanNo, values?.mobileNumber]);

  const clearSearch = () => {
    const clearedValues = { challanNo: "", mobileNumber: "" };
    setSearchValues(clearedValues);
    onSearch(clearedValues);
  };

  return (
    <form
      className="new-inbox-topbar challan-new-inbox-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(searchValues);
      }}
    >
      <div className="challan-new-inbox-search-fields">
        <label>
          <span>{t("UC_CHALLAN_NO")}</span>
          <input
            type="text"
            value={searchValues.challanNo}
            onChange={(event) => setSearchValues((current) => ({ ...current, challanNo: event.target.value }))}
          />
        </label>
        <label>
          <span>{t("UC_MOBILE_NO_LABEL")}</span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={searchValues.mobileNumber}
            onChange={(event) => setSearchValues((current) => ({ ...current, mobileNumber: event.target.value.replace(/\D/g, "") }))}
          />
        </label>
      </div>
      <div className="challan-new-inbox-search-actions">
        <button type="submit" className="challan-new-inbox-search-button">
          {t("ES_COMMON_SEARCH")}
        </button>
        <button type="button" className="challan-new-inbox-clear-button" onClick={clearSearch}>
          {t("CS_COMMON_CLEAR_SEARCH")}
        </button>
      </div>
    </form>
  );
};

export default ChallanInboxSearch;
