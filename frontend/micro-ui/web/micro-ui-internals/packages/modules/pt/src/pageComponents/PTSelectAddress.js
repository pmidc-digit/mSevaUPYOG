import { CardLabel, CardLabelError, Dropdown, FormStep, LabelFieldPair, RadioOrSelect } from "@mseva/digit-ui-react-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import Timeline from "../components/TLTimeline";

const PTSelectAddress = ({ t, config, onSelect, userType, formData, setError, clearErrors, formState }) => {
  const allCities = Digit.Hooks.pt.useTenants();
  let tenantId = Digit.ULBService.getCurrentTenantId();
  const { pathname } = useLocation();
  const presentInModifyApplication = pathname.includes("modify");
  const { control, formState: localFormState, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue } = useForm();
  const formValue = watch();
  const { errors } = localFormState;
  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };
  const [localityValue, setLocalityValue] = useState(formData?.address?.locality || "");
console.log("usertype",window.location.href.includes("employee"))
  let isEditProperty = formData?.isEditProperty || false;
  if (presentInModifyApplication) isEditProperty = true;
  if (formData?.isUpdateProperty) isEditProperty = true;
  const { pincode, city } = formData?.address || "";
  const cities =
    // userType === "employee"
    window.location.href.includes("employee")
      ? allCities.filter((city) => city.code === tenantId)
      : pincode
      ? allCities.filter((city) => city?.pincode?.some((pin) => pin == pincode))
      : allCities;

  const [selectedCity, setSelectedCity] = useState(() => {
    return formData?.address?.city || null;
  });

  let { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    selectedCity?.code,
    "revenue",
    {
      enabled: !!selectedCity,
    },
    t
  );
window.location.href.includes("citizen")?
   { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
   formValue.address?.city?.code,
    "revenue",
    {
      enabled: !!formValue.address,
    },
    t
   )
:null

 
    
  const [localities, setLocalities] = useState();

  const [selectedLocality, setSelectedLocality] = useState(formData?.address?.locality);

  useEffect(() => {
    if (window.location.href.includes("employee") && presentInModifyApplication && localities?.length) {
      console.log("coming here");
      
      const code = formData?.originalData?.address?.locality?.code;
      console.log("coming here code",code);
      const _locality = localities?.filter((e) => e.code === code)[0];
      console.log("coming here _locality",_locality);
      setValue("locality", _locality);
    }
  }, [localities]);


