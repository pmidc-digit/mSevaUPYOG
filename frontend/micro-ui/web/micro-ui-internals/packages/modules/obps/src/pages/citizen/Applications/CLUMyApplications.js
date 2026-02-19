import { Card, Header, Loader, Table, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, Link } from "react-router-dom";

const CLUMyApplications = ({ view }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const userInfo = Digit.UserService.getUser()?.info || {};
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");

  // Local pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(window.Digit.Utils.browser.isMobile() ? 50 : 10);

  const params = useMemo(() => ({
    sortBy: "createdTime",
    limit: pageSize,
    offset: page * pageSize,
    sortOrder: "DESC",
    mobileNumber: userInfo?.mobileNumber || "",
  }), [page, pageSize, userInfo]);

  const { isLoading, data, isError, error } = Digit.Hooks.obps.useCLUCitizenSearchApplication(
    params,
    tenantId
  );

  console.log("data herein CLU==>", data);

  useEffect(() => {
    if (data) {
      data.revalidate();
    }
  }, []);

  const tableWrapperRef = useRef(null);

  useEffect(() => {
    if (isLoading) return;
    const el = tableWrapperRef.current?.querySelector(".table");
    if (el) {
      el.style.overflowX = "auto";
      el.style.overflowY = "hidden";
      el.style.WebkitOverflowScrolling = "touch";
    }
  }, [isLoading]);

  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;

  const list = data?.data || [];
  const total = data?.count ?? 0;

  const columns = useMemo(
    () => [
      {
        Header: t("BPA_APPLICATION_NUMBER"),
        accessor: (row) => row?.Applications?.applicationNo,
        Cell: ({ row }) => (
          <Link to={`/digit-ui/citizen/obps/clu/application-overview/${row.original?.Applications?.applicationNo}`}>
            {GetCell(row.original?.Applications?.applicationNo)}
          </Link>
        ),
      },
      {
        Header: t("Owner Name"),
        accessor: (row) => row?.Applications?.cluDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.ownerOrFirmName,
        Cell: ({ row }) => GetCell(row.original?.Applications?.cluDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.ownerOrFirmName || "-"),
      },
      {
        Header: t("BPA_APPLICATION_STATUS"),
        accessor: (row) => row?.Applications?.applicationStatus,
        Cell: ({ row }) => GetCell(t(row.original?.Applications?.applicationStatus) || row.original?.Applications?.applicationStatus || "-"),
      },
      {
        Header: t("Action"),
        accessor: "action",
        Cell: ({ row }) => (
          <SubmitBar
            label={t("TL_VIEW_DETAILS")}
            onSubmit={() => history.push(`/digit-ui/citizen/obps/clu/application-overview/${row.original?.Applications?.applicationNo}`)}
          />
        ),
      },
    ],
    [t]
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <div className="applications-list-container">
        <Header>{`${t("BPA_MY_APPLICATIONS_LABEL")}`}({total})</Header>

        {list.length === 0 ? (
          <Card style={{ textAlign: "center" }}>{t("NO_APPLICATIONS_MSG")}</Card>
        ) : null}

        {window.Digit.Utils.browser.isMobile() ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {list.map((application, index) => (
              <Card
                key={index}
                style={{ padding: "12px", borderRadius: "8px", boxShadow: "0px 2px 6px rgba(0,0,0,0.1)" }}
              >
                <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>{application?.Applications?.applicationNo}</h3>
                <p style={{ margin: "4px 0" }}>
                  <b>{t("Owner Name")}:</b> {application?.Applications?.cluDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.ownerOrFirmName || t("CS_NA")}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <b>{t("BPA_APPLICATION_STATUS")}:</b> {t(application?.Applications?.applicationStatus) || application?.Applications?.applicationStatus || t("CS_NA")}
                </p>
                <SubmitBar label={t("TL_VIEW_DETAILS")} onSubmit={() => history.push(`/digit-ui/citizen/obps/clu/application-overview/${application?.Applications?.applicationNo}`)} />
              </Card>
            ))}
          </div>
        ) : (
          <div ref={tableWrapperRef}>
            <Table
              t={t}
              data={list}
              totalRecords={total}
              columns={columns}
              getCellProps={() => ({ style: { minWidth: "200px", padding: "12px 16px", fontSize: "14px" } })}
              noResultsMessage={t("NO_APPLICATIONS_MSG")}
              currentPage={page}
              pageSizeLimit={pageSize}
              onNextPage={() => setPage((p) => p + 1)}
              onPrevPage={() => setPage((p) => Math.max(p - 1, 0))}
              onFirstPage={() => setPage(0)}
              onLastPage={() => {
                const last = Math.max(Math.ceil(total / pageSize) - 1, 0);
                setPage(last);
              }}
              onPageSizeChange={(e) => {
                const value = e?.target ? Number(e.target.value) : Number(e);
                setPageSize(value);
                setPage(0);
              }}
            />
          </div>
        )}
      </div>
    </React.Fragment>
  );
};
export default CLUMyApplications;
