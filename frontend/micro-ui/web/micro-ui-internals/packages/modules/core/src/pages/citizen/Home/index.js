import React, { useEffect, useState } from "react";
import {
  Loader,
  HomeIcon,
  Calender,
  DocumentIcon,
  SearchIconSvg,
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { CitizenSideBar } from "../../../components/TopBarSideBar/SideBar/CitizenSideBar";
import StaticCitizenSideBar from "../../../components/TopBarSideBar/SideBar/StaticCitizenSideBar";
import DashboardFooter from "./DashboardFooter";
import CardBasedOptions from "../CardBasedOptions";
import { SurveyModal } from "@mseva/digit-ui-module-engagement";

const Home = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  // Use sessionStorage to persist showAllCards state across navigation
  const getInitialShowAllCards = () => {
    const stored = sessionStorage.getItem("citizen.home.showAllCards");
    return stored === "true";
  };
  const [showAllCards, setShowAllCards] = useState(getInitialShowAllCards);

  const citizenInfoString = window.localStorage.getItem("user-info");
  const citizenInfo = citizenInfoString ? JSON.parse(citizenInfoString) : null;
  const UserType = citizenInfo?.type === "CITIZEN";
  const UserRole = Array.isArray(citizenInfo?.roles) && citizenInfo?.roles.some((item) => item.code === "PESCO");
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true);
  console.log("IS THIS PAGE REACH HERE IN CONSOLE...");
  //const SurveyModal = Digit?.ComponentRegistryService?.getComponent("SurveyModal");

  const { data: { stateInfo, uiHomePage } = {}, isLoading } = Digit.Hooks.useStore.getInitData();
  const isMobile = window.Digit.Utils.browser.isMobile();

  console.log(uiHomePage, "LOOK");

  if (window.Digit.SessionStorage.get("TL_CREATE_TRADE")) window.Digit.SessionStorage.set("TL_CREATE_TRADE", {});

  const conditionsToDisableNotificationCountTrigger = () => {
    if (Digit.UserService?.getUser()?.info?.type === "EMPLOYEE") return false;
    if (!Digit.UserService?.getUser()?.access_token) return false;
    return true;
  };

  const { data: EventsData, isLoading: EventsDataLoading } = Digit.Hooks.useEvents({
    tenantId,
    variant: "whats-new",
    config: {
      enabled: conditionsToDisableNotificationCountTrigger(),
    },
  });

  const parseValue = (value) => {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  };

  const getFromStorage = (key) => {
    const value = window.localStorage.getItem(key);
    return value && value !== "undefined" ? parseValue(value) : null;
  };

  const citizenToken = getFromStorage("Citizen.token");
  const citizenInfoMain = getFromStorage("Citizen.user-info");
  const langSelect = getFromStorage("locale");
  console.log("citizenInfoMain", citizenInfoMain, "langSelect", langSelect);

  const getUserDetails = (access_token, info) => ({ token: access_token, access_token, info });
  const userDetails = getUserDetails(citizenToken, citizenInfoMain);
  window.Digit.SessionStorage.set("User", userDetails);

  if (!citizenToken) {
    langSelect === null ? history.push(`/digit-ui/citizen/select-language`) : history.push(`/digit-ui/citizen/select-location`);
  }

  const appBannerWebObj = uiHomePage?.appBannerDesktop;
  const appBannerMobObj = uiHomePage?.appBannerMobile;
  const citizenServicesObj = uiHomePage?.citizenServicesCard;
  const infoAndUpdatesObj = uiHomePage?.informationAndUpdatesCard;
  const whatsAppBannerWebObj = uiHomePage?.whatsAppBannerDesktop;
  const whatsAppBannerMobObj = uiHomePage?.whatsAppBannerMobile;
  const whatsNewSectionObj = uiHomePage?.whatsNewSection;

  const handleClickOnWhatsAppBanner = (obj) => {
    window.open(obj?.navigationUrl);
  };

  const getIconClassForService = (code) => {
    const icons = {
      CITIZEN_SERVICE_PGR: "mseva-public-grievance-pgr",
      CITIZEN_SERVICE_PT: "mseva-property-tax",
      CITIZEN_SERVICE_TL: "mseva-trade-license",
      CITIZEN_SERVICE_WS: "mseva-water-bill",
      CITIZEN_SERVICE_PTR: "mseva-noc",
      CITIZEN_SERVICE_SWACH: "mseva-solid-waste-complaint",
      CITIZEN_SERVICE_NOC: "mseva-noc",
      CITIZEN_SERVICE_OBPS: "mseva-building-plan-approval",
      CITIZEN_SERVICE_ADS: "mseva-advertisement-license",
      CITIZEN_SERVICE_NDC: "mseva-noc",
      CITIZEN_SERVICE_MODULE_SV: "mseva-pay-other-dues",
      CITIZEN_SERVICE_CHALLANGENERATION: "mseva-pay-other-dues",
      CITIZEN_SERVICE_MCOLLECT: "mseva-pay-other-dues",
      CITIZEN_SERVICE_DOCUMENTS: "mseva-rti-application",
      CITIZEN_SERVICE_HELP: "mseva-public-grievance-pgr",
      CITIZEN_SERVICE_RENTANDLEASE: "mseva-community-hall-booking",
      CITIZEN_SERVICE_CHB: "mseva-community-hall-booking",
    };

    return icons[code] || "mseva-noc";
  };

  // Handle search and filter services
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredServices([]);
      return;
    }

    console.log("citizenServicesObj", citizenServicesObj);

    const allServices =
      UserType && UserRole
        ? [
            {
              name: t(citizenServicesObj?.props?.[7]?.label),
              iconClass: getIconClassForService(citizenServicesObj?.props?.[7]?.code),
              onClick: () => toDigitUrl(citizenServicesObj?.props?.[7]?.navigationUrl),
            },
          ]
        : citizenServicesObj?.props
            ?.filter((item) => item?.enabled)
            ?.map((item) => ({
              name: t(item.label),
              iconClass: getIconClassForService(item.code),
              onClick: () => toDigitUrl(item.navigationUrl),
            })) || [];

    const normalizedQuery = query.trim().toLowerCase();
    const filtered = allServices.filter((service) => service.name.toLowerCase().includes(normalizedQuery));
    setFilteredServices(filtered);
  };

  // Show survey modal on first load for citizens
  useEffect(() => {
    if (UserType && !sessionStorage.getItem("survey_modal_shown")) {
      setShowSurveyModal(true);
      sessionStorage.setItem("survey_modal_shown", "true");
    }

    // Clean up session storage on component mount
    sessionStorage.removeItem("type");
    sessionStorage.removeItem("pincode");
    sessionStorage.removeItem("tenantId");
    sessionStorage.removeItem("localityCode");
    sessionStorage.removeItem("landmark");
    sessionStorage.removeItem("propertyid");
  }, [UserType]);

  const toDigitUrl = (url) => {
    console.log("url", url);

    if (!url) return url;

    // if (url.includes("property-tax")) {
    //   history.push("/digit-ui/citizen/pt-home");
    //   return;
    // }

    // Case 1: React SPA route → stay inside React Router
    if (url.startsWith("/digit-ui")) {
      history.push(url);
      return;
    }

    // Case 2: Legacy backend route → full page load
    if (url.startsWith("/citizen")) {
      window.location.assign(url);
      return;
    }

    // Safety fallback
    window.location.assign(url);

    // if (url.startsWith("/digit-ui")) return url;
    // if (url.startsWith("/citizen")) return `/digit-ui${url}`;
    // return `/digit-ui/${url.replace(/^\/+/, "")}`;
  };

  const allCitizenServicesProps = {
    header: t(citizenServicesObj?.headerLabel),
    sideOption: {
      name: t(citizenServicesObj?.sideOption?.name),
      onClick: () => history.push(citizenServicesObj?.sideOption?.navigationUrl),
    },
    options:
      UserType && UserRole
        ? [
            {
              name: t(citizenServicesObj?.props?.[7]?.label),
              iconClass: getIconClassForService(citizenServicesObj?.props?.[7]?.code),
              onClick: () => history.push(citizenServicesObj?.props?.[7]?.navigationUrl),
            },
          ]
        : citizenServicesObj?.props
            ?.filter((item) => item?.enabled && item?.code !== "CITIZEN_SERVICE_SWACH")
            ?.map((item) => ({
              name: t(item.label),
              iconClass: getIconClassForService(item.code),
              // onClick: () => {
              //   window.location.href = item.navigationUrl;
              // },
              onClick: () => toDigitUrl(item.navigationUrl),
            })),
    styles: { display: "flex", flexWrap: "wrap", justifyContent: "flex-start", width: "100%" },
  };

  const allInfoAndUpdatesProps = {
    header: t(infoAndUpdatesObj?.headerLabel),
    sideOption: {
      name: t(infoAndUpdatesObj?.sideOption?.name),
      onClick: () => history.push(infoAndUpdatesObj?.sideOption?.navigationUrl),
    },
    options: [
      {
        name: t(infoAndUpdatesObj?.props?.[0]?.label),
        Icon: <HomeIcon />,
        onClick: () => history.push(infoAndUpdatesObj?.props?.[0]?.navigationUrl),
      },
      {
        name: t(infoAndUpdatesObj?.props?.[1]?.label),
        Icon: <Calender />,
        onClick: () => history.push(infoAndUpdatesObj?.props?.[1]?.navigationUrl),
      },
      {
        name: t(infoAndUpdatesObj?.props?.[2]?.label),
        Icon: <DocumentIcon />,
        onClick: () => history.push(infoAndUpdatesObj?.props?.[2]?.navigationUrl),
      },
      {
        name: t(infoAndUpdatesObj?.props?.[3]?.label),
        Icon: <DocumentIcon />,
        onClick: () => history.push(infoAndUpdatesObj?.props?.[3]?.navigationUrl),
      },
    ],
    styles: { display: "flex", flexWrap: "wrap", justifyContent: "flex-start", width: "100%" },
  };

  const quickActions = allCitizenServicesProps.options?.slice(0, 4) || [];
  const visibleServices = showAllCards ? allCitizenServicesProps.options : allCitizenServicesProps.options?.slice(0, 12);
  const displayedServices = searchQuery.trim() ? filteredServices : visibleServices;
  const citizenName = citizenInfo?.name || citizenInfoMain?.name || "Citizen";

  return isLoading ? (
    <Loader />
  ) : (
    <React.Fragment>
      <SurveyModal isOpen={showSurveyModal} onClose={() => setShowSurveyModal(false)} />
      <main className="HomePageContainer mseva-citizen-dashboard">
        <div className="HomePageWrapper">
          <section className="hero-banner-styles" aria-labelledby="mseva-dashboard-welcome">
            <div className="mseva-dashboard__hero-content">
              <p className="mseva-dashboard__eyebrow">mSeva Punjab</p>
              <h1 id="mseva-dashboard-welcome" className="hero-title-styles">
                Welcome, <span>{citizenName}</span>
              </h1>
              <p className="heroSubtitleStyles">Access citizen services digitally with ease and transparency</p>
              <label className="mseva-dashboard__search-label" htmlFor="mseva-service-search">
                Search municipal services
              </label>
              <div className="searchBarStyles">
                <span className="searchIconStyles">
                  <SearchIconSvg />
                </span>
                <input
                  id="mseva-service-search"
                  type="text"
                  placeholder={t("CS_COMMON_SEARCH_PLACEHOLDER") || "Search for services..."}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="searchInputStyles"
                />
              </div>
            </div>

          </section>

          {/* {quickActions.length > 0 && (
            <section className="mseva-dashboard__quick-actions" aria-labelledby="mseva-quick-actions-heading">
              <div className="mseva-dashboard__section-heading">
                <h2 id="mseva-quick-actions-heading">Quick Actions</h2>
              </div>
              <CardBasedOptions options={quickActions} variant="quick-actions" />
            </section>
          )} */}

          <section className="ServicesSection mseva-dashboard__services" aria-label="Municipal services">
            <CardBasedOptions
              {...allCitizenServicesProps}
              header={allCitizenServicesProps.header || "Our Services"}
              options={displayedServices}
              variant="services"
            />
            {searchQuery.trim() && filteredServices.length === 0 && (
              <div className="mseva-dashboard__empty-search" role="status">
                <p>
                  {t("No services found matching") || "No services found matching"} "{searchQuery}"
                </p>
              </div>
            )}
            {!searchQuery.trim() && allCitizenServicesProps.options?.length > 4 && (
              <div className="mseva-dashboard__show-more">
                <button
                  type="button"
                  className="mseva-dashboard__show-more-button"
                  onClick={() => {
                    const newValue = !showAllCards;
                    setShowAllCards(newValue);
                    sessionStorage.setItem("citizen.home.showAllCards", newValue.toString());
                  }}
                >
                  {showAllCards ? "Show Less" : "Show More"}
                </button>
              </div>
            )}
          </section>

          {/* WhatsApp Banner Section */}
          {/* {isMobile ? (
          <div style={heroBannerStyles} onClick={() => handleClickOnWhatsAppBanner(whatsAppBannerMobObj)}>
            <p style={heroSubtitleStyles}>{t(whatsAppBannerMobObj?.label)}</p>
          </div>
        ) : (
          <div style={heroBannerStyles} onClick={() => handleClickOnWhatsAppBanner(whatsAppBannerWebObj)}>
            <p style={heroSubtitleStyles}>{t(whatsAppBannerWebObj?.label)}</p>
          </div>
        )} */}

          <div className="UpdatesSection" style={{ display: "none", marginTop: "40px" }}>
            <CardBasedOptions {...allInfoAndUpdatesProps} />
          </div>

          {/* <DashboardFooter /> */}
        </div>
      </main>
    </React.Fragment>
  );
};

export default Home;
