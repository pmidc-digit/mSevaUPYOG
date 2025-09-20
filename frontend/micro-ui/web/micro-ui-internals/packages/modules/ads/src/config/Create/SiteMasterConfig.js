export const SiteMasterConfig = [
  {
    head: "ES_TITILE_PET_DETAILS",
    stepNumber: 1,
    body: [
      {
        route: "pet-details",
        component: "ADSSiteMaster",
        withoutLabel: true,
        key: "pets",
        type: "component",
        isMandatory: true,
        hideInCitizen: true,
        nextStep: "null",
      },
    ],
  },
];
