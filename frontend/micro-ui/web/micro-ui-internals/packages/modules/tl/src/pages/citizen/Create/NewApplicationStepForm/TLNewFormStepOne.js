import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components"; // Added Toast here
import { UPDATE_tlNewApplication } from "../../../../redux/action/TLNewApplicationActions";
import { useState } from "react"; // Added useState for error handling
import _ from "lodash"; // You are already using _

const TLNewFormStepOne = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.tl.tlNewApplicationForm.formData && state.tl.tlNewApplicationForm.formData[config.key]
      ? state.tl.tlNewApplicationForm.formData[config.key]
      : {};
  });

  // function validateStepData(data) {
  //   const { tradedetils, tradeUnits, validityYears, address, cpt, accessories } = data;

  //   const missingFields = [];

  //   // Check tradedetils[0]
  //   const tradeDetail = tradedetils?.[0] || {};
  //   if (!tradeDetail?.financialYear?.code) missingFields.push("Financial Year");
  //   if (!tradeDetail?.licenseType?.code) missingFields.push("License Type");
  //   if (!tradeDetail?.tradeName) missingFields.push("Trade Name");
  //   if (!tradeDetail?.structureType?.code) missingFields.push("Structure Type");
  //   if (!tradeDetail?.structureSubType?.code) missingFields.push("Structure Sub-Type");
  //   if (!tradeDetail?.commencementDate) missingFields.push("Commencement Date");

  //   // Check tradeUnits
  //   if (!tradeUnits || tradeUnits.length === 0) {
  //     missingFields.push("At least one Trade Unit");
  //   } else {
  //     tradeUnits.forEach((unit, index) => {
  //       if (!unit?.tradeCategory?.code) missingFields.push(`Trade Category (Unit ${index + 1})`);
  //       if (!unit?.tradeType?.code) missingFields.push(`Trade Type (Unit ${index + 1})`);
  //       if (!unit?.tradeSubType?.code) missingFields.push(`Trade Sub-Type (Unit ${index + 1})`);
  //     });
  //   }

  //   // Check accessories (only if length > 0)
  //   if (accessories && accessories.length > 0) {
  //     accessories.forEach((item, index) => {
  //       if (item?.accessoryCategory?.code) {
  //         if (!item?.uom) missingFields.push(`UOM (Item ${index + 1})`);
  //         if (!item?.uomValue) missingFields.push(`UOM Value (Item ${index + 1})`);
  //         if (!item?.count) missingFields.push(`Accessory Count (Item ${index + 1})`);
  //       }
  //     });
  //   }

  //   // Check validityYears
  //   if (!validityYears?.code) missingFields.push("Validity Year");

  //   // Check city & locality
  //   if (!address?.city?.code) missingFields.push("City");
  //   const localityCode = cpt?.details?.address?.locality?.code || address?.locality?.code;
  //   if (!localityCode) missingFields.push("Locality");

  //   return missingFields;
  // }

  function validateStepData(data) {
  const { tradedetils, tradeUnits, validityYears, address, cpt, accessories } = data;
  const missingFields = [];

  // === 1. MANDATORY FIELD CHECKS (unchanged) ===
  const tradeDetail = tradedetils?.[0] || {};
  if (!tradeDetail?.financialYear?.code)    missingFields.push(t("TRADELICENSE_FINANCIAL_YEAR_REQUIRED"));
  if (!tradeDetail?.licenseType?.code)      missingFields.push(t("TRADELICENSE_LICENSE_TYPE_REQUIRED"));
  if (!tradeDetail?.tradeName)              missingFields.push(t("TRADELICENSE_TRADE_NAME_REQUIRED"));
  if (!tradeDetail?.structureType?.code)    missingFields.push(t("TRADELICENSE_STRUCTURE_TYPE_REQUIRED"));
  if (!tradeDetail?.structureSubType?.code) missingFields.push(t("TRADELICENSE_STRUCTURE_SUBTYPE_REQUIRED"));
  if (!tradeDetail?.commencementDate)       missingFields.push(t("TRADELICENSE_COMMENCEMENT_DATE_REQUIRED"));

  if (!tradeUnits || tradeUnits.length === 0) {
    missingFields.push(t("TRADELICENSE_AT_LEAST_ONE_TRADE_UNIT_REQUIRED"));
  } else {
    tradeUnits.forEach((unit, index) => {
      const idx = `_UNIT_${index + 1}`;
      if (!unit?.tradeCategory?.code) missingFields.push(`${t("TRADELICENSE_TRADE_CATEGORY_REQUIRED")} ${idx}`);
      if (!unit?.tradeType?.code)     missingFields.push(`${t("TRADELICENSE_TRADE_TYPE_REQUIRED")} ${idx}`);
      if (!unit?.tradeSubType?.code)  missingFields.push(`${t("TRADELICENSE_TRADE_SUBTYPE_REQUIRED")} ${idx}`);
    });
  }

  if (accessories && accessories.length > 0) {
    accessories.forEach((item, index) => {
      const idx = `_ACCESSORY_${index + 1}`;
      if (item?.accessoryCategory?.code) {
        if (!item?.uom)      missingFields.push(`${t("TRADELICENSE_UOM_REQUIRED")} ${idx}`);
        if (!item?.uomValue) missingFields.push(`${t("TRADELICENSE_UOM_VALUE_REQUIRED")} ${idx}`);
        if (!item?.count)    missingFields.push(`${t("TRADELICENSE_ACCESSORY_COUNT_REQUIRED")} ${idx}`);
      }
    });
  }

  if (!validityYears?.code) missingFields.push(t("TRADELICENSE_VALIDITY_YEAR_REQUIRED"));
  if (!address?.city?.code) missingFields.push(t("CORE_COMMON_CITY_REQUIRED"));
  const localityCode = cpt?.details?.address?.locality?.code || address?.locality?.code;
  if (!localityCode)        missingFields.push(t("CORE_COMMON_LOCALITY_REQUIRED"));

  // === 2. FORMAT VALIDATIONS ===
  // GST
  const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  if (tradeDetail.gstNo && !GST_REGEX.test(tradeDetail.gstNo)) {
    missingFields.push(t("TRADELICENSE_INVALID_GST_NUMBER"));
  }

  // operationalArea & noOfEmployees
  if (tradeDetail.operationalArea && isNaN(Number(tradeDetail.operationalArea))) {
    missingFields.push(t("TRADELICENSE_INVALID_OPERATIONAL_AREA"));
  }
  if (tradeDetail.noOfEmployees && isNaN(Number(tradeDetail.noOfEmployees))) {
    missingFields.push(t("TRADELICENSE_INVALID_NO_OF_EMPLOYEES"));
  }

  // Pincode (if present)
  const PINCODE_REGEX = /^(?!([0-9])\1{5})(14[3-9][0-9]{3}|15[0-2][0-9]{3}|153000)$/;
  const pincode = parseInt(address?.pincode);
  if (pincode && !PINCODE_REGEX.test(pincode)) {
    missingFields.push(t("CORE_COMMON_PINCODE_INVALID"));
  }

  return missingFields;
}

  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);

    const missingFields = validateStepData(currentStepData);

    if (missingFields.length > 0) {
      setError(`Please fill the following field Correctly: ${missingFields[0]}`);
      setShowToast(true);
      return;
    }

    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_tlNewApplication(config.key, data));
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default TLNewFormStepOne;
