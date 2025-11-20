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
} from "@mseva/digit-ui-react-components";
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EmployeeQuickServicesCard from "../EmployeeQuickServicesCard";
import CitizenHomeCardWithExternalLink from "../pages/citizen/CitizenHomeCardWithExternalLink";
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
          link: `/digit-ui/citizen/login`,
          state: { role: "FSM_DSO", from },
          i18nKey: t(loginLink),
        });
    });
  }

  return newObj;
};
const iconSelector = (code) => {
  console.log("Icon Selector Code", code);
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
        <img src={card.icon} alt="icon" />
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
                  <div>
                  {code === "OBPS"?
                  <CitizenHomeCardWithExternalLink
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
                    :
                  <CitizenHomeCard
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
                  />}
                  </div>
                );
              } else return <React.Fragment />;
            })}
        </div>
      </div>
    </React.Fragment>
  );
};

const EmployeeHome = ({ modules }) => {
  const { t } = useTranslation();
  if (window.Digit.SessionStorage.get("PT_CREATE_EMP_TRADE_NEW_FORM")) window.Digit.SessionStorage.set("PT_CREATE_EMP_TRADE_NEW_FORM", {});
  const columns = [
    { Header: "S. No", accessor: (row, i) => i + 1 },
    { Header: "Column1", accessor: "column1" },
    { Header: "Column2", accessor: "column2" },
    { Header: "Column3", accessor: "column3" },
  ];
  const userName = Digit.UserService.getUser();
  //console.log("User Info", userName)
  const apiData = {
    welcomeCard: {
      background:
        "linear-gradient(90deg, #183F94 26.61%, rgba(234, 88, 12, 0) 100%), url('https://sdc-uat.lgpunjab.gov.in/filestore/v1/files/viewfile/?name=pb%2Fproperty-upload%2FOctober%2F16%2F1760620815250vZVIeEsyde.jpeg')",
      icon: "icon1.png",
      heading: "Welcome " + userName.info.name,
      content: "",
    },
    cards: [
      {
        heading: "Status",
        background: "#0A7FCE",
        icon: "icon1.png",
        content: "This is the content of card 1.",
      },
      {
        heading: "Notifications",
        background: "#F97316",
        icon: "icon2.png",
        content: "This is the content of card 2.",
      },
      {
        heading: "Events",
        background: "#8B5CF6",
        icon: "icon3.png",
        content:
          "This is the content of card 3.Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod.This is the content of card 3.Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod.This is the content of card 3.Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod.This is the content of card 3.Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod.",
      },
      {
        heading: "Complete your Profile",
        background: "#7DA3FD",
        icon: "icon4.png",
        content: "This is the content of card 4.",
      },
    ],
  };

  console.log("Modules: ", modules);
  return (
    <div className="employee-app-container employee-dashboard-container">
      <div
        className="employee-dashboard-welcome-card"
        style={{
          background:
            "linear-gradient(90deg, #183F94 26.61%, rgba(234, 88, 12, 0) 80%), url('https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/1cace0150346b2e2f5989aaaf63b8e26.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "right",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="employee-dashboard-welcome-card-entire-content">
          <div className="employee-dashboard-welcome-card-heading">{apiData.welcomeCard.heading}</div>
          <p className="employee-dashboard-welcome-card-content">{apiData.welcomeCard.content}</p>
          <div
            style={{
              width: "134px",
              height: "134px",
              background: "#D6D6D620",
              borderRadius: "0% 100% 0% 0%",
              position: "absolute",
              left: "1px",
              top: "70px",
            }}
          ></div>
        </div>
      </div>

      {/* <div className="employee-dashboard-card-grid">
        {apiData.cards.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </div> */}

      <div className="employee-dashboard-table-and-services">
        {/* <div className="employee-dashboard-table-container"> */}
        {/*  <div className="employee-dashboard-table-header">
             <div className="employee-dashboard-table-title">Table</div>
            <div className="employee-dashboard-view-all-link">
              <Link>View all &gt;</Link>
            </div> 
          </div> */}
        {/* <div className="employee-dashboard-table-content">
            <Table
              t={t}
              data={[]}
              columns={columns}
              getCellProps={(cellInfo) => ({
                style: {
                  padding: "20px 18px",
                  fontSize: "16px",
                },
              })}
              manualPagination={false}
            />
          </div> */}
        {/*  </div> */}

        <div className="employee-dashboard-quick-services-container">
          <div className="employee-dashboard-quick-services-header">
            <div className="employee-dashboard-quick-services-title">Quick Services</div>
            {/* <div className="employee-dashboard-view-all-link">
              <Link to={{ pathname: "/digit-ui/employee/services", state: { modules: modules } }}>View all &gt;</Link>
            </div> */}
          </div>
          <div className="employee-dashboard-module-card-wrapper">
            {modules.map((moduleData, index) => {
              //const Card = Digit.ComponentRegistryService.getComponent(`${code}Card`) || (() => <React.Fragment />);
              return <EmployeeQuickServicesCard moduleData={moduleData} />;
            })}
          </div>
          <div style={{ marginTop: "70px" }}>
            {/* modules.map(({ code }, index) => {
              console.log("dsjdgsh", code);
              const Card = Digit.ComponentRegistryService.getComponent(`${code}Card`) || (() => <React.Fragment />);
              return <Card key={index} />;
            })*/}
          </div>
          {/* </div> */}
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