import React from "react";
import StaticCitizenSideBar from "./StaticCitizenSideBar";

/* 
Feature :: Citizen Webview sidebar
*/
export const CitizenSideBar = ({
  isOpen,
  isMobile = false,
  toggleSidebar,
  onLogout,
  linkData,
  islinkDataLoading,
  isSideBarScroll,
  setSideBarScrollTop,
}) => {
  const closeSidebar = () => {
    Digit.clikOusideFired = true;
    if (toggleSidebar) toggleSidebar(false);
  };

  return (
    <StaticCitizenSideBar
      isOpen={isOpen}
      toggleSidebar={toggleSidebar}
      closeSidebar={closeSidebar}
      logout={onLogout}
      linkData={linkData}
      islinkDataLoading={islinkDataLoading}
    />
  );
};

export default CitizenSideBar;
