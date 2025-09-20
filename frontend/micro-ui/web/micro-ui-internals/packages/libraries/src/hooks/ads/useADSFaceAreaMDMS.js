import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useADSFaceAreaMDMS = (tenantId) => {
  return useQuery(
    [tenantId, "ADS_MDMS_FACE_AREA_TYPE"], // Unique query key
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
                    name: "FaceArea", // Master name for Building Category
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
        return data?.Advertisement?.FaceArea?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.code,
          active: type.active,
        }));
      },
    }
  );
};

export default useADSFaceAreaMDMS;