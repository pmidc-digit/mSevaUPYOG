// import React from "react";
// import { useTranslation } from "react-i18next";

// const styles = {
//   topbar: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: "16px",
//     padding: "16px",
//     borderRadius: "16px",
//     border: "1px solid #e2e8f0",
//     background: "#ffffff",
//     boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
//     flexWrap: "wrap",
//   },
//   tabs: {
//     display: "flex",
//     gap: "8px",
//     flexWrap: "nowrap",
//     overflowX: "auto",
//     maxWidth: "calc(100% - 280px)",
//     paddingBottom: "4px",
//   },
//   tab: {
//     padding: "6px 10px",
//     borderRadius: "999px",
//     border: "1px solid #e5e7eb",
//     background: "#f8fafc",
//     fontWeight: 600,
//     fontSize: "11px",
//     cursor: "pointer",
//     whiteSpace: "nowrap",
//     fontFamily: "inherit",
//   },
//   tabActive: {
//     padding: "6px 10px",
//     borderRadius: "999px",
//     background: "#2563eb",
//     color: "#ffffff",
//     border: "1px solid #2563eb",
//     boxShadow: "0 6px 14px rgba(37, 99, 235, 0.25)",
//     fontWeight: 600,
//     fontSize: "11px",
//     cursor: "pointer",
//     whiteSpace: "nowrap",
//     fontFamily: "inherit",
//   },
//   tabCount: {
//     marginLeft: "6px",
//     padding: "2px 6px",
//     borderRadius: "999px",
//     background: "#e2e8f0",
//     color: "#475569",
//     fontSize: "11px",
//     fontWeight: 700,
//   },
//   tabCountActive: {
//     marginLeft: "6px",
//     padding: "2px 6px",
//     borderRadius: "999px",
//     background: "rgba(255, 255, 255, 0.2)",
//     color: "#ffffff",
//     fontSize: "11px",
//     fontWeight: 700,
//   },
//   search: {
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//     padding: "10px 14px",
//     border: "1px solid #e2e8f0",
//     borderRadius: "10px",
//     minWidth: "260px",
//     background: "#f8fafc",
//     color: "#6b7280",
//     fontSize: "12px",
//   },
//   searchInput: {
//     border: "none",
//     outline: "none",
//     background: "transparent",
//     width: "100%",
//     fontSize: "12px",
//     color: "#111827",
//   },
// };

// const InboxTopBar = ({
//   statuses = [],
//   activeTab = "ALL",
//   onTabClick,
//   searchValue = "",
//   onSearchChange,
//   searchPlaceholder = "Search by application number...",
//   totalCount = 0,
//   showClearTab = true,
// }) => {
//   const { t } = useTranslation();

//   const getStatusCount = (status) => {
//     return status?.totalCount ?? status?.count ?? status?.noOfRecords ?? 0;
//   };

//   return (
//     <div style={styles.topbar}>
//       <div style={styles.tabs}>
//         <button
//           type="button"
//           style={activeTab === "ALL" ? styles.tabActive : styles.tab}
//           onClick={() => onTabClick?.("ALL")}
//         >
//           {t("ALL")}
//           <span style={activeTab === "ALL" ? styles.tabCountActive : styles.tabCount}>{totalCount || 0}</span>
//         </button>
//         {(statuses || []).map((status) => (
//           <button
//             key={status?.applicationstatus}
//             type="button"
//             style={activeTab === status?.applicationstatus ? styles.tabActive : styles.tab}
//             onClick={() => onTabClick?.(status?.applicationstatus, status?.applicationstatus)}
//           >
//             {t(status?.applicationstatus)}
//             <span style={activeTab === status?.applicationstatus ? styles.tabCountActive : styles.tabCount}>
//               {getStatusCount(status)}
//             </span>
//           </button>
//         ))}
//         {showClearTab && (
//           <button
//             type="button"
//             style={activeTab === "CLEAR" ? styles.tabActive : styles.tab}
//             onClick={() => onTabClick?.("CLEAR")}
//           >
//             {t("CLEAR")}
//           </button>
//         )}
//       </div>
//       <div style={styles.search}>
//         <span aria-hidden="true">
//           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <circle cx="11" cy="11" r="7" stroke="#6B7280" strokeWidth="2" />
//             <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
//           </svg>
//         </span>
//         <input
//           type="text"
//           style={styles.searchInput}
//           value={searchValue}
//           onChange={onSearchChange}
//           placeholder={searchPlaceholder}
//         />
//       </div>
//     </div>
//   );
// };

// export default InboxTopBar;


import React from "react";
import { useTranslation } from "react-i18next";


const InboxTopBar = ({
  statuses = [],
  activeTab = "ALL",
  onTabClick,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search by application number...",
  totalCount = 0,
  showClearTab = true,
}) => {
  const { t } = useTranslation();

  const getStatusCount = (status) => {
    return status?.totalCount ?? status?.count ?? status?.noOfRecords ?? 0;
  };

  return (
    <div className="new-inbox-topbar">
      <div className="new-inbox-tabs">
        <button
          type="button"
          className={`new-inbox-tab ${
            activeTab === "ALL" ? "new-inbox-tab-active" : ""
          }`}
          onClick={() => onTabClick?.("ALL")}
        >
          {t("ALL")}
          <span
            className={`new-inbox-tab-count ${
              activeTab === "ALL" ? "new-inbox-tab-count-active" : ""
            }`}
          >
            {totalCount || 0}
          </span>
        </button>

        {(statuses || []).map((status) => (
          <button
            key={status?.applicationstatus}
            type="button"
            className={`new-inbox-tab ${
              activeTab === status?.applicationstatus
                ? "new-inbox-tab-active"
                : ""
            }`}
            onClick={() =>
              onTabClick?.(
                status?.applicationstatus,
                status?.applicationstatus
              )
            }
          >
            {t(status?.applicationstatus)}
            <span
              className={`new-inbox-tab-count ${
                activeTab === status?.applicationstatus
                  ? "new-inbox-tab-count-active"
                  : ""
              }`}
            >
              {getStatusCount(status)}
            </span>
          </button>
        ))}

        {showClearTab && (
          <button
            type="button"
            className={`new-inbox-tab ${
              activeTab === "CLEAR" ? "new-inbox-tab-active" : ""
            }`}
            onClick={() => onTabClick?.("CLEAR")}
          >
            {t("CLEAR")}
          </button>
        )}
      </div>

      <div className="new-inbox-search">
        <span aria-hidden="true" className="new-inbox-search-icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="11" cy="11" r="7" stroke="#6B7280" strokeWidth="2" />
            <line
              x1="16.65"
              y1="16.65"
              x2="21"
              y2="21"
              stroke="#6B7280"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <input
          type="text"
          className="new-inbox-search-input"
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      </div>
    </div>
  );
};

export default InboxTopBar;