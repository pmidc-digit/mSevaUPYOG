import React, { useEffect, useState, Fragment, useRef } from "react";
import { Controller, useFormContext, useForm } from "react-hook-form";
import { Card, CardLabelError, CheckBox, RadioButtons, TextArea, TextInput, Toast,Localities,CardLabel,Dropdown } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const FillQuestions = (props) => {
 
  const { t } = useTranslation();
  const [formData, setFormData] = useState({});
  const { data: cities, isLoading } = Digit.Hooks.useTenants();
  const [city,setCity]=useState(null);
  const [geoLocation,setGeoLocation]= useState({
    latitude: null,
    longitude: null,
  });
  const [pincode,setPincode]=useState('')
  const [isgeoLoc,setIsGeoLoc]=useState(false)
  const [hasCitizenDetails,setHasCitizenDetails]=useState(false)

  const {
    register: register,
    control: control,
    handleSubmit: handleSurveyFormSubmit,
    setValue: setSurveyFormValue,
    getValues: getSurveyFormValues,
    reset: resetSurveyForm,
    formState: {formErrors},
    clearErrors: clearSurveyFormsErrors,
  } = useForm({
    defaultValues: formData,
  });
  console.log("formState",formErrors)
 
 // const formErrors = formState?.errors;

  const [showToast, setShowToast] = useState(null);
  const [locality,setLocality] = useState([])
  
 
  // const [userInfo,setUserInfo]=useState([])
  const tenantId = Digit.ULBService.getCurrentTenantId();
  // const { data: localities } = Digit.Hooks.useBoundaryLocalities(tenantId, "admin", {}, t);
  // console.log("localities",localities)
  const userType = props.userType;
  console.log("usertype",userType)
  const history = useHistory();
  const prevFormDataRef = useRef({});
  // const data=
  //  [{
  //     "uuid": "SS-1012/2024-25/000171",
  //     "tenantId": "pb.testing",
  //     "surveyTitle": "Testing one",
  //     "surveyCategory": "Testing one",
  //     "surveyDescription": "example",
  //     "sections": [
  //         {
  //             "uuid": "7fea480a-4398-4935-99dd-a1901827ab92",
  //             "title": "Title1",
  //             "weightage": 100,
  //             "questions": [
  //                 {
  //                     "questionUuid": "8904f992-e2fe-4720-ba52-727555691a7b",
  //                     "sectionUuid": "7fea480a-4398-4935-99dd-a1901827ab92",
  //                     "qorder": null,
  //                     "question": {
  //                         "uuid": "8904f992-e2fe-4720-ba52-727555691a7b",
  //                         "tenantId": "pb.testing",
  //                         "questionStatement": "First Question regarding Demo",
  //                         "options": [
  //                             "Yes",
  //                             "No",
  //                             "May be"
  //                         ],
  //                         "auditDetails": {
  //                             "createdBy": "120ee55c-ab07-4e62-8317-5e5700f86597",
  //                             "lastModifiedBy": "120ee55c-ab07-4e62-8317-5e5700f86597",
  //                             "createdTime": 1740740112660,
  //                             "lastModifiedTime": 1741173060405
  //                         },
  //                         "status": "ACTIVE",
  //                         "type": "MULTIPLE_ANSWER_TYPE",
  //                         "required": false,
  //                         "qorder": 0,
  //                         "categoryId": "9b8b9243-4f86-4032-9a90-b8da78f03664"
  //                     },
  //                     "weightage": 50
  //                 },
  //                 {
  //                     "questionUuid": "cbdd5045-252f-45bc-9715-66b3c79a265e",
  //                     "sectionUuid": "7fea480a-4398-4935-99dd-a1901827ab92",
  //                     "qorder": null,
  //                     "question": {
  //                         "uuid": "cbdd5045-252f-45bc-9715-66b3c79a265e",
  //                         "tenantId": "pb.testing",
  //                         "questionStatement": "Second Question regarding Demo",
  //                         "options": [
  //                             "Yes",
  //                             "No",
  //                             "Test Text"
  //                         ],
  //                         "auditDetails": {
  //                             "createdBy": "120ee55c-ab07-4e62-8317-5e5700f86597",
  //                             "lastModifiedBy": "120ee55c-ab07-4e62-8317-5e5700f86597",
  //                             "createdTime": 1740740112661,
  //                             "lastModifiedTime": 1741173345841
  //                         },
  //                         "status": "ACTIVE",
  //                         "type": "CHECKBOX_ANSWER_TYPE",
  //                         "required": false,
  //                         "qorder": 0,
  //                         "categoryId": "9b8b9243-4f86-4032-9a90-b8da78f03664"
  //                     },
  //                     "weightage": 50
  //                 }
  //             ]
  //         }
  //     ],
  //     "startDate": 1741341960000,
  //     "endDate": 1743717960000,
  //     "postedBy": "Manasa",
  //     "auditDetails": null,
  //     "active": true,
  //     "answersCount": 0,
  //     "hasResponded": false,
  //     "createdTime": 1741255647601,
  //     "lastModifiedTime": 1741255647601
  // }];
  const prevProps = props.location.state;
  console.log("props", props);
  console.log("prevProps",prevProps)
  const data = prevProps.surveyDetails;

  console.log("data", data);
  useEffect(()=>{
  let payload={
    "surveyUuid":data.uuid,
    "citizenId": prevProps.userInfo.uuid
  }
    try {
      Digit.Surveys.getAnswers(payload).then((response) => {
        if (response?.sectionResponses.length > 0) {
          console.log("response",response)
        //  let ans={}
        //   response.sectionResponses.map((section)=>{
        //     let updateAns={}
        //     section.questionResponses.map((question)=>{
        //       let obj={
        //         [question.questionUuid]: question.answer
        //       }
        //      let answerSub={ [section.sectionUuid]:obj}
        //      updateAns={...updateAns,...answerSub}
        //     })
          
        //    ans={...ans,updateAns}
        //   })

          let result = {};

          response.sectionResponses.forEach(section => {
    let sectionObj = {};
    section.questionResponses.forEach(question => {
        sectionObj[question.questionUuid] = {answer:question.answer,answerUuid:question.answerUuid};
    });
    result[section.sectionUuid] = sectionObj;
});

          setFormData(result)
          return;
        } else {
          console.log(response);
        }
      });
    } catch (error) {
      console.log(error);
    }
  },[])
  const fetchPosition =  () => {
    navigator.geolocation.getCurrentPosition(
       (position) => {
         // Update both latitude and longitude in a single state object
         setIsGeoLoc(true)
         setGeoLocation({
           latitude: position.coords.latitude,
           longitude: position.coords.longitude,
         });
         console.log("Latitude:", position.coords.latitude);
         console.log("Longitude:", position.coords.longitude);
        
       },
       (err) => {
         if (err.code === 1) {
           setIsGeoLoc(false)
           alert("Location access is mandatory. Without it, we cannot proceed.");
         } else {
           console.log("Error fetching location:", err.message);
           setIsGeoLoc(false)
         }
       }
     );
   };
  useEffect(()=>{
    
    if((prevProps?.userType).toUpperCase()==="CITIZEN"){
    const data = {
      userName: prevProps?.userInfo?.mobileNumber,
      tenantId: prevProps?.userInfo?.tenantId,
    };
    const filters = {
      tenantId: prevProps?.userInfo?.tenantId,
    };

    Digit.Surveys.userSearch(data, filters)
      .then((response) => {
        console.log("response", response);
      
        if ((response?.responseInfo?.status === "200" || response?.responseInfo?.status === "201") && response?.user.length>0) {
        // setCitizenFound(true)
        if(response?.user[0]?.gender===null || response?.user[0]?.email===null || response?.user[0]?.dob===null || response?.user[0]?.gender==='' || response?.user[0]?.email==='' || response?.user[0]?.dob==='' )
          {
        console.log("hola")
         setHasCitizenDetails(false)

          
        }
        else{
          console.log("hola true")
          const today = new Date();
          const birthDate = new Date(response?.user[0]?.dob);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDifference = today.getMonth() - birthDate.getMonth();
    
          if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
              age--;
          }
    
          if (age < 15 || age > 100) {
            setHasCitizenDetails(false)
              alert('Citizen age must be between 15 and 100 years.');
              return;
          } else {
         
          setHasCitizenDetails(true)
          fetchPosition();
          }
        } 
      }
        else {
        
         // setCitizenFound(false)
         setShowToast({ key: true, isError: true, label: `ERROR FILE FETCHING CITIZEN DETAILS` });
         
        }
      
      })
      .catch((error) => {
        console.log(error);
      });
    }
  },[])
 
  // useEffect(() => {
  //   const savedData = localStorage.getItem("surveyFormData");
  //   if (savedData) {
  //     setFormData(JSON.parse(savedData));
  //   }
  // }, []);
  // useEffect(() => {
  //   localStorage.setItem("surveyFormData", JSON.stringify(formData));
  // }, [formData]);

  //   useEffect(()=>{
  //   let data={
  //       userName: citizenData?.mobile,
  //       tenantId: tenantId.split(".")[0]
  //   }
  //   const filters={
  //       tenantId: tenantId.split(".")[0]
  //   }
  //   try{

  //       Digit.Surveys.userSearch(data,filters).then((response) => {
  //           setUserInfo(response.user);
  //       })
  //   }
  //   catch(error)
  // {
  //   console.log(error);
  // }
  //   },[])
  const handleCheckboxChange = (section, event) => {
    const { value, checked } = event.target;
    setFormData((prevData) => {
      const newCheckboxes = checked ? [...prevData[section].checkboxes, value] : prevData[section].checkboxes.filter((item) => item !== value);
      return { ...prevData, [section]: { ...prevData[section], checkboxes: newCheckboxes } };
    });
  };

  const handleInputChange = (sectionId, questionId, questionType,answerWeightage,value,answerUuid) => {
    setFormData((prevData) => ({
      ...prevData,
      [sectionId]: {
        ...prevData[sectionId],
        [questionId]: { ...prevData?.[sectionId]?.[questionId],answer:value,answerUuid:answerUuid, answerType: questionType,weightage:(questionType==="MULTIPLE_ANSWER_TYPE"||questionType==="CHECKBOX_ANSWER_TYPE")?answerWeightage:null},
      },
    }));
  };
  const handleFieldChange = (sectionId, questionId, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [sectionId]: {
        ...prevData[sectionId],
        [questionId]: 
        { 
          ...prevData?.[sectionId]?.[questionId],
          comments:value
        },
      },
    }));
  };
  // const handleFieldChange = (event) => {
  //   const { name, value } = event.target;
  //   console.log("date value", event.target);
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: value,
  //   }));
  // };
  console.log("formData", formData);
  const handleDropdownChange = (name, event) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: event,
    }));
  };
  const [errors, setErrors] = useState({});


  useEffect(() => {
    const interval = setInterval(() => {
      if (JSON.stringify(prevFormDataRef.current) !== JSON.stringify(formData)) {
        if((prevProps.citizenFill && (userType).toLowerCase()==="employee") || (userType).toLowerCase()==="citizen" ){
        prevFormDataRef.current = formData;
        handleAutoSave();
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [formData]);

  const handleAutoSave = async () => {
    let answerArr = [];
  //  let geolocationStr= geoLocation.latitude.concat(geoLocation.longitude;
    for (const sectionId in formData) {
      for (const questionId in formData[sectionId]) {
        answerArr.push({
          answerUuid: formData[sectionId][questionId].answerUuid,
          surveyUuid: data.uuid,
          questionUuid: questionId,
          sectionUuid: sectionId,
          comments: formData[sectionId][questionId]?.comments||"",
          answerDetails: [{
            answerType: formData[sectionId][questionId].answerType,
            answerContent:formData[sectionId][questionId].answer,
            weightage:formData[sectionId][questionId].weightage
          }]
        });
      }
    }
    //const { roles, ...newUserObject } = prevProps.userInfo[0];

    let payload = {
      User: {
        type:prevProps.userInfo.type,
        uuid:prevProps.userInfo.uuid,
        gender:(prevProps?.userType).toUpperCase()==="EMPLOYEE"? prevProps?.citizenData?.gender:prevProps.userInfo.gender,
        emailId: (prevProps?.userType).toUpperCase()==="EMPLOYEE"? prevProps?.citizenData?.email:prevProps.userInfo.emailId,
        dob:(prevProps?.userType).toUpperCase()==="EMPLOYEE"?prevProps?.citizenData?.dob: prevProps.userInfo.dob
      },

      SurveyResponse: {
        surveyUuid: data.uuid,
        tenantId:(prevProps?.userType).toUpperCase()==="EMPLOYEE"?prevProps?.citizenData?.city?.code: city?.code,
        status:"draft",
        locality:locality?.name,
        coordinates: `${geoLocation.latitude},${geoLocation.longitude}`,
        answers: answerArr,
      },
    };

    try {
      Digit.Surveys.submitSurvey(payload).then((response) => {
        if (response?.SubmitResponse.length > 0) {
        
         // return;
        } else {
          console.log(response);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  const validateForm = () => {
    const newErrors = {};
   
    data.sections.forEach((section) => {
      
      section.questions.forEach((question) => {
        
        const value = formData[section.uuid]?.[question.question.uuid || ""];
        if (question.required===true && (value.answer)?.length===0) {
        newErrors[section.uuid]={
          ...newErrors[section.uuid],
          [question.question.uuid]: {...newErrors[section.uuid]?.[question.question.uuid], answerRequired: `${question.questionStatement} is required*`},
        }
          //newErrors[question.question.uuid].answerRequired = `${question.questionStatement} is required`
        }
        console.log("value",value)
        if ((value?.answer)?.length>500) {
         // newErrors[question.question.uuid].answerLength = "Answer length allowed only to 500 characters"
         newErrors[section.uuid]={
          ...newErrors[section.uuid],
          [question.question.uuid]: {...newErrors[section.uuid]?.[question.question.uuid], answerLength: "Answer length allowed only to 500 characters*"},
        }
        }
        if ((value?.comments)?.length>500) {
         // newErrors[question.question.uuid].commentsLength = "Comments length allowed only to 500 characters"
         newErrors[section.uuid]={
          ...newErrors[section.uuid],
          [question.question.uuid]: {...newErrors[section.uuid]?.[question.question.uuid], commentsLength: "Comments length allowed only to 500 characters*"},
        }
        }
      
      });
    });
    setErrors(newErrors);
    console.log("errors", newErrors);
    return Object.keys(newErrors).length === 0;
  };
  console.log("locality",locality)
  const handleSubmitSurvey = () => {
    let answerArr = [];
    let geolocationStr= geoLocation.latitude+ geoLocation.longitude;
    for (const sectionId in formData) {
      for (const questionId in formData[sectionId]) {
        answerArr.push({
          answerUuid: formData[sectionId][questionId].answerUuid,
          surveyUuid: data.uuid,
          questionUuid: questionId,
          sectionUuid: sectionId,
          comments: formData[sectionId][questionId]?.comments||"",
         // answer: [formData[sectionId][questionId].answer],
         answerDetails: [{
          answerType: formData[sectionId][questionId].answerType,
          answerContent:formData[sectionId][questionId].answer,
          weightage:formData[sectionId][questionId].weightage
        }]
        });
      }
    }
    //const { roles, ...newUserObject } = prevProps.userInfo;
    
    let payload = {

      User: {
        type:prevProps.userInfo.type,
        uuid:prevProps.userInfo.uuid,
        gender:(prevProps?.userType).toUpperCase()==="EMPLOYEE"? prevProps?.citizenData?.gender:prevProps.userInfo.gender,
        emailId: (prevProps?.userType).toUpperCase()==="EMPLOYEE"? prevProps?.citizenData?.email:prevProps.userInfo.emailId,
        dob:(prevProps?.userType).toUpperCase()==="EMPLOYEE"?prevProps?.citizenData?.dob: prevProps.userInfo.dob

      },

      SurveyResponse: {
        surveyUuid: data.uuid,
        tenantId:(prevProps?.userType).toUpperCase()==="EMPLOYEE"?prevProps?.citizenData?.city?.code: city?.code,
        status:"submitted",
        locality:locality?.name,
        coordinates: `${geoLocation.latitude},${geoLocation.longitude}`,

        answers: answerArr,
      },
    };

    try {
      Digit.Surveys.submitSurvey(payload).then((response) => {
        if (response?.SubmitResponse.length > 0) {
          userType.toUpperCase()==="EMPLOYEE"?
          history.push("/digit-ui/employee/engagement/surveys/submit-response", {
            message: "SURVEY FORM SUBMITTED SUCCESSFULLY",
            response: response,
            isSuccess: true,
          }): 
          history.push("/digit-ui/citizen/engagement/surveys/submit-survey-response", {
            message: "SURVEY FORM SUBMITTED SUCCESSFULLY",
            response: response,
            isSuccess: true,
          });
          
          return;
        } else {
          console.log(response);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("citizen fill", prevProps.citizenFill);
    if ((prevProps.citizenFill && (userType).toLowerCase()==="employee") || (userType).toLowerCase()==="citizen" ) {
      if (validateForm()) {
        console.log("Form submitted:", formData);
        handleSubmitSurvey();
      }
    } else {
      setShowToast({ key: true, isError: true, label: `PLEASE FILL CITIZEN DETAILS` });
      return;
    }
  };
  const onSubmit = (data) => {
    console.log("data", data);
  };
  //console.log("formState", formState);
  const displayAnswerField = (answerType, question, section) => {
    console.log("answer type", answerType, question);
    console.log("fetched ans", formData[section.uuid]?.[question.uuid])
    switch (answerType) {
      case "SHORT_ANSWER_TYPE":
        return (
              <>

          <TextInput
            name={question.uuid}
            //disabled={formDisabled}
            textInputStyle={{maxWidth:'none'}}
            value={formData[section.uuid]?.[question.uuid]?.answer}
            onChange={(e) => handleInputChange(section.uuid, question.uuid, question.type,null, e.target.value,formData[section.uuid]?.[question.uuid]?.answerUuid)}
            type="text"
            inputRef={register({
              maxLength: {
                value: 200,
                message: t("EXCEEDS_200_CHAR_LIMIT"),
              },
              required: question.required,
            })}
          />
          {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerRequired  && (
                    <CardLabelError  style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.answerRequired}</CardLabelError>)}
                  {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerLength && (
                    <CardLabelError  style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.answerLength}</CardLabelError>)}
          <div 
          //style={{fontWeight:'bold'}}
          > {"Add Suggestions/Comments"}</div>
            <TextArea
  name={question.uuid}
  // disabled={formDisabled}
  value={formData[section.uuid]?.[question.uuid]?.comments}
  maxLength={500}
  style={{maxWidth:'none',marginBottom:'0px'}}
  onChange={(e) => handleFieldChange(section.uuid, question.uuid,e.target.value)}
  inputRef={register({
    maxLength: {
      value: 500,
      message: t("EXCEEDS_500_CHAR_LIMIT"),
    },
    
  })}
/>
{errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.commentsLength  && (
                    <CardLabelError style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.commentsLength}</CardLabelError>)}
               
                  
              </>
        );
      case "LONG_ANSWER_TYPE":
        return (
          <>
            <TextArea
              name={question.uuid}
              style={{maxWidth:'none'}}
              // disabled={formDisabled}
              value={formData[section.uuid]?.[question.uuid]?.answer}
              onChange={(e) => handleInputChange(section.uuid, question.uuid, question.type,null, e.target.value,formData[section.uuid]?.[question.uuid]?.answerUuid)}
              inputRef={register({
                maxLength: {
                  value: 500,
                  message: t("EXCEEDS_500_CHAR_LIMIT"),
                },
                required: question.required,
              })}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerRequired  && (
                    <CardLabelError  style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.answerRequired}</CardLabelError>)}
                  {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerLength && (
                    <CardLabelError  style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.answerLength}</CardLabelError>)}
          <div 
          //style={{fontWeight:'bold'}}
          > {"Add Suggestions/Comments"}</div>
            <TextArea
  name={question.uuid}
  // disabled={formDisabled}
  value={formData[section.uuid]?.[question.uuid]?.comments}
  maxLength={500}
  style={{maxWidth:'none',marginBottom:'0px'}}
  onChange={(e) => handleFieldChange(section.uuid, question.uuid, e.target.value)}
  inputRef={register({
    maxLength: {
      value: 500,
      message: t("EXCEEDS_500_CHAR_LIMIT"),
    },
    
  })}
/>
{errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.commentsLength  && (
                    <CardLabelError style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.commentsLength}</CardLabelError>)}
          </>
        );
      case "MULTIPLE_ANSWER_TYPE":
        return (
          <>
            {/* <select
                                    name="multipleChoice"
                                    value={formData.section2.multipleChoice}
                                    onChange={(e) => handleInputChange('section2', e)}
                                >
                                    <option value="">Select an option</option>
                                    <option value="choice1">Choice 1</option>
                                    <option value="choice2">Choice 2</option>
                                </select> */} 

            <div style={{ display: "flex", flexDirection: "column" }}>
              {question.options.map((option) => (
                <h4 key={option} style={{ display: "flex", alignItems: "center", marginBottom: "10px", fontSize: "18px" }}>
                  <input
                    type="radio"
                    name={question.uuid}
                    value={option?.optionText} 
                    checked={formData[section.uuid]?.[question.uuid]?.answer === option.optionText}
                    onChange={(e) => handleInputChange(section.uuid, question.uuid, question.type, option.weightage, e.target.value,formData[section.uuid]?.[question.uuid]?.answerUuid)}
                    required
                    style={{ marginRight: "10px", width: "25px", height: "25px" }}
                  />
                  {option?.optionText}
                </h4>
              ))}
            </div>
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerRequired  && (
                    <CardLabelError  style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.answerRequired}</CardLabelError>)}
                  {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerLength && (
                    <CardLabelError  style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.answerLength}</CardLabelError>)}
          <div 
          //style={{fontWeight:'bold'}}
          > {"Add Suggestions/Comments"}</div>
            <TextArea
  name={question.uuid}
  // disabled={formDisabled}
  value={formData[section.uuid]?.[question.uuid]?.comments}
  maxLength={500}
  style={{maxWidth:'none',marginBottom:'0px'}}
  onChange={(e) => handleFieldChange(section.uuid, question.uuid, e.target.value)}
  inputRef={register({
    maxLength: {
      value: 500,
      message: t("EXCEEDS_500_CHAR_LIMIT"),
    },
    
  })}
/>
{errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.commentsLength  && (
                    <CardLabelError style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.commentsLength}</CardLabelError>)}
            {/* <RadioButtons
                  
                  onSelect={(e)=>handleInputChange(section.uuid, question.uuid, e)}
                  selectedOption={formData[section.uuid]?.[question.uuid] || ''}
                  optionsKey=""
                  options={[...question.options]}
                 
                /> */}
            {/* <Controller
                  control={control}
                  name={question.uuid}
                  
                  rules={{ required: question.required }}
                  render={({ onChange, value }) => (
                    <RadioButtons
                  
                      onSelect={onChange}
                      selectedOption={value}
                      optionsKey=""
                      options={[...question.options]}
                     
                    />
                  )}
                />
                {formErrors && formErrors?.[question.uuid] && formErrors?.[question.uuid]?.type === "required" && (
                  <CardLabelError>{t(`EVENTS_TO_DATE_ERROR_REQUIRED`)}</CardLabelError>
                )} */}
          </>
        );
      case "CHECKBOX_ANSWER_TYPE":
        return (
          <>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {question.options.map((option) => (
                <h4 key={option} style={{ display: "flex", alignItems: "center", marginBottom: "10px", fontSize: "18px" }}>
                  <input
                    style={{ width: "25px", height: "25px", marginRight: "10px" }}
                    type="checkbox"
                    value={option?.optionText}
                    checked={formData[section.uuid]?.[question.uuid]?.answer.includes(option.optionText) || false}
                    onChange={(e) => {
                      const value = e.target.value;
                      const checked = e.target.checked;
                      setFormData((prevData) => {
                        const newValues = checked
                          ? [...(prevData[section.uuid]?.[question.uuid]?.answer || []), value]
                          : (prevData[section.uuid]?.[question.uuid]?.answer || []).filter((item) => item !== value);
                        return {
                          ...prevData,
                          [section.uuid]: {
                            ...prevData[section.uuid],
                         [question.uuid]:{answer:newValues,answerUuid:formData[section.uuid]?.[question.uuid]?.answerUuid,answerType:question.type,weightage:option.weightage}
                            // [question.uuid]: {answer:newValues},
                          },
                        };
                      });
                    }}
                  />
                  {option}
                </h4>
              ))}
            </div>
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerRequired  && (
                    <CardLabelError  style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.answerRequired}</CardLabelError>)}
                  {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerLength && (
                    <CardLabelError  style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.answerLength}</CardLabelError>)}
          <div 
          //style={{fontWeight:'bold'}}
          > {"Add Suggestions/Comments"}</div>
            <TextArea
  name={question.uuid}
  // disabled={formDisabled}
  value={formData[section.uuid]?.[question.uuid]?.comments}
  maxLength={500}
  style={{maxWidth:'none',marginBottom:'0px'}}
  onChange={(e) => handleFieldChange(section.uuid, question.uuid, e.target.value)}
  inputRef={register({
    maxLength: {
      value: 500,
      message: t("EXCEEDS_500_CHAR_LIMIT"),
    },
    
  })}
/>
{errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.commentsLength  && (
                    <CardLabelError style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.commentsLength}</CardLabelError>)}
            {/* <Controller
                  control={control}
                  name={question.uuid}
                  
                  rules={{ required:question.required }}
                  render={({ onChange, value }) => {
                    return (
                    <div className="align-columns">
                      {question.options.map((option) => {
                        return (
                          <CheckBox
                         
                            key={option}
                            onChange={(e) => {
                              if (e.target.checked) {
                                onChange([option,...value?value:[]]);             
                              } else {
                                value && onChange(value?.filter((item) => item !== option));
                              }
                            }}
                            checked={typeof value === "string" ? !!([value]?.find(e => e === option)) : !!value?.find(e => e === option)}
                            label={option}
                            checkboxWidth = {{width:"34px",height:"34px"}}
                            style={{marginTop:"5px", overflowWrap:"break-word"}}
                          />
                        );
                      })}
                    </div>
                  )}}
                />
                {formErrors && formErrors?.[question.uuid] && formErrors?.[question.uuid]?.type ==="required" && (
                  <CardLabelError style={{marginTop:"20px"}}>{t(`CS_COMMON_REQUIRED`)}</CardLabelError>
                )} */}
          </>
        );
      // case "CHECKBOX_ANSWER_TYPE":
      //   return (
      //     <>
      //     {question.options.map((option,index) => (
      //     <div>
      //       <label for="checkbox">
      //         <input
      //         control={control}
      //         id={option}
      //         type="checkbox"
      //         name={option}
      //         value={option}
      //         ref={register({
      //           required:false,
      //         })}
      //       />
      //         {option}</label>

      //     </div>
      //     ))}

      //       {formErrors && formErrors?.[question.uuid] && formErrors?.[question.uuid]?.type ==="required" && (
      //         <CardLabelError>{t(`CS_COMMON_REQUIRED`)}</CardLabelError>
      //       )}
      //     </>
      //   );
      case "DATE_ANSWER_TYPE":
        return (
          <>
            <TextInput
              type="date"
              textInputStyle={{maxWidth:'none'}}
              value={formData[section.uuid]?.[question.uuid]?.answer}
              onChange={(e) => handleInputChange(section.uuid, question.uuid,question.type,null, e.target.value,formData[section.uuid]?.[question.uuid]?.answerUuid)}
              // defaultValue={value}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerRequired  && (
                    <CardLabelError  style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.answerRequired}</CardLabelError>)}
                  {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerLength && (
                    <CardLabelError  style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.answerLength}</CardLabelError>)}
          <div 
          //style={{fontWeight:'bold'}}
          > {"Add Suggestions/Comments"}</div>
            <TextArea
  name={question.uuid}
  // disabled={formDisabled}
  value={formData[section.uuid]?.[question.uuid]?.comments}
  maxLength={500}
  style={{maxWidth:'none',marginBottom:'0px'}}
  onChange={(e) => handleFieldChange(section.uuid, question.uuid, e.target.value)}
  inputRef={register({
    maxLength: {
      value: 500,
      message: t("EXCEEDS_500_CHAR_LIMIT"),
    },
    
  })}
