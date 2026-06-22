import React, { useState, useEffect, useMemo } from "react";
import { FilterFormField, Loader } from "@mseva/digit-ui-react-components";
import { useController } from "react-hook-form";
import { useTranslation } from "react-i18next";

const NewFilterFormFieldsComponent = ({
  statuses,
  controlFilterForm,
  applicationTypesOfBPA,
  handleFilter,
  licenseTypes,
  isInboxLoading = false,
  assigneeCounts = {},
  showAssigneeCards = true,
  showLicenseTypeFilter = false,
}) => {
  const { t } = useTranslation();
  const [showAllStatuses, setShowAllStatuses] = useState(false);
  const duplicateStatusCodes = useMemo(() => {
    const counts = (statuses || []).reduce((acc, status) => {
      const key = status?.applicationstatus;
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return new Set(Object.keys(counts).filter((key) => counts[key] > 1));
  }, [statuses]);

  const availableOptions = showAssigneeCards
    ? [
        { code: "ASSIGNED_TO_ME", name: `${t("ES_INBOX_ASSIGNED_TO_ME")}` },
        { code: "ASSIGNED_TO_ALL", name: `${t("ES_INBOX_ASSIGNED_TO_ALL")}` },
      ]
    : [];

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
  const getStatusCount = (status) => status?.totalCount ?? status?.count ?? status?.noOfRecords ?? status?.totalRecords ?? status?.applicationCount ?? 0;

  const { field: assigneeField } = useController({ name: "assignee", control: controlFilterForm });
  const { field: statusField } = useController({ name: "applicationStatus", control: controlFilterForm, defaultValue: [] });
  const { field: licenseTypeField } = useController({ name: "licenseType", control: controlFilterForm, defaultValue: [] });

  const statusValues = Array.isArray(statusField.value) ? statusField.value : [];

  const licenseTypeValues = Array.isArray(licenseTypeField.value) ? licenseTypeField.value : [];

  const getCardSelectionCodes = (statusCard) => {
    if (Array.isArray(statusCard?.selectionValues) && statusCard.selectionValues.length) return statusCard.selectionValues;
    if (statusCard?.selectionValue) return [statusCard.selectionValue];
    if (Array.isArray(statusCard?.statusids) && statusCard.statusids.length) return statusCard.statusids;
    return [statusCard.code];
  };

  const isStatusCardActive = (statusCard) => {
    const statusCodes = getCardSelectionCodes(statusCard);
    if (!statusCodes.length) return false;
    if (Array.isArray(statusCard?.statusids) && statusCard.statusids.length > 1) {
      return statusCodes.some((code) => statusValues.includes(code));
    }
    return statusCodes.every((code) => statusValues.includes(code));
  };

  const toggleStatus = (statusCard) => {
    const statusCodes = getCardSelectionCodes(statusCard);
    const isSelected = statusCodes.every((code) => statusValues.includes(code));
    let newStatusValues;
    if (isSelected) {
      newStatusValues = statusValues.filter((code) => !statusCodes.includes(code));
    } else {
      newStatusValues = [...new Set([...statusValues, ...statusCodes])];
    }
    statusField.onChange(newStatusValues);
    // Immediately notify parent of filter change
    if (typeof handleFilter === "function") {
      handleFilter({
        applicationStatus: newStatusValues.map((code) => {
          const matchedStatus = (statuses || []).find(
            (status) =>
              (status?.selectionValue || status?.statusid || status?.applicationstatus) === code ||
              (Array.isArray(status?.selectionValues) && status.selectionValues.includes(code)) ||
              (Array.isArray(status?.statusids) && status.statusids.includes(code))
          );
          return {
            code,
            statusid: matchedStatus?.statusid || code,
            statusids: matchedStatus?.statusids || (matchedStatus?.statusid ? [matchedStatus.statusid] : []),
            applicationstatus: matchedStatus?.applicationstatus,
            businessService: matchedStatus?.businessService || matchedStatus?.businessservice,
          };
        }),
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
      subtitle: null,
      count: assigneeCounts?.[option.code] ?? null,
      code: option.code,
      icon: "⌂",
    })),
    ...(statuses || []).map((status) => {
      // Include businessService in key if available to avoid deduplication
      const businessService = status.businessService || status.businessservice;
      const uniqueKey = status.statusid || (businessService ? `${status.applicationstatus}-${businessService}` : status.applicationstatus);
      const hasDuplicateName = duplicateStatusCodes.has(status.applicationstatus);
      const count = getStatusCount(status);
      return {
        key: uniqueKey,
        type: "status",
        label: t(status.applicationstatus),
        subtitle: hasDuplicateName && businessService ? `${businessService} (${count})` : null,
        count,
        code: status.selectionValue || status.statusid || status.applicationstatus,
        statusCode: status.applicationstatus,
        statusid: status.statusid,
        statusids: status.statusids || (status.statusid ? [status.statusid] : []),
        selectionValue: status.selectionValue,
        selectionValues: status.selectionValues,
        businessService,
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

  const stakeholderPrimaryCards = cards.filter((card) => card.type === "assignee" || card.type === "licenseType");
  const stakeholderStatusCards = cards.filter((card) => card.type === "status");
  const displayCards = showLicenseTypeFilter ? stakeholderPrimaryCards : visibleCards;

  return (
    <div className="ndc-new-inbox-filter-card" style={{ marginTop: 16, marginBottom: 16 }}>
      <FilterFormField>
        <div className="ndc-new-filter-status-wrapper">
          <div className="ndc-new-filter-status-grid ndc-new-filter-card-grid">
            {displayCards.map((card, index) => {
              const selectedStatusCodes = getCardSelectionCodes(card);
              const isActive =
                card.type === "assignee"
                  ? assigneeField.value === card.code
                  : card.type === "licenseType"
                  ? licenseTypeValues.includes(card.code)
                  : isStatusCardActive(card);

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
                          licenseType: licenseTypeValues,
                        });
                      }
                    } else if (card.type === "licenseType") {
                      toggleLicenseType(card.code);
                    } else {
                      toggleStatus(card);
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
          {showLicenseTypeFilter && (stakeholderStatusCards.length > 0 || isInboxLoading) ? (
            <>
              <div className="filter-label sub-filter-label" style={{ fontSize: "18px", fontWeight: "600", marginTop: 16 }}>
                {t("ACTION_TEST_APPLICATION_STATUS")}
              </div>
              {isInboxLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
                  <Loader />
                </div>
              ) : (
                <div className="ndc-new-filter-status-grid ndc-new-filter-card-grid">
                  {stakeholderStatusCards.map((card, index) => {
                    const selectedStatusCodes = getCardSelectionCodes(card);
                    const isActive = isStatusCardActive(card);
                    const variant = getVariantByIndex(index + stakeholderPrimaryCards.length, getVariantFromCode(card.code));

                    return (
                      <button
                        key={card.key}
                        type="button"
                        className={`ndc-new-filter-status-card ndc-new-filter-option-card ndc-new-filter-card ${variant} ${
                          isActive ? "active" : ""
                        }`}
                        onClick={() => toggleStatus(card)}
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
              )}
            </>
          ) : null}
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
