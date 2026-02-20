import React, { useState, useEffect, useMemo } from "react";
import { FilterFormField } from "@mseva/digit-ui-react-components";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";

const NewFilterFormFieldsComponent = ({ statuses, controlFilterForm, applicationTypesOfBPA, handleFilter }) => {
  const { t } = useTranslation();
  const [showAllStatuses, setShowAllStatuses] = useState(false);

  const availableOptions = [
    { code: "ASSIGNED_TO_ME", name: `${t("ES_INBOX_ASSIGNED_TO_ME")}` },
    { code: "ASSIGNED_TO_ALL", name: `${t("ES_INBOX_ASSIGNED_TO_ALL")}` },
  ];

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

  const statusValues = Array.isArray(statusField.value) ? statusField.value : [];

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
    ...(statuses || []).map((status) => ({
      key: status.applicationstatus,
      type: "status",
      label: t(status.applicationstatus),
      subtitle: null,
      count: status.totalCount ?? status.count ?? status.noOfRecords ?? status.totalRecords ?? status.applicationCount ?? 0,
      code: status.applicationstatus,
      icon: "◎",
    })),
  ];

  const visibleCards = showAllStatuses ? cards : cards.slice(0, 6);

  return (
    <div className="ndc-new-inbox-filter-card" style={{ marginTop: 16, marginBottom: 16 }}>
      <FilterFormField>
        <div className="ndc-new-filter-status-wrapper">
          <div className="ndc-new-filter-status-grid ndc-new-filter-card-grid">
            {visibleCards.map((card, index) => {
              const isActive =
                card.type === "assignee"
                  ? assigneeField.value === card.code
                  : statusValues.includes(card.code);

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
                          applicationStatus: statusValues.map((code) => ({ code })),
                        });
                      }
                    } else {
                      toggleStatus(card.code);
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
          {cards.length > 6 ? (
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
