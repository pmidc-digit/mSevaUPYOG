import { Dropdown } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { CustomButton, Menu } from "@mseva/digit-ui-react-components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
    if (searcher == "") return str;
    while (str?.includes(searcher)) {
        str = str?.replace(searcher, replaceWith);
    }
    return str;
};

const ProfessionalChangeCity = (prop) => {
    const { t } = useTranslation();
    const { data: cities, isLoading } = Digit.Hooks.useTenants();
    const { selectedCity, userInfo } = prop;

    const cityOptions = cities?.map((city) => ({ ...city, displayName: t(city.i18nKey) }))?.filter((city) => city.code !== "pb.punjab") || [];

    // Filter cityOptions based on user roles
    const roles = userInfo?.roles || [];
    const hasBPAArchitect = roles.some(role => role?.code === "BPA_ARCHITECT");
    
    let filteredCityOptions = cityOptions;
    
    if (!hasBPAArchitect) {
      // Get all roles with code starting with "BPA"
      const bpaRoles = roles.filter(role => role?.code?.startsWith("BPA"));
      
      // Extract tenantIds from BPA roles
      const allowedTenantIds = bpaRoles.map(role => role?.tenantId);
      
      // Filter cityOptions to only include cities with codes in allowedTenantIds
      filteredCityOptions = cityOptions.filter(city => allowedTenantIds.includes(city?.code));
    }

    function setCity(city) {
        Digit.SessionStorage.set("CITIZEN.COMMON.HOME.CITY", city);
        localStorage.setItem("CITIZEN.CITY", city?.code);
        window.location.reload();
        // onLocationChange && onLocationChange(city);
    }

    console.log("filteredCityOptions", selectedCity);

    const style ={
    locationWrapper : {
        width: "100%"
    }
  }

    // if (isDropdown) {
    return (
        <div className="location-wrapper" style={style.locationWrapper}>
        <div style={prop?.mobileView ? { color: "#767676", width: "100%", height: "auto", overflow: "visible" } : { width: "150px", height: "auto", paddingRight: "16px", overflow: "visible" }}>
            {!isLoading && (
                <Dropdown
                    option={filteredCityOptions}
                    optionKey="displayName"
                    id="city"
                    selected={selectedCity?.value}
                    select={setCity}
                    t={t}
                    // customSelector={<label className="cp">{prop?.t(`TENANT_TENANTS_${stringReplaceAll(localStorage.getItem("CITIZEN.CITY"), ".", "_")?.toUpperCase()}`)}</label>}
                />
            )}
        </div>
        </div>
    );
};

export default ProfessionalChangeCity;
