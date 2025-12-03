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

  const style = {
    languageWrapper: {
      width: "100%",
      maxWidth: "260px",
    },
  };

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

    <div className="language-wrapper" style={{ width: "100%", marginBottom: "24px" }}>
      <div className="label" style={{ fontWeight: 500, fontSize: "16px", lineHeight: "25px", color: "#686677", marginBottom: "8px" }}>
        {t("CS_COMMON_CHOOSE_LANGUAGE")}
        <span style={{ color: "#ff1515" }}> *</span>
      </div>
      {!isLoading && (
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          {languages?.map((language) => (
            <button
              key={language.value}
              onClick={() => handleLanguageSelect(language)}
              style={{
                flex: 1,
                padding: "12px 20px",
                border: selectedLanguage === language.value ? "2px solid #5b68f0" : "1px solid #d0d5dd",
                borderRadius: "8px",
                backgroundColor: selectedLanguage === language.value ? "#f0f1ff" : "#ffffff",
                color: selectedLanguage === language.value ? "#5b68f0" : "#344054",
                fontSize: "16px",
                fontWeight: selectedLanguage === language.value ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (selectedLanguage !== language.value) {
                  e.target.style.borderColor = "#98a2b3";
                  e.target.style.backgroundColor = "#f9fafb";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedLanguage !== language.value) {
                  e.target.style.borderColor = "#d0d5dd";
                  e.target.style.backgroundColor = "#ffffff";
                }
              }}
            >
              {language.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelect;
