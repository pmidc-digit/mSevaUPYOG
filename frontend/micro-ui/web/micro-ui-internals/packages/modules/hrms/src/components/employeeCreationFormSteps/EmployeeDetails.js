import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
//
import { FormComposer } from "../../../../../react-components/src/hoc/FormComposer";
import { updateEmployeeForm } from "../../redux/actions/employeeFormActions";
import { CardHeader } from "@mseva/digit-ui-react-components";

const EmployeeDetails = ({ config, onGoNext, t }) => {
  const [canSubmit, setSubmitValve] = useState(false);
  function goNext(data) {
    //console.log(`Data in step ${config.currStepNumber} is: \n`, data);
    onGoNext();
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("Form Data changed: ", data);
    
    // Update Redux if data changed
    if (!_.isEqual(data, currentStepData)) {
      dispatch(updateEmployeeForm(config.key, data));
    }
    
    // Always run validation regardless of equality check
    checkConditions(data);
  };

  var currentStepData = useSelector(function (state) {
    return state.hrms &&
           state.hrms.employeeForm &&
           state.hrms.employeeForm.formData &&
           state.hrms.employeeForm.formData[config.key] !== undefined
        ? state.hrms.employeeForm.formData[config.key] 
        : {};
});
  const dispatch = useDispatch();
  console.log("currentStepData in EmployeeDetails: ", currentStepData);

  const [mobileNumber, setMobileNumber] = useState(null);
  const [phonecheck, setPhonecheck] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  useEffect(() => {
    if (mobileNumber && mobileNumber.length == 10 && mobileNumber.match(Digit.Utils.getPattern("MobileNo"))) {
      setShowToast(null);
      Digit.HRMSService.search(tenantId, null, { phone: mobileNumber }).then((result, err) => {
        if (result.Employees.length > 0) {
          setShowToast({ key: true, label: "ERR_HRMS_USER_EXIST_MOB" });
          setPhonecheck(false);
        } else {
          setPhonecheck(true);
        }
      });
    } else {
      setPhonecheck(false);
    }
  }, [mobileNumber]);
  const checkMailNameNum = (formData) => {
    const email = formData?.SelectEmployeeEmailId?.emailId || "";
    const name = formData?.SelectEmployeeName?.employeeName || "";
    const address = formData?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress || "";
    const validEmail = email.length == 0 ? true : email.match(Digit.Utils.getPattern("Email"));
    return validEmail && name.match(Digit.Utils.getPattern("Name")) && address.match(Digit.Utils.getPattern("Address"));
  };
  // Validate on mount and when currentStepData or phonecheck changes
  useEffect(() => {
    console.log("Running validation on mount/data change");
    checkConditions(currentStepData);
  }, [currentStepData, phonecheck]);

  const checkConditions = (formData) => {
    console.log("Checking conditions with formData: ", formData);
    
    // Update mobile number if changed
    if (formData?.SelectEmployeePhoneNumber?.mobileNumber) {
      setMobileNumber(formData?.SelectEmployeePhoneNumber?.mobileNumber);
    } else {
      setMobileNumber(formData?.SelectEmployeePhoneNumber?.mobileNumber);
    }
    if (
      formData?.SelectEmployeeName?.employeeName &&
      formData?.SelectEmployeePhoneNumber?.mobileNumber &&
      formData?.SelectEmployeeGender?.gender.code &&
      formData?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress &&
      formData?.SelectDateofEmployment?.dateOfAppointment &&
      formData?.SelectEmployeeType?.code &&     
      phonecheck &&
      checkMailNameNum(formData)
    ) {
      setSubmitValve(true);
    } else {
      setSubmitValve(false);
    }
  };

  return (
    <React.Fragment>
      {/* <CardHeader divider={true}>{t("HR_NEW_EMPLOYEE_FORM_HEADER")}</CardHeader> */}
      <FormComposer
        defaultValues={currentStepData}
        //heading={t("")}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
      />
      {showToast && (
        <Toast
          error={showToast.key}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
          isDleteBtn={"true"}
        />
      )}
    </React.Fragment>
  );
};

export default EmployeeDetails;
