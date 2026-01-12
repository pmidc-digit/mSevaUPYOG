import React from "react";
import { ActionBar, CloseSvg, FilterIcon, RefreshIcon } from "@mseva/digit-ui-react-components";
import { ApplyFilterBar } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import Status from "./Status";
import ServiceCategory from "./ServiceCategory";

const Filter = ({ searchParams, onFilterChange, onSearch, removeParam, ...props }) => {
  const { t } = useTranslation();

  const onStatusChange = (e, type) => {
    if (e.target.checked) onFilterChange({ status: [...searchParams?.status, type] });
    else onFilterChange({ status: searchParams?.status.filter((option) => type.name !== option.name) });
  };

  const clearAll = () => {
    onFilterChange({ status: [] });
    props?.onClose?.();
  };

  return (
    <React.Fragment>
      <div className="filter">
        <div className="filter-card" style={{ padding: "1rem" }}>
          <div className="heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="filter-label" style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent:"space-between" }}>
              <FilterIcon />
              {t("ES_COMMON_FILTER_BY").toUpperCase()}:
            </div>
            {props.type === "mobile" && (
              <span onClick={props.onClose} style={{ cursor: "pointer" }}>
                <CloseSvg />
              </span>
            )}
          </div>
          <div className="clearAll" onClick={clearAll} style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
            <div style={{ border: "1px solid #e8e8e8", padding: "4px", borderRadius: "4px", cursor: "pointer" }}>
              <RefreshIcon />
            </div>
          </div>
          <div>
            <Status
              translatePrefix={props.translatePrefix}
              businessService={props.businessService}
              onAssignmentChange={onStatusChange}
              fsmfilters={searchParams}
            />
          </div>
          <div>
            <ServiceCategory
              translatePrefix={props.translatePrefix}
              businessService={props.businessService}
              onAssignmentChange={onStatusChange}
              fsmfilters={searchParams}
            />
          </div>
        </div>
      </div>
      {props.type === "mobile" && (
        <ActionBar>
          <ApplyFilterBar
            submit={false}
            labelLink={t("ES_COMMON_CLEAR_ALL")}
            buttonLink={t("ES_COMMON_FILTER")}
            onClear={clearAll}
            onSubmit={() => {
              if (props.type === "mobile") onSearch({ delete: ["applicationNos"] });
              else onSearch();
            }}
            style={{ flex: 1 }}
          />
        </ActionBar>
      )}
    </React.Fragment>
  );
};

export default Filter;
