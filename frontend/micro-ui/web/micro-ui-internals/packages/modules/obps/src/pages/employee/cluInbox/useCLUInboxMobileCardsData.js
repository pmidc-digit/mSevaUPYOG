import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { SearchField, RadioButtons } from "@mseva/digit-ui-react-components";
import { Controller, useFormContext } from "react-hook-form";
import { encryptId } from "../../../utils";

const useCLUInboxMobileCardsData = ({parentRoute, table, getRedirectionLink}) => {
    const { t } = useTranslation()


    const dataForMobileInboxCards = table?.map(({ applicationId, date, applicationType,businessService, locality, status, owner, sla, state, professionalName}) => ({
            [t("BPA_APPLICATION_NUMBER_LABEL")]: applicationId,
            [t("CS_APPLICATION_DETAILS_APPLICATION_DATE")]: format(new Date(date), 'dd/MM/yyyy'),
            //[t("BPA_SEARCH_APPLICATION_TYPE_LABEL")]: t(applicationType),
            // [t("ES_INBOX_LOCALITY")]: t(locality),
            [t("BPA_PRIMARY_OWNER_NAME_LABEL")]: owner,
            [t("BPA_PROFESSIONAL_NAME_LABEL")]: professionalName,
            [t("PT_COMMON_TABLE_COL_STATUS_LABEL")]: t(`BPA_STATUS_${status}`),
            "Vehicle Log": {id: encryptId(applicationId), hidden: true}
            // [t("WF_INBOX_HEADER_CURRENT_OWNER")]: owner,
            // [t("ES_INBOX_SLA_DAYS_REMAINING")]: sla
    }))

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

    const serviceRequestIdKeyFunction = (object) => {
        return object["Vehicle Log"]?.id
    }

    return ({ data:dataForMobileInboxCards, linkPrefix:`${parentRoute}/clu/application-overview/`, serviceRequestIdKey: serviceRequestIdKeyFunction, MobileSortFormValues})

}

export default useCLUInboxMobileCardsData;