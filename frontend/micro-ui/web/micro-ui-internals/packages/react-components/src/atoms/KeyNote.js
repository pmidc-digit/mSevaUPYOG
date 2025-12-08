import React from "react";
import PropTypes from "prop-types";
import { WrapUnMaskComponent } from "..";

const KeyNote = ({ keyValue, note, caption, noteStyle, children, privacy }) => {
  const isMobile = window.innerWidth < 768;
  
  const containerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    flexWrap: "wrap",
  };

  const keyStyle = {
    margin: 0,
    fontSize: "1rem",
    fontWeight: "600",
    flex: isMobile ? "0 0 auto" : "0 0 180px",
    minWidth: isMobile ? "120px" : "auto",
    marginBottom: isMobile ? "4px" : "0",
  };

  const valueWrapperStyle = {
    flex: "1 1 auto",
    maxWidth: isMobile ? "100%" : "420px",
  };

  const valueStyle = {
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
    ...noteStyle,
  };

  const captionStyle = {
    flex: isMobile ? "1 1 100%" : "1 1 auto",
    marginTop: isMobile ? "4px" : "0",
    maxWidth: isMobile ? "100%" : "420px",
  };

  return (
    <div className="key-note-pair" style={containerStyle}>
      <h3 style={keyStyle}>{keyValue}</h3>
      <div style={valueWrapperStyle} title={typeof note === "string" || typeof note === "number" ? String(note) : ""}>
        {privacy ? (
          <p style={valueStyle}>
            <WrapUnMaskComponent value={note} iseyevisible={note?.includes("*") ? true : false} privacy={privacy} />
          </p>
        ) : (
          <p style={valueStyle}>{note}</p>
        )}
      </div>
      <p className="caption" style={captionStyle}>{caption}</p>
      {children}
    </div>
  );
};

KeyNote.propTypes = {
  keyValue: PropTypes.string,
  note: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  noteStyle: PropTypes.any,
};

KeyNote.defaultProps = {
  keyValue: "",
  note: "",
  noteStyle: {},
};

export default KeyNote;
