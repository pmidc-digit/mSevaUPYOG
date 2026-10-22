import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const GIGWHeader = ({ t: propT, stateInfo: propStateInfo, userDetails: propUserDetails }) => {
  const { t: hookT } = useTranslation();
  const t = propT || hookT || ((key) => key);
  const history = useHistory();
  const location = useLocation();

  // Font size scale state: '90%', '100%', '112%'
  const [fontScale, setFontScale] = useState(() => {
    try {
      return localStorage.getItem("mseva-font-scale") || "100%";
    } catch (e) {
      return "100%";
    }
  });

  // High contrast mode state
  const [highContrast, setHighContrast] = useState(() => {
    try {
      return localStorage.getItem("mseva-contrast-mode") === "high";
    } catch (e) {
      return false;
    }
  });

  // Screen Reader modal
  const [showScreenReaderModal, setShowScreenReaderModal] = useState(false);

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

  // Store data & user info
  const userDetails = propUserDetails || Digit?.UserService?.getUser?.();
  const isLoggedIn = !!userDetails?.access_token;
  const userInfo = userDetails?.info;
  const userName = userInfo?.name || (isLoggedIn ? "Binit Rana" : "");

  // Active language
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      return Digit?.StoreData?.getCurrentLanguage?.() || localStorage.getItem("locale") || "en_IN";
    } catch (e) {
      return "en_IN";
    }
  });

  // Apply font scale to document
  const applyFontScale = (scale) => {
    setFontScale(scale);
    try {
      document.documentElement.style.fontSize = scale;
      localStorage.setItem("mseva-font-scale", scale);
    } catch (e) {}
  };

  // Apply high contrast mode to body & html
  const toggleHighContrast = () => {
    const nextMode = !highContrast;
    setHighContrast(nextMode);
    try {
      if (nextMode) {
        document.documentElement.classList.add("high-contrast-mode");
        document.body.classList.add("high-contrast-mode");
        localStorage.setItem("mseva-contrast-mode", "high");
      } else {
        document.documentElement.classList.remove("high-contrast-mode");
        document.body.classList.remove("high-contrast-mode");
        localStorage.setItem("mseva-contrast-mode", "normal");
      }
    } catch (e) {}
  };

  // Restore saved accessibility preferences on mount
  useEffect(() => {
    try {
      const savedScale = localStorage.getItem("mseva-font-scale");
      if (savedScale) {
        document.documentElement.style.fontSize = savedScale;
      }
      const savedContrast = localStorage.getItem("mseva-contrast-mode");
      if (savedContrast === "high") {
        document.documentElement.classList.add("high-contrast-mode");
        document.body.classList.add("high-contrast-mode");
      }
    } catch (e) {}
  }, []);


  // Load Bhashini Translation Plugin and ensure container attachment
  useEffect(() => {
    const scriptSrc = "https://translation-plugin.bhashini.co.in/v3/website_translation_utility.js";
    let scriptTag = document.querySelector('script[src*="website_translation_utility.js"]');
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.src = scriptSrc;
      scriptTag.async = true;
      document.body.appendChild(scriptTag);
    }

    const relocateWidget = () => {
      const container = document.querySelector(".bhashini-plugin-container");
      const wrapper = document.getElementById("bhashini-translation");
      if (container && wrapper && !container.contains(wrapper)) {
        container.appendChild(wrapper);
      }
    };

    relocateWidget();
    const t1 = setTimeout(relocateWidget, 300);
    const t2 = setTimeout(relocateWidget, 1000);
    const t3 = setTimeout(relocateWidget, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Language switcher handler
  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    const stateId = Digit?.ULBService?.getStateId?.() || "pb";
    if (Digit?.LocalizationService?.changeLanguage) {
      Digit.LocalizationService.changeLanguage(langCode, stateId);
    }
  };

  // Trigger slider sidebar
  const handleHamburgerClick = () => {
    window.dispatchEvent(new CustomEvent("toggle-mseva-sidebar"));
  };

  const handleHamburgerHover = () => {
    window.dispatchEvent(new CustomEvent("open-mseva-sidebar"));
  };

  // Search submission
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Dispatch custom search event for dashboard or redirect
    window.dispatchEvent(new CustomEvent("mseva-global-search", { detail: { query } }));
    if (location.pathname !== "/digit-ui/citizen") {
      history.push(`/digit-ui/citizen?search=${encodeURIComponent(query)}`);
    } else {
      const searchInput = document.getElementById("mseva-service-search");
      if (searchInput) {
        searchInput.value = query;
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        searchInput.focus();
      }
    }
  };

  // Skip to main content handler
  const handleSkipToMain = (e) => {
    e.preventDefault();
    const mainContent = document.getElementById("main-portal-content") || document.querySelector("main") || document.querySelector(".main");
    if (mainContent) {
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="mseva-gigw-global-header" role="banner">
      {/* 1. ACCESSIBILITY UTILITY BAR (TOP) */}
      <div className="mseva-accessibility-bar" aria-label="Accessibility and Language Bar">
        <div className="mseva-acc-container">
          {/* Left: Skip to Main & Screen Reader shortcut */}
          <div className="mseva-acc-left">
            <a
              href="#main-portal-content"
              onClick={handleSkipToMain}
              className="mseva-skip-link"
              title="Skip to Main Content (Alt + M)"
            >
              Skip to Main Content
            </a>
            <span className="mseva-acc-divider" aria-hidden="true">|</span>
            <button
              type="button"
              className="mseva-acc-btn mseva-screen-reader-btn"
              onClick={() => setShowScreenReaderModal(true)}
              title="Screen Reader Access information"
              aria-haspopup="dialog"
            >
              <span aria-hidden="true">♿</span> Screen Reader Access
            </button>
          </div>

          {/* Right: Font Resizer, Contrast, Language */}
          <div className="mseva-acc-right">
            {/* Font Size Adjusters */}
            <div className="mseva-font-resizer" role="group" aria-label="Font Size Adjuster">
              <span className="mseva-acc-label">Text Size:</span>
              <button
                type="button"
                className={`mseva-font-btn ${fontScale === "90%" ? "active" : ""}`}
                onClick={() => applyFontScale("90%")}
                title="Decrease Text Size (90%)"
                aria-pressed={fontScale === "90%"}
              >
                A-
              </button>
              <button
                type="button"
                className={`mseva-font-btn ${fontScale === "100%" ? "active" : ""}`}
                onClick={() => applyFontScale("100%")}
                title="Default Text Size (100%)"
                aria-pressed={fontScale === "100%"}
              >
                A
              </button>
              <button
                type="button"
                className={`mseva-font-btn ${fontScale === "112%" ? "active" : ""}`}
                onClick={() => applyFontScale("112%")}
                title="Increase Text Size (112%)"
                aria-pressed={fontScale === "112%"}
              >
                A+
              </button>
            </div>

            <span className="mseva-acc-divider" aria-hidden="true">|</span>

            {/* Bhashini Language Translation Widget (In Between) */}
            <div className="mseva-bhashini-container" title="Language Translation (Bhashini)">
              <div className="bhashini-plugin-container"></div>
            </div>

            <span className="mseva-acc-divider" aria-hidden="true">|</span>

            {/* High Contrast Mode Toggle */}
            <button
              type="button"
              className={`mseva-acc-btn mseva-contrast-btn ${highContrast ? "active" : ""}`}
              onClick={toggleHighContrast}
              title={highContrast ? "Switch to Normal View" : "Switch to High Contrast View"}
              aria-pressed={highContrast}
            >
              <span className="mseva-contrast-icon" aria-hidden="true">◐</span>
              <span>{highContrast ? "Normal" : "High Contrast"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. INTEGRATED BRANDING & NAVIGATION HEADER (MIDDLE) */}
      <div className="mseva-main-header">
        <div className="mseva-header-container">
          {/* Left: Hamburger ☰ + mSeva Logo + Punjab Crest + Titles */}
          <div className="mseva-header-left">
            {/* mSeva Official Brand Logo from Existing Resources */}
            <a
              href="/digit-ui/citizen"
              className="mseva-brand-logo-link"
              title="mSeva Punjab - Department of Local Government"
              onClick={(e) => {
                e.preventDefault();
                history.push("/digit-ui/citizen");
              }}
            >
              <img
                src="/digit-ui/mseva-punjab-logo-cropped.jpeg"
                alt="mSeva Punjab - PMIDC | Punjab Local Government"
                className="mseva-primary-logo"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/digit-ui/mseva-punjab-logo.jpeg";
                }}
              />
            </a>

            <div className="mseva-crest-divider" />

            {/* Punjab Government Shield / State Crest */}
            <div className="mseva-crest-wrapper">
              <img
                src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/pmidc%20logo.png"
                alt="Government of Punjab Crest"
                className="mseva-crest-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/digit-ui/mseva-punjab-logo-cropped.jpeg";
                }}
              />
            </div>

            {/* Government & Department Titles */}
            <div className="mseva-department-titles">
              <div className="mseva-punjabi-dept-title">
                ਸਥਾਨਕ ਸਰਕਾਰ ਵਿਭਾਗ, ਪੰਜਾਬ ਸਰਕਾਰ
              </div>
              <div className="mseva-english-dept-title">
                Department of Local Government, Punjab
              </div>
            </div>
          </div>

          {/* Right: Global Utility Triggers (Helpline & Citizen Login) */}
          <div className="mseva-header-right">
            <div className="mseva-header-utilities flex items-center gap-3">
              <a
                href="tel:1100"
                className="mseva-header-helpline-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                title="Toll-Free Citizen Helpline 1100"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Helpline: 1100</span>
              </a>

              {!isLoggedIn && (
                <button
                  type="button"
                  className="mseva-header-login-btn"
                  onClick={() => history.push("/digit-ui/citizen/select-language")}
                >
                  Citizen Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Screen Reader Information Modal */}
      {showScreenReaderModal && (
        <div className="mseva-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="sr-modal-title">
          <div className="mseva-modal-card">
            <div className="mseva-modal-header">
              <h2 id="sr-modal-title" className="mseva-modal-title">
                ♿ Screen Reader Access & Keyboard Navigation
              </h2>
              <button
                type="button"
                className="mseva-modal-close"
                onClick={() => setShowScreenReaderModal(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="mseva-modal-content">
              <p>
                The <strong>mSeva Punjab Urban Governance Portal</strong> complies with <strong>GIGW 3.0</strong> and <strong>WCAG 2.1 Level AA</strong> standards. It is compatible with all leading screen readers including NVDA, JAWS, VoiceOver, and Windows Narrator.
              </p>
              <h3 className="text-base font-semibold text-slate-800 mt-4 mb-2">Key Navigation Shortcuts:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                <li><strong>Alt + M</strong>: Jump directly to main content</li>
                <li><strong>Tab</strong>: Move to next focusable link, button, or form field</li>
                <li><strong>Shift + Tab</strong>: Move to previous focusable control</li>
                <li><strong>Enter / Space</strong>: Activate focused button or link</li>
                <li><strong>Alt + C</strong>: Toggle High Contrast Yellow-on-Black mode</li>
                <li><strong>Escape</strong>: Dismiss popups, menus, or modals</li>
              </ul>
              <h3 className="text-base font-semibold text-slate-800 mt-4 mb-2">Supported Screen Readers:</h3>
              <p className="text-sm text-slate-700">
                NonVisual Desktop Access (NVDA - Free Open Source), Job Access With Speech (JAWS), Apple VoiceOver, and Microsoft Narrator.
              </p>
            </div>
            <div className="mseva-modal-footer">
              <button
                type="button"
                className="mseva-modal-btn"
                onClick={() => setShowScreenReaderModal(false)}
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default GIGWHeader;
