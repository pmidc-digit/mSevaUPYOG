import React, { Fragment, useCallback, useMemo, useReducer, useState, useEffect, use } from "react"
import { InboxComposer, CaseIcon, Header, Toast } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import FilterFormFieldsComponent from "./FilterFormFieldsComponent";
import SearchFormFieldsComponents from "./SearchFormFieldsComponent";
import useInboxTableConfig from "./useInboxTableConfig";
import useInboxMobileCardsData from "./useInboxMobileCardsData";
import { Link } from "react-router-dom";
import { set } from "lodash";

const Inbox = ({ parentRoute }) => {

  const { t } = useTranslation()
  const [error, setError] = useState({
    error: false,
    label: ""
  });
  // const tenantId = Digit.ULBService.getStateId();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");

  const searchFormDefaultValues = {}

  const filterFormDefaultValues = {
    moduleName: "BPAREG",
    applicationStatus: [],
    businessService: null,
    locality: [],
    assignee: "ASSIGNED_TO_ALL"
  }
  const tableOrderFormDefaultValues = {
    sortBy: "",
    limit: window.Digit.Utils.browser.isMobile()?50:10,
    offset: 0,
    sortOrder: "DESC"
  }

  function formReducer(state, payload) {
    switch (payload.action) {
      case "mutateSearchForm":
        Digit.SessionStorage.set("STAKEHOLDER.INBOX", { ...state, searchForm: payload.data })
        return { ...state, searchForm: payload.data };
      case "mutateFilterForm":
        Digit.SessionStorage.set("STAKEHOLDER.INBOX", { ...state, filterForm: payload.data })
        return { ...state, filterForm: payload.data };
      case "mutateTableForm":
        Digit.SessionStorage.set("STAKEHOLDER.INBOX", { ...state, tableForm: payload.data })
        return { ...state, tableForm: payload.data };
      default:
        break;
    }
  }
  const InboxObjectInSessionStorage = Digit.SessionStorage.get("STAKEHOLDER.INBOX")

  const onSearchFormReset = (setSearchFormValue) => {
    setSearchFormValue("mobileNumber", null);
    setSearchFormValue("applicationNo", null);
    dispatch({action: "mutateSearchForm", data: searchFormDefaultValues});
  }

  const onFilterFormReset = (setFilterFormValue) => {
    setFilterFormValue("moduleName", "BPAREG");
    // setFilterFormValue("businessService", {code: "BPA", name:t("BPA")});
    setFilterFormValue("applicationStatus", "");
    setFilterFormValue("locality", []);
    setFilterFormValue("assignee", "ASSIGNED_TO_ALL");
    dispatch({ action: "mutateFilterForm", data: filterFormDefaultValues });
  }
  
  const onSortFormReset = (setSortFormValue) => {
    setSortFormValue("sortOrder", "DESC")
    dispatch({action: "mutateTableForm", data: tableOrderFormDefaultValues})
  }

  const formInitValue = useMemo(() => {
    return InboxObjectInSessionStorage || {
      filterForm: filterFormDefaultValues,
      searchForm: searchFormDefaultValues,
      tableForm: tableOrderFormDefaultValues
    }
  }
    , [Object.values(InboxObjectInSessionStorage?.filterForm || {}), Object.values(InboxObjectInSessionStorage?.searchForm || {}), Object.values(InboxObjectInSessionStorage?.tableForm || {})])

  const [formState, dispatch] = useReducer(formReducer, formInitValue)
  const onPageSizeChange = (e) => {
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, limit: e.target.value } })
  }

  const onSortingByData = (e) => {
    if(e.length > 0){
      const [{id, desc}] = e
      const sortOrder = desc ? "DESC" : "ASC"
      const sortBy = id
      if(!(formState.tableForm.sortBy === sortBy && formState.tableForm.sortOrder === sortOrder)){
        dispatch({action: "mutateTableForm", data:{ ...formState.tableForm, sortBy: id, sortOrder: desc ? "DESC" : "ASC" }})
      }
    }
  }

  const onMobileSortOrderData = (data) => {
    const {sortOrder} = data
    dispatch({action: "mutateTableForm", data:{ ...formState.tableForm, sortOrder }})
  }

  const { data: localitiesForEmployeesCurrentTenant, isLoading: loadingLocalitiesForEmployeesCurrentTenant } = Digit.Hooks.useBoundaryLocalities("pb", "revenue", {}, t);

  const { isLoading: isInboxLoading, data: { table, statuses, totalCount } = {}, isError } = Digit.Hooks.obps.useBPAInbox({
    tenantId: tenantId === "pb" ? "pb.punjab" : tenantId,
    filters: { ...formState }
  });

  // const isInboxLoading = false, table = [], statuses = [], totalCount = 0;
  console.log("isInboxLoading", isInboxLoading, "table", table, "statuses", statuses, "totalCount", totalCount);

  const PropsForInboxLinks = {
    logoIcon: <CaseIcon />,
    headerText: "CS_COMMON_OBPS",
    // links: [{
    //   text: t("BPA_SEARCH_PAGE_TITLE"),
    //   link: "/digit-ui/employee/obps/search/application",
    //   businessService: "BPA",
    //   roles: ["BPAREG_EMPLOYEE", "BPAREG_APPROVER", "BPAREG_DOC_VERIFIER", "BPAREG_DOC_VERIFIER"],
    // }]
    links:[]
  }

  const SearchFormFields = useCallback(({ registerRef, searchFormState, searchFieldComponents }) => <SearchFormFieldsComponents {...{ registerRef, searchFormState, searchFieldComponents }} />, [])

  const FilterFormFields = useCallback(
    ({ registerRef, controlFilterForm, setFilterFormValue, getFilterFormValue }) => <FilterFormFieldsComponent {...{ statuses, isInboxLoading, registerRef, controlFilterForm, setFilterFormValue, filterFormState: formState?.filterForm, getFilterFormValue, localitiesForEmployeesCurrentTenant, loadingLocalitiesForEmployeesCurrentTenant }} />
    , [statuses, isInboxLoading, localitiesForEmployeesCurrentTenant, loadingLocalitiesForEmployeesCurrentTenant])

  const onSearchFormSubmit = (data) => {
    data.hasOwnProperty("") && delete data?.[""];
    dispatch({ action: "mutateTableForm", data: { ...tableOrderFormDefaultValues } });
    dispatch({ action: "mutateSearchForm", data })
  }

  const onFilterFormSubmit = (data) => {
    console.log("onFilterFormSubmitData", data)
    data.hasOwnProperty("") && delete data?.[""] ;
    dispatch({ action: "mutateTableForm", data: { ...tableOrderFormDefaultValues } });
    dispatch({ action: "mutateFilterForm", data })
  }

  const propsForSearchForm = { SearchFormFields, onSearchFormSubmit, searchFormDefaultValues: formState?.searchForm, resetSearchFormDefaultValues: searchFormDefaultValues, onSearchFormReset }

  const propsForFilterForm = { FilterFormFields, onFilterFormSubmit, filterFormDefaultValues: formState?.filterForm, resetFilterFormDefaultValues: filterFormDefaultValues, onFilterFormReset }

  const propsForInboxTable = useInboxTableConfig({ ...{ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, onSortingByData } })

  const propsForInboxMobileCards = useInboxMobileCardsData({ parentRoute, table })
  
  const propsForMobileSortForm = { onMobileSortOrderData, sortFormDefaultValues: formState?.tableForm, onSortFormReset }

  useEffect(() => {
    if(isError) {
      setError({
        error: true,
        label: t("ES_OBPS_INBOX_ERROR")
      })
      setTimeout(() => {
        window.location.href = `/digit-ui/employee/`
      }, 5000)
    }
  },[isError])

  return <>
    <Header>
      {t("ES_COMMON_INBOX")}
      {totalCount ? <p className="inbox-count">{totalCount}</p> : null}
    </Header>


    {Digit.Utils.browser.isMobile() &&
      <div style={{ marginLeft: "12px" }}>
        <Link to={window.location.href.includes("/citizen") ? "/digit-ui/citizen/obps/search/application" : "/digit-ui/employee/obps/search/application"}>
          <span className="link">{t("BPA_SEARCH_PAGE_TITLE")}</span>
        </Link>
      </div>
    }
    {!isError && <InboxComposer {...{ isInboxLoading, PropsForInboxLinks, ...propsForSearchForm, ...propsForFilterForm, ...propsForMobileSortForm, propsForInboxTable, propsForInboxMobileCards, formState }}></InboxComposer>}
    {error.error && <Toast error label={error.label} onClose={() => setError({ error: false, label: "" })} />}
  </>
}

export default Inbox