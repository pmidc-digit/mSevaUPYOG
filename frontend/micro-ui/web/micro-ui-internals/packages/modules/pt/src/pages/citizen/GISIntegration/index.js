import React, { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";

import { Loader } from "@mseva/digit-ui-react-components";

export const GISIntegration = () => {
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const queryObject = Object.fromEntries(params.entries());

    console.log("GIS Query Params:", queryObject);

    const state = {
      surveyId: params.get("surveyid"),
      floor: params.get("floor"),
      useType: params.get("use"),
      area: params.get("area"),
      uid: params.get("uid"),
      sector: params.get("sector"),
      block: params.get("block"),
      ward: params.get("ward"),
      planSanctionNo: params.get("plansanction_no"),
      flatNo: params.get("flatno"),
      buildingName: params.get("buildingname"),
      builtUpArea: params.get("builtuparea"),
      openSpaceArea: params.get("openspacearea"),
      road: params.get("road"),
      noOfFloors: params.get("nooffloors"),
      licenseNo: params.get("licenseno"),
      occupancy: params.get("occupancy"),
      gstNo: params.get("gstno"),
      constructionType: params.get("constructiontype"),
      constructionYear: params.get("constructionyr"),
      waterSource: params.get("watersource"),
      waterSupplyNo: params.get("watersupplyno"),
      sewerNo: params.get("sewerno"),
      electricMeterNo: params.get("electricmeterno"),
      towerLocation: params.get("towerlocation"),
      propertyId: params.get("propertyid"),
    };

    console.log("Formatted State:", state);

    history.push({
      pathname: "/digit-ui/citizen/pt/property/create-application",
      state: state,
    });
  }, [location]);

  return (
    <React.Fragment>
      <Loader />
    </React.Fragment>
  );
};
