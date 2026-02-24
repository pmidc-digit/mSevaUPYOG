import React, { useEffect, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addQuestions,
  addQuestionsList,
  deleteCategory,
  updateCategory,
  updateMandatoryQuestionSelection,
  updateQuestionSelection,
  updateQuestionWeightage,
  setQuestions,
  goPrev,
} from "../../../redux/actions/surveyFormActions";
import { TextInput, Dropdown, CheckBox, Toast } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { isError } from "lodash";
import Dialog from "../../Modal/Dialog";

const CategoryCard = ({ category, checked, readOnly, onDelete, hideQuestionLabel }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [showQuestionTable, setShowQuestionTable] = useState(readOnly);
  const [showQuestionTableList, setShowQuestionTableList] = useState(readOnly);
  const [questionStatement, setQuestionStatement] = useState("");
  const [errors, setErrors] = useState({});
  const questions = [
    { id: 1, statement: "Question 1", selected: false },
    { id: 2, statement: "Question 2", selected: false },
    { id: 3, statement: "Question 3", selected: false },
  ];
  const [categoryList, setCategoryList] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [showToast, setShowToast] = useState(null);
  const state = useSelector((state) => state.engagement.surveyForm);
  useEffect(() => {
    let filters = {
      tenantId: tenantId,

      id: null,
    };
    try {
      Digit.Surveys.searchCategory(filters).then((response) => {
        if (response?.Categories?.length > 0) {
          const categoryOptions = response.Categories.filter((item) => item.isActive).map((item) => {
            return { title: t(item.label), i18Key: item.label, value: item.id };
          });

          setCategoryList(categoryOptions);
          // setShowToast({ key: true, label: "Category successfully retrieved." });
        } else {
          //  setShowToast({ key: true, label: `${response?.Errors?.message}` });
        }
      });
    } catch (error) {
      return error;
    }
  }, []);
  const closeToast = () => {
    setShowToast(null);
  };
  const handleCategoryChange = (e) => {
    // const { value } = e;
    dispatch(updateCategory(category.id, { ["selectCategory"]: e }));
    dispatch(setQuestions(category.id, []));
    // dispatch(addQuestions(category.id, []));
    setShowQuestionTableList(false);
  };
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateCategory(category.id, { [name]: value }));
  };

  const handleQuestionSelection = (questionId, selected) => {
    const res = dispatch(updateQuestionSelection(category.id, questionId, selected));
  };
  const handleMandatoryQuestionSelection = (questionId, mandatory) => {
    const res = dispatch(updateMandatoryQuestionSelection(category.id, questionId, mandatory));
  };
  const fetchQuestions = (categoryId, questionStatement) => {
    let filters = {
      // categoryId:category.selectCategory.id
      categoryId: categoryId,
      tenantId: tenantId,
      questionStatement: questionStatement,
      status: "ACTIVE",
    };
    try {
      Digit.Surveys.searchQuestions(filters).then((response) => {
        if (response?.Questions?.length > 0) {
          let arr = [];

          response.Questions.map((item) => {
            let obj = { ...item, selected: false };
            arr.push(obj);
          });
          
         arr.sort((a, b) => a.auditDetails.lastModifiedTime - b.auditDetails.lastModifiedTime);
          console.log("arr",arr)
          dispatch(setQuestions(category.id, arr));
          setQuestionsList(arr);
          setShowQuestionTableList(true);
          setShowToast({ key: true, isError: false, label: `QUESTIONS RETRIEVED` });
          // setShowToast({ key: true, label: "Category successfully retrieved." });
        } else {
          dispatch(setQuestions(category.id, []));
          //  dispatch(addQuestions(category.id, []));
          setQuestionsList([]);
          setShowQuestionTableList(false);

          setShowToast({ key: true, isError: true, label: `NO QUESTIONS FOUND` });
        }
      });
    } catch (error) {
      dispatch(setQuestions(category.id, []));
      // dispatch(addQuestions(category.id, []));
      setQuestionsList([]);
      setShowQuestionTableList(false);
    }
  };
  const handleGoClick = () => {
    //dispatch(setQuestions(category.id, questions));
    if (category.selectCategory === "") {
      setShowToast({ key: true, isError: true, label: `PLEASE SELECT A CATEGORY` });
    } else {
      fetchQuestions(category.selectCategory?.value, category.questionStatement);
    }
  };

  const handleAddQuestions = () => {
    const prev = [...category.selectedQuestions];
    let arr = [];
    const selectedQuestions = category.questions.filter((question) => question.selected);
    const mandatoryQuestions = category.questions.some((question) => question.mandatory && !question.selected);
    if (mandatoryQuestions) {
      setShowToast({ key: true, isError: true, label: `MANDATORY QUESTIONS MUST BE SELECTED` });
      return;
    }

    if (selectedQuestions.length === 0) {
      setShowToast({ key: true, isError: true, label: `PLEASE SELECT ATLEAST ONE QUESTION` });
      return;
    }
    arr.push(selectedQuestions);
    // const selectedQuestions =[...category.selectedQuestions,category.questions.filter(question => question.selected)];
    // if(category.selectedQuestions.length>0){

    // }

    // const updatedQuestions = [...category.selectedQuestions, ...selected.map(question => ({
    //   question,
    //   weightage: 100 / (selectedQuestions.length + selected.length)
    // }))];
    // const newQuestions = [prev,selectedQuestions];
    const weightage = 100 / arr.length;
    const newQuestions = selectedQuestions.filter((question) => !category.selectedQuestions.some((q) => q.uuid === question.uuid));
    const existingQuestions = selectedQuestions.filter((question) => category.selectedQuestions.some((q) => q.uuid === question.uuid));

    let index = null;
    if (existingQuestions.length > 0) {
      existingQuestions.map((item) => {
        index = category.selectedQuestions.findIndex((q) => q.uuid === item.uuid);
        category.selectedQuestions.map((ques) => {
          if (ques.uuid === item.uuid) {
            dispatch(updateMandatoryQuestionSelection(category.id, item.uuid, item.mandatory));
          }
        });

        category.selectedQuestions[index].mandatory = item.mandatory;
      });
      //const index = category.selectedQuestions.findIndex(q => q.uuid === item.uuid);
      // category.selectedQuestions[index].mandatory = item.mandatory;
    }
    const selectedCategory = category.selectCategory.title;
    const updatedQuestions = [...category.selectedQuestions, ...newQuestions.map((question) => ({ ...question, selectedCategory }))];
    const updatedQuestionsWithWeightage = updatedQuestions.map((q) => ({
      ...q,
      weightage: Math.floor((100 / updatedQuestions.length) * 100) / 100,
    }));

    dispatch(addQuestions(category.id, updatedQuestionsWithWeightage));
  };

  // const handleWeightageChange = (e) => {
  //   const { value } = e.target;
  //   dispatch(updateWeightage(category.id, parseFloat(value)));
  //  // dispatch(recalculateWeightage());
  // };

  const handleDeleteQuestion = (questionToDelete) => {
    const updatedQuestions = category.selectedQuestions.filter((q) => q.uuid !== questionToDelete.uuid);
    const totalQuestions = updatedQuestions.length;
    const updatedQuestionsWithWeightage = updatedQuestions.map((q) => ({
      ...q,
      weightage: Math.floor((100 / totalQuestions) * 100) / 100,
    }));
    dispatch(addQuestions(category.id, updatedQuestionsWithWeightage));
  };
  const handleWeightage = (index, questionId, value) => {
    const regex = /^\d*(\.\d{0,2})?$/;
    let newErrors = {};
    if (regex.test(value)) {
      dispatch(updateQuestionWeightage(category.id, questionId, value));
      newErrors = {};
      setErrors(newErrors);
    } else {
      let obj = { weightage: "Invalid weightage value. Please enter a number or decimal upto 2 decimal points" };
      newErrors[index] = obj;
      setErrors(newErrors);
    }
  };

  const [openQuesDetailsDialog, setOpenQuesDetailsDialog] = useState(false);
  const [questionDetailsContent, setQuestionDetailsContent] = useState(false);

  function handleDisplayQuesDetails(question) {
    console.log("question: ", question);
    setOpenQuesDetailsDialog(true);
    const content = (
      <div>
        <fieldset>
          <legend style={{ fontWeight: "bold" }}>Question:</legend>
          <p>{question?.questionStatement}</p>
        </fieldset>
        <fieldset>
          <legend style={{ fontWeight: "bold" }}>Category:</legend>
          <p>{question?.category?.label}</p>
        </fieldset>
        <fieldset>
          <legend style={{ fontWeight: "bold" }}>Question Type:</legend>
          <p>{t(question?.type)}</p>
        </fieldset>
        {(question?.type === "MULTIPLE_ANSWER_TYPE" || question?.type === "CHECKBOX_ANSWER_TYPE") && (
          <fieldset>
            <legend style={{ fontWeight: "bold" }}>Options:</legend>
            {question?.options.map((option, index) => {
              return (
                <li key={option.uuid}>
                  {index + 1}. {option?.optionText}
                </li>
              );
            })}
          </fieldset>
        )}
        {/* <div>
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.
    </div> */}
      </div>
    );
    setQuestionDetailsContent(content);
  }

  function handleOnSubmitDialog() {
    setOpenQuesDetailsDialog(false);
  }
  function handleOnCancelDialog() {
    setOpenQuesDetailsDialog(false);
  }

  return (
    <div className="category-card">
      <h3>
        Section Title <span style={{ color: "red" }}>*</span>
      </h3>
      <input type="text" name="title" value={category.title} readOnly={readOnly} onChange={handleFieldChange} placeholder="Section Title" required />
      {/* <TextInput
                  // textInputStyle={{maxWidth:"960px"}}
            //className="searchInput" 
            placeholder={t("Title")} 
            value={category.title}
            onChange={handleFieldChange} 
       
            /> */}
      <h3>Section Weightage</h3>
      <input
        type="number"
        name="weightage"
        value={category.weightage}
        onChange={handleFieldChange}
        onWheel={(e) => e.target.blur()}
        readOnly={checked}
        placeholder="Section Weightage"
        required
      />
      {(readOnly === false || readOnly === undefined) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", marginBottom: "5px" }}>
          <label
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: "#007bff",
              color: "white",
              cursor: "pointer",
            }}
            onClick={() => setShowQuestionTable(!showQuestionTable)}
          >
            Add Questions
          </label>

          <label
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: "red",
              color: "white",
              // marginLeft:"5px",
              cursor: "pointer",
            }}
            onClick={() => {
              onDelete(category.id);
            }}
          >
            Delete Section
          </label>
        </div>
      )}

      {/* {readOnly!==true && (
      
       )} */}

      {(showQuestionTable || state.goPrev === true) && (
        <div>
          {/* <select
            name="selectCategory"
            value={category.selectCategory}
            onChange={(e) => handleCategoryChange(e)}
            disabled={readOnly}
          >
             <option value="">Select Category</option>
          {categoryList.length>0? categoryList.map((item,index)=>{
             <option id={index} value={item?.label}>{item?.label}</option>
          }): <option value="">Select Category</option>} 
          
         </select>  */}
          <h3>Select Category</h3>
          <Dropdown
            required={true}
            t={t}
            id="selectCategory"
            name="selectCategory"
            option={categoryList}
            select={handleCategoryChange}
            placeholder={"Select Category"}
            optionKey="i18Key"
            selected={category.selectCategory || null}
          />
          {(readOnly === false || readOnly === undefined) && <h3>Search Question</h3>}
          {(readOnly === false || readOnly === undefined) && (
            <input
              type="text"
              name="questionStatement"
              value={category.questionStatement}
              onChange={handleFieldChange}
              placeholder="Search Question"
              readOnly={readOnly}
            />
          )}
          {(readOnly === false || readOnly === undefined) && (
            <label
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#007bff",
                color: "white",
                cursor: "pointer",
              }}
              disable={readOnly}
              onClick={handleGoClick}
            >
              Go
            </label>
          )}
          {showQuestionTableList && hideQuestionLabel != true && category.questions.length > 0 && (
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Question Label</th>
                    <th>Select</th>
                    <th>Is Mandatory</th>
                  </tr>
                </thead>
                <tbody>
                  {category.questions.map((question) => (
                    <tr key={question?.uuid}>
                      <td>
                        <div className="tooltip">
                          <div style={{ display: "flex", gap: "0 4px" }}>
                            <div style={{ cursor: "pointer" }} onClick={() => handleDisplayQuesDetails(question)}>
                              {question?.questionStatement}
                            </div>
                            <span className="tooltiptext" style={{ position: "absolute", width: "100px", marginLeft: "50%", fontSize: "medium" }}>
                              {t("Click here to view the question details")}
                            </span>
                          </div>
                        </div>
                        {/* <div style={{ cursor: "pointer" }} onClick={() => handleDisplayQuesDetails(question)}>
                          {question?.questionStatement}
                        </div> */}
                      </td>
                      <td>
                        {/* <input
                        type="checkbox"
                        readOnly={readOnly}
                        disabled={readOnly}
                        checked={question?.selected||false}
                        onChange={(e) => handleQuestionSelection(question.uuid, e.target.checked)}
                      /> */}
                        <CheckBox
                          disable={readOnly}
                          key={question.uuid}
                          onChange={(e) => {
                            // if (e.target.checked) {
                            //   onChange([option,...value?value:[]]);
                            // } else {
                            //   value && onChange(value?.filter((item) => item !== option));
                            // }
                            handleQuestionSelection(question.uuid, e.target.checked);
                          }}
                          // checked={true}
                          checked={question.selected}
                          // label={option}
                          // checkboxWidth = {{width:"34px",height:"34px"}}
                          //  style={{marginTop:"5px", overflowWrap:"break-word"}}
                        />
                      </td>
                      <td>
                        {/* <input
                        type="checkbox"
                        readOnly={readOnly}
                        disabled={readOnly}
                        checked={question?.selected||false}
                        onChange={(e) => handleQuestionSelection(question.uuid, e.target.checked)}
                      /> */}
                        <CheckBox
                          disable={readOnly}
                          key={question.uuid}
                          onChange={(e) => {
                            // if (e.target.checked) {
                            //   onChange([option,...value?value:[]]);
                            // } else {
                            //   value && onChange(value?.filter((item) => item !== option));
                            // }
                            handleMandatoryQuestionSelection(question.uuid, e.target.checked);
                          }}
                          //checked={question.selected}
                          // checkboxWidth = {{width:"34px",height:"34px"}}
                          //  style={{marginTop:"5px", overflowWrap:"break-word"}}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* {category.questions.length===0?<div style={{color:'red'}}>NO QUESTIONS FOUND FOR SELECTED CATEGORY</div>:null} */}
          {(readOnly === false || readOnly === undefined) && showQuestionTableList && category.questions.length > 0 && (
            <label
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#007bff",
                color: "white",
                cursor: "pointer",
                marginTop: "10px",
              }}
              disable={readOnly}
              onClick={handleAddQuestions}
            >
              Add These Questions
            </label>
          )}

          <div>
            {category.selectedQuestions.length > 0 || readOnly === true ? (
              <table>
                <thead>
                  <tr>
                    <th>Selected Category</th>
                    <th>Question Statement</th>
                    <th>Weightage</th>
                    <th>Is Mandatory</th>
                  </tr>
                </thead>
                <tbody>
                  {category.selectedQuestions.map((question, index) => (
                    <tr key={question.uuid}>
                      <td>{question.selectedCategory}</td>
                      <td>{question.questionStatement}</td>
                      <td>
                        <input
                          type="text"
                          defaultValue={question.weightage}
                          value={question.weightage}
                          required
                          onChange={(e) => handleWeightage(index, question.uuid, e.target.value)}
                        />
                        {errors[index]?.weightage != "undefined" && <span className="error">{errors[index]?.weightage}</span>}
                        {/* {question.weightage} */}
                        {/* <input
                        type="checkbox"
                        readOnly={readOnly}
                        disabled={readOnly}
                        checked={question?.selected||false}
                        onChange={(e) => handleQuestionSelection(question.uuid, e.target.checked)}
                      /> */}
                      </td>
                      <td>{question?.mandatory === true ? "True" : "False"}</td>
                      <td>
                        <label onClick={() => handleDeleteQuestion(question)}>Delete</label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        </div>
      )}
      {openQuesDetailsDialog && (
        <Dialog
          onSelect={handleOnSubmitDialog}
          onCancel={handleOnCancelDialog}
          onDismiss={handleOnCancelDialog}
          heading="Question Details"
          actionCancel={true}
          content={questionDetailsContent}
          hideSubmit={true}
        />
      )}
      {showToast && (
        <Toast
          error={showToast.isError}
          label={t(showToast.label)}
          onClose={closeToast}
          isDleteBtn={"false"}
          labelstyle={{ color: "white", width: "100%" }}
        />
      )}
    </div>
  );
};

export default CategoryCard;
