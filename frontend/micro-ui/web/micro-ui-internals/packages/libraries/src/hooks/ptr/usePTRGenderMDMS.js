// import { useQuery } from "react-query";
// import { MdmsService } from "../../services/elements/MDMS";

// const usePTRGenderMDMS = (tenantId, moduleCode, type, config = {}) => {
//   const usePTRGenders = () => {
//     return useQuery("PTR_GENDER_DETAILS", () => MdmsService.PTRGenderType(tenantId, moduleCode ,type), config);
//   };
  

//   switch (type) {
//     case "GenderType":
//       return usePTRGenders();
//     default:
//       return null;
//   }
// };



// export default usePTRGenderMDMS;


import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useGenderTypeMDMS = (tenantId) => {
  return useQuery(
    [tenantId, "PTR_MDMS_GENDER_TYPE"],
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
                    name: "GenderType",
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
        console.log('dataGender', data)
        return data?.PetService?.GenderType?.filter((type) => type.active).map((type) => ({
          name: type.name,
          code: type.code,
          i18nKey: type.code,
          active: type.active,
        }));
      },
    }
  );
};

export default useGenderTypeMDMS;
