import { useQuery } from "react-query"
import { MdmsService } from "../../services/elements/MDMS"
// import { MdmsService } from "../../services/elements/MDMS"

const useLayoutBuildingType = (tenantId) => {
  return useQuery(
    [tenantId, "LAYOUT_MDMS_BUILDING_TYPE"],
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
                    name: "BuildingType",
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
        return data?.Layout?.BuildingType?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.code,
          active: type.active,
        }))
      },
    },
  )
}

export default useLayoutBuildingType
