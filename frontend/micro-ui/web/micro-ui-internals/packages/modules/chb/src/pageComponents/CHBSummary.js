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
import { SET_CHBApplication_STEP } from "../redux/action/CHBApplicationActions";
import ApplicationTable from "../components/inbox/ApplicationTable";
import { useTranslation } from "react-i18next";
import CHBDocument from "../pageComponents/CHBDocument";


function CHBSummary({ formData, goNext, onGoBack }) {
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

  const bookingId = formData?.venueDetails?.[0]?.bookingId;
  let docs = (formData?.documents?.documents?.documents || []).map((doc) => ({
    ...doc,
    bookingId,
  }));

  const appId = formData?.apiData?.Applications?.[0]?.uuid || formData?.venueDetails?.[0]?.bookingNo;
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const isCitizen = window.location.href.includes("citizen");
  const [getData, setData] = useState();
  const [displayMenu, setDisplayMenu] = useState(false);
  const closeMenu = () => setDisplayMenu(false);
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

  // Responsive styles using BPA summary classes
  const renderLabel = (label, value) => (
    <div className="bpa-summary-label-field-pair">
      <CardLabel className="bpa-summary-bold-label swach-search-container">{label}</CardLabel>
      <div>{value || "NA"}</div>
    </div>
  );
  const slotlistRows =
    formData?.venueDetails?.[0]?.bookingSlotDetails?.map((slot) => ({
      communityHallCode: `${t(formData?.venueDetails?.[0]?.communityHallCode)}`,
      hallName: formData?.venueDetails?.[0]?.communityHallName,
      hallCode: slot.hallCode + " - " + slot.capacity,
      bookingDate: slot.bookingDate,
      bookingStatus: t(`WF_CHB_${slot?.status}`),
    })) || [];

  function onActionSelect(action) {
    goNext(action);
    // setShowModal(true);
    // setSelectedAction(action);
  }

  // ---------------- UI Styles ----------------
  // const pageStyle = {
  //   padding: "2rem",
  //   backgroundColor: "#f9f9f9",
  //   fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  //   color: "#333",
  // };

  // const sectionStyle = {
  //   backgroundColor: "#ffffff",
  //   padding: "1rem 1.5rem",
  //   borderRadius: "8px",
  //   marginBottom: "2rem",
  //   boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  // };

  // const headingStyle = {
  //   fontSize: "1.5rem",
  //   borderBottom: "2px solid #ccc",
  //   paddingBottom: "0.3rem",
  //   color: "#2e4a66",
  //   marginTop: "2rem",
  //   marginBottom: "1rem",
  // };

  // const labelFieldPairStyle = {
  //   display: "flex",
  //   justifyContent: "space-between",
  //   borderBottom: "1px dashed #e0e0e0",
  //   padding: "0.5rem 0",
  //   color: "#333",
  // };

  // const documentsContainerStyle = {
  //   display: "flex",
  //   flexWrap: "wrap",
  //   gap: "1rem",
  // };

  // const documentCardStyle = {
  //   flex: isCitizen ? "1 1 18%" : "1 1 22%", // around 4 per row
  //   minWidth: "200px", // keeps it from shrinking too small
  //   maxWidth: "250px", // prevents oversized stretching on big screens
  //   backgroundColor: "#fdfdfd",
  //   padding: "0.75rem",
  //   border: "1px solid #e0e0e0",
  //   borderRadius: "6px",
  //   boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  // };

  // const boldLabelStyle = { fontWeight: "bold", color: "#555" };

  // const renderLabel = (label, value) => (
  //   <div style={labelFieldPairStyle}>
  //     <CardLabel style={boldLabelStyle}>{label}</CardLabel>
  //     <div>{t(value) || "NA"}</div>
  //   </div>
  // );

  // const slotlistRows =
  //   formData?.venueDetails?.[0]?.bookingSlotDetails?.map((slot) => ({
  //     communityHallCode: `${t(formData?.venueDetails?.[0]?.communityHallCode)}`,
  //     hallName: formData?.venueDetails?.[0]?.communityHallName,
  //     hallCode: slot.hallCode + " - " + slot.capacity,
  //     bookingDate: slot.bookingDate,
  //     bookingStatus: t(`WF_CHB_${slot?.status}`),
  //   })) || [];

  console.log("docs===", docs);

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

      <div className="bpa-summary-section">
        <CardSubHeader>{t("CHB_EVENT_DETAILS")}</CardSubHeader>
        {renderLabel(t("CHB_SPECIAL_CATEGORY"), formData?.ownerDetails?.hallsBookingApplication?.specialCategory?.category)}
        {renderLabel(t("CHB_PURPOSE"), formData?.ownerDetails?.hallsBookingApplication?.purpose?.purpose?.name)}
        {renderLabel(t("CHB_PURPOSE_DESCRIPTION"), formData?.ownerDetails?.hallsBookingApplication?.purposeDescription)}
      </div>

      <ApplicationTable
        t={t}
        data={slotlistRows}
        columns={columns}
        getCellProps={(cellInfo) => ({
          className: "chb-table-cell-summary"
        })}
        isPaginationRequired={false}
        totalRecords={slotlistRows.length}
      />

      <CardSubHeader className="bpa-summary-heading">{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
      <StatusTable >
        <div className="bpa-summary-section chb-documents-container">
          {docs?.length > 0 ? (
            docs?.map((doc, index) => (
              <div key={index}>
                <CHBDocument value={docs} Code={doc?.documentType} index={index} />
              </div>
            ))
          ) : (
            <h5>{t("CS_NO_DOCUMENTS_UPLOADED")}</h5>
          )}
        </div>
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

export default CHBSummary;
