import React from "react"
import { Switch } from "react-router-dom"
import { PrivateRoute, Route } from "@upyog/digit-ui-react-components"
import Inbox from "./Inbox"
import NewSurvey from "./NewSurvey"
import CreateResponse from "./responses/create"
import UpdateResponse from './responses/update'
import DeleteResponse from "./responses/delete"
//import EditSurvey from "./EditSurvey"
import SurveyDetails from "./SurveyDetails"
import SurveyResults from "./SurveyResults"
import SurveyCategory from "./SurveyCategory"
import SearchCategory from "./SearchCategory"
import SurveyQuestions from "./SurveyQuestions"
import SearchQuestions from "./SearchQuestions"
import SurveyForm from "../../../components/Surveys/SurveyForms/SurveyForm"
import CreateSurveyStepForm from "../../../components/Surveys/CreateSurveyStepForm"

const Surveys = ({match:{path} = {}, tenants, parentRoute}) => {
   
    console.log("ushdsgdsv");
   
    return <Switch>
        <PrivateRoute path={`${path}/inbox/create`} component={props => <NewSurvey {...props} />} />
        <PrivateRoute path={`${path}/create`} component={props => <NewSurvey {...props} />} />
        <PrivateRoute path={`${path}/inbox/details/:id`} component={props => <SurveyDetails {...props} />} />
        {/* <PrivateRoute path={`${path}/inbox/edit/:id`} component={props => <EditSurvey {...props} />} /> */}
        <PrivateRoute path={`${path}/inbox/results/:id`} component={(props) => <SurveyResults {...props} />} />
        <PrivateRoute path={`${path}/inbox`} component={props => <Inbox {...props} tenants={tenants} parentRoute={parentRoute} />} />
        <PrivateRoute path={`${path}/create-response`} component={(props) => <CreateResponse {...props} />} />
        <PrivateRoute path={`${path}/update-response`} component={(props) => <UpdateResponse {...props} />} />
        <PrivateRoute path={`${path}/create-category`} component={(props) => <SurveyCategory {...props} />} />
        <PrivateRoute path={`${path}/search-category`} component={(props) => <SearchCategory {...props} parentRoute={parentRoute}/>} />
        <PrivateRoute path={`${path}/create-questions`} component={(props) => <SurveyQuestions {...props} />} />
        <PrivateRoute path={`${path}/search-questions`} component={(props) => <SearchQuestions {...props} />} />
        <PrivateRoute path={`${path}/create-survey`} component={(props) => <SurveyForm {...props} />} />
        <PrivateRoute path={`${path}/create-survey-step-form`} component={(props) => <CreateSurveyStepForm {...props} />} />
    </Switch>
}

export default Surveys 