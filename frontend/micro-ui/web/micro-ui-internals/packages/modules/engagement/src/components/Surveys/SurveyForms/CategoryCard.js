import React, { useEffect, useState, useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addQuestions,addQuestionsList, deleteCategory, updateCategory, updateQuestionSelection ,setQuestions, goPrev} from '../../../redux/actions/surveyFormActions';
import {TextInput, Dropdown, CheckBox ,Toast} from '@mseva/digit-ui-react-components';
import { useTranslation } from 'react-i18next';
import { isError } from 'lodash';

const CategoryCard = ({ category ,checked,readOnly,onDelete,hideQuestionLabel}) => {
 
  const dispatch = useDispatch();
const {t} = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [showQuestionTable, setShowQuestionTable] = useState(readOnly);
  const [showQuestionTableList, setShowQuestionTableList] = useState(readOnly);
  const [questionStatement, setQuestionStatement] = useState('');
  const  questions= [
    { id: 1, statement: 'Question 1', selected: false },
    { id: 2, statement: 'Question 2', selected: false },
    { id: 3, statement: 'Question 3', selected: false }
  ]
const [categoryList,setCategoryList] =useState([])
const [questionsList,setQuestionsList]=useState([])
  const [showToast, setShowToast] = useState(null);
const state = useSelector(state => state.engagement.surveyForm);
console.log("readOnly, goPrev, hide",readOnly,state.goPrev,hideQuestionLabel)
  useEffect(()=>{
    let filters={
      tenantId: tenantId,
   
      id:null
 

    }
    try{
         
      Digit.Surveys.searchCategory(filters).then((response) => {
        if(response?.Categories?.length>0)
        {
        
          const categoryOptions = response.Categories.filter((item) => item.isActive).map((item) => {
            return { title: t(item.label), i18Key: item.label, value: item.id };
          });

         setCategoryList(categoryOptions)
         // setShowToast({ key: true, label: "Category successfully retrieved." });
        }
        else
        {
        //  setShowToast({ key: true, label: `${response?.Errors?.message}` });
        }
      })
    }
    catch(error)
    {
      console.log(error);
    }
  },[])
  const closeToast = () => {
    setShowToast(null);
  };
  const handleCategoryChange = (e) => {
    console.log("e",e)
    // const { value } = e;
    dispatch(updateCategory(category.id, { ["selectCategory"]: e }));
    dispatch(setQuestions(category.id,[]))
   // dispatch(addQuestions(category.id, []));
    setShowQuestionTableList(false);
  };
  const handleFieldChange = (e) => {
   console.log("value",e.target)
    const { name, value } = e.target;
    dispatch(updateCategory(category.id, { [name]: value }));
  };

  const handleQuestionSelection = (questionId, selected) => {
   
    console.log("quesupdate",category.id,questionId,selected)
    console.log("questionId",category.questions[0].uuid)
    const res=dispatch(updateQuestionSelection(category.id, questionId, selected));
    console.log("res upd",res)
    console.log("category",category)
  
  };
 const fetchQuestions =(categoryId,questionStatement)=>{
  let filters={
    // categoryId:category.selectCategory.id
    categoryId:categoryId,
    tenantId: tenantId,
   questionStatement: questionStatement,
   status: "ACTIVE"
    


  }
  try{
       
    Digit.Surveys.searchQuestions(filters).then((response) => {
      if(response?.Questions?.length>0)
      {
        let arr=[]
       
         response.Questions.map((item)=>{
         let obj= {...item,selected:false}
         arr.push(obj)
        })
        console.log("arr",arr)
        dispatch(setQuestions(category.id,arr))
       setQuestionsList(arr)
       setShowQuestionTableList(true);
       setShowToast({ key: true, isError:false,label: `QUESTIONS RETRIEVED` });
       // setShowToast({ key: true, label: "Category successfully retrieved." });
      }
      else
      {
        dispatch(setQuestions(category.id,[]))
      //  dispatch(addQuestions(category.id, []));
        setQuestionsList([])
        setShowQuestionTableList(false);

        setShowToast({ key: true, isError:true,label: `NO QUESTIONS FOUND` });
      }
    })
  }
  catch(error)
  {
    dispatch(setQuestions(category.id,[]))
   // dispatch(addQuestions(category.id, []));
    console.log(error);
    setQuestionsList([])
    setShowQuestionTableList(false);
  }
 }
 console.log("cat qus",category)
  const handleGoClick = () => {
    //dispatch(setQuestions(category.id, questions));
  if(category.selectCategory===''){
    setShowToast({ key: true, isError:true,label: `PLEASE SELECT A CATEGORY` });
  }
  else{
    fetchQuestions(category.selectCategory?.value, category.questionStatement)
  }
  };

  const handleAddQuestions = () => {

    const prev=[...category.selectedQuestions]
    console.log("prev selected ques",prev)
    let arr= []
    const selectedQuestions = category.questions.filter(question => question.selected);
    arr.push(selectedQuestions)
    // const selectedQuestions =[...category.selectedQuestions,category.questions.filter(question => question.selected)];
    // if(category.selectedQuestions.length>0){
       
    // }
   
    // const updatedQuestions = [...category.selectedQuestions, ...selected.map(question => ({
    //   question,
    //   weightage: 100 / (selectedQuestions.length + selected.length)
    // }))];
    // const newQuestions = [prev,selectedQuestions];
    // console.log("new ques",newQuestions)
    console.log("selected ques",selectedQuestions)
    console.log("arr",arr)
    const weightage = 100 / arr.length;
    const newQuestions = selectedQuestions.filter(question => 
      !category.selectedQuestions.some(q => q.uuid === question.uuid)
    );
    const selectedCategory= category.selectCategory.title
    const updatedQuestions = [...category.selectedQuestions, ...newQuestions.map(question => ({ ...question,selectedCategory }))];
    const updatedQuestionsWithWeightage = updatedQuestions.map(q => ({
      ...q,
      weightage: (100 / updatedQuestions.length).toFixed(2)
    }));
    console.log("upd Qus",updatedQuestions)
    dispatch(addQuestions(category.id, updatedQuestionsWithWeightage));
  };

  // const handleWeightageChange = (e) => {
  //   const { value } = e.target;
  //   dispatch(updateWeightage(category.id, parseFloat(value)));
  //  // dispatch(recalculateWeightage());
  // };
console.log("cat list",categoryList)
console.log("cat",category)
console.log("selected ques read only len",category.selectedQuestions.length)

const handleDeleteQuestion = (questionToDelete) => {
  const updatedQuestions = category.selectedQuestions.filter(q => q.uuid !== questionToDelete.uuid);
  const totalQuestions = updatedQuestions.length;
  const updatedQuestionsWithWeightage = updatedQuestions.map(q => ({
    ...q,
    weightage: (100 / totalQuestions).toFixed(2)
  }));
  console.log("upd Qus",updatedQuestions)
  dispatch(addQuestions(category.id, updatedQuestionsWithWeightage));
};
  return (
    <div className="category-card">
      <h3>Section Title</h3>
      <input
        type="text"
        name="title"
        value={category.title}
        readOnly={readOnly}
        onChange={handleFieldChange}
        placeholder="Section Title"
        required
      />
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
        readOnly={checked}
        placeholder="Section Weightage"
        required
      />
            {((readOnly===false || readOnly===undefined )) && (
        <div style={{display:'flex',justifyContent:'space-between',marginTop:'10px',marginBottom:'5px'}}>
 
      <label style={{ padding: "10px 20px",
        border: "none",
        borderRadius: "4px",
        backgroundColor: "#007bff",
        color: "white",
        cursor: "pointer"}}onClick={() => setShowQuestionTable(!showQuestionTable)}>Add Questions</label>
    
      
<label style={{ padding: "10px 20px",
          border: "none",
          borderRadius: "4px",
          backgroundColor: "red",
          color: "white",
         // marginLeft:"5px",
          cursor: "pointer"}} onClick={()=>{onDelete(category.id)}}>Delete Section</label>

      </div>
      )}

 

       {/* {readOnly!==true && (
      
       )} */}
   
      {(showQuestionTable || state.goPrev===true ) && (
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
         {((readOnly===false || readOnly===undefined )) && (

         <h3>Search Question</h3>
         )}
          {((readOnly===false || readOnly===undefined )) && (
          <input
            type="text"
            name="questionStatement"
            value={category.questionStatement}
            onChange={ handleFieldChange}
            placeholder="Search Question"
            readOnly={readOnly}
            
          />
         )}
           {(readOnly===false || readOnly===undefined  )&& ( <label style={{ padding: "10px 20px",
        border: "none",
        borderRadius: "4px",
        backgroundColor: "#007bff",
        color: "white",
        cursor: "pointer"}}disable={readOnly} onClick={handleGoClick}>Go</label>)}
          {(showQuestionTableList && hideQuestionLabel!=true && category.questions.length>0 )&& (
            <div>
            <table>
              <thead>
               <tr>
                  <th>Question Label</th>
                  <th>Select</th>
                </tr>
            </thead>
              <tbody>
                {category.questions.map(question=> (
                  <tr key={question?.uuid}>
                    <td>{question?.questionStatement}</td>
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
                                                console.log("e t",e.target.checked)
                                                handleQuestionSelection(question.uuid, e.target.checked)
                                              }}
                                             // checked={true}
                                              checked={question.selected}
                                             // label={option}
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
            {((readOnly=== false || readOnly===undefined) && showQuestionTableList && category.questions.length>0 ) && (
          <label style={{ padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer"}}disable={readOnly} onClick={handleAddQuestions}>Add These Questions</label>
            )}

          <div>
            {(category.selectedQuestions.length>0 || readOnly===true) ?(
          <table>
              <thead>
               <tr>
                <th>Selected Category</th>
                  <th>Question Statement</th>
                  <th>Weightage</th>
                </tr>
            </thead>
              <tbody>
              {category.selectedQuestions.map((question,index) => (
                  <tr key={question.uuid}>
                    <td>{question.selectedCategory}</td>
                    <td>{question.questionStatement}</td>
                    <td>
                      {question.weightage}
                      {/* <input
                        type="checkbox"
                        readOnly={readOnly}
                        disabled={readOnly}
                        checked={question?.selected||false}
                        onChange={(e) => handleQuestionSelection(question.uuid, e.target.checked)}
                      /> */}
                       
                    </td>
                    <td>
                  <label onClick={() => handleDeleteQuestion(question)}>Delete</label>
                </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ):null}
          </div>
         </div>
     
    
      )}
        {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"false"} />}
    </div>
  );
};

export default CategoryCard;