import React from "react";

import {
  PGRModule,
  PGRLinks,
  initPGRComponents,
  PGRReducers,
} from "@upyog/digit-ui-module-pgr";
import { initFSMComponents } from "@upyog/digit-ui-module-fsm";
import { PTModule, PTLinks, PTComponents } from "@upyog/digit-ui-module-pt";
import {
  MCollectModule,
  MCollectLinks,
  initMCollectComponents,
} from "@upyog/digit-ui-module-mcollect";
import { initDSSComponents } from "@upyog/digit-ui-module-dss";
import {
  PaymentModule,
  PaymentLinks,
  paymentConfigs,
} from "@upyog/digit-ui-module-common";
import { DigitUI } from "@upyog/digit-ui-module-core";
import { initLibraries } from "@upyog/digit-ui-libraries";
import { HRMSModule, initHRMSComponents } from "@upyog/digit-ui-module-hrms";
import { TLModule, TLLinks, initTLComponents } from "@upyog/digit-ui-module-tl";
import {
  PTRModule,
  PTRLinks,
  PTRComponents,
} from "@upyog-niua/upyog-ui-module-ptr";
import {
  initReceiptsComponents,
  ReceiptsModule,
} from "@upyog/digit-ui-module-receipts";
import { initOBPSComponents } from "@upyog/digit-ui-module-obps";
import { initNOCComponents } from "@upyog/digit-ui-module-noc";
import { initEngagementComponents } from "@upyog/digit-ui-module-engagement";
import { initWSComponents } from "@upyog/digit-ui-module-ws";
import { initCustomisationComponents } from "./Customisations";
import { initCommonPTComponents } from "@upyog/digit-ui-module-commonpt";
import { initBillsComponents } from "@upyog/digit-ui-module-bills";
//import { BRModule ,initBRComponents ,BRLinks} from "@upyog-niua/upyog-ui-module-br";
import { initBRComponents } from "@upyog-niua/upyog-ui-module-br";
// import { initReportsComponents } from "@egovernments/digit-ui-module-reports";
import {
  BRModule,
  initBRComponents,
  BRLinks,
} from "@upyog-niua/upyog-ui-module-sample";

initLibraries();

const enabledModules = [
 "BR",
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
  "BR",
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
  HRMSModule,
  TLModule,
  TLLinks,
  ReceiptsModule,
  PTRModule,
  PTRLinks,
//  BRModule,
 // BRLinks,
  ...PTRComponents,
  BRModule,
  BRLinks,
  PGRModule,
  PGRLinks,
});
initBRComponents();
initPGRComponents();
initFSMComponents();
initDSSComponents();
initMCollectComponents();
initHRMSComponents();
initTLComponents();
initReceiptsComponents();
initOBPSComponents();
initNOCComponents();
initEngagementComponents();
initWSComponents();
initCommonPTComponents();
initBillsComponents();
// initReportsComponents();
initCustomisationComponents();
initBRComponents();
initCommonPTComponents();

const moduleReducers = (initData) => ({
  pgr: PGRReducers(initData),
});

function App() {
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
