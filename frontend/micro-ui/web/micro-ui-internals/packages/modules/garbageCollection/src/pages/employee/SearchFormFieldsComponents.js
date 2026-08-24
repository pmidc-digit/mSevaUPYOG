import React, { Fragment } from "react";
import { CardLabelError, SearchField, TextInput } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const SearchFormFieldsComponents = ({ registerRef, searchFormState, searchFieldComponents }) => {
  const { t } = useTranslation();
  const isMobile = window.Digit.Utils.browser.isMobile();

  if (!isMobile) {
    return (
      <React.Fragment>
        <div className="search-container gc-style-fc2ccff82b" >
          <div className="search-complaint-container">
            <div className="complaint-input-container gc-style-a7bf4d9876" >
              <SearchField>
                <label>{t("NOC_HOME_SEARCH_RESULTS_APP_NO_LABEL")}</label>
                <TextInput name="applicationNumber" inputRef={registerRef({})} />
              </SearchField>
              <SearchField>
                <label>{t("CORE_COMMON_PHONE_NUMBER")}</label>
                <TextInput name="mobileNumber" inputRef={registerRef({})} />
              </SearchField>
              <div className="search-action-wrapper gc-style-69d66e5b2e" >
                {searchFieldComponents}
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  return (
    <>
      <SearchField>
        <label>{t("NOC_HOME_SEARCH_RESULTS_APP_NO_LABEL")}</label>
        <TextInput name="applicationNumber" inputRef={registerRef({})} />
      </SearchField>
      <SearchField>
        <label>{t("CORE_COMMON_PHONE_NUMBER")}</label>
        <TextInput name="mobileNumber" inputRef={registerRef({})} />
      </SearchField>
    </>
  );
};

export default SearchFormFieldsComponents;
