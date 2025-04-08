export const newConfig = [
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
          hideInCitizen: true,
        },
      ],
    },
    {
      head: "TL_NEW_TRADE_DETAILS_TRADE_UNIT_HEADER",
      stepNumber: 1,
      body: [
        {
          type: "component",
          component: "TLTradeUnitsEmployee",
          key: "tradeUnits",
          withoutLabel: true,
          hideInCitizen: true,
        }
      ]
    },
    {
      head: "TL_NEW_TRADE_DETAILS_HEADER_ACC",
      stepNumber: 1,
      body: [
        {
          type: "component",
          component: "TLAccessoriesEmployee",
          key: "accessories",
          withoutLabel: true,
          hideInCitizen: true,
        }
      ]
    },
    {
      head: "TL_NEW_TRADE_DETAILS_TRADE_VALIDITY_HEADER",
      stepNumber: 1,
      body: [
        {
          type: "component",
          component: "TLTradeVlidityEmployee",
          key: "validityYears",
          withoutLabel: true,
          hideInCitizen: true,
        }
      ]
    },
    {
      head: "TL_NEW_APPLICATION_PROPERTY",
      stepNumber: 1,
      body: [
        {
          component: "CPTPropertySearchNSummary",
          withoutLabel: true,
          key: "cpt",
          type: "component",
          hideInCitizen: true
        },
      ],
    },
    {
      head: "ES_NEW_APPLICATION_LOCATION_DETAILS",
      stepNumber: 1,
      body: [
          {
              route: "map",
              component: "TLSelectGeolocation",
              nextStep: "pincode",
              hideInEmployee: true,
              key: "address",
              withoutLabel: true,
              texts: {
                  header: "TL_GEOLOACTION_HEADER",
                  cardText: "TL_GEOLOCATION_TEXT",
                  nextText: "CS_COMMON_NEXT",
                  skipAndContinueText: "CORE_COMMON_SKIP_CONTINUE"
              }
          },
          {
              route: "pincode",
              isMandatory: true,
              component: "TLSelectPincode",
              texts: {
                  headerCaption: "TL_LOCATION_CAPTION",
                  header: "TL_PINCODE_HEADER",
                  cardText: "TL_PINCODE_TEXT",
                  submitBarLabel: "CS_COMMON_NEXT",
                  skipText: "CORE_COMMON_SKIP_CONTINUE"
              },
              withoutLabel: true,
              key: "address",
              nextStep: "address",
              type: "component"
          },
          {
              route: "address",
              component: "TLSelectAddress",
              withoutLabel: true,
              texts: {
                  headerCaption: "TL_LOCATION_CAPTION",
                  header: "TL_ADDRESS_HEADER",
                  cardText: "TL_ADDRESS_TEXT",
                  submitBarLabel: "CS_COMMON_NEXT"
              },
              key: "address",
              nextStep: "street",
              isMandatory: true,
              type: "component"
          },
          {
              type: "component",
              route: "street",
              component: "TLSelectStreet",
              key: "address",
              withoutLabel: true,
              hideInEmployee: true,
              texts: {
                  headerCaption: "TL_LOCATION_CAPTION",
                  header: "TL_ADDRESS_HEADER",
                  cardText: "TL_STREET_TEXT",
                  submitBarLabel: "CS_COMMON_NEXT"
              },
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
                      name: "doorNo",
                      disable: "window.location.href.includes(`edit-application`)||window.location.href.includes(`renew-trade`)",
                      // "validation": {
                      //     "maxlength": 256,
                      //     "title": "CORE_COMMON_DOOR_INVALID"
                      // }
                  }
              ],
              nextStep: "landmark"
          },
          {
              type: "component",
              component: "TLSelectStreet",
              key: "address",
              withoutLabel: true,
              hideInCitizen: true,
              texts: {
                  headerCaption: "TL_LOCATION_CAPTION",
                  header: "TL_ADDRESS_HEADER",
                  cardText: "TL_STREET_TEXT",
                  submitBarLabel: "CS_COMMON_NEXT"
              },
              inputs: [
                  {
                      label: "TL_NEW_TRADE_DETAILS_BLDG_NAME_LABEL",
                      type: "text",
                      name: "buildingNo",
                      // "validation": {
                      //     "maxlength": 256,
                      //     "title": "CORE_COMMON_DOOR_INVALID"
                      // }
                  },
                  {
                    label: "TL_NEW_TRADE_DETAILS_DOOR_NO_LABEL",
                    type: "text",
                    name: "doorNo",
                    // "validation": {
                    //     "maxlength": 256,
                    //     "title": "CORE_COMMON_DOOR_INVALID"
                    // }
                },
                  {
                      label: "TL_LOCALIZATION_STREET_NAME",
                      type: "text",
                      name: "street",
                      // "validation": {
                      //     "maxlength": 256,
                      //     "title": "CORE_COMMON_STREET_INVALID"
                      // }
                  },
                  {
                    label: "TL_NEW_TRADE_DETAILS_ELEC_CON_NO_LABEL",
                    type: "text",
                    name: "electricityNo",
                    // "validation": {
                    //     "maxlength": 256,
                    //     "title": "CORE_COMMON_STREET_INVALID"
                    // }
                }
              ]
          },
          {
              type: "component",
              route: "landmark",
              component: "TLSelectLandmark",
              withoutLabel: true,
              texts: {
                  headerCaption: "TL_LOCATION_CAPTION",
                  header: "CS_FILE_APPLICATION_PROPERTY_LOCATION_PROVIDE_LANDMARK_TITLE",
                  cardText: "TL_LANDMARK_TEXT",
                  submitBarLabel: "CS_COMMON_NEXT",
                  skipText: "CORE_COMMON_SKIP_CONTINUE"
              },
              key: "address",
              nextStep: "owner-ship-details",
              hideInEmployee: true
          },
      ]
    },
    {
      head: "ES_NEW_APPLICATION_OWNERSHIP_DETAILS",
      stepNumber: 2,
      body: [
        {
          //if want to input index in url just pul @0 after route name owner-ship-details@0
          type: "component",
          route: "owner-ship-details",
          isMandatory: true,
          component: "SelectOwnerShipDetails",
          texts: {
            headerCaption: "TL_TRADE_OWNERSHIP_CAPTION",
            header: "TL_PROVIDE_OWNERSHIP_DETAILS",
            cardText: "TL_PROVIDE_OWNERSHI_DETAILS_SUB_TEXT",
            submitBarLabel: "CS_COMMON_NEXT",
          },
          key: "ownershipCategory",
          withoutLabel: true,
          nextStep: "owner-details",
        },
        {
          type: "component",
          route: "owner-address",
          isMandatory: true,
          component: "TLSelectOwnerAddress",
          texts: {
            headerCaption: "TL_OWNERS_DETAILS",
            header: "TL_OWNERS_ADDRESS",
            cardText: "",
            submitBarLabel: "CS_COMMON_NEXT",
          },
          key: "owners",
          withoutLabel: true,
          nextStep: "proof-of-identity",
          hideInEmployee: true,
        },
        {
          type: "component",
          component: "TLOwnerDetailsEmployee",
          key: "owners",
          withoutLabel: true,
          hideInCitizen: true,
        },
      //   {
      //   type: "component",
      //   route: "proof-of-identity",
      //   isMandatory: true,
      //   component: "SelectProofIdentity",
      //   texts: {
      //     headerCaption: "TL_OWNERS_DETAILS",
      //     header: "TL_PROOF_IDENTITY_HEADER",
      //     cardText: "",
      //     submitBarLabel: "CS_COMMON_NEXT",
      //     addMultipleText: "PT_COMMON_ADD_APPLICANT_LABEL",
      //   },
      //   key: "owners",
      //   withoutLabel: true,
      //   nextStep: "ownership-proof",
      //   hideInEmployee: true,
      // },
      // {
      //   type: "component",
      //   route: "ownership-proof",
      //   isMandatory: true,
      //   component: "SelectOwnershipProof",
      //   texts: {
      //     headerCaption: "TL_OWNERS_DETAILS",
      //     header: "TL_OWNERSHIP_DOCUMENT",
      //     cardText: "",
      //     submitBarLabel: "CS_COMMON_NEXT",
      //   },
      //   key: "owners",
      //   withoutLabel: true,
      //   nextStep: null,
      //   hideInEmployee: true,
      // },
      // {
      //   type: "component",
      //   component: "TLOwnerDetailsEmployee",
      //   key: "owners",
      //   withoutLabel: true,
      //   hideInCitizen: true,
      // },
      ],
    },
    {
      head: "TL_COMMON_DOCS",
      stepNumber: 3,
      body: [
        {
          component: "TLDocumentsEmployee",
          withoutLabel: true,
          key: "documents",
          type: "component",
          hideInCitizen: true
        },
      ],
    },
    {
      "head": "Summary",
      stepNumber: 4,
      "body": [
          {
              "component": "TLSummaryPage",
              "withoutLabel": true,
              "key": "SummaryTL",
              "type": "component"
          }
      ]
  }
  ];