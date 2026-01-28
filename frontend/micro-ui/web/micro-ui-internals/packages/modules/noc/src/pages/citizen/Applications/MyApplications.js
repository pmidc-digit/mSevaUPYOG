import { Card, Header, KeyNote, Loader, SubmitBar } from "@mseva/digit-ui-react-components";
import React,{useEffect,useState} from "react";
import { useTranslation } from "react-i18next";
import { useHistory, Link } from "react-router-dom";

const MyApplications = ({ view }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const userInfo = Digit.UserService.getUser()?.info || {};
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  //console.log("userInfo========", userInfo);

  const searchListDefaultValues = {
    sortBy: "createdTime",
    //limit: window.Digit.Utils.browser.isMobile() ? 50 : 10,
    offset: 0,
    sortOrder: "DESC",
    mobileNumber:""
  };

  const { isLoading, data, isError, error } = Digit.Hooks.noc.useNOCCitizenSearchApplication(
    {...searchListDefaultValues,
     mobileNumber:userInfo?.mobileNumber || ""
    },
    // { mobileNumber: userInfo.mobileNumber }
    tenantId);

  console.log("data herein NOC==>", data);

  const labels=["CS_CF_VIEW", "CS_CF_TRACK", "TL_VIEW_DETAILS"];

  useEffect(()=>{
    if(data){
      data.revalidate();
    }
  },[])

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
        console.log('filteredApplication', filteredApplication)
        //console.log("filtered Applications here==>", filteredApplication);
        //console.log("application?.Applications?.applicationNo", application);
        const applicationStatus=application?.Applications?.applicationStatus || "";
        return (
          <div key={`card-${index}`}>
            <Card>
              {Object.keys(filteredApplication)
                .filter((key) => filteredApplication[key] !== null)
                .map((item, idx) => (
                  <KeyNote
                    key={item}
                    keyValue={t(item)}
                    note={idx === 1 ? <span style={{ color: "#ae0000",  fontWeight:"normal"}}>{t(filteredApplication[item])}</span> : t(filteredApplication[item])}
                  />
                ))}

              <Link to={`/digit-ui/citizen/noc/search/application-overview/${application?.Applications?.applicationNo}`}>
                <SubmitBar
                  //  label={applicationStatus === "APPROVED" ? t(labels[2]) : applicationStatus === "REJECTED" || applicationStatus === "CITIZENACTIONREQUIRED" ? t(labels[0]) : t(labels[1])}
                  label={t(labels[2])}
                />
              </Link>

              {/* {application?.Applications?.applicationStatus === "PENDINGPAYMENT" && (
                <Link
                  to={{
                    pathname: `/digit-ui/citizen/payment/collect/obpas_noc/${application?.Applications?.applicationNo}/${tenantId}?tenantId=${tenantId}`,
                  }}
                >
                  <div style={{ marginTop: "10px" }}>
                    <SubmitBar label={t("COMMON_MAKE_PAYMENT")} />
                  </div>
                </Link>
               )} */}
            </Card>
          </div>
        );
      })}
      </div>
    </React.Fragment>
  );
};
export default MyApplications;
