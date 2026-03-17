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
import { SET_ChallanApplication_STEP } from "../../redux/action/ChallanApplicationActions";
import ApplicationTable from "../components/inbox/ApplicationTable";
import { useTranslation } from "react-i18next";
import ChallanDocument from "../components/ChallanDocument";

function ChallanSummary({ formData, goNext, onGoBack }) {
  const { pathname: url } = useLocation();
  const { t } = useTranslation();
  const history = useHistory();
  const menuRef = useRef();
  const dispatch = useDispatch();
  const mutateScreen = url.includes("/property-mutate/");
  let user = Digit.UserService.getUser();

  const columns = [
    { Header: `${t("CHB_HALL_NUMBER")}`, accessor: "communityHallCode" },
    { Header: `${t("CHB_COMMUNITY_HALL_NAME")}`, accessor: "hallName" },
    { Header: `${t("CHB_HALL_CODE")}`, accessor: "hallCode" },
    { Header: `${t("CHB_BOOKING_DATE")}`, accessor: "bookingDate" },
    { Header: `${t("PT_COMMON_TABLE_COL_STATUS_LABEL")}`, accessor: "bookingStatus" },
  ];

  let docs = formData?.documents?.documents?.documents;

  const appId = formData?.apiData?.Applications?.[0]?.uuid || formData?.venueDetails?.[0]?.bookingNo;

  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const isCitizen = window.location.href.includes("citizen");

  const [getData, setData] = useState();
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
    // setShowModal(true);
    // setSelectedAction(action);
  }

  const renderLabel = (label, value) => (
    <div className="bpa-summary-label-field-pair">
      <CardLabel className="bpa-summary-bold-label" style={{width: "auto"}}>{label}</CardLabel>
      <div>{t(value) || "NA"}</div>
    </div>
  );

  const slotlistRows =
    formData?.venueDetails?.[0]?.bookingSlotDetails?.map((slot) => ({
      communityHallCode: `${t(formData?.venueDetails?.[0]?.communityHallCode)}`,
      hallName: formData?.venueDetails?.[0]?.communityHallName,
      hallCode: slot.hallCode + " - " + slot.capacity,
      bookingDate: slot.bookingDate,
      bookingStatus: `${t(slot.status)}`,
    })) || [];

  return (
    <div className="bpa-summary-page">
      <h2 className="bpa-summary-heading">{t("Application Summary")}</h2>

      {/* Property Details Section */}
      <div className="bpa-summary-section">
        <CardSubHeader>{t("CHB_APPLICANT_DETAILS")}</CardSubHeader>

        {renderLabel(t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL"), formData?.venueDetails?.[0]?.applicantDetail?.applicantName)}
        {renderLabel(t("NOC_APPLICANT_MOBILE_NO_LABEL"), formData?.venueDetails?.[0]?.applicantDetail?.applicantMobileNo)}
        {renderLabel(t("NOC_APPLICANT_EMAIL_LABEL"), formData?.venueDetails?.[0]?.applicantDetail?.applicantEmailId)}
        {renderLabel(t("PT_COMMON_COL_ADDRESS"), formData?.venueDetails?.[0]?.address?.addressLine1)}
      </div>

      {/* <CardSubHeader style={{ fontSize: "24px" }}>{t("CHB_EVENT_DETAILS")}</CardSubHeader>
      <StatusTable>
        <Row className="border-none" label={t("CHB_SPECIAL_CATEGORY")} text={formData?.venueDetails?.[0]?.specialCategory?.category || t("CS_NA")} />
        <Row className="border-none" label={t("CHB_PURPOSE")} text={formData?.venueDetails?.[0]?.purpose?.purpose || t("CS_NA")} />
        <Row className="border-none" label={t("CHB_PURPOSE_DESCRIPTION")} text={formData?.venueDetails?.[0]?.purposeDescription || t("CS_NA")} />
      </StatusTable> */}

      <div className="bpa-summary-section">
        <CardSubHeader>{t("CHB_EVENT_DETAILS")}</CardSubHeader>

        {renderLabel(t("CHB_SPECIAL_CATEGORY"), formData?.venueDetails?.[0]?.specialCategory?.category)}
        {renderLabel(t("CHB_PURPOSE"), formData?.venueDetails?.[0]?.purpose?.purpose)}
        {renderLabel(t("CHB_PURPOSE_DESCRIPTION"), formData?.venueDetails?.[0]?.purposeDescription)}
      </div>

      {/* Documents Section */}
      {/* Documents Section */}
      {/* <h2 style={headingStyle}>{t("Documents Uploaded")}</h2>
      <div style={sectionStyle}>
        {docs?.length > 0 ? (
          <div style={documentsContainerStyle}>
            {docs?.map((doc, index) => (
              <div key={index} style={documentCardStyle}>
                <CHBDocument value={docs} Code={doc?.documentType} index={index} formData={formData} />
              </div>
            ))}
          </div>
        ) : (
          <div>{t("TL_NO_DOCUMENTS_MSG")}</div>
        )}
      </div> */}

      <ApplicationTable
        t={t}
        data={slotlistRows}
        columns={columns}
       
        className="challan-application-table"
        isPaginationRequired={false}
        totalRecords={slotlistRows.length}
      />

      <CardSubHeader className="challan-custom-header" >{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
      <StatusTable>
        <Card>
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
        <SubmitBar className="submit-bar-back" label="Back" onSubmit={onGoBack} />
        {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
          <Menu localeKeyPrefix={`WF_EMPLOYEE_${"NDC"}`} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
        ) : null}
        <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar>
    </div>
  );
}

export default ChallanSummary;
