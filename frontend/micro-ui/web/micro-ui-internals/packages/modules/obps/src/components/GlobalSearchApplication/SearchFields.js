import React, { useState } from "react";
import { TextInput, SubmitBar, SearchField, Dropdown, DatePicker, MobileNumber } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

/**
 * Search Fields Component
 * All search inputs from SearchFormFieldsComponent: Application Number, Owner Name, Mobile Number, 
 * Tenant ID, Application Type, Service Type, From Date, To Date, Status
 */
const SearchFields = ({ formData, onFieldChange, onClearAll, isMobile, tenantOptions, t }) => {
  const [error, setError] = useState("");
  const stateTenantId = Digit.ULBService.getStateId();
//   const { applicationTypes, ServiceTypes } = Digit.Hooks.obps.useServiceTypeFromApplicationType({
//     Applicationtype: formData?.applicationType?.code || "BUILDING_PLAN_SCRUTINY",
//     tenantId: stateTenantId,
//   });

  const ServiceTypes = [
    { code: "BPA", i18nKey: "BUILDING_PLAN_SCRUTINY", value: "BPA" },
    { code: "BPA_OC", i18nKey: "BUILDING_OC_PLAN_SCRUTINY", value: "BPA_OC" },
    { code: "NOC", i18nKey: "NO_OBJECTION_CERTIFICATE", value: "NOC" },
    { code: "CLU", i18nKey: "CHANGE_OF_LAND_USE", value: "CLU" },
    { code: "LAYOUT", i18nKey: "LAYOUT", value: "LAYOUT" },
  ];
  // Service types - kept as fallback
  const applicationTypeOptions =  [
    { code: "BUILDING_PLAN_SCRUTINY", i18nKey: "WF_BPA_BUILDING_PLAN_SCRUTINY", value: "BUILDING_PLAN_SCRUTINY" },
    { code: "BUILDING_OC_PLAN_SCRUTINY", i18nKey: "WF_BPA_BUILDING_OC_PLAN_SCRUTINY", value: "BUILDING_OC_PLAN_SCRUTINY" },
    { code: "BPA_STAKEHOLDER_REGISTRATION", i18nKey: "WF_BPA_BPA_STAKEHOLDER_REGISTRATION", value: "BPA_STAKEHOLDER_REGISTRATION" },
  ];

  const statusOptions = [
    { code: "APPROVED", i18nKey: "WF_BPA_APPROVED", value: "APPROVED" },
    { code: "REJECTED", i18nKey: "WF_BPA_REJECTED", value: "REJECTED" },
    { code: "PENDING", i18nKey: "WF_BPA_PENDING", value: "PENDING" },
    { code: "SUBMITTED", i18nKey: "WF_BPA_SUBMITTED", value: "SUBMITTED" },
  ];

  const handleAppNumberChange = (e) => {
    const value = e.target.value;
    if (value.length <= 50) {
      onFieldChange("applicationNo", value);
      setError("");
    } else {
      setError("Max 50 characters allowed");
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    onFieldChange("name", value);
  };

  const handleMobileChange = (value) => {
    // const value = e.target.value;
    if (/^[0-9]{0,10}$/.test(value)) {
      onFieldChange("mobileNumber", value);
    }
  };

  return (
    <div className={`search-form-wrapper ${isMobile ? "mobile-view" : ""}`}>

    
      {/* Tenant ID / Location */}
      <SearchField>
        <div className="label">{t("CS_COMMON_CHOOSE_LOCATION")}</div>
        <Dropdown
          selected={formData.tenantId}
          select={(opt) => onFieldChange("tenantId", opt)}
          option={tenantOptions}
          optionKey="i18nKey"
          t={t}
        />
      </SearchField>

      {/* Service Type */}
      <SearchField>
        <div className="label">{t("BPA_BASIC_DETAILS_SERVICE_TYPE_LABEL")}</div>
        <Dropdown
          selected={formData.serviceType}
          select={(opt) => onFieldChange("serviceType", opt)}
          option={ServiceTypes && ServiceTypes?.length > 0 ? ServiceTypes : []}
          optionKey="i18nKey"
          t={t}
        />
      </SearchField>

      {/* Application Number */}
      <SearchField>
        <div className="label">{t("BPA_SEARCH_APPLICATION_NO_LABEL")}</div>
        <TextInput
          value={formData.applicationNo}
          onChange={handleAppNumberChange}
          maxLength={50}
        />
        {error && <span style={{ color: "#c33", fontSize: "12px" }}>{error}</span>}
      </SearchField>

      {/* Owner Name */}
      <SearchField>
        <div className="label">{t("BPA_SEARCH_OWNER_NAME")}</div>
        <TextInput
          value={formData.name}
          onChange={handleNameChange}
        />
      </SearchField>

      {/* Mobile Number */}
      <SearchField>
        <div className="label">{t("BPA_APP_MOBILE_NO_SEARCH_PARAM")}</div>
        <div className="obps-search-mobile-wrapper">
          <MobileNumber
            value={formData.mobileNumber}
            onChange={handleMobileChange}
            type="tel"
          />
        </div>
      </SearchField>


      {/* Application Type */}
      {/* <SearchField>
        <div className="label">{t("BPA_SEARCH_APPLICATION_TYPE_LABEL")}</div>
        <Dropdown
          selected={formData.applicationType}
          select={(opt) => onFieldChange("applicationType", opt)}
          option={applicationTypeOptions}
          optionKey="i18nKey"
          t={t}
        />
      </SearchField> */}

      {/* From Date */}
      <SearchField>
        <div className="label">{t("BPA_APP_FROM_DATE_SEARCH_PARAM")}</div>
        <DatePicker
          date={formData.fromDate}
          onChange={(date) => onFieldChange("fromDate", date)}
        />
      </SearchField>

      {/* To Date */}
      <SearchField>
        <div className="label">{t("BPA_APP_TO_DATE_SEARCH_PARAM")}</div>
        <DatePicker
          date={formData.toDate}
          onChange={(date) => onFieldChange("toDate", date)}
        />
      </SearchField>

      {/* Status */}
      <SearchField>
        <div className="label">{t("BPA_SEARCH_APPLICATION_STATUS_LABEL")}</div>
        <Dropdown
          selected={formData.status}
          select={(opt) => onFieldChange("status", opt)}
          option={statusOptions}
          optionKey="i18nKey"
          t={t}
        />
      </SearchField>

      {/* Submit and Clear */}
      <SearchField className="submit">
        <SubmitBar label={t("ES_COMMON_SEARCH")} submit />
        <p
          style={{ marginTop: "24px", cursor: "pointer", color: "#007bc1", textDecoration: "underline" }}
          onClick={() => onClearAll?.()}
        >
          {t("ES_COMMON_CLEAR_ALL")}
        </p>
      </SearchField>
    </div>
  );
};

export default SearchFields;
