import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Controller, useFormContext } from "react-hook-form";
import { EditIcon, RadioButtons, SearchField } from "@mseva/digit-ui-react-components";

const useCategoryInboxMobileCardsData = ({ parentRoute, table, setShowToast }) => {
  const { t } = useTranslation();

  /**
   * Todo : after creating surveys details page handle serviceRequestIdKey
   */

  const MobileSortFormValues = () => {
    const sortOrderOptions = [
      {
        code: "DESC",
        i18nKey: "ES_COMMON_SORT_BY_DESC",
      },
      {
        code: "ASC",
        i18nKey: "ES_COMMON_SORT_BY_ASC",
      },
    ];
    const { control: controlSortForm } = useFormContext();
    return (
      <SearchField>
        <Controller
          name="sortOrder"
          control={controlSortForm}
          render={({ onChange, value }) => (
            <RadioButtons
              onSelect={(e) => {
                onChange(e.code);
              }}
              selectedOption={sortOrderOptions.filter((option) => option.code === value)[0]}
              optionsKey="i18nKey"
              name="sortOrder"
              options={sortOrderOptions}
            />
          )}
        />
      </SearchField>
    );
  };

  const handleUpdateCategoryConfirm = (row) => {
    console.log("Current row: ", row);
    const currentStatus = row?.isActive;
    setShowToast({
      label: `Are you sure you want to change the category status of "${row?.label}" from ${currentStatus} to ${!currentStatus}? Please confirm.`,
      isDeleteBtn: true,
      warning: true,
      isWarningButtons: true,
      rowData: row,
    });
  };

  const dataForMobileInboxCards = table?.map((item) => {
    const { label, isActive, auditDetails } = item;
    return {
      [t("Category")]: label,
      [t("Is Category Active")]: isActive === true ? "Yes" : isActive === false ? "No" : "",
      [t("Created On")]: auditDetails?.createdTime ? format(new Date(auditDetails?.createdTime), "dd/MM/yyyy") : "",
      [t("Last Updated On")]: auditDetails?.lastModifiedTime ? format(new Date(auditDetails?.lastModifiedTime), "dd/MM/yyyy") : "",
      [t("Update Category Status")]: (
        <label onClick={() => handleUpdateCategoryConfirm(item)}>
          <EditIcon className="table-cell-for-update" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
        </label>
      ),
    };
  });

  return {
    data: dataForMobileInboxCards,
    //linkPrefix: `${parentRoute}/search-categories/`, // Edit functionality not working if uncommented
    //serviceRequestIdKey: t("TL_COMMON_TABLE_COL_APP_NO"),
    MobileSortFormValues,
  };
};

export default useCategoryInboxMobileCardsData;
