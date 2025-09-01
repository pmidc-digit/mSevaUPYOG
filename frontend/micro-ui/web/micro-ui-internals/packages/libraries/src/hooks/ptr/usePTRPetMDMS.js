// import { useQuery } from "react-query";
// import { MdmsService } from "../../services/elements/MDMS";

// const usePTRPetMDMS = (tenantId, moduleCode, type, config = {}) => {
//   const usePTRPet = () => {
//     return useQuery("PTR_FORM_PET_TYPE", () => MdmsService.PTRPetType(tenantId, moduleCode ,type), config);
//   };
  

//   switch (type) {
//     case "PetType":
//       return usePTRPet();
//     default:
//       return null;
//   }
// };



// export default usePTRPetMDMS;

import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const usePTRPetMDMS = (tenantId) => {
  return useQuery(
    [tenantId, "PTR_MDMS_PET_TYPE"],
    () =>
      MdmsService.getDataByCriteria(
        tenantId,
        {
          details: {
            tenantId: tenantId,
            moduleDetails: [
              {
                moduleName: "PetService",
                masterDetails: [
                  {
                    name: "PetType",
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
        console.log('dataPytesss', data)
        return data?.PetService?.PetType?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.name,
          i18nKey: type.code,
          active: type.active,
        }));
      },
    }
  );
};

export default usePTRPetMDMS;
