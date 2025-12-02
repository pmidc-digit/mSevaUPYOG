import { useQuery } from "react-query"
import { MdmsService } from "../../services/elements/MDMS"

const useLayoutRoadType = (tenantId) => {
  return useQuery(
    [tenantId, "LAYOUT_MDMS_ROAD_TYPE"],
    () =>
      MdmsService.getDataByCriteria(
        tenantId,
        {
          details: {
            tenantId: tenantId,
            moduleDetails: [
              {
                moduleName: "LAYOUT",
                masterDetails: [
                  {
                    name: "RoadType",
                  },
                ],
              },
            ],
          },
        },
        "LAYOUT",
      ),
    {
      select: (data) => {
       
        return data?.LAYOUT?.RoadType?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.code,
          active: type.active,
        }))
      },
    },
  )
}

export default useLayoutRoadType
