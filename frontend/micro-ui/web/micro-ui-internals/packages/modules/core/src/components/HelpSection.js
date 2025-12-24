import React from 'react';

const HelpSection = () => {
  const contactOptions = [
    {
      icon: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/Telegram.png",
      label: "Toll Free",
      value: "1800 1800 0712",
      color: "#3b82f6",
      bgColor: "#dbeafe"
    },
    {
      icon: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/WhatsApp%20Icon.png",
      label: "WhatsApp",
      value: "897654509",
      color: "#22c55e",
      bgColor: "#dcfce7"
    },
    {
      icon: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/Message%20Icon.png",
      label: "Online Payment Issues",
      value: "egov123@gmail.com",
      color: "#8b5cf6",
      bgColor: "#ede9fe"
    }
  ];

  return (
    <section className="landing-help-section">
      <div className="landing-help-container">
        <div className="landing-help-content">
          <div className="landing-help-text">
            <span className="landing-help-badge">24/7 Support</span>
            <h2 className="landing-help-title">Need Help? We're Just a Click Away</h2>
            <p className="landing-help-subtitle">Our dedicated support team is available round the clock to assist you with any queries or issues.</p>
          </div>
          
          <div className="landing-help-cards">
            {contactOptions.map((option, index) => (
              <div key={index} className="landing-help-card" style={{'--card-color': option.color, '--card-bg': option.bgColor}}>
                <div className="landing-help-card-icon">
                  <img src={option.icon} alt={option.label} />
                </div>
                <div className="landing-help-card-content">
                  <span className="landing-help-card-label">{option.label}</span>
                  <span className="landing-help-card-value">{option.value}</span>
                </div>
                <div className="landing-help-card-arrow">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpSection;