import React from "react"
import { CardLabelError, SearchField, TextInput, MobileNumber } from "@mseva/digit-ui-react-components"
import { useTranslation } from "react-i18next"

const CLUSearchFormFields = ({ registerRef, searchFormState, searchFieldComponents }) => {
  const { t } = useTranslation()
  const isMobile = window.Digit.Utils.browser.isMobile()

  const gridStyles = () => {
    return { gridTemplateColumns: "33.33% 67.33%", textAlign: "start" }
  }

  if (!isMobile) {
    return (
      <React.Fragment>
        <div className="search-container" style={{  marginLeft: "24px" }}>
          <div className="search-complaint-container">
            <div
              className="complaint-input-container"
              style={window.location.href.includes("/citizen") ? gridStyles() : { textAlign: "start" }}
            >
              <SearchField>
                <label>{t("BPA_APPLICATION_NUMBER_LABEL")}</label>
                <TextInput name="applicationNumber" inputRef={registerRef({})} />
              </SearchField>
              <SearchField>
                <label>{t("BPA_APPLICANT_MOBILE_NO_LABEL")}</label>
                <TextInput name="mobileNumber" inputRef={registerRef({})} />
              </SearchField>
              <div className="search-action-wrapper" style={{ width: "100%" }}>
                {searchFieldComponents}
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
  return (
    <React.Fragment>
      <SearchField>
        <label>{t("BPA_APPLICATION_NUMBER_LABEL")}</label>
        <TextInput name="applicationNumber" inputRef={registerRef({})} />
      </SearchField>
      <SearchField>
        <label>{t("BPA_APPLICANT_MOBILE_NO_LABEL")}</label>
        <TextInput name="mobileNumber" inputRef={registerRef({})} />
      </SearchField>
    </React.Fragment>
  )
}

export default CLUSearchFormFields
