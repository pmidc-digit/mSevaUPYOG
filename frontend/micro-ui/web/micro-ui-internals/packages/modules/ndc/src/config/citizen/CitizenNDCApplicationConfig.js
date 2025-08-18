export const config = [
    {
        head: "NDC_COMMON_NEW_APPLICATION",
        stepNumber: 1,
        body: [
          {
            name: "",
            type: "component",
            component: "NDCPropertySearch",
            key: "cpt",
            withoutLabel: true,
          },
          {
            name: "NDC_COMMON_PROPERTY_DETAILS",
            type: "component",
            component: "PropertyDetailsFormCitizen",
            key: "PropertyDetails",
            withoutLabel: true,
          },
          {
            name: "NDC_COMMON_NDC_REASON",
            type: "component",
            component: "SelectNDCReason",
            key: "NDCReason",
            withoutLabel: true,
          },
        ],
    },
    {
      head: "NDC_COMMON_DOCUMENTS_REQUIRED",
      stepNumber: 2,
      body: [
        {
          type: "component",
          component: "SelectNDCDocuments",
          key: "documents",
          withoutLabel: true,
        },
      ],
    },
    {
      head: "Summary",
      stepNumber: 3,
      body: [
        {
          type: "component",
          component: "NDCSummary",
          key: "NDCSummary",
          withoutLabel: true,
        },
      ],
    },
    // {
    //     head: "TL_NEW_APPLICATION_PROPERTY",
    //     stepNumber: 1,
    //     body: [
    //       {
    // 
    //         name: "",
    //         type: "component",
    //         component: "SelectNDCDocuments",
    //         key: "cpt",
    //         withoutLabel: true,
    //       },
    //     ],
    //   },
]