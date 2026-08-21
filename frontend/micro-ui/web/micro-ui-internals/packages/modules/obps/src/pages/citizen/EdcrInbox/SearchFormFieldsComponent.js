import { SearchField, TextInput } from "@mseva/digit-ui-react-components";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";

const SearchFormFieldsComponents = ({ registerRef, searchFormState, searchFieldComponents }) => {
  const { t } = useTranslation();
  const isMobile = window.Digit.Utils.browser.isMobile();

  if (!isMobile) {
    return <React.Fragment>
      <div className="search-container obps-pages-citizen-edcr-inbox-search-form-fields-component--style-1" >
        <div className="search-complaint-container">
          <div className="complaint-input-container obps-pages-citizen-edcr-inbox-search-form-fields-component--style-2" >
            <SearchField>
              <label>{t("BPA_APPLICATION_NUMBER_LABEL")}</label>
              <TextInput name="applicationNumber" inputRef={registerRef({})} />
            </SearchField>
            <SearchField>
              <label>{t("BPA_EDCR_NO_LABEL")}</label>
              <TextInput name="edcrNumber" inputRef={registerRef({})} />
            </SearchField>
            <div className="search-action-wrapper obps-pages-citizen-edcr-inbox-search-form-fields-component--style-3" >
              {searchFieldComponents}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  }

  return (
    <>
      <SearchField>
        <label>{t("BPA_APPLICATION_NUMBER_LABEL")}</label>
        <TextInput name="applicationNumber" inputRef={registerRef({})} />
      </SearchField>
      <SearchField>
        <label>{t("BPA_EDCR_NO_LABEL")}</label>
        <TextInput name="edcrNumber" inputRef={registerRef({})} />
      </SearchField>
    </>
  );
};

export default SearchFormFieldsComponents;
