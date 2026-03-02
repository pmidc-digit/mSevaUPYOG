import React, { Fragment, useMemo } from "react";
import { CardLabelError, Dropdown, SearchField, TextInput } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { alphabeticalSortFunctionForTenantsBasedOnName } from "../../../../utils";

const SearchFormFieldsComponents = ({ registerRef, controlSearchForm, searchFormState }) => {
  const { t } = useTranslation();
  const ulbs = Digit.SessionStorage.get("ENGAGEMENT_TENANTS");
  const { data: cities, isLoading } = Digit.Hooks.useTenants();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  //const userInfo = Digit.SessionStorage.get("citizen.userRequestObject");

  const userInfo = Digit.UserService.getUser().info;
  let isTenantFound = true;
  let userUlbs = ulbs
    .filter((ulb) => userInfo?.roles?.some((role) => role?.tenantId === ulb?.code))
    .sort(alphabeticalSortFunctionForTenantsBasedOnName);

  console.log("userUlbs", userUlbs);
  if (userUlbs?.length === 0 || tenantId === "pb.punjab") {
    isTenantFound = false;
    //userUlbs=[{ i18nKey: `TENANT_TENANTS_${userInfo?.info?.tenantId.replace(".", "_").toUpperCase()}`,code:`${userInfo?.info.tenantId}`}]
    let adduserUlbs = { i18nKey: `TENANT_TENANTS_${userInfo?.tenantId.replace(".", "_").toUpperCase()}`, code: `${userInfo?.tenantId}` };
    if (tenantId === "pb.punjab") {
      userUlbs = [adduserUlbs, ...ulbs];
    } else {
      userUlbs = [adduserUlbs];
    }
  }
  const selectedTenat = useMemo(() => {
    if (userUlbs?.length > 0 && isTenantFound === true) {
      const filtered = ulbs.filter((item) => item.code === tenantId);
      return filtered;
    } else {
      const filtered = userUlbs.filter((item) => item.code === tenantId);
      return filtered;
    }
  }, [ulbs]);

  return (
    <>
      <SearchField>
        <label>
          {t("City")} <span style={{ color: "red" }}>*</span>
        </label>
        <Controller
          rules={{ required: t("REQUIRED_FIELD") }}
          defaultValue={selectedTenat?.[0]}
          render={(props) => <Dropdown option={userUlbs} optionKey={"i18nKey"} selected={props.value} select={(e) => props.onChange(e)} t={t} />}
          name={"tenantIds"}
          control={controlSearchForm}
        />
        <CardLabelError>{searchFormState?.errors?.["tenantIds"]?.message}</CardLabelError>
      </SearchField>
      <SearchField>
        <label>{t("CS_SURVEY_NAME")}</label>
        <TextInput
          name="title"
          type="text"
          inputRef={registerRef({
            maxLength: {
              value: 60,
              message: t("Survey Name should be less than 60 characters"), //t("EXCEEDS_60_CHAR_LIMIT"),
            },
          })}
        />
        <CardLabelError>{searchFormState?.errors?.["title"]?.message}</CardLabelError>
      </SearchField>
    </>
  );
};

export default SearchFormFieldsComponents;
