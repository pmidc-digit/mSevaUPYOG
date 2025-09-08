
import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const usePTRGenderMDMS = (tenantId) => {
  const effectiveTenantId = tenantId || "pb.testing";

  return useQuery(
    [effectiveTenantId, "PTR_MDMS_GENDER_TYPE"],
    () =>
      MdmsService.getDataByCriteria(
        effectiveTenantId,
        {
          details: {
            tenantId: effectiveTenantId,
            moduleDetails: [
              {
                moduleName: "PetService",
                masterDetails: [{ name: "GenderType" }],
              },
            ],
          },
        },
        "PetService"
      ),
    {
      select: (data) =>
        data?.PetService?.GenderType
          ?.filter((type) => type.active)
          .map((type) => ({
            name: type.name,
            code: type.code,
            i18nKey: type.i18nKey || type.code,
            active: type.active,
          })),
    }
  );
};

export default usePTRGenderMDMS;
