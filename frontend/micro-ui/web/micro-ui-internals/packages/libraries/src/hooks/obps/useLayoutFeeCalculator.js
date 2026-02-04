import React from "react"

import { useQuery, useQueryClient } from "react-query"


const useLayoutFeeCalculator = ({ payload, feeType, enabled = true }, options = {}) => {
  const client = useQueryClient()

  const siteDetails = payload?.CalculationCriteria?.[0]?.Layout?.layoutDetails?.additionalDetails?.siteDetails

  const queryKey = [
    "LAYOUT_FEE_CALCULATION",
    feeType,
    payload?.CalculationCriteria?.[0]?.applicationNumber,
    JSON.stringify(siteDetails), // ensures deep comparison
  ]

  const params = {
    getCalculationOnly: "true",
  }

  const enabledFlag = options?.enabled !== undefined ? options.enabled : enabled

  const result = useQuery(
    queryKey,
    async () => {
      const response = await Digit.OBPSService.LayoutCalculator({ details: payload, filters: params });
      return response;
    },
    {
      enabled: !!payload && enabledFlag,
    },
  )

  return {
    ...result,
    revalidate: () => result.refetch(),
  }
}

export default useLayoutFeeCalculator

