import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useADSScheduleTypeMDMS = (tenantId) => {
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
        // Filter and map active building category
        return data?.Advertisement?.ScheduleType;
      },
    }
  );
};

export default useADSScheduleTypeMDMS;
