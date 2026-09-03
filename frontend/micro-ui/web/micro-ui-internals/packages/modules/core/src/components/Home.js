import {
  BackButton,
  BillsIcon,
  CitizenHomeCard,
  CitizenInfoLabel,
  FSMIcon,
  Loader,
  MCollectIcon,
  OBPSIcon,
  PGRIcon,
  PTIcon,
  TLIcon,
  WSICon,
  PTRIcon,
  Table,
  ArrowRightInbox,
  SubmitBar,
} from "@mseva/digit-ui-react-components";
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EmployeeQuickServicesCard from "../EmployeeQuickServicesCard";
import CitizenHomeCardWithExternalLink from "../pages/citizen/CitizenHomeCardWithExternalLink";
import CitizenHomeCardAccordian from "../pages/citizen/CitizenHomeCardAccordian";
/* 
Feature :: Citizen All service screen cards
*/

export const processLinkData = (newData, code, t) => {
  const obj = newData?.[`${code}`];
  if (obj) {
    obj.map((link) => {
      (link.link = link["navigationURL"]), (link.i18nKey = t(link["name"]));
    });
  }
  const newObj = {
    links: obj?.reverse(),
    header: Digit.Utils.locale.getTransformedLocale(`ACTION_TEST_${code}`),
    iconName: `CITIZEN_${code}_ICON`,
  };
  if (code === "FSM") {
    const roleBasedLoginRoutes = [
      {
        role: "FSM_DSO",
        from: "/digit-ui/citizen/fsm/dso-dashboard",
        dashoardLink: "CS_LINK_DSO_DASHBOARD",
        loginLink: "CS_LINK_LOGIN_DSO",
      },
    ];
    //RAIN-7297
    roleBasedLoginRoutes.map(({ role, from, loginLink, dashoardLink }) => {
      if (Digit.UserService.hasAccess(role))
        newObj?.links?.push({
          link: from,
          i18nKey: t(dashoardLink),
        });
      else
        newObj?.links?.push({
          link: `/digit-ui/citizen/select-language`,
          state: { role: "FSM_DSO", from },
          i18nKey: t(loginLink),
        });
    });
  }
  return newObj;
};

const iconSelector = (code) => {
  switch (code) {
    case "PT":
      return <PTIcon className="fill-path-primary-main" />;
    case "WS":
      return <WSICon className="fill-path-primary-main" />;
    case "FSM":
      return <FSMIcon className="fill-path-primary-main" />;
    case "MCollect":
      return <MCollectIcon className="fill-path-primary-main" />;
    case "ChallanGeneration":
      return <MCollectIcon className="fill-path-primary-main" />;
    case "RentAndLease":
      return <MCollectIcon className="fill-path-primary-main" />;
    case "PGR":
      return <PGRIcon className="fill-path-primary-main" />;
    case "TL":
      return <TLIcon className="fill-path-primary-main" />;
    case "OBPS":
      return <OBPSIcon className="fill-path-primary-main" />;
    case "BPAStakeholder":
      return <OBPSIcon className="fill-path-primary-main" />;
    case "Layout":
      return <OBPSIcon className="fill-path-primary-main" />;
    case "Bills":
      return <BillsIcon className="fill-path-primary-main" />;
    case "PTR":
      return <PTRIcon className="fill-path-primary-main" />;
    case "SV":
      return <PTRIcon className="fill-path-primary-main" />;
    case "ADS":
      return <PTRIcon className="fill-path-primary-main" />;
    case "NDC":
      return <PTRIcon className="fill-path-primary-main" />;
    case "GarbageCollection":
      return <PTRIcon className="fill-path-primary-main" />;
    case "KibanaDashboard":
      return <PTRIcon className="fill-path-primary-main" />;
    case "CLU":
      return <OBPSIcon className="fill-path-primary-main" />;
    default:
      return <PTIcon className="fill-path-primary-main" />;
  }
};

function Card({ card }) {
  const cardStyle = {
    background: card.background,
  };

  return (
    <div className="employee-dashboard-card" style={cardStyle}>
      <div className="employee-dashboard-card-heading-container">
        <img src={card.icon || "/placeholder.svg"} alt="icon" />
        <h2 className="employee-dashboard-card-heading">{card.heading}</h2>
      </div>
      <div className="employee-dashboard-card-content">{card.content}</div>
    </div>
  );
}

