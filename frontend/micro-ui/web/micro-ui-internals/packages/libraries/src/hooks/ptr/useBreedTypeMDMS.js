
import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useBreedTypeMDMS = (tenantId) => {
  return useQuery(
    [tenantId, "PTR_MDMS_BREED_TYPE"],
    () =>
      MdmsService.getDataByCriteria(
        "pb.testing",
        {
          details: {
            tenantId: "pb.testing",
            moduleDetails: [
              {
                moduleName: "PetService",
                masterDetails: [
                  {
                    name: "BreedType",
                  },
                ],
              },
            ],
          },
        },
        "PetService"
      ),
    {
      select: (data) => {
        return data?.PetService?.BreedType?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.name,
          i18nKey: type.code,
          active: type.active,
          type: type.petType
        }));
      },
    }
  );
};

export default useBreedTypeMDMS;
