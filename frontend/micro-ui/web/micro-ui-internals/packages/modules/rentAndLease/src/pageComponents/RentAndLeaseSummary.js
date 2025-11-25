import React, { useState, useEffect } from "react";
import { Card, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { useDispatch, useSelector } from "react-redux";
import { SET_RENTANDLEASE_NEW_APPLICATION_STEP } from "../redux/action/RentAndLeaseNewApplicationActions";
import RentAndLeaseDocument from "./RentAndLeaseDocument";

function RentAndLeaseSummary({ t,config }) {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData || {});
  console.log('formData', formData)
  const applicantDetails = Array.isArray(formData?.applicantDetails?.applicants)
  ? formData.applicantDetails?.applicants
  : formData?.applicantDetails?.applicants
  ? [formData.applicantDetails?.applicants]
  : [];



  const property = formData?.propertyDetails || {};
  console.log('property', property)
  const docs = formData?.documents?.documents?.documents || [];
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

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

  const headingStyle = {
    fontSize: "1.25rem",
    color: "#2e4a66",
    margin: 0,
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

  const boldLabelStyle = { fontWeight: "600", color: "#333" };

  const renderRow = (label, value) => (
    <div style={labelFieldPairStyle}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <CardLabel style={boldLabelStyle}>{label}</CardLabel>
      </div>
      <div style={{ textAlign: "right", minWidth: "120px" }}>{value || "NA"}</div>
    </div>
  );

  const formatDate = (dateValue, t) => {
    if (dateValue === null || dateValue === undefined || dateValue === "") return t("CS_NA");
    if (typeof dateValue === "number") {
      const date = new Date(dateValue);
      return date.toLocaleDateString();
    }
    return dateValue;
  };

  return (
    <div className="application-summary">
      <Card className="summary-section" style={{ padding: "2px" }}>
  <div style={sectionStyle}>
    <div style={headerRow}>
      <h3 style={headingStyle}>{t("ES_TITILE_APPLICANT_DETAILS")}</h3>
    </div>

    {applicantDetails.length > 0 ? (
      applicantDetails.map((applicant, index) => (
        <div key={index} style={{ marginBottom: "1rem" }}>
          {/* Optional sub-heading if multiple */}
          {applicantDetails.length > 1 && (
            <h4 style={{ color: "#555", margin: "0 0 0.5rem 0" }}>
              {t("Applicant")} {index + 1}
            </h4>
          )}

          {renderRow(t("NOC_COMMON_TABLE_COL_OWN_NAME_LABEL"), applicant?.name)}
          {renderRow(t("CORE_COMMON_MOBILE_NUMBER"), applicant?.mobileNumber)}
          {renderRow(t("CORE_COMMON_EMAIL_ID"), applicant?.emailId)}
          {renderRow(t("ADDRESS"), applicant?.address)}
          {renderRow(t("CORE_COMMON_PINCODE"), applicant?.pincode)}
        </div>
      ))
    ) : (
      <div>{t("CS_NA")}</div>
    )}
  </div>
</Card>

      <Card className="summary-section">
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{t("Properties Details")}</h3>
          </div>
          {renderRow(
            t("RENT_LEASE_PROPERTY_TYPE") || "Property Type",
            property?.propertyType?.name || property?.propertyType?.code || property?.propertyType || "NA"
          )}
          {renderRow(
            t("RENT_LEASE_PROPERTY_SPECIFIC") || "Property Specific",
            property?.propertySpecific?.name || property?.propertySpecific?.code || property?.propertySpecific || "NA"
          )}
          {renderRow(
            t("RENT_LEASE_LOCATION_TYPE") || "Location Type",
            property?.locationType?.name || property?.locationType?.code || property?.locationType || "NA"
          )}
          {property?.selectedProperty && (
            <div>
              {renderRow(t("RENT_LEASE_SELECTED_PROPERTY") || "Selected Property", property?.selectedProperty?.title || "NA")}
              {renderRow(t("RENT_LEASE_PROPERTY_AREA") || "Area", property?.selectedProperty?.area || "NA")}
              {renderRow(t("RENT_LEASE_PROPERTY_ADDRESS") || "Address", property?.selectedProperty?.address || "NA")}
              {renderRow(t("RENT_LEASE_RENT_AMOUNT") || "Rent", property?.selectedProperty?.rent || "NA")}
            </div>
          )}
        </div>
      </Card>

      <Card className="summary-section">
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{t("ES_TITLE_DOCS")}</h3>
          </div>

          <div>
            {Array.isArray(docs) && docs.length > 0 ? (
              <div style={documentsContainerStyle}>
                {docs.map((doc, index) => (
                  <div key={index} style={documentCardStyle}>
                    <RentAndLeaseDocument
                      applicationdetail={{
                        documents: [doc],
                        applicationNumber: formData?.CreatedResponse?.applicationNumber || formData?.responseData?.[0]?.applicationNumber,
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

export default RentAndLeaseSummary;
