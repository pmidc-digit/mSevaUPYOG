import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useRoadType = (tenantId) => {
  return useQuery(
    [tenantId, "NOC_MDMS_ROAD_TYPE"], // Unique query key
    () =>
      MdmsService.getDataByCriteria(
        tenantId,
        {
          details: {
            tenantId: tenantId,
            moduleDetails: [
              {
                moduleName: "NOC",
                masterDetails: [
                  {
                    name: "RoadType", 
                  },
                ],
              },
            ],
          },
        },
        "NOC"
      ),
    {
      select: (data) => {
        return data?.NOC?.RoadType?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.code,
          active: type.active,
        }));
      },
    }
  );
};

export default useRoadType;
