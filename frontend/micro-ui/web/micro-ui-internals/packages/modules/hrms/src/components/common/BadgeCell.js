import React from "react";
import { getBadgeClassName } from "../../utils/styleUtils";

const BadgeCell = ({ value, type }) => (
  <span className={getBadgeClassName(type)}>
    {value || "N/A"}
  </span>
);

export default BadgeCell;
