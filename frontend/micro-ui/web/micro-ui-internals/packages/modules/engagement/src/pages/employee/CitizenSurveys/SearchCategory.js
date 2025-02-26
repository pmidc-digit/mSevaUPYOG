import React ,{Fragment, useCallback,useEffect,useMemo,useReducer, useState}from 'react'
import { InboxComposer, DocumentIcon,Toast } from "@upyog/digit-ui-react-components";
import useCategoryInboxMobileCardsData from './Inbox/useCategoryInboxMobileDataCard'
import useCategoryInboxTableConfig from './Inbox/useCategoryInboxTableConfig'
import SearchCategoryFieldsComponents from './Inbox/SearchCategoryFieldsComponents'
import FilterFormFieldsComponent from './Inbox/FilterFieldsComponent';
import { useTranslation } from "react-i18next";
const SearchCategory = ({parentRoute}) => {
  const { t } = useTranslation()
  const tenantId = Digit.ULBService.getCurrentTenantId();
    const [showToast, setShowToast] = useState(null);
  const statuses = [
    { code: "ALL", name: `${t("ES_COMMON_ALL")}` },
    { code: "ACTIVE", name: `${t("ES_COMMON_ACTIVE")}` },
    { code: "INACTIVE", name: `${t("ES_COMMON_INACTIVE")}` }
  ]
  const searchFormDefaultValues = {
    // tenantIds: tenantId,
    tenantId:tenantId,
  
    category: ""
  }
  const filterFormDefaultValues = {
    status: statuses[0]
  }
  const tableOrderFormDefaultValues = {
    sortBy: "",
    limit: 10,
    offset: 0,
    sortOrder: "DESC"
  }

  
  const onSearchFormReset = (setSearchFormValue) => {
    
    setSearchFormValue("category", "")
    setSearchFormValue("tenantId", tenantId)
    dispatch({ action: "mutateSearchForm", data: searchFormDefaultValues })
  }
  const onPageSizeChange = (e) => {
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, limit: e.target.value } })
  }
  useEffect(()=>{
    try{
 
      Digit.Surveys.searchCategory(filters).then((response) => {
        if(response?.Categories?.length>0)
        {
         
          setShowToast({ key: true, label: "Category sucessfully retrieved" });
        }
        else
        {
          setShowToast({ key: true, label: `${response?.Errors?.message}` });
        }
      })
    }
    catch(error)
    {
      console.log(error);
    }
  },[])
  const onSearchFormSubmit = (data) => {
    //setting the offset to 0(In case searched from page other than 1)
   console.log('search data',data)


    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset:0 } })

    data.hasOwnProperty("") ? delete data?.[""] : null
    dispatch({ action: "mutateSearchForm", data })
  const filters={
    tenantId: tenantId,
    id:data?.categoryName||null,
    isActive:data?.isActive,
    label:data?.categoryName, 
    pageNumber:1,
    size:10
  }


    try{
 
      Digit.Surveys.searchCategory(filters).then((response) => {
        if(response?.Categories?.length>0)
        {
         
          setShowToast({ key: true, label: "Category sucessfully retrieved" });
        }
        else
        {
          setShowToast({ key: true, label: `${response?.Errors?.message}` });
        }
      })
    }
    catch(error)
    {
      console.log(error);
    }
  }
  const onFilterFormSubmit = (data) => {
    data.hasOwnProperty("") ? delete data?.[""] : null
    dispatch({ action: "mutateFilterForm", data })
  }
  const onFilterFormReset = (setFilterFormValue) => {
    setFilterFormValue("status", statuses[0])
    dispatch({ action: "mutateFilterForm", data: filterFormDefaultValues })
  }
  const SearchFormFields = useCallback(({ registerRef, searchFormState, controlSearchForm }) => <SearchCategoryFieldsComponents {...{ registerRef, searchFormState, controlSearchForm }} />, [])
  const FilterFormFields = useCallback(
    ({ registerRef, controlFilterForm, setFilterFormValue, getFilterFormValue }) => <FilterFormFieldsComponent
      {...{
        statuses,
        registerRef,
        controlFilterForm,
        setFilterFormValue,
        filterFormState: formState?.filterForm,
        getFilterFormValue,
      }} />
    , [statuses])

 
  function formReducer(state, payload) {
    switch (payload.action) {
      case "mutateSearchForm":
        Digit.SessionStorage.set("CITIZENSURVEYCATEGORY.INBOX", { ...state, searchForm: payload.data })
        return { ...state, searchForm: payload.data };
        case "mutateFilterForm":
          Digit.SessionStorage.set("CITIZENSURVEYCATEGORY.INBOX", { ...state, filterForm: payload.data })
          return { ...state, filterForm: payload.data };
      case "mutateTableForm":
        Digit.SessionStorage.set("CITIZENSURVEYCATEGORY.INBOX", { ...state, tableForm: payload.data })
        return { ...state, tableForm: payload.data };
      default:
        break;
    }
  }
  const InboxObjectInSessionStorage = Digit.SessionStorage.get("CITIZENSURVEYCATEGORY.INBOX")
  const formInitValue = useMemo(() => {
      return InboxObjectInSessionStorage || {
       
        searchForm: searchFormDefaultValues,
        tableForm: tableOrderFormDefaultValues
      }
    }
      , [Object.values(InboxObjectInSessionStorage?.searchForm || {}), Object.values(InboxObjectInSessionStorage?.tableForm || {})])
   const [formState, dispatch] = useReducer(formReducer, formInitValue)
  const Categories=[        {
    "id": "ca6eb4ad-2c37-43d5-a823-ff5fabf2de97",
    "label": "CUSTOMER_FEEDBACK",
    "isActive": false,
    "tenantId": "pb.testing",
    "auditDetails": {
        "createdBy": "8e9b3b23-78d8-4da7-8883-ab03b5b37bf2",
        "lastModifiedBy": "8e9b3b23-78d8-4da7-8883-ab03b5b37bf2",
        "createdTime": 1738672217377,
        "lastModifiedTime": 1738672526496
    }
},
{
    "id": "ecbb884d-388c-44b2-a4a9-19ae005fd80c",
    "label": "PRODUCT_FEEDBACK",
    "isActive": true,
    "tenantId": "pb.testing",
    "auditDetails": {
        "createdBy": "8e9b3b23-78d8-4da7-8883-ab03b5b37bf2",
        "lastModifiedBy": "8e9b3b23-78d8-4da7-8883-ab03b5b37bf2",
        "createdTime": 1738241073440,
        "lastModifiedTime": 1738241073440
    }
},
{
    "id": "965d9c50-1c02-4cbc-ad3b-7bc84e9ec105",
    "label": "RADIO_BUTTON_ANSWER_TYPE",
    "isActive": true,
    "tenantId": "pb.testing",
    "auditDetails": {
        "createdBy": "8e9b3b23-78d8-4da7-8883-ab03b5b37bf2",
        "lastModifiedBy": "8e9b3b23-78d8-4da7-8883-ab03b5b37bf2",
        "createdTime": 1738237510422,
        "lastModifiedTime": 1738237510422
    }
},
{
    "id": "88d7054c-5781-4a7d-9b80-98d7889f0ccb",
    "label": "FEATURE-SATISFACTION",
    "isActive": false,
    "tenantId": "pb.testing",
    "auditDetails": {
        "createdBy": "8e9b3b23-78d8-4da7-8883-ab03b5b37bf2",
        "lastModifiedBy": "8e9b3b23-78d8-4da7-8883-ab03b5b37bf2",
        "createdTime": 1738236472115,
        "lastModifiedTime": 1738236472115
    }
},
{
    "id": "3d75a2a5-33b9-4792-b948-087588a59b2f",
    "label": "SERVICE-RATING",
    "isActive": true,
    "tenantId": "pb.testing",
    "auditDetails": {
        "createdBy": "8e9b3b23-78d8-4da7-8883-ab03b5b37bf2",
        "lastModifiedBy": "8e9b3b23-78d8-4da7-8883-ab03b5b37bf2",
        "createdTime": 1738236444693,
        "lastModifiedTime": 1738236444693
    }
},
{
    "id": "de90b9b1-b7e9-481f-8adc-82aabc1e5505",
    "label": "PRODUCT_QUALITY",
    "isActive": true,
    "tenantId": "pb.testing",
    "auditDetails": {
        "createdBy": "8e9b3b23-78d8-4da7-8883-ab03b5b37bf2",
        "lastModifiedBy": "8e9b3b23-78d8-4da7-8883-ab03b5b37bf2",
        "createdTime": 1738236436758,
        "lastModifiedTime": 1738236436758
    }
}
];
const noTocloseToast = () => {
  setShowToast(null);
  
};

