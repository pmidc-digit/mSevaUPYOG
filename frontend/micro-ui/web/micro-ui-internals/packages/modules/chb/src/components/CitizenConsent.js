import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { SubmitBar } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const CitizenConsent = ({ showTermsPopupOwner, setShowTermsPopupOwner, otpVerifiedTimestamp }) => {
  const { t } = useTranslation();
  const user = Digit.UserService.getUser();
  const ownername = user?.info?.name;
  const ownermobileNumber = user?.info.mobileNumber;
  const ownerEmail = user?.info?.emailId;
  const { id } = useParams();
  const tenantId = localStorage.getItem("CITIZEN.CITY");

  const { data, isLoading } = Digit.Hooks.obps.useBPADetailsPage(tenantId, { applicationNo: id });

  const [isUploading, setIsUploading] = useState(false); // it will check whether the file upload is in process or not
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  const isCitizenDeclared = sessionStorage.getItem("CitizenConsentdocFilestoreid");
  const DateOnly = new Date();

  const updatedAdditionalDetails = {
    ...data?.applicationData,
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

  const selfdeclarationform = `
  <div style="font-family:'Times New Roman', Times, serif; color:#000; font-size:16px; line-height:1.18; margin-top:-100px; padding:0;">

    <h2 style="text-align:center; font-size:20px; margin:0 0 6px 0; font-weight:700; text-transform:uppercase;">
      OWNER'S DECLARATION
    </h2>

    <div style="margin-top:-52px;">
      <p style="margin-bottom:-32px;"><strong>To,</strong></p>
      <p style="margin-bottom:-32px;"><strong>Local Urban Bodies</strong></p>
    </div>

    <p style="margin-top:-20px;"><strong>Dear Sir/Madam,</strong></p>

    <p style="margin-top:-52px;margin-bottom:-32px; text-align:justify;">
  I/We further declare that I am/We are aware of all the actions taken have been authorized by me/us.
    </p>

    <ol style="margin-top:-52px;margin-bottom:-32px; padding:0;">
      <li style="margin-top:-5px;margin-bottom:-25px;">1. That I am/We are sole owner(s) of the site.</li>
      <li style="margin-top:-5px;margin-bottom:-25px;">2. That there is no dispute regarding the site and if any dispute arises, then I/We shall be solely responsible for the same.</li>
      <li style="margin-top:-5px;margin-bottom:-25px;">3. That construction of the building will be undertaken as per the approved building plans and structural design given by the Structural Engineer.</li>
      <li style="margin-top:-5px;margin-bottom:-25px;">4. That above stated facts are true and the requisite documents have been uploaded with this building plan and nothing has been concealed thereof.</li>
    </ol>

    <!-- Signature / details table -->
    <table style="width:100%; border-collapse:collapse; margin-top:6px; font-size:14px;">
      <tr>
        <td style="width:48%; vertical-align:top; padding:6px; border:1px dotted #000;">
          <div style="font-weight:700; margin-bottom:4px;">Date:</div>
          <div style="min-height:60px;">${DateOnly || "<Date of Sign>"}</div>
        </td>

        <td style="width:52%; vertical-align:top; border:1px dotted #000;">
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:6px; border-bottom:1px dotted #000; width:40%; font-weight:700;">Name of Owner:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${ownername}</td>
            </tr>
            <tr>
            <td style="padding:6px; border-bottom:1px dotted #000; font-weight:700;">e-Mail:</td>
            <td style="padding:6px; border-bottom:1px dotted #000;">${ownerEmail}</td>
            </tr>
            <tr>
              <td style="padding:6px; border-bottom:1px dotted #000; font-weight:700;">Mobile:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${ownermobileNumber}</td>
            </tr>
            <tr>
              <td style="padding:6px; font-weight:700;">Signature:</td>
              <td style="padding:6px;">Verified through OTP</b></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;

  const closeModal = () => {
    setShowTermsPopupOwner(false);
  };

  const uploadSelfDeclaration = async () => {
    try {
      setIsUploading(true); // Set isUploading to true before starting the upload

      let result = await Digit.PaymentService.generatePdf(Digit.ULBService.getStateId(), { Bpa: "test" }, "ownerconsent");
      console.log(result, "RESULT");
      if (result?.filestoreIds[0]?.length > 0) {
        alert("File Uploaded Successfully");
        sessionStorage.setItem("CitizenConsentdocFilestoreid", result?.filestoreIds[0]);
        setIsFileUploaded(true); // Set isFileUploaded to true on successful upload
      } else {
        alert("File Upload Failed");
      }
    } catch (error) {
      alert("Error Uploading PDF:", error); // Error handling
    } finally {
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
          <div style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", textAlign: "justify", fontFamily: "Roboto, serif" }}>
            <div dangerouslySetInnerHTML={{ __html: selfdeclarationform }} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SubmitBar label={t("BPA_CLOSE")} onSubmit={closeModal} />
          </div>
          <br></br>
          {!isCitizenDeclared && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <br></br>
              <SubmitBar label={t("BPA_UPLOAD")} onSubmit={uploadSelfDeclaration} disabled={isUploading || isFileUploaded} />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CitizenConsent;
