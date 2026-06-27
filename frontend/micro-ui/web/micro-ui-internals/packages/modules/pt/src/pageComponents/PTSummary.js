import React, { Fragment } from "react";
import { Card, CardLabel, LabelFieldPair, CardSubHeader, StatusTable, CardSectionHeader } from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CHBDocument from "../components/ChallanDocument";

const PTSummary = ({ formData, t }) => {
  console.log("form data in summary component", formData);
  const { pathname: url } = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const mutateScreen = url.includes("/property-mutate/");

  const SummaryData = useSelector(function (state) {
    return state.pt.PTNewApplicationFormReducer.formData;
  });

  console.log("SummaryData", SummaryData);

  let docs = formData?.documents?.documents?.documents || SummaryData?.documents?.documents?.documents;
  const ownerDetails = SummaryData?.ownerDetails || {};
  const propertyDetails = SummaryData?.propertyDetails || {};
  const propertyAddress = SummaryData?.propertyAddress || {};
  const isInstitutionalOwner = ownerDetails?.ownerShip?.code?.includes("INSTITUTIONAL");

  const getDisplayValue = (value, fallback = "NA") => {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "object") return value?.name || value?.label || value?.code || value?.i18nKey || fallback;
    return value;
  };

  const getUsageTypeLabel = (unit) => {
    const usageValue = unit?.unitUsageType;
    if (typeof usageValue === "string" && usageValue) {
      return usageValue;
    }
    return getDisplayValue(usageValue);
  };

  const getFloorCount = () => {
    const rawNoOfFloors = propertyDetails?.noOfFloors;
    const directFloorCount = Number(rawNoOfFloors?.code || rawNoOfFloors?.name || rawNoOfFloors);
    if (!isNaN(directFloorCount) && directFloorCount > 0) return String(directFloorCount);

    const unitFloors = (propertyDetails?.unitDetails || [])
      .map((unit) => Number(unit?.floor?.code || unit?.floor?.name || unit?.floor))
      .filter((floor) => !isNaN(floor));

    if (unitFloors.length) {
      return String(Math.max(...unitFloors));
    }

    return "NA";
  };

  const styles = {
    wrapper: {
      padding: "2rem",
      backgroundColor: "#f9f9f9",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#333",
    },
    sectionHeader: {
      fontSize: "1.5rem",
      borderBottom: "2px solid #ccc",
      paddingBottom: "0.3rem",
      color: "#2e4a66",
      marginTop: "2rem",
      marginBottom: "1rem",
    },
    section: {
      backgroundColor: "#ffffff",
      padding: "1rem 1.5rem",
      borderRadius: "8px",
      marginBottom: "2rem",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    },
    labelFieldPair: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px dashed #e0e0e0",
      padding: "0.5rem 0",
      color: "#333",
    },
    value: {
      width: "100%",
      textAlign: "right",
    },
    ownerIndex: {
      fontWeight: "600",
      marginBottom: "0.5rem",
    },
  };

  return (
    <div className="application-summary" style={styles.wrapper}>
      {/* onwers Section */}
      {ownerDetails?.owners?.map((item, index) => {
        return (
          <Card className="summary-section" style={styles.section} key={`summary${index}`}>
            <CardSectionHeader>
              {t(isInstitutionalOwner ? "Institute" : "Owner")} {index + 1}
            </CardSectionHeader>
            <div className="section-content">
              {isInstitutionalOwner ? (
                <>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Institution Name")}</CardLabel>
                    <div style={styles.value}>{ownerDetails?.institutionName || item?.institutionName || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Designation")}</CardLabel>
                    <div style={styles.value}>{item?.designation || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Institution Type")}</CardLabel>
                    <div style={styles.value}>{getDisplayValue(ownerDetails?.institutionType)}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Name of Authorized Person")}</CardLabel>
                    <div style={styles.value}>{item?.name || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Telephone Number")}</CardLabel>
                    <div style={styles.value}>{item?.altContactNumber || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Mobile Number")}</CardLabel>
                    <div style={styles.value}>{item?.mobileNumber || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Email Id")}</CardLabel>
                    <div style={styles.value}>{item?.emailId || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Address")}</CardLabel>
                    <div style={styles.value}>{item?.address || item?.correspondenceAddress || "NA"}</div>
                  </LabelFieldPair>
                </>
              ) : (
                <>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Name")}</CardLabel>
                    <div style={styles.value}>{item?.name || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Mobile Number")}</CardLabel>
                    <div style={styles.value}>{item?.mobileNumber || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Email Id")}</CardLabel>
                    <div style={styles.value}>{item?.emailId || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Address")}</CardLabel>
                    <div style={styles.value}>{item?.address || item?.correspondenceAddress || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Guardian Name")}</CardLabel>
                    <div style={styles.value}>{item?.fatherOrHusbandName || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Gender")}</CardLabel>
                    <div style={styles.value}>{getDisplayValue(item?.gender)}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Relationship")}</CardLabel>
                    <div style={styles.value}>{getDisplayValue(item?.relationship)}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Special Category")}</CardLabel>
                    <div style={styles.value}>{getDisplayValue(item?.ownerType)}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Ownership Percentage")}</CardLabel>
                    <div style={styles.value}>{item?.ownershipPercentage || "NA"}</div>
                  </LabelFieldPair>
                </>
              )}
            </div>
          </Card>
        );
      })}

      {/* Property Details Section */}
      <div className="summary-section" style={styles.section}>
        <div className="section-content">
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Property Usage Type")}</CardLabel>
            <div style={styles.value}>{getDisplayValue(propertyDetails?.propertyUsageType)}</div>
          </LabelFieldPair>

          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Property Type")}</CardLabel>
            <div style={styles.value}>{getDisplayValue(propertyDetails?.propertyType)}</div>
          </LabelFieldPair>

          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Business Name")}</CardLabel>
            <div style={styles.value}>{propertyDetails?.businessName || "NA"}</div>
          </LabelFieldPair>

          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Remarks")}</CardLabel>
            <div style={styles.value}>{propertyDetails?.remarks || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Plot Size (sq. yards)")}</CardLabel>
            <div style={styles.value}>{propertyDetails?.plotSize || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("No. of Floors")}</CardLabel>
            <div style={styles.value}>{getFloorCount()}</div>
          </LabelFieldPair>
          {propertyDetails?.unitDetails?.map((unit, idx) => (
            <div key={idx} style={{ borderTop: "1px solid #eee", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
              <div style={{ fontWeight: 600, paddingBottom: "0.3rem" }}>{t("Unit")} {idx + 1}</div>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Floor")}</CardLabel>
                <div style={styles.value}>{getDisplayValue(unit?.floor)}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Usage Type")}</CardLabel>
                <div style={styles.value}>{getUsageTypeLabel(unit)}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Sub Usage Type")}</CardLabel>
                <div style={styles.value}>{getDisplayValue(unit?.subUsageType)}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Occupancy Type")}</CardLabel>
                <div style={styles.value}>{getDisplayValue(unit?.occupancy)}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Built Up Area")}</CardLabel>
                <div style={styles.value}>{unit?.area || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("ARV / Rent")}</CardLabel>
                <div style={styles.value}>{unit?.totalRent || "NA"}</div>
              </LabelFieldPair>
            </div>
          ))}
        </div>
      </div>

      {/* Property Address Section */}
      <div className="summary-section" style={styles.section}>
        <div className="section-content">
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("City")}</CardLabel>
            <div style={styles.value}>{getDisplayValue(propertyAddress?.city)}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("House / Door No.")}</CardLabel>
            <div style={styles.value}>{propertyAddress?.houseNo || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Building Name")}</CardLabel>
            <div style={styles.value}>{propertyAddress?.buildingName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Street Name")}</CardLabel>
            <div style={styles.value}>{propertyAddress?.streetName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Locality")}</CardLabel>
            <div style={styles.value}>{getDisplayValue(propertyAddress?.locality)}</div>
          </LabelFieldPair>
          {/* <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Pincode")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyAddress?.pincode || "NA"}</div>
          </LabelFieldPair> */}
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Survey ID")}</CardLabel>
            <div style={styles.value}>{propertyAddress?.surveyId || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Year of Creation")}</CardLabel>
            <div style={styles.value}>{getDisplayValue(propertyAddress?.yearOfCreation)}</div>
          </LabelFieldPair>
        </div>
      </div>

      <CardSubHeader className="bpa-summary-heading">{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
      <StatusTable>
        <div className="bpa-summary-section chb-documents-container">
          {docs?.length > 0 ? (
            docs?.map((doc, index) => (
              <div key={index}>
                <CHBDocument value={docs} Code={doc?.documentType} index={index} />
                <CardSectionHeader style={{ marginTop: "10px", fontSize: "15px" }}>{t(doc?.documentType)}</CardSectionHeader>
              </div>
            ))
          ) : (
            <h5>{t("CS_NO_DOCUMENTS_UPLOADED")}</h5>
          )}
        </div>
      </StatusTable>
    </div>
  );
};

export default PTSummary;
