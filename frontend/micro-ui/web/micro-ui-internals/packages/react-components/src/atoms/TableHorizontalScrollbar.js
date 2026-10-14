import React, { useEffect, useRef, useState } from "react";
import "./TableHorizontalScrollbar.scss";

const TableHorizontalScrollbar = ({ containerRef, enabled, tableData, position = "top" }) => {
  const scrollbarRef = useRef(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;

    const scrollContainer = containerRef.current?.querySelector(".inbox-table-top-scroll");
    const scrollbar = scrollbarRef.current;
    if (!scrollContainer || !scrollbar) return undefined;

    const updateWidth = () => {
      setViewportWidth(scrollContainer.clientWidth);
      setContentWidth(scrollContainer.scrollWidth > scrollContainer.clientWidth ? scrollContainer.scrollWidth : 0);
    };
    const syncFromTable = () => {
      if (scrollbar.scrollLeft !== scrollContainer.scrollLeft) scrollbar.scrollLeft = scrollContainer.scrollLeft;
    };
    const syncToTable = () => {
      if (scrollContainer.scrollLeft !== scrollbar.scrollLeft) scrollContainer.scrollLeft = scrollbar.scrollLeft;
    };

    updateWidth();
    scrollContainer.addEventListener("scroll", syncFromTable);
    scrollbar.addEventListener("scroll", syncToTable);
    window.addEventListener("resize", updateWidth);
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateWidth);
    resizeObserver?.observe(scrollContainer);
    const table = scrollContainer.querySelector("table");
    if (table) resizeObserver?.observe(table);

    return () => {
      scrollContainer.removeEventListener("scroll", syncFromTable);
      scrollbar.removeEventListener("scroll", syncToTable);
      window.removeEventListener("resize", updateWidth);
      resizeObserver?.disconnect();
    };
  }, [containerRef, enabled, tableData]);

  useEffect(() => {
    const scrollContainer = containerRef.current?.querySelector(".inbox-table-top-scroll");
    if (scrollbarRef.current && scrollContainer) scrollbarRef.current.scrollLeft = scrollContainer.scrollLeft;
  }, [containerRef, contentWidth, viewportWidth]);

  if (!enabled) return null;

  return (
    <div
      ref={scrollbarRef}
      className="digit-table-top-horizontal-scrollbar"
      style={{ display: contentWidth ? "block" : "none", width: viewportWidth }}
      role="region"
      aria-label={`${position === "top" ? "Top" : "Bottom"} horizontal table scroll`}
      tabIndex={0}
    >
      <div style={{ width: contentWidth, height: 1 }} />
    </div>
  );
};

export default TableHorizontalScrollbar;
