import React from "react";
import ReactDOM from "react-dom";

import { initLibraries } from "@mseva/digit-ui-libraries";
import { PGRReducers } from "@mseva/digit-ui-module-pgr";
import { SWACHReducers } from "@mseva/digit-ui-module-swach";
import { HRMSReducers } from "@mseva/digit-ui-module-hrms";
import { HRMSModule, initHRMSComponents } from "@mseva/digit-ui-module-hrms";

import { PTModule, PTLinks, PTComponents, PTReducers } from "@mseva/digit-ui-module-pt";
import { MCollectModule, MCollectLinks } from "@mseva/digit-ui-module-mcollect";
import { TLModule, TLLinks, initTLComponents, TLReducers } from "@mseva/digit-ui-module-tl";
import { GCModule, GCLinks, initGCComponents, GCReducers } from "@mseva/digit-ui-module-gc";
import { initFSMComponents } from "@mseva/digit-ui-module-fsm";
import { initPGRComponents } from "@mseva/digit-ui-module-pgr";
import { initSWACHComponents } from "@mseva/digit-ui-module-swach";
import { initDSSComponents } from "@mseva/digit-ui-module-dss";
import { initReceiptsComponents, ReceiptsModule } from "@mseva/digit-ui-module-receipts";
// import { initReportsComponents } from "@mseva/digit-ui-module-reports";
import { initMCollectComponents } from "@mseva/digit-ui-module-mcollect";
import { PaymentModule, PaymentLinks, paymentConfigs } from "@mseva/digit-ui-module-common";
import { initOBPSComponents } from "@mseva/digit-ui-module-obps";
import { initEngagementComponents, SurveyReducers } from "@mseva/digit-ui-module-engagement";
import { initNOCComponents } from "@mseva/digit-ui-module-noc";
import { initWSComponents, WSReducers } from "@mseva/digit-ui-module-ws";
import { DigitUI } from "@mseva/digit-ui-module-core";
import { initCommonPTComponents, CommonPTModule } from "@mseva/digit-ui-module-commonpt";
import { initBillsComponents, BillsModule } from "@mseva/digit-ui-module-bills";
import { PTRModule, PTRLinks, PTRComponents, PTRReducers } from "@mseva/digit-ui-module-ptr";
import { SVComponents, SVLinks, SVModule } from "@mseva/digit-ui-module-sv";
import { ADSModule, ADSLinks, ADSComponents, ADSReducers } from "@mseva/upyog-ui-module-ads";
import { CHBModule, CHBLinks, CHBComponents, CHBReducers } from "@mseva/upyog-ui-module-chb";
import { ASSETComponents, ASSETLinks, ASSETModule } from "@mseva/upyog-ui-module-asset";
import { PGRAIComponents, PGRAILinks, PGRAIModule } from "@mseva/upyog-ui-module-pgrai";

// import {initCustomisationComponents} from "./customisations";
// import { PGRModule, PGRLinks } from "@mseva/digit-ui-module-pgr";
// import { Body, TopBar } from "@mseva/digit-ui-react-components";
//import "@mseva-niua/upyog-css/example/index.css";
import "@pmidc/upyog-css";
// import * as comps from "@mseva/digit-ui-react-components";

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
  "GC",
  "CommonPT",
  "NDSS",
  "Bills",
  "SW",
  "BillAmendment",
  "FireNoc",
  "Birth",
  "Death",
  "PTR",
  "ADS",
  "Swach",
  "SV",
  "CHB",
  "ASSET",
  "PGRAI",
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
    CommonPTModule,
    ...PTRComponents,
    TLModule,
    GCModule,
    TLLinks,
    GCLinks,
    SVModule,
    SVLinks,
    ...SVComponents,
    ADSLinks,
    ADSModule,
    ...ADSComponents,
    CHBModule,
    CHBLinks,
    ...CHBComponents,
    ASSETModule,
    ASSETLinks,
    ...ASSETComponents,
    PGRAIModule,
    PGRAILinks,
    ...PGRAIComponents,
  });
  initFSMComponents();
  initPGRComponents();
  initSWACHComponents();
  initDSSComponents();
  initMCollectComponents();
  initHRMSComponents();
  initTLComponents();
  initGCComponents();
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
    swach: SWACHReducers(initData),
    hrms: HRMSReducers(initData),
    pt: PTReducers(initData),
    ws: WSReducers(initData),
    engagement: SurveyReducers(initData),
    tl: TLReducers(initData),
    ptr: PTRReducers(initData),
    ads: ADSReducers(initData),
    chb: CHBReducers(initData),
    gc: GCReducers(initData),
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
