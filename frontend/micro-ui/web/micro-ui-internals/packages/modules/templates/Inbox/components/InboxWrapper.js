// import React from "react";
// import { useTranslation } from "react-i18next";
// import { Loader, Card, Table } from "@mseva/digit-ui-react-components";

// const styles = {
//   inbox: {
//     marginTop: "32px",
//     padding: "20px",
//     background: "#f8fafc",
//     borderRadius: "12px",
//   },
//   header: {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//     fontSize: "24px",
//     fontWeight: 700,
//     marginBottom: "12px",
//   },
//   countPill: {
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//     minWidth: "28px",
//     height: "28px",
//     padding: "0 8px",
//     borderRadius: "999px",
//     background: "#2563eb",
//     color: "#ffffff",
//     fontSize: "12px",
//     fontWeight: 700,
//   },
//   layout: {
//     display: "block",
//   },
//   topFilters: {
//     margin: "12px 0 16px",
//     background: "#ffffff",
//     border: "1px solid #e2e8f0",
//     borderRadius: "16px",
//     padding: "18px",
//     boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
//   },
//   tableCard: {
//     marginTop: "16px",
//     background: "#ffffff",
//     border: "1px solid #e2e8f0",
//     borderRadius: "16px",
//     boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
//     overflow: "hidden",
//   },
//   tableHeader: {
//     padding: "18px 20px",
//     fontSize: "18px",
//     fontWeight: 700,
//     borderBottom: "1px solid #e2e8f0",
//   },
// };

// const InboxWrapper = ({
//   title,
//   totalCount = 0,
//   filterSection,
//   topBar,
//   isLoading = false,
//   tableData = [],
//   tableProps = {},
//   tableHeader = "Assigned Applications",
//   emptyMessage,
//   pagination,
//   children,
// }) => {
//   const { t } = useTranslation();

//   return (
//     <div style={styles.inbox}>
//       <div style={styles.header}>
//         <span>{title || t("ES_COMMON_INBOX")}</span>
//         {totalCount ? <span style={styles.countPill}>{totalCount}</span> : null}
//       </div>
//       <div style={styles.layout}>
//         {filterSection && (
//           <div style={styles.topFilters}>
//             {filterSection}
//           </div>
//         )}
//         {topBar}
//         {isLoading ? (
//           <Loader />
//         ) : children ? (
//           children
//         ) : tableData?.length < 1 ? (
//           <Card className="margin-unset text-align-center">
//             {emptyMessage || t("CS_MYAPPLICATIONS_NO_APPLICATION")}
//           </Card>
//         ) : (
//           <div style={styles.tableCard}>
//             <div style={styles.tableHeader}>{t(tableHeader)}</div>
//             <Table
//               isPaginationRequired={false}
//               {...tableProps}
//             />
//           </div>
//         )}
//         {pagination}
//       </div>
//     </div>
//   );
// };

// export default InboxWrapper;



import React from "react";
import { useTranslation } from "react-i18next";
import { Loader, Card, Table } from "@mseva/digit-ui-react-components";


const InboxWrapper = ({
  title,
  totalCount = 0,
  filterSection,
  topBar,
  isLoading = false,
  tableData = [],
  tableProps = {},
  tableHeader = "Assigned Applications",
  emptyMessage,
  pagination,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <div className="new-inbox-wrapper">
      <div className="new-inbox-header">
        <span>{title || t("ES_COMMON_INBOX")}</span>
        {totalCount ? (
          <span className="new-inbox-count-pill">{totalCount}</span>
        ) : null}
      </div>

      <div className="new-inbox-layout">
        {filterSection && (
          <div className="new-inbox-top-filters">
            {filterSection}
          </div>
        )}

        {topBar}

        {isLoading ? (
          <Loader />
        ) : children ? (
          children
        ) : tableData?.length < 1 ? (
          <Card className="margin-unset text-align-center">
            {emptyMessage || t("CS_MYAPPLICATIONS_NO_APPLICATION")}
          </Card>
        ) : (
          <div className="new-inbox-table-card">
            <div className="new-inbox-table-header">
              {t(tableHeader)}
            </div>
            <Table
              isPaginationRequired={false}
              {...tableProps}
            />
          </div>
        )}

        {pagination}
      </div>
    </div>
  );
};

export default InboxWrapper;