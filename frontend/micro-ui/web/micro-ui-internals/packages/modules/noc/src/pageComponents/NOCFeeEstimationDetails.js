import React, { useEffect, Fragment , useState, useMemo } from "react";
import { TextInput, Toast, Loader, CardSubHeader, Table } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import {NOCFeeTable} from './NOCFeeTable'

const NOCFeeEstimationDetails = ({ formData, feeAdjustments = [], setFeeAdjustments = () => {} , disable = false}) => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const closeToast = () => setShowToast(null);
  const stateCode = Digit.ULBService.getStateId();

  const handleAdjustedAmountChange = (index, value, amount) => {
  if ((amount + Number(value)) < 0) {
    setShowToast({ error: true, message: "Adjusted_Amount_More_Than_Ammount" });
    return;
  }
  setFeeAdjustments(prev =>
    prev.map((item, i) =>
      i === index ? { ...item, adjustedAmount: value === "" ? null : Number(value),edited: true,remark: "", } : item
    )
  );
};

const handleRemarkChange = (index, value) => {
  setFeeAdjustments(prev =>
    prev.map((item, i) =>
      i === index ? { ...item, remark: value, edited: true } : item
    )
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
      } catch {
        setShowToast({ error: true, message: "PT_FILE_UPLOAD_ERROR" });
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

  console.log('payload for calc apiiiii', payload)
  const { isLoading: nocCalculatorLoading, data, revalidate } = Digit.Hooks.noc.useNOCFeeCalculator(
    {
      payload,
    },
    {
      enabled: !!payload,
    }
  );
 
  console.log('data from calc  api', data)
  const [prevSiteDetails, setPrevSiteDetails] = useState(null);

  useEffect(() => {
   if (!_.isEqual(prevSiteDetails, formData?.siteDetails)) {
     revalidate();
     setPrevSiteDetails(formData?.siteDetails);
   }
  }, [formData?.siteDetails])


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
    { id: "total", taxHeadCode: "NOC_TOTAL", title: t("NOC_TOTAL"), amount: totalAmount, adjustedAmount: "", grandTotal: totalAmount },
  ];
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
