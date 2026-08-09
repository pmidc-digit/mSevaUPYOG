import { CardLabel, SubmitBar, TextInput, Toast } from "@mseva/digit-ui-react-components";
import React, { useState } from "react";

const UpdateSurveyId = ({ t, propertyId, existingSurveyId, onValidation, showPopup }) => {
  const [surveyId, setSurveyId] = useState(
    existingSurveyId === "NA" || existingSurveyId === "N/A" || !existingSurveyId ? "" : existingSurveyId
  );
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!surveyId || surveyId.trim() === "") {
      setError("PT_SURVEY_ID_MANDATORY");
      return;
    }
    if (surveyId === existingSurveyId) {
      setError("PT_SEC_SAME_SURVEY_ID");
      return;
    }
    onValidation && onValidation({ surveyId });
  };

  return (
    <div className="popup-module updateSurveyId" style={{ padding: "8px", fontFamily: "Roboto, sans-serif" }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "24px" }}>
          <CardLabel style={{ fontSize: "16px", color: "#505a5f", marginBottom: "8px", fontWeight: "500" }}>
            {t("Survey Id/UID")}
          </CardLabel>
          <TextInput
            type="text"
            name="surveyId"
            value={surveyId}
            onChange={(e) => {
              setSurveyId(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>
        <SubmitBar label={t("Update SurveyId")} submit="submit" style={{ width: "100%", marginTop: "16px" }} />
      </form>
      {error && (
        <Toast
          error={true}
          label={t(error)}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};

export default UpdateSurveyId;
