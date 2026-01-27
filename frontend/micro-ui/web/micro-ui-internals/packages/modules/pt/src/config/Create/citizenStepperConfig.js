export const citizenConfig = [
  {
    head: "",
    stepNumber: 1,
    body: [
      {
        route: "documents",
        component: "PTRCitizenPetTest",
        withoutLabel: true,
        key: "documents",
        type: "component",
        nextStep: null,
      },
    ],
  },
  {
    head: "PT_DETAILS",
    stepNumber: 2,
    body: [
      {
        route: "pet-details",
        component: "PTRCitizenPet",
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
    head: "ES_TITILE_OWNER_DETAILS",
    stepNumber: 3,
    body: [
      {
        route: "pet-details",
        component: "PTRCitizenPet",
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
    stepNumber: 4,
    body: [
      {
        route: "documents",
        component: "PropertySelectDocs",
        withoutLabel: true,
        key: "documents",
        type: "component",
        nextStep: null,
      },
    ],
  },
  {
    head: "ES_TITILE_AUMMARY_DETAILS",
    stepNumber: 5,
    body: [
      {
        route: "summary",
        component: "PTSummary",
        withoutLabel: true,
        key: "summary",
        type: "component",
        nextStep: null,
      },
    ],
  },
];
