import React from "react"
import { useTranslation } from "react-i18next"

const LayoutSearchFormFields = ({ registerRef, searchFormState, searchFieldComponents }) => {
  const { t } = useTranslation()
  const isMobile = window.Digit.Utils.browser.isMobile()

  if (!isMobile) {
    return (
      <React.Fragment>
        <div className="search-container">
          <div className="search-complaint-container">
            <div className="complaint-input-container">
              <div className="search-field">
                <label>{t("LAYOUT_APPLICATION_NUMBER_LABEL")}</label>
                <input type="text" name="applicationNumber" ref={registerRef({})} />
              </div>
              <div className="search-field">
                <label>{t("LAYOUT_APPLICANT_MOBILE_NO_LABEL")}</label>
                <input type="text" name="mobileNumber" ref={registerRef({})} />
              </div>
              <div className="search-action-wrapper">
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
      <div className="search-field" style={{ marginBottom: "12px" }}>
        <label>{t("LAYOUT_APPLICATION_NUMBER_LABEL")}</label>
        <input type="text" name="applicationNumber" ref={registerRef({})} />
      </div>
      <div className="search-field" style={{ marginBottom: "12px" }}>
        <label>{t("LAYOUT_APPLICANT_MOBILE_NO_LABEL")}</label>
        <input type="text" name="mobileNumber" ref={registerRef({})} />
      </div>
      <div style={{ marginTop: "16px" }}>
        {searchFieldComponents}
      </div>
    </React.Fragment>
  )
}

export default LayoutSearchFormFields
