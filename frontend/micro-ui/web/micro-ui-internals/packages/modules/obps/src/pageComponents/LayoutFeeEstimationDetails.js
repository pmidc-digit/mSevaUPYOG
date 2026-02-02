


import React, { useEffect, useState, useMemo } from "react";
import { TextInput, Toast, Loader, CardSubHeader, Table } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import _ from "lodash";


const LayoutFeeEstimationDetails = ({ formData, feeType }) => {
  const { t } = useTranslation()
  
  // Handle multiple data formats:
  // 1. From LayoutApplicationSummary: { apiData: {...}, applicationDetails: {...}, siteDetails: {...} }
  // 2. From LayoutSummary (form): { apiData: { Layout: [{...}] }, applicationDetails: {...}, siteDetails: {...} }
  
  let layoutData = null;
  
  if (formData?.apiData?.Layout) {
    // NEW or EDIT mode with Layout in apiData
    const isLayoutArray = Array.isArray(formData?.apiData?.Layout);
    layoutData = isLayoutArray ? formData?.apiData?.Layout?.[0] : formData?.apiData?.Layout;
  } else if (formData?.apiData?.applicationNo) {
    // Direct layout object passed (from LayoutApplicationSummary)
    layoutData = formData?.apiData;
  } else {
    // Fallback - try to extract from formData directly
    layoutData = formData;
  }

  // Safely get applicationDetails and siteDetails
  const applicationDetails = formData?.applicationDetails || layoutData?.layoutDetails?.additionalDetails?.applicationDetails || {};
  const siteDetails = formData?.siteDetails || layoutData?.layoutDetails?.additionalDetails?.siteDetails || {};
  
  // Function to format siteDetails fields for calculator API
  // Ensures all dropdown/select fields are sent as objects with code and name
  const formatSiteDetailsForCalculator = (details) => {
    if (!details) return details;

    const formatted = { ...details };

    // Format zone to object if it's a string
    if (formatted.zone && typeof formatted.zone === 'string') {
      formatted.zone = {
        code: formatted.zone,
        name: formatted.zone,
      };
    }

    // Format isCluRequired to object if it's a string
    if (formatted.isCluRequired && typeof formatted.isCluRequired === 'string') {
      formatted.isCluRequired = {
        code: formatted.isCluRequired,
        i18nKey: formatted.isCluRequired,
      };
    }

    // Format buildingStatus to object if it's a string
    if (formatted.buildingStatus && typeof formatted.buildingStatus === 'string') {
      formatted.buildingStatus = {
        code: formatted.buildingStatus,
        name: formatted.buildingStatus,
      };
    }

    // Format buildingCategory to object if it's a string
    if (formatted.buildingCategory && typeof formatted.buildingCategory === 'string') {
      formatted.buildingCategory = {
        code: formatted.buildingCategory,
        name: formatted.buildingCategory,
      };
    }

    // Format roadType to object if it's a string
    if (formatted.roadType && typeof formatted.roadType === 'string') {
      formatted.roadType = {
        code: formatted.roadType,
        name: formatted.roadType,
      };
    }

    // Format layoutAreaType to object if it's a string
    if (formatted.layoutAreaType && typeof formatted.layoutAreaType === 'string') {
      formatted.layoutAreaType = {
        code: formatted.layoutAreaType,
        name: formatted.layoutAreaType,
      };
    }

    // Format isBasementAreaAvailable to object if it's a string
    if (formatted.isBasementAreaAvailable && typeof formatted.isBasementAreaAvailable === 'string') {
      formatted.isBasementAreaAvailable = {
        code: formatted.isBasementAreaAvailable,
        i18nKey: formatted.isBasementAreaAvailable,
      };
    }

    // Format isAreaUnderMasterPlan to object if it's a string
    if (formatted.isAreaUnderMasterPlan && typeof formatted.isAreaUnderMasterPlan === 'string') {
      formatted.isAreaUnderMasterPlan = {
        code: formatted.isAreaUnderMasterPlan,
        i18nKey: formatted.isAreaUnderMasterPlan,
      };
    }

    return formatted;
  };
  
  const payload = useMemo(
    () => ({
      CalculationCriteria: [
        {
          applicationNumber: layoutData?.applicationNo,
          tenantId: layoutData?.tenantId,
          feeType: feeType,
          Layout: {
            ...layoutData,
            layoutDetails: {
              ...layoutData?.layoutDetails,
              additionalDetails: {
                ...layoutData?.layoutDetails?.additionalDetails,
                // Use updated data from props or fallback to layoutData, with proper formatting
                applicationDetails: applicationDetails,
                siteDetails: formatSiteDetailsForCalculator(siteDetails),
              },
            },
          },
        },
      ],
    }),
    [layoutData, applicationDetails, siteDetails, feeType],
  );

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
  }, [formData?.siteDetails, revalidate])

  const applicationFeeDataWithTotal = useMemo(() => {
    if (!data?.Calculation?.[0]) {
      return [];
    }

    const calculation = data?.Calculation?.[0];
    const totalAmount = calculation?.taxHeadEstimates?.reduce((acc, item) => {
      const amount = parseFloat(item?.estimateAmount) || 0;
      return acc + amount;
    }, 0) || 0;

    // Ensure totalAmount is a valid number
    const finalAmount = isNaN(totalAmount) ? 0 : totalAmount;

    return [{ id: "1", title: t("Layout Processing Fee"), amount: finalAmount }];
  }, [data, t]);

  const applicationFeeColumns = [
    {
      Header: t("LAYOUT_FEE_TYPE_LABEL"),
      accessor: "title",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("LAYOUT_AMOUNT_LABEL"),
      accessor: "amount",
      Cell: ({ value }) => {
        if (value === null || value === undefined || isNaN(value)) {
          return t("CS_NA");
        }
        return `₹ ${parseFloat(value).toLocaleString()}`;
      },
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

