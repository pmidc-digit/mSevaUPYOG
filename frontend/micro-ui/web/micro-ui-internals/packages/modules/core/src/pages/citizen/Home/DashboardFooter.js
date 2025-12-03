import { useTranslation } from "react-i18next"
import { useHistory } from "react-router-dom"
import React from "react"

const DashboardFooter = () => {
  const { t } = useTranslation()
  const history = useHistory()

  const footerStyles = {
    backgroundColor: "#1e293b",
    color: "#ffffff",
    padding: "48px 0 0 0",
    marginTop: "64px",
    width: "100%",
    borderRadius:"15px",
    marginBottom:"40px",
  }

  const footerContainerStyles = {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 40px",
  }

  const footerGridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "48px",
    paddingBottom: "40px",
  }

  const footerColumnStyles = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  }

  const footerHeadingStyles = {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#ffffff",
  }

  const footerTextStyles = {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#cbd5e1",
    margin: "0",
  }

  const footerLinkStyles = {
    fontSize: "14px",
    color: "#cbd5e1",
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 0.2s ease",
    display: "block",
    marginBottom: "8px",
  }

  const footerBottomStyles = {
    borderTop: "1px solid #334155",
    padding: "24px 0",
    textAlign: "center",
  }

  const copyrightStyles = {
    fontSize: "14px",
    color: "#94a3b8",
    margin: "0",
  }

  const handleNavigation = (path) => {
    if (path) {
      history.push(path)
    }
  }

  return (
    <footer style={footerStyles}>
      <div style={footerContainerStyles}>
        <div style={footerGridStyles}>
          {/* About Section */}
          <div style={footerColumnStyles}>
            <h3 style={footerHeadingStyles}>About mSeva Punjab</h3>
            <p style={footerTextStyles}>
              A digital initiative by the Government of Punjab to provide seamless access to citizen services.
            </p>
          </div>

          {/* Quick Links Section */}
          <div style={footerColumnStyles}>
            <h3 style={footerHeadingStyles}>Quick Links</h3>
            <a
              style={footerLinkStyles}
              onClick={() => handleNavigation("/digit-ui/citizen/privacy-policy")}
              onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.target.style.color = "#cbd5e1")}
            >
              Privacy Policy
            </a>
            <a
              style={footerLinkStyles}
              onClick={() => handleNavigation("/digit-ui/citizen/terms-of-service")}
              onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.target.style.color = "#cbd5e1")}
            >
              Terms of Service
            </a>
            <a
              style={footerLinkStyles}
              onClick={() => handleNavigation("/digit-ui/citizen/faq")}
              onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.target.style.color = "#cbd5e1")}
            >
              FAQ
            </a>
            <a
              style={footerLinkStyles}
              onClick={() => handleNavigation("/digit-ui/citizen/contact-us")}
              onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.target.style.color = "#cbd5e1")}
            >
              Contact Us
            </a>
          </div>

          {/* Contact Section */}
          <div style={footerColumnStyles}>
            <h3 style={footerHeadingStyles}>Contact</h3>
            <p style={footerTextStyles}>
              <strong>Helpline:</strong> 01821-260114
            </p>
            <p style={footerTextStyles}>
              <strong>Email:</strong> support@msevapunjab.gov.in
            </p>
          </div>
        </div>

        {/* Copyright Section */}
        <div style={footerBottomStyles}>
          <p style={copyrightStyles}>© 2025 mSeva Punjab. All rights reserved. | Powered by UPMCOG</p>
        </div>
      </div>
    </footer>
  )
}

export default DashboardFooter