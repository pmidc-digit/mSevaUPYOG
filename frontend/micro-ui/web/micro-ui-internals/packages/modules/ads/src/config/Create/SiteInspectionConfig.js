export const SiteInspectionConfig = [
  {
    head: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 1,
    body: [
      {
        route: "documents",
        component: "ADSSiteInspection",
        withoutLabel: true,
        key: "documents",
        type: "component",
        nextStep: "null",
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
];
