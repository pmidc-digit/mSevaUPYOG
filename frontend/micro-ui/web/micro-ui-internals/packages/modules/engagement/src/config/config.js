export const newConfig = [
    {
      head: "Survey Details",
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
      head: "Survey Sections",
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
      head: "Summary",
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
  