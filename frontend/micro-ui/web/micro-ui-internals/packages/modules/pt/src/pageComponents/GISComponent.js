import React from 'react';
import { SubmitBar } from "@mseva/digit-ui-react-components";

export const GISComponent = ({config, onSelect, userType, formData, setError, formState, clearErrors, t}) => {
    console.log("GISComponent called with config: ", formData);
    const onGISMapClick = ()=>{
        console.log("onGISMapClick called with formData: ", formData);
        if(formData?.surveyId) {
            window.location.href = `https://onemap.nic.in/punjab/map.aspx?surveyid=${formData?.surveyId}`;
        }else{
            alert("Please a valid a survey ID before proceeding to the GIS map.");
        }
    }
    return(
        <div>            
            <SubmitBar style={{ marginRight:20}} label={t("SHOW_ON_MAP")} onSubmit={onGISMapClick} id/>
        </div>
    )
}