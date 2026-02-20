import React from "react";
import { Switch, useLocation } from "react-router-dom";
import { PrivateRoute, BreadCrumb } from "@mseva/digit-ui-react-components";
//
import { useTranslation } from "react-i18next";

import Inbox from "./Inbox";
import CreateSurveyCategory from "./CreateSurveyCategory";
import SearchCategories from "./SearchCategories";
import CreateSurveyQuestions from "./CreateSurveyQuestions";
import SearchQuestions from "./SearchQuestions";
import CreateSurveyStepForm from "./CreateSurveyStepForm";
import FillSurveyEmp from "./FillSurveyEmp";
import FillQuestions from "../../../components/Surveys/FillQuestions";
//
import CreateResponse from "./responses/create";
import UpdateResponse from "./responses/update";
//import SurveyDetails from "./SurveyDetails";
import SurveyResults from "./SurveyResults";
import SubmitResponse from "./responses/submit";
import PreviewQuestions from "../../../components/Surveys/PreviewQuestions";
//
import NewSurvey from "./NewSurvey";
import DeleteResponse from "./responses/delete";
import SurveyForm from "../../../components/Surveys/SurveyForms/SurveyForm";
import CreateSurveyForm from "../../../components/Surveys/SurveyForms/CreateSurveyForm";
import ActiveAndOpenSurveys from "../../../components/Surveys/ActiveAndOpenSurveys";

const Surveys = ({ match: { path } = {}, tenants, parentRoute, userType, stateCode }) => {
  const isMobile = window.Digit.Utils.browser.isMobile();
  const PETBreadCrumbs = ({ location }) => {
    const { t } = useTranslation();
    const search = useLocation().search;
    const fromScreen = new URLSearchParams(search).get("from") || null;
    const { from: fromScreen2 } = Digit.Hooks.useQueryParams();
    const crumbs = [
      {
        path: "/digit-ui/employee",
        content: t("ES_COMMON_HOME"),
        show: true,
      },
      {
        path: "/digit-ui/employee/engagement/surveys/inbox",
        content: t("ES_TITLE_INBOX"),
        show: true,
      },
    ];

    return <BreadCrumb style={isMobile ? { display: "flex" } : {}} spanStyle={{ maxWidth: "min-content" }} crumbs={crumbs} />;
  };

  const location = useLocation();
  const isRes = window.location.href.includes("engagement/surveys");
  const isNewRegistration =
    window.location.href.includes("new-application") ||
    window.location.href.includes("modify-application") ||
    window.location.href.includes("ptr/application-details");
  return (
    <Switch>
      <React.Fragment>
        <div className="ground-container">
          <div className={`${isNewRegistration ? "ads-registration-row--new" : "ads-registration-row--existing"}`}>
            <PETBreadCrumbs location={location} />
          </div>

          <PrivateRoute path={`${path}/inbox`} component={(props) => <Inbox {...props} tenants={tenants} parentRoute={parentRoute} />} />
          <PrivateRoute path={`${path}/create-category`} component={(props) => <CreateSurveyCategory {...props} />} />
          <PrivateRoute path={`${path}/search-categories`} component={(props) => <SearchCategories {...props} parentRoute={parentRoute} />} />
          <PrivateRoute path={`${path}/create-questions`} component={(props) => <CreateSurveyQuestions {...props} />} />
          <PrivateRoute path={`${path}/search-questions`} component={(props) => <SearchQuestions {...props} />} />
          <PrivateRoute path={`${path}/create-survey-step-form`} component={(props) => <CreateSurveyStepForm {...props} />} />
          <PrivateRoute path={`${path}/fill-citizen-details-survey`} component={(props) => <FillSurveyEmp {...props} stateCode={stateCode} />} />
          <PrivateRoute path={`${path}/fill-survey`} component={(props) => <FillQuestions {...props} userType={userType} />} />
          <PrivateRoute path={`${path}/active-open-surveys`} component={(props) => <ActiveAndOpenSurveys {...props} userType={userType} />} />
          {/*  */}
          <PrivateRoute path={`${path}/create-response`} component={(props) => <CreateResponse {...props} />} />
          <PrivateRoute path={`${path}/update-response`} component={(props) => <UpdateResponse {...props} />} />
          <PrivateRoute path={`${path}/submit-response`} component={(props) => <SubmitResponse {...props} />} />
          {/* <PrivateRoute path={`${path}/inbox/details/:id`} component={(props) => <SurveyDetails {...props} />} /> */}
          <PrivateRoute path={`${path}/inbox/results/:id`} component={(props) => <SurveyResults {...props} />} />
          <PrivateRoute path={`${path}/previewQuestions`} component={(props) => <PreviewQuestions {...props} />} />

          {/* <PrivateRoute path={`${path}/inbox/create`} component={(props) => <NewSurvey {...props} />} /> */}
          {/* <PrivateRoute path={`${path}/create`} component={(props) => <NewSurvey {...props} />} /> */}
          {/* <PrivateRoute path={`${path}/inbox/edit/:id`} component={props => <EditSurvey {...props} />} /> */}
          {/* <PrivateRoute path={`${path}/create-survey`} component={(props) => <SurveyForm {...props} />} /> */}
          {/* <PrivateRoute path={`${path}/create-survey-form`} component={(props) => <CreateSurveyForm {...props} />} /> */}
        </div>
      </React.Fragment>
    </Switch>
  );
};

export default Surveys;
