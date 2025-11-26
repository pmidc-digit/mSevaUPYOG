import React, { useState } from "react";
import { Loader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import StatusCount from "./StatusCount";

const Status = ({ onAssignmentChange, searchParams, businessServices, clearCheck, setclearCheck, statutes, _searchParams }) => {
  const { t } = useTranslation();
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  // const stateId = Digit.ULBService.getStateId();
  // const { data, isLoading } = Digit.Hooks.mcollect.useMCollectMDMS(stateId, "mCollect", "applicationStatus");
  // const applicationStatus = data?.mCollect?.applicationStatus || [];
  const translateState = (state) => {
    return `${state.applicationstatus || "ACTIVE"}`;
  };

  // console.log("statutes", statutes);

  // if (isLoading) {
  //   return <Loader />;
  // }

  // 🔹 Show loader if `statutes` is not yet loaded or empty
  if (!statutes || statutes.length === 0) {
    return <Loader />;
  }

  return (
    <div className="status-container">
      <div className="filter-label" style={{ fontWeight: "normal" }}>
        {t("UC_COMMON_TABLE_COL_STATUS")}
      </div>
      {statutes?.map((option, index) => {
        return (
          <StatusCount
            key={index}
            clearCheck={clearCheck}
            setclearCheck={setclearCheck}
            _searchParams={_searchParams}
            onAssignmentChange={onAssignmentChange}
            status={{ name: translateState(option), code: option.applicationstatus }}
            searchParams={searchParams}
          />
        );
      })}
    </div>
  );
};

export default Status;
