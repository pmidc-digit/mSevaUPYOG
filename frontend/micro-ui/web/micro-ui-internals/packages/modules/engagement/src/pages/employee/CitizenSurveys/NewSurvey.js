import React from "react";
import { useTranslation } from "react-i18next";
//
import CreateNewSurvey from "../../../components/Surveys/SurveyForms";

const NewSurveys = ({ readOnly }) => {
  const { t } = useTranslation();
  const ulbs = Digit.SessionStorage.get("ENGAGEMENT_TENANTS");
  const userInfo = Digit.UserService.getUser().info;
  const userUlbs = ulbs.filter((ulb) => userInfo?.roles?.some((role) => role?.tenantId === ulb?.code));

  const defaultValues = {
    fromDate: "",
    fromTime: "",
    toDate: "",
    toTime: "",
    questions: {},
    // tenantIds:[]
    tenantIds: userUlbs,
  };

  const stylesForForm = {
    marginLeft:'-20px',
  }

  return (
    <div style={stylesForForm}>
      <CreateNewSurvey t={t} initialFormValues={defaultValues} readOnly={readOnly} />
    </div>
  );
};

export default NewSurveys;
