import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useADSAdTypeMDMS = (tenantId) => {
  return useQuery(
    [tenantId, "ADS_MDMS_AD_TYPE"], // Unique query key
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
                    name: "AdType", // Master name for Building Category
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
        console.log('data :>> ', data);
        // Filter and map active building category
        return data?.Advertisement?.AdType?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.code,
          active: type.active,
        }));
      },
    }
  );
};

export default useADSAdTypeMDMS;