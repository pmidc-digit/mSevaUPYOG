import { Card, PropertyHouse } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const InboxLinks = ({ parentRoute, businessService }) => {
  const { t } = useTranslation();

  const allLinks = [
    // {
    //   text: t("ES_TITLE_NEW_ADD_BOOKING"),
    //   link: "/digit-ui/employee/ads/bookad",
    //   roles: [],
    // },
    // {
    //   text: t("ADS_MY_APPLICATIONS"),
    //   link: `/digit-ui/employee/ads/my-applications`,
    //   roles: [],
    // },
    // {
    //   text: "ADS_SITE_INSPECTION_DETAILS",
    //   link: `/digit-ui/employee/ads/site-inspection-details`,
    //   roles: [],
    // },
    // {
    //   text: "ADS_SITE_MASTER",
    //   link: `/digit-ui/employee/ads/site-master-details`,
    //   roles: [],
    // },
    // {
    //   text: "ES_COMMON_APPLICATION_SEARCH",
    //   link: `/digit-ui/employee/ads/application-search`,
    //   roles: [],
    // },
    // {
    //   text: "PTR_COMMON_APPLICATION_SEARCH",
    //   link: `/digit-ui/employee/ptr/application-search`,
    //   businessService: "ptr",
    //   roles: [],
    // },
    // { text: "PT_REPORTS", hyperLink: true, link: "/digit-ui/employee/integration/dss/propertytax", roles: [], businessService: "PT" },
    // { text: "PT_DASHBOARD", link: "/digit-ui/employee/", roles: [], businessService: "PT" },
  ];

  const [links, setLinks] = useState([]);

  const { roles: userRoles } = Digit.UserService.getUser().info;

  useEffect(() => {
    let linksToShow = allLinks;
    setLinks(linksToShow);
  }, []);

  const GetLogo = () => (
    <div className="header">
      <span className="logo">
        <PropertyHouse />
      </span>{" "}
      <span className="text">{t("ADS_SERVICE")}</span>
    </div>
  );

  return (
    // <Card style={{ paddingRight: 0, marginTop: 0 }} className="employeeCard filter inboxLinks">
    <Card className="employeeCard filter inboxLinks">
      <div className="complaint-links-container">
        {GetLogo()}
        {/* <div style={{ marginLeft: "unset", paddingLeft: "0px" }} className="body"> */}
        <div className="body">
          {links.map(({ link, text, hyperlink = false, roles = [] }, index) => {
            return (
              <span className="link" key={index}>
                {hyperlink ? <a href={link}>{text}</a> : <Link to={link}>{t(text)}</Link>}
              </span>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default InboxLinks;
