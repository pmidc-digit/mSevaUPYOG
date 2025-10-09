import React from "react";
import { Card, CardLabel } from "@mseva/digit-ui-react-components";
import { useDispatch, useSelector } from "react-redux";
import { SET_ADSNewApplication_STEP } from "../redux/action/ADSNewApplicationActions";
import ADSDocument from "./ADSDocument";
import ADSCartDetails from "./ADSCartDetails";

function ADSSummary({ t }) {
  const dispatch = useDispatch();
  const TT = (key) => (t ? t(key) : key);

  const rawFormData = useSelector((state) => state?.ads?.ADSNewApplicationFormReducer?.formData);
  const formData = React.useMemo(() => rawFormData || {}, [rawFormData]);
  const applicant = formData?.CreatedResponse?.applicantDetail || {};
  const address = formData?.ownerDetails?.address || formData?.CreatedResponse?.address || {};
  // const cartArray = Array.isArray(formData.ads?.selectedCards) ? formData.ads?.selectedCards : [];

  const docs = Array.isArray(formData?.documents?.documents?.documents)
    ? formData?.documents?.documents?.documents
    : Array.isArray(formData.documents?.documents)
    ? formData.documents.documents
    : Array.isArray(formData.documents)
    ? formData.documents
    : [];

  const sectionStyle = {
    backgroundColor: "#ffffff",
    padding: "1rem 0",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 6px rgba(18,38,63,0.04)",
  };

  const headerRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
    padding: "0 1.5rem",
  };
   const headerRow1 = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  };

  const headingStyle = {
    fontSize: "1.25rem",
    color: "#0d43a7",
    fontWeight: "600",
    margin: 0,
  };

  const editLabelStyle = {
    cursor: "pointer",
    color: "#2e86de",
    fontWeight: 600,
    fontSize: "0.9rem",
  };

  const labelFieldPairStyle = {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px dashed #e9eef2",
    padding: "0.6rem 1.5rem",
    alignItems: "center",
  };

  const documentsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    marginTop: "0.5rem",
  };

  const documentCardStyle = {
    flex: "1 1 220px",
    minWidth: "180px",
    maxWidth: "260px",
    backgroundColor: "#fbfcfe",
    padding: "0.6rem",
    border: "1px solid #eef3f7",
    borderRadius: "6px",
  };

  const boldLabelStyle = { fontWeight: "500", color: "#333" };

  const cartDetails = formData?.ads

  const renderRow = (label, value) => (
    <div style={labelFieldPairStyle}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <CardLabel style={boldLabelStyle}>{label}</CardLabel>
      </div>
      <div style={{ textAlign: "right", minWidth: "120px" }}>{value || "NA"}</div>
    </div>
  );

  return (
    <div className="application-summary">
      <Card className="summary-section">
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{TT("ADS_APPLICANT_DETAILS")}</h3>
            <span style={editLabelStyle} onClick={() => dispatch(SET_ADSNewApplication_STEP(2))}>
              {TT("TL_SUMMARY_EDIT")}
            </span>
          </div>
          {renderRow(TT("ES_NEW_APPLICATION_APPLICANT_NAME"), applicant?.applicantName)}
          {renderRow(TT("MOBILE"), applicant?.applicantMobileNo)}
          {renderRow(TT("ADS_EMAIL_ID"), applicant?.applicantEmailId)}
          {renderRow(TT("CORE_COMMON_PINCODE"), address?.pincode)}
          {renderRow(TT("ES_CREATECOMPLAINT_ADDRESS"), address?.addressLine1)}
        </div>
      </Card>

      <Card className="summary-section">
        <div style={sectionStyle}>
          <div style={headerRow1}>
            <h3 style={headingStyle}>{TT("ADS_DETAILS")}</h3>
            <span style={editLabelStyle} onClick={() => dispatch(SET_ADSNewApplication_STEP(1))}>
              {TT("TL_SUMMARY_EDIT")}
            </span>
          </div>


            <ADSCartDetails cartDetails={cartDetails} t={t}/>
        </div>
      </Card>

      <Card className="summary-section">
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{TT("ADS_DOCUMENTS_DETAILS")}</h3>
            <span style={editLabelStyle} onClick={() => dispatch(SET_ADSNewApplication_STEP(3))}>
              {TT("TL_SUMMARY_EDIT")}
            </span>
          </div>
          {docs.length > 0 ? (
            <div style={documentsContainerStyle}>
              {docs.map((doc, idx) => (
                <div key={idx} style={documentCardStyle}>
                  {TT(doc?.documentType)}
                  <ADSDocument value={docs} Code={doc?.documentType} index={idx} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "0 1.5rem" }}>{t("TL_NO_DOCUMENTS_MSG")}</div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ADSSummary;
