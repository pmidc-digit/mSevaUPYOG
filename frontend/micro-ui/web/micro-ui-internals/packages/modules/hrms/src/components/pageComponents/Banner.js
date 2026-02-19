import React, { useEffect, useState } from "react";
import { CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
const HRBanner = ({ t, config }) => {
  return (
    <LabelFieldPair>
      {config?.texts?.nosideText!==true && <CardLabel className="card-label-smaller text-white">
        .
      </CardLabel>}
      <span className={config?.texts?.nosideText!==true ? "form-field text-gray-600" : "form-field text-gray-600 w-full mt-2"}>
        {t(config?.texts?.header)}
      </span>
    </LabelFieldPair>
  );
};
export default HRBanner;
