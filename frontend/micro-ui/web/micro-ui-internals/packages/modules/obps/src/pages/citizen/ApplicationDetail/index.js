import { StatusTable, Header, CardLabel, Loader, SubmitBar, MultiLink, LinkButton, ActionBar, Menu } from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { pdfDocumentName, pdfDownloadLink, stringReplaceAll } from "../../../utils";
import ApplicationTimeline from "../../../components/ApplicationTimeline";
import { downloadAndPrintReciept } from "../../../utils";
import getAcknowledgementData from "../../../../getAcknowlegment";
import { PDFSvg } from "@mseva/digit-ui-react-components";

const DownloadCertificateButton = ({ applicationNumber }) => {
  const { t } = useTranslation();
  const tenantId = localStorage?.getItem("CITIZEN.CITY");
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const { data: applicationDetails } = Digit.Hooks.obps.useLicenseDetails("pb.punjab", { applicationNumber, tenantId:"pb.punjab" }, {});
  console.log("applicationDetails",applicationDetails)

  const handleDownloadPdf = async () => {
    try {
      const Property = applicationDetails;
      if (!Property) return;

      const propertyTenantId =
        Property?.tenantId || Property?.Licenses?.[0]?.tenantId || Digit.SessionStorage.get("Digit.BUILDING_PERMIT")?.result?.Licenses?.[0]?.tenantId;
      if (!propertyTenantId) return;

      const tenantInfo = tenants?.find((tenant) => tenant.code === propertyTenantId);
      if (!tenantInfo) return;

      const acknowledgementData = await getAcknowledgementData(Property, tenantInfo, t);
      Digit.Utils.pdf.generateFormatted(acknowledgementData);
    } catch (err) {
      console.error("Error generating acknowledgement PDF", err);
    }
  };

  return !applicationDetails ? <Loader /> : <SubmitBar label={t("CS_COMMON_DOWNLOAD_Certificate ")} onSubmit={handleDownloadPdf} />;
};

const ApplicationDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [documents, setDocuments] = useState({});
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const [showOptions, setShowOptions] = useState(false);
  const [dowloadOptions, setDowloadOptions] = useState([]);
  const { id: appNumber } = useParams();
  const params = { applicationNumber: appNumber };
  const stateCode = Digit.ULBService.getStateId();
  const isMobile = window.Digit.Utils.browser.isMobile();
   const [displayMenu, setDisplayMenu] = useState(false);
   const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  // const { data: LicenseData, isLoading } = Digit.Hooks.obps.useBPAREGSearch(tenantId, {}, params);
  // let License = LicenseData?.Licenses?.[0];
  const { data: mdmsRes } = Digit.Hooks.obps.useMDMS(stateCode, "StakeholderRegistraition", "TradeTypetoRoleMapping");
  
  const { data: LicenseDataDynamic, isLoading: isLoadingDynamic } = Digit.Hooks.obps.useBPAREGSearch(tenantId, {}, params);
const { data: LicenseDataPunjab, isLoading: isLoadingPunjab } = Digit.Hooks.obps.useBPAREGSearch("pb.punjab", {}, params);

//  Merge the license data from both tenants
const LicenseData = {
  Licenses: [
    ...(LicenseDataDynamic?.Licenses || []),
    ...(LicenseDataPunjab?.Licenses || [])
  ]
};

