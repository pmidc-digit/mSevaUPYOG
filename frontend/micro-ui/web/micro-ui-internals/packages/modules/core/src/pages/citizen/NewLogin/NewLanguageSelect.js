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

  return (
    // <PageBasedInput texts={{}} onSubmit={() => {}} isDisabled={true} >
    <div className="language-wrapper">
      <div className="label">
        {t("CS_COMMON_CHOOSE_LANGUAGE")}
        <span> *</span>
      </div>
      {!isLoading && <RadioButtons {...languagesProps} style={{ display: "flex", gap: "20px" }} />}
    </div>
    // </PageBasedInput>
  );
};

export default LanguageSelect;
