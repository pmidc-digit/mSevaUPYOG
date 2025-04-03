export const newConfig = [
  {
    head: "Applicant Details",
    stepNumber: 1,
    body: [
      {
        type: "component",
        component: "PropertyDetailsForm",
        key: "PropertyDetailsForm",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "Property Details",
    stepNumber: 2,
    body: [
      {
        type: "component",
        // isMandatory: true,
        component: "PropertyDetailsFormUser",
        key: "PropertyDetailsFormUser",
        withoutLabel: true,
      },
    ],
  },
];
