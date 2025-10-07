import {
  Card,
  CardLabel,
  LabelFieldPair,
  SubmitBar,
  Loader,
  ActionBar,
  BackButton
} from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import Timeline from "../../../components/Timeline";
import OBPSDocument from "../../../pageComponents/OBPSDocuments";
import { pad } from "lodash";

const CheckPage = ({ onSubmit, value }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const match = useRouteMatch();
  let user = Digit.UserService.getUser();
  const tenantId =
    user && user?.info && user?.info?.permanentCity
      ? user?.info?.permanentCity
      : Digit.ULBService.getCurrentTenantId();
  const tenant = Digit.ULBService.getStateId();
  let isopenlink = window.location.href.includes("/openlink/");
  const isMobile = window.Digit.Utils.browser.isMobile();
  const isCitizenUrl = Digit.Utils.browser.isMobile() ? true : false;
  let storedData = Digit.SessionStorage.get("Digit.BUILDING_PERMIT");

  const safeValue =
    value && Object.keys(value).length > 0 ? value : storedData || {};
  const { result, formData, documents } = safeValue;

  console.log(safeValue, "SAFE VAKLUE");

  let consumerCode = result?.Licenses[0].applicationNumber;
  const fetchBillParams = { consumerCode };

  const { data: paymentDetails, isLoading } = Digit.Hooks.obps.useBPAREGgetbill(
    { businessService: "BPAREG", ...fetchBillParams, tenantId: tenant || tenantId.split(".")[0] },
    {
      enabled: consumerCode ? true : false,
      retry: false,
    }
  );

  if (isLoading) {
    return <Loader />;
  }

  console.log("formDataInCheckPage",formData)

  // ---------------- UI Styles ----------------
  const pageStyle = {
    padding: "2rem",
    backgroundColor: "#f1f1f1ff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    paddingBottom: "5rem",
  };

  const sectionStyle = {
    backgroundColor: "#ffffff",
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    marginBottom: "2rem",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  };

  const headingStyle = {
    fontSize: "1.5rem",
    borderBottom: "2px solid #ccc",
    paddingBottom: "0.3rem",
    color: "#2e4a66",
    marginTop: "2rem",
    marginBottom: "1rem",
  };

  const labelFieldPairStyle = {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px dashed #e0e0e0",
    padding: "0.5rem 0",
    color: "#333",
  };

  const documentsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    
  };

  const documentCardStyle = {
    flex: isCitizenUrl ? "1 1 18%" : "1 1 22%",
    minWidth: "200px",
    maxWidth: "250px",
    backgroundColor: "#fdfdfd",
    padding: "0.75rem",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    justifyContent:"center",
    display:"flex",
    
  };

  const boldLabelStyle = { fontWeight: "bold", color: "#555" };

  const renderLabel = (label, value) => (
    <div style={labelFieldPairStyle}>
      <CardLabel style={boldLabelStyle}>{label}</CardLabel>
      <div>{value || t("CS_NA")}</div>
    </div>
  );

  return (
    <div style={pageStyle}>
      {/* {isopenlink && <div onClick={() => history.goBack()}>{t("CS_COMMON_BACK")}</div>} */}
      {isMobile && <Timeline currentStep={4} flow="STAKEHOLDER" />}

      <h2 style={headingStyle}>{t("BPA_STEPPER_SUMMARY_HEADER")}</h2>

      {/* Application Details */}
      <div style={sectionStyle}>
        {renderLabel(t("BPA_APPLICATION_NUMBER_LABEL"), result?.Licenses?.[0]?.applicationNumber)}
      </div>

      {/* License Type */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>{t("BPA_LICENSE_TYPE")}</h2>
        {renderLabel(
          t("BPA_QUALIFICATION_TYPE"),
          t(
            typeof formData?.LicneseType?.qualificationType === "string"
              ? formData?.LicneseType?.qualificationType
              : formData?.LicneseType?.qualificationType?.name
          )
        )}
        {renderLabel(t("BPA_LICENSE_TYPE"), t(formData?.LicneseType?.LicenseType?.i18nKey))}
        {formData?.LicneseType?.LicenseType?.i18nKey?.includes("ARCHITECT") &&
          renderLabel(t("BPA_COUNCIL_NUMBER"), formData?.LicneseType?.ArchitectNo)}
        {formData?.LicneseType?.LicenseType?.i18nKey?.includes("TOWNPLANNER") &&
          renderLabel(t("BPA_ASSOCIATE_OR_FELLOW_NUMBER"), formData?.LicneseType?.ArchitectNo)}
      </div>

      {/* Applicant Details */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>{t("BPA_LICENSE_DET_CAPTION")}</h2>
        {renderLabel(t("BPA_APPLICANT_NAME_LABEL"), [formData?.LicneseDetails?.name?.trim(),formData?.LicneseDetails?.middleName?.trim(),formData?.LicneseDetails?.lastName?.trim()].filter(Boolean).join(" "))}
        {renderLabel(t("BPA_APPLICANT_GENDER_LABEL"), t(formData?.LicneseDetails?.gender.i18nKey))}
        {renderLabel(t("BPA_OWNER_MOBILE_NO_LABEL"), formData?.LicneseDetails?.mobileNumber)}
        {renderLabel(t("BPA_APPLICANT_EMAIL_LABEL"), formData?.LicneseDetails?.email)}
        {renderLabel(t("BPA_APPLICANT_DOB_LABEL"), formData?.LicneseDetails?.dateOfBirth)}
        {renderLabel(t("BPA_DETAILS_PIN_LABEL"), formData?.LicneseDetails?.Pincode)}
      </div>

      {/* Permanent Address */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>{t("BPA_PERMANANT_ADDRESS_LABEL")}</h2>
        {renderLabel(t("BPA_APPLICANT_ADDRESS_LABEL"), formData?.LicneseDetails?.PermanentAddress)}
        {}
        {formData?.LicneseType?.LicenseType?.i18nKey?.includes("ARCHITECT")
          ? renderLabel(t("BPA_SELECTED_ULB"), t("BPA_ULB_SELECTED_MESSAGE"))
          : renderLabel(
              t("BPA_SELECTED_ULB"),
              formData?.LicneseDetails?.Ulb?.map((obj) => obj.ulbname).join(", ")
            )}
      </div>

      {/* Communication Address */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>{t("BPA_COMMUNICATION_ADDRESS_HEADER_DETAILS")}</h2>
        {renderLabel(t("Address"), safeValue?.formData?.LicneseDetails?.correspondenceAddress)}
      </div>

      {/* Documents */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>{t("BPA_DOC_DETAILS_SUMMARY")}</h2>
        {documents?.documents?.length > 0 ? (
          <div style={documentsContainerStyle}>
            {documents?.documents.map((doc, index) => (
              <div key={index} style={documentCardStyle}>
                <OBPSDocument
                  value={safeValue}
                  Code={doc?.documentType}
                  index={index}
                  isNOC={false}
                  svgStyles={{}}
                  isStakeHolder={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div>{t("TL_NO_DOCUMENTS_MSG")}</div>
        )}
      </div>

      {/* Fee Estimate */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>{t("BPA_SUMMARY_FEE_EST")}</h2>
        {paymentDetails?.billResponse?.Bill[0]?.billDetails[0]?.billAccountDetails.map((bill, index) =>
          renderLabel(t(bill.taxHeadCode), `₹ ${bill?.amount}`)
        )}
        {renderLabel(
          t("BPA_COMMON_TOTAL_AMT"),
          `₹ ${paymentDetails?.billResponse?.Bill?.[0]?.billDetails[0]?.amount}`
        )}
      </div>
      <ActionBar>
        {/* <BackButton style={{ border: "none" }}>{t("CS_COMMON_BACK")}</BackButton> */}
        <SubmitBar
          label={t("CS_COMMON_SUBMIT")}
          onSubmit={onSubmit}
          disabled={
            typeof paymentDetails?.billResponse?.Bill?.[0]?.billDetails[0]?.amount !== "number" ||
            paymentDetails?.billResponse?.Bill?.[0]?.billDetails[0]?.amount < 0
          }
        />
      </ActionBar>
    </div>
  );
};

export default CheckPage;