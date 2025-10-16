import React, { useState, useRef } from "react";
import { Card, CardSubHeader, CardLabel, StatusTable, ActionBar, SubmitBar, Menu, CardSectionHeader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import ChallanDocument from "../components/ChallanDocument";

function ChallanSummary({ formData, goNext, onGoBack }) {
  const { t } = useTranslation();
  const menuRef = useRef();
  let user = Digit.UserService.getUser();

  console.log("formData====", formData);

  let docs = formData?.documents?.documents?.documents;

  const appId = formData?.apiData?.Applications?.[0]?.uuid || formData?.venueDetails?.[0]?.bookingNo;

  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const [displayMenu, setDisplayMenu] = useState(false);

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: appId,
    moduleCode: "chb-services",
  });

  const userRoles = user?.info?.roles?.map((e) => e.code);
  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  function onActionSelect(action) {
    goNext(action);
  }

  // ---------------- UI Styles ----------------
  const pageStyle = {
    padding: "2rem",
    backgroundColor: "#f9f9f9",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
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

  const boldLabelStyle = { fontWeight: "bold", color: "#555" };

  const renderLabel = (label, value) => (
    <div style={labelFieldPairStyle}>
      <CardLabel style={boldLabelStyle}>{label}</CardLabel>
      <div>{t(value) || "NA"}</div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <h2 style={headingStyle}>{t("Application Summary")}</h2>

      <div style={sectionStyle}>
        <CardSubHeader style={{ fontSize: "24px" }}>{t("CHALLAN_OFFENDER_DETAILS")}</CardSubHeader>
        {renderLabel(t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL"), formData?.offenderDetails?.name)}
        {renderLabel(t("NOC_APPLICANT_MOBILE_NO_LABEL"), formData?.offenderDetails?.mobileNumber)}
        {renderLabel(t("NOC_APPLICANT_EMAIL_LABEL"), formData?.offenderDetails?.emailId)}
        {renderLabel(t("PT_COMMON_COL_ADDRESS"), formData?.offenderDetails?.address)}
      </div>

      <div style={sectionStyle}>
        <CardSubHeader style={{ fontSize: "24px" }}>{t("CHALLAN_OFFENCE_DETAILS")}</CardSubHeader>
        {renderLabel(t("CHALLAN_TYPE_OFFENCE"), formData?.offenceDetails?.offenceType)}
        {renderLabel(t("CHALLAN_OFFENCE_CATEGORY"), formData?.offenceDetails?.offenceCategory)}
        {renderLabel(t("CHALLAN_OFFENCE_SUB_CATEGORY"), formData?.offenceDetails?.offenceSubCategory)}
        {renderLabel(t("CHALLAN_NUMBER"), formData?.offenceDetails?.challanNumber)}
        {renderLabel(t("CHALLAN_NAME"), formData?.offenceDetails?.challanName)}
        {renderLabel(t("CHALLAN_AMOUNT"), formData?.offenceDetails?.challanAmount)}
        {renderLabel(t("CHALLAN_DAYS"), formData?.offenceDetails?.challanDaysToClearPayment)}
      </div>

      <CardSubHeader style={{ fontSize: "24px", marginTop: "30px" }}>{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
      <StatusTable>
        <Card style={{ display: "flex", flexDirection: "row", gap: "30px" }} className="force-no-margin">
          {docs?.map((doc, index) => (
            <React.Fragment>
              <div>
                <ChallanDocument value={docs} Code={doc?.documentType} index={index} />
                <CardSectionHeader style={{ marginTop: "10px", fontSize: "15px" }}>{t(doc?.documentType)}</CardSectionHeader>
              </div>
            </React.Fragment>
          ))}
        </Card>
      </StatusTable>

      {/* Action Section */}
      <ActionBar>
        <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />
        {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
          <Menu localeKeyPrefix={`WF_EMPLOYEE_${"NDC"}`} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
        ) : null}
        <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar>
    </div>
  );
}

export default ChallanSummary;
