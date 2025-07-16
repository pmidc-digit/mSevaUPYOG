import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useQualificationTypes = (tenantId) => {
  return useQuery(
    [tenantId, "BPA_MDMS_QUALIFICATION_TYPE"], // Unique query key
    () =>
      MdmsService.getDataByCriteria(
        tenantId,
        {
          details: {
            tenantId: tenantId,
            moduleDetails: [
              {
                moduleName: "BPA", // Module name for QualificationType
                masterDetails: [
                  {
                    name: "QualificationType", // Master name for QualificationType
                  },
                ],
              },
            ],
          },
        },
        "BPA"
      ),
    {
      select: (data) => {
        // Filter and map active qualifications
        return data?.BPA?.QualificationType?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.code,
          active: type.active,
        }));
      },
    }
  );
};

export default useQualificationTypes;
