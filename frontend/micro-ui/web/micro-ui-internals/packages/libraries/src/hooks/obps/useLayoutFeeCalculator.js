import React from "react"

import { useQuery, useQueryClient } from "react-query"


const useLayoutFeeCalculator = ({ payload, enabled = true, feeType = "PAY1" }) => {
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

  const result = useQuery(
    queryKey,
    async () => await Digit.OBPSService.LayoutCalculator({ details: payload, filters: params }),
    {
      enabled: !!payload && enabled,
    },
  )

  return {
    ...result,
    revalidate: () => result.refetch(),
  }
}

export default useLayoutFeeCalculator
