/*
 * citizenConfig outlines the routing,
 * detailing steps for applicant, address, and document details, along with their configurations.
 */

export const citizenConfig = [
  {
    head: "ES_TITILE_APPLICANT_DETAILS",
    body: [
      {
        route: "searchads",
        component: "ADSSearch",
        nextStep: "info",
        key: "adslist",
        type: "component",
      },
      {
        route: "info",
        component: "ADSRequiredDoc",
        nextStep: "applicant-details",
        key: "Documents",
        type: "component",
      },
      {
        route: "applicant-details",
        component: "ADSCitizenDetails",
        withoutLabel: true,
        key: "applicant",
        type: "component",
        nextStep: "address-details",
        hideInEmployee: true,
        isMandatory: true,
        texts: {
          header:"APPLICANT_PERSONAL_DETAILS",
          submitBarLabel: "ADS_COMMON_NEXT",
        },
      },
      {
        route: "address-details",
        component: "ADSAddress",
        withoutLabel: true,
        key: "address",
        type: "component",
        nextStep: "document-details",
        hideInEmployee: true,
        isMandatory: true,
        texts: {
          header:"APPLICANT_ADDRESS_DETAILS",
          submitBarLabel: "ADS_COMMON_NEXT",
        },
      },
      {
        "route": "document-details",
        "component": "ADSDocumentDetails",
        "withoutLabel": true,
        "key": "documents",
        "type": "component",
        "nextStep":null,
        "texts": {
            "submitBarLabel": "ADS_COMMON_NEXT",
        },
    }
      
    ],
  },
];
