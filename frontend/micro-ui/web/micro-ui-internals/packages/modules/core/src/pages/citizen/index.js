import { BackButton, WhatsappIcon, Card, CitizenInfoLabel, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Route, Switch, useRouteMatch, useHistory, Link } from "react-router-dom";
import ErrorBoundary from "../../components/ErrorBoundaries";
import { AppHome, processLinkData } from "../../components/Home";
import TopBarSideBar from "../../components/TopBarSideBar";
import StaticCitizenSideBar from "../../components/TopBarSideBar/SideBar/StaticCitizenSideBar";
import CitizenHome from "./Home";
import LanguageSelection from "./Home/LanguageSelection";
import LocationSelection from "./Home/LocationSelection";
import Login from "./Login";
import NewLoginPage from "./NewLogin/NewLoginPage";
import NewRegistration from "./NewRegistration/index";
import UserProfile from "./Home/UserProfile";
import ErrorComponent from "../../components/ErrorComponent";
import FAQsSection from "./FAQs/FAQs";
import HowItWorks from "./HowItWorks/howItWorks";
import StaticDynamicCard from "./StaticDynamicComponent/StaticDynamicCard";
import AcknowledgementCF from "../../components/AcknowledgementCF";
import CitizenFeedback from "../../components/CitizenFeedback";
import Search from "./SearchApp";
import QRCode from "./QRCode";
import ChallanQRCode from "./ChallanQRCode";
import AcknowledgementQRCode from "./AcknowledgementQRCode";
import EDCRScrutiny from "./Home/EdcrScrutiny";
import { newConfig as newConfigEDCR } from "../../config/edcrConfig";
import CreateEDCR1 from "./Home/EDCR";
import EDCRAcknowledgement1 from "./Home/EDCR/EDCRAcknowledgement1";
import FAQ from "../../FAQ";
import FAQS from "../citizen/FAQs/FAQs";
import NavigationPage from "./NavigationPage";
import CitizenHomeCardWithExternalLink from "./CitizenHomeCardWithExternalLink";
import DashboardFooter from "./Home/DashboardFooter";
import CitizenHomeCardSecond from "./CitizenHomeCardSecond";
const sidebarHiddenFor = [
  "digit-ui/citizen/register/name",
  "/digit-ui/citizen/select-language",
  "/digit-ui/citizen/select-location",
  "/digit-ui/citizen/login",
  "/digit-ui/citizen/register/otp",
  "/digit-ui/citizen/sso/login",
  "/digit-ui/citizen/login-page",
  "/digit-ui/citizen/new-registration",
];

const topSidebarHiddenFor = ["/digit-ui/citizen/sso/login"];

const getTenants = (codes, tenants) => {
  return tenants.filter((tenant) => codes.map((item) => item.code).includes(tenant.code));
};

