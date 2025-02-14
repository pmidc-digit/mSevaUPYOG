import React, { Fragment, useMemo  } from "react"
import { CardLabelError, Dropdown, SearchField, TextInput } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import {Controller } from "react-hook-form";
import { alphabeticalSortFunctionForTenantsBasedOnName } from "../../../../utils";

const SearchCategoryFieldsComponents = ({ registerRef, controlSearchForm, searchFormState }) => {
    const { t } = useTranslation()
    const ulbs = Digit.SessionStorage.get("ENGAGEMENT_TENANTS");
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const userInfo = Digit.SessionStorage.get("citizen.userRequestObject")
    const userUlbs = ulbs.filter(ulb => userInfo?.info?.roles?.some(role => role?.tenantId === ulb?.code)).sort(alphabeticalSortFunctionForTenantsBasedOnName);
    const selectedTenat = useMemo(() => {
        const filtered = ulbs.filter((item) => item.code === tenantId)
        return filtered;
    }, [ulbs])
    const isActiveOptions=[
        {id:false,name:"False"},
        {id:true,name:"True"}
    ]
    const categoryOptions=[{
        id:'501d3653-71c8-42cb-a1a2-863a063ee864',
        name:"Test"
    }]
    /**
     * ToDo how to display default value correctly ask @egov-saurabh
     */
    
    return <>
        <SearchField>
            <label>{t("LABEL_FOR_ULB")}</label>
            
            <Controller
                rules={{ required: true }}
                defaultValue={selectedTenat?.[0]}
                render={props => (
                    <Dropdown
                        option={userUlbs}
                        optionKey={"i18nKey"}
                        selected={props.value}
                        select={(e) => props.onChange(e)}
                        t={t}
                    />
                )}
                name={"tenantIds"}
                control={controlSearchForm}

            />
            
        </SearchField>
        <SearchField>
            <label>{t("Category Name")}</label>
            <Controller
                rules={{ required: true }}
               
                render={props => (
                    <Dropdown
                        option={categoryOptions}
                        optionKey={"name"}
                        selected={props.value}
                        select={(e) => props.onChange(e)}
                        t={t}
                    />
                )}
                name={"categoryName"}
                control={controlSearchForm}

            />
            <CardLabelError>
                {searchFormState?.errors?.["categoryName"]?.message}
            </CardLabelError>
        </SearchField>

           <SearchField>
                    <label>{t("is Active")}</label>
                    <Controller
                rules={{ required: true }}
               
                render={props => (
                    <Dropdown
                        option={isActiveOptions}
                        optionKey={"name"}
                        selected={props.value}
                        select={(e) => props.onChange(e)}
                        t={t}
                    />
                )}
                name={"isActive"}
                control={controlSearchForm}

            />
                    <CardLabelError>
                        {searchFormState?.errors?.["isActive"]?.message}
                    </CardLabelError>
                </SearchField>

    </>
}

export default SearchCategoryFieldsComponents