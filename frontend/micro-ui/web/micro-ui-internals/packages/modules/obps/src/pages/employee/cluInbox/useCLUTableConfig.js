
import React,{ useMemo } from "react"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"

const useCLUTableConfig = ({
  parentRoute,
  onPageSizeChange,
  formState,
  totalCount,
  table,
  dispatch,
  onSortingByData,
}) => {

  const { t } = useTranslation()

  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>

  const tableColumnConfig = useMemo(() => {
    return [
      {
        Header: t("BPA_APPLICATION_NUMBER_LABEL"),
        accessor: "applicationId",
        disableSortBy: true,
        Cell: ({ row }) => {
          console.log("row-route", row);
          return (
            <div>
              <Link to={`${parentRoute}/clu/application-overview/${row.original["applicationId"]}`}>
                <span className="link">{row.original["applicationId"]}</span>
              </Link>
            </div>
          )
        },
      },
      {
        Header: t("TL_COMMON_TABLE_COL_APP_DATE"),
        accessor: "date",
        Cell: ({ row }) =>
          row.original?.["date"] ? GetCell(format(new Date(row.original?.["date"]), "dd/MM/yyyy")) : "",
      },
      {
        Header: t("BPA_PRIMARY_OWNER_NAME_LABEL"),
        accessor: (row) => t(`${row?.owner}`),
        disableSortBy: true,
      },
      {
        Header: t("BPA_PROFESSIONAL_NAME_LABEL"),
        accessor: (row) => t(`${row?.professionalName}`),
        disableSortBy: true,
      },
      {
        Header: t("PT_COMMON_TABLE_COL_STATUS_LABEL"),
        // accessor: (row) => t(row?.status),
        accessor: (row) => t(`BPA_STATUS_${row?.status}`),
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

export default useCLUTableConfig;

