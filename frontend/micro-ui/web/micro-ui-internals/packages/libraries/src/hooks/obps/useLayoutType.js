import { useQuery } from "react-query"
import { MdmsService } from "../../services/elements/MDMS"

const useLayoutType = (tenantId) => {
  return useQuery(
    [tenantId, "LAYOUT_MDMS_LAYOUT_TYPE"],
    () =>
      MdmsService.getDataByCriteria(
        tenantId,
        {
          details: {
            tenantId: tenantId,
            moduleDetails: [
              {
                moduleName: "Layout",
                masterDetails: [
                  {
                    name: "LayoutType",
                  },
                ],
              },
            ],
          },
        },
        "Layout",
      ),
    {
      select: (data) => {
        return data?.Layout?.LayoutType?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.code,
          active: type.active,
        }))
      },
    },
  )
}

export default useLayoutType