const CitizenHome = ({ modules, getCitizenMenu, fetchedCitizen, isLoading }) => {
  const paymentModule = modules.filter(({ code }) => code === "Payment")[0];
  const moduleArr = modules.filter(({ code }) => code !== "Payment");
  const moduleArray = [paymentModule, ...moduleArr];
  const { t } = useTranslation();
  if (isLoading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <div className="citizen-all-services-wrapper">
        <BackButton />
        <div className="citizenAllServiceGrid" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {moduleArray
            .filter((mod) => mod)
            .map(({ code }, index) => {
              let mdmsDataObj;
              if (fetchedCitizen) mdmsDataObj = fetchedCitizen ? processLinkData(getCitizenMenu, code, t) : undefined;
              if (mdmsDataObj?.links?.length > 0) {
                return (
                  <div key={index}>
                    {code === "OBPS" ? (
                      <CitizenHomeCardAccordian
                        header={t(mdmsDataObj?.header)}
                        links={mdmsDataObj?.links?.filter((ele) => ele?.link)?.sort((x, y) => x?.orderNumber - y?.orderNumber)}
                        Icon={() => iconSelector(code)}
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
                    ) : (
                      <CitizenHomeCardAccordian
                        header={t(mdmsDataObj?.header)}
                        links={mdmsDataObj?.links?.filter((ele) => ele?.link)?.sort((x, y) => x?.orderNumber - y?.orderNumber)}
                        Icon={() => iconSelector(code)}
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
                );
              } else return <React.Fragment key={index} />;
            })}
        </div>
      </div>
    </React.Fragment>
  );
};

const EmployeeHome = ({ modules }) => {
  const { t } = useTranslation();
  if (window.Digit.SessionStorage.get("PT_CREATE_EMP_TRADE_NEW_FORM")) window.Digit.SessionStorage.set("PT_CREATE_EMP_TRADE_NEW_FORM", {});

  const userName = Digit.UserService.getUser();
  const obpsModuleCodes = ["OBPS", "BPAStakeholder", "Layout", "CLU", "NOC"];
  const hasOBPSModule = modules?.some((moduleData) => obpsModuleCodes.includes(moduleData?.code));

  return (
    <div className="employee-app-container employee-dashboard-container">
      <section className="employee-dashboard-hero" aria-labelledby="employee-dashboard-welcome">
        <div className="employee-dashboard-hero__content">
          <p className="employee-dashboard-hero__eyebrow">mSeva Employee Portal</p>
          <h1 id="employee-dashboard-welcome">
            Hi, <span>{userName?.info?.name || "User"}</span>
          </h1>
        </div>
      </section>

      <div className="employee-dashboard-table-and-services">
        <div className="employee-dashboard-quick-services-container">
          <div className="employee-dashboard-quick-services-header">
            <div className="employee-dashboard-quick-services-title">Quick Services</div>
            {hasOBPSModule && (
              <SubmitBar
                label={t("User Manual")}
                onSubmit={() =>
                  window.open(
                    "https://sdc-uat.lgpunjab.gov.in/filestore/v1/files/viewfile/?name=pb%2FCLU%2FAugust%2F24%2F1787583703919JNROWeZZwT.pdf",
                    "_blank"
                  )
                }
              />
            )}
          </div>
          <div className="employee-dashboard-module-card-wrapper">
            {modules.map((moduleData, index) => {
              return <EmployeeQuickServicesCard key={index} moduleData={moduleData} />;
            })}
          </div>
          <div style={{ marginTop: "70px" }}></div>
        </div>
      </div>
    </div>
  );
};

export const AppHome = ({ userType, modules, getCitizenMenu, fetchedCitizen, isLoading }) => {
  if (userType === "citizen") {
    return <CitizenHome modules={modules} getCitizenMenu={getCitizenMenu} fetchedCitizen={fetchedCitizen} isLoading={isLoading} />;
  }
  return <EmployeeHome modules={modules} />;
};
