import React from "react";
import { SearchField, TextInput } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const NewSearchFormFieldsComponent = ({ registerRef, searchFormState, searchFieldComponents }) => {
  const { t } = useTranslation();
  const isMobile = window.Digit.Utils.browser.isMobile();

  if (!isMobile) {
    return (
      <React.Fragment>
        <div className="search-container ndc-search-container-custom">
          <div className="search-complaint-container">
            <div className="complaint-input-container ndc-complaint-input-container">
              <SearchField>
                <label>{t("NOC_HOME_SEARCH_RESULTS_APP_NO_LABEL")}</label>
                <TextInput name="applicationNo" inputRef={registerRef({})} />
              </SearchField>
              <SearchField>
                <label>{t("CORE_COMMON_PHONE_NUMBER")}</label>
                <TextInput name="mobileNumber" inputRef={registerRef({})} />
              </SearchField>
              <div className="search-action-wrapper ndc-search-action-wrapper">{searchFieldComponents}</div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <SearchField>
        <label>{t("NOC_HOME_SEARCH_RESULTS_APP_NO_LABEL")}</label>
        <TextInput name="applicationNo" inputRef={registerRef({})} />
      </SearchField>
      <SearchField>
        <label>{t("CORE_COMMON_PHONE_NUMBER")}</label>
        <TextInput name="mobileNumber" inputRef={registerRef({})} />
      </SearchField>
    </React.Fragment>
  );
};

export default NewSearchFormFieldsComponent;
