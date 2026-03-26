import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApplicationCard } from "./inbox/ApplicationCard";
import ApplicationLinks from "./inbox/ApplicationLinks";
import { getActionButton, printReciept } from "../utils";
import { Link, useHistory } from "react-router-dom";

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
  const history = useHistory();

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

  const getData = () => {
    return data?.map((item) => {
      let code = stringReplaceAll(`${item?.businessService}`, ".", "_");
      code = code.toUpperCase();

      return {
        [t("UC_CHALLAN_NUMBER")]: item?.challanNo,
        [t("UC_COMMON_TABLE_COL_PAYEE_NAME")]: item?.name,
        [t("UC_SERVICE_CATEGORY_LABEL")]: t(`BILLINGSERVICE_BUSINESSSERVICE_${code}`),
        [t("UC_DUE_DATE")]: item?.dueDate === "NA" ? t("CS_NA") : convertEpochToDate(item?.dueDate),
        [t("UC_TOTAL_AMOUNT")]: `₹ ${item?.totalAmount}`,
        [t("UC_COMMON_TABLE_COL_STATUS")]: t(item?.applicationStatus),
      };
    });
  };

  return (
    <React.Fragment>
     
    <div style={{ padding: 0 }}>
      <div className="inbox-container">
        {!isSearch && (
          <div className="filters-container">
            <ApplicationLinks
              linkPrefix={parentRoute}
              allLinks={[
                {
                  text: t("UC_GENERATE_NEW_CHALLAN"),
                  link: "/digit-ui/employee/mcollect/new-application",
                  roles: [],
                },
              ]}
              headerText={t("ACTION_TEST_MCOLLECT")}
              isMobile={true}
            />
          </div>
        )}
         <div style={{ padding: "8px 16px" }}>
        <button
          className="TL-new-application-btn"
          style={{ width: "100%" }}
          onClick={() => history.push("/digit-ui/employee/mcollect/new-application")}
        >
          <span style={{ fontSize: "24px", fontWeight: "bold", lineHeight: "1" }}>+</span> {t("UC_GENERATE_NEW_CHALLAN")}
        </button>
      </div>
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
          searchFields={searchFields}
          linkPrefix={linkPrefix ? linkPrefix : "/digit-ui/employee/mcollect/challansearch/"}
          sortParams={sortParams}
          serviceRequestIdKey={t("UC_CHALLAN_NUMBER")}
          filterComponent={filterComponent}
        />
      </div>
    </div>
    </React.Fragment>
  );
};

export default MobileInbox;
