import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const useSwachEmployeeFilter = (tenantId, roles, complaintDetails, isActive) => {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const { t } = useTranslation();
  const { data: EmployeeStatusData } = Digit.Hooks.useCustomMDMS(tenantId, "common-masters", [{ name: "Department" }]);

  useEffect(() => {
    if (EmployeeStatusData) {
      (async () => {
        // const _roles = roles.join(",");
        const searchResponse = await Digit.SwachService.employeeSearch(tenantId, roles, isActive);
        console.log("searchResponse", searchResponse);
        const serviceDefs = await Digit.MDMSService.getSwachBharatCategory(tenantId, "Swach");
        console.log("serviceDefs", serviceDefs);
        const serviceCode = complaintDetails?.service?.serviceCode;
        const service = serviceDefs?.find((def) => def?.serviceCode === serviceCode);
        const department = service?.department;
        const employees = searchResponse.Employees.filter((employee) =>
          employee.assignments.map((assignment) => assignment.department).includes(department)
        );
        console.log("EmployeeStatusData", EmployeeStatusData);
        const departments = EmployeeStatusData?.["common-masters"].Department;
        //emplpoyess data sholld only conatin name uuid dept
        setEmployeeDetails(
          // department: t(`COMMON_MASTERS_DEPARTMENT_${department}`),
          searchResponse?.Employees?.map((employee) => {
            const deptCode = employee?.assignments?.[0]?.department;
            const matchedDept = departments?.find((d) => d?.code === deptCode);
            console.log("matchedDept===", matchedDept);
            return { uuid: employee.user.uuid, name: `${employee.user.name} - ${matchedDept?.name}` };
          })
        );
      })();
    }
  }, [tenantId, roles, t, complaintDetails, EmployeeStatusData]);

  return employeeDetails;
};

export default useSwachEmployeeFilter;
