import React, { useEffect } from "react";
import SWACHCard from "./components/SWACHCard";
import { useRouteMatch } from "react-router-dom";

import CitizenApp from "./pages/citizen";
import getRootReducer from "./redux/reducers";
import { useTranslation } from "react-i18next";
import { LOCALE } from "./constants/Localization";

import Inbox from "./pages/employee/Inbox";
import EmployeeApp from "./EmployeeApp";
import { ComplaintIcon, CitizenHomeCard, Loader } from "@mseva/digit-ui-react-components";
import { CreateComplaint as CreateComplaintEmp } from "./pages/employee/CreateComplaint";
import { ComplaintDetails } from "./pages/employee/ComplaintDetails";
import ResponseEmp from "./pages/employee/Response";
import { CreateComplaint as CitizenCreateComplaint } from "./pages/citizen/CreateComplaint/index";
import { ComplaintsList } from "./pages/citizen/ComplaintsList";
import ResponseCitizen from "./pages/citizen/Response";
import ComplaintDetailsPage from "./pages/citizen/ComplaintDetails";


export const SWACHReducers = getRootReducer;

export const SwachModule = ({ stateCode, userType, tenants }) => {
  const moduleCode = "Swach";
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });

  if (isLoading) {
    return <Loader />;
  }

  Digit.SessionStorage.set("SWACH_TENANTS", tenants);

  if (userType === "citizen") {
    return <CitizenApp />
  } else {
    return <EmployeeApp />;
  }
};

export const SWACHLinks = ({ matchPath }) => {
  const { t } = useTranslation();
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage(PGR_CITIZEN_CREATE_COMPLAINT, {});

  useEffect(() => {
    clearParams();
  }, []);

  const links = [
    {
      link: `${matchPath}/create-complaint/complaint-type`,
      i18nKey: t("CS_COMMON_FILE_A_COMPLAINT"),
    },
    {
      link: `${matchPath}/complaints`,
      i18nKey: t(LOCALE.MY_COMPLAINTS),
    },
  ];

  return <CitizenHomeCard header={t("CS_COMMON_HOME_COMPLAINTS")} links={links} Icon={ComplaintIcon} />;
};

const componentsToRegister = {
  SwachModule,
  SWACHLinks,
  SWACHCard,
  SWACHInbox : Inbox,
  SWACHCreateComplaintEmp: CreateComplaintEmp,
  SWACHResponseEmp : ResponseEmp,
  SWACHComplaintDetails : ComplaintDetails,
  SWACHCitizenCreateComplaint : CitizenCreateComplaint,
  SWACHComplaintsList : ComplaintsList,
  SWACHResponseCitzen : ResponseCitizen,
  SWACHComplaintDetailsPage : ComplaintDetailsPage,
};

export const initSWACHComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
