import React, { Fragment, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { InfoBannerIcon } from "@mseva/digit-ui-react-components";
import { DeleteIcon, EditIcon } from "@mseva/digit-ui-react-components";

const useInboxTableConfig = ({
  parentRoute,
  onPageSizeChange,
  formState,
  totalCount,
  table,
  dispatch,
  inboxStyles = {},
  setShowToast,
  setShowTermsPopup,
  setData,
}) => {
  const history = useHistory();
  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;
  const GetStatusCell = (value) =>
    value === true ? <span className="sla-cell-success">Active</span> : value === false ? <span className="sla-cell-error">Inactive</span> : "-";
  const { t } = useTranslation();
  const userInfo = Digit.UserService.getUser();

  const handleUpdateSurveyConfirm = (row) => {
    const currentStatus = row?.original?.active ? "Active" : "Inactive";
    const updatedStatus = row?.original?.active ? "Inactive" : "Active";
    setShowToast({
      label: `Are you sure you want to change the survey status of "${row?.original?.surveyTitle}" from ${currentStatus} to ${updatedStatus}? Please confirm.`,
      isDeleteBtn: true,
      warning: true,
      isWarningButtons: true,
      rowData: row?.original,
    });
  };

  const tableColumnConfig = useMemo(() => {
    return [
      {
        Header: t("Survey Name"),
        accessor: "suveyName",
        Cell: ({ row }) => {
          return (
            <div>
              {/* <Link to={`${parentRoute}/surveys/inbox/details/${row.original["uuid"]}`}> */}
              {/* <span className="link">{row.original.surveyTitle}</span> */}
              <span
                className="link"
                onClick={() => {
                  history.push({ pathname: `/digit-ui/employee/engagement/surveys/previewQuestions`, state: { data: row.original } });
                }}
              >
                {row.original.surveyTitle}
              </span>
              {/* </Link> */}
            </div>
          );
        },
      },
      {
        Header: t("EVENTS_START_DATE_LABEL"),
        accessor: "startDate",
        Cell: ({ row }) => (row.original?.startDate ? GetCell(format(new Date(row.original?.startDate), "dd/MM/yyyy")) : ""),
      },
      {
        Header: t("EVENTS_END_DATE_LABEL"),
        accessor: "endDate",
        Cell: ({ row }) => (row.original?.endDate ? GetCell(format(new Date(row.original?.endDate), "dd/MM/yyyy")) : ""),
      },
      {
        Header: <div>{t("EVENTS_STATUS_LABEL")}</div>,
        accessor: "status",
        Cell: ({ row }) => {
          return <div style={{ wordBreak: "normal" }}>{GetStatusCell(row?.original?.active)}</div>;
        },
        // Cell: ({ row }) => GetStatusCell(row.original?.active),
      },
      {
        Header: t("EVENTS_POSTEDBY_LABEL"),
        accessor: "postedBy",
        Cell: ({ row }) => GetCell(row.original?.postedBy),
        // accessor: (row) => row.postedBy,
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
      {
        Header: t("Update Status"),
        accessor: "updateSurvey",
        Cell: ({ row }) => {
          return (
            <div className="tooltip" /* style={{position:"relative"}} */>
              <div style={{ display: "flex", /* alignItems: "center", */ gap: "0 4px" }}>
                <button onClick={() => handleUpdateSurveyConfirm(row)}>
                  <EditIcon className="table-cell-for-update" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
                </button>
                <span className="tooltiptext" style={{ position: "absolute", width: "100px", marginLeft: "50%", fontSize: "medium" }}>
                  {t("Click here to update the survey status")}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        Header: t("Update Date"),
        accessor: "updateSurveyDate",
        Cell: ({ row }) => {
          return (
            <div className="tooltip" /* style={{position:"relative"}} */>
              <div style={{ display: "flex", /* alignItems: "center", */ gap: "0 4px" }}>
                <button
                  onClick={() => {
                    setShowTermsPopup(true);
                    setData(row);
                  }}
                >
                  <EditIcon className="table-cell-for-update" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
                </button>
                <span className="tooltiptext" style={{ position: "absolute", width: "100px", marginLeft: "50%", fontSize: "medium" }}>
                  {t("Click here to update the survey date")}
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
    initSortId: "endDate",
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
    totalRecords: totalCount,
    onSearch: formState?.searchForm?.message,
    onLastPage: () =>
      dispatch({
        action: "mutateTableForm",
        data: { ...formState.tableForm, offset: Math.ceil(totalCount / 10) * 10 - parseInt(formState.tableForm?.limit) },
      }),
    onFirstPage: () => dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } }),
    // globalSearch: {searchForItemsInTable},
    // searchQueryForTable,
    data: table,
    columns: tableColumnConfig,
    noResultsMessage: "CS_NO_SURVEYS_FOUND",
    inboxStyles: { ...inboxStyles },
  };
};

export default useInboxTableConfig;
