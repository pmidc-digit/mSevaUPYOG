import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RadioButtons } from "@mseva/digit-ui-react-components";

const LanguageSelect = ({ onLanguageChange }) => {
  const { t } = useTranslation();
  const { data: { languages, stateInfo } = {}, isLoading } = Digit.Hooks.useStore.getInitData();
  const selectedLanguage = Digit.StoreData.getCurrentLanguage();

  const languagesProps = useMemo(
    () => ({
      options: languages,
      optionsKey: "label",
      // additionalWrapperClass: "reverse-radio-selection-wrapper",
      onSelect: (language) => {
        Digit.LocalizationService.changeLanguage(language.value, stateInfo.code);
        onLanguageChange && onLanguageChange(language.value);
      },
      selectedOption: languages?.find((i) => i.value === selectedLanguage),
    }),
    [languages, selectedLanguage, onLanguageChange]
  );


    const handleLanguageSelect = (language) => {
    Digit.LocalizationService.changeLanguage(language.value, stateInfo.code)
    onLanguageChange && onLanguageChange(language.value)
  }
  return (
    // <div className="language-wrapper" style={style.languageWrapper}>
    //   <div className="label">
    //     {t("CS_COMMON_CHOOSE_LANGUAGE")}
    //     <span> *</span>
    //   </div>
    //   {!isLoading && <RadioButtons {...languagesProps} style={{ display: "flex", gap: "20px" }} />}
    // </div>

 <div className="newLoginlanguageWrapper">
      <div className="newLoginlabel">
        {t("CS_COMMON_CHOOSE_LANGUAGE")}
        <span className="newLoginrequired"> *</span>
      </div>

      {!isLoading && (
        <div className="newLoginlanguageButtonContainer">
          {languages?.map((language) => {
            const isSelected = selectedLanguage === language.value;
            return (
              <button
                key={language.value}
                onClick={() => handleLanguageSelect(language)}
                // className={`${newLoginlanguageButton} ${isSelected ? newLoginSelected : ""}`}
                className={`newLoginlanguageButton ${isSelected ? "selected" : ""}`}
              >
                {language.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelect;
