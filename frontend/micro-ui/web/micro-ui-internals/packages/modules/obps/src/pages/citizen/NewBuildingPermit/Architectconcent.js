import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useLocation } from "react-router-dom";
import { SubmitBar } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

// Fixed ArchitectConsent component
// - ensures setParams is destructured from session hook
// - prevents ReferenceError for TimeStamp by providing a safe default
// - avoids embedding TimeStamp directly inside a static comparison string
// - safer upload with params+TimeStamp merged

const Architectconcent = ({ showTermsPopup, setShowTermsPopup, otpVerifiedTimestamp }) => {
  const { state } = useLocation();
  const { t } = useTranslation();

  // user info from service
  const user = Digit.UserService.getUser();
  const architecname = user?.info?.name || "";
  const architectmobileNumber = user?.info?.mobileNumber || "";

  // IMPORTANT: destructure both params and setParams so you can update session storage
  const [params, setParams] = Digit.Hooks.useSessionStorage(
    "BUILDING_PERMIT",
    state?.edcrNumber ? { data: { scrutinyNumber: { edcrNumber: state?.edcrNumber } } } : {}
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  // Map fields safely from params (these may be undefined)
  const architectid = params?.additionalDetails?.architectid || user?.info?.id || "";
  const ownername = params?.owners?.owners?.[0]?.name || "";
  const mobile = params?.owners?.owners?.[0]?.mobileNumber || "";
  const architecttype = params?.additionalDetails?.typeOfArchitect || user?.info?.roles?.find((r) => r.code === "BPA_ARCHITECT")?.name || "";
  const khasranumber = params?.additionalDetails?.khasraNumber || "";
  const ulbname = params?.additionalDetails?.District || "";
  const district = params?.additionalDetails?.UlbName || "";
  const ward = params?.additionalDetails?.wardnumber || "";
  const area = params?.additionalDetails?.area || "";
  const zone = params?.additionalDetails?.zonenumber || "";
  const ulbgrade = params?.additionalDetails?.Ulblisttype || "";

  // safe TimeStamp - prefer the one passed in props, fallback to stored value, fallback to empty string
  // const TimeStamp = otpVerifiedTimestamp ?? params?.additionalDetails?.TimeStamp ?? "";
  const TimeStamp = otpVerifiedTimestamp || params?.additionalDetails?.TimeStamp || "";
  const DateOnly = TimeStamp ? new Date(TimeStamp).toISOString().split("T")[0] : "";

  const isArchitectDeclared = sessionStorage.getItem("ArchitectConsentdocFilestoreid");

  console.log(params, "PARAM");

  // update session only if setParams exists and we need to write the timestamp
  useEffect(() => {
    if (typeof setParams === "function" && params?.additionalDetails && !params.additionalDetails.TimeStamp && TimeStamp) {
      try {
        setParams((prevParams) => ({
          ...prevParams,
          additionalDetails: {
            ...prevParams.additionalDetails,
            TimeStamp,
          },
        }));
      } catch (e) {
        // defensive: if setParams isn't a function for some environment, just warn
        console.warn("Failed to set session BUILDING_PERMIT TimeStamp", e);
      }
    }
  }, [params, setParams, TimeStamp]);

  // Build the declaration string — use TimeStamp (always defined as string)
  // const selfdeclarationform = `
  //  To,
  //  <b>${ulbgrade}</b>
  //  <b>${district}</b>
   
   
  //  Dear Sir or Madam,

  //  I, under signed Shri/Smt/Kum <b>${architecname}</b> (<b>${architecttype}</b>) having Registration No. 
  //  <b>${architectid}</b> is appointed by the <b>${ownername}</b> Mobile number <b>${mobile}</b> for the development on
  //  land bearing Kh. No <b>${khasranumber}</b> Area <b>${area}</b> (Sq.mts).
    
  //  This site falls in ward number <b>${ward}</b> zone number <b>${zone}</b>  in the Master plan of 
  //  <b>${district}</b> and the proposed Residential/Commercial/Industrial construction is permi
  //  -ssible in this area.
  
  //  I am currently registered as <b>${architecttype}</b> with the Competent Authority and empane
  //  -lled under Self-Certification Scheme.
  
  //  I hereby certify that I/we have appointed by the owner to prepare the plans, sections and 
  //  details, structural details as required under the Punjab Municipal Building Byelaws for the 
  //  above mentioned project. 
  
  //  That the drawings prepared and uploaded along with other necessary documents on this 
  //  E-Naksha Platform are as per the provisions of Punjab Municipal Building Byelaws and th
  //  -is building plan has been applied under Self-Certification Scheme. 
  
  //  I certify that:
  //  That I am fully conversant with the provisions of the Punjab Municipal Building Byelaws and 
  //  other applicable instructions/ regulations, which are in force and I undertake to fulfill the 
  //  same.
  
  //  That plans have been prepared within the framework of provisions of the Master Plan and app
  //  -licable Building Bye Laws / Regulations. 
  
  //  That site does not falls in any prohibited area/ government land/ encroachment or any other 
  //  land restricted for building construction or in any unauthorized colony. 
  
  //  That plan is in conformity to structural safety norms. 
  
  //  That I have seen the originals of all the documents uploaded and Nothing is concealed 
  //  thereof. 
  
  //  That all the requisite documents/NOC required to be uploaded have been uploaded on 
  //  E-Naksha portal along with plan. 
  
  //  That above stated facts are true and all the requisite documents uploaded with this E-Naksha plan.
   


  //  This Document is Verified By OTP at <b>${TimeStamp}</b>


  //  Name of Professional - <b>${architecname}</b> 
  //  Designation - <b>${architecttype}</b>
  //  Architect Id - <b>${architectid}</b> 
  //  Mobile Number - <b>${architectmobileNumber}</b>
   
                                  
  //   `;



const selfdeclarationform = `
  <div style="font-family: 'Times New Roman', Times, serif; color:#000; font-size:16px; line-height:1.18; padding:0; margin-top:-100px">

    <h2 style="text-align:center; font-size:20px; margin:0 0 6px 0; font-weight:700; text-transform:uppercase;">
      DECLARATION UNDER SELF-CERTIFICATION SCHEME
    </h2>
    <div style="text-align:center; margin-top:-78px;">
      <div style="font-size:16px; margin:0;">(For ${params?.additionalDetails?.usage || '<Type of Construction>'} Construction)</div>
      <div style="font-size:16px; margin:2px 0 0 0;">(By Architect/ Civil Engineer/ Building Designer and Supervisor)</div>
    </div>

    <div style="margin-top:-52px;">
      <p style="margin-bottom:-32px;"><strong>To:</strong></p>
      <p style="margin-bottom:-32px;"><strong>${params?.owners?.Ulblisttype === "Municipal Corporation" ? "The Municipal Commissioner" : "The Executive officer"}</strong></p>
      <p style="margin-bottom:-32px;">${params?.landInfo?.address?.city?.city?.ulbType}</p>
      <p style="margin-bottom:-32px;">${params?.landInfo?.address?.city?.city?.districtName}</p>
    </div>

    <p style="margin-top:-52px;margin-bottom:-32px;"><strong>Dear Sir or Madam,</strong></p>

    <p style="margin-top:-30px;margin-bottom:-32px;">
      I, the undersigned Shri/Smt/Kum <b>${architecname}</b> (<b>${architecttype }</b> is appointed by the owner <b>${ownername}</b> (Mobile: <b>${mobile}</b>) for the development on land bearing Kh. No <b>${khasranumber}</b> of <b>${params?.additionalDetails?.ulbType}</b> <b>${ulbname}</b> Area <b>${area}</b> (Sq.mts), address <b>${params?.additionalDetails?.proposedSiteAddress}</b>.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px;">
      This site falls in Ward Number <b>${ward}</b>, zone number <b>${zone}</b> in the Master plan of <b>${district}</b> and the proposed Residential/Commercial/Industrial construction is permissible in this area.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px;">
      I am currently registered as (<b>${architecttype || "<Professional's User Type>"}</b>) with the Competent Authority and empanelled under Self-Certification Scheme.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px;">
      I hereby certify that I/we have been appointed by the owner to prepare the plans, sections and details, structural details as required under the Punjab Municipal Building Byelaws for the above-mentioned project.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px;">
      That the drawings prepared and uploaded along with other necessary documents on this eNaksha portal are as per the provisions of Punjab Municipal Building Byelaws and this building plan has been applied under Self-Certification Scheme. I certify that:
    </p>

    <ol style="margin-top:-52px;margin-bottom:-32px; padding:0;">
      <li style="margin-top:-5px;margin-bottom:-5px;">1. That I am fully conversant with the provisions of the Punjab Municipal Building Byelaws and other applicable instructions/regulations, which are in force and I undertake to fulfil the same.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">2. That plans have been prepared within the framework of provisions of the Master Plan and applicable Building Bye Laws / Regulations.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">3. That site does not fall in any prohibited area/ government land/ encroachment or any other land restricted for building construction or in any unauthorized colony.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">4. That plan is in conformity to structural safety norms.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">5. That I have seen the originals of all the documents uploaded and nothing is concealed thereof.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">6. That all the requisite documents/NOC required to be uploaded have been uploaded on eNaksha portal along with plan.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">7. That above stated facts are true and all the requisite documents uploaded with this eNaksha plan have been signed by the owner/owners in my presence.</li>
    </ol>

   

    <!-- Signature / details table (dotted cells like your doc) -->
    <table style="width:100%; border-collapse:collapse; margin-top:-52px; font-size:13px;">
      <tr>
        <td style="width:48%; vertical-align:top; padding:6px; border:1px dotted #000;">
          <div style="font-weight:700; margin-bottom:6px;">Date:</div>
          <div style="min-height:70px;">${DateOnly}</div>

        </td>

        <td style="width:52%; vertical-align:top; padding:0 0 0 0; border:1px dotted #000;">
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:6px; border-bottom:1px dotted #000; width:40%; font-weight:700;">Name of Professional:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${architecname}</td>
            </tr>
            <tr>
              <td style="padding:6px; border-bottom:1px dotted #000; font-weight:700;">Registration No.:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${architectid || '<Registration Number>'}</td>
            </tr>
            <tr>
              <td style="padding:6px; border-bottom:1px dotted #000; font-weight:700;">Address:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${params?.additionalDetails?.professionalAddress}</td>
            </tr>
            <tr>
              <td style="padding:6px; border-bottom:1px dotted #000; font-weight:700;">Mobile:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${architectmobileNumber}</td>
            </tr>
            <tr>
              <td style="padding:6px; border-bottom:1px dotted #000; font-weight:700;">e-Mail:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${user?.info?.emailId}</td>
            </tr>
            <tr>
              <td style="padding:6px; font-weight:700;">Signature:</td>
              <td style="padding:6px;">Verified through OTP on <b>${TimeStamp || '<date> <time>'}</b></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;



  // right aligned check lines (constructed using current values)
  const isRightAlignedLine = (line) => {
    const trimmed = line.trim();
    const rightAligned = [
      `Name of Professional - <b>${architecname}</b>`,
      `Designation - <b>${architecttype}</b>`,
      `Architect Id - <b>${architectid}</b>`,
      `Mobile Number - <b>${architectmobileNumber}</b>`,
    ];
    return rightAligned.includes(trimmed);
  };

  // avoid embedding TimeStamp directly into a static comparison string — instead check prefix
  const shouldAddSpacing = (currentLine, nextLine) => {
    const lineToCheck1 = "That above stated facts are true and all the requisite documents uploaded with this E-Naksha plan.";
    const lineToCheck2 = "";
    const lineToCheck3Prefix = "This Document is Verified By OTP at";

    return (
      (currentLine?.trim() === lineToCheck1 && (nextLine == null || nextLine?.trim() === lineToCheck2)) ||
      currentLine?.trim().startsWith(lineToCheck3Prefix)
    );
  };

  const openModal = () => setShowTermsPopup(true);
  const closeModal = () => setShowTermsPopup(false);

  const uploadSelfDeclaration = async () => {
    try {
      setIsUploading(true);
      const paramsWithTimestamp = {
        ...params,
        additionalDetails: {
          ...params?.additionalDetails,
          TimeStamp,
        },
      };

      const result = await Digit.PaymentService.generatePdf(Digit.ULBService.getStateId(), { Bpa: [paramsWithTimestamp] }, "architectconsent");

      if (result?.filestoreIds?.[0]) {
        alert("File Uploaded Successfully");
        sessionStorage.setItem("ArchitectConsentdocFilestoreid", result.filestoreIds[0]);
        setIsFileUploaded(true);
      } else {
        alert("File Upload Failed");
      }
    } catch (error) {
      console.error("Error uploading PDF:", error);
      alert("Error Uploading PDF: " + (error?.message || error));
    } finally {
      setIsUploading(false);
    }
  };

  // react-modal expects style keys overlay and content (not modal/modalOverlay)
  const modalStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    content: {
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
    },
  };

  return (
    <div>
      <Modal isOpen={showTermsPopup} onRequestClose={closeModal} contentLabel="Self-Declaration" style={modalStyles}>
        <div>
          {/* <h2 style={modalStyles.heading}>DECLARATION UNDER SELF-CERTIFICATION SCHEME</h2>
          <h3 style={modalStyles.subheading}>(For proposed Construction)</h3>
          <h3 style={modalStyles.subheading}>(By Architect/ Civil Engineer/ Building Designer and Supervisor)</h3> */}

          <div style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", textAlign: "justify", fontFamily: "Roboto, serif" }}>
            {/* {selfdeclarationform.split("\n").map((line, index, arr) => (
              <React.Fragment key={index}>
                <div style={isRightAlignedLine(line) ? modalStyles.rightAlignedText : {}} dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }} />

            
                {shouldAddSpacing(line, arr[index + 1]) && <div style={{ marginBottom: "2rem" }} />}
              </React.Fragment>
            ))} */}
            <div dangerouslySetInnerHTML={{ __html: selfdeclarationform }} />

          </div>

          {!isArchitectDeclared && <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <SubmitBar label={t("BPA_CLOSE")} onSubmit={closeModal} />
            <SubmitBar label={t("BPA_UPLOAD")} onSubmit={uploadSelfDeclaration} disabled={isUploading || isFileUploaded} />
          </div>}
          
          {isArchitectDeclared && <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <SubmitBar label={t("BPA_CLOSE")} onSubmit={closeModal} />
          </div>}
        </div>
      </Modal>
    </div>
  );
};

export default Architectconcent;
