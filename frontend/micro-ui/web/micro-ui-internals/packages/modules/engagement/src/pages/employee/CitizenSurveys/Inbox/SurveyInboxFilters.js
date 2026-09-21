import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import NewFilterFormFieldComponent from "../../../../../../templates/Inbox/NewFilterFormFieldsComponent";

const SurveyInboxFilters = ({ statuses, selectedStatuses, isInboxLoading, onStatusChange }) => {
  const { control, setValue } = useForm({ defaultValues: { applicationStatus: selectedStatuses || [] } });

  useEffect(() => {
    setValue("applicationStatus", selectedStatuses || []);
  }, [selectedStatuses, setValue]);

  return (
    <div className="survey-new-inbox-filters">
      <NewFilterFormFieldComponent
        controlFilterForm={control}
        statuses={statuses}
        isInboxLoading={isInboxLoading}
        showAssigneeCards={false}
        handleFilter={({ applicationStatus = [] }) => {
          const selectedValues = [...new Set(applicationStatus.map((status) => status?.code).filter((value) => typeof value === "boolean"))];
          onStatusChange(selectedValues.length === 1 ? selectedValues[0] : null);
        }}
      />
    </div>
  );
};

export default SurveyInboxFilters;
