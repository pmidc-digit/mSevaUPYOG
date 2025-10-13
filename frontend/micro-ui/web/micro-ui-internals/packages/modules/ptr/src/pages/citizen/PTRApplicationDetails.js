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

const PTRApplicationDetails = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { acknowledgementIds, tenantId } = useParams();
  const [acknowldgementData, setAcknowldgementData] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const isCitizen = window.location.href.includes("citizen");
  const [popup, setpopup] = useState(false);
  const [showToast, setShowToast] = useState(null);
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  const { isLoading, isError, error, data } = Digit.Hooks.ptr.usePTRSearch({
    tenantId,
    filters: { applicationNumber: acknowledgementIds },
  });

  const [billData, setBillData] = useState(null);

  const PetRegistrationApplications = get(data, "PetRegistrationApplications", []);

  const petId = get(data, "PetRegistrationApplications[0].applicationNumber", []);

  const pet_details = (PetRegistrationApplications && PetRegistrationApplications.length > 0 && PetRegistrationApplications[0]) || {};
  const application = pet_details;

  // sessionStorage.setItem("ptr-pet", JSON.stringify(application));

  const [loading, setLoading] = useState(false);

  const fetchBillData = async () => {
    setLoading(true);
    const result = await Digit.PaymentService.fetchBill(tenantId, {
      businessService: "pet-services",
      consumerCode: acknowledgementIds,
    });

    setBillData(result);
    setLoading(false);
  };
  useEffect(() => {
    fetchBillData();
  }, [tenantId, acknowledgementIds]);

  const { isLoading: auditDataLoading, isError: isAuditError, data: auditResponse } = Digit.Hooks.ptr.usePTRSearch(
    {
      tenantId,
      filters: { applicationNumber: petId, audit: true },
    },
    {
      enabled: true,
    }
  );

  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "pet-services",
      consumerCodes: acknowledgementIds,
      isEmployee: false,
    },
    { enabled: acknowledgementIds ? true : false }
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

  if (isLoading || auditDataLoading) {
    return <Loader />;
  }

  const printCertificate = async () => {
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
                  padding: 20px;
                  font-size: 14px;
                  line-height: 1.4;
                }
                .certificate-container {
                  max-width: 800px;
                  margin: 0 auto;
                  border: 3px solid #000;
                  padding: 30px;
                  background: white;
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                  border-bottom: 2px solid #000;
                  padding-bottom: 20px;
                }
                .title {
                  font-size: 18px;
                  font-weight: bold;
                  margin: 10px 0;
                  text-transform: uppercase;
                }
                .subtitle {
                  font-size: 16px;
                  margin: 5px 0;
                  color: #666;
                }
                .main-content {
                  display: flex;
                  gap: 30px;
                  margin: 20px 0;
                }
                .details-section {
                  flex: 1;
                }
                .pet-image-section {
                  flex-shrink: 0;
                  text-align: center;
                  order: 2;
                }
                .pet-image {
                  width: 150px;
                  height: 150px;
                  border: 2px solid #000;
                  object-fit: cover;
                  margin-bottom: 10px;
                  display: block;
                }
                .image-label {
                  font-size: 12px;
                  font-weight: bold;
                  text-align: center;
                }
                .details-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px 30px;
                  margin: 20px 0;
                }
                .detail-row {
                  display: flex;
                  margin-bottom: 8px;
                }
                .detail-label {
                  font-weight: bold;
                  min-width: 150px;
                  margin-right: 10px;
                }
                .detail-value {
                  flex: 1;
                  border-bottom: 1px dotted #000;
                  padding-bottom: 2px;
                }
                .owner-section {
                  margin: 30px 0;
                  border-top: 1px solid #000;
                  padding-top: 20px;
                }
                .footer-section {
                  margin-top: 40px;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                }
                .signature-area {
                  text-align: center;
                  min-width: 200px;
                }
                .signature-line {
                  border-top: 1px solid #000;
                  margin: 30px 0 5px 0;
                }
                .terms-section {
                  margin-top: 30px;
                  border-top: 2px solid #000;
                  padding-top: 20px;
                  font-size: 12px;
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
                  margin-bottom: 8px;
                  text-align: justify;
                }
                @media print {
                  body { background: white !important; }
                }
              </style>
            </head>
            <body>
              <div class="certificate-container">
                <div class="header">
                  <div class="title">MUNICIPAL CORPORATION</div>
                  <div class="subtitle">Pet Registration Certificate</div>
                </div>
                
                <div class="main-content">
                  <div class="details-section">
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
                        <span class="detail-label">Date Of Birth</span>
                        <span class="detail-value">${petData?.petDetails?.petAge || "Not Specified"}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Colour</span>
                        <span class="detail-value">${petData?.petDetails?.petColor || "Not Specified"}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Registration Number</span>
                        <span class="detail-value">${petData?.applicationNumber || "Not Specified"}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Token No</span>
                        <span class="detail-value">${petData?.petToken || "Not Specified"}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Issue Date</span>
                         <span className="detail-value">
                       ${
                         petData?.auditDetails?.lastModifiedTime
                           ? new Date(petData.auditDetails?.lastModifiedTime).toLocaleDateString("en-GB")
                           : "N/A"
                       }
                      </span>
                      </div>


                      <div class="detail-row">
                        <span class="detail-label">License Valid Upto</span>
                      <span className="detail-value">
                       ${petData?.validityDate ? new Date(petData.validityDate * 1000).toLocaleDateString("en-GB") : "N/A"}
                        
                      </span>
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

                <div class="footer-section">
                  <div>
                    <div>Date:........................</div>
                    <div>Place:.......................</div>
                  </div>
                  <div class="signature-area">
                    <div>Approved by</div>
                    <div class="signature-line"></div>
                    <div>Licensing Authority(CSI)</div>
                    <div>Municipal Corporation</div>
                 
                  </div>
                </div>

                <div class="terms-section">
                  <div class="terms-title">Note:- The license is being issued on the following conditions:-</div>
                  <ol class="terms-list">
                    <li>The owner shall ensure proper space, accommodation, food and medical treatment to the dog.</li>
                    <li>The owner shall keep the dog protected by getting it vaccinated against Rabies from a Govt. Veterinary Practitioner or Veterinary Practitioner duly registered with Indian Veterinary Council( IVC) or State Veterinary Council (SVC).</li>
                    <li>The owner shall keep the dog chained/ leashed while taking it outside. All ferocious dogs shall be duly muzzled and a stick shall be carried by the escort accompanying the dog while taking it out.</li>
                    <li>The owner shall ensure that the dog will wear a collar affixed with the metal token issued by the Registration Authority at all the times.</li>
                    <li>The owner shall not indulge in breeding of dogs for commercial purposes and trading of dogs within the area of Municipal Corporation. In case it is found that dog is being kept for breeding or trading /commercial purposes by him/her, the Registration Authority shall impound dog/s besides imposing a fine as fixed by the Municipal Corporation , SAS Nagar upon him/her.</li>
                    <li>The owner shall not allow the dog to defecate in public places such as residential areas, green belts, parks, streets, roads, road berms and other common places etc. In case the dog defecates at the above specified places, he/she shall arrange to get the excreta of the dog removed from the said place at his/her own level. The owner shall take his/her dog to defecate in the isolated areas which are not visited by the residents and other members of the public. The owner shall not allow the dog to defecate near the residences of other neighbours to their annoyance.</li>
                    <li>The owner shall allow the Registration Authority or a Veterinary Doctor, Chief Sanitary Inspector, Sanitary Inspector or any other officer of the Municipal Corporation authorized by the Registration Authority to inspect the premises of dog and the owner shall allow that person to enter and inspect his/her premises at all reasonable times to ensure that no cruelty is being done to the animal (prevention of cruelty to Animals Act 1960).</li>
                    <li>The owner shall abide by the provision of Bye Laws notified by Government of Punjab Notification No. 5/13/2020-1LG4/1877 dated 12/10/2020 and adopted by Municipal Corporation , SAS Nagar vide its resolution No. 30 dated 28/06/2021.</li>
                  </ol>
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
      console.error("Certificate download error:", error);
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
                  margin-bottom: 30px;
                  border-bottom: 2px solid #333;
                  padding-bottom: 20px;
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
                .acknowledgement-text {
                  margin: 20px 0;
                  text-align: justify;
                  font-size: 15px;
                }
                .details-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
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
                  margin-top: 30px;
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
                  <div class="title">Pet Registration Acknowledgement</div>
                  <div class="subtitle">Municipal Corporation</div>
                </div>
                
                <div class="acknowledgement-text">
                  This is to acknowledge that we have received your application for pet registration. 
                  Your application has been processed and the details are as follows:
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
                    <td style="color: #28a745; font-weight: bold;">${petData?.status || "SUBMITTED"}</td>
                  </tr>
                </table>
                
                <div class="acknowledgement-text">
                  Please keep this acknowledgement for your records. You will be notified once your 
                  application is processed and approved. For any queries, please contact the Municipal 
                  Corporation office with your application number.
                </div>
                
                <div class="footer">
                  <p>Generated on: ${currentDate}</p>
                  <p>Municipal Corporation</p>
                  <p>This is a computer-generated document and does not require a signature.</p>
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
      console.error("Acknowledgement download error:", error);
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

  if (reciept_data?.Payments[0]?.paymentStatus === "NEW") {
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

  const formatPetAge = (ageValue, t) => {
    if (ageValue === null || ageValue === undefined || ageValue === "") return t("CS_NA");

    const ageStr = String(ageValue).trim();
    // accept numeric-like strings only
    if (!/^\d+(\.\d+)?$/.test(ageStr)) return t("CS_NA");

    const [yearsPart, decPart] = ageStr.split(".");
    let years = Number(yearsPart) || 0;
    let months = 0;

    if (decPart) {
      if (decPart.length === 1) {
        // .5 -> 5 months
        months = parseInt(decPart, 10);
      } else {
        // take first two digits: .11 -> 11 months, .5x -> 50 -> will be handled below
        months = parseInt(decPart.slice(0, 2), 10);
      }
      if (isNaN(months)) months = 0;
    }

    // Clamp months to 0..11 (or convert overflow to years if you prefer)
    if (months > 11) months = 11;

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
            <Row className="border-none" label={t("REPORT_FSM_RESULT_APPLICANTNAME")} text={pet_details?.owner?.name || t("CS_NA")} />
            <Row
              className="border-none"
              label={t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL")}
              text={pet_details?.owner?.fatherOrHusbandName || t("CS_NA")}
            />
            <Row className="border-none" label={t("MOBILE")} text={pet_details?.owner?.mobileNumber || t("CS_NA")} />
            <Row className="border-none" label={t("CORE_COMMON_PROFILE_EMAIL")} text={pet_details?.owner?.emailId || t("CS_NA")} />
            <Row className="border-none" label={t("PDF_STATIC_LABEL_APPLICATION_NUMBER_LABEL")} text={pet_details?.applicationNumber} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("WS_COMMON_TABLE_COL_ADDRESS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("PTR_ADDRESS")} text={pet_details?.address?.addressId || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_PINCODE")} text={pet_details?.address?.pincode || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("ES_TITILE_PET_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("PTR_SEARCH_PET_TYPE")} text={pet_details?.petDetails?.petType || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_SEARCH_BREED_TYPE")} text={pet_details?.petDetails?.breedType || t("CS_NA")} />
            <Row
              className="border-none"
              label={t("PTR_PET_AGE")}
              // text={
              //   pet_details?.petDetails?.petAge || t("CS_NA")}
              // text={(() => {
              //   const age = pet_details?.petDetails?.petAge;
              //   if (age === null || age === undefined || age === "") return t("CS_NA");

              //   const ageNum = Number(age);
              //   if (isNaN(ageNum)) return t("CS_NA");

              //   const years = Math.floor(ageNum);
              //   const months = Math.round((ageNum - years) * 100); // e.g. 1.2 -> 20 months raw, but we treat as 2 months per spec

              //   // Adjust months if using .1 to .11 scale (1-11 months)
              //   const validMonths = months > 11 ? 11 : months; // just to be safe

              //   if (years === 0 && validMonths > 0) return `${validMonths} month${validMonths > 1 ? "s" : ""}`;
              //   if (years > 0 && validMonths === 0) return `${years} year${years > 1 ? "s" : ""}`;
              //   if (years > 0 && validMonths > 0) return `${years} year${years > 1 ? "s" : ""} and ${validMonths} month${validMonths > 1 ? "s" : ""}`;

              //   return t("CS_NA");
              // })()}
              text={formatPetAge(pet_details?.petDetails?.petAge, t)}
            />
            <Row className="border-none" label={t("PTR_DOCTOR_NAME")} text={pet_details?.petDetails?.doctorName || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_CLINIC_NAME")} text={pet_details?.petDetails?.clinicName || t("CS_NA")} />
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

          {(pet_details?.status == "CITIZENACTIONREQUIRED" || pet_details?.status == "INITIATED") && isCitizen && (
            <ActionBar>
              <SubmitBar
                label={t("COMMON_EDIT")}
                onSubmit={() => {
                  history.push(`/digit-ui/citizen/ptr/petservice/new-application/${acknowledgementIds}`);
                }}
              />
            </ActionBar>
          )}

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