-

  useEffect(() => {
    if(formData?.address?.locality  && localities?.length){
    const code = formData?.address?.locality?.code;
    const localityValue = localities?.find((e) => e.code === code)
    setValue("locality", localityValue);
    }
    
  },[formData,localities,isEditProperty])
  

  useEffect(() => {
    if (cities) {
      if (cities.length === 1) {
        setSelectedCity(cities[0]);
      }
    }
    
  }, [cities]);

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
      setLocalities(() => (filteredLocalityList.length > 0 ? filteredLocalityList : __localityList));

      if (filteredLocalityList.length === 1) {
        setSelectedLocality(filteredLocalityList[0]);
        if (window.location.href.includes("employee")) {
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
    // if (formData?.address?.locality) {
    //   formData.address["locality"] = locality;
    // }
    setSelectedLocality(locality);
    if (window.location.href.includes("employee")) {
      onSelect(config.key, { ...formData[config.key], locality: locality });
    }
    
  console.log("Selected locality being saved:", locality);
  }

  function onSubmit() {
    onSelect(config.key, { city: selectedCity, locality: selectedLocality });
  }

 
//   useEffect(() => {
//     onSelect(config.key, selectedValue);
//   }, [selectedValue]);

//   const onChange = (e) => {
//     setSelectedValue(e);
//   }
  useEffect(() => {
    if (window.location.href.includes("employee")) {
      let keys = Object.keys(formValue);
      const part = {};
      keys.forEach((key) => (part[key] = formData[config.key]?.[key]));
      if (!_.isEqual(formValue, part)) onSelect(config.key, { ...formData[config.key], ...formValue });
      for (let key in formValue) {
        if (!formValue[key] && !localFormState?.errors[key]) {
          setLocalError(key, { type: `${key.toUpperCase()}_REQUIRED`, message: t(`CORE_COMMON_REQUIRED_ERRMSG`) });
        } else if (formValue[key] && localFormState.errors[key]) {
          clearLocalErrors([key]);
        }
      }
    }
  }, [formValue]);

  useEffect(() => {
    if (formValue.address?.city && fetchedLocalities) {
      let __localityList = fetchedLocalities;
      let filteredLocalityList = [];

      if (formData?.address?.locality) {
        setSelectedLocality(formData.address.locality);
      }

      if (formData?.address?.pincode) {
        filteredLocalityList = __localityList.filter((obj) => obj.pincode?.find((item) => item == formData.address.pincode));
        if (!formData?.address?.locality) setSelectedLocality();
      }
      setLocalities(() => (filteredLocalityList.length > 0 ? filteredLocalityList : __localityList));

      if (filteredLocalityList.length === 1) {
        setSelectedLocality(filteredLocalityList[0]);
        if (window.location.href.includes("employee")) {
          onSelect(config.key, { ...formData[config.key], locality: filteredLocalityList[0] });
        }
      }
    }
  }, [formValue.address, fetchedLocalities]);

  useEffect(() => {
    if (window.location.href.includes("employee")) {
      const errorsPresent = !!Object.keys(localFormState.errors).lengtha;
      if (errorsPresent && !formState.errors?.[config.key]) setError(config.key, { type: "required" });
      else if (!errorsPresent && formState.errors?.[config.key]) clearErrors(config.key);
    }
  }, [localFormState]);



  useEffect(() => {
    if (window.location.href.includes("citizen")) {
      let keys = Object.keys(formValue);
      const part = {};
      keys.forEach((key) => (part[key] = formData[config.key]?.[key]));
      if (!_.isEqual(formValue, part)) onSelect(config.key, { ...formData[config.key], ...formValue });
      for (let key in formValue) {
        if (!formValue[key] && !localFormState?.errors[key]) {
          setLocalError(key, { type: `${key.toUpperCase()}_REQUIRED`, message: t(`CORE_COMMON_REQUIRED_ERRMSG`) });
        } else if (formValue[key] && localFormState.errors[key]) {
          clearLocalErrors([key]);
        }
      }
    }
  }, [formValue]);

  useEffect(() => {
    if (window.location.href.includes("citizen")) {
      const errorsPresent = !!Object.keys(localFormState.errors).lengtha;
      if (errorsPresent && !formState.errors?.[config.key]) setError(config.key, { type: "required" });
      else if (!errorsPresent && formState.errors?.[config.key]) clearErrors(config.key);
    }
  }, [localFormState]);

  console.log("config",config)
  console.log("localFormState",localFormState)

  if (window.location.href.includes("employee")) {
    const disableCityDropdown=isEditProperty ? isEditProperty : cities?.length === 1;
    return (
      <div>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">
            {t("MYCITY_CODE_LABEL")} {config.isMandatory.city && <span style={{ color: 'red' }}>*</span>}
          </CardLabel>
          <Controller
            name={"city"}
            defaultValue={cities?.length === 1 ? cities[0] : selectedCity}
            control={control}
            rules={{
              required: config.isMandatory.city && t("City is required"),
            }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={props.value}
                disable={disableCityDropdown}
                option={cities}
                select={props.onChange}
                optionKey="i18nKey"
                onBlur={props.onBlur}
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.city ? errors?.city?.message : ""}</CardLabelError>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{t("PT_LOCALITY_LABEL")} {config.isMandatory.locality && <span style={{ color: 'red' }}>*</span>}</CardLabel>
          <Controller
            name="locality"
            defaultValue={selectedLocality}
            control={control}
            rules={{
              required: config.isMandatory.locality?t("Locality is required"):false,
            }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={props.value}
                option={localities}
                select={(e) => {
                  props.onChange(e);
                  selectLocality(e); // to keep your external state also in sync
                }}
                // select={props.onChange}
                onBlur={props.onBlur}
                optionKey="i18nkey"
                t={t}
                disable={isEditProperty ? isEditProperty : false}
                isRequired={true}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.locality ? errors?.locality?.message : ""}</CardLabelError>
      </div>
    );
  }
  if (window.location.href.includes("citizen")) {
    
    return (
      <div>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">
            {t("MYCITY_CODE_LABEL")} {config.isMandatory && <span style={{ color: 'red' }}>*</span>}
          </CardLabel>
          <Controller
            name={"city"}
            defaultValue={cities?.length === 1 ? cities[0] : selectedCity}
            control={control}
            rules={{
              required: config.isMandatory && t("City is required"),
            }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={props.value}
                disable={false}
                option={cities}
                select={props.onChange}
                optionKey="i18nKey"
                onBlur={props.onBlur}
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.errors.city ? errors?.city?.message : ""}</CardLabelError>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{t("PT_LOCALITY_LABEL")} {config.isMandatory && <span style={{ color: 'red' }}>*</span>}</CardLabel>
          <Controller
            name="locality"
            defaultValue={selectedLocality}
            control={control}
            rules={{
              required: config.isMandatory?t("Locality is required"):false,
            }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={props.value}
                option={localities}
                select={(e) => {
                  props.onChange(e);
                  selectLocality(e); // to keep your external state also in sync
                }}
                // select={props.onChange}
                onBlur={props.onBlur}
                optionKey="i18nkey"
                t={t}
                disable={false}
                isRequired={true}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.errors.locality ? errors?.locality?.message : ""}</CardLabelError>
      </div>
    );
  }
  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? (
        window.location.href.includes("/citizen/pt/property/property-mutation") ? (
          <Timeline currentStep={1} flow="PT_MUTATE" />
        ) : (
          <Timeline currentStep={1} />
        )
      ) : null}
      <FormStep config={config} onSelect={onSubmit} t={t} isDisabled={selectedLocality ? false : true}>
        <div>
          <CardLabel>{`${t("MYCITY_CODE_LABEL")} `}</CardLabel>
          <span className={"form-pt-dropdown-only"}>
            <RadioOrSelect
              options={cities.sort((a, b) => a.name.localeCompare(b.name))}
              selectedOption={selectedCity}
              optionKey="i18nKey"
              onSelect={selectCity}
              t={t}
              isPTFlow={true}
              //isDependent={true}
              //labelKey="TENANT_TENANTS"
              disabled={isEditProperty}
            />
          </span>
          {selectedCity && localities && <CardLabel>{`${t("PT_LOCALITY_LABEL")} `}</CardLabel>}
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
                //isDependent={true}
                labelKey=""
                disabled={isEditProperty}
              />
            </span>
          )}
        </div>
      </FormStep>
    </React.Fragment>
  );
};

export default PTSelectAddress;

