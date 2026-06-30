import React, { useState, useEffect, Fragment, useRef } from "react";
import { useSelector } from "react-redux";
import { CardLabel } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import TLDocument from "./TLDocumets";
import {
  buildTLPaymentBreakup,
  createTLPaymentSnapshot,
  describeTLPaymentSnapshot,
  getTLBillAccountDetails,
  getTLPaymentSnapshotDecision,
  getTLTotalAmount,
} from "../utils/paymentBreakup";

const TLSummaryPage = ({ config, formData: propsFormData, onSelect }) => {
  const { t } = useTranslation();
  
  // Get formData directly from Redux to prevent data loss
  const reduxFormData = useSelector((state) => state.tl.tlNewApplicationForm.formData);
  const formData = reduxFormData || propsFormData || {};
  
  const createdResponse = formData?.ResumePayload || formData?.CreatedResponse || formData?.EditPayload || {};
  const { tradeLicenseDetail = {}, calculation = {}, status, applicationType, licenseType, tradeName, commencementDate, subOwnerShipCategory, propertyId} = createdResponse;
  const [isChecked, setIsChecked] = useState(false);
  const [showBreakupModal, setShowBreakupModal] = useState(false);
  const [breakupData, setBreakupData] = useState(null);
  const [breakupLoading, setBreakupLoading] = useState(false);
  const [resolvedPaymentSnapshot, setResolvedPaymentSnapshot] = useState(null);

  const owners = tradeLicenseDetail?.owners || [];
  const tradeUnits = tradeLicenseDetail?.tradeUnits || [];
  const accessories = tradeLicenseDetail?.accessories || [];
  const address = tradeLicenseDetail?.address || {};
  const taxHeads = calculation?.taxHeadEstimates || [];

  const reduxAddress = formData?.TraidDetails?.address || formData?.TraidDetailsRenew?.address || formData?.address || {};
  const resolvedPincode = address?.pincode || reduxAddress?.pincode || "NA";
  const resolvedElectricityNo = address?.electricityNo || reduxAddress?.electricityNo || "NA";
  const resolvedOldLicenseNumber = createdResponse?.oldLicenseNumber || formData?.TraidDetails?.tradedetils?.[0]?.oldReceiptNo || formData?.TraidDetailsRenew?.tradedetils?.[0]?.oldReceiptNo || "NA";

  const tenantId = createdResponse?.tenantId || Digit.ULBService.getCurrentTenantId();
  const consumerCode = createdResponse?.applicationNumber;
  const { data: paymentsHistory } = Digit.Hooks.tl.useTLPaymentHistory(tenantId, consumerCode);
  const debugSequenceRef = useRef(0);

  // State to hold bill amounts fetched from billing API (for edit path where calculation is empty)
  const [billData, setBillData] = useState(null);

  const logPaymentDebug = (event, payload) => {
    debugSequenceRef.current += 1;
    console.info(`[TLSummaryPage payment-debug #${debugSequenceRef.current}] ${event}`, payload);
  };

  const licenseData = tradeLicenseDetail || createdResponse?.tradeLicenseDetail || {};
  const resolvedBillAccountDetails = resolvedPaymentSnapshot?.billAccountDetails || [];
  const resolvedTotalAmount = resolvedPaymentSnapshot?.totalAmount ?? 0;
  const paymentBreakup = buildTLPaymentBreakup({
    billAccountDetails: resolvedBillAccountDetails,
    totalAmount: resolvedTotalAmount,
    applicationType,
    penaltyReason: licenseData?.adhocPenaltyReason || "",
    rebateReason: licenseData?.adhocExemptionReason || "",
  });

  const getTaxAmount = (category) => {
    if (category === "TAX" && paymentBreakup.hasTaxHead("TL_TAX")) return paymentBreakup.tradeLicenseTax;
    if (category === "REBATE" && (paymentBreakup.hasTaxHead("TL_RENEWAL_REBATE") || paymentBreakup.hasTaxHead("TL_ADHOC_REBATE"))) {
      return paymentBreakup.rebate;
    }
    if (category === "PENALTY" && (paymentBreakup.hasTaxHead("TL_RENEWAL_PENALTY") || paymentBreakup.hasTaxHead("TL_ADHOC_PENALTY"))) {
      return paymentBreakup.penalty;
    }

    // Fallback to calculation.taxHeadEstimates when bill/payment breakup is unavailable
    const fromCalc = taxHeads.find((item) => item.category === category)?.estimateAmount;
    if (fromCalc !== undefined && fromCalc !== null) return fromCalc;

    return 0;
  };

  useEffect(() => {
    const paymentHistoryBillAccountDetails = getTLBillAccountDetails({ paymentsHistory });
    const paymentHistoryTotalAmount = getTLTotalAmount({ paymentsHistory });
    const nextCandidates = [];

    if (paymentHistoryBillAccountDetails.length > 0 || paymentHistoryTotalAmount > 0) {
      nextCandidates.push(
        createTLPaymentSnapshot({
          source: "paymentsHistory",
          billAccountDetails: paymentHistoryBillAccountDetails,
          totalAmount: paymentHistoryTotalAmount,
        })
      );
    }

    const billAccountDetails = getTLBillAccountDetails({ billData });
    const totalAmount = getTLTotalAmount({ billData });
    if (billAccountDetails.length > 0 || totalAmount > 0) {
      nextCandidates.push(
        createTLPaymentSnapshot({
          source: billData?.__source || "fetchBill",
          billAccountDetails,
          totalAmount,
        })
      );
    }

    if (nextCandidates.length === 0) {
      return;
    }

    setResolvedPaymentSnapshot((currentSnapshot) => {
      let selectedSnapshot = currentSnapshot;

      nextCandidates.forEach((candidateSnapshot) => {
        const decision = getTLPaymentSnapshotDecision(selectedSnapshot, candidateSnapshot);
        logPaymentDebug("snapshot-candidate", {
          source: candidateSnapshot.source,
          decision: decision.reason,
          accepted: decision.shouldReplace,
          previous: describeTLPaymentSnapshot(selectedSnapshot),
          candidate: describeTLPaymentSnapshot(candidateSnapshot),
        });

        if (decision.shouldReplace) {
          selectedSnapshot = candidateSnapshot;
        }
      });

      return selectedSnapshot;
    });
  }, [paymentsHistory, billData]);

  // Fetch bill amounts when calculation data is missing (edit/INITIATED path)
  useEffect(() => {
    if (consumerCode && !billData) {
      const billTenantId = createdResponse?.tenantId || tradeLicenseDetail?.address?.tenantId || tenantId;
      const fetchBill = async (retries) => {
        try {
          const fetchBillRes = await Digit.TLService.fetch_bill({ tenantId: billTenantId, filters: { consumerCode, businessService: "TL" } });
          const bill = fetchBillRes?.Bill?.[0];
          if (bill) {
            logPaymentDebug("fetch_bill-response", {
              source: "fetchBill",
              totalAmount: bill?.totalAmount,
              billAccountDetails: bill?.billDetails?.[0]?.billAccountDetails || [],
            });
            setBillData({ ...bill, __source: "fetchBill" });
          } else if (retries < 2) {
            setTimeout(() => fetchBill(retries + 1), 2000);
          } else {
            await fetchSlabFallback(billTenantId);
          }
        } catch (e) {
          console.error("Error fetching bill amounts for summary:", e);
          if (retries < 2) {
            setTimeout(() => fetchBill(retries + 1), 2000);
          } else {
            await fetchSlabFallback(billTenantId);
          }
        }
      };

      const fetchSlabFallback = async (tid) => {
        try {
          const validityYears = tradeLicenseDetail?.additionalDetail?.validityYears || 1;
          const getbillRes = await Digit.TLService.getbill({ tenantId: tid, filters: { consumerCode, businessService: "TL" } });
          const billingSlabIds = getbillRes?.billingSlabIds || {};
          const tradeSlabEntries = billingSlabIds?.tradeTypeBillingSlabIds || [];
          const accessorySlabEntries = billingSlabIds?.accesssoryBillingSlabIds || [];
          const allSlabIds = [...tradeSlabEntries, ...accessorySlabEntries]
            .map((entry) => entry?.split("|")?.[0])
            .filter(Boolean);

          if (allSlabIds.length > 0) {
            const slabRes = await Digit.TLService.billingslab({ tenantId: tid, filters: { ids: allSlabIds.join(",") } });
            const slabs = slabRes?.billingSlab || [];
            const tradeTotal = tradeSlabEntries.reduce((sum, entry) => {
              const slab = slabs.find((s) => s.id === entry?.split("|")?.[0]);
              return sum + (slab?.rate || 0);
            }, 0);
            const accTotal = accessorySlabEntries.reduce((sum, entry) => {
              const slab = slabs.find((s) => s.id === entry?.split("|")?.[0]);
              return sum + (slab?.rate || 0);
            }, 0);
            const total = (tradeTotal + accTotal) * (validityYears || 1);
            const slabFallbackBill = {
              totalAmount: total,
              billDetails: [{ billAccountDetails: [{ taxHeadCode: "TL_TAX", amount: total }] }],
              __source: "slabFallback",
            };
            logPaymentDebug("slab-fallback-response", {
              source: "slabFallback",
              totalAmount: total,
              billAccountDetails: slabFallbackBill.billDetails[0].billAccountDetails,
            });
            setBillData(slabFallbackBill);
          }
        } catch (slabErr) {
          console.error("Error fetching slab fallback for summary:", slabErr);
        }
      };

      fetchBill(0);
    }
  }, [consumerCode, tenantId, billData]);

  useEffect(() => {
    if (!paymentsHistory) {
      return;
    }

    logPaymentDebug("payments-history-update", {
      source: "paymentsHistory",
      totalAmount: getTLTotalAmount({ paymentsHistory }),
      billAccountDetails: getTLBillAccountDetails({ paymentsHistory }),
    });
  }, [paymentsHistory]);

  const fetchBreakupData = async () => {
    if (!consumerCode || breakupData) {
      setShowBreakupModal(true);
      return;
    }
    setBreakupLoading(true);
    try {
      // Step 1: Fetch bill from billing-service
      const fetchBillRes = await Digit.TLService.fetch_bill({ tenantId, filters: { consumerCode, businessService: "TL" } });
      const fetchedBill = fetchBillRes?.Bill?.[0];
      const fetchedBillSnapshot = fetchedBill
        ? createTLPaymentSnapshot({
            source: "fetchBreakupFetchBill",
            billAccountDetails: getTLBillAccountDetails({ billData: fetchedBill }),
            totalAmount: getTLTotalAmount({ billData: fetchedBill }),
          })
        : null;
      const paymentHistorySnapshot = paymentsHistory
        ? createTLPaymentSnapshot({
            source: "paymentsHistory",
            billAccountDetails: getTLBillAccountDetails({ paymentsHistory }),
            totalAmount: getTLTotalAmount({ paymentsHistory }),
          })
        : null;
      const modalSnapshots = [resolvedPaymentSnapshot, paymentHistorySnapshot, fetchedBillSnapshot].filter(Boolean);
      const selectedSnapshot = modalSnapshots.reduce((bestSnapshot, candidateSnapshot) => {
        if (!bestSnapshot) {
          return candidateSnapshot;
        }

        const decision = getTLPaymentSnapshotDecision(bestSnapshot, candidateSnapshot);
        return decision.shouldReplace ? candidateSnapshot : bestSnapshot;
      }, null);
      const billAccountDetails = selectedSnapshot?.billAccountDetails || [];
      const totalAmount = selectedSnapshot?.totalAmount ?? 0;
      const validityYears = tradeLicenseDetail?.additionalDetail?.validityYears || 1;
      const breakupSummary = buildTLPaymentBreakup({
        billAccountDetails,
        totalAmount,
        applicationType,
        penaltyReason: licenseData?.adhocPenaltyReason || "",
        rebateReason: licenseData?.adhocExemptionReason || "",
      });

      // Step 2: Try TL calculator for detailed slab breakup (may fail for citizens due to role restrictions)
      let tradeUnitBreakup = [];
      let accessoryBreakup = [];
      try {
        const getbillRes = await Digit.TLService.getbill({ tenantId, filters: { consumerCode, businessService: "TL" } });
        const billingSlabIds = getbillRes?.billingSlabIds || {};
        const tradeSlabEntries = billingSlabIds?.tradeTypeBillingSlabIds || [];
        const accessorySlabEntries = billingSlabIds?.accesssoryBillingSlabIds || [];

        const allSlabIds = [...tradeSlabEntries, ...accessorySlabEntries]
          .map((entry) => entry?.split("|")?.[0])
          .filter(Boolean);

        let slabs = [];
        if (allSlabIds.length > 0) {
          const slabRes = await Digit.TLService.billingslab({ tenantId, filters: { ids: allSlabIds.join(",") } });
          slabs = slabRes?.billingSlab || [];
        }

        tradeUnitBreakup = tradeSlabEntries.map((entry) => {
          const parts = entry?.split("|") || [];
          const slabId = parts[0];
          const slab = slabs.find((s) => s.id === slabId);
          const tradeTypeParts = slab?.tradeType?.split(".") || [];
          const tradeSubType = tradeTypeParts[tradeTypeParts.length - 1] || "Unknown";
          return {
            name: t(formatTradeType(slab?.tradeType)) || tradeSubType,
            rate: slab?.rate || 0,
          };
        });

        accessoryBreakup = accessorySlabEntries.map((entry) => {
          const parts = entry?.split("|") || [];
          const slabId = parts[0];
          const slab = slabs.find((s) => s.id === slabId);
          const catFormatted = slab?.accessoryCategory?.replace(/\./g, "_")?.replace(/-/g, "_");
          return {
            name: t(`TRADELICENSE_ACCESSORIESCATEGORY_${catFormatted}`) || slab?.accessoryCategory || "Accessory",
            rate: slab?.rate || 0,
          };
        });
      } catch (calcError) {
        console.warn("TL calculator API not accessible, showing bill-level breakup only:", calcError);
      }

      const tradeUnitTotal = tradeUnitBreakup.reduce((sum, item) => sum + item.rate, 0);
      const accessoryTotal = accessoryBreakup.reduce((sum, item) => sum + item.rate, 0);
      const slabBasedTotal = (tradeUnitTotal + accessoryTotal) * (validityYears || 1);

      setBreakupData({
        tradeUnitBreakup,
        accessoryBreakup,
        tradeUnitTotal,
        accessoryTotal,
        validityYears,
        tlTax: breakupSummary.tradeLicenseTax || slabBasedTotal,
        rebate: breakupSummary.rebate,
        penalty: breakupSummary.penalty,
        renewalRebate: breakupSummary.renewalRebate,
        adhocRebate: breakupSummary.adhocRebate,
        renewalPenalty: breakupSummary.renewalPenalty,
        adhocPenalty: breakupSummary.adhocPenalty,
        feeLineItems: breakupSummary.feeLineItems,
        totalAmount: totalAmount || slabBasedTotal,
        finalAmount: totalAmount || slabBasedTotal,
      });
      setShowBreakupModal(true);
    } catch (error) {
      console.error("Error fetching breakup data:", error);
    } finally {
      setBreakupLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "NA";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatTradeType = (tradeType) => {
  if (!tradeType) return "NA";
  // Replace dots with underscores and hyphens with underscores
  const formatted = tradeType.replace(/\./g, '_').replace(/-/g, '_');
  return `TRADELICENSE_TRADETYPE_${formatted}`;
};
const ownershipCategory = tradeLicenseDetail?.subOwnerShipCategory?.split(".")[0]?.toUpperCase() || "NA";
const subOwnerShipCategoryValue = tradeLicenseDetail?.subOwnerShipCategory?.split(".")[1]?.toUpperCase() || "NA"
  const renderLabel = (label, value) => {
    // Safely extract display value — handles objects like {code, i18nKey}
    let displayValue = value;
    if (value && typeof value === 'object') {
      displayValue = value.code || value.i18nKey || value.name || "NA";
    }
    const isEmptyValue = displayValue === undefined || displayValue === null || displayValue === "";
    return (
      <div className="bpa-summary-label-field-pair">
        <CardLabel className="bpa-summary-bold-label" style={{width: "auto"}}>{label}</CardLabel>
        <div>{isEmptyValue ? "NA" : displayValue}</div>
      </div>
    );
  };

  return (
    <div className="bpa-summary-page">
      <h2 className="bpa-summary-heading">{t("Application Summary")}</h2>
      <div className="bpa-summary-section">
        {renderLabel(t("Trade License Tax"), getTaxAmount("TAX"))}
        {renderLabel(t("Rebate"), getTaxAmount("REBATE"))}
        {renderLabel(t("Penalty"), getTaxAmount("PENALTY"))}
        {renderLabel(
          t("Total Amount"),
          resolvedPaymentSnapshot ? `Rs ${resolvedTotalAmount}` : `Rs ${getTaxAmount("TAX")}`
        )}
        {renderLabel(t("Application Status"), status || "NA")}
        <div className="TL-mt-5">
          <span
            onClick={fetchBreakupData}
            className="TL-breakup-link"
          >
            {breakupLoading ? "Loading..." : "VIEW BREAKUP"}
          </span>
        </div>
      </div>

      {/* Calculation Breakup Modal */}
      {showBreakupModal && breakupData && (
        <div
          className="TL-modal-backdrop"
          onClick={() => setShowBreakupModal(false)}
        >
          <div
            className="TL-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="TL-modal-header">
              <h3 className="TL-modal-title">Calculation Breakup</h3>
              <span onClick={() => setShowBreakupModal(false)} className="TL-modal-close">X</span>
            </div>

            {/* Trade Unit Section */}
            {breakupData.tradeUnitBreakup?.length > 0 && (
              <>
                <div className="TL-breakup-section-title">Trade Unit</div>
                {breakupData.tradeUnitBreakup.map((item, index) => (
                  <div key={index} className="TL-breakup-row">
                    <span>{item.name}</span>
                    <span>Rs {item.rate}</span>
                  </div>
                ))}
                <div className="TL-breakup-subtotal-row">
                  <span>Total</span>
                  <span>Rs {breakupData.tradeUnitTotal}</span>
                </div>
              </>
            )}

            {/* Accessory Unit Section */}
            {breakupData.accessoryBreakup?.length > 0 && (
              <>
                <div className="TL-breakup-section-title TL-mt-12">Accessory Unit</div>
                {breakupData.accessoryBreakup.map((item, index) => (
                  <div key={index} className="TL-breakup-row">
                    <span>{item.name}</span>
                    <span>Rs {item.rate}</span>
                  </div>
                ))}
                <div className="TL-breakup-subtotal-row">
                  <span>Total</span>
                  <span>Rs {breakupData.accessoryTotal}</span>
                </div>
              </>
            )}

            {/* Final Calculation */}
            <div className="TL-breakup-strong-section">
              <div className="TL-breakup-row">
                <span>Trade Unit + Accessory Unit</span>
                <span>Rs {breakupData.tradeUnitTotal + breakupData.accessoryTotal}</span>
              </div>
              <div className="TL-breakup-row">
                <span>Validity (In Years)</span>
                <span>{breakupData.validityYears}</span>
              </div>
              <div className="TL-breakup-row TL-fw-600">
                <span>Final Amount</span>
                <span>Rs {breakupData.finalAmount}</span>
              </div>
            </div>

            {breakupData.feeLineItems?.length > 0 && (
              <div className="TL-breakup-light-section">
                {breakupData.feeLineItems.map((item) => (
                  <div className="TL-breakup-row" key={item.label}>
                    <span>{item.label}</span>
                    <span>Rs {item.amount}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Grand Total */}
            <div className="TL-breakup-grand-total">
              <span>Total</span>
              <span>Rs {breakupData.totalAmount}</span>
            </div>
          </div>
        </div>
      )}

      <h2 className="bpa-summary-heading">{t("Trade Details")}</h2>
      <div className="bpa-summary-section">
        {renderLabel(t("Application Type"), applicationType)}
        {renderLabel(t("Licence Type"), licenseType)}
        {renderLabel(t("Trade Name"), tradeName)}
        {renderLabel(t("Structure Type"), tradeLicenseDetail?.structureType ? t(`COMMON_MASTERS_STRUCTURETYPE_${tradeLicenseDetail.structureType.split(".")[0]}`) : "")}
        {renderLabel(t("Structure Sub Type"), tradeLicenseDetail?.structureType ? t(`COMMON_MASTERS_STRUCTURETYPE_${tradeLicenseDetail.structureType.replace(/\./g, "_")}`) : "")}
        {renderLabel(t("Trade Commencement Date"), formatDate(commencementDate))}
        {renderLabel(t("Trade GST No."), tradeLicenseDetail?.additionalDetail?.gstNo)}
        {renderLabel(t("Operational Area (Sq Ft)"), tradeLicenseDetail?.operationalArea)}
        {renderLabel(t("No. Of Employees"), tradeLicenseDetail?.noOfEmployees)}
        {renderLabel(t("Old Receipt No."), resolvedOldLicenseNumber)}
        {renderLabel(t("Validity (In Years)"), tradeLicenseDetail?.additionalDetail?.validityYears)}
      </div>

      <h2 className="bpa-summary-heading">{t("Trade Units")}</h2>
      {tradeUnits.map((unit, index) => (
        <div key={index} className="bpa-summary-section">
          <div className="TL-item-index">#{index + 1}</div>
          {renderLabel(t("Trade Category"), unit?.tradeType?.split(".")[0])}
          {renderLabel(t("Trade Type"), unit?.tradeType?.split(".")[1])}
          {/* {renderLabel(t("Trade Sub-Type"), unit?.tradeType?.split(".")[2])} */}
          {renderLabel(t("Trade Sub-Type"), t(formatTradeType(unit?.tradeType)))}
          {renderLabel(t("UOM"), unit?.uom)}
          {renderLabel(t("Unit of Measurement Value"), unit?.uomValue)}
        </div>
      ))}

      <h2 className="bpa-summary-heading">{t("Accessories")}</h2>
      {accessories.length > 0 ? accessories.map((acc, index) => (
        <div key={index} className="bpa-summary-section">
          <div className="TL-item-index">#{index + 1}</div>
          {renderLabel(t("Accessory Category"), acc?.accessoryCategory ? t(`TRADELICENSE_ACCESSORIESCATEGORY_${acc.accessoryCategory.replace(/-/g, "_")}`) : null)}
          {renderLabel(t("UOM"), acc?.uom)}
          {renderLabel(t("UOM Value"), acc?.uomValue)}
          {renderLabel(t("Quantity"), acc?.count)}
        </div>
      )) : (
        <div className="bpa-summary-section">
          {renderLabel(t("Accessory Category"), null)}
          {renderLabel(t("UOM"), null)}
          {renderLabel(t("UOM Value"), null)}
          {renderLabel(t("Quantity"), null)}
        </div>
      )}

      <h2 className="bpa-summary-heading">{t("Property Address")}</h2>
      <div className="bpa-summary-section">
        {renderLabel(t("Property Id"), propertyId || "NA")}
        {renderLabel(t("City"), address?.city?.split(".")[1]?.toUpperCase() || address?.city ||"NA")}
        {renderLabel(t("Door/House No."), address?.doorNo)}
        {renderLabel(t("Building/Colony Name"), address?.buildingName || reduxAddress?.buildingName)}
        {renderLabel(t("Street Name"), address?.street)}
        {renderLabel(t("Mohalla"), address?.locality?.name)}
        {renderLabel(t("Pincode"), resolvedPincode)}
        {renderLabel(t("Electricity Connection No."), resolvedElectricityNo)}
      </div>

      <h2 className="bpa-summary-heading">{t("Owner Details")}</h2>
      {owners.map((owner, index) => (
        <div key={index} className="bpa-summary-section">
          <div className="TL-item-index">#{index + 1}</div>
          {renderLabel(t("Name"), owner?.name || tradeLicenseDetail?.institution?.name)}
          {renderLabel(t("Mobile No."), owner?.mobileNumber)}
          {renderLabel(t("Gender"), owner?.gender)}
          {renderLabel(t("Father/Husband's Name"), owner?.fatherOrHusbandName)}
          {renderLabel(t("Relationship"), owner?.relationship ? t(`COMMON_RELATION_${owner.relationship.toUpperCase()}`) : null)}
          {renderLabel(t("Type Of ownership"), ownershipCategory)}
          {renderLabel(t("Type of sub-ownership"), subOwnerShipCategoryValue)}
          {renderLabel(t("Email"), owner?.emailId)}
          {renderLabel(t("Correspondence Address"), owner?.permanentAddress)}
          {renderLabel(t("Birth Date"), formatDate(owner?.dob))}
          {renderLabel(t("Special Category"), owner?.ownerType)}
          {renderLabel(t("TL_OWNER_PAN_LABEL"), owner?.pan || "NA")}
        </div>
      ))}

      <h2 className="bpa-summary-heading">{t("Documents Uploaded")}</h2>
      <div className="bpa-summary-section">
        {Array.isArray(formData?.Documents?.documents?.documents) && formData.Documents.documents.documents.length > 0 ? (
          <TLDocument value={{ workflowDocs: formData.Documents.documents.documents }}></TLDocument>
        ) : (
          <div>{t("TL_NO_DOCUMENTS_MSG")}</div>
        )}
      </div>

      {/* <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
        <Controller
          name="termsAccepted"
          control={control}
          rules={{ required: t("PLEASE_ACCEPT_TERMS_CONDITIONS") }}
          render={(props) => (
            <input
              id="termsAccepted"
              type="checkbox"
              checked={props.value || false}
              onChange={(e) => {
                const checkStatus = { consentValue: e.target.checked };
                // onSelect("tradedetils", e.target.checked);
                onSelect(config.key, { ...formData[config.key], ...checkStatus });
                props.onChange(e.target.checked);

                setDeclare(e.target.checked);
              }}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
          )}
        />
        <label htmlFor="termsAccepted" style={{ cursor: "pointer", margin: 0 }}>
          {t("TL_DECLARATION_MESSAGE")}
        </label>
      </div> */}
      <div className="TL-declaration-row">
        <input
          id="termsAccepted"
          type="checkbox"
          checked={isChecked}
          onChange={(e) => {
            const checked = e.target.checked;
            setIsChecked(checked);
            // Save to window so Step 4 can access it
            window.declarationChecked = checked;
          }}
          className="TL-declaration-checkbox"
        />
        <label htmlFor="termsAccepted" className="TL-declaration-label">
          {t("TL_DECLARATION_MESSAGE")}
        </label>
      </div>
    </div>
  );
};

export default TLSummaryPage;
