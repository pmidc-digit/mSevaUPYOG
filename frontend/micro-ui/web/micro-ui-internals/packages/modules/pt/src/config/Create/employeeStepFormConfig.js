export const config = [
  {
    head: "Personal Details",
    stepNumber: 1,
    body: [
      {
        type: "component",
        component: "PTSelectPincode",
        key: "address",
        withoutLabel: true,
      },
      {
        type: "component",
        component: "PTSelectAddress",
        key: "address",
        withoutLabel: true,
        isMandatory: { city: true, locality: true },
      },
      {
        type: "component",
        component: "PTSelectStreet",
        key: "address",
        withoutLabel: true,
      },
      {
        type: "component",
        component: "ExistingPropertyId",
        key: "existingPropertyId",
        withoutLabel: true,
      },
      {
        type: "component",
        component: "SurveyId",
        key: "surveyId",
        withoutLabel: true,
      },
      {
        type: "component",
        component: "YearOfCreation",
        key: "yearOfCreation",
        withoutLabel: true,
        isMandatory: true,
      },
    ],
  },
  {
    head: "ES_NEW_APPLICATION_PROPERTY_ASSESSMENT",
    stepNumber: 2,
    body: [
      {
        type: "component",
        component: "PropertyUsageType",
        key: "usageCategoryMajor",
        withoutLabel: true,
        isMandatory: true
      },
      // {
      //   type: "component",
      //   component: "ProvideSubUsageType",
      //   key: "usageCategoryMinor",
      //   withoutLabel: true,
      // },
      {
        type: "component",
        component: "PropertyType",
        key: "PropertyType",
        withoutLabel: true,
        isMandatory: true
      },
      {
        type: "component",
        component: "Area",
        key: "landarea",
        withoutLabel: true,
        isMandatory: true
      },
      {
        type: "component",
        isMandatory: true,
        component: "ProvideFloorNo",
        key: "noOfFloors",
        withoutLabel: true,
      },
      {
        type: "component",
        component: "VasikaDetails",
        key: "vasikaDetails",
        withoutLabel: true,
      },
      {
        type: "component",
        component: "AllotmentDetails",
        key: "allottmentDetails",
        withoutLabel: true,
      },
      {
        type: "component",
        component: "BusinessName",
        key: "businessName",
        withoutLabel: true,
        isMandatory: true
      },
      {
        type: "component",
        component: "Remarks",
        key: "remarks",
        withoutLabel: true,
      },
      {
        type: "component",
        component: "PropertyCheckboxQuestions",
        key: "propertyCheckboxQuestions",
        withoutLabel: true,
      },
      {
        type: "component",
        component: "PropertyFloorDetails",
        key: "noOfFloors",
        withoutLabel: true,
      },
      {
        type: "component",
        component: "Units",
        key: "units",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "ES_NEW_APPLICATION_OWNERSHIP_DETAILS",
    stepNumber: 3,
    body: [
      {
        type: "component",
        component: "SelectOwnerShipDetails",
        key: "ownershipCategory",
        withoutLabel: true,
      },
      {
        type: "component",
        component: "PTEmployeeOwnershipDetails",
        key: "owners",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "ES_NEW_APPLICATION_DOCUMENTS_REQUIRED",
    stepNumber: 4,
    body: [
      {
        type: "component",
        component: "SelectDocuments",
        key: "documents",
        withoutLabel: true,
      },
    ],
  },
  {
    head: "Summary",
    stepNumber: 5,
    body: [
      {
        type: "component",
        component: "PTSummary",
        key: "PTSummary",
        withoutLabel: true,
      },
    ],
  },
];
