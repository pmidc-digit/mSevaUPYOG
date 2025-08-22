import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useBuildingCategory = (tenantId) => {
  return useQuery(
    [tenantId, "NOC_MDMS_BUILDING_CATEGORY"], // Unique query key
    () =>
      MdmsService.getDataByCriteria(
        tenantId,
        {
          details: {
            tenantId: tenantId,
            moduleDetails: [
              {
                moduleName: "NOC", // Module name for Building Category
                masterDetails: [
                  {
                    name: "BuildingCategory", // Master name for Building Category
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
        // Filter and map active building category
        return data?.NOC?.BuildingCategory?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.code,
          active: type.active,
        }));
      },
    }
  );
};

export default useBuildingCategory;
