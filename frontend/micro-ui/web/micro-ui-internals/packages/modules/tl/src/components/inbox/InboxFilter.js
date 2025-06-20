import React, { useEffect, useMemo, useState } from "react";
import { Dropdown, RadioButtons, ActionBar, RemoveableTag, CloseSvg, CheckBox, Localities, SubmitBar } from "@mseva/digit-ui-react-components";

import { useTranslation } from "react-i18next";

import _ from "lodash";

const Filter = ({ searchParams, onFilterChange, defaultSearchParams, statuses, ...props }) => {
  let pgrQuery = {};
  let wfQuery = {};
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  let { uuid } = Digit.UserService.getUser().info;
  const isAssignedToMe =
    tenantId !== "pb.punjab" && searchParams?.filters?.wfFilters?.assignee && searchParams?.filters?.wfFilters?.assignee[0]?.code ? true : false;

  const assignedToOptions = useMemo(
    () => [
      { code: "ASSIGNED_TO_ME", name: t("ASSIGNED_TO_ME") },
      { code: "ASSIGNED_TO_ALL", name: t("ASSIGNED_TO_ALL") },
    ],
    [t]
  );

  //const defaultAssignedOption = tenantId === "pb.punjab" ? assignedToOptions[1] : isAssignedToMe ? assignedToOptions[0] : assignedToOptions[1];
  //const defaultAssignee = tenantId === "pb.punjab" ? [{ code: "" }] : [{ code: uuid }];
  const defaultAssignedOption = assignedToOptions[1];
  const defaultAssignee = [{ code: "" }];

  const [selectAssigned, setSelectedAssigned] = useState(defaultAssignedOption);

  const [selectedLocality, setSelectedLocality] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tlfilters, setTLFilters] = useState(
    searchParams?.filters?.tlfilters || {
      serviceCode: [],
      locality: [],
      applicationStatus: [],
      tenants: null,
    }
  );

  const [wfFilters, setWfFilters] = useState(
    searchParams?.filters?.wfFilters || {
      assignee: defaultAssignee,
    }
  );

  useEffect(() => setSelectedAssigned(isAssignedToMe ? assignedToOptions[0] : assignedToOptions[1]), [t, tenantId, isAssignedToMe]);

  const onRadioChange = (value) => {
    setSelectedAssigned(value);
    // uuid = value.code === "ASSIGNED_TO_ME" ? uuid : "";
    const assigneeCode = value.code === "ASSIGNED_TO_ME" ? uuid : "";
    setWfFilters({ ...wfFilters, assignee: [{ code: assigneeCode }] });
  };

  useEffect(() => {
    let count = 0;
    for (const property in tlfilters) {
      if (Array.isArray(tlfilters[property])) {
        count += tlfilters[property].length;
        let params = tlfilters[property].map((prop) => prop.code).join();
        if (params) {
          pgrQuery[property] = params;
        } else {
          delete pgrQuery?.[property];
        }
      }
    }
    for (const property in wfFilters) {
      if (Array.isArray(wfFilters[property])) {
        let params = wfFilters[property].map((prop) => prop.code).join();
        if (params) {
          wfQuery[property] = params;
        } else {
          wfQuery = {};
        }
      }
    }
    count += wfFilters?.assignee?.length || 0;

    // if (props.type !== "mobile") {
    handleFilterSubmit();
    // }

    Digit.inboxFilterCount = count;
  }, [tlfilters, wfFilters]);

  const ifExists = (list, key) => {
    return list.filter((object) => object.code === key.code).length;
  };

  useEffect(() => {
    if (tlfilters.locality.length > 1) {
      setSelectedLocality({ name: `${tlfilters.locality.length} selected` });
    } else {
      setSelectedLocality(tlfilters.locality[0]);
    }
  }, [tlfilters.locality]);

  const handleFilterSubmit = () => {
    onFilterChange({ pgrQuery: pgrQuery, wfQuery: wfQuery, wfFilters, tlfilters });
  };

  function onSelectLocality(value, type) {
    if (!ifExists(tlfilters.locality, value)) {
      setTLFilters({ ...tlfilters, locality: [...tlfilters.locality, value] });
    }
  }

  const onRemove = (index, key) => {
    if (key === "tenants") {
      setTLFilters({ ...tlfilters, tenants: null });
    } else {
      let afterRemove = tlfilters[key].filter((_, i) => i !== index);
      setTLFilters({ ...tlfilters, [key]: afterRemove });
    }
  };

  const handleAssignmentChange = (e, type) => {
    if (e.target.checked) {
      setTLFilters({ ...tlfilters, applicationStatus: [...tlfilters.applicationStatus, { code: type.applicationstatus }] });
    } else {
      const filteredStatus = tlfilters.applicationStatus.filter((value) => {
        return value.code !== type.applicationstatus;
      });
      setTLFilters({ ...tlfilters, applicationStatus: filteredStatus });
    }
  };

  const clearAll = () => {
    setTLFilters((prev) => ({
      serviceCode: [],
      locality: [],
      applicationStatus: [],
      tenants: prev.tenants, // Preserve tenants
    }));
    setWfFilters({ assigned: [{ code: [] }] });
    // setWfFilters(wfRest);
    pgrQuery = {};
    wfQuery = {};
    setSelectedAssigned("");
    //setSelectedComplaintType(null);
    setSelectedLocality(null);
  };

  // const onServiceSelect = (e, label) => {
  //   if (e.target.checked)
  //     localParamChange({ applicationStatus: [...(searchParams?.applicationStatus ? searchParams.applicationStatus : []), label] });
  //   else localParamChange({ applicationStatus: searchParams?.applicationStatus.filter((o) => o !== label) });
  // };

  // const selectLocality = (d) => {
  //   localParamChange({ locality: [...(searchParams?.locality || []), d] });
  // };

  const GetSelectOptions = (lable, options, selected = null, select, optionKey, onRemove, key, isDisabled) => {
    selected = selected || { [optionKey]: " ", code: "" };
    const isArray = Array.isArray(tlfilters[key]);
    return (
      <div>
        <div className="filter-label">{lable}</div>
        {
          <Dropdown
            option={options}
            selected={selected}
            select={(value) => !isDisabled && select(value, key)}
            // select={(value) => select(value, key)}
            optionKey={optionKey}
            disable={isDisabled}
          />
        }

        <div className="tag-container">
          {isArray &&
            tlfilters[key]?.length > 0 &&
            tlfilters[key].map((value, index) => (
              <RemoveableTag key={index} text={`${value[optionKey]?.slice(0, 22)} ...`} onClick={() => onRemove(index, key)} />
            ))}
        </div>
      </div>
    );
  };

  console.log("statuses is TLFilter ", statuses);

  return (
    <React.Fragment>
      <div className="filter">
        <div className="filter-card">
          <div className="heading">
            <div className="filter-label">{t("ES_COMMON_FILTER_BY")}:</div>
            <div className="clearAll" onClick={clearAll}>
              {t("ES_COMMON_CLEAR_ALL")}
            </div>
            {props.type === "desktop" && (
              <span className="clear-search" onClick={clearAll}>
                {t("ES_COMMON_CLEAR_ALL")}
              </span>
            )}
            {props.type === "mobile" && (
              <span onClick={props.onClose}>
                <CloseSvg />
              </span>
            )}
          </div>
          <div>
            <RadioButtons onSelect={onRadioChange} selectedOption={selectAssigned} t={t} optionsKey="name" options={assignedToOptions} />
            <div>
              {GetSelectOptions(
                t("TL_HOME_SEARCH_RESULTS__LOCALITY"),
                props?.localities,
                selectedLocality,
                onSelectLocality,
                "i18nkey",
                onRemove,
                "locality"
              )}
            </div>
            <div>
              <div className="filter-label" style={{ fontWeight: "normal" }}>
                {t("CS_INBOX_STATUS_FILTER")}
              </div>
              {statuses?.map((option, index) => {
                // const checked = searchParams?.applicationStatus?.includes(e.statusid);
                let hasFilters = tlfilters?.applicationStatus?.length;
                return (
                  <CheckBox
                    key={index + "service"}
                    label={
                      t(`CS_COMMON_INBOX_${option.businessservice.toUpperCase()}`) +
                      " - " +
                      t(`WF_NEWTL_${option.applicationstatus}`) +
                      " " +
                      `(${option.count})`
                    }
                    //value={option.statusid}
                    checked={
                      hasFilters
                        ? tlfilters.applicationStatus.filter((e) => e.code === option.applicationstatus).length !== 0
                          ? true
                          : false
                        : false
                    }
                    onChange={(e) => handleAssignmentChange(e, option)}
                  />
                );
              })}
            </div>
            {/* <div>
              <SubmitBar
                disabled={_.isEqual(searchParams, searchParams)}
                onSubmit={() => onFilterChange(searchParams)}
                label={t("ES_COMMON_APPLY")}
              />
            </div> */}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Filter;
