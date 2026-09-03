import React, { useMemo } from "react";
import { format } from "date-fns";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EditIcon } from "@mseva/digit-ui-react-components";

const formatDate = (value) => (value ? format(new Date(value), "dd/MM/yyyy") : "-");

const useSurveyInboxTableConfig = ({ table, totalCount, setShowToast, setShowTermsPopup, setData }) => {
  const { t } = useTranslation();
  const history = useHistory();

  const updateSurveyStatus = (survey) => {
    const currentStatus = survey?.active ? t("ES_COMMON_ACTIVE") : t("ES_COMMON_INACTIVE");
    const nextStatus = survey?.active ? t("ES_COMMON_INACTIVE") : t("ES_COMMON_ACTIVE");
    setShowToast({
      label: `Are you sure you want to change the survey status of "${survey?.surveyTitle}" from ${currentStatus} to ${nextStatus}? Please confirm.`,
      isDeleteBtn: true,
      warning: true,
      isWarningButtons: true,
      rowData: survey,
    });
  };

  const columns = useMemo(
    () => [
      {
        Header: t("CS_SURVEY_NAME"),
        accessor: "surveyTitle",
        disableSortBy: true,
        Cell: ({ row }) => (
          <button
            type="button"
            className="survey-new-inbox-survey-link"
            onClick={() => history.push({ pathname: "/digit-ui/employee/engagement/surveys/previewQuestions", state: { data: row.original } })}
          >
            {row.original?.surveyTitle}
          </button>
        ),
      },
      {
        Header: t("EVENTS_START_DATE_LABEL"),
        accessor: "startDate",
        disableSortBy: true,
        Cell: ({ row }) => formatDate(row.original?.startDate),
      },
      {
        Header: t("EVENTS_END_DATE_LABEL"),
        accessor: "endDate",
        disableSortBy: true,
        Cell: ({ row }) => formatDate(row.original?.endDate),
      },
      {
        Header: t("EVENTS_STATUS_LABEL"),
        accessor: "active",
        disableSortBy: true,
        Cell: ({ row }) => <span className={row.original?.active ? "sla-cell-success" : "sla-cell-error"}>{row.original?.active ? t("ES_COMMON_ACTIVE") : t("ES_COMMON_INACTIVE")}</span>,
      },
      {
        Header: t("EVENTS_POSTEDBY_LABEL"),
        accessor: "postedBy",
        disableSortBy: true,
        Cell: ({ row }) => row.original?.postedBy || "-",
      },
      {
        Header: t("Created On"),
        accessor: "createdTime",
        disableSortBy: true,
        Cell: ({ row }) => formatDate(row.original?.auditDetails?.createdTime),
      },
      {
        Header: t("Last Updated On"),
        accessor: "updatedTime",
        disableSortBy: true,
        Cell: ({ row }) => formatDate(row.original?.auditDetails?.lastModifiedTime),
      },
      {
        Header: t("Update Status"),
        accessor: "updateSurvey",
        disableSortBy: true,
        Cell: ({ row }) => (
          <button type="button" className="survey-new-inbox-table-action" onClick={() => updateSurveyStatus(row.original)} aria-label={t("Update Status")}>
            <EditIcon className="table-cell-for-update" fill="#a82227" />
          </button>
        ),
      },
      {
        Header: t("Update Date"),
        accessor: "updateSurveyDate",
        disableSortBy: true,
        Cell: ({ row }) => (
          <button
            type="button"
            className="survey-new-inbox-table-action"
            onClick={() => {
              setShowTermsPopup(true);
              setData(row);
            }}
            aria-label={t("Update Date")}
          >
            <EditIcon className="table-cell-for-update" fill="#a82227" />
          </button>
        ),
      },
    ],
    [history, setData, setShowTermsPopup, setShowToast, t]
  );

  return {
    data: table,
    columns,
    totalRecords: totalCount,
    disableSort: true,
    customTableWrapperClassName: "survey-new-inbox-table-wrapper",
  };
};

export default useSurveyInboxTableConfig;
