import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useADSScheduleTypeMDMS = (tenantId) => {
    console.log('tenantId', tenantId)
  return useQuery(
    [tenantId, "ADS_MDMS_SCHEDULE_TYPE"], // Unique query key
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
                    name: "ScheduleType", // Master name for Building Category
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
        console.log('data11111', data)
        // Filter and map active building category
        return data?.Advertisement?.ScheduleType?.[0]?.frequency
      },
    }
  );
};

export default useADSScheduleTypeMDMS;
