import React, { useEffect, Fragment , useState, useMemo } from "react";
import { TextInput, Toast, Loader, CardSubHeader, Table } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import {NOCFeeTable} from './NOCFeeTable'

import { buildFeeHistoryByTax } from "../utils";
import { formatDuration } from "../utils";

const NOCFeeEstimationDetails = ({ formData, feeAdjustments = [], setFeeAdjustments = () => {} , disable = false}) => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const closeToast = () => setShowToast(null);
  const stateCode = Digit.ULBService.getStateId();
  const [timeObj , setTimeObj] = useState(null);
console.log('savedCalc', formData)

  useEffect(() => {
  console.log("Component mounted. Initial feeAdjustments:", feeAdjustments);
}, []);

 

const getOriginals = (taxHeadCode) => {
  const apiTax = data?.Calculation?.[0]?.taxHeadEstimates?.find(t => t.taxHeadCode === taxHeadCode);
  const savedCalc = formData?.calculations?.find(c => c.taxHeadCode === taxHeadCode);
  return {
    originalEstimate: apiTax?.estimateAmount ?? savedCalc?.estimateAmount ?? 0,
    originalRemark: apiTax?.remarks ?? savedCalc?.remarks ?? "",
  };
};

  


const handleAdjustedAmountChange = (index, value) => {
  const normalizedValue = value === "" ? 0 : Number(value);
  const taxHeadCode = feeAdjustments?.[index]?.taxHeadCode;
  const { originalEstimate, originalRemark } = getOriginals(taxHeadCode);
  if (normalizedValue !== 0 && normalizedValue < 0) {
    setShowToast({ error: true, message: "Adjusted_Amount_More_Than_Ammount" });
    return;
  }
  setFeeAdjustments((prev) =>
    (prev || []).map((item, i) => {
      if (i !== index) return item;
      const currentRemark = (item?.remark ?? originalRemark ?? "") + "";
      const isReverted = normalizedValue === 0 ? originalEstimate === 0 : normalizedValue === originalEstimate;
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
        const response = await Digit.UploadServices.Filestorage("noc-upload", file, stateCode);
        if (response?.data?.files?.length > 0) {
          setFeeAdjustments(prev =>
            prev.map((item, i) =>
              i === index
                ? { ...item, filestoreId: response.data.files[0].fileStoreId, onDocumentLoading: false, documentError: null }
                : item
            )
          );
        } else {
          setShowToast({ error: true, message: "PT_FILE_UPLOAD_ERROR" });
        }
      } catch(err) {
        setShowToast({ error: true, message: "PT_FILE_UPLOAD_ERROR" });
        console.log('err in file upload', err)
      }
    };

    const handleFileDelete = (index) => {
      setFeeAdjustments(prev =>
        prev.map((item, i) =>
          i === index ? { ...item, filestoreId: null } : item
        )
      );
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

 const feeHistory = useMemo(() => {
  const allCalcs = formData?.calculations || [];

  // Discard any calculation where every taxHeadEstimate has estimateAmount = 0
  const filteredCalcs = allCalcs.filter(calc =>
    (calc?.taxHeadEstimates || []).some(tax => tax?.estimateAmount > 0)
  );

  return buildFeeHistoryByTax(filteredCalcs, { newestFirst: true });
}, [formData?.calculations]);


  console.log("[payload] built with formData:", formData);
console.log("[payload] CalculationCriteria:", payload.CalculationCriteria);

  console.log('payload for calc apiiiii', payload)
  const { isLoading: nocCalculatorLoading, data, revalidate } = Digit.Hooks.noc.useNOCFeeCalculator(
    {
      payload,
    },
    {
      enabled: !!payload,
    }
  );
 
  console.log("[useNOCFeeCalculator] isLoading:", nocCalculatorLoading, "data:", data);

  console.log('data from calc  api', data)

  console.log("Raw API taxHeadEstimates:", data?.Calculation?.[0]?.taxHeadEstimates);
data?.Calculation?.[0]?.taxHeadEstimates?.forEach((tax, i) => {
  console.log(`API row ${i}: taxHead=${tax.taxHeadCode}, estimate=${tax.estimateAmount}, remarks=${tax.remarks}`);
});

  const [prevSiteDetails, setPrevSiteDetails] = useState(null);

  useEffect(() => {
   if (!_.isEqual(prevSiteDetails, formData?.siteDetails)) {
    console.log("[revalidate] siteDetails changed. Old:", prevSiteDetails, "New:", formData?.siteDetails);
     revalidate();
     setPrevSiteDetails(formData?.siteDetails);
   }
  }, [formData?.siteDetails])


  const onAdjustedAmountBlur = () => {
  return;
};

//newedits

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


 useEffect(() => {
   if (formData) {
    console.log('formData', formData)
     const submittedOn = formData?.apiData?.Noc?.[0]?.nocDetails?.additionalDetails?.SubmittedOn;
     const lastModified = formData?.apiData?.Noc?.[0]?.auditDetails?.lastModifiedTime;
     console.log(`submiited on , ${submittedOn} , lastModified , ${lastModified}`)
     const totalTime = submittedOn && lastModified ? lastModified - submittedOn : null;
     const time = formatDuration(totalTime)

     setTimeObj(time);

   }
 }, [formData]);


  const applicationFeeDataWithTotal = useMemo(() => {
  if (!data?.Calculation?.[0]?.taxHeadEstimates) return [];
    const rows = data.Calculation[0].taxHeadEstimates.map((tax, index) => {
    const adjustedAmount = feeAdjustments[index]?.adjustedAmount ?? tax.estimateAmount;
const remarkValue = feeAdjustments[index]?.remark ?? tax.remarks ?? "";

    console.log(`Row ${index}: taxHead=${tax.taxHeadCode}, estimate=${tax.estimateAmount}, adjusted=${adjustedAmount}, remark=${remarkValue}`);
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
  console.log("[applicationFeeDataWithTotal] built rows:", rows);


  const totalAmount = rows.reduce((acc, item) => acc + (item.adjustedAmount || 0), 0);  console.log("[applicationFeeDataWithTotal] grand total:", totalAmount);

  console.log("Final rows with total:", rows);
  return [...rows, { id: "total", taxHeadCode: "NOC_TOTAL", title: t("NOC_TOTAL"), amount: rows.reduce((acc, item) => acc + (item.adjustedAmount || 0), 0), adjustedAmount: "", grandTotal: totalAmount }];
}, [data, t, feeAdjustments]);


  if (nocCalculatorLoading) return <Loader />;

  return (
    <div>
      {nocCalculatorLoading ? (
        <Loader />
      ) : (
        <>
          <NOCFeeTable
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
            timeObj={timeObj}

          />
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
        </>
      )}
    </div>
  );
};

export default NOCFeeEstimationDetails;
