import { Card, PropertyHouse } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";

const InboxLinks = ({ parentRoute, businessService }) => {
  const { t } = useTranslation();

  const GetLogo = () => (
    <div
      className="header"
      style={{
        border: "none",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      <span
        className="logo"
        style={{
          width: "64px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          background: "#FFFFFF",
        }}
      >
        <PropertyHouse />
      </span>
      <span
        className="text"
        style={{
          paddingLeft: 0,
          textAlign: "center",
          fontSize: "22px",
          lineHeight: "30px",
          fontWeight: 700,
          color: "#1F2937",
          letterSpacing: "0.01em",
        }}
      >
        {t("ES_TITLE_PROPERTY_TAX")}
      </span>
    </div>
  );

  return (
    <Card className="employeeCard filter inboxLinks" style={{ margin: 0, padding: 0 }}>
      <div
        className="complaint-links-container"
        style={{
          minHeight: "180px",
          padding: "28px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {GetLogo()}
      </div>
    </Card>
  );
};

export default InboxLinks;
