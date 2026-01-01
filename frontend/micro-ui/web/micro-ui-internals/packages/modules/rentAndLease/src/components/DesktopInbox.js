import { Card, Loader } from "@mseva/digit-ui-react-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getActionButton } from "../utils";
import ApplicationTable from "./inbox/ApplicationTable";
import InboxLinks from "./inbox/InboxLink";
import SearchApplication from "./inbox/search";

const DesktopInbox = ({ tableConfig, filterComponent, columns, ...props }) => {
  const { data, useNewInboxAPI } = props;
  const { t } = useTranslation();
  const [FilterComponent, setComp] = useState(() => Digit.ComponentRegistryService?.getComponent(filterComponent));
  const [EmptyInboxComp, setEmptyInboxComp] = useState(() => {
    const com = Digit.ComponentRegistryService?.getComponent(props.EmptyResultInboxComp);
    return com;
  });

  // challans, workFlowData

  // const columns = React.useMemo(() => (props.isSearch ? tableConfig.searchColumns(props) : tableConfig.inboxColumns(props) || []), []);
  const GetCell = (value) => <span className="cell-text">{value}</span>;

  const convertEpochToDate = (dateEpoch) => {
    if (dateEpoch == null || dateEpoch == undefined || dateEpoch == "") {
      return "NA";
    }
    const dateFromApi = new Date(dateEpoch);
    let month = dateFromApi.getMonth() + 1;
    let day = dateFromApi.getDate();
    let year = dateFromApi.getFullYear();
    month = (month > 9 ? "" : "0") + month;
    day = (day > 9 ? "" : "0") + day;
    return `${day}/${month}/${year}`;
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
      Header: t("APPLICATION_NUMBER"),
      Cell: ({ row }) => {
        return (
          <div>
            <span className="link">
              <Link
                to={`${props.parentRoute}/property/` + row.original?.searchData?.["applicationNumber"] + "/" + row.original?.searchData?.["tenantId"]}
              >
                {row.original?.searchData?.["applicationNumber"]}
              </Link>
            </span>
          </div>
        );
      },
      mobileCell: (original) => GetMobCell(original?.searchData?.["applicationNumber"]),
    },
    {
      Header: t("RENT_LEASE_PROPERTY_NAME"),
      Cell: ({ row }) => {
        return GetCell(`${row.original?.searchData?.additionalDetails?.[0]?.["propertyName"]}`);
      },
      mobileCell: (original) => GetMobCell(`${original?.searchData?.additionalDetails?.[0]?.["propertyName"]}`),
    },
    {
      Header: t("RAL_ALLOTMENT_TYPE"),
      Cell: ({ row }) => {
        return GetCell(`${row.original?.searchData?.additionalDetails?.[0]?.["allotmentType"]}`);
      },
      mobileCell: (original) => GetMobCell(`${original?.searchData?.additionalDetails?.[0]?.["allotmentType"]}`),
    },
    {
      Header: t("RENT_AMOUNT "),
      Cell: ({ row }) => {
        return GetCell(`${row.original?.searchData?.additionalDetails?.[0]?.["baseRent"]}`);
      },
      mobileCell: (original) => GetMobCell(original?.searchData?.additionalDetails?.[0]?.["baseRent"]) || "-",
    },
    {
      Header: t("CS_CREATED_DATE"),
      Cell: ({ row }) => {
        return GetCell(convertEpochToDate(row.original?.searchData?.auditDetails?.["createdTime"]));
      },
      mobileCell: (original) => GetMobCell(convertEpochToDate(original?.searchData?.auditDetails?.["createdTime"])),
    },
    {
      Header: t("UC_COMMON_TABLE_COL_STATUS"),
      Cell: ({ row }) => {
        return GetCell(t(`${row.original?.searchData?.["status"]}`));
      },
      mobileCell: (original) => GetMobCell(original?.searchData?.["status"]),
    },
    // {
    //   Header: t("WS_COMMON_TABLE_COL_DUE_DATE_LABEL"),
    //   Cell: ({ row }) => {
    //     const dueDate = row.original?.dueDate === "NA" ? t("CS_NA") : convertEpochToDate(row.original?.dueDate);
    //     return GetCell(t(`${dueDate}`));
    //   },
    //   mobileCell: (original) => GetMobCell(convertEpochToDate(original?.["dueDate"])),
    // },
    // {
    //   Header: t("UC_COMMON_TOTAL_AMT"),
    //   Cell: ({ row }) => {
    //     return GetCell(t(`${row.original?.totalAmount}`));
    //   },
    //   mobileCell: (original) => GetMobCell(original?.["totalAmount"]),
    // },
    // {
    //   Header: t("WS_COMMON_TABLE_COL_ACTION"),
    //   Cell: ({ row }) => {
    //     const amount = row.original?.totalAmount;
    //     let action = "ACTIVE";
    //     if (amount > 0) action = "COLLECT";
    //     if (action == "COLLECT") {
    //       return (
    //         <div>
    //           <span className="link">
    //             <Link
    //               to={{
    //                 pathname: `/digit-ui/employee/payment/collect/${row.original?.["businessService"]}/${row.original?.["challanNo"]}/tenantId=${row.original?.["tenantId"]}?workflow=mcollect`,
    //               }}
    //             >
    //               {t(`UC_${action}`)}
    //             </Link>
    //           </span>
    //         </div>
    //       );
    //     } else if (row.original?.applicationStatus == "PAID") {
    //       return (
    //         <div>
    //           <span className="link">{getActionButton(row.original?.["businessService"], row.original?.["challanNo"])}</span>
    //         </div>
    //       );
    //     } else {
    //       return GetCell(t(`${"CS_NA"}`));
    //     }
    //   },
    //   mobileCell: (original) => GetMobCell(original?.workflowData?.state?.["state"]),
    // },
  ];

  let result;
  if (props.isLoading || props.isLoader) {
    result = <Loader />;
  } else if (data?.length === 0 || (useNewInboxAPI && data?.[0]?.dataEmpty)) {
    result = (EmptyInboxComp && <EmptyInboxComp data={data} />) || (
      <Card style={{ marginTop: 20 }}>
        {/* TODO Change localization key */}
        {t("CS_MYAPPLICATIONS_NO_APPLICATION")
          .split("\\n")
          .map((text, index) => (
            <p key={index} style={{ textAlign: "center" }}>
              {text}
            </p>
          ))}
      </Card>
    );
  } else if (data?.length > 0) {
    result = (
      <ApplicationTable
        t={t}
        data={data}
        columns={inboxColumns(data)}
        getCellProps={(cellInfo) => {
          return {
            style: {
              minWidth: cellInfo.column.Header === t("ES_INBOX_APPLICATION_NO") ? "240px" : "",
              padding: "20px 18px",
              fontSize: "16px",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              width: "250px",
            },
          };
        }}
        onPageSizeChange={props.onPageSizeChange}
        currentPage={props.currentPage}
        onNextPage={props.onNextPage}
        onPrevPage={props.onPrevPage}
        onLastPage={props.onLastPage}
        onFirstPage={props.onFirstPage}
        pageSizeLimit={props.pageSizeLimit}
        onSort={props.onSort}
        disableSort={props.disableSort}
        sortParams={props.sortParams}
        totalRecords={props.totalRecords}
      />
    );
  }

  return (
    <div className="inbox-container" style={{ overflow: "auto" }}>
      {!props.isSearch && (
        <div className="filters-container">
          <InboxLinks parentRoute={props.parentRoute} businessService={props.businessService} />

          <div>
            {
              <FilterComponent
                defaultSearchParams={props.defaultSearchParams}
                onFilterChange={props.onFilterChange}
                searchParams={props.searchParams}
                moduleCode={props.moduleCode}
                type="desktop"
              />
            }
            {/* <Filter
              businessService={props.businessService}
              searchParams={props.searchParams}
              applications={props.data}
              onFilterChange={props.onFilterChange}
              translatePrefix={props.translatePrefix}
              type="desktop"
            /> */}
          </div>
        </div>
      )}
      <div style={{ flex: 1 }}>
        <SearchApplication
          defaultSearchParams={props.defaultSearchParams}
          onSearch={props.onSearch}
          type="desktop"
          isInboxPage={!props?.isSearch}
          searchParams={props.searchParams}
        />
        <div className="result" style={{ marginLeft: !props?.isSearch ? "24px" : "", flex: 1 }}>
          {result}
        </div>
      </div>
    </div>
  );
};

export default DesktopInbox;
