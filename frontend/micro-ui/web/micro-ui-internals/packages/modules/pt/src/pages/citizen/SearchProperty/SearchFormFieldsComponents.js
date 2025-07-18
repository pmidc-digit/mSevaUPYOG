import React, { Fragment } from "react";
import { CardLabelError, SearchField, TextInput, MobileNumber ,Dropdown} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
const SearchFormFieldsComponents = ({ registerRef, searchFormState,controlSearchForm  }) => {
  const { t } = useTranslation();
  const allCities = Digit.Hooks.pt.useTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey));
  const propsForMobileNumber = {
    maxlength: 10,
    pattern: "[6-9][0-9]{9}",
    title: t("ES_SEARCH_APPLICATION_MOBILE_INVALID"),
    componentInFront: "+91",
  };
  let validation = {}
  return (
    <>
   <SearchField>
        <label>{t("City")} <span style={{ color: "red" }}>*</span></label>
        <Controller
          rules={{ required: t("REQUIRED_FIELD") }}
          
          render={(props) => 
          <Dropdown option={allCities} optionKey={"i18nKey"}
           selected={props.value} 
           select={(d) => {
            Digit.LocalizationService.getLocale({
              modules: [`rainmaker-${props?.value?.code}`],
              locale: Digit.StoreData.getCurrentLanguage(),
              tenantId: `${props?.value?.code}`,
            });
            if (d.code !== cityCode) props.setValue("locality", null);
            props.onChange(d);
          }}
          />}
          name={"tenantIds"}
          control={controlSearchForm}
        />
        <CardLabelError>{searchFormState?.errors?.["tenantIds"]?.message}</CardLabelError>
      </SearchField>
   
      <SearchField className="wns-search-field">
        <label>{t("CORE_COMMON_MOBILE_NUMBER")}</label>
        <MobileNumber name="mobileNumber" type="number" inputRef={registerRef({})} {...propsForMobileNumber} />
        {searchFormState?.errors?.["mobileNumber"]?.message ? (
          <CardLabelError>{searchFormState?.errors?.["mobileNumber"]?.message}</CardLabelError>
        ) : null}
      </SearchField>
  
    </>
  );
};

export default SearchFormFieldsComponents;
