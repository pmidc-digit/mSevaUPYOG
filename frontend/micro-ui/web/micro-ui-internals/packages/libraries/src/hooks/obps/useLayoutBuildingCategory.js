import { useQuery } from "react-query"
import { MdmsService } from "../../services/elements/MDMS"

const useLayoutBuildingCategory = (tenantId) => {
  return useQuery(
    [tenantId, "LAYOUT_MDMS_BUILDING_CATEGORY"],
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
                    name: "BuildingCategory",
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
        return data?.Layout?.BuildingCategory?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.code,
          active: type.active,
        }))
      },
    },
  )
}

export default useLayoutBuildingCategory
