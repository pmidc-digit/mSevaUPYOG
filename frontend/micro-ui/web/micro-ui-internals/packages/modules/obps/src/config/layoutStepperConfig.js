export const layoutStepperConfig = [
  {
    head: "BPA_APPLICATION_REGISTRATION",
    stepNumber: 1,
    body: [
      {
        component: "LayoutApplicantDetails",
        withoutLabel: true,
        key: "applicantDetails",
        type: "component",
      },
      {
        component: "LayoutProfessionalDetails",
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
        component: "LayoutLocalityInfo",
        withoutLabel: true,
        key: "siteDetails",
        type: "component",
      },
      {
        component: "LayoutSiteDetails",
        withoutLabel: true,
        key: "siteDetails",
        type: "component",
      },
      {
        component: "LayoutSpecificationDetails",
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
        component: "LayoutDocumentsRequired",
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
        component: "LayoutSummary",
        withoutLabel: true,
        key: "summary",
        type: "component",
      },
    ],
  },
];
