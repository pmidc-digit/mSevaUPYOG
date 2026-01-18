import React, { useEffect, useState, useMemo } from "react";
import { TextInput, Toast, Loader, CardSubHeader, Table } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { CLUFeeTable } from "./CLUFeeTable";

const CLUFeeEstimationDetailsTable = ({ formData, feeType, feeAdjustments, setFeeAdjustments, disable }) => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const closeToast = () => setShowToast(null);
  const stateCode = Digit.ULBService.getStateId();

  const handleAdjustedAmountChange = (index, value, amount) => {
    if(Number(value) == 0) return;
    else if (amount + Number(value) < 0) {
      setTimeout(()=>{setShowToast(null);},3000);

      setShowToast({key: "true", error: true, message: "Net Amount After Adjustment Must Be Greater Than Or Equal To Zero" });
      return;
    }
    else{
    setFeeAdjustments((prev) =>
      prev.map((item, i) => (i === index ? { ...item, adjustedAmount: value === "" ? null : Number(value), edited: true, remark: "", filestoreId: null } : item))
    );
    }
  };

  const handleRemarkChange = (index, value) => {
    setFeeAdjustments((prev) => prev.map((item, i) => (i === index ? { ...item, remark: value, edited: true } : item)));
  };

  const handleFileUpload = async (index, e) => {
    const file = e.target.files[0];
    try {
      setFeeAdjustments((prev) => prev.map((item, i) => (i === index ? { ...item, onDocumentLoading: true } : item)));
      const response = await Digit.UploadServices.Filestorage("CLU", file, stateCode);
      if (response?.data?.files?.length > 0) {
        setFeeAdjustments((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, filestoreId: response.data.files[0].fileStoreId, onDocumentLoading: false, documentError: null } : item
          )
        );
      } else {
        setShowToast({key: "true", error: true, message: "PT_FILE_UPLOAD_ERROR" });
      }
    } catch {
      setShowToast({key: "true", error: true, message: "PT_FILE_UPLOAD_ERROR" });
    }finally{
        setTimeout(()=>{setShowToast(null);},3000);
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
  }, [formData?.siteDetails]);

  const onAdjustedAmountBlur = () => {
   return;
  };

  useEffect(() => {
    if (data?.Calculation?.[0]?.taxHeadEstimates) {
      setFeeAdjustments((prev) =>
        data.Calculation[0].taxHeadEstimates.map((tax, index) => ({
          taxHeadCode: tax?.taxHeadCode,
          category: tax?.category,
          amount: tax?.estimateAmount || 0, // baseline from API
          adjustedAmount: prev[index]?.adjustedAmount ?? 0,
          remark: prev[index]?.remark ?? tax.remarks ?? "",
          filestoreId: prev[index]?.filestoreId ?? null,
          onDocumentLoading: false,
          documentError: null,
          edited: prev[index]?.edited ?? false

        }))
      );
    }
  }, [data]);

  const applicationFeeDataWithTotal = useMemo(() => {
    // if (!data?.Calculation?.[0]?.totalAmount) return [];
    // const totalAmount = data?.Calculation?.[0]?.taxHeadEstimates?.reduce((acc, item) => acc + (item?.estimateAmount || 0), 0) || "N/A";

    // return [{ id: "1", title: t("BPA_FEE_LABEL"), amount: totalAmount }];
     if (!data?.Calculation?.[0]?.taxHeadEstimates) return [];
  console.log("feeAdjustments at this point:", feeAdjustments);
  const rows = data.Calculation[0].taxHeadEstimates.map((tax, index) => {
    const adjustedAmount = feeAdjustments[index]?.adjustedAmount ?? 0;
    console.log("Row", index, "amount:", tax.estimateAmount, "adjustedAmount:", adjustedAmount, typeof adjustedAmount);

    return {
      index,
      id: `tax-${index}`,
      title: t(tax.taxHeadCode),
      taxHeadCode: tax.taxHeadCode,
      amount: tax.estimateAmount || 0,
      category: tax.category,
      adjustedAmount,
      remark: feeAdjustments[index]?.remark ?? tax.remarks ?? "",
      filestoreId: feeAdjustments[index]?.filestoreId || null,
    };
  });


  const totalAmount = rows.reduce((acc, item) => acc + (item.amount || 0), 0);

  return [
    ...rows,
    { id: "total", taxHeadCode: "CLU_TOTAL", title: t("CLU_TOTAL"), amount: totalAmount, adjustedAmount: "", grandTotal: totalAmount },
  ];
  }, [data, t, feeAdjustments]);


  if (cluCalculatorLoading) return <Loader />;

  return (
    <div>
      {cluCalculatorLoading ? (
        <Loader />
      ) : (
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
          />
      )}
      {showToast && ( <Toast error={showToast?.error} warning={showToast?.warning} success={showToast?.success} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} /> )}
    </div>
  );
};

export default CLUFeeEstimationDetailsTable;
