import { Card, PTIcon } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const InboxLinks = ({ parentRoute, businessService }) => {
  const { t } = useTranslation();
  const [links, setLinks] = useState([]);
  const allLinks = [
    {
      // text: t("UC_GENERATE_NEW_CHALLAN"),
      // link: "/digit-ui/employee/challangeneration/generate-challan",
      // roles: [],
    },
    // {
    //   text: "Search Receipt",
    //   link: "/digit-ui/employee/mcollect/search-receipt",
    //   roles: [],
    // },
    // {
    //   text: "Search Challan",
    //   link: "/digit-ui/employee/mcollect/search-challan",
    //   roles: [],
    // },
    // {
    //   text: "Search and Pay",
    //   link: "/digit-ui/employee/mcollect/search-bill",
    //   roles: [],
    // },
    // {
    //   text: "Group Bill",
    //   link: "/digit-ui/employee/mcollect/group-bill",
    //   roles: [],
    // },
  ];

  useEffect(() => {
    let linksToShow = allLinks;
    setLinks(linksToShow);
  }, []);

  const GetLogo = () => (
    <div className="header" style={{ justifyContent: "flex-start" }}>
      <span className="logo">
        <PTIcon />
      </span>{" "}
      <span style={{ fontSize: "18px", paddingLeft: "0" }} className="text">
        {t("ACTION_TEST_CHALLANGENERATION")}
      </span>
    </div>
  );

  return (
    <Card style={{ paddingRight: 0, marginTop: 0 }} className="employeeCard filter inboxLinks">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="complaint-links-container"
      >
        {GetLogo()}
        <div className="body">
          {links.map(({ link, text, hyperlink = false, accessTo = [] }, index) => {
            return (
              <span className="link" key={index}>
                {hyperlink ? <a href={link}>{t(text)}</a> : <Link to={link}>{t(text)}</Link>}
              </span>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default InboxLinks;
