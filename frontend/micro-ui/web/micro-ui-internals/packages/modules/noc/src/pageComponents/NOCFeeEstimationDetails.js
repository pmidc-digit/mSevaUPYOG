import React, { useEffect, useState, useMemo } from "react";
import { TextInput, Toast, Loader, CardSubHeader, Table } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import {isEqual} from "lodash";

const NOCFeeEstimationDetails = ({ formData }) => {
  const { t } = useTranslation();

  const payload = useMemo(
    () => ({
      CalculationCriteria: [
        {
          applicationNumber: formData?.apiData?.Noc?.[0]?.applicationNo,
          tenantId: formData?.apiData?.Noc?.[0]?.tenantId,
          NOC: {
            ...formData?.apiData?.Noc?.[0],
            nocDetails: {
              ...formData.apiData?.Noc?.[0]?.nocDetails,
              additionalDetails: {
                ...formData?.apiData?.Noc?.[0]?.nocDetails?.additionalDetails,
                //Use updated data from redux to fetch NOC/Compounding Fee instead of older data of createAPI

                applicationDetails: {
                  ...formData?.applicationDetails,
                  applicantGender: formData?.applicationDetails?.applicantGender?.code || formData?.applicationDetails?.applicantGender || "",
                },
                siteDetails: {
                  ...formData?.siteDetails,

                  ulbName: formData?.siteDetails?.ulbName?.name || formData?.siteDetails?.ulbName || "",
                  roadType: formData?.siteDetails?.roadType?.name || formData?.siteDetails?.roadType || "",
                  buildingStatus: formData?.siteDetails?.buildingStatus?.name || formData?.siteDetails?.buildingStatus || "",
                  isBasementAreaAvailable:
                    formData?.siteDetails?.isBasementAreaAvailable?.code || formData?.siteDetails?.isBasementAreaAvailable || "",
                  district: formData?.siteDetails?.district?.name || formData?.siteDetails?.district || "",
                  zone: formData?.siteDetails?.zone?.name || formData?.siteDetails?.zone || "",

                  specificationBuildingCategory:
                    formData?.siteDetails?.specificationBuildingCategory?.name || formData?.siteDetails?.specificationBuildingCategory || "",
                  specificationNocType: formData?.siteDetails?.specificationNocType?.name || formData?.siteDetails?.specificationNocType || "",
                  specificationRestrictedArea:
                    formData?.siteDetails?.specificationRestrictedArea?.code || formData?.siteDetails?.specificationRestrictedArea || "",
                  specificationIsSiteUnderMasterPlan:
                    formData?.siteDetails?.specificationIsSiteUnderMasterPlan?.code ||
                    formData?.siteDetails?.specificationIsSiteUnderMasterPlan ||
                    "",
                },
              },
            },
          },
        },
      ],
    }),
    [formData]
  );

  const { isLoading: nocCalculatorLoading, data, revalidate } = Digit.Hooks.noc.useNOCFeeCalculator(
    {
      payload,
    },
    {
      enabled: !!payload,
    }
  );
 
  const [prevSiteDetails, setPrevSiteDetails] = useState(null);

  useEffect(() => {
   if (!isEqual(prevSiteDetails, formData?.siteDetails)) {
     revalidate();
     setPrevSiteDetails(formData?.siteDetails);
   }
  }, [formData?.siteDetails])


  const applicationFeeDataWithTotal = useMemo(() => {
    if (!data?.Calculation?.[0]?.totalAmount) return [];

    //const totalAmount = data?.Calculation?.[0]?.totalAmount || "N/A";
    const totalAmount= data?.Calculation?.[0]?.taxHeadEstimates?.reduce((acc,item)=> acc+(item?.estimateAmount || 0),0) || "N/A";

    return [{ id: "1", title: t("NOC_FEE_LABEL"), amount: totalAmount }];
  }, [data, t]);

  const applicationFeeColumns = [
    {
      Header: t("NOC_FEE_TYPE_LABEL"),
      accessor: "title",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("NOC_AMOUNT_LABEL"),
      accessor: "amount",
      Cell: ({ value }) => (value !== null && value !== undefined ? `₹ ${value.toLocaleString()}` : t("CS_NA")),
    },
  ];

  if (nocCalculatorLoading) return <Loader />;

  return (
    <div>
      {nocCalculatorLoading ? (
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

export default NOCFeeEstimationDetails;