let License = LicenseData?.Licenses?.[0];

  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    { tenantId:`${License?.tradeLicenseDetail?.additionalDetail?.Ulb}`, businessService: "BPAREG", consumerCodes: id, isEmployee: false },
    {}
  );

  console.log('reciept_data', reciept_data)
  const handleDownloadPdf = async () => {
    try {
      const Property = applicationDetail;
      if (!Property) return;

      const propertyTenantId =
        Property?.tenantId || Property?.Licenses?.[0]?.tenantId || Digit.SessionStorage.get("Digit.BUILDING_PERMIT")?.result?.Licenses?.[0]?.tenantId;
      if (!propertyTenantId) return;

      const tenantInfo = tenants?.find((tenant) => tenant.code === propertyTenantId);
      if (!tenantInfo) return;

      const acknowledgementData = await getAcknowledgementData(Property, tenantInfo, t);
      Digit.Utils.pdf.generateFormatted(acknowledgementData);
    } catch (err) {
      console.error("Error generating acknowledgement PDF", err);
    }
  };

  const ulbType = tenants?.find((tenant) => tenant.code === tenantId)?.city?.ulbType;
  console.log('ulbType', ulbType)
  console.log(reciept_data, "TOTAL AMOUNT");
    // Call useBPAREGSearch twice - once for dynamic tenant, once for pb.punjab


const { data: applicationDetailDynamic, isLoading: applicationDetailLoadingDynamic } = Digit.Hooks.obps.useLicenseDetails(tenantId, { applicationNumber: id, tenantId }, {});
const { data: applicationDetailPunjab, isLoading: applicationDetailLoadingPunjab } = Digit.Hooks.obps.useLicenseDetails("pb.punjab", { applicationNumber: id, tenantId: "pb.punjab" }, {});

const applicationDetail = applicationDetailDynamic || applicationDetailPunjab;
const applicationDetailLoading = applicationDetailLoadingDynamic || applicationDetailLoadingPunjab;

console.log("applicationDetails 2",LicenseData);

//  Update loading state to check both
const isLoading = isLoadingDynamic || isLoadingPunjab;

  const [viewTimeline, setViewTimeline] = useState(false);
  const menuRef = useRef();
  const applicationDetails= LicenseData
  console.log(applicationDetails, "UUU");
 const history=useHistory();
  let user = Digit.UserService.getUser();

  if (window.location.href.includes("/obps") || window.location.href.includes("/noc")) {
    const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
    const userInfo = userInfos ? JSON.parse(userInfos) : {};
    user = userInfo?.value;
  }

  const userRoles = user?.info?.roles?.map((e) => e.code);

const qualificationType =
  LicenseData?.Licenses?.[0]?.tradeLicenseDetail?.additionalDetail?.qualificationType

  console.log("LicenseData",License);

const isArchitect = qualificationType === "B-Arch";

  
// useBPAREGApplicationActions
  useEffect(() => {
    if (License?.tradeLicenseDetail?.applicationDocuments?.length) {
      const fileStoresIds = License?.tradeLicenseDetail?.applicationDocuments?.map((document) => document?.fileStoreId);
      Digit.UploadServices.Filefetch(fileStoresIds, tenantId.split(".")[0]).then((res) => setDocuments(res?.data));
    }
  }, [License]);


const licenseType = t(`TRADELICENSE_TRADETYPE_${License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}`);


