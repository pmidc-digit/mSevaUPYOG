import { FormStep, TextInput, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Timeline from "../components/TLTimeline";
import { useForm, Controller } from "react-hook-form";

const TLSelectPincode = ({ t, config, onSelect, formData = {}, userType, register, errors, props }) => {
  const tenants = Digit.Hooks.tl.useTenants();
  const [pincode, setPincode] = useState(() => formData?.address?.pincode || "");
  const { pathname } = useLocation();
  const presentInModifyApplication = pathname.includes("modify");
  // let isEditProperty = formData?.isEditProperty || false;
  let isEdit = window.location.href.includes("/edit-application/") || window.location.href.includes("renew-trade");
  const isRenewal = window.location.href.includes("edit-application") || window.location.href.includes("tl/renew-application-details");
  const [localFormData, setLocalFormData] = useState({});
  const {
    control,
    formState: localFormState,
    watch,
    setError: setLocalError,
    clearErrors: clearLocalErrors,
    setValue,
    trigger,
    getValues,
  } = useForm();

  const formValue = watch();

  //if (formData?.isUpdateProperty) isEditProperty = true;
  const inputs = [
    {
      label: "CORE_COMMON_PINCODE",
      type: "text",
      name: "pincode",
      disable: isEdit,
      validation: {
        minlength: 6,
        maxlength: 7,
        pattern: "^[1-9]{1}[0-9]{2}\\s{0,1}[0-9]{3}$",
        max: "9999999",
        title: t("CORE_COMMON_PINCODE_INVALID"),
      },
      placeholder: "TL_NEW_TRADE_DETAILS_PIN_PLACEHOLDER",
    },
  ];
  const [pincodeServicability, setPincodeServicability] = useState(null);

  useEffect(() => {
    console.log("formValue in useEffect of TLSelectPincode ", formValue);

    const keys = Object.keys(formValue);
    const part = {};
    keys.forEach((key) => (part[key] = formData[config.key]?.[key]));

    if (!_.isEqual(formValue, part)) {
      onSelect(config.key, { ...formData[config.key], ...formValue });
      trigger();
    }
  }, [localFormData]);

  // useEffect(() => {
  //   if (formData?.address?.pincode) {
  //     setPincode(formData.address.pincode);
  //   }
  // }, [formData?.address?.pincode]);

  // useEffect(() => {
  //   onSelect(config?.key?.pincode, pincode);
  // },[pincode])

  function onChange(e) {
    setPincode(e.target.value);
    setPincodeServicability(null);
    if (userType === "employee") {
      // const foundValue = tenants?.find((obj) => obj.pincode?.find((item) => item.toString() === e.target.value));
      // if (foundValue) {
      //   const city = tenants.filter((obj) => obj.pincode?.find((item) => item == e.target.value))[0];
      //   onSelect(config.key, { ...formData.address, city, pincode: e.target.value, slum: null });
      // } else {
      //   onSelect(config.key, { ...formData.address, pincode: e.target.value });
      //   setPincodeServicability("TL_COMMON_PINCODE_NOT_SERVICABLE");
      // }
    }
  }

  const goNext = async (data) => {
    // Validate pincode format first
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!data?.pincode || !pincodeRegex.test(data.pincode)) {
      setPincodeServicability("CORE_COMMON_PINCODE_INVALID");
      return;
    }
    
    // Check if pincode exists in tenant master data
    const foundValue = tenants?.find((obj) => obj.pincode?.find((item) => item == data?.pincode));
    if (foundValue) {
      console.log("Pincode found in master data:", data.pincode);
      setPincodeServicability(null);
      onSelect(config.key.pincode, { pincode: data.pincode });
    } else {
      // Show warning but still allow to proceed if user confirms
      console.warn("Pincode not found in master data:", data.pincode);
      setPincodeServicability("TL_COMMON_PINCODE_NOT_IN_MASTER");
      // Still allow selection - validation will be done at city level
      onSelect(config.key.pincode, { pincode: data.pincode });
    }
  };

  if (userType === "employee") {
    return inputs?.map((input, index) => {
      return (
        <LabelFieldPair key={index}>
          <CardLabel className="card-label-smaller">{`${t(input.label)}`}</CardLabel>
          <div className="form-field">
            {/* <TextInput 
              key={input.name} 
              value={formData?.cpt?.details?.address?.pincode || pincode} 
              onChange={onChange}
              disable={formData?.cpt?.details || isRenewal}
              {...input.validation} 
              autoFocus={presentInModifyApplication} 
              // isMandatory={true}
              // ValidationRequired={true}
              // validation={type="number"}
            /> */}
            <Controller
              control={control}
              name={input.name}
              defaultValue={pincode || formData?.cpt?.details?.address?.pincode}
              render={(props) => (
                <TextInput
                  id={input.name}
                  key={input.name}
                  value={props.value}
                  maxlength={6}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                    //onChange(e);
                    setLocalFormData((prev) => ({
                      ...prev,
                      [input.name]: e.target.value,
                    }));
                  }}
                  placeholder={t(`${input.placeholder}`)}
                />
              )}
            />
          </div>
        </LabelFieldPair>
      );
    });
  }
  const onSkip = () => onSelect();
  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? <Timeline currentStep={2} /> : null}
      <FormStep
        t={t}
        config={{ ...config, inputs }}
        onSelect={goNext}
        _defaultValues={{ pincode }}
        onChange={onChange}
        onSkip={onSkip}
        forcedError={t(pincodeServicability)}
        isDisabled={!pincode || isEdit}
      ></FormStep>
    </React.Fragment>
  );
};

export default TLSelectPincode;
