import React, { useState, useEffect } from "react";
import { FilterFormField } from "@mseva/digit-ui-react-components";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

const NewFilterFormFieldsComponent = ({ statuses, controlFilterForm, applicationTypesOfBPA, handleFilter }) => {
  const { t } = useTranslation();

  const [tlfilters, setTLFilters] = useState({
    applicationStatus: [],
  });
  const [showAllStatuses, setShowAllStatuses] = useState(false);

  useEffect(() => {
    if (tlfilters && typeof handleFilter === "function") {
      handleFilter(tlfilters);
    }
  }, [tlfilters, handleFilter]);

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

  return (
    <div className="ndc-new-inbox-filter-card" style={{ marginTop: 16, marginBottom: 16 }}>
      <FilterFormField>
        <Controller
          name="assignee"
          control={controlFilterForm}
          render={(props) => (
            <div className="ndc-new-filter-card-grid">
              {availableOptions.map((option, index) => (
                <button
                  key={option.code}
                  type="button"
                  className={`ndc-new-filter-option-card ndc-new-filter-card ${getVariantByIndex(
                    index,
                    getVariantFromCode(option.code)
                  )} ${
                    props.value === option.code ? "active" : ""
                  }`}
                  onClick={() => props.onChange(option.code)}
                >
                  <div className="ndc-new-filter-option-title">{option.name}</div>
                  <div className="ndc-new-filter-option-subtitle">{t("ES_INBOX_ASSIGNED")}</div>
                  <span className="ndc-new-filter-card-icon" aria-hidden="true">
                    <span>⌂</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        />
      </FilterFormField>

      <FilterFormField>
        <Controller
          name="applicationStatus"
          control={controlFilterForm}
          defaultValue={[]}
          render={(props) => {
            const toggleStatus = (statusCode) => {
              if (props.value.includes(statusCode)) {
                props.onChange(props.value.filter((code) => code !== statusCode));
              } else {
                props.onChange([...props.value, statusCode]);
              }
            };

            const visibleStatuses = showAllStatuses ? statuses : statuses?.slice(0, 6);

            return (
              <div className="ndc-new-filter-status-wrapper">
                <div className="ndc-new-filter-status-grid">
                  {visibleStatuses?.map((status, index) => (
                    <button
                      key={status.applicationstatus}
                      type="button"
                      className={`ndc-new-filter-status-card ndc-new-filter-card ${getVariantByIndex(
                        index,
                        getVariantFromCode(status.applicationstatus)
                      )} ${props.value.includes(status.applicationstatus) ? "active" : ""}`}
                      onClick={() => toggleStatus(status.applicationstatus)}
                    >
                      <div className="ndc-new-filter-status-title">{t(status.applicationstatus)}</div>
                      <div className="ndc-new-filter-status-count">{status.count}</div>
                      <span className="ndc-new-filter-card-icon" aria-hidden="true">
                        <span>◎</span>
                      </span>
                    </button>
                  ))}
                </div>
                {statuses?.length > 3 ? (
                  <button
                    type="button"
                    className="ndc-new-filter-show-more"
                    onClick={() => setShowAllStatuses((prev) => !prev)}
                  >
                    {showAllStatuses ? t("ES_COMMON_SHOW_LESS") : t("ES_COMMON_SHOW_MORE")}
                  </button>
                ) : null}
              </div>
            );
          }}
        />
      </FilterFormField>
    </div>
  );
};

export default NewFilterFormFieldsComponent;
