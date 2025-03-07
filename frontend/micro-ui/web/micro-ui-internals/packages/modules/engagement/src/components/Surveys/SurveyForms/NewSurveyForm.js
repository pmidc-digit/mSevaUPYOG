import { CardLabelError, CheckBox, DatePicker, Dropdown, DustbinIcon, TextArea, TextInput } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, Fragment } from "react";
import { Controller, useFormContext } from "react-hook-form";
import Checkboxes from "./AnswerTypes/Checkboxes";
import MultipleChoice from "./AnswerTypes/MultipleChoice";

// Main component for the survey form
const NewSurveyForm = ({
  t, // Translation function
  index, // Index of the question
  questionStatement, // The question text
  category,
  type, // Type of the question (e.g., short answer, multiple choice)
  uuid, // Unique identifier for the question
  qorder, // Order of the question
  required, // Whether the question is required
  options, // Options for multiple choice or checkbox questions
  disableInputs, // Whether inputs should be disabled
  dispatch, // Function to dispatch actions
  isPartiallyEnabled, // Whether partial inputs are enabled
  addOption, // Function to add an option
  formDisabled, // Whether the form is disabled
  controlSurveyForm, // Function to control the survey form
  mainFormState,
  noOfQuestions,
}) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  // Options for the answer type dropdown
  const { data: AnswerTypeData = {}, isLoading } = Digit.Hooks.engagement.useMDMS(tenantId, "common-masters", "questionType") || {};
  var answerTypeOptions = 
  (AnswerTypeData && AnswerTypeData["common-masters"] && AnswerTypeData["common-masters"].questionType) 
    ? AnswerTypeData["common-masters"].questionType
        .filter(function(item) {
          return item.active;
        })
        .map(function(item) {
          return { title: t(item.title), i18Key: item.code, value: item.code };
        })
    : [];

  // Options for the category dropdown
  const [categoryOptions, setCategoryOptions] = useState([]);
  useEffect(() => {
    fetchCategories();
  }, [tenantId]);

  function fetchCategories() {
    const payload = { tenantId: tenantId };
    Digit.Surveys.searchCategory(payload)
      .then((response) => {
        //console.log("Category Options: ", response);
        const categoryOptions = response?.Categories?.filter((item) => item.isActive)?.map((item) => {
          return { title: t(item.label), i18Key: item.label, value: item.id };
        });
        setCategoryOptions(categoryOptions);
      })
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
      });
  }

  // Determine the selected type based on the provided type
  const selectedType = answerTypeOptions.filter((option) => option?.value === (typeof type === "object" ? type?.value : type));
  const isInputDisabled = window.location.href.includes("/employee/engagement/");

  // State to manage the survey question configuration
  const [surveyQuestionConfig, setSurveyQuestionConfig] = useState({
    category,
    questionStatement,
    type: type ? selectedType?.[0] : { title: t("MULTIPLE_ANSWER_TYPE"), i18Key: "MULTIPLE_ANSWER_TYPE", value: "MULTIPLE_ANSWER_TYPE" },
    options: options?.length > 0 ? options : [`${t("CMN_OPTION")} 1`],
    required,
    uuid,
    qorder,
  });

  const { register, formState } = useFormContext();
  const { errors } = mainFormState;

  // Function to add a new option
  const handleAddOption = () =>
    setSurveyQuestionConfig((prevState) => {
      const updatedState = { ...prevState };
      updatedState.options.push(`${t("CMN_OPTION")} ${updatedState.options.length + 1}`);
      return updatedState;
    });

  // Function to update an existing option
  const handleUpdateOption = ({ value, id }) => {
    setSurveyQuestionConfig((prevState) => {
      const updatedState = { ...prevState };
      updatedState.options.splice(id, 1, value);
      return updatedState;
    });
  };

  // Function to remove an option
  const handleRemoveOption = (id) => {
    console.log("handleRemoveOption, id: ", id);
    if (surveyQuestionConfig.options.length === 1 || (isPartiallyEnabled ? !isPartiallyEnabled : formDisabled)) return;
    setSurveyQuestionConfig((prevState) => {
      const updatedState = { ...prevState };
      updatedState.options.splice(id, 1);
      console.log("handleRemoveOption, updatedState: ", updatedState);
      return updatedState;
    });
  };

  // Dispatch the updated survey question configuration
  useEffect(() => {
    dispatch({ type: "updateForm", payload: { index: index, formConfig: surveyQuestionConfig } });
  }, [surveyQuestionConfig]);

  // Function to render the appropriate answer component based on the question type
  const renderAnswerComponent = (type) => {
    switch (type?.value) {
      // case "LONG_ANSWER_TYPE":
      //   return (
      //     <div>
      //       <TextArea
      //         placeholder={t("LONG_ANSWER_TYPE")}
      //         disabled={isInputDisabled}
      //         name={"longAnsDescription"}
      //         inputRef={register({
      //           maxLength: { value: 500, message: t("EXCEEDS_500_CHAR_LIMIT") },
      //         })}
      //       />
      //       {formState?.errors && <CardLabelError>{formState?.errors?.longAnsDescription?.message}</CardLabelError>}
      //     </div>
      //   );
      // case "DATE_ANSWER_TYPE":
      //   return <DatePicker stylesForInput={{ width: "calc(100% - 290px)" }} style={{ width: "202px" }} disabled={isInputDisabled} />;
      // case "TIME_ANSWER_TYPE":
      //   return <TextInput type="time" textInputStyle={{ width: "202px" }} disable={isInputDisabled} />;
      case "MULTIPLE_ANSWER_TYPE":
        return (
          <Controller
            //rules={{ required: true }}
            defaultValue={[]}
            name={`OPTIONS_${index}`}
            control={controlSurveyForm}
            render={(props) => (
              <MultipleChoice
                maxLength={60}
                titleHover={t("MAX_LENGTH_60")}
                t={t}
                addOption={() => {
                  handleAddOption();
                  props.onChange(surveyQuestionConfig?.options);
                }}
                updateOption={handleUpdateOption}
                removeOption={handleRemoveOption}
                options={surveyQuestionConfig?.options}
                createNewSurvey={addOption}
                isInputDisabled={isInputDisabled}
                isPartiallyEnabled={isPartiallyEnabled}
                formDisabled={formDisabled}
              />
            )}
          />
        );
      case "CHECKBOX_ANSWER_TYPE":
        return (
          <div>
            <Controller
              //rules={{ required: true }}
              defaultValue={[]}
              name={`OPTIONS_${index}`}
              control={controlSurveyForm}
              render={(props) => (
                <Checkboxes
                  t={t}
                  addOption={() => {
                    handleAddOption();
                    props.onChange(surveyQuestionConfig?.options);
                  }}
                  updateOption={handleUpdateOption}
                  removeOption={handleRemoveOption}
                  options={surveyQuestionConfig?.options}
                  isInputDisabled={isInputDisabled}
                  isPartiallyEnabled={isPartiallyEnabled}
                  createNewSurvey={addOption}
                  formDisabled={formDisabled}
                  maxLength={60}
                  titleHover={t("MAX_LENGTH_60")}
                  labelstyle={{ marginLeft: "-20px" }}
                />
              )}
            />
          </div>
        );
      // case "SHORT_ANSWER_TYPE":
      //   return (
      //     <div>
      //       <TextInput
      //         placeholder={t("SHORT_ANSWER_TYPE")}
      //         name={"shortAnsDescription"}
      //         disabled={isInputDisabled}
      //         inputRef={register({
      //           maxLength: { value: 200, message: t("EXCEEDS_200_CHAR_LIMIT") },
      //         })}
      //       />
      //       {formState?.errors && <CardLabelError>{formState?.errors?.shortAnsDescription?.message}</CardLabelError>}
      //     </div>
      //   );
      default:
        return null;
    }
  };

  //onChange functions:
  const handleSelectCategory = (ev) => {
    setSurveyQuestionConfig((prevState) => ({
      ...prevState,
      category: ev ? { title: ev.title, i18Key: ev.i18Key, value: ev.value } : null,
    }));
  };

  const handleQuestionStatementChange = (ev) => {
    setSurveyQuestionConfig((prevState) => ({ ...prevState, questionStatement: ev.target.value }));
  };

  const handleSelectType = (ev) => {
    setSurveyQuestionConfig((prevState) => ({
      ...prevState,
      type: ev ? { title: ev.title, i18Key: ev.i18Key, value: ev.value } : null,
    }));
  };

  return (
    <div className="newSurveyForm_wrapper">
      <span className="newSurveyForm_quesno">{`${t("CS_COMMON_QUESTION")} ${index + 1} `}</span>
      <span className="newSurveyForm_mainsection">
        <Controller
          //rules={{ required: t("REQUIRED_FIELD") }} // t("EVENTS_CATEGORY_ERROR_REQUIRED")
          defaultValue={""}
          name={`CATEGORY_SURVEY_${index}`}
          control={controlSurveyForm}
          render={(props) => (
            // <span className="surveyformfield">
            //   <label>
            //     {t("Category")} <span style={{ color: "red" }}>*</span>
            //   </label>
            <Dropdown
              t={t}
              option={categoryOptions}
              placeholder={"Select Category"}
              optionKey="i18Key"
              selected={props.value}
              //selected={surveyQuestionConfig?.category || null}
              select={(e) => {
                props.onChange(e);
                handleSelectCategory(e);
              }}
              disable={disableInputs}
            />
            // </span>
          )}
        />
        {errors[`CATEGORY_SURVEY_${index}`] && <CardLabelError>{errors[`CATEGORY_SURVEY_${index}`].message}</CardLabelError>}

        <TextInput
          placeholder={t("CS_COMMON_TYPE_QUESTION")}
          //value={t(Digit.Utils.locale.getTransformedLocale(surveyQuestionConfig.questionStatement))}
          value={surveyQuestionConfig.questionStatement}
          onChange={handleQuestionStatementChange}
          textInputStyle={{ width: "100%" }}
          name={`QUESTION_SURVEY_${index}`}
          disable={disableInputs}
          inputRef={register({
            //required: t("REQUIRED_FIELD"), //t("ES_ERROR_REQUIRED"),
            maxLength: {
              value: 100,
              message: t("EXCEEDS_100_CHAR_LIMIT"),
            },
            pattern: {
              value: /^[A-Za-z_-][A-Za-z0-9_\ -?]*$/,
              message: t("ES_SURVEY_DONT_START_WITH_NUMBER"),
            },
          })}
        />
        {formState?.errors && <CardLabelError>{formState?.errors?.[`QUESTION_SURVEY_${index}`]?.message}</CardLabelError>}

        <Controller
          //rules={{ required: t("REQUIRED_FIELD") }} //t("ES_ERROR_REQUIRED")
          defaultValue={{ title: t("MULTIPLE_ANSWER_TYPE"), i18Key: "MULTIPLE_ANSWER_TYPE", value: "MULTIPLE_ANSWER_TYPE" }}
          name={`ANSWER_TYPE_SURVEY_${index}`}
          control={controlSurveyForm}
          render={(props) => (
            <Dropdown
              t={t}
              option={answerTypeOptions}
              placeholder={"Select Question Type"}
              optionKey="i18Key"
              selected={props.value}
              //selected={surveyQuestionConfig?.type || null}
              select={(e) => {
                props.onChange(e);
                handleSelectType(e);
              }}
              disable={disableInputs}
            />
          )}
        />
        {errors[`ANSWER_TYPE_SURVEY_${index}`] && <CardLabelError>{errors[`ANSWER_TYPE_SURVEY_${index}`].message}</CardLabelError>}

        <div className="newSurveyForm_answer">{renderAnswerComponent(surveyQuestionConfig?.type)}</div>
        <div className="newSurveyForm_actions">
          <div>
            <Controller
              //rules={{ required: t("ES_ERROR_REQUIRED") }}
              defaultValue={false}
              name={`REQUIRED_QUESTION_${index}`}
              control={controlSurveyForm}
              render={(props) => (
                <CheckBox
                  // onChange={(e) => setSurveyQuestionConfig((prevState) => ({ ...prevState, required: !prevState.required }))}
                  // checked={surveyQuestionConfig.required}
                  onChange={(e) => props.onChange(e.target.checked)}
                  checked={props.value}
                  label={t("CS_COMMON_REQUIRED")}
                  pageType={"employee"}
                  disable={disableInputs}
                  style={{ marginTop: "2px" }}
                />
              )}
            />
          </div>
          {noOfQuestions > 1 && <div className="newSurveyForm_seprator" />}
          {noOfQuestions > 1 && (
            <div className={`pointer ${disableInputs ? "disabled-btn" : ""}`} onClick={() => dispatch({ type: "removeForm", payload: { index } })}>
              <div className="tooltip" /* style={{position:"relative"}} */>
                <div style={{ display: "flex", /* alignItems: "center", */ gap: "0 4px" }}>
                  <DustbinIcon />
                  <span className="tooltiptext" style={{ position: "absolute", width: "100px", marginLeft: "50%", fontSize: "medium" }}>
                    {t("CS_INFO_DELETE")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </span>
    </div>
  );
};

export default NewSurveyForm;
