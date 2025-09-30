import { useQuery } from "react-query";
 

export const useBPACalculation = ({ payload, enabled = true, queryKey }) => {
  return useQuery(
    queryKey || ["BPA_CALCULATION", payload?.CalulationCriteria?.[0]?.applicationNo],
    async () => await Digit.OBPSService.bpaCalculate(payload),
    {
      enabled: !!payload && enabled,
    }
  );
};