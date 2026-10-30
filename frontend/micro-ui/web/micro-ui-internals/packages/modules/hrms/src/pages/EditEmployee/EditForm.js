import { FormComposer, Toast, Loader } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { newConfig } from "../../components/config/editConfig";
import { convertEpochToDate } from "../../components/Utils";
import { hasAssignmentOverlap } from "../../utils/employeeUtils";
import _ from "lodash";

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
    formData?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress &&
      formData?.SelectEmployeeGender?.gender?.code &&
      formData?.SelectEmployeeName?.employeeName &&
      formData?.SelectEmployeePhoneNumber?.mobileNumber &&
      formData?.SelectDateofEmployment?.dateOfAppointment &&
      jurisdictions.length > 0 &&
      jurisdictions.every(isJurisdictionComplete) &&
      assignments.length > 0 &&
      assignments.every(isAssignmentComplete) &&
      !hasAssignmentOverlap(assignments) &&
      phonecheck &&
      checkMailNameNum(formData)
  );
};

const EditForm = ({ tenantId, data }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [canSubmit, setSubmitValve] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [mobileNumber, setMobileNumber] = useState(null);
  const [phonecheck, setPhonecheck] = useState(false);
  const { data: mdmsData, isLoading } = Digit.Hooks.useCommonMDMS(Digit.ULBService.getStateId(), "egov-hrms", ["CommonFieldsConfig"], {
    select: (data) => {
      return {
        config: data?.MdmsRes?.["egov-hrms"]?.CommonFieldsConfig,
      };
    },
    retry: false,
  });
  const [, , clearError] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_ERROR_DATA", false);
  const [, setMutationHappened] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_HAPPENED", false);
  const [, , clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_SUCCESS_DATA", false);

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
    if (data?.user?.mobileNumber === mobileNumber) {
      setPhonecheck(true);
      return;
    }
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
    tenantId: tenantId,
    employeeStatus: "EMPLOYED",
    employeeType: data?.employeeType,
    SelectEmployeePhoneNumber: { mobileNumber: data?.user?.mobileNumber },
    SelectEmployeeId: { code: data?.code },
    SelectEmployeeName: { employeeName: data?.user?.name },
    SelectEmployeeEmailId: { emailId: data?.user?.emailId },
    SelectEmployeeCorrespondenceAddress: { correspondenceAddress: data?.user?.correspondenceAddress },
    SelectDateofEmployment: { dateOfAppointment: convertEpochToDate(data?.dateOfAppointment) },
    SelectEmployeeType: { code: data?.employeeType, active: true },
    SelectEmploymentStatus: {
      i18nKey: data?.employeeStatus ? `HR_${data.employeeStatus}_LABEL` : undefined,
      code: data?.employeeStatus || "EMPLOYED",
      value: data?.employeeStatus || "EMPLOYED",
    },
    SelectEmployeeGender: {
      gender: {
        code: data?.user?.gender,
        name: `COMMON_GENDER_${data?.user?.gender}`,
      },
    },
    SelectEmployeeGuardianName: { employeeGuardianName: data?.user?.fatherOrHusbandName },
    SelectEmployeeGuardianRelationship: {
      code: data?.user?.relationship || "Father",
      active: true,
    },
    SelectDateofBirthEmployment: { dob: convertEpochToDate(data?.user?.dob) },
    Jurisdictions: (data?.jurisdictions || []).map((ele, index) => {
      const rolesForBoundary = (data?.user?.roles || []).filter((role) => role.tenantId === ele.boundary);

      return Object.assign({}, ele, {
        key: index + 1,
        hierarchy: {
          code: ele.hierarchy,
          name: ele.hierarchy,
        },
        boundaryType: ele.boundaryType,
        boundary: ele.boundary,
        tenantId: ele.boundary,
        service: null,
        roles: rolesForBoundary.map((role) => ({
          code: role.code,
          name: role.name,
          labelKey: role.labelKey || `ACCESSCONTROL_ROLES_ROLES_${role.code}`,
          description: role.description || "",
        })),
      });
    }),
    Assignments: (data?.assignments || []).map((ele, index) => {
      return Object.assign({}, ele, {
        key: index + 1,
        fromDate: convertEpochToDate(ele.fromDate),
        toDate: convertEpochToDate(ele.toDate),
        isCurrentAssignment: ele.isCurrentAssignment,
        designation: {
          code: ele.designation,
          i18key: "COMMON_MASTERS_DESIGNATION_" + ele.designation,
        },
        department: {
          code: ele.department,
          i18key: "COMMON_MASTERS_DEPARTMENT_" + ele.department,
        },
      });
    }),
  };

  const onFormValueChange = (setValue = true, formData) => {
    if (formData?.SelectEmployeePhoneNumber?.mobileNumber) {
      setMobileNumber(formData?.SelectEmployeePhoneNumber?.mobileNumber);
    } else {
      setMobileNumber(formData?.SelectEmployeePhoneNumber?.mobileNumber);
    }
    // watch() hands back a new object on every render, so keep the previous reference when nothing changed to stop the update loop
    setFormValues((prev) => (_.isEqual(prev, formData) ? prev : formData));
  };

  const onSubmit = (input) => {
    const stateCode = tenantId.split(".")[0];
    const hasValidJurisdiction = input.Jurisdictions.some((juris) => {
      const isActive = juris.isActive !== false;
      const matchesState = juris.tenantId?.startsWith(stateCode + ".");
      return isActive && matchesState;
    });

    if (!hasValidJurisdiction) {
      setShowToast({ key: true, label: "ERR_BASE_TENANT_MANDATORY" });
      return;
    }
    const jurisdictionCounts = input.Jurisdictions.reduce((acc, sum) => {
      if (sum && sum?.tenantId) {
        acc[sum.tenantId] = acc[sum.tenantId] ? acc[sum.tenantId] + 1 : 1;
      }
      return acc;
    }, {});
    if (!Object.values(jurisdictionCounts).every((s) => s === 1)) {
      setShowToast({ key: true, label: "ERR_INVALID_JURISDICTION" });
      return;
    }

    // Copy each role instead of writing tenantId into the form state object
    const roles = input.Jurisdictions.flatMap((ele) => (ele.roles || []).map((item) => ({ ...item, tenantId: ele.boundary })));

    // Copy the user object as well, so the cached employee record is left untouched
    const requestdata = { ...data, user: { ...data.user } };
    requestdata.assignments = input?.Assignments;
    requestdata.dateOfAppointment = Date.parse(input?.SelectDateofEmployment?.dateOfAppointment);
    requestdata.code = input?.SelectEmployeeId?.code ? input?.SelectEmployeeId?.code : undefined;
    requestdata.jurisdictions = input?.Jurisdictions;
    requestdata.user.emailId = input?.SelectEmployeeEmailId?.emailId ? input?.SelectEmployeeEmailId?.emailId : undefined;
    requestdata.user.gender = input?.SelectEmployeeGender?.gender?.code;
    requestdata.user.dob = Date.parse(input?.SelectDateofBirthEmployment?.dob);
    requestdata.user.mobileNumber = input?.SelectEmployeePhoneNumber?.mobileNumber;
    requestdata.user.name = input?.SelectEmployeeName?.employeeName;
    requestdata.user.correspondenceAddress = input?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress;
    requestdata.user.fatherOrHusbandName = input?.SelectEmployeeGuardianName?.employeeGuardianName;
    requestdata.user.relationship = input?.SelectEmployeeGuardianRelationship?.code;
    requestdata.user.roles = roles.filter((role) => role && role.name);
    let Employees = [requestdata];

    /* use customiseUpdateFormData hook to make some chnages to the Employee object */
    Employees = Digit?.Customizations?.HRMS?.customiseUpdateFormData ? Digit.Customizations.HRMS.customiseUpdateFormData(data, Employees) : Employees;

    history.replace("/digit-ui/employee/hrms/response", { Employees, key: "UPDATE", action: "UPDATE" });
  };

  if (isLoading) {
    return <Loader />;
  }

  const config = mdmsData?.config ? mdmsData.config : newConfig;
  const editConfig = config
    .filter((step) => step.head !== "")
    .map((config) => {
      return {
        ...config,
        body: config.body.filter((a) => !a.hideInEmployee),
      };
    });

  return (
    <div className="employeeCard">
      <FormComposer
        heading={t("HR_COMMON_EDIT_EMPLOYEE_HEADER")}
        isDisabled={!canSubmit}
        label={t("HR_COMMON_BUTTON_SUBMIT")}
        config={editConfig}
        className="card"
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        onFormValueChange={onFormValueChange}
      />
      {showToast && (
        <Toast
          error={showToast.key}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
        />
      )}
    </div>
  );
};
export default EditForm;
