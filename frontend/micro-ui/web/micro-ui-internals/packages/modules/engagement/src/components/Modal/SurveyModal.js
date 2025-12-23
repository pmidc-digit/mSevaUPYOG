import React, { useEffect, useState } from "react";
import { Loader, SubmitBar, Modal } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useHistory } from "react-router-dom";

const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className="icon-bg-secondary" onClick={props.onClick}>
      <Close />
    </div>
  );
};

const SurveyModal = ({ isOpen, onClose }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const userInfo = Digit.UserService.getUser().info;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const tenantId = localStorage.getItem("CITIZEN.CITY");

console.log(tenantId, "TENANTTTTTT");
  useEffect(() => {
    const cachedData = sessionStorage.getItem("survey_modal_data");
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setData(parsedData);
      } catch (e) {
        console.error("Failed to parse cached survey data", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen && tenantId && data.length === 0) {
      fetchActiveAndOpenSurveys();
    }
  }, [isOpen, tenantId, data.length]);

  function fetchActiveAndOpenSurveys() {
    setLoading(true);
    const payload = { tenantId: tenantId, active: true, openSurveyFlag: true };
    Digit.Surveys.searchSurvey(payload)
      .then((response) => {
        let tableData = response.Surveys.filter((item) => item.active);
        tableData = tableData.sort((a, b) => b.auditDetails.lastModifiedTime - a.auditDetails.lastModifiedTime);
        setData(tableData);
        // Cache data in sessionStorage to persist across navigation
        sessionStorage.setItem("survey_modal_data", JSON.stringify(tableData));
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Failed to fetch surveys", error);
      });
  }

  const handleStartSurvey = (surveyDetails) => {
    history.push({
      pathname: "/digit-ui/citizen/engagement/surveys/fill-survey",
      state: { surveyDetails: surveyDetails, userInfo: userInfo, userType: "citizen" },
    });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      headerBarMain={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{t("Active Surveys")}</span>
          {data?.length > 0 && (
            <span
              style={{
                background: "#2563eb",
                color: "#fff",
                borderRadius: "12px",
                padding: "2px 8px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              {data.length}
            </span>
          )}
        </div>
      }
      headerBarEnd={<CloseBtn onClick={onClose} />}
      hideSubmit={true}
      popupStyles={{
        width: "95%",
        maxWidth: "600px",
        height: "auto",
        maxHeight: "90vh",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
        padding: "15px",
      }}
      popupModuleMianStyles={{
        maxHeight: "calc(90vh - 120px)",
        overflowY: "auto",
        padding: "24px",
        backgroundColor: "#f9fafb",
      }}
    >
      <div className="survey-modal-wrapper">
        {loading ? (
          <div className="survey-modal-loader">
            <Loader />
          </div>
        ) : data && data.length > 0 ? (
          <div className="new-card-cards-grid">
            {data?.map((survey, index) => (
              <div key={index} className="new-card-option">
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "600", color: "#1a202c" }}>{survey?.surveyTitle}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px" }}>
                    <span style={{ color: "#6b7280", fontWeight: "600" }}>Start Date:</span>
                    <p style={{ margin: "4px 0 0 0", color: "#1f2937", fontSize: "14px" }}>
                      {survey?.startDate ? format(new Date(survey?.startDate), "dd/MM/yyyy") : "NA"}
                    </p>
                  </div>
                  {survey?.endDate && (
                    <div style={{ fontSize: "12px" }}>
                      <span style={{ color: "#6b7280", fontWeight: "600" }}>End Date:</span>
                      <p style={{ margin: "4px 0 0 0", color: "#1f2937", fontSize: "14px" }}>{format(new Date(survey?.endDate), "dd/MM/yyyy")}</p>
                    </div>
                  )}
                  <div style={{ fontSize: "12px" }}>
                    <span style={{ color: "#6b7280", fontWeight: "600" }}>Description:</span>
                    <p style={{ margin: "4px 0 0 0", color: "#1f2937", fontSize: "14px", lineHeight: "1.4" }}>
                      {survey?.surveyDescription || "No description available"}
                    </p>
                  </div>
                </div>
                <SubmitBar label={t("Start Survey")} onSubmit={() => handleStartSurvey(survey)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="survey-modal-empty-state" style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "500", color: "#374151" }}>
              {t("No active surveys available at this time")}
            </p>
            <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>Please check back later for new surveys</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SurveyModal;
