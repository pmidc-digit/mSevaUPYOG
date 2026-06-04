import React, { Fragment } from "react";
import { TextInput, SubmitBar, DatePicker, SearchField, Dropdown, CardLabelError, MobileNumber, CardHeader } from "@mseva/digit-ui-react-components";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { businessServiceList } from "../../../utils";


const statusOptions = [
  { code: "INITIATED", i18nKey: "INITIATED" },
  { code: "APPLIED", i18nKey: "APPLIED" },
  { code: "APPROVED", i18nKey: "APPROVED" },
  { code: "PENDINGPAYMENT", i18nKey: "PENDINGPAYMENT" },
  { code: "PENDINGAPPROVAL", i18nKey: "PENDINGAPPROVAL" },
  { code: "REJECTED", i18nKey: "REJECTED" },
  { code: "CANCELLED", i18nKey: "CANCELLED" },
  { code: "CITIZENACTIONREQUIRED", i18nKey: "CITIZENACTIONREQUIRED" },
];

const areaTypeOptions = [
  { code: "Urban", i18nKey: "Urban" },
  { code: "Rural", i18nKey: "Rural" },
];

const nocTypeOptions = [
  { code: "NEW", i18nKey: "New" },
  { code: "RENEWAL", i18nKey: "Renewal" },
];

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
        <label>{t("NOC_FIRENOC_NO_LABEL")}</label>
        <TextInput name="fireNOCNumber" inputRef={register({})} />
      </SearchField>
      
      <SearchField>
        <label>{t("NOC_APPLICANT_MOBILE_NO_LABEL")}</label>
        <TextInput
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

      <SearchField>
        <label>{t("NOC_APPLICATION_STATUS")}</label>
        <Controller
          control={control}
          name="status"
          render={(props) => (
            <Dropdown
              selected={props.value}
              select={props.onChange}
              onBlur={props.onBlur}
              option={statusOptions}
              optionKey="i18nKey"
              t={t}
              placeholder={t("NOC_SELECT_STATUS_PLACEHOLDER")}
            />
          )}
        />
      </SearchField>

      <SearchField>
        <label>{t("NOC_FROM_DATE_LABEL")}</label>
        <Controller
          render={(props) => <DatePicker date={props.value} onChange={props.onChange} />}
          name="fromDate"
          control={control}
        />
      </SearchField>

      <SearchField>
        <label>{t("NOC_TO_DATE_LABEL")}</label>
        <Controller
          render={(props) => <DatePicker date={props.value} onChange={props.onChange} />}
          name="toDate"
          control={control}
        />
      </SearchField>

      <SearchField>
        <label>{t("NOC_AREA_TYPE")}</label>
        <Controller
          control={control}
          name="areaType"
          render={(props) => (
            <Dropdown
              selected={props.value}
              select={props.onChange}
              onBlur={props.onBlur}
              option={areaTypeOptions}
              optionKey="i18nKey"
              t={t}
              placeholder={t("NOC_SELECT_AREA_TYPE_PLACEHOLDER")}
            />
          )}
        />
      </SearchField>

      <SearchField>
        <label>{t("NOC_TYPE")}</label>
        <Controller
          control={control}
          name="fireNOCType"
          render={(props) => (
            <Dropdown
              selected={props.value}
              select={props.onChange}
              onBlur={props.onBlur}
              option={nocTypeOptions}
              optionKey="i18nKey"
              t={t}
              placeholder={t("NOC_SELECT_NOC_TYPE_PLACEHOLDER")}
            />
          )}
        />
      </SearchField>

      <SearchField className="submit">
        <SubmitBar label={t("ES_COMMON_SEARCH")} submit />
        <p
          style={{ marginTop: "24px" }}
          onClick={() => {
            reset({
              applicationNo: "",
              mobileNumber: "",
              fireNOCNumber: "",
              status: "",
              fromDate: "",
              toDate: "",
              areaType: "",
              fireNOCType: "",
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