const Home = ({
  stateInfo,
  userDetails,
  CITIZEN,
  cityDetails,
  mobileView,
  handleUserDropdownSelection,
  logoUrl,
  DSO,
  stateCode,
  modules,
  appTenants,
  sourceUrl,
  pathname,
  initData,
}) => {
  const { isLoading: islinkDataLoading, data: linkData, isFetched: isLinkDataFetched } = Digit.Hooks.useCustomMDMS(
    Digit.ULBService.getStateId(),
    "ACCESSCONTROL-ACTIONS-TEST",
    [
      {
        name: "actions-test",
        filter: "[?(@.url == 'digit-ui-card')]",
      },
    ],
    {
      select: (data) => {
        const formattedData = data?.["ACCESSCONTROL-ACTIONS-TEST"]?.["actions-test"]
          ?.filter((el) => el.enabled === true)
          .reduce((a, b) => {
            a[b.parentModule] = a[b.parentModule]?.length > 0 ? [b, ...a[b.parentModule]] : [b];
            return a;
          }, {});
        return formattedData;
      },
    }
  );
  const isMobile = window.Digit.Utils.browser.isMobile();
  const classname = Digit.Hooks.fsm.useRouteSubscription(pathname);
  const { t } = useTranslation();
  const { path } = useRouteMatch();
  sourceUrl = "https://s3.ap-south-1.amazonaws.com/egov-qa-assets";
  const pdfUrl = "https://pg-egov-assets.s3.ap-south-1.amazonaws.com/Upyog+Code+and+Copyright+License_v1.pdf";
  const history = useHistory();
  const handleClickOnWhatsApp = (obj) => {
    window.open(obj);
  };
  const stateId = Digit.ULBService.getStateId();
  let { data: newConfig } = Digit.Hooks.obps.SearchMdmsTypes.getFormConfig(stateId, []);
  newConfig = newConfig?.EdcrConfig ? newConfig?.EdcrConfig : newConfigEDCR;
  const hideSidebar = sidebarHiddenFor.some((e) => window.location.href.includes(e));
  const hideTopSidebar = topSidebarHiddenFor.some((e) => window.location.href.includes(e));
  const appRoutes = modules.map(({ code, tenants }, index) => {
    const Module = Digit.ComponentRegistryService.getComponent(`${code}Module`);
    return Module ? (
      <Route key={index} path={`${path}/${code.toLowerCase()}`}>
        <Module stateCode={stateCode} moduleCode={code} userType="citizen" tenants={getTenants(tenants, appTenants)} />
      </Route>
    ) : null;
  });

  const ModuleLevelLinkHomePages = modules.map(({ code, bannerImage }, index) => {
    const Links = Digit.ComponentRegistryService.getComponent(`${code}Links`) || (() => <React.Fragment />);
    const mdmsDataObj = isLinkDataFetched ? processLinkData(linkData, code, t) : undefined;

    mdmsDataObj?.links &&
      mdmsDataObj?.links.sort((a, b) => {
        return a.orderNumber - b.orderNumber;
      });
    // }

    return (
      <React.Fragment key={index}>
        <Route key={index} path={`${path}/${code.toLowerCase()}-home`}>
          <div
            className="moduleLinkHomePage"
            style={{
              width: "100%",
              minHeight: "100vh",
              backgroundColor: "#F9FAFB",
              paddingTop: isMobile ? "20px" : "32px",
              paddingBottom: "80px",
              marginTop: "3rem",
            }}
          >
            {/* Content Container */}
            <div
              style={{
                margin: "0 auto",
                padding: isMobile ? "0 20px" : "0 40px",
              }}
            >
              {/* Back Button - Outside purple card */}
              <BackButton className="back-btn2" />

              {/* Breadcrumb - Outside purple card */}
              <div
                style={{
                  fontSize: isMobile ? "13px" : "14px",
                  color: "#6B7280",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "400",
                }}
              >
                <span>{t("HOME")}</span>
                <span>›</span>
                <span>{t("MODULE_" + code.toUpperCase())}</span>
              </div>

              {/* Purple Gradient Rounded Card Banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, #4F65D8 0%, #00157A 100%)",
                  borderRadius: "16px",
                  padding: "60px 40px",
                  margin: "24px 0",
                  textAlign: "center",
                  color: "#FFF",
                }}
              >
                {/* Title */}
                <h1
                  style={{
                    fontSize: isMobile ? "28px" : "40px",
                    fontWeight: "700",
                    color: "white",
                    margin: 0,
                    lineHeight: "1.2",
                    marginBottom: "12px",
                    textAlign: "center",
                  }}
                >
                  {t("MODULE_" + code.toUpperCase())}
                </h1>

                {/* Subtitle */}
                {/* <p
                  style={{
                    fontSize: isMobile ? "14px" : "16px",
                    color: "rgba(255, 255, 255, 0.95)",
                    margin: 0,
                    fontWeight: "400",
                    lineHeight: "1.5",
                    textAlign: "center",
                  }}
                >
                  {t(`${code.toUpperCase()}_SUBTITLE`) ||
                    t("APPLY_RENEW_MANAGE_" + code.toUpperCase() + "_ONLINE") ||
                    "Apply, renew, and manage your services online"}
                </p> */}
              </div>

              {/* Services Section Header */}
              <h2
                style={{
                  fontSize: isMobile ? "18px" : "20px",
                  fontWeight: "600",
                  marginBottom: "20px",
                  color: "#1F1F1F",
                }}
              >
                {t("SERVICES")}
              </h2>

              {/* Service Cards */}
              <div className="moduleLinkHomePageModuleLinks">
                {mdmsDataObj && code != "OBPS" && (
                  <CitizenHomeCardSecond
                    header=""
                    links={mdmsDataObj?.links}
                    Icon={() => <span />}
                    Info={
                      code === "OBPS"
                        ? () => (
                            <CitizenInfoLabel
                              style={{ margin: "0px", padding: "10px" }}
                              info={t("CS_FILE_APPLICATION_INFO_LABEL")}
                              text={t(`BPA_CITIZEN_HOME_STAKEHOLDER_INCLUDES_INFO_LABEL`)}
                            />
                          )
                        : null
                    }
                    isInfo={code === "OBPS" ? true : false}
                  />
                )}
                {mdmsDataObj && code === "OBPS" && (
                  <CitizenHomeCardWithExternalLink
                    header=""
                    links={mdmsDataObj?.links}
                    Icon={() => <span />}
                    Info={
                      code === "OBPS"
                        ? () => (
                            <CitizenInfoLabel
                              style={{ margin: "0px", padding: "10px" }}
                              info={t("CS_FILE_APPLICATION_INFO_LABEL")}
                              text={t(`BPA_CITIZEN_HOME_STAKEHOLDER_INCLUDES_INFO_LABEL`)}
                            />
                          )
                        : null
                    }
                    isInfo={code === "OBPS" ? true : false}
                  />
                )}
              </div>

              {/* Statistics and Info Section */}
              {/* <StaticDynamicCard moduleCode={code?.toUpperCase()} /> */}
            </div>
          </div>
        </Route>
        <Route key={"faq" + index} path={`${path}/${code.toLowerCase()}-faq`}>
          <FAQsSection module={code?.toUpperCase()} />
        </Route>
        <Route key={"hiw" + index} path={`${path}/${code.toLowerCase()}-how-it-works`}>
          <HowItWorks module={code?.toUpperCase()} />
        </Route>
      </React.Fragment>
    );
  });

  return (
    <div className={classname}>
      {hideTopSidebar ? null : (
        <TopBarSideBar
          t={t}
          stateInfo={stateInfo}
          userDetails={userDetails}
          CITIZEN={CITIZEN}
          cityDetails={cityDetails}
          mobileView={mobileView}
          handleUserDropdownSelection={handleUserDropdownSelection}
          logoUrl={logoUrl}
          showSidebar={true}
          linkData={linkData}
          islinkDataLoading={islinkDataLoading}
        />
      )}

      <div className={`main center-container citizen-home-container mb-25`}>
        {/* {hideSidebar ? null : (
          <div className="SideBarStatic">
            <StaticCitizenSideBar linkData={linkData} islinkDataLoading={islinkDataLoading} />
          </div>
        )} */}

        <Switch>
          <Route exact path={path}>
            <CitizenHome />
          </Route>

          {/* Custom OBPS Landing Page Route */}
          {/* <PrivateRoute path={`${path}/obps-home`}>
            {(() => {
              const CustomLandingPage = Digit?.ComponentRegistryService?.getComponent("CustomLandingPage");
              return CustomLandingPage ? <CustomLandingPage /> : null;
            })()}
          </PrivateRoute> */}

          <PrivateRoute path={`${path}/feedback`} component={CitizenFeedback}></PrivateRoute>
          <PrivateRoute path={`${path}/feedback-acknowledgement`} component={AcknowledgementCF}></PrivateRoute>

          <Route exact path={`${path}/login-page`}>
            <NewLoginPage stateCode={stateCode} />
          </Route>

          <Route path={`${path}/new-registration`}>
            <NewRegistration stateCode={stateCode} />
          </Route>

          <Route exact path={`${path}/select-language`}>
            {/* <LanguageSelection /> */}
            <NewLoginPage stateCode={stateCode} />
          </Route>

          <Route exact path={`${path}/select-location`}>
            {/* <LocationSelection /> */}
            <NewLoginPage stateCode={stateCode} />
          </Route>
          <Route path={`${path}/error`}>
            <ErrorComponent
              initData={initData}
              goToHome={() => {
                history.push("/digit-ui/citizen");
              }}
            />
          </Route>
          <Route path={`${path}/all-services`}>
            <AppHome
              userType="citizen"
              modules={modules}
              getCitizenMenu={linkData}
              fetchedCitizen={isLinkDataFetched}
              isLoading={islinkDataLoading}
            />
          </Route>

          <Route path={`${path}/login`}>
            {/* <Login stateCode={stateCode} /> */}
            <NewLoginPage stateCode={stateCode} />
          </Route>

          <Route path={`${path}/register`}>
            {/* <Login stateCode={stateCode} isUserRegistered={false} /> */}
            <NewRegistration stateCode={stateCode} />
          </Route>

          <PrivateRoute path={`${path}/user/profile`}>
            <UserProfile stateCode={stateCode} userType={"citizen"} cityDetails={cityDetails} />
          </PrivateRoute>

          <Route path={`${path}/Audit`}>
            <Search />
          </Route>
          <Route path={`${path}/payment/verification`}>
            <QRCode></QRCode>
          </Route>
          <Route path={`${path}/challan/details`}>
            <ChallanQRCode></ChallanQRCode>
          </Route>
          <Route path={`${path}/acknowledgement/details`}>
            <AcknowledgementQRCode></AcknowledgementQRCode>
          </Route>
          <Route path={`/digit-ui/citizen/core/edcr/scrutiny`}>
            {/* <EDCRScrutiny config={newConfigEDCR} isSubmitBtnDisable={false}/>
            
            */}
            <CreateEDCR1 />
          </Route>
          <Route path={`/digit-ui/citizen/core/edcr/scrutiny/acknowledgement`}>
            <EDCRAcknowledgement1 />
          </Route>
          <Route path={`${path}/sso/login`}>
            <NavigationPage stateCode={stateCode} />
          </Route>
          <Route path={`${path}/faqss`}>
            <FAQ />
          </Route>
          <ErrorBoundary initData={initData}>
            {appRoutes}
            {ModuleLevelLinkHomePages}
          </ErrorBoundary>
        </Switch>
      </div>
      <div>
        <DashboardFooter />
      </div>
    </div>
  );
};

export default Home;
