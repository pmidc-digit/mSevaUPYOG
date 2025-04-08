import React from "react";
import { CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";

const PTSummary = ({ formData, t, onEdit }) => {
  return (
    <div className="application-summary">
      <h2>{t("Application Summary")}</h2>

      {/* Property Address Section */}
      <div className="summary-section">
        <div className="section-header">
          <h3>{t("Property Address")}</h3>
          <button onClick={() => onEdit("PersonalDetails")}>{t("EDIT")}</button>
        </div>
        <div className="section-content">
          <LabelFieldPair>
            <CardLabel>{t("City")}</CardLabel>
            <div>{formData?.PersonalDetails?.address?.city?.name || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Door/House No.")}</CardLabel>
            <div>{formData?.PersonalDetails?.address?.doorNo || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Colony Name")}</CardLabel>
            <div>{formData?.PersonalDetails?.address?.buildingName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Street Name")}</CardLabel>
            <div>{formData?.PersonalDetails?.address?.street || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Mohalla")}</CardLabel>
            <div>{formData?.PersonalDetails?.address?.locality?.code || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Pincode")}</CardLabel>
            <div>{formData?.PersonalDetails?.address?.pincode || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Existing Property ID")}</CardLabel>
            <div>{formData?.PersonalDetails?.existingPropertyId || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Survey Id/UID")}</CardLabel>
            <div>{formData?.PersonalDetails?.surveyId || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Year of creation of Property")}</CardLabel>
            <div>{formData?.PersonalDetails?.yearOfCreation?.value || "NA"}</div>
          </LabelFieldPair>
        </div>
      </div>

      {/* Property Details Section */}
      <div className="summary-section">
        <div className="section-header">
          <h3>{t("Property Details")}</h3>
          <button onClick={() => onEdit("PropertyDetails")}>{t("EDIT")}</button>
        </div>
        <div className="section-content">
          <LabelFieldPair>
            <CardLabel>{t("Property Usage Type")}</CardLabel>
            <div>{formData?.PropertyDetails?.usageCategoryMajor?.i18nKey || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Type of Building")}</CardLabel>
            <div>{formData?.PropertyDetails?.PropertyType?.i18nKey || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Plot Size(sq yards)")}</CardLabel>
            <div>{formData?.PropertyDetails?.landarea || "NA"} sq yards</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("No of Floor")}</CardLabel>
            <div>{formData?.PropertyDetails?.noOfFloors || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Vasika No")}</CardLabel>
            <div>{formData?.PropertyDetails?.vasikaDetails?.vasikaNo || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Vasika Date")}</CardLabel>
            <div>{formData?.PropertyDetails?.vasikaDetails?.vasikaDate || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Allotment No")}</CardLabel>
            <div>{formData?.PropertyDetails?.allottmentDetails?.allotmentNo || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Allotment Date")}</CardLabel>
            <div>{formData?.PropertyDetails?.allottmentDetails?.allotmentDate || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Business Name")}</CardLabel>
            <div>{formData?.PropertyDetails?.businessName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Remarks")}</CardLabel>
            <div>{formData?.PropertyDetails?.remarks || "NA"}</div>
          </LabelFieldPair>
        </div>
      </div>

      {/* Owner Details Section */}
      <div className="summary-section">
        <div className="section-header">
          <h3>{t("Owner Details")}</h3>
          <button onClick={() => onEdit("ownerShipDetails")}>{t("EDIT")}</button>
        </div>
        <div className="section-content">
          {formData?.ownerShipDetails?.owners?.map((owner, index) => (
            <div key={index}>
              <LabelFieldPair>
                <CardLabel>{t("Name")}</CardLabel>
                <div>{owner.name || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("GUARDIAN NAME")}</CardLabel>
                <div>{owner.fatherOrHusbandName || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Gender")}</CardLabel>
                <div>{owner.gender?.i18nKey || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Type of Ownership")}</CardLabel>
                <div>{formData?.ownerShipDetails?.ownershipCategory?.label || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("MOBILE NO")}</CardLabel>
                <div>{owner.mobileNumber || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("EMAIL ID")}</CardLabel>
                <div>{owner.emailId || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Correspondence Address")}</CardLabel>
                <div>{owner.correspondenceAddress || "NA"}</div>
              </LabelFieldPair>
            </div>
          ))}
        </div>
      </div>

      {/* Documents Section */}
      <div className="summary-section">
        <div className="section-header">
          <h3>{t("Documents")}</h3>
          <button onClick={() => onEdit("DocummentDetails")}>{t("EDIT")}</button>
        </div>
        <div className="section-content">
          {formData?.DocummentDetails?.documents?.documents?.map((doc, index) => (
            <LabelFieldPair key={index}>
              <CardLabel>{t("Document")}</CardLabel>
              <div>{doc.documentType || "NA"}</div>
            </LabelFieldPair>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PTSummary;
