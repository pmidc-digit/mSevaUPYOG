import { CardLabelError, CheckBox, DatePicker, Dropdown, DustbinIcon, TextArea, TextInput } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, Fragment } from "react";
import { Controller, useFormContext } from "react-hook-form";
import Checkboxes from "./AnswerTypes/Checkboxes";
import MultipleChoice from "./AnswerTypes/MultipleChoice";
import DropdownType from "./AnswerTypes/DropdownType";

// Main component for the survey form
const QuestionForm = ({
  t, // Translation function
  index, // Index of the question
  //
  category,
  questionStatement, // The question text
  type, // Type of the question (e.g., short answer, multiple choice)
  options, // Options for multiple choice or checkbox questions
  required, // Whether the question is required
  uuid, // Unique identifier for the question
  qorder, // Order of the question
  //
  disableInputs, // Whether inputs should be disabled
  dispatch, // Function to dispatch actions
  isPartiallyEnabled, // Whether partial inputs are enabled
  addOption, // Function to add an option
  formDisabled, // Whether the form is disabled
  controlSurveyForm, // Function to control the survey form
  mainFormState,
  noOfQuestions,
  defaultQuestionValues,
}) => {
  //console.log("3) Default Values:", defaultQuestionValues);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  // Options for the answer type dropdown
  const { data: AnswerTypeData = {}, isLoading } = Digit.Hooks.engagement.useMDMS(tenantId, "common-masters", "questionType") || {};
  var answerTypeOptions =
    AnswerTypeData && AnswerTypeData["common-masters"] && AnswerTypeData["common-masters"].questionType
      ? AnswerTypeData["common-masters"].questionType
          .filter(function (item) {
            return item.active;
          })
          .map(function (item) {
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
  const isInputDisabled = window.location.href.includes("/employee/engagement/surveys/create-questions");

  const [surveyQuestionConfig, setSurveyQuestionConfig] = useState({
    category: category || defaultQuestionValues.category,
    questionStatement: questionStatement || defaultQuestionValues.questionStatement,
    type: type || defaultQuestionValues.type,
    options: options?.length > 0 ? options : defaultQuestionValues.options,
    //optionWeightage:defaultQuestionValues.optionWeightage,
    required: required || defaultQuestionValues.required,
    uuid: uuid || defaultQuestionValues.uuid,
    qorder: qorder || defaultQuestionValues.qorder,
  });

  // const { register, formState } = useFormContext();
  const { errors } = mainFormState;
  //console.log("mainFormState", mainFormState, "\n index", index, "\n errors:", errors, "\n message:", errors[`questions[${index}]`]);

  const handleAddOption = () => {
    const newOptions = [
      ...surveyQuestionConfig.options,
      { id: Date.now(), title: `${t("CMN_OPTION")} ${surveyQuestionConfig.options.length + 1}`, optionWeightage: 0 },
    ];
    setSurveyQuestionConfig((prevState) => ({ ...prevState, options: newOptions }));
    return newOptions;
  };

  const handleUpdateOption = ({ value, id, weightage }) => {
    const updatedOptions = surveyQuestionConfig.options.map((option) =>
      option.id === id ? { ...option, title: value, optionWeightage: weightage } : option
    );
    setSurveyQuestionConfig((prevState) => ({ ...prevState, options: updatedOptions }));
    return updatedOptions;
  };

  const handleRemoveOption = (id) => {
    if (surveyQuestionConfig.options.length === 1 || (isPartiallyEnabled ? !isPartiallyEnabled : formDisabled)) return surveyQuestionConfig.options;
    const updatedOptions = surveyQuestionConfig.options.filter((option) => option.id !== id);
    setSurveyQuestionConfig((prevState) => ({ ...prevState, options: updatedOptions }));
    return updatedOptions;
  };

  // Dispatch the updated survey question configuration
  useEffect(() => {
    //console.log("surveyQuestionConfig", surveyQuestionConfig);
    dispatch({ type: "updateForm", payload: { index: index, formConfig: surveyQuestionConfig } });
  }, [surveyQuestionConfig]);

  // Function to render the appropriate answer component based on the question type
  const renderAnswerComponent = (type) => {
    switch (type?.value) {
      case "MULTIPLE_ANSWER_TYPE":
        return (
          <div>
            {errors.questions?.[index]?.options && <CardLabelError>{errors.questions[index].options.message}</CardLabelError>}
            <Controller
              rules={{
                validate: (value) =>
                  value.every((option) => option.title.trim() !== "") || "Some options are empty. Please provide text or remove the empty options.",
              }}
              defaultValue={defaultQuestionValues.options}
              //name={`OPTIONS_${index}`}
              name={`questions[${index}].options`}
              control={controlSurveyForm}
              render={(props) => (
                <MultipleChoice
                  // addOption={handleAddOption}
                  // updateOption={handleUpdateOption}
                  // removeOption={handleRemoveOption}
                  updateOption={(option) => {
                    const updatedOptions = handleUpdateOption(option);
                    props.onChange(updatedOptions);
                  }}
                  addOption={() => {
                    const newOptions = handleAddOption();
                    props.onChange(newOptions);
                  }}
                  removeOption={(id) => {
                    const updatedOptions = handleRemoveOption(id);
                    props.onChange(updatedOptions);
                  }}
                  options={surveyQuestionConfig?.options}
                  createNewSurvey={addOption} //Check this
                  isInputDisabled={isInputDisabled}
                  isPartiallyEnabled={isPartiallyEnabled}
                  formDisabled={formDisabled}
                  maxLength={500}
                  minWeight={0}
                  maxWeight={10}
                  titleHover={t("The maximum length is 500 characters")}
                  weightHover={t("Enter a number between 0 and 10")}
                  t={t}
                />
              )}
            />
          </div>
        );
      case "CHECKBOX_ANSWER_TYPE":
        return (
          <div>
            {errors.questions?.[index]?.options && <CardLabelError>{errors.questions[index].options.message}</CardLabelError>}
            <Controller
              rules={{
                validate: (value) =>
                  value.every((option) => option.title.trim() !== "") || "Some options are empty. Please provide text or remove the empty options.",
              }}
              defaultValue={defaultQuestionValues.options}
              name={`questions[${index}].options`}
              control={controlSurveyForm}
              render={(props) => (
                <Checkboxes
                  // addOption={handleAddOption}
                  // updateOption={handleUpdateOption}
                  // removeOption={handleRemoveOption}
                  updateOption={(option) => {
                    const updatedOptions = handleUpdateOption(option);
                    props.onChange(updatedOptions);
                  }}
                  addOption={() => {
                    const newOptions = handleAddOption();
                    props.onChange(newOptions);
                  }}
                  removeOption={(id) => {
                    const updatedOptions = handleRemoveOption(id);
                    props.onChange(updatedOptions);
                  }}
                  options={surveyQuestionConfig?.options}
                  isInputDisabled={isInputDisabled}
                  isPartiallyEnabled={isPartiallyEnabled}
                  createNewSurvey={addOption} //Check this
                  formDisabled={formDisabled}
                  titleHover={t("The maximum length is 500 characters")}
                  weightHover={t("Enter a number between 0 and 10")}
                  labelstyle={{ marginLeft: "-20px" }}
                  maxLength={500}
                  minWeight={0}
                  maxWeight={10}
                  t={t}
                />
              )}
            />
          </div>
        );
      case "DROP_DOWN_MENU_ANSWER_TYPE":
        return (
          <div>
            {errors.questions?.[index]?.options && <CardLabelError>{errors.questions[index].options.message}</CardLabelError>}
            <Controller
              rules={{
                validate: (value) =>
                  value.every((option) => option.title.trim() !== "") || "Some options are empty. Please provide text or remove the empty options.",
              }}
              defaultValue={defaultQuestionValues.options}
              name={`questions[${index}].options`}
              control={controlSurveyForm}
              render={(props) => (
                <DropdownType
                  // addOption={handleAddOption}
                  // updateOption={handleUpdateOption}
                  // removeOption={handleRemoveOption}
                  updateOption={(option) => {
                    const updatedOptions = handleUpdateOption(option);
                    props.onChange(updatedOptions);
                  }}
                  addOption={() => {
                    const newOptions = handleAddOption();
                    props.onChange(newOptions);
                  }}
                  removeOption={(id) => {
                    const updatedOptions = handleRemoveOption(id);
                    props.onChange(updatedOptions);
                  }}
                  options={surveyQuestionConfig?.options}
                  isInputDisabled={isInputDisabled}
                  isPartiallyEnabled={isPartiallyEnabled}
                  createNewSurvey={addOption} //Check this
                  formDisabled={formDisabled}
                  titleHover={t("The maximum length is 500 characters")}
                  weightHover={t("Enter a number between 0 and 10")}
                  labelstyle={{ marginLeft: "-20px" }}
                  maxLength={500}
                  minWeight={0}
                  maxWeight={10}
                  t={t}
                />
              )}
            />
          </div>
        );

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
  console.log("surveyQuestionConfig", surveyQuestionConfig.options[0].optionWeightage);
  return (
    <div className="newSurveyForm_wrapper">
      <span className="newSurveyForm_quesno">{`${t("CS_COMMON_QUESTION")} ${index + 1} `}</span>
      <span className="newSurveyForm_mainsection">
        {/* <div className="surveydetailsform-wrapper">
        <span className="surveyformfield">
          <label>
            {t("Category")} <span style={{ color: "red" }}>*</span>
          </label> */}
        <Controller
          rules={{ required: t("REQUIRED_FIELD") }} // t("EVENTS_CATEGORY_ERROR_REQUIRED")
          defaultValue={defaultQuestionValues.category}
          name={`questions[${index}].category`}
          control={controlSurveyForm}
          render={(props) => (
            <Dropdown
              t={t}
              option={categoryOptions}
              placeholder={"Select Category *"}
              optionKey="i18Key"
              //selected={props.value}
              selected={surveyQuestionConfig.category}
              select={(e) => {
                props.onChange(e);
                handleSelectCategory(e);
              }}
              disable={disableInputs}
            />
          )}
        />
        {/* </span> */}
        {errors.questions?.[index]?.category && <CardLabelError>{errors.questions[index].category.message}</CardLabelError>}
        {/* </div> */}

        <Controller
          rules={{
            required: t("REQUIRED_FIELD"),
            maxLength: {
              value: 500,
              message: "Question length should be less than or equal to 500 characters",
            },
            pattern: {
              value: /^[A-Za-z_-][A-Za-z0-9_\ -?]*$/,
              message: "Input should not start with a number",
            },
          }}
          defaultValue={defaultQuestionValues.questionStatement}
          name={`questions[${index}].questionStatement`}
          control={controlSurveyForm}
          render={(props) => (
            <TextInput
              placeholder={t("CS_COMMON_TYPE_QUESTION") + " *"}
              //value={t(Digit.Utils.locale.getTransformedLocale(surveyQuestionConfig.questionStatement))}
              value={surveyQuestionConfig.questionStatement}
              onChange={(e) => {
                handleQuestionStatementChange(e);
                props.onChange(e);
              }}
              textInputStyle={{ width: "100%" }}
              //name={`questions[${index}].questionStatement`}
              disable={disableInputs}
            />
          )}
        />
        {errors.questions?.[index]?.questionStatement && <CardLabelError>{errors.questions[index].questionStatement.message}</CardLabelError>}

        <Controller
          rules={{ required: t("REQUIRED_FIELD") }} //t("ES_ERROR_REQUIRED")
          defaultValue={defaultQuestionValues.type}
          name={`questions[${index}].type`}
          control={controlSurveyForm}
          render={(props) => (
            <Dropdown
              t={t}
              option={answerTypeOptions}
              placeholder={"Select Question Type *"}
              optionKey="i18Key"
              //selected={props.value}
              selected={surveyQuestionConfig.type}
              select={(e) => {
                props.onChange(e);
                handleSelectType(e);
              }}
              disable={disableInputs}
            />
          )}
        />
        {errors.questions?.[index]?.type && <CardLabelError>{errors.questions[index].type.message}</CardLabelError>}

        <div className="newSurveyForm_answer">{renderAnswerComponent(surveyQuestionConfig?.type)}</div>
        <div className="newSurveyForm_actions">
          {/* <div>
            <Controller
              defaultValue={defaultQuestionValues.required}
              name={`questions[${index}].required`}
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
                  style={{ marginTop: "-5px" }}
                />
              )}
            />
          </div> */}
          {noOfQuestions > 1 && <div className="newSurveyForm_seprator" />}
          {noOfQuestions > 1 && (
            <div className={`pointer ${disableInputs ? "disabled-btn" : ""}`} onClick={() => dispatch({ type: "removeForm", payload: { uuid } })}>
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

export default QuestionForm;
