import React, { useEffect, useMemo, useRef, useState } from "react";
import { FilterFormField, Loader } from "@mseva/digit-ui-react-components";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import NewFilterFormFieldComponent from "../../../../templates/Inbox/NewFilterFormFieldsComponent";

const ChallanInboxFilters = ({ statuses, isInboxLoading, selectedStatuses, selectedOffenceTypes, onStatusChange, onOffenceTypeChange }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { control, setValue } = useForm({ defaultValues: { applicationStatus: selectedStatuses || [] } });
  const { data: offenceTypeData, isLoading: isOffenceTypeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "Challan", [{ name: "OffenceType" }]);
  const [isOffencePanelOpen, setIsOffencePanelOpen] = useState(false);
  const [offenceSearch, setOffenceSearch] = useState("");
  const offenceFilterRef = useRef(null);

  const offenceTypeOptions = useMemo(
    () =>
      (offenceTypeData?.Challan?.OffenceType || []).map((offenceType) => ({
        ...offenceType,
        code: offenceType?.name,
        i18nKey: offenceType?.name,
      })),
    [offenceTypeData]
  );

  const selectedOffenceOptions = useMemo(() => offenceTypeOptions.filter((option) => selectedOffenceTypes?.includes(option.i18nKey)), [
    offenceTypeOptions,
    selectedOffenceTypes,
  ]);

  const filteredOffenceOptions = useMemo(() => {
    const normalizedSearch = offenceSearch.trim().toLowerCase();
    if (!normalizedSearch) return offenceTypeOptions;
    return offenceTypeOptions.filter((option) => option.i18nKey?.toLowerCase().includes(normalizedSearch));
  }, [offenceSearch, offenceTypeOptions]);

  useEffect(() => {
    setValue("applicationStatus", selectedStatuses || []);
  }, [selectedStatuses, setValue]);

  useEffect(() => {
    const closeOffencePanel = (event) => {
      if (offenceFilterRef.current && !offenceFilterRef.current.contains(event.target)) {
        setIsOffencePanelOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOffencePanel);
    return () => document.removeEventListener("mousedown", closeOffencePanel);
  }, []);

  const toggleOffenceType = (offenceType) => {
    const offenceTypeName = offenceType?.i18nKey;
    const isSelected = selectedOffenceTypes?.includes(offenceTypeName);
    const nextOffenceTypes = isSelected
      ? selectedOffenceTypes.filter((selectedType) => selectedType !== offenceTypeName)
      : [...(selectedOffenceTypes || []), offenceTypeName];

    onOffenceTypeChange(nextOffenceTypes);
  };

  return (
    <div className="challan-new-inbox-filters">
      <NewFilterFormFieldComponent
        controlFilterForm={control}
        statuses={statuses}
        isInboxLoading={isInboxLoading}
        showAssigneeCards={false}
        handleFilter={({ applicationStatus = [] }) => {
          onStatusChange(applicationStatus.map((status) => status?.applicationstatus || status?.code).filter(Boolean));
        }}
      />

      <FilterFormField>
        <div className="challan-new-inbox-offence-filter" ref={offenceFilterRef}>
          <label className="filter-label sub-filter-label">{t("CHALLAN_OFFENCE_TYPE")}</label>
          {isOffenceTypeLoading ? (
            <div className="challan-new-inbox-offence-loader">
              <Loader />
            </div>
          ) : (
            <>
              <button
                type="button"
                className={`challan-new-inbox-offence-trigger ${isOffencePanelOpen ? "active" : ""}`}
                onClick={() => setIsOffencePanelOpen((isOpen) => !isOpen)}
                aria-expanded={isOffencePanelOpen}
              >
                <span>{selectedOffenceOptions.length ? `${selectedOffenceOptions.length} selected` : t("Select Offence")}</span>
                <span className="challan-new-inbox-offence-chevron" aria-hidden="true">
                  ⌄
                </span>
              </button>

              {isOffencePanelOpen ? (
                <div className="challan-new-inbox-offence-panel">
                  <input
                    type="search"
                    className="challan-new-inbox-offence-search"
                    value={offenceSearch}
                    onChange={(event) => setOffenceSearch(event.target.value)}
                    placeholder="Search offence type"
                    autoFocus
                  />
                  <div className="challan-new-inbox-offence-options">
                    {filteredOffenceOptions.length ? (
                      filteredOffenceOptions.map((offenceType) => {
                        const isSelected = selectedOffenceTypes?.includes(offenceType.i18nKey);
                        return (
                          <label key={offenceType.id || offenceType.i18nKey} className="challan-new-inbox-offence-option">
                            <input type="checkbox" checked={Boolean(isSelected)} onChange={() => toggleOffenceType(offenceType)} />
                            <span>{t(offenceType.i18nKey)}</span>
                          </label>
                        );
                      })
                    ) : (
                      <p className="challan-new-inbox-offence-empty">No offence type found</p>
                    )}
                  </div>
                </div>
              ) : null}

              {selectedOffenceOptions.length ? (
                <div className="challan-new-inbox-offence-tags">
                  {selectedOffenceOptions.map((offenceType) => (
                    <button
                      key={offenceType.id || offenceType.i18nKey}
                      type="button"
                      className="challan-new-inbox-offence-tag"
                      onClick={() => toggleOffenceType(offenceType)}
                    >
                      {t(offenceType.i18nKey)} <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </FilterFormField>
    </div>
  );
};

export default ChallanInboxFilters;
