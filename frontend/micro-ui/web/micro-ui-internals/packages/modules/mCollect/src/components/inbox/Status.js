import React, { useMemo } from "react";
import { Loader, MultiSelectDropdown, RemoveableTag } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const Status = ({ searchParams, selectedStatuses, setSearchParams, setselectedStatuses, clearCheck, setclearCheck }) => {
  const { t } = useTranslation();
  const stateId = Digit.ULBService.getStateId();
  
  const { data, isLoading } = Digit.Hooks.mcollect.useMCollectMDMS(stateId, "mCollect", "applicationStatus");
  
  const getStatusList = () => {
    if (Array.isArray(data)) {
      return data;
    }
    if (data?.mCollect) {
      return data.mCollect.applcationStatus || data.mCollect.applicationStatus || [];
    }
    return [];
  };

  const applicationStatus = getStatusList();

  // Fallback to static mCollect statuses if the MDMS service returns empty or is not configured
  const finalStatusList = applicationStatus.length > 0 
    ? applicationStatus 
    : [
        { code: "ACTIVE", name: "ACTIVE" },
        { code: "PAID", name: "PAID" },
        { code: "CANCELLED", name: "CANCELLED" }
      ];

  const newMenu = useMemo(() => {
    return finalStatusList.map((option) => ({
      ...option,
      i18nKey: option.code,
    }));
  }, [finalStatusList]);

  const onAssignmentChange = (e) => {
    let filterParam = [];
    let selected = [];
    e &&
      e.map((ob) => {
        filterParam.push(ob?.[1]?.code);
        selected.push(ob?.[1]);
      });
    setSearchParams({ ...searchParams, status: [...filterParam] });
    setselectedStatuses([...selected]);
  };

  const onRemove = (option) => {
    let newStatus = (searchParams?.status || []).filter((ob) => ob !== option.code);
    let newSelected = selectedStatuses.filter((ob) => ob.code !== option.code);
    setSearchParams({ ...searchParams, status: [...newStatus] });
    setselectedStatuses([...newSelected]);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="status-container">
      <div className="filter-label" style={{ fontWeight: "normal" }}>
        {t("UC_COMMON_TABLE_COL_STATUS")}
      </div>
      <MultiSelectDropdown
        className="form-field"
        isMandatory={true}
        defaultUnit="Selected"
        selected={selectedStatuses}
        options={newMenu}
        onSelect={onAssignmentChange}
        optionsKey="i18nKey"
        t={t}
        ServerStyle={{ width: "100%", overflowY: "scroll", overflowX: "hidden" }}
      />
      <div className="tag-container">
        {selectedStatuses?.map((value, index) => (
          <div key={index}>
            <RemoveableTag text={`${t(value.code)}`} onClick={() => onRemove(value)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Status;
