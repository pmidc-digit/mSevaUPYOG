import { CloseSvg, TextInput } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, Fragment } from "react";
import { useDebounce } from "../../../../hooks/useDebounce";

const DropdownType = ({
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
      {options.map((option, i) => (
        <div key={option.id}>
          <DropdownOption
            indexNumber={i}
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

export default DropdownType;

const DropdownOption = ({
  indexNumber,
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
        <span>{indexNumber + 1}.</span>
        <input
          type="text"
          ref={inputRef}
          value={optionTitle}
          onChange={(ev) => setOptionTitle(ev.target.value)}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          className="employee-card-input"
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
          onWheel={(e) => e.target.blur()}
          className="employee-card-input"
          //    name={`questions[${index}].optionsWeightage`}
          onChange={handleChange}
        />
        {error && <span style={{ color: "red" }}>{error}</span>}
        {optionsLength > 1 && (
          <div style={{ position: "absolute", right: "88px", top: "32px" }} className="pointer" onClick={() => removeOption(index)}>
            <CloseSvg />
          </div>
        )}
      </div>
    </div>
  );
};
