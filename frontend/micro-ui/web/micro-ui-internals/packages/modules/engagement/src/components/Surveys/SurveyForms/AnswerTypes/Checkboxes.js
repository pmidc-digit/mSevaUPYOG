import { CheckBox, CloseSvg } from "@mseva/digit-ui-react-components";
import React, { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../../../../hooks/useDebounce";

const Checkboxes = ({
  t,
  options = [],
  updateOption,
  addOption,
  removeOption,
  isPartiallyEnabled,
  createNewSurvey,
  formDisabled,
  maxLength,
  titleHover,
  weightHover,
  minWeight,
  maxWeight,
  inputRef,
  labelstyle,
  isInputDisabled,
}) => {
  return (
    <div className="options_checkboxes">
      {options.map((option) => (
        <div key={option.id}>
          <CheckBoxOption
            index={option.id}
            title={option.title}
            weightage={option.optionWeightage}
            updateOption={updateOption}
            removeOption={removeOption}
            maxLength={maxLength}
            titleHover={titleHover}
            weightageHover={weightHover}
            minWeight={minWeight}
            maxWeight={maxWeight}
            inputRef={inputRef}
            labelstyle={labelstyle}
            isPartiallyEnabled={isPartiallyEnabled}
            isInputDisabled={isInputDisabled}
            formDisabled={formDisabled}
            optionsLength={options.length}
          />
        </div>
      ))}
      <div>
        <button
          //  className="unstyled-button link"
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

export default Checkboxes;

const CheckBoxOption = ({
  index,
  title,
  weightage,
  updateOption,
  removeOption,
  maxLength,
  titleHover,
  weightHover,
  minWeight,
  maxWeight,
  inputRef,
  labelstyle,
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
    <div className="optioncheckboxwrapper" style={{ alignItems: "flex-start" }}>
      <CheckBox disable={isInputDisabled} />
      <input
        ref={inputRef}
        type="text"
        value={optionTitle}
        onChange={(ev) => setOptionTitle(ev.target.value)}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        className={isFocused ? "simple_editable-input" : "simple_readonly-input"}
        maxLength={maxLength}
        title={titleHover}
        style={{ ...labelstyle }}
        disabled={isPartiallyEnabled ? !isPartiallyEnabled : formDisabled}
      />
      {optionsLength > 1 && (
        <div className="pointer" onClick={() => removeOption(index)}>
          <CloseSvg />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label htmlFor="numberInput">Enter a number (0-10):</label>
        <input
          type="number"
          id="numberInput"
          //  defaultValue={optionWeightage}
          value={optionWeightage}
          required
          placeholder="Option Weightage"
          min={minWeight}
          max={maxWeight}
          title={weightHover}
          onWheel={(e) => e.target.blur()}
          className="employee-card-input"
          //    name={`questions[${index}].optionsWeightage`}
          onChange={handleChange}
        />
        {error && <span style={{ color: "red" }}>{error}</span>}
      </div>
    </div>
  );
};
