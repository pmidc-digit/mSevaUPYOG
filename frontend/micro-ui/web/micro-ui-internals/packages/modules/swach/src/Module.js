import React, { useEffect } from "react";
import SWACHCard from "./components/SWACHCard";
import { useRouteMatch } from "react-router-dom";

import CitizenApp from "./pages/citizen";

import EmployeeApp from "./pages/employee";
import { ComplaintIcon, CitizenHomeCard, Loader } from "@mseva/digit-ui-react-components";




export const SWACHModule = ({ stateCode, userType, tenants }) => {
  const moduleCode = "Swach";
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });
  const { path, url } = useRouteMatch();

  if (isLoading) {
    return <Loader />;
  }

  Digit.SessionStorage.set("SWACH_TENANTS", tenants);

  if (userType === "citizen") {
    return <CitizenApp />;
  } else {
    return <EmployeeApp path={path}/>;
  }
};

export const SWACHLinks = ({ matchPath }) => {
  // const { t } = useTranslation();
  // const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage(PGR_CITIZEN_CREATE_COMPLAINT, {});

  // useEffect(() => {
  //   clearParams();
  // }, []);

  // const links = [
  //   {
  //     link: `${matchPath}/create-complaint/complaint-type`,
  //     i18nKey: t("CS_COMMON_FILE_A_COMPLAINT"),
  //   },
  //   {
  //     link: `${matchPath}/complaints`,
  //     i18nKey: t(LOCALE.MY_COMPLAINTS),
  //   },
  // ];

  // return <CitizenHomeCard header={t("CS_COMMON_HOME_COMPLAINTS")} links={links} Icon={ComplaintIcon} />;
};

const componentsToRegister = {
  SWACHModule,
  SWACHLinks,
  SWACHCard,
};

export const initSWACHComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
