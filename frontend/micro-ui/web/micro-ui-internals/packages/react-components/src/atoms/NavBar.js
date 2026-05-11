


import React, { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SubMenu from "./SubMenu";
import {
  HomeIcon,
  BPAHomeIcon,
  PersonIcon,
  DocumentIconSolid,
  DropIcon,
  CollectionsBookmarIcons,
  FinanceChartIcon,
  ComplaintIcon,
  SearchIcon,
  CollectionIcon,
  PropertyHouse,
  CaseIcon,
  PTIcon,
  PGRIcon,
  MCollectIcon,
  OBPSIcon,
  WSICon,
  FSMIcon,
  Phone,
  LogoutIcon,
  EditPencilIcon,
  LanguageIcon,
  LoginIcon,
  PTRIcon
} from "./svgindex";
import { BirthIcon, DeathIcon, FirenocIcon } from "..";

const IconsObject = {
  CommonPTIcon: <PTIcon className="icon" />,
  OBPSIcon: <OBPSIcon className="icon" />,
  propertyIcon: <PropertyHouse className="icon" />,
  TLIcon: <CaseIcon className="icon" />,
  PGRIcon: <PGRIcon className="icon" />,
  FSMIcon: <FSMIcon className="icon" />,
  WSIcon: <WSICon className="icon" />,
  BirthIcon: <BirthIcon className="icon" />,
  DeathIcon: <DeathIcon className="icon" />,
  FirenocIcon: <FirenocIcon className="icon" />,
  MCollectIcon: <MCollectIcon className="icon" />,
  BillsIcon: <CollectionIcon className="icon" />,
  home: <HomeIcon className="icon" />,
  announcement: <ComplaintIcon className="icon" />,
  business: <BPAHomeIcon className="icon" />,
  store: <PropertyHouse className="icon" />,
  assignment: <CaseIcon className="icon" />,
  receipt: <CollectionIcon className="icon" />,
  "business-center": <PersonIcon className="icon" />,
  description: <CollectionIcon className="icon" />,
  "water-tap": <DropIcon className="icon" />,
  "collections-bookmark": <CollectionsBookmarIcons className="icon" />,
  "insert-chart": <FinanceChartIcon className="icon" />,
  edcr: <CollectionIcon className="icon" />,
  collections: <CollectionIcon className="icon" />,
  "open-complaints": <ComplaintIcon className="icon" />,
  HomeIcon: <HomeIcon className="icon" />,
  EditPencilIcon: <EditPencilIcon className="icon" />,
  LogoutIcon: <LogoutIcon className="icon" />,
  Phone: <Phone className="icon" />,
  LanguageIcon: <LanguageIcon className="icon" />,
  LoginIcon: <LoginIcon className="icon" />,
  PTRIcon: <PTRIcon className="icon" />
};

const NavBar = ({
  open,
  toggleSidebar,
  profileItem,
  menuItems,
  onClose,
  Footer,
  isEmployee,
  search,
  setSearch,
  isSideBarScroll,
}) => {
  const node = useRef()
  const location = useLocation()
  const { pathname } = location
  const { t } = useTranslation()

  Digit.Hooks.useClickOutside(node, open ? onClose : null, open)

  if (isSideBarScroll && !Digit.clikOusideFired) {
    document.getElementById("sideBarMenu")?.scrollTo(0, 0)
  }

  const MenuItem = ({ item }) => {
    let itemComponent
    if (item.type === "component") {
      itemComponent = item.action
    } else {
      itemComponent = item.text
    }

    const leftIconArray = item.icon || item.icon?.type?.name
    const leftIcon = leftIconArray ? IconsObject[leftIconArray] : IconsObject.BillsIcon
    const isActive = pathname === item.link

    const Item = () => (
      <span
        className="menu-item"
        {...item.populators}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          textDecoration: "none",
          width: "100%",
        }}
      >
        <span style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "34px", height: "34px", borderRadius: "8px", flexShrink: 0,
          backgroundColor: isActive ? "#003C71" : "#F0F4F9",
          color: isActive ? "#ffffff" : "#626A6E",
          transition: "all 0.2s ease",
        }}>
          {leftIcon}
        </span>
        <div className="menu-label" style={{
          flex: 1,
          fontSize: "0.875rem",
          fontWeight: isActive ? "600" : "400",
          color: isActive ? "#003C71" : "#374151",
          lineHeight: "1.4",
        }}>
          {itemComponent}
        </div>
        {isActive && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003C71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </span>
    )

    if (item.type === "external-link") {
      return (
        <a href={item.link} style={{ textDecoration: "none" }}>
          <Item />
        </a>
      )
    }

    if (item.type === "link") {
      if (item.link.indexOf("/digit-ui") === -1 && isEmployee) {
        const getOrigin = window.location.origin
        return (
          <a href={getOrigin + "/employee/" + item.link} style={{ textDecoration: "none" }}>
            <Item />
          </a>
        )
      }
      return (
        <Link to={item.link} style={{ textDecoration: "none" }}>
          <Item />
        </Link>
      )
    }

    if (item.type === "dynamic") {
      if (isEmployee) {
        return <SubMenu item={item} t={t} toggleSidebar={toggleSidebar} isEmployee={isEmployee} />
      }
    }

    return <Item />
  }

  const renderSearch = () => {
    return (
      <div className="sidebar-list" >
        <div className="submenu-container">
          <div className="sidebar-link">
            <div
              className="actions"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
               
              }}
            >
              <SearchIcon className="icon" style={{ color: "#6b7280" }} />
              <input
                className="employee-search-input"
                type="text"
                placeholder={t(`ACTION_TEST_SEARCH`)}
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#111827",
                  fontSize: "0.875rem",
                  width: "100%",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>
      <div>
        <div
          style={{
            position: "fixed",
            height: "100%",
            width: "100%",
            top: "0px",
            left: `${open ? "0px" : "-100%"}`,
            opacity: open ? "1" : "0",
            backgroundColor: "rgba(0, 0, 0, 0.54)",
            willChange: "opacity",
            transform: "translateZ(0px)",
            transition: "opacity 400ms cubic-bezier(0.23, 1, 0.32, 1)",
            zIndex: "1200",
            pointerEvents: open ? "auto" : "none",
          }}
          onClick={onClose}
        ></div>
        <div
          ref={node}
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "0",
            height: "100vh",
            paddingTop: "60px",
            position: "fixed",
            top: 0,
            left: 0,
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "#ffffff",
            zIndex: "1250",
            maxWidth: "300px",
            minWidth: "280px",
            width: "300px",
            transform: `${open ? "translateX(0)" : "translateX(-100%)"}`,
            boxShadow: "4px 0 20px rgba(0, 60, 113, 0.15)",
            overflowY: "hidden",
          }}
        >
          {profileItem}
          <div
            className="drawer-list"
            id="sideBarMenu"
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1 }}>
              {isEmployee ? renderSearch() : null}
              {menuItems?.map((item, index) => (
                <div
                  className={`sidebar-list ${pathname === item.link ? "active" : ""}`}
                  key={index}
                  style={{
                    backgroundColor: pathname === item.link ? "#EEF4FF" : "transparent",
                    borderLeft: pathname === item.link ? "3px solid #003C71" : "3px solid transparent",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== item.link) {
                      e.currentTarget.style.backgroundColor = "#F4F7FB"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== item.link) {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }
                  }}
                >
                  <MenuItem item={item} />
                </div>
              ))}
            </div>
            <div
              className="sidebar-footer"
              style={{
                borderTop: "2px solid #DEE0E2",
                padding: "0.875rem 1rem",
                backgroundColor: "#F3F2F1",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
              }}
            >
              <div className="side-bar-footer" style={{ display: "contents" }}>{Footer}</div>
              <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#003C71", letterSpacing: "0.02em" }}>
                mSeva Punjab
              </div>
              <div style={{ fontSize: "0.6875rem", color: "#505A5F" }}>Government of Punjab</div>
              <div style={{ fontSize: "0.625rem", color: "#626A6E", marginTop: "2px" }}>© 2025 UPMCGCL. All rights reserved.</div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default NavBar;