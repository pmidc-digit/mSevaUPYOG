// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { CardLabel, LabelFieldPair, Dropdown, TextInput, LinkButton, CardLabelError, MobileNumber, Loader } from "@mseva/digit-ui-react-components";
// import { useForm, Controller } from "react-hook-form";
// import { useTranslation } from "react-i18next";
// import _ from "lodash";
// import { useLocation } from "react-router-dom";
// import { getUniqueItemsFromArray, stringReplaceAll } from "../utils";
// import cloneDeep from "lodash/cloneDeep";
// import { sortDropdownNames } from "../utils/index";

// const TLSummaryPage = ({ config, formData, onSelect }) => {
//     const { t } = useTranslation();
//     console.log("Summary Page Data: ", formData);

//     return (
//         <React.Fragment>
//             Summary Page
//         </React.Fragment>
//     )
// }

// export default TLSummaryPage;

import React from "react";
import { CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const TLSummaryPage = ({ config, formData, onSelect }) => {
  const { t } = useTranslation();
  const createdResponse = formData?.CreatedResponse || {};

  const { tradeLicenseDetail = {}, calculation = {}, applicationNumber, status, applicationType, licenseType, tradeName, commencementDate } = createdResponse;

  const tradeUnit = tradeLicenseDetail?.tradeUnits?.[0] || {};
  const address = tradeLicenseDetail?.address || {};
  const owner = tradeLicenseDetail?.owners?.[0] || {};

  const taxHeads = calculation?.taxHeadEstimates || [];

  const getTaxAmount = (category) => {
    return taxHeads.find((item) => item.category === category)?.estimateAmount || 0;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "NA";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <React.Fragment>
      <div className="summary-section">
        <h2>{t("Application Summary")}</h2>

        {/* Amount Summary */}
        <div className="section">
          <LabelFieldPair><CardLabel>{t("Trade License Tax")}</CardLabel><div>{getTaxAmount("TAX")}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Rebate")}</CardLabel><div>{getTaxAmount("REBATE")}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Penalty")}</CardLabel><div>{getTaxAmount("PENALTY")}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Total Amount")}</CardLabel><div>{getTaxAmount("TAX")}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Total Amount")}</CardLabel><div>Rs {getTaxAmount("TAX")}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Payment Status")}</CardLabel><div>{status || "NA"}</div></LabelFieldPair>
        </div>

        {/* Trade Details */}
        <h2>{t("Trade Details")}</h2>
        <div className="section">
          <LabelFieldPair><CardLabel>{t("Application Type")}</CardLabel><div>{applicationType || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Licence Type")}</CardLabel><div>{licenseType || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Trade Name")}</CardLabel><div>{tradeName || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Structure Type")}</CardLabel><div>{tradeLicenseDetail?.structureType?.split(".")[0] || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Structure Sub Type")}</CardLabel><div>{tradeLicenseDetail?.structureType?.split(".")[1] || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Trade Commencement Date")}</CardLabel><div>{formatDate(commencementDate)}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Trade GST No.")}</CardLabel><div>{tradeLicenseDetail?.gstNo || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Operational Area (Sq Ft)")}</CardLabel><div>{tradeLicenseDetail?.operationalArea || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("No. Of Employees")}</CardLabel><div>{tradeLicenseDetail?.noOfEmployees || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Old Receipt No.")}</CardLabel><div>{tradeLicenseDetail?.oldLicenseNumber || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Validity (In Years)")}</CardLabel><div>{tradeLicenseDetail?.additionalDetail?.validityYears || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Trade Category")}</CardLabel><div>{tradeUnit?.tradeType?.split(".")[0] || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Trade Type")}</CardLabel><div>{tradeUnit?.tradeType?.split(".")[1] || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Trade Sub-Type")}</CardLabel><div>{tradeUnit?.tradeType?.split(".")[2] || "NA"}</div></LabelFieldPair>
        </div>

        {/* Address */}
        <h2>{t("Property Address")}</h2>
        <div className="section">
          <LabelFieldPair><CardLabel>{t("City")}</CardLabel><div>{address?.city || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Door/House No.")}</CardLabel><div>{address?.doorNo || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Building/Colony Name")}</CardLabel><div>{address?.buildingName || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Street Name")}</CardLabel><div>{address?.street || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Mohalla")}</CardLabel><div>{address?.locality?.name || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Pincode")}</CardLabel><div>{address?.pincode || "NA"}</div></LabelFieldPair>
        </div>

        {/* Owner Details */}
        <h2>{t("Owner Details")}</h2>
        <div className="section">
          <LabelFieldPair><CardLabel>{t("Name")}</CardLabel><div>{owner?.name || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Mobile No.")}</CardLabel><div>{owner?.mobileNumber || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Father/Husband's Name")}</CardLabel><div>{owner?.fatherOrHusbandName || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Relationship")}</CardLabel><div>{owner?.relationship || "NA"}</div></LabelFieldPair>
          <LabelFieldPair><CardLabel>{t("Gender")}</CardLabel><div>{owner?.gender || "NA"}</div></LabelFieldPair>
        </div> 
      </div>
    </React.Fragment>
  );
};

export default TLSummaryPage;
