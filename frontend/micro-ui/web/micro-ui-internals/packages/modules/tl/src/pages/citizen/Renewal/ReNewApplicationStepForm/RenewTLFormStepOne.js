// RenewFormStepOne.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_tlNewApplication } from "../../../../redux/action/TLNewApplicationActions";
import _ from "lodash";

export const RenewTLFormStepOne = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  //   const currentStepData = useSelector((state) => state.tl.tlNewApplicationForm.formData[config.key] || {});
  //     const formData = useSelector((state) => state.tl.tlNewApplicationForm.formData.TraidDetails);
  const reduxStepData = useSelector((state) => state.tl.tlNewApplicationForm.formData.TraidDetails);
  const [localStepData, setLocalStepData] = useState(reduxStepData);

  useEffect(() => {
    setLocalStepData(reduxStepData);
  },[reduxStepData]);

  function validateStepData(data) {
    const { tradedetils, tradeUnits, validityYears, address, cpt, accessories } = data;

    const missingFields = [];

    // Check tradedetils[0]
    const tradeDetail = tradedetils?.[0] || {};
    if (!tradeDetail?.financialYear?.code) missingFields.push("Financial Year");
    if (!tradeDetail?.licenseType?.code) missingFields.push("License Type");
    if (!tradeDetail?.tradeName) missingFields.push("Trade Name");
    if (!tradeDetail?.structureType?.code) missingFields.push("Structure Type");
    if (!tradeDetail?.structureSubType?.code) missingFields.push("Structure Sub-Type");
    if (!tradeDetail?.commencementDate) missingFields.push("Commencement Date");

    // Check tradeUnits
    if (!tradeUnits || tradeUnits.length === 0) {
      missingFields.push("At least one Trade Unit");
    } else {
      tradeUnits.forEach((unit, index) => {
        if (!unit?.tradeCategory?.code) missingFields.push(`Trade Category (Unit ${index + 1})`);
        if (!unit?.tradeType?.code) missingFields.push(`Trade Type (Unit ${index + 1})`);
        if (!unit?.tradeSubType?.code) missingFields.push(`Trade Sub-Type (Unit ${index + 1})`);
      });
    }

    // Check accessories (only if length > 0)
    if (accessories && accessories.length > 0) {
      accessories.forEach((item, index) => {
        if (item?.accessoryCategory?.code) {
          // UOM and UOM Value are only required when the accessory has a UOM defined
          if (item?.accessoryCategory?.uom) {
            if (!item?.uomValue) missingFields.push(`UOM Value (Item ${index + 1})`);
          }
          if (!item?.count) missingFields.push(`Accessory Count (Item ${index + 1})`);
        }
      });
    }

    // Check validityYears
    if (!validityYears?.code) missingFields.push("Validity Year");

    // Check city & locality
    if (!address?.city?.code) missingFields.push("City");
    const localityCode = cpt?.details?.address?.locality?.code || address?.locality?.code;
    if (!localityCode) missingFields.push("Locality");

    return missingFields;
  }

  const goNext = () => {
    // if (!validateStepData(localStepData)) {
    //   setError(t("Please fill all mandatory fields."));
    //   setShowToast(true);
    //   return;
    // }

    const missingFields = validateStepData(localStepData);

    if (missingFields.length > 0) {
      setError(`Please fill the following fields: ${missingFields.join(", ")}`);
      setShowToast(true);
      return;
    }
    onGoNext();
  };
  useEffect(() => {
        if (showToast) {
          const timer = setTimeout(() => {
            closeToast();
          }, 3000); 
          return () => clearTimeout(timer);
        }
      }, [showToast]);


  const onGoBack = () => {
    onBackClick(config.key, localStepData);
  };

  const onFormValueChange = (setValue, data) => {
    if (!_.isEqual(data, localStepData)) {
      dispatch(UPDATE_tlNewApplication(config.key, data));
      setLocalStepData(data); // important: update local copy too
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  return (
    <React.Fragment>
      {localStepData && <div>
        <FormComposer
          defaultValues={localStepData}
          config={config.currStepConfig}
          onSubmit={goNext}
          onFormValueChange={onFormValueChange}
          label={t(`${config.texts.submitBarLabel}`)}
          currentStep={config.currStepNumber}
          onBackClick={onGoBack}
        />
        {showToast && <Toast error={true} label={error} onClose={closeToast} />}
      </div>}
    </React.Fragment>
  );
};
