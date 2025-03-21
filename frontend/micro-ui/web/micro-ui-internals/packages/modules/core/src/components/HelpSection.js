import React from 'react';


const HelpSection = () => {
  return (
    <div className="help-section">
      {/* <div className="image" ><img src={CallIcon} alt="Call Icon" /></div> */}
      <h2 className="help-section-header">
        Need Help? We're Just a Click Away
      </h2>
      <div className="help-section-button-container">
        <button className="help-section-button">
          <div className="help-section-icon">
            <img
              src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/Telegram.png"
              alt="call"
            />
          </div>
          <div className="help-section-text-container">
            <span className="help-section-medium">Toll Free</span>
            <span className="help-section-contact-no">1800 1800 0712</span>
          </div>
        </button>
        <button className="help-section-button">
          <div className="help-section-icon">
            <img
              src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/WhatsApp%20Icon.png"
              alt="call"
            />
          </div>
          <div className="help-section-text-container">
            <span className="help-section-medium">Whatsapp</span>
            <span className="help-section-contact-no">897654509</span>
          </div>
        </button>
        <button className="help-section-button">
          <div className="help-section-icon">
            <img
              src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/Message%20Icon.png"
              alt="call"
            />
          </div>
          <div className="help-section-text-container">
            <span className="help-section-medium">Online Payment Issues</span>
            <span className="help-section-contact-no">egov123@gmail.com</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default HelpSection;