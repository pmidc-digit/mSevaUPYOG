export const citizenConfig = [
  {
    head: "ES_TITILE_PET_DETAILS",
    stepNumber: 1,
    body: [
      {
        route: "owners",
        component: "CHBCitizenDetailsNew",
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
    head: "ES_TITILE_OWNER_DETAILS",
    stepNumber: 2,
    body: [
      {
        route: "pet-details",
        component: "CHBCitizenSecond",
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
    head: "",
    stepNumber: 3,
    body: [
      {
        route: "documents",
        component: "ChallanDocuments",
        withoutLabel: true,
        key: "documents",
        type: "component",
        nextStep: null,
      },
    ],
  },
  {
    head: "",
    stepNumber: 4,
    body: [
      {
        route: "summary",
        component: "ChallanSummary",
        withoutLabel: true,
        key: "summary",
        type: "component",
        nextStep: null,
      },
    ],
  },
];
