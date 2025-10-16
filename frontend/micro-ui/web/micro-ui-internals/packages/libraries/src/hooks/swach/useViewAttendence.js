import { useQuery } from "react-query";
import Urls from "../../services/atoms/urls";
import { Request } from "../../services/atoms/Utils/Request";

const useViewAttendence = ({ tenantId, userIds, fromDate, ...filters }, config = {}) => {
  return useQuery(
    ["attendance", tenantId, userIds, fromDate, filters],
    async () => {
      const params = {
        tenantId,
        userIds: Array.isArray(userIds) ? userIds.join(",") : userIds,
        fromDate
      };
      return await Request({
        url: Urls.Swach_ViewAttendence,
        method: "POST",
        auth: false,
        userService: false,
        params
      });
    },
    {
      refetchOnWindowFocus: false,
      ...config
    }
  );
};

export default useViewAttendence;