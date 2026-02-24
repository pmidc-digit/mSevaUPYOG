import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Loader } from "@mseva/digit-ui-react-components";
import InboxLinks from "./ApplicationLinks";
import ApplicationTable from "./ApplicationTable";
import SearchApplication from "./search";
import { Link } from "react-router-dom";
import { convertEpochToDateDMY } from "../../utils";
// import { getActionButton } from "../../utils";

const DesktopInbox = ({
  tableConfig,
  filterComponent,
  columns,
  isLoading = false,
  setSearchFieldsBackToOriginalState,
  setSetSearchFieldsBackToOriginalState,
  ...props
}) => {
  const { data, localities } = props;
  const { t } = useTranslation();
  const [FilterComponent, setComp] = useState(() => Digit.ComponentRegistryService?.getComponent(filterComponent));
  const GetCell = (value) => <span className="cell-text">{value}</span>;

  const GetSlaCell = (value) => {
    // if (value === "CS_NA") return t(value);
    // if (isNaN(value)) return <span className="sla-cell-success">0</span>;
    // return value < 0 ? <span className="sla-cell-error">{value}</span> : <span className="sla-cell-success">{value}</span>;
    if (value < 0) {
      return (
        <span className="sla-cell-error TL-color-error TL-p-0">
          {Math.abs(value)} hours overdue
        </span>
      );
    } else {
      return (
        <span className="sla-cell-success TL-p-0">
          {value} hours left
        </span>
      );
    }
  };

  const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
    if (searcher == "") return str;
    while (str.includes(searcher)) {
      str = str.replace(searcher, replaceWith);
    }
    return str;
  };


  const GetMobCell = (value) => <span className="sla-cell">{value}</span>;
  const inboxColumns = () => [
    {
      Header: t("WF_INBOX_HEADER_APPLICATION_NO"),
      Cell: ({ row }) => {
        return (
          <div>
            <span className="link">
              <Link to={"/digit-ui/employee/tl/application-details/" + row.original["applicationId"]}>{row.original["applicationId"]}</Link>
            </span>
          </div>
        );
      },
    },
    {
      Header: t("TL_COMMON_TABLE_COL_LIC_NO"),
      Cell: ({ row }) => {
        return GetCell(row.original["licenseNumber"] || "-");
      },
    },
    {
      Header: t("TL_COMMON_TABLE_COL_TRADE_NAME"),
      Cell: ({ row }) => {
        return GetCell(row.original["tradeName"] || "-");
      },
    },
    {
      Header: t("TL_COMMON_TABLE_COL_OWN_NAME"),
      Cell: ({ row }) => {
        return GetCell(row.original["ownerName"] || "-");
      },
    },
    {
      Header: t("TL_COMMON_TABLE_COL_APP_DATE"),
      accessor: "applicationDate",
      Cell: ({ row }) => {
        const date = convertEpochToDateDMY(row.original.date);
        return GetCell(date);
      },
    },
    {
      Header: t("TL_COMMON_TABLE_COL_FIN_YEAR"),
      Cell: ({ row }) => {
        return GetCell(row.original["financialYear"] || "-");
      },
    },
    {
      Header: t("TL_COMMON_TABLE_COL_APP_TYPE"),
      Cell: ({ row }) => {
        return GetCell(t(row.original["businessService"] ? `CS_COMMON_INBOX_${row.original["businessService"]?.toUpperCase()}` : "NA"));
      },
    },
    // {
    //   Header: t("WF_INBOX_HEADER_LOCALITY"),
    //   Cell: ({ row }) => {
    //     return GetCell(t(Digit.Utils.locale.getRevenueLocalityCode(row.original["locality"], row.original["tenantId"])));
    //   },
    // },
    {
      Header: t("WF_INBOX_HEADER_STATUS"),
      Cell: ({ row }) => {
        return GetCell(
          t(row.original["businessService"] ? `WF_${row.original["businessService"]?.toUpperCase()}_${row.original?.["status"]}` : `NA`)
        );
        // return GetCell(t(row.original?.["status"]));
      },
    },
    // {
    //   Header: t("WF_INBOX_HEADER_CURRENT_OWNER"),
    //   Cell: ({ row }) => {
    //     return GetCell(t(`${row.original?.owner}`));
    //   }
    // },
    {
      Header: t("WF_INBOX_HEADER_SLA_DAYS_REMAINING"),
      Cell: ({ row }) => {
        return GetSlaCell(row.original["sla"]);
      },
    },
  ];

  let result;
  if (isLoading) {
    result = <Loader />;
  } else if (data?.table?.length === 0) {
    result = (
      <Card style={{ marginTop: 20 }}>
        {t("CS_MYAPPLICATIONS_NO_APPLICATION")
          .split("\\n")
          .map((text, index) => (
            <p key={index} className="TL-alignC">
              {text}
            </p>
          ))}
      </Card>
    );
  } else if (data?.table?.length > 0) {
    result = (
      <div className="tjkjk">
      <ApplicationTable
        t={t}
        data={data?.table}
        columns={inboxColumns(data)}
        getCellProps={(cellInfo) => {
          return {
            style: {
              minWidth: cellInfo.column.Header === t("ES_INBOX_APPLICATION_NO") ? "240px" : "",
              padding: "20px 18px",
              fontSize: "16px",
            },
          };
        }}
        onPageSizeChange={props.onPageSizeChange}
        currentPage={props.currentPage}
        onNextPage={props.onNextPage}
        onPrevPage={props.onPrevPage}
        pageSizeLimit={props.pageSizeLimit}
        onSort={props.onSort}
        disableSort={props.disableSort}
        sortParams={props.sortParams}
        totalRecords={props.totalRecords}
      /></div>
    );
  }
  // else {
  //   result = (
  //     <Card style={{ marginTop: 20 }}>
  //       {t("CS_COMMON_ERROR_LOADING_RESULTS")
  //         .split("\\n")
  //         .map((text, index) => (
  //           <p key={index} style={{ textAlign: "center" }}>
  //             {text}
  //           </p>
  //         ))}
  //     </Card>
  //   );
  // }

  return (
    <div className="inbox-container">
      {!props.isSearch && (
        <div className="filters-container">
          <InboxLinks
            parentRoute={props.parentRoute}
            allLinks={[
              {
                text: "TL_NEW_APPLICATION",
                link: "/digit-ui/employee/tl/new-application",
                businessService: "TL",
                roles: ["TL_CEMP"],
              },
              {
                text: "TL_SEARCH_APPLICATIONS",
                link: "/digit-ui/employee/tl/search/application",
                businessService: "TL",
                roles: ["TL_FIELD_INSPECTOR", "TL_APPROVER", "TL_DOC_VERIFIER", "TL_CEMP"],
              },
              // {
              //   text: "TL_SEARCH_LICENSE",
              //   link: "/digit-ui/employee/tl/search/license",
              //   businessService: "TL",
              //   roles: ["TL_APPROVER", "TL_DOC_VERIFIER","TL_FIELD_INSPECTOR"],
              // },
              // {
              //   text: "TL_RENEWAL_HEADER",
              //   link: "/digit-ui/employee/tl/search/license",
              //   businessService: "TL",
              //   roles: ["TL_CEMP"],
              // },
              {
                text: "ACTION_TEST_DASHBOARD",
                link: "/digit-ui/employee/dss/dashboard/tradelicence",
                businessService: "TL",
                roles: ["STADMIN"],
              },
            ]}
            headerText={t("ACTION_TEST_TRADELICENSE")}
            businessService={props.businessService}
          />
          <div>
            {isLoading ? (
              <Loader />
            ) : (
              <FilterComponent
                defaultSearchParams={props.defaultSearchParams}
                statuses={data?.statuses}
                onFilterChange={props.onFilterChange}
                searchParams={props.searchParams}
                type="desktop"
                localities={localities}
              />
            )}
          </div>
        </div>
      )}
      <div className="TL-flex-1">
        <SearchApplication
          defaultSearchParams={props.defaultSearchParams}
          onSearch={props.onSearch}
          type="desktop"
          searchFields={props.searchFields}
          isInboxPage={!props?.isSearch}
          searchParams={props.searchParams}
          {...{ setSearchFieldsBackToOriginalState, setSetSearchFieldsBackToOriginalState }}
        />
        <div className={`result TL-flex-1${!props?.isSearch ? " TL-search-ml-24" : ""}`}>
          {result}
        </div>
      </div>
    </div>
  );
};

export default DesktopInbox;
