import React, { useMemo, useState, useRef, useEffect } from "react";
import { PrimaryDownlaodIcon } from "../utils/svgindex";

// Global state to manage open dropdowns
let openDropdown = null;

export const ActionMenu = ({ options, icon = <PrimaryDownlaodIcon /> }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef();
  const iconRef = useRef();
  const menuId = useRef(Math.random().toString(36).substr(2, 9));

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowOptions(false);
        openDropdown = null;
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  // Update position on scroll and window resize
  useEffect(() => {
    const updatePosition = () => {
      if (showOptions && iconRef.current) {
        const rect = iconRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.left - 220,
        });
      } else {
        setShowOptions(false);
        openDropdown = null;
      }
    };

    if (showOptions) {
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showOptions]);

  const handleIconClick = () => {
    // Close other open dropdown
    if (openDropdown && openDropdown !== menuId.current) {
      openDropdown = null;
    }

    const newState = !showOptions;
    setShowOptions(newState);

    if (newState) {
      openDropdown = menuId.current;
      // Calculate position immediately
      if (iconRef.current) {
        const rect = iconRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.left - 220,
        });
      }
    } else {
      openDropdown = null;
    }
  };

  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      <div
        ref={iconRef}
        onClick={handleIconClick}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" }}
      >
        {icon}
      </div>
      {showOptions && (
        <div
          style={{
            position: "fixed",
            top: `${position.top}px`,
            left: `${position.left}px`,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 9999,
            minWidth: "240px",
            padding: "8px 0",
          }}
        >
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => {
                option.onClick();
                setShowOptions(false);
                openDropdown = null;
              }}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                borderBottom: index !== options.length - 1 ? "1px solid #f0f0f0" : "none",
                fontSize: "14px",
                color: "#505A5F",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#f5f5f5")}
              onMouseLeave={(e) => (e.target.style.background = "#fff")}
            >
              {option?.icon}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};