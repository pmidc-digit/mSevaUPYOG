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

  const licenseTypeValues = Array.isArray(licenseTypeField.value) ? licenseTypeField.value : [];

  const toggleStatus = (statusCode) => {
    let newStatusValues;
    if (statusValues.includes(statusCode)) {
      newStatusValues = statusValues.filter((code) => code !== statusCode);
    } else {
      newStatusValues = [...statusValues, statusCode];
    }
    statusField.onChange(newStatusValues);
    // Immediately notify parent of filter change
    if (typeof handleFilter === "function") {
      handleFilter({
        applicationStatus: newStatusValues.map((code) => ({ code })),
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
        applicationStatus: statusValues.map((code) => ({ code })),
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
      const uniqueKey = status.businessService ? `${status.applicationstatus}-${status.businessService}` : status.applicationstatus;
      return {
        key: uniqueKey,
        type: "status",
        label: t(status.applicationstatus),
        subtitle: status.businessService ? `${status.businessService}` : null,
        count: status.totalCount ?? status.count ?? status.noOfRecords ?? status.totalRecords ?? status.applicationCount ?? 0,
        code: status.applicationstatus,
        businessService: status.businessService,
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
    <div className="custom-new-inbox-filter-card" style={{ marginTop: 16, marginBottom: 16 }}>
      <FilterFormField>
        <div className="custom-new-filter-status-wrapper">
          <div className="custom-new-filter-status-grid custom-new-filter-card-grid">
            {displayCards.map((card, index) => {
              const isActive =
                card.type === "assignee"
                  ? assigneeField.value === card.code
                  : card.type === "licenseType"
                  ? licenseTypeValues.includes(card.code)
                  : statusValues.includes(card.code);

              const variant = getVariantByIndex(index, getVariantFromCode(card.code));

              return (
                <button
                  key={card.key}
                  type="button"
                  className={`custom-new-filter-status-card custom-new-filter-option-card custom-new-filter-card ${variant} ${
                    isActive ? "active" : ""
                  }`}
                  onClick={() => {
                    if (card.type === "assignee") {
                      assigneeField.onChange(card.code);
                      // Notify parent when assignee filter changes
                      if (typeof handleFilter === "function") {
                        handleFilter({
                          assignee: card.code,
                          applicationStatus: statusValues.map((code) => ({ code })),
                          licenseType: licenseTypeValues,
                        });
                      }
                    } else if (card.type === "licenseType") {
                      toggleLicenseType(card.code);
                    } else {
                      toggleStatus(card.code);
                    }
                  }}
                >
                  {isActive ? (
                    <span className="custom-new-filter-card-check" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                  <div className="custom-new-filter-status-title custom-new-filter-option-title">{card.label}</div>
                  {card.subtitle ? (
                    <div className="custom-new-filter-option-subtitle">{card.subtitle}</div>
                  ) : (
                    <div className="custom-new-filter-status-count">{card.count !== null && card.count !== undefined ? card.count : ""}</div>
                  )}
                  <span className="custom-new-filter-card-icon" aria-hidden="true">
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
              className="custom-new-filter-show-more"
              onClick={() => setShowAllStatuses((prev) => !prev)}
              aria-label={showAllStatuses ? t("ES_COMMON_SHOW_LESS") : t("ES_COMMON_SHOW_MORE")}
            >
              <span className="custom-new-filter-show-more-icon" aria-hidden="true">
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
