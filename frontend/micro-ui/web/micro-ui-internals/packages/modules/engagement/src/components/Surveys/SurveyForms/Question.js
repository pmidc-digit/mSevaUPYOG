import React from 'react';

const Question = ({ question }) => {
  return (
    <div>
      <h4>Question</h4>
      <select>
        <option value="">Select Answer Type</option>
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="date">Date</option>
      </select>
      <input type="text" placeholder="Answer" />
    </div>
  );
};

export default Question;