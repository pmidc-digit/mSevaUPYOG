import { useQuery, useQueryClient } from "react-query";

const useNOCFeeCalculator = ({ payload, enabled = true }) => {
  const client = useQueryClient();
  const queryKey = [
    "NOC_FEE_CALCULATION",
    payload?.CalculationCriteria?.[0]?.applicationNumber,
    payload?.CalculationCriteria?.[0]?.Noc?.nocDetails?.additionalDetails?.siteDetails?.specificationPlotArea,
  ];

  const params = {
    getCalculationOnly: "true",
  };
  const result = useQuery(queryKey, async () => await Digit.NOCService.NOCCalculator({ details: payload, filters: params }), {
    enabled: !!payload && enabled,
  });

  return {
    ...result,
    revalidate: () => client.invalidateQueries(queryKey),
  };
};

export default useNOCFeeCalculator;
