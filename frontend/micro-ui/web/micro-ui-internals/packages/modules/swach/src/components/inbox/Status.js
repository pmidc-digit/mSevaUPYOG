import React, { useEffect } from "react";
import { CheckBox, Loader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const complaintsWithCount = [
  { name: "Pending For Assignment", code: "PENDINGFORASSIGNMENT" },
  { name: "Pending At LME", code: "PENDINGATLME" },
  { name: "Resolved", code: "RESOLVED" },
];

const Status = ({ complaints, onAssignmentChange, swachfilters, type }) => {
  const { t } = useTranslation();
  // const complaintsWithCount = Digit.Hooks.swach.useComplaintStatusCount(complaints);
  useEffect(() => {
    if(type !== "mobile")
      onAssignmentChange({ target: { checked: true } }, { name: "Pending For Assignment", code: "PENDINGFORASSIGNMENT" });
  }, []);
  const complaintsWithCount = [
    { name: "Pending For Assignment", code: "PENDINGFORASSIGNMENT" },
    { name: "Pending At LME", code: "PENDINGATLME" },
    { name: "Resolved", code: "RESOLVED" },
  ];
  let hasFilters = swachfilters?.applicationStatus?.length;
  // console.log("swachfilters", swachfilters);
  return (
    <div className="status-container">
      <div className="filter-label">{t("ES_SWACH_FILTER_STATUS")}</div>
      {/* {complaintsWithCount.length === 0 && <Loader />} */}
      {complaintsWithCount.map((option, index) => {
        return (
          <CheckBox
            key={index}
            onChange={(e) => onAssignmentChange(e, option)}
            checked={hasFilters ? (swachfilters.applicationStatus.filter((e) => e.code === option.code).length !== 0 ? true : false) : false}
            // label={`${option.name} (${option.count || 0})`}
            label={`${option.name}`}
          />
        );
      })}
    </div>
  );
};

export default Status;
