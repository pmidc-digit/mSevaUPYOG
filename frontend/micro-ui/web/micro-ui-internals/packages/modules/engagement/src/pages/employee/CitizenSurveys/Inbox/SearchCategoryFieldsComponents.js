import React, { useMemo, Fragment, useState, useEffect } from "react";
import { CardLabelError, Dropdown, SearchField, TextInput } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { alphabeticalSortFunctionForTenantsBasedOnName } from "../../../../utils";

const SearchCategoryFieldsComponents = ({ registerRef, controlSearchForm, searchFormState }) => {
  const { t } = useTranslation();
  const ulbs = Digit.SessionStorage.get("ENGAGEMENT_TENANTS");
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userInfo = Digit.SessionStorage.get("citizen.userRequestObject");
  const userUlbs = ulbs
    .filter((ulb) => userInfo?.info?.roles?.some((role) => role?.tenantId === ulb?.code))
    .sort(alphabeticalSortFunctionForTenantsBasedOnName);
  const selectedTenat = useMemo(() => {
    const filtered = ulbs.filter((item) => item.code === tenantId);
    return filtered;
  }, [ulbs]);

  // const isActiveOptions = [
  //   { id: true, name: "Yes" },
  //   { id: false, name: "No" },
  // ];

  // Options for the category dropdown
  const [categoryOptions, setCategoryOptions] = useState([]);
  useEffect(() => {
    fetchCategories();
  }, [tenantId]);

  function fetchCategories() {
    const payload = { tenantId: tenantId };
    Digit.Surveys.searchCategory(payload)
      .then((response) => {
        //console.log("Category Options: ", response);
        const categoryOptions =
          response?.Categories?.map((item) => {
            return { name: t(item.label), i18Key: item.label, value: item.id };
          }) ?? [];
        setCategoryOptions(categoryOptions);
      })
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
      });
  }

  return (
    <>
      <SearchField>
        <label>{t("LABEL_FOR_ULB")}</label>
        <Controller
          rules={{ required: true }}
          defaultValue={selectedTenat?.[0]}
          render={(props) => <Dropdown option={userUlbs} optionKey={"i18nKey"} selected={props.value} select={(e) => props.onChange(e)} t={t} />}
          name={"tenantIds"}
          control={controlSearchForm}
        />
      </SearchField>

      <SearchField>
        <label>{t("Category Name")}</label>
        <Controller
          rules={{ required: false }}
          render={(props) => (
            <Dropdown option={categoryOptions} optionKey={"i18Key"} selected={props.value} select={(e) => props.onChange(e)} t={t} />
          )}
          name={"categoryName"}
          control={controlSearchForm}
        />
        <CardLabelError>{searchFormState?.errors?.["categoryName"]?.message}</CardLabelError>
      </SearchField>

      {/* <SearchField>
        <label>{t("Is Active")}</label>
        <Controller
          rules={{ required: false }}
          render={(props) => <Dropdown option={isActiveOptions} optionKey={"name"} selected={props.value} select={(e) => props.onChange(e)} t={t} />}
          name={"isActive"}
          control={controlSearchForm}
        />
        <CardLabelError>{searchFormState?.errors?.["isActive"]?.message}</CardLabelError>
      </SearchField> */}
    </>
  );
};

export default SearchCategoryFieldsComponents;
