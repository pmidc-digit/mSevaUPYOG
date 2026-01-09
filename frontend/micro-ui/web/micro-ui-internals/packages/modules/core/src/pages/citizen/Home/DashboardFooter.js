import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import React from "react";

const DashboardFooter = () => {
  const { t } = useTranslation();
  const history = useHistory();

  // Styles moved to Dashboarnew-dfooter.css

  const handleNavigation = (path) => {
    if (path) {
      history.push(path);
    }
  };

  return (
    <footer className="new-df-footer">
      <div className="new-df-container">
        <div className="new-df-grid">
          {/* About Section */}
          <div className="new-df-column">
            <h3 className="new-df-heading">About mSeva Punjab</h3>
            <p className="new-df-text">A digital initiative by the Government of Punjab to provide seamless access to citizen services.</p>
          </div>

          {/* Quick Links Section */}
          <div className="new-df-column">
            <h3 className="new-df-heading">Quick Links</h3>
            <a className="new-df-link" onClick={() => handleNavigation("/digit-ui/citizen/privacy-policy")}>
              Privacy Policy
            </a>
            <a className="new-df-link" onClick={() => handleNavigation("/digit-ui/citizen/terms-of-service")}>
              Terms of Service
            </a>
            <a className="new-df-link" onClick={() => handleNavigation("/digit-ui/citizen/faq")}>
              FAQ
            </a>
            <a className="new-df-link" onClick={() => handleNavigation("/digit-ui/citizen/contact-us")}>
              Contact Us
            </a>
          </div>

          {/* Contact Section */}
          <div className="new-df-column">
            <h3 className="new-df-heading">Contact</h3>
            <p className="new-df-text">
              <strong>Helpline:</strong> 01821-260114
            </p>
            <p className="new-df-text">
              <strong>Email:</strong> support@msevapunjab.gov.in
            </p>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="new-df-bottom">
          <p className="new-df-copyright">Powered by DIGIT | UPYOG License | Copyright © 2026</p>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
