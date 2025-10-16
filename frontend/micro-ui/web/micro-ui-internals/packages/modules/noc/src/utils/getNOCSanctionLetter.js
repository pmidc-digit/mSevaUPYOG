import QRCode from "qrcode";

if (typeof window !== "undefined" && typeof window.process === "undefined") {
  window.process = { env: {} };
}

const getNOCSanctionLetter = async (application, t, amountPaid) => {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const qrDataURL = await QRCode.toDataURL(window.location.href);

  const applicant = application.nocDetails?.additionalDetails?.applicationDetails;
  const site = application.nocDetails?.additionalDetails?.siteDetails;
  const nocDetails = application.nocDetails;

  const content = `
<html>
  <head>
    <title>NOC Sanction Letter</title>
    <style>
      @page { margin: 0.5in; }
      body {
        font-family: 'Arial', sans-serif;
        margin: 0;
        padding: 20px;
        font-size: 14px;
        line-height: 1.6;
      }
      .noc-container {
        max-width: 800px;
        margin: 0 auto;
        border: 2px solid #333;
        padding: 30px;
        background: white;
      }
      .line-between {
        display: flex;
        justify-content: space-between;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #333;
        padding-bottom: 20px;
      }
      .header-left, .header-right { flex: 0 0 auto; }
      .header-center { text-align: center; flex: 1; }
      .title { font-size: 20px; font-weight: bold; margin: 10px 0; color: #333; }
      .subtitle { font-size: 16px; margin: 5px 0; color: #666; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
      th { background: #f5f5f5; }
      .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #666; }
      @media print { body { background: white !important; } }
    </style>
  </head>
  <body>
    <div class="noc-container">
      <div class="header">
        <div class="header-left">
          <img src="https://s3.ap-south-1.amazonaws.com/pb-egov-assets/pb.amritsar/logo.png"
               style="width: 100px; height: auto;" />
        </div>
        <div class="header-center">
          <div class="title">Local Government, Punjab</div>
          <div class="subtitle">${site?.ulbType || "ULB Type"} ${site?.ulbName || "ULB Name"} </div>
          <div class="subtitle">(${application.nocType} Regularization Certificate)</div>
        </div>
        <div class="header-right">
          <img src="${qrDataURL}" style="width: 100px; height: auto;" />
        </div>
      </div>

      <div class="line-between"> 
        <span>No. ${application.applicationNo}</span>
        <td>
          Dated ${
            nocDetails?.additionalDetails?.SubmittedOn
              ? new Date(Number(nocDetails.additionalDetails.SubmittedOn)).toLocaleDateString("en-GB")
              : "N/A"
          }
        </td>
      </div>

      <p>
        1. Whereas Mr/Miss/Mrs ${applicant?.applicantOwnerOrFirmName || "N/A"}
        has applied to ${site?.ulbName || "N/A"} for getting No Objection Certificate
        regarding the regularization of Plot/Building under Policy No: 12/01/2017-5HG2/1806 dated 18th October 2018. The detail of his/ her / their plot / building is given below: -.
      </p>

      <table>
        <tr>
          <th>${t("APPLICATIONNO")} & ${t("AUDIT_DATE_LABEL")}</th>
          <th>${t("REPORT_FSM_RESULT_APPLICANTNAME")}</th>
        </tr>
        <tr>
          <td>
            ${application.applicationNo} Dated ${
    nocDetails?.additionalDetails?.SubmittedOn ? new Date(Number(nocDetails.additionalDetails.SubmittedOn)).toLocaleDateString("en-GB") : "N/A"
  }
          </td>
          <td>${applicant?.applicantOwnerOrFirmName || "N/A"}</td>
        </tr>
      </table>

      <h3>${t("PROPERTY_DESC")}</h3>
      <table>
        <tr>
          <th>${t("REVENUE_ESTATE")}</th>
          <th>${t("NOC_SITE_VASIKA_NO_LABEL")}</th>
          <th>${t("NOC_NET_TOTAL_AREA_LABEL")}</th>
          <th>${t("BPA_HADBAST_NO_LABEL")}</th>
          <th>${t("NOC_SITE_KHEWAT_AND_KHATUNI_NO_LABEL")}</th>
        </tr>
        <tr>
          <td>${site?.villageName || "N/A"}</td>
          <td>${site?.vasikaNumber || "N/A"}</td>
          <td>${site?.specificationPlotArea || "N/A"}</td>
          <td>${site?.hadbastNo || "N/A"}</td>
          <td>${site?.khewatAndKhatuniNo || "N/A"}</td>
        </tr>
        <tr>
          <th>${t("BPA_KHASRA_NO_LABEL")}</th>
          <td colspan="4">${site?.khasraNo || "N/A"}</td>
        </tr>
      </table>

      <p>2. Whereas, the area falls under the following categories: -</p>
      <table>
        <tr>
          <th>Sr. No.</th>
          <th>Details</th>
          <th>${t("BPA_HADBAST_NO_LABEL")}</th>
        </tr>
        <tr>
          <td>1</td>
          <td>${t("PROPERTY_ADDRESS")}</td>
          <td>${site?.plotNo || ""}, ${applicant?.applicantAddress || ""}</td>
        </tr>
        <tr>
          <td>2</td>
          <td>${t("NOC_COMPOUNDING")}</td>
          <td>${site?.specificationBuildingCategory || "N/A"} Plot measuring ${site?.specificationPlotArea || "N/A"} Sq. mts.</td>
        </tr>
        ${
          site.buildingStatus === "Built Up"
            ? `
              <tr>
                <td>3</td>
                <td>${t("REGULARIZATION_UNAUTHORIZED")}</td>
                <td>
                  ${(site.floorArea || []).map((f, idx) => `Floor ${idx + 1}: ${f.value || "0"} sqft`).join("<br/>")}
                  ${site.basementArea ? `<br/>Basement: ${site.basementArea} sqft` : ""}
                  <br/><strong>${t("BPA_APPLICATION_TOTAL_BUILDUP_AREA")}</strong> ${site?.totalFloorArea} sqft.
                </td>
              </tr>
            `
            : ""
        }
        <tr>
          <td>4</td>
          <td>${t("NOC_REGUALRIZATION_PAID")}</td>
          <td>${t("VIDE_NO")}: ${application.applicationNo} Rs. : ${amountPaid || "N/A"}</td>
        </tr>
      </table>

      ${site.specificationNocType === "Provisional" ? `<p>3. ${t("NOC_SANCTION_THREE")}</p>` : ""}

      <p>4. ${t("NOC_SANCTION_FOUR")}</p>
      <p>5. ${t("NOC_SANCTION_FIVE")}</p>
      <p>6. ${t("NOC_SANCTION_SIX")}</p>
      <p>7. ${t("NOC_SANCTION_SEVEN")}</p>
      <p>8. ${t("NOC_SANCTION_EIGHT")}</p>

      <div style="text-align: right; margin-top: 40px;">
        <p>Competent Authority</p>
        <div> ........................</div>
        Officer Name
        <div>.......................</div>
        Designation
        <p>${currentDate}</p>
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

export default getNOCSanctionLetter;
