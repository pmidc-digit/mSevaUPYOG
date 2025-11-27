import React, { useEffect } from "react";
import { CheckBox, Loader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const complaintsWithCount = [
  { name: "Pending For Assignment", code: "PENDINGFORASSIGNMENT" },
  { name: "Pending At LME", code: "PENDINGATLME" },
  { name: "Resolved", code: "RESOLVED" },
];

const SEARCH_PARAMS_KEY = "swach_inbox_search_params";

const Status = ({ complaints, onAssignmentChange, swachfilters, type }) => {
  const { t } = useTranslation();
  
  // Only auto-select if no saved filters exist in sessionStorage
  useEffect(() => {
    if(type !== "mobile") {
      try {
        const savedParams = Digit.SessionStorage.get(SEARCH_PARAMS_KEY);
        const hasStatusFiltersKey = savedParams?.filters?.swachfilters?.hasOwnProperty('applicationStatus');
        
        // Only auto-select if applicationStatus key doesn't exist in saved params
        if (!hasStatusFiltersKey) {
          onAssignmentChange({ target: { checked: true } }, { name: "Pending For Assignment", code: "PENDINGFORASSIGNMENT" });
        }
      } catch (e) {
        // Fallback to default behavior if sessionStorage fails
        onAssignmentChange({ target: { checked: true } }, { name: "Pending For Assignment", code: "PENDINGFORASSIGNMENT" });
      }
    }
  }, []);
  
  const hasFilters = swachfilters?.applicationStatus?.length;
  
  return (
    <div className="status-container">
      <div className="filter-label">{t("ES_SWACH_FILTER_STATUS")}</div>
      {complaintsWithCount.map((option, index) => (
        <CheckBox
          key={index}
          onChange={(e) => onAssignmentChange(e, option)}
          checked={hasFilters ? swachfilters.applicationStatus.some((e) => e.code === option.code) : false}
          label={option.name}
        />
      ))}
    </div>
  );
};

export default Status;
