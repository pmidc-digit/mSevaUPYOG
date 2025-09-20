export const employeeConfig = [
  {
    head: "ES_TITILE_PET_DETAILS",
    stepNumber: 1,
    body: [
      {
        route: "pet-details",
        component: "ADSCitizenSecond",
        withoutLabel: true,
        key: "pets",
        type: "component",
        isMandatory: true,
        hideInCitizen: true,
        nextStep: "documents",
      },
    ],
  },
  {
    head: "ES_APPLICANT_DETAILA",
    stepNumber: 2,
    body: [
      {
        route: "owners",
        component: "ADSCitizenDetailsNew",
        withoutLabel: true,
        key: "ownerss",
        type: "component",
        nextStep: "pet-details",
        hideInCitizen: true,
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
        component: "ADSSelectProofIdentity",
        withoutLabel: true,
        key: "documents",
        type: "component",
        nextStep: "penalty",
      },
    ],
  },
  // {
  //   // head: "ES_TITILE_PENALTY_DETAILS",
  //   head: "Penalty Details",
  //   stepNumber: 4,
  //   body: [
  //     {
  //       route: "penalty",
  //       component: "ADSPenalty",
  //       withoutLabel: true,
  //       key: "penalty",
  //       hideInCitizen: true,
  //       type: "component",
  //       nextStep: "summary",
  //     },
  //   ],
  // },
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
