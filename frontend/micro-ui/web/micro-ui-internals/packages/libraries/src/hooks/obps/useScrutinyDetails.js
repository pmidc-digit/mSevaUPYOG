import { useQuery } from "react-query";
import { Search } from "../../services/molecules/OBPS/Search";
import { scrutinyDetailsData } from "../../../../modules/obps/src/utils";

const useScrutinyDetails = (tenantId, filters, config, key = "OBPS_SCRUTINYDETAILS") => {
  console.log("HERE HOOK ");
  console.log("useScrutinyDetails Hook Called");
  console.log("TenantId:", tenantId);
  console.log("Filters:", filters);
  console.log("+++++");
  return useQuery(
    [key, filters],
    async () => {
      const scruntinyData = await Search.scrutinyDetails(tenantId, filters, undefined, true);
      console.log(scruntinyData, "+++");
      return Search.scrutinyDetails(tenantId, filters, undefined, true);
    },
    config
  );
};

export default useScrutinyDetails;
