import { CloseSvg } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useDebounce } from "../../../../hooks/useDebounce";

const MultipleChoice = ({
  t,
  options=[],
  updateOption,
  addOption,
  removeOption,
  createNewSurvey,
  isPartiallyEnabled,
  formDisabled,
  inputRef,
  maxLength,
  titleHover,
  isInputDisabled,
}) => {
  return (
    <div className="options_checkboxes">
      {options.map((option) => (
        <div key={option.id}>
          <RadioButtonOption
            index={option.id}
            title={option.title}
            updateOption={updateOption}
            removeOption={removeOption}
            inputRef={inputRef}
            maxLength={maxLength}
            titleHover={titleHover}
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
  updateOption,
  removeOption,
  inputRef,
  maxLength,
  titleHover,
  isPartiallyEnabled,
  isInputDisabled,
  formDisabled,
  optionsLength
}) => {
  const [optionTitle, setOptionTitle] = useState(title);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    updateOption({ value: optionTitle, id: index });
  }, [optionTitle]);

  return (
    <div className="optionradiobtnwrapper">
      <input type="radio" className="customradiobutton" disabled={isInputDisabled} />
      <input
        type="text"
        ref={inputRef}
        value={optionTitle}
        onChange={(ev) => setOptionTitle(ev.target.value)}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        className={isFocused ? "simple_editable-input" : "simple_readonly-input"}
        maxLength={maxLength}
        title={titleHover}
        disabled={isPartiallyEnabled ? !isPartiallyEnabled : formDisabled}
      />
       {optionsLength > 1 && (
      <div className="pointer" onClick={() => removeOption(index)}>
        <CloseSvg />
      </div>
       )}
    </div>
  );
};
