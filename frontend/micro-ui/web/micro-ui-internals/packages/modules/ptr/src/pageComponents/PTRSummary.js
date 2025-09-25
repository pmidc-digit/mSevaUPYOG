import React, { useState, useEffect } from "react";
import { Card, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { useDispatch, useSelector } from "react-redux";
import { SET_PTRNewApplication_STEP } from "../redux/action/PTRNewApplicationActions";
import PTRDocument from "../pageComponents/PTRDocument";
function PTRSummary({ t }) {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.ptr.PTRNewApplicationFormReducer.formData || {});
  const owner = formData?.ownerDetails || {};
  const pet = formData?.petDetails || {};
  const docs = formData?.documents?.documents?.documents || [];
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const pageStyle = {
    padding: "2rem",
    backgroundColor: "#f9f9f9",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  };

  const sectionStyle = {
    backgroundColor: "#ffffff",
    padding: "1rem 0", // vertical padding only, horizontal handled by rows
    borderRadius: "8px",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 6px rgba(18,38,63,0.04)",
  };

  const headerRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
    padding: "0 1.5rem", // <-- pushes heading & edit button inward
  };

  const headingStyle = {
    fontSize: "1.25rem",
    color: "#2e4a66",
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
    padding: "0.6rem 1.5rem", // <-- same inward push for key/value rows
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

  const boldLabelStyle = { fontWeight: "600", color: "#333" };

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
      {/* <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{t("Application Summary")}</h2> */}

      <Card className="summary-section" style={{ padding: "2px" }}>
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{t("Owner Details")}</h3>
            <span style={editLabelStyle} onClick={() => dispatch(SET_PTRNewApplication_STEP(1))}>
              {t("EDIT")}
            </span>
          </div>

          {renderRow(t("First Name"), owner?.firstName)}
          {renderRow(t("Last Name"), owner?.lastName)}
          {renderRow(t("Father's Name"), owner?.fatherOrHusbandName)}
          {renderRow(t("Mobile Number"), owner?.mobileNumber)}
          {renderRow(t("Email ID"), owner?.emailId)}
          {renderRow(t("Address"), owner?.address)}
        </div>
      </Card>

      <Card className="summary-section">
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{t("Pet Details")}</h3>
            <span style={editLabelStyle} onClick={() => dispatch(SET_PTRNewApplication_STEP(2))}>
              {t("EDIT")}
            </span>
          </div>

          {renderRow(t("Pet Name"), pet?.petName)}
          {renderRow(t("Pet Type"), pet?.petType?.name || pet?.petType?.code)}
          {renderRow(t("Breed Type"), pet?.breedType?.name || pet?.breedType?.code)}
          {renderRow(t("Pet Gender"), pet?.petGender?.name || pet?.petGender?.code)}
          {renderRow(t("Color"), pet?.petColor)}
          {renderRow(t("Vaccination Number"), pet?.vaccinationNumber)}
          {renderRow(t("Last Vaccine Date"), pet?.lastVaccineDate)}
        </div>
      </Card>

      <Card className="summary-section">
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{t("Documents")}</h3>
            <span style={editLabelStyle} onClick={() => dispatch(SET_PTRNewApplication_STEP(3))}>
              {t("EDIT")}
            </span>
          </div>

          <div>
            {Array.isArray(docs) && docs.length > 0 ? (
              <div style={documentsContainerStyle}>
                {docs.map((doc, index) => (
                  <div key={index} style={documentCardStyle}>
                    {/* <div style={{ marginBottom: "0.5rem", fontWeight: 600 }}>{t(doc?.documentType?.replaceAll?.(".", "_") || doc?.documentType)}</div> */}

                    <PTRDocument
                      petdetail={{
                        documents: [doc],
                        applicationNumber: formData?.CreatedResponse?.applicationNumber,
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div>{t("No documents uploaded")}</div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default PTRSummary;
