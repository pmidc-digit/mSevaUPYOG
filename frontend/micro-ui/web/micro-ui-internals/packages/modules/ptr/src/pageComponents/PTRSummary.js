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
  console.log("pet", pet);
  const docs = formData?.documents?.documents?.documents || [];
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  // const pageStyle = {
  //   padding: "2rem",
  //   backgroundColor: "#f9f9f9",
  //   fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  //   color: "#333",
  // };

  // const sectionStyle = {
  //   backgroundColor: "#ffffff",
  //   padding: "1rem 0", // vertical padding only, horizontal handled by rows
  //   borderRadius: "8px",
  //   marginBottom: "1.5rem",
  //   boxShadow: "0 2px 6px rgba(18,38,63,0.04)",
  // };

  // const headerRow = {
  //   display: "flex",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   marginBottom: "0.75rem",
  //   padding: "0 1.5rem", // <-- pushes heading & edit button inward
  // };

  // const headingStyle = {
  //   fontSize: "1.25rem",
  //   color: "#2e4a66",
  //   margin: 0,
  // };

  // const editLabelStyle = {
  //   cursor: "pointer",
  //   color: "#2e86de",
  //   fontWeight: 600,
  //   fontSize: "0.9rem",
  // };

  // const labelFieldPairStyle = {
  //   display: "flex",
  //   justifyContent: "space-between",
  //   borderBottom: "1px dashed #e9eef2",
  //   padding: "0.6rem 1.5rem", // <-- same inward push for key/value rows
  //   alignItems: "center",
  // };
  // const documentsContainerStyle = {
  //   display: "flex",
  //   flexWrap: "wrap",
  //   gap: "1rem",
  //   marginTop: "0.5rem",
  // };

  // const documentCardStyle = {
  //   flex: "1 1 220px",
  //   minWidth: "180px",
  //   maxWidth: "260px",
  //   backgroundColor: "#fbfcfe",
  //   padding: "0.6rem",
  //   border: "1px solid #eef3f7",
  //   borderRadius: "6px",
  // };

  // const boldLabelStyle = { fontWeight: "600", color: "#333", marginBottom:"0px" };

  const renderRow = (label, value) => (
    <div className="bpa-summary-label-field-pair">
      <div className="ads-summary-row-label">
        <CardLabel className="bpa-summary-bold-label">{label}</CardLabel>
      </div>
      <div className="ads-summary-row-value">{value || "NA"}</div>
    </div>
  );

  const formatPetAge = (ageValue, t) => {
    if (ageValue === null || ageValue === undefined || ageValue === "") return t("CS_NA");

    const ageStr = String(ageValue).trim();
    // accept numeric-like strings only
    if (!/^\d+(\.\d+)?$/.test(ageStr)) return t("CS_NA");

    const [yearsPart, decPart] = ageStr.split(".");
    let years = Number(yearsPart) || 0;
    let months = 0;

    if (decPart) {
      if (decPart.length === 1) {
        // .5 -> 5 months
        months = parseInt(decPart, 10);
      } else {
        // take first two digits: .11 -> 11 months, .5x -> 50 -> will be handled below
        months = parseInt(decPart.slice(0, 2), 10);
      }
      if (isNaN(months)) months = 0;
    }

    // Clamp months to 0..11 (or convert overflow to years if you prefer)
    if (months > 11) months = 11;

    if (years === 0 && months === 0) return t("CS_NA");
    if (years === 0) return `${months} month${months > 1 ? "s" : ""}`;
    if (months === 0) return `${years} year${years > 1 ? "s" : ""}`;
    return `${years} year${years > 1 ? "s" : ""} and ${months} month${months > 1 ? "s" : ""}`;
  };

  return (
    <div className="bpa-summary-page">
      {/* <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{t("Application Summary")}</h2> */}

      <div className="summary-section" style={{ padding: "2px" }}>
        <div className="bpa-summary-section">
          <div className="ads-summary-row">
            <h3 className="bpa-summary-heading">{t("ES_TITILE_OWNER_DETAILS")}</h3>
            {/* <span style={editLabelStyle} onClick={() => dispatch(SET_PTRNewApplication_STEP(1))}>
              {t("EDIT")}
            </span> */}
          </div>

          {renderRow(t("NOC_COMMON_TABLE_COL_OWN_NAME_LABEL"), owner?.name)}
          {/* {renderRow(t("Last Name"), owner?.lastName)} */}
          {renderRow(t("PT_ACK_LOCALIZATION_FATHERS_NAME"), owner?.fatherOrHusbandName)}
          {renderRow(t("CORE_COMMON_MOBILE_NUMBER"), owner?.mobileNumber)}
          {renderRow(t("CORE_COMMON_EMAIL_ID"), owner?.emailId)}
          {renderRow(t("ADDRESS"), owner?.address)}
        </div>
      </div>

      <div className="summary-section">
        <div className="bpa-summary-section">
          <div className="ads-summary-row">
            <h3 className="bpa-summary-heading">{t("ES_TITILE_PET_DETAILS")}</h3>
            {/* <span style={editLabelStyle} onClick={() => dispatch(SET_PTRNewApplication_STEP(2))}>
              {t("EDIT")}
            </span> */}
          </div>

          {renderRow(t("PTR_PET_NAME"), pet?.petName)}
          {renderRow(t("PTR_PET_TYPE"), pet?.petType?.name || pet?.petType?.code)}
          {renderRow(t("PTR_BREED_TYPE"), pet?.breedType?.name || pet?.breedType?.code)}
          {renderRow(t("PTR_PET_GENDER"), pet?.petGender?.name || pet?.petGender?.code)}
          {/* {renderRow(t("PTR_PET_AGE"), pet?.petAge)} */}
          {renderRow(t("PTR_PET_AGE"), formatPetAge(pet?.petAge, t))}
          {renderRow(t("PTR_COLOR"), pet?.petColor)}
          {renderRow(t("PTR_VACCINATION_NUMBER"), pet?.vaccinationNumber)}
          {renderRow(t("PTR_VACCINATION_DATE"), pet?.lastVaccineDate)}
          {renderRow(t("PTR_CLINIC_NAME"), pet?.clinicName)}
          {renderRow(t("PTR_DOCTOR_NAME"), pet?.doctorName)}
        </div>
      </div>

      <div className="summary-section">
        <div className="bpa-summary-section">
          <div className="ads-summary-row">
            <h3 className="bpa-summary-heading">{t("ES_TITLE_DOCS")}</h3>
            {/* <span style={editLabelStyle} onClick={() => dispatch(SET_PTRNewApplication_STEP(3))}>
              {t("EDIT")}
            </span> */}
          </div>

          <div>
            {Array.isArray(docs) && docs.length > 0 ? (
              <div className="ads-summary-docs">
                {docs.map((doc, index) => (
                  <div key={index} className="ads-summary-doc-card">
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
              <div>{t("CS_NO_DOCUMENTS_UPLOADED")}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PTRSummary;
