import React from "react";
import { Link } from "react-router-dom";

const CitizenHomeCardWithExternalLink = ({ header, links = [], state, Icon, Info, isInfo = false, styles }) => {
    // const isUserLoggedIn = Digit.UserService.isLoggedIn();
    const user = Digit.UserService?.getUser()
    const tenantId = localStorage.getItem("CITIZEN.CITY");
    const isUserLoggedIn = user?.access_token
    const isUserRegistered = user?.info?.roles?.some(role => role?.code === "BPA_ARCHITECT") || (user?.info?.roles?.some(role => role?.code?.includes("BPA")) && user?.info?.roles?.find(role => role?.code?.includes("BPA"))?.tenantId === tenantId);
    console.log("links", links, isUserLoggedIn, user);
  return (
    <div className="CitizenHomeCard" style={styles ? styles : {}}>
      <div className="header">
        <h2>{header}</h2>
        <Icon />
      </div>

      <div className="links">
        {links.map((e, i) => (
          <div className="linksWrapper" style={{paddingLeft:"10px"}}>
            {(e?.parentModule?.toUpperCase() == "BIRTH" ||
              e?.parentModule?.toUpperCase() == "DEATH" ||
              e?.parentModule?.toUpperCase() == "FIRENOC") ?
              <a href={e.link}>{e.i18nKey}</a> :
              <div>
                {!e?.navigationURL?.includes("https") ?
                <div>
                {e?.name === "BPA_CITIZEN_HOME_VIEW_LOGIN_AS_PROFESSIONAL_LABEL" && !isUserLoggedIn && <Link key={i} to={{ pathname: e.link, state: e.state }}>
                    {e.i18nKey}
                </Link>}
                {e?.name === "BPA_CITIZEN_HOME_STAKEHOLDER_LOGIN_LABEL" && !isUserRegistered && <Link key={i} to={{ pathname: e.link, state: e.state }}>
                    {e.i18nKey}
                </Link>}
                {e?.name === "BPA_CITIZEN_HOME_ARCHITECT_LOGIN_LABEL" && isUserRegistered && <Link key={i} to={{ pathname: e.link, state: e.state }}>
                    {e.i18nKey}
                </Link>}
                {e?.name !== "BPA_CITIZEN_HOME_VIEW_LOGIN_AS_PROFESSIONAL_LABEL" && e?.name !== "BPA_CITIZEN_HOME_STAKEHOLDER_LOGIN_LABEL" && e?.name !== "BPA_CITIZEN_HOME_ARCHITECT_LOGIN_LABEL" && <Link key={i} to={{ pathname: e.link, state: e.state }}>
                    {e.i18nKey}
                </Link>}
                </div>
                 :
                <a href={e.link} target="_blank" >{e.i18nKey}</a> 
                }
              </div>
            }
          </div>
        ))}
      </div>
      <div>{isInfo ? <Info /> : null}</div>
    </div>
  );
};

export default CitizenHomeCardWithExternalLink;
