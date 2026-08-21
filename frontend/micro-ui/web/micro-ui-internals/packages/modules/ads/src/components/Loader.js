import React from "react";
import { Loader as DigitLoader } from "@mseva/digit-ui-react-components";

export const Loader = ({ page = false }) => {
  if (page) {
    return (
      <div className="ads-components-loader--style-1">
        <DigitLoader />
      </div>
    );
  }
  return <DigitLoader />;
};

export default Loader;
