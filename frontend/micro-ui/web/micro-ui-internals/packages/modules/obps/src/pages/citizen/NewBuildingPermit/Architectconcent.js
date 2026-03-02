import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useLocation } from "react-router-dom";
import { SubmitBar, CardLabel, OTPInput, Loader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

// Fixed ArchitectConsent component
// - ensures setParams is destructured from session hook
// - prevents ReferenceError for TimeStamp by providing a safe default
// - avoids embedding TimeStamp directly inside a static comparison string
// - safer upload with params+TimeStamp merged

const Architectconcent = ({ showTermsPopup, setShowTermsPopup, otpVerifiedTimestamp, currentStepData, formData, onSelect }) => {
  const { state } = useLocation();
  const { t } = useTranslation();

  // user info from service
  const user = Digit.UserService.getUser();
  const architecname = user?.info?.name || "";
  const architectmobileNumber = user?.info?.mobileNumber || "";
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOTP] = useState("");
  const [otpError, setOTPError] = useState("");
  const [otpSuccess, setOTPSuccess] = useState("");
  const [setOtpLoading, setSetOtpLoading] = useState(false);
  const [getOtpLoading, setGetOtpLoading] = useState(false);

  // IMPORTANT: destructure both params and setParams so you can update session storage
  const [params, setParams] = Digit.Hooks.useSessionStorage(
    "BUILDING_PERMIT",
    state?.edcrNumber ? { data: { scrutinyNumber: { edcrNumber: state?.edcrNumber } } } : {}
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [userSelected, setUser] = useState(null);
console.log('currentStepData', currentStepData)
  // Map fields safely from params (these may be undefined)
  const architectid = currentStepData?.createdResponse?.additionalDetails?.architectid || "";
  const ownername = currentStepData?.createdResponse?.landInfo?.owners?.[0]?.name || "";
  const mobile = currentStepData?.createdResponse?.landInfo?.owners?.[0]?.mobileNumber || "";
  const architecttype = currentStepData?.createdResponse?.additionalDetails?.typeOfArchitect || user?.info?.roles?.find((r) => r.code === "BPA_ARCHITECT")?.name || "";
  const khasranumber = currentStepData?.createdResponse?.additionalDetails?.khasraNumber || "";
  const ulbname = currentStepData?.createdResponse?.additionalDetails?.District || "";
  const district = currentStepData?.createdResponse?.additionalDetails?.UlbName || "";
  const ward = currentStepData?.createdResponse?.additionalDetails?.wardnumber || "";
  const area = currentStepData?.createdResponse?.additionalDetails?.area || "";
  const zone = currentStepData?.createdResponse?.additionalDetails?.zonenumber || "";
  const ulbgrade = currentStepData?.createdResponse?.additionalDetails?.Ulblisttype || "";
  const owners = currentStepData?.createdResponse?.landInfo?.owners || [];

  const ownerDetails = owners
    .map((item) => {
      const name = item?.name || "<Owner Name>";
      const mobile = item?.mobileNumber || "<Mobile>";
      return `<b>${name}</b> Mobile: <b>${mobile}</b>`;
    })
    .join(", ");

  // safe TimeStamp - prefer the one passed in props, fallback to stored value, fallback to empty string
  // const TimeStamp = otpVerifiedTimestamp ?? params?.additionalDetails?.TimeStamp ?? "";
  // const TimeStamp = otpVerifiedTimestamp || params?.additionalDetails?.TimeStamp || "";
  const [TimeStamp, setOTPVerifiedTimestamp] = useState(currentStepData?.TimeStamp?.TimeStamp || "");
  const [isArchitectDeclared, setIsArchitectDeclared] = useState(currentStepData?.TimeStamp?.isArchitectDeclared || "");
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
  //     const d = new Date(TimeStamp);
  //     const month = String(d.getMonth() + 1).padStart(2, "0");
  //     const day = String(d.getDate()).padStart(2, "0");
  //     const year = d.getFullYear();
  //     return `${day}/${month}/${year}`;
  //   })()
  // : "";

  // const isArchitectDeclared = sessionStorage.getItem("ArchitectConsentdocFilestoreid");

  console.log(currentStepData, isArchitectDeclared, TimeStamp, "PARAM");

  useEffect(() => {
    console.log("currentStepDataInArchitectConsent", currentStepData);
    if(currentStepData?.Timestamp?.TimeStamp){
      setOTPVerifiedTimestamp(currentStepData?.Timestamp?.TimeStamp)
    }
    if(currentStepData?.Timestamp?.isArchitectDeclared){
      setIsArchitectDeclared(currentStepData?.Timestamp?.isArchitectDeclared)
    }
  }, [currentStepData]);

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

  useEffect(() => {
    if (!userSelected) {
      return;
    }
    Digit.SessionStorage.set("citizen.userRequestObject", user);
    Digit.UserService.setUser(userSelected);
    setCitizenDetail(userSelected?.info, userSelected?.access_token, state);
  }, [userSelected]);


const selfdeclarationform = currentStepData?.createdResponse?.additionalDetails?.isSelfCertification ? `
  <div style="font-family: 'Times New Roman', Times, serif; color:#000; font-size:16px; line-height:1.18; padding:0; margin-top:-100px">

    <h2 style="text-align:center; font-size:20px; margin:0 0 6px 0; font-weight:700; text-transform:uppercase;">
      DECLARATION UNDER SELF-CERTIFICATION SCHEME
    </h2>
    <div style="text-align:center; margin-top:-78px;">
      <div style="font-size:16px; margin:0;">(For ${currentStepData?.createdResponse?.additionalDetails?.usage || '<Type of Construction>'} Construction)</div>
      <div style="font-size:16px; margin:2px 0 0 0;">(By Architect/ Civil Engineer/ Building Designer and Supervisor)</div>
    </div>

    <div style="margin-top:-52px;">
      <p style="margin-bottom:-32px;"><strong>To</strong></p>
      <p style="margin-bottom:-32px;"><strong>${currentStepData?.createdResponse?.additionalDetails?.Ulblisttype === "Municipal Corporation" ? "The Municipal Commissioner" : "The Executive officer"}</strong></p>
      <p style="margin-bottom:-32px;">${currentStepData?.LocationDetails?.selectedCity?.city?.ulbType}</p>
      <p style="margin-bottom:-32px;">${currentStepData?.createdResponse?.additionalDetails?.UlbName}</p>
    </div>

    <p style="margin-top:-52px;margin-bottom:-32px;"><strong>Dear Sir/Madam,</strong></p>

    <p style="margin-top:-30px;margin-bottom:-32px;">
      I, the undersigned Shri/Smt/Kum <b>${architecname}</b> <b>${architecttype }</b> having Registration No. ${architectid}  is appointed by the owner(s) ${ownerDetails} for the development on land bearing Kh. No <b>${khasranumber}</b> of <b>${currentStepData?.LocationDetails?.selectedCity?.city?.ulbType}</b> <b>${district}</b> Area <b>${area}</b> (Sq.mts), address <b>${(currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInformation?.plotNo + " ," + currentStepData?.createdResponse?.additionalDetails?.registrationDetails) || "NA"}</b>.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px;">
      This site falls in Ward Number <b>${ward}</b>, Zone Number <b>${zone}</b> in the Master plan of <b>${district}</b> and the proposed ${currentStepData?.createdResponse?.additionalDetails?.usage || '<Type of Construction>'} construction is permissible in this area.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px;">
      I am currently registered as <b>${architecttype || "<Professional's User Type>"}</b> with the Competent Authority and empanelled under Self-Certification Scheme.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px;">
      I hereby certify that I/we have been appointed by the owner to prepare the plans, sections and details, structural details as required under the Punjab Municipal Building Byelaws for the above-mentioned project.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px;">
      That the drawings prepared and uploaded along with other necessary documents on this mSeva (OBPAS) portal are as per the provisions of Punjab Municipal Building Byelaws and this building plan has been applied under Self-Certification Scheme. I certify that:
    </p>

    <ol style="margin-top:-52px;margin-bottom:-32px; padding:0;">
      <li style="margin-top:-5px;margin-bottom:-5px;">1. That I am fully conversant with the provisions of the Punjab Municipal Building Byelaws and other applicable instructions/regulations, which are in force and I undertake to fulfil the same.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">2. That plans have been prepared within the framework of provisions of the Master Plan and applicable Building Bye Laws / Regulations.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">3. That site does not fall in any prohibited area/ government land/ encroachment or any other land restricted for building construction or in any unauthorized colony.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">4. That plan is in conformity to structural safety norms.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">5. That I have seen the originals of all the documents uploaded and nothing is concealed thereof.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">6. That all the requisite documents/NOC required to be uploaded have been uploaded on mSeva (OBPAS)  portal along with plan.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">7. That all the requisite fees required to be deposited have been mentioned.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">8. That above stated facts are true and all the requisite documents uploaded with this OBPAS plan have been signed by the owner/owners in my presence.</li>
    </ol>

   

    <!-- Signature / details table (dotted cells like your doc) -->
    ${TimeStamp !== ""?`<table style="width:100%; border-collapse:collapse; margin-top:-52px; font-size:13px;">
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
              <td style="padding:6px; border-bottom:1px dotted #000;">${currentStepData?.PlotDetails?.tradeLicenseDetail?.owners?.[0]?.permanentAddress || "NA"}</td>
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
          </table>`:""}
        </td>
      </tr>
    </table>
  </div>
` :`
  <div style="font-family: 'Times New Roman', Times, serif; color:#000; font-size:16px; line-height:1.18; padding:0; margin-top:-100px">

    <h2 style="text-align:center; font-size:20px; margin:0 0 6px 0; font-weight:700; text-transform:uppercase;">
      DECLARATION
    </h2>
    <div style="text-align:center; margin-top:-78px;">
      <div style="font-size:16px; margin:0;">(For ${currentStepData?.createdResponse?.additionalDetails?.usage || '<Type of Construction>'} Construction)</div>
      <div style="font-size:16px; margin:2px 0 0 0;">(By Architect/ Civil Engineer/ Building Designer and Supervisor)</div>
    </div>

    <div style="margin-top:-52px;">
      <p style="margin-bottom:-32px;"><strong>To</strong></p>
      <p style="margin-bottom:-32px;"><strong>${currentStepData?.createdResponse?.additionalDetails?.Ulblisttype === "Municipal Corporation" ? "The Municipal Commissioner" : "The Executive officer"}</strong></p>
      <p style="margin-bottom:-32px;">${currentStepData?.LocationDetails?.selectedCity?.city?.ulbType}</p>
      <p style="margin-bottom:-32px;">${currentStepData?.createdResponse?.additionalDetails?.UlbName}</p>
    </div>

    <p style="margin-top:-52px;margin-bottom:-32px;"><strong>Dear Sir/Madam,</strong></p>

    <p style="margin-top:-30px;margin-bottom:-32px;">
      I, the undersigned Shri/Smt/Kum <b>${architecname}</b> <b>${architecttype }</b> having Registration No. ${architectid}  is appointed by the owner(s) ${ownerDetails} for the development on land bearing Kh. No <b>${khasranumber}</b> of <b>${currentStepData?.LocationDetails?.selectedCity?.city?.ulbType}</b> <b>${district}</b> Area <b>${area}</b> (Sq.mts), address <b>${(currentStepData?.BasicDetails?.edcrDetails?.planDetail?.planInformation?.plotNo + " ," + currentStepData?.createdResponse?.additionalDetails?.registrationDetails) || "NA"}</b>.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px;">
      This site falls in Ward Number <b>${ward}</b>, Zone Number <b>${zone}</b> in the Master plan of <b>${district}</b> and the proposed ${currentStepData?.createdResponse?.additionalDetails?.usage || '<Type of Construction>'} construction is permissible in this area.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px;">
      I am currently registered as <b>${architecttype || "<Professional's User Type>"}</b> with the Competent Authority.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px;">
      I hereby certify that I/we have been appointed by the owner to prepare the plans, sections and details, structural details as required under the Punjab Municipal Building Byelaws for the above-mentioned project.
    </p>

    <p style="margin-top:-52px;margin-bottom:-32px;">
      That the drawings prepared and uploaded along with other necessary documents on this mSeva (OBPAS) portal are as per the provisions of Punjab Municipal Building Byelaws. I certify that:
    </p>

    <ol style="margin-top:-52px;margin-bottom:-32px; padding:0;">
      <li style="margin-top:-5px;margin-bottom:-5px;">1. That I am fully conversant with the provisions of the Punjab Municipal Building Byelaws and other applicable instructions/regulations, which are in force and I undertake to fulfil the same.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">2. That plans have been prepared within the framework of provisions of the Master Plan and applicable Building Bye Laws / Regulations.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">3. That site does not fall in any prohibited area/ government land/ encroachment or any other land restricted for building construction or in any unauthorized colony.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">4. That plan is in conformity to structural safety norms.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">5. That I have seen the originals of all the documents uploaded and nothing is concealed thereof.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">6. That all the requisite documents/NOC required to be uploaded have been uploaded on mSeva (OBPAS)  portal along with plan.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">7. That all the requisite fees required to be deposited have been mentioned.</li>
      <li style="margin-top:-5px;margin-bottom:-5px;">8. That above stated facts are true and all the requisite documents uploaded with this OBPAS plan have been signed by the owner/owners in my presence.</li>
    </ol>

   

    <!-- Signature / details table (dotted cells like your doc) -->
    ${TimeStamp !== ""?`<table style="width:100%; border-collapse:collapse; margin-top:-52px; font-size:13px;">
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
              <td style="padding:6px; border-bottom:1px dotted #000;">${currentStepData?.PlotDetails?.tradeLicenseDetail?.owners?.[0]?.permanentAddress || "NA"}</td>
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
          </table>`:""}
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
      `${architecttype} Id - <b>${architectid}</b>`,
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

  const uploadSelfDeclaration = async (event) => {
    try {
      const timestamp = await handleVerifyOTPClick(event);
      const addressee = currentStepData?.createdResponse?.additionalDetails?.Ulblisttype === "Municipal Corporation" ? "The Municipal Commissioner" : "The Executive officer"
      if(timestamp === ""){
        return;
      }
      setIsUploading(true);
      const paramsWithTimestamp = {
        ...currentStepData?.createdResponse,
        addressee,
        additionalDetails: {
          ...currentStepData?.createdResponse?.additionalDetails,
          timestamp
        },
        edcrDetail: {
          ...currentStepData?.BasicDetails?.edcrDetails,
        }
      };
console.log('paramsWithTimestamp', paramsWithTimestamp)
      const result = await Digit.PaymentService.generatePdf(Digit.ULBService.getStateId(), { Bpa: [paramsWithTimestamp] }, "architectconsent");

      if (result?.filestoreIds?.[0]) {
        alert(t("File Uploaded Successfully"));
        // sessionStorage.setItem("ArchitectConsentdocFilestoreid", result.filestoreIds[0]);
        onSelect({
          isArchitectDeclared: result?.filestoreIds?.[0],
          TimeStamp: timestamp
        });
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

  const handleGetOTPClick = async (e) => {
    e.preventDefault(); // Prevent form submission
    try {
      setGetOtpLoading(true);
      const response = await Digit.UserService.sendOtp({
        otp: {
          mobileNumber: architectmobileNumber || "",
          tenantId: user?.info?.tenantId,
          userType: user?.info?.type,
          type: "login",
        },
      });

      if (response.isSuccessful) {
        setGetOtpLoading(false);
        setShowOTPInput(true);
      } else {
        console.error("Error sending OTP Response is false:", response.error);
        alert("Something Went Wrong");
        setGetOtpLoading(false);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Something went wrong");
      setGetOtpLoading(false);
    }
  };

  const handleVerifyOTPClick = async (e) => {
    e.preventDefault(); // Prevent form submission
    console.log("OTP++++++++>");
    const requestData = {
      username: architectmobileNumber || "",
      password: otp,
      tenantId: user?.info?.tenantId,
      userType: user?.info?.type,
    };
    try {
      setSetOtpLoading(true)
      // const response = await Digit.UserService.authenticate(requestData);
      const { ResponseInfo, UserRequest: info, ...tokens } = await Digit.UserService.authenticate(requestData);
      if (ResponseInfo.status === "Access Token generated successfully") {
        // setIsOTPVerified(true);
        setOTPSuccess(t("VERIFIED"));
        setOTPError(false);
        const currentTimestamp = new Date();
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
        setOTPVerifiedTimestamp(formatted);
        sessionStorage.setItem("otpVerifiedTimestamp", formatted);
        setSetOtpLoading(false);
        setUser({ info, ...tokens });
        return formatted;
      } else {
        // setIsOTPVerified(false);
        setOTPError(t("WRONG OTP"));
        setSetOtpLoading(false)
        return ""
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("OTP Verification Error ");
      // setIsOTPVerified(false);
      setOTPError(t("OTP Verification Error"));
      setSetOtpLoading(false);
      return "";
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

          {(isUploading || setOtpLoading) ? <Loader />: <div>
            {(isArchitectDeclared === "") && <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
              <SubmitBar label={t("BPA_CLOSE")} onSubmit={closeModal} />
              <SubmitBar label={t("BPA_UPLOAD")} onSubmit={handleGetOTPClick} disabled={getOtpLoading} />
            </div>}
            {/* uploadSelfDeclaration  - isUploading || isFileUploaded */}

            {!(isArchitectDeclared === "") && <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
              <SubmitBar label={t("BPA_CLOSE")} onSubmit={closeModal} />
            </div>}

            {showOTPInput && !TimeStamp && (
              <React.Fragment>
                <br></br>
                <CardLabel>{t("BPA_OTP")}</CardLabel>
                <OTPInput length={6} onChange={(value) => setOTP(value)} value={otp} />
                {setOtpLoading ? <Loader /> : <SubmitBar label={t("VERIFY_OTP")} onSubmit={uploadSelfDeclaration} />}
                {otpError && <CardLabel style={{ color: "red" }}>{t(otpError)}</CardLabel>}
                {otpSuccess && <CardLabel style={{ color: "green" }}>{t(otpSuccess)}</CardLabel>}
              </React.Fragment>
            )}
          </div>}
        </div>
      </Modal>
    </div>
  );
};

export default Architectconcent;
