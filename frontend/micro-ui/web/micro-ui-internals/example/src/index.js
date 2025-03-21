import React from "react";
import ReactDOM from "react-dom";

import { initLibraries } from "@mseva/digit-ui-libraries";
import { PGRReducers } from "@mseva/digit-ui-module-pgr";
import { HRMSReducers } from "@mseva/digit-ui-module-hrms";
import { HRMSModule, initHRMSComponents } from "@mseva/digit-ui-module-hrms";

import { PTModule, PTLinks, PTComponents } from "@mseva/digit-ui-module-pt";
import { MCollectModule, MCollectLinks } from "@mseva/digit-ui-module-mcollect";
// import { TLModule, TLLinks } from "@mseva/digit-ui-module-tl";
import { initFSMComponents } from "@mseva/digit-ui-module-fsm";
import { initPGRComponents } from "@mseva/digit-ui-module-pgr";
import { initDSSComponents } from "@mseva/digit-ui-module-dss";
import { initReceiptsComponents, ReceiptsModule } from "@mseva/digit-ui-module-receipts";
// import { initReportsComponents } from "@mseva/digit-ui-module-reports";
import { initMCollectComponents } from "@mseva/digit-ui-module-mcollect";
import { initTLComponents } from "@mseva/digit-ui-module-tl";
import { PaymentModule, PaymentLinks, paymentConfigs } from "@mseva/digit-ui-module-common";
import { initOBPSComponents } from "@mseva/digit-ui-module-obps";
import { initEngagementComponents,SurveyReducers } from "@mseva/digit-ui-module-engagement";
import { initNOCComponents } from "@mseva/digit-ui-module-noc";
import { initWSComponents, WSReducers } from "@mseva/digit-ui-module-ws";
import { DigitUI } from "@mseva/digit-ui-module-core";
import { initCommonPTComponents } from "@mseva/digit-ui-module-commonpt";
import { initBillsComponents, BillsModule } from "@mseva/digit-ui-module-bills";
import { PTRModule, PTRLinks, PTRComponents } from "@mseva/digit-ui-module-ptr";
// import {initCustomisationComponents} from "./customisations";
// import { PGRModule, PGRLinks } from "@mseva/digit-ui-module-pgr";
// import { Body, TopBar } from "@mseva/digit-ui-react-components";
//import "@upyog-niua/upyog-css/example/index.css";
import "@pmidc/upyog-css";
// import * as comps from "@mseva/digit-ui-react-components";
// import { subFormRegistry } from "@upyog/digit-ui-libraries";

import { pgrCustomizations, pgrComponents } from "./pgr";

var Digit = window.Digit || {};

const enabledModules = [
  "PGR",
  "FSM",
  "Payment",
  "PT",
  "QuickPayLinks",
  "DSS",
  "MCollect",
  "HRMS",
  "TL",
  "Receipts",
  "Reports",
  "OBPS",
  "Engagement",
  "NOC",
  "WS",
  "CommonPT",
  "NDSS",
  "Bills",
  "SW",
  "BillAmendment",
  "FireNoc",
  "Birth",
  "Death",
  "PTR",
  "ADS"
];

const initTokens = (stateCode) => {
  const userType = window.sessionStorage.getItem("userType") || process.env.REACT_APP_USER_TYPE || "CITIZEN";

  const token = window.localStorage.getItem("token") || process.env[`REACT_APP_${userType}_TOKEN`];

  const citizenInfo = window.localStorage.getItem("Citizen.user-info");

  const citizenTenantId = window.localStorage.getItem("Citizen.tenant-id") || stateCode;

  const employeeInfo = window.localStorage.getItem("Employee.user-info");
  const employeeTenantId = window.localStorage.getItem("Employee.tenant-id");

  const userTypeInfo = userType === "CITIZEN" || userType === "QACT" ? "citizen" : "employee";
  window.Digit.SessionStorage.set("user_type", userTypeInfo);
  window.Digit.SessionStorage.set("userType", userTypeInfo);

  if (userType !== "CITIZEN") {
    window.Digit.SessionStorage.set("User", { access_token: token, info: userType !== "CITIZEN" ? JSON.parse(employeeInfo) : citizenInfo });
  } else {
    // if (!window.Digit.SessionStorage.get("User")?.extraRoleInfo) window.Digit.SessionStorage.set("User", { access_token: token, info: citizenInfo });
  }

  window.Digit.SessionStorage.set("Citizen.tenantId", citizenTenantId);

  if (employeeTenantId && employeeTenantId.length) window.Digit.SessionStorage.set("Employee.tenantId", employeeTenantId);
};

const initDigitUI = () => {
  window?.Digit.ComponentRegistryService.setupRegistry({
    ...pgrComponents,
    PaymentModule,
    ...paymentConfigs,
    PaymentLinks,
    PTModule,
    PTLinks,
    ...PTComponents,
    MCollectLinks,
    MCollectModule,
    HRMSModule,
    ReceiptsModule,
    BillsModule,
    PTRModule,
    PTRLinks,
    ...PTRComponents,
  

    // TLModule,
    // TLLinks,
  });
  initFSMComponents();
  initPGRComponents();
  initDSSComponents();
  initMCollectComponents();
  initHRMSComponents();
  initTLComponents();
  initReceiptsComponents();
  // initReportsComponents();
  initOBPSComponents();
  initEngagementComponents();
  initNOCComponents();
  initWSComponents();
  initCommonPTComponents();
  initBillsComponents();
  // initCustomisationComponents();

  const moduleReducers = (initData) => ({
    pgr: PGRReducers(initData),
    hrms: HRMSReducers(initData),
    ws: WSReducers(initData),
    engagement: SurveyReducers(initData)
  });

  window.Digit.Customizations = {
    PGR: pgrCustomizations,
    TL: {
      customiseCreateFormData: (formData, licenceObject) => licenceObject,
      customiseRenewalCreateFormData: (formData, licenceObject) => licenceObject,
      customiseSendbackFormData: (formData, licenceObject) => licenceObject,
    },
  };

  const stateCode = window?.globalConfigs?.getConfig("STATE_LEVEL_TENANT_ID") || "pb";
  initTokens(stateCode);

  const registry = window?.Digit.ComponentRegistryService.getRegistry();
  ReactDOM.render(<DigitUI stateCode={stateCode} enabledModules={enabledModules} moduleReducers={moduleReducers} />, document.getElementById("root"));
};

initLibraries().then(() => {
  initDigitUI();
});
