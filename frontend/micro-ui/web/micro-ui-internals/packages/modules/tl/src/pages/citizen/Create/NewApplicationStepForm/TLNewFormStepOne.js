import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components"; // Added Toast here
import { UPDATE_tlNewApplication } from "../../../../redux/action/TLNewApplicationActions";
import _ from "lodash"; // You are already using _

const TLNewFormStepOne = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const TLNewApplicationModal = Digit?.ComponentRegistryService?.getComponent("TLNewApplicationModal");

  const currentStepData = useSelector(function (state) {
    return state.tl.tlNewApplicationForm.formData && state.tl.tlNewApplicationForm.formData[config.key]
      ? state.tl.tlNewApplicationForm.formData[config.key]
      : {};
  });

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
          if (!item?.uom) missingFields.push(`UOM (Item ${index + 1})`);
          if (!item?.uomValue) missingFields.push(`UOM Value (Item ${index + 1})`);
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

  function goNext(data) {

    const missingFields = validateStepData(currentStepData);

    if (missingFields.length > 0) {
      setError(`Please fill the following fields: ${missingFields.join(", ")}`);
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
useEffect(() => {
  if (showToast) {
    const timer = setTimeout(() => {
      closeToast();
    }, 3000); 
    return () => clearTimeout(timer);
  }
}, [showToast]);

  useEffect(() => {
    setShowApplicationModal(true);
  }, []);

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
        className="card"
      />
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}

      {showApplicationModal ? <TLNewApplicationModal /> : null}
    </React.Fragment>
  );
};

export default TLNewFormStepOne;
