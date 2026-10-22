import React from "react";
import FlyoutMiniSidebar from "./FlyoutMiniSidebar";

export const CitizenSideBar = ({
  isOpen,
  isMobile = false,
  toggleSidebar,
  onLogout,
  userDetails,
}) => {
  return (
    <FlyoutMiniSidebar
      isOpen={isOpen}
      toggleSidebar={toggleSidebar}
      onLogout={onLogout}
      userDetails={userDetails}
    />
  );
};

export default CitizenSideBar;
