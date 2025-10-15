import React, { Fragment } from "react";
import { TextInput, SubmitBar, DatePicker, SearchField, Dropdown, CardLabelError, MobileNumber, CardHeader } from "@mseva/digit-ui-react-components";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { businessServiceList } from "../../../utils";


const SearchFormFieldsComponent = (props) => {
  const { register, control, setValue, getValues, reset, formState, trigger  } = useFormContext()
  const { t } = useTranslation();
  const user = Digit.UserService.getUser().info;

  function previousPage() {
    setValue("offset", getValues("offset") - getValues("limit"));
    props?.onSubmit({
      offset: 0,
      limit: 10,
      sortBy: "createdTime",
      sortOrder: "DESC",
      mobileNumber: user?.mobileNumber
    }, true);
    props?.isMobileView ? props.closeMobilePopupModal() : null;
  }
  
  
  return (
    <>
      <SearchField>
        <label>{t("NOC_APPLICATION_NUMBER")}</label>
        <TextInput name="applicationNo" inputRef={register({})} />
      </SearchField>
      
      <SearchField>
        <label>{t("NOC_APPLICANT_MOBILE_NO_LABEL")}</label>
        <MobileNumber
          name="mobileNumber"
          inputRef={register({
            minLength: {
              value: 10,
              message: t("CORE_COMMON_MOBILE_ERROR"),
            },
            maxLength: {
              value: 10,
              message: t("CORE_COMMON_MOBILE_ERROR"),
            },
            pattern: {
              value: /[6789][0-9]{9}/,
              //type: "tel",
              message: t("CORE_COMMON_MOBILE_ERROR"),
            },
          })}
          type="number"
          componentInFront={<div className="employee-card-input employee-card-input--front">+91</div>}
          //maxlength={10}
        />
        <CardLabelError>{formState?.errors?.["mobileNumber"]?.message}</CardLabelError>
      </SearchField>

      <SearchField className="submit">
        <SubmitBar label={t("ES_COMMON_SEARCH")} submit />
        <p
          style={{ marginTop: "24px" }}
          onClick={() => {
            reset({
              applicationNo: "",
              mobileNumber: "",
              offset: 0,
              limit: 10,
              sortBy: "createdTime",
              sortOrder: "DESC",
              isSubmitSuccessful:"false",
            });
           previousPage();
          }}
        >
          {t(`ES_COMMON_CLEAR_ALL`)}
        </p>
      </SearchField>
    </>
  );
};

export default SearchFormFieldsComponent;
