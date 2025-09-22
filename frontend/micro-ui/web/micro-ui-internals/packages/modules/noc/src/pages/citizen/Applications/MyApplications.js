import { Card, Header, KeyNote, Loader, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory, Link } from "react-router-dom";

const MyApplications = ({ view }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const userInfo = Digit.UserService.getUser()?.info || {};
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  //console.log("userInfo========", userInfo);

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
        //console.log("filtered Applications here==>", filteredApplication);
        console.log("application?.Applications?.applicationNo", application);
        return (
          <div key={`card-${index}`}>
            <Card>
              {Object.keys(filteredApplication)
                .filter((key) => filteredApplication[key] !== null)
                .map((item) => (
                  <KeyNote keyValue={t(item)} note={t(filteredApplication[item])} />
                ))}

              <Link to={`/digit-ui/citizen/noc/search/application-overview/${application?.Applications?.applicationNo}`}>
                <SubmitBar label={t("TL_VIEW_DETAILS")} />
              </Link>
                
               {
               (application?.Applications?.applicationStatus === "INITIATED" || application?.Applications?.applicationStatus==="CITIZENACTIONREQUIRED") && 
                  <div style={{marginTop:"10px"}}>
                 <Link to={`/digit-ui/citizen/noc/edit-application/${application?.Applications?.applicationNo}`}>
                  <SubmitBar label={t("COMMON_EDIT_AND_APPLY_LABEL")} />
                </Link>
                </div>
               }
              
               {application?.Applications?.applicationStatus === "PENDINGPAYMENT" && (
                <Link
                  to={{
                    pathname: `/digit-ui/citizen/payment/collect/obpas_noc/${application?.Applications?.applicationNo}/${tenantId}?tenantId=${tenantId}`,
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