/>
{errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.commentsLength  && (
                    <CardLabelError style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.commentsLength}</CardLabelError>)}
          </>
        );
      // return (
      //   <>
      //    <Controller
      //           control={control}
      //           name={question.uuid}
      //           //defaultValue=
      //           rules={{
      //             required: question.required,
      //             // validate: { isValidToDate }
      //           }}

      //           render={({ onChange, value }) => <TextInput
      //           // disabled={formDisabled}
      //             type="date"  onChange={onChange} defaultValue={value} />}
      //         />
      //         {formErrors && formErrors?.[question.uuid] && formErrors?.[question.uuid]?.type === "required" && (
      //           <CardLabelError>{t(`EVENTS_TO_DATE_ERROR_REQUIRED`)}</CardLabelError>
      //         )}
      //  </>
      // );
      case "TIME_ANSWER_TYPE":
        return (
          <>
            <TextInput
              type="time"
              textInputStyle={{maxWidth:'none'}}
              value={formData[section.uuid]?.[question.uuid]?.answer}
              onChange={(e) => handleInputChange(section.uuid, question.uuid,question.type,null, e.target.value,formData[section.uuid]?.[question.uuid]?.answerUuid)}
              // defaultValue={value}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerRequired  && (
                    <CardLabelError  style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.answerRequired}</CardLabelError>)}
                  {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerLength && (
                    <CardLabelError  style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.answerLength}</CardLabelError>)}
          <div 
          //style={{fontWeight:'bold'}}
          > {"Add Suggestions/Comments"}</div>
            <TextArea
  name={question.uuid}
  // disabled={formDisabled}
  value={formData[section.uuid]?.[question.uuid]?.comments}
  maxLength={500}
  style={{maxWidth:'none',marginBottom:'0px'}}
  onChange={(e) => handleFieldChange(section.uuid, question.uuid, e.target.value)}
  inputRef={register({
    maxLength: {
      value: 500,
      message: t("EXCEEDS_500_CHAR_LIMIT"),
    },
    
  })}
