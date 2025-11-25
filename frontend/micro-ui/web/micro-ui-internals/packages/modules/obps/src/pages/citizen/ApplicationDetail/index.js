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
  const { data: applicationDetails } = Digit.Hooks.obps.useLicenseDetails(tenantId, { applicationNumber, tenantId }, {});

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
      Digit.Utils.pdf.generateBPAREG(acknowledgementData);
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
  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    { tenantId, businessService: "BPAREG", consumerCodes: id, isEmployee: false },
    {}
  );

  const ulbType = tenants?.find((tenant) => tenant.code === tenantId)?.city?.ulbType;
  console.log('ulbType', ulbType)
  console.log(reciept_data, "TOTAL AMOUNT");
    // Call useBPAREGSearch twice - once for dynamic tenant, once for pb.punjab
const { data: LicenseDataDynamic, isLoading: isLoadingDynamic } = Digit.Hooks.obps.useBPAREGSearch(tenantId, {}, params);
const { data: LicenseDataPunjab, isLoading: isLoadingPunjab } = Digit.Hooks.obps.useBPAREGSearch("pb.punjab", {}, params);

//  Merge the license data from both tenants
const LicenseData = {
  Licenses: [
    ...(LicenseDataDynamic?.Licenses || []),
    ...(LicenseDataPunjab?.Licenses || [])
  ]
};

console.log(LicenseData, "LicenseData");

//  Update loading state to check both
const isLoading = isLoadingDynamic || isLoadingPunjab;

let License = LicenseData?.Licenses?.[0];
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

  console.log(qualificationType, "kkkkkkkk");

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
        setDowloadOptions([
          {
            label: t("TL_RECEIPT"),
            onClick: () =>
              downloadAndPrintReciept(
                reciept_data?.Payments?.[0]?.paymentDetails?.[0]?.businessService || "BPAREG",
                License?.applicationNumber,
                License?.tenantId,
                reciept_data?.Payments,licenseType,
                ulbType
              ),
          },
        ]);
      }
    }
  }, [License, reciept_data]);


  const handleViewTimeline = () => {
    setViewTimeline(true);
    const timelineSection = document.getElementById("timeline");
    if (timelineSection) timelineSection.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) return <Loader />;

  const renderLabel = (label, value) => (
    <div >
      <CardLabel >{label}</CardLabel>
      <div >{value || t("CS_NA")}</div>
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


  return (
    <Fragment>
      <div >
        <div
        >
          <div >
            <h2 >{t("BPA_TASK_DETAILS_HEADER")}</h2>
            <div
            >
              {recieptDataLoading ? (
                <Loader />
              ) : (
                reciept_data?.Payments?.length > 0 && (
                  <MultiLink
                    
                    optionsStyle={{ position: "static" }}
                    onHeadClick={() => setShowOptions(!showOptions)}
                    displayOptions={showOptions}
                    options={dowloadOptions}
                  />
                )
              )}
              <DownloadCertificateButton applicationNumber={id} />
              <LinkButton label={t("VIEW_TIMELINE")} onClick={handleViewTimeline} />
            </div>
          </div>

          {(() => {
            const passportPhoto = License?.tradeLicenseDetail?.applicationDocuments?.find(
              (doc) => doc.documentType === "APPL.BPAREG_PASS_PORT_SIZE_PHOTO",
            )

            if (!passportPhoto || !documents[passportPhoto.fileStoreId]) return null

            return (
              <div >
              <img
                src={documents[passportPhoto.fileStoreId]?.split(",")[0] || "/placeholder.svg"}
                alt="Owner Photograph"
              
                onError={(e) => {
                  e.target.style.display = "none"
                }}
              />
              <CardLabel >{License?.tradeLicenseDetail?.owners?.[0]?.name}</CardLabel>
              </div>
            )
          })()}
        </div>

        {/* Application Details */}
        <div >{renderLabel(t("BPA_APPLICATION_NUMBER_LABEL"), License?.applicationNumber)}</div>

        {/* License Details */}
        <div >
          <h2 >{t("BPA_LICENSE_DETAILS_LABEL")}</h2>
          {renderLabel(
            t("BPA_LICENSE_TYPE"),
            t(`TRADELICENSE_TRADETYPE_${License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}`),
          )}
          {License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType.includes("ARCHITECT") &&
            renderLabel(
              t("BPA_COUNCIL_OF_ARCH_NO_LABEL"),
              License?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo,
            )}
             {License?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType.includes("ARCHITECT") &&
            renderLabel(
              t("BPA_CERTIFICATE_EXPIRY_DATE"),
              formatDate(License?.validTo),
            )}
        </div>

        {/* Applicant Details */}
        <div >
          <h2 >{t("BPA_LICENSE_DET_CAPTION")}</h2>
          {renderLabel(t("BPA_APPLICANT_NAME_LABEL"), License?.tradeLicenseDetail?.owners?.[0]?.name)}
          {renderLabel(t("BPA_APPLICANT_GENDER_LABEL"), t(License?.tradeLicenseDetail?.owners?.[0]?.gender))}
          {renderLabel(t("BPA_OWNER_MOBILE_NO_LABEL"), License?.tradeLicenseDetail?.owners?.[0]?.mobileNumber)}
          {renderLabel(t("BPA_APPLICANT_EMAIL_LABEL"), License?.tradeLicenseDetail?.owners?.[0]?.emailId)}
        </div>

        {/* Permanent Address */}
        <div>
          <h2 >{t("BPA_LICENSEE_PERMANENT_LABEL")}</h2>
          {renderLabel(t("BPA_APPLICANT_ADDRESS_LABEL"), License?.tradeLicenseDetail?.owners?.[0]?.permanentAddress)}
        </div>

        {/* Correspondence Address */}
        <div >
          <h2 >{t("BPA_CORRESPONDANCE_ADDRESS_LABEL")}</h2>
          {renderLabel(t("Address"), License?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress)}
        </div>

        {/* Documents */}

 
        {License?.tradeLicenseDetail?.applicationDocuments?.length > 0 && (
          <div >
            <h2 >{t("BPA_DOC_DETAILS_SUMMARY")}</h2>
            <div >
              <table
               
              >
                <thead>
                  <tr
                  
                  >
                    <th
                     
                    >
                      {t("BPA_SL_NO")}
                    </th>
                    <th
                    
                    >
                      {t("BPA_DOCUMENT_TYPE")}
                    </th>
                    <th
                     
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


        <div style={sectionStyle}>
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
        </div>


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