import React, { Fragment, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { InboxComposer, DocumentIcon, Toast, Header } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import FilterFormFieldsComponent from "./FilterFieldsComponent";
import SearchFormFieldsComponents from "./SearchFieldsComponents";
import useInboxTableConfig from "./useInboxTableConfig";
import useInboxMobileCardsData from "./useInboxMobileDataCard";
import DateExtend from "../../../../components/DateExtend";
import { Loader } from "../../../../components/Loader";
// import { useHistory } from "react-router-dom";

//Keep below values from localisation:
const ERR_MESSAGE = "Something went wrong";

const Inbox = ({ parentRoute }) => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  // const history = useHistory()
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [getData, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const ulbs = Digit.SessionStorage.get("ENGAGEMENT_TENANTS");
  const userInfo = Digit.UserService.getUser().info;

  const userUlbs = ulbs.filter((ulb) => userInfo?.roles?.some((role) => role?.tenantId === ulb?.code));

  const statuses = [
    { code: "ALL", name: `${t("ES_COMMON_ALL")}`, bool: null },
    { code: "ACTIVE", name: `${t("ES_COMMON_ACTIVE")}`, bool: true },
    { code: "INACTIVE", name: `${t("ES_COMMON_INACTIVE")}`, bool: false },
  ];

  const defaultTenant = userUlbs?.find((ulb) => ulb.code === tenantId) || userUlbs?.[0];

  const searchFormDefaultValues = {
    tenantIds: defaultTenant,
    title: "",
  };

  const filterFormDefaultValues = {
    status: statuses[0],
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
        Digit.SessionStorage.set("CITIZENSURVEY.INBOX", { ...state, searchForm: payload.data });
        return { ...state, searchForm: payload.data };
      case "mutateFilterForm":
        Digit.SessionStorage.set("CITIZENSURVEY.INBOX", { ...state, filterForm: payload.data });
        return { ...state, filterForm: payload.data };
      case "mutateTableForm":
        Digit.SessionStorage.set("CITIZENSURVEY.INBOX", { ...state, tableForm: payload.data });
        return { ...state, tableForm: payload.data };
      default:
        break;
    }
  }
  const InboxObjectInSessionStorage = Digit.SessionStorage.get("CITIZENSURVEY.INBOX");

  // const onSearchFormReset = (setSearchFormValue) => {
  //   // setSearchFormValue("postedBy", "");
  //   setSearchFormValue("title", "");
  //   setSearchFormValue("tenantIds", tenantId);
  //   dispatch({ action: "mutateSearchForm", data: searchFormDefaultValues });
  // };

  const onSearchFormReset = (setSearchFormValue) => {
    const resetTenant = formState.searchForm.tenantIds;

    setSearchFormValue("title", "");
    setSearchFormValue("tenantIds", resetTenant);

    dispatch({
      action: "mutateSearchForm",
      data: {
        ...searchFormDefaultValues,
        tenantIds: resetTenant,
      },
    });

    dispatch({
      action: "mutateTableForm",
      data: { ...tableOrderFormDefaultValues },
    });
  };

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

  let { data: { Surveys = [], TotalCount } = {}, isLoading: isInboxLoading } = Digit.Hooks.survey.useSurveyInbox(formState);
  const [sortedSurveys, setSortedSurveys] = useState([]);

  useEffect(() => {
    if (Surveys.length > 0) {
      const sorted = [...Surveys].sort((a, b) => a.auditDetails.lastModifiedTime - b.auditDetails.lastModifiedTime);
      Surveys = sorted;
      setSortedSurveys(sorted);
    }
  }, [Surveys]);

  const PropsForInboxLinks = {
    links: [
      {
        // text: t("CS_COMMON_NEW_SURVEY"),
        text: t("Create New Survey"),
        link: "/digit-ui/employee/engagement/surveys/create-survey-step-form",
        //link: "/digit-ui/employee/engagement/surveys/create-survey-step-form?from=ES_EVENT_INBOX",
      },
      {
        text: t("Active and Open Surveys"),
        link: "/digit-ui/employee/engagement/surveys/active-open-surveys",
        //link: "/digit-ui/employee/engagement/surveys/active-open-surveys?from=ES_EVENT_INBOX",
      },
      {
        text: t("Surveys Inbox/Search Surveys"),
        link: "/digit-ui/employee/engagement/surveys/inbox",
        //link: "/digit-ui/employee/engagement/surveys/inbox?from=ES_EVENT_INBOX",
      },
      {
        text: t("Create Category"),
        link: "/digit-ui/employee/engagement/surveys/create-category",
        //link: "/digit-ui/employee/engagement/surveys/create-category?from=ES_EVENT_INBOX",
      },
      {
        text: t("Search Categories"),
        link: "/digit-ui/employee/engagement/surveys/search-categories",
        //link: "/digit-ui/employee/engagement/surveys/search-categories?from=ES_EVENT_INBOX",
      },
      {
        text: t("Create Questions"),
        link: "/digit-ui/employee/engagement/surveys/create-questions",
        //link: "/digit-ui/employee/engagement/surveys/create-questions?from=ES_EVENT_INBOX",
      },
      {
        text: t("Search Questions"),
        link: "/digit-ui/employee/engagement/surveys/search-questions",
        //link: "/digit-ui/employee/engagement/surveys/search-questions?from=ES_EVENT_INBOX",
      },
    ],
  };

  const SearchFormFields = useCallback(
    ({ registerRef, searchFormState, controlSearchForm }) => <SearchFormFieldsComponents {...{ registerRef, searchFormState, controlSearchForm }} />,
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

  const onSearchFormSubmit = (data) => {
    //setting the offset to 0(In case searched from page other than 1)
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } });

    data.hasOwnProperty("") ? delete data?.[""] : null;
    dispatch({ action: "mutateSearchForm", data });
  };

  const onFilterFormSubmit = (data) => {
    data.hasOwnProperty("") ? delete data?.[""] : null;
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

  const propsForInboxTable = useInboxTableConfig({
    ...{
      parentRoute,
      onPageSizeChange,
      formState,
      totalCount: TotalCount,
      table: sortedSurveys,
      noResultsMessage: "CS_SURVEYS_NOT_FOUND",
      dispatch,
      inboxStyles: { overflowX: "scroll", overflowY: "hidden" },
      setShowToast,
      onSortingByData,
      setShowTermsPopup,
      setData,
    },
  });

  const propsForInboxMobileCards = useInboxMobileCardsData({ parentRoute, table: sortedSurveys, setShowToast });

  //For the card displayed after clicking the delete survey button:
  //On clicking delete button under "Delete Survey" column in a table row, a toast with Yes & No buttons is opened:
  //Toast is closed if no is clicked
  const onNoToToast = () => {
    setShowToast(null);
  };

  //Row will be deleted if yes is clicked
  const onYesToToast = () => {
    handleUpdateSurvey();
  };

  const handleUpdateSurvey = () => {
    setLoader(true);
    const row = showToast.rowData;
    const payload = {
      uuid: row?.uuid,
      active: !row?.active,
    };

    Digit.Surveys.updateSurvey(payload)
      .then((response) => {
        setLoader(false);
        setShowToast({ label: response?.message, isDleteBtn: "true" });
      })
      .catch((error) => {
        setLoader(false);
        setShowToast({ label: error?.response?.data?.Errors?.[0]?.message || ERR_MESSAGE, isDleteBtn: "true", error: true });
      });
  };

  return (
    <Fragment>
      <Header>
        {t("Inbox")}
        {TotalCount ? <p className="inbox-count">{TotalCount}</p> : null}
      </Header>
      <InboxComposer
        {...{
          isInboxLoading,
          PropsForInboxLinks,
          ...propsForSearchForm,
          ...propsForFilterForm,
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
          isWarningButtons={showToast.isWarningButtons}
          style={{ padding: "16px" }}
        />
      )}
      <h1 onClick={() => setShowTermsPopup(true)}>Show modal</h1>
      {showTermsPopup && (
        <DateExtend
          showTermsPopupOwner={showTermsPopup}
          setShowTermsPopupOwner={setShowTermsPopup}
          getData={getData}
          // getModalData={getModalData}
          // getUser={getUser}
          // getShowOtp={getShowOtp}
          // otpVerifiedTimestamp={null} // Pass timestamp as a prop
          // bpaData={data?.applicationData} // Pass the complete BPA application data
          tenantId={tenantId} // Pass tenant ID for API calls
        />
      )}
      {(isInboxLoading || loader) && <Loader page={true} />}
    </Fragment>
  );
};

export default Inbox;
