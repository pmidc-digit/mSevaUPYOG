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
  const applicant = formData?.ownerDetails?.applicantDetail || formData?.CreatedResponse?.applicantDetail || {};
  const address = formData?.ownerDetails?.address || formData?.CreatedResponse?.address || {};
  // const cartArray = Array.isArray(formData.ads?.selectedCards) ? formData.ads?.selectedCards : [];

  const docs = Array.isArray(formData?.documents?.documents?.documents)
    ? formData?.documents?.documents?.documents
    : Array.isArray(formData.documents?.documents)
    ? formData.documents.documents
    : Array.isArray(formData.documents)
    ? formData.documents
    : [];
  const cartDetails = formData?.ads;

  const renderRow = (label, value) => (
    <div className="ads-summary-row">
      <div className="ads-summary-row-label">
        <CardLabel className="ads-summary-bold">{label}</CardLabel>
      </div>
      <div className="ads-summary-row-value">{value || "NA"}</div>
    </div>
  );

  // const updatedCartSlots = formData?.ads?.flatMap((item) => item.slots);

  return (
    <div className="bpa-summary-page">
     
      <h2 className="bpa-summary-heading">{TT("ADS_APPLICANT_DETAILS")}</h2>
      <span className="ads-summary-edit" onClick={() => dispatch(SET_ADSNewApplication_STEP(2))}>
        {TT("TL_SUMMARY_EDIT")}
      </span>
      <div className="bpa-summary-section">
        {renderRow(TT("NOC_APPLICANT_NAME_LABEL"), applicant?.applicantName)}
        {renderRow(TT("CORE_Mobile_Number"), applicant?.applicantMobileNo)}
        {renderRow(TT("CORE_EMAIL_ID"), applicant?.applicantEmailId)}
        {renderRow(TT("CORE_COMMON_PINCODE"), address?.pincode)}
        {renderRow(TT("ES_CREATECOMPLAINT_ADDRESS"), address?.addressLine1)}
      </div>

      <h2 className="bpa-summary-heading">{TT("ADS_DETAILS")}</h2>
      <span className="ads-summary-edit" onClick={() => dispatch(SET_ADSNewApplication_STEP(1))}>
        {TT("TL_SUMMARY_EDIT")}
      </span>
      <div className="bpa-summary-section">
        <ADSCartDetails cartDetails={cartDetails} t={t} />
      </div>

      <div className="document-section-wrapper">
        <div className="document-section-header">
          <span className="document-icon">📄</span>
          {TT("ADS_DOCUMENTS_DETAILS")}
        </div>
        <span className="ads-summary-edit" onClick={() => dispatch(SET_ADSNewApplication_STEP(3))}>
          {TT("TL_SUMMARY_EDIT")}
        </span>

        {docs?.length > 0 ? (
          <div className="document-container">
            <div className="document-grid">
              {docs.map((doc, idx) => (
                <div key={idx}>
                  <ADSDocument value={docs} Code={doc?.documentType} index={idx} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="document-empty-state">{t("TL_NO_DOCUMENTS_MSG")}</div>
        )}
      </div>
    </div>
  );
}

export default ADSSummary;
