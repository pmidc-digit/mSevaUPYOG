import { FormComposer, Toast, Loader, Header } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//
import { newConfig } from "../components/config/config";
import { hasAssignmentOverlap } from "../utils/employeeUtils";
import { onSubmit } from "../utils/onSubmitCreateEmployee";

const isJurisdictionComplete = (juris) => Boolean(juris?.boundary && juris?.boundaryType && juris?.hierarchy && juris?.tenantId && juris?.roles?.length > 0);

const isAssignmentComplete = (assignment) => Boolean(assignment?.department && assignment?.designation && assignment?.fromDate && (assignment?.toDate || assignment?.isCurrentAssignment));

const checkMailNameNum = (formData) => {
  const email = formData?.SelectEmployeeEmailId?.emailId || "";
  const name = formData?.SelectEmployeeName?.employeeName || "";
  const address = formData?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress || "";
  const validEmail = email.length === 0 ? true : email.match(Digit.Utils.getPattern("Email"));
  return Boolean(validEmail && name.match(Digit.Utils.getPattern("Name")) && address.match(Digit.Utils.getPattern("Address")));
};

// Evaluated from the latest form values and the async phone check, so it never lags one change behind
const isFormValid = (formData, phonecheck) => {
  if (!formData) return false;
  const jurisdictions = formData.Jurisdictions || [];
  const assignments = formData.Assignments || [];
  return Boolean(
    formData?.SelectDateofEmployment?.dateOfAppointment &&
      formData?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress &&
      formData?.SelectEmployeeGender?.gender?.code &&
      formData?.SelectEmployeeName?.employeeName &&
      formData?.SelectEmployeeType?.code &&
      formData?.SelectEmployeePhoneNumber?.mobileNumber &&
      jurisdictions.length > 0 &&
      jurisdictions.every(isJurisdictionComplete) &&
      assignments.length > 0 &&
      assignments.every(isAssignmentComplete) &&
      !hasAssignmentOverlap(assignments) &&
      phonecheck &&
      checkMailNameNum(formData)
  );
};

const CreateEmployee = () => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [canSubmit, setSubmitValve] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [mobileNumber, setMobileNumber] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [phonecheck, setPhonecheck] = useState(false);
  const { t } = useTranslation();
  const history = useHistory();

  const { data: mdmsData, isLoading } = Digit.Hooks.useCommonMDMS(Digit.ULBService.getStateId(), "egov-hrms", ["CommonFieldsConfig"], {
    select: (data) => {
      return {
        config: data?.MdmsRes?.["egov-hrms"]?.CommonFieldsConfig,
      };
    },
    retry: false,
  });
  const [, setMutationHappened] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_HAPPENED", false);
  const [, , clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_SUCCESS_DATA", false);
  const [, , clearError] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_ERROR_DATA", false);

  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
    clearError();
  }, []);

  useEffect(() => {
    if (!(mobileNumber && mobileNumber.length === 10 && mobileNumber.match(Digit.Utils.getPattern("MobileNo")))) {
      setPhonecheck(false);
      return;
    }
    setShowToast(null);
    // Ignore responses for a number the user has since changed
    let ignore = false;
    Digit.HRMSService.search(tenantId, null, { phone: mobileNumber })
      .then((result) => {
        if (ignore) return;
        const exists = result?.Employees?.length > 0;
        if (exists) {
          setShowToast({ key: true, label: "ERR_HRMS_USER_EXIST_MOB" });
        }
        setPhonecheck(!exists);
      })
      .catch(() => {
        if (!ignore) setPhonecheck(false);
      });
    return () => {
      ignore = true;
    };
  }, [mobileNumber]);

  // Re-evaluated when the form changes or when the phone check resolves
  useEffect(() => {
    setSubmitValve(isFormValid(formValues, phonecheck));
  }, [formValues, phonecheck]);

  const defaultValues = {
    Jurisdictions: [
      {
        id: undefined,
        key: 1,
        hierarchy: null,
        boundaryType: null,
        boundary: {
          code: tenantId,
        },
        roles: [],
      },
    ],
  };

  const onFormValueChange = (setValue = true, formData) => {
    setMobileNumber(formData?.SelectEmployeePhoneNumber?.mobileNumber);
    setFormValues(formData);
  };

  const handleSubmit = (data) => {
    onSubmit(data, tenantId, setShowToast, history);
  };

  if (isLoading) {
    return <Loader />;
  }

  const config = mdmsData?.config ? mdmsData.config : newConfig;
  return (
    <div>
      <div className="hrms-header-wrapper hrms-header-wrapper--error">
        <Header>{t("HR_COMMON_CREATE_EMPLOYEE_HEADER")}</Header>
      </div>
      <FormComposer
        defaultValues={defaultValues}
        heading={t("")}
        config={config}
        onSubmit={handleSubmit}
        onFormValueChange={onFormValueChange}
        isDisabled={!canSubmit}
        label={t("HR_COMMON_BUTTON_SUBMIT")}
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
    </div>
  );
};
export default CreateEmployee;
