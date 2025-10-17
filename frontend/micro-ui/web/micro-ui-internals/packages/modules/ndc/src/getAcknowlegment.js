import React from "react";
import { Card, CardHeader } from "@mseva/digit-ui-react-components";

/* ------------------- Utility Functions ------------------- */
const checkForNotNull = (value = "") => value && value !== null && value !== undefined && value !== "";

const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
  if (searcher === "") return str;
  while (str.includes(searcher)) str = str.replace(searcher, replaceWith);
  return str;
};

const convertDotValues = (value = "") => {
  return (
    (checkForNotNull(value) &&
      ((value.replaceAll && value.replaceAll(".", "_")) ||
        (value.replace && stringReplaceAll(value, ".", "_")))) ||
    "NA"
  );
};

const convertToLocale = (value = "", key = "") => {
  const convertedValue = convertDotValues(value);
  if (convertedValue === "NA") return "PGR_NA";
  return `${key}_${convertedValue}`;
};

const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1);
const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ");

/* ------------------- Certificate Print Function ------------------- */
const printNdcCertificate = (data) => {
  console.log(data, "data");
  const {
    applicationNumber,
    propertyId,
    propertyType,
    applicantName,
    address,
    ulbName,
    duesAmount,
    dateOfApproval,
    dateOfApplication,
    officerName,
    officerDesignation,
    appNo
  } = data;

  const html = `
 <html lang="pa">
    <head>
      <meta charset="UTF-8" />
      <title>No Dues Certificate</title>
      <style>
        @page { margin: 0.6in; }
        body {
          font-family: 'Noto Sans Gurmukhi', 'Raavi', sans-serif;
          line-height: 1.6;
          color: #000;
          font-size: 14px;
          background: #fff;
        }
        .certificate {
          border: 3px solid #000;
          padding: 40px;
          margin: 30px auto;
          max-width: 800px;
          background: white;
        }
        .header {
          text-align: center;
          font-weight: bold;
          font-size: 20px;
          margin-bottom: 30px;
        }
        .section {
          margin-bottom: 15px;
          text-align: justify;
        }
        .signature {
          text-align: right;
          margin-top: 50px;
        }
        .note {
          margin-top: 30px;
          font-size: 12px;
          color: #000;
        }
        .bold { font-weight: bold; }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi&display=swap" rel="stylesheet">
    </head>
    <body>
      <div class="certificate">
        <div class="header">
          <div>Local Government, Punjab</div>
          <div style="font-size:18px; margin-top:5px;">No Dues Certificate</div>
          <div style="margin-top:5px;">${ulbName}</div>
        </div>
         <div style="text-align:center;">
    <img src="${tenantInfo?.logoUrl}" alt="Logo" style="height:60px;"/>
    <h1>No Dues Certificate</h1>
  </div>

        <div class="section">
          <div><span class="bold">NDC Number : ${appNo}</span>​​ Date: ${dateOfApplication}</div>
          <div style="text-align:right;">${dateOfApproval}</div>
          <div><span class="bold">Property ID:</span> ${propertyId} &nbsp;&nbsp;&nbsp; <span class="bold">Property Type:</span> ${propertyType}</div>
        </div>

        <div class="section">
          Applicant Name: ${applicantName} (s/o, f/o, d/o) for the land/building located at ${address}.
        </div>

        <div class="section">
          This is to certify that, as per the records and data with ${ulbName}, all applicable municipal dues related to the above-mentioned property have been duly recovered/deposited.
          <br/>
          ਇਹ ਪ੍ਰਮਾਣਿਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ ਕਿ ${ulbName} ਦੇ ਰਿਕਾਰਡ ਅਤੇ ਡਾਟਾ ਅਨੁਸਾਰ, ਉਪਰੋਕਤ ਸੰਪਤੀ ਨਾਲ ਸੰਬੰਧਿਤ ਸਾਰੇ ਲਾਗੂ ਨਗਰ ਨਿਗਮ ਦੇ ਬਕਾਏ ਪੂਰੀ ਤਰ੍ਹਾਂ ਵਸੂਲ/ਜਮ੍ਹਾਂ ਕਰਵਾ ਦਿੱਤੇ ਗਏ ਹਨ।
        </div>

        <div class="section">
          This No Dues Certificate is valid for one month from the date of issuance. ਇਹ ਨੋ ਡਿਊਜ਼ ਸਰਟੀਫਿਕੇਟ ਇੱਕ ਮਹੀਨੇ ਲਈ ਵੈਧ ਹੈ।
        </div>

        <div class="section">
          This is only a No Dues Certificate for municipal dues as on date and it does not regulate the compliance of building regulations, change of land use, any fire safety regulations or any other compliance under any act/rules.
          <br/>
          ਇਹ ਨੋ ਡਿਊਜ਼ ਸਰਟੀਫਿਕੇਟ ਸਿਰਫ਼ ਮੌਜੂਦਾ ਤਾਰੀਖ ਤੱਕ ਦੇ ਨਗਰ ਨਿਗਮ ਦੇ ਬਕਾਏ ਸਬੰਧੀ ਹੈ ਅਤੇ ਇਹ ਇਮਾਰਤ ਨਿਯਮਾਂ, ਭੂਮੀ ਉਪਯੋਗਤਾ ਵਿੱਚ ਤਬਦੀਲੀ, ਅੱਗ ਸੁਰੱਖਿਆ ਨਿਯਮਾਂ ਜਾਂ ਕਿਸੇ ਹੋਰ ਕਾਨੂੰਨ/ਨਿਯਮ ਦੇ ਤਹਿਤ ਕਿਸੇ ਵੀ ਪਾਲਣਾ ਨਾਲ ਸੰਬੰਧਤ ਨਹੀਂ ਹੈ।
        </div>

        <div class="section">
          This No Dues Certificate does not bar any competent authority to take action under their prevailing act/rules.
          <br/>
          ਇਹ ਨੋ ਡਿਊਜ਼ ਸਰਟੀਫਿਕੇਟ ਕਿਸੇ ਵੀ ਯੋਗ ਅਧਿਕਾਰੀ ਨੂੰ ਆਪਣੇ ਲਾਗੂ ਕਾਨੂੰਨ/ਨਿਯਮਾਂ ਅਧੀਨ ਕਾਰਵਾਈ ਕਰਨ ਤੋਂ ਨਹੀਂ ਰੋਕਦਾ।
        </div>

        <div class="section">
          In case any discrepancies in the amount deposited are discovered by the Municipal Corporation/Council at any stage, it shall be the responsibility of the owner to deposit the differential amount as notified by the Municipal Corporation/Council and Municipal Commissioner will have the full right to recover the same.
          <br/>
          ਜੇ ਕਿਸੇ ਵੀ ਪੜਾਅ ‘ਤੇ ਨਗਰ ਨਿਗਮ/ਪੰਚਾਇਤ ਦੁਆਰਾ ਜਮ੍ਹਾਂ ਕੀਤੀ ਰਕਮ ਵਿੱਚ ਕੋਈ ਗਲਤੀ ਪਾਈ ਜਾਂਦੀ ਹੈ, ਤਾਂ ਮਾਲਕ ਲਈ ਇਹ ਜ਼ਿੰਮੇਵਾਰੀ ਹੋਵੇਗੀ ਕਿ ਉਹ ਨਗਰ ਨਿਗਮ/ਪੰਚਾਇਤ ਦੁਆਰਾ ਸੂਚਿਤ ਕੀਤੀ ਗਈ ਅੰਤਰ ਰਕਮ ਜਮ੍ਹਾਂ ਕਰਵਾਏ, ਅਤੇ ਨਗਰ ਆਯੁਕਤ ਨੂੰ ਇਸ ਰਕਮ ਦੀ ਵਸੂਲੀ ਕਰਨ ਦਾ ਪੂਰਾ ਅਧਿਕਾਰ ਹੋਵੇਗਾ।
        </div>

        <div class="section">
          This certificate is only for the purpose of municipal dues and this certificate is not a proof of ownership.
          <br/>
          ਇਹ ਪ੍ਰਮਾਣ ਪੱਤਰ ਸਿਰਫ਼ ਨਗਰ ਨਿਗਮ ਦੇ ਬਕਾਏ ਲਈ ਹੈ ਅਤੇ ਇਸਨੂੰ ਮਲਕੀਅਤ ਦਾ ਸਬੂਤ ਨਹੀਂ ਮੰਨਿਆ ਜਾਵੇਗਾ।
        </div>

        <div class="signature">
          <div>Issued By</div>
          <div>Competent Authority</div>
          <div style="margin-top:15px;">${officerName}</div>
          <div>${officerDesignation}</div>
          <div>${dateOfApproval}</div>
        </div>

        <div class="note">
          Note: The authenticity of this document can be verified by scanning the QR code mentioned on the document.
        </div>
      </div>
    </body>
  </html>
  `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 500);
  };
};

