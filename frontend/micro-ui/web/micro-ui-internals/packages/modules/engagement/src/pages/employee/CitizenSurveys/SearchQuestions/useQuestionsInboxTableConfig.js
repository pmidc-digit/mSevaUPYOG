import React, { Fragment, useMemo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { DeleteIcon, EditIcon } from "@mseva/digit-ui-react-components";
const useQuestionsInboxTableConfig = ({ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, inboxStyles = {}, setShowToast }) => {
  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;
  const { t } = useTranslation();

  // const handleDeleteConfirm = (row) => {
  // console.log("Current row: ", row);
  // const currentStatus = row?.original?.isActive;
  // setShowToast({
  //   label: "Are you sure you want to delete this question?",
  //   isDeleteBtn: true,
  //   warning: true,
  //   isWarningButtons: true,
  //   rowData: { row },
  // });
  //   });
  // };

  const handleUpdateQuestionConfirm = (row) => {
    //console.log("Current row: ", row);
    const currentStatus = row?.original?.status;
    const updatedStatus = currentStatus === "ACTIVE" ? "INACTIVE" : currentStatus === "INACTIVE" ? "ACTIVE" : "";

    setShowToast({
      label: `Are you sure you want to change the question status from ${currentStatus} to ${updatedStatus}? Please confirm.`,
      isDeleteBtn: true,
      warning: true,
      isWarningButtons: true,
      rowData: row?.original,
      updatedStatus: updatedStatus
    });
  };

  const tableColumnConfig = useMemo(() => {
    return [
      {
        Header: t("Question"),
        accessor: "questionStatement",
        Cell: ({ row }) => {
          return (
            <div>
              {/* <Link to={`${parentRoute}/surveys/inbox/details/${row.original["uuid"]}`}> */}
              <span>{row.original?.questionStatement}</span>
              {/* </Link> */}
            </div>
          );
        },
      },
      {
        Header: t("Is Question Active"),
        accessor: "isActive",
        Cell: ({ row }) => {
          return (
            <div>
              <span>{row.original?.status}</span>
            </div>
          );
        },
      },
      {
        Header: t("Question Type"),
        accessor: "questionType",
        Cell: ({ row }) => {
          return (
            <div>
              <span>{t(row.original?.type)}</span>
            </div>
          );
        },
      },
      {
        Header: t("Category"),
        accessor: "category",
        Cell: ({ row }) => {
          return (
            <div>
              <span>{row.original?.category?.label}</span>
            </div>
          );
        },
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
      //   Header: t("Delete Question"),
      //   accessor: "deleteQuestion",
      //   Cell: ({ row }) => {
      //     return (
      //       <button onClick={() => handleDeleteConfirm(row)}>
      //         <DeleteIcon className="delete" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
      //       </button>
      //     );
      //   },
      // },
      {
        Header: t("Update Question Status"),
        accessor: "updateQuestion",
        Cell: ({ row }) => {
          return (
            <button onClick={() => handleUpdateQuestionConfirm(row)}>
              <EditIcon className="table-cell-for-update" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
            </button>
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
    autoSort: true,
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
    noResultsMessage: "No Question found",
    inboxStyles: { ...inboxStyles },
  };
};

export default useQuestionsInboxTableConfig;
