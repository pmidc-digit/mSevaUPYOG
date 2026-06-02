import React from "react";

const NDCNewTopFilters = ({ children, className = "", style = {} }) => {
  return (
    <div className={`ndc-new-top-filters ${className}`.trim()} style={style}>
      {children}
    </div>
  );
};

export default NDCNewTopFilters;
