import React, { Fragment, useCallback, useEffect, useMemo, useReducer, useState, useRef } from "react";
import { Loader, Card, Table, CaseIcon } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import NewFilterFormFieldComponent from "../../../../../templates/Inbox/NewFilterFormFieldsComponent";
import { InboxTopBar, InboxWrapper, InboxPagination } from "../../../../../templates/Inbox/components";
import LayoutSearchFormFields from "./LayoutSearchFormFields"
import useInboxMobileCardsData from "./useInboxMobileCardsData";
import useLayoutTableConfig from "./useLayoutTableConfig";
import { Link } from "react-router-dom";
import { businessServiceListLayout } from "../../../utils";



const LayoutInbox = ({ parentRoute }) => {
  const { t } = useTranslation()

  useEffect(() => {
    window.scroll(0, 0)
  }, [])

  const tenantId = window.localStorage.getItem("Employee.tenant-id")
  const [activeStatusTab, setActiveStatusTab] = useState("ALL")
  const [topBarSearch, setTopBarSearch] = useState("")

  const searchFormDefaultValues = useMemo(() => ({
    mobileNumber: "",
    applicationNumber: "",
  }), [])

  const filterFormDefaultValues = useMemo(() => ({
    moduleName: "layout-service",
    applicationStatus: [],
    businessService: "Layout_mcUp",
    assignee: "ASSIGNED_TO_ALL",
    // businessServiceArray: businessServiceListLayout(true) || [],
  }), [])

  const isMobileDevice = Digit.Utils.browser.isMobile()

  const tableOrderFormDefaultValues = useMemo(() => ({
    sortBy: "",
    limit: isMobileDevice ? 50 : 10,
    offset: 0,
    sortOrder: "DESC",
  }), [isMobileDevice])

  function formReducer(state, payload) {
    switch (payload.action) {
      case "mutateSearchForm":
        Digit.SessionStorage.set("LAYOUT.INBOX", { ...state, searchForm: payload.data })
        return { ...state, searchForm: payload.data }
      case "mutateFilterForm":
        Digit.SessionStorage.set("LAYOUT.INBOX", { ...state, filterForm: payload.data })
        return { ...state, filterForm: payload.data }
      case "mutateTableForm":
        Digit.SessionStorage.set("LAYOUT.INBOX", { ...state, tableForm: payload.data })
        return { ...state, tableForm: payload.data }
      default:
        break
    }
  }

  const InboxObjectInSessionStorage = Digit.SessionStorage.get("LAYOUT.INBOX")

  const onSearchFormReset = (setSearchFormValue) => {
    setSearchFormValue("mobileNumber", null)
    setSearchFormValue("applicationNumber", null)
    dispatch({ action: "mutateSearchForm", data: searchFormDefaultValues })
  }

  const onFilterFormReset = (setFilterFormValue) => {
    setFilterFormValue("moduleName", "layout-service")
    setFilterFormValue("applicationStatus", "")
    setFilterFormValue("assignee", "ASSIGNED_TO_ALL")
    dispatch({ action: "mutateFilterForm", data: filterFormDefaultValues })
  }

  const onSortFormReset = (setSortFormValue) => {
    setSortFormValue("sortOrder", "DESC")
    dispatch({ action: "mutateTableForm", data: tableOrderFormDefaultValues })
  }

  // Merge session storage with defaults to ensure tableForm has correct values
  const formInitValue = useMemo(() => {
    if (InboxObjectInSessionStorage) {
      const sessionLimit = parseInt(InboxObjectInSessionStorage.tableForm?.limit, 10)
      const validLimit = [10, 20, 30, 40, 50].includes(sessionLimit) ? sessionLimit : tableOrderFormDefaultValues.limit
      return {
        filterForm: InboxObjectInSessionStorage.filterForm || filterFormDefaultValues,
        searchForm: InboxObjectInSessionStorage.searchForm || searchFormDefaultValues,
        tableForm: {
          ...tableOrderFormDefaultValues,
          ...(InboxObjectInSessionStorage.tableForm || {}),
          // Ensure limit is a valid number, reset offset to start from first page
          limit: validLimit,
          offset: 0,
        },
      }
    }
    return {
      filterForm: filterFormDefaultValues,
      searchForm: searchFormDefaultValues,
      tableForm: tableOrderFormDefaultValues,
    }
  }, [InboxObjectInSessionStorage])

  const [formState, dispatch] = useReducer(formReducer, formInitValue)

  // State management for table, statuses, and totalCount
  const [tableData, setTableData] = useState([])
  const [statusData, setStatusData] = useState([])
  const [totalCountData, setTotalCountData] = useState(0)

const memoizedFilters = useMemo(() => {
  return {
    filterForm: formState?.filterForm || filterFormDefaultValues,
    searchForm: formState?.searchForm || searchFormDefaultValues,
    tableForm: formState?.tableForm || tableOrderFormDefaultValues,
  }
}, [formState?.filterForm, formState?.searchForm, formState?.tableForm, filterFormDefaultValues, searchFormDefaultValues, tableOrderFormDefaultValues])

const { isLoading: isInboxLoading, data: inboxData } =
  Digit.Hooks.obps.useLayoutInbox({
    tenantId,
    filters: memoizedFilters,
  })


  useEffect(() => {
    if (inboxData) {
      setStatusData(inboxData?.statuses || [])
      setTableData(inboxData?.table || [])
      setTotalCountData(inboxData?.totalCount || 0)
    }
  }, [inboxData])

  const onPageSizeChange = (e) => {
    const newLimit = parseInt(e.target.value, 10)
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, limit: newLimit, offset: 0 } })
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


  const onFilterFormSubmit = (data) => {
    data.hasOwnProperty("") && delete data?.[""]
    // Only reset offset when filtering, preserve the current limit
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } })
    dispatch({ action: "mutateFilterForm", data })
  }

  const onSearchFormSubmit = (data) => {
    // Filter out empty values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== null && value !== undefined && value !== "")
    )
    // Only reset offset when searching, preserve the current limit
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } })
    dispatch({ action: "mutateSearchForm", data: filteredData })
  }

  const propsForInboxTable = useLayoutTableConfig({
    parentRoute,
    onPageSizeChange,
    formState,
    totalCount: totalCountData,
    table: tableData,
    dispatch,
    onSortingByData,
  })

  const getRedirectionLink = (bService) => {
    let redirectBS = "layout/inbox/application-overview";    
    return redirectBS;
  };

  const propsForInboxMobileCards = useInboxMobileCardsData({ parentRoute, table: tableData, getRedirectionLink });

  // Setup form with react-hook-form
  const {
    register: registerFilterFormField,
    control: controlFilterForm,
    handleSubmit: handleFilterFormSubmit,
    setValue: setFilterFormValue,
    getValues: getFilterFormValue,
    reset: resetFilterForm,
  } = useForm({
    defaultValues: { ...filterFormDefaultValues },
  })

  // Setup search form with react-hook-form
  const {
    register: registerSearchFormField,
    handleSubmit: handleSearchFormSubmit,
    setValue: setSearchFormValue,
    reset: resetSearchForm,
  } = useForm({
    defaultValues: { ...searchFormDefaultValues },
  })


  const onResetFilterForm = useCallback(() => {
    onFilterFormReset(setFilterFormValue)
  }, [setFilterFormValue])

  const handleFilterChange = useCallback((filterData) => {
    // Update form values
    if (filterData.applicationStatus) {
      setFilterFormValue("applicationStatus", filterData.applicationStatus.map((item) => item.code))
    }
    if (filterData.assignee) {
      setFilterFormValue("assignee", filterData.assignee)
    }
    // Dispatch to reducer to trigger data refetch
    dispatch({ 
      action: "mutateFilterForm", 
      data: { 
        ...formState?.filterForm,
        applicationStatus: filterData.applicationStatus?.map((item) => item.code) || [],
        assignee: filterData.assignee || formState?.filterForm?.assignee || "ASSIGNED_TO_ALL"
      } 
    })
  }, [formState?.filterForm, setFilterFormValue])

  const searchDebounceRef = useRef(null)
  const hasInitializedFilterForm = useRef(false)

  const onNextPage = () =>
    dispatch({
      action: "mutateTableForm",
      data: { ...formState.tableForm, offset: parseInt(formState.tableForm?.offset) + parseInt(formState.tableForm?.limit) },
    })

  const onPrevPage = () =>
    dispatch({
      action: "mutateTableForm",
      data: { ...formState.tableForm, offset: parseInt(formState.tableForm?.offset) - parseInt(formState.tableForm?.limit) },
    })

  // Form sync with reducer state
  useEffect(() => {
    if (formState?.filterForm) {
      setFilterFormValue("moduleName", formState.filterForm.moduleName || "layout-service")
      setFilterFormValue("applicationStatus", formState.filterForm.applicationStatus || [])
      setFilterFormValue("assignee", formState.filterForm.assignee || "ASSIGNED_TO_ALL")
      setFilterFormValue("businessService", formState.filterForm.businessService || "Layout_mcUp")
    }
  }, [formState?.filterForm?.moduleName, formState?.filterForm?.applicationStatus, formState?.filterForm?.assignee, formState?.filterForm?.businessService, setFilterFormValue])

  // Search form sync with reducer state
  useEffect(() => {
    if (formState?.searchForm) {
      setSearchFormValue("applicationNumber", formState.searchForm.applicationNumber || null)
      setSearchFormValue("mobileNumber", formState.searchForm.mobileNumber || null)
    }
  }, [formState?.searchForm?.applicationNumber, formState?.searchForm?.mobileNumber, setSearchFormValue])

  // Search debounce
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      const value = String(topBarSearch || "").trim()
      const nextSearchForm = value ? { applicationNumber: value } : {}
      // Only reset offset when searching, preserve the current limit
      dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } })
      dispatch({ action: "mutateSearchForm", data: nextSearchForm })
    }, 400)
    return () => clearTimeout(searchDebounceRef.current)
  }, [topBarSearch])

  // Initialize filter form
  useEffect(() => {
    if (hasInitializedFilterForm.current) return
    if (resetFilterForm && formState) {
      resetFilterForm(formState?.filterForm)
      hasInitializedFilterForm.current = true
    }
  }, [formState, resetFilterForm])

  const onStatusTabClick = useCallback(
    (label, statusCode) => {
      setActiveStatusTab(statusCode || label)
      if (label === "CLEAR") {
        setTopBarSearch("")
        return
      }
      if (label === "ALL") {
        setFilterFormValue("applicationStatus", [], { shouldDirty: true, shouldTouch: true })
        handleFilterFormSubmit(onFilterFormSubmit)()
        return
      }
      const resolvedCode = statusCode || label
      setFilterFormValue("applicationStatus", [resolvedCode], { shouldDirty: true, shouldTouch: true })
      handleFilterFormSubmit(onFilterFormSubmit)()
    },
    [handleFilterFormSubmit, onFilterFormSubmit, setFilterFormValue]
  )

  return (
    <InboxWrapper
      title={t("ES_COMMON_INBOX")}
      totalCount={totalCountData}
      filterSection={
        <NewFilterFormFieldComponent
          registerRef={() => {}}
          controlFilterForm={controlFilterForm}
          setFilterFormValue={setFilterFormValue}
          filterFormState={formState?.filterForm}
          getFilterFormValue={getFilterFormValue}
          statuses={statusData}
          isInboxLoading={isInboxLoading}
          handleFilter={handleFilterChange}
        />
      }
      searchSection={
        <LayoutSearchFormFields
          registerRef={registerSearchFormField}
          searchFormState={formState?.searchForm}
          searchFieldComponents={
            <div className="layout-search-actions">
              <button
                type="button"
                className="layout-search-button layout-search-button-secondary"
                onClick={() => {
                  onSearchFormReset(setSearchFormValue)
                }}
              >
                {t("ES_COMMON_CLEAR_SEARCH")}
              </button>
              <button
                type="button"
                className="layout-search-button layout-search-button-primary"
                onClick={handleSearchFormSubmit(onSearchFormSubmit)}
              >
                {t("ES_COMMON_SEARCH")}
              </button>
            </div>
          }
        />
      }
      topBar={
        <InboxTopBar
          statuses={statusData}
          activeTab={activeStatusTab}
          onTabClick={onStatusTabClick}
          searchValue={topBarSearch}
          onSearchChange={(e) => setTopBarSearch(e.target.value)}
          searchPlaceholder="Search by application number..."
          totalCount={totalCountData}
        />
      }
      isLoading={isInboxLoading}
      tableData={tableData}
      tableProps={propsForInboxTable}
      tableHeader="Applications"
      pagination={
        <InboxPagination
          offset={formState.tableForm?.offset || 0}
          limit={formState.tableForm?.limit || 10}
          totalCount={totalCountData}
          onPageSizeChange={onPageSizeChange}
          onNextPage={onNextPage}
          onPrevPage={onPrevPage}
        />
      }
    />
  )
}

export default LayoutInbox