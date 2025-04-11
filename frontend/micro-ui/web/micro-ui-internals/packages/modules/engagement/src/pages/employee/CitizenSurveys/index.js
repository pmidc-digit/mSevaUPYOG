import React from "react";
import { Switch } from "react-router-dom";
import { PrivateRoute } from "@mseva/digit-ui-react-components";
//
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
  return (
    <Switch>
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
    </Switch>
  );
};

export default Surveys;
