import { Card, CaseIcon } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const InboxLinks = ({ parentRoute, businessService, allLinks, headerText, classNameForMobileView = "" }) => {
  const { t } = useTranslation();

  const [links, setLinks] = useState([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const { roles: userRoles } = Digit.UserService.getUser().info;

  useEffect(() => {
    let linksToShow = allLinks
      .filter((e) => e.businessService === businessService)
      .filter(({ roles }) => roles.some((e) => userRoles.map(({ code }) => code).includes(e)) || !roles.length);
    setLinks(linksToShow);
  }, []);

  const GetLogo = () => (
    <div className="header">
      <span className="logo">
        <CaseIcon />
      </span>{" "}
      <span className="text">{t(headerText)}</span>
    </div>
  );

  const TLNewApplicationModal = Digit?.ComponentRegistryService?.getComponent("TLNewApplicationModal");

  return (
    <Card className="employeeCard filter inboxLinks">
      <div className={`complaint-links-container ${classNameForMobileView}`}>
        {GetLogo()}
        <div className="body">
          {links.map(({ link, text, hyperlink = false, accessTo = [] }, index) => {
            return (
              // <span className="link" key={index}>
              //   link: "/digit-ui/employee/tl/new-application",
              //   {hyperlink ? <a href={link}>{t(text)}</a> : <Link to={link}>{t(text)}</Link>}
              // </span>

              <span className="link" key={index}>
                
                { link === "/digit-ui/employee/tl/new-application" ?  <span onClick={()=>setShowApplicationModal(true)}>{t(text)}</span>
                : hyperlink ? ( <a href={link}>{t(text)}</a> ) : ( <Link to={link}>{t(text)}</Link>)
                }

                {showApplicationModal ? (<TLNewApplicationModal />):null}
              </span>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default InboxLinks;
