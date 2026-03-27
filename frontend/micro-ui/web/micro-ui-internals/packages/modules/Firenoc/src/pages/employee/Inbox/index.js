import React, { Fragment, useCallback, useMemo, useReducer, useState, useEffect } from "react";
import { InboxComposer, ComplaintIcon, Header, Loader  } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import SearchFormFieldsComponents from "./SearchFormFieldsComponent";
import FilterFormFieldsComponent from "./FilterFormFieldsComponent";
import useInboxTableConfig from "./useInboxTableConfig";
import useInboxMobileCardsData from "./useInboxMobileCardsData";

const Inbox = ({ parentRoute }) => {
  const { t } = useTranslation();
  const [employeeName, setEmployeeName] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    Digit.SessionStorage.del("FIRENOC.INBOX");
  }, []);

  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");

  const searchFormDefaultValues = {
    mobileNumber: "",
    applicationNo: "",
    fireNOCNumber: "",
    applicationStatus: null,
    fromDate: "",
    toDate: "",
  };

  const filterFormDefaultValues = {
    areaType: null,
    nocType: null,
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
        Digit.SessionStorage.set("FIRENOC.INBOX", { ...state, searchForm: payload.data });
        return { ...state, searchForm: payload.data };
      case "mutateFilterForm":
        Digit.SessionStorage.set("FIRENOC.INBOX", { ...state, filterForm: payload.data });
        return { ...state, filterForm: payload.data };
      case "mutateTableForm":
        Digit.SessionStorage.set("FIRENOC.INBOX", { ...state, tableForm: payload.data });
        return { ...state, tableForm: payload.data };
      case "mutateSearchAndTable":
        Digit.SessionStorage.set("FIRENOC.INBOX", { ...state, searchForm: payload.data.searchForm, tableForm: payload.data.tableForm });
        return { ...state, searchForm: payload.data.searchForm, tableForm: payload.data.tableForm };
      case "mutateFilterAndTable":
        Digit.SessionStorage.set("FIRENOC.INBOX", { ...state, filterForm: payload.data.filterForm, tableForm: payload.data.tableForm });
        return { ...state, filterForm: payload.data.filterForm, tableForm: payload.data.tableForm };
      default:
        break;
    }
  }
  const InboxObjectInSessionStorage = Digit.SessionStorage.get("FIRENOC.INBOX");

  const onSearchFormReset = (setSearchFormValue) => {
    setSearchFormValue("mobileNumber", null);
    setSearchFormValue("applicationNo", null);
    setSearchFormValue("fireNOCNumber", null);
    setSearchFormValue("applicationStatus", null);
    setSearchFormValue("fromDate", null);
    setSearchFormValue("toDate", null);
    dispatch({ action: "mutateSearchForm", data: searchFormDefaultValues });
  };

  const onFilterFormReset = (setFilterFormValue) => {
    setFilterFormValue("areaType", null);
    setFilterFormValue("nocType", null);
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
  }, [
    Object.values(InboxObjectInSessionStorage?.filterForm || {}),
    Object.values(InboxObjectInSessionStorage?.searchForm || {}),
    Object.values(InboxObjectInSessionStorage?.tableForm || {}),
  ]);

  const [formState, dispatch] = useReducer(formReducer, formInitValue);
  const onPageSizeChange = (e) => {
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, limit: e.target.value, offset: 0 } });
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

  const user = Digit.UserService.getUser();


  const {data: employeeData , isLoading} = Digit.Hooks.useEmployeeSearch(tenantId, { codes: user?.info?.userName, isActive: true }, { enabled: !!user?.info?.userName });
  




    useEffect(() => {
      if (!isLoading && employeeData) {
        const code=  employeeData?.Employees?.[0]?.user?.name || "";
        const desig = employeeData?.Employees?.[0]?.assignments?.[0]?.designation || ""
        setEmployeeName(code);
        setEmployeeRole(desig);
      }
  }, [employeeData]);



  const { isLoading: isInboxLoading, data} = Digit.Hooks.firenoc.useInbox({
    tenantId,
    filters: { ...formState },
    config: { enabled: hasSearched },
  });

  

  // let table = [];
  const [allTableData, setAllTableData] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
      if (data) {
        setStatuses(data?.statuses || []);
        setAllTableData(data?.table || []);
        setTotalCount(data?.totalCount || 0);
      }
  }, [data]);

  const table = useMemo(() => {
    const { offset = 0, limit = 10 } = formState?.tableForm || {};
    return allTableData.slice(offset, offset + Number(limit));
  }, [allTableData, formState?.tableForm?.offset, formState?.tableForm?.limit]);

  const PropsForInboxLinks = {
    logoIcon: <ComplaintIcon />,
    headerText: "ACTION_TEST_FIRENOC",
    links: [
      // {
      //   text: t("ES_COMMON_APPLICATION_SEARCH"),
      //   link: "/digit-ui/employee/firenoc/search/application",
      // },
      // {
      //   text: t("ES_COMMON_APPLICATION_NEW"),
      //   link: "/digit-ui/employee/firenoc/new-application",
      // },
    ],
  };

  const SearchFormFields = useCallback(
    ({ registerRef, searchFormState, searchFieldComponents, controlSearchForm }) => (
      <SearchFormFieldsComponents {...{ registerRef, searchFormState, searchFieldComponents, controlSearchForm, statuses }} />
    ),
    [statuses]
  );

  const FilterFormFields = useCallback(
    ({ registerRef, controlFilterForm, setFilterFormValue, getFilterFormValue }) => (
      <FilterFormFieldsComponent
        {...{
          registerRef,
          controlFilterForm,
          setFilterFormValue,
          filterFormState: formState?.filterForm,
          getFilterFormValue,
        }}
      />
    ),
    [formState?.filterForm]
  );

  const onSearchFormSubmit = (data) => {
    data.hasOwnProperty("") && delete data?.[""];
    setHasSearched(true); 
    dispatch({ action: "mutateSearchAndTable", data: { searchForm: data, tableForm: { ...tableOrderFormDefaultValues } } });
  };

  const onFilterFormSubmit = (data) => {
    data.hasOwnProperty("") && delete data?.[""];
    setHasSearched(true);
    dispatch({ action: "mutateFilterAndTable", data: { filterForm: data, tableForm: { ...tableOrderFormDefaultValues } } });
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

  const propsForInboxTable = useInboxTableConfig({ ...{ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, onSortingByData } });

  const propsForInboxMobileCards = useInboxMobileCardsData({ parentRoute, table });

  const propsForMobileSortForm = { onMobileSortOrderData, sortFormDefaultValues: formState?.tableForm, onSortFormReset };

  if (isLoading) {
      return <Loader />;
    }
  return (
    <>
      <Header>
        {/* {employeeData &&  !isLoading &&`Welcome ${employeeName}, ${t(`COMMON_MASTERS_DESIGNATION_${employeeRole}`)}`} */}
        
        <div> {t("ES_COMMON_INBOX")} {totalCount ? <p className="inbox-count">{totalCount}</p> : null}</div>
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
  );
};

export default Inbox;
