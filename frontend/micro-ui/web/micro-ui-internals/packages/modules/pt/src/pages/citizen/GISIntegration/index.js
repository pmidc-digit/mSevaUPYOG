import React, { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";

import { Loader } from "@mseva/digit-ui-react-components";

export const GISIntegration = () => {
  const history = useHistory();
  const location = useLocation();
  const queryParams = new URLSearchParams(location?.search);

  useEffect(() => {
    const surveyId = queryParams.get("surveyid");
    const floor = queryParams.get("floor");
    const useType = queryParams.get("use");
    const area = queryParams.get("area");

    const state = {
      surveyId: surveyId,
      floor: floor,
      useType: useType,
      area: area,
    };

    console.log("queryParams====", queryParams);

    // history.push({
    //   pathname: "/digit-ui/citizen/pt/property/create-application",
    //   state: state,
    // });
  }, []);

  return (
    <React.Fragment>
      <Loader />
    </React.Fragment>
  );
};
