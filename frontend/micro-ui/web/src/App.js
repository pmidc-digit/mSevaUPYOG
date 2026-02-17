import React,{useEffect} from "react";
import { initPGRComponents, PGRReducers } from "@mseva/digit-ui-module-pgr";
import {
  initSWACHComponents,
  SWACHReducers,
} from "@mseva/digit-ui-module-swach";
import { initFSMComponents } from "@mseva/digit-ui-module-fsm";
import {
  PTModule,
  PTLinks,
  PTComponents,
  PTReducers,
} from "@mseva/digit-ui-module-pt";
import {
  MCollectModule,
  MCollectLinks,
  initMCollectComponents,
} from "@mseva/digit-ui-module-mcollect";
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
import {
  RentAndLeaseModule,
  RentAndLeaseLinks,
  initRentAndLeaseComponents,
  RentAndLeaseReducers,
} from "@mseva/digit-ui-module-rentandlease";
import { initDSSComponents } from "@mseva/digit-ui-module-dss";
import {
  PaymentModule,
  PaymentLinks,
  paymentConfigs,
} from "@mseva/digit-ui-module-common";
import { DigitUI } from "@mseva/digit-ui-module-core";
import { initLibraries } from "@mseva/digit-ui-libraries";
import {
  HRMSModule,
  initHRMSComponents,
  HRMSReducers,
} from "@mseva/digit-ui-module-hrms";
import {
  TLModule,
  TLReducers,
  TLLinks,
  initTLComponents,
} from "@mseva/digit-ui-module-tl";

import {
  PTRModule,
  PTRLinks,
  PTRComponents,
  PTRReducers,
} from "@mseva/digit-ui-module-ptr";

import {
  initReceiptsComponents,
  ReceiptsModule,
} from "@mseva/digit-ui-module-receipts";
import { initOBPSComponents, OBPSReducers } from "@mseva/digit-ui-module-obps";
import { initNOCComponents, NOCReducers } from "@mseva/digit-ui-module-noc";
import {
  initEngagementComponents,
  SurveyReducers,
} from "@mseva/digit-ui-module-engagement";
import { initWSComponents, WSReducers } from "@mseva/digit-ui-module-ws";
import { initCustomisationComponents } from "./Customisations";
import {
  initCommonPTComponents,
  CommonPTModule,
} from "@mseva/digit-ui-module-commonpt";
import { initBillsComponents } from "@mseva/digit-ui-module-bills";
import { SVComponents, SVLinks, SVModule } from "@mseva/digit-ui-module-sv";
import { initNDCComponents, NDCReducers } from "@mseva/digit-ui-module-ndc";
import {
  ADSModule,
  ADSLinks,
  ADSComponents,
  ADSReducers,
} from "@mseva/upyog-ui-module-ads";
import {
  CHBModule,
  CHBLinks,
  CHBComponents,
  CHBReducers,
} from "@mseva/upyog-ui-module-chb";
import {
  ASSETComponents,
  ASSETLinks,
  ASSETModule,
} from "@mseva/upyog-ui-module-asset";
import {
  PGRAIComponents,
  PGRAILinks,
  PGRAIModule,
} from "@mseva/upyog-ui-module-pgrai";

// import { initReportsComponents } from "@egovernments/digit-ui-module-reports";

initLibraries();

const enabledModules = [
  "PGR",
  "FSM",
  "Payment",
  "PT",
  "QuickPayLinks",
  "DSS",
  "NDSS",
  "MCollect",
  "HRMS",
  "TL",
  "Receipts",
  "OBPS",
  "NOC",
  "Engagement",
  "CommonPT",
  "WS",
  "Reports",
  "Bills",
  "SW",
  "BillAmendment",
  "FireNoc",
  "Birth",
  "Death",
  "Swach",
  "SV",
  "ADS",
  "CHB",
  "PTR",
  "ASSET",
  "PGRAI",
  "ChallanGeneration",
  "RentAndLease",
  "NDC",
  "BPAStakeholder",
  "CLU",
  "Layout",
  "GarbageCollection",
];
window.Digit.ComponentRegistryService.setupRegistry({
  ...paymentConfigs,
  PTModule,
  PTLinks,
  PaymentModule,
  PaymentLinks,
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
  TLModule,
  TLLinks,
  ReceiptsModule,
  PTRModule,
  PTRLinks,
  CommonPTModule,
  ...PTRComponents,
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
initPGRComponents();
initSWACHComponents();
initFSMComponents();
initDSSComponents();
initMCollectComponents();
initChallanGenerationComponents();
initGarbageCollectionComponents();
initRentAndLeaseComponents();
initHRMSComponents();
initTLComponents();
initReceiptsComponents();
initOBPSComponents();
initNOCComponents();
initEngagementComponents();
initWSComponents();
initCommonPTComponents();
initBillsComponents();
initNDCComponents();
// initReportsComponents();
initCustomisationComponents();

const moduleReducers = (initData) => ({
  pgr: PGRReducers(initData),
  pt: PTReducers(initData),
  hrms: HRMSReducers(initData),
  ws: WSReducers(initData),
  engagement: SurveyReducers(initData),
  tl: TLReducers(initData),
  swach: SWACHReducers(initData),
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


function App() {


   useEffect(() => {
    loadBhashiniSafely();
  }, []);

  const stateCode =
    window.globalConfigs?.getConfig("STATE_LEVEL_TENANT_ID") ||
    process.env.REACT_APP_STATE_LEVEL_TENANT_ID;
  if (!stateCode) {
    return <h1>stateCode is not defined</h1>;
  }
  return (
    <DigitUI
      stateCode={stateCode}
      enabledModules={enabledModules}
      moduleReducers={moduleReducers}
    />
  );
}

export default App;
