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
  const { isLoading, data, isError, error } = Digit.Hooks.ndc.useSearchApplication({ mobileNumber: userInfo.mobileNumber }, tenantId);

  console.log("data", data);

  const handlePayment = () => {
    history.push(`/digit-ui/citizen/payment/collect/NDC/${ndcCode}/${tenantId}`);
    // pathname: `/digit-ui/citizen/payment/collect/${application?.businessService}/${application?.applicationNumber}`,
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <Header>{`${t("TL_MY_APPLICATIONS_HEADER")}`}</Header>
      {data?.data?.map((application, index) => {
        const filteredApplication = Object.fromEntries(Object.entries(application).filter(([key]) => key !== "Applications"));
        console.log("application?.Applications?.applicationStatus", application?.Applications);
        return (
          <div key={`card-${index}`}>
            <Card>
              {Object.keys(filteredApplication)
                .filter((key) => filteredApplication[key] !== null)
                .map((item) => (
                  <KeyNote keyValue={t(item)} note={t(filteredApplication[item])} />
                ))}

              {application?.Applications?.applicationStatus === "APPROVED" && (
                <Link to={`/digit-ui/citizen/ndc/search/application-overview/${application?.Applications?.uuid}`}>
                  <SubmitBar label={t("TL_VIEW_DETAILS")} />
                </Link>
              )}

              {application?.Applications?.applicationStatus === "PENDINGPAYMENT" && (
                <Link
                  to={{
                    pathname: `/digit-ui/citizen/payment/collect/NDC/${application?.Applications?.uuid}/${tenantId}?tenantId=${tenantId}`,
                  }}
                >
                  <div style={{ marginTop: "10px" }}>
                    <SubmitBar label={t("COMMON_MAKE_PAYMENT")} />
                  </div>
                </Link>
              )}
              {/* <SubmitBar label={t("COMMON_MAKE_PAYMENT")} onSubmit={handlePayment} /> */}
            </Card>
          </div>
        );
      })}
    </React.Fragment>
  );
};
export default MyApplications;
