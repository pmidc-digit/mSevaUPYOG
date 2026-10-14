import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import NewFilterFormFieldComponent from "../../../../templates/Inbox/NewFilterFormFieldsComponent";

const TLNewInboxFilters = ({ statuses, selectedStatuses, isInboxLoading, onStatusChange }) => {
  const { control, setValue } = useForm({ defaultValues: { applicationStatus: selectedStatuses || [] } });

  useEffect(() => {
    setValue("applicationStatus", selectedStatuses || []);
  }, [selectedStatuses, setValue]);

  const statusCards = useMemo(
    () =>
      (statuses || []).reduce((cards, status) => {
        const applicationstatus = status?.applicationstatus || status?.applicationStatus || status?.status;
        const statusid = status?.statusid || status?.id || applicationstatus;
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
    <div className="tl-new-inbox-filters">
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

export default TLNewInboxFilters;
