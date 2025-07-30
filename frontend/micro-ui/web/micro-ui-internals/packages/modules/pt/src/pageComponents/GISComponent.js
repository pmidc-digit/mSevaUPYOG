import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CardLabel,LabelFieldPair, TextInput, CardLabelError, SubmitBar } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

export const GISComponent = () => {
    const [surveyId, setSurveyId] = useState("");
    const { t } = useTranslation();
    const userType = window.location.href.includes("citizen") ? "citizen" : "employee";
    const onGISMapClickScenarioTwo = ()=>{
        // console.log("onGISMapClick called with formData: ", formData);
        if(surveyId) {
            const url = `https://onemap.punjab.gov.in/map.aspx?surveyid=${surveyId}&usertype=${userType}`; 
            window.location.href = url;
        }else{
            alert("Please a valid a survey ID before proceeding to the GIS map.");
        }
    }

    const handleSurveyIdChange=(e)=>{
        setSurveyId(e.target.value);
    }

    const input = {
      label: "PT_SURVEY_ID_LABEL",
      type: "text",
      name: "surveyId",
      // isMandatory : "true",
      //  validation: {
      //    required: true,
      //    minLength: 1,
      //  }
    }
    return(
        // <div>            
        
        // </div>
        <React.Fragment>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t(input.label)}</CardLabel>
            <div className="field">

              <TextInput
                key={input.name}
                id={input.name}
                //isMandatory={config.isMandatory}
                value={surveyId}
                onChange={handleSurveyIdChange}
                //onChange={setElectricityNo}
                // onSelect={goNext}
                placeholder={""}
                {...input.validation}
                // onBlur={onBlur}

              // autoFocus={presentInModifyApplication}
              />

            </div>
          </LabelFieldPair>
          {/* {formState.touched[config.key] ? (
            <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
              {formState.errors?.[config.key]?.message}
            </CardLabelError>
          ) : null} */}

            <SubmitBar style={{ marginRight:20}} label={t("Survey ID Map")} onSubmit={onGISMapClickScenarioTwo} id/>
        </React.Fragment>
    )
}