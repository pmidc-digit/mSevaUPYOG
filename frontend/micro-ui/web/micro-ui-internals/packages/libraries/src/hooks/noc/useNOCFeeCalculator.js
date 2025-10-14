import { useQuery, useQueryClient } from "react-query";

const useNOCFeeCalculator = ({ payload, enabled = true }) => {
  const client = useQueryClient();

  const siteDetails = payload?.CalculationCriteria?.[0]?.NOC?.nocDetails?.additionalDetails?.siteDetails;

  const queryKey = [
    "NOC_FEE_CALCULATION",
    payload?.CalculationCriteria?.[0]?.applicationNumber,
    JSON.stringify(siteDetails), // ensures deep comparison
  ];

  const params = {
    getCalculationOnly: "true",
  };
  const result = useQuery(queryKey, async () => await Digit.NOCService.NOCCalculator({ details: payload, filters: params }), {
    enabled: !!payload && enabled,
  });

  return {
    ...result,
    // revalidate: () => client.invalidateQueries(queryKey),
    revalidate: ()=> result.refetch()
  };
};

export default useNOCFeeCalculator;
