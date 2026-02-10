import React, { Fragment, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { InboxComposer, CaseIcon, Header } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

import CLUFilterFormFieldsComponent from "./CLUFilterFormFieldsComponent";
import CLUSearchFormFields from "./CLUSearchFormFields";
import useCLUInboxMobileCardsData from "./useCLUInboxMobileCardsData";
import useCLUTableConfig from "./useCLUTableConfig";


const CLUInbox = ({ parentRoute }) => {
  window.scroll(0, 0)
  const { t } = useTranslation()

  const tenantId = window.localStorage.getItem("Employee.tenant-id")

  const searchFormDefaultValues = {
    mobileNumber: "",
    applicationNumber: "",
  }

  const filterFormDefaultValues = {
    moduleName: "clu-service",
    applicationStatus: [],
    businessService: "clu_mcl",// it is dynamic as it  consists of two businessServices
    assignee: "ASSIGNED_TO_ME",
  }

  const tableOrderFormDefaultValues = {
    sortBy: "",
    limit: Digit.Utils.browser.isMobile() ? 50 : 10,
    offset: 0,
    sortOrder: "ASC",
  }

  function formReducer(state, payload) {
    switch (payload.action) {
      case "mutateSearchForm":
        Digit.SessionStorage.set("CLU.INBOX", { ...state, searchForm: payload.data })
        return { ...state, searchForm: payload.data }
      case "mutateFilterForm":
        Digit.SessionStorage.set("CLU.INBOX", { ...state, filterForm: payload.data })
        return { ...state, filterForm: payload.data }
      case "mutateTableForm":
        Digit.SessionStorage.set("CLU.INBOX", { ...state, tableForm: payload.data })
        return { ...state, tableForm: payload.data }
      default:
        break
    }
  }

  const InboxObjectInSessionStorage = Digit.SessionStorage.get("CLU.INBOX")

  const onSearchFormReset = (setSearchFormValue) => {
    setSearchFormValue("mobileNumber", null)
    setSearchFormValue("applicationNumber", null)
    dispatch({ action: "mutateSearchForm", data: searchFormDefaultValues })
  }

  const onFilterFormReset = (setFilterFormValue) => {
    setFilterFormValue("moduleName", "clu-service")
    setFilterFormValue("applicationStatus", "")
    setFilterFormValue("assignee", "ASSIGNED_TO_ALL")
    dispatch({ action: "mutateFilterForm", data: filterFormDefaultValues })
  }

  const onSortFormReset = (setSortFormValue) => {
    setSortFormValue("sortOrder", "ASC")
    dispatch({ action: "mutateTableForm", data: tableOrderFormDefaultValues })
  }

  const formInitValue = useMemo(() => {
    return (
      InboxObjectInSessionStorage || {
        filterForm: filterFormDefaultValues,
        searchForm: searchFormDefaultValues,
        tableForm: tableOrderFormDefaultValues,
      }
    )
  }, [
    Object.values(InboxObjectInSessionStorage?.filterForm || {}),
    Object.values(InboxObjectInSessionStorage?.searchForm || {}),
    Object.values(InboxObjectInSessionStorage?.tableForm || {}),
  ])

  const [formState, dispatch] = useReducer(formReducer, formInitValue)

  // State management for table, statuses, and totalCount
  const [tableData, setTableData] = useState([])
  const [statusData, setStatusData] = useState([])
  const [totalCountData, setTotalCountData] = useState(0)

  const { isLoading: isInboxLoading, data: inboxData } = Digit.Hooks.obps.useCLUInbox({
    tenantId,
    filters: { ...formState },
  })

  //console.log("inboxData ==>", inboxData)

  useEffect(() => {
    if (inboxData) {
      //console.log("  Setting inbox data:", inboxData)
      setStatusData(inboxData?.statuses || [])
      setTableData(inboxData?.table || [])
      setTotalCountData(inboxData?.totalCount || 0)
    }
  }, [inboxData])

  useEffect(() => {
    if (inboxData) {
      inboxData.revalidate()
    }
  }, [])

  const onPageSizeChange = (e) => {
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, limit: e.target.value } })
  }

  const onSortingByData = (e) => {
    if (e.length > 0) {
      const [{ id, desc }] = e
      const sortOrder = desc ? "DESC" : "ASC"
      const sortBy = id
      if (!(formState.tableForm.sortBy === sortBy && formState.tableForm.sortOrder === sortOrder)) {
        dispatch({
          action: "mutateTableForm",
          data: { ...formState.tableForm, sortBy: id, sortOrder: desc ? "DESC" : "ASC" },
        })
      }
    }
  }

  const onMobileSortOrderData = (data) => {
    const { sortOrder } = data
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, sortOrder } })
  }

  const SearchFormFields = useCallback(
    ({ registerRef, searchFormState, searchFieldComponents }) => (
      <CLUSearchFormFields {...{ registerRef, searchFormState, searchFieldComponents }} />
    ),
    [],
  )

  const FilterFormFields = useCallback(
    ({ registerRef, controlFilterForm, setFilterFormValue, getFilterFormValue }) => (
      <CLUFilterFormFieldsComponent
        {...{
          statuses: statusData,
          isInboxLoading,
          registerRef,
          controlFilterForm,
          setFilterFormValue,
          filterFormState: formState?.filterForm,
          getFilterFormValue,
        }}
      />
    ),
    [statusData, isInboxLoading],
  )

  const onSearchFormSubmit = (data) => {
    data.hasOwnProperty("") && delete data?.[""]
    dispatch({ action: "mutateTableForm", data: { ...tableOrderFormDefaultValues } })
    dispatch({ action: "mutateSearchForm", data })
  }

  const onFilterFormSubmit = (data) => {
    data.hasOwnProperty("") && delete data?.[""]
    dispatch({ action: "mutateTableForm", data: { ...tableOrderFormDefaultValues } })
    dispatch({ action: "mutateFilterForm", data })
  }

  const propsForSearchForm = {
    SearchFormFields,
    onSearchFormSubmit,
    searchFormDefaultValues: formState?.searchForm,
    resetSearchFormDefaultValues: searchFormDefaultValues,
    onSearchFormReset,
  }

  const propsForFilterForm = {
    FilterFormFields,
    onFilterFormSubmit,
    filterFormDefaultValues: formState?.filterForm,
    resetFilterFormDefaultValues: filterFormDefaultValues,
    onFilterFormReset,
  }

  const propsForInboxTable = useCLUTableConfig({
    parentRoute,
    onPageSizeChange,
    formState,
    totalCount: totalCountData,
    table: tableData,
    dispatch,
    onSortingByData,
  })

  const propsForInboxMobileCards = useCLUInboxMobileCardsData({ parentRoute, table:tableData })

  const propsForMobileSortForm = { onMobileSortOrderData, sortFormDefaultValues: formState?.tableForm, onSortFormReset }

  const PropsForInboxLinks = {
    logoIcon: <CaseIcon />,
    headerText: "ACTION_TEST_CLU_HOME",
    links: [
      // {
      //   text: t("CLU_NEW_APPLICATION"),
      //   link: "/digit-ui/employee/obps/clu/new-application",
      // },
    ],
  }

  return (
    <>
      <Header>
        {t("ES_COMMON_INBOX")}
        {totalCountData ? <p className="inbox-count">{totalCountData}</p> : null}
      </Header>
      <InboxComposer
        {...{
          isInboxLoading,
          PropsForInboxLinks,
          ...propsForSearchForm,
          ...propsForFilterForm,
          ...propsForMobileSortForm,
          propsForInboxTable,
          propsForInboxMobileCards,
          formState,
        }}
      ></InboxComposer>
    </>
  )
}

export default CLUInbox