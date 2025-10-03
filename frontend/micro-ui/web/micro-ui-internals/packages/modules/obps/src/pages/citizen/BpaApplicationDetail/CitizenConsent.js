import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { SubmitBar } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";

const CitizenConsent = ({ showTermsPopupOwner, setShowTermsPopupOwner, otpVerifiedTimestamp }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { state } = useLocation();
  const { t } = useTranslation();
  const user = Digit.UserService.getUser();
  const ownername = user?.info?.name;
  console.log(user, "OWNER NAME");
  const ownermobileNumber = user?.info.mobileNumber;
  const ownerEmail = user?.info?.emailId;
  const { id } = useParams();
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenantId = localStorage.getItem("CITIZEN.CITY")
  // const { data } = Digit.Hooks.obps.useBPADetailsPage(tenantId, { applicationNo: id });
  const [params, setParams] = Digit.Hooks.useSessionStorage(
    "BUILDING_PERMIT",
    state?.edcrNumber ? { data: { scrutinyNumber: { edcrNumber: state?.edcrNumber } } } : {}
  );
  const { data, isLoading } = Digit.Hooks.obps.useBPADetailsPage(tenantId, { applicationNo: id });

  console.log(params, "UU");
  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: data?.tenantId,
    id: id,
    moduleCode: "OBPS",
    config: {
      enabled: !!params,
    },
  });

  const [isUploading, setIsUploading] = useState(false); // it will check whether the file upload is in process or not
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const architectname = workflowDetails?.data?.timeline?.[0]?.assigner?.name;
  const mobileNumber = workflowDetails?.data?.timeline?.[0]?.assigner?.mobileNumber;
  const khasranumber = data?.applicationData?.additionalDetails?.khasraNumber;
  const ulbname = params?.additionalDetails?.UlbName;
  const district = params?.additionalDetails?.District;
  const ward = data?.applicationData?.additionalDetails?.wardnumber;
  const area = data?.applicationData?.additionalDetails?.area;
  const applicationnumber = params?.applicationNo;
  const architectid = data?.applicationData?.additionalDetails?.architectid;
  const architecttype = data?.applicationData?.additionalDetails?.typeOfArchitect;
  // const TimeStamp = otpVerifiedTimestamp;
  const ulbselection = params?.additionalDetails?.Ulblisttype === "Municipal Corporation" ? "Commissioner" : "Executive Officer";
  const TimeStamp = otpVerifiedTimestamp || params?.additionalDetails?.TimeStamp || "";
  const isCitizenDeclared = sessionStorage.getItem("CitizenConsentdocFilestoreid");

  const updatedAdditionalDetails = {
    ...data?.applicationData?.additionalDetails,
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

  console.log(data, "DatA");

  // const selfdeclarationform = `
  //   To,
  //   <b>${ulbselection}</b>
  //   <b>${data?.applicationData?.tenantId}</b> 
    
  //   Dear Sir or Madam,

  //   I/We, Shri/Smt/Kum. <b>${data?.applicationData?.landInfo?.owners.map(
  //     (item) => item?.name
  //   )}</b> under signed owner of land bearing Kh. No. <b>${khasranumber}</b> of ULB 
  //   <b>${data?.applicationData?.tenantId}</b> Area <b>${area}</b> (Sq.mts.), ward number <b>${ward}</b>, City <b>${data?.applicationData?.landInfo?.address?.city}</b>
    
  //   I/We hereby declare that the Architect name <b>${ownername}</b> (<b>${architecttype}</b>) Architect ID 
  //   <b>${architectid}</b> is appointed by me/us and is authorized to make representation/application 
  //   with regard to aforesaid construction to any of the authorities.

  //   I/We further declare that I am/We are aware of all the action taken or representation made 
  //   by the <b>${architecttype}</b> authorized by me/us.

  //   i) That I am/We are sole owner of the site.

  //   ii) There is no dispute regarding the site and if any dispute arises then I shall be solely resp
  //   -onsible for the same.

  //   iii) That construction of the building will be undertaken as per the approved building plans 
  //   and strutural design given by the Structural Engineer.

  //   That above stated facts are true and the requisite documents have been uploaded with this E-
  //   Naksha plan.


  //   This Document is Verified By OTP at <b>${TimeStamp}


  //   Name of Owner - <b>${ownername}</b>
  //   Mobile Number - <b>${ownermobileNumber}</b>
  //   Email Id  - <b>${ownerEmail}</b>
    
                                                                  
  //   `;



  const selfdeclarationform = `
  <div style="font-family:'Times New Roman', Times, serif; color:#000; font-size:16px; line-height:1.18; margin-top:-100px; padding:0;">

    <h2 style="text-align:center; font-size:20px; margin:0 0 6px 0; font-weight:700; text-transform:uppercase;">
      OWNER'S DECLARATION
    </h2>
    <div style="text-align:center; margin-top:-78px; font-size:16px;">
      (For Authorization of Architect under Self-Certification Scheme)
    </div>

    <div style="margin-top:-52px;">
      <p style="margin-bottom:-32px;"><strong>To:</strong></p>
      <p style="margin-bottom:-32px;"><strong>${ulbselection || "<ULB Type>"}</strong></p>
      <p style="margin-bottom:-32px;"><b>${data?.applicationData?.tenantId || "<ULB Name>"}</b></p>
    </div>

    <p style="margin-top:-50px;"><strong>Dear Sir or Madam,</strong></p>

    <p style="margin-top:-52px;margin-bottom:-32px; text-align:justify;">
      I/We, Shri/Smt/Kum <b>${data?.applicationData?.landInfo?.owners.map(item => item?.name).join(", ") || "<Owner Name>"}</b>,
      undersigned owner(s) of land bearing Kh. No. <b>${khasranumber}</b> of ULB <b>${data?.applicationData?.tenantId}</b>, Area <b>${area}</b> (Sq.mts.),
      Ward Number <b>${ward}</b>, City <b>${data?.applicationData?.landInfo?.address?.city || "<City>"}</b>.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px; text-align:justify;">
      I/We hereby declare that the Architect <b>${ownername}</b> (<b>${architecttype}</b>) having Architect ID <b>${architectid}</b>
      is appointed by me/us and is authorized to make representation/application with regard to aforesaid construction to any of the authorities.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px; text-align:justify;">
      I/We further declare that I am/We are aware of all the actions taken or representations made by the <b>${architecttype}</b>
      authorized by me/us.
    </p>

    <ol style="margin-top:-52px;margin-bottom:-32px;padding:0; text-align:justify;">
      <li style="margin-top:-5px;margin-bottom:-5px;">That I am/We are sole owner(s) of the site.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">That there is no dispute regarding the site and if any dispute arises, then I/We shall be solely responsible for the same.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">That construction of the building will be undertaken as per the approved building plans and structural design given by the Structural Engineer.</li>
    </ol>

    <p style="margin-top:-30px; text-align:justify;">
      That above stated facts are true and the requisite documents have been uploaded with this eNaksha plan.
    </p>

    <p style="margin:10px 0; font-style:italic;">This Document is Verified By OTP at <b>${TimeStamp || "<date time>"}</b></p>

    <!-- Signature / details table -->
    <table style="width:100%; border-collapse:collapse; margin-top:6px; font-size:14px;">
      <tr>
        <td style="width:48%; vertical-align:top; padding:6px; border:1px dotted #000;">
          <div style="font-weight:700; margin-bottom:4px;">Date:</div>
          <div style="min-height:60px;">${TimeStamp ? (TimeStamp.split && TimeStamp.split(" ")[0]) : "<Date of Sign>"}</div>
        </td>

        <td style="width:52%; vertical-align:top; border:1px dotted #000;">
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:6px; border-bottom:1px dotted #000; width:40%; font-weight:700;">Name of Owner:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${ownername}</td>
            </tr>
            <tr>
              <td style="padding:6px; border-bottom:1px dotted #000; font-weight:700;">Mobile:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${ownermobileNumber}</td>
            </tr>
            <tr>
              <td style="padding:6px; border-bottom:1px dotted #000; font-weight:700;">e-Mail:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${ownerEmail}</td>
            </tr>
            <tr>
              <td style="padding:6px; font-weight:700;">Signature:</td>
              <td style="padding:6px;">Verified through OTP on <b>${TimeStamp || "<date> <time>"}</b></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;



  const isRightAlignedLine = (line) =>
    [`Name of Owner - <b>${ownername}</b>`, `Mobile Number - <b>${ownermobileNumber}</b>`, `Email Id  - <b>${ownerEmail}</b>`].includes(line.trim());

  const shouldAddSpacing = (currentLine, nextLine) => {
    const lineToCheck1 = "That above stated facts are true and the requisite documents have been uploaded with this E-Naksha plan.";
    const lineToCheck2 = "";
    const lineToCheck3 = `This Document is Verified By OTP at ${TimeStamp}`;

    return (currentLine.trim() === lineToCheck1 && nextLine?.trim() === lineToCheck2) || currentLine.trim() === lineToCheck3;
  };

  console.log("HELLO");
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setShowTermsPopupOwner(false);
  };

  const uploadSelfDeclaration = async () => {
    try {
      setIsUploading(true); // Set isUploading to true before starting the upload

      let result = await Digit.PaymentService.generatePdf(Digit.ULBService.getStateId(), { Bpa: [updatedData] }, "ownerconsent");
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
          {/* <h2 style={modalStyles.heading}>DECLARATION UNDER SELF-CERTIFICATION SCHEME</h2>
          <h3 style={modalStyles.subheading}>(By OWNER)</h3> */}
          {/* <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', textAlign: 'justify', fontFamily: 'Roboto, serif' }}>{selfdeclarationform}</div>             */}
          <div style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", textAlign: "justify", fontFamily: "Roboto, serif" }}>
            {/* {selfdeclarationform.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                <div style={isRightAlignedLine(line) ? modalStyles.rightAlignedText : {}} dangerouslySetInnerHTML={{ __html: line }} />
   
                {shouldAddSpacing(line, selfdeclarationform.split("\n")[index + 1]) && <div style={{ marginBottom: "2rem" }} />}
              </React.Fragment>
            ))} */}
            <div dangerouslySetInnerHTML={{ __html: selfdeclarationform }} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SubmitBar label={t("BPA_CLOSE")} onSubmit={closeModal} />
          </div>
          <br></br>
          {!isCitizenDeclared && <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <br></br>
            <SubmitBar label={t("BPA_UPLOAD")} onSubmit={uploadSelfDeclaration} disabled={isUploading || isFileUploaded} />
          </div>}
        </div>
      </Modal>
    </div>
  );
};

export default CitizenConsent;
