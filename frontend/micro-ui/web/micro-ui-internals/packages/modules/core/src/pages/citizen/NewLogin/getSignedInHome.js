// Match the employee application's persisted login check as well as the session.
export const getSignedInHome = (user, storage) => {
  const read = (key) => {
    const value = storage.getItem(key);
    if (!value || value === "undefined" || value === "null") return null;
    try { return JSON.parse(value); } catch (error) { return value; }
  };
  const employeeToken = read("Employee.token");
  const employeeInfo = read("Employee.user-info");
  if (user?.access_token && user?.info?.type === "EMPLOYEE" && employeeToken && employeeInfo) return "/digit-ui/employee";
  if (user?.access_token && user?.info?.type === "CITIZEN") return "/digit-ui/citizen";
  if (employeeToken && employeeInfo && typeof employeeInfo === "object") return "/digit-ui/employee";
  if (read("Citizen.token") && read("Citizen.user-info")) return "/digit-ui/citizen";
  return null;
};
