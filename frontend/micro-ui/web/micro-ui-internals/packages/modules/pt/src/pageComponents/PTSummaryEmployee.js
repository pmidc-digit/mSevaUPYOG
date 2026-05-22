import React, { Fragment } from "react";
import { Card, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

function PTSummaryEmployee({ formData, t }) {
  console.log("form data in summary component", formData);
  const { pathname: url } = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const mutateScreen = url.includes("/property-mutate/");
  return (
    <>
      {mutateScreen ? (
        <div className="application-summary" style={{ padding: "8px", fontFamily: "Roboto, sans-serif" }}>
          {/* Helper to render grid item */}
          {(() => {
            const renderGridItem = (label, value, fullWidth = false) => {
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", gridColumn: fullWidth ? "1 / -1" : "auto" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#7A8290", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t(label)}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "500", color: "#1C1D1F" }}>
                    {value || "NA"}
                  </span>
                </div>
              );
            };

            const originalOwners = formData?.originalData?.owners?.filter((e) => e.status === "ACTIVE") || [];
            const transfereeOwners = formData?.TransferorDetails?.owners || [];
            const ownershipCategory = formData?.TransferorDetails?.ownershipCategory?.code || "";
            const isInstitutional = ownershipCategory.includes("INSTITUTIONAL");
            
            const additionalDetails = formData?.TransferorDetails?.additionalDetails || {};
            const remarks = formData?.TransferorDetails?.remarks || additionalDetails?.remarks || "NA";

            // Format Registration Date
            let formattedDate = "NA";
            if (additionalDetails?.documentDate) {
              const d = new Date(additionalDetails.documentDate);
              if (!isNaN(d.getTime())) {
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                formattedDate = `${day}/${month}/${year}`;
              }
            }

            // Extract uploaded documents safely
            let uploadedDocs = [];
            if (formData?.DocuementDetails?.documents) {
              if (Array.isArray(formData.DocuementDetails.documents)) {
                uploadedDocs = formData.DocuementDetails.documents;
              } else if (Array.isArray(formData.DocuementDetails.documents.documents)) {
                uploadedDocs = formData.DocuementDetails.documents.documents;
              }
            } else if (formData?.documents) {
              if (Array.isArray(formData.documents)) {
                uploadedDocs = formData.documents;
              } else if (Array.isArray(formData.documents.documents)) {
                uploadedDocs = formData.documents.documents;
              }
            }

            return (
              <>
                {/* 1. Transferor Details */}
                <Card className="summary-section" style={{ padding: "20px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #E4E7EB" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1C1D1F", borderBottom: "1px solid #E4E7EB", paddingBottom: "12px", marginBottom: "16px" }}>
                    {t("Transferor Details")}
                  </h3>
                  {originalOwners.map((owner, index) => (
                    <div key={index} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: index < originalOwners.length - 1 ? "24px" : "0" }}>
                      {renderGridItem("Name", owner.name)}
                      {renderGridItem("GUARDIAN NAME", owner.fatherOrHusbandName)}
                      {renderGridItem("Gender", owner.gender)}
                      {renderGridItem("Type of Ownership", t(`PT_OWNERSHIP_CATEGORY_${formData?.originalData?.ownershipCategory}`) || formData?.originalData?.ownershipCategory || "NA")}
                      {renderGridItem("MOBILE NO", owner.mobileNumber)}
                      {renderGridItem("EMAIL ID", owner.emailId)}
                      {renderGridItem("Ownership Percentage", owner.ownerShipPercentage)}
                      {renderGridItem("CATEGORY", owner.ownerType)}
                      {renderGridItem("Correspondence Address", owner.correspondenceAddress, true)}
                    </div>
                  ))}
                </Card>

                {/* 2. Transferee Details */}
                <Card className="summary-section" style={{ padding: "20px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #E4E7EB" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1C1D1F", borderBottom: "1px solid #E4E7EB", paddingBottom: "12px", marginBottom: "16px" }}>
                    {t("Transferee Details")}
                  </h3>
                  {transfereeOwners.map((owner, index) => (
                    <div key={index} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: index < transfereeOwners.length - 1 ? "24px" : "0" }}>
                      {isInstitutional ? (
                        <>
                          {renderGridItem("Institution Name", owner.institutionName)}
                          {renderGridItem("Designation", owner.designation)}
                          {renderGridItem("Institution Type", t(owner.institutionType?.code) || owner.institutionType?.code || owner.institutionType)}
                          {renderGridItem("Ownership Type", t(ownershipCategory) || ownershipCategory)}
                          {renderGridItem("Name of Authorized Person", owner.name)}
                          {renderGridItem("Telephone Number", owner.altContactNumber)}
                          {renderGridItem("MOBILE NO", owner.mobileNumber)}
                          {renderGridItem("Correspondence Address", owner.correspondenceAddress, true)}
                        </>
                      ) : (
                        <>
                          {renderGridItem("Name", owner.name)}
                          {renderGridItem("GUARDIAN NAME", owner.fatherOrHusbandName)}
                          {renderGridItem("Gender", t(owner.gender?.code) || owner.gender?.code || owner.gender)}
                          {renderGridItem("Type of Ownership", t(ownershipCategory) || ownershipCategory)}
                          {renderGridItem("MOBILE NO", owner.mobileNumber)}
                          {renderGridItem("EMAIL ID", owner.emailId)}
                          {renderGridItem("Ownership Percentage", owner.ownershipPercentage || owner.ownerShipPercentage)}
                          {renderGridItem("CATEGORY", t(owner.ownerType?.code) || owner.ownerType?.code || owner.ownerType)}
                          {renderGridItem("Correspondence Address", owner.correspondenceAddress, true)}
                        </>
                      )}
                    </div>
                  ))}
                </Card>

                {/* 3. Registration Details */}
                <Card className="summary-section" style={{ padding: "20px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #E4E7EB" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1C1D1F", borderBottom: "1px solid #E4E7EB", paddingBottom: "12px", marginBottom: "16px" }}>
                    {t("Registration Details")}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                    {renderGridItem("Reason for property Transfer", t(additionalDetails?.reasonForTransfer?.code) || additionalDetails?.reasonForTransfer?.name || additionalDetails?.reasonForTransfer?.code || additionalDetails?.reasonForTransfer)}
                    {renderGridItem("Property Market Value", additionalDetails?.marketValue)}
                    {renderGridItem("Registration Document No.", additionalDetails?.documentNumber)}
                    {renderGridItem("Document Issue Date", formattedDate)}
                    {renderGridItem("Registration Document Value", additionalDetails?.documentValue)}
                    {renderGridItem("Remarks", remarks, true)}
                  </div>
                </Card>

                {/* 4. Document */}
                <Card className="summary-section" style={{ padding: "20px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #E4E7EB" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1C1D1F", borderBottom: "1px solid #E4E7EB", paddingBottom: "12px", marginBottom: "16px" }}>
                    {t("Document")}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {uploadedDocs.length > 0 ? (
                      uploadedDocs.map((doc, index) => (
                        <div key={index} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", background: "#F8F9FA", borderRadius: "6px", border: "1px solid #E4E7EB" }}>
                          <span style={{ fontSize: "14px", fontWeight: "500", color: "#1C1D1F" }}>
                            {t(doc?.documentType) || doc?.documentType}
                          </span>
                          {doc?.fileName && (
                            <span style={{ fontSize: "13px", color: "#7A8290", fontStyle: "italic" }}>
                              ({doc.fileName})
                            </span>
                          )}
                          <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: "600", color: "#00875A", background: "#E3FCEF", padding: "2px 8px", borderRadius: "9999px" }}>
                            {t("Uploaded") || "Uploaded"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: "14px", color: "#7A8290" }}>{t("PT_NO_DOCUMENTS_UPLOADED") || "No documents uploaded"}</span>
                    )}
                  </div>
                </Card>
              </>
            );
          })()}
        </div>
      ) : (
        <div className="application-summary">
          <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{t("Application Summary")}</h2>

          {/* Property Address Section */}
          <Card className="summary-section" style={{ padding: "2px" }}>
            <div className="section-content">
              <LabelFieldPair>
                <CardLabel>{t("City")}</CardLabel>
                <div>{formData?.LocationDetails?.address?.city?.name || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Door/House No.")}</CardLabel>
                <div>{formData?.LocationDetails?.address?.doorNo || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Building Name")}</CardLabel>
                <div>{formData?.LocationDetails?.address?.buildingName || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Street Name")}</CardLabel>
                <div>{formData?.LocationDetails?.address?.street || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Mohalla")}</CardLabel>
                <div>{formData?.LocationDetails?.address?.locality?.code || "NA"}</div> {/*LocationDetails.address.locality*/}
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Pincode")}</CardLabel>
                <div>{formData?.LocationDetails?.address?.pincode || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Existing Property ID")}</CardLabel>
                <div>{formData?.LocationDetails?.existingPropertyId || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Survey Id/UID")}</CardLabel>
                <div>{formData?.LocationDetails?.surveyId || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Year of creation of Property")}</CardLabel>
                <div>{formData?.LocationDetails?.yearOfCreation?.yearOfCreation?.value || "NA"}</div>
              </LabelFieldPair>
            </div>
          </Card>

          {/* Property Details Section */}
          <div className="summary-section">
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
              {window.location.href.includes("/citizen") ? null : (
                <LabelFieldPair>
                  <CardLabel>{t("Vasika No")}</CardLabel>
                  <div>{formData?.PropertyDetails?.vasikaDetails?.vasikaNo || "NA"}</div>
                </LabelFieldPair>
              )}
              {window.location.href.includes("/citizen") ? null : (
                <LabelFieldPair>
                  <CardLabel>{t("Vasika Date")}</CardLabel>
                  <div>{formData?.PropertyDetails?.vasikaDetails?.vasikaDate || "NA"}</div>
                </LabelFieldPair>
              )}
              {window.location.href.includes("/citizen") ? null : (
                <LabelFieldPair>
                  <CardLabel>{t("Allotment No")}</CardLabel>
                  <div>{formData?.PropertyDetails?.allottmentDetails?.allotmentNo || "NA"}</div>
                </LabelFieldPair>
              )}
              {window.location.href.includes("/citizen") ? null : (
                <LabelFieldPair>
                  <CardLabel>{t("Allotment Date")}</CardLabel>
                  <div>{formData?.PropertyDetails?.allottmentDetails?.allotmentDate || "NA"}</div>
                </LabelFieldPair>
              )}
              <LabelFieldPair>
                <CardLabel>{t("Business Name")}</CardLabel>
                <div>{formData?.PropertyDetails?.businessName?.businessName || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Remarks")}</CardLabel>
                <div>{formData?.PropertyDetails?.remarks || "NA"}</div>
              </LabelFieldPair>
            </div>
          </div>

          {/* Owner Details Section */}
          <div className="summary-section">
            <div className="section-content">
              {(formData?.ownerShipDetails?.ownershipCategory?.code === "INSTITUTIONALPRIVATE" ||
                formData?.ownerShipDetails?.ownershipCategory?.code === "INSTITUTIONALGOVERNMENT") && (
                <>
                  {formData?.ownerShipDetails?.owners?.map((owner, index) => (
                    <div key={index}>
                      <LabelFieldPair>
                        <CardLabel>{t("Name of Institution")}</CardLabel>
                        <div>{owner?.institutionName || "NA"}</div>
                      </LabelFieldPair>
                      <LabelFieldPair>
                        <CardLabel>{t("Designation")}</CardLabel>
                        <div>{owner?.designation || "NA"}</div>
                      </LabelFieldPair>
                      <LabelFieldPair>
                        <CardLabel>{t("Type of Institution")}</CardLabel>
                        <div>{formData?.ownerShipDetails?.ownershipCategory?.label || "NA"}</div>
                      </LabelFieldPair>

                      <LabelFieldPair>
                        <CardLabel>{t("Telephone No")}</CardLabel>
                        <div>{owner.altContactNumber || "NA"}</div>
                      </LabelFieldPair>
                      <LabelFieldPair>
                        <CardLabel>{t("Name of Authorized person")}</CardLabel>
                        <div>{owner.name || "NA"}</div>
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
                        <CardLabel>{t("Ownership Percentage")}</CardLabel>
                        <div>{owner?.ownershipPercentage || "NA"}</div>
                      </LabelFieldPair>
                      <LabelFieldPair>
                        <CardLabel>{t("Correspondence Address")}</CardLabel>
                        <div>{owner.correspondenceAddress || "NA"}</div>
                      </LabelFieldPair>
                    </div>
                  ))}
                </>
              )}
              {(formData?.ownerShipDetails?.ownershipCategory?.code === "INDIVIDUAL.SINGLEOWNER" ||
                formData?.ownerShipDetails?.ownershipCategory?.code === "INDIVIDUAL.MULTIPLEOWNERS") && (
                <>
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
                        <div>{owner.gender?.value || "NA"}</div>
                      </LabelFieldPair>
                      <LabelFieldPair>
                        <CardLabel>{t("Ownership Type")}</CardLabel>
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
                        <CardLabel>{t("Ownership Percentage")}</CardLabel>
                        <div>{owner.ownershipPercentage || "NA"}</div>
                      </LabelFieldPair>
                      <LabelFieldPair>
                        <CardLabel>{t("Category")}</CardLabel>
                        <div>{owner.ownerType?.code || "NA"}</div>
                      </LabelFieldPair>
                      <LabelFieldPair>
                        <CardLabel>{t("Correspondence Address")}</CardLabel>
                        <div>{owner.correspondenceAddress || "NA"}</div>
                      </LabelFieldPair>
                      <LabelFieldPair>
                        <CardLabel>{t("Document Type")}</CardLabel>
                        <div>{owner.documents?.documentType?.i18nKey || "NA"}</div>
                      </LabelFieldPair>
                      <LabelFieldPair>
                        <CardLabel>{t("Ownership Document ID")}</CardLabel>
                        <div>{owner.documents?.documentUid || "NA"}</div>
                      </LabelFieldPair>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div className="summary-section">
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
      )}
    </>
    // <div className="application-summary">
    //   <h2>{t("Application Summary")}</h2>

    //   {/* Property Address Section */}
    //   <div className="summary-section">
    //     <div className="section-header">
    //       <h3>{t("Property Address")}</h3>
    //       <button onClick={() => onEdit("LocationDetails")}>{t("EDIT")}</button>
    //     </div>
    //     <div className="section-content">
    //       <LabelFieldPair>
    //         <CardLabel>{t("City")}</CardLabel>
    //         <div>{formData?.LocationDetails?.address?.city?.name || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Door/House No.")}</CardLabel>
    //         <div>{formData?.LocationDetails?.address?.doorNo || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Colony Name")}</CardLabel>
    //         <div>{formData?.LocationDetails?.address?.buildingName || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Street Name")}</CardLabel>
    //         <div>{formData?.LocationDetails?.address?.street || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Mohalla")}</CardLabel>
    //         <div>{formData?.LocationDetails?.address?.locality?.code || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Pincode")}</CardLabel>
    //         <div>{formData?.LocationDetails?.address?.pincode || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Existing Property ID")}</CardLabel>
    //         <div>{formData?.LocationDetails?.existingPropertyId || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Survey Id/UID")}</CardLabel>
    //         <div>{formData?.LocationDetails?.surveyId || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Year of creation of Property")}</CardLabel>
    //         <div>{formData?.LocationDetails?.yearOfCreation?.value || "NA"}</div>
    //       </LabelFieldPair>
    //     </div>
    //   </div>

    //   {/* Property Details Section */}
    //   <div className="summary-section">
    //     <div className="section-header">
    //       <h3>{t("Property Details")}</h3>
    //       <button onClick={() => onEdit("PropertyDetails")}>{t("EDIT")}</button>
    //     </div>
    //     <div className="section-content">
    //       <LabelFieldPair>
    //         <CardLabel>{t("Property Usage Type")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.usageCategoryMajor?.i18nKey || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Type of Building")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.PropertyType?.i18nKey || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Plot Size(sq yards)")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.landarea || "NA"} sq yards</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("No of Floor")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.noOfFloors || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Vasika No")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.vasikaDetails?.vasikaNo || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Vasika Date")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.vasikaDetails?.vasikaDate || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Allotment No")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.allottmentDetails?.allotmentNo || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Allotment Date")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.allottmentDetails?.allotmentDate || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Business Name")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.businessName || "NA"}</div>
    //       </LabelFieldPair>
    //       <LabelFieldPair>
    //         <CardLabel>{t("Remarks")}</CardLabel>
    //         <div>{formData?.PropertyDetails?.remarks || "NA"}</div>
    //       </LabelFieldPair>
    //     </div>
    //   </div>

    //   {/* Owner Details Section */}
    //   <div className="summary-section">
    //     <div className="section-header">
    //       <h3>{t("Owner Details")}</h3>
    //       <button onClick={() => onEdit("ownerShipDetails")}>{t("EDIT")}</button>
    //     </div>
    //     <div className="section-content">
    //       {formData?.ownerShipDetails?.owners?.map((owner, index) => (
    //         <div key={index}>
    //           <LabelFieldPair>
    //             <CardLabel>{t("Name")}</CardLabel>
    //             <div>{owner.name || "NA"}</div>
    //           </LabelFieldPair>
    //           <LabelFieldPair>
    //             <CardLabel>{t("GUARDIAN NAME")}</CardLabel>
    //             <div>{owner.fatherOrHusbandName || "NA"}</div>
    //           </LabelFieldPair>
    //           <LabelFieldPair>
    //             <CardLabel>{t("Gender")}</CardLabel>
    //             <div>{owner.gender?.i18nKey || "NA"}</div>
    //           </LabelFieldPair>
    //           <LabelFieldPair>
    //             <CardLabel>{t("Type of Ownership")}</CardLabel>
    //             <div>{formData?.ownerShipDetails?.ownershipCategory?.label || "NA"}</div>
    //           </LabelFieldPair>
    //           <LabelFieldPair>
    //             <CardLabel>{t("MOBILE NO")}</CardLabel>
    //             <div>{owner.mobileNumber || "NA"}</div>
    //           </LabelFieldPair>
    //           <LabelFieldPair>
    //             <CardLabel>{t("EMAIL ID")}</CardLabel>
    //             <div>{owner.emailId || "NA"}</div>
    //           </LabelFieldPair>
    //           <LabelFieldPair>
    //             <CardLabel>{t("Correspondence Address")}</CardLabel>
    //             <div>{owner.correspondenceAddress || "NA"}</div>
    //           </LabelFieldPair>
    //         </div>
    //       ))}
    //     </div>
    //   </div>

    //   {/* Documents Section */}
    //   <div className="summary-section">
    //     <div className="section-header">
    //       <h3>{t("Documents")}</h3>
    //       <button onClick={() => onEdit("DocummentDetails")}>{t("EDIT")}</button>
    //     </div>
    //     <div className="section-content">
    //       {formData?.DocummentDetails?.documents?.documents?.map((doc, index) => (
    //         <LabelFieldPair key={index}>
    //           <CardLabel>{t("Document")}</CardLabel>
    //           <div>{doc.documentType || "NA"}</div>
    //         </LabelFieldPair>
    //       ))}
    //     </div>
    //   </div>
    // </div>
  );
}

export default PTSummaryEmployee;
