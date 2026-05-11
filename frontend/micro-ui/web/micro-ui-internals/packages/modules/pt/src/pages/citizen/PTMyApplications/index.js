import { SubmitBar, Card, Toast } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PTApplication from "./pt-application";

export const PTMyApplications = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const [showToast, setShowToast] = useState(null);
  const [applicationsList, setApplicationsList] = useState([]);
  const fetchApplications = async () => {
    const filters = { tenantId: tenantId };
    const auth = true;
    try {
      Digit.PTService.applicationsearch({ filters: filters, auth: auth }).then((response) => {
        if (response?.Properties?.length > 0) {
          setApplicationsList(response.Properties);
        } else {
          setApplicationsList([]);
          if (response?.Errors?.message) {
            setShowToast({ key: true, label: `${response?.Errors?.message}`, error: true });
          }
        }
      });
    } catch (error) {
      setShowToast({ key: true, label: "PT_FETCH_APPLICATIONS_ERROR", error: true });
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleRedirect = () => {
    history.push("/digit-ui/citizen/pt/property/create-application");
  };
  return (
    <React.Fragment>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", float:"right", marginBottom:"15px" }}>
          {/* <h1 style={{ fontSize: "20px" }}>All Applications</h1> */}
          <SubmitBar label="Add New Property" onSubmit={handleRedirect} />
        </div>
        {/* <hr style={{ marginTop: "10px" }} /> */}

      {applicationsList?.length > 0 &&
        applicationsList.map((application, index) => (
          <div key={application?.acknowldgementNumber || index}>
            <PTApplication application={application} tenantId={tenantId} buttonLabel={t("CS_VIEW_DETAILS")} />
          </div>
        ))}

      {/* <span className="link" style={{display:"flex", justifyContent: isMobile ? "center" : "left", paddingBottom:"16px", paddingLeft: "24px", marginTop: "-24px"}}>
        <Link to={"/digit-ui/citizen/pt/property/new-application"}>{t("CPT_REG_NEW_PROPERTY")}</Link>
      </span> */}
      {showToast && (
        <Toast
          error={showToast.error}
          isDleteBtn={true}
          warning={showToast.warning}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
        />
      )}

      {/* // <p style={{ marginLeft: "16px", marginTop: "16px" }}>
      //   {t("PT_TEXT_NOT_ABLE_TO_FIND_THE_APPLICATION")}{" "}
      //   <span className="link" style={{ display: "block" }}>
      //     <Link to="/digit-ui/citizen/pt/property/new-application/info">{t("PT_COMMON_CLICK_HERE_TO_REGISTER_NEW_PROPERTY")}</Link>
      //   </span>
      // </p> */}
    </React.Fragment>
  );
};
