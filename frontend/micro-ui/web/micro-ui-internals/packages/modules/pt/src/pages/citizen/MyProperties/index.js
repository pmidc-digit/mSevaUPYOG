import { Header } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import MyProperty from "./my-properties";

export const MyProperties = () => {
  const { t } = useTranslation();
  const isCitizen = window?.location?.href?.includes("citizen");
  const tenantId = isCitizen ? "pb" : Digit.ULBService.getCurrentTenantId();
  const [applicationsList, setApplicationsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const w = window.innerWidth;
  const gridCols = w >= 1024 ? "repeat(3, 1fr)" : w >= 640 ? "repeat(2, 1fr)" : "1fr";

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const filters = { tenantId };
        const auth = true;
        const response = await Digit.PTService.applicationsearch({ filters, auth });
        setApplicationsList(response?.Properties?.length ? response.Properties : []);
      } catch (error) {
        setApplicationsList([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [tenantId]);

  return (
    <React.Fragment>
      <Header>{`${t("PT_MY_PROPERTIES_HEADER")} ${applicationsList.length > 0 ? `(${applicationsList.length})` : ""}`}</Header>

      <div style={{ padding: "0 16px", maxWidth: "1200px" }}>

        {isLoading && (
          <p style={{ color: "#94a3b8", marginTop: "16px" }}>{t("PT_LOADING_PROPERTIES")}</p>
        )}

        {!isLoading && applicationsList.length === 0 && (
          <p style={{ color: "#64748b", marginTop: "16px" }}>{t("PT_NO_PROP_FOUND_MSG")}</p>
        )}
         
        {!isLoading && applicationsList.length > 0 && (
         
          <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "16px", marginTop: "8px" }}>
            {applicationsList.map((application, index) => (
              <MyProperty key={`${application.propertyId}-${index}`} application={application} />
            ))}
          </div>
          
        )}
        
        {!isLoading && (
          <p style={{ marginTop: "20px" }}>
            <Link
              to="/digit-ui/citizen/pt/property/new-application/info"
              style={{ fontSize: "13px", color: "#2947A3", fontWeight: 600 }}
            >
              + {t("PT_COMMON_CLICK_HERE_TO_REGISTER_NEW_PROPERTY")}
            </Link>
          </p>
        )}

      </div>
    </React.Fragment>
  );
};
