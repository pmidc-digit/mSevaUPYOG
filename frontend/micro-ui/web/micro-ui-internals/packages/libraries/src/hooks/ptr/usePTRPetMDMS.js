import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const usePTRPetMDMS = (tenantId) => {
  return useQuery(
    [tenantId, "PTR_MDMS_PET_DATA"],
    () =>
      MdmsService.getDataByCriteria(
        tenantId,
        {
          details: {
            tenantId,
            moduleDetails: [
              {
                moduleName: "PetService",
                masterDetails: [{ name: "PetType" }, { name: "BreedType" }, { name: "GenderType" }],
              },
            ],
          },
        },
        "PetService"
      ),
    {
      select: (data) => {
        const petTypes =
          data?.PetService?.PetType?.filter((type) => type.active).map((type) => ({
            name: type.name,
            code: type.code,
            i18nKey: type.code,
            active: type.active,
          })) || [];

        const breedTypes =
          data?.PetService?.BreedType?.filter((breed) => breed.active).map((breed) => ({
            name: breed.name,
            code: breed.name,
            i18nKey: breed.code,
            petType: breed.petType,
            active: breed.active,
          })) || [];

        const genderTypes =
          data?.PetService?.GenderType?.filter((gender) => gender.active).map((gender) => ({
            name: gender.name,
            code: gender.code,
            i18nKey: gender.i18nKey || gender.code,
            active: gender.active,
          })) || [];

        return {
          petTypes,
          breedTypes,
          genderTypes,
        };
      },
    }
  );
};

export default usePTRPetMDMS;
