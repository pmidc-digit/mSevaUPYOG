import React, { useMemo, useReducer, useState } from "react";
import { Toast } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
// import { InboxPagination, InboxWrapper } from "../../../../../templates/Inbox/components";
import { InboxPagination, InboxWrapper } from "../../../../../../templates/Inbox/components";
import DateExtend from "../../../../components/DateExtend";
import { Loader } from "../../../../components/Loader";
import SurveyInboxFilters from "./SurveyInboxFilters";
import SurveyInboxSearch from "./SurveyInboxSearch";
import useSurveyInboxTableConfig from "./useSurveyInboxTableConfig";

//Keep below values from localisation:
const ERR_MESSAGE = "Something went wrong";

const Inbox = () => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [getData, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const ulbs = Digit.SessionStorage.get("ENGAGEMENT_TENANTS");
  const userInfo = Digit.UserService.getUser().info;

  const userUlbs = ulbs?.filter((ulb) => userInfo?.roles?.some((role) => role?.tenantId === ulb?.code));

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
  const { data: { Surveys = [], TotalCount } = {}, isLoading: isInboxLoading } = Digit.Hooks.survey.useSurveyInbox(formState);
  const allStatusesFormState = useMemo(() => ({ ...formState, filterForm: { ...formState.filterForm, status: statuses[0] } }), [formState, statuses]);
  const { data: { Surveys: allSurveys = [] } = {} } = Digit.Hooks.survey.useSurveyInbox(allStatusesFormState);

  const sortedSurveys = useMemo(
    () => [...Surveys].sort((first, second) => (second?.auditDetails?.lastModifiedTime || 0) - (first?.auditDetails?.lastModifiedTime || 0)),
    [Surveys]
  );
  const totalCount = Number(TotalCount ?? sortedSurveys.length);
  const pageSize = Number(formState.tableForm?.limit) || 10;
  const pageOffset = Number(formState.tableForm?.offset) || 0;
  const paginatedSurveys = useMemo(() => sortedSurveys.slice(pageOffset, pageOffset + pageSize), [pageOffset, pageSize, sortedSurveys]);
  const selectedStatuses = formState.filterForm?.status?.bool === true ? [true] : formState.filterForm?.status?.bool === false ? [false] : [];
  const statusCards = useMemo(
    () => [
      {
        applicationstatus: "ACTIVE",
        selectionValues: [true],
        count: allSurveys.filter((survey) => survey?.active === true).length,
      },
      {
        applicationstatus: "INACTIVE",
        selectionValues: [false],
        count: allSurveys.filter((survey) => survey?.active === false).length,
      },
    ],
    [allSurveys]
  );

  const updateSearch = (data) => {
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } });
    dispatch({ action: "mutateSearchForm", data });
  };

  const updateStatus = (active) => {
    const selectedStatus = statuses.find((status) => status.bool === active) || statuses[0];
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } });
    dispatch({ action: "mutateFilterForm", data: { status: selectedStatus } });
  };

  const tableProps = useSurveyInboxTableConfig({
    table: paginatedSurveys,
    totalCount,
    setShowToast,
    setShowTermsPopup,
    setData,
  });

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
    <>
      <div className="survey-new-inbox-content">
        <InboxWrapper
          title={t("ES_COMMON_INBOX")}
          totalCount={totalCount}
          isLoading={isInboxLoading}
          tableData={paginatedSurveys}
          tableProps={tableProps}
          tableHeader="CS_COMMON_SURVEYS"
          emptyMessage={t("CS_NO_SURVEYS_FOUND")}
          filterSection={
            <SurveyInboxFilters
              statuses={statusCards}
              selectedStatuses={selectedStatuses}
              isInboxLoading={isInboxLoading}
              onStatusChange={updateStatus}
            />
          }
          topBar={<SurveyInboxSearch values={formState.searchForm} onSearch={updateSearch} />}
          pagination={
            <InboxPagination
              offset={pageOffset}
              limit={pageSize}
              totalCount={totalCount}
              onPageSizeChange={(event) => {
                dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, limit: Number(event.target.value), offset: 0 } });
              }}
              onNextPage={() => dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: pageOffset + pageSize } })}
              onPrevPage={() => dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: Math.max(0, pageOffset - pageSize) } })}
            />
          }
        />
      </div>
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
      {loader && <Loader page={true} />}
    </>
  );
};

export default Inbox;
