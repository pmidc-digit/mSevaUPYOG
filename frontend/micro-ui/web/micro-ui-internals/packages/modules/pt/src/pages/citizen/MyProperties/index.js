import { Header } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import MyProperty from "./my-properties";

export const MyProperties = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const [applicationsList, setApplicationsList] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const filters = { tenantId };
        const auth = true;
        const response = await Digit.PTService.applicationsearch({ filters, auth });
        setApplicationsList(response?.Properties?.length ? response.Properties : []);
      } catch (error) {
        setApplicationsList([]);
      }
    };
    fetchProperties();
  }, [tenantId]);

  return (
    <React.Fragment>
      <Header>{`${t("PT_MY_PROPERTIES_HEADER")} ${applicationsList ? `(${applicationsList.length})` : ""}`}</Header>
      <div>
        {applicationsList?.length > 0 &&
          applicationsList.map((application, index) => (
            <div key={index}>
              <MyProperty application={application} />
            </div>
          ))}
        {!(applicationsList?.length > 0) && <p style={{ marginLeft: "16px", marginTop: "16px" }}>{t("PT_NO_PROP_FOUND_MSG")}</p>}

        {/* {applicationsList?.length !== 0 && (
          <div>
            <p style={{ marginLeft: "16px", marginTop: "16px" }}>
              <span className="link">{<Link to={`/digit-ui/citizen/pt/property/my-property/${t1}`}>{t("PT_LOAD_MORE_MSG")}</Link>}</span>
            </p>
          </div>
        )} */}
      </div>
      <p style={{ marginLeft: "16px", marginTop: "16px" }}>
        {/* {applicationsList.length === 0? t("PT_TEXT_NOT_ABLE_TO_FIND_THE_APPLICATION"): " "} */}
        <span className="link" style={{ display: "block" }}>
          <Link to="/digit-ui/citizen/pt/property/new-application/info">{t("PT_COMMON_CLICK_HERE_TO_REGISTER_NEW_PROPERTY")}</Link>
        </span>
      </p>
    </React.Fragment>
  );
};
