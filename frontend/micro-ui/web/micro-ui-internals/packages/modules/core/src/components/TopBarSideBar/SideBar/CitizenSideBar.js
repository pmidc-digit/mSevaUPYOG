import React from "react";
import { useHistory } from "react-router-dom";
import FlyoutMiniSidebar from "./FlyoutMiniSidebar";

/* 
Feature :: Modern Enterprise Fly-Out Mini-Sidebar for Citizen Portal
*/
export const CitizenSideBar = ({
  isOpen = false,
  toggleSidebar,
  onLogout,
}) => {
  const history = useHistory();

  /* URL with openlink won't have sidebar and actions */
  if (history?.location?.pathname?.includes("/openlink")) {
    return null;
  }

  return (
    <FlyoutMiniSidebar
      isOpen={isOpen}
      toggleSidebar={toggleSidebar}
      onLogout={onLogout}
    />
  );
};

export default CitizenSideBar;
