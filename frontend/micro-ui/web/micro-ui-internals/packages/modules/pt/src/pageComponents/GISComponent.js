import React from 'react';
import { SubmitBar } from "@mseva/digit-ui-react-components";

export const GISComponent = ({config, onSelect, userType, formData, setError, formState, clearErrors, t}) => {
    console.log("GISComponent called with config: ", formData);
    const onGISMapClick = ()=>{
        // console.log("onGISMapClick called with formData: ", formData);
        // if(formData?.surveyId) {
        //     window.location.href = `https://onemap.nic.in/punjab/map.aspx?surveyid=${formData?.surveyId}`;
        // }else{
        //     alert("Please a valid a survey ID before proceeding to the GIS map.");
        // }
        const url = "https://onemap.nic.in/punjab/map.aspx?PROPERTYID=001-A01-0123"; // your third-party URL
        window.open(url, "_blank", "noopener,noreferrer");
    }
    const onGISMapClickScenarioTwo = ()=>{
        // console.log("onGISMapClick called with formData: ", formData);
        // if(formData?.surveyId) {
        //     window.location.href = `https://onemap.nic.in/punjab/map.aspx?surveyid=${formData?.surveyId}`;
        // }else{
        //     alert("Please a valid a survey ID before proceeding to the GIS map.");
        // }
        const url = "https://onemap.nic.in/punjab/map.aspx?surveyid=001-A01-0123"; // your third-party URL
        window.open(url, "_blank", "noopener,noreferrer");
    }
    return(
        <div>            
            <SubmitBar style={{ marginRight:20}} label={t("Property ID Map")} onSubmit={onGISMapClick} id/>
            <SubmitBar style={{ marginRight:20}} label={t("Survey ID Map")} onSubmit={onGISMapClickScenarioTwo} id/>
        </div>
    )
}