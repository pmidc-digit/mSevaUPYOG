import React, { useEffect, useState } from "react";
import { Loader } from "@nudmcdgnpm/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import StatusCount from "./StatusCount";
/**
 * This Status component displays a list of application statuses with counts, using data from what appears to be a
 * custom hook (Digit.Hooks.useApplicationStatusGeneral). It shows a loading state while data is fetched and provides 
 * functionality to toggle between showing more or fewer status options.
 * Key observations:
 * The component fetches status data using a custom hook
 * It displays a limited set of statuses initially (up to 4) with an option to show more.
 * It uses translation functionality for internationalization.
 * It passes data down to a child component (StatusCount) for each status item.
 */
const Status = ({ onAssignmentChange, searchParams, businessServices, statusMap, moduleCode }) => {
  const { t } = useTranslation();

  const [moreStatus, showMoreStatus] = useState(false);

  const { data: statusData, isLoading } = Digit.Hooks.useApplicationStatusGeneral({ businessServices }, {});

  const { userRoleStates } = statusData || {};

 

  const translateState = (state, t) => {
    return `${t(map[state.stateBusinessService])}` + " - " + t(`ES_SV_COMMON_STATUS_${state.state || "CREATED"}`);
  };


  if (isLoading) {
    return <Loader />;
  }

  return userRoleStates?.filter((e) => !e.isTerminateState).length ? (
    <div className="status-container">
      <div className="filter-label" style={{ fontWeight: "normal" }}>
        {t("ES_INBOX_STATUS")}
      </div>
      {userRoleStates
        ?.filter((e) => !e.isTerminateState)
        ?.slice(0, 4)
        ?.map((option, index) => {
          return (
            <StatusCount
              businessServices={businessServices}
              key={index}
              onAssignmentChange={onAssignmentChange}
              status={{ name: translateState(option, t), code: option.applicationStatus, ...option }}
              searchParams={searchParams}
              statusMap={statusMap}
            />
          );
        })}
      {userRoleStates?.filter((e) => !e.isTerminateState)?.slice(4).length > 0 ? (
        <React.Fragment>
          {moreStatus &&
            userRoleStates
              ?.filter((e) => !e.isTerminateState)
              ?.slice(4)
              ?.map((option, index) => {
                return (
                  <StatusCount
                    businessServices={businessServices}
                    key={option.uuid}
                    onAssignmentChange={onAssignmentChange}
                    status={{ name: translateState(option, t), code: option.applicationStatus, ...option }}
                    searchParams={searchParams}
                    statusMap={statusMap}
                  />
                );
              })}

          <div className="filter-button" onClick={() => showMoreStatus(!moreStatus)}>
            {" "}
            {moreStatus ? t("ES_COMMON_LESS") : t("ES_COMMON_MORE")}{" "}
          </div>
        </React.Fragment>
      ) : null}
    </div>
  ) : null;
};

export default Status;
