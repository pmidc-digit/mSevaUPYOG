import React, { useState } from "react";

export const GIGWHeader = () => {
  const [fontSizeLevel, setFontSizeLevel] = useState(0); // -1: small, 0: standard, 1: large
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScreenReaderModal, setShowScreenReaderModal] = useState(false);

  // Apply font size adjustment to document root
  const handleFontSizeChange = (level) => {
    setFontSizeLevel(level);
    const root = document.documentElement;
    if (level === -1) {
      root.style.fontSize = "90%";
    } else if (level === 1) {
      root.style.fontSize = "112%";
    } else {
      root.style.fontSize = "100%";
    }
  };

  // Toggle high contrast theme
  const handleContrastToggle = () => {
    const nextContrast = !isHighContrast;
    setIsHighContrast(nextContrast);
    if (nextContrast) {
      document.body.classList.add("high-contrast-mode");
      document.documentElement.classList.add("high-contrast-mode");
    } else {
      document.body.classList.remove("high-contrast-mode");
      document.documentElement.classList.remove("high-contrast-mode");
    }
  };

  // Language selector handler
  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    document.documentElement.setAttribute("lang", langCode);
    if (window.Digit && window.Digit.LocalizationService) {
      window.Digit.LocalizationService.changeLanguage(
        langCode === "pa" ? "pn_IN" : langCode === "hi" ? "hi_IN" : "en_IN",
        "pb"
      );
    }
  };

  // Universal search handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toLowerCase();
    if (query.includes("property") || query.includes("tax") || query.includes("pt")) {
      window.location.href = "/digit-ui/citizen/pt-home";
    } else if (query.includes("trade") || query.includes("license") || query.includes("tl")) {
      window.location.href = "/digit-ui/citizen/tl-home";
    } else if (query.includes("water") || query.includes("sewerage") || query.includes("ws")) {
      window.location.href = "/digit-ui/citizen/ws-home";
    } else if (query.includes("complaint") || query.includes("grievance") || query.includes("pgr")) {
      window.location.href = "/digit-ui/citizen/pgr-home";
    } else if (query.includes("building") || query.includes("plan") || query.includes("bpa") || query.includes("obps")) {
      window.location.href = "/digit-ui/citizen/obps-home";
    } else {
      window.location.href = "/digit-ui/citizen";
    }
  };

  return (
    <header className="gigw-header-container" role="banner">
      {/* 1. GIGW 3.0 Top Accessibility Utility Bar */}
      <section className="gigw-top-utility-bar" aria-label="Accessibility and Language Toolbar">
        <div className="gigw-utility-inner">
          {/* Left: Government of Punjab / India Flag badge */}
          <div className="gigw-govt-identity">
            <span className="gigw-tricolour-strip" aria-hidden="true"></span>
            <span className="gigw-govt-text">
              <strong lang="pa">ਪੰਜਾਬ ਸਰਕਾਰ</strong> | Government of Punjab
            </span>
          </div>

          {/* Right: Accessibility Controls & Language Toggle */}
          <div className="gigw-accessibility-toolbar" role="toolbar" aria-label="Screen reader and display controls">
            <a href="#main-portal-content" className="gigw-quick-skip-link">
              Skip to Main Content
            </a>

            {/* Font Resizing Controls */}
            <div className="gigw-font-controls" role="group" aria-label="Text Size Adjustment">
              <button
                type="button"
                className={`gigw-tool-btn ${fontSizeLevel === -1 ? "active" : ""}`}
                onClick={() => handleFontSizeChange(-1)}
                title="Decrease font size (A-)"
                aria-label="Decrease text size"
              >
                A-
              </button>
              <button
                type="button"
                className={`gigw-tool-btn ${fontSizeLevel === 0 ? "active" : ""}`}
                onClick={() => handleFontSizeChange(0)}
                title="Reset normal font size (A)"
                aria-label="Reset normal text size"
              >
                A
              </button>
              <button
                type="button"
                className={`gigw-tool-btn ${fontSizeLevel === 1 ? "active" : ""}`}
                onClick={() => handleFontSizeChange(1)}
                title="Increase font size (A+)"
                aria-label="Increase text size"
              >
                A+
              </button>
            </div>

            {/* High Contrast Mode Toggle */}
            <button
              type="button"
              className={`gigw-contrast-btn ${isHighContrast ? "active" : ""}`}
              onClick={handleContrastToggle}
              title="Toggle High Contrast Mode"
              aria-label="High contrast color mode toggle"
              aria-pressed={isHighContrast}
            >
              <span className="contrast-icon" aria-hidden="true">◐</span>
              <span>{isHighContrast ? "Normal Contrast" : "High Contrast"}</span>
            </button>

            {/* Screen Reader Access link */}
            <button
              type="button"
              className="gigw-screen-reader-btn"
              onClick={() => setShowScreenReaderModal(true)}
              title="Screen Reader Information"
              aria-label="Screen reader access information"
            >
              <span aria-hidden="true">♿</span> Screen Reader
            </button>

            {/* Language Switcher */}
            <div className="gigw-language-selector" role="group" aria-label="Language selection">
              <button
                type="button"
                className={`gigw-lang-btn ${currentLang === "en" ? "active" : ""}`}
                onClick={() => handleLanguageChange("en")}
                aria-label="Switch to English language"
              >
                English
              </button>
              <span className="lang-sep" aria-hidden="true">|</span>
              <button
                type="button"
                className={`gigw-lang-btn ${currentLang === "pa" ? "active" : ""}`}
                onClick={() => handleLanguageChange("pa")}
                aria-label="ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲੋ"
                lang="pa"
              >
                ਪੰਜਾਬੀ
              </button>
              <span className="lang-sep" aria-hidden="true">|</span>
              <button
                type="button"
                className={`gigw-lang-btn ${currentLang === "hi" ? "active" : ""}`}
                onClick={() => handleLanguageChange("hi")}
                aria-label="हिन्दी में बदलें"
                lang="hi"
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Brand Header with State Crest & Universal Search */}
      <section className="gigw-main-header">
        <div className="gigw-header-inner">
          {/* Logo & Department Branding */}
          <div className="gigw-brand-wrapper">
            {/* Slider Menu Trigger (Hamburger Button) */}
            <button
              type="button"
              className="gigw-sidebar-hamburger-btn"
              onClick={() => {
                if (window.toggleMsevaSidebar) {
                  window.toggleMsevaSidebar();
                } else {
                  window.dispatchEvent(new CustomEvent("mseva:toggle-sidebar"));
                }
              }}
              onMouseEnter={() => {
                window.dispatchEvent(new CustomEvent("mseva:toggle-sidebar", { detail: { open: true } }));
              }}
              title="Open Navigation Menu (or move cursor to left edge)"
              aria-label="Toggle Navigation Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            {/* mSeva Colorful Brand Logo (Moved up from redundant sub-bar) */}
            <a href="/digit-ui/citizen" className="gigw-mseva-logo-link" title="mSeva Punjab">
              <img
                src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/download.png"
                alt="mSeva Logo"
                className="gigw-mseva-logo-img"
              />
              <span className="gigw-mseva-logo-text">mSeva</span>
            </a>

            <div className="gigw-brand-divider" aria-hidden="true" />

            <a href="/digit-ui/citizen" className="gigw-brand-link" title="mSeva Punjab Citizen Portal">
              <div className="gigw-emblem-badge" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="22" stroke="#1F5188" strokeWidth="2" fill="#F0F7FF" />
                  <path d="M24 8L36 15V24C36 31.5 24 39 24 39C24 39 12 31.5 12 24V15L24 8Z" fill="#1F5188" />
                  <path d="M24 12L32 17V24C32 29 24 34.5 24 34.5C24 34.5 16 29 16 24V17L24 12Z" fill="#D97706" />
                  <circle cx="24" cy="23" r="4" fill="#FFFFFF" />
                </svg>
              </div>
              <div className="gigw-title-block">
                <span className="gigw-dept-name" lang="pa">ਸਥਾਨਕ ਸਰਕਾਰ ਵਿਭਾਗ, ਪੰਜਾਬ ਸਰਕਾਰ</span>
                <h1 className="gigw-portal-heading">
                  mSeva Punjab
                  <span className="gigw-portal-tag">Urban Governance Portal</span>
                </h1>
                <span className="gigw-sub-dept">Department of Local Government, Government of Punjab</span>
              </div>
            </a>
          </div>

          {/* Universal GIGW 3.0 Search Bar */}
          <div className="gigw-search-wrapper" role="search">
            <form onSubmit={handleSearchSubmit} className="gigw-search-form">
              <label htmlFor="gigw-universal-search" className="sr-only">
                Search municipal citizen services across Punjab
              </label>
              <input
                id="gigw-universal-search"
                type="search"
                className="gigw-search-input"
                placeholder="Search Property Tax, Trade License, Water, NOCs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" className="gigw-search-submit" aria-label="Submit search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Quick Helplines & Emergency Support Badge */}
          <div className="gigw-helpline-badge">
            <div className="helpline-icon" aria-hidden="true">📞</div>
            <div className="helpline-info">
              <span className="helpline-label">Toll-Free Helpline</span>
              <a href="tel:1100" className="helpline-number" aria-label="Dial 1100 for Citizen Helpline">
                1100 / 1800-1800-0172
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Screen Reader Modal */}
      {showScreenReaderModal && (
        <div className="gigw-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="sr-modal-title">
          <div className="gigw-modal-card">
            <h2 id="sr-modal-title">Screen Reader Access Information</h2>
            <p>
              The mSeva Punjab Portal complies with World Wide Web Consortium (W3C) Web Content Accessibility
              Guidelines (WCAG) 2.1 Level AA and GIGW 3.0 (IS 17802).
            </p>
            <table className="gigw-modal-table">
              <thead>
                <tr>
                  <th>Screen Reader</th>
                  <th>Website / Source</th>
                  <th>Free / Commercial</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>NVDA</strong></td>
                  <td><a href="https://www.nvaccess.org/" target="_blank" rel="noopener noreferrer">www.nvaccess.org</a></td>
                  <td>Free (Open Source)</td>
                </tr>
                <tr>
                  <td><strong>JAWS</strong></td>
                  <td><a href="https://www.freedomscientific.com/" target="_blank" rel="noopener noreferrer">Freedom Scientific</a></td>
                  <td>Commercial</td>
                </tr>
                <tr>
                  <td><strong>VoiceOver</strong></td>
                  <td>Built into Apple iOS & macOS</td>
                  <td>Built-in</td>
                </tr>
                <tr>
                  <td><strong>TalkBack</strong></td>
                  <td>Built into Android OS</td>
                  <td>Built-in</td>
                </tr>
              </tbody>
            </table>
            <button
              type="button"
              className="gigw-modal-close-btn"
              onClick={() => setShowScreenReaderModal(false)}
            >
              Close Dialog
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
