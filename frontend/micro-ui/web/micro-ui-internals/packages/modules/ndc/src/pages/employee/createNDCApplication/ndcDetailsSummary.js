import React from "react";
import SummaryNDC from "./summaryNDC";

const ndcDetailsSummary = ({ onBackClick }) => {
  return (
    <React.Fragment>
      <SummaryNDC onBackClick={onBackClick} />
    </React.Fragment>
  );
};

export default ndcDetailsSummary;
