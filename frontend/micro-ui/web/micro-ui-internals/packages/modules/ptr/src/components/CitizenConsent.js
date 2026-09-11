import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { CardLabel, OTPInput, SubmitBar } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Loader } from "../components/Loader";

const CitizenConsent = ({ showTermsPopupOwner, setShowTermsPopupOwner, otpVerifiedTimestamp, getModalData, getUser, getShowOtp }) => {
  const { t } = useTranslation();
  const user = Digit.UserService.getUser();
  const ownername = user?.info?.name;
  const ownermobileNumber = user?.info.mobileNumber;
  const isCitizen = window.location.href.includes("citizen");
  const ownerEmail = user?.info?.emailId;
  const { id } = useParams();
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const [loader, setLoader] = useState(false);

  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOTP] = useState("");
  const [otpError, setOTPError] = useState("");
  const [otpSuccess, setOTPSuccess] = useState("");
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [TimeStamp, setOTPVerifiedTimestamp] = useState(() => {
    return sessionStorage.getItem("otpVerifiedTimestampcitizen") || "";
  });
  const [userSelected, setUser] = useState(null);
  const [setOtpLoading, setSetOtpLoading] = useState(false);
  const stateCode = Digit.ULBService.getStateId();

  const [isUploading, setIsUploading] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  const isCitizenDeclared = sessionStorage.getItem("CitizenConsentdocFilestoreidPTR");
  const DateOnly = new Date();

  console.log(getModalData,"getModalData")
  const formatUlbName = (ulbName = "") => {
    if (!ulbName) return "";
    const parts = ulbName.split(".");
    return parts.length > 1 ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : ulbName.charAt(0).toUpperCase() + ulbName.slice(1);
  };
  const formattedUlbName = formatUlbName(getModalData?.ulbName);

  const formatPetAge = (ageValue) => {
    if (ageValue === null || ageValue === undefined || ageValue === "") return "";
    const ageStr = String(ageValue).trim();
    if (!/^\d+(\.\d+)?$/.test(ageStr)) return ageStr;

    const [yearsPart, decPart] = ageStr.split(".");
    let years = Number(yearsPart) || 0;
    let months = 0;

    if (decPart) {
      if (decPart.length === 1) {
        months = parseInt(decPart, 10);
      } else {
        months = parseInt(decPart.slice(0, 2), 10);
      }
      if (isNaN(months)) months = 0;
    }

    if (months > 11) months = 11;

    if (years === 0 && months === 0) return "";
    if (years === 0) return `${months} month${months > 1 ? "s" : ""}`;
    if (months === 0) return `${years} year${years > 1 ? "s" : ""}`;
    return `${years} year${years > 1 ? "s" : ""} ${months} month${months > 1 ? "s" : ""}`;
  };

  const applicantName = getModalData?.name || ownername || "";
  const fatherOrHusbandName = getModalData?.fatherOrHusbandName || getModalData?.fatherName || "";
  const residentAddress = getModalData?.address || getModalData?.residentOf || "";
  const dogName = getModalData?.petName || getModalData?.dogName || "";
  const petType = getModalData?.petType?.name || getModalData?.petType || "";
  const breed = (typeof getModalData?.breedType === "object" ? getModalData?.breedType?.name : getModalData?.breedType) || getModalData?.breed || "";
  const sex = (typeof getModalData?.petGender === "object" ? getModalData?.petGender?.name : getModalData?.petGender) || getModalData?.gender || getModalData?.sex || "";
  const age = getModalData?.petAge ? formatPetAge(getModalData?.petAge) : getModalData?.age || "";
  const place = formattedUlbName || getModalData?.ulbName || "";
  const currentDate = new Date().toLocaleDateString("en-IN");

  const selfdeclarationform = `
    <div style="font-family:'Times New Roman', Times, serif; color:#000; font-size:16px; line-height:1.8;">
      
      <h1 style="text-align:center; font-weight:bold; font-size:20px; margin-bottom:30px; letter-spacing:0.5px; color:#1a1a1a; text-transform:uppercase;">
        SELF-DECLARATION FOR REGISTRATION OF PET ${petType}
      </h1>

      <div style="margin-bottom:24px; line-height:2.0; text-align:justify;">
        <p style="margin:0 0 16px 0;">
          I <strong><u>${applicantName || "___________________________________"}</u></strong> S/O <strong><u>${fatherOrHusbandName || "_______________________________"}</u></strong> resident of <strong><u>${residentAddress || "___________________________________________"}</u></strong> Hereby declare that I am the owner of the ${petType} mentioned below:-
        </p>
      </div>

      <div style="margin-left:15px; margin-bottom:24px; line-height:2.2;">
        <p style="margin:4px 0;"><strong>${petType} Name:</strong> <u>${dogName || "____________________________"}</u></p>
        <p style="margin:4px 0;"><strong>Breed:</strong> <u>${breed || "_________________________________"}</u></p>
        <p style="margin:4px 0;"><strong>Sex:</strong> <u>${sex || "____________________________________"}</u></p>
        <p style="margin:4px 0;"><strong>Age:</strong> <u>${age || "___________________________________"}</u></p>
      </div>

      <div style="margin-bottom:24px; line-height:1.9; text-align:justify;">
        <p style="margin:0 0 16px 0;">
          I hereby declare that all documents and information submitted by me for registration of my pet ${petType} are true, correct and genuine. I understand that I shall be personally responsible for any false, forged or incorrect document/information submitted by me.
        </p>
        <p style="margin:0 0 16px 0;">
          I further declare that I shall be responsible for the proper control and care of my ${petType} and for any loss, injury, damage or inconvenience caused by my ${petType} to any citizen or property.
        </p>
        <p style="margin:0 0 16px 0;">
          I undertake to follow all rules and regulations applicable issued by AWBI/local authority or any other authority relating to ${petType} ownership and registration.
        </p>
        <p style="margin:0 0 16px 0;">
          I have read and understood the above declaration and confirm that the information and documents submitted by me are true and genuine.
        </p>
      </div>

      <div style="margin-top:40px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
          <div><strong>Place:</strong> <u>${place || "__________________"}</u></div>
          <div><strong>Date:</strong> <u>${currentDate || "__________________"}</u></div>
        </div>
        <div style="margin-top:20px;">
          <p style="margin:0;"><strong>Signature of ${petType} Owner:</strong> <u>${applicantName || "_______________________"}</u></p>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => {
    setShowTermsPopupOwner(false);
  };

  const handleVerifyOTPClick = async () => {
    const requestData = {
      username: getModalData?.mobileNumber,
      password: otp,
      tenantId: "pb",
      userType: "citizen",
    };
    try {
      setSetOtpLoading(true);
      const { ResponseInfo, UserRequest: info, ...tokens } = await Digit.UserService.authenticate(requestData);
      if (ResponseInfo.status === "Access Token generated successfully") {
        setOTPSuccess(t("VERIFIED"));
        const currentTimestamp = new Date();
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
          timeZoneName: "short",
        };

        const parts = new Intl.DateTimeFormat("en-IN", opts).formatToParts(currentTimestamp);
        const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));

        const formatted = `${map.day} ${map.month} ${map.year} ${map.weekday} ${map.hour}:${map.minute}:${map.second} ${map.dayPeriod} ${map.timeZoneName}`;
        setOTPVerifiedTimestamp(formatted);
        sessionStorage.setItem("otpVerifiedTimestampcitizen", formatted);
        if (isCitizen) setUser({ info, ...tokens });
        setSetOtpLoading(false);
        setShowOTPInput(false);
        setIsOTPVerified(true);
        return currentTimestamp;
      } else {
        setOTPError(t("WRONG OTP"));
        setSetOtpLoading(false);
        return "";
      }
    } catch (error) {
      console.log("error===", error);
      setOTPError(t("Error verifying OTP"));
      setSetOtpLoading(false);
      return "";
    }
  };

  const handleVerifyOTPClickNew = async () => {
    setSetOtpLoading(true);
    const stateCode = "pb";
    const requestData = {
      name: getModalData?.name,
      emailId: getModalData?.emailId,
      username: getModalData?.mobileNumber,
      otpReference: otp,
      tenantId: "pb",
    };
    // return;
    try {
      const { ResponseInfo, UserRequest: info, ...tokens } = await Digit.UserService.registerUser(requestData, stateCode);
      setSetOtpLoading(false);
      setIsOTPVerified(true);
    } catch (error) {
      setOTPError(t("Error verifying OTP"));
      setSetOtpLoading(false);
      return "";
    }
  };

  const handleGetOTPClick = async () => {
    setLoader(true);
    try {
      const response = await Digit.UserService.sendOtp({
        otp: {
          mobileNumber: getModalData?.mobileNumber,
          tenantId: "pb",
          userType: "citizen",
          type: "login",
        },
      });
      setLoader(false);

      if (response?.error) {
        if (response.error.fields && Array.isArray(response.error.fields)) {
          const hasUnknownCredential = response.error.fields.some((field) => {
            return field?.code === "OTP.UNKNOWN_CREDENTIAL";
          });

          if (hasUnknownCredential) {
            alert("User not registered");
            return;
          }
        }

        alert("Error sending OTP: " + (response.error.message || "Unknown error"));
        return;
      }

      if (response.isSuccessful) {
        setShowOTPInput(true);
      } else {
        alert("Failed to send OTP");
      }
    } catch (error) {
      setLoader(false);
      const errorData = error?.response?.data || error?.data;

      if (errorData?.error?.fields && Array.isArray(errorData.error.fields)) {
        const hasUnknownCredential = errorData.error.fields.some((field) => {
          return field?.code === "OTP.UNKNOWN_CREDENTIAL";
        });

        if (hasUnknownCredential) {
          alert("User not registered");
          return;
        }
      }

      alert("Exception occurred: " + (error?.message || "Unknown error"));
    }
  };

  useEffect(() => {
    if (!userSelected) {
      return;
    }
    console.log("userSelected===", userSelected);
    Digit.SessionStorage.set("citizen.userRequestObject", userSelected);
    Digit.UserService.setUser(userSelected);
    setCitizenDetail(userSelected?.info, userSelected?.access_token, stateCode);
  }, [userSelected]);

  const setCitizenDetail = (userObject, token, tenantId) => {
    const locale = JSON.parse(sessionStorage.getItem("Digit.initData"))?.value?.selectedLanguage;
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
      setIsUploading(true);

      const result = await Digit.PaymentService.generatePdf(Digit.ULBService.getStateId(), { Chb: Chb }, "communityhallowner");

      setLoader(false);
      if (result?.filestoreIds[0]?.length > 0) {
        alert("File Uploaded Successfully");
        sessionStorage.setItem("CitizenConsentdocFilestoreidPTR", result?.filestoreIds[0]);
        sessionStorage.removeItem("PTRConsentNeedsReupload");
        setIsFileUploaded(true);
      } else {
        alert("File Upload Failed");
      }
    } catch (error) {
      alert("Error Uploading PDF:", error);
      setLoader(false);
    } finally {
      setLoader(false);
      setIsUploading(false);
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
  };

  const isValidMobileNumber = ownermobileNumber && ownermobileNumber.length === 10;

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
          <div className="break-words text-justify font-roboto">
            <div dangerouslySetInnerHTML={{ __html: selfdeclarationform }} />
          </div>

          {isUploading || setOtpLoading ? (
            <Loader />
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <SubmitBar label={t("BPA_CLOSE")} onSubmit={closeModal} />
              </div>
              <br></br>
              {!isCitizenDeclared && !isOTPVerified && !getShowOtp && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <br></br>
                  <SubmitBar label={t("BPA_UPLOAD")} onSubmit={handleGetOTPClick} disabled={!isValidMobileNumber} />
                </div>
              )}
              {showOTPInput && !isCitizenDeclared && !isOTPVerified && (
                <React.Fragment>
                  <br></br>
                  <CardLabel>{t("CHB_OTP")}</CardLabel>
                  <OTPInput length={6} onChange={(value) => setOTP(value)} value={otp} />

                  <SubmitBar label={t("CHB_VERIFY_OTP")} onSubmit={handleVerifyOTPClick} />
                  {otpError && <CardLabel style={{ color: "red" }}>{t(otpError)}</CardLabel>}
                  {otpSuccess && <CardLabel style={{ color: "green" }}>{t(otpSuccess)}</CardLabel>}
                </React.Fragment>
              )}

              {getShowOtp && !isOTPVerified && !isCitizenDeclared && (
                <React.Fragment>
                  <br></br>
                  <CardLabel>{t("CHB_OTP")}</CardLabel>
                  <OTPInput length={6} onChange={(value) => setOTP(value)} value={otp} />

                  <SubmitBar label={t("CHB_VERIFY_OTP")} onSubmit={handleVerifyOTPClickNew} />
                  {/* {otpError && <CardLabel style={{ color: "red" }}>{t(otpError)}</CardLabel>}
                {otpSuccess && <CardLabel style={{ color: "green" }}>{t(otpSuccess)}</CardLabel>} */}
                </React.Fragment>
              )}
              {isOTPVerified && !isCitizenDeclared && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <br></br>
                  <SubmitBar label={t("CHB_UPLOAD")} onSubmit={uploadSelfDeclaration} />
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
      {(loader || setOtpLoading) && <Loader page={true} />}
    </div>
  );
};

export default CitizenConsent;
