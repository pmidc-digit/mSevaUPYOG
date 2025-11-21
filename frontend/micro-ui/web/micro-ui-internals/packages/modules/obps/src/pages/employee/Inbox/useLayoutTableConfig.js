
import React,{ useMemo } from "react"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"

const useLayoutTableConfig = ({
  parentRoute,
  onPageSizeChange,
  formState,
  totalCount,
  table,
  dispatch,
  onSortingByData,
}) => {

  console.log("parent route", parentRoute);
  const { t } = useTranslation()

  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>

  const tableColumnConfig = useMemo(() => {
    return [
           {
                 Header: t("BPA_APPLICATION_NUMBER_LABEL"),
                 accessor: "applicationNo",
                 disableSortBy: true,
                 Cell: ({ row }) => {
                 return (
                     <div>
                        <Link to={`${parentRoute}/layout/inbox/application-overview/${row.original["applicationId"]}`}>
                          <span className="link">{row.original["applicationId"]}</span>
                        </Link>
                      </div>
                 );
                 },
             },
            
    
             {
                 Header: t("EVENTS_STATUS_LABEL"),
                 accessor: row => row?.status ? t(`WF_LAYOUT_${row?.status}`) : t(`WF_LAYOUT_${row?.status}`),
                 disableSortBy: true,
             },
             {
                 Header: t("WF_INBOX_HEADER_OWNER_NAME"),
                 accessor: (row) => t(row?.owner
),
                 disableSortBy: true,
             },
             {
                 Header: t("BPA_SEARCH_APPLICATION_TYPE_LABEL"),
                 accessor: (row) => (t(row?.applicationType)
),
                 disableSortBy: true,
             },
    ]
  }, [])

  return {
    getCellProps: (cellInfo) => {
      return {
        style: {
          padding: "20px 18px",
          fontSize: "16px",
        },
      }
    },
    disableSort: false,
    autoSort: false,
    manualPagination: true,
    initSortId: "applicationDate",
    onPageSizeChange: onPageSizeChange,
    currentPage: formState.tableForm?.offset / formState.tableForm?.limit,
    onNextPage: () =>
      dispatch({
        action: "mutateTableForm",
        data: {
          ...formState.tableForm,
          offset: Number.parseInt(formState.tableForm?.offset) + Number.parseInt(formState.tableForm?.limit),
        },
      }),
    onPrevPage: () =>
      dispatch({
        action: "mutateTableForm",
        data: {
          ...formState.tableForm,
          offset: Number.parseInt(formState.tableForm?.offset) - Number.parseInt(formState.tableForm?.limit),
        },
      }),
    pageSizeLimit: formState.tableForm?.limit,
    onSort: onSortingByData,
    totalRecords: totalCount,
    onSearch: formState?.searchForm?.message,
    onLastPage: () =>
      dispatch({
        action: "mutateTableForm",
        data: {
          ...formState.tableForm,
          offset: Math.ceil(totalCount / 10) * 10 - Number.parseInt(formState.tableForm?.limit),
        },
      }),
    onFirstPage: () => dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } }),
    data: table,
    columns: tableColumnConfig,
  }
}

export default useLayoutTableConfig

