import React from "react";

const Footer = () => {
  const partnerLogos = [
    { src: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/nic%20image.png", alt: "NIC" },
    { src: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/myGov%20image.png", alt: "MyGov" },
    { src: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/data%20gov%20image.png", alt: "Data Gov" },
    { src: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/digital%20india%20image.png", alt: "Digital India" },
    { src: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/gem%20image.png", alt: "GeM" },
    { src: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/india%20gov%20image.png", alt: "India Gov" },
    { src: "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/meity%20image.png", alt: "MeitY" },
  ];

  const quickLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Disclaimer", href: "#" },
    { label: "Help", href: "#" },
    { label: "Terms & Conditions", href: "#" },
  ];

  const importantLinks = [
    { label: "Accessibility Statement", href: "#" },
    { label: "Copyright Policy", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Site Map", href: "#" },
  ];

  const socialLinks = [
    { icon: "facebook", href: "https://www.facebook.com", label: "Facebook" },
    { icon: "twitter", href: "https://www.twitter.com", label: "Twitter" },
    { icon: "linkedin", href: "https://www.linkedin.com", label: "LinkedIn" },
    { icon: "youtube", href: "https://www.youtube.com", label: "YouTube" },
  ];

  const getSocialIcon = (type) => {
    switch (type) {
      case "facebook":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
          </svg>
        );
      case "twitter":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
          </svg>
        );
      case "linkedin":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        );
      case "youtube":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <footer className="landing-footer">
      {/* Partner Logos Section */}
      <div className="landing-footer-partners">
        <div className="landing-footer-partners-container">
          <h3 className="landing-footer-partners-title">Our Partners</h3>
          <div className="landing-footer-partners-grid">
            {partnerLogos.map((logo, index) => (
              <div key={index} className="landing-footer-partner-logo">
                <img src={logo.src} alt={logo.alt} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="landing-footer-main">
        <div className="landing-footer-container">
          <div className="landing-footer-grid">
            {/* Address Section */}
            <div className="landing-footer-section landing-footer-address">
              <h4 className="landing-footer-section-title">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                </svg>
                Punjab Municipal Bhawan
              </h4>
              <div className="landing-footer-address-content">
                <p>3, Dakshin Marg, 35A,</p>
                <p>Chandigarh, 160022</p>
                <p className="landing-footer-email">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  pgrs.lg@punjab.gov.in
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="landing-footer-section">
              <h4 className="landing-footer-section-title">Quick Links</h4>
              <ul className="landing-footer-links">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Links */}
            <div className="landing-footer-section">
              <h4 className="landing-footer-section-title">Important Links</h4>
              <ul className="landing-footer-links">
                {importantLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Media */}
            <div className="landing-footer-section landing-footer-social">
              <h4 className="landing-footer-section-title">Connect With Us</h4>
              <div className="landing-footer-social-icons">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`landing-footer-social-icon landing-footer-social-${social.icon}`}
                    aria-label={social.label}
                  >
                    {getSocialIcon(social.icon)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="landing-footer-bottom">
        <div className="landing-footer-container">
          {/* <div className="landing-footer-bottom-content">
            <span 
              className="landing-footer-powered"
              onClick={() => window.open("https://www.digit.org/", "_blank")}
            >
              Powered by DIGIT
            </span>
            <span className="landing-footer-divider">|</span>
            <a href="#" className="landing-footer-license">UPYOG License</a>
            <span className="landing-footer-divider">|</span>
            <span className="landing-footer-copyright">
              Copyright © {new Date().getFullYear()} - All Rights Reserved
            </span>
          </div> */}
          <div className="new-df-bottom">
            <p className="new-df-copyright">Powered by DIGIT | UPYOG License | Copyright © 2026</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
