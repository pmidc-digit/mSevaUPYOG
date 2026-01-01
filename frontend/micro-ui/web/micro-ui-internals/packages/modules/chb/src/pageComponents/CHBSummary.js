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

  // Responsive styles
  const pageStyle = {
    padding: "2vw 2vw 5vw 2vw",
    backgroundColor: "#f9f9f9",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    minHeight: "100vh",
    maxWidth: 900,
    margin: "0 auto"
  };
  const sectionStyle = {
    backgroundColor: "#fff",
    padding: "1rem 1.5rem",
    borderRadius: 8,
    marginBottom: "2rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    width: "100%",
    boxSizing: "border-box"
  };
  const headingStyle = {
    fontSize: "clamp(1.2rem, 4vw, 2rem)",
    borderBottom: "2px solid #ccc",
    paddingBottom: ".3rem",
    color: "#2e4a66",
    marginTop: "2rem",
    marginBottom: "1rem",
    textAlign: "center"
  };
  const labelFieldPairStyle = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1px dashed #e0e0e0",
    padding: ".5rem 0",
    color: "#333",
    flexWrap: "wrap"
  };
  const documentsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    width: "100%",
    overflowX: "auto"
  };
  const documentCardStyle = {
    flex: "1 1 220px",
    minWidth: 180,
    maxWidth: 260,
    backgroundColor: "#fdfdfd",
    padding: ".75rem",
    border: "1px solid #e0e0e0",
    borderRadius: 6,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    marginBottom: "1rem"
  };
  const boldLabelStyle = { fontWeight: "bold", color: "#555" };
  const renderLabel = (label, value) => (
    <div style={labelFieldPairStyle}>
      <CardLabel style={boldLabelStyle}>{label}</CardLabel>
      <div style={{ wordBreak: "break-word", maxWidth: "60vw" }}>{t(value) || "NA"}</div>
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
    <div className="chb-summary-responsive" style={pageStyle}>
      <h2 style={headingStyle}>{t("Application Summary")}</h2>

      {/* Property Details Section */}
      <div style={sectionStyle}>
        <CardSubHeader style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)" }}>{t("CHB_APPLICANT_DETAILS")}</CardSubHeader>
        {renderLabel(t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL"), formData?.venueDetails?.[0]?.applicantDetail?.applicantName)}
        {renderLabel(t("NOC_APPLICANT_MOBILE_NO_LABEL"), formData?.venueDetails?.[0]?.applicantDetail?.applicantMobileNo)}
        {renderLabel(t("NOC_APPLICANT_EMAIL_LABEL"), formData?.venueDetails?.[0]?.applicantDetail?.applicantEmailId)}
        {renderLabel(t("PT_COMMON_COL_ADDRESS"), formData?.venueDetails?.[0]?.address?.addressLine1)}
      </div>

      <div style={sectionStyle}>
        <CardSubHeader style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)" }}>{t("CHB_EVENT_DETAILS")}</CardSubHeader>
        {renderLabel(t("CHB_SPECIAL_CATEGORY"), formData?.ownerDetails?.hallsBookingApplication?.specialCategory?.category)}
        {renderLabel(t("CHB_PURPOSE"), formData?.ownerDetails?.hallsBookingApplication?.purpose?.purpose?.name)}
        {renderLabel(t("CHB_PURPOSE_DESCRIPTION"), formData?.ownerDetails?.hallsBookingApplication?.purposeDescription)}
      </div>

      <ApplicationTable
        t={t}
        data={slotlistRows}
        columns={columns}
        getCellProps={(cellInfo) => ({
          style: {
            minWidth: "100px",
            padding: "8px",
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
            paddingLeft: "10px",
            wordBreak: "break-word"
          },
        })}
        isPaginationRequired={false}
        totalRecords={slotlistRows.length}
      />

      <CardSubHeader style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)", marginTop: "30px" }}>{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
      <StatusTable>
        <div style={documentsContainerStyle}>
          {docs?.length > 0 ? (
            docs?.map((doc, index) => (
              <div key={index} style={documentCardStyle}>
                <CHBDocument value={docs} Code={doc?.documentType} index={index} />
                <CardSectionHeader style={{ marginTop: "10px", fontSize: "15px" }}>{t(doc?.documentType)}</CardSectionHeader>
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
