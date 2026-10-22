import { useEffect, useMemo, useState } from "react";

const normalizeZone = (zone) => {
  const value =
    typeof zone === "string"
      ? zone
      : zone?.code?.code || zone?.code || zone?.name || zone?.value;

  return value ? String(value).trim().toLowerCase() : "";
};

const getEmployeeZones = (employees = []) =>
  employees
    .flatMap((employee) => {
      const zones = employee?.zones || employee?.zone;
      return Array.isArray(zones) ? zones : [zones];
    })
    .map(normalizeZone)
    .filter(Boolean);

// An employee is restricted only when HRMS has an explicit zone mapping that
// does not contain the application's zone. This avoids blocking action while
// HRMS data is unavailable or the employee has no zone mapping yet.
export const useEmployeeZoneAccess = (employeeTenantId, assignedTenantId, employeeUuid, applicationZone) => {
  const [employeeZones, setEmployeeZones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!employeeTenantId || !assignedTenantId || !employeeUuid) {
      setEmployeeZones([]);
      return undefined;
    }

    let isActive = true;
    setIsLoading(true);

    Digit.HRMSService.SearchEmpMap(employeeTenantId, {
      userUUID: employeeUuid,
      assignedTenantId,
    })
      .then((response) => {
        if (isActive) setEmployeeZones(getEmployeeZones(response?.Employees));
      })
      .catch(() => {
        if (isActive) setEmployeeZones([]);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [employeeTenantId, assignedTenantId, employeeUuid]);

  const applicationZoneCode = normalizeZone(applicationZone);
  const isZoneMismatch = useMemo(
    () => Boolean(applicationZoneCode && employeeZones.length && !employeeZones.includes(applicationZoneCode)),
    [applicationZoneCode, employeeZones]
  );

  return { isZoneMismatch, isLoading };
};
