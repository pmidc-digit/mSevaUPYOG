import { useQuery, useQueryClient } from "react-query";

const useCLUFeeCalculator = ({ payload, enabled = true, feeType }) => {
  const client = useQueryClient();

  const siteDetails = payload?.CalculationCriteria?.[0]?.CLU?.cluDetails?.additionalDetails?.siteDetails;

  const queryKey = [
    "CLU_FEE_CALCULATION",
    feeType,
    payload?.CalculationCriteria?.[0]?.applicationNumber,
    JSON.stringify(siteDetails), // ensures deep comparison
  ];

  const params = {
    getCalculationOnly: "true",
  };
  const result = useQuery(queryKey, async () => await Digit.OBPSService.CLUCalculator({ details: payload, filters: params }), {
    enabled: !!payload && enabled,
  });

  return {
    ...result,
    // revalidate: () => client.invalidateQueries(queryKey),
    revalidate: ()=> result.refetch()
  };
};

export default useCLUFeeCalculator;
