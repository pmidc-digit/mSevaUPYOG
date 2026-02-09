import { ActionBar, ApplyFilterBar, CloseSvg, Dropdown, RadioButtons, RemoveableTag, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const Filter = ({ searchParams, onFilterChange, onSearch, removeParam, ...props }) => {
  const [filters, onSelectFilterRoles] = useState(searchParams?.filters?.role || { role: [] });
  const [_searchParams, setSearchParams] = useState(() => searchParams);
  const [selectedRoles, onSelectFilterRolessetSelectedRole] = useState(null);
  const { t } = useTranslation();
  
  const storedTenantIds = Digit.SessionStorage.get("HRMS_TENANTS");
  const { data: tenantsData, isLoading: tenantsLoading } = Digit.Hooks.useTenants();
  const cityChange = Digit.SessionStorage.get("Employee.tenantId");
  
  const tenantIds = React.useMemo(() => {
    if (tenantsData && tenantsData.length > 0) {
      return tenantsData;
    }
    return storedTenantIds || [];
  }, [tenantsData, storedTenantIds]);

  const mappedTenantOptions = React.useMemo(() => {
    if (!tenantIds || tenantIds.length === 0) return [];
    
    const sortedCities = [...tenantIds].sort((x, y) => x?.name?.localeCompare(y?.name));
    return sortedCities.map(city => ({ 
      ...city, 
      i18text: Digit.Utils.locale.getCityLocale(city.code) || city.name || city.code 
    }));
  }, [tenantIds]);

  function onSelectRoles(value, type) {
    if (!ifExists(filters.role, value)) {
      onSelectFilterRoles({ ...filters, role: [...filters.role, value] });
    }
  }

  const onRemove = (index, key) => {
    let afterRemove = filters[key].filter((value, i) => {
      return i !== index;
    });
    onSelectFilterRoles({ ...filters, [key]: afterRemove });
  };

  useEffect(() => {
    if (filters.role.length > 1) {
      onSelectFilterRolessetSelectedRole({ name: `${filters.role.length} selected` });
    } else {
      onSelectFilterRolessetSelectedRole(filters.role[0]);
    }
  }, [filters.role]);
  
  const [tenantId, settenantId] = useState(() => {
    const currentTenantId = searchParams?.tenantId || Digit.ULBService.getCurrentTenantId();
    
    let targetCode = currentTenantId;
    if (currentTenantId === "pb.punjab") {
      targetCode = Digit.SessionStorage.get("punjab-tenantId") || "pb.amritsar";
    }
    return { code: targetCode };
  });
  
  
  useEffect(() => {
    if (mappedTenantOptions && mappedTenantOptions.length > 0) {
      const currentTenantId = Digit.ULBService.getCurrentTenantId();
      const changeCity = cityChange || currentTenantId;
      
      let targetCode = changeCity;
      if (changeCity === "pb.punjab") {
        targetCode = Digit.SessionStorage.get("punjab-tenantId") || "pb.amritsar";
        Digit.SessionStorage.set("punjab-tenantId", targetCode);
      }
      
      const matchingTenant = mappedTenantOptions.find(ele => ele.code === targetCode);
      if (matchingTenant && (!tenantId.i18text || matchingTenant.code !== tenantId.code)) {
        settenantId(matchingTenant);
      }
    }
  }, [mappedTenantOptions, cityChange]);
  
  const { isLoading, isError, errors, data: data, ...rest } = Digit.Hooks.hrms.useHrmsMDMS(
    tenantId ? tenantId.code : searchParams?.tenantId,
    "egov-hrms",
    "HRMSRolesandDesignation"
  );
  const [departments, setDepartments] = useState(() => {
    return { departments: null };
  });

  const [roles, setRoles] = useState(() => {
    return { roles: null };
  });
  const [isActive, setIsactive] = useState(() => {
    return { isActive: true };
  });

  useEffect(() => {
    if (tenantId.code) {
      setSearchParams({ ..._searchParams, tenantId: tenantId.code });
    }
  }, [tenantId]);

  useEffect(() => {
    if (filters.role && filters.role.length > 0) {
      let res = [];
      filters.role.forEach((ele) => {
        res.push(ele.code);
      });

      setSearchParams({ ..._searchParams, roles: [...res].join(",") });
      if (filters.role && filters.role.length > 1) {
        let res = [];
        filters.role.forEach((ele) => {
          res.push(ele.code);
        });
        setSearchParams({ ..._searchParams, roles: [...res].join(",") });
      }
    }
  }, [filters.role]);

  useEffect(() => {
    if (departments) {
      setSearchParams({ ..._searchParams, departments: departments.code });
    }
  }, [departments]);

  useEffect(() => {
    if (roles) {
      setSearchParams({ ..._searchParams, roles: roles.code });
    }
  }, [roles]);

  const ifExists = (list, key) => {
    return list?.filter((object) => object.code === key.code).length;
  };

  useEffect(() => {
    if (isActive) {
      setSearchParams({ ..._searchParams, isActive: isActive.code });
    }
  }, [isActive]);
  const clearAll = () => {
    onFilterChange({ delete: Object.keys(searchParams) });
    setDepartments(null);
    setRoles(null);
    setIsactive(null);
    onSelectFilterRoles({ role: [] });
    
    const currentTenantId = Digit.ULBService.getCurrentTenantId();
    let targetCode = currentTenantId;
    if (currentTenantId === "pb.punjab") {
      targetCode = "pb.amritsar";
    }
    
    const resetTenant = mappedTenantOptions.find(ele => ele.code === targetCode);
    if (resetTenant) {
      settenantId(resetTenant);
    }
    
    props?.onClose?.();
  };

  const isStateLevelTenant = Digit.ULBService.getCurrentTenantId() === "pb.punjab";

  const onSelectTenants = (value) => {
    if (!isStateLevelTenant) return;
    if (value) {
      Digit.SessionStorage.set("punjab-tenantId", value.code);
      settenantId(value);
    }
  };

  const GetSelectOptions = (lable, options, selected, select, optionKey, onRemove, key) => {
    selected = selected || { [optionKey]: " ", code: "" };
    return (
      <div>
        <div className="filter-label">{lable}</div>
        {<Dropdown option={options} selected={selected} select={(value) => select(value, key)} optionKey={optionKey} />}
        <div className="tag-container">
          {filters?.role?.length > 0 &&
            filters?.role?.map((value, index) => {
              return <RemoveableTag key={index} text={`${value[optionKey].slice(0, 22)} ...`} onClick={() => onRemove(index, key)} />;
            })}
        </div>
      </div>
    );
  };
      const getRoleDisplayName = (role, t) => {
      if (!role) return "N/A";
      
      // Try labelKey first
      if (role.labelKey) {
        const translated = t(role.labelKey);
        if (translated !== role.labelKey) return translated;
      }
      
      // Try translating code with underscore format
      if (role.code) {
        const normalizedCode = role.code.replace(/\s+/g, "_").toUpperCase();
        const translationKey = `ACCESSCONTROL_ROLES_ROLES_${normalizedCode}`;
        const translated = t(translationKey);
        if (translated !== translationKey) return translated;
      }
      // Fallback to name or code
      return role.name || role.code || "N/A";
    };
      
  if (tenantsLoading) {
    return (
      <div className="filter">
        <div className="filter-card">
          <div className="heading">
            <div className="filter-label">{t("LOADING")}...</div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <React.Fragment>
      <div className="filter">
        <div className="filter-card">
          <div className="heading">
            <div className="filter-label">
              <span>
                <svg width="17" height="17" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M0.66666 2.48016C3.35999 5.9335 8.33333 12.3335 8.33333 12.3335V20.3335C8.33333 21.0668 8.93333 21.6668 9.66666 21.6668H12.3333C13.0667 21.6668 13.6667 21.0668 13.6667 20.3335V12.3335C13.6667 12.3335 18.6267 5.9335 21.32 2.48016C22 1.60016 21.3733 0.333496 20.2667 0.333496H1.71999C0.613327 0.333496 -0.01334 1.60016 0.66666 2.48016Z"
                    fill="#505A5F"
                  />
                </svg>
              </span>
              <span>{t("HR_COMMON_FILTER")}:</span>{" "}
            </div>
            <div className="clear-search" onClick={clearAll}>
              {t("HR_COMMON_CLEAR_ALL")}
            </div>
            {/* {props.type === "desktop" && (
              <span className="clear-search hrms-filter__clear-search-icon" onClick={clearAll}>
                <svg width="17" height="17" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8 5V8L12 4L8 0V3C3.58 3 0 6.58 0 11C0 12.57 0.46 14.03 1.24 15.26L2.7 13.8C2.25 12.97 2 12.01 2 11C2 7.69 4.69 5 8 5ZM14.76 6.74L13.3 8.2C13.74 9.04 14 9.99 14 11C14 14.31 11.31 17 8 17V14L4 18L8 22V19C12.42 19 16 15.42 16 11C16 9.43 15.54 7.97 14.76 6.74Z"
                    fill="#505A5F"
                  />
                </svg>
              </span>
            )} */}
            {props.type === "mobile" && (
              <span onClick={props.onClose}>
                <CloseSvg />
              </span>
            )}
          </div>
          <div>
            <div>
              <div className="filter-label">{t("HR_CITY_LABEL") || t("HR_ULB_LABEL")}</div>
              <Dropdown
                option={mappedTenantOptions}
                selected={tenantId}
                select={onSelectTenants}
                optionKey={"i18text"}
                t={t}
                disable={!isStateLevelTenant}
              />
            </div>
            <div>
              <div className="filter-label">{t("HR_COMMON_TABLE_COL_DEPT")}</div>
              <Dropdown
                option={Digit.Utils.locale.convertToLocaleData(data?.MdmsRes?.["common-masters"]?.Department, 'COMMON_MASTERS_DEPARTMENT')}
                selected={departments}
                select={setDepartments}
                optionKey={"i18text"}
                t={t}
              />
            </div>
            <div>
              {/* <div>
                {GetSelectOptions(
                  t("HR_COMMON_TABLE_COL_ROLE"),
                  Digit.Utils.locale.convertToLocaleData(data?.MdmsRes["ACCESSCONTROL-ROLES"]?.roles, 'ACCESSCONTROL_ROLES_ROLES', t),
                  selectedRoles,
                  onSelectRoles,
                  "i18text",
                  onRemove,
                  "role"
                )}
              </div> */}
              <div>
                {GetSelectOptions(
                  t("HR_COMMON_TABLE_COL_ROLE"),
                  (data?.MdmsRes["ACCESSCONTROL-ROLES"]?.roles || []).map(role => ({
                    ...role,
                    i18text: getRoleDisplayName(role, t),  
                    code: role.code
                  })),
                  selectedRoles,
                  onSelectRoles,
                  "i18text",
                  onRemove,
                  "role"
                )}
              </div>
            </div>
            <div>
              <div className="filter-label">{t("HR_EMP_STATUS_LABEL")}</div>
              <RadioButtons
                onSelect={setIsactive}
                selected={isActive}
                selectedOption={isActive}
                optionsKey="name"
                options={[
                  { code: true, name: t("HR_ACTIVATE_HEAD") },
                  { code: false, name: t("HR_DEACTIVATE_HEAD") },
                ]}
              />
              {props.type !== "mobile" && <div>
                <SubmitBar onSubmit={() => onFilterChange(_searchParams)} label={t("HR_COMMON_APPLY")} />
              </div>}
            </div>
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
              onFilterChange(_searchParams)
              props?.onClose?.()
            }}
            className="hrms-filter__apply-bar"
          />
        </ActionBar>
      )}
    </React.Fragment>
  );
};

export default Filter;
