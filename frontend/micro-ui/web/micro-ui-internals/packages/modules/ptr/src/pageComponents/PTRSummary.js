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

  const renderRow = (label, value) => (
    <div className="ptr-summary-row">
      <div className="ptr-summary-row-label">
        <CardLabel className="ptr-summary-bold-label">{label}</CardLabel>
      </div>
      <div className="ptr-summary-row-value">{value || "NA"}</div>
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
    <div className="application-summary">
      {/* <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{t("Application Summary")}</h2> */}

      <Card className="summary-section ptr-summary-card-padding">
        <div className="ptr-summary-section">
          <div className="ptr-summary-header-row">
            <h3 className="ptr-summary-heading">{t("ES_TITILE_OWNER_DETAILS")}</h3>
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
      </Card>

      <Card className="summary-section">
        <div className="ptr-summary-section">
          <div className="ptr-summary-header-row">
            <h3 className="ptr-summary-heading">{t("ES_TITILE_PET_DETAILS")}</h3>
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
      </Card>

      <Card className="summary-section">
        <div className="ptr-summary-section">
          <div className="ptr-summary-header-row">
            <h3 className="ptr-summary-heading">{t("ES_TITLE_DOCS")}</h3>
            {/* <span style={editLabelStyle} onClick={() => dispatch(SET_PTRNewApplication_STEP(3))}>
              {t("EDIT")}
            </span> */}
          </div>

          <div>
            {Array.isArray(docs) && docs.length > 0 ? (
              <div className="ptr-summary-documents-container">
                {docs.map((doc, index) => (
                  <div key={index} className="ptr-summary-document-card">
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
      </Card>
    </div>
  );
}

export default PTRSummary;
