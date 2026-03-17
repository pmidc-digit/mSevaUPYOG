import React, { Fragment, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { InboxComposer, DocumentIcon, Toast, Header } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import FilterFormFieldsComponent from "./FilterFieldsComponent";
import SearchQuestionsFieldsComponents from "./SearchQuestionsFieldsComponents";
import useQuestionsInboxMobileCardsData from "./useQuestionsInboxMobileCardsData";
import useQuestionsInboxTableConfig from "./useQuestionsInboxTableConfig";
import Dialog from "../../../../components/Modal/Dialog";

//Keep below values from localisation:
const SEARCH_QUESTIONS = "Search Questions";
const ERR_MESSAGE = "Something went wrong";

const SearchQuestions = ({ parentRoute }) => {
  //const [isSearchClicked, setIsSearchClicked] = useState(false);
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const ulbs = Digit.SessionStorage.get("ENGAGEMENT_TENANTS");
  const userInfo = Digit.UserService.getUser().info;
  const userUlbs = ulbs.filter((ulb) => userInfo?.roles?.some((role) => role?.tenantId === ulb?.code));
  const [openQuesDetailsDialog, setOpenQuesDetailsDialog] = useState(false);
  const [questionDetailsContent, setQuestionDetailsContent] = useState(false);

  //
  const statuses = [
    { code: "ALL", name: `${t("ES_COMMON_ALL")}`, bool: null },
    { code: "ACTIVE", name: `${t("ES_COMMON_ACTIVE")}`, bool: true },
    { code: "INACTIVE", name: `${t("ES_COMMON_INACTIVE")}`, bool: false },
  ];

  //Default values
  const defaultTenant = userUlbs?.find((ulb) => ulb.code === tenantId) || userUlbs?.[0];

  const searchFormDefaultValues = {
    tenantIds: defaultTenant,
    categoryName: "",
    questionStatement: "",
  };

  const filterFormDefaultValues = {
    status: statuses[0],
  };

  const tableOrderFormDefaultValues = {
    sortBy: "",
    limit: 10,
    offset: 0,
    sortOrder: "DESC",
  };

  //

  function formReducer(state, payload) {
    switch (payload.action) {
      case "mutateSearchForm":
        Digit.SessionStorage.set("CITIZENSURVEYQUESTION.INBOX", { ...state, searchForm: payload.data });
        return { ...state, searchForm: payload.data };
      case "mutateFilterForm":
        Digit.SessionStorage.set("CITIZENSURVEYQUESTION.INBOX", { ...state, filterForm: payload.data });
        return { ...state, filterForm: payload.data };
      case "mutateTableForm":
        Digit.SessionStorage.set("CITIZENSURVEYQUESTION.INBOX", { ...state, tableForm: payload.data });
        return { ...state, tableForm: payload.data };
      default:
        break;
    }
  }
  const InboxObjectInSessionStorage = Digit.SessionStorage.get("CITIZENSURVEYQUESTION.INBOX");

  //Reset:
  const onSearchFormReset = (setSearchFormValue) => {
    const resetTenant = userUlbs?.find((ulb) => ulb.code === tenantId) || userUlbs?.[0];

    setSearchFormValue("tenantIds", resetTenant);
    setSearchFormValue("categoryName", "");
    setSearchFormValue("questionStatement", "");

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

  //
  let { data: { Questions = [], Errors = [] } = {}, isLoading: isInboxLoading } = Digit.Hooks.survey.useSurveyQuestionInbox(formState);
  const totalCount = Questions?.length;

  // const [sortedQuestions, setSortedQuestions] = useState([]);
  // useEffect(() => {
  //   if (Questions.length > 0) {
  //     const sorted = [...Questions].sort((a, b) => a.auditDetails.lastModifiedTime - b.auditDetails.lastModifiedTime);
  //     Questions = sorted;
  //     setSortedQuestions(sorted);
  //   }
  // }, [Questions]);

  const sortedQuestions = useMemo(() => {
    return [...(Questions || [])].sort((a, b) => b.auditDetails.lastModifiedTime - a.auditDetails.lastModifiedTime);
  }, [Questions]);

  //Props for links card:
  const PropsForInboxLinks = {
    // logoIcon: <DocumentIcon />,
    // headerText: "CS_COMMON_SURVEYS",
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
      <SearchQuestionsFieldsComponents {...{ registerRef, searchFormState, controlSearchForm }} />
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
    //setIsSearchClicked(true);
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

  const propsForInboxTable = useQuestionsInboxTableConfig({
    ...{
      parentRoute,
      onPageSizeChange,
      formState,
      totalCount: totalCount,
      table: sortedQuestions,
      noResultsMessage: "No Questions found",
      dispatch,
      inboxStyles: { overflowX: "scroll", overflowY: "hidden" },
      setShowToast,
      openQuesDetailsDialog,
      questionDetailsContent,
      setOpenQuesDetailsDialog,
      setQuestionDetailsContent,
    },
  });
  const propsForInboxMobileCards = useQuestionsInboxMobileCardsData({ parentRoute, table: sortedQuestions, setShowToast });

  //For the card displayed after clicking the delete question button:
  //On clicking delete button under "Delete Question" column in a table row, a toast with Yes & No buttons is opened:
  //Toast is closed if no is clicked
  const onNoToToast = () => {
    setShowToast(null);
  };
  //Row will be deleted if yes is clicked
  const onYesToToast = () => {
    handleUpdateQuestions();
  };

  const handleUpdateQuestions = () => {
    const row = showToast.rowData;
    const updatedStatus = showToast.updatedStatus;
    const payload = {
      Questions: [
        {
          uuid: row?.uuid,
          status: updatedStatus,
          //...(typeof row?.original?.isActive === "boolean" && { isActive: !row?.original?.isActive }),
          //label: "" //For updating the question name(question label)
        },
      ],
    };

    Digit.Surveys.updateQuestions(payload)
      .then((response) => {
        if (response?.Questions?.length > 0) {
          setShowToast({ label: "Question status updated successfully", isDleteBtn: "true" });
        } else {
          setShowToast({ label: response?.Errors?.[0]?.message || ERR_MESSAGE, isDleteBtn: "true", error: true });
        }
      })
      .catch((error) => {
        setShowToast({ label: error?.response?.data?.Errors?.[0]?.message || ERR_MESSAGE, isDleteBtn: "true", error: true });
      });
  };

  function handleOnSubmitDialog() {
    setOpenQuesDetailsDialog(false);
  }
  function handleOnCancelDialog() {
    setOpenQuesDetailsDialog(false);
  }

  return (
    <Fragment>
      <Header>
        {t(SEARCH_QUESTIONS)}
        {totalCount ? <p className="inbox-count">{totalCount}</p> : null}
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
          style={{ padding: "16px" }}
          isWarningButtons={showToast.isWarningButtons}
        />
      )}

      {openQuesDetailsDialog && (
        <Dialog
          onSelect={handleOnSubmitDialog}
          onCancel={handleOnCancelDialog}
          onDismiss={handleOnCancelDialog}
          heading="Question Details"
          actionCancel={true}
          content={questionDetailsContent}
          hideSubmit={true}
        />
      )}
    </Fragment>
  );
};

export default SearchQuestions;
