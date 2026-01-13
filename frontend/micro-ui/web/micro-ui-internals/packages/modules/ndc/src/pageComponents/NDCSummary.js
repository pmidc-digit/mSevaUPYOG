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
} from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setNDCStep } from "../redux/actions/NDCFormActions";
import { useTranslation } from "react-i18next";
import NDCDocument from "../components/NDCDocument";

const NDCSummary = ({ formData, goNext, onGoBack }) => {
  const { pathname: url } = useLocation();
  const { t } = useTranslation();
  const history = useHistory();
  const menuRef = useRef();
  const dispatch = useDispatch();
  const mutateScreen = url.includes("/property-mutate/");
  let user = Digit.UserService.getUser();

  let docs = formData?.DocummentDetails?.documents?.documents;

  console.log("formData", formData);

  const appId = formData?.apiData?.Applications?.[0]?.applicationNo || formData?.responseData?.[0]?.applicationNo;

  const propertyDet = formData?.apiData?.Applications?.[0]?.NdcDetails || formData?.responseData?.[0]?.NdcDetails;

  const filterType = propertyDet?.filter((item) => item?.businessService == "PT");

  console.log("filterType", filterType);

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

  const fetchCalculations = async () => {
    const payload = {
      CalculationCriteria: [
        {
          applicationNumber: appId,
          tenantId: tenantId,
          propertyType: filterType?.[0]?.additionalDetails?.propertyType,
        },
      ],
    };
    const response = await Digit.NDCService.NDCCalculator({ tenantId, filters: { getCalculationOnly: true }, details: payload });
    setData(response?.Calculation?.[0]);
  };

  useEffect(() => {
    fetchCalculations();
  }, []);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: appId,
    moduleCode: "ndc-services",
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

  // ---------------- UI Styles ----------------
  const pageStyle = {
   
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

  const documentsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
  };

  const documentCardStyle = {
    flex: isCitizen ? "1 1 18%" : "1 1 22%", // around 4 per row
    minWidth: "200px", // keeps it from shrinking too small
    maxWidth: "250px", // prevents oversized stretching on big screens
    backgroundColor: "#fdfdfd",
    padding: "0.75rem",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  };

  const boldLabelStyle = { fontWeight: "bold", color: "#555" };

  const renderLabel = (label, value) => (
    <div style={labelFieldPairStyle}>
         <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
           <CardLabel style={boldLabelStyle}>{label}</CardLabel>
         </div>
         <div style={{ textAlign: "right", minWidth: "120px" }}>{value || "NA"}</div>
       </div>
  );

  return (
    <div style={pageStyle}>
      <h2 style={headingStyle}>{t("Application Summary")}</h2>

      {/* Property Details Section */}
      <div style={sectionStyle}>
        {renderLabel(t("Full Name"), formData?.NDCDetails?.PropertyDetails?.firstName)}
        {/* {renderLabel(t("Last Name"), formData?.NDCDetails?.PropertyDetails?.lastName)} */}
        {renderLabel(t("Mobile Number"), formData?.NDCDetails?.PropertyDetails?.mobileNumber)}
        {renderLabel(t("Email ID"), formData?.NDCDetails?.PropertyDetails?.email)}
        {renderLabel(t("Address"), formData?.NDCDetails?.PropertyDetails?.address)}
        {renderLabel(t("NDC Reason"), t(formData?.NDCDetails?.NDCReason?.i18nKey))}

        {renderLabel(
          t("Water Connection"),
          formData?.NDCDetails?.PropertyDetails?.waterConnection?.length > 0
            ? formData?.NDCDetails?.PropertyDetails?.waterConnection?.map((item, index) => <div key={index}>{item?.connectionNo}</div>)
            : "NA"
        )}

        {renderLabel(
          t("Sewerage Connection"),
          formData?.NDCDetails?.PropertyDetails?.sewerageConnection?.length > 0
            ? formData?.NDCDetails?.PropertyDetails?.sewerageConnection?.map((item, index) => <div key={index}>{item?.connectionNo}</div>)
            : "NA"
        )}

        {renderLabel(t("Property ID"), formData?.NDCDetails?.cpt?.id)}
        {renderLabel(
          t("Application Fees"),
          getData?.totalAmount ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(getData?.totalAmount) : "NA"
        )}
      </div>

      {/* Documents Section */}
      {/* Documents Section */}
      <h2 style={headingStyle}>{t("Documents Uploaded")}</h2>
      <div style={sectionStyle}>
        {docs?.length > 0 ? (
          <div style={documentsContainerStyle}>
            {docs?.map((doc, index) => (
              <div key={index} style={documentCardStyle}>
                <NDCDocument value={docs} Code={doc?.documentType} index={index} formData={formData} />
                <CardSectionHeader style={{ marginTop: "10px", fontSize: "15px" }}>
                  {/* {t(doc?.documentType?.split(".").slice(0, 2).join("_"))} */}
                  {t(`NDC_${doc?.documentType?.replace(/\./g, "_")}_LABEL`)}
                </CardSectionHeader>
              </div>
            ))}
          </div>
        ) : (
          <div>{t("TL_NO_DOCUMENTS_MSG")}</div>
        )}
      </div>

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
};

export default NDCSummary;
