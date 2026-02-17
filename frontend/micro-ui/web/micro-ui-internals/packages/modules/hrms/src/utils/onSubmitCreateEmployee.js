import { TENANT_IDS } from "../../../../constants/constants";

export const onSubmit = (data, tenantId, setShowToast, history) => {
  console.log(`In onSubmit: \n tenantId: ${tenantId}`, "\n data:", data);
  //
  console.log("onSubmit create employee: ", data);
  const hasNoAccess = (tenantId !== TENANT_IDS.PUNJAB) && data.Jurisdictions.filter((juris) => juris.tenantId == tenantId).length == 0;
  if (hasNoAccess) {
    setShowToast({ key: true, label: "ERR_BASE_TENANT_MANDATORY" });
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
    ).every((s) => s == 1)
  ) {
    setShowToast({ key: true, label: "ERR_INVALID_JURISDICTION" });
    return;
  }
  let roles = data?.Jurisdictions?.map((ele) => {
    return ele.roles?.map((item) => {
      item["tenantId"] = ele.boundary;
      return item;
    });
  });

  const mappedroles = [].concat.apply([], roles);
  let Employees = [
    {
      tenantId: tenantId,
      employeeStatus: data?.SelectEmploymentStatus?.code,
      assignments: data?.Assignments,
      code: data?.SelectEmployeeId?.code ? data?.SelectEmployeeId?.code : undefined,
      dateOfAppointment: new Date(data?.SelectDateofEmployment?.dateOfAppointment).getTime(),
      employeeType: data?.SelectEmployeeType?.code,
      jurisdictions: data?.Jurisdictions,
      user: {
        mobileNumber: data?.SelectEmployeePhoneNumber?.mobileNumber,
        name: data?.SelectEmployeeName?.employeeName,
        correspondenceAddress: data?.SelectEmployeeCorrespondenceAddress?.correspondenceAddress,
        fatherOrHusbandName:data?.SelectEmployeeGuardianName?.employeeGuardianName,
        emailId: data?.SelectEmployeeEmailId?.emailId ? data?.SelectEmployeeEmailId?.emailId : undefined,
        gender: data?.SelectEmployeeGender?.gender.code,
        dob: new Date(data?.SelectDateofBirthEmployment?.dob).getTime(),
        roles: mappedroles,
        tenantId: tenantId,
      },
      serviceHistory: [],
      education: [],
      tests: [],
      categories: [data?.SelectEmployeeGuardianRelationship?.code || "Unknown"]  ,
    },
  ];
  /* use customiseCreateFormData hook to make some chnages to the Employee object */
  Employees = Digit?.Customizations?.HRMS?.customiseCreateFormData ? Digit.Customizations.HRMS.customiseCreateFormData(data, Employees) : Employees;

  if (data?.SelectEmployeeId?.code && data?.SelectEmployeeId?.code?.trim().length > 0) {
    Digit.HRMSService.search(tenantId, null, { codes: data?.SelectEmployeeId?.code }).then((result, err) => {
      if (result.Employees.length > 0) {
        setShowToast({ key: true, label: "ERR_HRMS_USER_EXIST_ID" });
        return;
      } else {
        navigateToAcknowledgement(Employees, history);
      }
    });
  } else {
    navigateToAcknowledgement(Employees, history);
  }
};
const navigateToAcknowledgement = (Employees, history) => {
  history.replace("/digit-ui/employee/hrms/response", { Employees, key: "CREATE", action: "CREATE" });
};