/* ------------------- Main Function ------------------- */
const getAcknowledgementData = async (application, tenantInfo, t) => {
  const appData = application?.Applications?.[0] || {};
  console.log(appData, "appData");
  console.log(application, "application");
  const owner = appData?.owners?.[0] || {};
  const ndc = appData?.NdcDetails?.[0] || {};
  const add = ndc?.additionalDetails || {};
  const appNo = application?.Applications?.[0]?.applicationNo || "NA";
  const applicationNumber = appData?.uuid || "NA";
  const propertyId = ndc?.consumerCode || "NA";
  const propertyType = add?.propertyType || "NA";
  const applicantName = owner?.name || "NA";
  const address =
    add?.propertyAddress ||
    owner?.permanentAddress ||
    owner?.correspondenceAddress ||
    "NA";
  const ulbName = tenantInfo?.name || appData?.tenantId || "NA";
  const duesAmount = add?.duesAmount || "0";
  const dateOfApproval = add?.dateOfApproval || "NA";
  const dateOfApplication = add?.dateOfApplication || "NA";
  const officerName = add?.officerName || "________________";
  const officerDesignation = add?.officerDesignation || "________________";

  const certificateData = {
    applicationNumber,
    propertyId,
    propertyType,
    applicantName,
    address,
    ulbName,
    duesAmount,
    dateOfApproval,
    dateOfApplication,
    officerName,
    officerDesignation,
    appNo
  };

  printNdcCertificate(certificateData);

  return {
  t,
  tenantId: tenantInfo?.code,
  name: t("NDC_CERTIFICATE"),
  email: tenantInfo?.emailId,
  phoneNumber: tenantInfo?.contactNumber,
  heading: `${t(tenantInfo?.i18nKey)} ${ulbCamel(
    t(`ULBGRADE_${tenantInfo?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`)
  )}`,
  applicationNumber,
  details: [
    {
      value: certificateBody
    }
  ]
};
}

export default getAcknowledgementData;
