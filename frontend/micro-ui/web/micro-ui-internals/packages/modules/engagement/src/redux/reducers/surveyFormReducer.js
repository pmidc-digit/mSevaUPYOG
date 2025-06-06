import { goPrev } from "../actions/surveyFormActions";
import {
  FIELD_CHANGE,
  ADD_CATEGORY,
  DELETE_CATEGORY,
  RECALCULATE_WEIGHTAGE,
  UPDATE_WEIGHTAGE,
  UPDATE_MANDATORY_QUESTION_SELECTION,
  UPDATE_QUESTION_WEIGHTAGE,
  ADD_QUESTIONS,
  ADD_QUESTIONS_LIST,
  UPDATE_CATEGORY,
  UPDATE_QUESTION_SELECTION,
  SET_QUESTIONS,
  NEXT_STEP,
  PREVIOUS_STEP,
  SET_STEP_DATA,
  UPDATE_SURVEY_FORM,
  SET_SURVEY_STEP,
  GO_PREV,
  GO_NEXT,
  AUTO_CALCULATE_CATEGORY,
  RESET_FORM,
} from "../actions/types";

const initialState = {
  // sections: [
  //   {
  //     id: 1,
  // title: 'Section 1',

  // sectionWeightage: 20,
  // categories: [
  //   {
  //     id: 1,
  //     title: 'Category 1',
  //     categoryWeightage: 100,
  //     questions: [
  //       {
  //         id: 1,
  //         selectCategory:'',
  //         statement: 'Question 1',
  //         answerType: 'text',
  //         questionWeightage: 100
  //       }

  //     ]
  //   }
  // ],
  //   }
  // ],
  surveyDetails: [
    {
      id: 1,
      ulb: "",
      tenantIds: "",
      name: "",
      description: "",
      fromDate: "",
      fromTime: "",
      toDate: "",
      toTime: "",
    },
  ],
  categories: [
    {
      id: 1,
      title: "",
      weightage: 100,
      selectCategory: "",
      questionStatement: "",
      questions: [],
      selectedQuestions: [],
    },
  ],
  autoCalculateCategoriesWeight: true,
  goPrev: false,
  goNext: false,
  stepData: {},

  step: 1,
  isValid: false,
  formData: {},
};

