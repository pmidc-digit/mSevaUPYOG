import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardSubHeader,
  CardLabel,
  LabelFieldPair,
  StatusTable,
  ActionBar,
  SubmitBar,
  Menu,
  CardSectionHeader,
  Row,
} from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import ApplicationTable from "../components/inbox/ApplicationTable";
import { useTranslation } from "react-i18next";
import CHBDocument from "../components/ChallanDocument";

function CHBSummary({ formData, goNext, onGoBack }) {
  const { t } = useTranslation();
  const menuRef = useRef();
  let user = Digit.UserService.getUser();
  let docs = formData?.documents?.documents?.documents;

  console.log("formData", formData);

  const appId = formData?.apiData?.Applications?.[0]?.uuid || formData?.venueDetails?.applicationNo;

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
    moduleCode: "NewGC",
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
    // setShowModal(true);
    // setSelectedAction(action);
  }

  const renderLabel = (label, value) => (
    <div className="bpa-summary-label-field-pair">
      <CardLabel className="card-label bpa-summary-bold-label swach-search-container">{label}</CardLabel>
      <div>{t(value) || "NA"}</div>
    </div>
  );

  return (
    <div className="bpa-summary-page">
      <h2 className="bpa-summary-heading">{t("Application Summary")}</h2>

      {/* Property Details Section */}
      <div className="gc-summary-section">
        <CardSubHeader className="gc-style-7f09016ce8">{t("CHB_APPLICANT_DETAILS")}</CardSubHeader>
        {renderLabel(t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL"), formData?.ownerDetails?.name)}
        {renderLabel(t("NOC_APPLICANT_MOBILE_NO_LABEL"), formData?.ownerDetails?.mobileNumber)}
        {renderLabel(t("NOC_APPLICANT_EMAIL_LABEL"), formData?.ownerDetails?.emailId)}
        {renderLabel(t("PT_COMMON_COL_ADDRESS"), formData?.ownerDetails?.address)}
      </div>

      <div className="gc-summary-section">
        <CardSubHeader className="gc-style-7f09016ce8">{t("PT_DETAILS")}</CardSubHeader>
        {renderLabel(t("NDC_MSG_PROPERTY_LABEL"), formData?.venueDetails?.propertyId)}
        {renderLabel(t("NDC_MSG_PROPERTY_TYPE_LABEL"), formData?.venueDetails?.propertyType)}
        {renderLabel(t("PDF_STATIC_LABEL_WS_CONSOLIDATED_ACKNOWELDGMENT_PLOT_SIZE"), formData?.venueDetails?.plotSize)}
        {renderLabel(t("GC_LOCATION"), formData?.venueDetails?.location)}
      </div>

      <div className="gc-summary-section">
        <CardSubHeader className="gc-style-7f09016ce8">{t("GC_CONNECTION_DETAILS")}</CardSubHeader>
        {/* {renderLabel(t("GC_CONNECTION_TYPE"), formData?.venueDetails?.connectionCategory)} */}
        {renderLabel(t("GC_FREQUENCY"), formData?.venueDetails?.frequency)}
        {renderLabel(t("GC_WASTE_TYPE"), formData?.venueDetails?.typeOfWaste)}
        {renderLabel(t("Rented"), formData?.venueDetails?.additionalDetails?.isRented ? "Yes" : "No")}
        {renderLabel(t("Amount"), formData?.venueDetails?.additionalDetails?.defAmount)}
      </div>

      <CardSubHeader className="gc-style-10e0b3f06d">{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
      <StatusTable>
        <Card className="gc-style-79bc56d8a7">
          {docs?.map((doc, index) => (
            <React.Fragment>
              <div>
                <CHBDocument value={docs} Code={doc?.documentType} index={index} />
                <CardSectionHeader className="gc-style-131b576839">{t(doc?.documentType)}</CardSectionHeader>
              </div>
            </React.Fragment>
          ))}
        </Card>
      </StatusTable>

      {/* Action Section */}
      <ActionBar>
        <SubmitBar className="submit-bar-back" label="Back" onSubmit={onGoBack} />
        {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
          <Menu localeKeyPrefix={`WF_EMPLOYEE_${"GC"}`} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
        ) : null}
        <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar>
    </div>
  );
}

export default CHBSummary;
