import React, { Fragment, useEffect, useMemo, useState } from "react";
import { CardLabelError, Dropdown, Loader, SearchField, TextInput } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { alphabeticalSortFunctionForTenantsBasedOnName } from "../../../../utils";

const SearchQuestionsFieldsComponents = ({ registerRef, controlSearchForm, searchFormState }) => {
  const { t } = useTranslation();
  const ulbs = Digit.SessionStorage.get("ENGAGEMENT_TENANTS");
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userInfo = Digit.UserService.getUser().info;
  // const userUlbs = ulbs
  //   .filter((ulb) => userInfo?.info?.roles?.some((role) => role?.tenantId === ulb?.code))
  //   .sort(alphabeticalSortFunctionForTenantsBasedOnName);
  // const selectedTenat = useMemo(() => {
  //   const filtered = ulbs.filter((item) => item.code === tenantId);
  //   return filtered;
  // }, [ulbs]);

  let isTenantFound = true;
  let userUlbs = ulbs
    .filter((ulb) => userInfo?.info?.roles?.some((role) => role?.tenantId === ulb?.code))
    .sort(alphabeticalSortFunctionForTenantsBasedOnName);
  if (userUlbs?.length === 0) {
    //   isTenantFound = false;
    //  userUlbs=[{ i18nKey: `TENANT_TENANTS_${userInfo?.info?.tenantId.replace(".", "_").toUpperCase()}`,code:`${userInfo?.info.tenantId}`}]
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
  //   const isActiveOptions = [
  //     { id: false, name: "False" },
  //     { id: true, name: "True" },
  //   ];

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

  // Options for the question dropdown
  // const categoryName = controlSearchForm.getValues("categoryName");
  // const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  // const [questionOptions, setQuestionOptions] = useState([]);
  // useEffect(() => {
  //   const categoryId = categoryName?.value;
  //   if (tenantId && categoryId) {
  //     fetchQuestions(categoryId);
  //   }
  // }, [tenantId, categoryName]);

  // function fetchQuestions(categoryId) {
  //   setIsQuestionsLoading(true);
  //   const payload = { tenantId: tenantId, categoryId: categoryId };
  //   Digit.Surveys.searchQuestions(payload)
  //     .then((response) => {
  //       //console.log("Question Options: ", response);
  //       const questionOptions =
  //         response?.Questions?.map((item) => {
  //           return { name: t(item.questionStatement), i18Key: item.questionStatement, value: item.uuid };
  //         }) ?? [];
  //       setQuestionOptions(questionOptions);
  //       setIsQuestionsLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Failed to fetch questions:", error);
  //       setIsQuestionsLoading(false);
  //     });
  // }

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
        <label>
          {t("Category")} <span style={{ color: "red" }}>*</span>
        </label>
        <Controller
          rules={{ required: t("REQUIRED_FIELD") }}
          render={(props) => <Dropdown option={categoryOptions} optionKey={"name"} selected={props.value} select={(e) => props.onChange(e)} t={t} />}
          name={"categoryName"}
          control={controlSearchForm}
        />
        <CardLabelError>{searchFormState?.errors?.["categoryName"]?.message}</CardLabelError>
      </SearchField>

      <SearchField>
        <label>
          {t("Question")}
          {/* <span style={{ color: "red" }}>*</span> */}
        </label>
        <Controller
          //rules={{ required: t("REQUIRED_FIELD") }}
          render={(props) => <TextInput name="questionStatement" type="text" value={props.value} onChange={(e) => props.onChange(e)} />}
          name={"questionStatement"}
          control={controlSearchForm}
        />
        <CardLabelError>{searchFormState?.errors?.["questionStatement"]?.message}</CardLabelError>
      </SearchField>

      {/* <SearchField>
        <label>{t("Question")}</label>
        {isQuestionsLoading ? (
          <Loader />
        ) : (
          <>
            <Controller
              rules={{ required: false }}
              render={(props) => (
                <Dropdown option={questionOptions} optionKey={"name"} selected={props.value} select={(e) => props.onChange(e)} t={t} />
              )}
              name={"question"}
              control={controlSearchForm}
            />
            <CardLabelError>{searchFormState?.errors?.["question"]?.message}</CardLabelError>
          </>
        )}
      </SearchField> */}

      {/* <SearchField>
        <label>{t("Is Active")}</label>
        <Controller
          rules={{ required: true }}
          render={(props) => <Dropdown option={isActiveOptions} optionKey={"name"} selected={props.value} select={(e) => props.onChange(e)} t={t} />}
          name={"isActive"}
          control={controlSearchForm}
        />
        <CardLabelError>{searchFormState?.errors?.["isActive"]?.message}</CardLabelError>
      </SearchField> */}
    </>
  );
};

export default SearchQuestionsFieldsComponents;
