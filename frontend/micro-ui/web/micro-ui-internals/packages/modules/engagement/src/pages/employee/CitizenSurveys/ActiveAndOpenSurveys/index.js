import React, { useEffect, useMemo, useState } from "react";
import { Loader, SubmitBar, Table } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useHistory } from "react-router-dom";

const ActiveAndOpenSurveys = (props) => {
  const history = useHistory();
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(null);
  const [data, setData] = useState([]);

  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;

  const columns = useMemo(() => {
    return [
      {
        Header: t("Survey Name"),
        accessor: "suveyName",
        //disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <div>
              {/* <Link to={`${parentRoute}/surveys/inbox/details/${row.original["uuid"]}`}> */}
              <span className="link">{row.original.surveyTitle}</span>
              {/* </Link> */}
            </div>
          );
        },
      },
      {
        Header: t("EVENTS_START_DATE_LABEL"),
        accessor: "startDate",
        Cell: ({ row }) => (row.original?.startDate ? GetCell(format(new Date(row.original?.startDate), "dd/MM/yyyy")) : ""),
      },
      {
        Header: t("EVENTS_END_DATE_LABEL"),
        accessor: "endDate",
        Cell: ({ row }) => (row.original?.endDate ? GetCell(format(new Date(row.original?.endDate), "dd/MM/yyyy")) : ""),
      },
      {
        Header: t("Fill Survey"),
        accessor: "fillSurvey",
        Cell: ({ row }) => {
          return (
            // <button
            //   onClick={() => handleStartSurvey(row)}
            //   style={{ cursor: "pointer", marginLeft: "20px", border: "1px solid blue", borderRadius: "8px", padding: "4px" }}
            // >
            //   Start Survey
            // </button>
            <SubmitBar
              label={t("Start Survey")}
              onSubmit={() => {
                handleStartSurvey(row.original);
              }}
            />
          );
        },
      },
    ];
  });

  useEffect(() => {
    fetchActiveAndOpenSurveys();
  }, [tenantId]);

  function fetchActiveAndOpenSurveys() {
    setLoading(true);
    const payload = { tenantId: tenantId, active: true, openSurveyFlag: true };
    Digit.Surveys.searchSurvey(payload)
      .then((response) => {
        const tableData = response.Surveys.filter((item) => item.active);
        setData(tableData);
        setCount(tableData.length);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Failed to fetch surveys", error);
      });
  }

  const handleStartSurvey = (surveyDetails) => {
    console.log("Survey Details: ", surveyDetails);
    // history.push("/digit-ui/employee/engagement/surveys/fill-survey");
    history.push({
      pathname: "/digit-ui/employee/engagement/surveys/fill-survey",
      state: { surveyDetails: surveyDetails },
    });
  };

  return (
    <div>
      <Table
        t={t}
        data={data}
        totalRecords={count}
        columns={columns}
        getCellProps={(cellInfo) => {
          return {
            style: {
              minWidth: "300px", //cellInfo.column.Header === t("ES_INBOX_APPLICATION_NO") ? "240px" : "",
              padding: "20px 18px",
              fontSize: "16px",
            },
          };
        }}
        noResultsMessage="No Questions found"
        inboxStyles={{ overflowX: "scroll", overflowY: "hidden" }}
        // onPageSizeChange={onPageSizeChange}
        // currentPage={getValues("offset") / getValues("limit")}
        // onNextPage={nextPage}
        // onPrevPage={previousPage}
        // pageSizeLimit={getValues("limit")}
        // onSort={onSort}
        // disableSort={false}
        // sortParams={[{ id: getValues("sortBy"), desc: getValues("sortOrder") === "DESC" ? true : false }]}
      />
      {loading && <Loader />}
    </div>
  );
};

export default ActiveAndOpenSurveys;
