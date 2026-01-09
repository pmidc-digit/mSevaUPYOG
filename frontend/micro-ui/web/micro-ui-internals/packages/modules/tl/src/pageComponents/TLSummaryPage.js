import React, { useState } from "react";
import { useSelector } from "react-redux";
import { CardLabel } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import TLDocument from "./TLDocumets";

const TLSummaryPage = ({ config, formData: propsFormData, onSelect }) => {
  const { t } = useTranslation();
  
  // Get formData directly from Redux to prevent data loss
  const reduxFormData = useSelector((state) => state.tl.tlNewApplicationForm.formData);
  const formData = reduxFormData || propsFormData || {};
  
  const createdResponse = formData?.CreatedResponse || {};
  const { tradeLicenseDetail = {}, calculation = {}, status, applicationType, licenseType, tradeName, commencementDate } = createdResponse;
  const [isChecked, setIsChecked] = useState(false);

  const owners = tradeLicenseDetail?.owners || [];
  const tradeUnits = tradeLicenseDetail?.tradeUnits || [];
  const accessories = tradeLicenseDetail?.accessories || [];
  const address = tradeLicenseDetail?.address || {};
  const taxHeads = calculation?.taxHeadEstimates || [];

  const getTaxAmount = (category) => {
    return taxHeads.find((item) => item.category === category)?.estimateAmount || 0;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "NA";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  console.log("formData in Summary", formData);

  const renderLabel = (label, value) => (
    <div className="bpa-summary-label-field-pair">
      <CardLabel className="bpa-summary-bold-label" style={{width: "auto"}}>{label}</CardLabel>
      <div>{value || "NA"}</div>
    </div>
  );

  return (
    <div className="bpa-summary-page">
      <h2 className="bpa-summary-heading">{t("Application Summary")}</h2>
      <div className="bpa-summary-section">
        {renderLabel(t("Trade License Tax"), getTaxAmount("TAX"))}
        {renderLabel(t("Rebate"), getTaxAmount("REBATE"))}
        {renderLabel(t("Penalty"), getTaxAmount("PENALTY"))}
        {renderLabel(t("Total Amount"), `Rs ${getTaxAmount("TAX")}`)}
        {renderLabel(t("Payment Status"), status || "NA")}
      </div>

      <h2 className="bpa-summary-heading">{t("Trade Details")}</h2>
      <div className="bpa-summary-section">
        {renderLabel(t("Application Type"), applicationType)}
        {renderLabel(t("Licence Type"), licenseType)}
        {renderLabel(t("Trade Name"), tradeName)}
        {renderLabel(t("Structure Type"), tradeLicenseDetail?.structureType?.split(".")[0])}
        {renderLabel(t("Structure Sub Type"), tradeLicenseDetail?.structureType?.split(".")[1])}
        {renderLabel(t("Trade Commencement Date"), formatDate(commencementDate))}
        {renderLabel(t("Trade GST No."), tradeLicenseDetail?.gstNo)}
        {renderLabel(t("Operational Area (Sq Ft)"), tradeLicenseDetail?.operationalArea)}
        {renderLabel(t("No. Of Employees"), tradeLicenseDetail?.noOfEmployees)}
        {renderLabel(t("Old Receipt No."), tradeLicenseDetail?.oldLicenseNumber)}
        {renderLabel(t("Validity (In Years)"), tradeLicenseDetail?.additionalDetail?.validityYears)}
      </div>

      <h2 className="bpa-summary-heading">{t("Trade Units")}</h2>
      {tradeUnits.map((unit, index) => (
        <div key={index} className="bpa-summary-section">
          <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>#{index + 1}</div>
          {renderLabel(t("Trade Category"), unit?.tradeType?.split(".")[0])}
          {renderLabel(t("Trade Type"), unit?.tradeType?.split(".")[1])}
          {renderLabel(t("Trade Sub-Type"), unit?.tradeType?.split(".")[2])}
          {renderLabel(t("UOM"), unit?.uom)}
          {renderLabel(t("Unit of Measurement Value"), unit?.uomValue)}
        </div>
      ))}

      <h2 className="bpa-summary-heading">{t("Accessories")}</h2>
      {accessories.map((acc, index) => (
        <div key={index} className="bpa-summary-section">
          <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>#{index + 1}</div>
          {renderLabel(t("Accessory Category"), acc?.accessoryCategory)}
          {renderLabel(t("UOM"), acc?.uom)}
          {renderLabel(t("Quantity"), acc?.uomValue)}
        </div>
      ))}

      <h2 className="bpa-summary-heading">{t("Property Address")}</h2>
      <div className="bpa-summary-section">
        {renderLabel(t("City"), address?.city)}
        {renderLabel(t("Door/House No."), address?.doorNo)}
        {renderLabel(t("Building/Colony Name"), address?.buildingName)}
        {renderLabel(t("Street Name"), address?.street)}
        {renderLabel(t("Mohalla"), address?.locality?.name)}
        {renderLabel(t("Pincode"), address?.pincode)}
      </div>

      <h2 className="bpa-summary-heading">{t("Owner Details")}</h2>
      {owners.map((owner, index) => (
        <div key={index} className="bpa-summary-section">
          <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>#{index + 1}</div>
          {renderLabel(t("Name"), owner?.name)}
          {renderLabel(t("Mobile No."), owner?.mobileNumber)}
          {renderLabel(t("Father/Husband's Name"), owner?.fatherOrHusbandName)}
          {renderLabel(t("Relationship"), owner?.relationship)}
          {renderLabel(t("Gender"), owner?.gender)}
        </div>
      ))}

      <h2 className="bpa-summary-heading">{t("Documents Uploaded")}</h2>
      <div className="bpa-summary-section">
        {Array.isArray(formData?.Documents?.documents?.documents) && formData.Documents.documents.documents.length > 0 ? (
          <TLDocument value={{ workflowDocs: formData.Documents.documents.documents }}></TLDocument>
        ) : (
          <div>{t("TL_NO_DOCUMENTS_MSG")}</div>
        )}
      </div>

      {/* <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
        <Controller
          name="termsAccepted"
          control={control}
          rules={{ required: t("PLEASE_ACCEPT_TERMS_CONDITIONS") }}
          render={(props) => (
            <input
              id="termsAccepted"
              type="checkbox"
              checked={props.value || false}
              onChange={(e) => {
                const checkStatus = { consentValue: e.target.checked };
                // onSelect("tradedetils", e.target.checked);
                onSelect(config.key, { ...formData[config.key], ...checkStatus });
                props.onChange(e.target.checked);

                setDeclare(e.target.checked);
              }}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
          )}
        />
        <label htmlFor="termsAccepted" style={{ cursor: "pointer", margin: 0 }}>
          {t("TL_DECLARATION_MESSAGE")}
        </label>
      </div> */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginTop: "20px" }}>
        <input
          id="termsAccepted"
          type="checkbox"
          checked={isChecked}
          onChange={(e) => {
            const checked = e.target.checked;
            setIsChecked(checked);
            // Save to window so Step 4 can access it
            window.declarationChecked = checked;
          }}
          style={{ width: "18px", height: "18px", cursor: "pointer" }}
        />
        <label htmlFor="termsAccepted" style={{ cursor: "pointer", margin: 0 }}>
          {t("TL_DECLARATION_MESSAGE")}
        </label>
      </div>
    </div>
  );
};

export default TLSummaryPage;
