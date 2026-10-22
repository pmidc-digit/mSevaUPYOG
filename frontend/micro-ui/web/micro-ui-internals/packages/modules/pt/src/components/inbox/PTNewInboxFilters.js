import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import NewFilterFormFieldComponent from "../../../../templates/Inbox/NewFilterFormFieldsComponent";

const PTNewInboxFilters = ({ statuses, selectedStatuses, isInboxLoading, onStatusChange }) => {
  const { control, setValue } = useForm({ defaultValues: { applicationStatus: selectedStatuses || [] } });

  useEffect(() => {
    setValue("applicationStatus", selectedStatuses || []);
  }, [selectedStatuses, setValue]);

  const statusCards = useMemo(
    () =>
      (statuses || []).reduce((cards, status) => {
        const rawStatus = status?.applicationstatus || status?.applicationStatus || status?.status;
        const applicationstatus = rawStatus ? `ES_PT_COMMON_STATUS_${rawStatus}` : null;
        const statusid = status?.statusid || status?.uuid || status?.id || applicationstatus;
        const count = Number(status?.count ?? status?.totalCount ?? status?.noOfRecords ?? 0);

        if (!applicationstatus || !statusid) return cards;

        const existingCard = cards.find((card) => card.applicationstatus === applicationstatus);
        if (existingCard) {
          existingCard.count += count;
          existingCard.totalCount = existingCard.count;
          existingCard.statusids = [...existingCard.statusids, statusid];
          existingCard.selectionValues = [...existingCard.selectionValues, statusid];
        } else {
          cards.push({
            ...status,
            applicationstatus,
            count,
            totalCount: count,
            statusids: [statusid],
            selectionValues: [statusid],
            selectionValue: statusid,
          });
        }

        return cards;
      }, []),
    [statuses]
  );

  return (
    <div className="pt-new-inbox-filters">
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

export default PTNewInboxFilters;
