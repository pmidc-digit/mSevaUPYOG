import React from "react";
import { Card, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SET_PTRNewApplication_STEP } from "../redux/action/PTRNewApplicationActions";

function PTRSummary({ formData, t }) {
  const { pathname: url } = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  return (
    <div className="application-summary">
      <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{t("Application Summary")}</h2>

      {/* Step 1: Owner Details */}
      <Card className="summary-section" style={{ padding: '2px' }}>
        <div className="section-header">
          <h3>{t("Owner Details")}</h3>
          <label onClick={() => dispatch(SET_PTRNewApplication_STEP(1))}>{t("EDIT")}</label>
        </div>
        <div className="section-content">
          <LabelFieldPair>
            <CardLabel>{t("First Name")}</CardLabel>
            <div>{formData?.ownerss?.ownerss?.firstName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Last Name")}</CardLabel>
            <div>{formData?.ownerss?.ownerss?.lastName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Father's Name")}</CardLabel>
            <div>{formData?.ownerss?.ownerss?.fatherName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Mobile Number")}</CardLabel>
            <div>{formData?.ownerss?.ownerss?.mobileNumber || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Email ID")}</CardLabel>
            <div>{formData?.ownerss?.ownerss?.emailId || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Address")}</CardLabel>
            <div>{formData?.ownerss?.ownerss?.address || "NA"}</div>
          </LabelFieldPair>
        </div>
      </Card>

      {/* Step 2: Pet Details */}
      <Card className="summary-section">
        <div className="section-header">
          <h3>{t("Pet Details")}</h3>
          <label onClick={() => dispatch(SET_PTRNewApplication_STEP(2))}>{t("EDIT")}</label>
        </div>
        <div className="section-content">
          <LabelFieldPair>
            <CardLabel>{t("Pet Name")}</CardLabel>
            <div>{formData?.pets?.pets?.petName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Pet Type")}</CardLabel>
            <div>{formData?.pets?.pets?.petType?.i18nKey || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Breed Type")}</CardLabel>
            <div>{formData?.pets?.pets?.breedType?.i18nKey || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Pet Gender")}</CardLabel>
            <div>{formData?.pets?.pets?.petGender?.i18nKey || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Color")}</CardLabel>
            <div>{formData?.pets?.pets?.color || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Vaccination Number")}</CardLabel>
            <div>{formData?.pets?.pets?.vaccinationNumber || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Last Vaccine Date")}</CardLabel>
            <div>{formData?.pets?.pets?.lastVaccineDate || "NA"}</div>
          </LabelFieldPair>
        </div>
      </Card>

      {/* Step 3: Document Details */}
      <Card className="summary-section">
        <div className="section-header">
          <h3>{t("Documents")}</h3>
          <label onClick={() => dispatch(SET_PTRNewApplication_STEP(3))}>{t("EDIT")}</label>
        </div>
        <div className="section-content">
          {formData?.documents?.documents?.documents?.map((doc, index) => (
            <div key={index}>
              <LabelFieldPair>
                <CardLabel>{t("Document Type")}</CardLabel>
                <div>{t(doc?.documentType) || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Document UID")}</CardLabel>
                <div>{doc?.documentUid || "NA"}</div>
              </LabelFieldPair>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default PTRSummary;
