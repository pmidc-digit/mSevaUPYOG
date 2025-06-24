import { Request } from "../atoms/Utils/Request"
import Urls from "../atoms/urls";

export const NDCService = {
    NDCcreate: ({ tenantId, filters, details }) => {
        Request({
            url: Urls.ndc.create,
            data: details,
            useCache: false,
            method: "POST",
            params: { tenantId, ...filters },
            auth: true,
            userService: true,
        })
    },
}