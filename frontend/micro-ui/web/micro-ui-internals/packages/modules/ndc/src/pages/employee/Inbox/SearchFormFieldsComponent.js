import React, { Fragment } from "react";
import { CardLabelError, SearchField, TextInput } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const SearchFormFieldsComponents = ({ registerRef, searchFormState, searchFieldComponents }) => {
  const { t } = useTranslation();
  const isMobile = window.Digit.Utils.browser.isMobile();

  console.log("searchFieldComponents", searchFieldComponents);

  if (!isMobile) {
    return (
      <React.Fragment>
        <div className="search-container" style={{ width: "100%", marginLeft: "24px" }}>
          <div className="search-complaint-container">
            <div className="complaint-input-container" style={{ textAlign: "start" }}>
              <SearchField>
                <label>{t("NOC_HOME_SEARCH_RESULTS_APP_NO_LABEL")}</label>
                <TextInput name="uuid" inputRef={registerRef({})} />
              </SearchField>
              <SearchField>
                <label>{t("CORE_COMMON_PHONE_NUMBER")}</label>
                <TextInput name="mobileNumber" inputRef={registerRef({})} />
              </SearchField>
              {/* <SearchField>
                <label>{t("NDC_MSG_PROPERTY_LABEL")}</label>
                <TextInput name="propertyId" inputRef={registerRef({})} />
              </SearchField> */}
              <div className="search-action-wrapper" style={{ width: "100%" }}>
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
        <label>{t("NOC_APPLICATION_NUMBER_LABEL")}</label>
        <TextInput name="uuid" inputRef={registerRef({})} />
      </SearchField>
      <SearchField>
        <label>{t("NOC_BPA_APPLICATION_NUMBER_LABEL")}</label>
        <TextInput name="sourceRefId" inputRef={registerRef({})} />
      </SearchField>
    </>
  );
};

export default SearchFormFieldsComponents;
