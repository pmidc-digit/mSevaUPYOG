import { CardLabel, Dropdown, FormStep, LabelFieldPair, RadioOrSelect, RadioButtons, CardLabelError } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import _ from "lodash";
import Timeline from "../components/TLTimeline";

const TLSelectAddress = ({ t, config, onSelect, userType, formData, setError, formState, clearErrors }) => {
  const allCities = Digit.Hooks.tl.useTenants();
  
  const currentUserType = JSON.parse(window.localStorage.getItem("user-info"))?.type;

  let tenantId;
  if(currentUserType === "CITIZEN"){
      tenantId = window.localStorage.getItem("CITIZEN.CITY");
  }else{
    tenantId = Digit.ULBService.getCurrentPermanentCity(); 
  }


  //const tenantId = Digit.ULBService.getCurrentPermanentCity(); //Digit.ULBService.getCurrentTenantId();
  //let isEditProperty = formData?.isEditProperty || false;
  const isEdit = window.location.href.includes("/edit-application/") || window.location.href.includes("renew-trade");
  //if (formData?.isUpdateProperty) isEditProperty = true;
  const { pincode, city } = formData?.address || "";
  const cities =
    userType === "employee"
      ? allCities.filter((city) => city.code === tenantId)
      : pincode
      ? allCities.filter((city) => city?.pincode?.some((pin) => pin == pincode))
      : allCities;
console.log("citiesInTLSelectAddress", cities);
  const [selectedCity, setSelectedCity] = useState(() => formData?.address?.city || null);

  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    selectedCity?.code,
    "revenue",
    {
      enabled: !!selectedCity,
    },
    t
  );

  const [localities, setLocalities] = useState();

  const [selectedLocality, setSelectedLocality] = useState(formData?.address?.locality || null);

  const [isErrors, setIsErrors] = useState(false);


  useEffect(()=>{
    if(localities && typeof selectedLocality === "string" && checkingLocationForRenew){
      const foundLocality = localities?.find((item) => item.code === selectedLocality)
      setSelectedLocality(foundLocality)
      setValue("locality",foundLocality);
    }
  },[localities])

  useEffect(() => {
    if (cities && !isEdit) {
      if (cities.length === 1) {
        setSelectedCity(cities[0]);
      }
    }
  }, [cities]);

  useEffect(() => {
    if (formData?.address) {
      let flag = true;
      Object.keys(formData?.address).map((dta) => {
        if (dta != "key" || formData?.address[dta] != undefined || formData?.address[dta] != "" || formData?.address[dta] != null) {
        } else {
          if (flag) setSelectedCity(cities[0]);
          flag = false;
        }
      });
    }
  }, [formData?.tradeUnits?.[0]?.tradeCategory?.code]);

  console.log("formDataInTLSelectState", formData)

  useEffect(() => {
    if (selectedCity && fetchedLocalities) {
      let __localityList = fetchedLocalities;
      let filteredLocalityList = [];

      if (formData?.address?.locality) {
        setSelectedLocality(formData.address.locality);
      }

      if (formData?.address?.pincode) {
        filteredLocalityList = __localityList.filter((obj) => obj.pincode?.find((item) => item == formData.address.pincode));
        if (!formData?.address?.locality) setSelectedLocality();
      }

      // if (userType === "employee") {
      //   onSelect(config.key, { ...formData[config.key], city: selectedCity });
      // }
      setLocalities(() => (filteredLocalityList.length > 0 ? filteredLocalityList : __localityList));

      if (filteredLocalityList.length === 1) {
        setSelectedLocality(filteredLocalityList[0]);
        if (userType === "employee") {
          onSelect(config.key, { ...formData[config.key], locality: filteredLocalityList[0] });
        }
      }
    }
  }, [selectedCity, formData?.address?.pincode, fetchedLocalities]);

  function selectCity(city) {
    setSelectedLocality(null);
    setLocalities(null);
    setSelectedCity(city);
  }

  function selectLocality(locality) {
    if (formData?.address?.locality) {
      formData.address["locality"] = locality;
    }
    setSelectedLocality(locality);
    if (userType === "employee") {
      onSelect(config.key, { ...formData[config.key], locality: locality });
    }
  }

  function onSubmit() {
    onSelect(config.key, { city: selectedCity, locality: selectedLocality });
  }

  const { control, formState: localFormState, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue, trigger } = useForm();
  const formValue = watch();
  const { errors } = localFormState;
  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

  useEffect(() => {
    trigger();
  }, []);

  useEffect(() => {
    let keys = Object.keys(formValue);
    const part = {};
    keys.forEach((key) => (part[key] = formData[config.key]?.[key]));

    if (userType === "employee") {
      if (!_.isEqual(formValue, part)) {
        Object.keys(formValue).map((data) => {
          if (data != "key" && formValue[data] != undefined && formValue[data] != "" && formValue[data] != null && !isErrors) {
            setIsErrors(true);
          }
        });
        onSelect(config.key, { ...formData[config.key], ...formValue });
        trigger();
      }
    } else {
      if (!_.isEqual(formValue, part)) onSelect(config.key, { ...formData[config.key], ...formValue });
    }
    for (let key in formValue) {
      if (!formValue[key] && !localFormState.errors[key]) {
        setLocalError(key, { type: `${key.toUpperCase()}_REQUIRED`, message: `${key.toUpperCase()}_REQUIRED` });
      } else if (formValue[key] && localFormState.errors[key]) {
        clearLocalErrors([key]);
      }
    }
  }, [formValue]);

  useEffect(() => {
    if (userType === "employee") {
      if (Object.keys(errors).length && !_.isEqual(formState.errors[config.key]?.type || {}, errors)) {
        setError(config.key, { type: errors });
      } else if (!Object.keys(errors).length && formState.errors[config.key] && isErrors) {
        clearErrors(config.key);
      }
    }
  }, [errors]);

  let checkingLocationForRenew = window.location.href.includes("renew-application-details") || window.location.href.includes("renew-trade");
  if (window.location.href.includes("edit-application-details")) checkingLocationForRenew = true;
  if (userType === "employee") {
    return (
      <div>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("MYCITY_CODE_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <Controller
            name={"city"}
            defaultValue={cities?.length === 1 ? cities[0] : selectedCity}
            control={control}
            rules={{ required: t("REQUIRED_FIELD") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={props.value}
                disable={true}
                option={cities}
                select={props.onChange}
                optionKey="i18nKey"
                onBlur={props.onBlur}
                t={t}
                placeholder={t("TL_SELECT_CITY_PLACEHOLDER")}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.city ? errors?.city?.message : ""}</CardLabelError>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("TL_NEW_TRADE_DETAILS_MOHALLA_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <Controller
            name="locality"
            defaultValue={selectedLocality || formData?.address?.locality || null}
            control={control}
            rules={{ required: t("REQUIRED_FIELD") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                // selected={
                //   checkingLocationForRenew || formData?.cpt?.details
                //     ? { ...formData?.cpt?.details?.address?.locality, i18nkey: formData?.cpt?.details?.address?.locality?.name }
                //     : props.value || { ...formData?.cpt?.details?.address?.locality, i18nkey: formData?.cpt?.details?.address?.locality?.name }
                // }
                selected={
                  formData?.cpt?.details?.address ? 
                  { ...formData?.cpt?.details?.address?.locality, i18nkey: formData?.cpt?.details?.address?.locality?.name }
                  : checkingLocationForRenew ? selectedLocality || formData?.address?.locality : props.value
                }
                option={localities}
                select={props.onChange}
                onBlur={props.onBlur}
                optionKey="i18nkey"
                t={t}
                disable={checkingLocationForRenew || formData?.cpt?.details ? true : false}
                errorStyle={localFormState.touched.locality && errors?.locality?.message ? true : false}
                placeholder={t("TL_NEW_TRADE_DETAILS_MOHALLA_PLACEHOLDER")}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.locality ? errors?.locality?.message : ""}</CardLabelError>
      </div>
    );
  }
  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? <Timeline currentStep={2} /> : null}
      <FormStep config={config} onSelect={onSubmit} t={t} isDisabled={selectedLocality ? false : true}>
        <CardLabel>{`${t("MYCITY_CODE_LABEL")}*`}</CardLabel>
        <span className={"form-pt-dropdown-only"}>
          <RadioOrSelect
            options={cities.sort((a, b) => a.name.localeCompare(b.name))}
            selectedOption={selectedCity}
            optionKey="i18nKey"
            onSelect={selectCity}
            t={t}
            isDependent={true}
            labelKey=""
            disabled={isEdit}
          />
        </span>
        {selectedCity && localities && <CardLabel>{`${t("TL_LOCALIZATION_LOCALITY")} `}</CardLabel>}
        {selectedCity && localities && (
          <span className={"form-pt-dropdown-only"}>
            <RadioOrSelect
              dropdownStyle={{ paddingBottom: "20px" }}
              isMandatory={config.isMandatory}
              options={localities.sort((a, b) => a.name.localeCompare(b.name))}
              selectedOption={selectedLocality}
              optionKey="i18nkey"
              onSelect={selectLocality}
              t={t}
              optionCardStyles={{ maxHeight: "210px", overflow: "scroll" }}
              //isDependent={true}
              labelKey=""
              disabled={isEdit}
            />
          </span>
        )}
      </FormStep>
    </React.Fragment>
  );
};

export default TLSelectAddress;
