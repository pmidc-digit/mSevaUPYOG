import React from "react";

export const GIGWFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="gigw-footer-container" role="contentinfo">
      {/* 1. Important Government Portals Carousel / Grid */}
      <section className="gigw-footer-links-section" aria-label="National and State Government Portals">
        <div className="gigw-footer-inner">
          <div className="gigw-portal-column">
            <h3 className="gigw-footer-col-title">Government of Punjab</h3>
            <ul className="gigw-footer-nav-list">
              <li><a href="https://punjab.gov.in" target="_blank" rel="noopener noreferrer">Official Punjab Portal</a></li>
              <li><a href="https://lgpunjab.gov.in" target="_blank" rel="noopener noreferrer">Department of Local Government</a></li>
              <li><a href="https://pmidc.punjab.gov.in" target="_blank" rel="noopener noreferrer">PMIDC Punjab</a></li>
              <li><a href="https://connect.punjab.gov.in" target="_blank" rel="noopener noreferrer">Sewa Kendra (Punjab)</a></li>
            </ul>
          </div>

          <div className="gigw-portal-column">
            <h3 className="gigw-footer-col-title">Key Municipal Services</h3>
            <ul className="gigw-footer-nav-list">
              <li><a href="/digit-ui/citizen/pt-home">Property Tax & Mutation</a></li>
              <li><a href="/digit-ui/citizen/tl-home">Trade License Services</a></li>
              <li><a href="/digit-ui/citizen/ws-home">Water & Sewerage Connection</a></li>
              <li><a href="/digit-ui/citizen/pgr-home">Public Grievance Redressal (1100)</a></li>
              <li><a href="/digit-ui/citizen/obps-home">Online Building Plan Approval (OBPS)</a></li>
            </ul>
          </div>

          <div className="gigw-portal-column">
            <h3 className="gigw-footer-col-title">Mandatory Website Policies</h3>
            <ul className="gigw-footer-nav-list">
              <li><a href="#accessibility-statement">Accessibility Statement</a></li>
              <li><a href="#privacy-policy">Privacy Policy</a></li>
              <li><a href="#hyperlink-policy">Hyperlinking Policy</a></li>
              <li><a href="#copyright-policy">Copyright Policy</a></li>
              <li><a href="#terms-conditions">Terms & Conditions</a></li>
            </ul>
          </div>

          <div className="gigw-portal-column">
            <h3 className="gigw-footer-col-title">National Initiatives</h3>
            <ul className="gigw-footer-nav-list">
              <li><a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer">National Portal of India</a></li>
              <li><a href="https://www.digitalindia.gov.in" target="_blank" rel="noopener noreferrer">Digital India</a></li>
              <li><a href="https://www.mygov.in" target="_blank" rel="noopener noreferrer">MyGov India</a></li>
              <li><a href="https://data.gov.in" target="_blank" rel="noopener noreferrer">Open Government Data (OGD)</a></li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Compliance Badges, Copyright & Last Updated */}
      <section className="gigw-footer-bottom-bar" aria-label="Copyright and Compliance Information">
        <div className="gigw-bottom-inner">
          <div className="gigw-compliance-badges">
            <div className="compliance-pill" title="Certified Compliant with GIGW 3.0 Guidelines">
              <span className="badge-check">✓</span> GIGW 3.0 Compliant
            </div>
            <div className="compliance-pill" title="World Wide Web Consortium (W3C) Web Content Accessibility Guidelines 2.1 Level AA">
              <span className="badge-check">✓</span> W3C WCAG 2.1 Level AA
            </div>
            <div className="compliance-pill" title="Bureau of Indian Standards IS 17802">
              <span className="badge-check">✓</span> BIS IS 17802 Certified
            </div>
          </div>

          <div className="gigw-copyright-text">
            <p>
              Contents of this website are owned, updated and maintained by the{" "}
              <strong>Department of Local Government, Government of Punjab</strong>.
            </p>
            <p className="gigw-tech-credit">
              Designed & Developed on the <strong>DIGIT / UPYOG Urban Governance Stack</strong>.
            </p>
          </div>

          <div className="gigw-meta-info">
            <span className="gigw-last-updated">Last Updated: 21-Oct-2026</span>
            <span className="gigw-year">© {currentYear} Government of Punjab. All rights reserved.</span>
          </div>
        </div>
      </section>
    </footer>
  );
};
