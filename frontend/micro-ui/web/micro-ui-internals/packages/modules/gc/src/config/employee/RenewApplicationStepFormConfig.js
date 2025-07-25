export const config = [
  {
    head: "GC_COMMON_TR_DETAILS",
    stepNumber: 1,
    body: [
      {
        name: "Garbage Collection Detal",
        type: "component",
        component: "GCTradeDetailsEmployee",
        key: "tradedetils",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "GC_NEW_TRADE_DETAILS_TRADE_UNIT_HEADER",
    stepNumber: 1,
    body: [
      {
        name: "",
        type: "component",
        component: "GCTradeUnitsEmployee",
        key: "tradeUnits",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "GC_NEW_TRADE_DETAILS_HEADER_ACC",
    stepNumber: 1,
    body: [
      {
        name: "",
        type: "component",
        component: "GCAccessoriesEmployee",
        key: "accessories",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "GC_NEW_TRADE_DETAILS_TRADE_VALIDITY_HEADER",
    stepNumber: 1,
    body: [
      {
        name: "",
        type: "component",
        component: "GCTradeVlidityEmployee",
        key: "validityYears",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "GC_NEW_APPLICATION_PROPERTY",
    stepNumber: 1,
    body: [
      {
        name: "",
        type: "component",
        component: "GCPropertySearchSummary",
        key: "cpt",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "GC_NEW_TRADE_DETAILS_HEADER_TRADE_LOC_DETAILS",
    stepNumber: 1,
    body: [
      {
        name: "",
        type: "component",
        component: "GCSelectAddress",
        key: "address",
        withoutLabel: true,
      },
      {
        name: "",
        type: "component",
        component: "GCSelectStreet",
        key: "address",
        withoutLabel: true,
        inputs: [
          {
            label: "GC_LOCALIZATION_STREET_NAME",
            type: "text",
            name: "street",
            // disable: "window.location.href.includes(`edit-application`)||window.location.href.includes(`renew-trade`)",
            disable: "window.location.href.includes(`edit-application`)",
            placeholder: "GC_NEW_TRADE_DETAILS_SRT_NAME_PLACEHOLDER",
            // "validation": {
            //     "maxlength": 256,
            //     "title": "CORE_COMMON_STREET_INVALID"
            // }
          },
          {
            label: "GC_NEW_TRADE_DETAILS_BLDG_NAME_LABEL",
            type: "text",
            name: "buildingName",
            //disable: "window.location.href.includes(`edit-application`)||window.location.href.includes(`renew-trade`)",
            disable: "window.location.href.includes(`edit-application`)",
            placeholder: "GC_NEW_TRADE_DETAILS_BLDG_NAME_PLACEHOLDER",
            // "validation": {
            //     "maxlength": 256,
            //     "title": "CORE_COMMON_DOOR_INVALID"
            // }
          },
          {
            label: "GC_NEW_TRADE_DETAILS_DOOR_NO_LABEL",
            type: "text",
            name: "doorNo",
            placeholder: "GC_NEW_TRADE_DETAILS_DOOR_NO_PLACEHOLDER",
            //disable: false,
            // "validation": {
            //     "maxlength": 256,
            //     "title": "CORE_COMMON_DOOR_INVALID"
            // }
          },
          {
            label: "GC_NEW_TRADE_DETAILS_ELEC_CON_NO_LABEL",
            type: "text",
            name: "electricityNo",
            placeholder: "GC_NEW_TRADE_DETAILS_ELEC_CON_NO_PLACEHOLDER",
            //disable:false,
            // "validation": {
            //     "maxlength": 256,
            //     "title": "CORE_COMMON_STREET_INVALID"
            // }
          },
        ],
      },
      {
        name: "",
        type: "component",
        component: "GCSelectPincode",
        key: "address",
        withoutLabel: true,
      },
      {
        name: "",
        type: "component",
        component: "GCSelectGeolocation",
        key: "address",
        withoutLabel: true,
      },
      // {
      //   name: "",
      //   type: "component",
      //   component: "GCSelectLandmark",
      //   key: "address",
      //   withoutLabel: true,
      // },
    ],
  },
  {
    head: "ES_NEW_APPLICATION_OWNERSHIP_DETAILS",
    stepNumber: 2,
    body: [
      {
        name: "",
        type: "component",
        component: "SelectOwnerShipDetails",
        key: "ownershipCategory",
        withoutLabel: true,
      },
      {
        name: "",
        type: "component",
        component: "GCSelectOwnerAddress",
        key: "owners",
        withoutLabel: true,
      },
      {
        name: "",
        type: "component",
        component: "GCOwnerDetailsEmployee",
        key: "owners",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "GC_COMMON_DOCS",
    stepNumber: 3,
    body: [
      {
        name: "",
        type: "component",
        component: "GCDocumentsEmployee",
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
        name: "",
        type: "component",
        component: "GCSummaryPage",
        key: "SummaryGC",
        withoutLabel: true,
      },
    ],
  },
];
