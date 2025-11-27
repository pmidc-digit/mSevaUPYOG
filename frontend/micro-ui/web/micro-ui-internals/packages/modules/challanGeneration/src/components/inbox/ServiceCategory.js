import React, { useState, useMemo, useEffect } from "react";
import { Loader, MultiSelectDropdown, RemoveableTag } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import ServiceCategoryCount from "./ServiceCategoryCount";

const ServiceCategory = ({
  onAssignmentChange,
  searchParams,
  selectedCategory,
  setSearchParams,
  setselectedCategories,
  businessServices,
  clearCheck,
  setclearCheck,
}) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const [moreStatus, showMoreStatus] = useState(false);
  const { data: Menu, isLoading } = Digit.Hooks.mcollect.useMCollectMDMS(
    stateId,
    "BillingService",
    "BusinessService",
    "[?(@.type=='Adhoc' && @.isActive==true)]"
  );
  const { data: OffenceTypeData, isLoading: OffenceTypeLoading } = Digit.Hooks.useCustomMDMS(tenantId, "Challan", [{ name: "OffenceType" }]);

  console.log("OffenceTypeData===", OffenceTypeData);
  console.log("Menu====", Menu);

  let newMenu = [];
  const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
    if (searcher == "") return str;
    while (str.includes(searcher)) {
      str = str.replace(searcher, replaceWith);
    }
    return str;
  };

  OffenceTypeData?.Challan?.OffenceType &&
    OffenceTypeData?.Challan?.OffenceType?.map((ob) => {
      newMenu.push({ ...ob, i18nKey: ob.name });
    });

  // const onRemove = (category) => {
  //   console.log("newbussinessService", newbussinessService);
  //   console.log("category", category);
  //   let newbussinessService = searchParams?.businessService.filter((ob) => ob !== category.code);
  //   let newCategories = [];

  //   newbussinessService?.map((bs) => {
  //     newCategories.push({ code: bs, i18nKey: `BILLINGSERVICE_BUSINESSSERVICE_${stringReplaceAll(bs, ".", "_").toUpperCase()}` });
  //   });
  //   setSearchParams({ ...searchParams, businessService: [...newbussinessService] });
  //   setselectedCategories([...newCategories]);
  // };

  const onRemove = (category) => {
    console.log("category", category);
    console.log("searchParams", searchParams);
    console.log("selectedCategory", selectedCategory);
    const newBusinessService = searchParams?.businessService?.filter((code) => code !== category.i18nKey);
    const newCategories = selectedCategory?.filter((item) => item.i18nKey !== category.i18nKey);

    console.log("newBusinessService", newBusinessService);
    console.log("newCategories", newCategories);
    setSearchParams({ ...searchParams, businessService: newBusinessService });
    setselectedCategories(newCategories);
  };

  let menuFirst = [];
  let meuSecond = [];
  Menu?.map((option, index) => {
    if (index < 5) menuFirst.push(option);
    else meuSecond.push(option);
  });

  // translateState(option)
  return (
    <div className="status-container">
      <div className="filter-label" style={{ fontWeight: "normal" }}>
        {t("CHALLAN_OFFENCE_TYPE")}
      </div>
      <MultiSelectDropdown
        className="form-field"
        isMandatory={true}
        defaultUnit="Selected"
        selected={selectedCategory}
        options={newMenu}
        // onSelect={onAssignmentChange}
        onSelect={(selectedItems) => {
          const filterParam = selectedItems?.map((item) => item?.[1]?.i18nKey);
          console.log("selectedItems", selectedItems);

          const selectedCategory = selectedItems?.map((item) => ({
            code: item?.[1]?.id,
            i18nKey: item?.[1]?.i18nKey,
          }));

          console.log("selectedCategory", selectedCategory);
          // console.log("selectedItems", selectedItems);

          // Update parent states
          setSearchParams({ ...searchParams, businessService: filterParam });
          setselectedCategories(selectedCategory);
        }}
        optionsKey="i18nKey"
        t={t}
        ServerStyle={{ width: "100%", overflowY: "scroll", overflowX: "hidden" }}
      />
      <div className="tag-container">
        {selectedCategory?.map((value, index) => (
          <div>
            <RemoveableTag key={index} text={`${t(value["i18nKey"])}`} onClick={() => onRemove(value)} />
          </div>
        ))}
      </div>

      {/* {menuFirst?.map((option, index) => {
        return (
          <ServiceCategoryCount
            clearCheck={clearCheck}
            setclearCheck={setclearCheck}
            key={index}
            onAssignmentChange={onAssignmentChange}
            status={{ name: translateState(option), code: option.code }}
            searchParams={searchParams}
          />
        );
      })}
      {moreStatus &&
        meuSecond?.map((option, index) => {
          return (
            <ServiceCategoryCount
              clearCheck={clearCheck}
              setclearCheck={setclearCheck}
              key={index}
              onAssignmentChange={onAssignmentChange}
              status={{ name: translateState(option), code: option.code }}
              searchParams={searchParams}
            />
          );
        })}
      <div className="filter-button" onClick={() => showMoreStatus(!moreStatus)}>
        {" "}
        {moreStatus ? t("UC_LESS_LABEL") : t("UC_MORE_LABEL")}{" "}
      </div>  */}
    </div>
  );
};

export default ServiceCategory;
