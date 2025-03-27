import React, { Fragment, useMemo } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { InfoBannerIcon } from "@mseva/digit-ui-react-components";
import { DeleteIcon, EditIcon } from "@mseva/digit-ui-react-components";

const useInboxTableConfig = ({ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, inboxStyles = {}, setShowToast }) => {
  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;
  const GetStatusCell = (value) =>
    value === true ? <span className="sla-cell-success">Active</span> : value === false ? <span className="sla-cell-error">Inactive</span> : "-";
  const { t } = useTranslation();

  const handleUpdateSurveyConfirm = (row) => {
    console.log("Current row: ", row);
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
              <span className="link">{row.original.surveyTitle}</span>
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
      //   {
      //     Header: t("CS_RESPONSE_COUNT"),
      //     accessor: "answersCount",
      //     Cell: ({ row }) => (row.original?.answersCount ? GetCell(Number(row.original?.answersCount)) : "-"),
      //   },
      {
        Header: (
          <div>
            {t("EVENTS_STATUS_LABEL")}
            {/* <div className="tooltip" style={{ marginLeft: "5px" }}>
              <InfoBannerIcon fill="#0b0c0c" style />
              <span
                className="tooltiptext"
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "small",
                  wordWrap: "break-word",
                  width: "120px",
                  marginLeft: "15px",
                  marginBottom: "-260px",
                  //overflow:"auto"
                }}
              >
                {`${t(`SURVEY_STATUS_TOOLTIP`)}`}
              </span>
            </div> */}
          </div>
        ),
        accessor: "status",
        Cell: ({ row }) => GetStatusCell(row.original?.active),
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
      //   {
      //     Header: t("CS_SURVEY_RESULTS"),
      //     //accessor: "uuid",
      //     accessor: "results",
      //     Cell: ({ row }) => {
      //       return (
      //         <div style={{ display: "flex", justifyContent: "center" }}>
      //           <Link to={`${parentRoute}/surveys/inbox/results/${row.original["uuid"]}`}>
      //             <span className="link">
      //               <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      //                 <path d="M5.5 18H0V6H5.5V18ZM12.75 0H7.25V18H12.75V0ZM20 8H14.5V18H20V8Z" fill="#a82227" />
      //               </svg>
      //             </span>
      //           </Link>
      //         </div>
      //       );
      //     },
      //   },
      {
        Header: t("Update Survey Status"),
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
