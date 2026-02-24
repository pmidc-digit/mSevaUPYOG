import React, { useState, useEffect, Fragment } from "react";
import { useSelector } from "react-redux";
import { CardLabel } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import TLDocument from "./TLDocumets";

const TLSummaryPage = ({ config, formData: propsFormData, onSelect }) => {
  const { t } = useTranslation();
  
  // Get formData directly from Redux to prevent data loss
  const reduxFormData = useSelector((state) => state.tl.tlNewApplicationForm.formData);
  const formData = reduxFormData || propsFormData || {};
  
  const createdResponse = formData?.CreatedResponse || formData?.EditPayload || {};
  const { tradeLicenseDetail = {}, calculation = {}, status, applicationType, licenseType, tradeName, commencementDate, subOwnerShipCategory, propertyId} = createdResponse;
  const [isChecked, setIsChecked] = useState(false);
  const [showBreakupModal, setShowBreakupModal] = useState(false);
  const [breakupData, setBreakupData] = useState(null);
  const [breakupLoading, setBreakupLoading] = useState(false);

  const owners = tradeLicenseDetail?.owners || [];
  const tradeUnits = tradeLicenseDetail?.tradeUnits || [];
  const accessories = tradeLicenseDetail?.accessories || [];
  const address = tradeLicenseDetail?.address || {};
  const taxHeads = calculation?.taxHeadEstimates || [];

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const consumerCode = createdResponse?.applicationNumber;

  // State to hold bill amounts fetched from billing API (for edit path where calculation is empty)
  const [billAmounts, setBillAmounts] = useState(null);

  const getTaxAmount = (category) => {
    // First try from calculation.taxHeadEstimates (normal renewal path)
    const fromCalc = taxHeads.find((item) => item.category === category)?.estimateAmount;
    if (fromCalc !== undefined && fromCalc !== null) return fromCalc;
    // Fallback to bill amounts fetched from billing API (edit path)
    if (billAmounts) {
      if (category === "TAX") return billAmounts.tlTax || 0;
      if (category === "REBATE") return billAmounts.rebate || 0;
      if (category === "PENALTY") return billAmounts.penalty || 0;
    }
    return 0;
  };

  // Fetch bill amounts when calculation data is missing (edit/INITIATED path)
  useEffect(() => {
    if (taxHeads.length === 0 && consumerCode && !billAmounts) {
      (async () => {
        try {
          const fetchBillRes = await Digit.TLService.fetch_bill({ tenantId, filters: { consumerCode, businessService: "TL" } });
          const bill = fetchBillRes?.Bill?.[0];
          const billAccountDetails = bill?.billDetails?.[0]?.billAccountDetails || [];
          const tlTax = billAccountDetails.find((a) => a.taxHeadCode === "TL_TAX")?.amount || 0;
          const rebate = billAccountDetails.find((a) => a.taxHeadCode === "TL_RENEWAL_REBATE")?.amount || 0;
          const penalty = billAccountDetails.find((a) => a.taxHeadCode === "TL_RENEWAL_PENALTY")?.amount || 0;
          const totalAmount = bill?.totalAmount || tlTax;
          setBillAmounts({ tlTax, rebate, penalty, totalAmount });
        } catch (e) {
          console.error("Error fetching bill amounts for summary:", e);
        }
      })();
    }
  }, [consumerCode]);

  const fetchBreakupData = async () => {
    if (!consumerCode || breakupData) {
      setShowBreakupModal(true);
      return;
    }
    setBreakupLoading(true);
    try {
      // Step 1: Fetch bill from billing-service
      const fetchBillRes = await Digit.TLService.fetch_bill({ tenantId, filters: { consumerCode, businessService: "TL" } });
      const bill = fetchBillRes?.Bill?.[0];
      const billAccountDetails = bill?.billDetails?.[0]?.billAccountDetails || [];

      // Step 2: Fetch TL calculator bill to get billingSlabIds
      const getbillRes = await Digit.TLService.getbill({ tenantId, filters: { consumerCode, businessService: "TL" } });
      const billingSlabIds = getbillRes?.billingSlabIds || {};
      const tradeSlabEntries = billingSlabIds?.tradeTypeBillingSlabIds || [];
      const accessorySlabEntries = billingSlabIds?.accesssoryBillingSlabIds || [];

      // Collect all slab IDs (format: "slabId|value|someId")
      const allSlabIds = [...tradeSlabEntries, ...accessorySlabEntries]
        .map((entry) => entry?.split("|")?.[0])
        .filter(Boolean);

      // Step 3: Fetch billing slabs
      let slabs = [];
      if (allSlabIds.length > 0) {
        const slabRes = await Digit.TLService.billingslab({ tenantId, filters: { ids: allSlabIds.join(",") } });
        slabs = slabRes?.billingSlab || [];
      }

      // Build trade unit breakup
      const tradeUnitBreakup = tradeSlabEntries.map((entry) => {
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

      // Build accessory breakup
      const accessoryBreakup = accessorySlabEntries.map((entry) => {
        const parts = entry?.split("|") || [];
        const slabId = parts[0];
        const slab = slabs.find((s) => s.id === slabId);
        const catFormatted = slab?.accessoryCategory?.replace(/\./g, "_")?.replace(/-/g, "_");
        return {
          name: t(`TRADELICENSE_ACCESSORIESCATEGORY_${catFormatted}`) || slab?.accessoryCategory || "Accessory",
          rate: slab?.rate || 0,
        };
      });

      const tradeUnitTotal = tradeUnitBreakup.reduce((sum, item) => sum + item.rate, 0);
      const accessoryTotal = accessoryBreakup.reduce((sum, item) => sum + item.rate, 0);
      const validityYears = tradeLicenseDetail?.additionalDetail?.validityYears || 1;

      // Get tax head amounts from bill
      const tlTax = billAccountDetails.find((a) => a.taxHeadCode === "TL_TAX")?.amount || 0;
      const rebate = billAccountDetails.find((a) => a.taxHeadCode === "TL_RENEWAL_REBATE")?.amount || 0;
      const penalty = billAccountDetails.find((a) => a.taxHeadCode === "TL_RENEWAL_PENALTY")?.amount || 0;
      const totalAmount = bill?.totalAmount || tlTax;

      setBreakupData({
        tradeUnitBreakup,
        accessoryBreakup,
        tradeUnitTotal,
        accessoryTotal,
        validityYears,
        tlTax,
        rebate,
        penalty,
        totalAmount,
        finalAmount: totalAmount,
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
    return (
      <div className="bpa-summary-label-field-pair">
        <CardLabel className="bpa-summary-bold-label" style={{width: "auto"}}>{label}</CardLabel>
        <div>{displayValue || "NA"}</div>
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
        {renderLabel(t("Total Amount"), `Rs ${billAmounts?.totalAmount || getTaxAmount("TAX")}`)}
        {renderLabel(t("Payment Status"), status || "NA")}
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

            {/* Rebate & Penalty */}
            <div className="TL-breakup-light-section">
              <div className="TL-breakup-row">
                <span>Rebate</span>
                <span>Rs {breakupData.rebate}</span>
              </div>
              <div className="TL-breakup-row">
                <span>Renewal Penalty</span>
                <span>Rs {breakupData.penalty}</span>
              </div>
            </div>

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
        {renderLabel(t("Structure Type"), tradeLicenseDetail?.structureType?.split(".")[0])}
        {renderLabel(t("Structure Sub Type"), tradeLicenseDetail?.structureType?.split(".")[1])}
        {renderLabel(t("Trade Commencement Date"), formatDate(commencementDate))}
        {renderLabel(t("Trade GST No."), tradeLicenseDetail?.gstNo)}
        {renderLabel(t("Operational Area (Sq Ft)"), tradeLicenseDetail?.operationalArea)}
        {renderLabel(t("No. Of Employees"), tradeLicenseDetail?.noOfEmployees)}
        {renderLabel(t("Old Receipt No."), tradeLicenseDetail?.oldLicenseNumber)}
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
          {renderLabel(t("Accessory Category"), acc?.accessoryCategory)}
          {renderLabel(t("UOM"), acc?.uom)}
          {renderLabel(t("Quantity"), acc?.uomValue)}
        </div>
      )) : (
        <div className="bpa-summary-section">
          {renderLabel(t("Accessory Category"), null)}
          {renderLabel(t("UOM"), null)}
          {renderLabel(t("Quantity"), null)}
        </div>
      )}

      <h2 className="bpa-summary-heading">{t("Property Address")}</h2>
      <div className="bpa-summary-section">
        {renderLabel(t("Property Id"), propertyId || "NA")}
        {renderLabel(t("City"), address?.city?.split(".")[1]?.toUpperCase() || "NA")}
        {renderLabel(t("Door/House No."), address?.doorNo)}
        {renderLabel(t("Building/Colony Name"), address?.buildingName)}
        {renderLabel(t("Street Name"), address?.street)}
        {renderLabel(t("Mohalla"), address?.locality?.name)}
        {renderLabel(t("Pincode"), address?.pincode)}
        {renderLabel(t("Electricity Connection No."), address?.electricityNo)}
      </div>

      <h2 className="bpa-summary-heading">{t("Owner Details")}</h2>
      {owners.map((owner, index) => (
        <div key={index} className="bpa-summary-section">
          <div className="TL-item-index">#{index + 1}</div>
          {renderLabel(t("Name"), owner?.name)}
          {renderLabel(t("Mobile No."), owner?.mobileNumber)}
          {renderLabel(t("Gender"), owner?.gender)}
          {renderLabel(t("Father/Husband's Name"), owner?.fatherOrHusbandName)}
          {renderLabel(t("Relationship"), owner?.relationship)}
          {renderLabel(t("Type Of ownership"), ownershipCategory)}
          {renderLabel(t("Type of sub-ownership"), subOwnerShipCategoryValue)}
          {renderLabel(t("Email"), owner?.emailId)}
          {renderLabel(t("Correspondence Address"), owner?.permanentAddress)}
          {renderLabel(t("Birth Date"), formatDate(owner?.dob))}
          {renderLabel(t("Special Category"), owner?.ownerType)}
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