console.log("licenseType:", licenseType);

  useEffect(() => {
    if (License) {
      if (reciept_data?.Payments?.length > 0) {
        setDowloadOptions((prev) => [
          ...(prev || []).filter((item) => item.label !== t("TL_RECEIPT")),
          {
            label: t("TL_RECEIPT"),
            onClick: () =>
              downloadAndPrintReciept(
                reciept_data?.Payments?.[0]?.paymentDetails?.[0]?.businessService || "BPAREG",
                License?.applicationNumber,
                stateCode,
                reciept_data?.Payments,licenseType,
                ulbType
              ),
          }
        ]);
      }
    }
  }, [License, reciept_data]);

  useEffect(() => {
    if (applicationDetail) {
      if (applicationDetail?.applicationData?.status === "APPROVED") {
        setDowloadOptions((prev) => [
          ...(prev || []).filter((item) => item.label !== t("CS_COMMON_DOWNLOAD_Certificate")),
          {
            label: t("CS_COMMON_DOWNLOAD_Certificate"),
            onClick: () =>
              handleDownloadPdf(),
          },
        ]);
      }
    }
  }, [applicationDetailLoadingDynamic, applicationDetailLoadingPunjab]);


  const handleViewTimeline = () => {
    setViewTimeline(true);
    const timelineSection = document.getElementById("timeline");
    if (timelineSection) timelineSection.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) return <Loader />;

  // ---------------- UI Styles ----------------
  const pageStyle = {
    padding: isMobile ? "1rem" : "2rem",
    backgroundColor: "#fbfbfbff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    paddingBottom: "5rem",
  }

  const sectionStyle = {
    backgroundColor: "#ffffff",
    padding: isMobile ? "0.75rem 1rem" : "1rem 1.5rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  }

  const headingStyle = {
    fontSize: isMobile ? "1.2rem" : "1.5rem",
    borderBottom: "2px solid #ccc",
    paddingBottom: "0.3rem",
    color: "#2e4a66",
    marginTop: isMobile ? "1.2rem" : "2rem",
    marginBottom: "1rem",
  }

  const labelFieldPairStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    borderBottom: "1px dashed #e0e0e0",
    padding: "0.5rem 0",
    color: "#333",
    gap: isMobile ? "0.25rem" : "0",
  }

  const boldLabelStyle = { fontWeight: "bold", color: "#555" }

  const renderLabel = (label, value) => (
    <div style={labelFieldPairStyle}>
      <CardLabel style={boldLabelStyle}>{label}</CardLabel>
      <div style={{ wordBreak: "break-word" }}>{value || t("CS_NA")}</div>
    </div>
  )

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(Number(timestamp));

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const dob = typeof License?.tradeLicenseDetail?.owners?.[0]?.dob === "string" ? License?.tradeLicenseDetail?.owners?.[0]?.dob : formatDate(License?.tradeLicenseDetail?.owners?.[0]?.dob)

  const documentsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
  }

  const documentCardStyle = {
    flex: isMobile ? "1 1 100%" : "1 1 calc(50% - 1rem)",
    minWidth: "100%",
    maxWidth: "100%",
    backgroundColor: "#fdfdfd",
    padding: "0.75rem",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  }

  const getFormattedULBName = (ulbCode = "") => {
    if (!ulbCode) return t("BPA_ULB_NOT_AVAILABLE");
    if(typeof ulbCode !== "string") return ""

    const parts = ulbCode.split(".");
    if (parts.length < 2) return ulbCode?.charAt(0)?.toUpperCase() + ulbCode?.slice(1);

    const namePart = parts[1];
    return namePart?.charAt(0)?.toUpperCase() + namePart?.slice(1);
  };

  const ulbName = getFormattedULBName(License?.tradeLicenseDetail?.additionalDetail?.Ulb);

  return (
    <Fragment>
      <div style={pageStyle}>
        {/* Header */}
     


        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
            gap: "1rem",
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "2rem", color: "#2e4a66", marginBottom: "1rem" }}>{t("BPA_TASK_DETAILS_HEADER")}</h2>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              {(recieptDataLoading || applicationDetailLoading) ? (
                <Loader />
              ) : (
                (
                  <MultiLink
                    style={{ position: "static" }}
                    optionsStyle={{ position: "static" }}
                    onHeadClick={() => setShowOptions(!showOptions)}
                    displayOptions={showOptions}
                    options={dowloadOptions}
                  />
                )
              )}
              {/* <DownloadCertificateButton applicationNumber={id} /> */}
              <LinkButton label={t("VIEW_TIMELINE")} onClick={handleViewTimeline} />
            </div>
          </div>

          {(() => {
            const passportPhoto = License?.tradeLicenseDetail?.applicationDocuments?.find(
              (doc) => doc.documentType === "APPL.BPAREG_PASS_PORT_SIZE_PHOTO",
            )

            if (!passportPhoto || !documents[passportPhoto.fileStoreId]) return null

            return (
              <div style={{display: "flex", flexDirection:"column" , alignItems: "center", marginBottom: "1rem"}}>
              <img
                src={documents[passportPhoto.fileStoreId]?.split(",")[0] || "/placeholder.svg"}
                alt="Owner Photograph"
                style={{
                  maxWidth: "120px",
                  maxHeight: "120px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  flexShrink: 0,
                }}
                onError={(e) => {
                  e.target.style.display = "none"
                }}
              />
              <CardLabel style={boldLabelStyle}>{License?.tradeLicenseDetail?.owners?.[0]?.name}</CardLabel>
              </div>
            )
          })()}
        </div>

        {/* Application Details */}
        <div style={sectionStyle}>{renderLabel(t("BPA_APPLICATION_NUMBER_LABEL"), License?.applicationNumber)}</div>

        {/* License Details */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>{t("BPA_LICENSE_DETAILS_LABEL")}</h2>
          {renderLabel(
          t("BPA_QUALIFICATION_TYPE"),
          t(
            License?.tradeLicenseDetail?.additionalDetail?.qualificationType
          )
        )}
          {renderLabel(
            t("BPA_LICENSE_TYPE"),
            t(`TRADELICENSE_TRADETYPE_${License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}`),
          )}
          {License?.licenseNumber && renderLabel(t("BPA_COUNCIL_NUMBER") , License?.licenseNumber)}
          {License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType.includes("ARCHITECT") &&
            renderLabel(
              t("BPA_COUNCIL_OF_ARCH_NO_LABEL"),
              License?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo,
            )}
          {License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType.includes("TOWNPLANNER") &&
            renderLabel(
              t("BPA_ASSOCIATE_OR_FELLOW_NUMBER"),
              License?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo,
            )}
             {License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType.includes("ARCHITECT") &&
            renderLabel(
              t("BPA_CERTIFICATE_EXPIRY_DATE"),
              formatDate(License?.validTo),
            )}
            {License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType.includes("ARCHITECT") ? renderLabel(t("BPA_SELECTED_ULB"), t("BPA_ULB_SELECTED_MESSAGE"))
          : renderLabel(t("BPA_SELECTED_ULB"), ulbName || "NA")}
        </div>

        {/* Applicant Details */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>{t("BPA_LICENSE_DET_CAPTION")}</h2>
          {renderLabel(t("BPA_APPLICANT_NAME_LABEL"), License?.tradeLicenseDetail?.owners?.[0]?.name)}
          {renderLabel(t("BPA_APPLICANT_GENDER_LABEL"), t(License?.tradeLicenseDetail?.owners?.[0]?.gender))}
          {renderLabel(t("BPA_OWNER_MOBILE_NO_LABEL"), License?.tradeLicenseDetail?.owners?.[0]?.mobileNumber)}
          {renderLabel(t("BPA_APPLICANT_EMAIL_LABEL"), License?.tradeLicenseDetail?.owners?.[0]?.emailId)}
          {renderLabel(t("BPA_APPLICANT_DOB_LABEL"), dob)}
        </div>

        {/* Permanent Address */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>{t("BPA_LICENSEE_PERMANENT_LABEL")}</h2>
          {renderLabel(t("BPA_APPLICANT_ADDRESS_LABEL"), License?.tradeLicenseDetail?.owners?.[0]?.permanentAddress)}
          {renderLabel(t("BPA_STATE_TYPE"), t(License?.tradeLicenseDetail?.owners?.[0]?.permanentState))}
          {renderLabel(t("BPA_DISTRICT_TYPE"), t(License?.tradeLicenseDetail?.owners?.[0]?.permanentDistrict))}
          {renderLabel(t("BPA_DETAILS_PIN_LABEL"), License?.tradeLicenseDetail?.owners?.[0]?.permanentPinCode)}
        </div>

        {/* Correspondence Address */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>{t("BPA_CORRESPONDANCE_ADDRESS_LABEL")}</h2>
          {renderLabel(t("BPA_APPLICANT_ADDRESS_LABEL"), License?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress)}
          {renderLabel(t("BPA_STATE_TYPE"), t(License?.tradeLicenseDetail?.owners?.[0]?.correspondenceState))}
          {renderLabel(t("BPA_DISTRICT_TYPE"), t(License?.tradeLicenseDetail?.owners?.[0]?.correspondenceDistrict))}
          {renderLabel(t("BPA_DETAILS_PIN_LABEL"), License?.tradeLicenseDetail?.owners?.[0]?.correspondencePinCode)}
        </div>

        {/* Documents */}

 
        {License?.tradeLicenseDetail?.applicationDocuments?.length > 0 && (
          <div style={sectionStyle}>
            <h2 style={headingStyle}>{t("BPA_DOC_DETAILS_SUMMARY")}</h2>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "1rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f5f5f5",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#2e4a66",
                        width: "100px",
                      }}
                    >
                      {t("BPA_SL_NO")}
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "#2e4a66",
                      }}
                    >
                      {t("BPA_DOCUMENT_TYPE")}
                    </th>
                    <th
                      style={{
                        padding: "0.75rem",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#2e4a66",
                        width: "150px",
                      }}
                    >
                      {t("BPA_ACTION")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {License?.tradeLicenseDetail?.applicationDocuments?.map((document, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.75rem",
                          textAlign: "center",
                          color: "#333",
                          fontWeight: "500",
                        }}
                      >
                        {index + 1}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ color: "#333" }}>
                          {t(`BPAREG_HEADER_${stringReplaceAll(document?.documentType?.toUpperCase(), ".", "_")}`)}
                        </div>
                        {document?.info && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#505A5F",
                              marginTop: "5px",
                            }}
                          >
                            {t(document?.info)}
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          textAlign: "center",
                        }}
                      >
                        <button
                          onClick={() => {
                            const fileUrl = documents[document.fileStoreId]?.split(",")[0]
                            if (fileUrl) {
                              window.open(fileUrl, "_blank")
                            }
                          }}
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#2e4a66",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            transition: "background-color 0.2s",
                          }}
                          onMouseOver={(e) => (e.target.style.backgroundColor = "#1e3a56")}
                          onMouseOut={(e) => (e.target.style.backgroundColor = "#2e4a66")}
                        >
                          {t("BPA_VIEW")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}




         {/* <div style={sectionStyle}>
          <h2 style={headingStyle}>{t("BPA_FEE_DETAILS_LABEL")}</h2>
          {recieptDataLoading ? (
            <Loader />
          ) : (
            <div>
              {renderLabel(t("Total Amount"), reciept_data?.Payments?.[0]?.paymentDetails?.[0]?.totalDue)}
              {renderLabel(t("Status"), reciept_data?.Payments?.[0]?.paymentDetails?.[0]?.totalAmountPaid === reciept_data?.Payments?.[0]?.paymentDetails?.[0]?.totalDue ? t("PAID") : t("PENDING"))}
            </div>
          )}
        </div> */}


        {!(License?.applicationType === "UPGRADE") && <div style={sectionStyle}>
          <h2 style={headingStyle}>{t("BPA_FEE_DETAILS_LABEL")}</h2>

          {recieptDataLoading ? (
            <Loader />
          ) : (
            <div>
              {/* Total Amount (Architect → 0, else actual) */}
              {renderLabel(
                t("Total Amount"),
                isArchitect
                  ? `₹ 0`
                  : reciept_data?.Payments?.[0]?.paymentDetails?.[0]?.totalDue
              )}

              {/* Status */}
              {renderLabel(
                t("Status"),
                reciept_data?.Payments?.[0]?.paymentDetails?.[0]?.totalAmountPaid ===
                  reciept_data?.Payments?.[0]?.paymentDetails?.[0]?.totalDue
                  ? t("PAID")
                  : t("PENDING")
              )}
            </div>
          )}
        </div>}


        {/* Timeline */}
        <div id="timeline" style={sectionStyle}>
          {/* <h2 style={headingStyle}>{t("BPA_TASK_TIMELINE")}</h2> */}
          <ApplicationTimeline id={id} tenantId={License?.tenantId} />
        </div>
      </div>
    </Fragment>
  )
}

export default ApplicationDetails