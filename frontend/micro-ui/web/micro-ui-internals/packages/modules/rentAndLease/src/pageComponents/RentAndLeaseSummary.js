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
  const standardDocs = formData?.documents?.documents?.documents || [];
  const arrearDoc = property.arrearDoc ? [{ documentType: "Other Document", fileStoreId: property.arrearDoc }] : [];
  const docs = [...standardDocs, ...arrearDoc];

  const mergedDocsObject = {
    ...formData?.documents,
    documents: {
      ...formData?.documents?.documents,
      documents: docs,
    },
  };

  const renderRow = (label, value) => (
    <div className="ral-summary-row">
      <div className="ral-summary-label">{label}</div>
      <div>{value || "NA"}</div>
    </div>
  );

  const propertyLabels = {
    // propertyType: t("RENT_LEASE_PROPERTY_TYPE"),
    propertyId: t("Unit Id"),
    propertyName: t("Building/Plot/Shop Name"),
    allotmentType: t("RAL_LEASE_USAGE_CATEGORY"),
    // propertySizeOrArea: t("Building/Plot/Shop Area"),
    address: t("Building/Plot/Shop Locality"),
    propertySpecific: t("Building/Plot/Shop Specific"),
    // locationType: t("RENT_LEASE_LOCATION_TYPE"),
    baseRent: t("RENT_AMOUNT "),
    securityDeposit: t("SECURITY_DEPOSIT"),
    tax_applicable: t("GST_APPLICABLE"),
    refundApplicableOnDiscontinuation: t("REFUND_APPLICABLE"),
    penaltyType: t("PENALTY_TYPE"),
    startDate: t("RAL_START_DATE"),
    endDate: t("RAL_END_DATE"),
    // latePayment: t("LATE_PAYMENT_PERCENT"),
  };

  return (
    <div className="application-summary">
      {/* Citizen Details Section */}
      <Card className="summary-section">
        <div>
          <div className="ral-summary-header-row">
            <h3 className="ral-summary-heading">{t("RAL_CITIZEN_DETAILS")}</h3>
          </div>

          {applicantDetails.length > 0 ? (
            applicantDetails.map((applicant, index) => (
              <div key={index} className="ral-summary-applicant-wrapper">
                {/* Optional sub-heading if multiple */}
                {applicantDetails.length > 1 && (
                  <h4 className="ral-summary-applicant-subheading">
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

      {/* Building/Plot/Shop Details Section */}
      <Card className="summary-section">
        <div>
          <div className="ral-summary-header-row">
            <h3 className="ral-summary-heading">{t("Building/Plot/Shop Details")}</h3>
          </div>

          {Object.entries(propertyLabels)
            .filter(([key]) => property?.applicationType?.code !== "Legacy" || key !== "securityDeposit")
            .map(([key, label]) => {
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

              if (key === "address") {
                value = property?.area?.name;
              }

              if (typeof value === "number" && (key === "startDate" || key === "endDate")) {
                value = Digit.DateUtils.ConvertEpochToDate(value);
              }

              if (value === undefined || value === null || value === "") {
                return null;
              }

              return renderRow(label, value);
            })}
        </div>
      </Card>

      {/* Additional Details (Arrear Details) - Only for Legacy */}
      {property?.applicationType?.code === "Legacy" && (
        <Card className="summary-section">
          <div>
            <div className="ral-summary-header-row">
              <h3 className="ral-summary-heading">{t("Additional Details")}</h3>
            </div>
            {renderRow(t("Arrears"), property?.arrear)}
            {property?.lastBillingPeriod && renderRow(t("Last Billing Period"), property.lastBillingPeriod)}
            {property?.lastRentRevisedDate && renderRow(t("Last Rent Revised Date"), property.lastRentRevisedDate)}
            {property?.incrementPeriodMonths && renderRow(t("Increment Period Months"), property.incrementPeriodMonths?.code)}
            {property?.incrementPercentage && renderRow(t("Increment Percentage"), property.incrementPercentage)}
            {property?.arrearReason?.name && renderRow(t("Reason"), property?.arrearReason?.name)}
            {property?.remarks && renderRow(t("Remarks"), property?.remarks)}
          </div>
        </Card>
      )}

      {/* Document Details Section */}
      <Card className="summary-section">
        <div>
          <div className="ral-summary-header-row">
            <h3 className="ral-summary-heading">{t("ES_TITLE_DOCS")}</h3>
          </div>

          <div>
            {Array.isArray(docs) && docs?.length > 0 ? (
              <div className="ral-summary-docs-container">
                {docs?.map((doc, index) => (
                  <div key={index} className="ral-summary-doc-card">
                    <RALDocuments value={mergedDocsObject} Code={doc?.documentType} index={index} />
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
