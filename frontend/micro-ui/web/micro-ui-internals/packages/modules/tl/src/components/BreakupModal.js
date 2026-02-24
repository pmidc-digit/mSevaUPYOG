import React,{Fragment} from "react";

const BreakupModal = ({ breakupData, onClose }) => {
  if (!breakupData) return null;

  return (
    <div
      className="TL-modal-overlay"
      onClick={onClose}
    >
      <div
        className="TL-modal-content-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="TL-modal-header">
          <h3 className="TL-modal-title">Calculation Breakup</h3>
          <span onClick={onClose} className="TL-modal-close">X</span>
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
            <div className="TL-breakup-subtotal">
              <span>Total</span>
              <span>Rs {breakupData.tradeUnitTotal}</span>
            </div>
          </>
        )}

        {/* Accessory Unit Section */}
        {breakupData.accessoryBreakup?.length > 0 && (
          <>
            <div className="TL-breakup-section-title-mt">Accessory Unit</div>
            {breakupData.accessoryBreakup.map((item, index) => (
              <div key={index} className="TL-breakup-row">
                <span>{item.name}</span>
                <span>Rs {item.rate}</span>
              </div>
            ))}
            <div className="TL-breakup-subtotal">
              <span>Total</span>
              <span>Rs {breakupData.accessoryTotal}</span>
            </div>
          </>
        )}

        {/* Final Calculation */}
        <div className="TL-breakup-final-section">
          <div className="TL-breakup-row">
            <span>Trade Unit + Accessory Unit</span>
            <span>Rs {breakupData.tradeUnitTotal + breakupData.accessoryTotal}</span>
          </div>
          <div className="TL-breakup-row">
            <span>Validity (In Years)</span>
            <span>{breakupData.validityYears}</span>
          </div>
          <div className="TL-breakup-row-bold">
            <span>Final Amount</span>
            <span>Rs {breakupData.finalAmount}</span>
          </div>
        </div>

        {/* Rebate & Penalty */}
        <div className="TL-breakup-rebate-section">
          <div className="TL-breakup-row">
            <span>Renewal Rebate</span>
            <span>Rs {breakupData.rebate}</span>
          </div>
          <div className="TL-breakup-row">
            <span>Penalty</span>
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
  );
};

export default BreakupModal;
