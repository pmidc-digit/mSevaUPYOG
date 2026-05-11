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

    if (url.includes("property-tax")) {
      history.push("/digit-ui/citizen/pt-home");
      return;
    }

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

  const quickLinks = allCitizenServicesProps.options?.slice(0, 4) || [];

  return isLoading ? (
    <Loader />
  ) : (
    <React.Fragment>
      <SurveyModal isOpen={showSurveyModal} onClose={() => setShowSurveyModal(false)} />
      <div className="HomePageContainer">
        <div className="HomePageWrapper">

          {/* ── Hero Banner ─────────────────────────────── */}
          <div className="hero-banner-styles" style={{ position: "relative", overflow: "hidden" }}>
            {/* Decorative background circles */}
            <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"260px", height:"260px", borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:"-40px", left:"-40px", width:"180px", height:"180px", borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />

            {/* Govt badge */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:"14px" }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:"20px", padding:"4px 14px", fontSize:"12px", fontWeight:"600", color:"rgba(255,255,255,0.9)", letterSpacing:"0.04em" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Government of Punjab
              </span>
            </div>

            <h1 className="hero-title-styles" style={{ fontSize: isMobile ? "26px" : "36px", marginBottom: "8px" }}>
              mSeva Punjab
            </h1>
            <p className="heroSubtitleStyles" style={{ fontSize: isMobile ? "14px" : "16px", marginBottom: "28px", opacity: 0.9 }}>
              {"Access government services anytime, anywhere"}
            </p>

            {/* Search bar */}
            <div className="searchBarStyles" style={{ maxWidth: "560px" }}>
              <span className="searchIconStyles">
                <SearchIconSvg />
              </span>
              <input
                type="text"
                placeholder={t("CS_COMMON_SEARCH_PLACEHOLDER") || "Search for a service…"}
                value={searchQuery}
                onChange={handleSearchChange}
                className="searchInputStyles"
              />
            </div>

            {/* Quick-access pills */}
            {!searchQuery && quickLinks.length > 0 && (
              <div style={{ marginTop: "18px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", alignSelf: "center", marginRight: "4px" }}>Quick access:</span>
                {quickLinks.map((svc, i) => (
                  <button
                    key={i}
                    onClick={svc.onClick}
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", color: "#ffffff", cursor: "pointer", fontWeight: "500", transition: "background 0.18s ease" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                  >
                    {svc.name}
                  </button>
                ))}
              </div>
            )}

            {/* Search results */}
            {searchQuery.trim() !== "" && filteredServices.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: "600", marginBottom: "14px" }}>
                  {filteredServices.length} {t("CS_COMMON_SERVICES_FOUND") || "services found"}
                </div>
                <CardBasedOptions header="" sideOption={{ name: "", onClick: () => {} }} options={filteredServices} />
              </div>
            )}
            {searchQuery.trim() !== "" && filteredServices.length === 0 && (
              <div style={{ marginTop: "20px", padding: "14px 20px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", textAlign: "center", color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
                {t("CS_COMMON_NO_SERVICES_FOUND") || `No services found for`} &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>

          {/* ── Services Section ────────────────────────── */}
          <div className="ServicesSection" style={{ marginTop: "32px" }}>

            {/* Section heading */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", paddingBottom:"12px", borderBottom:"2px solid #003C71", width:"100%" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"4px", height:"22px", background:"#003C71", borderRadius:"2px" }} />
                <h2 style={{ fontSize:"18px", fontWeight:"700", color:"#003C71", margin:0 }}>
                  {t(citizenServicesObj?.headerLabel) || "Our Services"}
                </h2>
              </div>
              <span style={{ fontSize:"12px", color:"#626A6E" }}>
                {allCitizenServicesProps.options?.length || 0} services available
              </span>
            </div>

            <CardBasedOptions
              header=""
              sideOption={allCitizenServicesProps.sideOption}
              options={showAllCards ? allCitizenServicesProps.options : allCitizenServicesProps.options?.slice(0, 8)}
            />

            {allCitizenServicesProps.options?.length > 8 && (
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", width: "100%" }}>
                <button
                  onClick={() => {
                    const next = !showAllCards;
                    setShowAllCards(next);
                    sessionStorage.setItem("citizen.home.showAllCards", next.toString());
                  }}
                  style={{ padding: "10px 28px", backgroundColor: "#003C71", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 12px rgba(0,60,113,0.25)", display: "flex", alignItems: "center", gap: "6px" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#002554"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#003C71"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {showAllCards ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg> Show Less</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg> Show All {allCitizenServicesProps.options?.length} Services</>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="UpdatesSection" style={{ display: "none", marginTop: "40px" }}>
            <CardBasedOptions {...allInfoAndUpdatesProps} />
          </div>

        </div>
      </div>
    </React.Fragment>
  );
};

export default Home;
