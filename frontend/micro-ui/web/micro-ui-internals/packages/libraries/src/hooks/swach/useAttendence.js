import { useMutation, useQueryClient } from "react-query";
import Urls from "../../services/atoms/urls";
import { Request } from "../../services/atoms/Utils/Request";

const useAttendence= () => {


  const queryClient = useQueryClient();

  const mutation = useMutation(
    // mutationFn
    async ({ user, slots, attendance }) => {
        console.log("user", user);
      // build request body
      const template = {
        RequestInfo: { apiId: "Rainmaker", authToken: "", userInfo: {}, msgId: "", plainAccessRequest: {} },
        ImageData: { tenantId: "", useruuid: "", latitude: "", longitude: "", locality: "", imagerurl: "" },
      };
      const requestBody = { ...template };
      requestBody.RequestInfo.authToken = user.authToken;
      requestBody.RequestInfo.userInfo = user.userInfo;

      requestBody.ImageData.tenantId = slots.city;
      requestBody.ImageData.locality = slots.locality;
      requestBody.ImageData.latitude = slots.latitude;
      requestBody.ImageData.longitude = slots.longitude;
      requestBody.ImageData.useruuid = user.userInfo.info.uuid;
      requestBody.ImageData.imagerurl = attendance.image;

      // use the generic Request util
      return Request({
        url: Urls.Swach_attendence,
        method: "POST",
        auth: false,
        userService: false,
        data: requestBody,
        // params: { tenantId: slots.city },
      });
    },
    {
      onSuccess: (data) => {
        // optionally invalidate or refetch relevant queries
        queryClient.invalidateQueries("complaintDetails");
      },
      onError: (error, variables, context) => {
      if (context && context.onError) context.onError(error);
    },
    }
  );

  return mutation;
}
export default useAttendence;