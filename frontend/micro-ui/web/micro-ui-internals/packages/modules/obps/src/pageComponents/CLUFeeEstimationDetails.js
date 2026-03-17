import React, { useEffect, useState, useMemo } from "react";
import { TextInput, Toast, Loader, CardSubHeader, Table } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const CLUFeeEstimationDetails = ({ formData, feeType, hasPayments }) => {
  const { t } = useTranslation();

  const payload = useMemo(
    () => ({
      CalculationCriteria: [
        {
          applicationNumber: formData?.apiData?.Clu?.[0]?.applicationNo,
          tenantId: formData?.apiData?.Clu?.[0]?.tenantId,
          feeType: feeType,
          CLU: {
            ...formData?.apiData?.Clu?.[0],
            cluDetails: {
              ...formData.apiData?.Clu?.[0]?.cluDetails,
              additionalDetails: {
                ...formData?.apiData?.Clu?.[0]?.cluDetails?.additionalDetails,
                //Use updated data from redux to fetch NOC/Compounding Fee instead of older data of createAPI

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
    }),
    [formData]
  );

  const { isLoading: cluCalculatorLoading, data, revalidate } = Digit.Hooks.obps.useCLUFeeCalculator(
    {
      payload,
      feeType
    },
    {
      enabled: !!payload,
    }
  );
 
  const [prevSiteDetails, setPrevSiteDetails] = useState(null);

  useEffect(() => {
   if (!_.isEqual(prevSiteDetails, formData?.siteDetails)) {
     revalidate();
     setPrevSiteDetails(formData?.siteDetails);
   }
  }, [formData?.siteDetails])


  const applicationFeeDataWithTotal = useMemo(() => {
    if (!data?.Calculation?.[0]?.totalAmount) return [];

    //const totalAmount = data?.Calculation?.[0]?.totalAmount || "N/A";
    const totalAmount= data?.Calculation?.[0]?.taxHeadEstimates?.reduce((acc,item)=> acc+(item?.estimateAmount || 0),0) || "N/A";

    const rows = [{ id: "1", title: t("BPA_FEE_LABEL"), amount: totalAmount }];
    
    rows.push({
      id: "status",
      title: t("BPA_STATUS_LABEL"),
      amount: hasPayments ? t("BPA_PAID_LABEL") : t("BPA_UNPAID_LABEL"),
      isStatus: true
    });

    return rows;
  }, [data, t, hasPayments]);

  const applicationFeeColumns = [
    {
      Header: t("BPA_FEE_TYPE_LABEL"),
      accessor: "title",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("BPA_AMOUNT_LABEL"),
      accessor: "amount",
      Cell: ({ row, value }) => {
        if (row.original.isStatus) {
          return <span style={{ color: "green", fontWeight: "bold" }}>{value}</span>;
        }
        return (value !== null && value !== undefined ? `₹ ${value.toLocaleString()}` : t("CS_NA"));
      },
    },
  ];

  if (cluCalculatorLoading) return <Loader />;

  return (
    <div>
      {cluCalculatorLoading ? (
        <Loader />
      ) : (
        <Table
          className="customTable table-border-style"
          t={t}
          data={applicationFeeDataWithTotal}
          columns={applicationFeeColumns}
          getCellProps={() => ({ style: {} })}
          disableSort={true}
          // autoSort={true}
          manualPagination={false}
          isPaginationRequired={false}
        />
      )}
    </div>
  );
};

export default CLUFeeEstimationDetails;
