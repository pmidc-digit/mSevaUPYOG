import React, { Fragment, useCallback, useMemo, useReducer, useState, useEffect } from "react";
import { InboxComposer, ComplaintIcon, Header } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import SearchFormFieldsComponents from "./SearchFormFieldsComponents";
import FilterFormFieldsComponent from "./FilterFormFieldsComponent";
import useInboxTableConfig from "./useInboxTableConfig";
import useInboxMobileCardsData from "./useInboxMobileCardsData";
import { businessServiceList } from "../../utils";

const Inbox = ({ parentRoute }) => {
  const { t } = useTranslation();

  // Read tenant id from localStorage like the NDC sample
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const [getFilter, setFilter] = useState();

  const searchFormDefaultValues = {
    // add defaults if needed
  };

  const filterFormDefaultValues = {
    moduleName: "chb-services", // <--- default moduleName for CHB inbox
    applicationStatus: [],
    businessService: null,
    locality: [],
    assignee: "ASSIGNED_TO_ALL",
    businessServiceArray: businessServiceList(true) || [],
  };

  const tableOrderFormDefaultValues = {
    sortBy: "",
    limit: window.Digit.Utils.browser.isMobile() ? 50 : 10,
    offset: 0,
    sortOrder: "DESC",
  };

  function formReducer(state, payload) {
    switch (payload.action) {
      case "mutateSearchForm":
        Digit.SessionStorage.set("CHB.INBOX", { ...state, searchForm: payload.data });
        return { ...state, searchForm: payload.data };
      case "mutateFilterForm":
        Digit.SessionStorage.set("CHB.INBOX", { ...state, filterForm: payload.data });
        return { ...state, filterForm: payload.data };
      case "mutateTableForm":
        Digit.SessionStorage.set("CHB.INBOX", { ...state, tableForm: payload.data });
        return { ...state, tableForm: payload.data };
      default:
        return state;
    }
  }

  const InboxObjectInSessionStorage = Digit.SessionStorage.get("CHB.INBOX");

  const onSearchFormReset = (setSearchFormValue) => {
    setSearchFormValue("sourceRefId", null);
    setSearchFormValue("applicationNumber", null);
    setSearchFormValue("mobileNumber", null);
    dispatch({ action: "mutateSearchForm", data: searchFormDefaultValues });
  };

  const onFilterFormReset = (setFilterFormValue) => {
    setFilterFormValue("moduleName", "chb-services");
    setFilterFormValue("applicationStatus", "");
    setFilterFormValue("locality", []);
    setFilterFormValue("assignee", "ASSIGNED_TO_ALL");
    dispatch({ action: "mutateFilterForm", data: filterFormDefaultValues });
  };

  const onSortFormReset = (setSortFormValue) => {
    setSortFormValue("sortOrder", "DESC");
    dispatch({ action: "mutateTableForm", data: tableOrderFormDefaultValues });
  };

  const formInitValue = useMemo(() => {
    return (
      InboxObjectInSessionStorage || {
        filterForm: filterFormDefaultValues,
        searchForm: searchFormDefaultValues,
        tableForm: tableOrderFormDefaultValues,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    Object.values(InboxObjectInSessionStorage?.filterForm || {}),
    Object.values(InboxObjectInSessionStorage?.searchForm || {}),
    Object.values(InboxObjectInSessionStorage?.tableForm || {}),
  ]);

  const [formState, dispatch] = useReducer(formReducer, formInitValue);

  const onPageSizeChange = (e) => {
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, limit: e.target.value } });
  };

  const onSortingByData = (e) => {
    if (e.length > 0) {
      const [{ id, desc }] = e;
      const sortOrder = desc ? "DESC" : "ASC";
      const sortBy = id;
      if (!(formState.tableForm.sortBy === sortBy && formState.tableForm.sortOrder === sortOrder)) {
        dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, sortBy: id, sortOrder: desc ? "DESC" : "ASC" } });
      }
    }
  };

  const onMobileSortOrderData = (data) => {
    const { sortOrder } = data;
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, sortOrder } });
  };

  const { data: localitiesForEmployeesCurrentTenant, isLoading: loadingLocalitiesForEmployeesCurrentTenant } = Digit.Hooks.useBoundaryLocalities(
    tenantId,
    "revenue",
    {},
    t
  );

  const handleFilter = (filterStatus) => {
    setFilter(filterStatus);
  };

  // Use CHB hook to fetch inbox (keeps parity with your original)
  const { isLoading: isInboxLoading, data } = Digit.Hooks.chb.useInbox({
    tenantId,
    filters: { ...formState, getFilter },
  });

  const [table, setTable] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (data) {
      console.log("yes data", data);
      setStatuses(data?.statuses || []);
      setTable(data?.table || []);
      setTotalCount(data?.totalCount || 0);
    }
  }, [data]);

  const PropsForInboxLinks = {
    logoIcon: <ComplaintIcon />,
    headerText: `${t("COMMON_PROPUSGTYPE_NONRESIDENTIAL_INSTITUTIONAL_PUBLICFACILITY_COMMUNITYHALL")}`,
    links: [
      {
        text: "",
        link: "",
        accessTo: [""],
      },
    ],
  };

  const SearchFormFields = useCallback(
    ({ registerRef, searchFormState, searchFieldComponents }) => (
      <SearchFormFieldsComponents {...{ registerRef, searchFormState, searchFieldComponents }} />
    ),
    []
  );

  const FilterFormFields = useCallback(
    ({ registerRef, controlFilterForm, setFilterFormValue, getFilterFormValue }) => (
      <FilterFormFieldsComponent
        {...{
          statuses,
          isInboxLoading,
          registerRef,
          controlFilterForm,
          setFilterFormValue,
          filterFormState: formState?.filterForm,
          getFilterFormValue,
          localitiesForEmployeesCurrentTenant,
          loadingLocalitiesForEmployeesCurrentTenant,
        }}
        handleFilter={handleFilter}
      />
    ),
    [statuses, isInboxLoading, localitiesForEmployeesCurrentTenant, loadingLocalitiesForEmployeesCurrentTenant]
  );

  const onSearchFormSubmit = (data) => {
    if (data?.hasOwnProperty("")) delete data[""];
    dispatch({ action: "mutateTableForm", data: { ...tableOrderFormDefaultValues } });
    dispatch({ action: "mutateSearchForm", data });
  };

  const onFilterFormSubmit = (data) => {
    if (data?.hasOwnProperty("")) delete data[""];
    dispatch({ action: "mutateTableForm", data: { ...tableOrderFormDefaultValues } });
    dispatch({ action: "mutateFilterForm", data });
  };

  const propsForSearchForm = {
    SearchFormFields,
    onSearchFormSubmit,
    searchFormDefaultValues: formState?.searchForm,
    resetSearchFormDefaultValues: searchFormDefaultValues,
    onSearchFormReset,
  };

  const propsForFilterForm = {
    FilterFormFields,
    onFilterFormSubmit,
    filterFormDefaultValues: formState?.filterForm,
    resetFilterFormDefaultValues: filterFormDefaultValues,
    onFilterFormReset,
  };

  const propsForInboxTable = useInboxTableConfig({ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, onSortingByData });

  const propsForInboxMobileCards = useInboxMobileCardsData({ parentRoute, table });

  const propsForMobileSortForm = { onMobileSortOrderData, sortFormDefaultValues: formState?.tableForm, onSortFormReset };

  return (
    <>
      <Header>
        {t("ES_COMMON_INBOX")}
        {totalCount ? <p className="inbox-count">{totalCount}</p> : null}
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
      />
    </>
  );
};

export default Inbox;
