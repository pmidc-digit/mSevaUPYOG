import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApplicationCard } from "./inbox/ApplicationCard";
import ApplicationLinks from "./inbox/ApplicationLinks";
import { getActionButton, printReciept } from "../utils";
import { Link } from "react-router-dom";

const MobileInbox = ({
  data,
  defaultSearchParams = {},
  isLoading,
  isSearch,
  searchFields,
  onFilterChange,
  onSearch,
  onSort,
  parentRoute,
  searchParams,
  sortParams,
  linkPrefix,
  tableConfig,
  filterComponent,
}) => {
  const { t } = useTranslation();
  const GetMobCell = (value) => <span className="sla-cell">{value}</span>;
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
  const inboxColumns = (props) => [
    {
      Header: t("APPLICATION_NUMBER"),
      mobileCell: (original) => GetMobCell(original?.searchData?.["applicationNumber"]),
    },
    {
      Header: t("RENT_LEASE_PROPERTY_NAME"),
      mobileCell: (original) => GetMobCell(original?.searchData?.additionalDetails?.propertyDetails[0]?.["propertyName"]),
    },
    {
      Header: t("RAL_ALLOTMENT_TYPE"),
      mobileCell: (original) => GetMobCell(original?.searchData?.additionalDetails?.propertyDetails[0]?.["allotmentType"]),
    },
    {
      Header: t("RENT_AMOUNT "),
      mobileCell: (original) => GetMobCell(original?.searchData?.additionalDetails?.propertyDetails[0]?.["baseRent"] || "-"),
    },
    {
      Header: t("CS_CREATED_DATE"),
      mobileCell: (original) => GetMobCell(convertEpochToDate(original?.searchData?.auditDetails?.["createdTime"])),
    },
    {
      Header: t("UC_COMMON_TABLE_COL_STATUS"),
      mobileCell: (original) => GetMobCell(t(original?.searchData?.["status"])),
    },
  ];

  const serviceRequestIdKey = "applicationNo";

  const getData = () => {
    return data?.map((dataObj) => {
      const obj = {};
      const columns = inboxColumns();
      columns.forEach((el) => {
        if (el.mobileCell) obj[el.Header] = el.mobileCell(dataObj);
      });
      obj.applicationNo = `${dataObj?.searchData?.applicationNumber}/${dataObj?.searchData?.tenantId}`;
      return obj;
    });
  };

  return (
    <div style={{ padding: 0 }}>
      <div className="inbox-container">
        <div className="filters-container">
          {!isSearch && (
            <ApplicationLinks
              linkPrefix={parentRoute}
              // allLinks={[
              //   {
              //     text: t("UC_GENERATE_NEW_CHALLAN"),
              //     link: "/digit-ui/employee/mcollect/new-application",
              //     roles: [],
              //   },
              // ]}
              allLinks={[]}
              headerText={t("RAL_TITLE")}
              isMobile={true}
            />
          )}
          <ApplicationCard
            t={t}
            data={getData()}
            defaultSearchParams={defaultSearchParams}
            onFilterChange={onFilterChange}
            isLoading={isLoading}
            isSearch={isSearch}
            onSearch={onSearch}
            onSort={onSort}
            searchParams={searchParams}
            linkPrefix={linkPrefix ? linkPrefix : `${parentRoute}/property/`}
            sortParams={sortParams}
            serviceRequestIdKey={serviceRequestIdKey}
            filterComponent={filterComponent}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileInbox;
