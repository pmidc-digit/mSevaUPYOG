import React, { useEffect, useState } from "react";
import { Dropdown, CloseSvg, SubmitBar } from "@nudmcdgnpm/digit-ui-react-components";
import { useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";

import Status from "./Status";
import _ from "lodash";

/** @description - The following component renders the fields in the filter box in left side of the inbox page
 * Renders the filter fields
 * filters the data based on the selected filters
 * @status - In Development
 */
const Filter = ({ searchParams, onFilterChange, defaultSearchParams, statusMap, moduleCode, ...props }) => {
  const { t } = useTranslation();
  const client = useQueryClient();
  const allCities = Digit.Hooks.sv.useTenants();

  const [_searchParams, setSearchParams] = useState(() => ({ ...searchParams, services: [] }));
  const [vendingType, setVendingType] = useState()
  const [_vendingZone, setVendingZone] = useState()
  const [app_status, setAppStatus] = useState()
  const [vendingLocality, setVendingLocality] = useState()

  const ApplicationTypeMenu = [
    {
      label: "SV_NEW_REGISTRATION",
      value: "street-vending",
    },
  ];

  let StatusFields = [
    {
      i18nKey: "APPLIED"
    },
    {
      i18nKey: "APPROVED"
    },
    {
      i18nKey: "REGISTRATIONCOMPLETED"
    },
    {
      i18nKey: "INSPECTIONPENDING"
    },
    {
      i18nKey: "REJECTED"
    },
  ];

  /* fetching vending zones from boundary service */
  const { data: fetchedVendingZones } = Digit.Hooks.useBoundaryLocalities(
    vendingLocality?.code,
    "vendingzones",
    {
      enabled: !!vendingLocality,
    },
    t
  );


  let vending_Zone = [];
  fetchedVendingZones && fetchedVendingZones.map((vendingData) => {
    vending_Zone.push({ i18nKey: vendingData?.i18nkey, code: vendingData?.code, value: vendingData?.name })
  })

  // hook for fetching vending type data
  const { data: vendingTypeData } = Digit.Hooks.useEnabledMDMS(Digit.ULBService.getStateId(), "StreetVending", [{ name: "VendingActivityType" }],
    {
      select: (data) => {
        const formattedData = data?.["StreetVending"]?.["VendingActivityType"]
        return formattedData;
      },
    });
  let vendingTypeOptions = [];
  vendingTypeData && vendingTypeData.map((vending) => {
    vendingTypeOptions.push({ i18nKey: `${vending.name}`, code: `${vending.code}`, value: `${vending.name}` })
  })

  const localParamChange = (filterParam) => {
    let keys_to_delete = filterParam.delete;
    let _new = { ..._searchParams, ...filterParam };
    if (keys_to_delete) keys_to_delete.forEach((key) => delete _new[key]);
    delete filterParam.delete;
    setSearchParams({ ..._new });
  };

  const applyLocalFilters = () => {
    if (_searchParams.services.length === 0) onFilterChange({ ..._searchParams, services: ApplicationTypeMenu.map((e) => e.value) });
    else
      onFilterChange(_searchParams);
  };

  const clearAll = () => {
    setSearchParams({ ...defaultSearchParams, services: [] });
    onFilterChange({ ...defaultSearchParams });
    setVendingType(null)
    setVendingZone(null)
    setAppStatus(null)
    setVendingLocality(null)
  };


  // setting the vendingzone, vendingtype and status values in searchparams
  useEffect(() => {
    if (_vendingZone) localParamChange({ vendingZone: _vendingZone?.code || "" });
    if (vendingType) localParamChange({ vendingType: vendingType?.code || "" });
    if (app_status) localParamChange({ status: app_status?.i18nKey || "" });
  }, [_vendingZone, vendingType, app_status])

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

            <div>
              <div className="filter-label" style={{ fontWeight: "normal" }}>
                {t("SV_VENDING_LOCALITY")}:
              </div>
              <div>
                <Dropdown
                  selected={vendingLocality}
                  select={setVendingLocality}
                  option={allCities}
                  optionKey="i18nKey"
                  t={t}
                  placeholder={"Select"}
                />
              </div>

              <div className="filter-label" style={{ fontWeight: "normal" }}>
                {t("SV_VENDING_ZONES")}:
              </div>
              <div>
                <Dropdown
                  selected={_vendingZone}
                  select={setVendingZone}
                  option={vending_Zone}
                  optionKey="i18nKey"
                  t={t}
                  placeholder={"Select"}
                />
              </div>

              <div>
                <div className="filter-label" style={{ fontWeight: "normal" }}>
                  {t("SV_VENDING_TYPE")}:
                </div>
                <div>
                  <Dropdown
                    selected={vendingType}
                    select={setVendingType}
                    option={vendingTypeOptions}
                    optionKey="i18nKey"
                    t={t}
                    placeholder={"Select"}
                  />

                </div>
              </div>
            </div>


            <div>
              <div className="filter-label" style={{ fontWeight: "normal" }}>
                {t("SV_APPLICATION_STATUS")}:
              </div>
              <div>
                <Dropdown
                  selected={app_status}
                  select={setAppStatus}
                  option={StatusFields}
                  optionKey="i18nKey"
                  t={t}
                  placeholder={"Select"}
                />

              </div>
            </div>

            <div>
              <Status
                searchParams={_searchParams}
                businessServices={_searchParams.services}
                statusMap={statusMap || client.getQueryData(`INBOX_STATUS_MAP_${moduleCode}`)}
                moduleCode={moduleCode}
                onAssignmentChange={(e, status) => {
                  if (e.target.checked) localParamChange({ applicationStatus: [..._searchParams?.applicationStatus, status] });
                  else {
                    let applicationStatus = _searchParams?.applicationStatus.filter((e) => e.state !== status.state);
                    localParamChange({ applicationStatus });
                  }
                }}
              />
            </div>
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
