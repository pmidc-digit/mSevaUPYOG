import { FormStep, TextInput, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";

const twoColRow = { display: "flex", gap: "24px", flexWrap: "wrap" };
const colItem = { flex: 1, minWidth: "250px" };
import _ from "lodash";
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

    const keys = Object.keys(formValue);
    const part = {};
    keys.forEach((key) => (part[key] = formData[config.key]?.[key]));

    if (!_.isEqual(formValue, part)) {
      onSelect(config.key, { ...formData[config.key], ...formValue });
      trigger();
    }
  }, [localFormData]);

  // Sync pincode from property search results (employee new application)
  useEffect(() => {
    const propertyPincode = formData?.cpt?.details?.address?.pincode;
    if (!propertyPincode) return;
    const currentValue = getValues("pincode");
    if (currentValue === propertyPincode) return;
    setValue("pincode", propertyPincode);
    setPincode(propertyPincode);
    setLocalFormData((prev) => ({ ...prev, pincode: propertyPincode }));
  }, [formData?.cpt?.details?.address?.pincode]);

  // Sync pincode from formData.address on renewal/edit/send-back
  useEffect(() => {
    const addressPincode = formData?.address?.pincode;
    if (!addressPincode) return;
    const currentValue = getValues("pincode");
    if (currentValue === addressPincode) return;
    if (formData?.cpt?.details?.address?.pincode) return; // property takes priority
    setValue("pincode", addressPincode);
    setPincode(addressPincode);
    setLocalFormData((prev) => ({ ...prev, pincode: addressPincode }));
  }, [formData?.address?.pincode]);

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
      const isDisabledByProperty = !!formData?.cpt?.details?.address?.pincode;
      const isFieldDisabled = isDisabledByProperty || isRenewal;

      return (
        <div style={twoColRow} key={index}>
          <div style={colItem}>
            <LabelFieldPair>
              <CardLabel className="card-label-smaller hrms-text-transform-none">{`${t(input.label)}`}</CardLabel>
              <div className="form-field">
                <Controller
                  control={control}
                  name={input.name}
                  defaultValue={pincode || formData?.cpt?.details?.address?.pincode || ""}
                  render={(props) => (
                    <TextInput
                      id={input.name}
                      key={input.name}
                      value={props.value}
                      maxlength={6}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                        setLocalFormData((prev) => ({
                          ...prev,
                          [input.name]: e.target.value,
                        }));
                      }}
                      disable={isFieldDisabled}
                      placeholder={t(`${input.placeholder}`)}
                      style={
                        isFieldDisabled
                          ? {
                              color: "#505A5F",
                              opacity: 1,
                              WebkitTextFillColor: "#505A5F",
                              backgroundColor: "#FFFFFF",
                            }
                          : {}
                      }
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
          </div>
          <div style={colItem} />
        </div>
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
