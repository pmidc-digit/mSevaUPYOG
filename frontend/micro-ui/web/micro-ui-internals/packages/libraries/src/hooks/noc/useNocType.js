import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useNocType = (tenantId) => {
  return useQuery(
    [tenantId, "NOC_MDMS_NOC_TYPE"], // Unique query key
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
                    name: "NocSubType", 
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
        return data?.NOC?.NocSubType?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.code,
          active: type.active,
        }));
      },
    }
  );
};

export default useNocType;
