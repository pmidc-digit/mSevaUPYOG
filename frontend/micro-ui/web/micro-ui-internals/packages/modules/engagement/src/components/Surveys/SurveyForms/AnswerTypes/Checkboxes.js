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
            updateOption={updateOption}
            removeOption={removeOption}
            maxLength={maxLength}
            titleHover={titleHover}
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

export default Checkboxes;

const CheckBoxOption = ({
  index,
  title,
  updateOption,
  removeOption,
  maxLength,
  titleHover,
  inputRef,
  labelstyle,
  isPartiallyEnabled,
  isInputDisabled,
  formDisabled,
  optionsLength,
}) => {
  const [optionTitle, setOptionTitle] = useState(title);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    updateOption({ value: optionTitle, id: index });
  }, [optionTitle]);

  return (
    <div className="optioncheckboxwrapper">
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
    </div>
  );
};
