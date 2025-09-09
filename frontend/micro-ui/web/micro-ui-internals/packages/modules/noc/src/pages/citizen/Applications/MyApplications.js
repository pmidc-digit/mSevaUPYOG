import { Card, Header, KeyNote, Loader, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory, Link } from "react-router-dom";

const MyApplications = ({ view }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const userInfo = Digit.UserService.getUser()?.info || {};
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  console.log("userInfo========", userInfo);

  const { isLoading, data, isError, error } = Digit.Hooks.noc.useNOCCitizenSearchApplication({ mobileNumber: userInfo.mobileNumber }, tenantId);

  console.log("data herein NOC==>", data);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <div className="applications-list-container">
      <Header>{`${t("NOC_MY_APPLICATION")}`}</Header>
      {data?.data?.length === 0 && (
        <Card style={{textAlign:"center"}}>
         {t("NO_APPLICATIONS_MSG")}
        </Card>
      )}
      {data?.data?.map((application, index) => {
        const filteredApplication = Object.fromEntries(Object.entries(application).filter(([key]) => key !== "Applications"));
        console.log("applications here==>", application?.Applications);
        return (
          <div key={`card-${index}`}>
            <Card>
              {Object.keys(filteredApplication)
                .filter((key) => filteredApplication[key] !== null)
                .map((item) => (
                  <KeyNote keyValue={t(item)} note={t(filteredApplication[item])} />
                ))}

              {application?.Applications?.applicationStatus != "PENDINGPAYMENT" && (
                <Link to={`/digit-ui/citizen/noc/search/application-overview/${application?.Applications?.uuid}`}>
                  <SubmitBar label={t("TL_VIEW_DETAILS")} />
                </Link>
              )}

              {application?.Applications?.applicationStatus === "PENDINGPAYMENT" && (
                <Link
                  to={{
                    pathname: `/digit-ui/citizen/payment/collect/NOC/${application?.Applications?.uuid}/${tenantId}?tenantId=${tenantId}`,
                  }}
                >
                  <div style={{ marginTop: "10px" }}>
                    <SubmitBar label={t("COMMON_MAKE_PAYMENT")} />
                  </div>
                </Link>
              )}
            </Card>
          </div>
        );
      })}
      </div>
    </React.Fragment>
  );
};
export default MyApplications;
