import React from "react";
import { Loader as DigitLoader } from "@mseva/digit-ui-react-components";

export const Loader = ({ page = false }) => {
  if (page) {
    return (
      <div className="ral-style-63d465e80f">
        <DigitLoader />
      </div>);

  }
  return <DigitLoader />;
};

export default Loader;
