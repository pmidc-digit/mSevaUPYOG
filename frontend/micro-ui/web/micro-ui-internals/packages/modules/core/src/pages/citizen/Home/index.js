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
  const { t } = useTranslation()
  const history = useHistory()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredServices, setFilteredServices] = useState([])
  const [showSurveyModal, setShowSurveyModal] = useState(false)
  
  // Use sessionStorage to persist showAllCards state across navigation
  const getInitialShowAllCards = () => {
    const stored = sessionStorage.getItem("citizen.home.showAllCards")
    return stored === "true"
  }
  const [showAllCards, setShowAllCards] = useState(getInitialShowAllCards)
  
  const citizenInfoString = window.localStorage.getItem("user-info")
  const citizenInfo = citizenInfoString ? JSON.parse(citizenInfoString) : null
  const UserType = citizenInfo?.type === "CITIZEN"
  const UserRole = Array.isArray(citizenInfo?.roles) && citizenInfo?.roles.some((item) => item.code === "PESCO")
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true)
  console.log("IS THIS PAGE REACH HERE IN CONSOLE...");
  //const SurveyModal = Digit?.ComponentRegistryService?.getComponent("SurveyModal");

  const {
    data: { stateInfo, uiHomePage } = {},
    isLoading,
  } = Digit.Hooks.useStore.getInitData()
  const isMobile = window.Digit.Utils.browser.isMobile()

  console.log(uiHomePage, "LOOK");

  if (window.Digit.SessionStorage.get("TL_CREATE_TRADE")) window.Digit.SessionStorage.set("TL_CREATE_TRADE", {})

  const conditionsToDisableNotificationCountTrigger = () => {
    if (Digit.UserService?.getUser()?.info?.type === "EMPLOYEE") return false
    if (!Digit.UserService?.getUser()?.access_token) return false
    return true
  }

  const { data: EventsData, isLoading: EventsDataLoading } = Digit.Hooks.useEvents({
    tenantId,
    variant: "whats-new",
    config: {
      enabled: conditionsToDisableNotificationCountTrigger(),
    },
  })

  const parseValue = (value) => {
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }

  const getFromStorage = (key) => {
    const value = window.localStorage.getItem(key)
    return value && value !== "undefined" ? parseValue(value) : null
  }

  const citizenToken = getFromStorage("Citizen.token")
  const citizenInfoMain = getFromStorage("Citizen.user-info")
  const langSelect = getFromStorage("locale")
  console.log("citizenInfoMain", citizenInfoMain, "langSelect", langSelect)

  const getUserDetails = (access_token, info) => ({ token: access_token, access_token, info })
  const userDetails = getUserDetails(citizenToken, citizenInfoMain)
  window.Digit.SessionStorage.set("User", userDetails)

  if (!citizenToken) {
    langSelect === null
      ? history.push(`/digit-ui/citizen/select-language`)
      : history.push(`/digit-ui/citizen/select-location`)
  }

  const appBannerWebObj = uiHomePage?.appBannerDesktop
  const appBannerMobObj = uiHomePage?.appBannerMobile
  const citizenServicesObj = uiHomePage?.citizenServicesCard
  const infoAndUpdatesObj = uiHomePage?.informationAndUpdatesCard
  const whatsAppBannerWebObj = uiHomePage?.whatsAppBannerDesktop
  const whatsAppBannerMobObj = uiHomePage?.whatsAppBannerMobile
  const whatsNewSectionObj = uiHomePage?.whatsNewSection

  const handleClickOnWhatsAppBanner = (obj) => {
    window.open(obj?.navigationUrl)
  }

  const getIconForService = (code) => {
    switch (code) {
      case "CITIZEN_SERVICE_PGR":
        return <ComplaintIcon />
      case "CITIZEN_SERVICE_PT":
        return <PTIcon />
      case "CITIZEN_SERVICE_TL":
        return <CaseIcon />
      case "CITIZEN_SERVICE_WS":
        return <WSICon />
      case "CITIZEN_SERVICE_PTR":
        return <PTRIcon />
      case "CITIZEN_SERVICE_SWACH":
        return <CHBIcon />
      case "CITIZEN_SERVICE_NOC":
        return <NOCIcon />
      case "CITIZEN_SERVICE_OBPS":
        return <PTIcon />
      case "CITIZEN_SERVICE_ADS":
        return <ADSIcone />
      case "CITIZEN_SERVICE_NDC":
        return <NDCIcon />
      case "CITIZEN_SERVICE_MODULE_SV":
        return <MCollectIcon />
        case "CITIZEN_SERVICE_CHALLANGENERATION":
        return <NDCIcon />
        case "CITIZEN_SERVICE_MCOLLECT":
        return <MCollectIcon />
      case "CITIZEN_SERVICE_DOCUMENTS":
        return <DocumentIcon />
      case "CITIZEN_SERVICE_HELP":
        return <HelpIcon />
        case "CITIZEN_SERVICE_RENTANDLEASE":
        return <GenericFileIcon />
        case "CITIZEN_SERVICE_CHB":
        return <CHBIcon />

      default:
        return <MCollectIcon />
    }
  }

  // Handle search and filter services
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    
    if (query.trim() === "") {
      setFilteredServices([])
      return
    }

    const allServices = UserType && UserRole
      ? [
          {
            name: t(citizenServicesObj?.props?.[5]?.label),
            Icon: <ComplaintIcon />,
            onClick: () => history.push(citizenServicesObj?.props?.[5]?.navigationUrl),
          },
        ]
      : citizenServicesObj?.props
          ?.filter((item) => item?.enabled)
          ?.map((item) => ({
            name: t(item.label),
            Icon: getIconForService(item.code),
            onClick: () => history.push(item.navigationUrl),
          })) || []

    const filtered = allServices.filter((service) =>
      service.name.toLowerCase().includes(query)
    )
    setFilteredServices(filtered)
  }

  // Show survey modal on first load for citizens
  useEffect(() => {
    if (UserType && !sessionStorage.getItem("survey_modal_shown")) {
      setShowSurveyModal(true)
      sessionStorage.setItem("survey_modal_shown", "true")
    }
  }, [UserType])

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
              name: t(citizenServicesObj?.props?.[5]?.label),
              Icon: <ComplaintIcon />,
              onClick: () => history.push(citizenServicesObj?.props?.[5]?.navigationUrl),
            },
          ]
        : citizenServicesObj?.props
            ?.filter((item) => item?.enabled)
            ?.map((item) => ({
              name: t(item.label),
              Icon: getIconForService(item.code),
              onClick: () => history.push(item.navigationUrl),
            })),
    styles: { display: "flex", flexWrap: "wrap", justifyContent: "flex-start", width: "100%" },
  }

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
  }

  sessionStorage.removeItem("type")
  sessionStorage.removeItem("pincode")
  sessionStorage.removeItem("tenantId")
  sessionStorage.removeItem("localityCode")
  sessionStorage.removeItem("landmark")
  sessionStorage.removeItem("propertyid")

  return isLoading ? (
    <Loader />
  ) : (
    <React.Fragment>

        <SurveyModal isOpen={showSurveyModal} onClose={() => setShowSurveyModal(false)} />
    <div className="HomePageContainer">
      <div className="HomePageWrapper">
        <div className="hero-banner-styles">
          <h1 className="hero-title-styles">mSeva Punjab</h1>
          <p className="heroSubtitleStyles" >Access citizen services digitally with ease and transparency</p>
          <div className="searchBarStyles" >
            <span className="searchIconStyles" ><SearchIconSvg /></span>
            <input
              type="text"
              placeholder={t("CS_COMMON_SEARCH_PLACEHOLDER") || "Search for services..."}
              value={searchQuery}
              onChange={handleSearchChange}
              className="searchInputStyles"
            />
          </div>

          {/* Display filtered services when user is typing */}
          {searchQuery.trim() !== "" && filteredServices.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
                {t("Search Results")}
              </div>
              <CardBasedOptions
                header=""
                sideOption={{
                  name: t(citizenServicesObj?.sideOption?.name),
                  onClick: () => history.push(citizenServicesObj?.sideOption?.navigationUrl),
                }}
                options={filteredServices}
                styles={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", width: "100%" }}
              />
            </div>
          )}

          {/* Show no results message */}
          {searchQuery.trim() !== "" && filteredServices.length === 0 && (
            <div style={{ marginTop: "24px", padding: "20px", textAlign: "center", color: "#999" }}>
              <p>{t("No services found matching") || "No services found matching"} "{searchQuery}"</p>
            </div>
          )}
        </div>

        <div className="ServicesSection" style={{ marginTop: "40px" }}>
          <CardBasedOptions
            {...allCitizenServicesProps}
            options={showAllCards ? allCitizenServicesProps.options : allCitizenServicesProps.options?.slice(0, 4)}
          />
          {allCitizenServicesProps.options?.length > 4 && (
            <div style={{ marginTop: "24px", textAlign: "center", justifyContent: "center", display: "flex", width: "100%" }}>
              <button
                onClick={() => {
                  const newValue = !showAllCards
                  setShowAllCards(newValue)
                  sessionStorage.setItem("citizen.home.showAllCards", newValue.toString())
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

        <div className="UpdatesSection" style={{ marginTop: "40px" }}>
          <CardBasedOptions {...allInfoAndUpdatesProps} />
        </div>

      

          {/* <DashboardFooter /> */}
      </div>
    </div>
    </React.Fragment>
  )
}

export default Home;
