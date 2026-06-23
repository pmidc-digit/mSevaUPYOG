import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { CardLabel, OTPInput, SubmitBar } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Loader } from "../../../challanGeneration/src/components/Loader";

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

  const isCitizenDeclared = sessionStorage.getItem("CitizenConsentdocFilestoreidADS");
  const DateOnly = new Date();

  console.log('getModalData :>> ', getModalData);
  const formatUlbName = (ulbName = "") => {
    if (!ulbName) return "";
    const parts = ulbName.split(".");
    return parts.length > 1 ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : ulbName.charAt(0).toUpperCase() + ulbName.slice(1);
  };
  const formattedUlbName = formatUlbName(getModalData?.ulbName);

  const selfdeclarationform = `
    <div style="font-family:'Times New Roman', Times, serif; color:#000; font-size:16px; line-height:1.8;">
      
      <h1 style="text-align:center; font-weight:bold; font-size:22px; margin-bottom:40px; letter-spacing:0.5px; color:#1a1a1a;">
        SELF-DECLARATION FOR ADVERTISEMENT / HOARDING PERMISSION
      </h1>

      <div style="margin-bottom:32px; line-height:1.8;">
        <p style="margin:0 0 16px 0; text-align:justify;">
          I, <strong>${getModalData?.name || ownername}</strong>, resident of
          <strong> ${getModalData?.residentOf || getModalData?.address}</strong>, do hereby declare that:
        </p>
      </div>

      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">1.</span>
        <span>I am applying for permission to install/display an advertisement/hoarding at the approved location mentioned in the application.</span>
      </div>
      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">2.</span>
        <span>I shall ensure that the advertisement content complies with all applicable laws, rules, regulations, and guidelines issued by the Government, Municipal Corporation/Council, and other competent authorities from time to time.</span>
      </div>
      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">3.</span>
        <span>I shall not display any objectionable, misleading, unlawful, defamatory, political, religiously sensitive, obscene, or prohibited content in the advertisement.</span>
      </div>
      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">4.</span>
        <span>I shall obtain all necessary permissions/NOCs from the concerned departments, wherever required, before installation of the advertisement/hoarding.</span>
      </div>
      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">5.</span>
        <span>I shall ensure that the advertisement structure is safe, stable, and does not pose any risk to public safety, traffic movement, government property, or nearby structures.</span>
      </div>
      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">6.</span>
        <span>I shall be solely responsible for any accident, damage, injury, or loss caused due to the installation, maintenance, or removal of the advertisement/hoarding.</span>
      </div>
      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">7.</span>
        <span>I shall pay all applicable advertisement fees, taxes, penalties, and other charges as prescribed by the Municipal Corporation/Council.</span>
      </div>
      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">8.</span>
        <span>I shall maintain cleanliness around the advertisement site and shall not cause any obstruction to public roads, footpaths, drains, parks, or public utilities.</span>
      </div>
      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">9.</span>
        <span>I shall remove the advertisement/hoarding immediately upon expiry, cancellation, or revocation of permission and restore the site to its original condition.</span>
      </div>
      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">10.</span>
        <span>The Municipal Corporation/Council reserves the right to remove or cancel the advertisement permission at any time in the public interest or in case of violation of any terms and conditions.</span>
      </div>
      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">11.</span>
        <span>I shall not transfer, sublet, or assign the advertisement permission to any other person or agency without prior approval of the Municipal Corporation/Council.</span>
      </div>
      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">12.</span>
        <span>I shall comply with all directions issued by the Municipal Corporation/Council regarding the advertisement site and its operation from time to time.</span>
      </div>
      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">13.</span>
        <span>In case any information furnished by me is found to be false or incorrect, the permission may be cancelled and legal action may be initiated against me as per applicable rules and regulations.</span>
      </div>
      <div style="margin-bottom:18px; text-align:justify; display:flex; align-items:flex-start; gap:8px;">
        <span style="min-width:35px; font-weight:600; color:#333;">14.</span>
        <span>I have read and understood all the terms and conditions and agree to abide by them.</span>
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
        sessionStorage.setItem("CitizenConsentdocFilestoreidADS", result?.filestoreIds[0]);
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
          <div
            className="break-words text-justify font-roboto"
          >
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
