import React from "react";
import { Card, CardLabel } from "@mseva/digit-ui-react-components";
import { useDispatch, useSelector } from "react-redux";
import { SET_ADSNewApplication_STEP } from "../redux/action/ADSNewApplicationActions";
import ADSDocument from "./ADSDocument";
import ADSCartDetails from "./ADSCartDetails";
import {
  sectionStyle,
  headerRow,
  headerRowNoPadding,
  headingStyle,
  editLabelStyle,
  labelFieldPairStyle,
  documentsContainerStyle,
  documentCardStyle,
  boldLabelStyle,
  rowValueStyle,
  rowLabelContainer,
  noDocumentsMsg,
} from "../styles/commonStyles";

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

  const cartDetails = formData?.ads;
  
  const renderRow = (label, value) => (
    <div style={labelFieldPairStyle}>
      <div style={rowLabelContainer}>
        <CardLabel style={boldLabelStyle}>{label}</CardLabel>
      </div>
      <div style={rowValueStyle}>{value || "NA"}</div>
    </div>
  );

  // const updatedCartSlots = formData?.ads?.flatMap((item) => item.slots);

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
          {renderRow(TT("NOC_APPLICANT_NAME_LABEL"), applicant?.applicantName)}
          {renderRow(TT("CORE_Mobile_Number"), applicant?.applicantMobileNo)}
          {renderRow(TT("CORE_EMAIL_ID"), applicant?.applicantEmailId)}
          {renderRow(TT("CORE_COMMON_PINCODE"), address?.pincode)}
          {renderRow(TT("ES_CREATECOMPLAINT_ADDRESS"), address?.addressLine1)}
        </div>
      </Card>

      <Card className="summary-section">
        <div style={sectionStyle}>
          <div style={headerRowNoPadding}>
            <h3 style={headingStyle}>{TT("ADS_DETAILS")}</h3>
            <span style={editLabelStyle} onClick={() => dispatch(SET_ADSNewApplication_STEP(1))}>
              {TT("TL_SUMMARY_EDIT")}
            </span>
          </div>

          <ADSCartDetails cartDetails={cartDetails} t={t} />
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
          {docs?.length > 0 ? (
            <div style={documentsContainerStyle}>
              {docs.map((doc, idx) => (
                <div key={idx} style={documentCardStyle}>
                  <ADSDocument value={docs} Code={doc?.documentType} index={idx} />
                  {TT(doc?.documentType)}
                </div>
              ))}
            </div>
          ) : (
            <div style={noDocumentsMsg}>{t("TL_NO_DOCUMENTS_MSG")}</div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ADSSummary;
