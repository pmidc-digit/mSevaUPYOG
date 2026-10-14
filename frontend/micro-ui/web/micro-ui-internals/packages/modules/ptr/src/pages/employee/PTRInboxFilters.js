import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import NewFilterFormFieldComponent from "../../../../templates/Inbox/NewFilterFormFieldsComponent";

const PTRInboxFilters = ({ statuses, isInboxLoading, selectedStatuses, onStatusChange }) => {
  const { control, setValue } = useForm({ defaultValues: { applicationStatus: selectedStatuses || [] } });

  useEffect(() => {
    setValue("applicationStatus", selectedStatuses || []);
  }, [selectedStatuses, setValue]);

  return (
    <div className="ptr-new-inbox-filters">
      <NewFilterFormFieldComponent
        controlFilterForm={control}
        statuses={statuses}
        isInboxLoading={isInboxLoading}
        showAssigneeCards={false}
        handleFilter={({ applicationStatus = [] }) => {
          onStatusChange(applicationStatus.map((status) => status?.applicationstatus || status?.code).filter(Boolean));
        }}
      />
    </div>
  );
};

export default PTRInboxFilters;
