export const stepperConfig = [
  {
    head: "NOC_APPLICATION_REGISTRATION",
    stepNumber: 1,
    body: [
      {
        component: "NOCApplicantDetails",
        withoutLabel: true,
        key: "applicantDetails",
        type: "component",
      },
      {
        component: "NOCProfessionalDetails",
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
        component: "NOCSiteDetails",
        withoutLabel: true,
        key: "siteDetails",
        type: "component",
      },
      {
        component: "NOCSpecificationDetails",
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
        component: "NOCDocumentsRequired",
        // component: "NOCDocumentWithLatLong",
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
        component: "NOCSummary",
        withoutLabel: true,
        key: "summary",
        type: "component",
      },
    ],
  },
];
