import React from 'react'
import NewSurveys from '../../../pages/employee/CitizenSurveys/NewSurvey'
import SurveyCreationPage from './SurveyCreationPage'

const SurveySummary = () => {
  return (
    <div style={{backgroundColor:'white'}}>
      <NewSurveys readOnly={true}/>
      <SurveyCreationPage readOnly={true} hideQuestionLabel={true}/>
    </div>
  )
}

export default SurveySummary