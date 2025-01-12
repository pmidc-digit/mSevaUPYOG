import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../react-components/src/hoc/FormComposer";
import { updateEmployeeForm } from "../../../redux/actions/employeeFormActions";

const EmployeeDetails = ({ config, onGoNext, t }) => {
  function goNext(data) {
    //console.log(`Data in step ${config.currStepNumber} is: \n`, data);
    onGoNext();
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("Form Data: ", data);
    if (!_.isEqual(data, currentStepData)) {
      dispatch(updateEmployeeForm(config.key, data));
    }
  };

  const currentStepData = useSelector((state) => state.hrms.employeeForm.formData?.[config.key] ?? {});
  const dispatch = useDispatch();
  console.log("currentStepData in EmployeeDetails: ",currentStepData);

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        //heading={t("")}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        //isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
      />
    </React.Fragment>
  );
};

export default EmployeeDetails;
