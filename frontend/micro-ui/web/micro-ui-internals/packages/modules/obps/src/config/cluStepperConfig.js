export const cluStepperConfig = [
  {
    head: "BPA_APPLICATION_REGISTRATION",
    stepNumber: 1,
    body: [
      {
        component: "CLUApplicantDetails",
        withoutLabel: true,
        key: "applicationDetails",
        type: "component",
      },
      {
        component: "CLUProfessionalDetails",
        withoutLabel: true,
        key: "professionalDetails",
        type: "component",
      },
    ],
  },
  {
    head: "ES_SITE_DETAILS",
    stepNumber: 2,
    body: [
      {
        component: "CLULocalityInfo",
        withoutLabel: true,
        key: "siteDetails",
        type: "component",
      },
      {
        component: "CLUSiteDetails",
        withoutLabel: true,
        key: "siteDetails",
        type: "component",
      },
      {
        component: "CLUSpecificationDetails",
        withoutLabel: true,
        key: "siteDetails",
        type: "component",
      },
    ],
  },
  {
    head: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 3,
    body: [
      {
        component: "CLUDocumentsRequired",
        withoutLabel: true,
        key: "documents",
        type: "component",
      },
    ],
  },
  {
    head: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 4,
    body: [
      {
        component: "CLUSummary",
        withoutLabel: true,
        key: "summary",
        type: "component",
      },
    ],
  },
];
