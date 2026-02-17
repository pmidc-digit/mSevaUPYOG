import React from "react";
import ReactDOM from "react-dom";

import { initLibraries } from "@mseva/digit-ui-libraries";
import { PGRReducers } from "@mseva/digit-ui-module-pgr";
import { SWACHReducers } from "@mseva/digit-ui-module-swach";
import { HRMSReducers } from "@mseva/digit-ui-module-hrms";
import { HRMSModule, initHRMSComponents } from "@mseva/digit-ui-module-hrms";

import { PTModule, PTLinks, PTComponents, PTReducers } from "@mseva/digit-ui-module-pt";
import { MCollectModule, MCollectLinks } from "@mseva/digit-ui-module-mcollect";
import {
  ChallanGenerationModule,
  ChallanGenerationLinks,
  initChallanGenerationComponents,
  ChallanReducers,
} from "@mseva/digit-ui-module-challangeneration";
import {
  GarbageCollectionModule,
  GarbageCollectionLinks,
  initGarbageCollectionComponents,
  GarbageReducers,
} from "@mseva/digit-ui-module-garbagecollection";
import { RentAndLeaseModule, RentAndLeaseLinks,RentAndLeaseReducers } from "@mseva/digit-ui-module-rentandlease";
import { TLModule, TLLinks, initTLComponents, TLReducers } from "@mseva/digit-ui-module-tl";
import { initFSMComponents } from "@mseva/digit-ui-module-fsm";
import { initPGRComponents } from "@mseva/digit-ui-module-pgr";
import { initSWACHComponents } from "@mseva/digit-ui-module-swach";
import { initDSSComponents } from "@mseva/digit-ui-module-dss";
import { initReceiptsComponents, ReceiptsModule } from "@mseva/digit-ui-module-receipts";
// import { initReportsComponents } from "@mseva/digit-ui-module-reports";
import { initMCollectComponents } from "@mseva/digit-ui-module-mcollect";
import { initRentAndLeaseComponents } from "@mseva/digit-ui-module-rentandlease";
import { PaymentModule, PaymentLinks, paymentConfigs } from "@mseva/digit-ui-module-common";
import { initOBPSComponents, OBPSReducers } from "@mseva/digit-ui-module-obps";
import { initEngagementComponents, SurveyReducers } from "@mseva/digit-ui-module-engagement";
import { initNOCComponents, NOCReducers, NOCLinks, NOCModule } from "@mseva/digit-ui-module-noc";
import { initWSComponents, WSReducers } from "@mseva/digit-ui-module-ws";
import { DigitUI } from "@mseva/digit-ui-module-core";
import { initCommonPTComponents, CommonPTModule } from "@mseva/digit-ui-module-commonpt";
import { initBillsComponents, BillsModule } from "@mseva/digit-ui-module-bills";
import { PTRModule, PTRLinks, PTRComponents, PTRReducers } from "@mseva/digit-ui-module-ptr";
import { SVComponents, SVLinks, SVModule } from "@mseva/digit-ui-module-sv";
import { initNDCComponents, NDCReducers } from "@mseva/digit-ui-module-ndc";
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
  "NDC",
  "CHB",
  "ASSET",
  "PGRAI",
  "ChallanGeneration",
  "RentAndLease",
  "BPAStakeholder",
  "Layout",
  "GarbageCollection",
  "CLU",
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
const loadBhashiniSafely = () => {
  if (window.__BHASHINI_LOADED__) return;
  window.__BHASHINI_LOADED__ = true;

  // 1️⃣ Patch getElementById defensively
  const originalGetElementById = document.getElementById.bind(document);

  document.getElementById = function (id) {
    const el = originalGetElementById(id);
    if (el) return el;

    // Create a safe fallback node
    const fallback = document.createElement("div");
    fallback.id = id;
    fallback.style.display = "none";
    document.body.appendChild(fallback);
    return fallback;
  };

  // 2️⃣ Load script AFTER window load
  window.addEventListener("load", () => {
    if (document.getElementById("bhashini-script")) return;

    const script = document.createElement("script");
    script.id = "bhashini-script";
    script.src =
      "https://translation-plugin.bhashini.co.in/v3/website_translation_utility.js";
    script.async = true;

    document.body.appendChild(script);
  });
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
    ChallanGenerationModule,
    ChallanGenerationLinks,
    GarbageCollectionModule,
    GarbageCollectionLinks,
    RentAndLeaseModule,
    RentAndLeaseLinks,
    HRMSModule,
    ReceiptsModule,
    BillsModule,
    PTRModule,
    PTRLinks,
    CommonPTModule,
    ...PTRComponents,
    TLModule,
    TLLinks,
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
    NOCModule,
    NOCLinks,
  });
  initFSMComponents();
  initPGRComponents();
  initSWACHComponents();
  initDSSComponents();
  initMCollectComponents();
  initChallanGenerationComponents();
  initGarbageCollectionComponents();
  initRentAndLeaseComponents();
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
  initNDCComponents();
  // initCustomisationComponents();

  const moduleReducers = (initData) => ({
    pgr: PGRReducers(initData),
    swach: SWACHReducers(initData),
    hrms: HRMSReducers(initData),
    pt: PTReducers(initData),
    ws: WSReducers(initData),
    engagement: SurveyReducers(initData),
    tl: TLReducers(initData),
    ndc: NDCReducers(initData),
    ptr: PTRReducers(initData),
    ads: ADSReducers(initData),
    chb: CHBReducers(initData),
    noc: NOCReducers(initData),
    obps: OBPSReducers(initData),
    challan: ChallanReducers(initData),
    rentAndLease: RentAndLeaseReducers(initData),
    gc: GarbageReducers(initData),
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
    loadBhashiniSafely();
};

initLibraries().then(() => {
  initDigitUI();
});
