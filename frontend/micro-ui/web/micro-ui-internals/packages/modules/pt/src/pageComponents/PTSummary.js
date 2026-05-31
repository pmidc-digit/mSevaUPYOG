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
      {SummaryData?.ownerDetails?.owners?.map((item, index) => {
        return (
          <Card className="summary-section" style={styles.section} key={`summary${index}`}>
            <CardSectionHeader>
              {t("Owner")} {index + 1}
            </CardSectionHeader>
            <div className="section-content">
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
                <div style={styles.value}>{item?.address || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Guardian Name")}</CardLabel>
                <div style={styles.value}>{item?.fatherOrHusbandName || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Gender")}</CardLabel>
                <div style={styles.value}>{item?.gender?.name || item?.gender || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Relationship")}</CardLabel>
                <div style={styles.value}>{item?.relationship?.name || item?.relationship || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Special Category")}</CardLabel>
                <div style={styles.value}>{item?.ownerType?.code || (typeof item?.ownerType === "string" ? item?.ownerType : "NA")}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Ownership Percentage")}</CardLabel>
                <div style={styles.value}>{item?.ownershipPercentage || "NA"}</div>
              </LabelFieldPair>
            </div>
          </Card>
        );
      })}

      {/* Property Details Section */}
      <div className="summary-section" style={styles.section}>
        <div className="section-content">
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Property Usage Type")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyDetails?.propertyUsageType?.name || "NA"}</div>
          </LabelFieldPair>

          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Property Type")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyDetails?.propertyType?.name || "NA"}</div>
          </LabelFieldPair>

          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Business Name")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyDetails?.businessName || "NA"}</div>
          </LabelFieldPair>

          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Remarks")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyDetails?.remarks || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Plot Size (sq. yards)")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyDetails?.plotSize || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("No. of Floors")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyDetails?.noOfFloors?.code || "NA"}</div>
          </LabelFieldPair>
          {SummaryData?.propertyDetails?.unitDetails?.map((unit, idx) => (
            <div key={idx} style={{ borderTop: "1px solid #eee", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
              <div style={{ fontWeight: 600, paddingBottom: "0.3rem" }}>{t("Unit")} {idx + 1}</div>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Floor")}</CardLabel>
                <div style={styles.value}>{unit?.floor?.name || unit?.floor?.code || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Usage Type")}</CardLabel>
                <div style={styles.value}>{unit?.unitUsageType?.name || unit?.unitUsageType?.code || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Sub Usage Type")}</CardLabel>
                <div style={styles.value}>{unit?.subUsageType?.name || unit?.subUsageType?.code || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Occupancy Type")}</CardLabel>
                <div style={styles.value}>{unit?.occupancy?.name || unit?.occupancy?.code || "NA"}</div>
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
            <div style={styles.value}>{SummaryData?.propertyAddress?.city?.name || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("House / Door No.")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyAddress?.houseNo || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Building Name")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyAddress?.buildingName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Street Name")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyAddress?.streetName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Locality")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyAddress?.locality?.name || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Pincode")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyAddress?.pincode || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Survey ID")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyAddress?.surveyId || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair style={styles.labelFieldPair}>
            <CardLabel>{t("Year of Creation")}</CardLabel>
            <div style={styles.value}>{SummaryData?.propertyAddress?.yearOfCreation?.name || SummaryData?.propertyAddress?.yearOfCreation?.code || "NA"}</div>
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
