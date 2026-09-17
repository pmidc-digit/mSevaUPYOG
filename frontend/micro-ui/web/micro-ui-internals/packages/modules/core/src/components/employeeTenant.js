export const getEmployeeTenantOptions = (roles = []) =>
  [...new Set(roles.filter((role) => role?.code && role?.tenantId && role.tenantId !== "pb.punjab").map((role) => role.tenantId))];

// Keep the original login roles intact so the employee can switch ULBs again.
export const switchEmployeeTenant = (tenantId) => {
  const originalUser = Digit.SessionStorage.get("citizen.userRequestObject") || Digit.UserService.getUser();
  const roles = (originalUser?.info?.roles || []).filter((role) => role?.code && role.tenantId === tenantId);
  if (!tenantId || !roles.length) return false;

  const user = { ...originalUser, info: { ...originalUser.info, roles, tenantId } };
  Digit.SessionStorage.set("Employee.tenantId", tenantId);
  localStorage.setItem("Employee.tenant-id", tenantId);
  // Service cards use this profile cache; avoid retaining roles for another ULB.
  sessionStorage.setItem("userInfoData", JSON.stringify(user.info));
  Digit.UserService.setUser(user);
  return true;
};
