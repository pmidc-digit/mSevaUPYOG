import { Card, CustomButton, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import Background from "../../../components/Background";

const LanguageSelection = () => {
  const { data: storeData, isLoading } = Digit.Hooks.useStore.getInitData();
  const { t } = useTranslation();
  const history = useHistory();
  const { languages, stateInfo } = storeData || {};
  const selectedLanguage = Digit.StoreData.getCurrentLanguage();
  const [selected, setselected] = useState(selectedLanguage);
  const handleChangeLanguage = (language) => {
    setselected(language.value);
    Digit.LocalizationService.changeLanguage(language.value, stateInfo.code);
  };

  const handleSubmit = () => {
    history.push("/digit-ui/employee/user/login");
  };

  if (isLoading) return null;

  return (
    <Background>
      <Card className="langSelection">
        <div className="language-selector" style={{ justifyContent: "space-around", marginBottom: "24px", padding: "0 5%" }}>
          {languages.map((language, index) => (
            <div className="language-button-container" key={index}>
              <CustomButton
                selected={language.value === selected}
                text={language.label}
                onClick={() => handleChangeLanguage(language)}
              />
            </div>
          ))}
        </div>
        <SubmitBar style={{ width: "100%" }} label={t(`CORE_COMMON_CONTINUE`)} onSubmit={handleSubmit} />
      </Card>
    </Background>
  );
};

export default LanguageSelection;
