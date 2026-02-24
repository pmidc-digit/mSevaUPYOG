import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Controller, useFormContext } from "react-hook-form";
import { EditIcon, RadioButtons, SearchField } from "@mseva/digit-ui-react-components";

const useQuestionsInboxMobileCardsData = ({ parentRoute, table, setShowToast }) => {
  const { t } = useTranslation();

  /**
   * Todo : after creating surveys details page handle serviceRequestIdKey
   */
  const GetStatusCell = (value) => <span className={value === "ACTIVE" ? "sla-cell-success" : "sla-cell-error"}>{value}</span>;

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

  const handleUpdateQuestionConfirm = (row) => {
    //console.log("Current row: ", row);
    const currentStatus = row?.status;
    const updatedStatus = currentStatus === "ACTIVE" ? "INACTIVE" : currentStatus === "INACTIVE" ? "ACTIVE" : "";

    setShowToast({
      label: `Are you sure you want to change the question status from ${currentStatus} to ${updatedStatus}? Please confirm.`,
      isDeleteBtn: true,
      warning: true,
      isWarningButtons: true,
      rowData: row,
      updatedStatus: updatedStatus,
    });
  };

  const dataForMobileInboxCards = table?.map((item) => {
    return {
      [t("Question")]: item.questionStatement,
      [t("Status")]: GetStatusCell(item.status),
      [t("Question Type")]: item.type,
      // [t("Is Question Required")]: item.required.toString(),
      [t("Category")]: item.category.label,
      [t("Created On")]: item.auditDetails.createdTime ? format(new Date(item.auditDetails.createdTime), "dd/MM/yyyy") : "",
      [t("Last Updated On")]: item.auditDetails.lastModifiedTime ? format(new Date(item.auditDetails.lastModifiedTime), "dd/MM/yyyy") : "",
      [t("Update Question Status")]: (
        <label onClick={() => handleUpdateQuestionConfirm(item)}>
          <EditIcon className="table-cell-for-update" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
        </label>
      ),
    };
  });

  return {
    data: dataForMobileInboxCards,
    //linkPrefix: `${parentRoute}/search-questions/`, // Edit functionality not working if uncommented
    //serviceRequestIdKey: t("TL_COMMON_TABLE_COL_APP_NO")
    MobileSortFormValues,
  };
};

export default useQuestionsInboxMobileCardsData;
