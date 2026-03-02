import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { SubmitBar, CardLabel, OTPInput, Loader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";

const CitizenConsent = ({ showTermsPopupOwner, setShowTermsPopupOwner }) => {
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
console.log('data for ownerconsent', data)
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
  const applicationnumber = data?.applicationData?.applicationNo;
  const architectid = data?.applicationData?.additionalDetails?.architectid;
  const architecttype = data?.applicationData?.additionalDetails?.typeOfArchitect;
  // const TimeStamp = otpVerifiedTimestamp;
  const ulbselection = data?.applicationData?.additionalDetails?.Ulblisttype === "Municipal Corporation" ? "The Municipal Commissioner" : "Executive Officer";
  // const TimeStamp = otpVerifiedTimestamp || data?.applicationData?.additionalDetails?.TimeStamp || "";
  const stakeholderName = data?.applicationData?.additionalDetails?.stakeholderName || "NA";
  const isCitizenDeclared = sessionStorage.getItem("CitizenConsentdocFilestoreid");
  const address = data?.applicationData?.landInfo?.owners?.[0]?.permanentAddress || "NA";
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [otp, setOTP] = useState("");
  const [otpError, setOTPError] = useState("");
  const [otpSuccess, setOTPSuccess] = useState("");
  const [TimeStamp, setOTPVerifiedTimestamp] = useState(() => {
    return sessionStorage.getItem("otpVerifiedTimestampcitizen") || ""
  })
  const [userSelected, setUser] = useState(null);
  const [setOtpLoading, setSetOtpLoading] = useState(false);
  const stateCode = Digit.ULBService.getStateId()
  const parseFormattedTimestamp = (str) => {
    // Example input: "06 November 2025 Thursday 05:16:41 PM IST"
    const [day, monthName, year, , time, period] = str?.split(" ");
    const [hour, minute, second] = time?.split(":");
    const month = new Date(`${monthName} 1, 2000`).getMonth(); // get month index

    let h = Number(hour);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    return new Date(year, month, Number(day), h, Number(minute), Number(second));
  };
  const d = TimeStamp === "" ? "" : parseFormattedTimestamp(TimeStamp);
  const DateOnly = TimeStamp === "" ? "" : `${String(d?.getDate()).padStart(2, "0")}/${String(d?.getMonth() + 1).padStart(2, "0")}/${d?.getFullYear()}`;
  // const DateOnly = TimeStamp 
  // ? (() => {
  //     const date = new Date(TimeStamp);
  //     const day = String(date.getDate()).padStart(2, "0");
  //     const month = String(date.getMonth() + 1).padStart(2, "0");
  //     const year = date.getFullYear();
  //     return `${day}/${month}/${year}`;
  //   })()
  // : "";

  const handleVerifyOTPClick = async () => {
    const requestData = {
      username: ownermobileNumber,
      password: otp,
      tenantId: user?.info?.tenantId,
      userType: user?.info?.type,
    }
    try {
      setSetOtpLoading(true);
      // const response = await Digit.UserService.authenticate(requestData)
      const { ResponseInfo, UserRequest: info, ...tokens } = await Digit.UserService.authenticate(requestData)
      if (ResponseInfo.status === "Access Token generated successfully") {        
        setOTPSuccess(t("VERIFIED"))
        const currentTimestamp = new Date()
        const opts = {
          timeZone: "Asia/Kolkata",  // ensures IST
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZoneName: "short"
        };

        const parts = new Intl.DateTimeFormat("en-IN", opts).formatToParts(currentTimestamp);
        const map = Object.fromEntries(parts.map(p => [p.type, p.value]));

        // assemble in required order: day month year weekday time dayPeriod timezone
        const formatted = `${map.day} ${map.month} ${map.year} ${map.weekday} ${map.hour}:${map.minute}:${map.second} ${map.dayPeriod} ${map.timeZoneName}`;
        setOTPVerifiedTimestamp(formatted)
        sessionStorage.setItem("otpVerifiedTimestampcitizen", formatted)
        setUser({ info, ...tokens });
        setSetOtpLoading(false)
        return currentTimestamp
      } else {
        // setIsOTPVerified(false)
        setOTPError(t("WRONG OTP"))
        setSetOtpLoading(false)
        return "";
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      setIsOTPVerified(false)
      setOTPError(t("Error verifying OTP"))
      return "";
    }
  };

  const handleGetOTPClick = async () => {
    // Call the Digit.UserService.sendOtp API to send the OTP
    try {
      const response = await Digit.UserService.sendOtp({
        otp: { mobileNumber: ownermobileNumber, tenantId: user?.info?.tenantId, userType: user?.info?.type, type: "login" },
      })
      if (response.isSuccessful) {
        setShowOTPInput(true)
      } else {
        // Handle error case if OTP sending fails
        console.error("Error sending OTP Response is false:", response.error)
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
    }
  }

  console.log("TimeStamp", params?.additionalDetails?.TimeStamp, TimeStamp);

  
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



  const selfdeclarationform = data?.applicationData?.additionalDetails?.isSelfCertification ?`
  <div style="font-family:'Times New Roman', Times, serif; color:#000; font-size:16px; line-height:1.18; margin-top:-100px; padding:0;">

    <h2 style="text-align:center; font-size:20px; margin:0 0 6px 0; font-weight:700; text-transform:uppercase;">
      OWNER'S DECLARATION
    </h2>
    <div style="text-align:center; margin-top:-78px; font-size:16px;">
      (For Authorization of ${architecttype} under Self-Certification Scheme)
    </div>

    <div style="margin-top:-52px;">
      <p style="margin-bottom:-32px;"><strong>To</strong></p>
      <p style="margin-bottom:-32px;"><strong>${ulbselection || "<ULB Type>"}</strong></p>
      <p style="margin-bottom:-32px;"><b>${data?.applicationData?.additionalDetails?.UlbName || "<ULB Name>"}</b></p>
    </div>

    <p style="margin-top:-50px;"><strong>Dear Sir/Madam,</strong></p>

    <p style="margin-top:-52px;margin-bottom:-32px;margin-left-5px; text-align:justify;">
  I/We, Shri/Smt/Kum <b>${data?.applicationData?.landInfo?.owners.map(item => item?.name).join(", ") || "<Owner Name>"}</b>, undersigned owner(s) of land bearing Kh. No. <b>${khasranumber}</b> of ${data?.applicationData?.additionalDetails?.Ulblisttype} - <b>${data?.applicationData?.additionalDetails?.UlbName}</b>, Area <b>${area}</b> (Sq.mts.), address <b>${address || "NA"}</b>, Ward Number <b>${ward}</b>, Zone Number <b>${data?.applicationData?.additionalDetails?.zonenumber}</b>, City <b>${data?.applicationData?.additionalDetails?.District || "<City>"}</b>.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px; text-align:justify;">
  I/We hereby declare that the Professional's Name <b>${stakeholderName}</b> <b>${architecttype}</b> having Registration No <b>${architectid}</b> is appointed by me/us and is authorized to make representation/application with regard to aforesaid construction to any of the authorities.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px; text-align:justify;">
  I/We further declare that I am/We are aware of all the actions taken or representations made by the <b>${architecttype}</b> authorized by me/us.
    </p>

    <ol style="margin-top:-52px;margin-bottom:-32px; padding:0;">
      <li style="margin-top:-5px;margin-bottom:-25px;">1. That I am/We are sole owner(s) of the site.</li>
      <li style="margin-top:-5px;margin-bottom:-25px;">2. That there is no dispute regarding the site and if any dispute arises, then I/We shall be solely responsible for the same.</li>
      <li style="margin-top:-5px;margin-bottom:-25px;">3. That construction of the building will be undertaken as per the approved building plans and structural design given by the Structural Engineer.</li>,
      <li style="margin-top:-5px;margin-bottom:-25px;">4. If there is any shortfall in fees, I will be liable to pay the balance amount.</li>
      <li style="margin-top:-5px;margin-bottom:-25px;">That above stated facts are true and the requisite documents have been uploaded with this building plan and nothing has been concealed thereof.</li>
    </ol>

    <!-- Signature / details table -->
    ${TimeStamp !== "" ? `<table style="width:100%; border-collapse:collapse; margin-top:6px; font-size:14px;">
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
              <td style="padding:6px; border-bottom:1px dotted #000; font-weight:700;">Application Number:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${applicationnumber}</td>
            </tr>
            <tr>
              <td style="padding:6px; border-bottom:1px dotted #000; font-weight:700;">Address:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${address}</td>
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
              <td style="padding:6px;">Verified through OTP on <b>${TimeStamp || "<date> <time>"}</b></td>
            </tr>
          </table>` : ""}
        </td>
      </tr>
    </table>
  </div>
` : `
  <div style="font-family:'Times New Roman', Times, serif; color:#000; font-size:16px; line-height:1.18; margin-top:-100px; padding:0;">

    <h2 style="text-align:center; font-size:20px; margin:0 0 6px 0; font-weight:700; text-transform:uppercase;">
      OWNER'S DECLARATION
    </h2>
    <div style="text-align:center; margin-top:-78px; font-size:16px;">
      (For Authorization of ${architecttype})
    </div>

    <div style="margin-top:-52px;">
      <p style="margin-bottom:-32px;"><strong>To</strong></p>
      <p style="margin-bottom:-32px;"><strong>${ulbselection || "<ULB Type>"}</strong></p>
      <p style="margin-bottom:-32px;"><b>${data?.applicationData?.additionalDetails?.UlbName || "<ULB Name>"}</b></p>
    </div>

    <p style="margin-top:-50px;"><strong>Dear Sir/Madam,</strong></p>

    <p style="margin-top:-52px;margin-bottom:-32px;margin-left-5px; text-align:justify;">
  I/We, Shri/Smt/Kum <b>${data?.applicationData?.landInfo?.owners.map(item => item?.name).join(", ") || "<Owner Name>"}</b>, undersigned owner(s) of land bearing Kh. No. <b>${khasranumber}</b> of ${data?.applicationData?.additionalDetails?.Ulblisttype} - <b>${data?.applicationData?.additionalDetails?.UlbName}</b>, Area <b>${area}</b> (Sq.mts.), address <b>${address || "NA"}</b>, Ward Number <b>${ward}</b>, Zone Number <b>${data?.applicationData?.additionalDetails?.zonenumber}</b>, City <b>${data?.applicationData?.additionalDetails?.District || "<City>"}</b>.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px; text-align:justify;">
  I/We hereby declare that the Professional's Name <b>${stakeholderName}</b> <b>${architecttype}</b> having Registration No <b>${architectid}</b> is appointed by me/us and is authorized to make representation/application with regard to aforesaid construction to any of the authorities.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px; text-align:justify;">
  I/We further declare that I am/We are aware of all the actions taken or representations made by the <b>${architecttype}</b> authorized by me/us.
    </p>

    <ol style="margin-top:-52px;margin-bottom:-32px; padding:0;">
      <li style="margin-top:-5px;margin-bottom:-25px;">1. That I am/We are sole owner(s) of the site.</li>
      <li style="margin-top:-5px;margin-bottom:-25px;">2. That there is no dispute regarding the site and if any dispute arises, then I/We shall be solely responsible for the same.</li>
      <li style="margin-top:-5px;margin-bottom:-25px;">3. That construction of the building will be undertaken as per the approved building plans and structural design given by the Structural Engineer.</li>,
      <li style="margin-top:-5px;margin-bottom:-25px;">4. If there is any shortfall in fees, I will be liable to pay the balance amount.</li>
      <li style="margin-top:-5px;margin-bottom:-25px;">That above stated facts are true and the requisite documents have been uploaded with this building plan and nothing has been concealed thereof.</li>
    </ol>

    <!-- Signature / details table -->
    ${TimeStamp !== "" ? `<table style="width:100%; border-collapse:collapse; margin-top:6px; font-size:14px;">
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
              <td style="padding:6px; border-bottom:1px dotted #000; font-weight:700;">Application Number:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${applicationnumber}</td>
            </tr>
            <tr>
              <td style="padding:6px; border-bottom:1px dotted #000; font-weight:700;">Address:</td>
              <td style="padding:6px; border-bottom:1px dotted #000;">${address}</td>
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
              <td style="padding:6px;">Verified through OTP on <b>${TimeStamp || "<date> <time>"}</b></td>
            </tr>
          </table>` : ""}
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
      const timeStamp = await handleVerifyOTPClick();
      if(timeStamp === "") {
        alert("OTP Verification Failed. Cannot upload the document.");
        return;
      }
      setIsUploading(true); // Set isUploading to true before starting the upload
      
      const opts = {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZoneName: "short"
      };

      const parts = new Intl.DateTimeFormat("en-IN", opts).formatToParts(timeStamp);
      const map = Object.fromEntries(parts.map(p => [p.type, p.value]));

      const formattedIST = `${map.day} ${map.month} ${map.year} ${map.weekday} ${map.hour}:${map.minute}:${map.second} ${map.dayPeriod} ${map.timeZoneName}`;
      const updatedAdditionalDetails = {
        ...data?.applicationData,
        TimeStamp: formattedIST,
      };

      // Update the entire data object with the new additionalDetails
      const updatedData = {
        applicationNo: data?.applicationNo,
        ulbselection,
        tenantId: data?.tenantId,
        applicationData: {
          ...updatedAdditionalDetails
        },
      };

      console.log("updatedData", updatedData);
      console.log(data, "DatA");

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

  useEffect(() => {
    if (!userSelected) {
      return;
    }
    Digit.SessionStorage.set("citizen.userRequestObject", user);
    Digit.UserService.setUser(userSelected);
    setCitizenDetail(userSelected?.info, userSelected?.access_token, stateCode);
  }, [userSelected]);

  const setCitizenDetail = (userObject, token, tenantId) => {
    let locale = JSON.parse(sessionStorage.getItem("Digit.initData"))?.value?.selectedLanguage;
    localStorage.setItem("Citizen.tenant-id", tenantId);
    localStorage.setItem("tenant-id", tenantId);
    localStorage.setItem("citizen.userRequestObject", JSON.stringify(userObject));
    localStorage.setItem("locale", locale);
    localStorage.setItem("Citizen.locale", locale);
    localStorage.setItem("token", token);
    localStorage.setItem("Citizen.token", token);
    localStorage.setItem("user-info", JSON.stringify(userObject));
    localStorage.setItem("Citizen.user-info", JSON.stringify(userObject));
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

  const isValidMobileNumber = ownermobileNumber?.length === 10 && /^[0-9]+$/.test(ownermobileNumber)

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

          {(isUploading || setOtpLoading) ? <Loader />: <div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SubmitBar label={t("BPA_CLOSE")} onSubmit={closeModal} />
          </div>
          <br></br>
          {!isCitizenDeclared && <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <br></br>
            <SubmitBar label={t("BPA_UPLOAD")} onSubmit={handleGetOTPClick} disabled={!isValidMobileNumber} />
          </div>}
          {/* uploadSelfDeclaration - isUploading || isFileUploaded */}
          {showOTPInput && !isCitizenDeclared && (
            <React.Fragment>
              <br></br>
              <CardLabel>{t("BPA_OTP")}</CardLabel>
              <OTPInput length={6} onChange={(value) => setOTP(value)} value={otp} />

              <SubmitBar label={t("VERIFY_OTP")} onSubmit={uploadSelfDeclaration} />
              {otpError && <CardLabel style={{ color: "red" }}>{t(otpError)}</CardLabel>}
              {otpSuccess && <CardLabel style={{ color: "green" }}>{t(otpSuccess)}</CardLabel>}
            </React.Fragment>
          )}</div>}
        </div>
      </Modal>
    </div>
  );
};

export default CitizenConsent;
