import { format } from "date-fns";

export const getStatusChangeDateColumn = (t) => ({
  Header: t("Status Change Date"),
  id: "statusChangeDate",
  isStatusColumn: false,
  accessor: (row) => {
    const application = row?._searchData;
    const timestamp = Number(
      application?.ProcessInstance?.auditDetails?.lastModifiedTime ?? application?.businessObject?.auditDetails?.lastModifiedTime
    );
    const date = new Date(timestamp);
    return timestamp > 0 && Number.isFinite(date.getTime()) ? format(date, "dd/MM/yyyy HH:mm") : "-";
  },
  disableSortBy: true,
});
