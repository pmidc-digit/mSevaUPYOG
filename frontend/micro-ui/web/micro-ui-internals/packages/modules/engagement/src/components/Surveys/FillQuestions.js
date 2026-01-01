import React, { useEffect, useState, Fragment, useRef } from "react";
import { Controller, useFormContext, useForm } from "react-hook-form";
import {
  Card,
  CardLabelError,
  CheckBox,
  RadioButtons,
  TextArea,
  TextInput,
  Toast,
  Localities,
  CardLabel,
  Dropdown,
  Loader,
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import Dialog from "../Modal/Dialog";

const FillQuestions = (props) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({});
  const { data: cities, isLoading } = Digit.Hooks.useTenants();
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [localityList, setLocalityList] = useState(null);
  const [openQuesDetailsDialog, setOpenQuesDetailsDialog] = useState(false);
  const [geoLocation, setGeoLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [getFetchAnswers, setFetchAnswers] = useState();
  const [pincode, setPincode] = useState("");
  const [isgeoLoc, setIsGeoLoc] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const prevProps = props.location.state;
  // let isgeoLoc = false
  const [hasCitizenDetails, setHasCitizenDetails] = useState(null);
  console.log("city", localStorage.getItem("CITIZEN.CITY"));
  // let { data: tenantlocalties, isLoadingLocality } = Digit.Hooks.useBoundaryLocalities(city, "revenue", { enabled: !!city }, t);
  useEffect(() => {
    (async () => {
      setLoading(true);
      let response = await Digit.LocationService.getLocalities(city);
      setLoading(false);
      let __localityList = [];
      if (response && response.TenantBoundary.length > 0) {
        setLoading(true);
        __localityList = Digit.LocalityService.get(response.TenantBoundary[0]);
        setLoading(false);
      }

      setLocalityList(__localityList);
    })();
  }, [city]);

  useEffect(() => {
    (async () => {
      if ((prevProps?.userType).toUpperCase() === "EMPLOYEE") {
        setLoading(true);
        let response = await Digit.LocationService.getLocalities(prevProps.citizenData.city?.code);
        setLoading(false);
        let __localityList = [];
        if (response && response.TenantBoundary.length > 0) {
          setLoading(true);
          __localityList = Digit.LocalityService.get(response.TenantBoundary[0]);
          setLoading(false);
        }
        const localityDropdownOptions = (__localityList || [])
          ?.map((item) => {
            const wardMatch = item.name.match(/Ward\s(\d+)/);
            const wardNumber = wardMatch ? Number(wardMatch[1]) : Infinity;

            return {
              ...item,
              wardNumber,
            };
          })
          ?.sort((a, b) => a.wardNumber - b.wardNumber);
        setLocalityList(localityDropdownOptions);
      }
    })();
  }, []);

  const {
    register: register,
    control: control,
    handleSubmit: handleSurveyFormSubmit,
    setValue: setSurveyFormValue,
    getValues: getSurveyFormValues,
    reset: resetSurveyForm,
    formState: { formErrors },
    clearErrors: clearSurveyFormsErrors,
  } = useForm({
    defaultValues: formData,
  });

  // const formErrors = formState?.errors;

  const [showToast, setShowToast] = useState(null);
  const [locality, setLocality] = useState(null);

  // const [userInfo,setUserInfo]=useState([])

  // const { data: localities } = Digit.Hooks.useBoundaryLocalities(tenantId, "admin", {}, t);
  const userType = props.userType;
  const history = useHistory();
  const [questionDetailsContent, setQuestionDetailsContent] = useState(false);

  function handleDisplayQuesDetails() {
    setOpenQuesDetailsDialog(true);
    const content = (
      <div className="create-survey-page" style={{ background: "white", display: "block", padding: "15px" }}>
        <h3 style={{ color: "red", fontSize: "20px" }}>This Survey is already submitted. Cannot be reSubmitted</h3>
        <h4 style={{ fontSize: "16px" }}>Click on below button to go back</h4>
        <button
          onClick={() =>
            (prevProps?.userType).toUpperCase() === "CITIZEN"
              ? history.push("/digit-ui/citizen/engagement/surveys/active-open-surveys")
              : history.push("/digit-ui/employee/engagement/surveys/active-open-surveys")
          }
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#007bff",
            color: "white",
            marginTop: "10px",
            //cursor: "pointer"
          }}
        >
          Go Back
        </button>
      </div>
    );
    setQuestionDetailsContent(content);
  }

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

  let data = prevProps.surveyDetails;
  console.log("data", data);

  data = {
    ...data,
    sections: data.sections
      .sort((a, b) => a.sectionOrder - b.sectionOrder)
      .map((section) => ({
        ...section,
        questions: section.questions
          .sort((a, b) => a.qorder - b.qorder)
          .map((question) => ({
            ...question,
            question: {
              ...question.question,
              options: question.question.options.sort((a, b) => a?.optionOrder - b?.optionOrder),
            },
          })),
      })),
  };
  const fetchAnswer = async (status) => {
    setLoading(true);
    let payload = {
      surveyUuid: data.uuid,
      citizenId: prevProps.userInfo.uuid,
      tenantId: city === null ? (window.location.href.includes("/employee") ? prevProps?.citizenData?.city?.code : city) : city,
    };
    try {
      Digit.Surveys.getAnswers(payload).then((response) => {
        setLoading(false);
        if (response?.sectionResponses.length > 0) {
          let result = {};

          response.sectionResponses.forEach((section) => {
            let sectionObj = {};
            section.questionResponses.forEach((question) => {
              sectionObj[question.questionUuid] = { ...formData[section.sectionUuid][question.questionUuid], answerUuid: question.answerUuid };
            });
            result[section.sectionUuid] = sectionObj;
          });

          setFormData(result);

          if (status === "draft") {
            handleAutoSave();
          } else {
            handleSubmitSurvey();
          }
          return;
        } else {
          if (status === "draft") {
            handleAutoSave();
          } else {
            handleSubmitSurvey();
          }
        }
      });
    } catch (error) {
      setLoading(false);
      return error;
    }
  };

  const fetchSurveyAnswers = async () => {
    setLoading(true);
    let payload = {
      surveyUuid: data.uuid,
      citizenId: prevProps.userInfo.uuid,
      tenantId:
        city === null || city === undefined
          ? window.location.href.includes("/employee")
            ? prevProps?.citizenData?.city?.code
            : localStorage.getItem("CITIZEN.CITY")
          : city,
    };
    try {
      Digit.Surveys.getAnswers(payload).then((response) => {
        setFetchAnswers(response);
        setLoading(false);
        if (response?.sectionResponses.length > 0) {
          if (response.status == "Draft") {
            setSubmitted(false);
            if ((prevProps?.userType).toUpperCase() === "CITIZEN") {
              fetchUserDetails();
            } else {
              fetchPosition();
            }
          }
          if (response.status === "Submit") {
            setSubmitted(true);
            handleDisplayQuesDetails();
            return;
          }
          let result = {};

          response.sectionResponses.forEach((section) => {
            let sectionObj = {};
            section.questionResponses.forEach((question) => {
              sectionObj[question.questionUuid] = {
                answer: question.answerResponse.answerDetails[0].answerContent,
                answerUuid: question.answerUuid,
                comments: question.comments,
                weightage: question.answerResponse.answerDetails[0].weightage,
              };
            });
            result[section.sectionUuid] = sectionObj;
          });
          setFormData(result);
          return;
        } else {
          if ((prevProps?.userType).toUpperCase() === "CITIZEN") {
            fetchUserDetails();
          } else {
            fetchPosition();
          }
        }
      });
    } catch (error) {
      setLoading(false);
      return error;
    }
  };

  useEffect(() => {
    fetchSurveyAnswers();
  }, [data.uuid, prevProps.userInfo.uuid]);

  const fetchPosition = async () => {
    // if (((prevProps?.userType).toUpperCase() === "EMPLOYEE" && !isgeoLoc && submitted===false) || ((prevProps?.userType).toUpperCase() === "CITIZEN" && hasCitizenDetails && submitted===false)) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Update both latitude and longitude in a single state object
        setIsGeoLoc(true);
        //  isgeoLoc = true
        setGeoLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        return;
      },
      (err) => {
        if (err.code === 1) {
          setIsGeoLoc(false);
          // isgeoLoc = false
          alert("Location access is mandatory. Without it, we cannot proceed.");
          return;
        } else {
          setIsGeoLoc(false);
          //isgeoLoc = false
        }
      }
    );
    // }
  };

  const fetchUserDetails = async () => {
    setLoading(true);
    // if ((prevProps?.userType).toUpperCase() === "CITIZEN") {
    const data = {
      //userName: prevProps?.userInfo?.mobileNumber,
      uuid: [prevProps?.userInfo?.uuid],
      tenantId: prevProps?.userInfo?.tenantId,
    };
    const filters = {
      tenantId: prevProps?.userInfo?.tenantId,
    };

    Digit.Surveys.userSearch(data, filters)
      .then((response) => {
        setLoading(false);
        if ((response?.responseInfo?.status === "200" || response?.responseInfo?.status === "201") && response?.user.length > 0) {
          // setCitizenFound(true)
          if (
            response?.user[0]?.gender === null ||
            response?.user[0]?.emailId === null ||
            response?.user[0]?.dob === null ||
            response?.user[0]?.gender === "" ||
            response?.user[0]?.emailId === "" ||
            response?.user[0]?.dob === ""
          ) {
            setHasCitizenDetails(false);
          } else {
            const today = new Date();
            const birthDate = new Date(response?.user[0]?.dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();

            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }

            if (age < 15 || age > 100) {
              setHasCitizenDetails(false);
              alert("Citizen age must be between 15 and 100 years.");
              return;
            } else {
              setHasCitizenDetails(true);

              fetchPosition();
            }
          }
        } else {
          // setCitizenFound(false)
          setShowToast({ key: true, isError: true, label: `ERROR FILE FETCHING CITIZEN DETAILS` });
        }
      })
      .catch((error) => {
        setLoading(false);
        return error;
      });
    //}
  };

  // useEffect(() => {
  //   // const fetchUserDetails = async () => {
  //   //   if ((prevProps?.userType).toUpperCase() === "CITIZEN") {
  //   //     const data = {
  //   //       userName: prevProps?.userInfo?.mobileNumber,
  //   //       tenantId: prevProps?.userInfo?.tenantId,
  //   //     };
  //   //     const filters = {
  //   //       tenantId: prevProps?.userInfo?.tenantId,
  //   //     };

  //   //     Digit.Surveys.userSearch(data, filters)
  //   //       .then((response) => {

  //   //         if ((response?.responseInfo?.status === "200" || response?.responseInfo?.status === "201") && response?.user.length > 0) {
  //   //           // setCitizenFound(true)
  //   //           if (response?.user[0]?.gender === null || response?.user[0]?.email === null || response?.user[0]?.dob === null || response?.user[0]?.gender === '' || response?.user[0]?.email === '' || response?.user[0]?.dob === '') {
  //   //             setHasCitizenDetails(false)

  //   //           }
  //   //           else {
  //   //             const today = new Date();
  //   //             const birthDate = new Date(response?.user[0]?.dob);
  //   //             let age = today.getFullYear() - birthDate.getFullYear();
  //   //             const monthDifference = today.getMonth() - birthDate.getMonth();

  //   //             if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
  //   //               age--;
  //   //             }

  //   //             if (age < 15 || age > 100) {
  //   //               setHasCitizenDetails(false)
  //   //               alert('Citizen age must be between 15 and 100 years.');
  //   //               return;
  //   //             } else {

  //   //               setHasCitizenDetails(true)
  //   //               // fetchPosition();
  //   //             }
  //   //           }
  //   //         }
  //   //         else {

  //   //           // setCitizenFound(false)
  //   //           setShowToast({ key: true, isError: true, label: `ERROR FILE FETCHING CITIZEN DETAILS` });

  //   //         }

  //   //       })
  //   //       .catch((error) => {
  //   //         console.log(error);
  //   //       });
  //   //   }

  //   // };

  //  // fetchUserDetails();
  // }, [prevProps?.userType, prevProps?.userInfo])

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

  const handleInputChange = (sectionId, questionId, questionType, answerWeightage, value, answerUuid) => {
    setFormData((prevData) => ({
      ...prevData,
      [sectionId]: {
        ...prevData[sectionId],
        [questionId]: {
          ...prevData?.[sectionId]?.[questionId],
          answer: value,
          answerUuid: answerUuid,
          answerType: questionType,
          weightage:
            questionType === "MULTIPLE_ANSWER_TYPE" || questionType === "CHECKBOX_ANSWER_TYPE" || questionType === "DROP_DOWN_MENU_ANSWER_TYPE"
              ? answerWeightage
              : null,
        },
      },
    }));
  };

  const handleFieldChange = (sectionId, questionId, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [sectionId]: {
        ...prevData[sectionId],
        [questionId]: {
          ...prevData?.[sectionId]?.[questionId],
          comments: value,
        },
      },
    }));
  };

  // const handleFieldChange = (event) => {
  //   const { name, value } = event.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: value,
  //   }));
  // };

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
        if ((prevProps.citizenFill && userType.toLowerCase() === "employee") || userType.toLowerCase() === "citizen") {
          prevFormDataRef.current = formData;
          // handleAutoSave();
          if (locality) fetchAnswer("draft");
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [formData]);

  const handleAutoSave = async () => {
    setLoading(true);
    let answerArr = [];
    //  let geolocationStr= geoLocation.latitude.concat(geoLocation.longitude;
    for (const sectionId in formData) {
      for (const questionId in formData[sectionId]) {
        answerArr.push({
          uuid: formData[sectionId][questionId].answerUuid,
          surveyUuid: data.uuid,
          questionUuid: questionId,
          sectionUuid: sectionId,
          comments: formData[sectionId][questionId]?.comments || "",
          answerDetails: [
            {
              answerType: formData[sectionId][questionId].answerType,
              answerContent:
                formData[sectionId][questionId].answerType === "CHECKBOX_ANSWER_TYPE"
                  ? formData[sectionId][questionId].answer.join(",")
                  : formData[sectionId][questionId].answer,
              weightage: formData[sectionId][questionId].weightage,
            },
          ],
        });
      }
    }
    //const { roles, ...newUserObject } = prevProps.userInfo[0];
    let payload = {
      User: {
        type: prevProps.userInfo.type,
        uuid: prevProps.userInfo.uuid,
        gender: (prevProps?.userType).toUpperCase() === "EMPLOYEE" ? prevProps?.citizenData?.gender : prevProps.userInfo.gender,
        emailId: (prevProps?.userType).toUpperCase() === "EMPLOYEE" ? prevProps?.citizenData?.email : prevProps.userInfo.emailId,
        dob: (prevProps?.userType).toUpperCase() === "EMPLOYEE" ? prevProps?.citizenData?.dob : prevProps.userInfo.dob,
      },

      SurveyResponse: {
        surveyUuid: data.uuid,
        //tenantId: city,
        tenantId:
          city === null
            ? window.location.href.includes("/employee")
              ? prevProps?.citizenData?.city?.code
              : localStorage.getItem("CITIZEN.CITY")
            : city,
        city:
          city === null
            ? window.location.href.includes("/employee")
              ? prevProps?.citizenData?.city?.code
              : localStorage.getItem("CITIZEN.CITY")
            : city,
        locality: locality,
        tenantId:
          city === null
            ? window.location.href.includes("/employee")
              ? prevProps?.citizenData?.city?.code
              : localStorage.getItem("CITIZEN.CITY")
            : city,
        // tenantId: (prevProps?.userType).toUpperCase() === "EMPLOYEE" ? prevProps?.citizenData?.city?.code : city?.code,
        status: "Draft",
        coordinates: `${geoLocation.latitude},${geoLocation.longitude}`,
        answers: answerArr,
      },
    };

    try {
      Digit.Surveys.submitSurvey(payload).then((response) => {
        setLoading(false);
        if (response?.SubmitResponse !== undefined) {
          // return;
        } else {
          setShowToast({ key: true, isError: true, label: `${response?.Errors?.message}` });
        }
      });
    } catch (error) {
      setLoading(false);
      return error;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    data.sections.forEach((section) => {
      section.questions.forEach((question) => {
        const value = formData[section.uuid]?.[question.question.uuid || ""];
        if (question.required === true && value?.answer?.length === 0) {
          newErrors[section.uuid] = {
            ...newErrors[section.uuid],
            [question.question.uuid]: {
              ...newErrors[section.uuid]?.[question.question.uuid],
              answerRequired: `${question.question.questionStatement} is required*`,
            },
          };
          //newErrors[question.question.uuid].answerRequired = `${question.questionStatement} is required`
        }
        if (value?.answer?.length > 500) {
          // newErrors[question.question.uuid].answerLength = "Answer length allowed only to 500 characters"
          newErrors[section.uuid] = {
            ...newErrors[section.uuid],
            [question.question.uuid]: {
              ...newErrors[section.uuid]?.[question.question.uuid],
              answerLength: "Answer length allowed only to 500 characters*",
            },
          };
        }
        if (value?.comments?.length > 500) {
          // newErrors[question.question.uuid].commentsLength = "Comments length allowed only to 500 characters"
          newErrors[section.uuid] = {
            ...newErrors[section.uuid],
            [question.question.uuid]: {
              ...newErrors[section.uuid]?.[question.question.uuid],
              commentsLength: "Comments length allowed only to 500 characters*",
            },
          };
        }
      });
    });
    if (locality === null) {
      newErrors["locality"] = { answerRequired: "Please select your locality" };
    }
    if ((prevProps?.userType).toUpperCase() === "CITIZEN" && city === null) {
      newErrors["city"] = { answerRequired: "Please select your city" };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitSurvey = () => {
    setLoading(true);
    let answerArr = [];
    let geolocationStr = geoLocation.latitude + geoLocation.longitude;
    for (const sectionId in formData) {
      for (const questionId in formData[sectionId]) {
        answerArr.push({
          uuid: formData[sectionId][questionId].answerUuid,
          surveyUuid: data.uuid,
          questionUuid: questionId,
          sectionUuid: sectionId,
          comments: formData[sectionId][questionId]?.comments || "",
          // tenantId: localStorage.getItem("CITIZEN.CITY"),
          tenantId: window.location.href.includes("/employee") ? prevProps?.citizenData?.city?.code : localStorage.getItem("CITIZEN.CITY"),

          // answer: [formData[sectionId][questionId].answer],
          answerDetails: [
            {
              answerType: formData[sectionId][questionId].answerType,
              answerContent:
                formData[sectionId][questionId].answerType === "CHECKBOX_ANSWER_TYPE"
                  ? formData[sectionId][questionId].answer.join(",")
                  : formData[sectionId][questionId].answer,
              weightage: formData[sectionId][questionId].weightage,
            },
          ],
        });
      }
    }
    //const { roles, ...newUserObject } = prevProps.userInfo;

    let payload = {
      User: {
        type: prevProps.userInfo.type,
        uuid: prevProps.userInfo.uuid,
        gender: (prevProps?.userType).toUpperCase() === "EMPLOYEE" ? prevProps?.citizenData?.gender : prevProps.userInfo.gender,
        emailId: (prevProps?.userType).toUpperCase() === "EMPLOYEE" ? prevProps?.citizenData?.email : prevProps.userInfo.emailId,
        dob: (prevProps?.userType).toUpperCase() === "EMPLOYEE" ? prevProps?.citizenData?.dob : prevProps.userInfo.dob,
      },

      SurveyResponse: {
        surveyUuid: data.uuid,
        // tenantId: city,
        status: "Submit",
        locality: locality,
        coordinates: `${geoLocation.latitude},${geoLocation.longitude}`,
        tenantId:
          city === null
            ? window.location.href.includes("/employee")
              ? prevProps?.citizenData?.city?.code
              : localStorage.getItem("CITIZEN.CITY")
            : city,
        city:
          city === null
            ? window.location.href.includes("/employee")
              ? prevProps?.citizenData?.city?.code
              : localStorage.getItem("CITIZEN.CITY")
            : city,
        // tenantId: localStorage.getItem("CITIZEN.CITY"),
        answers: answerArr,
      },
    };

    try {
      Digit.Surveys.submitSurvey(payload).then((response) => {
        setLoading(false);
        if (response?.SubmitResponse !== undefined) {
          userType.toUpperCase() === "EMPLOYEE"
            ? history.push("/digit-ui/employee/engagement/surveys/submit-response", {
                message: "SURVEY FORM SUBMITTED SUCCESSFULLY",
                response: response,
                isSuccess: true,
              })
            : history.push("/digit-ui/citizen/engagement/surveys/submit-survey-response", {
                message: "SURVEY FORM SUBMITTED SUCCESSFULLY",
                response: response,
                isSuccess: true,
              });

          return;
        } else {
          setShowToast({ key: true, isError: true, label: `${response?.Errors?.message}` });
        }
      });
    } catch (error) {
      setLoading(false);
      return error;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if ((prevProps.citizenFill && (prevProps?.userType).toLowerCase() === "employee") || (prevProps?.userType).toLowerCase() === "citizen") {
      if (validateForm()) {
        // handleSubmitSurvey();
        fetchAnswer("submit");
      }
    } else {
      setShowToast({ key: true, isError: true, label: `PLEASE FILL CITIZEN DETAILS` });
      return;
    }
  };

  const onSubmit = (data) => {
    console.log("data", data);
  };

  const displayAnswerField = (answerType, question, section) => {
    switch (answerType) {
      case "SHORT_ANSWER_TYPE":
        return (
          <>
            <TextInput
              name={question.uuid}
              //disabled={formDisabled}
              textInputStyle={{ maxWidth: "none" }}
              value={formData[section.uuid]?.[question.uuid]?.answer}
              onChange={(e) =>
                handleInputChange(
                  section.uuid,
                  question.uuid,
                  question.type,
                  null,
                  e.target.value,
                  formData[section.uuid]?.[question.uuid]?.answerUuid
                )
              }
              type="text"
              inputRef={register({
                maxLength: {
                  value: 200,
                  message: t("EXCEEDS_200_CHAR_LIMIT"),
                },
                required: question.required,
              })}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerRequired && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerRequired}
              </CardLabelError>
            )}
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerLength}
              </CardLabelError>
            )}
            <div
            //style={{fontWeight:'bold'}}
            >
              {" "}
              {"Add Suggestions/Comments"}
            </div>
            <TextArea
              name={question.uuid}
              // disabled={formDisabled}
              value={formData[section.uuid]?.[question.uuid]?.comments}
              maxLength={500}
              style={{ maxWidth: "none", marginBottom: "0px" }}
              onChange={(e) => handleFieldChange(section.uuid, question.uuid, e.target.value)}
              inputRef={register({
                maxLength: {
                  value: 500,
                  message: t("EXCEEDS_500_CHAR_LIMIT"),
                },
              })}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.commentsLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.commentsLength}
              </CardLabelError>
            )}
          </>
        );
      case "LONG_ANSWER_TYPE":
        return (
          <>
            <TextArea
              name={question.uuid}
              style={{ maxWidth: "none" }}
              // disabled={formDisabled}
              value={formData[section.uuid]?.[question.uuid]?.answer}
              onChange={(e) =>
                handleInputChange(
                  section.uuid,
                  question.uuid,
                  question.type,
                  null,
                  e.target.value,
                  formData[section.uuid]?.[question.uuid]?.answerUuid
                )
              }
              inputRef={register({
                maxLength: {
                  value: 500,
                  message: t("EXCEEDS_500_CHAR_LIMIT"),
                },
                required: question.required,
              })}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerRequired && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerRequired}
              </CardLabelError>
            )}
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerLength}
              </CardLabelError>
            )}
            <div
            //style={{fontWeight:'bold'}}
            >
              {" "}
              {"Add Suggestions/Comments"}
            </div>
            <TextArea
              name={question.uuid}
              // disabled={formDisabled}
              value={formData[section.uuid]?.[question.uuid]?.comments}
              maxLength={500}
              style={{ maxWidth: "none", marginBottom: "0px" }}
              onChange={(e) => handleFieldChange(section.uuid, question.uuid, e.target.value)}
              inputRef={register({
                maxLength: {
                  value: 500,
                  message: t("EXCEEDS_500_CHAR_LIMIT"),
                },
              })}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.commentsLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.commentsLength}
              </CardLabelError>
            )}
          </>
        );
      case "DROP_DOWN_MENU_ANSWER_TYPE":
        return (
          <>
            <select
              id="dropdown"
              value={formData[section.uuid]?.[question.uuid]?.answer}
              onChange={(e) => {
                const selectedOption = question.options.find((option) => option.optionText === e.target.value);
                const optionWeightage = selectedOption?.weightage || 0; // Get the weightage for the selected option
                handleInputChange(
                  section.uuid,
                  question.uuid,
                  question.type,
                  optionWeightage,
                  e.target.value,
                  formData[section.uuid]?.[question.uuid]?.answerUuid
                ); // Pass optionWeightage
              }}
            >
              <option value="">--Please choose an option--</option>
              {question.options.map((option, index) => (
                <option key={index} value={option?.optionText}>
                  {option?.optionText}
                </option>
              ))}
            </select>
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerRequired && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerRequired}
              </CardLabelError>
            )}
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerLength}
              </CardLabelError>
            )}
            <div
            //style={{fontWeight:'bold'}}
            >
              {" "}
              {"Add Suggestions/Comments"}
            </div>
            <TextArea
              name={question.uuid}
              // disabled={formDisabled}
              value={formData[section.uuid]?.[question.uuid]?.comments}
              maxLength={500}
              style={{ maxWidth: "none", marginBottom: "0px" }}
              onChange={(e) => handleFieldChange(section.uuid, question.uuid, e.target.value)}
              inputRef={register({
                maxLength: {
                  value: 500,
                  message: t("EXCEEDS_500_CHAR_LIMIT"),
                },
              })}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.commentsLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.commentsLength}
              </CardLabelError>
            )}
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
                <h4 key={option?.uuid} style={{ display: "flex", alignItems: "center", marginBottom: "10px", fontSize: "18px" }}>
                  <input
                    type="radio"
                    name={question.uuid}
                    value={option?.optionText}
                    checked={formData[section.uuid]?.[question.uuid]?.answer === option.optionText}
                    onChange={(e) =>
                      handleInputChange(
                        section.uuid,
                        question.uuid,
                        question.type,
                        option.weightage,
                        e.target.value,
                        formData[section.uuid]?.[question.uuid]?.answerUuid
                      )
                    }
                    required
                    style={{ marginRight: "10px", width: "25px", height: "25px" }}
                  />
                  {option?.optionText}
                </h4>
              ))}
            </div>
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerRequired && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerRequired}
              </CardLabelError>
            )}
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerLength}
              </CardLabelError>
            )}
            <div
            //style={{fontWeight:'bold'}}
            >
              {" "}
              {"Add Suggestions/Comments"}
            </div>
            <TextArea
              name={question.uuid}
              // disabled={formDisabled}
              value={formData[section.uuid]?.[question.uuid]?.comments}
              maxLength={500}
              style={{ maxWidth: "none", marginBottom: "0px" }}
              onChange={(e) => handleFieldChange(section.uuid, question.uuid, e.target.value)}
              inputRef={register({
                maxLength: {
                  value: 500,
                  message: t("EXCEEDS_500_CHAR_LIMIT"),
                },
              })}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.commentsLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.commentsLength}
              </CardLabelError>
            )}
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
                <h4 key={option?.uuid} style={{ display: "flex", alignItems: "center", marginBottom: "10px", fontSize: "18px" }}>
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
                          ? [...(prevData[section.uuid]?.[question.uuid]?.answer || ""), value]
                          : (prevData[section.uuid]?.[question.uuid]?.answer || "").filter((item) => item !== value);
                        return {
                          ...prevData,
                          [section.uuid]: {
                            ...prevData[section.uuid],
                            [question.uuid]: {
                              answer: newValues,
                              answerUuid: formData[section.uuid]?.[question.uuid]?.answerUuid,
                              answerType: question.type,
                              weightage: option.weightage,
                            },
                            // [question.uuid]: {answer:newValues},
                          },
                        };
                      });
                    }}
                  />
                  {option.optionText}
                </h4>
              ))}
            </div>
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerRequired && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerRequired}
              </CardLabelError>
            )}
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerLength}
              </CardLabelError>
            )}
            <div
            //style={{fontWeight:'bold'}}
            >
              {" "}
              {"Add Suggestions/Comments"}
            </div>
            <TextArea
              name={question.uuid}
              // disabled={formDisabled}
              value={formData[section.uuid]?.[question.uuid]?.comments}
              maxLength={500}
              style={{ maxWidth: "none", marginBottom: "0px" }}
              onChange={(e) => handleFieldChange(section.uuid, question.uuid, e.target.value)}
              inputRef={register({
                maxLength: {
                  value: 500,
                  message: t("EXCEEDS_500_CHAR_LIMIT"),
                },
              })}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.commentsLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.commentsLength}
              </CardLabelError>
            )}
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
              textInputStyle={{ maxWidth: "none" }}
              value={formData[section.uuid]?.[question.uuid]?.answer}
              onChange={(e) =>
                handleInputChange(
                  section.uuid,
                  question.uuid,
                  question.type,
                  null,
                  e.target.value,
                  formData[section.uuid]?.[question.uuid]?.answerUuid
                )
              }
              // defaultValue={value}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerRequired && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerRequired}
              </CardLabelError>
            )}
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerLength}
              </CardLabelError>
            )}
            <div
            //style={{fontWeight:'bold'}}
            >
              {" "}
              {"Add Suggestions/Comments"}
            </div>
            <TextArea
              name={question.uuid}
              // disabled={formDisabled}
              value={formData[section.uuid]?.[question.uuid]?.comments}
              maxLength={500}
              style={{ maxWidth: "none", marginBottom: "0px" }}
              onChange={(e) => handleFieldChange(section.uuid, question.uuid, e.target.value)}
              inputRef={register({
                maxLength: {
                  value: 500,
                  message: t("EXCEEDS_500_CHAR_LIMIT"),
                },
              })}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.commentsLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.commentsLength}
              </CardLabelError>
            )}
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
              textInputStyle={{ maxWidth: "none" }}
              value={formData[section.uuid]?.[question.uuid]?.answer}
              onChange={(e) =>
                handleInputChange(
                  section.uuid,
                  question.uuid,
                  question.type,
                  null,
                  e.target.value,
                  formData[section.uuid]?.[question.uuid]?.answerUuid
                )
              }
              // defaultValue={value}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerRequired && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerRequired}
              </CardLabelError>
            )}
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.answerLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.answerLength}
              </CardLabelError>
            )}
            <div
            //style={{fontWeight:'bold'}}
            >
              {" "}
              {"Add Suggestions/Comments"}
            </div>
            <TextArea
              name={question.uuid}
              // disabled={formDisabled}
              value={formData[section.uuid]?.[question.uuid]?.comments}
              maxLength={500}
              style={{ maxWidth: "none", marginBottom: "0px" }}
              onChange={(e) => handleFieldChange(section.uuid, question.uuid, e.target.value)}
              inputRef={register({
                maxLength: {
                  value: 500,
                  message: t("EXCEEDS_500_CHAR_LIMIT"),
                },
              })}
            />
            {errors && errors?.[section.uuid] && errors?.[section.uuid]?.[question.uuid]?.commentsLength && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                {errors?.[section.uuid]?.[question.uuid]?.commentsLength}
              </CardLabelError>
            )}
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

  const closeToast = () => {
    setShowToast(null);
  };

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });

  // useEffect(() => {
  //   let locationFetched = false;
  //   if (((prevProps?.userType).toUpperCase() === "EMPLOYEE" && !isgeoLoc && submitted===false) || ((prevProps?.userType).toUpperCase() === "CITIZEN" && hasCitizenDetails && submitted===false)) {

  //     // if (!isgeoLoc) {
  //     //   fetchPosition(); // Automatically fetch location on component mount
  //     //   locationFetched = true;
  //     // }
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         // Update both latitude and longitude in a single state object
  //         setIsGeoLoc(true)
  //         // isgeoLoc= true
  //         setGeoLocation({
  //           latitude: position.coords.latitude,
  //           longitude: position.coords.longitude,
  //         });
  //         return;
  //       },
  //       (err) => {
  //         if (err.code === 1) {
  //           setIsGeoLoc(false)
  //           // isgeoLoc=false
  //           alert("Location access is mandatory. Without it, we cannot proceed.");
  //           return;
  //         } else {
  //           setIsGeoLoc(false)

  //           // isgeoLoc=false
  //         }
  //       }
  //     );

  //   }

  // }, [prevProps?.userType, hasCitizenDetails]);

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);
  };

  useEffect(() => {
    if (getFetchAnswers) {
      // On component mount, initialize city from localStorage
      const storedCity = getFetchAnswers?.tenantId ? getFetchAnswers?.tenantId : localStorage.getItem("CITIZEN.CITY");

      if (storedCity) {
        setCity(storedCity);
      }
    }
  }, [getFetchAnswers]);
  console.log("city", city);
  const handleLocalityChangeCitizen = (e) => {
    setLocality(e.target.value);
  };

  useEffect(() => {
    if (getFetchAnswers) {
      setLocality(getFetchAnswers?.locality);
    }
  }, [getFetchAnswers]);

  const handleLocalityChange = (e) => {
    setLocality(e);
  };

  function handleOnSubmitDialog() {
    setOpenQuesDetailsDialog(false);
  }

  function handleOnCancelDialog() {
    setOpenQuesDetailsDialog(false);
  }

  return (
    // <div>
    submitted === true && openQuesDetailsDialog ? (
      <Dialog
        onSelect={handleOnSubmitDialog}
        onCancel={handleOnCancelDialog}
        onDismiss={handleOnCancelDialog}
        heading="Survey already Submitted!"
        actionCancel={false}
        content={questionDetailsContent}
        hideSubmit={true}
      />
    ) : (((prevProps?.userType).toUpperCase() === "EMPLOYEE" || prevProps?.citizenFill) && isgeoLoc === true) ||
      ((prevProps?.userType).toUpperCase() === "CITIZEN" && hasCitizenDetails === true && isgeoLoc === true) ? (
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
          {(prevProps?.userType).toUpperCase() === "EMPLOYEE" ? (
            <>
              <CardLabel>
                {`${t("LOCALITY")}`} <span className="check-page-link-button">*</span>
              </CardLabel>

              {/* <Controller
                  name="locality"
                  defaultValue={locality}
                  control={control}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  render={({ value, onBlur, onChange }) => (
                    <Localities
                      selectLocality={(value) => {

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
                   {errors && errors['locality'] && (
              <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: '500' }}>{errors?.['locality'].answerRequired}</CardLabelError>)} */}
              <select
                id="dropdown"
                value={locality}
                onChange={(e) => {
                  handleLocalityChangeCitizen(e);
                }}
              >
                <option value="">--Please choose a locality--</option>
                {localityList !== null && (
                  <>
                    {localityList.map((option, index) => (
                      <option key={index} value={option.name}>
                        {option?.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {errors && errors["locality"] && (
                <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                  {errors?.["locality"].answerRequired}
                </CardLabelError>
              )}
            </>
          ) : (
            <>
              <CardLabel>
                {`${t("CITY")}`} <span className="check-page-link-button">*</span>
              </CardLabel>
              {/* <Dropdown
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
                /> */}
              <select
                id="dropdown"
                value={city}
                // value={localStorage.getItem("CITIZEN.CITY")}
                // value={formData[section.uuid]?.[question.uuid]?.answer}
                onChange={(e) => {
                  handleCityChange(e);
                }}
                disabled={localStorage.getItem("CITIZEN.CITY") === "pb.punjab" ? false : true}
              >
                <option value="">--Please choose a city--</option>
                {cities.map((option, index) => (
                  <option key={index} value={option.code}>
                    {option?.name}
                  </option>
                ))}
              </select>

              {errors && errors["city"] && (
                <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                  {errors?.["city"].answerRequired}
                </CardLabelError>
              )}

              <CardLabel>
                {`${t("LOCALITY")}`} <span className="check-page-link-button">*</span>
              </CardLabel>

              {/* <Controller
         name="locality"
        defaultValue={locality}
         control={ control }
         rules={{required: t("REQUIRED_FIELD")}}
         render={({value, onBlur, onChange}) => ( */}
              {/* <Localities
                  selectLocality={(value) => {

                    handleLocalityChange(value);
                  }}
                  tenantId={city || ""}
                  boundaryType="revenue"
                  keepNull={false}
                  optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10" }}
                  selected={locality}
                  disable={false}
                  disableLoader={true}
                  sortFn={(a, b) => (a.i18nkey < b.i18nkey ? -1 : 1)}
                //onBlur={onBlur}
                /> */}
              <select
                id="dropdown"
                value={locality}
                onChange={(e) => {
                  handleLocalityChangeCitizen(e);
                }}
              >
                <option value="">--Please choose a locality--</option>
                {city !== null && localityList !== null && (
                  <>
                    {localityList.map((option, index) => (
                      <option key={index} value={option.name}>
                        {option?.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {errors && errors["locality"] && (
                <CardLabelError style={{ marginTop: "0px", marginBottom: "0px", color: "red", fontWeight: "500" }}>
                  {errors?.["locality"].answerRequired}
                </CardLabelError>
              )}
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
          )}
          <form onSubmit={handleSubmit}>
            {data.sections.length > 0
              ? data.sections.map((section) => (
                  <div>
                    <h2>{section.title}</h2>
                    {section.questions.map((question, index) => (
                      <div>
                        <h3>{question.questionStatement}</h3>
                        <div className="surveyQuestion-wrapper">
                          <div style={{ display: "inline" }}>
                            {index + 1}. {question.question.questionStatement} {question?.required && <span style={{ color: "red" }}>*</span>}
                          </div>
                          {displayAnswerField(question.question.type, question.question, section)}
                          {errors[question.uuid] && <span className="error">{errors[question.uuid]}</span>}
                          <div></div>
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
    ) : (prevProps?.userType).toUpperCase() === "CITIZEN" && hasCitizenDetails === false ? (
      <div className="create-survey-page" style={{ background: "white", display: "block", padding: "15px" }}>
        <h3 style={{ color: "red", fontSize: "20px" }}>Please fill in your basic details to proceed with the survey</h3>
        <h4 style={{ fontSize: "16px" }}>Click on below button to fill in your details</h4>
        <button
          onClick={() => history.push("/digit-ui/citizen/user/profile")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#007bff",
            color: "white",
            marginTop: "10px",
            //cursor: "pointer"
          }}
        >
          Fill your details : Name, Gender, DOB and Email are required
        </button>
        {loading && <Loader />}
      </div>
    ) : null

    // </div>
  );
};

export default FillQuestions;
