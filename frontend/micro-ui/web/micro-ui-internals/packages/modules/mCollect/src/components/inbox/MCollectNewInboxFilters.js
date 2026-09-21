import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import NewFilterFormFieldComponent from "../../../../templates/Inbox/NewFilterFormFieldsComponent";

const FALLBACK_STATUSES = ["ACTIVE", "PAID", "CANCELLED"];

const MCollectNewInboxFilters = ({ challans, selectedStatuses, isInboxLoading, onStatusChange }) => {
  const { control, setValue } = useForm({ defaultValues: { applicationStatus: selectedStatuses || [] } });

  useEffect(() => {
    setValue("applicationStatus", selectedStatuses || []);
  }, [selectedStatuses, setValue]);

  const statusCards = useMemo(() => {
    const counts = (challans || []).reduce((result, challan) => {
      const status = challan?.applicationStatus;
      if (status) result[status] = (result[status] || 0) + 1;
      return result;
    }, {});

    return [...new Set([...FALLBACK_STATUSES, ...Object.keys(counts)])].map((status) => ({
      applicationstatus: status,
      statusid: status,
      selectionValue: status,
      selectionValues: [status],
      count: counts[status] || 0,
      totalCount: counts[status] || 0,
    }));
  }, [challans]);

  return (
    <div className="mcollect-new-inbox-filters">
      <NewFilterFormFieldComponent
        controlFilterForm={control}
        statuses={statusCards}
        isInboxLoading={isInboxLoading}
        showAssigneeCards={false}
        handleFilter={({ applicationStatus = [] }) => onStatusChange(applicationStatus.map((status) => status?.code || status?.statusid).filter(Boolean))}
      />
    </div>
  );
};

export default MCollectNewInboxFilters;
