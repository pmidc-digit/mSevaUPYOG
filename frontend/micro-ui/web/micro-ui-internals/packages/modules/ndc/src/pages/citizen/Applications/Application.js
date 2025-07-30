import { Card, Header, KeyNote, Loader, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const MyApplications = ({ view }) => {
  const { t } = useTranslation();

  const userInfo = Digit.UserService.getUser()?.info || {};
  const tenantId = window.localStorage.getItem("CITIZEN.CITY")
  console.log("userInfo========", userInfo);

  // const { isLoading, isError, data, error, ...rest } =
  //   view === "bills"
  //     ? Digit.Hooks.tl.useFetchBill({
  //         params: { businessService: "TL", tenantId, mobileNumber },
  //         config: { enabled: view === "bills" },
  //       })
  //     : Digit.Hooks.tl.useTLSearchApplication(
  //         {},
  //         {
  //           enabled: view !== "bills",
  //         },
  //         t
  //       );

  // const { data: NDCData } = Digit.Hooks.ndc.useSearchApplication({uuid: userInfo.uuid}, tenantId)
  const { isLoading, data, isError, error } = Digit.Hooks.ndc.useSearchApplication({mobileNumber: userInfo.mobileNumber}, tenantId)


  if (isLoading) {
    return <Loader />;
  }

  
  return (
    <React.Fragment>
      <Header>{`${t("TL_MY_APPLICATIONS_HEADER")}`}</Header>
      {data?.map((application, index) => {
        return (
          <div key={`card-${index}`}>
            <Card>
              {Object.keys(application)
                .filter((e) => e !== "raw" && application[e] !== null)
                .map((item) => (
                  <KeyNote keyValue={t(item)} note={t(application[item])} />
                ))}
              {/* <Link to={`/digit-ui/citizen/tl/tradelicence/application/${application?.raw?.applicationNumber}/${application.raw?.tenantId}`}>
                <SubmitBar label={t(application?.raw?.status != "PENDINGPAYMENT" ? "TL_VIEW_DETAILS" : "TL_VIEW_DETAILS_PAY")} />
              </Link>{" "} */}
              {/* {application?.raw?.status === "PENDINGPAYMENT" ? (
                  <Link
                  to={{
                    pathname : `/digit-ui/citizen/payment/collect/${data?.[0]?.raw?.businessService}/${application?.raw?.applicationNumber}`,
                  }}>
                    <div style={{marginTop:"10px"}}>
                    <SubmitBar label ={t("COMMON_MAKE_PAYMENT")}/>
                    </div>
                  </Link>
              ):null} */}
            </Card>
          </div>
        );
      })}
    </React.Fragment>
  );
};
export default MyApplications;
