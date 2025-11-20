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
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { CitizenSideBar } from "../../../components/TopBarSideBar/SideBar/CitizenSideBar";
import StaticCitizenSideBar from "../../../components/TopBarSideBar/SideBar/StaticCitizenSideBar";

const titleBanner = {
  backgroundImage: `linear-gradient(90deg, rgb(24, 63, 148) 26.61%, rgba(234, 88, 12, 0) 80%), url("https://sdc-uat.lgpunjab.gov.in/filestore/v1/files/viewfile/?name=pb%2Fproperty-upload%2FOctober%2F16%2F1760620815250vZVIeEsyde.jpeg")`,
  backgroundPosition: "right center, center center",
  backgroundSize: "cover, cover",
  backgroundRepeat: "no-repeat, no-repeat",
  height: "160px",
  margin: "40px 20px",
  borderRadius: "20px",
  padding: "2rem",
  fontSize: "30px",
  fontWeight: "700",
  color: "#FFF",
};

const Home = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const citizenInfoString = window.localStorage.getItem("user-info");
  const citizenInfo = citizenInfoString ? JSON.parse(citizenInfoString) : null;
  const UserType = citizenInfo?.type === "CITIZEN";
  const UserRole = Array.isArray(citizenInfo?.roles) && citizenInfo?.roles.some((item) => item.code === "PESCO");
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true);
  const { data: { stateInfo, uiHomePage } = {}, isLoading } = Digit.Hooks.useStore.getInitData();
  let isMobile = window.Digit.Utils.browser.isMobile();
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
      // add more if needed
      default:
        return <MCollectIcon />; // fallback icon
    }
  };

  console.log("citizenServicesObj", citizenServicesObj);

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
            ?.filter((item) => item?.enabled) // include only enabled items
            ?.map((item) => ({
              name: t(item.label),
              Icon: getIconForService(item.code),
              onClick: () => history.push(item.navigationUrl),
            })),

    // [
    //     {
    //       name: t(citizenServicesObj?.props?.[0]?.label),
    //       Icon: <ComplaintIcon />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[0]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[1]?.label),
    //       Icon: <PTIcon className="" />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[1]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[2]?.label),
    //       Icon: <CaseIcon className="" />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[2]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[3]?.label),
    //       Icon: <WSICon />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[3]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[4]?.label),
    //       Icon: <PTRIcon className="" />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[4]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[5]?.label),
    //       Icon: <ComplaintIcon className="" />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[5]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[6]?.label),
    //       Icon: <OBPSIcon className="" />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[6]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[7]?.label),
    //       Icon: <NDCIcon className="" />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[7]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[8]?.label),
    //       Icon: <NOCIcon className="" />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[8]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[9]?.label),
    //       Icon: <NDCIcon className="" />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[9]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[10]?.label),
    //       Icon: <ADSIcone className="" />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[10]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[11]?.label),
    //       Icon: <CHBIcon className="" />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[11]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[12]?.label),
    //       Icon: <NDCIcon className="" />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[12]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[13]?.label),
    //       Icon: <MCollectIcon className="" />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[13]?.navigationUrl),
    //     },
    //     {
    //       name: t(citizenServicesObj?.props?.[14]?.label),
    //       Icon: <MCollectIcon className="" />,
    //       onClick: () => history.push(citizenServicesObj?.props?.[14]?.navigationUrl),
    //     },
    //   ]
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
      // {
      //     name: t("CS_COMMON_HELP"),
      //     Icon: <HelpIcon/>
      // }
    ],
    styles: { display: "flex", flexWrap: "wrap", justifyContent: "flex-start", width: "100%" },
  };
  sessionStorage.removeItem("type");
  sessionStorage.removeItem("pincode");
  sessionStorage.removeItem("tenantId");
  sessionStorage.removeItem("localityCode");
  sessionStorage.removeItem("landmark");
  sessionStorage.removeItem("propertyid");

  return isLoading ? (
    <Loader />
  ) : (
    <div className="HomePageContainer" style={{ width: "100%" }}>
      {/* <div className="SideBarStatic">
        <StaticCitizenSideBar />
      </div> */}
      <div className="HomePageWrapper">
        {
          <div className="BannerWithSearch">
            <div className="titleBanner" style={titleBanner}>
              mSeva Punjab
              {/* {isMobile ? (
              <img src={"https://sdc-uat.lgpunjab.gov.in/filestore/v1/files/viewfile/?name=pb%2Fproperty-upload%2FOctober%2F16%2F1760620815250vZVIeEsyde.jpeg"} />
            ) : (
              <img src={"https://sdc-uat.lgpunjab.gov.in/filestore/v1/files/viewfile/?name=pb%2Fproperty-upload%2FOctober%2F16%2F1760620815250vZVIeEsyde.jpeg"} />
            )}  */}
            </div>
            {/* <div className="Search">
              <StandaloneSearchBar placeholder={t("CS_COMMON_SEARCH_PLACEHOLDER")} />
            </div>  */}
            {
              <div className="ServicesSection">
                <CardBasedOptions style={{ marginTop: "-30px" }} {...allCitizenServicesProps} />
                {/* <CardBasedOptions style={isMobile ? { marginTop: "-30px" } : { marginTop: "-30px" }} {...allInfoAndUpdatesProps} /> */}
              </div>
            }
          </div>
        }

        {/* {(whatsAppBannerMobObj || whatsAppBannerWebObj) && (
          <div className="WhatsAppBanner">
            {isMobile ? (
              <img
                src={"https://nugp-assets.s3.ap-south-1.amazonaws.com/nugp+asset/Banner+UPYOG+%281920x500%29B+%282%29.jpg"}
                onClick={() => handleClickOnWhatsAppBanner(whatsAppBannerMobObj)}
                style={{ width: "100%" }}
              />
            ) : (
              <img
                src={"https://nugp-assets.s3.ap-south-1.amazonaws.com/nugp+asset/Banner+UPYOG+%281920x500%29B+%282%29.jpg"}
                onClick={() => handleClickOnWhatsAppBanner(whatsAppBannerWebObj)}
                style={{ width: "100%" }}
              />
            )}
          </div>
        )} */}

        {/* {conditionsToDisableNotificationCountTrigger() ? (
          EventsDataLoading ? (
            <Loader />
          ) : (
            <div className="WhatsNewSection">
              <div className="headSection">
                <h2>{t(whatsNewSectionObj?.headerLabel)}</h2>
                <p onClick={() => history.push(whatsNewSectionObj?.sideOption?.navigationUrl)}>{t(whatsNewSectionObj?.sideOption?.name)}</p>
              </div>
              <WhatsNewCard {...EventsData?.[0]} />
            </div>
          )
        ) : null} */}
      </div>
    </div>
  );
};

export default Home;
