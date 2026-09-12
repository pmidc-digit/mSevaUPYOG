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



import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader, Card, Table } from "@mseva/digit-ui-react-components";
import InboxExportMenu from "./InboxExportMenu";

const FloatingTableScrollbar = ({ containerRef, enabled, tableData }) => {
  const dragState = useRef(false);
  const [scrollbar, setScrollbar] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const scrollContainer = containerRef.current?.querySelector(".obps-inbox-table-scroll");
    if (!scrollContainer) return undefined;

    const updateScrollbar = () => {
      const rect = scrollContainer.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (scrollContainer.scrollWidth <= scrollContainer.clientWidth || !isVisible) {
        setScrollbar(null);
        return;
      }

      setScrollbar({
        left: rect.left,
        width: rect.width,
        clientWidth: scrollContainer.clientWidth,
        contentWidth: scrollContainer.scrollWidth,
        scrollLeft: scrollContainer.scrollLeft,
      });
    };

    const syncFromTable = () => {
      setScrollbar((currentScrollbar) =>
        currentScrollbar ? { ...currentScrollbar, scrollLeft: scrollContainer.scrollLeft } : currentScrollbar
      );
    };

    updateScrollbar();
    scrollContainer.addEventListener("scroll", syncFromTable);
    window.addEventListener("resize", updateScrollbar);
    window.addEventListener("scroll", updateScrollbar, true);
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateScrollbar);
    resizeObserver?.observe(scrollContainer);

    return () => {
      scrollContainer.removeEventListener("scroll", syncFromTable);
      window.removeEventListener("resize", updateScrollbar);
      window.removeEventListener("scroll", updateScrollbar, true);
      resizeObserver?.disconnect();
    };
  }, [containerRef, enabled, tableData]);

  const moveTableScroll = (clientX) => {
    const scrollContainer = containerRef.current?.querySelector(".obps-inbox-table-scroll");
    if (!scrollContainer || !scrollbar) return;

    const track = document.querySelector(".digit-table-floating-horizontal-scrollbar");
    if (!track) return;

    const trackRect = track.getBoundingClientRect();
    const thumbWidth = Math.max(72, (scrollbar.width * scrollbar.clientWidth) / scrollbar.contentWidth);
    const maxThumbOffset = Math.max(0, scrollbar.width - thumbWidth);
    const maxScrollOffset = Math.max(0, scrollbar.contentWidth - scrollbar.clientWidth);
    const thumbOffset = Math.min(Math.max(clientX - trackRect.left - thumbWidth / 2, 0), maxThumbOffset);

    scrollContainer.scrollLeft = maxThumbOffset ? (thumbOffset / maxThumbOffset) * maxScrollOffset : 0;
  };

  const stopDragging = () => {
    dragState.current = false;
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", stopDragging);
  };

  const onDrag = (event) => {
    if (dragState.current) moveTableScroll(event.clientX);
  };

  const startDragging = (event) => {
    event.preventDefault();
    dragState.current = true;
    moveTableScroll(event.clientX);
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDragging);
  };

  useEffect(() => stopDragging, []);

  if (!scrollbar) return null;

  const thumbWidth = Math.max(72, (scrollbar.width * scrollbar.clientWidth) / scrollbar.contentWidth);
  const maxThumbOffset = Math.max(0, scrollbar.width - thumbWidth);
  const maxScrollOffset = Math.max(0, scrollbar.contentWidth - scrollbar.clientWidth);
  const thumbOffset = maxScrollOffset ? (scrollbar.scrollLeft / maxScrollOffset) * maxThumbOffset : 0;

  return (
    <div
      className="digit-table-floating-horizontal-scrollbar"
      style={{ left: scrollbar.left, width: scrollbar.width }}
      aria-label="Horizontal table scroll"
      onMouseDown={startDragging}
    >
      <div
        className="digit-table-floating-horizontal-scrollbar-thumb"
        style={{ width: thumbWidth, transform: `translateX(${thumbOffset}px)` }}
      />
    </div>
  );
};

const InboxWrapper = ({
  title,
  totalCount = 0,
  tenantSelector,
  filterSection,
  topBar,
  isLoading = false,
  tableData = [],
  tableProps = {},
  tableHeader = "Assigned Applications",
  emptyMessage,
  pagination,
  fetchAllData = null,
  showExport = true,
  children,
}) => {
  const { t } = useTranslation();
  const tableCardRef = useRef(null);

  return (
    <div className="new-inbox-wrapper">
      <div className="new-inbox-header">
        <span>{title || t("ES_COMMON_INBOX")}</span>
        {totalCount ? (
          <span className="new-inbox-count-pill">{totalCount}</span>
        ) : null}
      </div>

      <div className="new-inbox-layout">
        {tenantSelector && (
          <div className="new-inbox-top-filters">
            {tenantSelector}
          </div>
        )}

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
            <div className="new-inbox-table-header cardHeaderWithOptions">
              <span>{t(tableHeader)}</span>
              {showExport && tableData?.length > 0 && (
                <InboxExportMenu
                  columns={tableProps?.columns}
                  data={tableData}
                  totalCount={totalCount}
                  fetchAllData={fetchAllData || tableProps?.fetchAllData}
                  fileName={t(tableHeader) || "Applications"}
                  t={t}
                />
              )}
            </div>
            <Table
              isPaginationRequired={false}
              t={t}
              {...tableProps}
            />
            <FloatingTableScrollbar
              containerRef={tableCardRef}
              enabled={tableProps.stickyHorizontalScrollbar === true}
              tableData={tableData}
            />
          </div>
        )}

        {pagination}
      </div>
    </div>
  );
};

export default InboxWrapper;
