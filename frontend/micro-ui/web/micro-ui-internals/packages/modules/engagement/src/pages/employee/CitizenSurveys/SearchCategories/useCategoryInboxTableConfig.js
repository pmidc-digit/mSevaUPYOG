import React, { Fragment, useMemo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { DeleteIcon, EditIcon } from "@mseva/digit-ui-react-components";
const useCategoryInboxTableConfig = ({ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, inboxStyles = {}, setShowToast }) => {
  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;
  const GetStatusCell = (value) =>
    value === true ? <span className="sla-cell-success">Active</span> : value === false ? <span className="sla-cell-error">Inactive</span> : "-";
  const { t } = useTranslation();

  // const handleDeleteConfirm = (row) => {
  // console.log("Current row: ", row);
  // const currentStatus = row?.original?.isActive;
  // setShowToast({
  //   label: "Are you sure you want to delete this category?",
  //   isDeleteBtn: true,
  //   warning: true,
  //   isWarningButtons: true,
  //   rowData: { row },
  // });
  //   });
  // };

  const handleUpdateCategoryConfirm = (row) => {
    console.log("Current row: ", row);
    const currentStatus = row?.original?.isActive ? "Active" : "Inactive";
    const updatedStatus = row?.original?.isActive ? "Inactive" : "Active";
    setShowToast({
      label: `Are you sure you want to change the category status of "${row?.original?.label}" from ${currentStatus} to ${updatedStatus}? Please confirm.`,
      isDeleteBtn: true,
      warning: true,
      isWarningButtons: true,
      rowData: row?.original,
    });
  };

  const tableColumnConfig = useMemo(() => {
    return [
      {
        Header: t("Category"),
        accessor: "category",
        Cell: ({ row }) => {
          return (
            <div>
              {/* <Link to={`${parentRoute}/surveys/inbox/details/${row.original["uuid"]}`}> */}
              <span>{row.original?.label}</span>
              {/* </Link> */}
            </div>
          );
        },
      },
      {
        Header: t("Status"),
        accessor: "isActive",
        Cell: ({ row }) => GetStatusCell(row.original?.isActive),
      },

      {
        Header: t("Created On"),
        accessor: "createdTime",
        Cell: ({ row }) =>
          row.original?.auditDetails?.createdTime ? GetCell(format(new Date(row.original?.auditDetails?.createdTime), "dd/MM/yyyy")) : "",
      },

      {
        Header: t("Last Updated On"),
        accessor: "updatedTime",
        Cell: ({ row }) =>
          row.original?.auditDetails?.lastModifiedTime ? GetCell(format(new Date(row.original?.auditDetails?.lastModifiedTime), "dd/MM/yyyy")) : "",
      },
      // {
      //   Header: t("Delete Category"),
      //   accessor: "deleteCategory",
      //   Cell: ({ row }) => {
      //     return (
      //       <button onClick={() => handleDeleteConfirm(row)}>
      //         <DeleteIcon className="delete" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
      //       </button>
      //     );
      //   },
      // },
      {
        Header: t("Update Category Status"),
        accessor: "updateCategory",
        Cell: ({ row }) => {
          return (
            <div className="tooltip" /* style={{position:"relative"}} */>
              <div style={{ display: "flex", /* alignItems: "center", */ gap: "0 4px" }}>
                <button onClick={() => handleUpdateCategoryConfirm(row)}>
                  <EditIcon className="table-cell-for-update" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
                </button>
                <span className="tooltiptext" style={{ position: "absolute", width: "100px", marginLeft: "50%", fontSize: "medium" }}>
                  {t("Click here to update the category status")}
                </span>
              </div>
            </div>
          );
        },
      },
    ];
  });

  return {
    getCellProps: (cellInfo) => {
      return {
        style: {
          padding: "20px 18px",
          fontSize: "16px",
        },
      };
    },
    disableSort: false,
    autoSort: false,
    manualPagination: true,
    initSortI: "endDate",
    onPageSizeChange: onPageSizeChange,
    currentPage: parseInt(formState.tableForm?.offset / formState.tableForm?.limit),
    onNextPage: () =>
      dispatch({
        action: "mutateTableForm",
        data: { ...formState.tableForm, offset: parseInt(formState.tableForm?.offset) + parseInt(formState.tableForm?.limit) },
      }),
    onPrevPage: () =>
      dispatch({
        action: "mutateTableForm",
        data: { ...formState.tableForm, offset: parseInt(formState.tableForm?.offset) - parseInt(formState.tableForm?.limit) },
      }),
    pageSizeLimit: formState.tableForm?.limit,
    // onSort: onSort,
    // sortParams: [{id: getValues("sortBy"), desc: getValues("sortOrder") === "DESC" ? true : false}],
    totalRecords: parseInt(totalCount),
    onSearch: formState?.searchForm?.message,
    // globalSearch: {searchForItemsInTable},
    // searchQueryForTable,
    data: table,
    columns: tableColumnConfig,
    noResultsMessage: "No Category found",
    inboxStyles: { ...inboxStyles },
  };
};

export default useCategoryInboxTableConfig;
