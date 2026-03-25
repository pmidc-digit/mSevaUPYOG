import React,{Fragment} from "react";
import { FilterFormField, Dropdown } from "@mseva/digit-ui-react-components";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

const FilterFormFieldsComponent = ({
  registerRef,
  controlFilterForm,
  setFilterFormValue,
  filterFormState,
  getFilterFormValue,
}) => {
  const { t } = useTranslation();

  const areaTypeOptions = [
    { code: "RURAL", name: t("FIRENOC_AREA_RURAL") },
    { code: "URBAN", name: t("FIRENOC_AREA_URBAN") },
  ];

  const nocTypeOptions = [
    { code: "NEW", name: t("FIRENOC_NOC_TYPE_NEW") },
    { code: "PROVISIONAL", name: t("FIRENOC_NOC_TYPE_PROVISIONAL") },
    { code: "RENEWAL", name: t("FIRENOC_NOC_TYPE_RENEWAL") },
  ];

  return (
    <>
      <FilterFormField>
        <div className="filter-label">{t("FIRENOC_AREA_TYPE")}</div>
        <Controller
          name="areaType"
          control={controlFilterForm}
          render={(props) => (
            <Dropdown
              option={areaTypeOptions}
              selected={props.value}
              optionKey="name"
              select={(val) => props.onChange(val)}
              t={t}
              placeholder={t("FIRENOC_AREA_TYPE")}
            />
          )}
        />
      </FilterFormField>

      <FilterFormField>
        <div className="filter-label">{t("FIRENOC_NOC_TYPE")}</div>
        <Controller
          name="nocType"
          control={controlFilterForm}
          render={(props) => (
            <Dropdown
              option={nocTypeOptions}
              selected={props.value}
              optionKey="name"
              select={(val) => props.onChange(val)}
              t={t}
              placeholder={t("FIRENOC_NOC_TYPE")}
            />
          )}
        />
      </FilterFormField>
    </>
  );
};

export default FilterFormFieldsComponent;
