import { useQuery } from "react-query";
import { getLocalities } from "../services/molecules/getLocalities";
import { LocalityService } from "../services/elements/Localities";

const useLocalities = (tenant, boundaryType = "admin", config, t) => {
  return useQuery(["BOUNDARY_DATA", tenant, boundaryType], () => getLocalities[boundaryType.toLowerCase()](tenant), {
    select: (data) => {
      return LocalityService.get(data).map((key) => {
        const translated = t(key.i18nkey);
        return { ...key, i18nkey: translated === key.i18nkey ? key.name : translated };
      });
    },
    staleTime: Infinity,
    ...config,
  });
};

export default useLocalities;
