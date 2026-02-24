import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Controller, useFormContext } from "react-hook-form";
import { EditIcon, RadioButtons, SearchField } from "@mseva/digit-ui-react-components";

const useInboxMobileCardsData = ({ parentRoute, table, setShowToast }) => {
  const { t } = useTranslation();

  /**
   * Todo : after creating surveys details page handle serviceRequestIdKey
   */

  const GetStatusCell = (value) =>
    value === true ? <span className="sla-cell-success">Active</span> : value === false ? <span className="sla-cell-error">Inactive</span> : "-";
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

  const handleUpdateSurveyConfirm = (row) => {
    const currentStatus = row?.active ? "Active" : "Inactive";
    const updatedStatus = row?.active ? "Inactive" : "Active";
    setShowToast({
      label: `Are you sure you want to change the survey status of "${row?.surveyTitle}" from ${currentStatus} to ${updatedStatus}? Please confirm.`,
      isDeleteBtn: true,
      warning: true,
      isWarningButtons: true,
      rowData: row,
    });
  };

  const dataForMobileInboxCards = table?.map((item) => {
    const { surveyTitle, startDate, endDate, answersCount, active, postedBy, auditDetails } = item;
    return {
      [t("Survey Name")]: surveyTitle,
      [t("EVENTS_START_DATE_LABEL")]: startDate ? format(new Date(startDate), "dd/MM/yyyy") : "",
      [t("EVENTS_END_DATE_LABEL")]: endDate ? format(new Date(endDate), "dd/MM/yyyy") : "",
      // [t("CS_RESPONSE_COUNT")]: answersCount,
      [t("EVENTS_STATUS_LABEL")]: GetStatusCell(active),
      [t("EVENTS_POSTEDBY_LABEL")]: postedBy,
      [t("Created On")]: auditDetails?.createdTime ? format(new Date(auditDetails?.createdTime), "dd/MM/yyyy") : "",
      [t("Last Updated On")]: auditDetails?.lastModifiedTime ? format(new Date(auditDetails?.lastModifiedTime), "dd/MM/yyyy") : "",
      [t("Update Survey Status")]: (
        <label onClick={() => handleUpdateSurveyConfirm(item)}>
          <EditIcon className="table-cell-for-update" fill="#a82227" style={{ cursor: "pointer", marginLeft: "20px" }} />
        </label>
      ),
    };
  });

  return {
    data: dataForMobileInboxCards,
    //linkPrefix: `${parentRoute}/inbox/`,
    //serviceRequestIdKey: t("TL_COMMON_TABLE_COL_APP_NO")
    MobileSortFormValues,
  };
};

export default useInboxMobileCardsData;
