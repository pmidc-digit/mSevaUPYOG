import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
//
import { FormComposer } from "../../../../../react-components/src/hoc/FormComposer";
import { updateEmployeeForm } from "../../redux/actions/employeeFormActions";

const AdministrativeDetails = ({ config, onGoNext, onBackClick, t }) => {
  const [canSubmit, setCanSubmit] = useState(false);
  const dispatch = useDispatch();

  const currentStepData = useSelector(function (state) {
    return state.hrms.employeeForm.formData && state.hrms.employeeForm.formData[config.key] 
        ? state.hrms.employeeForm.formData[config.key] 
        : {};
  });

  // Validation function for Administrative Details
  const validateAdminData = (formData) => {

    if (!formData) {
      setCanSubmit(false);
      return;
    }

    // Validate Jurisdictions
    let isJurisdictionsValid = false;
    if (formData.Jurisdictions && formData.Jurisdictions.length > 0) {
      isJurisdictionsValid = formData.Jurisdictions.every(jurisdiction => {
        return (
          jurisdiction?.boundary &&
          jurisdiction?.boundaryType &&
          jurisdiction?.hierarchy &&
          jurisdiction?.tenantId &&
          jurisdiction?.roles?.length > 0
        );
      });
    }

    // Validate Assignments with checkbox logic
    let isAssignmentsValid = false;
    if (formData.Assignments && formData.Assignments.length > 0) {
      isAssignmentsValid = formData.Assignments.every(assignment => {
        const hasBasicFields = assignment.department && 
                              assignment.designation && 
                              assignment.fromDate;
        
        // If "isCurrentAssignment" checkbox is checked, toDate is not mandatory
        const hasValidToDate = assignment.isCurrentAssignment || assignment.toDate;
        
        // If "isHOD" (Head of Department) checkbox is checked, reportingTo field is not mandatory
        const hasValidReportingTo = assignment.isHOD || assignment.reportingTo;
        
        return hasBasicFields && hasValidToDate && hasValidReportingTo;
      });
    }

    // Enable submit if all validations pass
    const isValid = isJurisdictionsValid && isAssignmentsValid;
    setCanSubmit(isValid);
  };

  // Validate on mount and when currentStepData changes
  useEffect(() => {
    validateAdminData(currentStepData);
  }, [currentStepData]);

  function goNext(data) {
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    
    if (!_.isEqual(data, currentStepData)) {
      dispatch(updateEmployeeForm(config.key, data));
    }
    
    // Validate on every form change
    validateAdminData(data);
  };

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        //heading={t("")}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.stepNumber}
        onBackClick={onGoBack}
      />
    </React.Fragment>
  );
};

export default AdministrativeDetails;
