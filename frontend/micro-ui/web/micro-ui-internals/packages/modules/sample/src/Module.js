import { CitizenHomeCard, PTIcon } from "@upyog/digit-ui-react-components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import CitizenApp from "./pages/citizen";
import Create from "./pages/citizen/create/index";
import EmployeeApp from "./pages/employee";
// import BrSelectName from "./pagecomponents/BrSelectName";
// import BRSelectPhoneNumber from "./pagecomponents/BrSelectPhoneNumber";
// import BRSelectGender from "./pagecomponents/BRSelectGender";
// import BRSelectEmailId from "./pagecomponents/SelectEmailId";
// import BRSelectPincode from "./pagecomponents/BRSelectPincode";
// import BrSelectAddress from "./pagecomponents/BrSelectAddress";
// import SelectCorrespondenceAddress from "./pagecomponents/SelectCorrespondenceAddress";
// import SelectDocuments from "./pagecomponents/SelectDocuments";
// import BRCard from "./components/config/BRCard";
// import BRManageApplication from "./pages/employee/BRManageApplication";
// import RegisterDetails from "./pages/employee/RegisterDetails";
// import Response from "./pages/citizen/create/Response";

import { SampleTest } from "./pages/employee/test";

export const BRModule = ({ stateCode, userType, tenants }) => {
  console.log("In sample Module.js BRModule");
  const { path, url } = useRouteMatch();
  console.log("Path modulessamplesrcModule.js: ", path);
  const moduleCode = "BR";
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });

  if (userType === "citizen") {
    return <CitizenApp path={path} stateCode={stateCode} />;
  }

  return <EmployeeApp path={path} stateCode={stateCode} />;
};

export const BRLinks = ({ matchPath, userType }) => {
  const { t } = useTranslation();

  const links = [
    {
      link: `${matchPath}/birth`,
      i18nKey: t("Create BirthRegistration"),
    },
  ];

  return <CitizenHomeCard header={t("BirthRegistration")} links={links} Icon={() => <PTIcon className="fill-path-primary-main" />} />;
};

const componentsToRegister = {
  // Response,
  // RegisterDetails,
  // BRManageApplication,
  // BRCard,
  // SelectDocuments,
  // SelectCorrespondenceAddress,
  // BrSelectAddress,
  // BRSelectPincode,
  // BRSelectEmailId,
  // BRSelectGender,
  // BRSelectPhoneNumber,
  // BrSelectName,
  BRCreate: Create,
  BRModule: BRModule,
  BRLinks: BRLinks,
  SampleTest: SampleTest,
};

export const initBRComponents = () => {
  console.log("In sample Module.js initBr components");
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
