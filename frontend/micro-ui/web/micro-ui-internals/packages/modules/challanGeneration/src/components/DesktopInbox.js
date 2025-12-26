import { Card, Loader } from "@mseva/digit-ui-react-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { getActionButton } from "../utils";
import ApplicationTable from "./inbox/ApplicationTable";
import InboxLinks from "./inbox/InboxLink";
import SearchApplication from "./inbox/search";
import InboxFilter from "./inbox/NewInboxFilter";

const DesktopInbox = ({ tableConfig, filterComponent, columns, statutes, ...props }) => {
  const { data } = props;
  const { t } = useTranslation();
  const [FilterComponent, setComp] = useState(() => Digit.ComponentRegistryService?.getComponent(filterComponent));
  const tenantId = Digit.ULBService.getCurrentPermanentCity();

  // challans, workFlowData

  // const columns = React.useMemo(() => (props.isSearch ? tableConfig.searchColumns(props) : tableConfig.inboxColumns(props) || []), []);
  const GetCell = (value) => <span className="cell-text">{value}</span>;

  const GetSlaCell = (value) => {
    if (isNaN(value)) return <span className="sla-cell-success">0</span>;
    return value < 0 ? <span className="sla-cell-error">{value}</span> : <span className="sla-cell-success">{value}</span>;
  };

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
      Header: t("UC_CHALLAN_NO"),
      Cell: ({ row }) => {
        return (
          <div>
            <span className="link">
              <Link to={`${props.parentRoute}/application/${row.original?.challanNo}/${tenantId}`}>{row.original?.["challanNo"]}</Link>
              {/* <Link to={`${props.parentRoute}/challansearch/` + row.original?.["challanNo"]}>{row.original?.["challanNo"]}</Link> */}
            </span>
          </div>
        );
      },
      mobileCell: (original) => GetMobCell(original?.["challanNo"]),
    },
    {
      Header: t("UC_COMMON_TABLE_COL_PAYEE_NAME"),
      Cell: ({ row }) => {
        return GetCell(`${row.original?.["name"]}`);
      },
      mobileCell: (original) => GetMobCell(original?.["name"]),
    },
    {
      Header: t("CHALLAN_OFFENCE_TYPE"),
      Cell: ({ row }) => {
        return GetCell(`${row.original?.["offenceName"]}`);
      },
      mobileCell: (original) => GetMobCell(original?.["offenceName"]),
    },
    {
      Header: t("UC_COMMON_TOTAL_AMT"),
      Cell: ({ row }) => {
        const total = row.original?.totalAmount ?? 0;
        const waiver = row.original?.feeWaiver ?? 0;
        const finalAmount = total - waiver;

        return GetCell(finalAmount);
        // const finalAmount = row.original?.totalAmount - row.original?.feeWaiver;
        // const finAm = finalAmount ? finalAmount : row.original?.totalAmount;
        // return GetCell(finAm);
      },
      mobileCell: (original) => GetMobCell(original?.["totalAmount"]),
    },
    {
      Header: t("UC_COMMON_TABLE_COL_STATUS"),
      Cell: ({ row }) => {
        const wf = row.original?.challanStatus;
        return GetCell(t(`${row.original?.challanStatus}`));
      },
      mobileCell: (original) => GetMobCell(original?.workflowData?.state?.["state"]),
    },
    {
      Header: t("WF_INBOX_HEADER_CREATED_DATE"),
      Cell: ({ row }) => (row.original?.date ? GetCell(format(new Date(row.original?.date), "dd/MM/yyyy")) : ""),
      // Cell: ({ row }) => {
      //   return GetCell(t(`${row.original?.date}`));
      //   Cell: ({ row }) => (row.original?.date ? GetCell(format(new Date(row.original?.date), "dd/MM/yyyy")) : ""),
      // },
    },

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
  if (data?.length === 0) {
    result = (
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
            {/* <FilterComponent
              defaultSearchParams={props.defaultSearchParams}
              onFilterChange={props.onFilterChange}
              searchParams={props.searchParams}
              type="desktop"
            /> */}
            {/* import InboxFilter from "./components/inbox/NewInboxFilter"; */}
            <InboxFilter
              defaultSearchParams={props.defaultSearchParams}
              onFilterChange={props.onFilterChange}
              searchParams={props.searchParams}
              type="desktop"
              statutes={statutes}
            />
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
          searchFields={props.searchFields}
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
