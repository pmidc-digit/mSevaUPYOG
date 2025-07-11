import React, { useState } from "react"
import { Toast } from "@nudmcdgnpm/digit-ui-react-components";
import { useForm, Controller } from "react-hook-form";
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next";
import SVSearchApplication from "../../components/SearchApplication";

/** Parent component of Search application for employee side
 * Pass the data from the hook to child components
 * Contains onSubmit function
 * Implemented toast for search application here
 */
const SearchApp = ({path}) => {
    const { variant } = useParams();
    const { t } = useTranslation();
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const [payload, setPayload] = useState({})
    const [showToast, setShowToast] = useState(null);

    // function to pass filters to hook on clicking submit button
    function onSubmit (_data) {
        var fromDate = new Date(_data?.fromDate)
        fromDate?.setSeconds(fromDate?.getSeconds() - 19800 )
        var toDate = new Date(_data?.toDate)
        toDate?.setSeconds(toDate?.getSeconds() + 86399 - 19800)
        const data = {
            ..._data,
            ...(_data.toDate ? {toDate: toDate?.getTime()} : {}),
            ...(_data.fromDate ? {fromDate: fromDate?.getTime()} : {})
        }

        let payload = Object.keys(data).filter( k => data[k] ).reduce( (acc, key) => ({...acc,  [key]: typeof data[key] === "object" ? data[key].code : data[key] }), {} );

        // setting toast based on fields selected
        if(Object.entries(payload).length>0 && !payload.applicationNumber && !payload.fromDate && !payload.mobileNumber && !payload.vendingType && !payload.toDate && !payload.vendingZone)
        setShowToast({ warning: true, label: "ERR_SV_FILL_VALID_FIELDS" });
        else if(Object.entries(payload).length>0 && (payload.fromDate && !payload.toDate) || (!payload.fromDate && payload.toDate))
        setShowToast({ warning: true, label: "ERR_PROVIDE_BOTH_FORM_TO_DATE" });
        else
        setPayload(payload)
    }

    const config = {
        enabled: !!( payload && Object.keys(payload).length > 0 )
    }

    // Hook to fetch data for searchapplication based on the filters 
    const { isLoading, isSuccess, isError, error, data: {SVDetail: searchResult, count: count} = {} } = Digit.Hooks.sv.useSvSearchApplication(
        { 
          tenantId,
          filters: payload
        },
       config,
      );
    
    return <React.Fragment>
        <SVSearchApplication t={t} isLoading={isLoading} tenantId={tenantId} setShowToast={setShowToast} onSubmit={onSubmit} data={isSuccess && !isLoading ? (searchResult.length>0? searchResult : { display: "ES_COMMON_NO_DATA" } ):""} count={count} /> 
        {showToast && (
        <Toast
          error={showToast.error}
          warning={showToast.warning}
          label={t(showToast.label)}
          isDleteBtn={true}
          onClose={() => {
            setShowToast(null);
          }}
        />
       )} 
    </React.Fragment>

}

export default SearchApp;