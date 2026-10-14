const selectionKey = "Employee.confirmedTenant";

export const hasConfirmedEmployeeTenant = (user) => {
  const selection = Digit.SessionStorage.get(selectionKey);
  const userId = user?.info?.uuid || user?.info?.id;
  return !!userId && selection?.userId === userId && selection?.tenantId === user?.info?.tenantId &&
    getEmployeeTenantOptions(user?.info?.roles).includes(selection.tenantId);
};

export const getEmployeeTenantOptions = (roles = []) =>
  [...new Set(roles.filter((role) => role?.code && role?.tenantId).map((role) => role.tenantId))];

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
  Digit.SessionStorage.set(selectionKey, { userId: user.info.uuid || user.info.id, tenantId });
  return true;
};
