import {
  Card,
  CardSubHeader,
  Header,
  LinkButton,
  Loader,
  Row,
  StatusTable,
  MultiLink,
  PopUp,
  Toast,
  SubmitBar,
  ActionBar,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import getPetAcknowledgementData from "../../getPetAcknowledgementData";
import PTRWFApplicationTimeline from "../../pageComponents/PTRWFApplicationTimeline";
import { pdfDownloadLink } from "../../utils";
import PTRDocument from "../../pageComponents/PTRDocument";
import get from "lodash/get";
import { size } from "lodash";
import QRCode from "qrcode";
const PTRApplicationDetails = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { acknowledgementIds } = useParams();
  const [acknowldgementData, setAcknowldgementData] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const isCitizen = window.location.href.includes("citizen");
  const [popup, setpopup] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [approver, setApprover] = useState(null);
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");

  const pathname = window.location.pathname;
  // take the part after "/application/"
  const afterApplication = pathname.split("/application/")[1];
  // split into segments
  const parts = afterApplication.split("/");
  // last part = tenantId (pb.testing, pb.mohali etc.)
  const tenantIdPop = parts.pop();
  // remaining = application number (can have slashes or hyphens)
  let applicationNumber = parts.join("/");

  // decode '%20' → ' ' and any other encoded characters
  applicationNumber = decodeURIComponent(applicationNumber);

  console.log("applicationNumber", applicationNumber);

  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  const tenantInfo = tenants?.find((tenant) => tenant?.code === tenantId);
  console.log("tenantInfo", tenantInfo);
  const { isLoading, isError, error, data } = Digit.Hooks.ptr.usePTRSearch({
    tenantId,
    filters: { applicationNumber },
  });

  console.log("data====", data);

  const [billData, setBillData] = useState(null);

  const ulb = tenantInfo?.city?.name;
  const ulbType = tenantInfo?.city?.ulbType;
  const PetRegistrationApplications = get(data, "PetRegistrationApplications", []);

  const pet_details = (PetRegistrationApplications && PetRegistrationApplications.length > 0 && PetRegistrationApplications[0]) || {};
  const application = pet_details;

  const { data: approverData, isLoading: approverDataLoading } = Digit.Hooks.useWorkflowDetails({
    tenantId,
    id: applicationNumber,
    moduleCode: "ptr",
  });

  useEffect(() => {
    if (!approverDataLoading && approverData) {
      const name = approverData?.processInstances?.[1]?.assigner?.name;
      setApprover(name);
    }
  }, [approverDataLoading, approverData]);

  // sessionStorage.setItem("ptr-pet", JSON.stringify(application));

  const [loading, setLoading] = useState(false);

  const fetchBillData = async () => {
    setLoading(true);
    const result = await Digit.PaymentService.fetchBill(tenantId, {
      businessService: "pet-services",
      consumerCode: applicationNumber,
    });

    setBillData(result);
    setLoading(false);
  };
  useEffect(() => {
    fetchBillData();
  }, [tenantId, applicationNumber]);

  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "pet-services",
      consumerCodes: applicationNumber,
      isEmployee: false,
    },
    { enabled: applicationNumber ? true : false }
  );

  if (!pet_details.workflow) {
    const workflow = {
      id: null,
      tenantId: tenantId,
      businessService: "pet-services",
      businessId: application?.applicationNumber,
      action: "",
      moduleName: "pet-services",
      state: null,
      comment: null,
      documents: null,
      assignes: null,
    };
    pet_details.workflow = workflow;
  }

  const printCertificate = async () => {
    const qrDataURL = await QRCode.toDataURL(window.location.href);

    try {
      if (!data?.PetRegistrationApplications?.[0]) {
        throw new Error("Pet registration data is missing");
      }

      const createCertificateHTML = () => {
        const petData = data.PetRegistrationApplications[0];
        const currentDate = new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        const petImage = petData?.documents?.find((doc) => doc?.documentType === "PET.PETPHOTO");

        const petImageUrl = petImage?.filestoreId
          ? `${window.location.origin}/filestore/v1/files/id?tenantId=pb&fileStoreId=${petImage.filestoreId}`
          : `${window.location.origin}/adorable-golden-retriever.png`;

        const content = `
          <html>
            <head>
              <title>Pet Registration Certificate</title>
              <style>
                @page { margin: 0.5in; }
                body { 
                  font-family: 'Times New Roman', serif; 
                  margin: 0; 
                  font-size: 11px;
                }
                .certificate-container {
                  max-width: 800px;
                  margin: 0 auto;
                  border: 3px solid #000;
                  background: white;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  text-align: center;
                  margin-bottom: 5px;
                  position: relative;
                }
                  .header-value{
                    border: none;
                    display: flex;
                    text-align: center;
                  }
                .header-center {
                  text-align: center;
                  flex: 1;
                  padding-right: 80px
                }
                .header-disclaimer {
                  text-align: center;
                  flex: 1;
                }
                .header-right {
                  flex: 0 0 auto;
                }
                .title {
                  font-size: 13px;
                  font-weight: bold;
                  margin: 10px 0;
                }
                .subtitle {
                  font-size: 10px;
                  color: #666;
                }
                .main-content {
                  display: flex;
                  gap: 10px;
                  margin: 10px 0;
                  align-items:flex-start;
                  margin-bottom: -13px;
                }
                .details-section {
                }
                .pet-image-section {
                  flex-shrink: 0;
                  text-align: center;
                  order: 2;
                }
                .pet-image {
                  width: 100px;
                  max-width: 100%;
                  aspect-ratio : 1 / 1;
                  height: auto;
                  border: 2px solid #000;
                  object-fit: cover;
                  margin-bottom: 10px;
                  border-right-width: 2px;
                  margin-right: 50px;
                  margin-top: 20px;
                  display: block;
                }
                .image-label {
                  font-size: 12px;
                  font-weight: bold;
                  text-align: center;
                  border-right-width: 30px;
                  margin-right: 50px;
                }
                .details-grid {
                  display: grid;
                  grid-template-columns: 290px 280px;
                  overflow: hidden;
                  margin: 10px 0;
                  margin-left : 40px;
                }
                .detail-row {
                display: grid;
                grid-template-columns: 140px 180px;
                overflow:hidden;
                border: 1px solid black;
              }
                .detail-label {
                font-weight: bold;
                white-space: normal;    
                word-break: break-word; 
                margin-left: 10px;
                flex-shrink: 1;         
                }
                .detail-value {
                  padding-bottom: 2px;
                  margin-right: 10px;
                }
                .owner-section {
                  margin: 5px 40px;
                  margin-bottom: 0px;
                  display: grid;
                  grid-template-columns: 50%;
                }
                .footer-section {
                  margin: 0px 40px;
                  display: flex;
                  justify-content: space-between;
                  align-items: anchor-center;
                }
                .signature-area {
                  text-align: center;
                  min-width: 200px;
                }
                .signature-line {
                  border-top: 1px solid #000;
                  margin: 10px 0 5px 0;
                }
                  .pet-sub {
                  font-size: 10px;
                  margin: 5px 0;
                  color: #666;
                  font-weight: bold;
                }
                .terms-section {
                  border-top: 2px solid #000;
                  padding-top: 5px;
                  font-size: 11px;
                  margin: 0px 10px;
                }
                .terms-title {
                  font-weight: bold;
                  margin-bottom: 10px;
                }
                .terms-list {
                  margin: 0;
                  padding-left: 20px;
                }
                .terms-list li {
                  margin-bottom: 2px;
                  text-align: left;
                }
                @media print {
                  body { background: white !important; }
                }
                @media (max-width: 700px) {   
                .main-content {
                  flex-wrap: wrap;
                }
                .pet-image {
                  width: 100px;           
                  max-width: 100%;
                  height: auto;
                  aspect-ratio: 1/1;
                }
                .dis-section{
                  font-size: 12px;
                  margin: 0px 10px;
                }
              }
              </style>
            </head>
            <body>
              <div class="certificate-container">
              <div class="header">
              <div>
                <img src="https://s3.ap-south-1.amazonaws.com/pb-egov-assets/${petData?.tenantId}/logo.png" 
                    style="width: 80px; height: 80px; padding-left: 20px; padding-top: 5px;" />
              </div>
              <div class="header-center">
                <div class="title">${t(ulbType)} ${t(ulb)}</div>
                  <div class="subtitle">${t("Veterinary Services- Health Branch")}</div>
                  <div class="pet-sub">Pet Registration Certificate</div>
                  <div class="subtitle">(U/S 399 (1)(E) of PMC Act,1976)</div>
              </div>
              <div class="header-right">
              </div>
            </div>
                <span class="header-value">This is to certify that the ${petData?.petDetails?.petType || "Dog"} kept by Mr./Mrs./Ms. ${
          petData?.owner?.name || "Not Specified"
        } at ${petData?.address?.addressId || "Not Specified"}, ${petData?.address?.pincode || ""} mobile no. ${
          petData?.owner?.mobileNumber || "Not Specified"
        } is registered with ${ulbType} ${ulb} as per following details:</span>
                <div class="main-content">
                  <div class="details-section">
                    <span class="detail-label">Pet Information</span> <br>
                    <span class="detail-label">Registration No:</span> <span class="detail-label">${petData?.petRegistrationNumber || ""}</span>
                    <div class="details-grid">                      
                      <div class="detail-row">
                        <span class="detail-label">Category</span>
                        <span class="detail-value">${petData?.petDetails?.petType || "Dog"}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Breed</span>
                        <span class="detail-value">${petData?.petDetails?.breedType || "Not Specified"}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Name of Animal</span>
                        <span class="detail-value">${petData?.petDetails?.petName || "Not Specified"}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Gender</span>
                        <span class="detail-value">${petData?.petDetails?.petGender || "Not Specified"}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Pet Age</span>
                        <span class="detail-value">${formatPetAge(petData?.petDetails?.petAge, t) || t("CS_NA")}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Colour</span>
                        <span class="detail-value">${petData?.petDetails?.petColor || "Not Specified"}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Application Number</span>
                        <span class="detail-value">${petData?.applicationNumber || "Not Specified"}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Token No</span>
                        <span class="detail-value">${petData?.petToken || "Not Specified"}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Issue Date</span>
                         <span class="detail-value">
                       ${
                         petData?.auditDetails?.lastModifiedTime
                           ? new Date(petData.auditDetails?.lastModifiedTime).toLocaleDateString("en-GB")
                           : "N/A"
                       }
                      </span>
                      </div>

                      <div class="detail-row">
                        <span class="detail-label">License Valid Upto</span>
                      <span class="detail-value">
                       ${petData?.validityDate ? new Date(petData.validityDate * 1000).toLocaleDateString("en-GB") : "N/A"}
                        
                      </span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Amount</span>
                        <span class="detail-value">Rs. ${reciept_data?.Payments?.[0]?.totalAmountPaid || "Not Specified"}/-</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">G8/Receipt No</span>
                        <span class="detail-value">${reciept_data?.Payments?.[0]?.paymentDetails?.[0]?.receiptNumber || "Not Specified"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="pet-image-section">
                    <img 
                      src="${petImageUrl}" 
                      alt="Pet Photo" 
                      class="pet-image" 
                      onload="console.log('Pet image loaded successfully:', this.src);" 
                      onerror="console.log('Pet image failed to load:', this.src); console.log('Trying fallback image...'); this.src='/adorable-golden-retriever.png';" 
                    />
                    <div class="image-label">Pet Photo</div>
                    <script>
                      console.log('Image URL being used:', '${petImageUrl}');
                      console.log('Pet image data:', ${JSON.stringify(petImage)});
                    </script>
                  </div>
                </div>

                <span class="detail-label">Owner Information</span>
                <div class="owner-section">
                  <div class="detail-row">
                    <span class="detail-label">Owner Name</span>
                    <span class="detail-value">${petData?.owner?.name || "Not Specified"}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Father/Spouse Name</span>
                    <span class="detail-value">${petData?.fatherName || petData?.owner?.fatherOrHusbandName || "Not Specified"}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Address</span>
                    <span class="detail-value">${petData?.address?.addressId || "Not Specified"}, ${petData?.address?.pincode || ""}</span>
                  </div>
                </div>

                <div class="header">
                <div class="header-left"> </div>
                  <div class="header-disclaimer">
                    <div class="title">DISCLAIMER</div>
                    <div class="dis-section">${t("PET_DISCLAIMER")}</div>
                    <div class="header-right"></div>
                  </div>
                </div>

                <div class="footer-section">
                  <div>
                    <div>Date:........................</div>
                    <div>Place:.......................</div>
                  </div>
                  <div class="signature-area">
                    <div class="detail-label">Approved by</div>
                    <span class="detail-value">${approver || "Not Specified"}</span>
                    <div class="signature-line"></div>
                    <div>Licensing Authority</div>
                    <div>${t(ulbType)}</div>
                 
                  </div>
                </div>

                <div class="terms-section">
                  <div class="terms-title">${t("TERMS AND CONDITIONS")}</div>
                  <div class="terms-title">${t("PET_TERMS_HEADER")}</div>
                  <ol class="terms-list">
                    <li>${t("PET_TERM1A")} <strong> ${petData?.petRegistrationNumber || ""} </strong> ${t(
          "PET_TERM1B"
        )} <strong>'https://mseva.lgpunjab.gov.in/digit-ui/citizen/ptr-home'</strong></li>
                    <li>${t("PET_NEW_TERM_2")}</li>
                    <li>${t("PET_NEW_TERM_3")}</li>
                    <li>${t("PET_NEW_TERM_4")}</li>
                    <li>${t("PET_NEW_TERM_5")}</li>
                    <li>${t("PET_NEW_TERM_6")}</li>
                    <li>${t("PET_NEW_TERM_7")}</li>
                    <li>${t("PET_NEW_TERM_8")}</li>
                    <li>${t("PET_NEW_TERM_9")}</li>
                    <li>${t("PET_NEW_TERM_10")}</li>
                    <li>${t("PET_NEW_TERM_11")}</li>
                    <li>${t("PET_NEW_TERM_12")}</li>
                    <li>${t("PET_NEW_TERM_13")}</li>
                    <li>${t("PET_NEW_TERM_14")}</li>
                    <li>${t("PET_NEW_TERM_15")}</li>
                    <li>${t("PET_NEW_TERM_16")}</li>
                  </ol>

                  <div style="text-align: center;">
                    <img src="${qrDataURL}" style="width: 100px; height: 100px;" />
                </div>
                </div>
              </div>
            </body>
          </html>
        `;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(content);
        printWindow.document.close();

        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            printWindow.onafterprint = () => {
              printWindow.close();
            };
          }, 500);
        };
      };

      createCertificateHTML();
      setShowToast({
        key: false,
        label: "PTR_CERTIFICATE_DOWNLOADED_SUCCESSFULLY",
      });
    } catch (error) {
      setShowToast({
        key: true,
        label: `PTR_CERTIFICATE_DOWNLOAD_ERROR: ${error.message}`,
      });
    }
  };

  const downloadAcknowledgement = async () => {
    try {
      if (!data?.PetRegistrationApplications?.[0]) {
        throw new Error("Pet registration data is missing");
      }

      const createAcknowledgementHTML = () => {
        const petData = data.PetRegistrationApplications[0];
        const ulb = petData?.tenantId.split(".")[1];
        const currentDate = new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

        const content = `
          <html>
            <head>
              <title>Pet Registration Acknowledgement</title>
              <style>
                @page { margin: 0.5in; }
                body { 
                  font-family: 'Arial', sans-serif; 
                  margin: 0; 
                  padding: 20px;
                  font-size: 14px;
                  line-height: 1.6;
                }
                .acknowledgement-container {
                  max-width: 800px;
                  margin: 0 auto;
                  border: 2px solid #333;
                  padding: 30px;
                  background: white;
                }
                .header {
                  text-align: center;
                  border-bottom: 2px solid #333;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  position: relative;
                }
                  .header-center {
                  text-align: center;
                  flex: 1;
                  padding-right: 80px
                }
                  .header-right {
                  flex: 0 0 auto;
                }
                .title {
                  font-size: 20px;
                  font-weight: bold;
                  margin: 10px 0;
                  color: #333;
                }
                .subtitle {
                  font-size: 16px;
                  margin: 5px 0;
                  color: #666;
                }
                  .pet-sub {
                  font-size: 16px;
                  margin: 5px 0;
                  color: #666;
                  font-weight: bold;
                }
                .acknowledgement-text {
                  text-align: justify;
                  font-size: 15px;
                }
                .details-table {
                  width: 100%;
                  border-collapse: collapse;
                }
                .details-table th,
                .details-table td {
                  padding: 12px;
                  text-align: left;
                  border: 1px solid #ddd;
                }
                .details-table th {
                  background: #f5f5f5;
                  font-weight: bold;
                  width: 40%;
                }
                .footer {
                  text-align: center;
                  font-size: 12px;
                  color: #666;
                }
                @media print {
                  body { background: white !important; }
                }
              </style>
            </head>
            <body>
              <div class="acknowledgement-container">
                <div class="header">
              <div>
                <img src="https://s3.ap-south-1.amazonaws.com/pb-egov-assets/${petData?.tenantId}/logo.png" 
                    style="width: 110px; height: 110px; padding-left: 20px; padding-bottom: 20px;" />
              </div>
              <div class="header-center">
                <div class="title">${t(ulbType)} ${t(ulb)}</div>
                  <div class="subtitle">${t("Veterinary Services- Health Branch")}</div>
                  <div class="pet-sub">Pet Registration Acknowledgment</div>
                  <div class="subtitle">(U/S 399 (1)(E) of PMC Act,1976)</div>
              </div>
              <div class="header-right">
              </div>
            </div>
                
                <div class="acknowledgement-text">
                ${t("PTR_ACKN_TERM_1")}
              </div>

                <table class="details-table">
                  <tr>
                    <th>Application Number</th>
                    <td>${petData?.applicationNumber || "Not Available"}</td>
                  </tr>
                  <tr>
                    <th>Application Date</th>
                    <td>${currentDate}</td>
                  </tr>
                  <tr>
                    <th>Pet Name</th>
                    <td>${petData?.petDetails?.petName || "Not Specified"}</td>
                  </tr>
                  <tr>
                    <th>Pet Type</th>
                    <td>${petData?.petDetails?.petType || "Not Specified"}</td>
                  </tr>
                  <tr>
                    <th>Breed</th>
                    <td>${petData?.petDetails?.breedType || "Not Specified"}</td>
                  </tr>
                  <tr>
                    <th>Owner Name</th>
                    <td>${petData?.owner?.name || "Not Specified"}</td>
                  </tr>
                  <tr>
                    <th>Contact Number</th>
                    <td>${petData?.owner?.mobileNumber || "Not Specified"}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>${petData?.owner?.emailId || "Not Specified"}</td>
                  </tr>
                  <tr>
                    <th>Application Status</th>
                    <td style="color: #28a745; font-weight: bold;">${t(petData?.status) || "SUBMITTED"}</td>
                  </tr>
                </table>
                
                <div class="acknowledgement-text">
                  ${t("PTR_ACKN_TERM_2")}
                </div>

                
                <div class="footer">
                  <p>Generated on: ${currentDate}</p>
                  <p>${t(ulbType)}</p>
                  <p>This is a computer-generated document and does not require a signature.</p>
                  <p>https://mseva.lgpunjab.gov.in/digit-ui/citizen/ptr-home</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(content);
        printWindow.document.close();

        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            printWindow.onafterprint = () => {
              printWindow.close();
            };
          }, 500);
        };
      };

      createAcknowledgementHTML();
      setShowToast({
        key: false,
        label: "PTR_ACKNOWLEDGEMENT_DOWNLOADED_SUCCESSFULLY",
      });
    } catch (error) {
      setShowToast({
        key: true,
        label: `PTR_ACKNOWLEDGEMENT_DOWNLOAD_ERROR: ${error.message}`,
      });
    }
  };

  let documentDate = t("CS_NA");
  if (pet_details?.additionalDetails?.documentDate) {
    const date = new Date(pet_details?.additionalDetails?.documentDate);
    const month = Digit.Utils.date.monthNames[date.getMonth()];
    documentDate = `${date.getDate()} ${month} ${date.getFullYear()}`;
  }

  async function getRecieptSearch({ tenantId, payments, ...params }) {
    let response = { filestoreIds: [payments?.fileStoreId] };
    response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments }] }, "petservice-receipt");
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");
  }

  const dowloadOptions = [];

  dowloadOptions.push({
    label: t("PTR_PET_DOWNLOAD_ACK_FORM"),
    onClick: () => downloadAcknowledgement(),
  });

  if (reciept_data?.Payments[0]?.paymentStatus === "NEW" || reciept_data?.Payments[0]?.paymentStatus === "DEPOSITED") {
    dowloadOptions.push({
      label: t("PTR_CERTIFICATE"),
      onClick: () => {
        printCertificate();
      },
    });
  } else {
    console.log("Certificate not available. Payment status:", reciept_data?.Payments[0]?.paymentStatus);
  }

  if (reciept_data && reciept_data?.Payments.length > 0 && !recieptDataLoading) {
    dowloadOptions.push({
      label: t("PTR_FEE_RECIEPT"),
      onClick: () => getRecieptSearch({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
    });
  }

  // const formatPetAge = (ageValue, t) => {
  //   if (ageValue === null || ageValue === undefined || ageValue === "") return t("CS_NA");

  //   const ageStr = String(ageValue).trim();
  //   // accept numeric-like strings only
  //   if (!/^\d+(\.\d+)?$/.test(ageStr)) return t("CS_NA");

  //   const [yearsPart, decPart] = ageStr.split(".");
  //   let years = Number(yearsPart) || 0;
  //   let months = 0;

  //   if (decPart) {
  //     if (decPart.length === 1) {
  //       // .5 -> 5 months
  //       months = parseInt(decPart, 10);
  //     } else {
  //       // take first two digits: .11 -> 11 months, .5x -> 50 -> will be handled below
  //       months = parseInt(decPart.slice(0, 2), 10);
  //     }
  //     if (isNaN(months)) months = 0;
  //   }

  //   // Clamp months to 0..11 (or convert overflow to years if you prefer)
  //   if (months > 11) months = 11;

  //   if (years === 0 && months === 0) return t("CS_NA");
  //   if (years === 0) return `${months} month${months > 1 ? "s" : ""}`;
  //   if (months === 0) return `${years} year${years > 1 ? "s" : ""}`;
  //   return `${years} year${years > 1 ? "s" : ""} and ${months} month${months > 1 ? "s" : ""}`;
  // };

  const formatPetAge = (ageValue, t) => {
    if (!ageValue) return t("CS_NA");

    let ageStr = String(ageValue).trim();

    // --------------------------
    // CASE 1: DECIMAL NUMBER
    // --------------------------
    if (/^\d+(\.\d+)?$/.test(ageStr)) {
      const [yearsPart, decPart] = ageStr.split(".");
      let years = Number(yearsPart) || 0;
      let months = 0;

      if (decPart) {
        // "8" -> 8 months
        // "80" -> 80 -> clamp later
        months = parseInt(decPart.slice(0, 2), 10);
        if (isNaN(months)) months = 0;
        if (months > 11) months = 11; // clamp
      }

      if (years === 0 && months === 0) return t("CS_NA");
      if (years === 0) return `${months} month${months > 1 ? "s" : ""}`;
      if (months === 0) return `${years} year${years > 1 ? "s" : ""}`;
      return `${years} year${years > 1 ? "s" : ""} and ${months} month${months > 1 ? "s" : ""}`;
    }

    // --------------------------
    // CASE 2: TEXT FORMAT (e.g. "14 months", "2 Years 3 Months")
    // --------------------------
    const regex = /(\d+)\s*(year|years|yr|yrs|month|months|mo|mos)/gi;
    const matches = ageStr.matchAll(regex);

    let years = 0;
    let months = 0;

    for (const match of matches) {
      const num = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();

      if (unit.includes("year") || unit.includes("yr")) years = num;
      if (unit.includes("month") || unit.includes("mo")) months = num;
    }

    if (years === 0 && months === 0) return t("CS_NA");

    if (years === 0) return `${months} month${months > 1 ? "s" : ""}`;
    if (months === 0) return `${years} year${years > 1 ? "s" : ""}`;
    return `${years} year${years > 1 ? "s" : ""} and ${months} month${months > 1 ? "s" : ""}`;
  };

  return (
    <React.Fragment>
      <div>
        <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
          <Header styles={{ fontSize: "32px" }}>{t("CS_APPLICATION_DETAILS")}</Header>
          {dowloadOptions && dowloadOptions.length > 0 && (
            <MultiLink
              className="multilinkWrapper"
              onHeadClick={() => setShowOptions(!showOptions)}
              displayOptions={showOptions}
              options={dowloadOptions}
            />
          )}
        </div>
        <Card>
          {/* <StatusTable>
          </StatusTable> */}

          <CardSubHeader style={{ fontSize: "24px" }}>{t("ES_TITLE_APPLICANT_DETAILS")}</CardSubHeader>
          <StatusTable>
            {pet_details?.petRegistrationNumber && (
              <Row className="border-none" label={t("PTR_REGISTRATION_NUMBER")} text={pet_details?.petRegistrationNumber} />
            )}
            <Row className="border-none" label={t("PDF_STATIC_LABEL_APPLICATION_NUMBER_LABEL")} text={pet_details?.applicationNumber} />
            <Row className="border-none" label={t("REPORT_FSM_RESULT_APPLICANTNAME")} text={pet_details?.owner?.name || t("CS_NA")} />
            {pet_details?.owner?.fatherOrHusbandName && (
              <Row
                className="border-none"
                label={t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL")}
                text={pet_details?.owner?.fatherOrHusbandName || t("CS_NA")}
              />
            )}
            <Row className="border-none" label={t("MOBILE")} text={pet_details?.owner?.mobileNumber || t("CS_NA")} />
            <Row className="border-none" label={t("CORE_COMMON_PROFILE_EMAIL")} text={pet_details?.owner?.emailId || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("WS_COMMON_TABLE_COL_ADDRESS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("PTR_ADDRESS")} text={pet_details?.address?.addressId || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_PINCODE")} text={pet_details?.address?.pincode || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("ES_TITILE_PET_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("PTR_PET_NAME")} text={pet_details?.petDetails?.petName || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_SEARCH_PET_TYPE")} text={pet_details?.petDetails?.petType || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_SEARCH_BREED_TYPE")} text={pet_details?.petDetails?.breedType || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_PET_AGE")} text={formatPetAge(pet_details?.petDetails?.petAge, t) || t("CS_NA")} />

            <Row className="border-none" label={t("PTR_PET_GENDER")} text={pet_details?.petDetails?.petGender || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_COLOR")} text={pet_details?.petDetails?.petColor || t("CS_NA")} />

            <Row
              className="border-none"
              label={t("PTR_VACCINATED_DATE")}
              // text={pet_details?.petDetails?.lastVaccineDate || t("CS_NA")}
              // text={
              //   pet_details?.petDetails?.lastVaccineDate
              //     ? new Date(Number(pet_details?.petDetails?.lastVaccineDate)).toLocaleDateString("en-IN", {
              //         day: "2-digit",
              //         month: "2-digit",
              //         year: "numeric",
              //       })
              //     : t("CS_NA")
              // }
              text={(() => {
                const rawDate = pet_details?.petDetails?.lastVaccineDate;
                if (!rawDate) return t("CS_NA");

                let dateObj;

                // Check if it's numeric (timestamp) or ISO-like (string date)
                if (!isNaN(rawDate)) {
                  // Convert numeric string to number
                  const timestamp = Number(rawDate);
                  // Handle timestamps in seconds (10 digits) or milliseconds (13 digits)
                  dateObj = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
                } else {
                  // Parse "YYYY-MM-DD" or similar string
                  dateObj = new Date(rawDate);
                }

                // Check if valid date
                if (isNaN(dateObj.getTime())) return t("CS_NA");

                // Return in DD/MM/YYYY format
                return dateObj.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
              })()}
            />
            <Row className="border-none" label={t("PTR_VACCINATION_NUMBER")} text={pet_details?.petDetails?.vaccinationNumber || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_DOCTOR_NAME")} text={pet_details?.petDetails?.doctorName || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_CLINIC_NAME")} text={pet_details?.petDetails?.clinicName || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("ES_TITLE_DOCS")}</CardSubHeader>
          <div>
            {Array.isArray(application?.documents) && application.documents.length > 0 ? (
              <PTRDocument
                petdetail={{
                  documents: application.documents, // ✅ pass all docs
                  applicationNumber: application.applicationNumber,
                }}
              />
            ) : (
              <StatusTable>
                <Row className="border-none" text={t("PTR_NO_DOCUMENTS_MSG")} />
              </StatusTable>
            )}
          </div>

          <PTRWFApplicationTimeline application={application} id={application?.applicationNumber} userType={"citizen"} />
          {showToast && (
            <Toast
              error={showToast.key}
              label={t(showToast.label)}
              style={{ bottom: "0px" }}
              isDleteBtn={true}
              onClose={() => {
                setShowToast(null);
              }}
            />
          )}
        </Card>

        {popup && <PTCitizenFeedbackPopUp setpopup={setpopup} setShowToast={setShowToast} data={data} />}
      </div>
    </React.Fragment>
  );
};

export default PTRApplicationDetails;
