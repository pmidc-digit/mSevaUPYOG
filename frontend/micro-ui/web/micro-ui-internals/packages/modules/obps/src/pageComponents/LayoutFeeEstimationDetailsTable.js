import React, { useEffect, useState, useMemo } from "react";
import { TextInput, Toast, Loader, CardSubHeader, Table } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { LayoutFeeTable } from "./LayoutFeeTable";
import { buildFeeHistoryByTax } from "../utils";

const LayoutFeeEstimationDetailsTable = ({ formData, feeType = "PAY1", feeAdjustments, setFeeAdjustments, disable }) => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const closeToast = () => setShowToast(null);
  const stateCode = Digit.ULBService.getStateId();


  let layoutData = null;
  
  if (formData?.apiData?.Layout) {

    const isLayoutArray = Array.isArray(formData?.apiData?.Layout);
    layoutData = isLayoutArray ? formData?.apiData?.Layout?.[0] : formData?.apiData?.Layout;
  } else if (formData?.apiData?.applicationNo) {

    layoutData = formData?.apiData;
  } else {

    layoutData = formData;
  }
  
  const tenantId = layoutData?.tenantId;
  const applicationNo = layoutData?.applicationNo;


  const applicationDetails = formData?.applicationDetails || layoutData?.layoutDetails?.additionalDetails?.applicationDetails || {};
  const siteDetails = formData?.siteDetails || layoutData?.layoutDetails?.additionalDetails?.siteDetails || {};

  const getOriginals = (taxHeadCode) => {
    const apiTax = data?.Calculation?.[0]?.taxHeadEstimates?.find((t) => t.taxHeadCode === taxHeadCode);
    const savedCalc = formData?.calculations?.find((c) => c.taxHeadCode === taxHeadCode);
    return {
      originalEstimate: apiTax?.estimateAmount ?? savedCalc?.estimateAmount ?? 0,
      originalRemark: apiTax?.remarks ?? savedCalc?.remarks ?? "",
    };
  };

  const handleAdjustedAmountChange = (index, value) => {
    const normalizedValue = value === "" ? null : Number(value);
    const taxHeadCode = feeAdjustments?.[index]?.taxHeadCode;
    const { originalEstimate, originalRemark } = getOriginals(taxHeadCode);
    if (normalizedValue !== null && normalizedValue < 0) {
      setShowToast({ error: true, message: "Adjusted_Amount_More_Than_Ammount" });
      return;
    }
    setFeeAdjustments((prev) =>
      (prev || []).map((item, i) => {
        if (i !== index) return item;
        const currentRemark = (item?.remark ?? originalRemark ?? "") + "";
        const isReverted = normalizedValue === null ? originalEstimate === 0 : normalizedValue === originalEstimate;
        if (isReverted) {
          return { ...item, adjustedAmount: normalizedValue, edited: false, remark: originalRemark ?? "" };
        }
        const adjustedDiffers = normalizedValue !== originalEstimate;
        const remarkEmpty = !currentRemark || currentRemark.trim() === "";
        return {
          ...item,
          adjustedAmount: normalizedValue,
          remark: currentRemark,
          edited: adjustedDiffers && remarkEmpty,
        };
      })
    );
  };

  const handleRemarkChange = (index, value) => {
    const taxHeadCode = feeAdjustments?.[index]?.taxHeadCode;
    const { originalEstimate } = getOriginals(taxHeadCode);
    const currentAdjusted = feeAdjustments?.[index]?.adjustedAmount ?? 0;
    const adjustedDiffers = currentAdjusted !== originalEstimate;
    const remarkEmpty = (value ?? "").trim() === "";
    setFeeAdjustments((prev) =>
      (prev || []).map((item, i) => (i === index ? { ...item, remark: value, edited: adjustedDiffers && remarkEmpty } : item))
    );
  };

  const handleFileUpload = async (index, e) => {
    const file = e.target.files[0];
    try {
      setFeeAdjustments(prev =>
        prev.map((item, i) =>
          i === index ? { ...item, onDocumentLoading: true } : item
        )
      );
      const response = await Digit.UploadServices.Filestorage("layout-upload", file, stateCode);
      if (response?.data?.files?.length > 0) {
        setFeeAdjustments(prev =>
          prev.map((item, i) =>
            i === index
              ? { ...item, filestoreId: response.data.files[0].fileStoreId, onDocumentLoading: false, documentError: null }
              : item
          )
        );
      } else {
        setShowToast({key: "true",  error: true, message: "PT_FILE_UPLOAD_ERROR" });
      }
    } catch(err) {
      setShowToast({key: "true",  error: true, message: "PT_FILE_UPLOAD_ERROR" });
    }finally{
      setTimeout(()=>{setShowToast(null)},3000);
    }
  };

  const handleFileDelete = (index) => {
    setFeeAdjustments((prev) => prev.map((item, i) => (i === index ? { ...item, filestoreId: null } : item)));
  };

  const getUrlForDocumentView = async (filestoreId) => {
    if (!filestoreId) return;
    const result = await Digit.UploadServices.Filefetch([filestoreId], stateCode);
    return result?.data?.[filestoreId] || null;
  };

  async function routeTo(filestoreId, index) {
    const jumpTo = await getUrlForDocumentView(filestoreId, index);
    if (jumpTo) window.open(jumpTo);
  }


  const formatSiteDetailsForCalculator = (details) => {
    if (!details) return details;

    const formatted = { ...details };


    if (formatted.zone && typeof formatted.zone === 'string') {
      formatted.zone = {
        code: formatted.zone,
        name: formatted.zone,
      };
    }


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
    () => layoutData ? ({
      CalculationCriteria: [
        {
          applicationNumber: applicationNo,
          tenantId: tenantId,
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
    }) : null,
    [layoutData, applicationDetails, siteDetails, feeType, applicationNo, tenantId]
  );

  const { isLoading: layoutCalculatorLoading, data, revalidate } = Digit.Hooks.obps.useLayoutFeeCalculator(
    {
      payload,
      feeType: feeType,
    },
    {
      enabled: !!payload,
    }
  );

  const feeHistory = useMemo(() => {
    const allCalcs = formData?.calculations || [];

    // Discard any calculation where every taxHeadEstimate has estimateAmount = 0
    const filteredCalcs = allCalcs.filter((calc) => (calc?.taxHeadEstimates || []).some((tax) => tax?.estimateAmount > 0));

    return buildFeeHistoryByTax(filteredCalcs, { newestFirst: true });
  }, [formData?.calculations]);

  const [prevSiteDetails, setPrevSiteDetails] = useState(null);

  useEffect(() => {
    if (!_.isEqual(prevSiteDetails, formData?.siteDetails)) {
      revalidate();
      setPrevSiteDetails(formData?.siteDetails);
    }
  }, [formData?.siteDetails, revalidate]);

  const onAdjustedAmountBlur = () => {
    return;
  };

  useEffect(() => {
    if (!data?.Calculation?.[0]?.taxHeadEstimates) return;

    setFeeAdjustments((prev = []) => {
      // map previous by taxHeadCode for robust matching
      const prevByTax = (prev || []).reduce((acc, it) => {
        if (it?.taxHeadCode) acc[it.taxHeadCode] = it;
        return acc;
      }, {});

      return data.Calculation[0].taxHeadEstimates.map((tax) => {
        const savedCalc = formData?.calculations?.find((c) => c.taxHeadCode === tax.taxHeadCode);
        const prevItem = prevByTax[tax.taxHeadCode] || {};
        const isEdited = !!prevItem.edited;

        return {
          taxHeadCode: tax.taxHeadCode,
          category: tax.category,
          adjustedAmount: isEdited ? prevItem.adjustedAmount : tax.estimateAmount ?? savedCalc?.estimateAmount ?? 0,
          remark: isEdited ? prevItem.remark ?? "" : tax.remarks ?? savedCalc?.remarks ?? "",
          filestoreId: prevItem?.filestoreId !== undefined ? prevItem.filestoreId : savedCalc?.filestoreId ?? tax.filestoreId ?? null,
          onDocumentLoading: false,
          documentError: null,
          edited: prevItem.edited ?? false,
        };
      });
    });
  }, [data]);

  const applicationFeeDataWithTotal = useMemo(() => {
    if (!data?.Calculation?.[0]?.taxHeadEstimates) return [];
    const rows = data.Calculation[0].taxHeadEstimates.map((tax, index) => {
      const adjustedAmount = feeAdjustments[index]?.adjustedAmount ?? tax.estimateAmount;
      const remarkValue = feeAdjustments[index]?.remark ?? tax.remarks ?? "";

      return {
        index,
        id: `tax-${index}`,
        title: t(tax.taxHeadCode),
        taxHeadCode: tax.taxHeadCode,
        amount: tax.estimateAmount || 0,
        category: tax.category,
        adjustedAmount,
        remark: remarkValue,
        filestoreId: feeAdjustments[index]?.filestoreId || null,
      };
    });

    const totalAmount = rows.reduce((acc, item) => acc + (item.adjustedAmount || 0), 0);

    return [
      ...rows,
      {
        id: "total",
        taxHeadCode: "LAYOUT_TOTAL",
        title: t("LAYOUT_TOTAL"),
        amount: rows.reduce((acc, item) => acc + (item.adjustedAmount || 0), 0),
        adjustedAmount: "",
        grandTotal: totalAmount,
      },
    ];
  }, [data, t, feeAdjustments]);

  if (layoutCalculatorLoading) return <Loader />;

  return (
    <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      {
      // cluCalculatorLoading ? (
      //   <Loader />
      // ) : 
      (
        <div style={{ width: "100%" }}>
          <LayoutFeeTable
            feeDataWithTotal={applicationFeeDataWithTotal}
            feeData={feeAdjustments}
            disable={disable}
            isEmployee={!disable}
            handleAdjustedAmountChange={handleAdjustedAmountChange}
            handleRemarkChange={handleRemarkChange}
            handleFileUpload={handleFileUpload}
            handleFileDelete={handleFileDelete}
            routeTo={routeTo}
            t={t}
            onAdjustedAmountBlur={onAdjustedAmountBlur}
            feeHistory={feeHistory}
          />
        </div>
      )}
      {showToast && (
        <Toast
          error={showToast?.error}
          warning={showToast?.warning}
          success={showToast?.success}
          label={t(showToast?.message)}
          isDleteBtn={true}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default LayoutFeeEstimationDetailsTable;
