import { Card, Loader } from "@mseva/digit-ui-react-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ApplicationTable from "./inbox/ApplicationTable";
import InboxLinks from "./inbox/InboxLink";
import SearchApplication from "./inbox/search";

const DesktopInbox = ({ tableConfig, filterComponent, ...props }) => {
  const { data, useNewInboxAPI } = props;
  const { t } = useTranslation();
  const [FilterComponent, setComp] = useState(() => Digit.ComponentRegistryService?.getComponent(filterComponent));
  const [EmptyInboxComp, setEmptyInboxComp] = useState(() => {
    const com = Digit.ComponentRegistryService?.getComponent(props.EmptyResultInboxComp);
    return com;
  });

  const [clearSearchCalled, setClearSearchCalled] = useState(false);

  const columns = React.useMemo(() => (props.isSearch ? tableConfig.searchColumns(props) : tableConfig.inboxColumns(props) || []), []);

  let result;
  if (props.isLoading) {
    result = (
      <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
        <Loader />
      </div>
    );
  } else if (clearSearchCalled) {
    result = null;
  } else if (!data || data?.length === 0 || (useNewInboxAPI && data?.[0].dataEmpty)) {
    result =
      (EmptyInboxComp && <EmptyInboxComp data={data} />) ||
      (data?.length === 0 || (useNewInboxAPI && data?.[0].dataEmpty) ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "56px 24px",
            background: "#f9fafb",
            borderRadius: "8px",
            marginTop: "16px",
            border: "1px dashed #d1d5db",
          }}
        >
          <span style={{ fontSize: "40px", marginBottom: "12px" }}>📭</span>
          {t("CS_MYAPPLICATIONS_NO_APPLICATION")
            .split("\\n")
            .map((text, index) => (
              <p key={index} style={{ textAlign: "center", color: "#6b7280", margin: "4px 0", fontSize: "15px" }}>
                {text}
              </p>
            ))}
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <Loader />
        </div>
      ));
  } else if (data?.length > 0) {
    result = (
      <ApplicationTable
        t={t}
        data={data}
        columns={columns}
        getCellProps={(cellInfo) => ({
          style: {
            minWidth: cellInfo.column.Header === t("ES_INBOX_APPLICATION_NO") ? "240px" : "",
            padding: "16px 18px",
            fontSize: "14px",
          },
        })}
        onPageSizeChange={props.onPageSizeChange}
        currentPage={props.currentPage}
        onNextPage={props.onNextPage}
        onPrevPage={props.onPrevPage}
        pageSizeLimit={props.pageSizeLimit}
        onSort={props.onSort}
        disableSort={props.disableSort}
        sortParams={props.sortParams}
        totalRecords={props.totalRecords}
      />
    );
  }

  return (
    <div
      className="inbox-container"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: "20px",
      }}
    >
      {!props.isSearch && (
        <div
          className="filters-container"
          style={{
            width: "268px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <InboxLinks parentRoute={props.parentRoute} businessService={props.moduleCode} />

          <FilterComponent
            defaultSearchParams={props.defaultSearchParams}
            onFilterChange={props.onFilterChange}
            searchParams={props.searchParams}
            type="desktop"
            useNewInboxAPI={useNewInboxAPI}
            statusMap={useNewInboxAPI ? data?.[0].statusMap : null}
            moduleCode={props.moduleCode}
          />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: "16px 20px",
            marginBottom: "16px",
          }}
        >
          <SearchApplication
            defaultSearchParams={props.defaultSearchParams}
            onSearch={(d) => {
              props.onSearch(d);
              setClearSearchCalled(false);
            }}
            type="desktop"
            searchFields={props.searchFields}
            isInboxPage={!props?.isSearch}
            searchParams={props.searchParams}
            clearSearch={() => setClearSearchCalled(true)}
          />
        </div>

        <div className="result" style={{ flex: 1 }}>
          {result}
        </div>
      </div>
    </div>
  );
};

export default DesktopInbox;
