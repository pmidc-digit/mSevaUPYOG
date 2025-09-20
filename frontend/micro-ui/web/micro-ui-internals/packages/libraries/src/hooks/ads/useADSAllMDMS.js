import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useADSAllMDMS = (tenantId) => {
  return useQuery(
    [tenantId, "ADS_MDMS_ADVERTISEMENTS"], // unique key
    () =>
      MdmsService.getDataByCriteria(
        tenantId,
        {
          details: {
            tenantId,
            moduleDetails: [
              {
                moduleName: "Advertisement",
                masterDetails: [
                  {
                    name: "Advertisements", // master that contains the list
                  },
                ],
              },
            ],
          },
        },
        "Advertisement"
      ),
    {
      enabled: !!tenantId, // don't run without tenantId
      // optionally tweak caching
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      select: (data) => {
        // safe-path into response
        const ads = data?.Advertisement?.Advertisements || [];

        // filter available (keeps ones where available === true or available is undefined)
        const availableAds = ads.filter((a) => a.available !== false);

        // map to a clean shape for UI consumption
        return availableAds.map((ad) => ({
          id: ad.id,
          poleNo: ad.poleNo,
          name: ad.name,
          adType: ad.adType,
          width: ad.width,
          height: ad.height,
          imageSrc: ad.imageSrc,
          light: ad.light,
          amount: ad.amount,
          available: ad.available,
          locationCode: ad.locationCode,
        }));
      },
    }
  );
};

export default useADSAllMDMS;
