export const ADD_SECTION = 'ADD_SECTION';
export const ADD_CATEGORY = 'ADD_CATEGORY';
export const ADD_QUESTION = 'ADD_QUESTION';
export const UPDATE_SECTION_WEIGHTAGE = 'UPDATE_SECTION_WEIGHTAGE';
export const UPDATE_CATEGORY_WEIGHTAGE = 'UPDATE_CATEGORY_WEIGHTAGE';

export const addSection = () => ({ type: ADD_SECTION });
export const addCategory = (sectionId) => ({ type: ADD_CATEGORY, sectionId });
export const addQuestion = (sectionId, categoryId) => ({ type: ADD_QUESTION, sectionId, categoryId });
export const updateSectionWeightage = (sectionId, weightage) => ({ type: UPDATE_SECTION_WEIGHTAGE, sectionId, weightage });
export const updateCategoryWeightage = (sectionId, categoryId, weightage) => ({ type: UPDATE_CATEGORY_WEIGHTAGE, sectionId, categoryId, weightage });