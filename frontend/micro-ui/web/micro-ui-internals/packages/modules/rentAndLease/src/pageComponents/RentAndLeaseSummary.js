import React from "react";
import { Card, CardLabel, CardSectionHeader } from "@mseva/digit-ui-react-components";
import { useSelector } from "react-redux";
import RALDocuments from "../components/RALDocument";

function RentAndLeaseSummary({ t }) {
  const formData = useSelector((state) => state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData || {});
  const applicantDetails = Array.isArray(formData?.applicantDetails?.applicants)
    ? formData.applicantDetails?.applicants
    : formData?.applicantDetails?.applicants
    ? [formData.applicantDetails?.applicants]
    : [];

  const property = formData?.propertyDetails || {};
  const docs = formData?.documents?.documents?.documents || [];

  const renderRow = (label, value) => (
    <div className="ral-summary-label-field-pair">
      <div className="ral-flex-center-gap">
        <h2 className="ral-summary-bold-label">{label}</h2>
      </div>
      <div className="ral-text-right-min-width">{value || "NA"}</div>
    </div>
  );

  const propertyLabels = {
    // propertyType: t("RENT_LEASE_PROPERTY_TYPE"),
    propertyId: t("RENT_LEASE_PROPERTY_ID"),
    propertyName: t("RAL_LEASE_SELECTED_PROPERTY"),
    allotmentType: t("RAL_LEASE_USAGE_CATEGORY"),
    propertySizeOrArea: t("RAL_LEASE_PROPERTY_AREA"),
    address: t("RAL_LEASE_PROPERTY_ADDRESS"),
    propertySpecific: t("RENT_LEASE_PROPERTY_SPECIFIC"),
    locationType: t("RENT_LEASE_LOCATION_TYPE"),
    baseRent: t("RENT_AMOUNT "),
    securityDeposit: t("SECURITY_DEPOSIT"),
    tax_applicable: t("GST_APPLICABLE"),
    refundApplicableOnDiscontinuation: t("REFUND_APPLICABLE"),
    penaltyType: t("PENALTY_TYPE"),
    // latePayment: t("LATE_PAYMENT_PERCENT"),
  };

  return (
    <div className="application-summary">
      <Card className="summary-section ral-summary-card">
        <div className="ral-summary-section-container">
          <div className="ral-summary-header-row">
            <h3 className="ral-summary-heading">{t("ADS_APPLICANT_DETAILS")}</h3>
          </div>

          {applicantDetails.length > 0 ? (
            applicantDetails.map((applicant, index) => (
              <div key={index} className="ral-margin-bottom-1rem">
                {/* Optional sub-heading if multiple */}
                {applicantDetails.length > 1 && (
                  <h4 className="ral-summary-header">
                    {t("RAL_APPLICANT")} {index + 1}
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

      <Card className="summary-section ral-summary-card">
        <div className="ral-summary-section-container">
          <div className="ral-summary-header-row">
            <h3 className="ral-summary-heading">{t("Properties Details")}</h3>
          </div>
          {Object.entries(propertyLabels).map(([key, label]) => {
            let value = property?.selectedProperty?.[key] || property?.[key];
            if (value?.name) value = value.name;
            else if (value?.code) value = value.code;

            // Special handling for booleans
            if (key === "refundApplicableOnDiscontinuation") {
              value = value === true ? t("YES") : t("NO");
            }
            if (key === "tax_applicable") {
              value = value === true ? t("YES") : t("NO");
            }

            return renderRow(label, value || "NA");
          })}
        </div>
      </Card>

      <Card className="summary-section">
        <div className="ral-summary-section-container">
          <div className="ral-summary-header-row">
            <h3 className="ral-summary-heading">{t("ES_TITLE_DOCS")}</h3>
          </div>

          <div>
            {Array.isArray(docs) && docs?.length > 0 ? (
              <div className="ral-summary-documents-container">
                {docs?.map((doc, index) => (
                  <div key={index} className="ral-summary-document-card">
                    <RALDocuments value={formData?.documents} Code={doc?.documentType} index={index} />
                    <CardSectionHeader className="ral-margin-top-10-font-15">{t(doc?.documentType)}</CardSectionHeader>
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
