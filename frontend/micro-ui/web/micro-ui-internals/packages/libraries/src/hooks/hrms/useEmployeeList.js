import { useState, useEffect } from "react";

const useEmployeeList = (selectedULB, obpsRoleCodes) => {
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedULB || obpsRoleCodes.length === 0) {
      setEmployeeList([]);
      return;
    }

    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await Digit.HRMSService.search(selectedULB.code, {
          tenantId: selectedULB.code,
          roles: obpsRoleCodes.join(','),
          limit: 100,
          offset: 0,
        });

        if (response?.Employees) {
          const employeeOptions = response.Employees.map((emp) => ({
            code: emp.code,
            name: `${emp.user?.name || emp.code} (${emp.code}) (${emp.assignments?.[0]?.designation || "N/A"})`,
            uuid: emp.uuid,
            department: emp.assignments?.[0]?.department || "N/A",
            employeeObj: emp,
          }));
          setEmployeeList(employeeOptions);
        }
      } catch (error) {
        setEmployeeList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [selectedULB, obpsRoleCodes]);

  return { employeeList, loading };
};

export default useEmployeeList;
