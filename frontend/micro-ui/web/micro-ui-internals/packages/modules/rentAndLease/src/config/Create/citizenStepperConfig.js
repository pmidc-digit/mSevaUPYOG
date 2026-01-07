export const employeeConfig = [
  {
    head: "ES_TITILE_PROPERTY_DETAILS",
    stepNumber: 1,
    body: [
      {
        route: "property-details",
        component: "RentAndLeasePropertyDetails",
        withoutLabel: true,
        key: "propertyDetails",
        type: "component",
        isMandatory: true,
        hideInEmployee: true,
        nextStep: "documents",
      },
    ],
  },
  {
    head: "ES_TITILE_APPLICANT_DETAILS",
    stepNumber: 2,
    body: [
      {
        route: "applicant",
        component: "RentAndLeaseCitizenDetails",
        withoutLabel: true,
        key: "applicantDetails",
        type: "component",
        nextStep: "property-details",
        hideInEmployee: true,
        isMandatory: true,
      },
    ],
  },

  {
    head: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 3,
    body: [
      {
        route: "documents",
        component: "RentAndLeaseSelectProofIdentity",
        withoutLabel: true,
        key: "documents",
        type: "component",
        nextStep: null,
      },
    ],
  },

  {
    head: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 4,
    body: [
      {
        route: "summary",
        component: "RentAndLeaseSummary",
        withoutLabel: true,
        key: "summary",
        type: "component",
        nextStep: null,
      },
    ],
  },
];

export const citizenConfig = [
  {
    head: "ES_TITILE_PROPERTY_DETAILS",
    stepNumber: 1,
    body: [
      {
        route: "property-details",
        component: "RentAndLeasePropertyDetails",
        withoutLabel: true,
        key: "propertyDetails",
        type: "component",
        isMandatory: true,
        hideInEmployee: true,
        nextStep: "documents",
      },
    ],
  },
  {
    head: "ES_TITILE_APPLICANT_DETAILS",
    stepNumber: 2,
    body: [
      {
        route: "applicant",
        component: "RentAndLeaseCitizenDetails",
        withoutLabel: true,
        key: "applicantDetails",
        type: "component",
        nextStep: "property-details",
        hideInEmployee: true,
        isMandatory: true,
      },
    ],
  },

  {
    head: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 3,
    body: [
      {
        route: "documents",
        component: "RentAndLeaseSelectProofIdentity",
        withoutLabel: true,
        key: "documents",
        type: "component",
        nextStep: null,
      },
    ],
  },

  {
    head: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 4,
    body: [
      {
        route: "summary",
        component: "RentAndLeaseSummary",
        withoutLabel: true,
        key: "summary",
        type: "component",
        nextStep: null,
      },
    ],
  },
];
