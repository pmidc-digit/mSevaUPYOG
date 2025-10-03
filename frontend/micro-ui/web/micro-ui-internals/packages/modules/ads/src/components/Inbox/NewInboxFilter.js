import React, { useEffect, useState, useMemo } from "react";
import { RadioButtons, RemoveableTag, CloseSvg, CheckBox, SubmitBar, Dropdown, ActionBar, Localities } from "@mseva/digit-ui-react-components";
import { useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import Status from "./Status";
import _ from "lodash";

const Filter = ({ searchParams, onFilterChange, defaultSearchParams, statusMap, moduleCode, ...props }) => {
  const { t } = useTranslation();
  const client = useQueryClient();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { uuid } = Digit.UserService.getUser().info;

  const [_searchParams, setSearchParams] = useState(() => ({ services: searchParams?.services || ["ADV"] }));
  console.log("_searchParams", _searchParams);

  // Assigned-to options
  const assignedToOptions = useMemo(
    () => [
      { code: "ASSIGNED_TO_ME", name: t("ASSIGNED_TO_ME") },
      { code: "ASSIGNED_TO_ALL", name: t("ASSIGNED_TO_ALL") },
    ],
    [t]
  );

  const defaultAssignedOption = assignedToOptions[1];
  const defaultAssignee = [{ code: "" }];

  const [selectAssigned, setSelectedAssigned] = useState(defaultAssignedOption);
  const [wfFilters, setWfFilters] = useState(
    searchParams?.filters?.wfFilters || {
      assignee: defaultAssignee,
    }
  );

  // const [_searchParams, setSearchParams] = useState(() => ({
  //   ...searchParams,
  //   services: ["ADV"],
  // }));

  // const [_searchParams, setSearchParams] = useState(() => ({
  //   ...searchParams,
  //   services: ["ADV"],
  //   applicationStatus: searchParams?.applicationStatus || [], // ✅ ensure array
  // }));

  const ApplicationTypeMenu = [
    {
      label: t("ADS_NEW_BOOKING_APPLICATION"),
      value: "ADV",
    },
  ];

  // Handle Assigned-to change
  const onRadioChange = (value) => {
    setSelectedAssigned(value);
    setWfFilters({ uuid: value }); // ✅ this is what the backend expects
    onFilterChange({
      ..._searchParams,
      uuid: value, // ✅ send as 'uuid' with code
    });
  };

  console.log("statusMap", statusMap);

  // const localParamChange = (filterParam) => {
  //   let keys_to_delete = filterParam.delete;
  //   let _new = { ..._searchParams, ...filterParam };
  //   if (keys_to_delete) keys_to_delete.forEach((key) => delete _new[key]);
  //   delete filterParam.delete;
  //   setSearchParams({ ..._new });
  // };
  const localParamChange = (filterParam) => {
    let keys_to_delete = filterParam.delete;
    let _new = { ..._searchParams, ...filterParam };
    if (keys_to_delete) keys_to_delete.forEach((key) => delete _new[key]);
    delete filterParam.delete;
    setSearchParams({ ..._new });
  };

  const applyLocalFilters = () => {
    onFilterChange({
      ..._searchParams,
      wfFilters,
    });
  };

  // const applyLocalFilters = () => {
  //   const finalParams = {
  //     ..._searchParams,
  //     wfFilters,
  //   };
  //   if (finalParams.services.length === 0) {
  //     finalParams.services = ApplicationTypeMenu.map((e) => e.value);
  //   }
  //   onFilterChange(finalParams);
  // };

  const clearAll = () => {
    setSearchParams({ ...defaultSearchParams, services: [] });
    onFilterChange({ ...defaultSearchParams });
  };

  const selectLocality = (d) => {
    localParamChange({ locality: [...(_searchParams?.locality || []), d] });
  };

  // const onServiceSelect = (e, label) => {
  //   if (e.target.checked)
  //     localParamChange({
  //       services: Array.isArray(_searchParams.services) ? [..._searchParams.services, label] : [label],
  //     });
  //   else
  //     localParamChange({
  //       services: _searchParams.services.filter((o) => o !== label),
  //       applicationStatus: _searchParams.applicationStatus?.filter((e) => e.stateBusinessService !== label),
  //     });
  // };

  console.log("hhh");

  return (
    <React.Fragment>
      <div className="filter">
        <div className="filter-card">
          <div className="heading" style={{ alignItems: "center" }}>
            <div className="filter-label" style={{ display: "flex", alignItems: "center" }}>
              <span>
                <svg width="17" height="17" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M0.66666 2.48016C3.35999 5.9335 8.33333 12.3335 8.33333 12.3335V20.3335C8.33333 21.0668 8.93333 21.6668 9.66666 21.6668H12.3333C13.0667 21.6668 13.6667 21.0668 13.6667 20.3335V12.3335C13.6667 12.3335 18.6267 5.9335 21.32 2.48016C22 1.60016 21.3733 0.333496 20.2667 0.333496H1.71999C0.613327 0.333496 -0.01334 1.60016 0.66666 2.48016Z"
                    fill="#505A5F"
                  />
                </svg>
              </span>
              <span style={{ marginLeft: "8px", fontWeight: "normal" }}>{t("ES_COMMON_FILTER_BY")}:</span>
            </div>
            <div className="clearAll" onClick={clearAll}>
              {t("ES_COMMON_CLEAR_ALL")}
            </div>
            {props.type === "desktop" && (
              <span className="clear-search" onClick={clearAll} style={{ border: "1px solid #e0e0e0", padding: "6px" }}>
                <svg width="17" height="17" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8 5V8L12 4L8 0V3C3.58 3 0 6.58 0 11C0 12.57 0.46 14.03 1.24 15.26L2.7 13.8C2.25 12.97 2 12.01 2 11C2 7.69 4.69 5 8 5ZM14.76 6.74L13.3 8.2C13.74 9.04 14 9.99 14 11C14 14.31 11.31 17 8 17V14L4 18L8 22V19C12.42 19 16 15.42 16 11C16 9.43 15.54 7.97 14.76 6.74Z"
                    fill="#505A5F"
                  />
                </svg>
              </span>
            )}
            {props.type === "mobile" && (
              <span onClick={props.onClose}>
                <CloseSvg />
              </span>
            )}
          </div>

          <div>
            {/* Assigned To Filter */}
            <RadioButtons onSelect={onRadioChange} selectedOption={selectAssigned} t={t} optionsKey="name" options={assignedToOptions} />

            {/* Application Type */}
            {/* <div>
              <div className="filter-label" style={{ fontWeight: "normal" }}>
                {t("ES_PTR_APP_TYPE")}
              </div>
              {ApplicationTypeMenu.map((e, index) => {
                const checked = _searchParams?.services?.includes(e.value);
                return (
                  <CheckBox
                    key={index + "service"}
                    label={t(e.label)}
                    value={e.label}
                    checked={checked}
                    onChange={(event) => onServiceSelect(event, e.value)}
                  />
                );
              })}
            </div> */}

            {/* Status Filter */}
            <div>
              <Status
                searchParams={_searchParams}
                businessServices={["ADV"]}
                statusMap={statusMap || client.getQueryData(`INBOX_STATUS_MAP_${moduleCode}`)}
                moduleCode={moduleCode}
                // onAssignmentChange={(e, status) => {
                //   if (e.target.checked) localParamChange({ applicationStatus: [..._searchParams?.applicationStatus, status] });
                //   else {
                //     let applicationStatus = _searchParams?.applicationStatus.filter((s) => s.state !== status.state);
                //     localParamChange({ applicationStatus });
                //   }
                // }}
                onAssignmentChange={(e, status) => {
                  console.log("status is 222", status);
                  console.log("e", e);

                  if (e.target.checked) {
                    localParamChange({
                      applicationStatus: [...(_searchParams.applicationStatus || []), status],
                    });
                  } else {
                    localParamChange({
                      applicationStatus: _searchParams?.applicationStatus.filter((s) => s.state !== status.state),
                    });
                  }
                }}
              />
            </div>

            {/* Apply Button */}
            <div>
              <SubmitBar onSubmit={() => applyLocalFilters()} label={t("ES_COMMON_APPLY")} />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Filter;