const surveyFormReducer = (state = initialState, action) => {
  const recalculateWeightage = (categories) => {
    const updatedCategories = categories.map((category) => ({
      ...category,
      weightage: Math.floor((100 / state.categories.length) * 100) / 100,
    }));
    return {
      ...state,
      categories: updatedCategories,
    };
  };
  switch (action.type) {
    // case ADD_SECTION:
    //   return {
    //     ...state,
    //     categories: [...state.categories, { id: Date.now(), title: '', categoryWeightage: 0, questions:[{id: Date.now(),selectCategory:'',
    //       statement: '',
    //       answerType: null,
    //       questionWeightage: null}]}]
    //   };
    // case ADD_CATEGORY:
    // return {
    //   ...state,
    //   categories: state.categories.map(section =>
    //     section.id === action.sectionId
    //       ? { ...section, categories: [...section.categories, { id: Date.now(), title: '', questions: [] }] }
    //       : section
    //   )
    // };
    // case ADD_QUESTION:
    //   return {
    //     ...state,
    //     categories: state.categories.map(category =>
    //       category.id === action.categoryId
    //         ? {
    //             ...category,
    //             categories: category.questions.map(question =>
    //               question.id === action.questionId
    //                 ? { ...question, questions: [...question.questions, { id: Date.now(),  selectCategory:'',
    //                   statement: 'Question 1',
    //                   answerType: 'text',
    //                   questionWeightage: 100}] }
    //                 : question
    //             )
    //           }
    //         : category
    //     )
    //   };
    // case UPDATE_SECTION:
    //   return {
    //     ...state,
    //     categories: state.categories.map(category =>
    //       category.id === action.categoryId ? { ...category, ...action.data } : category
    //     )
    //   };
    // case UPDATE_CATEGORY:
    //   return {
    //     ...state,
    //     categories: state.categories.map(section =>
    //       section.id === action.sectionId
    //         ? {
    //             ...section,
    //             categories: section.categories.map(category =>
    //               category.id === action.categoryId ? { ...category, ...action.data } : category
    //             )
    //           }
    //         : section
    //     )
    //   };
    // case UPDATE_QUESTION:
    //   return {
    //     ...state,
    //     categories: state.categories.map(category =>
    //       category.id === action.categoryId
    //         ? {
    //             ...category,
    //             categories: category.categories.map(question =>
    //               question.id === action.questionId
    //                 ? {
    //                     ...question,
    //                     questions: question.questions.map(question =>
    //                       question.id === action.questionId ? { ...question, ...action.data } : question
    //                     )
    //                   }
    //                 : question
    //             )
    //           }
    //         : category
    //     )
    //   };
    // case ADD_CATEGORY:
    //   // return {
    //   //   ...state,
    //   //   categories: [...state.categories, { id: Date.now(), title: '', weightage: 100, selectCategory: '', questions: [], selectedQuestions: [] }]
    //   // };
    //   //
    //   const newCategories = [...state.categories, { id: Date.now(), title: '', weightage: 100, selectCategory: '', questions: [], selectedQuestions: [] }];
    //   return {
    //     ...state,
    //     categories: newCategories.map(category => ({
    //       ...category,
    //       weightage: 100 / newCategories.length
    //     }))
    //   };
    case GO_PREV:
      return {
        ...state,
        goPrev: true,
      };

    case GO_NEXT:
      return {
        ...state,
        goNext: true,
      };

    case AUTO_CALCULATE_CATEGORY:
      return {
        ...state,
        autoCalculateCategoriesWeight: action.categoryWeight,
      };

    case ADD_CATEGORY:
      const newCategories = [
        ...state.categories,
        { id: action.id, title: "", weightage: "", selectCategory: "", questions: [], selectedQuestions: [] },
      ];
      return {
        ...state,
        categories: newCategories,
      };
    // case RECALCULATE_WEIGHTAGE:
    //   const updatedCategories = state.categories.map(category => ({
    //     ...category,
    //     weightage: (100) / state.categories.length
    //   }));
    //   return {
    //     ...state,
    //     categories: updatedCategories
    //   };
    case RECALCULATE_WEIGHTAGE:
      const updatedCategories = state.categories.map((category) => ({
        ...category,
        weightage: Math.floor((100 / state.categories.length) * 100) / 100,
      }));
      return {
        ...state,
        categories: updatedCategories,
      };
    // case UPDATE_WEIGHTAGE:
    //   const updatedCategories = state.categories.map(category => {
    //     if (category.id === action.categoryId) {
    //       return { ...category, weightage: action.weightage };
    //     }
    //     return category;
    //   });
    //   return {
    //     ...state,
    //     categories: recalculateWeightage(updatedCategories)
    //   };
    case DELETE_CATEGORY:
      const remainingCategories = state.categories.filter((category) => category.id !== action.categoryId);
      return {
        ...state,
        categories: remainingCategories,
      };

    case ADD_QUESTIONS_LIST:
      return {
        ...state,
        categories: state.categories.map((category) => (category.id === action.categoryId ? { ...category, questions: questionsList } : category)),
      };
    case ADD_QUESTIONS:
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.categoryId ? { ...category, selectedQuestions: action.questions } : category
        ),
      };
    case UPDATE_QUESTION_WEIGHTAGE:
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.categoryId
            ? {
                ...category,
                selectedQuestions: category.selectedQuestions.map((question) =>
                  question.uuid === action.questionId ? { ...question, weightage: action.weightage } : question
                ),
              }
            : category
        ),
      };
    case UPDATE_CATEGORY:
      return {
        ...state,
        categories: state.categories.map((category) => (category.id === action.categoryId ? { ...category, ...action.data } : category)),
      };

    case UPDATE_QUESTION_SELECTION:
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.categoryId
            ? {
                ...category,
                questions: category.questions.map((question) =>
                  question.uuid === action.questionId ? { ...question, selected: action.selected } : question
                ),
              }
            : category
        ),
      };

    case UPDATE_MANDATORY_QUESTION_SELECTION:
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.categoryId
            ? {
                ...category,
                questions: category.questions.map((question) =>
                  question.uuid === action.questionId ? { ...question, mandatory: action.mandatory } : question
                ),
              }
            : category
        ),
      };

    case SET_QUESTIONS:
      return {
        ...state,
        categories: state.categories.map((category) => (category.id === action.categoryId ? { ...category, questions: action.questions } : category)),
      };
    case NEXT_STEP:
      return {
        ...state,
        step: state.step + 1,
      };
    case PREVIOUS_STEP:
      return {
        ...state,
        step: state.step - 1,
      };
    case SET_STEP_DATA:
      return {
        ...state,
        stepData: {
          ...state.stepData,
          [action.step]: action.data,
        },
      };

    case UPDATE_SURVEY_FORM:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_SURVEY_STEP:
      return {
        ...state,
        step: action.payload,
      };

    case FIELD_CHANGE:
      return {
        ...state,
        surveyDetails: state.surveyDetails.map((survey) => (survey.id === action.surveyId ? { ...survey, ...action.data } : survey)),
      };
    case RESET_FORM:
      return initialState;

    default:
      return state;
  }
};

export default surveyFormReducer;
