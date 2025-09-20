import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useADSLocationMDMS = (tenantId) => {
  return useQuery(
    [tenantId, "ADS_MDMS_LOCATION_TYPE"], // Unique query key
    () =>
      MdmsService.getDataByCriteria(
        tenantId,
        {
          details: {
            tenantId: tenantId,
            moduleDetails: [
              {
                moduleName: "Advertisement", // Module name for Building Category
                masterDetails: [
                  {
                    name: "Location", // Master name for Building Category
                  },
                ],
              },
            ],
          },
        },
        "Advertisement"
      ),
    {
      select: (data) => {
        // Filter and map active building category
        return data?.Advertisement?.Location?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.code,
          active: type.active,
          geo_tag: type.geo_tag || null,
        }));
      },
    }
  );
};

export default useADSLocationMDMS;
