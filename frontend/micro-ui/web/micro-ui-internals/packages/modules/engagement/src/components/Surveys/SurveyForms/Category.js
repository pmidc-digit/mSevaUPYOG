import React from 'react';
import { useDispatch } from 'react-redux';
import { addQuestion, updateCategoryWeightage } from './Actions';
import Question from './Question';

const Category = ({ category, sectionId }) => {
  const dispatch = useDispatch();

  const handleAddQuestion = () => {
    dispatch(addQuestion(sectionId, category.id));
  };

  const handleWeightageChange = (e) => {
    dispatch(updateCategoryWeightage(sectionId, category.id, e.target.value));
  };

  return (
    <div>
      <h3>Category</h3>
      <input type="number" value={category.weightage} onChange={handleWeightageChange} placeholder="Category Weightage" />
      <button onClick={handleAddQuestion}>Add Question</button>
      {category.questions.map(question => (
        <Question key={question.id} question={question} />
      ))}
    </div>
  );
};

export default Category;