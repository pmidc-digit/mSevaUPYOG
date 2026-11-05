import React, { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";

export const restoreEmployeeSession = (digit, local, session) => {
  const current = digit.UserService.getUser();
  const info = JSON.parse(local.getItem("Employee.user-info") || "null");
  if (!info) return;
  let token = local.getItem("Employee.token");
  try { token = JSON.parse(token); } catch (error) { /* Tokens are normally stored as plain strings. */ }
  if (!token) return;
  const sameUser = current?.info?.type === "EMPLOYEE" && current?.access_token === token;
  const original = digit.SessionStorage.get("citizen.userRequestObject");
  const originalMatches = original?.access_token === token && original?.info?.type === "EMPLOYEE";
  const fullUser = originalMatches ? original : { access_token: token, token, info };
  const tenantId = sameUser ? current.info.tenantId : local.getItem("Employee.tenant-id") || info.tenantId;
  const restored = sameUser ? current : {
    ...fullUser,
    info: { ...fullUser.info, tenantId, roles: (fullUser.info.roles || []).filter((role) => role.tenantId === tenantId) },
  };
  digit.UserService.setUser(restored);
  digit.UserService.setType("employee");
  digit.SessionStorage.set("Employee.tenantId", tenantId);
  if (!originalMatches) digit.SessionStorage.set("citizen.userRequestObject", fullUser);
  session.setItem("userInfoData", JSON.stringify(restored.info));
};

export default function SignedInRedirect({ to }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (to === "/digit-ui/employee") restoreEmployeeSession(Digit, window.localStorage, window.sessionStorage);
    setReady(true);
  }, [to]);
  return ready ? <Redirect to={to} /> : null;
}
