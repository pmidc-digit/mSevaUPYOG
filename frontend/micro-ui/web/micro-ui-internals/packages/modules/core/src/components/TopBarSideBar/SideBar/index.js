import React from "react";
import { CitizenSideBar } from "./CitizenSideBar";
import EmployeeSideBar from "./EmployeeSideBar";

const SideBar = ({ t, CITIZEN, isSidebarOpen, toggleSidebar, handleLogout, mobileView, userDetails, modules, linkData, islinkDataLoading, isSideBarScroll,setSideBarScrollTop  }) => {
  if (CITIZEN)
    return (
      <CitizenSideBar
        isOpen={isSidebarOpen}
        isSideBarScroll={isSideBarScroll}
        setSideBarScrollTop={setSideBarScrollTop}
        isMobile={true}
        toggleSidebar={toggleSidebar}
        onLogout={handleLogout}
        linkData={linkData}
        islinkDataLoading={islinkDataLoading}
      />
    );
  else {
    // Employee sidebar - show EmployeeSideBar for both desktop and mobile
    if (userDetails?.access_token) {
      return <EmployeeSideBar {...{ mobileView, userDetails, modules, isSidebarOpen, toggleSidebar, handleLogout }} />;
    }
    return null;
  }
};

export default SideBar;
