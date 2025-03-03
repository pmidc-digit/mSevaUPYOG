export const newConfig = [
    {
      head: "Survey Form",
      stepNumber: 1,
      body: [
        {
          type: "component",
          component: "NewSurveys",
          key: "NewSurveys",
          withoutLabel: true,
        },
       
      ],
    },
    {
      head: "Survey Form",
      stepNumber: 2,
      body: [
        {
          type: "component",
          component: "SurveyCreationPage",
          key: "SurveyCreationPage",
          withoutLabel: true,
        },  
      ],
    },
    {
      head: "Survey Form",
      stepNumber: 3,
      body: [
        {
          type: "component",
          component: "SurveySummary",
          key: "SurveySummary",
          withoutLabel: true,
        },  
      ],
    },
  ];
  