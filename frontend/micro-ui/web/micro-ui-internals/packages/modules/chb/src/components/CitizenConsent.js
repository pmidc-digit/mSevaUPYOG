import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { SubmitBar } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Loader } from "../components/Loader";

const CitizenConsent = ({ showTermsPopupOwner, setShowTermsPopupOwner, otpVerifiedTimestamp, getModalData }) => {
  const { t } = useTranslation();
  const user = Digit.UserService.getUser();
  const ownername = user?.info?.name;
  const ownermobileNumber = user?.info.mobileNumber;
  const ownerEmail = user?.info?.emailId;
  const { id } = useParams();
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const [loader, setLoader] = useState(false);


  console.log("getModalData", getModalData);






  const { data, isLoading } = Digit.Hooks.obps.useBPADetailsPage(tenantId, { applicationNo: id });
  const [isUploading, setIsUploading] = useState(false); // it will check whether the file upload is in process or not
  const [isFileUploaded, setIsFileUploaded] = useState(false);


  const isCitizenDeclared = sessionStorage.getItem("CitizenConsentdocFilestoreidCHB");
  const DateOnly = new Date();

  const updatedAdditionalDetails = {
    ...[data?.applicationData],
    TimeStamp: otpVerifiedTimestamp,
  };

  // Update the entire data object with the new additionalDetails
  const updatedData = {
    applicationNo: data?.applicationNo,
    tenantId: data?.tenantId,
    applicationData: {
      ...updatedAdditionalDetails,
    },
  };

  // Extract readable ULB name
const formatUlbName = (ulbName = "") => {
  if (!ulbName) return "";
  const parts = ulbName.split(".");
  return parts.length > 1
    ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
    : ulbName.charAt(0).toUpperCase() + ulbName.slice(1);
};
const formattedUlbName = formatUlbName(getModalData?.ulbName);


// const selfdeclarationform = `
//   <div style="font-family:'Times New Roman', Times, serif; color:#000; font-size:16px; line-height:1.18; margin-top:-100px; padding:0;">
//     <div style="margin-top:-52px;">
//       <p style="margin-bottom:-32px;"><strong>To,</strong></p>
//       <p style="margin-bottom:-32px;"><strong>The President & Executive Officer</strong></p>
//       <p style="margin-bottom:-32px;"><strong>Municipal Council,${formattedUlbName}.</strong></p>
//     </div>

//     <p style="margin-top:-20px;"><strong>Sub:- Application for allotment of Community Centre.</strong></p>

//     <p style="margin-top:-52px;margin-bottom:-32px; text-align:justify;">
//       I need the <strong>${getModalData?.communityHallName || "Community Centre"}</strong> community centre for the purpose of <strong>${
//     getModalData?.purpose?.name || "RELIGIOUS"
//   }</strong> for <strong>${getModalData?.days || "1"}</strong> days, from <strong>${getModalData?.bookingDate || ""}</strong> to <strong>${
//     getModalData?.bookingEndDate || ""
//   }</strong>.
//     </p>

//     <p style="margin-top:-52px;margin-bottom:-32px; text-align:justify;">
//       It is requested that the community centre may please allotted to me for the purpose detailed above for the period requested for, Will pay Rs. <strong>${
//         getModalData?.security || "0"
//       }</strong> as security and Rs. <strong>${getModalData?.rent || "0"}</strong> as rent.
//     </p>

//     <p style="margin-top:-52px;margin-bottom:-32px; text-align:justify;">
//       I will not cause any damage to the M.C. property. In case of damage M.C. may deduct from my security the entire cost of restoration of damage, suitable amount as penalty, water charges and electricity charges if any may also be recovered from my security.
//     </p>

//     <p style="margin-top:-52px;margin-bottom:-32px; text-align:justify;">
//       <strong>Note:- I will arrange the Generator temporary matter from P.S.E.B. separate for decoration lights.</strong>
//     </p>

//     <!-- Signature / details section -->
// <div style="margin-top:6px;">
//       <!-- Centered line above table -->
//       <p style="text-align:center; margin:0 0 8px 0;justify-content:flex-end; margin-right: 192px; display:flex; font-family:'Times New Roman', Times, serif;">Yours faithfully,</p>

//       <!-- Right-aligned table (no borders) -->
//       <div style="display:flex; justify-content:flex-end;  margin-top:-72px;">
//         <table style="border-collapse:collapse; font-size:14px; width:340px; border:0; margin-top:4px;">
//           <tr>
//             <td style="padding:6px 8px; width:120px; font-weight:700; text-align:left; border:0;">Sig.</td>
//             <td style="padding:6px 8px; text-align:left; border:0;">${getModalData?.name || ownername}</td>
//           </tr>
//           <tr>
//             <td style="padding:6px 8px; font-weight:700; text-align:left; border:0;">Name.</td>
//             <td style="padding:6px 8px; text-align:left; border:0;">${getModalData?.name || ownername}</td>
//           </tr>
//           <tr>
//             <td style="padding:6px 8px; font-weight:700; text-align:left; border:0;">Ph No.</td>
//             <td style="padding:6px 8px; text-align:left; border:0;">${getModalData?.mobileNumber || ownermobileNumber}</td>
//           </tr>
//           <tr>
//             <td style="padding:6px 8px; font-weight:700; text-align:left; border:0;">Address.</td>
//             <td style="padding:6px 8px; text-align:left; border:0;">${getModalData?.address || ""}</td>
//           </tr>
//         </table>
//       </div>
//     </div>
//   </div>
// `;



  const selfdeclarationform = `
    <div style="font-family:'Times New Roman', Times, serif; color:#000; font-size:16px; line-height:1.4; padding:20px;">
      
      <!-- Header -->
      <h1 style="text-align:center; font-weight:bold; font-size:20px; margin-bottom:30px; text-decoration:underline;">
        SELF-DECLARATION FOR COMMUNITY HALL BOOKING
      </h1>

      <!-- Opening Statement -->
      <div style="margin-bottom:20px; line-height:1.4;">
        <p style="margin:0;">
          I, <span style="border-bottom:1px solid #000; display:inline-block; min-width:200px; text-align:center; font-weight:bold;">${getModalData?.name || ownername || "____________________"}</span> 
          s/d of <span style="border-bottom:1px solid #000; display:inline-block; min-width:200px; text-align:center; font-weight:bold;">${getModalData?.sonOf || "____________________"}</span>, resident of
        </p>
        <p style="margin:0;">
          <span style="border-bottom:1px solid #000; display:inline-block; min-width:300px; text-align:center; font-weight:bold;">${getModalData?.residentOf || getModalData?.address || "____________________"}</span>, do hereby self-declare that:
        </p>
      </div>

      <!-- Declaration Points -->
      <ol style="margin-left:30px; line-height:1.4; list-style-type:none; counter-reset:item;">
        <li style="margin-bottom:8px; text-align:justify; counter-increment:item; display:flex;">
          <span style="min-width:30px;">${1}.</span>
          <span>I want to book the community hall – <span style="border-bottom:1px solid #000; display:inline-block; min-width:250px; text-align:center; font-weight:bold;">${getModalData?.communityHallName || "____________________"}</span> for the purpose of <span style="border-bottom:1px solid #000; display:inline-block; min-width:250px; text-align:center; font-weight:bold;">${getModalData?.purpose?.name || "____________________"}</span>.</span>
        </li>

        <li style="margin-bottom:8px; text-align:justify; counter-increment:item; display:flex;">
          <span style="min-width:30px;">${2}.</span>
          <span>I will obey all government directions issued from time to time regarding <span style="text-decoration:underline;">Coronavirus</span> or any other epidemic.</span>
        </li>

        <li style="margin-bottom:8px; text-align:justify; counter-increment:item; display:flex;">
          <span style="min-width:30px;">${3}.</span>
          <span>The Municipal Corporation / Council will have the right to deduct charges for cleanliness, electricity, or any maintenance of the community hall.</span>
        </li>

        <li style="margin-bottom:8px; text-align:justify; counter-increment:item; display:flex;">
          <span style="min-width:30px;">${4}.</span>
          <span>I will not serve alcohol without valid government permission from the concerned department. If I do serve alcohol without permission, I will be liable for punishment as per law.</span>
        </li>

        <li style="margin-bottom:8px; text-align:justify; counter-increment:item; display:flex;">
          <span style="min-width:30px;">${5}.</span>
          <span>I will not use Single Use Plastic or <span style="text-decoration:underline;">thermocol</span> as per Solid Waste Management (SWM) guidelines.</span>
        </li>

        <li style="margin-bottom:8px; text-align:justify; counter-increment:item; display:flex;">
          <span style="min-width:30px;">${6}.</span>
          <span>I will ensure proper cleanliness of the community hall.</span>
        </li>

        <li style="margin-bottom:8px; text-align:justify; counter-increment:item; display:flex;">
          <span style="min-width:30px;">${7}.</span>
          <span>I will be responsible for any fight or damage to government property and will be liable for any penalty.</span>
        </li>

        <li style="margin-bottom:8px; text-align:justify; counter-increment:item; display:flex;">
          <span style="min-width:30px;">${8}.</span>
          <span>The Municipal Corporation / Council reserves the right to cancel my booking for any emergency government program.</span>
        </li>

        <li style="margin-bottom:8px; text-align:justify; counter-increment:item; display:flex;">
          <span style="min-width:30px;">${9}.</span>
          <span>I will play DJ music at low volume only up to 10 PM in the community hall, as per government guidelines.</span>
        </li>

        <li style="margin-bottom:8px; text-align:justify; counter-increment:item; display:flex;">
          <span style="min-width:30px;">${10}.</span>
          <span>I will be responsible if any illegal electricity connection is used in the community hall.</span>
        </li>

        <li style="margin-bottom:8px; text-align:justify; counter-increment:item; display:flex;">
          <span style="min-width:30px;">${11}.</span>
          <span>I have checked the current status of the community hall and I am ready to proceed with the booking.</span>
        </li>
      </ol>

      <!-- Signature Section -->
      <div style="margin-top:50px; display:flex; justify-content:flex-end;">
        <div style="min-width:300px;">
          <p style="margin:10px 0; text-align:right; font-weight:bold;">Applicant Name</p>
          <p style="margin:10px 0; text-align:right; font-weight:bold;">${getModalData?.name || ownername || "____________________"}</p>
          
          <p style="margin:20px 0 10px 0; text-align:right; font-weight:bold;">Address</p>
          <p style="margin:10px 0; text-align:right; font-weight:bold;">${getModalData?.address || "____________________"}</p>
        </div>
      </div>
    </div>
  `;



  const closeModal = () => {
    setShowTermsPopupOwner(false);
  };

  const uploadSelfDeclaration = async () => {
    setLoader(true);
    const Chb = [
      {
        ...getModalData,
        purpose: getModalData?.purpose?.name,
        applicationNo: "CHB-0001",
        tenantId: tenantId,
      },
    ];

    try {
      setIsUploading(true); // Set isUploading to true before starting the upload

      let result = await Digit.PaymentService.generatePdf(Digit.ULBService.getStateId(), { Chb: Chb }, "communityhallowner");
      console.log(result, "RESULT");
      setLoader(false);
      if (result?.filestoreIds[0]?.length > 0) {
        alert("File Uploaded Successfully");
        sessionStorage.setItem("CitizenConsentdocFilestoreidCHB", result?.filestoreIds[0]);
        setIsFileUploaded(true); // Set isFileUploaded to true on successful upload
      } else {
        alert("File Upload Failed");
      }
    } catch (error) {
      alert("Error Uploading PDF:", error); // Error handling
      setLoader(false);
    } finally {
      setLoader(false);
      setIsUploading(false); // Set isUploading to false after the upload is complete
    }
  };

  const modalStyles = {
    modal: {
      width: "100%",
      height: "100%",
      top: "0",
      position: "relative",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    modalOverlay: {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContent: {
      backgroundColor: "#FFFFFF",
      padding: "2rem",
      borderRadius: "0.5rem",
      maxWidth: "800px",
      margin: "auto",
      fontFamily: "Roboto, serif",
      overflowX: "hidden",
      textAlign: "justify",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      maxHeight: "80vh",
      overflowY: "auto",
      lineHeight: "2",
    },
    heading: {
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: "10px",
    },
    subheading: {
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    rightAlignedText: {
      textAlign: "right",
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
      fontFamily: "Roboto, serif",
      lineHeight: "2",
    },
  };

  return (
    <div>
      <Modal
        isOpen={showTermsPopupOwner}
        onRequestClose={closeModal}
        contentLabel="Self-Declaration"
        style={{
          modal: modalStyles.modal,
          overlay: modalStyles.modalOverlay,
          content: modalStyles.modalContent,
        }}
      >
        <div>
          <div style={{  wordWrap: "break-word", textAlign: "justify", fontFamily: "Roboto, serif" }}>
            <div dangerouslySetInnerHTML={{ __html: selfdeclarationform }} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SubmitBar label={t("BPA_CLOSE")} onSubmit={closeModal} />
          </div>
          <br></br>
          {!isCitizenDeclared && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <br></br>
              <SubmitBar label={t("CHB_UPLOAD")} onSubmit={uploadSelfDeclaration} disabled={isUploading || isFileUploaded} />
            </div>
          )}
        </div>
      </Modal>
      {loader && <Loader page={true} />}
    </div>
  );
};

export default CitizenConsent;
