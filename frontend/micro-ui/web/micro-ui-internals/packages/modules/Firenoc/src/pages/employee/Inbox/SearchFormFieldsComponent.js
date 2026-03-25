import React from "react";
import { SearchField, TextInput, DatePicker, Dropdown } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";

const fieldStyle = { width: "calc(33% - 16px)" };

const SearchFormFieldsComponents = ({ registerRef, searchFormState, searchFieldComponents, controlSearchForm, statuses }) => {
  const { t } = useTranslation();

  const statusOptions = (statuses || []).map((s) => ({
    code: s.applicationstatus,
    name: t(s.applicationstatus),
  }));

  return (
    <React.Fragment>
      <SearchField>
        <label>{t("NOC_APPLICATION_NUMBER")}</label>
        <TextInput name="applicationNo" inputRef={registerRef({})} placeholder={t("NOC_APPLICATION_NUMBER_PLACEHOLDER")} />
      </SearchField>
      <SearchField>
        <label>{t("FIRENOC_FIRE_NOC_NUMBER")}</label>
        <TextInput name="fireNOCNumber" inputRef={registerRef({})} placeholder={t("FIRENOC_FIRE_NOC_NUMBER_PLACEHOLDER")} />
      </SearchField>
      <SearchField>
        <label>{t("NOC_APPLICANT_MOBILE_NO_LABEL")}</label>
        <TextInput
          name="mobileNumber"
          inputRef={registerRef({})}
          type="mobileNumber"
          componentInFront={<div className="employee-card-input-front">+91</div>}
          maxLength={10}
          placeholder={t("NOC_MOBILE_NUMBER_PLACEHOLDER")}
        />
      </SearchField>
      <SearchField>
        <label>{t("FIRENOC_FROM_DATE")}</label>
        <Controller
          name="fromDate"
          control={controlSearchForm}
          render={(props) => (
            <DatePicker date={props.value} onChange={(d) => props.onChange(d)} />
          )}
        />
      </SearchField>
      <SearchField>
        <label>{t("FIRENOC_TO_DATE")}</label>
        <Controller
          name="toDate"
          control={controlSearchForm}
          render={(props) => (
            <DatePicker date={props.value} onChange={(d) => props.onChange(d)} />
          )}
        />
      </SearchField>
      <SearchField className="submit">
        {searchFieldComponents}
      </SearchField>
    </React.Fragment>
  );
};

export default SearchFormFieldsComponents;