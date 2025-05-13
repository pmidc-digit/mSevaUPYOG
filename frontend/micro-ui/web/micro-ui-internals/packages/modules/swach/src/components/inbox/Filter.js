import React, { useEffect, useMemo, useState } from "react";
import { Dropdown, RadioButtons, ActionBar, RemoveableTag, RoundedLabel } from "@mseva/digit-ui-react-components";
import { ApplyFilterBar, CloseSvg } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import Status from "./Status";

let pgrQuery = {};
let wfQuery = {};

const Filter = (props) => {
  let { uuid } = Digit.UserService.getUser().info;
  const { searchParams } = props;
  const { t } = useTranslation();
  const isAssignedToMe = searchParams?.filters?.wfFilters?.assignee && searchParams?.filters?.wfFilters?.assignee[0]?.code ? true : false;

  const assignedToOptions = useMemo(
    () => [
      { code: "ASSIGNED_TO_ME", name: t("ASSIGNED_TO_ME") },
      { code: "ASSIGNED_TO_ALL", name: t("ASSIGNED_TO_ALL") },
    ],
    [t]
  );

  const [selectAssigned, setSelectedAssigned] = useState(isAssignedToMe ? assignedToOptions[0] : assignedToOptions[1]);

  useEffect(() => setSelectedAssigned(isAssignedToMe ? assignedToOptions[0] : assignedToOptions[1]), [t]);

  const [selectedComplaintType, setSelectedComplaintType] = useState(null);
  const [selectedLocality, setSelectedLocality] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [swachfilters, setSwachFilters] = useState(
    searchParams?.filters?.swachfilters || {
      serviceCode: [],
      locality: [],
      applicationStatus: [],
      tenants: null,
    }
  );

  const [wfFilters, setWfFilters] = useState(
    searchParams?.filters?.wfFilters || {
      assignee: [{ code: uuid }],
    }
  );

  const tenantId = Digit.ULBService.getCurrentTenantId();

  const { data: cities } = Digit.Hooks.useTenants();
  // let localities = Digit.Hooks.pgr.useLocalities({ city: tenantId });
  const { data: localities } = Digit.Hooks.useBoundaryLocalities(tenantId, "admin", {}, t);
  let serviceDefs = Digit.Hooks.swach.useSwachBharatCategory(tenantId, "Swach");

  useEffect(() => {
    // console.log("tenantId", tenantId);
    // if (tenantId) setSelectedTenant("Abohar");
    if (cities && cities?.length && tenantId) {
      const matchedCity = cities?.find((city) => city.code === tenantId);
      if (matchedCity) {
        const cityObj = { name: matchedCity?.name, code: matchedCity?.code };

        // Set it in both selectedTenant and swachfilters
        setSelectedTenant(cityObj);
        setSwachFilters((prev) => ({
          ...prev,
          tenants: cityObj?.code,
        }));
      }
    }
  }, [tenantId, cities]);

  const onRadioChange = (value) => {
    setSelectedAssigned(value);
    uuid = value.code === "ASSIGNED_TO_ME" ? uuid : "";
    setWfFilters({ ...wfFilters, assignee: [{ code: uuid }] });
  };

  useEffect(() => {
    let count = 0;
    for (const property in swachfilters) {
      if (Array.isArray(swachfilters[property])) {
        count += swachfilters[property].length;
        let params = swachfilters[property].map((prop) => prop.code).join();
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
  }, [swachfilters, wfFilters]);

  const ifExists = (list, key) => {
    return list.filter((object) => object.code === key.code).length;
  };

  function applyFiltersAndClose() {
    handleFilterSubmit();
    props.onClose();
  }
  function complaintType(_type) {
    const type = { i18nKey: t("SERVICEDEFS." + _type.serviceCode.toUpperCase()), code: _type.serviceCode };
    if (!ifExists(swachfilters.serviceCode, type)) {
      setSwachFilters({ ...swachfilters, serviceCode: [...swachfilters.serviceCode, type] });
    }
  }

  function onSelectLocality(value, type) {
    if (!ifExists(swachfilters.locality, value)) {
      setSwachFilters({ ...swachfilters, locality: [...swachfilters.locality, value] });
    }
  }

  function onSelectTenants(value, type) {
    // if (!ifExists(swachfilters.tenants, value)) {
    setSwachFilters({ ...swachfilters, tenants: value.code });
    // }
  }

  useEffect(() => {
    if (swachfilters.serviceCode.length > 1) {
      setSelectedComplaintType({ i18nKey: `${swachfilters.serviceCode.length} selected` });
    } else {
      setSelectedComplaintType(swachfilters.serviceCode[0]);
    }
  }, [swachfilters.serviceCode]);

  useEffect(() => {
    if (swachfilters.locality.length > 1) {
      setSelectedLocality({ name: `${swachfilters.locality.length} selected` });
    } else {
      setSelectedLocality(swachfilters.locality[0]);
    }
  }, [swachfilters.locality]);

  // useEffect(() => {
  //   // if (swachfilters.tenants?.length > 1) {
  //   //   setSelectedTenant({ name: `${swachfilters.tenants.length} selected` });
  //   // } else {
  //   setSelectedTenant(swachfilters?.tenants);
  //   // }
  // }, [swachfilters.tenants]);

  const onRemove = (index, key) => {
    // let afterRemove = swachfilters[key].filter((value, i) => {
    //   return i !== index;
    // });
    // setSwachFilters({ ...swachfilters, [key]: afterRemove });
    if (key === "tenants") {
      setSwachFilters({ ...swachfilters, tenants: null });
    } else {
      let afterRemove = swachfilters[key].filter((_, i) => i !== index);
      setSwachFilters({ ...swachfilters, [key]: afterRemove });
    }
  };

  const handleAssignmentChange = (e, type) => {
    if (e.target.checked) {
      setSwachFilters({ ...swachfilters, applicationStatus: [...swachfilters.applicationStatus, { code: type.code }] });
    } else {
      const filteredStatus = swachfilters.applicationStatus.filter((value) => {
        return value.code !== type.code;
      });
      setSwachFilters({ ...swachfilters, applicationStatus: filteredStatus });
    }
  };

  function clearAll() {
    let swachReset = { serviceCode: [], locality: [], applicationStatus: [] };
    let wfRest = { assigned: [{ code: [] }] };
    setSwachFilters(swachReset);
    setWfFilters(wfRest);
    pgrQuery = {};
    wfQuery = {};
    setSelectedAssigned("");
    setSelectedComplaintType(null);
    setSelectedLocality(null);
    setSelectedTenant(null);
  }

  const handleFilterSubmit = () => {
    props.onFilterChange({ pgrQuery: pgrQuery, wfQuery: wfQuery, wfFilters, swachfilters });
  };

  const GetSelectOptions = (lable, options, selected = null, select, optionKey, onRemove, key, isDisabled) => {
    selected = selected || { [optionKey]: " ", code: "" };
    const isArray = Array.isArray(swachfilters[key]);
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
            swachfilters[key]?.length > 0 &&
            swachfilters[key].map((value, index) => (
              <RemoveableTag key={index} text={`${value[optionKey]?.slice(0, 22)} ...`} onClick={() => onRemove(index, key)} />
            ))}
          {/* {swachfilters[key]?.length > 0 &&
            swachfilters[key]?.map((value, index) => {
              return <RemoveableTag key={index} text={`${value[optionKey].slice(0, 22)} ...`} onClick={() => onRemove(index, key)} />;
            })} */}
        </div>
      </div>
    );
  };

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
            <RadioButtons onSelect={onRadioChange} selectedOption={selectAssigned} optionsKey="name" options={assignedToOptions} />
            <div>
              {GetSelectOptions(
                t("CS_COMPLAINT_DETAILS_COMPLAINT_SUBTYPE"),
                serviceDefs,
                selectedComplaintType,
                complaintType,
                "i18nKey",
                onRemove,
                "serviceCode"
              )}
            </div>
            <div>{GetSelectOptions(t("CS_SWACH_LOCALITY"), localities, selectedLocality, onSelectLocality, "i18nkey", onRemove, "locality")}</div>
            <div>
              {GetSelectOptions("City", cities, selectedTenant, onSelectTenants, "name", onRemove, "tenants", swachfilters?.tenants !== "Punjab")}
            </div>
            {<Status complaints={props.complaints} onAssignmentChange={handleAssignmentChange} swachfilters={swachfilters} />}
          </div>
        </div>
      </div>

      {props.type === "mobile" && (
        <ActionBar>
          <ApplyFilterBar
            labelLink={t("ES_COMMON_CLEAR_ALL")}
            buttonLink={t("ES_COMMON_FILTER")}
            onClear={clearAll}
            onSubmit={applyFiltersAndClose}
          />
        </ActionBar>
      )}
    </React.Fragment>
  );
};

export default Filter;
