import React, { useEffect, useState } from "react";
import { Dropdown } from "@mseva/digit-ui-react-components";
import ChangeCity from "../ChangeCity";
import ChangeLanguage from "../ChangeLanguage";

const MSEVA_LOGO_URL = "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/download.png";

const formatDateTime = (date) =>
  date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const EmployeeTopBar = ({
  t,
  stateInfo,
  cityDetails,
  logoUrl,
  loggedin,
  userDetails,
  profilePic,
  userOptions,
  handleUserDropdownSelection,
  showLanguageChange,
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const userName = userDetails?.info?.name || userDetails?.info?.userInfo?.name || "Employee";
  const stateName = `${t(`MYCITY_${stateInfo?.code?.toUpperCase()}_LABEL`)} ${t("MYCITY_STATECODE_LABEL")}`;
  const ulbName = loggedin && cityDetails?.i18nKey ? t(cityDetails.i18nKey) : stateName;
  const ulbGrade = loggedin && cityDetails?.city?.ulbGrade
    ? t(`ULBGRADE_${cityDetails.city.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`)
    : "";
  const showCityPicker = loggedin && !window.location.href.includes("employee/user/login") && !window.location.href.includes("employee/user/language-selection");

  return (
    <header className="mseva-header">
      <div className="mseva-header__top">
        <div className="mseva-group">
          <div className="mseva-logo-chip">
            <img alt="mSeva Logo" src={MSEVA_LOGO_URL} />
          </div>
          {logoUrl && (
            <React.Fragment>
              <span className="mseva-divider" />
              <img className="mseva-emblem" alt="" src={logoUrl} />
            </React.Fragment>
          )}
          <div className="mseva-ulb">
            <span className="mseva-ulb__name">{ulbName}</span>
            {ulbGrade && <span className="mseva-ulb__grade">{ulbGrade}</span>}
          </div>
        </div>

        <div className="mseva-group">
          <div className="mseva-clock">
            <CalendarIcon />
            <span>{formatDateTime(now)}</span>
          </div>
          {loggedin && (
            <Dropdown
              option={userOptions}
              optionKey={"name"}
              select={handleUserDropdownSelection}
              freeze={true}
              optionCardStyles={{ overflow: "revert", right: 0, left: "auto" }}
              customSelector={
                <div className="mseva-user">
                  {profilePic ? (
                    <img src={profilePic} alt="" className="mseva-avatar-img" />
                  ) : (
                    <span className="mseva-avatar">{userName?.[0]?.toUpperCase()}</span>
                  )}
                  <span className="mseva-user__name">{userName}</span>
                  <ChevronDownIcon />
                </div>
              }
            />
          )}
        </div>
      </div>

      <div className="mseva-header__sub">
        <div className="mseva-group">
          <img className="mseva-subbar__logo" alt="mSeva" src={MSEVA_LOGO_URL} />
          <span className="mseva-divider mseva-divider--dark" />
          <span className="mseva-ulb__name mseva-subbar__name">{ulbName}</span>
        </div>

        <div className="mseva-group">
          {showCityPicker && (
            <div className="mseva-city-chip">
              <ChangeCity dropdown={true} t={t} />
            </div>
          )}
          {showLanguageChange !== false && (
            <div className="mseva-lang-btn">
              <GlobeIcon />
              <ChangeLanguage dropdown={true} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default EmployeeTopBar;
