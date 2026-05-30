import { Card, PropertyHouse } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const InboxLinks = ({ parentRoute, businessService }) => {
  const { t } = useTranslation();

  const allLinks = [
    {
      text: "ES_TITLE_NEW_REGISTRATION",
      link: "/digit-ui/employee/pt/new-application",
      businessService: "PT",
      roles: [],
      icon: "➕",
    },
    {
      text: "SEARCH_PROPERTY",
      link: `/digit-ui/employee/pt/search`,
      businessService: "PT",
      roles: [],
      icon: "🔍",
    },
    {
      text: "ES_COMMON_APPLICATION_SEARCH",
      link: `/digit-ui/employee/pt/application-search`,
      businessService: "PT",
      roles: [],
      icon: "📋",
    },
  ];

  const [links, setLinks] = useState([]);

  const { roles: userRoles } = Digit.UserService.getUser().info;

  useEffect(() => {
    let linksToShow = allLinks
      .filter((e) => e.businessService === businessService)
      .filter(({ roles }) => roles.some((e) => userRoles.map(({ code }) => code).includes(e)) || !roles?.length);
    setLinks(linksToShow);
  }, []);

  return (
    <Card
      className="employeeCard filter inboxLinks"
      style={{ padding: 0, overflow: "hidden", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", margin: 0 }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #0b4e9b 0%, #1671c8 100%)",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ color: "white", display: "flex", alignItems: "center" }}>
          <PropertyHouse />
        </span>
        <span style={{ color: "white", fontWeight: "700", fontSize: "15px", letterSpacing: "0.3px" }}>
          {t("ES_TITLE_PROPERTY_TAX")}
        </span>
      </div>

      <div style={{ padding: "6px 0" }}>
        {links.map(({ link, text, hyperlink = false, icon }, index) => {
          const linkStyle = {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "11px 16px",
            color: "#1671c8",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "500",
            borderBottom: index < links.length - 1 ? "1px solid #f0f4f8" : "none",
            transition: "background 0.15s",
          };
          return (
            <div key={index}>
              {hyperlink ? (
                <a href={link} style={linkStyle}>
                  <span style={{ fontSize: "13px" }}>{icon}</span>
                  {t(text)}
                </a>
              ) : (
                <Link to={link} style={linkStyle}>
                  <span style={{ fontSize: "13px" }}>{icon}</span>
                  {t(text)}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default InboxLinks;
