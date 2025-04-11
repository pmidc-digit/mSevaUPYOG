import React, { Fragment, useState } from "react";
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
} from "@mseva/digit-ui-react-components";
const PreviewQuestions = (props) => {
  const prevProps = props.location.state;
  const data = prevProps.data;
  console.log("questions data", data);

  const [selectedOption, setSelectedOption] = useState("");

  const handleChange = (event) => {
    // Prevent changing the selected option
    setSelectedOption("");
  };

  const displayAnswerField = (answerType, question, section) => {
    console.log("answer type", answerType, question);

    switch (answerType) {
      case "SHORT_ANSWER_TYPE":
        return (
          <>
            <TextInput name={question.uuid} disable={true} textInputStyle={{ maxWidth: "none" }} type="text" />
          </>
        );
      case "LONG_ANSWER_TYPE":
        return (
          <>
            <TextArea name={question.uuid} style={{ maxWidth: "none" }} disable={true} disabled={true} />
          </>
        );
      case "DROP_DOWN_MENU_ANSWER_TYPE":
        return (
          <>
            <select id="dropdown" value={selectedOption} onChange={handleChange}>
              <option value="">--Please choose an option--</option>
              {question.options.map((option, index) => (
                <option key={index} value={option?.optionText}>
                  {option?.optionText}
                </option>
              ))}
            </select>
          </>
        );
      case "MULTIPLE_ANSWER_TYPE":
        return (
          <>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {question.options.map((option) => (
                <h4 key={option?.uuid} style={{ display: "flex", alignItems: "center", marginBottom: "10px", fontSize: "18px" }}>
                  <input
                    type="radio"
                    name={question.uuid}
                    value={option?.optionText}
                    disabled={true}
                    required
                    style={{ marginRight: "10px", width: "25px", height: "25px" }}
                  />
                  {option?.optionText}
                </h4>
              ))}
            </div>
          </>
        );
      case "CHECKBOX_ANSWER_TYPE":
        return (
          <>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {question.options.map((option) => (
                <h4 key={option?.uuid} style={{ display: "flex", alignItems: "center", marginBottom: "10px", fontSize: "18px" }}>
                  <input style={{ width: "25px", height: "25px", marginRight: "10px" }} type="checkbox" value={option?.optionText} disabled={true} />
                  {option.optionText}
                </h4>
              ))}
            </div>
          </>
        );

      case "DATE_ANSWER_TYPE":
        return (
          <>
            <TextInput
              type="date"
              textInputStyle={{ maxWidth: "none" }}
              disable={true}

              // defaultValue={value}
            />
          </>
        );

      case "TIME_ANSWER_TYPE":
        return (
          <>
            <TextInput
              type="time"
              textInputStyle={{ maxWidth: "none" }}
              disable={true}

              // defaultValue={value}
            />
          </>
        );

      default:
        return <TextInput name={question.uuid} disable={true} type="text" />;
    }
  };
  return (
    <div className="create-survey-page" style={{ background: "white", display: "block", padding: "15px" }}>
      <div className="category-card">
        <form>
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

                        <div></div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            : null}
        </form>
      </div>
    </div>
  );
};

export default PreviewQuestions;
