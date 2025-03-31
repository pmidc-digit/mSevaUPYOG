import { useTranslation } from "react-i18next";

const { useState, useEffect } = require("react");

const useSwachBharatCategory = (tenantId, moduleCode) => {
  const [localMenu, setLocalMenu] = useState([]);
  const SessionStorage = Digit.SessionStorage;
  let { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const swachBharat = await Digit.MDMSService.getSwachBharatCategory(tenantId, moduleCode);
      SessionStorage.set("swachBharatCategory", swachBharat);

      const swachBharatWithKeys = swachBharat.map((def) => ({ ...def, i18nKey: t("SWACHBHARATCATEGORY." + def.serviceCode.toUpperCase()) }));
      setLocalMenu(swachBharatWithKeys);
    })();
  }, [t, tenantId, moduleCode]);

  return localMenu;
};

export default useSwachBharatCategory;
