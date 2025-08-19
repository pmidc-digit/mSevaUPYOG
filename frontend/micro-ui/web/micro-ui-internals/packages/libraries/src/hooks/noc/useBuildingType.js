import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useBuildingType = (tenantId) => {
  return useQuery(
    [tenantId, "NOC_MDMS_BUILDING_TYPE"], // Unique query key
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
                    name: "BuildingType", 
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
        return data?.NOC?.BuildingType?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.code,
          active: type.active,
        }));
      },
    }
  );
};

export default useBuildingType;
