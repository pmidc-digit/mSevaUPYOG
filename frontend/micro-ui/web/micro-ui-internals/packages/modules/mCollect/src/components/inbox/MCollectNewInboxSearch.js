import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const EMPTY_SEARCH = {
  challanNo: "",
  mobileNumber: "",
  receiptNumber: "",
};

const MCollectNewInboxSearch = ({ values, onSearch }) => {
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
      className="new-inbox-topbar mcollect-new-inbox-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch({ ...searchValues, mobileNumber: String(searchValues.mobileNumber || "").replace(/\D/g, "") });
      }}
    >
      <div className="mcollect-new-inbox-search-fields">
        <label>
          <span>{t("UC_CHALLAN_NO")}</span>
          <input value={searchValues.challanNo} onChange={(event) => updateValue("challanNo", event.target.value)} />
        </label>
        <label>
          <span>{t("UC_MOBILE_NO_LABEL")}</span>
          <input type="tel" inputMode="numeric" maxLength={10} value={searchValues.mobileNumber} onChange={(event) => updateValue("mobileNumber", event.target.value.replace(/\D/g, ""))} />
        </label>
        <label>
          <span>{t("UC_RECEPIT_NO_LABEL")}</span>
          <input value={searchValues.receiptNumber} onChange={(event) => updateValue("receiptNumber", event.target.value)} />
        </label>
      </div>
      <div className="mcollect-new-inbox-search-actions">
        <button type="submit" className="mcollect-new-inbox-search-button">{t("ES_COMMON_SEARCH")}</button>
        <button type="button" className="mcollect-new-inbox-clear-button" onClick={clearSearch}>{t("CS_COMMON_CLEAR_SEARCH")}</button>
        <Link to="/digit-ui/employee/mcollect/new-application" className="mcollect-new-inbox-application-button">{t("UC_GENERATE_NEW_CHALLAN")}</Link>
      </div>
    </form>
  );
};

export default MCollectNewInboxSearch;
