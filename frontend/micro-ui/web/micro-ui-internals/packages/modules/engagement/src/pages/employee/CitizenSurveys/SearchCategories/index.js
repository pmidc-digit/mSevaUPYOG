import React, { Fragment, useCallback, useMemo, useReducer, useState,useEffect } from "react";
import {  DocumentIcon, Toast, Header, InboxComposer } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import FilterFormFieldsComponent from "./FilterFieldsComponent";
import SearchCategoryFieldsComponents from "./SearchCategoryFieldsComponents";
import useCategoryInboxMobileCardsData from "./useCategoryInboxMobileDataCard";
import useCategoryInboxTableConfig from "./useCategoryInboxTableConfig";

//Keep below values from localisation:
const SEARCH_CATEGORY = "Search Categories";
const ERR_MESSAGE = "Something went wrong";

const SearchCategories = ({ parentRoute }) => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const ulbs = Digit.SessionStorage.get("ENGAGEMENT_TENANTS");
  const userInfo = Digit.UserService.getUser().info;
  const userUlbs = ulbs.filter((ulb) => userInfo?.roles?.some((role) => role?.tenantId === ulb?.code));

  //
  const statuses = [
    { code: "ALL", name: `${t("ES_COMMON_ALL")}`, bool: null },
    { code: "ACTIVE", name: `${t("ES_COMMON_ACTIVE")}`, bool: true },
    { code: "INACTIVE", name: `${t("ES_COMMON_INACTIVE")}`, bool: false },
  ];

  //Default values:
  const searchFormDefaultValues = {
    //tenantIds: tenantId,
    tenantIds: userUlbs[0],
    categoryName: "",
    //isActive: null,
  };

  const filterFormDefaultValues = {
    status: statuses[0],
  };

  const tableOrderFormDefaultValues = {
    sortBy: "",
    limit: window.Digit.Utils.browser.isMobile() ? 50 : 10,
    //limit: 10,
    offset: 0,
    sortOrder: "DESC", //sortOrder: "ASC",
  };

  //

  function formReducer(state, payload) {
    switch (payload.action) {
      case "mutateSearchForm":
        Digit.SessionStorage.set("CITIZENSURVEYCATEGORY.INBOX", { ...state, searchForm: payload.data });
        return { ...state, searchForm: payload.data };
      case "mutateFilterForm":
        Digit.SessionStorage.set("CITIZENSURVEYCATEGORY.INBOX", { ...state, filterForm: payload.data });
        return { ...state, filterForm: payload.data };
      case "mutateTableForm":
        Digit.SessionStorage.set("CITIZENSURVEYCATEGORY.INBOX", { ...state, tableForm: payload.data });
        return { ...state, tableForm: payload.data };
      default:
        break;
    }
  }
  const InboxObjectInSessionStorage = Digit.SessionStorage.get("CITIZENSURVEYCATEGORY.INBOX");

  //Reset:
  const onSearchFormReset = (setSearchFormValue) => {
    setSearchFormValue("tenantIds", tenantId);
    setSearchFormValue("categoryName", "");
    //setSearchFormValue("isActive", null);
    dispatch({ action: "mutateSearchForm", data: searchFormDefaultValues });
  };

  // const onSortFormReset = (setSortFormValue) => {
  //   setSortFormValue("sortOrder", "DESC");
  //   dispatch({ action: "mutateTableForm", data: tableOrderFormDefaultValues });
  // };

  const onFilterFormReset = (setFilterFormValue) => {
    setFilterFormValue("status", statuses[0]);
    dispatch({ action: "mutateFilterForm", data: filterFormDefaultValues });
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
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, limit: e.target.value } });
  };

  // const onMobileSortOrderData = (data) => {
  //   const { sortOrder } = data;
  //   dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, sortOrder } });
  // };

  //
  let { data: { Categories = [] } = {}, isLoading: isInboxLoading } = Digit.Hooks.survey.useSurveyCategoryInbox(formState);
  const totalCount = Categories?.length;
 const [sortedCategories,setSortedCategories]=useState([])
  useEffect(()=>{
if(Categories.length>0){
  

    const sorted = [...Categories].sort(
      (a, b) => a.auditDetails.lastModifiedTime - b.auditDetails.lastModifiedTime
    );
  Categories=sorted
    setSortedCategories(sorted);

}
  },[Categories])
  //Props for links card:
  const PropsForInboxLinks = {
    logoIcon: <DocumentIcon />,
    headerText: "CS_COMMON_SURVEYS",
    links: [
      {
        text: t("Create New Survey"),
        link: "/digit-ui/employee/engagement/surveys/create-survey-step-form",
      },
      {
        text: t("Active and Open Surveys"),
        link: "/digit-ui/employee/engagement/surveys/active-open-surveys",
      },
      {
        text: t("Surveys Inbox/Search Surveys"),
        link: "/digit-ui/employee/engagement/surveys/inbox",
      },
      {
        text: t("Create Category"),
        link: "/digit-ui/employee/engagement/surveys/create-category",
      },
      {
        text: t("Search Categories"),
        link: "/digit-ui/employee/engagement/surveys/search-categories",
      },
      {
        text: t("Create Questions"),
        link: "/digit-ui/employee/engagement/surveys/create-questions",
      },
      {
        text: t("Search Questions"),
        link: "/digit-ui/employee/engagement/surveys/search-questions",
      },
    ],
  };

  //Form Fields:

  const SearchFormFields = useCallback(
    ({ registerRef, searchFormState, controlSearchForm }) => (
      <SearchCategoryFieldsComponents {...{ registerRef, searchFormState, controlSearchForm }} />
    ),
    []
  );

  const FilterFormFields = useCallback(
    ({ registerRef, controlFilterForm, setFilterFormValue, getFilterFormValue }) => (
      <FilterFormFieldsComponent
        {...{
          statuses,
          registerRef,
          controlFilterForm,
          setFilterFormValue,
          filterFormState: formState?.filterForm,
          getFilterFormValue,
        }}
      />
    ),
    [statuses]
  );

  //
  const onSearchFormSubmit = (data) => {
    console.log("onSearchFormSubmit: ", data);
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } });
    data.hasOwnProperty("") ? delete data?.[""] : null;
    dispatch({ action: "mutateSearchForm", data });
  };

  const onFilterFormSubmit = (data) => {
    data.hasOwnProperty("") ? delete data?.[""] : null;
    dispatch({ action: "mutateFilterForm", data });
  };

  //
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

  const propsForInboxTable = useCategoryInboxTableConfig({
    ...{
      parentRoute,
      onPageSizeChange,
      formState,
      totalCount: totalCount,
      table: sortedCategories,
      noResultsMessage: "No Categories found",
      dispatch,
      inboxStyles: { overflowX: "scroll", overflowY: "hidden" },
      setShowToast,
    },
  });

  const propsForInboxMobileCards = useCategoryInboxMobileCardsData({ parentRoute, table: sortedCategories,   setShowToast });

  //const propsForMobileSortForm = { onMobileSortOrderData, sortFormDefaultValues: formState?.tableForm, onSortFormReset };

  //For the card displayed after clicking the delete category button:
  //On clicking delete button under "Delete Category" column in a table row, a toast with Yes & No buttons is opened:
  //Toast is closed if no is clicked
  const onNoToToast = () => {
    setShowToast(null);
  };
  //Row will be deleted if yes is clicked
  const onYesToToast = () => {
    handleUpdateCategory();
  };

  const handleUpdateCategory = () => {
    const row = showToast.rowData;
    const payload = {
      Categories: [
        {
          id: row?.id,
          ...(typeof row?.isActive === "boolean" && { isActive: !row?.isActive }),
          //label: "" //For updating the category name(category label)
        },
      ],
    };

    Digit.Surveys.updateCategory(payload)
      .then((response) => {
        if (response?.Categories?.length > 0) {
          setShowToast({ label: "Category status updated successfully", isDleteBtn: "true" });
        } else {
          setShowToast({ label: response?.Errors?.[0]?.message || ERR_MESSAGE, isDleteBtn: "true", error: true });
        }
      })
      .catch((error) => {
        setShowToast({ label: error?.response?.data?.Errors?.[0]?.message || ERR_MESSAGE, isDleteBtn: "true", error: true });
      });
  };

  return (
    // <div className="card">
    <Fragment>
      <Header>
        {t(SEARCH_CATEGORY)}
        {totalCount ? <p className="inbox-count">{totalCount}</p> : null}
      </Header>
      <InboxComposer
        {...{
          isInboxLoading,
          PropsForInboxLinks,
          ...propsForSearchForm,
          ...propsForFilterForm,
          //...propsForMobileSortForm,
          propsForInboxMobileCards,
          propsForInboxTable,
          formState,
        }}
      />
      {showToast && (
        <Toast
          label={t(showToast.label)}
          isDleteBtn={showToast.isDleteBtn}
          error={showToast.error}
          onClose={() => {
            setShowToast(null);
          }}
          onNo={onNoToToast}
          onYes={onYesToToast}
          warning={showToast.warning}
          style={{ padding: "16px" }}
          isWarningButtons={showToast.isWarningButtons}
        />
      )}
    </Fragment>
    // </div>
  );
};

export default SearchCategories;
