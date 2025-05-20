import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addCategory,
  autoCalculateCategoriesWeight,
  deleteCategory,
  recalculateWeightage,
  updateWeightage,
} from "../../../redux/actions/surveyFormActions";
import CategoryCard from "./CategoryCard";
import { DatePicker, Dropdown, CheckBox, TextArea, TextInput, CardLabelError } from "@mseva/digit-ui-react-components";

const SurveyCreationPage = ({ config, onSelect, userType, formData, setError, formState, clearErrors, readOnly, hideQuestionLabel }) => {
  const categories = useSelector((state) => state.engagement.surveyForm.categories);
  const categoryWeight = useSelector((state) => state.engagement.surveyForm.autoCalculateCategoriesWeight);
  const dispatch = useDispatch();
  const [checked, setChecked] = useState(categoryWeight);
  console.log("categories", categories);
  const [index, setIndex] = useState(2);
  const handleDeleteCategory = (categoryId) => {
    console.log("checked", checked);
    if (categories.length === 1) {
      alert("Atleast one category must be there");
      return;
    }
    if (categoryWeight) {
      dispatch(deleteCategory(categoryId));
      dispatch(recalculateWeightage());
    } else {
      dispatch(deleteCategory(categoryId));
    }
  };
  return (
    <div className="create-survey-page" style={{ background: "white", display: "block", padding: "15px" }}>
      {/* {readOnly!==true && (<h1>Create Survey</h1>)} */}

      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          checked={categoryWeight}
          readOnly={readOnly}
          onDelete={handleDeleteCategory}
          hideQuestionLabel={hideQuestionLabel}
        />
      ))}
      {readOnly !== true && (
        <label
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
            marginBottom: "10px",
          }}
          onClick={() => {
            console.log("checked", categoryWeight);
            if (categoryWeight === true) {
              dispatch(addCategory(index));
              dispatch(recalculateWeightage());
              setIndex(index + 1);
            } else {
              dispatch(addCategory(index));
              setIndex(index + 1);
            }
          }}
        >
          Add Section
        </label>
      )}
      {/* {readOnly!==true && (
  <label style={{ padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#007bff",
    color: "red",
    cursor: "pointer"}} onClick={dispatch(deleteCategory(category.id))}>Delete Category</label>
 )} */}
      {/* <CheckBox
      disable={readOnly}
        onChange={(e) => { setChecked(!checked); if(checked===true){ dispatch(recalculateWeightage())} }}
        checked={checked}
        label={"Auto Calculate Catgeory Weightage"}
        pageType={"employee"}
        //  disable={disableInputs}
        checkboxStyle={{marginTop:'30px'}}
        style={{ marginTop: "8px" }}
      /> */}
      <div style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", columnGap: "20px" }}>
          <input
            style={{ height: "20px", width: "20px" }}
            type="checkbox"
            // checked={checked}
            checked={categoryWeight}
            disabled={readOnly}
            onChange={(e) => {
              console.log("e checked", e.target.checked);
              dispatch(autoCalculateCategoriesWeight(e.target.checked));
              setChecked(e.target.checked);
              if (e.target.checked === true) {
                dispatch(recalculateWeightage());
              }
            }}
          />
          Auto Calculate Category Weightage
        </div>
      </div>
    </div>
  );
};

export default SurveyCreationPage;
