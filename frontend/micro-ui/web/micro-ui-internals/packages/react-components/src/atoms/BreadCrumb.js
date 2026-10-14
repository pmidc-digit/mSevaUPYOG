import React, { useEffect, useRef } from "react";
import "./InboxBreadcrumb.scss";
import PropTypes from "prop-types";
import { Link, useHistory, useLocation } from "react-router-dom";
import LinkButton from "../atoms/LinkButton";

const Breadcrumb = (props) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const isInbox = /(?:^|\/)[^/]*inbox\/?$/i.test(pathname);
  const breadcrumbSlotRef = useRef(null);
  const breadcrumbRef = useRef(null);
  useEffect(() => {
    if (!isInbox) return;
    const topbar = document.querySelector(".topbar, .navbar");
    let frame;
    const updatePosition = () => {
      const slot = breadcrumbSlotRef.current;
      const breadcrumb = breadcrumbRef.current;
      if (!slot || !breadcrumb) return;
      const top = Math.max(0, topbar?.getBoundingClientRect().bottom || 0);
      const bounds = slot.getBoundingClientRect();
      const pinned = bounds.top <= top;
      const sidebar = document.querySelector(".employee .sidebar");
      const sidebarBounds = sidebar?.getBoundingClientRect();
      const left = sidebarBounds?.width > 0 && sidebarBounds.right <= bounds.left ? Math.max(0, sidebarBounds.right) : 0;
      const viewportWidth = document.documentElement.clientWidth;
      slot.style.minHeight = `${breadcrumb.getBoundingClientRect().height}px`;
      breadcrumb.classList.toggle("is-pinned", pinned);
      breadcrumb.style.top = pinned ? `${top}px` : "";
      breadcrumb.style.left = pinned ? `${left}px` : "";
      breadcrumb.style.width = pinned ? `${viewportWidth - left}px` : "";
      breadcrumb.style.paddingLeft = pinned ? `${Math.max(0, bounds.left - left)}px` : "";
      breadcrumb.style.paddingRight = pinned ? `${Math.max(0, viewportWidth - bounds.right)}px` : "";
    };
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updatePosition);
    };
    updatePosition();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleUpdate) : null;
    if (topbar) observer?.observe(topbar);
    if (breadcrumbSlotRef.current) observer?.observe(breadcrumbSlotRef.current);
    if (breadcrumbRef.current) observer?.observe(breadcrumbRef.current);
    window.addEventListener("scroll", scheduleUpdate, true);
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [isInbox]);
  function isLast(index) {
    return index === props.crumbs.length - 1;
  }
  const crumbs = (
    <ol className="bread-crumb">
      {props?.crumbs?.map((crumb, ci) => {
        if (crumb?.show === false) return;
        if (crumb?.isBack)
          return (
            <li key={ci} style={{ ...props.style }} className="bread-crumb--item">
              <span style={{ cursor: "pointer" }} onClick={() => window.history.back()}>
                {crumb.content}
              </span>
            </li>
          );
        return (
          <li key={ci} style={{ ...props.style || crumb?.style }} className="bread-crumb--item">
            {isLast(ci) || !crumb?.path || crumb?.isclickable == false ? (
              <span style={props?.spanStyle ? { ...props?.spanStyle, color: "#0B0C0C" } : { color: "#0B0C0C" }}>{crumb.content}</span>
            ) : (
            (crumb?.isredirected ? <span onClick={() => {history.push(`${crumb?.path?.pathname}`, { ...crumb?.path?.state })}}>
              <LinkButton label={crumb.content} />
            </span> : 
            <Link to={crumb.path}>{crumb.content}</Link>)
            )}
          </li>
        );
      })}
    </ol>
  );
  return isInbox ? (
    <div ref={breadcrumbSlotRef}>
      <div ref={breadcrumbRef} className="inbox-sticky-breadcrumbs">{crumbs}</div>
    </div>
  ) : crumbs;
};

Breadcrumb.propTypes = {
  crumbs: PropTypes.array,
};

Breadcrumb.defaultProps = {
  successful: true,
};

export default Breadcrumb;
