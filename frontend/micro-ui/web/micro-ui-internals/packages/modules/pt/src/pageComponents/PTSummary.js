import React, { Fragment } from "react";
import { Card, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

const PTSummary = ({ formData, t }) => {
  console.log("form data in summary component", formData);
  const { pathname: url } = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const mutateScreen = url.includes("/property-mutate/");
  const onEdit = (step) => {
    console.log("on edit step", step);
    if (step === "PersonalDetails") {
      history.push({ pathname: "/digit-ui/citizen/pt/property/edit-step-form", state: { edit: true, currentStepNumber: 1 } });
    }
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
      borderBottom: "1px dashed #e0e0e0",
      padding: "0.5rem 0",
      color: "#333",
    },
    ownerIndex: {
      fontWeight: "600",
      marginBottom: "0.5rem",
    },
  };

  return (
    <>
      {mutateScreen ? (
        <div className="application-summary" />
      ) : (
        <div className="application-summary" style={styles.wrapper}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{t("Application Summary")}</h2>

          {/* Property Address Section */}
          <Card className="summary-section" style={styles.section}>
            <div className="section-content">
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("City")}</CardLabel>
                <div>{formData?.PersonalDetails?.address?.city?.name || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Door/House No.")}</CardLabel>
                <div>{formData?.PersonalDetails?.address?.doorNo || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Building Name")}</CardLabel>
                <div>{formData?.PersonalDetails?.address?.buildingName || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Street Name")}</CardLabel>
                <div>{formData?.PersonalDetails?.address?.street || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Mohalla")}</CardLabel>
                <div>{formData?.PersonalDetails?.address?.locality?.code || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Pincode")}</CardLabel>
                <div>{formData?.PersonalDetails?.address?.pincode || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Existing Property ID")}</CardLabel>
                <div>{formData?.PersonalDetails?.existingPropertyId || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Survey Id/UID")}</CardLabel>
                <div>{formData?.PersonalDetails?.surveyId || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair style={styles.labelFieldPair}>
                <CardLabel>{t("Year of creation of Property")}</CardLabel>
                <div>{formData?.PersonalDetails?.yearOfCreation?.yearOfCreation?.value || "NA"}</div>
              </LabelFieldPair>
            </div>
          </Card>

          {/* Property Details Section */}
          <div className="summary-section" style={styles.section}>
            <div className="section-content">
              {[
                ["Property Usage Type", formData?.PropertyDetails?.usageCategoryMajor?.i18nKey],
                ["Type of Building", formData?.PropertyDetails?.PropertyType?.i18nKey],
                ["Plot Size(sq yards)", `${formData?.PropertyDetails?.landarea || "NA"} sq yards`],
                ["No of Floor", formData?.PropertyDetails?.noOfFloors],
                ["Business Name", formData?.PropertyDetails?.businessName?.businessName],
                ["Remarks", formData?.PropertyDetails?.remarks],
              ].map(([label, value]) => (
                <LabelFieldPair key={label} style={styles.labelFieldPair}>
                  <CardLabel>{t(label)}</CardLabel>
                  <div>{value || "NA"}</div>
                </LabelFieldPair>
              ))}
              {!window.location.href.includes("/citizen") && (
                <>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Vasika No")}</CardLabel>
                    <div>{formData?.PropertyDetails?.vasikaDetails?.vasikaNo || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Vasika Date")}</CardLabel>
                    <div>{formData?.PropertyDetails?.vasikaDetails?.vasikaDate || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Allotment No")}</CardLabel>
                    <div>{formData?.PropertyDetails?.allottmentDetails?.allotmentNo || "NA"}</div>
                  </LabelFieldPair>
                  <LabelFieldPair style={styles.labelFieldPair}>
                    <CardLabel>{t("Allotment Date")}</CardLabel>
                    <div>{formData?.PropertyDetails?.allottmentDetails?.allotmentDate || "NA"}</div>
                  </LabelFieldPair>
                </>
              )}
            </div>
          </div>

          {/* Owner Details Section */}
          <div className="summary-section" style={styles.section}>
            <div className="section-content">
              {formData?.ownerShipDetails?.owners?.map((owner, index) => (
                <div key={index}>
                  {[
                    ["Name", owner.name],
                    ["GUARDIAN NAME", owner.fatherOrHusbandName],
                    ["Gender", owner.gender?.value],
                    ["Ownership Type", formData?.ownerShipDetails?.ownershipCategory?.label],
                    ["MOBILE NO", owner.mobileNumber],
                    ["EMAIL ID", owner.emailId],
                    ["Ownership Percentage", owner.ownershipPercentage],
                    ["Category", owner.ownerType?.code],
                    ["Correspondence Address", owner.correspondenceAddress],
                    ["Document Type", owner.documents?.documentType?.i18nKey],
                    ["Ownership Document ID", owner.documents?.documentUid],
                  ].map(([label, value]) => (
                    <LabelFieldPair key={label} style={styles.labelFieldPair}>
                      <CardLabel>{t(label)}</CardLabel>
                      <div>{value || "NA"}</div>
                    </LabelFieldPair>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Documents Section */}
          <div className="summary-section" style={styles.section}>
            <div className="section-content">
              {formData?.DocummentDetails?.documents?.documents?.map((doc, index) => (
                <LabelFieldPair key={index} style={styles.labelFieldPair}>
                  <CardLabel>{t("Document")}</CardLabel>
                  <div>{doc.documentType || "NA"}</div>
                </LabelFieldPair>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PTSummary;
