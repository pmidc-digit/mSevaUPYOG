import React from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import { Loader, CitizenHomeCard, WSICon } from "@mseva/digit-ui-react-components";
import CitizenApp from "./pages/citizen";
import EmployeeApp from "./pages/employee";

//Page Components
import GCCard from "./components/GCCard";
import getRootReducer from "./redux/reducers";

export const GCReducers = getRootReducer;

export const GCModule = ({ stateCode, userType, tenants }) => {
  const tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || Digit.ULBService.getCurrentTenantId();
  const moduleCode = ["ws", "gc", "pt", "common", tenantId, "bill-amend", "abg"];
  const { path, url } = useRouteMatch();

  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({
    stateCode,
    moduleCode,
    language,
  });

  Digit.SessionStorage.set("GC_TENANTS", tenants);

  if (isLoading) {
    return <Loader />;
  }

  if (userType === "citizen") {
    return <CitizenApp path={path} stateCode={stateCode} />;
  }

  return <EmployeeApp path={path} stateCode={stateCode} />;
};

export const GCLinks = ({ matchPath, userType }) => {
  const { t } = useTranslation();

  const links = [
    {
      link: `${matchPath}/my-bills`,
      i18nKey: t("ACTION_TEST_WNS_MY_BILLS"),
    },
    {
      link: `${matchPath}/my-payments`,
      i18nKey: t("ACTION_TEST_MY_PAYMENTS"),
    },
    {
      link: `${matchPath}/create-application`,
      i18nKey: t("ACTION_TEST_APPLY_NEW_CONNECTION"),
    },
    {
      link: `${matchPath}/search`,
      i18nKey: t("ACTION_TEXT_WS_SEARCH_AND_PAY"),
    },
    {
      link: `${matchPath}/my-applications`,
      i18nKey: t("ACTION_TEXT_GC_MY_APPLICATION"),
    },
    {
      link: `${matchPath}/my-connections`,
      i18nKey: t("ACTION_TEXT_GC_MY_CONNECTION"),
    },
  ];

  return <CitizenHomeCard header={t("ACTION_TEST_GARBAGE_COLLECTION")} links={links} Icon={() => <WSICon />} />;
};

const componentsToRegister = {
  GCModule,
  GCLinks,
  GCCard,
};

export const initGCComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
