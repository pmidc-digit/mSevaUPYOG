import React, { useState } from "react";

const AdhocRebatePenaltyModal = ({ t, licenseData, onClose, onSubmit, isUpdating }) => {
  const penaltyReasons = [
    { label: t("PT_PENDING_DUES_FROM_EARLIER") || "Pending dues from earlier", value: "Pending dues from earlier" },
    { label: t("PT_MISCALCULATION_DUES") || "Miscalculation of earlier assessment", value: "Miscalculation of earlier assessment" },
    { label: t("PT_ONE_TIME_PENALTY") || "One time Penalty", value: "One time Penalty" },
    { label: t("PROPERTYTAX_BILLING_SLAB_OTHERS") || "Others", value: "Others" },
  ];

  const rebateReasons = [
    { label: t("PT_REBATE_OPTION1") || "Advanced paid by citizen earlier", value: "Advanced paid by citizen earlier" },
    { label: t("PT_REBATE_OPTION2") || "Rebate provided by commissioner/EO", value: "Rebate provided by commissioner/EO" },
    { label: t("PT_REBATE_OPTION3") || "Additional amount charged from the citizen", value: "Additional amount charged from the citizen" },
    { label: t("PROPERTYTAX_BILLING_SLAB_OTHERS") || "Others", value: "Others" },
  ];

  // Pre-populate from existing license data
  const existingPenalty = licenseData?.tradeLicenseDetail?.adhocPenalty;
  const existingRebate = licenseData?.tradeLicenseDetail?.adhocExemption;
  const existingPenaltyReason = licenseData?.tradeLicenseDetail?.adhocPenaltyReason || "";
  const existingRebateReason = licenseData?.tradeLicenseDetail?.adhocExemptionReason || "";
  const existingPenaltyComments = licenseData?.tradeLicenseDetail?.additionalDetail?.penaltyComments || "";
  const existingRebateComments = licenseData?.tradeLicenseDetail?.additionalDetail?.rebateComments || "";

  const [penaltyAmount, setPenaltyAmount] = useState(
    existingPenalty ? String(Math.abs(Number(existingPenalty))) : ""
  );
  const [selectedPenaltyReason, setSelectedPenaltyReason] = useState(
    penaltyReasons.find((r) => r.value === existingPenaltyReason) || null
  );
  const [penaltyComments, setPenaltyComments] = useState(existingPenaltyComments);

  const [rebateAmount, setRebateAmount] = useState(
    existingRebate ? String(Math.abs(Number(existingRebate))) : ""
  );
  const [selectedRebateReason, setSelectedRebateReason] = useState(
    rebateReasons.find((r) => r.value === existingRebateReason) || null
  );
  const [rebateComments, setRebateComments] = useState(existingRebateComments);

  const handleAdd = () => {
    onSubmit({
      adhocPenalty: penaltyAmount ? String(penaltyAmount) : "0",
      adhocPenaltyReason: selectedPenaltyReason?.value || "",
      penaltyComments: penaltyComments,
      adhocExemption: rebateAmount ? -Math.abs(Number(rebateAmount)) : 0,
      adhocExemptionReason: selectedRebateReason?.value || "",
      rebateComments: rebateComments,
    });
  };

  return (
    <div className="TL-modal-overlay" onClick={onClose}>
      <div className="TL-modal-content-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="TL-modal-header-lg">
          <h3 className="TL-modal-title">Add Rebate/Penalty</h3>
          <span onClick={onClose} className="TL-modal-close">X</span>
        </div>

        {/* Adhoc Penalty Section */}
        <div className="TL-mb-20">
          <div className="TL-adhoc-section-title">Adhoc Penalty</div>
          <div className="TL-mb-10">
            <label className="TL-form-label">Penalty Amount *</label>
            <input
              type="number"
              min="0"
              value={penaltyAmount}
              onChange={(e) => setPenaltyAmount(e.target.value)}
              placeholder="Enter penalty amount"
              className="TL-form-input"
            />
          </div>
          <div className="TL-mb-10">
            <label className="TL-form-label">Reason for Penalty *</label>
            <select
              value={selectedPenaltyReason?.value || ""}
              onChange={(e) => {
                const found = penaltyReasons.find((r) => r.value === e.target.value);
                setSelectedPenaltyReason(found || null);
              }}
              className="TL-form-select"
            >
              <option value="">Select reason</option>
              {penaltyReasons.map((r, i) => (
                <option key={i} value={r.value}>{r.value}</option>
              ))}
            </select>
          </div>
          <div className="TL-mb-10">
            <label className="TL-form-label">Enter Comments</label>
            <textarea
              value={penaltyComments}
              onChange={(e) => setPenaltyComments(e.target.value)}
              placeholder="Enter comments for penalty"
              rows={2}
              className="TL-form-textarea"
            />
          </div>
        </div>

        {/* Divider */}
        <hr className="TL-adhoc-divider" />

        {/* Adhoc Rebate Section */}
        <div className="TL-mb-20">
          <div className="TL-adhoc-section-title">Adhoc Rebate</div>
          <div className="TL-mb-10">
            <label className="TL-form-label">Rebate Amount *</label>
            <input
              type="number"
              min="0"
              value={rebateAmount}
              onChange={(e) => setRebateAmount(e.target.value)}
              placeholder="Enter rebate amount"
              className="TL-form-input"
            />
          </div>
          <div className="TL-mb-10">
            <label className="TL-form-label">Reason for Rebate *</label>
            <select
              value={selectedRebateReason?.value || ""}
              onChange={(e) => {
                const found = rebateReasons.find((r) => r.value === e.target.value);
                setSelectedRebateReason(found || null);
              }}
              className="TL-form-select"
            >
              <option value="">Select reason</option>
              {rebateReasons.map((r, i) => (
                <option key={i} value={r.value}>{r.value}</option>
              ))}
            </select>
          </div>
          <div className="TL-mb-10">
            <label className="TL-form-label">Enter Comments</label>
            <textarea
              value={rebateComments}
              onChange={(e) => setRebateComments(e.target.value)}
              placeholder="Enter comments for rebate"
              rows={2}
              className="TL-form-textarea"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="TL-adhoc-actions">
          <button onClick={onClose} disabled={isUpdating} className="TL-btn-cancel">
            CANCEL
          </button>
          <button
            onClick={handleAdd}
            disabled={isUpdating}
            className={`TL-btn-submit${isUpdating ? " TL-btn-disabled" : ""}`}
          >
            {isUpdating ? "ADDING..." : "ADD"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdhocRebatePenaltyModal;
