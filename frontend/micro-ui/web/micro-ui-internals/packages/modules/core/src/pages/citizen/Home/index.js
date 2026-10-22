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
import "./service-icons.css";
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

  //const SurveyModal = Digit?.ComponentRegistryService?.getComponent("SurveyModal");

  const { data: { stateInfo, uiHomePage } = {}, isLoading } = Digit.Hooks.useStore.getInitData();
  const isMobile = window.Digit.Utils.browser.isMobile();



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

  const getIconClassForService = (code, label = "", navigationUrl = "") => {
    // MDMS service codes vary between environments; use stable metadata for aliases.
    const service = `${code || ""} ${label} ${navigationUrl}`.toUpperCase();
    if (/FIRE/.test(service)) return "mseva-fire-noc";
    if (/RENT|LEASE/.test(service)) return "mseva-rent-lease";
    if (/GARBAGE|(?:^|[_/])GC(?:[_/\s]|$)/.test(service)) return "mseva-garbage-collection";
    if (/MCOLLECT|MISCELLANEOUS|MISC_COLLECTION/.test(service)) return "mseva-misc-collections";
    if (/PGRAI|PGR.AI|GRIEVANCE/.test(service) && code !== "CITIZEN_SERVICE_PGR") return "mseva-grievance-support";
    if (/SURVEY/.test(service)) return "mseva-social-survey";
    if (/PET|(?:^|_)PTR(?:_|\s|$)/.test(service)) return "mseva-pet-registration";
    if (/VENUE|(?:^|_)CHB(?:_|\s|$)|COMMUNITY.HALL/.test(service)) return "mseva-venue-booking";
    if (/BUILDING|(?:^|_)(?:OBPS|BPA)(?:_|\s|$)/.test(service)) return "mseva-building-plan-approval";
    if (/NO.DUES|(?:^|_)NDC(?:_|\s|$)/.test(service)) return "mseva-no-dues";
    if (/STREET.VEND|(?:^|_)SV(?:_|\s|$)/.test(service)) return "mseva-street-vending";
    if (/PLOT|(?:^|_)NOC(?:_|\s|$)/.test(service)) return "mseva-plot-regularisation";
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



    const allServices =
      UserType && UserRole
        ? [
            {
              name: t(citizenServicesObj?.props?.[7]?.label),
              iconClass: getIconClassForService(citizenServicesObj?.props?.[7]?.code, citizenServicesObj?.props?.[7]?.label, citizenServicesObj?.props?.[7]?.navigationUrl),
              onClick: () => toDigitUrl(citizenServicesObj?.props?.[7]?.navigationUrl),
            },
          ]
        : citizenServicesObj?.props
            ?.filter((item) => item?.enabled)
            ?.map((item) => ({
              name: t(item.label),
              iconClass: getIconClassForService(item.code, item.label, item.navigationUrl),
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
              iconClass: getIconClassForService(citizenServicesObj?.props?.[7]?.code, citizenServicesObj?.props?.[7]?.label, citizenServicesObj?.props?.[7]?.navigationUrl),
              onClick: () => history.push(citizenServicesObj?.props?.[7]?.navigationUrl),
            },
          ]
        : citizenServicesObj?.props
            ?.filter((item) => item?.enabled && item?.code !== "CITIZEN_SERVICE_SWACH")
            ?.map((item) => ({
              name: t(item.label),
              iconClass: getIconClassForService(item.code, item.label, item.navigationUrl),
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

  // Listen for global search events from GIGWHeader
  useEffect(() => {
    const handleGlobalSearch = (e) => {
      const q = e?.detail?.query || "";
      setSearchQuery(q);
      if (q.trim() === "") {
        setFilteredServices([]);
      } else {
        const allServices = allCitizenServicesProps.options || [];
        const normalizedQuery = q.trim().toLowerCase();
        const filtered = allServices.filter((service) => service.name?.toLowerCase().includes(normalizedQuery));
        setFilteredServices(filtered);
      }
    };
    window.addEventListener("mseva-global-search", handleGlobalSearch);
    return () => window.removeEventListener("mseva-global-search", handleGlobalSearch);
  }, [allCitizenServicesProps.options]);

  const quickActions = allCitizenServicesProps.options?.slice(0, 4) || [];
  const visibleServices = showAllCards ? allCitizenServicesProps.options : allCitizenServicesProps.options?.slice(0, 12);
  const displayedServices = searchQuery.trim() ? filteredServices : visibleServices;
    const rawUserName = citizenInfo?.name || citizenInfoMain?.name || (citizenToken ? "Binit Rana" : "");
  const firstName = rawUserName ? rawUserName.trim().split(" ")[0] : "Binit";
  const userGreeting = citizenToken ? `Welcome back, ${firstName}` : "Welcome to Citizen Portal";

  return isLoading ? (
    <Loader />
  ) : (
    <React.Fragment>
      <SurveyModal isOpen={showSurveyModal} onClose={() => setShowSurveyModal(false)} />
      <main className="HomePageContainer mseva-citizen-dashboard">
        <div className="HomePageWrapper">
          <section className="mseva-slim-hero-banner" aria-label="mSeva Punjab Hero Banner">
            <div className="mseva-slim-hero-content flex flex-col md:flex-row items-center justify-between gap-4 w-full">
              {/* Left Side: Personalized Welcome & Civic Subtitle */}
              <div className="mseva-hero-welcome-left flex flex-col justify-center">
                <h1 className="mseva-hero-greeting text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {userGreeting}
                </h1>
                <p className="mseva-hero-tagline text-xs sm:text-sm text-blue-100/80 font-normal mt-0.5">
                  {t("Access citizen services digitally with ease and transparency")}
                </p>
              </div>

              {/* Right Side: Embedded Search Box */}
              <div className="mseva-hero-search-right w-full sm:w-80 md:w-96 relative">
                <form
                  className="w-full relative"
                  onSubmit={(e) => e.preventDefault()}
                  role="search"
                >
                  <label htmlFor="mseva-hero-search-input" className="sr-only">
                    Search citizen services
                  </label>
                  <div className="relative w-full flex items-center">
                    <input
                      id="mseva-hero-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search citizen services, tax, NOC..."
                      className="mseva-hero-search-input w-full bg-white/95 text-slate-800 placeholder-slate-400 text-xs sm:text-sm pl-4 pr-11 py-2.5 rounded-xl shadow-inner focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="mseva-hero-search-clear absolute right-10 text-slate-400 hover:text-slate-600 text-sm p-1 cursor-pointer transition-colors"
                        onClick={() => {
                          setSearchQuery("");
                          setFilteredServices([]);
                        }}
                        aria-label="Clear search"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                    <button
                      type="submit"
                      className="mseva-hero-search-btn w-8 h-8 rounded-lg bg-[#184474] text-white flex items-center justify-center hover:bg-[#0f2d4e] transition-colors absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer shadow-xs"
                      aria-label="Search"
                      title="Search"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </button>
                  </div>
                </form>
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
              header={allCitizenServicesProps.header || "Citizen Services"}
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
              <div className="mseva-dashboard__show-more flex justify-center items-center mt-6 mb-2">
                <button
                  type="button"
                  className="mseva-dashboard__show-more-button inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-[#184474] hover:text-white hover:border-[#184474] transition-all duration-200 shadow-xs active:scale-95 cursor-pointer"
                  onClick={() => {
                    const newValue = !showAllCards;
                    setShowAllCards(newValue);
                    sessionStorage.setItem("citizen.home.showAllCards", newValue.toString());
                  }}
                >
                  <span>{showAllCards ? "Show Less" : "Show More"}</span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllCards ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
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