/>
{errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.commentsLength  && (
                    <CardLabelError style={{marginTop:"0px", marginBottom:"0px",color:"red",fontWeight:'500'}}>{errors?.[section.uuid]?.[question.uuid]?.commentsLength}</CardLabelError>)}
          </>
        );
      //     return (
      //       <>
      //         <Controller
      //           control={control}
      //           name={question.uuid}
      //           //defaultValue={surveyFormState?.toTime}
      //           rules={{
      //             required: question.required,
      //             // validate: { isValidToTime }
      //           }}
      //           render={({ onChange, value }) => <TextInput type="time"
      //           //disabled={formDisabled}
      //            onChange={onChange} defaultValue={value} />}
      //         />
      //         {formErrors && formErrors?.[question.uuid] && formErrors?.[question.uuid]?.type === "required" && (
      //           <CardLabelError>{t(`EVENTS_TO_DATE_ERROR_REQUIRED`)}</CardLabelError>
      //         )}
      //       </>
      //     );

      default:
        return (
          <TextInput
            name={question.uuid}
            onChange={(e) => handleInputChange(section.uuid, question.uuid, e.target.value)}
            type="text"
            inputRef={register({
              maxLength: {
                value: 200,
                message: t("EXCEEDS_200_CHAR_LIMIT"),
              },
              required: question.required,
            })}
          />
        );
    }
  };
  console.log("data section", data.sections);
  data.sections.map((s) => console.log("data sec", s.title));
  const closeToast = () => {
    setShowToast(null);
  };
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    console.log("hii",hasCitizenDetails,(prevProps?.userType).toUpperCase())
    if(((prevProps?.userType).toUpperCase()==="EMPLOYEE") || ((prevProps?.userType).toUpperCase()==="CITIZEN" && hasCitizenDetails)){
      console.log("hii")
    fetchPosition(); // Automatically fetch location on component mount
    }
  
  }, []);
  console.log("city code",prevProps?.citizenData?.city?.code)
  console.log("formData",formData)
  console.log("pincode,location",pincode,geoLocation)
  console.log("city",city?.code)
  const handleCityChange=(e)=>{
    setCity(e)
  }
  const handleLocalityChange=(e)=>{
    setLocality(e)
  }
  console.log("formData",formData)
  return (
(   ( ((prevProps?.userType).toUpperCase()==="EMPLOYEE" || prevProps?.citizenFill) && isgeoLoc===true) || (prevProps?.userType).toUpperCase()==="CITIZEN" && hasCitizenDetails===true && isgeoLoc===true)?(
    <div className="create-survey-page" style={{ background: "white", display: "block", padding: "15px" }}>
      <div className="category-card">
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "black" }}>
            Survey Name: <span style={{ fontWeight: "normal", color: "black" }}>{data.surveyTitle}</span>
          </h2>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "black" }}>
            Survey Description: <span style={{ fontWeight: "normal", color: "black" }}>{data.surveyDescription}</span>
          </h2>
        </div>
        {(prevProps?.userType).toUpperCase()==="EMPLOYEE"?
        <>
        <CardLabel>{`${t("LOCALITY")}`} <span className="check-page-link-button">*</span></CardLabel>
        
           <Controller
            name="locality"
           defaultValue={locality}
            control={ control }
            rules={{required: t("REQUIRED_FIELD")}}
            render={({value, onBlur, onChange}) => (
              <Localities
                selectLocality={(value)=>{
                 
                  setLocality(value);
                }}
                tenantId={prevProps?.citizenData?.city?.code}
                boundaryType="revenue"
                keepNull={false}
                optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10" }}
                selected={locality}
                 disable={false}
                disableLoader={true}
                sortFn={(a, b) => (a.i18nkey < b.i18nkey ? -1 : 1)}
                //onBlur={onBlur}
              />
            )} />
            </>
            :<>
  <CardLabel>{`${t("CITY")}`} <span className="check-page-link-button">*</span></CardLabel>
             <Dropdown
                    required={true}
                    id="city"
                    name="city"
                    option={cities}
                    className="cityCss"
                    select={(e) => handleCityChange(e)}
                    placeholder={"Select City"}
                    optionKey="i18nKey"
                    t={t}
                    selected={city || null}
                  />
                   <CardLabel>{`${t("LOCALITY")}`} <span className="check-page-link-button">*</span></CardLabel>
      
        {/* <Controller
         name="locality"
        defaultValue={locality}
         control={ control }
         rules={{required: t("REQUIRED_FIELD")}}
         render={({value, onBlur, onChange}) => ( */}
           <Localities
             selectLocality={(value)=>{
              
               handleLocalityChange(value);
             }}
             tenantId={city?.code||""}
             boundaryType="revenue"
             keepNull={false}
             optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10" }}
             selected={locality}
              disable={false}
             disableLoader={true}
             sortFn={(a, b) => (a.i18nkey < b.i18nkey ? -1 : 1)}
             //onBlur={onBlur}
           />
         {/* )}  */}
         {/* /> */}

          {/* <Dropdown
               option={sortFn ? tenantlocalties?.sort(sortFn) : tenantlocalties}
               keepNull={keepNull === false ? false : true}
               selected={locality}
               select={}
               optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10" }}
               optionKey="i18nkey"
               
               disable={false}
             /> */}
                  </>
          }
        <form onSubmit={handleSubmit}>
          {data.sections.length > 0
            ? data.sections.map((section) => (
                <div>
                  <h2>{section.title}</h2>
                  {section.questions.map((question, index) => (
                    <div>
                      <h3>{question.questionStatement}</h3>
                      <div className="surveyQuestion-wrapper">
                        <div style={{ display: "inline"}}>
                        {index + 1}. {question.question.questionStatement} {question.question?.required&&<span style={{ color: "red" }}>*</span>}
                        </div>
                        {displayAnswerField(question.question.type, question.question, section)}
                        {errors[question.uuid] && <span className="error">{errors[question.uuid]}</span>}
                        <div>

              
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            : null}
          {/* <button
            onClick={
              () => history.goBack()
              // history.push("/digit-ui/employee/engagement/surveys/fill-citizen-details-survey")
            }
          >
            Back
          </button> */}
          <button type="submit" style={{ marginLeft: "10px" }}>
            Submit
          </button>
        </form>
      </div>
      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"false"} />}
    </div>
    ): 
    (  (prevProps?.userType).toUpperCase()==="CITIZEN" && hasCitizenDetails===false)?(
      <div className="create-survey-page" style={{ background: "white", display: "block", padding: "15px" }}>
        <h3 style={{color:'red', fontSize:'20px'}}>Please fill in your basic details to proceed with the survey</h3>
        <h4 style={{fontSize:'16px'}}>Click on below button to fill in your details</h4>
        <button onClick={()=>history.push("/digit-ui/citizen/user/profile")}
         style={{padding: "10px 20px",
         border: "none",
         borderRadius: "4px",
         backgroundColor: "#007bff",
         color: "white",
         marginTop:'10px'
         //cursor: "pointer"
        }}
          >Fill your details : Name, Gender, DOB and Email are required</button>
      </div>
    ):
    null
    //  (
    //   <div className="create-survey-page" style={{ background: "white", display: "block", padding: "15px" }}>
    //     <TextInput name="pincode" value={pincode} onChange={(e)=>setPincode(e.target.value)}/>
    //       <SelectGeolocation pincode={pincode} geoLocation={geoLocation} setPincode={setPincode} setGeoLocation={setGeoLocation}/>
    //   </div>
    // )
  );
};

export default FillQuestions;
