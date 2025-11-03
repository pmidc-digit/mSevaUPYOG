import QRCode from "qrcode";
const getAcknowledgement = async (application, t) => {
  console.log('application', application)
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const qrDataURL = await QRCode.toDataURL(window.location.href);
  const content = `
<html>
  <head>
    <title>${t("ADS_ACKNOWLEDGMENT_FORM")}</title>
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
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #333;
        padding-bottom: 20px;
        position: relative;
      }
      .header-left,
      .header-right {
        flex: 0 0 auto;
      }
      .header-center {
        text-align: center;
        flex: 1;
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
        <div class="header-left">
          <img src="https://s3.ap-south-1.amazonaws.com/pb-egov-assets/${application?.tenantId}/logo.png" 
              style="width: 120px; height: 120px;" />
        </div>
        <div class="header-center">
          <div class="title">Advertisement and Hoarding Booking Acknowledgement</div>
          <div class="subtitle">Municipal Corporation</div>
        </div>
        <div class="header-right">
          <img src="${qrDataURL}" style="width: 120px; height: 120px;" />
        </div>
      </div>

      <div class="acknowledgement-text">
        ${t("ADV_ACK_TEXT_2")}          
      </div>

      <h3>${t("ADS_APPLICANT_DETAILS")}</h3>
      <table class="details-table">
        <tr>
          <th>${t("WS_COMMON_TABLE_COL_APP_NO_LABEL")}</th>
          <td>${application?.bookingNo || "Not Available"}</td>
        </tr>
        <tr>
          <th>${t("BPA_BASIC_DETAILS_APPLICATION_DATE_LABEL")}</th>
          <td>${application?.applicationDate ? new Date(application?.applicationDate).toLocaleDateString("en-GB") : "N/A"}</td>
        </tr>
        <tr>
          <th>${t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL")}</th>
          <td>${application?.applicantDetail?.applicantName || "Not Specified"}</td>
        </tr>
        <tr>
          <th>${t("PDF_STATIC_LABEL_WS_CONSOLIDATED_CONCERNED_PLUMBER_CONTACT")}</th>
          <td>${application?.applicantDetail?.applicantMobileNo || "Not Specified"}</td>
        </tr>
        <tr>
          <th>${t("ADS_ALTERNATE_NUMBER")}</th>
          <td>${application?.applicantDetail?.applicantAlternateMobileNo || "Not Specified"}</td>
        </tr>
        <tr>
          <th>${t("PDF_STATIC_LABEL_WS_CONSOLIDATED_ACKNOWELDGMENT_EMAIL")}</th>
          <td>${application?.applicantDetail?.applicantEmailId || "Not Specified"}</td>
        </tr>
        <tr>
          <th>${t("TL_HOME_SEARCH_RESULTS_APP_STATUS_LABEL")}</th>
          <td style="color: #28a745; font-weight: bold;">${t(application?.bookingStatus) || "SUBMITTED"}</td>
        </tr>
      </table>

      ${
        application?.cartDetails?.length > 0
          ? `
            <h3>${t("ADVERTISEMENT_DETAILS")}</h3>
            <table class="details-table">
              <tr>
                <th>${t("ADS_AD_TYPE")}</th>
                <th>${t("CS_ADDCOMPLAINT_LOCATION")}</th>
                <th>${t("ADS_FACE_AREA")}</th>
                <th>${t("CHB_BOOKING_DATE")}</th>
                <th>${t("ADS_FROM_TIME")}</th>
                <th>${t("ADS_TO_TIME")}</th>
                <th>${t("ADS_NIGHT_LIGHT")}</th>
                <th>${t("PT_OWNERSHIP_INFO_NAME")}</th>
                <th>${t("POLE_NO")}</th>
              </tr>
              ${application.cartDetails
                .map(
                  (item) => `
                  <tr>
                    <td>${t(item.addType) || "N/A"}</td>
                    <td>${t(item.location) || "N/A"}</td>
                    <td>${t(item.faceArea.replace(item.addType + "_", "")) || "N/A"}</td>
                    <td>${item.bookingDate || "N/A"}</td>
                    <td>${item.bookingFromTime || "N/A"}</td>
                    <td>${item.bookingToTime || "N/A"}</td>
                    <td>${item.nightLight ? "With Light" : "Without Light"}</td>
                    <td>${item.advertisementName || "N/A"}</td>
                    <td>${item.poleNo || "N/A"}</td>
                  </tr>
                `
                )
                .join("")}
            </table>
          `
          : ""
      }

      <div class="acknowledgement-text">
        ${t("ADV_ACK_TEXT_1")}
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

export default getAcknowledgement;
