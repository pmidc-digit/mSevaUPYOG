import React, { useMemo, Fragment, useState, useEffect } from "react";
import { CardLabelError, Dropdown, SearchField, TextInput } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { alphabeticalSortFunctionForTenantsBasedOnName } from "../../../../utils";

const SearchCategoryFieldsComponents = ({ registerRef, controlSearchForm, searchFormState }) => {
  const { t } = useTranslation();
  const ulbs = Digit.SessionStorage.get("ENGAGEMENT_TENANTS");
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userInfo = Digit.UserService.getUser().info;
  let isTenantFound = true;
  let userUlbs = ulbs
    .filter((ulb) => userInfo?.roles?.some((role) => role?.tenantId === ulb?.code))
    .sort(alphabeticalSortFunctionForTenantsBasedOnName);
  if (userUlbs?.length === 0 || tenantId === "pb.punjab") {
    isTenantFound = false;
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

  // Options for the category dropdown
  const [categoryOptions, setCategoryOptions] = useState([]);
  useEffect(() => {
    fetchCategories();
  }, [tenantId]);

  function fetchCategories() {
    const payload = { tenantId: tenantId };
    Digit.Surveys.searchCategory(payload)
      .then((response) => {
        const categoryOptions =
          response && response.Categories
            ? response.Categories.map(function (item) {
                return { name: t(item.label), i18Key: item.label, value: item.id };
              })
            : [];
        setCategoryOptions(categoryOptions);
      })
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
      });
  }

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
        <label>{t("Category")}</label>
        <Controller
          rules={{ required: false }}
          render={(props) => (
            <Dropdown option={categoryOptions} optionKey={"i18Key"} selected={props.value} select={(e) => props.onChange(e)} t={t} />
          )}
          name={"categoryName"}
          control={controlSearchForm}
        />
      </SearchField>
    </>
  );
};

export default SearchCategoryFieldsComponents;
