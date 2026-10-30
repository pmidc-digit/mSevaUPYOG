import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
//
import { FormComposer } from "../../../../../react-components/src/hoc/FormComposer";
import { updateEmployeeForm } from "../../redux/actions/employeeFormActions";
import { hasAssignmentOverlap } from "../../utils/employeeUtils";

// Stable fallback so useSelector does not return a new object on every store update
const EMPTY_STEP_DATA = {};

const AdministrativeDetails = ({ config, onGoNext, onBackClick, t }) => {
  const [canSubmit, setCanSubmit] = useState(false);
  const dispatch = useDispatch();

  const currentStepData = useSelector((state) => state.hrms.employeeForm.formData[config.key] || EMPTY_STEP_DATA);
  // Date of appointment is entered in the previous step, so it is read from the store
  const dateOfAppointment = useSelector((state) => state.hrms.employeeForm.formData.employeeDetails?.SelectDateofEmployment?.dateOfAppointment);

  // Validation function for Administrative Details
  const validateAdminData = (formData) => {
    if (!formData) {
      setCanSubmit(false);
      return;
    }

    // Validate Jurisdictions
    let isJurisdictionsValid = false;
    if (formData.Jurisdictions && formData.Jurisdictions.length > 0) {
      isJurisdictionsValid = formData.Jurisdictions.every((jurisdiction) => {
        return (
          jurisdiction?.boundary && jurisdiction?.boundaryType && jurisdiction?.hierarchy && jurisdiction?.tenantId && jurisdiction?.roles?.length > 0
        );
      });
    }

    // Validate Assignments with checkbox logic
    let isAssignmentsValid = false;
    if (formData.Assignments && formData.Assignments.length > 0) {
      const appointmentTime = dateOfAppointment ? new Date(dateOfAppointment).getTime() : null;
      isAssignmentsValid = formData.Assignments.every((assignment) => {
        const hasBasicFields = assignment.department && assignment.designation && assignment.fromDate;

        // If "isCurrentAssignment" checkbox is checked, toDate is not mandatory
        const hasValidToDate = assignment.isCurrentAssignment || assignment.toDate;

        // If "isHOD" (Head of Department) checkbox is checked, reportingTo field is not mandatory
        const hasValidReportingTo = assignment.isHOD || assignment.reportingTo;

        // An assignment cannot start before the employee was appointed
        const startsAfterAppointment = !appointmentTime || new Date(assignment.fromDate).getTime() >= appointmentTime;

        return hasBasicFields && hasValidToDate && hasValidReportingTo && startsAfterAppointment;
      });
      if (hasAssignmentOverlap(formData.Assignments)) {
        isAssignmentsValid = false;
      }
    }

    // Enable submit if all validations pass
    setCanSubmit(isJurisdictionsValid && isAssignmentsValid);
  };

  // Validate on mount and when the step data or the appointment date changes
  useEffect(() => {
    validateAdminData(currentStepData);
  }, [currentStepData, dateOfAppointment]);

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
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
    </React.Fragment>
  );
};

export default AdministrativeDetails;
