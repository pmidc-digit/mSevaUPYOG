export const stepperConfig = [
  {
    head: "NOC_NOC_DETAILS_HEADER",
    stepNumber: 1,
    body: [],
  },
  {
    head: "ES_SITE_DETAILS",
    stepNumber: 2,
    body: [
      {
        component: "FireNOCPropertyLocationDetails",
        withoutLabel: true,
        key: "siteDetails",
        type: "component",
      },
      {
        component: "FireNOCPropertyDetails",
        withoutLabel: true,
        key: "siteDetails",
        type: "component",
      },
    ],
  },
  {
    head: "NOC_APPLICATION_REGISTRATION",
    stepNumber: 3,
    body: [
      {
        component: "FireNOCApplicantDetails",
        withoutLabel: true,
        key: "applicantDetails",
        type: "component",
      },
    ],
  },
  {
    head: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 4,
    body: [
      {
        component: "FireNOCDocuments",
        withoutLabel: true,
        key: "documents",
        type: "component",
      },
    ],
  },
  {
    head: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 5,
    body: [
      {
        component: "NOCSummary",
        withoutLabel: true,
        key: "summary",
        type: "component",
      },
    ],
  },
];
