import React, { useEffect, useState } from "react";
import {
  StandaloneSearchBar,
  Loader,
  ComplaintIcon,
  PTIcon,
  CaseIcon,
  DropIcon,
  HomeIcon,
  Calender,
  DocumentIcon,
  NDCIcon,
  HelpIcon,
  WhatsNewCard,
  OBPSIcon,
  WSICon,
  PTRIcon,
  GenericFileIcon,
  NOCIcon,
  ADSIcone,
  MCollectIcon,
  CHBIcon,
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

  const getIconForService = (code) => {
    switch (code) {
      case "CITIZEN_SERVICE_PGR":
        return <ComplaintIcon />;
      case "CITIZEN_SERVICE_PT":
        return <PTIcon />;
      case "CITIZEN_SERVICE_TL":
        return <CaseIcon />;
      case "CITIZEN_SERVICE_WS":
        return <WSICon />;
      case "CITIZEN_SERVICE_PTR":
        return <PTRIcon />;
      case "CITIZEN_SERVICE_SWACH":
        return <CHBIcon />;
      case "CITIZEN_SERVICE_NOC":
        return <NOCIcon />;
      case "CITIZEN_SERVICE_OBPS":
        return <PTIcon />;
      case "CITIZEN_SERVICE_ADS":
        return <ADSIcone />;
      case "CITIZEN_SERVICE_NDC":
        return <NDCIcon />;
      case "CITIZEN_SERVICE_MODULE_SV":
        return <MCollectIcon />;
      case "CITIZEN_SERVICE_CHALLANGENERATION":
        return <NDCIcon />;
      case "CITIZEN_SERVICE_MCOLLECT":
        return <MCollectIcon />;
      case "CITIZEN_SERVICE_DOCUMENTS":
        return <DocumentIcon />;
      case "CITIZEN_SERVICE_HELP":
        return <HelpIcon />;
      case "CITIZEN_SERVICE_RENTANDLEASE":
        return <GenericFileIcon />;
      case "CITIZEN_SERVICE_CHB":
        return <CHBIcon />;

      default:
        return <MCollectIcon />;
    }
  };

  // Handle search and filter services
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
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
              Icon: <ComplaintIcon />,
              onClick: () => toDigitUrl(citizenServicesObj?.props?.[7]?.navigationUrl),
            },
          ]
        : citizenServicesObj?.props
            ?.filter((item) => item?.enabled)
            ?.map((item) => ({
              name: t(item.label),
              Icon: getIconForService(item.code),
              onClick: () => toDigitUrl(item.navigationUrl),
            })) || [];

    const filtered = allServices.filter((service) => service.name.toLowerCase().includes(query));
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
              Icon: <ComplaintIcon />,
              onClick: () => history.push(citizenServicesObj?.props?.[7]?.navigationUrl),
            },
          ]
        : citizenServicesObj?.props
            ?.filter((item) => item?.enabled && item?.code !== "CITIZEN_SERVICE_SWACH")
            ?.map((item) => ({
              name: t(item.label),
              Icon: getIconForService(item.code),
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

  return isLoading ? (
    <Loader />
  ) : (
    <React.Fragment>
      <SurveyModal isOpen={showSurveyModal} onClose={() => setShowSurveyModal(false)} />
      <div className="HomePageContainer">
        <div className="HomePageWrapper">
          <div className="hero-banner-styles">
            <div className="hero-banner-left">
              <h1 className="hero-title-styles">mSeva Punjab</h1>
              <p className="heroSubtitleStyles">{t("Access citizen services digitally with ease and transparency")}</p>
            </div>
            <div className="hero-banner-right">
              <button
                type="button"
                className="hero-action-pill"
                onClick={() => history.push("/digit-ui/citizen/pt/property/citizen-search")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>{t("Track Application Status")}</span>
              </button>
              <a
                href="tel:1100"
                className="hero-help-link"
                title={t("Call 1100 for Citizen Helpline")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>{t("Helpline 1100")}</span>
              </a>
            </div>
          </div>

          <div className="ServicesSection">
            <CardBasedOptions
              {...allCitizenServicesProps}
              options={showAllCards ? allCitizenServicesProps.options : allCitizenServicesProps.options?.slice(0, 4)}
            />
            {allCitizenServicesProps.options?.length > 4 && (
              <div style={{ marginTop: "24px", textAlign: "center", justifyContent: "center", display: "flex", width: "100%" }}>
                <button
                  onClick={() => {
                    const newValue = !showAllCards;
                    setShowAllCards(newValue);
                    sessionStorage.setItem("citizen.home.showAllCards", newValue.toString());
                  }}
                  style={{
                    padding: "12px 32px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1d4ed8";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(37, 99, 235, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {showAllCards ? "Show Less" : "Show More"}
                </button>
              </div>
            )}
          </div>

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
      </div>
    </React.Fragment>
  );
};

export default Home;
