import React from "react";
import { useTranslation } from "react-i18next";
import { FormStep, Dropdown } from "@mseva/digit-ui-react-components";
import { subYears, format } from "date-fns";
const genders = [
  { name: "Male", code: "Male" },
  { name: "Female", code: "Female" },
];
const convertDateToEpoch = (dateString, dayStartOrEnd = "dayend") => {
  //example input format : "2018-10-02"
  try {
    const parts = dateString.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    const DateObj = new Date(Date.UTC(parts[1], parts[2] - 1, parts[3]));
    DateObj.setMinutes(DateObj.getMinutes() + DateObj.getTimezoneOffset());
    if (dayStartOrEnd === "dayend") {
      DateObj.setHours(DateObj.getHours() + 24);
      DateObj.setSeconds(DateObj.getSeconds() - 1);
    }
    return DateObj.getTime();
  } catch (e) {
    return dateString;
  }
};

const selectCommencementDate = (value) => {
  const appDate = new Date();
  const proposedDate = format(subYears(appDate, 18), "yyyy-MM-dd").toString();

  if (convertDateToEpoch(proposedDate) <= convertDateToEpoch(value)) {
    return true;
  } else {
    return false;
  }
};

const RegistrationForm = ({ onRegisterSubmit, onAgeError, selectedLanguage, selectedCity, mobileNumber }) => {
  const { t } = useTranslation();

  const handleSubmit = (formData) => {
    // Check age validation after required field validation
    if (formData.dob && selectCommencementDate(formData.dob)) {
      onAgeError && onAgeError("Minimum age should be 18 years");
    } else {
      onRegisterSubmit && onRegisterSubmit(formData);
    }
  };

  return (
    <div className="input-wrapper">
      <FormStep
        isDisabled={false}
        onSelect={handleSubmit}
        _defaultValues={{ mobileNumber: mobileNumber || "" }}
        config={{
          texts: {
            // header: t("CS_LOGIN_PROVIDE_DETAILS"),
            submitBarLabel: t("CS_COMMONS_NEXT"),
          },
          inputs: [
            {
              label: "CORE_COMMON_MOBILE_NUMBER",
              type: "text",
              name: "mobileNumber",
              error: "CORE_COMMON_MOBILE_NUMBER_VALIDMSG",
              labelChildren: <span style={{ color: "red" }}> *</span>,
              validation: {
                required: true,
                minLength: 10,
                maxLength: 10,
                // pattern: /^[0-9]{10}$/,
              },

              defaultValue: mobileNumber || "",
            },

            {
              label: "CORE_COMMON_NAME",
              type: "text",
              name: "name",
              error: "CORE_COMMON_NAME_VALIDMSG",
              labelChildren: <span style={{ color: "red" }}> *</span>,
              validation: {
                required: true,
                minLength: 1,
                pattern: /^[^{0-9}^\$\"<>?\\\\~!@#$%^()+={}\[\]*,/_:;""'']{1,50}$/i,
              },
            },
            {
              label: "CORE_COMMON_EMAIL_ID",
              type: "text",
              name: "emailId",
              error: t("CORE_COMMON_PROFILE_EMAIL_INVALID"),
              labelChildren: <span style={{ color: "red" }}> *</span>,
              validation: {
                required: true,
                minLength: 1,
                pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i,
                maxLength: 100,
              },
            },
            {
              label: "CORE_COMMON_DOB",
              type: "date",
              name: "dob",
              error: "please enter valid date",
              labelChildren: <span style={{ color: "red" }}> *</span>,
              validation: {
                required: true,
              },
            },
          ],
        }}
        t={t}
        cardStyle={{
          backgroundColor: "transparent",
          boxShadow: "none",
          WebkitBoxShadow: "none",
          padding: "0",
          margin: "0",
          maxWidth: "550px",
        }}
      />
    </div>
  );
};

export default RegistrationForm;
