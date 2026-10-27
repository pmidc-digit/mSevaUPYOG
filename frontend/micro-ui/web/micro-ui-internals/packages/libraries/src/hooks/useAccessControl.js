import { useQuery } from "react-query";
import AccessControlService from "../services/elements/Access";
const useAccessControl = (tenantId) => {
  const user = Digit.UserService?.getUser?.();
  const getUserRoles = user?.info?.roles || Digit.SessionStorage.get("User")?.info?.roles;

  const roles =
    getUserRoles && getUserRoles.length > 0
      ? getUserRoles.map((role) => role.code)
      : ["CITIZEN"];

  const response = useQuery(
    ["ACCESS_CONTROL", tenantId, roles.sort().join(",")],
    async () => await AccessControlService.getAccessControl(roles),
    { enabled: true }
  );
  return response;
};
export default useAccessControl;
