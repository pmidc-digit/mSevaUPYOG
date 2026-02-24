import React, { Fragment, useState, useEffect } from "react";
import { Controller, useWatch } from "react-hook-form";
import { TextInput, SubmitBar, DatePicker, SearchField, Dropdown, Loader } from "@mseva/digit-ui-react-components";

const SearchFields = ({ register, control, reset, tenantId, t, previousPage }) => {
  let validation = {};
  const allCities = Digit.Hooks.tl.useTenants();
  //const cities = allCities.filter((city) => city.code === tenantId)
  const getCities = () => allCities?.filter((e) => e.code === Digit.ULBService.getCurrentTenantId()) || [];

  const { data: applicationTypes, isLoading: applicationTypesLoading } = Digit.Hooks.tl.useMDMS.applicationTypes(tenantId);

  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    getCities()[0]?.code,
    "admin",
    {
      enabled: !!getCities()[0],
    },
    t
  );

  const applicationType = useWatch({ control, name: "applicationType" });
  let businessServices = [];
  if (applicationType && applicationType?.code === "RENEWAL") businessServices = ["EDITRENEWAL", "DIRECTRENEWAL"];
  else if (applicationType && applicationType?.code === "NEW") businessServices = ["NewTL"];
  else businessServices = ["EDITRENEWAL", "DIRECTRENEWAL", "NewTL"];

  const { data: statusData, isLoading } = Digit.Hooks.useApplicationStatusGeneral({ businessServices, tenantId }, {});
  let applicationStatuses = [];


  statusData &&
    statusData?.otherRoleStates?.map((status) => {
      let found = applicationStatuses.length > 0 ? applicationStatuses?.some((el) => el?.code === status.applicationStatus) : false;
      if (!found) applicationStatuses.push({ code: status?.applicationStatus, i18nKey: `WF_NEWTL_${status?.applicationStatus}` });
    });

  statusData &&
    statusData?.userRoleStates?.map((status) => {
      let found = applicationStatuses.length > 0 ? applicationStatuses?.some((el) => el?.code === status.applicationStatus) : false;
      if (!found) applicationStatuses.push({ code: status?.applicationStatus, i18nKey: `WF_NEWTL_${status?.applicationStatus}` });
    });

  return (
    <>
      <SearchField>
        <label>{t("TL_HOME_SEARCH_RESULTS_APP_NO_LABEL")}</label>
        <TextInput name="applicationNumber" inputRef={register({})} placeholder={t("TL_HOME_SEARCH_RESULTS_APP_NO_PLACEHOLDER")} />
      </SearchField>
      {applicationTypesLoading ? (
        <Loader />
      ) : (
        <SearchField>
          <label>{t("TL_LOCALIZATION_APPLICATION_TYPE")}</label>
          <Controller
            control={control}
            name="applicationType"
            render={(props) => (
              <Dropdown
                selected={props.value}
                select={props.onChange}
                onBlur={props.onBlur}
                option={applicationTypes}
                optionKey="i18nKey"
                t={t}
                placeholder={t("TL_APPLICATION_TYPE_PLACEHOLDER")}
              />
            )}
          />
        </SearchField>
      )}
      <SearchField>
        <label>{t("TL_COMMON_FROM_DATE_LABEL")}</label>
        <Controller render={(props) => <DatePicker date={props.value} onChange={props.onChange} />} name="fromDate" control={control} />
      </SearchField>
      <SearchField>
        <label>{t("TL_COMMON_TO_DATE_LABEL")}</label>
        <Controller render={(props) => <DatePicker date={props.value} onChange={props.onChange} />} name="toDate" control={control} />
      </SearchField>
      <SearchField>
        <label>{t("TL_HOME_SEARCH_RESULTS_TL_NO_LABEL")}</label>
        <TextInput name="licenseNumbers" inputRef={register({})} placeholder={t("TL_HOME_SEARCH_RESULTS_TL_NO_PLACEHOLDER")} />
      </SearchField>
      <SearchField>
        <label>{t("TL_HOME_SEARCH_RESULTS_OWN_MOB_LABEL")}</label>
        <TextInput
          name="mobileNumber"
          inputRef={register({ pattern: { value: /^[6-9]\d{9}$/, message: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID") } })}
          type="mobileNumber"
          componentInFront={<div className="TL_HOME_SEARCH_RESULTS_OWN_MOB_PLACEHOLDER">+91</div>}
          maxlength={10}
          placeholder={t("TL_HOME_SEARCH_RESULTS_OWN_MOB_PLACEHOLDER")}
          maxLength={10}
          // {...(validation = {pattern: "[6-9]{1}[0-9]{9}",type: "tel",title: t("CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID"),})}
        />
      </SearchField>
      <SearchField>
        <label>{t("TL_LOCALIZATION_OWNER_NAME")}</label>
        <TextInput name="name" inputRef={register({})} placeholder={t("TL_REPORT_APPL_STATUS_PLACEHOLDER")} />
      </SearchField>
      {isLoading ? (
        <Loader />
      ) : (
        <SearchField>
          <label>{t("TL_HOME_SEARCH_RESULTS_APP_STATUS_LABEL")}</label>
          <Controller
            control={control}
            name="status"
            render={(props) => (
              <Dropdown
                selected={props.value}
                select={props.onChange}
                onBlur={props.onBlur}
                option={applicationStatuses}
                optionKey="i18nKey"
                t={t}
                placeholder={t("TL_HOME_SEARCH_RESULTS_APP_STATUS_PLACEHOLDER")}
              />
            )}
          />
        </SearchField>
      )}

      <SearchField>
        <label>{t("TL_HOME_SEARCH_RESULTS__LOCALITY")}</label>
        <Controller
          control={control}
          name="locality"
          render={(props) => (
            <Dropdown
              selected={props.value}
              select={props.onChange}
              onBlur={props.onBlur}
              option={fetchedLocalities}
              optionKey="i18nkey"
              t={t}
              placeholder={t("TL_HOME_SEARCH_RESULTS_LOCALITY__PLACEHOLDER")}
            />
          )}
        />
      </SearchField>

      {/* <SearchField>
        <label>{t("TL_LOCALIZATION_TRADE_NAME")}</label>
        <TextInput name="tradeName" inputRef={register({})} />
      </SearchField> */}
      <SearchField className="submit">
        <SubmitBar label={t("ES_COMMON_SEARCH")} submit />
        <p
          onClick={() => {
            reset({
              applicationType: "",
              fromDate: "",
              toDate: "",
              licenseNumbers: "",
              status: "",
              tradeName: "",
              offset: 0,
              limit: 10,
              sortBy: "commencementDate",
              sortOrder: "DESC",
              locality: "",
              mobileNumber: "",
              name: "",
            });
            previousPage();
          }}
        >
          {t(`ES_COMMON_NEW_CLEAR_ALL`)}
        </p>
      </SearchField>
    </>
  );
};
export default SearchFields;
