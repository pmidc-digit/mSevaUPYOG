import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const CustomMenu = (props) => {
  const { options = [], optionKey, t, onSelect, style } = props;

  const renderLabel = (option) => {
    if (!option) return "";
    return (
      option?.displayName
    );
  };

  const [openSubIndex, setOpenSubIndex] = useState(null);
  const itemRefs = useRef({});

  // Close subsection on outside click
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Close if clicking outside the menu and subsection
      const menuEl = document.querySelector(".menu-wrap-position");
      const subEl = document.querySelector(".menu-subsection");
      if (menuEl && !menuEl.contains(e.target) && subEl && !subEl.contains(e.target)) {
        setOpenSubIndex(null);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const renderOptions = (opts, parentIdxPrefix = "") => {
    return opts.map((option, idx) => {
      if (!option) return null;
      const key = `${parentIdxPrefix}${idx}`;
      console.log("Rendering CustomMenu with options:", option);

      // If this option contains nested links, render group title and render children
      // if (Array.isArray(option.links) && option.links.length > 0) {
      //   return (
      //     <div key={key} className="menu-group">
      //       <div className="menu-group-title">{t ? t(option.displayName || option.name) : (option.displayName || option.name)}</div>
      //       <div className="menu-group-items">{renderOptions(option.links, `${key}-`)}</div>
      //     </div>
      //   );
      // }

      // If option explicitly marks isSubsection, render a toggleable submenu attached to this item
      if (option.isSubsection && Array.isArray(option.subsection) && option.subsection.length > 0) {
        const label = renderLabel(option);
        const isOpen = openSubIndex === key;
        return (
          <div key={key} className="menu-item-with-subsection" style={{ position: "relative" }}>
            <div
              className="menu-item"
              ref={(el) => (itemRefs.current[key] = el)}
              onClick={() => {
                const currentlyOpen = openSubIndex === key;
                if (currentlyOpen) {
                  setOpenSubIndex(null);
                  return;
                }
                setOpenSubIndex(key);
              }}
            >
              <p>{t ? t(label) : label}</p>
            </div>
            {isOpen && (
              <div className="menu-subsection subsection-bg-0" style={{ position: "absolute", top: "0", right: "-100%", minWidth: "200px", zIndex: 999 }}>
                <div className="menu-subsection-list">
                  {renderOptions(option.subsection, `${key}-`)}
                </div>
              </div>
            )}
          </div>
        );
      }

      if (Array.isArray(option.subsection) && option.subsection.length > 0) {
        return (
          <div key={key} className="menu-group">
            <div className="menu-group-title">{t ? t(option.displayName || option.name) : (option.displayName || option.name)}</div>
            <div className="menu-group-items">{renderOptions(option.subsection, ``)}</div>
          </div>
        );
      }

      // Leaf item
      const label = renderLabel(option);
      return (
        <div key={key} className="menu-item" onClick={() => { onSelect && onSelect(option); setOpenSubIndex(null); }}>
          <p>{t ? t(label) : label}</p>
        </div>
      );
    });
  };

  return (
    <div className="menu-wrap-position" style={style}>
      {renderOptions(options)}
    </div>
  );
};

CustomMenu.propTypes = {
  options: PropTypes.array,
  optionKey: PropTypes.string,
  t: PropTypes.func,
  onSelect: PropTypes.func,
  style: PropTypes.object,
};

export default CustomMenu;
