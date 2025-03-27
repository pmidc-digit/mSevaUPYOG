import { MdmsService } from "../elements/MDMS";
import { Storage } from "../atoms/Utils/Storage";

export const GetSwachBharatCategories = {
  get: async (tenantId) => {
    const criteria = {
      type: "swachBharatCategory",
      details: {
        tenantId: tenantId,
        moduleDetails: [
          {
            moduleName: "SwachReform",
            masterDetails: [
              {
                name: "SwachBharatCategory",
              },
            ],
          },
        ],
      },
    };

    const serviceDefs = await MdmsService.getDataByCriteria(tenantId, criteria, "Swach");
    Storage.set("swachBharatCategories", serviceDefs);
    return serviceDefs;
  },
  getMenu: async (stateCode, t) => {
    var Menu = [];
    const response = await GetServiceDefinitions.get(stateCode);
    await Promise.all(
      response.map((def) => {
        if (!Menu.find((e) => e.key === def.menuPath)) {
          def.menuPath === ""
            ? Menu.push({
                name: t("SWACHBHARATCATEGORY.OTHERS"),
                key: def.menuPath,
              })
            : Menu.push({
                name: t("SWACHBHARATCATEGORY." + def.menuPath.toUpperCase()),
                key: def.menuPath,
              });
        }
      })
    );
    return Menu;
  },

  getSubMenu: async (tenantId, selectedType, t) => {
    const fetchServiceDefs = await GetServiceDefinitions.get(tenantId);
    return fetchServiceDefs
      .filter((def) => def.menuPath === selectedType.key)
      .map((id) => ({
        key: id.serviceCode,
        name: t("SWACHBHARATCATEGORY." + id.serviceCode.toUpperCase()),
      }));
  },
};
