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
    onGoNext();
  }

  const onFormValueChange = (setValue = true, data) => {
    
    
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

  const [mobileNumber, setMobileNumber] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [phonecheck, setPhonecheck] = useState(false);
  const [idUnique, setIdUnique] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const isEdit = window.location.pathname.includes("/edit/");
  // Mobile number uniqueness check (with debounce)
  useEffect(() => {
    if (!mobileNumber) {
      setPhonecheck(false);
      return;
    }
    if (mobileNumber.length === 10 && mobileNumber.match(Digit.Utils.getPattern("MobileNo"))) {
      setShowToast(null);
      const tenantToSearch = tenantId === "pb.punjab"
        ? (Digit.SessionStorage.get("punjab-tenantId") || tenantId)
        : tenantId;
      const tid = setTimeout(() => {
        Digit.HRMSService.search(tenantToSearch, null, { phone: mobileNumber })
          .then((result) => {
            if (result?.Employees?.length > 0) {
              setShowToast({ key: true, label: "ERR_HRMS_USER_EXIST_MOB" });
              setPhonecheck(false);
            } else {
              setPhonecheck(true);
            }
          })
          .catch((e) => {
            console.error("HRMS phone search error:", e);
            setPhonecheck(false);
          });
      }, 400);
      return () => clearTimeout(tid);
    } else {
      setPhonecheck(false);
    }
  }, [mobileNumber]);

  // Employee ID uniqueness check (with debounce) — skip in edit mode
  useEffect(() => {
    if (isEdit) {
      setIdUnique(true);
      return;
    }
    if (!employeeId || employeeId.trim().length === 0) {
      setIdUnique(false);
      return;
    }
    setShowToast(null);
    const tenantToSearch = tenantId === "pb.punjab"
      ? (Digit.SessionStorage.get("punjab-tenantId") || tenantId)
      : tenantId;
    const tid = setTimeout(() => {
      Digit.HRMSService.search(tenantToSearch, null, { codes: employeeId.trim() })
        .then((result) => {
          if (result?.Employees?.length > 0) {
            setShowToast({ key: true, label: "ERR_HRMS_USER_EXIST_ID" });
            setIdUnique(false);
          } else {
            setIdUnique(true);
          }
        })
        .catch((e) => {
          console.error("HRMS ID search error:", e);
          setIdUnique(false);
        });
    }, 400);
    return () => clearTimeout(tid);
  }, [employeeId]);
  const checkMailNameNum = (formData) => {
    const email = formData?.SelectEmployeeEmailId?.emailId || "";
    const name = formData?.SelectEmployeeName?.employeeName || "";
    const address = formData?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress || "";
    const validEmail = email.length == 0 ? true : email.match(Digit.Utils.getPattern("Email"));
    return validEmail && name.match(Digit.Utils.getPattern("Name")) && address.match(Digit.Utils.getPattern("Address"));
  };
  // Validate on mount and when currentStepData, phonecheck, or idUnique changes
  useEffect(() => {
    checkConditions(currentStepData);
  }, [currentStepData, phonecheck, idUnique]);

  const checkConditions = (formData) => {
    
    // Update mobile number if changed
    const newMobile = formData?.SelectEmployeePhoneNumber?.mobileNumber || null;
    if (newMobile !== mobileNumber) {
      setMobileNumber(newMobile);
    }

    // Update employee ID if changed
    const newEmpId = formData?.SelectEmployeeId?.code || null;
    if (newEmpId !== employeeId) {
      setEmployeeId(newEmpId);
    }
    if (
      formData?.SelectEmployeeName?.employeeName &&
      formData?.SelectEmployeePhoneNumber?.mobileNumber &&
      formData?.SelectEmployeeGender?.gender.code &&
      formData?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress &&
      formData?.SelectDateofEmployment?.dateOfAppointment &&
      formData?.SelectEmployeeType?.code &&     
      phonecheck &&
      idUnique &&
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
