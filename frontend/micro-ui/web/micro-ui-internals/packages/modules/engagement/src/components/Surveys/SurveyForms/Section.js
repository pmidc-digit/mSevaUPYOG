import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCategory, updateSectionWeightage } from './Actions';
import Category from './Category';
import { TextInput } from '@mseva/digit-ui-react-components';

const Section = ({ section }) => {
  const dispatch = useDispatch();

  const handleAddCategory = () => {
    dispatch(addCategory(section.id));
  };

  const handleWeightageChange = (e) => {
    dispatch(updateSectionWeightage(section.id, e.target.value));
  };
console.log("section in section js",section.categories)
  return (
    <div>
      <h2>Section</h2>
      <div className="newSurveyForm_wrapper">
      <span className="newSurveyForm_quesno">{"CS_COMMON_QUESTION"}</span>
      <span className="newSurveyForm_mainsection">
        <TextInput  value={section?.weightage} onChange={handleWeightageChange} placeholder="Section Weightage" name="weightage"/>
      {/* <input type="number" value={section.weightage} onChange={handleWeightageChange} placeholder="Section Weightage" /> */}
      <button onClick={handleAddCategory}>Add Category</button>
      {section?.categories?.length?section.categories.map(category => (
        <Category key={category.id} category={category} sectionId={section?.id} />
      )):null}.
      </span>
      </div>
    </div>
    
  );
};

export default Section;