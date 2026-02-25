import React from "react";

const NDCNewTableTopbar = ({ children, className = "", style = {} }) => {
  return (
    <div className={`custom-new-table-topbar ${className}`.trim()} style={style}>
      {children}
    </div>
  );
};

export default NDCNewTableTopbar;
