import { 
  Card, 
  CaseIcon,
  TimerIcon, 
  RupeeSymbol, 
  ValidityTimeIcon, 
  WhatsappIconGreen, 
  HelpLineIcon, 
  ServiceCenterIcon, 
  Loader, 
  PTIcon, 
  MCollectIcon, 
  ComplaintIcon,
  BPAHomeIcon,
  WSICon
} from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";



const StaticDynamicCard = ({ moduleCode }) => {
  const { t } = useTranslation()
  const tenantId = Digit.ULBService.getCitizenCurrentTenant()
  const { isLoading: isMdmsLoading, data: mdmsData } = Digit.Hooks.useStaticData(Digit.ULBService.getStateId())
  const {
    isLoading: isSearchLoading,
    error,
    data: dynamicData,
    isSuccess,
  } = Digit.Hooks.useDynamicData({ moduleCode, tenantId: tenantId, filters: {}, t })

  if (window.location.href.includes("tl") && window.Digit.SessionStorage.get("TL_CREATE_TRADE"))
    window.Digit.SessionStorage.set("TL_CREATE_TRADE", {})

  const sectionTitleStyle = {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "20px",
    marginTop: "32px",
    color: "#1F1F1F",
  }

  const cardContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  }

  const statCardStyle = {
    backgroundColor: "#FFFFFF",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  }

  const statCardIconStyle = (bgColor) => ({
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: bgColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
    flexShrink: 0,
  })

  const statCardTextStyle = {
    fontSize: "14px !important",
    fontWeight: "400",
    color: "#6B7280",
    marginBottom: "8px",
    lineHeight: "1.5",
  }

  const statCardValueStyle = {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1F1F1F",
  }

  const infoCardStyle = (bgColor) => ({
    backgroundColor: bgColor,
    padding: "24px",
    borderRadius: "12px",
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "16px",
  })

  const infoIconStyle = (iconBg) => ({
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: iconBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  })

  const infoContentStyle = {
    flex: 1,
  }

  const infoTitleStyle = {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#1F1F1F",
  }

  const infoTextStyle = {
    fontSize: "14px",
    fontWeight: "400",
    color: "#4B5563",
    marginBottom: "4px",
    lineHeight: "1.6",
  }

  const linkStyle = {
    color: "#2563EB",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    marginTop: "8px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  }

  const quickProcessingCardStyle = {
    backgroundColor: "#F3EBFF",
    padding: "20px 24px",
    borderRadius: "12px",
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "24px",
  }

  const BriefcaseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  const RefreshIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M21.5 2V8M21.5 8H15.5M21.5 8L18 4.5C16.5 3 14.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C16.8 22 20.9 18.5 21.8 14"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  const ClockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const PhoneIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 16.92V19.92C22 20.4696 21.5523 20.9167 21.0033 20.9206C18.3195 20.9564 15.6684 20.2599 13.3201 18.9029C11.1081 17.6353 9.25998 15.7871 7.99223 13.5751C6.63353 11.2224 5.93686 8.56534 5.97321 5.87558C5.97708 5.32732 6.42317 4.88016 6.97221 4.88016H9.97221C10.5245 4.88016 10.9766 5.32538 10.9844 5.87703C11.0003 6.91799 11.1614 7.94936 11.4631 8.94154C11.6038 9.39824 11.4563 9.89739 11.0924 10.2028L9.63923 11.4196C10.9374 13.7015 12.8156 15.5797 15.0975 16.8779L16.3143 15.4248C16.6197 15.0608 17.1189 14.9133 17.5756 15.054C18.5678 15.3558 19.5991 15.5168 20.6401 15.5328C21.1922 15.5405 21.6377 15.9933 21.6377 16.5459C21.6377 16.5459 22 16.92 22 16.92Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  const MapPinIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const CheckCircleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const ArrowRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const staticContent = (module) => {
    switch (module) {
      case "TL":
        return {
          staticCommonContent: t("TL_VALIDITY"),
        }
      case "MCOLLECT":
        return {
          staticCommonContent: t("CHALLAN_VALIDITY"),
        }
      case "PGR":
        return {
          staticCommonContent: t("CATEGORIES_OF_COMPLAINT_TYPES_CAN_BE_SUBMITTED_ON_GRIEVANCE_PORTAL"),
        }
      case "OBPS":
        return {
          staticCommonContent: t("BUILDING_PLAN_PERMIT_VALIDITY"),
          validity:
            mdmsConfigResult?.validity +
            " " +
            (mdmsConfigResult?.validity === "1" ? t("COMMON_DAY") : t("COMMON_DAYS")),
        }
      default:
        return {
          staticCommonContent: "",
        }
    }
  }

  const staticData = (module) => {
    switch (module) {
      case "PT":
        return {
          staticDataOne: mdmsConfigResult?.staticDataOne + " " + t("COMMON_DAYS"),
          staticDataOneHeader: t("APPLICATION_PROCESSING_TIME"),
          staticDataTwo: mdmsConfigResult?.staticDataTwo,
          staticDataTwoHeader: t("APPLICATION_PROCESSING_FEE"),
        }
      case "WS":
        return {
          staticDataOne: "",
          staticDataOneHeader:
            t("PAY_WATER_CHARGES_BY") +
            " " +
            mdmsConfigResult?.staticDataOne +
            " " +
            t("COMMON_DAYS") +
            " " +
            t("OF_BILL_GEN_TO_AVOID_LATE_FEE"),
          staticDataTwo: mdmsConfigResult?.staticDataTwo + " " + t("COMMON_DAYS"),
          staticDataTwoHeader: t("APPLICATION_PROCESSING_TIME"),
        }
      default:
        return {}
    }
  }

  const mdmsConfigResult = mdmsData?.MdmsRes["common-masters"]?.StaticData[0]?.[`${moduleCode}`]

  if (isMdmsLoading || isSearchLoading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
  }

  return mdmsConfigResult ? (
    <div style={{ width: "100%", margin: "0 auto", padding: "0 20px" }}>
      {/* Statistics Section */}
      {(dynamicData?.dynamicDataOne !== null ||
        dynamicData?.dynamicDataTwo !== null ||
        mdmsConfigResult?.staticDataOne ||
        mdmsConfigResult?.staticDataTwo ||
        mdmsConfigResult?.validity ||
        dynamicData?.staticData !== null) && (
        <React.Fragment>
          <h2 style={sectionTitleStyle}>{t("Statistics & Informations")}</h2>
          <div style={cardContainerStyle}>
            {/* Dynamic Data Card One */}
            {dynamicData?.dynamicDataOne !== null && !error && (
              <div style={statCardStyle}>
                <div style={statCardIconStyle("#4F7FFF")}>
                  <BriefcaseIcon />
                </div>
                <div style={statCardTextStyle}>{t("Trade Licenses issued in last 12 months")}</div>
                <div style={statCardValueStyle}>{dynamicData?.dynamicDataOne}</div>
              </div>
            )}

            {/* Dynamic Data Card Two */}
            {dynamicData?.dynamicDataTwo !== null && !error && (
              <div style={statCardStyle}>
                <div style={statCardIconStyle("#10B981")}>
                  <RefreshIcon />
                </div>
                <div style={statCardTextStyle}>{t("Trade Licenses renewed in last 12 months")}</div>
                <div style={statCardValueStyle}>{dynamicData?.dynamicDataTwo}</div>
              </div>
            )}

            {/* Static Data Card */}
            {dynamicData?.staticData !== null && !error && (
              <div style={statCardStyle}>
                <div style={statCardIconStyle("#8B5CF6")}>
                  <ClockIcon />
                </div>
                <div style={statCardTextStyle}>{staticContent(moduleCode)?.staticCommonContent}</div>
                <div style={statCardValueStyle}>{dynamicData?.staticData}</div>
              </div>
            )}

            {/* Validity Card */}
            {mdmsConfigResult?.validity && (
              <div style={statCardStyle}>
                <div style={statCardIconStyle("#8B5CF6")}>
                  <ClockIcon />
                </div>
                <div style={statCardTextStyle}>{staticContent(moduleCode)?.staticCommonContent}</div>
                <div style={statCardValueStyle}>{staticContent(moduleCode)?.validity}</div>
              </div>
            )}
          </div>
        </React.Fragment>
      )}

      {/* Call Center / Helpline Card */}
      {mdmsConfigResult?.helpline && (
        <div style={infoCardStyle("#EBF3FE")}>
          <div style={infoIconStyle("#4F7FFF")}>
            <PhoneIcon />
          </div>
          <div style={infoContentStyle}>
            <div style={infoTitleStyle}>{t("CALL_CENTER_HELPLINE")}</div>
            {mdmsConfigResult?.helpline?.contactOne && (
              <div style={infoTextStyle}>
                <a
                  href={`tel:${mdmsConfigResult?.helpline?.contactOne}`}
                  style={{ color: "#1F1F1F", textDecoration: "none" }}
                >
                  {mdmsConfigResult?.helpline?.contactOne}
                </a>
              </div>
            )}
            {mdmsConfigResult?.helpline?.contactTwo && (
              <div style={infoTextStyle}>
                <a
                  href={`tel:${mdmsConfigResult?.helpline?.contactTwo}`}
                  style={{ color: "#1F1F1F", textDecoration: "none" }}
                >
                  {mdmsConfigResult?.helpline?.contactTwo}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service Center Card */}
      {mdmsConfigResult?.serviceCenter && (
        <div style={infoCardStyle("#E8F8F5")}>
          <div style={infoIconStyle("#10B981")}>
            <MapPinIcon />
          </div>
          <div style={infoContentStyle}>
            <div style={infoTitleStyle}>{t("CITIZEN_SERVICE_CENTER")}</div>
            <div style={infoTextStyle}>{mdmsConfigResult?.serviceCenter}</div>
            {mdmsConfigResult?.viewMapLocation && (
              <a href={mdmsConfigResult?.viewMapLocation} style={linkStyle} target="_blank" rel="noopener noreferrer">
                {t("VIEW_ON_MAP")}
                <ArrowRightIcon />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Quick Processing Banner */}
      {moduleCode === "TL" && (
        <div style={quickProcessingCardStyle}>
          <div style={infoIconStyle("#8B5CF6")}>
            <CheckCircleIcon />
          </div>
          <div style={infoContentStyle}>
            <div style={infoTitleStyle}>{t("QUICK_PROCESSING")}</div>
            <div style={infoTextStyle}>{t("Most trade license applications are processed within 7-10 working days. Track your application status in real-time through the My Applications section.")}</div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <React.Fragment />
  )
}


export default StaticDynamicCard;