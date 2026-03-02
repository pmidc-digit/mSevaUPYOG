import { CloseSvg, TextInput } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, Fragment } from "react";
import { useDebounce } from "../../../../hooks/useDebounce";

const MultipleChoice = ({
  t,
  options = [],
  updateOption,
  addOption,
  removeOption,
  createNewSurvey,
  isPartiallyEnabled,
  formDisabled,
  inputRef,
  maxLength,
  titleHover,
  weightHover,
  minWeight,
  maxWeight,
  isInputDisabled,
}) => {
  return (
    <div className="options_checkboxes">
      {options.map((option) => (
        <div key={option.id}>
          <RadioButtonOption
            index={option.id}
            title={option.title}
            weightage={option.optionWeightage}
            updateOption={updateOption}
            removeOption={removeOption}
            inputRef={inputRef}
            maxLength={maxLength}
            titleHover={titleHover}
            weightageHover={weightHover}
            minWeight={minWeight}
            maxWeight={maxWeight}
            isPartiallyEnabled={isPartiallyEnabled}
            isInputDisabled={isInputDisabled}
            formDisabled={formDisabled}
            optionsLength={options.length}
          />
        </div>
      ))}
      <div>
        <button
          className="unstyled-button link"
          type="button"
          style={{ display: "block", padding: "8px 16px 8px", backgroundColor: "#2947a3", color: "white", borderRadius: "8px" }}
          disabled={(!createNewSurvey && formDisabled) || (isPartiallyEnabled ? !isPartiallyEnabled : formDisabled)}
          onClick={() => addOption()}
        >
          {t("CS_COMMON_ADD_OPTION")}
        </button>
      </div>
    </div>
  );
};

export default MultipleChoice;

const RadioButtonOption = ({
  index,
  title,
  weightage,
  updateOption,
  removeOption,
  inputRef,
  maxLength,
  titleHover,
  weightHover,
  minWeight,
  maxWeight,
  isPartiallyEnabled,
  isInputDisabled,
  formDisabled,
  optionsLength,
}) => {
  const [optionTitle, setOptionTitle] = useState(title);
  const [optionWeightage, setOptionWeightage] = useState(weightage);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    updateOption({ value: optionTitle, id: index, weightage: optionWeightage });
  }, [optionTitle, optionWeightage]);
  const handleChange = (e) => {
    const inputValue = e.target.value;
    const number = parseInt(inputValue, 10);

    if (inputValue === "" || (/^(10|[0-9])$/.test(inputValue) && !inputValue.includes("-"))) {
      setError("");
      setOptionWeightage(e.target.value);
    } else {
      setError("Please enter a number between 0 and 10.");
    }
  };
  return (
    <div className="optionradiobtnwrapper" style={{ alignItems: "end", justifyContent: "flex-start", position: "relative" }}>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
        <input type="radio" className="customradiobutton" disabled={isInputDisabled} />
        <input
          type="text"
          ref={inputRef}
          value={optionTitle}
          onChange={(ev) => setOptionTitle(ev.target.value)}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          className="employee-card-input"
          // style={{ borderRadius: "8px", border: "1px solid #b4b4b4", paddingLeft: "5px" }}
          // className={isFocused ? "simple_editable-input" : "simple_readonly-input"}
          maxLength={maxLength}
          title={titleHover}
          disabled={isPartiallyEnabled ? !isPartiallyEnabled : formDisabled}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", fontSize: "14px" }}>
        <label htmlFor="numberInput">Enter a number (0-10):</label>
        <input
          type="number"
          id="numberInput"
          // defaultValue={optionWeightage}
          value={optionWeightage}
          required
          placeholder="Option Weightage"
          min={minWeight}
          max={maxWeight}
          title={weightHover}
          className="employee-card-input"
          //    name={`questions[${index}].optionsWeightage`}
          onChange={handleChange}
          onWheel={(e) => e.target.blur()}
        />
        {error && <span style={{ color: "red" }}>{error}</span>}
      </div>
      {optionsLength > 1 && (
        <div style={{ position: "absolute", right: "75px", top: "32px" }} className="pointer" onClick={() => removeOption(index)}>
          <CloseSvg />
        </div>
      )}
    </div>
  );
};
