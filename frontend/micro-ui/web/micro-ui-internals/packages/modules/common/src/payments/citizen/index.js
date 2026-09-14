import React from "react";
import { Switch, Route, useRouteMatch, useLocation, useParams } from "react-router-dom";
import { BreadCrumb, AppContainer, PrivateRoute } from "@mseva/digit-ui-react-components";
import PayersDetails from "./payers-details";
import { useTranslation } from "react-i18next";
import { MyBills } from "./bills";
import { SelectPaymentType } from "./payment-type/index";
import { SuccessfulPayment, SuccessfulZeroPayment, FailedPayment } from "./response";

const NDCBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();

  const pathSegments = location.pathname.split("/");
  const collectIndex = pathSegments.indexOf("collect");
  const successIndex = pathSegments.indexOf("success");
  const zeroIndex = pathSegments.indexOf("zero");
  const businessService =
    collectIndex !== -1 ? pathSegments[collectIndex + 1] :
    successIndex !== -1 ? pathSegments[successIndex + 1] :
    zeroIndex !== -1 ? pathSegments[zeroIndex + 1] :
    null;

  const crumbs = [
    {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/ndc-home",
      content: `${t("Payment")} Page`,
      show: location.pathname.includes("citizen/payment/") ? true : false,
    },
  ];

  const ptCrumbs =[
     {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/pt-home",
      content: `${t("Property")} Home`,
      show: location.pathname.includes("citizen/payment/") ? true : false,
    },
    {
      path: "/digit-ui/citizen/ndc-home",
      content: `${t("Payment")} Page`,
      show: location.pathname.includes("citizen/payment/") ? true : false,
    },
  ];

  const selectedCrumbs = businessService === "PT" ? ptCrumbs : crumbs;
  return <BreadCrumb crumbs={selectedCrumbs} />;
};

const CitizenPayment = ({ stateCode, cityCode, moduleCode }) => {
  const { path: currentPath } = useRouteMatch();
  const commonProps = { stateCode, cityCode, moduleCode };
  const location = useLocation();
  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();
  return (
    <React.Fragment>
      <div className="bills-citizen-wrapper">
        <Switch>
          <AppContainer>
            {!isResponse ? (
              <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px" } : {}}>
                <NDCBreadCrumbs location={location} />
              </div>
            ) : null}
            <Route path={`${currentPath}/my-bills/:businessService`}>
              <MyBills stateCode={stateCode} />
            </Route>
            <Route path={`${currentPath}/billDetails/:businessService/:consumerCode/:paymentAmt`}>
              <PayersDetails {...commonProps} stateCode={stateCode} basePath={currentPath} />
            </Route>
            <Route path={`${currentPath}/collect/:businessService/:consumerCode`}>
              <SelectPaymentType {...commonProps} stateCode={stateCode} basePath={currentPath} />
            </Route>
            <Route path={`${currentPath}/success/:businessService/:consumerCode/:tenantId`}>
              <SuccessfulPayment {...commonProps} />
            </Route>
            <Route path={`${currentPath}/zero/:businessService/:consumerCode/:tenantId`}>
              <SuccessfulPayment {...commonProps} />
            </Route>
            <Route path={`${currentPath}/failure`}>
              <FailedPayment {...commonProps} />
            </Route>
          </AppContainer>
        </Switch>
      </div>
    </React.Fragment>
  );
};

export default CitizenPayment;
