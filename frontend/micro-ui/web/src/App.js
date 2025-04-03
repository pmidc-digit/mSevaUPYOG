import React from "react";
import { initPGRComponents, PGRReducers } from "@mseva/digit-ui-module-pgr";
import { initSWACHComponents } from "@mseva/digit-ui-module-swach";
import { initFSMComponents } from "@mseva/digit-ui-module-fsm";
import { PTModule, PTLinks, PTComponents } from "@mseva/digit-ui-module-pt";
import {
  MCollectModule,
  MCollectLinks,
  initMCollectComponents,
} from "@mseva/digit-ui-module-mcollect";
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
import { NDCReducers } from "@mseva/digit-ui-module-ndc";
import { TLModule, TLLinks, initTLComponents } from "@mseva/digit-ui-module-tl";
import { PTRModule, PTRLinks, PTRComponents } from "@mseva/digit-ui-module-ptr";
import {
  initReceiptsComponents,
  ReceiptsModule,
} from "@mseva/digit-ui-module-receipts";
import { initOBPSComponents } from "@mseva/digit-ui-module-obps";
import { initNOCComponents } from "@mseva/digit-ui-module-noc";
import {
  initEngagementComponents,
  SurveyReducers,
} from "@mseva/digit-ui-module-engagement";
import { initWSComponents, WSReducers } from "@mseva/digit-ui-module-ws";
import { initNDCComponents } from "@mseva/digit-ui-module-ndc";
import { initCustomisationComponents } from "./Customisations";
import { initCommonPTComponents } from "@mseva/digit-ui-module-commonpt";
import { initBillsComponents } from "@mseva/digit-ui-module-bills";
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
  "NDC",
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
  ...PTRComponents,
});
initPGRComponents();
initSWACHComponents();
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
initNDCComponents();
initCommonPTComponents();
initBillsComponents();
// initReportsComponents();
initCustomisationComponents();

const moduleReducers = (initData) => ({
  pgr: PGRReducers(initData),
  hrms: HRMSReducers(initData),
  ndc: NDCReducers(initData),
  ws: WSReducers(initData),
  engagement: SurveyReducers(initData),
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
