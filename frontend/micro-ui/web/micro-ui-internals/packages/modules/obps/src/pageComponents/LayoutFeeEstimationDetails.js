

import React, { useEffect, useMemo } from "react"
import { Loader, Table } from "@mseva/digit-ui-react-components"
import { useTranslation } from "react-i18next"
import useLayoutFeeCalculator from "@mseva/digit-ui-libraries/src/hooks/obps/useLayoutFeeCalculator"


const LayoutFeeEstimationDetails = ({ formData }) => {
  const { t } = useTranslation()

    const payload = useMemo(
    () => ({
      CalculationCriteria: [
        {
          applicationNumber: formData?.apiData?.Layout?.[0]?.applicationNo,
          tenantId: formData?.apiData?.Layout?.[0]?.tenantId,
          Layout: {
            ...formData?.apiData?.Layout?.[0],
            layoutDetails: {
              ...formData.apiData?.Layout?.[0]?.layoutDetails,
              additionalDetails: {
                ...formData?.apiData?.Layout?.[0]?.layoutDetails?.additionalDetails,
                // Spread updated data to preserve full objects (no .code or .name extraction)
                applicationDetails: {
                  ...formData?.apiData?.Layout?.[0]?.layoutDetails?.additionalDetails?.applicationDetails,
                  ...formData?.applicationDetails,
                },
                siteDetails: {
                  ...formData?.apiData?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails,
                  ...formData?.siteDetails,
                },
              },
            },
          },
        },
      ],
    }),
    [formData],
  )

  const {
    isLoading: layoutCalculatorLoading,
    data,
    revalidate,
  } = Digit.Hooks.obps.useLayoutFeeCalculator(
    {
      payload,
    },
    {
      enabled: !!payload,
    },
  )

  useEffect(() => {
    revalidate()
  }, [formData?.siteDetails])

  const applicationFeeDataWithTotal = useMemo(() => {
    if (!data?.Calculation?.[0]?.totalAmount) return []

    const totalAmount =
      data?.Calculation?.[0]?.taxHeadEstimates?.reduce((acc, item) => acc + (item?.estimateAmount || 0), 0) || "N/A"

    return [{ id: "1", title: t("LAYOUT_FEE_LABEL"), amount: totalAmount }]
  }, [data, t])

  const applicationFeeColumns = [
    {
      Header: t("LAYOUT_FEE_TYPE_LABEL"),
      accessor: "title",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("LAYOUT_AMOUNT_LABEL"),
      accessor: "amount",
      Cell: ({ value }) => (value !== null && value !== undefined ? `₹ ${value.toLocaleString()}` : t("CS_NA")),
    },
  ]

  if (layoutCalculatorLoading) return <Loader />

  return (
    <div>
      {layoutCalculatorLoading ? (
        <Loader />
      ) : (
        <Table
          className="customTable table-border-style"
          t={t}
          data={applicationFeeDataWithTotal}
          columns={applicationFeeColumns}
          getCellProps={() => ({ style: {} })}
          disableSort={true}
          manualPagination={false}
          isPaginationRequired={false}
        />
      )}
    </div>
  )
}

export default LayoutFeeEstimationDetails
