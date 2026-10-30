import { TENANT_IDS } from "../../../../constants/constants";

// Returns epoch ms, or undefined for empty or invalid input so that NaN never reaches the API
const toEpoch = (value) => {
  if (!value) return undefined;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
};

export const onSubmit = (data, tenantId, setShowToast, history) => {
  // Safety check for Jurisdictions
  if (!data.Jurisdictions || !Array.isArray(data.Jurisdictions) || data.Jurisdictions.length === 0) {
    setShowToast({ key: true, label: "ERR_NO_JURISDICTIONS" });
    return;
  }

  if (
    !Object.values(
      data.Jurisdictions.reduce((acc, sum) => {
        if (sum && sum?.tenantId) {
          acc[sum.tenantId] = acc[sum.tenantId] ? acc[sum.tenantId] + 1 : 1;
        }
        return acc;
      }, {})
    ).every((s) => s === 1)
  ) {
    setShowToast({ key: true, label: "ERR_INVALID_JURISDICTION" });
    return;
  }

  // Copy each role instead of writing tenantId into the form state object
  const mappedroles = data.Jurisdictions.flatMap((ele) => (ele.roles || []).map((item) => ({ ...item, tenantId: ele.tenantId })));

  // Punjab state user can create employees for any ULB, a ULB user only for their own tenant
  const employeeTenantId = tenantId === TENANT_IDS.PUNJAB ? data.Jurisdictions[0].tenantId : tenantId;

  let Employees = [
    {
      tenantId: employeeTenantId,
      employeeStatus: data?.SelectEmploymentStatus?.code,
      assignments: data?.Assignments,
      code: data?.SelectEmployeeId?.code ? data?.SelectEmployeeId?.code : undefined,
      dateOfAppointment: toEpoch(data?.SelectDateofEmployment?.dateOfAppointment),
      employeeType: data?.SelectEmployeeType?.code,
      jurisdictions: data?.Jurisdictions,
      user: {
        mobileNumber: data?.SelectEmployeePhoneNumber?.mobileNumber,
        name: data?.SelectEmployeeName?.employeeName,
        correspondenceAddress: data?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress,
        fatherOrHusbandName: data?.SelectEmployeeGuardianName?.employeeGuardianName,
        emailId: data?.SelectEmployeeEmailId?.emailId ? data?.SelectEmployeeEmailId?.emailId : undefined,
        gender: data?.SelectEmployeeGender?.gender?.code,
        dob: toEpoch(data?.SelectDateofBirthEmployment?.dob),
        roles: mappedroles,
        tenantId: employeeTenantId,
      },
      serviceHistory: [],
      education: [],
      tests: [],
      categories: [data?.SelectEmployeeGuardianRelationship?.code || "Unknown"],
    },
  ];
  /* use customiseCreateFormData hook to make some chnages to the Employee object */
  Employees = Digit?.Customizations?.HRMS?.customiseCreateFormData ? Digit.Customizations.HRMS.customiseCreateFormData(data, Employees) : Employees;

  // Safety fallback — primary ID uniqueness check is now in EmployeeDetails step (Next button)
  if (data?.SelectEmployeeId?.code && data?.SelectEmployeeId?.code?.trim().length > 0) {
    Digit.HRMSService.search(employeeTenantId, null, { codes: data?.SelectEmployeeId?.code })
      .then((result) => {
        if (result?.Employees?.length > 0) {
          setShowToast({ key: true, label: "ERR_HRMS_USER_EXIST_ID" });
          return;
        }
        navigateToAcknowledgement(Employees, history);
      })
      .catch(() => {
        // A failed lookup is not a duplicate ID, so show a generic error
        setShowToast({ key: true, label: "HR_EMPLOYEE_CREATION_FAILED" });
      });
  } else {
    navigateToAcknowledgement(Employees, history);
  }
};
const navigateToAcknowledgement = (Employees, history) => {
  history.replace("/digit-ui/employee/hrms/response", { Employees, key: "CREATE", action: "CREATE" });
};
