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
  const searchFormDefaultValues = {
    // tenantIds: tenantId,
    tenantIds: userUlbs[0],
    categoryName: "",
    //question: "",
    questionStatement: "",
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
    setSearchFormValue("tenantIds", tenantId);
    setSearchFormValue("categoryName", "");
    // setSearchFormValue("question", "");
    setSearchFormValue("questionStatement", "");
    dispatch({ action: "mutateSearchForm", data: searchFormDefaultValues });
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

 // const[Questions,setQuestions] = useState([])
 // const [isInboxLoading,setIsInboxLoading]=useState(true)
  let { data: { Questions = [], totalCount} = {}, isLoading: isInboxLoading } = Digit.Hooks.survey.useSurveyQuestionInbox(formState);
  //const totalCount = Questions?.length;
 const [sortedQuestions,setSortedQuestions]=useState(Questions)
  console.log("Questions",Questions)
//   Questions=[
//   {
//     "uuid": "6f08d759-6813-47ce-a0d0-75f091eaddb8",
//     "tenantId": "pb.punjab",
//     "questionStatement": "TEST 3",
//     "auditDetails": {
//       "createdBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//       "lastModifiedBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//       "createdTime": 1747308479084,
//       "lastModifiedTime": 1747308479084
//     },
//     "status": "ACTIVE",
//     "type": "DROP_DOWN_MENU_ANSWER_TYPE",
//     "categoryId": "5cfd82c9-2a1b-4f53-b05e-0d468bf7bbb8",
//     "category": {
//       "id": "5cfd82c9-2a1b-4f53-b05e-0d468bf7bbb8",
//       "label": "Public Review"
//     },
//     "options": [
//       {
//         "uuid": "db38cdc2-b1ad-4ce9-992d-aa87360be5f1",
//         "questionUuid": "6f08d759-6813-47ce-a0d0-75f091eaddb8",
//         "optionText": "M",
//         "optionOrder": 1,
//         "weightage": 0,
//         "auditDetails": {
//           "createdBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "lastModifiedBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "createdTime": 1747308479084,
//           "lastModifiedTime": 1747308479084
//         }
//       },
//       {
//         "uuid": "8558a280-974e-4296-838a-64ee507d90ff",
//         "questionUuid": "6f08d759-6813-47ce-a0d0-75f091eaddb8",
//         "optionText": "N",
//         "optionOrder": 2,
//         "weightage": 0,
//         "auditDetails": {
//           "createdBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "lastModifiedBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "createdTime": 1747308479084,
//           "lastModifiedTime": 1747308479084
//         }
//       }
//     ]
//   },
//   {
//     "uuid": "6b2a0f3c-c888-4b1c-8f5c-06b896f18b54",
//     "tenantId": "pb.punjab",
//     "questionStatement": "TEST 2",
//     "auditDetails": {
//       "createdBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//       "lastModifiedBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//       "createdTime": 1747308479084,
//       "lastModifiedTime": 1747308479084
//     },
//     "status": "ACTIVE",
//     "type": "CHECKBOX_ANSWER_TYPE",
//     "categoryId": "5cfd82c9-2a1b-4f53-b05e-0d468bf7bbb8",
//     "category": {
//       "id": "5cfd82c9-2a1b-4f53-b05e-0d468bf7bbb8",
//       "label": "Public Review"
//     },
//     "options": [
//       {
//         "uuid": "8a064d63-0050-43e2-86b6-3415780b3cd9",
//         "questionUuid": "6b2a0f3c-c888-4b1c-8f5c-06b896f18b54",
//         "optionText": "A",
//         "optionOrder": 1,
//         "weightage": 0,
//         "auditDetails": {
//           "createdBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "lastModifiedBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "createdTime": 1747308479084,
//           "lastModifiedTime": 1747308479084
//         }
//       },
//       {
//         "uuid": "820ce9c9-fc9a-4a8d-b0d6-3918bf368df8",
//         "questionUuid": "6b2a0f3c-c888-4b1c-8f5c-06b896f18b54",
//         "optionText": "B",
//         "optionOrder": 2,
//         "weightage": 0,
//         "auditDetails": {
//           "createdBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "lastModifiedBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "createdTime": 1747308479084,
//           "lastModifiedTime": 1747308479084
//         }
//       },
//       {
//         "uuid": "5594c3d8-cdcc-496c-a8e9-47c9d40d4f78",
//         "questionUuid": "6b2a0f3c-c888-4b1c-8f5c-06b896f18b54",
//         "optionText": "ABC",
//         "optionOrder": 3,
//         "weightage": 0,
//         "auditDetails": {
//           "createdBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "lastModifiedBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "createdTime": 1747308479084,
//           "lastModifiedTime": 1747308479084
//         }
//       }
//     ]
//   },
//   {
//     "uuid": "18b77f8d-f264-42a7-83ef-efe3c47b6878",
//     "tenantId": "pb.punjab",
//     "questionStatement": "Test 1",
//     "auditDetails": {
//       "createdBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//       "lastModifiedBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//       "createdTime": 1747308479084,
//       "lastModifiedTime": 1747308479084
//     },
//     "status": "ACTIVE",
//     "type": "MULTIPLE_ANSWER_TYPE",
//     "categoryId": "5cfd82c9-2a1b-4f53-b05e-0d468bf7bbb8",
//     "category": {
//       "id": "5cfd82c9-2a1b-4f53-b05e-0d468bf7bbb8",
//       "label": "Public Review"
//     },
//     "options": [
//       {
//         "uuid": "8fbdc75c-9c42-4c11-a401-92bdae215ccf",
//         "questionUuid": "18b77f8d-f264-42a7-83ef-efe3c47b6878",
//         "optionText": "A",
//         "optionOrder": 1,
//         "weightage": 0,
//         "auditDetails": {
//           "createdBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "lastModifiedBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "createdTime": 1747308479084,
//           "lastModifiedTime": 1747308479084
//         }
//       },
//       {
//         "uuid": "466cf1de-b005-428b-b2f4-2a9dab4aa884",
//         "questionUuid": "18b77f8d-f264-42a7-83ef-efe3c47b6878",
//         "optionText": "B",
//         "optionOrder": 2,
//         "weightage": 0,
//         "auditDetails": {
//           "createdBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "lastModifiedBy": "3dda9495-4311-4218-b8eb-475395ee3879",
//           "createdTime": 1747308479084,
//           "lastModifiedTime": 1747308479084
//         }
//       }
//     ]
//   }
// ]
//   if(Questions?.length>0){
  

//     const sorted = [...Questions].sort(
//       (a, b) => a.auditDetails.lastModifiedTime - b.auditDetails.lastModifiedTime
//     );
// Questions=sorted;
// console.log("sorted",sorted)
//   }

//   useEffect(()=>{
//     console.log("Qus",Questions)
// if(sortedQuestions.length>0){
  

//     const sorted = [...sortedQuestions].sort(
//       (a, b) => a.auditDetails.lastModifiedTime - b.auditDetails.lastModifiedTime
//     );
// Questions=sorted
//     setSortedQuestions(sorted);
// console.log("sorted",sorted)

// }
//   },[sortedQuestions])
// useEffect(()=>{
//   console.log("formState",formState)
//      let filters = {
//       // categoryId:category.selectCategory.id
//       categoryId: formState?.searchForm?.categoryName?.value||"",
//       tenantId: formState?.searchForm?.tenantIds?.code,
//       questionStatement: formState?.searchForm?.questionStatement||"",
//       status: "ACTIVE",
//     };
//   try{
//    Digit.Surveys.searchQuestions(filters).then((response) => {
//           if (response?.Questions?.length > 0) {
//             let arr = response?.Questions;
  
          
//            arr.sort((a, b) => a.auditDetails.lastModifiedTime - b.auditDetails.lastModifiedTime);
//             console.log("arr",arr)
//             setQuestions(arr)
//             setIsInboxLoading(false)
           
//             // setShowToast({ key: true, label: "Category successfully retrieved." });
//           } else {
           
//           }
//         });
      
//       } catch (error) {
//         dispatch(setQuestions(category.id, []));
//         // dispatch(addQuestions(category.id, []));
//         setQuestionsList([]);
//         setShowQuestionTableList(false);
//       }
// },[formState])
  useEffect(()=>{
    
if(Questions.length>0){
  console.log("helllooo")

    const sorted = [...Questions].sort(
      (a, b) => a.auditDetails.lastModifiedTime - b.auditDetails.lastModifiedTime
    );
Questions=sorted
    setSortedQuestions(sorted);

}
else{
  setSortedQuestions([])
}
  },[Questions])
  console.log("sorted Qus",sortedQuestions)
  // useEffect(() => {
  //   if (isSearchClicked && (Questions?.length === 0 || Errors?.length > 0)) {
  //     setShowToast({ label: ERR_MESSAGE, isDleteBtn: "true", error: true });
  //     setIsSearchClicked(false);
  //   }
  // }, [Questions, Errors, isSearchClicked]);

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
      onSortingByData
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
