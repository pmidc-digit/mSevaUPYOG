export const config = [
  {
    head: "TL_COMMON_TR_DETAILS",
    stepNumber: 1,
    body: [
      {
        name: "TL_COMMON_TR_DETAILS",
        type: "component",
        component: "TLTradeDetailsEmployee",
        key: "tradedetils",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "TL_NEW_TRADE_DETAILS_TRADE_UNIT_HEADER",
    stepNumber: 1,
    body: [
      { 
        name:"",
        type: "component",
        component: "TLTradeUnitsEmployee",
        key: "tradeUnits",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "TL_NEW_TRADE_DETAILS_HEADER_ACC",
    stepNumber: 1,
    body: [
      {
        name:"",
        type: "component",
        component: "TLAccessoriesEmployee",
        key: "accessories",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "TL_NEW_TRADE_DETAILS_TRADE_VALIDITY_HEADER",
    stepNumber: 1,
    body: [
      {
        name:"",
        type: "component",
        component: "TLTradeVlidityEmployee",
        key: "validityYears",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "TL_NEW_APPLICATION_PROPERTY",
    stepNumber: 1,
    body: [
      {
        name:"",
        type: "component",
        component: "CPTPropertySearchNSummary",
        key: "cpt",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "ES_NEW_APPLICATION_LOCATION_DETAILS",
    stepNumber: 1,
    body: [
      {
        name:"",
        type: "component",
        component: "TLSelectPincode",
        key: "address",
        withoutLabel: true,
      },
      {
        name:"",
        type: "component",
        component: "TLSelectAddress",
        key: "address",
        withoutLabel: true,       
      },
      {
        name:"",
        type: "component",
        component: "TLSelectStreet",
        key: "address",
        withoutLabel: true,
        inputs: [
          {
            label: "TL_LOCALIZATION_STREET_NAME",
            type: "text",
            name: "street",
            disable: "window.location.href.includes(`edit-application`)||window.location.href.includes(`renew-trade`)",
            // "validation": {
            //     "maxlength": 256,
            //     "title": "CORE_COMMON_STREET_INVALID"
            // }
          },
          {
            label: "TL_NEW_TRADE_DETAILS_BLDG_NAME_LABEL",
            type: "text",
            name: "buildingName",
            disable: "window.location.href.includes(`edit-application`)||window.location.href.includes(`renew-trade`)",
            // "validation": {
            //     "maxlength": 256,
            //     "title": "CORE_COMMON_DOOR_INVALID"
            // }
          },
          {
            label: "TL_NEW_TRADE_DETAILS_DOOR_NO_LABEL",
            type: "text",
            name: "doorNo",
            //disable: false,
            // "validation": {
            //     "maxlength": 256,
            //     "title": "CORE_COMMON_DOOR_INVALID"
            // }
          },
          {
            label: "TL_NEW_TRADE_DETAILS_ELEC_CON_NO_LABEL",
            type: "text",
            name: "electricityNo",
            //disable:false,
            // "validation": {
            //     "maxlength": 256,
            //     "title": "CORE_COMMON_STREET_INVALID"
            // }
          },
        ],
      },
      {
        name:"",
        type: "component",
        component: "TLSelectLandmark",
        key: "address",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "ES_NEW_APPLICATION_OWNERSHIP_DETAILS",
    stepNumber: 2,
    body: [
      {
        name:"",
        type: "component",
        component: "SelectOwnerShipDetails",
        key: "ownershipCategory",
        withoutLabel: true,
      },
      {
        name:"",
        type: "component",
        component: "TLSelectOwnerAddress",
        key: "owners",
        withoutLabel: true,
      },
      {
        name:"",
        type: "component",
        component: "TLOwnerDetailsEmployee",
        key: "owners",
        withoutLabel: true,
      }
    ],
  },
  {
    head: "TL_COMMON_DOCS",
    stepNumber: 3,
    body: [
      {
        name:"",
        type: "component",
        component: "TLDocumentsEmployee",
        key: "documents",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "Summary",
    stepNumber: 4,
    body: [
      {
        name:"",
        type: "component",
        component: "TLSummaryPage",
        key: "SummaryTL",
        withoutLabel: true,
      },
    ],
  },
];
