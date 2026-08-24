import React from "react";

export const Loader = ({ page = false }) => {
  return (
    <div className={page ? "noc-loader noc-loader--page" : "noc-loader"}>
      <div className="noc-loader__spinner" />
    </div>
  );
};
