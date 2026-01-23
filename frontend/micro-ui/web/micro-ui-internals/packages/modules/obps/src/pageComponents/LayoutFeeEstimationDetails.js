
import React, { useEffect, useState, useMemo } from "react";
import { TextInput, Toast, Loader, CardSubHeader, Table } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import _ from "lodash";


const LayoutFeeEstimationDetails = ({ formData, feeType = "PAY1" }) => {
  const { t } = useTranslation()
  console.log(formData, "IIIIIIII");
  
  const payload = useMemo(
    () => ({
      CalculationCriteria: [
        {
          applicationNumber: formData?.apiData?.Layout?.[0]?.applicationNo || formData?.apiData?.applicationNo,
          tenantId: formData?.apiData?.Layout?.[0]?.tenantId || formData?.apiData?.tenantId,
          feeType: feeType,
          Layout: {
            ...formData?.apiData?.Layout?.[0],
            layoutDetails: {
              ...formData?.apiData?.Layout?.[0]?.layoutDetails,
              additionalDetails: {
                ...formData?.apiData?.Layout?.[0]?.layoutDetails?.additionalDetails,
                // Use updated data from redux to fetch fees instead of older data
                applicationDetails: {
                  ...formData?.applicationDetails,
                },
                siteDetails: {
                  ...formData?.siteDetails,
                },
              },
            },
          },
        },
      ],
      RequestInfo: {
        apiId: "Rainmaker",
        authToken: Digit.SessionStorage.get("Digit.AUTH_TOKEN") || "",
        userInfo: Digit.UserService.getUser()?.info || {},
      },
    }),
    [formData, feeType],
  )

  const {
    isLoading: layoutCalculatorLoading,
    data,
    revalidate,
  } = Digit.Hooks.obps.useLayoutFeeCalculator(
    {
      payload,
      feeType,
    },
    {
      enabled: !!payload,
    },
  )

    const [prevSiteDetails, setPrevSiteDetails] = useState(null);
  
  useEffect(() => {
   if (!_.isEqual(prevSiteDetails, formData?.siteDetails)) {
     revalidate();
     setPrevSiteDetails(formData?.siteDetails);
   }
  }, [formData?.siteDetails])
  

  const applicationFeeDataWithTotal = useMemo(() => {
    if (!data?.Calculation?.[0]?.totalAmount) return []

    const totalAmount =
      data?.Calculation?.[0]?.taxHeadEstimates?.reduce((acc, item) => acc + (item?.estimateAmount || 0), 0) || "N/A"

    return [{ id: "1", title: t("Fee"), amount: totalAmount }]
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
