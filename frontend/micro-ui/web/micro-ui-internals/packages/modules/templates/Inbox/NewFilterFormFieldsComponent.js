import React, { useState, useEffect, useMemo } from "react";
import { FilterFormField } from "@mseva/digit-ui-react-components";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";

const NewFilterFormFieldsComponent = ({ statuses, controlFilterForm, applicationTypesOfBPA, handleFilter, licenseTypes, showLicenseTypeFilter = false }) => {
  const { t } = useTranslation();
  const [showAllStatuses, setShowAllStatuses] = useState(false);

  const availableOptions = [
    { code: "ASSIGNED_TO_ME", name: `${t("ES_INBOX_ASSIGNED_TO_ME")}` },
    { code: "ASSIGNED_TO_ALL", name: `${t("ES_INBOX_ASSIGNED_TO_ALL")}` },
  ];

  // License Type options for BPAREG (Professional Registration) - Only shown in stakeholder inbox
  const licenseTypeOptions = showLicenseTypeFilter ? [
    { code: "ARCHITECT", name: "Architect" },
    { code: "ENGINEER", name: "Engineer" },
    { code: "TOWNPLANNER", name: "Town Planner" },
    { code: "SUPERVISOR", name: "Supervisor" },
  ] : [];

  applicationTypesOfBPA?.forEach((type) => {
    type.name = t(`WF_BPA_${type.code}`);
    type.i18nKey = t(`WF_BPA_${type.code}`);
  });

  const getVariantFromCode = (code) => {
    const value = String(code || "").toLowerCase();
    if (value.includes("approved")) return "success";
    if (value.includes("rejected")) return "danger";
    if (value.includes("pending")) return "warning";
    if (value.includes("inbox")) return "primary";
    if (value.includes("assigned")) return "primary";
    return "info";
  };

  const colorVariants = ["primary", "success", "warning", "danger", "info", "indigo", "teal", "pink", "amber", "slate"];
  const getVariantByIndex = (index, fallback) => colorVariants[index % colorVariants.length] || fallback;

  const { field: assigneeField } = useController({ name: "assignee", control: controlFilterForm });
  const { field: statusField } = useController({ name: "applicationStatus", control: controlFilterForm, defaultValue: [] });
  const { field: licenseTypeField } = useController({ name: "licenseType", control: controlFilterForm, defaultValue: [] });

  const statusValues = Array.isArray(statusField.value) ? statusField.value : [];
 console.log("[DEBUG]=== RENDER Filter Panel: statusValues ===", statusValues);
  const licenseTypeValues = Array.isArray(licenseTypeField.value) ? licenseTypeField.value : [];

  const getApplicationStatusParams = (values) => {
    return (values || []).map((val) => {
      // Resolve UUID to status code & business service
      const matched = (statuses || []).find((s) => s.statusid === val);
      if (matched) return { code: matched.applicationstatus, businessService: matched.businessservice };
      
      // Fallback for composite keys (e.g. LayoutInbox)
      const [code, bs] = val.split("__");
      return { code, businessService: bs };
    });
  };

  const toggleStatus = (statusCode, businessService) => {
 const compositeKey = businessService ? `${statusCode}__${businessService}` : statusCode;
         console.log("[DEBUG]=== CLICKED Status Card ===", { statusCode, businessService, compositeKey });

    let newStatusValues;
    if (statusValues.includes(compositeKey)) {
      newStatusValues = statusValues.filter((code) => code !== compositeKey);
    } else {
      newStatusValues = [...statusValues, compositeKey];
    }
    statusField.onChange(newStatusValues);
    // Immediately notify parent of filter change
    if (typeof handleFilter === "function") {
      handleFilter({
        applicationStatus: getApplicationStatusParams(newStatusValues),
      });
    }
  };

  const toggleLicenseType = (licenseTypeCode) => {
    let newLicenseTypeValues;
    if (licenseTypeValues.includes(licenseTypeCode)) {
      newLicenseTypeValues = licenseTypeValues.filter((code) => code !== licenseTypeCode);
    } else {
      newLicenseTypeValues = [...licenseTypeValues, licenseTypeCode];
    }
    licenseTypeField.onChange(newLicenseTypeValues);
    // Immediately notify parent of filter change
    if (typeof handleFilter === "function") {
      handleFilter({
        licenseType: newLicenseTypeValues,
        applicationStatus: getApplicationStatusParams(statusValues),
      });
    }
  };

  const cards = [
    ...availableOptions.map((option) => ({
      key: option.code,
      type: "assignee",
      label: option.name,
      subtitle: t("ES_INBOX_ASSIGNED"),
      count: null,
      code: option.code,
      icon: "⌂",
    })),
    ...(statuses || []).map((status) => {
      // Include businessService in key if available to avoid deduplication
      const businessService = status.businessservice || status.businessService;
      const uniqueKey = businessService ? `${status.applicationstatus}-${businessService}` : status.applicationstatus;
      return {
        key: uniqueKey,
        type: "status",
        label: t(status.applicationstatus),
        subtitle: businessService ? `${businessService}` : null,
        count: status.totalCount ?? status.count ?? status.noOfRecords ?? status.totalRecords ?? status.applicationCount ?? 0,
        code: status.statusid || status.applicationstatus,
        businessService: status.statusid ? null : businessService,
        icon: "◎",
      };
    }),
    ...licenseTypeOptions.map((licenseType) => ({
      key: licenseType.code,
      type: "licenseType",
      label: licenseType.name,
      subtitle: "License Type",
      count: null,
      code: licenseType.code,
      icon: "📋",
    })),
  ];

  const visibleCards = showAllStatuses ? cards : cards.slice(0, 6);

  // For stakeholder inbox, show assignee + license type cards only
  const displayCards = showLicenseTypeFilter 
    ? cards.filter(card => card.type === "assignee" || card.type === "licenseType")
    : visibleCards;

  return (
    <div className="ndc-new-inbox-filter-card" style={{ marginTop: 16, marginBottom: 16 }}>
      <FilterFormField>
        <div className="ndc-new-filter-status-wrapper">
          <div className="ndc-new-filter-status-grid ndc-new-filter-card-grid">
            {displayCards.map((card, index) => {
              const isActive =
                card.type === "assignee"
                  ? assigneeField.value === card.code
                  : card.type === "licenseType"
                  ? licenseTypeValues.includes(card.code)
                  : statusValues.includes(card.businessService ? `${card.code}__${card.businessService}` : card.code);


              const variant = getVariantByIndex(index, getVariantFromCode(card.code));

              return (
                <button
                  key={card.key}
                  type="button"
                  className={`ndc-new-filter-status-card ndc-new-filter-option-card ndc-new-filter-card ${variant} ${
                    isActive ? "active" : ""
                  }`}
                  onClick={() => {
                    if (card.type === "assignee") {
                      assigneeField.onChange(card.code);
                      // Notify parent when assignee filter changes
                      if (typeof handleFilter === "function") {
                        handleFilter({
                          assignee: card.code,
                          applicationStatus: getApplicationStatusParams(statusValues),
                          licenseType: licenseTypeValues,
                        });
                      }
                    } else if (card.type === "licenseType") {
                      toggleLicenseType(card.code);
                    } else {
                      toggleStatus(card.code, card.businessService);
                    }
                  }}
                >
                  {isActive ? (
                    <span className="ndc-new-filter-card-check" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                  <div className="ndc-new-filter-status-title ndc-new-filter-option-title">{card.label}</div>
                  {card.subtitle ? (
                    <div className="ndc-new-filter-option-subtitle">{card.subtitle}</div>
                  ) : (
                    <div className="ndc-new-filter-status-count">{card.count !== null && card.count !== undefined ? card.count : ""}</div>
                  )}
                  <span className="ndc-new-filter-card-icon" aria-hidden="true">
                    <span>{card.icon}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {!showLicenseTypeFilter && cards.length > 6 ? (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
              <button
              type="button"
              className="ndc-new-filter-show-more"
              onClick={() => setShowAllStatuses((prev) => !prev)}
              aria-label={showAllStatuses ? t("ES_COMMON_SHOW_LESS") : t("ES_COMMON_SHOW_MORE")}
            >
              <span className="ndc-new-filter-show-more-icon" aria-hidden="true">
                {showAllStatuses ? "▲" : "▼"}
              </span>
            </button>
            </div>
          
          ) : null}
        </div>
      </FilterFormField>
    </div>
  );
};

export default NewFilterFormFieldsComponent;