// const yesTocloseToast = (row) => {
 
//   handleDelete(row);
// };
const handleDelete =()=>{
   let row =showToast.rowData.row
  const updatedList = Categories.filter((_, idx) => idx !== row.index);
  console.log("upd list",updatedList)
  const details={
      Categories:[ {
         id: row.original?.id,
         isActive: row.original?.isActive,
        }
      ]
  }
  try{
 
      Digit.Surveys.deleteCategory(details).then((response) => {
        if(response?.Categories?.length>0)
        {
          setTableData(updatedList)
          setShowToast({ key: true, label: "Category sucessfully deleted" });
        }
        else
        {
          setShowToast({ key: true, label: `${response?.Errors?.message}` });
        }
      })
    }
    catch(error)
    {
      console.log(error);
    }
 }

  const TotalCount=5;
  const isInboxLoading=false;
   // const { data: { Categories, TotalCount } = {}, isLoading: isInboxLoading, } = Digit.Hooks.survey.useSurveyInbox(formState)
   const propsForFilterForm = { FilterFormFields, onFilterFormSubmit, filterFormDefaultValues: formState?.filterForm, resetFilterFormDefaultValues: filterFormDefaultValues, onFilterFormReset }
   const propsForSearchForm = { SearchFormFields, onSearchFormSubmit, searchFormDefaultValues: formState?.searchForm, resetSearchFormDefaultValues: searchFormDefaultValues, onSearchFormReset }
  const propsForInboxTable = useCategoryInboxTableConfig({  ...{ parentRoute, onPageSizeChange, formState, totalCount: TotalCount, table: Categories, noResultsMessage: "No Categories found", dispatch, inboxStyles:{overflowX:"scroll", overflowY:"hidden"},setShowToast} })
  const propsForInboxMobileCards = useCategoryInboxMobileCardsData({parentRoute, table:Categories})
  console.log("props for inbox table",propsForInboxTable)
  const PropsForInboxLinks = {
      logoIcon: <DocumentIcon />,
      headerText: "CS_COMMON_SURVEYS",
      links: [
        {
        text: t("CS_COMMON_NEW_SURVEY"),
        link: "/digit-ui/employee/engagement/surveys/inbox/create",
      
      },
      {
       
        text: t("Create Category"),
        link: "/digit-ui/employee/engagement/surveys/create-category",
      },
      {
     
        text: t("Search Category"),
        link: "/digit-ui/employee/engagement/surveys/search-category",
      }
    
    ]
    }
  const  onNoToToast=()=>{
    setShowToast(null)
  }
  const onYesToToast=(row)=>{
  console.log("row",row)
    handleDelete(row)
  }
  
  return (
    <Fragment>
    // <div>SearchCategory</div>
    <InboxComposer {...{  isInboxLoading,PropsForInboxLinks, ...propsForSearchForm, ...propsForFilterForm, propsForInboxMobileCards, propsForInboxTable, formState}}></InboxComposer>
     {showToast && (
              <Toast
                error={showToast.error}
                warning={showToast.warning}
                label={t(showToast.label)}
                onClose={() => {
                  setShowToast(null);
                }}
                isDleteBtn={showToast.isDleteBtn}
       
        onNo={onNoToToast}
        onYes={handleDelete}
        isWarningButtons={showToast.isWarningButtons}
              />
            )}
    </Fragment>
  )
}

export default SearchCategory