export const citizenConfig = [
  {
    head: "ES_TITILE_OWNER_DETAILS",
    stepNumber: 1,
    body: [
      {
        route: "owners",
        component: "ADSCitizenDetailsNew",
        withoutLabel: true,
        key: "ownerss",
        type: "component",
        nextStep: "pet-details",
        hideInEmployee: true,
        isMandatory: true,
      },
    ],
  },
  {
    head: "ES_TITILE_PET_DETAILS",
    stepNumber: 2,
    body: [
      {
        route: "pet-details",
        component: "ADSCitizenSecond",
        withoutLabel: true,
        key: "pets",
        type: "component",
        isMandatory: true,
        hideInEmployee: true,
        nextStep: "documents",
      },
    ],
  },
  {
    head: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 3,
    body: [
      {
        route: "documents",
        component: "ADSSelectProofIdentity",
        withoutLabel: true,
        key: "documents",
        type: "component",
        nextStep: null,
      },
    ],
  },
  {
    head: "ES_TITILE_AUMMARY_DETAILS",
    stepNumber: 4,
    body: [
      {
        route: "summary",
        component: "ADSSummary",
        withoutLabel: true,
        key: "summary",
        type: "component",
        nextStep: null,
      },
    ],
  },
];
