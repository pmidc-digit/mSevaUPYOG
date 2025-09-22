import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useADSCalculationTypeMDMS = (tenantId) =>
  useQuery(
    [tenantId, "ADS_MDMS_CALCULATION_TYPE"],
    () =>
      MdmsService.getDataByCriteria(
        tenantId,
        {
          type: "CalculationType", // <-- important for getDataByCriteria cache/key/transform
          details: {
            tenantId,
            moduleDetails: [
              {
                moduleName: "Advertisement",
                masterDetails: [{ name: "CalculationType" }],
              },
            ],
          },
        },
        "Advertisement"
      ),
    {
      select: (data) => {
        const calc = data?.Advertisement?.CalculationType;
        if (!calc) return {};

        // If it's the location-shaped array (your JSON), normalize to a map
        if (Array.isArray(calc) && calc.length && calc[0].location) {
          const map = {};
          calc.forEach((loc) => {
            const location = loc.location || loc.name || "Unknown";
            map[location] = {};
            Object.keys(loc).forEach((k) => {
              if (k.startsWith("CalculationType_")) {
                const code = k.replace(/^CalculationType_/, "");
                map[location][code] = Array.isArray(loc[k]) ? loc[k] : [];
              }
            });
          });
          return map;
        }

        // Otherwise return whatever the transform already produced (classic mdms array/object)
        return calc;
      },
      // optional: staleTime, etc.
    }
  );

export default useADSCalculationTypeMDMS;
