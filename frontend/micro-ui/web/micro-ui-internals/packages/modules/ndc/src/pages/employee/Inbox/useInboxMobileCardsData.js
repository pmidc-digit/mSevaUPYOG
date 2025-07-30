import React from "react";
import { useTranslation } from "react-i18next";
import { SearchField, RadioButtons } from "@mseva/digit-ui-react-components";
import { Controller, useFormContext } from "react-hook-form";
import { format } from "date-fns";


const useInboxMobileCardsData = ({parentRoute, table }) => {
    const { t } = useTranslation();

    const dataForMobileInboxCards = table?.map((value) =>{ 
        console.log("valueNDC", value);
        return ({
            [t("NOC_APP_NO_LABEL")]: value?.Applicant?.uuid,
            // [t("TL_COMMON_TABLE_COL_APP_DATE")]:  format(new Date(value?.date), 'dd/MM/yyyy'),
            [t("NOC_EMAIL_LABEL")]: value?.Applicant?.email || "NA",
            // [t("ES_INBOX_LOCALITY")]: locality,
            [t("NOC_STATUS_LABEL")]: t(value?.Applicant?.applicationStatus) || t("NOC_STATUS_PENDING"),
            [t("ES_INBOX_NAME_LABEL")]: value?.Applicant?.firstname ? value?.Applicant?.firstname + " " + value?.Applicant?.lastname : value?.Applicant?.lastname || "",
            // [t("ES_INBOX_SLA_DAYS_REMAINING")]: t(value?.sla)
    })})

    const MobileSortFormValues = () => {
        const sortOrderOptions = [{
            code: "DESC",
            i18nKey: "ES_COMMON_SORT_BY_DESC"
        },{
            code: "ASC",
            i18nKey: "ES_COMMON_SORT_BY_ASC"
        }]
        const { control: controlSortForm  } = useFormContext()
        return <SearchField>
            <Controller
                name="sortOrder"
                control={controlSortForm}
                render={({onChange, value}) => <RadioButtons
                    onSelect={(e) => {
                        onChange(e.code)
                    }}
                    selectedOption={sortOrderOptions.filter((option) => option.code === value)[0]}
                    optionsKey="i18nKey"
                    name="sortOrder"
                    options={sortOrderOptions}
                />}
            />
        </SearchField>
    }


    return ({ data:dataForMobileInboxCards, linkPrefix:`${parentRoute}/inbox/application-overview/`, serviceRequestIdKey:t("NOC_APP_NO_LABEL"), MobileSortFormValues})

}

export default useInboxMobileCardsData