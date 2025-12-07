import React, { useEffect } from "react";
import {
  StandaloneSearchBar,
  Loader,
  CardBasedOptions,
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



const Home = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const citizenInfoString = window.localStorage.getItem("user-info")
  const citizenInfo = citizenInfoString ? JSON.parse(citizenInfoString) : null
  const UserType = citizenInfo?.type === "CITIZEN"
  const UserRole = Array.isArray(citizenInfo?.roles) && citizenInfo?.roles.some((item) => item.code === "PESCO")
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true)
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
      default:
        return <MCollectIcon />
    }
  }

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
             
              className="searchInputStyles"
            />
          </div>
        </div>

        <div className="ServicesSection" style={{ marginTop: "40px" }}>
          <CardBasedOptions {...allCitizenServicesProps} />
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
  )
}

export default Home;
