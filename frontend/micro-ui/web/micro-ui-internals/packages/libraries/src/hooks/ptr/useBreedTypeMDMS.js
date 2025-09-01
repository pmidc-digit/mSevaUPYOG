// import { useQuery } from "react-query";
// import { MdmsService } from "../../services/elements/MDMS";

// const useBreedTypeMDMS = (tenantId, moduleCode, type,  config = {}) => {
//   const useBreed = () => {
//     return useQuery("PetService_FORM_BREED_TYPE", () => MdmsService.PetServiceBreedType(tenantId, moduleCode ,type), config);
//   };

//   switch (type) {
//     case "BreedType":
//       return useBreed();
//     default:
//       return null;
//   }
// };

// export default useBreedTypeMDMS;

import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useBreedTypeMDMS = (tenantId) => {
  console.log('tenantIdxx', tenantId)
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
        console.log("dataOptions", data);
        return data?.PetService?.BreedType?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.name,
          i18nKey: type.code,
          active: type.active,
        }));
      },
    }
  );
};

export default useBreedTypeMDMS;
