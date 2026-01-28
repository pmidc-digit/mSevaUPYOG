import React, { useEffect, useState, useMemo } from "react";
import { TextInput, Toast, Loader, CardSubHeader, Table } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { CLUFeeTable } from "./CLUFeeTable";
import { buildFeeHistoryByTax } from "../utils";

const CLUFeeEstimationDetailsTable = ({ formData, feeType, feeAdjustments, setFeeAdjustments, disable }) => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const closeToast = () => setShowToast(null);
  const stateCode = Digit.ULBService.getStateId();

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
    setTimeout(()=>{
      setShowToast(null);
    },3000)
    setShowToast({ error: true, message: "BPA_AMOUNT_CANNOT_BE_NEGATIVE_LABEL" });
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
        const response = await Digit.UploadServices.Filestorage("clu-upload", file, stateCode);
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
        //console.log('err in file upload', err)
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
      feeType,
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
  }, [formData?.siteDetails]);

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

      //console.log(`Row ${index}: taxHead=${tax.taxHeadCode}, estimate=${tax.estimateAmount}, adjusted=${adjustedAmount}, remark=${remarkValue}`);
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
    // console.log("[applicationFeeDataWithTotal] built rows:", rows);

    const totalAmount = rows.reduce((acc, item) => acc + (item.adjustedAmount || 0), 0);
    //console.log("[applicationFeeDataWithTotal] grand total:", totalAmount);

    //console.log("Final rows with total:", rows);
    return [
      ...rows,
      {
        id: "total",
        taxHeadCode: "CLU_TOTAL",
        title: t("CLU_TOTAL"),
        amount: rows.reduce((acc, item) => acc + (item.adjustedAmount || 0), 0),
        adjustedAmount: "",
        grandTotal: totalAmount,
      },
    ];
  }, [data, t, feeAdjustments]);

 // const lastUpdatedBy = formData?.calculations?.filter((calc) => calc?.isLatest === true)?.updatedBy || "";
  //console.log("lastUpdatedBy==>", lastUpdatedBy);

  if (cluCalculatorLoading) return <Loader />;

  return (
    <div>
      {cluCalculatorLoading ? (
        <Loader />
      ) : (
        <div>
          <CLUFeeTable
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

export default CLUFeeEstimationDetailsTable;
